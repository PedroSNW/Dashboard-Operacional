import '../public/report-authored-core.js';
import {prepareProbeCases,runProbeCase,protocolAdmission,DEFAULT_PROBE_PROFILE} from './groq-v7-controlled-protocol.ts';
import {GROQ_AUTHORING_WIRE_SCHEMA,expandGroqAuthoring} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-wire.ts';
import {auditAuthoringSchema,authoredProviderFailure} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts';
import {fixture,authored,wireDocument} from './reports-v7-fixtures.mjs';
const C=(globalThis as any).ReportAuthoredCore,assert=(v:any,m:string)=>{if(!v)throw Error(m);};
const results:any[]=[],cases=await prepareProbeCases();let calls=0;
const documents:any={A:{title:'Panorama gerencial',summary:'Conferir as pendências descritas no recorte antes de decidir.'},B:{title:'Leitura gerencial',summary:'Há avanços com pendências a avaliar.',conclusions:['Conferir os registros antes de escolher a intervenção.'],relatedIndicators:['E0','E1']},C:wireDocument(authored(2))};
for(const kind of ['A','B','C']){
 const p=cases[kind],serialized=JSON.parse(p.body);assert(serialized.model==='openai/gpt-oss-120b'&&serialized.response_format.json_schema.strict===true&&p.summary.schemaHash===p.summary.serializedSchemaHash,'Strict/serialização');
 assert(p.summary.dataHash===cases.A.summary.dataHash&&serialized.messages[0].content===JSON.parse(cases.A.body).messages[0].content&&serialized.max_completion_tokens===2048&&serialized.reasoning_effort==='medium','Variáveis confundidas');
 const mock:typeof fetch=async(_url,init)=>{calls++;assert(init?.body===p.body,'Payload diferente do auditado');return Response.json({usage:{prompt_tokens:100,completion_tokens:150,total_tokens:250},choices:[{finish_reason:'stop',message:{content:JSON.stringify(documents[kind])}}]});};
 const result=await runProbeCase(p,'FAKE_KEY',mock);assert(result.outcome==='schema_valid'&&result.reportUsable===(kind==='C')&&result.productionPayloadValidated===(kind==='C')&&result.productionValidated===false&&result.executionMode==='mock','Resultado '+kind);if(kind==='C')assert(result.ninetyDayPlanComplete&&p.summary.matchesProductionPayload,'Payload C não corresponde à produção');results.push(result);
 console.log('PASS contrato '+kind+': schema/serialização, mesmo modelo/prompt/dados/orçamento, resposta simulada válida');
}
assert(calls===3,'Chamadas extras');
const audit=auditAuthoringSchema(GROQ_AUTHORING_WIRE_SCHEMA);assert(audit.valid&&audit.objects===4&&audit.maxObjectDepth===3&&audit.unions===0,'Contrato estrito com claim tipado');
const expanded=expandGroqAuthoring(documents.C),pack=C.evidence(fixture(2));assert(C.validate(expanded,pack).valid&&expanded.authoredReportVersion===1&&JSON.stringify(expanded.sections.filter((s:any)=>s.proposal).map((s:any)=>s.proposal.days))==='[30,60,90]','Editor/plano/evidências');
for(const mutate of [(wire:any)=>wire.sections[0].claims=[{ref:'E0.delta',relation:'increase'}],(wire:any)=>wire.sections[0].refs=['E999.latest'],(wire:any)=>wire.sections[0].text='Houve 999 acidentes.']){const wire=structuredClone(documents.C);mutate(wire);assert(!C.validate(expandGroqAuthoring(wire),pack).valid,'Validação factual removida');}
const bad=structuredClone(documents.C);bad.sections[0].claims=['not_a_structured_claim'];assert(C.checkSchema(bad,GROQ_AUTHORING_WIRE_SCHEMA).includes('$.sections.0.claims.0:objeto'),'Schema aceitou claim em texto');
console.log('PASS contrato completo: expansão sem inventar fatos, editor V7, planos30/60/90 e rejeição factual');
for(const kind of ['A','B','C']){
 const error=await runProbeCase(cases[kind],'FAKE_KEY',async()=>Response.json({error:{code:'json_validate_failed',type:'invalid_request_error',message:'Failed to validate JSON',failed_generation:'{"SECRET_CORPORATE":'}},{status:400}));assert(error.httpStatus===400&&error.detail.failedJson==='invalid'&&!JSON.stringify(error).includes('SECRET_CORPORATE'),'400 privado');
 const truncated=await runProbeCase(cases[kind],'FAKE_KEY',async()=>Response.json({choices:[{finish_reason:'length',message:{content:'{'}}]}));assert(truncated.outcome==='truncated'&&!truncated.reportUsable,'Truncamento');
}
const rate=await runProbeCase(cases.C,'FAKE_KEY',async()=>Response.json({error:{code:'rate_limit_exceeded',message:'limit'}},{status:429,headers:{'retry-after':'120'}}));assert(rate.detail.retryAfter===120&&!rate.reportUsable,'429');
const timeout=await runProbeCase(cases.C,'FAKE_KEY',async()=>{throw new DOMException('abort','AbortError');});assert(timeout.outcome==='timeout','Timeout');
for(const [failed,flag] of [['{"title":"PRIVATE_UNFINISHED','incompleteStructure'],['<think>PRIVATE_REASONING</think>{}','reasoningMarkers'],['```json\n{}\n```','fencedOutput']]){const detail=await authoredProviderFailure(Response.json({error:{code:'json_validate_failed',message:'Failed to validate JSON',failed_generation:failed}},{status:400}),GROQ_AUTHORING_WIRE_SCHEMA,C.checkSchema);assert((detail.failedStructure as any)?.[flag]===true&&!JSON.stringify(detail).includes('PRIVATE_'),'Sinal estrutural ou vazamento');}
const state:any={profile:DEFAULT_PROBE_PROFILE,attempts:[],notBefore:0};protocolAdmission(state,'A',DEFAULT_PROBE_PROFILE,0);state.attempts.push({kind:'A',result:{outcome:'schema_valid'}});state.notBefore=60000;
for(const [kind,time] of [['A',60000],['B',1],['C',60000]] as any[]){let blocked=false;try{protocolAdmission(state,kind,DEFAULT_PROBE_PROFILE,time);}catch{blocked=true;}assert(blocked,'Protocolo permitiu retry/concorrência/salto');}
protocolAdmission(state,'B',DEFAULT_PROBE_PROFILE,60000);state.attempts.push({kind:'B',result:{outcome:'provider_error'}});let blocked=false;try{protocolAdmission(state,'C',DEFAULT_PROBE_PROFILE,120000);}catch{blocked=true;}assert(blocked,'Protocolo continuou após falha');state.attempts[1].result.outcome='schema_valid';protocolAdmission(state,'C',DEFAULT_PROBE_PROFILE,120000);state.attempts.push({kind:'C',result:{outcome:'schema_valid'}});blocked=false;try{protocolAdmission(state,'C',DEFAULT_PROBE_PROFILE,180000);}catch{blocked=true;}assert(blocked,'Quarta chamada permitida');
console.log('PASS protocolo: uma chamada por etapa, máximo três, cooldown, parada após erro, sem retries');
const matrix=[];for(const volume of [1,15,40] as const)for(const prompt of ['neutral','production'] as const)for(const completion of [2048,3072] as const){const prepared=await prepareProbeCases({volume,prompt,completion});for(const kind of ['A','B','C']){assert(prepared[kind].summary.bytes<=6000&&prepared[kind].summary.reservedTokens<=8000,'Limites ampliados');matrix.push(prepared[kind].summary);}}
await Deno.writeTextFile('.validation-tools/groq-v7-controlled-tests.json',JSON.stringify({actualNetworkCalls:0,mockedBaselineCalls:calls,results,matrix,audit},null,2));
console.log('PASS matriz offline: 36 perfis A/B/C × volume × prompt × orçamento; nenhuma chamada real');
