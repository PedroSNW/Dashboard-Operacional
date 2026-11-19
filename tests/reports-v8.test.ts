import {buildRequest, createEngine, MODEL, SCHEMA, parseWire, present, verify, ReportError} from '../supabase/functions/seguranca-viaria-groq-v2/engine.ts';
import {fixture} from './reports-v7-fixtures.mjs';

const C=(globalThis as any).ReportV8Core;
const assert=(valid:unknown,message:string)=>{if(!valid)throw Error(message);};
const report=fixture(8);
const request=buildRequest(report);
const wire={
    summary:'O acompanhamento orienta a priorização preventiva.',
    findings:[{title:'Leitura do período',text:'A evolução descritiva sugere acompanhar a continuidade dos registros.',evidenceKeys:[request.selected[0]]}],
    actions:['Revisar a rotina de registros','Preparar campanha educativa','Avaliar continuidade da campanha'].map(title=>({
        title,text:'Avaliar medidas para reduzir acidentes e conferir a qualidade dos registros.',evidenceKeys:[request.selected[0]]
    })),
    conclusion:'A gestão pode definir as prioridades após conferir as evidências.',
    limitations:['A comparação é descritiva e não demonstra relação causal.']
};
const env=(key:string)=>key==='GROQ_API_KEY'?'mock-key':undefined;
const response=(value:any,finish='stop')=>Response.json({choices:[{finish_reason:finish,message:{content:JSON.stringify(value)}}],
    usage:{prompt_tokens:1000,completion_tokens:1500,total_tokens:2500}});
