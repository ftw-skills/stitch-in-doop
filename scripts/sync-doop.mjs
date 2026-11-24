import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import {dirname,isAbsolute,relative,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {planCanvas} from './plan-layout.mjs';
import {projectManifest,readJson,resource} from './project-files.mjs';
import {validateProject} from './validate-project.mjs';

const require=createRequire(import.meta.url);
const fields=['name','x','y','width','height'];
const frameKey=(page,id)=>page+'/'+id;
const stateFile='reports/doop-sync.json';
const sha=value=>createHash('sha256').update(value).digest('hex');
const agent_name='Codex';
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
async function optionalJson(path,fallback){
  return readJson(path).catch(error=>{if(error.code==='ENOENT')return fallback;throw error;});
}
async function saveJson(path,data){
  await mkdir(dirname(path),{recursive:true});
  const temp=path+'.tmp';
  await writeFile(temp,JSON.stringify(data,null,2)+'\n','utf8');
  await rename(temp,path);
}
export async function createTransport(){
  if(process.env.STITCH_DOOP_CLIENT_MODULE){
    const {connectDoop}=await import(pathToFileURL(resolve(process.env.STITCH_DOOP_CLIENT_MODULE)).href);
    return connectDoop();
  }
  const {Client}=require('@modelcontextprotocol/sdk/client/index.js');
  const {StreamableHTTPClientTransport}=require('@modelcontextprotocol/sdk/client/streamableHttp.js');
  const url=new URL(process.env.STITCH_DOOP_MCP_URL);
  const token=process.env.STITCH_DOOP_MCP_AUTH;
  assert(url.protocol==='https:'||['localhost','127.0.0.1','[::1]'].includes(url.hostname),'Use HTTPS for a remote Doop connection.');
  const client=new Client({name:'stitch-in-doop',version:'1'});
  await client.connect(new StreamableHTTPClientTransport(url,{requestInit:{headers:token?{Authorization:token}:{}}}));
  return {url:url.origin,call:(name,args)=>client.callTool({name,arguments:args}),close:()=>client.close()};
}

function documentMerger(){
  const {parse,serialize}=require(process.env.STITCH_HTML_MODULE??'parse5');
  const attr=(node,name)=>node.attrs?.find(item=>item.name===name)?.value;
  const set=(node,name,value)=>{
    const old=node.attrs.find(item=>item.name===name);
    if(old)old.value=value;else node.attrs.push({name,value});
  };
  function elements(root){
    const result=[];
    const visit=node=>{
      if(node.tagName)result.push(node);
      for(const child of node.childNodes??[])visit(child);
    };
    visit(root);
    return result;
  }
  function authoredHtml(html){
    if(!html||(!html.includes('data-doop-webfonts')&&!html.includes('data-doop-fonts')))return html;
    const document=parse(html);
    const head=elements(document).find(node=>node.tagName==='head');
    head.childNodes=head.childNodes.filter(node=>
      !(node.tagName==='link'&&attr(node,'data-doop-webfonts')!==undefined)&&
      !(node.tagName==='style'&&attr(node,'data-doop-fonts')!==undefined));
    return serialize(document);
  }
  function merge(source,current,spec,lookup){
    const next=parse(source);
    const items=elements(next);
    set(items.find(node=>node.tagName==='body'),'data-stitch-frame',spec.id);
    for(const node of items){
      const key=attr(node,'data-route-key');
      if(!key)continue;
      const id=lookup(key);
      if(!id)throw new Error('Unbound prototype route '+key+' in '+spec.id);
      set(node,'data-doop-on','click');
      set(node,'data-doop-action','navigate:'+id);
      set(node,'href','#');
    }
    if(current){
      const previous=parse(current);
      for(const old of elements(previous)){
        const anchors=old.attrs?.filter(item=>['data-doop-id','data-doop-lock','data-doop-locked','data-doop-hidden',
          'data-doop-on','data-doop-action','data-doop-transition','data-doop-duration','data-doop-interactions'].includes(item.name))??[];
        const managed=attr(old,'data-route-key');
        const persistent=anchors.filter(item=>!managed||!['data-doop-on','data-doop-action'].includes(item.name));
        if(!persistent.length)continue;
        const name=attr(old,'data-doop-name');
        const matches=name?items.filter(node=>attr(node,'data-doop-name')===name):[];
        assert(matches.length===1,'Cannot carry Doop layer metadata: '+(name??old.tagName)+' in '+spec.id);
        for(const {name:key,value} of persistent)set(matches[0],key,value);
      }
    }
    return serialize(next);
  }
  const equivalent=(left,right)=>authoredHtml(left)===authoredHtml(right);
  return {merge,equivalent,marker:source=>elements(parse(source)).find(node=>node.tagName==='body')?.attrs.find(item=>item.name==='data-stitch-frame')?.value};
}

function relativeAssets(project,file,html,assets){
  const convert=value=>{
    if(!/^(?:\.\/fonts\/|(?:\.\.\/)+asset\/raw\/|\.\.\/raw\/)/.test(value))return value;
    const path=resolve(dirname(resource(project,file)),decodeURIComponent(value));
    const rel=relative(project,path);
    const key=rel.replaceAll('\\','/');
    assert(!isAbsolute(rel)&&/^(?:style\/fonts|asset\/raw)\//.test(key),'Asset path is outside project resources: '+value);
    assets.add(key);
    return '{{asset:'+key+'}}';
  };
  return html.replace(/(\bsrc=["'])([^"']+)(["'])/g,(_,prefix,url,suffix)=>prefix+convert(url)+suffix)
    .replace(/url\((["']?)([^"')]+)\1\)/g,(_,quote,url)=>'url('+quote+convert(url)+quote+')');
}

export async function syncProject(project,transport,{apply=false}={}){
  const {devices,plan}=await validateProject(project);
  const {name}=await projectManifest(project,'pages','pages.json');
  const designMarkdown=(await readFile(resource(project,'DESIGN.md'),'utf8')).replace(/\r\n/g,'\n').trim();
  assert(name?.trim(),'pages.json: canvas name is required');
  const index=await readJson(resource(project,'asset/cards/index.json'));
  const cards=[{id:'style',name:'Style Card',file:'style/card.html',width:plan.geometry.width,height:plan.geometry.height},
    ...index.map(item=>({...item,id:'asset_'+item.id}))];
  const wanted=planCanvas(devices,cards);
  const localState=resource(project,stateFile);
  const state=await optionalJson(localState,{canvasId:null,frames:{},assets:{}});
  const call=async(tool,params={},identity=true)=>{
    const result=await transport.call(tool,identity?{...params,agent_name}:params);
    const feedback=result.content?.some(item=>item.type==='text'&&item.text.startsWith('HUMAN FEEDBACK'));
    const summary=result.content?.find(item=>item.type==='text');
    if(result.isError||feedback)throw new Error(tool+': '+(feedback?'canvas feedback requires review':summary?.text??'Doop request failed'));
    const parsed=summary?JSON.parse(summary.text):result.structuredContent;
    if(parsed?.error||parsed?.ok===false)throw new Error(tool+': '+parsed.error);
    return parsed;
  };
  // The guide and profile are required by Doop. Validate tool replies here without treating guide prose as JSON.
  for(const [tool,args] of [['get_guide',{topic:'doop-instructions'}],['get_profile',{}]]){
    const reply=await transport.call(tool,args);
    assert(!reply.isError,tool+' failed');
  }

  const merge=documentMerger();
  let canvas=state.canvasId?await call('get_canvas',{canvas_id:state.canvasId}):null;
  async function readDesignGuide(current){
    if(!current?.guidelines?.some(guide=>guide.name==='design-md'))return null;
    const response=await transport.call('get_guidelines',{canvas_id:state.canvasId,name:'design-md'});
    assert(!response.isError,'Cannot read existing DESIGN.md guide.');
    return response.content.find(item=>item.type==='text')?.text??null;
  }
  const previousGuide=await readDesignGuide(canvas);
  const originalPages=canvas?.pages??[];
  const prototype=canvas?await call('get_prototype',{canvas_id:state.canvasId}):{pages:[]};
  const assets=new Map(),overview=[];
  const operations=[];
  if(!canvas)operations.push({op:'create-canvas',name});
  if(previousGuide!==designMarkdown)operations.push({op:'update-style-guide',name:'design-md'});
  const knownFrames=new Map();
  for(const page of wanted){
    const candidates=originalPages.filter(existing=>existing.name===page.name);
    assert(candidates.length<2,'Ambiguous Doop page name: '+page.name);
    page.remote=candidates[0];
    if(!page.remote)operations.push({op:'create-page',page:page.name});
    for(const spec of page.frames){
      const key=frameKey(page.name,spec.id);
      const existingId=state.frames[key];
      if(existingId){
        const frame=await call('get_frame',{frame_id:existingId});
        assert(!frame.pageId||frame.pageId===page.remote?.id,'Mapped frame moved to another page: '+key);
        knownFrames.set(key,frame);
      }else if(page.remote){
        for(const candidate of canvas.frames.filter(frame=>frame.pageId===page.remote.id&&frame.name===spec.name)){
          const frame=await call('get_frame',{frame_id:candidate.id});
          if(merge.marker(frame.html)===spec.id){
            assert(!knownFrames.has(key),'Multiple managed frames match '+key);
            knownFrames.set(key,frame);
          }
        }
      }
      const paths=new Set();
      let content=await readFile(resource(project,spec.file),'utf8');
      if(/<link\b[^>]*\bdata-stitch-page-typography\b[^>]*>/.test(content)){
        const css=await readFile(resource(project,'style/page-typography.css'),'utf8');
        content=content.replace(/<link\b[^>]*\bdata-stitch-page-typography\b[^>]*>/g,()=>'<style>'+css+'</style>');
      }
      spec.source=relativeAssets(project,spec.file,content,paths);
      for(const path of paths){
        if(assets.has(path))continue;
        const bytes=await readFile(resource(project,path));
        assets.set(path,{bytes,hash:sha(bytes)});
      }
      overview.push({key,page,spec});
    }
  }
  const resolveAsset=(path,planning)=>{
    const hash=assets.get(path)?.hash;
    const existing=state.assets[hash];
    if(existing)return existing;
    if(!planning)throw new Error('Missing uploaded asset: '+path);
    return '/__stitch_asset__/'+hash;
  };
  const desired=(page,spec,previous,planning)=>merge.merge(
    spec.source.replace(/\{\{asset:([^}]+)\}\}/g,(_,path)=>resolveAsset(path,planning)),previous,spec,route=>{
      assert(page.frames.some(frame=>frame.id===route),'Unknown prototype destination '+page.name+'/'+route);
      return knownFrames.get(frameKey(page.name,route))?.id??(planning?'pending-'+route:null);
    });
  const seenUploads=new Set();
  for(const asset of assets.values()){
    if(!state.assets[asset.hash]&&!seenUploads.has(asset.hash)){
      operations.push({op:'upload-asset',sha256:asset.hash});
      seenUploads.add(asset.hash);
    }
  }
  const frameOps=[];
  for(const {key,page,spec} of overview){
    const previous=knownFrames.get(key);
    const expected=desired(page,spec,previous?.html,true);
    const metadata=Object.fromEntries(fields.filter(field=>spec[field]!==previous?.[field]).map(field=>[field,spec[field]]));
    const htmlChanged=!merge.equivalent(expected,previous?.html);
    if(!previous||htmlChanged||Object.keys(metadata).length){
      if(previous&&previous.approvalStatus==='ready_for_dev'&&(htmlChanged||'width' in metadata||'height' in metadata))
        throw new Error('Frame is approved for development: '+key);
      frameOps.push({key,page,spec,previous,metadata,htmlChanged});
      operations.push({op:previous?'update-frame':'create-frame',frame:key,id:previous?.id,metadata,htmlChanged});
    }
  }
  const starts=wanted.filter(page=>{
    const before=prototype.pages.find(item=>item.id===page.remote?.id||item.pageId===page.remote?.id||item.name===page.name);
    return !before?.startFrameId||before.startFrameId!==knownFrames.get(frameKey(page.name,page.start))?.id;
  });
  for(const page of starts)operations.push({op:'set-prototype-start',page:page.name,frame:page.start});
  if(!apply||!operations.length)return {canvasId:state.canvasId,operations,applied:false};

  // Snapshot source and prototype before any writes; re-read existing frames just before update.
  const iso=new Date().toISOString().replaceAll(':','-');
  await saveJson(resource(project,'reports/snapshots/'+iso+'.json'),{canvas,prototype,
    designGuide:previousGuide,frames:[...knownFrames].map(([key,frame])=>({key,...frame}))});
  for(const [key,frame] of knownFrames)state.frames[key]=frame.id;
  if(!canvas){
    canvas=await call('create_canvas',{name});
    state.canvasId=canvas.id;
    await saveJson(localState,state);
    canvas=await call('get_canvas',{canvas_id:state.canvasId});
  }
  if(previousGuide!==designMarkdown){
    const latest=await call('get_canvas',{canvas_id:state.canvasId});
    assert(await readDesignGuide(latest)===previousGuide,'Concurrent change detected in DESIGN.md guide.');
    await call('set_guidelines',{canvas_id:state.canvasId,name:'design-md',title:'DESIGN.md',markdown:designMarkdown});
  }
  for(const page of wanted){
    if(page.remote)continue;
    const only=canvas.pages.length===1?canvas.pages[0]:null;
    if(only&&canvas.frames.length===0&&!wanted.some(item=>item.remote?.id===only.id)){
      const renamed=await call('set_canvas_pages',{canvas_id:state.canvasId,
        expectedPages:canvas.pages.map(({id,name})=>({id,name})),pages:[{id:only.id,name:page.name}]});
      page.remote=renamed.pages[0];
    }else{
      const created=await call('create_canvas_page',{canvas_id:state.canvasId,name:page.name});
      page.remote=created.page;
    }
  }
  for(const asset of assets.values()){
    if(state.assets[asset.hash])continue;
    const ticket=await call('upload_asset',{canvas_id:state.canvasId,local_file:true});
    const target=new URL(ticket.upload_url,transport.url);
    assert(target.origin===transport.url,'Upload URL must match Doop origin.');
    const upload=await fetch(target,{method:'PUT',body:asset.bytes,signal:AbortSignal.timeout(20000)});
    assert(upload.ok,'Doop asset upload returned '+upload.status);
    const payload=await upload.json();
    const location=new URL(payload.url??payload.asset?.url,transport.url);
    assert(location.origin===transport.url&&location.pathname.startsWith('/a/'),'Unexpected asset URL returned by Doop.');
    state.assets[asset.hash]=location.pathname;
    await saveJson(localState,state);
  }
  for(const {key,page,spec,previous,metadata} of frameOps){
    if(previous)continue;
    const placeholder='<!doctype html><html><body data-stitch-frame="'+spec.id+'"></body></html>';
    const {frame}=await call('create_frame',{canvas_id:state.canvasId,pageId:page.remote.id,...metadata,html:placeholder});
    knownFrames.set(key,frame);
    state.frames[key]=frame.id;
    await saveJson(localState,state);
  }
  for(const {key,page,spec,previous,metadata} of frameOps){
    const frame=knownFrames.get(key);
    const fresh=await call('get_frame',{frame_id:frame.id});
    if(previous)assert(fresh.updatedAt===previous.updatedAt&&fresh.html===previous.html,'Concurrent change detected: '+key);
    const html=desired(page,spec,fresh.html,false);
    if(previous&&Object.keys(metadata).length)await call('update_frame',{frame_id:frame.id,...metadata});
    if(!merge.equivalent(html,fresh.html))await call('set_frame_html',{frame_id:frame.id,html});
  }
  for(const page of starts){
    await call('set_prototype_start',{canvas_id:state.canvasId,pageId:page.remote.id,frame_id:knownFrames.get(frameKey(page.name,page.start)).id});
  }
  await saveJson(localState,state);
  return {canvasId:state.canvasId,operations,applied:true};
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const project=resolve(process.argv[2]??'.');
  const transport=await createTransport();
  try{
    console.log(JSON.stringify(await syncProject(project,transport,{apply:process.argv.includes('--apply')}),null,2));
  }finally{await transport.close();}
}
