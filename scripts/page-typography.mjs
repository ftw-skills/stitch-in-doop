import {layout} from './card-layout.mjs';

export const headings={page_title:'h1',section_title:'h2',subsection_title:'h3'};

export function checkTypeProfile(profile,name){
  const roles=Object.keys(headings);
  const sizes=roles.map(key=>profile[key]?.size);
  if(!sizes.every(size=>Number.isFinite(size)&&size>0)||!(sizes[0]>sizes[1]&&sizes[1]>sizes[2]))
    throw new Error('project.json '+name+': page_title must be larger than section_title and subsection_title.');
  for(const role of roles){
    const lineHeight=profile[role].lineHeight;
    if(lineHeight!==undefined&&(!Number.isFinite(lineHeight)||lineHeight<1))throw new Error('Invalid line height for '+name+'/'+role);
  }
  for(const key of ['headerHeight','mainInset']){
    if(profile[key]!==undefined&&(!Number.isFinite(profile[key])||profile[key]<0))
      throw new Error('Invalid '+key+' for '+name);
  }
}

export function compilePageTypography(typography,devices){
  if(!typography)return '';
  const sizes=devices.map(device=>device.width).sort((a,b)=>a-b);
  const css='body:lang(zh){font-family:'+layout.typographyDefaults.zh.uiFont+'}';
  return css+[...devices].sort((a,b)=>a.width-b.width).map(({name,width})=>{
    const profile=typography[name];
    if(!profile)throw new Error('project.json: missing typography profile for '+name);
    checkTypeProfile(profile,name);
    const rules=Object.keys(headings).map(id=>{
      const {size,lineHeight}=profile[id];
      return 'main [data-stitch-type="'+id+'"]{font-size:'+size+'px'+(lineHeight?';line-height:'+lineHeight:'')+'}';
    }).join('');
    const containers=(profile.headerHeight!==undefined?'main > header[data-stitch-container="header"]{height:'+profile.headerHeight+'px}':'')+
      (profile.mainInset!==undefined?'main{padding-inline:'+profile.mainInset+'px}':'');
    const order=sizes.indexOf(width);
    const minimum=profile.minWidth??(order===0?0:Math.ceil((sizes[order-1]+width)/2));
    if(!Number.isInteger(minimum)||minimum<0||minimum>width)throw new Error('Invalid minWidth for '+name);
    return '@media (min-width:'+minimum+'px){'+rules+containers+'}';
  }).join('');
}
