import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {layout} from './card-layout.mjs';
import {projectManifest,readJson,resource} from './project-files.mjs';

const [folder,option,nativeFile]=process.argv.slice(2);
if(!folder||(option!==undefined&&(option!=='--native-report'||!nativeFile))) {
  throw new Error('Usage: node scripts/accept-project.mjs PROJECT_DIR [--native-report REPORT_JSON]');
}
const project=resolve(folder);
const json=file=>readJson(resource(project,file));
const sorted=items=>[...items].sort();
const slug=name=>name.toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
const {width,height}=layout.geometry;
const [source,manifest,plan,preview,assetPreview,inventory,cards]=await Promise.all([
  projectManifest(project,'pages','pages.json'),projectManifest(project,'assets','asset/manifest.json'),
  json('reports/layout.json'),json('reports/preview.json'),json('reports/asset-preview.json'),
  json('asset/inventory.json'),json('asset/cards/index.json')
]);

assert.ok(preview.passed&&assetPreview.passed,'Browser reports must pass');
assert.deepEqual([...preview.failures,...assetPreview.failures],[],'Browser failures');
assert.deepEqual(inventory.unregisteredUsage,[],'Unregistered assets');
assert.deepEqual(inventory.duplicateIconSources,[],'Byte-identical icons registered under multiple IDs');
assert.deepEqual(inventory.categories.map(category=>category.id),manifest.categories.map(category=>category.id),'Asset inventory category order');
assert.deepEqual(plan.canvas.map(page=>page.name),source.devices.map(device=>device.name),'Device Page order');
assert.deepEqual(plan.cards,cards,'Layout plan and Asset Card index differ');
const styleHtml=await readFile(resource(project,'style/card.html'),'utf8');
const styleIds=[...styleHtml.matchAll(/data-asset="([^"]+)"/g)].map(match=>match[1]);
const styles=inventory.categories.flatMap(category=>category.items.filter(item=>item.displayOn==='style'));
const allItems=new Map(inventory.categories.flatMap(category=>category.items.map(item=>[item.id,item])));
assert.deepEqual(sorted(styleIds),sorted(styles.map(item=>item.id)),'Style icon identity');
for(const file of ['style/card.html',...cards.map(card=>card.file)]){
  const html=file==='style/card.html'?styleHtml:await readFile(resource(project,file),'utf8');
  for(const [,id,attributes] of html.matchAll(/data-asset="([^"]+)"([^>]+)/g)){
    const appearance=allItems.get(id)?.appearances;
    const color=attributes.match(/data-color="([^"]+)"/)?.[1];
    if(appearance?.length)assert.ok(appearance.some(item=>item.color===color),'Unobserved display color for '+id);
  }
}
for(const category of manifest.categories){
  const pages=cards.filter(card=>card.category===category.id);
  const ids=pages.flatMap(card=>card.itemIds);
  const expected=sorted(category.items.map(item=>item.id));
  assert.deepEqual(sorted(inventory.categories.find(item=>item.id===category.id).items.map(item=>item.id)),expected,
    'Inventory IDs for '+category.id);
  const expectedShown=expected.filter(id=>!styleIds.includes(id));
  assert.deepEqual(sorted(ids),expectedShown,'Asset IDs repeated or missing for '+category.id);
  for(const card of pages){
    assert.ok(card.width===width&&card.height>0,'Asset Card bounds: '+card.id);
    if(category.layout!=='adaptive')assert.deepEqual([card.width,card.height],[width,height],card.id);
    else{
      assert.deepEqual(card.itemIds,category.items.map(item=>item.id).filter(id=>!styleIds.includes(id)),card.id+' display order');
      assert.ok(card.grid.columns<=layout.asset.adaptiveColumns,card.id+' column limit');
      assert.equal(card.height,2*layout.geometry.padding+card.grid.rows*card.grid.tileHeight+(card.grid.rows-1)*layout.geometry.columnGap,card.id+' content height');
    }
  }
}
const expectedPreviews=new Map([['style',[width,height]]]);
for(const [index,device] of source.devices.entries()){
  const planned=plan.canvas[index];
  const left=['style',...cards.map(card=>'asset_'+card.id)];
  assert.deepEqual(planned.frames.map(frame=>frame.id),[...left,...device.frames.map(frame=>frame.id)],'Frame order for '+device.name);
  for(const [offset,frame] of planned.frames.entries()){
    const isCard=offset<left.length;
    const size=offset===0?[width,height]:isCard?[cards[offset-1].width,cards[offset-1].height]:[device.width,device.frameHeight??device.height];
    assert.deepEqual([frame.width,frame.height],size,frame.id);
    if(!isCard)expectedPreviews.set(slug(device.name)+'-'+frame.id,[device.width,device.height]);
    await readFile(resource(project,frame.file));
  }
}
async function checkTargets(targets,expected){
  assert.deepEqual(sorted(targets.map(target=>target.id)),sorted(expected.keys()),'Browser target inventory');
  for(const target of targets){
    assert.deepEqual(target.viewport,expected.get(target.id),target.id+' viewport');
    assert.ok(target.checks.length,target.id+' has no reported checks');
    const png=await readFile(resource(project,'reports/screenshots/'+slug(target.id)+'.png'));
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',target.id+' screenshot format');
    assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],target.viewport,target.id+' screenshot dimensions');
  }
}
await checkTargets(preview.targets,expectedPreviews);
await checkTargets(assetPreview.targets,new Map(cards.map(card=>['asset-'+card.id,[card.width,card.height]])));

