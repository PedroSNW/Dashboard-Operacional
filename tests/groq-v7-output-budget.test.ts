import {authorConfig,authorPayload,generateAuthoredReport,prepareAuthoringDiagnostic,planAuthoringBudget,AuthoringError} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {authoredProviderFailure} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts';
import {createGroqGuard} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {checkReadiness,runOneDynamic} from './groq-v7-homologation-dynamic.ts';
import {fixture,authored,wireDocument} from './reports-v7-fixtures.mjs';
const C=(globalThis as any).ReportAuthoredCore,r=fixture(2),assert=(v:any,m:string)=>{if(!v)throw Error(m);};
const env=(values:Record<string,string>={})=>(key:string)=>values[key]??(key==='GROQ_API_KEY'?'SECRET_KEY':undefined);
const usage=(completion=3000)=>({prompt_tokens:1583,completion_tokens:completion,total_tokens:1583+completion,completion_tokens_details:{reasoning_tokens:600}});
const success=(finish='stop',completion=3000)=>Response.json({usage:usage(completion),choices:[{finish_reason:finish,message:{content:JSON.stringify(wireDocument(authored(2)))}}]});
const logs:string[]=[],saved=console.info;console.info=(...args)=>logs.push(JSON.stringify(args));const results:any[]=[],measurements:any[]=[];
async function test(name:string,fn:()=>any){await fn();results.push({name,status:'passed'});console.log('PASS',name);}
async function fails(fn:()=>any,status?:number){try{await fn();}catch(error){if(status)assert(error instanceof AuthoringError&&error.status===status,'Status '+status);return error as AuthoringError;}throw Error('Falha esperada');}
const built=(values:Record<string,string>={})=>authorPayload(r,'groq','openai/gpt-oss-120b',authorConfig(env(values)));
const project='abcdefghijklmnopqrst',url=`https://${project}.supabase.co/functions/v1/seguranca-viaria-ia`,limits={tpm:8000,inputTpm:null,outputTpm:null,noSeparateLimits:true},options={url,project,jwt:'PRIVATE_JWT',anonKey:'PRIVATE_ANON',selection:{ids:['id-0','id-1']},limits};
const ready=():any=>prepareAuthoringDiagnostic(r,env());
try{
 await test('configuração ausente usa5120/margem800; provedores legados preservados',()=>{
  const cfg=authorConfig(()=>undefined);assert(cfg.completion===5120&&cfg.margin===800&&cfg.completionSource==='default_5120','Padrão');
  for(const provider of ['openai','gemini'])assert(authorConfig(()=>undefined,provider).completion===2048,'Legado');
 });
 await test('configuração inválida/2048 bloqueia503 sem fallback silencioso nem chamada',async()=>{
  for(const value of ['2048','3072','8192','abc','',' 5120','5.12e3']){let calls=0;const e=await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env({REPORT_V7_COMPLETION_TOKENS:value}),async()=>{calls++;return success();}),503);assert(calls===0&&e.diagnostic.origin==='local_configuration'&&e.message.includes('REPORT_V7_COMPLETION_TOKENS'),'Fallback');}
  for(const [key,value] of [['REPORT_V7_TOKEN_MARGIN','0'],['REPORT_V7_MAX_BYTES','999999'],['REPORT_V7_INPUT_TOKENS','0'],['REPORT_V7_GROQ_OUTPUT_TPM','bad']])await fails(()=>authorConfig(env({[key]:value})),503);
 });
 await test('limite calculado=wire=diagnóstico; schema/prompt/medium/strict e snapshot preservados',async()=>{
  for(const n of [1,2,15,40,75]){const source=fixture(n),before=JSON.stringify(source),draft=authorPayload(source,'groq','openai/gpt-oss-120b',authorConfig(env())),plan=planAuthoringBudget(draft,createGroqGuard());let sent:any;
   const result=await generateAuthoredReport(source,'groq',createGroqGuard(),env(),async(_url,init)=>{sent=JSON.parse(String(init?.body));return Response.json({usage:usage(),choices:[{finish_reason:'stop',message:{content:JSON.stringify(wireDocument(authored(n)))}}]});});
   assert(sent.max_completion_tokens===plan.effectiveCompletionLimit&&result.meta.maxCompletionTokens===sent.max_completion_tokens&&result.meta.effectiveCompletionLimit===sent.max_completion_tokens,'Wire/meta');
   const compare=structuredClone(sent);compare.max_completion_tokens=5120;assert(JSON.stringify(compare)===draft.body,'Prompt/schema');assert(sent.response_format.json_schema.strict&&sent.reasoning_effort==='medium'&&sent.include_reasoning===false,'Proteções');
   assert(plan.estimatedReservedTotal<=8000&&plan.effectiveCompletionLimit>=4096&&JSON.stringify(source)===before&&C.validate(result.document,result.evidence).valid,'Reserva/fatos');measurements.push({selected:n,bytes:draft.bytes,sent:draft.coverage.sent,...plan});
  }
 });
 await test('5120 integral quando cabe; margem configurável sem alterar padrão800',async()=>{
  let sent=0;const source=fixture(1),result=await generateAuthoredReport(source,'groq',createGroqGuard(),env({REPORT_V7_TOKEN_MARGIN:'400'}),async(_url,init)=>{sent=JSON.parse(String(init?.body)).max_completion_tokens;return Response.json({usage:usage(),choices:[{finish_reason:'stop',message:{content:JSON.stringify(wireDocument(authored(1)))}}]});});assert(sent===5120&&result.meta.effectiveCompletionLimit===5120&&result.meta.budgetAdjustmentReason==='none','5120 descartado');
 });
 await test('consumo real conciliado+800; raciocínio não duplicado; JSON insuficiente bloqueia',async()=>{
  const guard=createGroqGuard();await generateAuthoredReport(r,'groq',guard,env(),async()=>success());assert(guard.budget().availableTokenBudget===8000-(4583+800),'Uso+800');let calls=0;
  const e=await fails(()=>generateAuthoredReport(r,'groq',guard,env(),async()=>{calls++;return success();}),429);assert(calls===0&&e.diagnostic.code==='insufficient_json_budget'&&e.diagnostic.completion?.effectiveCompletionLimit===null,'Janela');
 });
 await test('reserva exclusiva entre chamadas concorrentes',async()=>{
  const guard=createGroqGuard();let release:any,started:any,calls=0;const hold=new Promise(resolve=>release=resolve),start=new Promise(resolve=>started=resolve);
  const first=generateAuthoredReport(r,'groq',guard,env(),async()=>{calls++;started();await hold;return success();});await start;const e=await fails(()=>generateAuthoredReport(r,'groq',guard,env(),async()=>{calls++;return success();}),429);assert(e.diagnostic.code==='concurrent_request'&&calls===1,'Concorrência');release();await first;
 });
 await test('limites ITPM/OTPM e headers restringem plano e reserva',async()=>{
  const split={REPORT_V7_GROQ_INPUT_TPM:'4000',REPORT_V7_GROQ_OUTPUT_TPM:'5000'},guard=createGroqGuard(),plan=planAuthoringBudget(built(split),guard);assert(plan.effectiveCompletionLimit===4200&&plan.budgetAdjustmentReason==='provider_output_budget','OTPM');
  const ticket=guard.reserve(plan.estimatedReservedTotal,{margin:800,inputTokens:plan.estimatedPromptTokens,outputTokens:4200,inputTpm:4000,outputTpm:5000});assert(ticket.allowed,'Reserva');guard.finish(ticket.ticket,{promptTokens:100,completionTokens:200,totalTokens:300,reasoningTokens:null});assert(guard.budget({inputTpm:4000,outputTpm:5000}).availableOutputTokenBudget===4800,'Consumo separado');
  let calls=0;await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env({...split,REPORT_V7_GROQ_INPUT_TPM:'2000'}),async()=>{calls++;return success();}),429);assert(calls===0,'ITPM');const remote=createGroqGuard();remote.observe(new Headers({'x-ratelimit-limit-tokens':'7000','x-ratelimit-remaining-tokens':'6000','x-ratelimit-reset-tokens':'1m'}));assert(!planAuthoringBudget(built(),remote).canGenerate,'Header');
 });
 await test('400 mantém status/uso; diagnóstico.limit é wire, não consumo; sem retry',async()=>{
  let sent=0,calls=0;const e=await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env(),async(_url,init)=>{calls++;sent=JSON.parse(String(init?.body)).max_completion_tokens;return Response.json({usage:usage(2048),error:{code:'json_validate_failed',type:'invalid_request_error',failed_generation:'{"PRIVATE_CORPORATE":"secret"',message:'PRIVATE_MESSAGE'}},{status:400});}),400);
  assert(calls===1&&e.diagnostic.completion?.limit===sent&&e.diagnostic.completion?.effectiveCompletionLimit===sent&&e.diagnostic.completion?.configuredCompletionLimit===5120&&e.diagnostic.completion?.completionTokens===2048,'Limite/consumo');const nested=await authoredProviderFailure(Response.json({error:{code:'invalid_schema',message:'Invalid schema',usage:usage(2048)}},{status:400}),{},()=>[]);assert(nested.usage.completionTokens===2048&&!nested.preGenerationRejection,'Uso aninhado');
 });
 await test('429 Retry-After e timeout mantêm reserva, sem retry',async()=>{
  let calls=0;const guard=createGroqGuard(),e=await fails(()=>generateAuthoredReport(r,'groq',guard,env(),async()=>{calls++;return Response.json({error:{code:'rate_limit_exceeded'}},{status:429,headers:{'retry-after':'61'}});}),429);assert(e.retryAfter===61&&calls===1&&guard.budget().reason==='provider_cooldown','429');const timed=createGroqGuard(),t=await fails(()=>generateAuthoredReport(r,'groq',timed,env(),async()=>{throw new DOMException('PRIVATE_TRANSPORT','AbortError');}),504);assert(t.diagnostic.completion?.limit===ready().effectiveCompletionLimit&&timed.budget().availableTokenBudget===0,'Timeout');
 });
 await test('length/JSON inválido bloqueiam aplicação e preservam base/fallback',async()=>{
  const before=JSON.stringify(r),e=await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env(),async()=>success('length',4931)),502);assert(e.diagnostic.completion?.truncationEvidence==='provider_reported_length','Length');await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env(),async()=>Response.json({choices:[{finish_reason:'stop',message:{content:'{'}}]})),502);assert(JSON.stringify(r)===before,'Base');
 });
 await test('preflight sem consumo; expectativa não sobrescreve orçamento',async()=>{
  const guard=createGroqGuard(),before=guard.budget().availableTokenBudget,d:any=prepareAuthoringDiagnostic(r,env(),guard);assert(d.configuredCompletionLimit===5120&&d.maxCompletionTokens===d.effectiveCompletionLimit&&guard.budget().availableTokenBudget===before,'Preflight');let calls=0;await fails(()=>generateAuthoredReport(r,'groq',guard,env(),async()=>{calls++;return success();},'',5120),409);assert(calls===0&&guard.budget().availableTokenBudget===before,'Expectativa');const bad=prepareAuthoringDiagnostic(r,env({REPORT_V7_COMPLETION_TOKENS:'2048'}));assert(!bad.available&&bad.reason==='invalid_authoring_configuration','Configuração');
 });
 const preview=()=>Response.json({success:true,report:r,authoringDiagnostics:ready()}),authorResponse=(extra:any={})=>Response.json({success:true,document:authored(2),validation:{issues:[]},reportBasis:r.basis,snapshotUpdatedAt:r.snapshotUpdatedAt,meta:{...ready(),model:'openai/gpt-oss-120b',maxCompletionTokens:ready().effectiveCompletionLimit,finishReason:'stop',providerCall:true,cacheHit:false,...extra}});
 await test('roteiro: prévia autenticada+uma geração; tentativa gravada antes da chamada',async()=>{
  let calls=0,marked=0;const result=await runOneDynamic(options,async(_url,init)=>{calls++;if(calls===1)return preview();assert(marked===1&&JSON.parse(String(init?.body)).expectedCompletionTokens===ready().effectiveCompletionLimit,'Asserção');return authorResponse();},async()=>{marked++;});assert(result.validated&&calls===2&&marked===1,'Uma geração');checkReadiness(ready(),limits);
 });
 await test('roteiro rejeita revisão antiga,2048,cache,400/429/timeout sem retries',async()=>{
  for(const d of [{...ready(),deploymentRevision:'old'},{...ready(),configuredCompletionLimit:2048},{...ready(),effectiveCompletionLimit:2048}])await fails(()=>checkReadiness(d,limits));for(const outcome of ['400','429','timeout','cache']){let calls=0;const result=await runOneDynamic(options,async()=>{calls++;if(calls===1)return preview();if(outcome==='timeout')throw Error('PRIVATE_TRANSPORT');if(outcome==='cache')return authorResponse({providerCall:false,cacheHit:true});return Response.json({success:false,completionDiagnostics:{finishReason:'PRIVATE_TEXT'}},{status:Number(outcome)});},async()=>{});assert(!result.validated&&calls===2&&!JSON.stringify(result).includes('PRIVATE'),'Retry/vazamento');}
 });
 await test('logs sem dados corporativos, prompts ou credenciais; métricas disponíveis',()=>{
  for(const secret of ['SECRET_KEY','PRIVATE_CORPORATE','PRIVATE_MESSAGE','PRIVATE_JWT','PRIVATE_ANON','Acidentes com culpa'])assert(!logs.join('').includes(secret),'Vazamento');assert(logs.some(line=>line.includes('"configuredCompletionLimit":5120')&&line.includes('"tokenMargin":800')&&line.includes('"deploymentRevision"')),'Métricas');
 });
 await Deno.writeTextFile('.validation-tools/groq-v7-dynamic-results.json',JSON.stringify({passed:results.length,results,measurements,realCalls:0},null,2));
}finally{console.info=saved;}