const reject=async(fn:()=>any,code:string)=>{
    try{await fn();}catch(error){assert(error instanceof ReportError&&error.code===code,'Esperado '+code);return error as ReportError;}
    throw Error('Falha não detectada: '+code);
};
const source=JSON.stringify(report);
const checkSchema=(schema:any)=>{
    assert(!('enum' in schema),'O contrato Groq não usa enum');
    if(schema.type==='array')checkSchema(schema.items);
    if(schema.type==='object'){
        assert(schema.additionalProperties===false&&JSON.stringify(schema.required)===JSON.stringify(Object.keys(schema.properties)),'Objeto aberto');
        Object.values(schema.properties).forEach(checkSchema);
    }
};
checkSchema(SCHEMA);
const serialized=JSON.parse(request.build(4096));
assert(serialized.model===MODEL&&serialized.reasoning_effort==='medium'&&serialized.max_completion_tokens===4096&&serialized.response_format.json_schema.strict===true,'Contrato serializado');
const providerKeys=JSON.parse(serialized.messages[1].content).evidence.map((item:any)=>item.key);
assert(JSON.stringify(providerKeys)===JSON.stringify(request.selected)&&request.selected.every(key=>Object.hasOwn(request.pack.facts,key)),'Registro divergente');
const reordered={...report,indicators:[...report.indicators].reverse()};
assert(JSON.stringify(buildRequest(reordered).selected)===JSON.stringify(request.selected),'Seleção dependente de posição');
const absent=C.evidence(report).items.find((i:any)=>i.id==='id-7');
assert(absent.target===0&&absent.latest.value===0&&absent.change===null,'Zero ou lacuna alterados');
const gap=fixture(1);
gap.intelligence.dimensions[0].recent={competencia:'Mar',valor:null};
gap.intelligence.dimensions[0].last={competencia:'Fev',valor:15};
const gapFact=C.evidence(gap).items[0];
assert(gapFact.latest.value===null&&gapFact.lastValid.value===15&&gapFact.lastValid.competency==='Fev','Último válido preencheu a lacuna');
const financial=C.evidence(report).items.find((i:any)=>i.id==='id-2');
assert(financial.measurement.neutral&&financial.measurement.canSum===false,'Saldo somável');
assert(JSON.stringify(report)===source,'Base determinística alterada');
const legacy=fixture(2);
legacy.indicators.forEach((i:any,n:number)=>i.id='indice:'+n);
const legacyKey=C.evidence(legacy).items[0].key;
const reversed={...legacy,indicators:[...legacy.indicators].reverse()};
reversed.indicators.forEach((i:any,n:number)=>i.id='indice:'+n);
assert(legacyKey===C.evidence(reversed).items[1].key,'Fallback legacy depende da posição');
reversed.indicators[0].indicador=reversed.indicators[1].indicador;
assert(C.evidence(reversed).items.length===0,'Identidade ambígua autorizada');
const management={...fixture(1),managementContext:{shareWithAI:false,observations:'Contexto sintético reservado'}};
assert(!buildRequest(management).build(5120).includes('Contexto sintético reservado'),'Sem consentimento');
management.managementContext.shareWithAI=true;
assert(buildRequest(management).build(5120).includes('Contexto sintético reservado'),'Contexto autorizado');
management.managementContext.observations='Contato: pessoa@example.test';
await reject(()=>buildRequest(management),'invalid_management_context');
const originalLog=console.info, logs:string[]=[];
console.info=(...values)=>logs.push(JSON.stringify(values));
try{
    let calls=0, captured:any;
    const generate=createEngine(env,async(_url,init)=>{
        calls++; captured=JSON.parse(String(init?.body));
        return response(wire);
    });
    const result=await generate(report,'test');
    assert(calls===1&&result.validation?.reviewRequired&&result.document?.sections.filter((s:any)=>s.days).map((s:any)=>s.days).join(',')==='30,60,90','Autoria ou horizonte');
    assert(result.meta!.effectiveCompletionLimit===captured.max_completion_tokens&&result.meta!.effectiveCompletionLimit>=3072&&result.meta!.effectiveCompletionLimit+result.meta!.estimatedPromptTokens+800<=8000,'Orçamento no transporte');
    const doc=structuredClone(result.document!);
    doc.sections[0].text='Os registros melhoraram.';
    assert(verify(doc,request.pack).issues.some((issue:any)=>issue.codes.includes('verificar_interpretacao')),'Edição factual não sinalizada');
    doc.sections[0].text='Houve 99 acidentes.';
    await reject(()=>verify(doc,request.pack),'review_required');
    doc.sections[0].text='A campanha causou a melhora.';
    await reject(()=>verify(doc,request.pack),'review_required');
    const invalid=structuredClone(wire);
    invalid.findings[0].evidenceKeys=['not-authorized'];
    await reject(()=>verify(present(invalid),request.pack),'invalid_evidence');
    const omitted=C.evidence(fixture(40)).items.find((i:any)=>!buildRequest(fixture(40)).selected.includes(i.key));
    const large=buildRequest(fixture(40));
    invalid.findings[0].evidenceKeys=[omitted.key];
    await reject(()=>verify(present(invalid),large.pack),'invalid_evidence');
    await reject(()=>parseWire({...wire,type:'PRIVATE_DATA'}),'invalid_schema');
    await reject(()=>parseWire({...wire,findings:[],actions:[]}),'empty_analysis');
    await reject(()=>createEngine(env,async()=>response(wire,'length'))(report,'test'),'incomplete_response');
    await reject(()=>createEngine(env,async()=>Response.json({choices:[{finish_reason:'stop',message:{content:'{'}}]}))(report,'test'),'invalid_json');
    await reject(()=>createEngine(env,async()=>{throw new DOMException('Aborted','AbortError');})(report,'test'),'timeout');
    await reject(()=>createEngine(env,async()=>response({...wire,findings:[{title:'a'}]}))(report,'test'),'invalid_schema');
    let rateCalls=0;
    const rate=createEngine(env,async()=>{rateCalls++;return Response.json({error:'PRIVATE_DATA'},{status:429,headers:{'Retry-After':'23'}});});
    assert((await reject(()=>rate(report,'test'),'provider_rate_limit')).retryAfter===23,'Retry-After');
    await reject(()=>rate(report,'test'),'provider_cooldown');
    assert(rateCalls===1,'Retry automático');
    let badCalls=0;
    await reject(()=>createEngine(env,async()=>{badCalls++;return Response.json({error:'PRIVATE_DATA'},{status:400});})(report,'test'),'provider_400');
    assert(badCalls===1,'Retry 400');
    await reject(()=>createEngine(key=>key==='REPORT_V8_OUTPUT_TPM'?'1800':env(key),async()=>{throw Error('Orçamento admitiu chamada');})(report,'test'),'insufficient_budget');
    await reject(()=>createEngine(key=>key==='REPORT_V8_INPUT_TPM'?'900':env(key),async()=>{throw Error('Orçamento admitiu chamada');})(report,'test'),'insufficient_budget');
    let remoteCalls=0;
    const remote=createEngine(env,async()=>{
        remoteCalls++;
        return new Response(response(wire).body,{headers:{'x-ratelimit-remaining-tokens':'2000','x-ratelimit-reset-tokens':'30s'}});
    });
    await remote(report,'test');
    await reject(()=>remote(report,'test'),'insufficient_budget');
    assert(remoteCalls===1,'Saldo informado pela Groq ignorado');
    let release!:()=>void;
    const blocked=new Promise<void>(resolve=>release=resolve);
    const concurrent=createEngine(env,async()=>{await blocked;return response(wire);});
    const ongoing=concurrent(report,'test');
    await reject(()=>concurrent(report,'test'),'concurrent_request');
    release();await ongoing;
    const probe=await createEngine(env,async(_url,init)=>{
        const body=JSON.parse(String(init?.body));
        assert(body.response_format.json_schema.strict===true&&body.response_format.json_schema.name==='dgranel_v8_probe'&&!JSON.stringify(body).includes('Acidentes com culpa'),'Sonda não isolada');
        return response({summary:'Compare tendências descritivas.'});
    })(null,'test',true);
    assert(probe.probe===true,'Sonda');
    const objectMode=createEngine(key=>key==='REPORT_V8_RESPONSE_MODE'?'json_object':env(key),async(_url,init)=>{
        assert(JSON.parse(String(init?.body)).response_format.type==='json_object','Modo alternativo não explícito');
        return response({...wire,extra:true});
    });
    await reject(()=>objectMode(report,'test'),'invalid_schema');
    assert(!logs.join('').includes('PRIVATE_DATA')&&!logs.join('').includes('mock-key')&&!logs.join('').includes(wire.summary),'Log sensível');
}finally{console.info=originalLog;}
assert(await Deno.readTextFile('public/report-v8-core.js')===await Deno.readTextFile('supabase/functions/seguranca-viaria-groq-v2/report-v8-core.js'),'Espelho divergente');
console.log('PASS V8 motor, schema estrito, sonda, evidências estáveis, revisão, falhas, cota e concorrência');
