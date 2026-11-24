import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {assetPages,escapeHtml,htmlFrame,parseDesign,styleSections} from './style-card.mjs';

import {assetFolder,classifyIcons,loadStyleOptions,loadSvg,projectConfig,projectManifest,readJson,resource,urlPath} from './project-files.mjs';
import {orderAssets} from './card-layout.mjs';
import {planCanvas} from './plan-layout.mjs';
import {compilePageTypography} from './page-typography.mjs';
export {loadStyleOptions} from './project-files.mjs';

export async function buildStyle(project,design,{observations}={}){
  const options=await loadStyleOptions(project);
  if(observations){
    for(const key of ['systemIcons','projectIcons']){
      for(const icon of options[key])if(!observations[icon.id]?.length)throw new Error('Style icon has no observed page usage: '+icon.id);
      options[key]=options[key].flatMap(icon=>orderAssets([icon],observations,'icon'));
    }
  }
  const {css,chunks,plan}=styleSections(design,options);
  await writeFile(resolve(project,'style/card.html'),htmlFrame('Style Card',css,chunks,{lang:options.lang,fonts:options.remoteFonts}),'utf8');
  const {typography}=await projectConfig(project);
  if(typography){
    const {devices}=await projectManifest(project,'pages','pages.json');
    await writeFile(resolve(project,'style/page-typography.css'),compilePageTypography(typography,devices),'utf8');
  }
  return plan;
}

export async function buildAssets(project,design,{observations}={}){
  const manifest=await projectManifest(project,'assets','asset/manifest.json');
  const {categories,usageFile,usage={}}=manifest;
  const observed=observations??(usageFile?await readJson(resource(project,usageFile)):usage);
  const classification=classifyIcons(manifest,await loadStyleOptions(project));
  const cards=resolve(project,'asset/cards');
  await mkdir(cards,{recursive:true});
  const index=[];
  for(const category of categories){
    const {id,name,kind='icon',columns,items,display='assets',layout:mode='fixed'}=category;
    if(display!=='assets')throw new Error('Project Asset Cards require one tile per ID: '+id);
    if(!/^[a-z][a-z0-9_-]*$/.test(id))throw new Error('Invalid asset category ID: '+id);
    const included=kind==='icon'?items.filter(item=>classification.get(item.id)?.displayOn!=='style'):items;
    if(!included.length)continue;
    const entries=await Promise.all(included.map(async item=>{
      if(kind==='icon')return loadSvg(assetFolder(project,category,item),item);
      if(kind!=='photo')throw new Error('Unsupported asset type: '+kind);
      const folder=category.rawFolder??id;
      await readFile(resource(assetFolder(project,category,item),item.file));
      const url='../raw/'+urlPath(folder+'/'+item.file);
      const alt=escapeHtml(item.label);
      if(item.spritePosition){
        const [x,y]=item.spritePosition;
        if(![x,y].every(value=>Number.isFinite(value)&&value>=0&&value<=100))throw new Error('Invalid sprite position');
        return {...item,markup:'<div class="photo-crop" style="background-image:url('+url+');background-position:'+x+'% '+y+'%"></div>'};
      }
      return {...item,markup:'<img class="asset-image" src="'+url+'" alt="'+alt+'">'};
    }));
    for(const page of assetPages(design,{name,category:id,kind,columns,items:entries,usage:observed,display,mode})){
      if(index.some(card=>card.id===page.id))throw new Error('Duplicate generated Asset Card ID: '+page.id);
      const file='asset/cards/'+page.id+'.html';
      await writeFile(resolve(project,file),htmlFrame(page.name,page.css,page.chunks),'utf8');
      index.push({id:page.id,category:id,name:page.name,file,kind,display,...page.size,grid:page.grid,
        itemCount:page.itemIds.length,itemIds:page.itemIds});
    }
  }
  await writeFile(resolve(cards,'index.json'),JSON.stringify(index,null,2)+'\n','utf8');
  return index;
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const [mode,folder]=process.argv.slice(2);
  if(!['style','assets','check'].includes(mode)||!folder)throw new Error('Usage: node project-workflow.mjs style|assets|check PROJECT_DIR');
  const project=resolve(folder);
  const design=parseDesign(await readFile(resolve(project,'DESIGN.md'),'utf8'));
  if(mode==='check'){
    const {validateProject}=await import('./validate-project.mjs');
    const {inspectProject,inspectTargets}=await import('./inspect-preview.mjs');
    const {indexAssets}=await import('./index-assets.mjs');
    const {devices}=await validateProject(project);
    const style=await buildStyle(project,design);
    const observed=await inspectProject(project);
    await buildStyle(project,design,{observations:observed.usage});
    const report=await inspectProject(project);
    const inventory=await indexAssets(project,{observations:report.usage});
    const cards=await buildAssets(project,design,{observations:report.usage});
    for(const category of inventory.categories){
      const pages=cards.filter(card=>card.category===category.id);
      if(pages.every(card=>card.display==='assets')){
        const rendered=pages.flatMap(card=>card.itemIds).sort();
        const expected=category.items.filter(item=>item.displayOn!=='style').map(item=>item.id).sort();
        if(JSON.stringify(rendered)!==JSON.stringify(expected))throw new Error('Asset Card identity mismatch: '+category.id);
      }
    }
    const canvas=planCanvas(devices,[{id:'style',name:'Style Card',file:'style/card.html',width:style.geometry.width,height:style.geometry.height},
      ...cards.map(card=>({...card,id:'asset_'+card.id}))]);
    await writeFile(resolve(project,'reports/layout.json'),JSON.stringify({style,cards,canvas},null,2)+'\n','utf8');
    const assets=await inspectTargets(project,cards.map(card=>({...card,id:'asset-'+card.id,fitHeight:true,uniqueNames:true,verifyAssets:true,
      captureIcons:false,checks:[{selector:'.asset-tile',count:card.itemCount}]})),{output:'reports/asset-preview.json'});
    const passed=report.passed&&assets.passed&&!inventory.unregisteredUsage.length;
    console.log(JSON.stringify({passed,failures:[...report.failures,...assets.failures],unregisteredUsage:inventory.unregisteredUsage}));
    if(!passed)process.exitCode=1;
  }else await (mode==='style'?buildStyle:buildAssets)(project,design);
}
