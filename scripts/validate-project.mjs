import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {assetFolder,classifyIcons,loadStyleOptions,resource,projectManifest,projectConfig} from './project-files.mjs';
import {compilePageTypography} from './page-typography.mjs';
import {parseDesign,styleSections} from './style-card.mjs';
import {layout} from './card-layout.mjs';

const identifier=/^[a-z][a-z0-9_-]*$/;
const positiveInt=value=>Number.isInteger(value)&&value>0;
function distinct(items,label){
  const names=new Set();
  for(const name of items){
    if(names.has(name))throw new Error(label+': duplicate '+name);
    names.add(name);
  }
}
function requireId(id,field){
  if(typeof id!=='string'||!identifier.test(id))throw new Error(field+': expected a lowercase ID');
}
async function requiredFile(project,path,field){
  try{await readFile(resource(project,path));}
  catch(error){throw new Error(field+': '+error.message,{cause:error});}
}
export async function validateProject(project){
  const design=parseDesign(await readFile(resolve(project,'DESIGN.md'),'utf8'));
  const style=await loadStyleOptions(project);
  const {plan}=styleSections(design,style);
  if(style.buttons){
    distinct(style.buttons,'style/card.json buttons');
    for(const name of style.buttons)if(!layout.style.buttons.includes(name))throw new Error('style/card.json buttons: unknown '+name);
  }
  const styleIcons=[...style.systemIcons,...style.projectIcons];
  distinct(styleIcons.map(icon=>icon.id),'style/card.json icons');
  for(const [index,icon] of styleIcons.entries()){
    requireId(icon.id,'style/card.json icons['+index+'].id');
    if([icon.width,icon.height].some(value=>value!==undefined&&!positiveInt(value)))
      throw new Error('style/card.json icon size: '+icon.id);
  }
  distinct(style.widgets.map(widget=>[widget.kind,widget.id,widget.state,widget.kind==='inputfield'?widget.language??style.lang??'en':''].join(':')),'style/card.json widgets');
  const manifest=await projectManifest(project,'assets','asset/manifest.json');
  distinct(manifest.categories.map(category=>category.id),'asset/manifest.json categories');
  for(const category of manifest.categories){
    requireId(category.id,'asset/manifest.json category ID');
    if(!category.items.length||!['icon','photo'].includes(category.kind??'icon')||!['fixed','adaptive'].includes(category.layout??'fixed')||
      (category.columns!==undefined&&!positiveInt(category.columns)))throw new Error('Invalid asset category: '+category.id);
    distinct(category.items.map(item=>item.id),'asset category '+category.id);
    for(const item of category.items){
      requireId(item.id,'asset category '+category.id+' item ID');
      if(!item.label)throw new Error('Missing asset label: '+item.id);
      await requiredFile(assetFolder(project,category,item),item.file,'asset '+item.id);
    }
  }
  classifyIcons(manifest,style);

  const {devices}=await projectManifest(project,'pages','pages.json');
  if(!devices.length)throw new Error('pages.json: declare at least one device');
  distinct(devices.map(device=>device.name),'pages.json device names');
  for(const device of devices){
    if(!device.name?.trim()||!positiveInt(device.width)||!positiveInt(device.height)||
      (device.frameHeight!==undefined&&!positiveInt(device.frameHeight))||!device.frames.length)
      throw new Error('pages.json: invalid device '+device.name);
    distinct(device.frames.map(frame=>frame.id),'pages.json '+device.name+' frame IDs');
    if(!device.frames.some(frame=>frame.id===device.start))throw new Error('pages.json '+device.name+': unknown start frame '+device.start);
    for(const frame of device.frames){
      requireId(frame.id,'pages.json '+device.name+' frame ID');
      if(frame.id==='style'||frame.id.startsWith('asset_'))throw new Error('Frame ID is reserved for cards: '+frame.id);
      if(!frame.name?.trim())throw new Error('pages.json: missing frame name for '+frame.id);
      await requiredFile(project,frame.file,'pages.json '+device.name+' '+frame.id);
    }
  }
  const {typography}=await projectConfig(project);
  compilePageTypography(typography,devices);
  return {design,style,plan,manifest,devices,typography};
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const project=resolve(process.argv[2]??'.');
  const {devices,manifest}=await validateProject(project);
  console.log(JSON.stringify({valid:true,devices:devices.length,categories:manifest.categories.length}));
}
