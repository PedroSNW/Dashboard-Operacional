// Executa o handler de produção compilado por Deno; somente imports externos
// de serve/createClient são substituídos. Não abre servidor nem acessa a rede.
const assert = (v: unknown, message: string) => { if (!v) throw Error(message); };
const root = new URL('../', import.meta.url);
const original = await Deno.readTextFile(new URL('supabase/functions/seguranca-viaria-ia/index.ts', root));
let handler: (req: Request) => Promise<Response>;
let authDenied = false, readDenied = false, providerStatus = 200;
let captured: any;
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
    captured = JSON.parse(String(init?.body));
    const url = String(input);
    assert(/api.groq.com|api.openai.com|generativelanguage.googleapis.com/.test(url), 'Destino inesperado');
    const data = url.includes('groq') ? {choices:[{message:{content:'Investigar hipóteses sem presumir causas.'}}]} : url.includes('openai') ? {output_text:'Investigar hipóteses.'} : {candidates:[{content:{parts:[{text:'Investigar hipóteses.'}]}}]};
    return Response.json(data,{status:providerStatus});
};
const generated = new URL('.validation-tools/edge-handler.fixture.ts',root);
const source = original.replace(/^import \{ serve \}.*;$/m,'const serve = (globalThis as any).__edgeServe;')
    .replace(/^import \{ createClient \}.*;$/m,'const createClient = (globalThis as any).__edgeClient;')
    .replace('"./analytics.js"', JSON.stringify(new URL('supabase/functions/seguranca-viaria-ia/analytics.js',root).href));
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
        assert(body.response.includes('Soma: 345') && body.response.includes('38,33'),'Cálculo na resposta');
        const input=provider==='groq'?captured.messages[1].content:provider==='openai'?captured.input:captured.contents[0].parts[0].text;
        const sent=JSON.parse(input.slice(input.indexOf('{')));
        assert(sent.indicadores[0].estatisticas.soma===345 && sent.indicadores[0].estatisticas.acimaMeta===8,'Estatísticas no provedor');
        assert(res.headers.get('Access-Control-Allow-Origin')==='https://dashboard.test','CORS resposta');
        assert(!JSON.stringify(body).includes('mock-jwt'),'Token exposto');
    });
    await test('Parcialidade inconsistente, provedor inválido e prompt excessivo',async()=>{
        const c=context();c.contextoParcial=true;
        assert((await handler(request({prompt:'acidentes',context:c,provider:'groq'}))).status===400,'Parcialidade inconsistente aceita');
        assert((await handler(request({prompt:'acidentes',provider:'inexistente'}))).status===400,'Provedor inválido');
        assert((await handler(request({prompt:'x'.repeat(1001)}))).status===413,'Prompt excessivo');
    });
    await test('Erro HTTP da Groq preserva resposta sanitizada',async()=>{
        providerStatus=429;
        const res=await handler(request({prompt:'Analise acidentes',context:context(),provider:'groq'}));
        assert(res.status===429 && (await res.json()).success===false,'Erro HTTP');providerStatus=200;
    });
    console.log(`${passed} cenários do handler completo passaram, com mocks sem rede.`);
} finally {
    globalThis.fetch=realFetch;
    for (const [key,value] of saved) {if(value===undefined) Deno.env.delete(key);else Deno.env.set(key,value);}
    delete g.__edgeServe;delete g.__edgeClient;
    await Deno.remove(generated);
}
