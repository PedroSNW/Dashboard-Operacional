// Executa o handler de produção compilado por Deno; somente imports externos
// de serve/createClient são substituídos. Não abre servidor nem acessa a rede.
const assert = (v: unknown, message: string) => { if (!v) throw Error(message); };
const root = new URL('../', import.meta.url);
const original = await Deno.readTextFile(new URL('supabase/functions/seguranca-viaria-ia/index.ts', root));
let handler: (req: Request) => Promise<Response>;
let authDenied = false, readDenied = false, providerStatus = 200;
let captured: any;
let timeout = false, invalidJson = false;
let finishReason = 'stop';
let calls = 0;
const logs: string[] = [];
const realError = console.error;
console.error = (...args) => { logs.push(JSON.stringify(args)); };
let reads = 0;
const indicator = { indicador: 'Total de acidentes', setor: 'Sinistros', meta: 30, und: 'Qtd', direcaoDesempenho: 'menor_melhor', valores: [26,33,38,49,32,38,43,46,40] };
const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set'];
const context = () => ({versao:1, origem:'supabase', competencias:months, totalIndicadoresNoDashboard:1, totalIndicadoresSelecionados:1, totalIndicadoresEnviados:1, contextoParcial:false,
    indicadores:[{...indicator, id:'indice:0', unidade:indicator.und}]});
const envNames = ['SUPABASE_URL','SUPABASE_ANON_KEY','GROQ_API_KEY','OPENAI_API_KEY','GEMINI_API_KEY','DASHBOARD_ALLOWED_ORIGINS'];
const saved = new Map(envNames.map(k=>[k,Deno.env.get(k)]));
for (const k of envNames) Deno.env.set(k, k === 'SUPABASE_URL' ? 'https://mock.invalid' : k === 'DASHBOARD_ALLOWED_ORIGINS' ? 'https://dashboard.test' : 'mock-test-only');
const g = globalThis as any;
g.__edgeServe = (fn: typeof handler) => {handler=fn;};
g.__edgeClient = (_url: string, _key: string, options: any) => {
    assert(options.global.headers.Authorization === 'Bearer mock-jwt', 'JWT não propagado ao cliente RLS');
    const query = {select:()=>query, eq:()=>query, single:async()=>{reads++; return readDenied ? {data:null,error:{}} : {data:{data:{indicadores:[indicator],mesesLabels:months}},error:null};}};
    return {auth:{getUser:async()=>({data:{user:authDenied?null:{id:crypto.randomUUID(),email:'teste@dgranel.com.br'}},error:null})},from:(table:string)=>{assert(table==='dashboard_state','Tabela inesperada');return query;}};
};
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
    calls++;
    if (timeout) throw new DOMException('mock timeout', 'AbortError');
    if (invalidJson) return new Response('invalid-json');
    captured = JSON.parse(String(init?.body));
    const url = String(input);
    assert(/api.groq.com|api.openai.com|generativelanguage.googleapis.com/.test(url), 'Destino inesperado');
    const structured=JSON.stringify({resumo:[{id:'indice:0',stat:'media',competencia:''}],fatos:[],atencao:[],hipoteses:[],recomendacoes:['investigar_registros'],limitacoes:[]});
    const data = url.includes('groq') ? {choices:[{finish_reason:finishReason,message:{content:finishReason==='length'?'':structured}}]} : url.includes('openai') ? {output_text:structured} : {candidates:[{content:{parts:[{text:structured}]}}]};
    return Response.json(providerStatus === 200 ? data : {error:{code:'rate_limit_exceeded',message: providerStatus===400 ? 'context length exceeded SECRET_SENTINEL' : 'tokens per minute SECRET_SENTINEL'}},{status:providerStatus,headers:{'retry-after':'30','x-request-id':'req-test'}});
};
const generated = new URL('.validation-tools/edge-handler.fixture.ts',root);
const source = original.replace(/^import \{ serve \}.*;$/m,'const serve = (globalThis as any).__edgeServe;')
    .replace(/^import \{ createClient \}.*;$/m,'const createClient = (globalThis as any).__edgeClient;')
    .replace('"./analytics.js"', JSON.stringify(new URL('supabase/functions/seguranca-viaria-ia/analytics.js',root).href))
    .replace('"./groq-context.js"', JSON.stringify(new URL('supabase/functions/seguranca-viaria-ia/groq-context.js',root).href));
