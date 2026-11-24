import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {captureIconUsage,componentName,layout} from './card-layout.mjs';
import {resource} from './project-files.mjs';
import {validateProject} from './validate-project.mjs';
import {headings} from './page-typography.mjs';
import {inputFontToken} from './style-card.mjs';

const require=createRequire(import.meta.url);
export async function openBrowser({showScrollbars=false}={}){
  const {chromium}=require(process.env.STITCH_PLAYWRIGHT_MODULE??'playwright');
  return chromium.launch({channel:process.env.STITCH_CHROME_CHANNEL??'chrome',
    ...(showScrollbars?{ignoreDefaultArgs:['--hide-scrollbars']}:{})});
}
async function captureScrollbarScreenshot(url,viewport,path){
  const browser=await openBrowser({showScrollbars:true});
  try{
    const page=await browser.newPage({viewport});
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path});
  }finally{await browser.close();}
}
const safeKey=name=>name.toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
export async function inspectTargets(project,targets,{output='reports/preview.json',screenshotDir='reports/screenshots'}={}){
  const browser=await openBrowser();
  const results=[];
  const usage={};
  const failures=[];
  try{
    const context=await browser.newContext();
    const page=await context.newPage();
    const cdp=await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    for(const target of targets){
      const {id,width,height,file,checks=[],states=[]}=target;
      await page.setViewportSize({width,height});
      await page.goto(pathToFileURL(resource(project,file)).href,{waitUntil:'domcontentloaded'});
      await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(done=>setTimeout(done,3000))]));
      const result={id,viewport:[width,height],checks:[]};
      const check=(field,expected,actual,tolerance=0)=>{
        const delta=typeof expected==='number'&&typeof actual==='number'?actual-expected:undefined;
        result.checks.push({field,expected,actual,...(delta!==undefined?{delta,tolerance}:{})});
        if(delta===undefined?JSON.stringify(actual)!==JSON.stringify(expected):Math.abs(delta)>tolerance)
          failures.push(id+'/'+field);
      };
      async function sample(state,stateChecks){
        const bounds=await page.evaluate(clipping=>{
          const doc=document.documentElement;
          const named=[...document.querySelectorAll('[data-doop-name]')].map(element=>element.dataset.doopName);
          const clipped=clipping?[...document.querySelectorAll('.tile,.palette')]
            .filter(element=>element.scrollHeight>element.clientHeight+1||element.scrollWidth>element.clientWidth+1)
            .map(element=>element.dataset.doopName):[];
          return {overflow:Math.max(0,doc.scrollWidth-innerWidth),
            height:Math.max(doc.scrollHeight,document.body.scrollHeight),named,clipped};
        },target.fitHeight??false);
        const key=state+'/';
        check(key+'horizontal-overflow',0,bounds.overflow);
        if(target.fitHeight){
          check(key+'vertical-overflow',0,Math.max(0,bounds.height-height));
          check(key+'clipped-tiles',[],bounds.clipped);
        }
        if(id==='style'){
          const controls=await page.evaluate(()=>{
            const center=element=>{const rect=element.getBoundingClientRect();return rect.x+rect.width/2;};
            const groups=[...document.querySelectorAll('[data-doop-name="small_component_controls"] .widget-group')];
            const rows=[...document.querySelectorAll('[data-doop-name="small_component_inputfield"] .widget-line')];
            const radios=[...document.querySelectorAll('[data-doop-name="small_component_controls"] input[type="radio"][checked]')];
            return {deltas:rows.flatMap(row=>groups.slice(0,row.children.length).map((group,index)=>Math.abs(center(group)-center(row.children[index])))),
              centered:radios.every(radio=>/^radial-gradient\(circle(?: at (?:center|50% 50%))?,/.test(getComputedStyle(radio).backgroundImage))};
          });
          check(key+'control-column-drift',0,Math.max(0,...controls.deltas),1);
          check(key+'radio-centered',true,controls.centered);
          const scrollbars=await page.locator('.scrollbar-demo').evaluateAll(items=>items.map(node=>{
            const control=node.closest('.widgets').querySelector('.widget-line');
            const first=control?.getBoundingClientRect();
            const vertical=node.classList.contains('axis-y');
            const offset=vertical?'scrollTop':'scrollLeft';
            node[offset]=25;
            const second=control?.getBoundingClientRect();
            const moved=node[offset]>0&&first?.x===second?.x&&first?.y===second?.y;
            node[offset]=0;
            return moved;
          }));
          check(key+'native-scrollbars',true,scrollbars.every(Boolean));
        }
        if(id==='style'||target.verifyAssets){
          const colors=await page.locator('[data-color] svg').evaluateAll(icons=>icons.every(svg=>{
            const probe=document.createElement('span');
            probe.style.color=svg.parentElement.dataset.color;
            document.body.append(probe);
            const matches=getComputedStyle(svg).color===getComputedStyle(probe).color;
            probe.remove();
            return matches;
          }));
          check(key+'observed-icon-colors',true,colors);
        }
        if(target.frameHeight!==undefined)check(key+'native-frame-crop',0,Math.max(0,bounds.height-target.frameHeight),1);
        if(target.typography){
          for(const [role,tag] of Object.entries(headings)){
            const actual=await page.locator('main '+tag).evaluateAll(items=>[...new Set(items.map(item=>parseFloat(getComputedStyle(item).fontSize)))]);
            if(role==='page_title'||actual.length)check(key+role+'/font-size',[target.typography[role].size],actual);
          }
          for(const [field,selector,property] of [['headerHeight','main > header','height'],['mainInset','main','padding-inline-start']]){
            if(target.typography[field]!==undefined){
              const actual=await page.locator(selector).first().evaluate((item,name)=>parseFloat(getComputedStyle(item).getPropertyValue(name)),property);
              check(key+field,target.typography[field],actual,1);
            }
          }
        }
        if(target.verifyAssets){
          const actual=await page.locator('.asset-image').evaluateAll(async images=>{
            await Promise.all(images.map(image=>image.decode().catch(()=>{})));
            return images.every(image=>image.naturalWidth&&getComputedStyle(image).objectFit==='contain');
          });
          check(key+'photo-load-and-contain',true,actual);
          const icons=await page.locator('[data-display-size] svg').evaluateAll(icons=>icons.every(icon=>
            Math.abs(icon.getBoundingClientRect().width-Number(icon.parentElement.dataset.displaySize))<=1));
          check(key+'glyph-display-size',true,icons);
        }
        if(target.uniqueNames){
          const duplicates=bounds.named.filter((name,index)=>bounds.named.indexOf(name)!==index);
          check(key+'duplicate-names',[],[...new Set(duplicates)].sort());
        }
        for(const {selector,rect,css,text,font,lang,count,lines,inputFont} of stateChecks){
          const locator=page.locator(selector);
          const match=await locator.count();
          check(key+selector+'/count',count??1,match);
          if(!match||count!==undefined)continue;
          const measured=await locator.evaluate((element,{props,measureLines})=>{
            const computed=getComputedStyle(element),box=element.getBoundingClientRect();
            const range=document.createRange();
            if(measureLines)range.selectNodeContents(element);
            const lineCount=measureLines?new Set([...range.getClientRects()].map(rect=>Math.round(rect.top))).size:undefined;
            return {rect:{x:box.x,y:box.y,width:box.width,height:box.height},
              css:Object.fromEntries(props.map(prop=>[prop,computed.getPropertyValue(prop)])),
              text:element.textContent.trim(),lang:element.closest('[lang]')?.lang,lines:lineCount,
              inputFont:computed.fontFamily.replace(/^['"]|['"]$/g,'')};
          },{props:Object.keys(css??{}),measureLines:lines!==undefined});
          for(const [name,value] of Object.entries(rect??{}))check(key+selector+'/'+name,value,measured.rect[name],1);
          for(const [name,value] of Object.entries(css??{}))check(key+selector+'/'+name,value,measured.css[name]);
          if(text!==undefined)check(key+selector+'/text',text,measured.text);
          if(lang!==undefined)check(key+selector+'/lang',lang,measured.lang);
          if(lines!==undefined)check(key+selector+'/lines',lines,measured.lines);
          if(inputFont!==undefined)check(key+selector+'/input-font',inputFont,measured.inputFont);
          if(font){
            const {root}=await cdp.send('DOM.getDocument');
            const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});
            const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
            check(key+selector+'/rendered-fonts',[font],[...new Set(fonts.filter(item=>item.glyphCount>0).map(item=>item.familyName))]);
          }
        }
        if(target.captureIcons!==false){
          for(const {id:icon,...appearance} of await page.evaluate(captureIconUsage)){
            const entry={...appearance,frame:id,state};
            const list=usage[icon]??=[];
            if(!list.some(item=>JSON.stringify(item)===JSON.stringify(entry)))list.push(entry);
          }
        }
      }
      await sample('initial',checks);
      if(screenshotDir){
        const screenshot=resource(project,screenshotDir+'/'+safeKey(id)+'.png');
        await mkdir(dirname(screenshot),{recursive:true});
        if(target.visibleScrollbars)await captureScrollbarScreenshot(page.url(),{width,height},screenshot);
        else await page.screenshot({path:screenshot});
      }
      for(const state of states){
        if(state.fill)await page.locator(state.fill.selector).fill(state.fill.value);
        if(state.click)await page.locator(state.click).click();
        if(state.checked)check(state.id+'/checked',true,await page.locator(state.checked).isChecked());
        if(state.fill){
          const input=page.locator(state.fill.selector);
          check(state.id+'/value',state.fill.value,await input.inputValue());
          check(state.id+'/focused',true,await input.evaluate(node=>node===document.activeElement));
        }
        await sample(state.id,state.checks??[]);
      }
      results.push(result);
    }
  }finally{await browser.close();}
  const report={passed:failures.length===0,failures,targets:results,usage};
  if(output){
    const path=resource(project,output);
    await mkdir(dirname(path),{recursive:true});
    await writeFile(path,JSON.stringify(report,null,2)+'\n','utf8');
  }
  return report;
}

