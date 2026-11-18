// Chrome isolado, arquivos locais, CSP sem rede e dados integralmente fictícios.
const root=new URL('../',import.meta.url),port=9345;
const profile=decodeURIComponent(new URL('.validation-tools/report-v6-cdp-profile',root).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const child=new Deno.Command('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',{args:['--headless','--disable-gpu','--no-first-run','--disable-extensions','--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`],stdout:'null',stderr:'null'}).spawn();
let ws;
try{
 let version;for(let n=0;n<50;n++){try{version=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}if(!version)throw Error('Chrome indisponível');
 ws=new WebSocket(version.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let seq=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
 const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout '+method));},180000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,sessionId}));});
 const fixtures=await Deno.readTextFile(new URL('.validation-tools/reports-v6-fixtures.json',root)),checks=await Deno.readTextFile(new URL('tests/reports-v6-browser.js',root));
 for(const [width,theme] of [[320,'dark'],[360,'light'],[390,'light'],[768,'dark'],[1024,'light'],[1440,'dark'],[1920,'light']]){
  const {targetId}=await call('Target.createTarget',{url:'about:blank'}),{sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
  await call('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width<500},sessionId);await call('Page.enable',{},sessionId);await call('Page.bringToFront',{},sessionId);await call('Page.navigate',{url:new URL('.validation-tools/reports-v6-browser.html',root).href+'#'+theme},sessionId);
  let status;for(let n=0;n<300;n++){status=(await call('Runtime.evaluate',{expression:'document.getElementById("report-validation")?.textContent??""',returnByValue:true},sessionId)).result.value;if(/^(PASS|FAIL)/.test(status))break;await new Promise(r=>setTimeout(r,100));}if(!status?.startsWith('PASS'))throw Error(width+' smoke: '+status);
  const result=await call('Runtime.evaluate',{expression:checks+`\nrunReportV6Checks(${fixtures})`,awaitPromise:true,returnByValue:true},sessionId);if(result.exceptionDetails)throw Error(width+': '+JSON.stringify(result.exceptionDetails));console.log(width,theme,result.result.value);
  if(width===1440){const samples=(await call('Runtime.evaluate',{expression:'window.__v6pdfs',returnByValue:true},sessionId)).result.value;for(const [n,sample] of Object.entries(samples)){await Deno.writeFile(new URL(`.validation-tools/v6-real-charts-${n}.pdf`,root),Uint8Array.from(atob(sample.pdf),c=>c.charCodeAt(0)));await Deno.writeTextFile(new URL(`.validation-tools/v6-real-charts-${n}-layout.json`,root),JSON.stringify(sample.layout));}}
  const key=async()=>{for(const type of ['keyDown','keyUp'])await call('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})},sessionId);};await key();
  const expanded=await call('Runtime.evaluate',{expression:"document.getElementById('reportPreviewToggle').getAttribute('aria-expanded')==='true'",returnByValue:true},sessionId);if(!expanded.result.value)throw Error('Teclado '+width);await key();
  await call('Runtime.evaluate',{expression:"document.getElementById('reportActions').scrollIntoView({block:'start'});",returnByValue:true},sessionId);await new Promise(r=>setTimeout(r,200));
  const g=(await call('Runtime.evaluate',{expression:"({header:document.querySelector('header').getBoundingClientRect().bottom,bar:document.getElementById('reportActions').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth+1,errors:window.__errors})",returnByValue:true},sessionId)).result.value;
  if(g.overflow||g.bar<g.header||g.errors.length)throw Error('Geometria/erros '+width+JSON.stringify(g));
  const shot=await call('Page.captureScreenshot',{format:'png'},sessionId);await Deno.writeFile(new URL(`.validation-tools/reports-v6-${width}.png`,root),Uint8Array.from(atob(shot.data),c=>c.charCodeAt(0)));
  await call('Runtime.evaluate',{expression:"document.getElementById('reportContextPanel').open=false;document.querySelector('#reportContextPanel > summary').focus();",returnByValue:true},sessionId);await key();
  const context=(await call('Runtime.evaluate',{expression:"({open:document.getElementById('reportContextPanel').open,visible:document.getElementById('reportContext-actionsTaken').getBoundingClientRect().width>0,overflow:document.documentElement.scrollWidth>innerWidth+1})",returnByValue:true},sessionId)).result.value;
  if(!context.open||!context.visible||context.overflow)throw Error('Contexto recolhível/teclado/responsividade '+width);
  await call('Runtime.evaluate',{expression:"document.querySelector('#reportContextPanel > summary').scrollIntoView({block:'start'});",returnByValue:true},sessionId);
  const contextShot=await call('Page.captureScreenshot',{format:'png'},sessionId);await Deno.writeFile(new URL(`.validation-tools/reports-v6-context-${width}.png`,root),Uint8Array.from(atob(contextShot.data),c=>c.charCodeAt(0)));
  console.log('PASS teclado, barra sem sobreposição, tema, sem overflow/erros',width);await call('Target.closeTarget',{targetId});
 }
 await call('Browser.close');
}finally{try{ws?.close();}catch{}try{child.kill();}catch{}}
