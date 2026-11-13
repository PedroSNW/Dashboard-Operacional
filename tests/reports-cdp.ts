// Chrome isolado + CDP, sem bibliotecas de automação ou dados de produção.
const root=new URL('../',import.meta.url);
const profile=new URL('.validation-tools/report-cdp-profile',root).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const child=new Deno.Command('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',{args:['--headless','--disable-gpu','--no-first-run','--disable-extensions','--disable-background-networking','--remote-debugging-port=9337',`--user-data-dir=${decodeURIComponent(profile)}`],stdout:'null',stderr:'null'}).spawn();
let ws;
try {
    let version;for(let n=0;n<30;n++){try{version=await (await fetch('http://127.0.0.1:9337/json/version')).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
    if(!version)throw Error('Chrome CDP indisponível');
    ws=new WebSocket(version.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
    let seq=0;const waiting=new Map();
    ws.onmessage=e=>{const m=JSON.parse(e.data);if(waiting.has(m.id)){const {resolve,reject}=waiting.get(m.id);waiting.delete(m.id);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);}};
    const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;waiting.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,sessionId}));});
    for(const [name,width,height,theme] of [['desktop',1440,1100,'dark'],['mobile',390,1000,'light']]){
        const {targetId}=await call('Target.createTarget',{url:'about:blank'});
        const {sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
        await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500},sessionId);
        await call('Page.enable',{},sessionId);
        await call('Page.navigate',{url:new URL('.validation-tools/reports-browser.html',root).href+'#'+theme},sessionId);
        let status='';for(let n=0;n<100;n++){
            const r=await call('Runtime.evaluate',{expression:'document.getElementById("report-validation")?.textContent ?? ""',returnByValue:true},sessionId);
            status=r.result.value;if(status.startsWith('PASS')||status.startsWith('FAIL'))break;await new Promise(r=>setTimeout(r,100));
        }
        if(!status.startsWith('PASS'))throw Error(name+': '+status);
        const geometry=await call('Runtime.evaluate',{expression:'JSON.stringify({width:innerWidth,scroll:document.documentElement.scrollWidth,oversized:[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>400).slice(0,12).map(e=>[e.tagName,e.id,String(e.className),e.getBoundingClientRect().right])})',returnByValue:true},sessionId);
        const g=JSON.parse(geometry.result.value);if(g.width!==width||g.scroll>width)throw Error('Responsividade '+JSON.stringify(g));
        const shot=await call('Page.captureScreenshot',{format:'png'},sessionId);
        await Deno.writeFile(new URL(`.validation-tools/report-${name}.png`,root),Uint8Array.from(atob(shot.data),c=>c.charCodeAt(0)));
        if(name==='desktop'){
            const data=await call('Runtime.evaluate',{expression:'document.getElementById("report-pdf").value',returnByValue:true},sessionId);
            await Deno.writeFile(new URL('.validation-tools/report-charts.pdf',root),Uint8Array.from(atob(data.result.value),c=>c.charCodeAt(0)));
        }
        console.log(status);await call('Target.closeTarget',{targetId});
    }
    await call('Browser.close');
}finally{try{ws?.close();}catch{}try{child.kill();}catch{}}
