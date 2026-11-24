import {readFile} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';

export function resource(folder,file){
  const path=resolve(folder,file);
  const rel=relative(folder,path);
  if(!rel||rel.startsWith('..')||isAbsolute(rel))throw new Error('File must be under '+folder+': '+file);
  return path;
}
export const urlPath=file=>file.replaceAll('\\','/').split('/').map(encodeURIComponent).join('/');
export const readJson=async file=>JSON.parse(await readFile(file,'utf8'));
export async function projectConfig(project){
  return readJson(resolve(project,'project.json')).catch(error=>{
    if(error.code!=='ENOENT')throw error;
    return {};
  });
}
export async function projectManifest(project,key,fallback){
  const config=await projectConfig(project);
  return readJson(resource(project,config[key]??fallback));
}

export async function loadSvg(folder,entry){
  const svg=(await readFile(resource(folder,entry.file),'utf8')).trim();
  if(!/^<svg(?:\s|>)/i.test(svg)||!/<\/svg>$/i.test(svg)||
    /<(?:script|style|foreignObject|iframe|image|use)\b|\son\w+\s*=|\s(?:xlink:)?href\s*=|url\s*\(/i.test(svg)){
    throw new Error('Expected a standalone trusted SVG: '+entry.file);
  }
  const root=svg.slice(0,svg.indexOf('>')+1);
  const markup=/\sfill\s*=/.test(root)?svg:svg.replace('<svg','<svg fill="currentColor"');
  return {...entry,markup};
}

export async function loadStyleOptions(project){
  const dir=resolve(project,'style');
  const config=await projectConfig(project);
  const {lang,buttons,widgets=[],systemIcons=[],projectIcons=[],fonts=[],remoteFonts=[],geometry,fontSpecimens,scrollbarDemo=false,showProjectIconRow}=
    await readJson(resource(project,config.style??'style/card.json'));
  for(const {file} of fonts)await readFile(resource(resolve(dir,'fonts'),file));
  const fontCss=fonts.map(({family,file,weight='400',style='normal'})=>
    '@font-face{font-family:'+JSON.stringify(family)+';src:url("./fonts/'+urlPath(file)+'");font-weight:'+
    weight+';font-style:'+style+';font-display:swap}').join('\n');
  const icons=entries=>Promise.all(entries.map(entry=>loadSvg(resolve(dir,'icon'),entry)));
  return {lang,buttons,widgets,systemIcons:await icons(systemIcons),projectIcons:await icons(projectIcons),fontCss,remoteFonts,
    geometry,fontSpecimens,scrollbarDemo,showProjectIconRow,localFonts:fonts,typographyProfiles:config.typography};
}

export function styleIconIds(style){
  return new Set([...style.systemIcons,...style.projectIcons].map(icon=>icon.id));
}

export function assetFolder(project,category,item){
  return item.source==='style'?resolve(project,'style/icon'):
    resource(resolve(project,'asset/raw'),category.rawFolder??category.id);
}

export function classifyIcons(manifest,style){
  const placements=new Map();
  for(const [scope,icons] of [['system',style.systemIcons],['project',style.projectIcons]]){
    for(const {id} of icons){
      if(placements.has(id))throw new Error('Icon occurs more than once in Style Card: '+id);
      placements.set(id,{scope,displayOn:'style'});
    }
  }
  if(manifest.classificationVersion===undefined)return placements;
  if(manifest.classificationVersion!==1)throw new Error('Unsupported icon classificationVersion');
  const classified=new Set();
  for(const category of manifest.categories){
    if((category.kind??'icon')!=='icon')continue;
    if(!['system','project'].includes(category.scope))throw new Error('Icon category needs system or project scope: '+category.id);
    for(const item of category.items){
      if(!item.label?.trim()||!['style','asset'].includes(item.displayOn))throw new Error('Icon needs a label and displayOn: '+item.id);
      if(classified.has(item.id))throw new Error('Icon belongs to more than one category: '+item.id);
      classified.add(item.id);
      const rowScope=placements.get(item.id)?.scope;
      if(item.displayOn!==(rowScope?'style':'asset')||(rowScope&&rowScope!==category.scope)){
        throw new Error('Icon displayOn or scope conflicts with Style Card rows: '+item.id);
      }
      placements.set(item.id,{scope:category.scope,displayOn:item.displayOn});
    }
  }
  for(const id of placements.keys())if(!classified.has(id))throw new Error('Style icon missing from asset manifest: '+id);
  return placements;
}
