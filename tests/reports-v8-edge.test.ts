import {fixture} from './reports-v7-fixtures.mjs';
const assert=(value:unknown,message:string)=>{if(!value)throw Error(message);};
const path=new URL('../supabase/functions/seguranca-viaria-groq-v2/index.ts',import.meta.url);
const temporary=new URL('../.validation-tools/v8-handler.fixture.ts',import.meta.url);
const source=(await Deno.readTextFile(path))
    .replace(/^import \{ createClient \} from .*;$/m,'const createClient = (globalThis as any).__mockV8Client;')
    .replace('Deno.serve(handle);','')
    .replace(/from "([.][^"]+)"/g,(_,specifier)=>'from '+JSON.stringify(new URL(specifier,path).href));
const sample=fixture(4);
const stored={mesesLabels:sample.competencias,indicadores:sample.indicators.map((i:any)=>({
    id:i.id,indicador:i.indicador,setor:i.setor,und:i.unidade,meta:i.meta,direcaoDesempenho:i.direcaoDesempenho,valores:i.valores
}))};
const undoEnv=new Map<string,string|undefined>();
for(const [key,value] of Object.entries({SUPABASE_URL:'https://mock.invalid',SUPABASE_ANON_KEY:'anon',GROQ_API_KEY:'PRIVATE_GROQ',DASHBOARD_ALLOWED_ORIGINS:'https://dashboard.test',REPORT_V8_RESPONSE_MODE:'strict'})){
    undoEnv.set(key,Deno.env.get(key));Deno.env.set(key,value);
}
const previousFetch=fetch;
let calls=0,access='allowed',updatedAt=sample.snapshotUpdatedAt;
(globalThis as any).__mockV8Client=(_url:any,key:string,options:any)=>{
    assert(key==='anon'&&options.global.headers.Authorization==='Bearer fake-jwt','RLS sem token do usuário');
    const query={select:(columns:string)=>{assert(columns==='data,updated_at','Colunas');return query;},
        eq:(column:string,id:number)=>{assert(column==='id'&&id===1,'Linha');return query;},
        single:()=>access==='rls'?{data:null,error:{}}:{data:{data:stored,updated_at:updatedAt},error:null}};
    return {auth:{getUser:()=>({data:{user:access==='jwt'?null:{id:'user',email:access==='external'?'outro@example.org':'gestor@dgranel.com.br',email_confirmed_at:'confirmed'}},error:null})},
        from:(name:string)=>{assert(name==='dashboard_state','Tabela inesperada');return query;}};
};
globalThis.fetch=async(input,init)=>{
    calls++;
    assert(input==='https://api.groq.com/openai/v1/chat/completions','Roteamento');
    const body=JSON.parse(String(init?.body));
    const evidence=JSON.parse(body.messages[1].content).evidence;
    assert(evidence.some((item:any)=>item.latest?.value===12)&&body.response_format.json_schema.strict,'Valores não vieram do snapshot');
    return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({summary:'Panorama gerencial.',findings:[{
        title:'Acompanhamento',text:'Investigar possíveis fatores operacionais.',evidenceKeys:[evidence[0].key]
    }],actions:[],conclusion:'Conferir a qualidade dos registros.',limitations:[]})}}]});
};
try{
    await Deno.writeTextFile(temporary,source);
    const {handle}=await import(temporary.href);
    const invoke=(body:any,origin='https://dashboard.test')=>handle(new Request('https://edge.test',{
        method:'POST',headers:{Origin:origin,Authorization:'Bearer fake-jwt','Content-Type':'application/json'},body:JSON.stringify(body)
    }));
    const preview={action:'preview',selection:{type:'comparativo',sector:'TODOS',ids:['id-0','id-1'],start:'Jan',end:'Mar'}};
    assert((await invoke(preview,'https://other.test')).status===403,'CORS');
    for(const [accessMode,status] of [['jwt',401],['external',403],['rls',403]] as const){
        access=accessMode;
        assert((await invoke(preview)).status===status,'Autorização '+access);
    }
    access='allowed';
    assert((await invoke({...preview,values:[999]})).status===400,'Valores do navegador aceitos');
    assert((await invoke({...preview,selection:{...preview.selection,ids:['foreign']}})).status===422,'Seleção externa');
    const base=await (await invoke(preview)).json();
    assert(base.success&&calls===0,'Prévia consumiu Groq');
    const scoped={selection:preview.selection,expectedUpdatedAt:updatedAt,expectedReportBasis:base.report.basis};
    assert((await invoke({...scoped,action:'generate',expectedReportBasis:'wrong'})).status===409&&calls===0,'Base divergente');
    const result=await (await invoke({...scoped,action:'generate'})).json();
    assert(result.success&&result.authoredReportVersion===8&&result.validation.reviewRequired&&calls===1,'Geração');
    const review={...scoped,action:'review',document:result.document,reviewAcknowledged:true};
    assert((await invoke({...review,reviewAcknowledged:false})).status===422,'Conferência não exigida');
    const valid=await (await invoke(review)).json();
    assert(valid.success&&calls===1,'Revisão consumiu Groq');
    Deno.env.set('REPORT_V8_RESPONSE_MODE','json_object');
    assert((await invoke(review)).status===409&&calls===1,'Mudança de modo reaproveitou escopo antigo');
    Deno.env.set('REPORT_V8_RESPONSE_MODE','strict');
    const changed=structuredClone(result.document);
    changed.sections[0].text='Houve 99 acidentes.';
    assert((await invoke({...review,document:changed})).status===422,'Revisão exportável com número inventado');
    updatedAt='2026-11-19T16:00:00Z';
    assert((await invoke(review)).status===409&&calls===1,'Revisão de snapshot antigo');
    console.log('PASS V8 Edge, autenticação, domínio, CORS, RLS, prévia, recorte, geração e verificação de snapshot');
}finally{
    globalThis.fetch=previousFetch;
    delete (globalThis as any).__mockV8Client;
    for(const [key,value] of undoEnv){if(value===undefined)Deno.env.delete(key);else Deno.env.set(key,value);}
    await Deno.remove(temporary);
}
