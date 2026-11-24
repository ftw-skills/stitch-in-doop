import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {componentName,layout,nameAttr,orderAssets} from './card-layout.mjs';
import {iconDisplay,paginateAssets,planIconRow,planStyle} from './plan-layout.mjs';

const require=createRequire(import.meta.url);
const {parse}=require(process.env.STITCH_YAML_MODULE||'yaml');
const stylesheet=await readFile(new URL('../assets/style-card.css',import.meta.url),'utf8');
const hex=/^#[0-9A-Fa-f]{6}$/;
export const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
export function parseDesign(markdown){
  const front=markdown.replace(/\r\n/g,'\n').match(/^(?:\uFEFF)?---\n([\s\S]+?)\n---(?:\n|$)/)?.[1];
  if(!front)throw new Error('A YAML front matter block is required to render this card.');
  const data=parse(front,{uniqueKeys:true});
  if(!data?.name||!data.colors||!data.typography)throw new Error('Specify name, colors and typography.');
  for(const [key,value] of Object.entries(data.colors)){
    if(!/^[a-zA-Z0-9-]+$/.test(key)||!hex.test(value))throw new Error('Expected a named sRGB hex token: '+key);
  }
  for(const settings of Object.values(data.components||{})){
    for(const value of Object.values(settings))resolveToken(data,value);
  }
  return data;
}
export function resolveToken(data,value,seen=new Set()){
  const ref=typeof value==='string'&&value.match(/^\{([^{}]+)\}$/)?.[1];
  if(!ref)return value;
  const result=ref.split('.').reduce((item,key)=>Object.hasOwn(item??{},key)?item[key]:undefined,data);
  if(seen.has(ref)||result===undefined)throw new Error('Invalid token reference: '+ref);
  return resolveToken(data,result,new Set([...seen,ref]));
}
export function designCss(data){
  return Object.entries(data.colors).map(([name,value])=>'--ds-'+name+':'+value).join(';');
}
export function fontRole(data,role){
  const preferred={headline:'headline-display',body:'body-md',label:'label-sm'}[role];
  return data.typography[preferred]||Object.entries(data.typography).find(([key])=>key===role||key.startsWith(role+'-'))?.[1];
}
const baseLanguage=language=>language?.toLowerCase().split('-')[0];
export function inputFontToken(data,keys,language){
  return keys.find(key=>data.typography[key]?.language?.toLowerCase()===language.toLowerCase())??
    keys.find(key=>baseLanguage(data.typography[key]?.language)===baseLanguage(language));
}
function foreground(color){
  const srgb=color.slice(1).match(/../g).map(x=>parseInt(x,16)/255)
    .map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return srgb[0]*.2126+srgb[1]*.7152+srgb[2]*.0722>.179?'#000000':'#FFFFFF';
}
export const cardSize={width:layout.geometry.width,height:layout.geometry.height};
const tile=(name,body,kind='')=>'<div class="tile '+kind+'"'+nameAttr(name)+'>'+body+'</div>';
const lane=({id,label},body)=>'<section class="lane" data-column="'+id+'"'+nameAttr('column_'+id)+' aria-label="'+
  label+'"><div class="lane-content">'+body+'</div></section>';