const frames=plan.canvas.reduce((total,page)=>total+page.frames.length,0);
if(nativeFile){
  const [native,state]=await Promise.all([json(nativeFile),json('reports/doop-sync.json')]);
  assert.equal(new URL(native.url).pathname,'/c/'+state.canvasId,'Native evidence canvas');
  assert.equal(native.frames,frames,'Native Frame count');
  assert.equal(native.repeatedChanges,0,'Repeated sync changes');
  assert.deepEqual(native.routes.map(route=>route.page),source.devices.map(device=>device.name),'Native routes cover each Page');
  for(const [index,device] of source.devices.entries()){
    const route=native.routes[index];
    const {expectedRoute}=device;
    const label=device.name+' native route';
    assert.equal(route.width,device.width,device.name+' native width');
    const minimumStates=device.frames.length===1?1:2;
    assert.ok(Array.isArray(expectedRoute)&&expectedRoute.length>=minimumStates,
      label+': declare expectedRoute with the entry and each required destination');
    assert.equal(expectedRoute[0],device.start,label+': expectedRoute must start at the configured entry');
    const frameKeys=new Set(device.frames.map(frame=>frame.id));
    const expectedFrameIds=expectedRoute.map(key=>{
      assert.ok(frameKeys.has(key),label+': unknown frame key '+key);
      const frameId=state.frames?.[device.name+'/'+key];
      assert.ok(typeof frameId==='string'&&frameId.trim(),label+': missing published Frame ID for '+key);
      return frameId;
    });
    assert.equal(new Set(expectedFrameIds).size,new Set(expectedRoute).size,label+': duplicate published Frame IDs');
    assert.deepEqual(route.states,expectedRoute,label+': recorded states must match expectedRoute in order and length');
    assert.deepEqual(route.observedFrameIds,expectedFrameIds,
      label+': record the observed entry and each clicked Frame ID in observedFrameIds in order');
  }
}
console.log(JSON.stringify({passed:true,pages:source.devices.length,frames,assetCards:cards.length,
  browserChecks:[...preview.targets,...assetPreview.targets].reduce((sum,target)=>sum+target.checks.length,0),
  nativeEvidence:nativeFile?'checked':'not supplied'}));