export async function inspectProject(project){
  const {devices,plan,style,design,typography}=await validateProject(project);
  const named=name=>'[data-doop-name="'+name+'"]';
  const inputs=style.widgets.filter(item=>item.kind==='inputfield');
  const inputSelector=item=>named(componentName('inputfield',item.id,item.state,...(item.language?[item.language]:[])));
  const inputChecks=inputs.flatMap(item=>{
    const lang=item.language??style.lang??'en';
    const key=inputFontToken(design,style.fontSpecimens?.input??[],lang);
    if(!key)return [];
    const token=design.typography[key];
    return {selector:inputSelector(item)+'[data-input-font-token='+JSON.stringify(key)+']',inputFont:token.fontFamily,lang,
      font:item.state==='filled'?token.fontFamily:undefined,
      css:token.fontWeight?{'font-weight':String(token.fontWeight)}:undefined};
  });
  const styleChecks=[
    ...plan.columns.map(({id,...rect})=>({selector:named('column_'+id),rect})),
    ...plan.rows.map(({id,...rect})=>({selector:named('row_'+id),rect})),
    ...Object.entries(style.fontSpecimens??{}).flatMap(([role,keys])=>keys.map(key=>{
      const {fontFamily,language}=design.typography[key];
      return {selector:named('font_'+layout.style.fonts[role])+' [data-font-family='+JSON.stringify(fontFamily)+'][lang="'+(language?.startsWith('zh')?'zh':'en')+'"]',
        font:fontFamily,text:language?.startsWith('zh')?'永文':'Aa'};
    })),...inputChecks
  ];
  const targets=[
    {id:'style',file:'style/card.html',width:plan.geometry.width,height:plan.geometry.height,
      checks:styleChecks,fitHeight:true,uniqueNames:true,captureIcons:false,visibleScrollbars:style.scrollbarDemo,
      states:[
        ...inputs.filter(item=>item.state==='default').map(item=>{
          const selector=inputSelector(item);
          const token=inputFontToken(design,style.fontSpecimens?.input??[],item.language??style.lang??'en');
          const value=inputs.find(sample=>sample.id===item.id&&sample.language===item.language&&sample.state==='filled')?.value??item.label;
          return {id:componentName('enter',item.id,...(item.language?[item.language]:[])),fill:{selector,value},
            checks:token?[{selector,font:design.typography[token].fontFamily}]:[]};
        }),
        ...(style.widgets.some(item=>item.kind==='radio'&&item.state==='unchecked')?
          [{id:'select-radio',click:'input.radio[data-state="unchecked"]',checked:'input.radio[data-state="unchecked"]'}]:[])
      ]},
    ...devices.flatMap(({name,width,height,frameHeight,frames})=>
      frames.map(frame=>({...frame,id:safeKey(name)+'-'+frame.id,width,height,frameHeight,typography:typography?.[name]})))
  ];
  const report=await inspectTargets(project,targets);
  await writeFile(resolve(project,'reports/icon-usage.json'),JSON.stringify(report.usage,null,2)+'\n','utf8');
  return report;
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const report=await inspectProject(resolve(process.argv[2]??'.'));
  console.log(JSON.stringify({passed:report.passed,targets:report.targets.length,failures:report.failures}));
  if(!report.passed)process.exitCode=1;
}
