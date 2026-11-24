import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export const layout=JSON.parse(await readFile(new URL('../assets/card-layout.json',import.meta.url),'utf8'));
const slug=value=>String(value).toLowerCase().replace(/[- ]+/g,'_');
export function componentName(kind,...parts){
  const name=[kind,...parts].map(slug).join('_');
  if(!/^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/.test(name))throw new Error('Invalid Doop component name: '+name);
  return name;
}
export const nameAttr=name=>' data-doop-name="'+name+'"';

export function fitGrid({width,height,itemWidth,itemHeight,gap=8,count,maxColumns=count}){
  if(![width,height,itemWidth,itemHeight,count,maxColumns].every(n=>Number.isFinite(n)&&n>0)||!Number.isFinite(gap)||gap<0)
    throw new Error('Grid needs positive dimensions and item count.');
  if(!Number.isInteger(count)||!Number.isInteger(maxColumns))throw new Error('Grid item and column counts must be integers.');
  const maxCol=Math.min(count,maxColumns,Math.floor((width+gap)/(itemWidth+gap)));
  const maxRow=Math.floor((height+gap)/(itemHeight+gap));
  if(maxCol<1||maxRow<1)throw new Error('The largest item does not fit the target area.');
  return {max_col:maxCol,max_row:maxRow,rows:Math.ceil(count/maxCol),capacity:maxCol*maxRow};
}

export function orderAssets(items,usage,kind,{display='assets',preserveOrder=false}={}){
  if(!['assets','variants'].includes(display))throw new Error('Unknown Asset Card display mode: '+display);
  const variants=items.flatMap(item=>{
    const uses=usage[item.id]??[];
    if(!uses.length||kind==='photo')return [{...item,name:componentName(kind,item.id)}];
    const unique=new Map();
    for(const {color,width,height} of uses){
      if(!/^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/.test(color)||![width,height].every(n=>Number.isFinite(n)&&n>0)){
        throw new Error('Invalid rendered usage for '+item.id);
      }
      const size=(width+'x'+height).replaceAll('.','p');
      const variant=componentName(kind,item.id,color.slice(1),size);
      unique.set(variant,{...item,color,width,height,name:variant});
    }
    if(display==='assets'){
      const [representative]=[...unique.values()].sort((a,b)=>a.color.localeCompare(b.color)||a.width-b.width||a.height-b.height);
      return [{...representative,name:componentName(kind,item.id),appearanceCount:unique.size}];
    }
    return [...unique.values()].map(entry=>({...entry,appearanceCount:1}));
  });
  if(kind==='photo'||preserveOrder)return variants;
  return variants.sort((a,b)=>{
    for(const key of layout.asset.sort){
      const left=a[key],right=b[key];
      const diff=typeof left==='number'&&typeof right==='number'?left-right:String(left??'').localeCompare(String(right??''));
      if(diff)return diff;
    }
    return 0;
  });
}

// Designed to run in the actual preview DOM (e.g. Playwright page.evaluate).
export function captureIconUsage(){
  return [...document.querySelectorAll('[data-icon]')].map(element=>{
    const svg=element.matches('svg')?element:element.querySelector('svg');
    const style=getComputedStyle(svg);
    const rgb=style.color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if(!rgb)throw new Error('Expected an sRGB icon: '+element.dataset.icon);
    let alpha=Number(rgb[4]??1);
    for(let parent=svg;parent;parent=parent.parentElement)alpha*=Number(getComputedStyle(parent).opacity);
    const channels=rgb.slice(1,4).map(Number);
    if(alpha<1)channels.push(Math.round(alpha*255));
    const color='#'+channels.map(channel=>channel.toString(16).padStart(2,'0')).join('').toUpperCase();
    return {id:element.dataset.icon,color,width:parseFloat(style.width),height:parseFloat(style.height)};
  });
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const [mode,...args]=process.argv.slice(2);
  if(mode!=='grid'||args.length!==6)throw new Error('Usage: node card-layout.mjs grid WIDTH HEIGHT ICON_WIDTH ICON_HEIGHT GAP COUNT');
  const [width,height,itemWidth,itemHeight,gap,count]=args.map(Number);
  console.log(JSON.stringify(fitGrid({width,height,itemWidth,itemHeight,gap,count})));
}
