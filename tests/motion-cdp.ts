// Dados e serviços simulados; Chrome real. --before usa fixture V3 capturado antes da edição.
const root=new URL('../',import.meta.url),before=Deno.args.includes('--before'),keyboard=Deno.args.includes('--keyboard'),label=before?'before':keyboard?'keyboard':'after';
const profile=new URL('.validation-tools/motion-profile',root).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const child=new Deno.Command('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',{args:['--headless','--disable-gpu','--no-first-run','--disable-extensions','--disable-background-networking','--remote-debugging-port=9338',`--user-data-dir=${decodeURIComponent(profile)}`],stdout:'null',stderr:'null'}).spawn();
let ws;const metrics=[];
try{
 let version;for(let n=0;n<40;n++){try{version=await(await fetch('http://127.0.0.1:9338/json/version')).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
 if(!version)throw Error('CDP indisponível');ws=new WebSocket(version.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let seq=0;const waiting=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);const p=waiting.get(m.id);if(p){waiting.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
 const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;waiting.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,sessionId}));});
 const cases=before?[[1440,'dark',false]]:keyboard?[[320,'dark',false],[1440,'light',true]]:[320,390,768,1024,1440,1920].flatMap(w=>[[w,'dark',false],[w,'light',false]]).concat([[1440,'dark',true]]);
 for(const [width,theme,reduce]of cases){
  const {targetId}=await call('Target.createTarget',{url:'about:blank'}),{sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
  const evaluate=async(expression,awaitPromise=false)=>{const r=await call('Runtime.evaluate',{expression,awaitPromise,returnByValue:true},sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const key=async(name,code)=>{for(const type of ['keyDown','keyUp'])await call('Input.dispatchKeyEvent',{type,key:name,code:name,windowsVirtualKeyCode:code,...(type==='keyDown'&&name==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})},sessionId);};
  await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500},sessionId);await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduce?'reduce':'no-preference'}]},sessionId);
  await call('Page.enable',{},sessionId);await call('Performance.enable',{},sessionId);
  await call('Page.bringToFront',{},sessionId);
  await call('Page.navigate',{url:new URL(before?'.validation-tools/v3-1-before/reports-browser.html':'.validation-tools/reports-browser.html',root).href+'#'+theme},sessionId);
  let status='';for(let n=0;n<120;n++){status=await evaluate('document.getElementById("report-validation")?.textContent||""');if(status.startsWith('PASS')||status.startsWith('FAIL'))break;await new Promise(r=>setTimeout(r,100));}if(!status.startsWith('PASS'))throw Error(status);
  const timing=await evaluate('JSON.stringify({domContentLoaded:performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd,heap:performance.memory?.usedJSHeapSize})');
  const start=await call('Performance.getMetrics',{},sessionId);
  await evaluate(`(async()=>{for(let n=0;n<10;n++){toggleTheme();await new Promise(r=>setTimeout(r,30));}for(const tab of ['home','dashboard','datagrid','intelligence','reports','governance','home'])switchTab(tab);if(innerWidth>=1024){document.getElementById('v3MenuToggle').click();await new Promise(r=>setTimeout(r,350));document.getElementById('v3MenuToggle').click();}await new Promise(r=>setTimeout(r,400));})()`,true);
  const end=await call('Performance.getMetrics',{},sessionId),values=m=>Object.fromEntries(m.metrics.map(x=>[x.name,x.value])),a=values(start),b=values(end);
  metrics.push({width,theme,reduce,timing:JSON.parse(timing),taskSeconds:b.TaskDuration-a.TaskDuration,layouts:b.LayoutCount-a.LayoutCount,styleRecalculations:b.RecalcStyleCount-a.RecalcStyleCount,heap:b.JSHeapUsedSize,heapDelta:b.JSHeapUsedSize-a.JSHeapUsedSize});
  if(!before){
   console.log(width,theme,reduce?'reduced':'motion',await evaluate((await Deno.readTextFile(new URL('tests/motion-browser.js',root)))+'\nrunMotionChecks()',true));
   await evaluate(`applyTheme('${theme}');document.body.classList.add('developer-mode');`);
   for(const tab of ['home','dashboard','datagrid','intelligence','reports','governance','audit']){
    await evaluate(`switchTab('${tab}');window.scrollTo(0,0);`);await new Promise(r=>setTimeout(r,300));
    if(await evaluate('document.documentElement.scrollWidth>innerWidth+1'))throw Error('Overflow '+width+' '+tab);
    if([320,1440].includes(width)&&!reduce){const shot=await call('Page.captureScreenshot',{format:'png'},sessionId);await Deno.writeFile(new URL(`.validation-tools/motion-${tab}-${width}-${theme}.png`,root),Uint8Array.from(atob(shot.data),c=>c.charCodeAt(0)));}
   }
   if(width<1024){await evaluate("document.getElementById('v3MenuToggle').focus()");await key('Enter',13);await key('Tab',9);if(!await evaluate("document.getElementById('v3Sidebar').contains(document.activeElement)"))throw Error('Tab fora do drawer');await key('Enter',13);if(!await evaluate("document.activeElement.id==='v3MenuToggle'&&!document.body.classList.contains('v3-drawer-open')"))throw Error('Enter navegação/foco');await key('Enter',13);await key('Escape',27);if(!await evaluate("document.activeElement.id==='v3MenuToggle'&&!document.body.classList.contains('v3-drawer-open')"))throw Error('Escape drawer');}
   if(keyboard&&width>=1024){for(const tab of ['home','dashboard','datagrid','intelligence','reports','governance','audit']){await evaluate(`document.getElementById('tab-${tab}').focus()`);await key('Enter',13);if(!await evaluate(`!document.getElementById('view-${tab}').classList.contains('hidden')`))throw Error('Enter módulo '+tab);}console.log('PASS sete módulos por Enter, com movimento reduzido');}
   if(width===1440&&!reduce&&theme==='dark'){
    await evaluate("localStorage.setItem('dgranel.theme','light')");await call('Page.reload',{},sessionId);await new Promise(r=>setTimeout(r,1800));
    if(!await evaluate("currentTheme==='light'&&document.body.classList.contains('light-theme')&&document.getElementById('themeToggleBtn').dataset.theme==='light'"))throw Error('Persistência após reload');console.log('PASS tema persistido após recarregar');
   }
  }
  await call('Target.closeTarget',{targetId});
 }
 await Deno.writeTextFile(new URL(`.validation-tools/motion-${label}-metrics.json`,root),JSON.stringify(metrics,null,2));console.log('PASS métricas '+label,JSON.stringify(metrics));await call('Browser.close');
}finally{try{ws?.close();}catch{}try{child.kill();}catch{}}