await Deno.writeTextFile(generated,source);
await import(generated.href);
const request = (body: unknown, headers: Record<string,string> = {}) => new Request('https://edge.test', {method:'POST',headers:{Origin:'https://dashboard.test',Authorization:'Bearer mock-jwt','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
let passed = 0;
async function test(name: string, fn:()=>Promise<void>) {await fn();passed++;console.log('PASS',name);}
try {
    await test('CORS preflight permitido/negado e método',async()=>{
        assert((await handler(new Request('https://edge.test',{method:'OPTIONS',headers:{Origin:'https://dashboard.test'}}))).status===204,'Preflight');
        assert((await handler(new Request('https://edge.test',{method:'OPTIONS',headers:{Origin:'https://evil.test'}}))).status===403,'CORS negado');
        assert((await handler(new Request('https://edge.test'))).status===405,'Método');
    });
    await test('JWT ausente/inválido rejeitado antes da leitura',async()=>{
        const before=reads;
        assert((await handler(request({prompt:'teste'},{Authorization:''}))).status===401,'JWT ausente');
        authDenied=true;
        assert((await handler(request({prompt:'teste'}))).status===401,'JWT inválido');authDenied=false;
        assert(reads===before,'Leu antes de autenticar');
    });
    await test('Payload UTF-8 excessivo e JSON inválido',async()=>{
        assert((await handler(request({prompt:'á'.repeat(14000)}))).status===413,'Limite do corpo');
        assert((await handler(new Request('https://edge.test',{method:'POST',headers:{Authorization:'Bearer mock-jwt'},body:'{'}))).status===400,'JSON inválido');
    });
    await test('RLS negada e contexto adulterado não chegam ao provedor',async()=>{
        captured=null;readDenied=true;
        assert((await handler(request({prompt:'acidentes',context:context(),provider:'groq'}))).status===403,'RLS');readDenied=false;
        const c=context();c.indicadores[0].valores=[999];
        assert((await handler(request({prompt:'acidentes',context:c,provider:'groq'}))).status===409,'Adulteração');assert(captured===null,'Provedor recebeu dados inválidos');
    });
    for (const provider of ['groq','openai','gemini']) await test(`${provider}: snapshot → cálculo → API → resposta frontend`,async()=>{
        const res=await handler(request({prompt:'Analise acidentes',context:context(),provider}));
        const body=await res.json();assert(res.status===200 && body.success && body.contextVersion===1,'Contrato frontend');
        assert(body.technicalDetails.includes('Soma: 345') && body.response.includes('38,33'),'Cálculo na resposta');
        if(provider==='groq')assert(body.meta.requestBytes===new TextEncoder().encode(JSON.stringify(captured)).length && body.meta.requestBytes<=6000 && body.meta.sentIndicators===1 && body.meta.contextBuild==='groq-compact-bytes-v2','Medição do corpo Groq');
        const input=provider==='groq'?captured.messages[1].content:provider==='openai'?captured.input:captured.contents[0].parts[0].text;
        const sent=JSON.parse(input.slice(input.indexOf('{')));
        assert(sent.indicadores[0].estatisticas.soma===345 && sent.indicadores[0].estatisticas.acimaMeta===8,'Estatísticas no provedor');
        assert(res.headers.get('Access-Control-Allow-Origin')==='https://dashboard.test','CORS resposta');
        assert(!JSON.stringify(body).includes('mock-jwt'),'Token exposto');
    });
    await test('Intervalo janeiro-setembro exclui outubro após validar snapshot',async()=>{
        months.push('Out');indicator.valores.push(999);
        try {
            const res=await handler(request({prompt:'Analise acidentes de janeiro a setembro',context:context(),provider:'groq'}));
            const body=await res.json();
            assert(res.status===200 && body.technicalDetails.includes('Soma: 345') && !body.technicalDetails.includes('Out:'),'Intervalo não aplicado');
            const input=captured.messages[1].content;const sent=JSON.parse(input.slice(input.indexOf('{')));
            assert(sent.competencias.length===9&&sent.indicadores[0].valores.length===9,'Provedor recebeu outubro');
        } finally {months.pop();indicator.valores.pop();}
    });
    await test('Pergunta simples sem chamada; limite de saída retorna síntese segura',async()=>{
        let before=calls;
        let res=await handler(request({prompt:'Qual a média de Total de acidentes?',context:context(),provider:'groq'}));
        let body=await res.json();assert(res.status===200 && body.meta.deterministicOnly && calls===before && body.response.includes('38,33'),'Resposta direta');
        finishReason='length';
        res=await handler(request({prompt:'Analise acidentes',context:context(),provider:'groq'}));body=await res.json();
        assert(res.status===200 && body.response.includes('38,33') && body.meta.finishReason==='length' && !body.response.includes('incompleta'),'Fallback limite');
        finishReason='stop';
    });
    await test('Parcialidade inconsistente, provedor inválido e prompt excessivo',async()=>{
        const c=context();c.contextoParcial=true;
        assert((await handler(request({prompt:'acidentes',context:c,provider:'groq'}))).status===400,'Parcialidade inconsistente aceita');
        assert((await handler(request({prompt:'acidentes',provider:'inexistente'}))).status===400,'Provedor inválido');
        assert((await handler(request({prompt:'x'.repeat(1001)}))).status===413,'Prompt excessivo');
    });
    await test('Groq 400 contexto, 413, timeout e parsing inválido',async()=>{
        providerStatus=400;
        let res=await handler(request({prompt:'Analise acidentes',context:context(),provider:'groq'}));
        assert(res.status===502 && (await res.json()).error.includes('excesso de contexto'),'400 contexto');
        providerStatus=413;const before413=calls;res=await handler(request({prompt:'Analise acidentes',context:context(),provider:'groq'}));
        const body413=await res.json();
        assert(res.status===413 && body413.error.includes('HTTP 413') && calls===before413+1,'413 específico sem retry');providerStatus=200;
        assert(logs.some(line=>line.includes('"requestBytes":') && line.includes('"status":413')),'Tamanho do corpo não registrado em 413');
        timeout=true;res=await handler(request({prompt:'Analise acidentes',context:context(),provider:'groq'}));
        assert(res.status===504,'Timeout');timeout=false;
        invalidJson=true;res=await handler(request({prompt:'Analise acidentes',context:context(),provider:'groq'}));
        assert(res.status===502,'Parsing');invalidJson=false;
    });
    await test('Erro HTTP da Groq preserva resposta sanitizada, retry-after e cooldown',async()=>{
        providerStatus=429;
        const res=await handler(request({prompt:'Analise acidentes',context:context(),provider:'groq'}));
        const body=await res.json();
        assert(res.status===429 && body.success===false && body.error.includes('tokens') && body.retryAfter===30 && res.headers.get('Retry-After')==='30','Erro HTTP/retry');providerStatus=200;
        const before=calls;
        assert((await handler(request({prompt:'Analise acidentes',context:context(),provider:'groq'}))).status===429 && calls===before,'Cooldown não respeitado');
        assert(!logs.join('').includes('SECRET_SENTINEL') && !logs.join('').includes('mock-jwt') && !logs.join('').includes('Total de acidentes'),'Vazamento nos logs');
    });
    console.log(`${passed} cenários do handler completo passaram, com mocks sem rede.`);
} finally {
    globalThis.fetch=realFetch;
    console.error=realError;
    for (const [key,value] of saved) {if(value===undefined) Deno.env.delete(key);else Deno.env.set(key,value);}
    delete g.__edgeServe;delete g.__edgeClient;
    await Deno.remove(generated);
}