const titleCase=key=>key[0].toUpperCase()+key.slice(1);
function cardVars(data,geometry=layout.geometry,lang='en'){
  const defaults=layout.typographyDefaults;
  const language=lang.startsWith('zh')?'zh':'en';
  return designCss(data)+';--body-font:'+defaults[language].uiFont+';--ui-size:'+defaults.uiSize+
    'px;--ui-line-height:'+defaults.uiLineHeight+
    ';--specimen-radius:'+(data.rounded?.specimen||'16px')+';--card-height:'+geometry.height+'px'+
    ';--card-padding:'+geometry.padding+'px;--column-gap:'+geometry.columnGap+'px;--row-gap:'+geometry.rowGap+
    'px;--tile-padding:'+geometry.tilePadding+'px;--icon-gap:'+geometry.iconGap+'px';
}
function namedAsset({id,label,markup,name=componentName('icon',id),color,width,height,display,appearanceCount,placement},className){
  if(!/^[a-z][a-z0-9-]*$/.test(id)||!label||!markup)throw new Error('Expected a named asset with editable markup.');
  const usage=(color?' · '+color+' · '+width+' × '+height+' px':'')+(display?' · Display '+display+' px':'')+
    (appearanceCount?' · '+appearanceCount+' observed appearance(s)':'');
  const css=(display?'--display-size:'+display+'px;--asset-color:'+(color??'currentColor')+';':'')+
    (placement?'grid-area:'+placement.row+'/'+placement.column+'/span '+placement.tall+'/span '+placement.wide:'');
  return '<div class="'+className+'" data-asset="'+escapeHtml(id)+'"'+nameAttr(name)+' role="img" aria-label="'+escapeHtml(label)+'" title="'+
    escapeHtml(label+usage)+'"'+(color?' data-color="'+color+'" data-width="'+width+'" data-height="'+height+'"':'')+
    (display?' data-display-size="'+display+'"':'')+(css?' style="'+css+'"':'')+'>'+markup+'</div>';
}
export function assetPages(data,{name,category,items,columns,kind='icon',usage={},css='',display='assets',mode='fixed'}){
  if(!items.length||new Set(items.map(item=>item.id)).size!==items.length)throw new Error('Expected unique assets for '+name);
  const categoryName=componentName('asset',category??name);
  const variants=orderAssets(items,usage,kind,{display,preserveOrder:mode==='adaptive'});
  const pages=paginateAssets(variants,{...cardSize,columns,kind,mode});
  return pages.map((page,index)=>({
    id:categoryName.slice(6)+(index?'_'+(index+1):''),
    name:pages.length===1?name:name+' · '+(index+1)+'/'+pages.length,
    grid:page.grid,
    size:page.size,
    itemIds:page.items.map(item=>item.id),
    css:stylesheet+css,
    chunks:[
      '<article class="asset-card'+(page.placements?' asset-adaptive':'')+'" lang="en" data-category="'+categoryName.slice(6)+'" data-page="'+(index+1)+'"'+
      nameAttr(categoryName)+' aria-label="'+escapeHtml(name)+'" style="'+escapeHtml(cardVars(data,{...layout.geometry,...page.size}))+
      ';--asset-columns:'+page.columns+';--asset-rows:'+page.grid.rows+
      (page.placements?';--asset-tile-width:'+page.grid.tileWidth+'px;--asset-tile-height:'+page.grid.tileHeight+'px':'')+'">',
      ...page.items.map((item,index)=>{
        const {padding,columnGap,tilePadding}=layout.geometry;
        const cell=(outer,count)=>(outer-2*padding-columnGap*(count-1))/count-2*tilePadding;
        const display=kind==='icon'?iconDisplay(page.placements?page.grid.tileWidth-2*tilePadding:cell(page.size.width,page.columns),
          cell(page.size.height,page.grid.rows),'asset'):undefined;
        return namedAsset({...item,display,placement:page.placements?.[index]},'tile asset-tile'+(kind==='photo'?' photo':''));
      }),
      '</article>'
    ]
  }));
}
export function assetSections(data,options){
  const pages=assetPages(data,options);
  if(pages.length!==1)throw new Error('Use assetPages for multi-card category: '+options.name);
  return pages[0];
}
export function styleSections(data,options={}){
  const {lang='en',navigation=[],icons=[],systemIcons=navigation,projectIcons=icons,widgets=[],fontSpecimens={},typographyProfiles={},scrollbarDemo=false,
    buttons=layout.style.buttons.filter(key=>data.components?.['button-'+key])}=options;
  if(options.showProjectIconRow===false&&projectIcons.length)throw new Error('Move project icons to an Asset Card before hiding the Style Card row');
  const plan=planStyle(options.geometry,options.showProjectIconRow);
  const e=escapeHtml,c=data.colors;
  const presets=layout.style.colors.filter(key=>Object.hasOwn(c,key));
  if(!presets.length)presets.push(...Object.keys(c).filter(key=>!/-t\d+$/.test(key)).slice(0,4));
  function palette(key){
    const steps=Object.entries(c).filter(([name])=>name.startsWith(key+'-t')&&/^\d+$/.test(name.slice(key.length+2)))
      .sort(([a],[b])=>Number(a.slice(key.length+2))-Number(b.slice(key.length+2)));
    if(steps.length<2)throw new Error('Declare a tonal ramp for palette role: '+key);
    const ramp=steps.map(([name,value])=>'<i data-design-token="colors.'+e(name)+'"'+nameAttr(componentName('color',name))+' style="background:'+value+'" title="'+
      e(name.slice(key.length+1).toUpperCase()+' '+value)+'"></i>').join('');
    return '<div class="palette" data-design-token="colors.'+e(key)+'"'+nameAttr(componentName('color',key))+' style="background:'+c[key]+';color:'+foreground(c[key])+
      '"><div class="palette-head"><b>'+e(titleCase(key))+'</b><code>'+c[key]+'</code></div>'+
      '<div class="ramp">'+ramp+'</div></div>';
  }
  const typography=Object.entries(layout.style.fonts).map(([role,id])=>{
    const headingSizes=role==='headline'?Object.entries(typographyProfiles).map(([device,profile])=>
      device+' · '+profile.page_title?.size+' / '+profile.section_title?.size+' / '+profile.subsection_title?.size+' px').join(' | '):'';
    const keys=fontSpecimens[role];
    const specimens=keys?keys.map(key=>{
      const token=data.typography[key];
      if(!token)throw new Error('Missing font specimen: typography.'+key);
      return token;
    }):[fontRole(data,role)].filter(Boolean);
    if(!specimens.length)return '';
    const samples=specimens.map((type,index)=>{
      const family=e(type.fontFamily);
      const cjk=/^zh(?:-|$)/i.test(type.language||lang);
      const defaults=layout.typographyDefaults[cjk?'zh':'en'];
      const fallback=defaults.uiFont;
      return '<div class="type-specimen"><div class="type-head"'+(headingSizes?' title="'+e(headingSizes)+'"':'')+'><b>'+(index===0||cjk?e(defaults.labels[role]??(cjk?'输入':'Input')):'')+
        '</b><span>'+family+'</span></div><span class="letters'+(cjk?' cjk':'')+
        '" data-font-family="'+family+'" lang="'+(cjk?'zh':'en')+'" style="font-family:'+family+','+
        e(fallback)+';font-weight:'+e(type.fontWeight||400)+'">'+(cjk?'永文':'Aa')+'</span></div>';
    }).join('');
    return tile(componentName('font',id),samples,'type'+(specimens.length>1?' type-multiple':''));
  }).join('');
  function sample(key,body,klass=''){
    const group=data.components?.[key];
    if(!group)return '';
    const values={background:group.backgroundColor,color:group.textColor,'border-radius':group.rounded,'border-color':group.borderColor};
    const style=Object.entries(values).filter(([,value])=>value!==undefined)
      .map(([name,value])=>name+':'+resolveToken(data,value)).join(';');
    return '<span data-design-token="components.'+e(key)+'"'+nameAttr(componentName(key))+
      ' class="sample '+klass+'" style="'+e(style)+'">'+body+'</span>';
  }
  const buttonSamples=buttons.map(key=>{
    const markup=sample('button-'+key,e(titleCase(key)),key);
    if(!markup)throw new Error('Missing component token: button-'+key);
    return markup;
  }).join('');
  const inputFontKeys=fontSpecimens.input??[];
  function widget({id,kind,label,state,token,value=label,language}){
    const states={switch:['off','on'],checkbox:['unchecked','checked'],radio:['unchecked','checked'],
      inputfield:['default','filled','focus','invalid','disabled'],chip:['default','selected']};
    if(!Object.hasOwn(states,kind)||!states[kind].includes(state))throw new Error('Invalid widget state: '+kind+' '+state);
    const group=data.components?.[token];
    if(!group)throw new Error('Missing widget component token: '+token);
    const locale=language??lang;
    const inputFontKey=kind==='inputfield'&&inputFontToken(data,inputFontKeys,locale);
    if(kind==='inputfield'&&language&&!inputFontKey)throw new Error('Input field language has no matching Input font specimen: '+language);
    const inputFont=kind==='inputfield'?(data.typography[inputFontKey]??data.typography[baseLanguage(locale)==='zh'?'input-md':'input-latin']??fontRole(data,'input')):undefined;
    const css=Object.entries({'--widget-fill':group.backgroundColor,'--widget-ink':group.textColor,
      '--widget-ring':group.borderColor,'--widget-radius':group.rounded,
      '--input-font':inputFont?.fontFamily,'--input-weight':inputFont?.fontWeight}).filter(([,value])=>value!==undefined)
      .map(([key,value])=>key+':'+resolveToken(data,value)).join(';');
    const parts=[kind,id,state];
    if(language&&kind==='inputfield')parts.push(language);
    const attrs=' class="widget '+kind+'" data-state="'+state+'"'+nameAttr(componentName(...parts))+
      ' data-design-token="components.'+e(token)+'" aria-label="'+e(label+' '+state)+'" title="'+e(label+' '+state)+
      '" style="'+e(css)+'"';
    if(kind==='inputfield')return '<input type="text"'+attrs+' placeholder="'+e(label)+'" lang="'+e(locale)+'"'+
      (inputFontKey?' data-input-font-token="'+e(inputFontKey)+'"':'')+
      (state==='filled'?' value="'+e(value)+'"':state==='invalid'?' aria-invalid="true"':state==='disabled'?' disabled':'')+'>';
    if(kind==='radio')return '<input type="radio"'+attrs+(state==='checked'?' checked':'')+'>';
    const marker=kind==='switch'?'<i></i>':kind==='checkbox'&&state==='checked'?'✓':kind==='chip'?e(label):'';
    return '<span'+attrs+'>'+marker+'</span>';
  }
  function iconRow(items){
    if(!items.length)return '';
    const grid=planIconRow(plan.iconArea,items.length);
    const cells=items.map(item=>namedAsset({...item,display:grid.size},'icon')).join('');
    return '<div class="icons" data-max-col="'+grid.columns+'" style="--icon-columns:'+grid.columns+
      ';--icon-cell-width:'+grid.width+'px;--icon-cell-height:'+grid.height+'px">'+cells+'</div>';
  }
  const inputs=widgets.filter(item=>item.kind==='inputfield');
  const inputGroups=Map.groupBy(inputs,item=>item.language??lang);
  const controls=Map.groupBy(widgets.filter(item=>item.kind!=='inputfield'),item=>item.kind);
  const columnsCount=Math.max(1,...[...inputGroups.values()].map(items=>items.length),controls.size);
  const inputRows=[...inputGroups].map(([locale,items])=>
    '<div class="widget-line" lang="'+e(locale)+'" style="--widget-columns:'+columnsCount+'">'+items.map(widget).join('')+'</div>').join('');
  const subrow=(name,markup)=>markup?'<div class="widget-line"'+nameAttr(name)+' style="--widget-columns:'+columnsCount+'">'+markup+'</div>':'';
  const scrollbars=scrollbarDemo?['x','y'].map(axis=>'<div class="scrollbar-demo axis-'+axis+'"'+nameAttr('scrollbar_'+axis)+
    ' tabindex="0" role="region" aria-label="'+(axis==='x'?'Horizontal':'Vertical')+' scrollbar sample"><div aria-hidden="true"></div></div>').join(''):'';
  const rows={button:buttonSamples,small_component:subrow('small_component_controls',[...controls].map(([kind,items])=>
    '<div class="widget-group" role="group" aria-label="'+e(titleCase(kind))+'"'+nameAttr(componentName('controls',kind))+'>'+
    items.map(widget).join('')+'</div>').join(''))+
    (inputRows?'<div class="inputfield-rows'+(inputGroups.size>1?' inputfield-multiple':'')+'"'+nameAttr('small_component_inputfield')+'>'+inputRows+'</div>':'')+scrollbars,
    system_icon:iconRow(systemIcons),project_icon:iconRow(projectIcons)};
  const contents={
    color:'<div class="palette-stack" style="--count:'+presets.length+'">'+presets.map(palette).join('')+'</div>',
    font:'<div class="font-stack">'+typography+'</div>',
    component:'<div class="component-stack">'+plan.rows.map(({id:row})=>tile('row_'+row,rows[row],
      (row==='button'?'buttons':row==='small_component'?'widgets'+(scrollbarDemo?' widgets-scrollbars':''):'')+(rows[row]?'':' empty-row'))).join('')+'</div>'
  };
  const columns=layout.style.columns.map(({fraction})=>'minmax(0,'+fraction+'fr)').join(' ');
  return {
    css:stylesheet+(options.fontCss??''),
    plan,
    chunks:[
      '<article class="style-card" lang="'+e(lang)+'"'+nameAttr('card_style')+' aria-label="Style Card" style="'+e(cardVars(data,plan.geometry,lang))+';--style-columns:'+columns+'">',
      ...layout.style.columns.map(column=>lane(column,contents[column.id])),
      '</article>'
    ]
  };
}
export function fontLink(families=[]){
  if(!families.length)return '';
  return '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'+families.map(name=>'family='+encodeURIComponent(name).replaceAll('%20','+')).join('&amp;')+'&amp;display=swap">';
}
export function htmlFrame(title,css,chunks,{lang='en',fonts=[]}={}){
  return '<!doctype html><html lang="'+escapeHtml(lang)+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+
    escapeHtml(title)+'</title>'+fontLink(fonts)+'<style>'+css+'</style></head><body>'+chunks.join('\n')+'</body></html>';
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const [input,output,lang='en']=process.argv.slice(2);
  if(!input||!output)throw new Error('Usage: node style-card.mjs DESIGN.md style.html [locale]');
  const data=parseDesign(await readFile(input,'utf8'));
  const result=styleSections(data,{lang});
  await writeFile(output,htmlFrame('Style Card',result.css,result.chunks),'utf8');
}
