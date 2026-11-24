import {createHash} from 'node:crypto';
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {assetFolder,classifyIcons,loadStyleOptions,projectManifest,readJson,resource,styleIconIds} from './project-files.mjs';

export async function indexAssets(project,{observations,output='asset/inventory.json'}={}){
  const manifest=await projectManifest(project,'assets','asset/manifest.json');
  const actual=observations??(manifest.usageFile?await readJson(resource(project,manifest.usageFile)):manifest.usage??{});
  const raw=resolve(project,'asset/raw');
  const tracked=new Set();
  const known=new Set();
  const style=await loadStyleOptions(project);
  const classification=classifyIcons(manifest,style);
  const styleIds=styleIconIds(style);
  const styleIcons=new Map([...style.systemIcons,...style.projectIcons].map(icon=>[icon.id,icon]));
  const categories=[];
  for(const category of manifest.categories){
    const items=[];
    for(const item of category.items){
      const kind=category.kind??'icon';
      if(kind==='icon'&&known.has(item.id))throw new Error('Asset ID appears in multiple icon categories: '+item.id);
      if(kind==='icon')known.add(item.id);
      const dir=assetFolder(project,category,item);
      const path=resource(dir,item.file);
      const bytes=await readFile(path);
      if(kind==='icon'&&styleIds.has(item.id)){
        const source=await readFile(resource(resolve(project,'style/icon'),styleIcons.get(item.id).file));
        if(!bytes.equals(source))throw new Error('Style and asset manifests use different SVGs for '+item.id);
      }
      tracked.add(path);
      items.push({id:item.id,label:item.label,path:relative(project,path).replaceAll('\\','/'),
        sha256:createHash('sha256').update(bytes).digest('hex'),displayOn:kind==='icon'?(classification.get(item.id)?.displayOn??'asset'):'asset',
        appearances:kind==='icon'?actual[item.id]??[]:[]});
    }
    categories.push({id:category.id,name:category.name,kind:category.kind??'icon',scope:category.scope,items});
  }
  for(const id of styleIds)if(!known.has(id))throw new Error('Style icon missing from asset manifest: '+id);
  const rawFiles=await readdir(raw,{recursive:true,withFileTypes:true}).catch(error=>{
    if(error.code==='ENOENT')return [];
    throw error;
  });
  const unlistedFiles=rawFiles.filter(entry=>entry.isFile()&&!tracked.has(join(entry.parentPath??entry.path,entry.name)))
    .map(entry=>relative(project,join(entry.parentPath??entry.path,entry.name)).replaceAll('\\','/')).sort();
  const fingerprints=Map.groupBy(categories.flatMap(category=>category.items.filter(item=>category.kind==='icon')
    .map(item=>({id:item.id,category:category.id,sha256:item.sha256}))),item=>item.sha256);
  const duplicateIconSources=[...fingerprints.values()].filter(items=>new Set(items.map(item=>item.id)).size>1);
  const index={categories,duplicateIconSources,unregisteredUsage:Object.keys(actual).filter(id=>!known.has(id)).sort(),
    unobservedIcons:categories.filter(category=>category.kind==='icon').flatMap(category=>category.items.filter(item=>!item.appearances.length).map(item=>item.id)),
    unlistedFiles};
  const target=resource(project,output);
  await mkdir(resolve(target,'..'),{recursive:true});
  await writeFile(target,JSON.stringify(index,null,2)+'\n','utf8');
  return index;
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const {unregisteredUsage,unobservedIcons,unlistedFiles}=await indexAssets(resolve(process.argv[2]??'.'));
  console.log(JSON.stringify({unregisteredUsage,unobservedIcons,unlistedFiles}));
  if(unregisteredUsage.length)process.exitCode=1;
}
