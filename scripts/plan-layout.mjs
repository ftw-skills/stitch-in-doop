import {fitGrid,layout} from './card-layout.mjs';

export function planStyle(overrides={},showProjectIconRow=true){
  const geometry={...layout.geometry,...overrides,width:layout.geometry.width,height:layout.geometry.height};
  const {width,height,padding,columnGap,rowGap,tilePadding,iconGap}=geometry;
  if(!Object.values(geometry).every(value=>Number.isInteger(value)&&value>=0))throw new Error('Style layout dimensions must be nonnegative integer CSS pixels.');
  const availableWidth=width-2*padding-columnGap*(layout.style.columns.length-1);
  const componentRows=layout.style.componentRows.filter(id=>showProjectIconRow||id!=='project_icon');
  const rowHeight=(height-2*padding-rowGap*(componentRows.length-1))/componentRows.length;
  if(availableWidth<=0||rowHeight<=tilePadding*2)throw new Error('Style layout has no usable column or row area.');
  const fraction=layout.style.columns.reduce((sum,column)=>sum+column.fraction,0);
  let x=padding;
  const columns=layout.style.columns.map(column=>{
    const w=availableWidth*column.fraction/fraction;
    const rect={id:column.id,x,y:padding,width:w,height:height-2*padding};
    x+=w+columnGap;
    return rect;
  });
  const component=columns.find(column=>column.id==='component');
  const rows=componentRows.map((id,index)=>({id,x:component.x,
    y:padding+index*(rowHeight+rowGap),width:component.width,height:rowHeight}));
  return {geometry,columns,rows,iconArea:{width:component.width-2*tilePadding,height:rowHeight-2*tilePadding,gap:iconGap}};
}

function adaptiveGrid(items,width,kind){
  const {padding,columnGap}=layout.geometry;
  const {width:tileWidth,height:tileHeight}=layout.asset.adaptiveTiles[kind];
  const maxColumns=layout.asset.adaptiveColumns;
  const occupied=new Set();
  let cursor=0,rows=0,columns=0;
  const placements=items.map(item=>{
    if(item.aspectRatio!==undefined&&(!Number.isFinite(item.aspectRatio)||item.aspectRatio<=0)){
      throw new Error('Invalid photo aspectRatio for '+item.id);
    }
    const ratio=item.aspectRatio??1;
    const [wide,tall]=kind==='photo'?(item.span??(ratio>=1.4?[3,2]:ratio<=0.75?[1,2]:[2,2])):[1,1];
    if(!Number.isInteger(wide)||wide<1||wide>maxColumns||!Number.isInteger(tall)||tall<1||tall>maxColumns){
      throw new Error('Invalid photo span for '+item.id);
    }
    while(true){
      const row=Math.floor(cursor/maxColumns),column=cursor%maxColumns;
      const cells=Array.from({length:tall},(_,y)=>Array.from({length:wide},(_,x)=>(row+y)*maxColumns+column+x)).flat();
      if(column+wide<=maxColumns&&cells.every(cell=>!occupied.has(cell))){
        cells.forEach(cell=>occupied.add(cell));
        rows=Math.max(rows,row+tall);
        columns=Math.max(columns,column+wide);
        cursor++;
        return {row:row+1,column:column+1,wide,tall};
      }
      cursor++;
    }
  });
  return {items,placements,columns,grid:{rows,columns,tileWidth,tileHeight},
    size:{width,height:2*padding+rows*tileHeight+(rows-1)*columnGap}};
}

export function paginateAssets(variants,{width,height,columns,kind='icon',mode='fixed'}){
  const {padding,columnGap}=layout.geometry;
  if(!['fixed','adaptive'].includes(mode))throw new Error('Unknown Asset Card layout: '+mode);
  if(mode==='adaptive')return [adaptiveGrid(variants,width,kind)];
  const itemWidth=Math.max(96,...variants.map(item=>(item.width??32)+20));
  const itemHeight=Math.max(72,...variants.map(item=>(item.height??32)+20));
  const grid=fitGrid({width:width-2*padding,height:height-2*padding,
    itemWidth,itemHeight,
    gap:columnGap,count:variants.length,maxColumns:columns??variants.length});
  const pages=[];
  for(let index=0;index<variants.length;index+=grid.capacity){
    const items=variants.slice(index,index+grid.capacity);
    const rows=Math.ceil(items.length/grid.max_col);
    pages.push({items,columns:Math.min(grid.max_col,items.length),grid:{...grid,rows},size:{width,height}});
  }
  return pages;
}

export function iconDisplay(width,height,kind){
  const {min,max,fill}=layout.iconGrid[kind];
  return Math.floor(Math.min(width,height,Math.max(min,Math.min(max,Math.min(width,height)*fill))));
}

export function planIconRow(area,count){
  const cell=Math.ceil(layout.iconGrid.style.min/layout.iconGrid.style.fill);
  const fit=fitGrid({...area,itemWidth:cell,itemHeight:cell,count});
  if(count>fit.capacity)throw new Error('Move extra icons to their Asset Cards.');
  const columns=Math.ceil(count/fit.rows);
  const width=(area.width-(columns-1)*area.gap)/columns;
  const height=(area.height-(fit.rows-1)*area.gap)/fit.rows;
  return {columns,width,height,size:iconDisplay(width,height,'style')};
}

export function planCanvas(devices,cards,{margin,columnGap,frameGap}=layout.canvas){
  return devices.map(device=>{
    let y=margin;
    const left=cards.map(card=>{
      const frame={...card,x:margin,y};
      y+=card.height+frameGap;
      return frame;
    });
    let x=margin+Math.max(...left.map(frame=>frame.width))+columnGap;
    const screens=device.frames.map(frame=>{
      const spec={...frame,x,y:margin,width:device.width,height:device.frameHeight??device.height};
      x+=spec.width+frameGap;
      return spec;
    });
    return {name:device.name,start:device.start,frames:[...left,...screens]};
  });
}
