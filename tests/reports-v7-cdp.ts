// Native browser, CSP offline, real frontend/PDF and mocked backend. No production traffic.
import {fixture,authored,wireDocument} from './reports-v7-fixtures.mjs';
import {generateAuthoredReport} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {createGroqGuard} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {createEngine} from '../supabase/functions/seguranca-viaria-groq-v2/engine.ts';
const v8=Deno.args.includes('--v8');
const root=new URL('../',import.meta.url),port=9357,profile=decodeURIComponent(new URL('.validation-tools/v7-cdp-profile',root).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const child=new Deno.Command('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',{args:['--headless','--disable-gpu','--no-first-run','--disable-extensions','--disable-background-networking',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`],stdout:'null',stderr:'null'}).spawn();let ws;
try{
 let version;for(let n=0;n<50;n++){try{version=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}if(!version)throw Error('Chrome indisponível');
 ws=new WebSocket(version.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let seq=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
 const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>reject(Error('Timeout '+method)),180000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,sessionId}));});
 const evaluate=async(expression,sessionId)=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const checks=await Deno.readTextFile(new URL(v8?'tests/reports-v8-browser.js':'tests/reports-v7-browser.js',root));
 const sizes=[1,15,40],fixtures=sizes.map(n=>fixture(n)),documents={},metrics=[];
 for(const [index,count] of sizes.entries()){
  if(v8){
   documents[count]=await createEngine(key=>key==='GROQ_API_KEY'?'browser-mock':undefined,async(_url,init)=>{
    const payload=JSON.parse(String(init?.body));
    const evidence=JSON.parse(payload.messages[1].content).evidence;
    const wire={summary:'A gestão pode priorizar a continuidade da prevenção.',findings:[{
     title:'Qualidade dos registros',text:'Como hipótese de trabalho, vale investigar a consistência dos registros.',evidenceKeys:[evidence[0].key]
    }],actions:[{title:'Conferir as ocorrências',text:'Avaliar medidas para reduzir acidentes e tratar divergências nos registros.',evidenceKeys:[evidence[0].key]}],
    conclusion:'A definição de prioridades depende da conferência das evidências.',limitations:['Mudanças descritivas não demonstram relação causal.']};
    return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(wire)}}]});
   })(fixtures[index],'browser-fixture');
   continue;
  }
  if(!Deno.args.includes('--wire')){documents[count]=authored(count);continue;}
  const wire=wireDocument(authored(count));
  wire.sections[0].refs=['E0.latest'];
  if(count>1)wire.sections.push({type:'hypothesis',title:'Hipótese para investigação',text:'Investigar fatores operacionais antes de escolher uma intervenção.',refs:[],claims:[]});
  const result=await generateAuthoredReport(fixtures[index],'groq',createGroqGuard(),key=>key==='GROQ_API_KEY'?'browser-mock':undefined,async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(wire)}}]}));
  if(result.validation.partial||result.validation.acceptedSectionsCount!==(count>1?6:1)||!result.document.sections[0].refs.includes('E0.delta'))throw Error('Fixture não passou pela validação factual da Edge');
  documents[count]=result.document;
 }
 const widths=Deno.args.includes('--smoke')?[320,1440]:[320,375,430,768,1024,1440,1920];
 for(const width of widths)for(const theme of ['dark','light']){
  const {targetId}=await call('Target.createTarget',{url:'about:blank'}),{sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});await call('Page.enable',{},sessionId);await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500},sessionId);await call('Page.navigate',{url:new URL('.validation-tools/reports-v6-browser.html',root).href},sessionId);
  let status='';for(let n=0;n<300;n++){status=await evaluate('document.getElementById("report-validation")?.textContent??""',sessionId);if(/^(PASS|FAIL)/.test(status))break;await new Promise(r=>setTimeout(r,100));}if(!status.startsWith('PASS'))throw Error('Smoke '+status);
  await evaluate(`applyTheme(${JSON.stringify(theme)});`,sessionId);console.log(width,theme,await evaluate(checks+`\nrunReport${v8?'V8':'V7'}Checks(${JSON.stringify(fixtures)},${JSON.stringify(documents)})`,sessionId));
  const geometry=await evaluate('({overflow:document.documentElement.scrollWidth>innerWidth+1,theme:document.body.classList.contains("light-theme")})',sessionId);if(geometry.overflow||geometry.theme!==(theme==='light'))throw Error('Layout/tema '+width);
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},sessionId);await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))',sessionId);if(await evaluate('DGranelMotion.activeCount!==0',sessionId))throw Error('Movimento reduzido');
  await evaluate('document.getElementById("reportEditorial").scrollIntoView({block:"start"});document.querySelector("[data-section-title]").focus()',sessionId);await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},sessionId);await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},sessionId);if(!await evaluate('document.activeElement.tagName==="TEXTAREA"',sessionId))throw Error('Tab editor');
  const shot=await call('Page.captureScreenshot',{format:'png'},sessionId);await Deno.writeFile(new URL(`.validation-tools/v7-editor-${width}-${theme}.png`,root),Uint8Array.from(atob(shot.data),c=>c.charCodeAt(0)));
  metrics.push({width,theme,results:await evaluate('window.__v7metrics',sessionId)});
  if(width===1440&&theme==='dark'){const samples=await evaluate('window.__v7pdfs',sessionId);for(const [name,sample] of Object.entries(samples)){await Deno.writeFile(new URL(`.validation-tools/v7-${name}.pdf`,root),Uint8Array.from(atob(sample.pdf),c=>c.charCodeAt(0)));await Deno.writeTextFile(new URL(`.validation-tools/v7-${name}-layout.json`,root),JSON.stringify(sample.layout));}}
  await call('Target.closeTarget',{targetId});
 }
 await Deno.writeTextFile(new URL('.validation-tools/'+(Deno.args.includes('--smoke')?'v7-browser-smoke-results.json':'v7-browser-results.json'),root),JSON.stringify(metrics,null,2));await call('Browser.close');
}finally{try{ws?.close();}catch{}try{child.kill();}catch{}}
