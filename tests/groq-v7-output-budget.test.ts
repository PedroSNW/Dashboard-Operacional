import {authorConfig,authorPayload,generateAuthoredReport,prepareAuthoringDiagnostic,AuthoringError} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {completionEvidence,authoredProviderFailure,GROQ_AUTHORING_REVISION} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts';
import {createGroqGuard} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {checkReadiness4096,checkHomologationUrl,runOne4096} from './groq-v7-homologation-4096.ts';
import {fixture,authored,wireDocument} from './reports-v7-fixtures.mjs';
const C=(globalThis as any).ReportAuthoredCore,r=fixture(2),assert=(v:any,m:string)=>{if(!v)throw Error(m);};
const env=(value='4096')=>(key:string)=>key==='REPORT_V7_COMPLETION_TOKENS'?value:key==='GROQ_API_KEY'?'SECRET_KEY':undefined;
const usage=(completion=3000)=>({prompt_tokens:1589,completion_tokens:completion,total_tokens:1589+completion,completion_tokens_details:{reasoning_tokens:600}});
const success=(finish='stop',completion=3000)=>Response.json({usage:usage(completion),choices:[{finish_reason:finish,message:{content:JSON.stringify(wireDocument(authored(2)))}}]});
const logs:string[]=[],saved=console.info;console.info=(...args)=>logs.push(JSON.stringify(args));const results:any[]=[];
async function test(name:string,fn:()=>any){await fn();results.push({name,status:'passed'});console.log('PASS',name);}
async function fails(fn:()=>any,status?:number){try{await fn();}catch(error){if(status)assert(error instanceof AuthoringError&&error.status===status,'Status '+status);return error as AuthoringError;}throw Error('Falha esperada');}
const limits={tpm:8000,outputTpm:4096,noSeparateOutputLimit:false};
const project='abcdefghijklmnopqrst',url=`https://${project}.supabase.co/functions/v1/seguranca-viaria-ia`,options={url,project,jwt:'PRIVATE_JWT',anonKey:'PRIVATE_ANON',selection:{ids:['id-0','id-1']},limits};
const readiness=()=>prepareAuthoringDiagnostic(r,env());
try{
 await test('padrão 2048 preservado; 4096 explícito somente Groq; valores fora do teto não ampliam cotas',()=>{
  assert(authorConfig(()=>undefined).completion===2048,'Padrão');
  for(const value of ['2048','3072','4096'])assert(authorConfig(env(value)).completion===Number(value),'Override '+value);
  for(const value of ['4097','8192','0','NaN'])assert(authorConfig(env(value)).completion===2048,'Limite inválido');
  for(const provider of ['openai','gemini'])assert(authorConfig(env(),provider).completion===2048&&authorConfig(env('3072'),provider).completion===3072,'Outro provedor');
 });
 await test('corpo serializado difere exclusivamente no limite; strict/schema/prompts/bytes preservados',()=>{
  for(const n of [2,15,40,75]){const source=fixture(n),before=JSON.stringify(source),a=authorPayload(source,'groq','openai/gpt-oss-120b',authorConfig(env('2048'))),b=authorPayload(source,'groq','openai/gpt-oss-120b',authorConfig(env()));
   const pa=JSON.parse(a.body),pb=JSON.parse(b.body);assert(pb.max_completion_tokens===4096,'Wire');pb.max_completion_tokens=2048;assert(JSON.stringify(pa)===JSON.stringify(pb),'Outro parâmetro mudou');assert(b.payload.response_format!.json_schema!.strict===true&&b.payload.reasoning_effort==='medium','Strict/medium');assert(a.bytes===b.bytes&&b.bytes<=6000&&b.estimatedTokens+4096+400<=8000,'Orçamento');assert(JSON.stringify(source)===before,'Mutação');results.push({indicators:n,bytes:b.bytes,estimatedInput:b.estimatedTokens,reserved:b.estimatedTokens+4496,sent:b.coverage.sent});}
 });
 await test('gerador usa configuração injetada4096 e reconcilia tokens sem duplicar raciocínio',async()=>{
  let calls=0;const result=await generateAuthoredReport(r,'groq',createGroqGuard(),env(),async(_url,init)=>{calls++;assert(JSON.parse(String(init?.body)).max_completion_tokens===4096,'Payload efetivo');return success();},'',4096);
  assert(calls===1&&result.meta.completionTokens===3000&&result.meta.reasoningTokens===600&&result.meta.totalTokens===4589&&result.meta.finishReason==='stop'&&C.validate(result.document,result.evidence).valid,'Resultado');
 });
 await test('expectativa do operador não sobrescreve ambiente nem chama API em divergência',async()=>{
  let calls=0;const transport:typeof fetch=async()=>{calls++;return success();};
  await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env('2048'),transport,'',4096),409);
  await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env(),transport,'','4096'),400);
  assert(calls===0,'Chamada indevida');
 });
 await test('400 em2048 com JSON incompleto preserva uso e evidencia suspeita sem afirmar causa',async()=>{
  let calls=0;const error=await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env('2048'),async()=>{calls++;return Response.json({usage:usage(2048),error:{code:'json_validate_failed',type:'invalid_request_error',failed_generation:'{"PRIVATE_CORPORATE":"secret"',message:'PRIVATE_MESSAGE'}},{status:400});}),400);
  assert(calls===1&&error.diagnostic.completion?.completionTokens===2048&&error.diagnostic.completion?.finishReason==='unknown'&&error.diagnostic.completion?.truncationEvidence==='cap_and_incomplete_json','Diagnóstico');
  assert(completionEvidence(2048,{promptTokens:null,completionTokens:2048,reasoningTokens:null,totalTokens:null},'unknown').truncationEvidence==='cap_reached_unproven_cause','Hipótese');
  const nested=await authoredProviderFailure(Response.json({error:{code:'invalid_schema',message:'Invalid schema',usage:usage(2048)}},{status:400}),{},()=>[]);
  assert(nested.usage.completionTokens===2048&&nested.usageSource==='error_usage'&&!nested.preGenerationRejection,'Uso aninhado não pode liberar reserva');
 });
 await test('finish_reason length bloqueia aplicação; stop2045 válido não comprova truncamento',async()=>{
  const error=await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env(),async()=>success('length',4096)),502);
  assert(error.diagnostic.completion?.truncationEvidence==='provider_reported_length','Length');
  const ok=await generateAuthoredReport(r,'groq',createGroqGuard(),env('2048'),async()=>success('stop',2045));assert(ok.meta.finishReason==='stop'&&ok.meta.truncationEvidence==='not_confirmed','Stop');
 });
 await test('429 Retry-After, timeout, orçamento e ausência de retries mantidos',async()=>{
  let calls=0;const error=await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env(),async()=>{calls++;return Response.json({error:{code:'rate_limit_exceeded'}},{status:429,headers:{'retry-after':'61'}});}),429);assert(error.retryAfter===61&&calls===1,'429');
  await fails(()=>generateAuthoredReport(r,'groq',createGroqGuard(),env(),async()=>{throw new DOMException('private','AbortError');}),504);
  const guard=createGroqGuard();await generateAuthoredReport(r,'groq',guard,env(),async()=>success());let duplicate=0;await fails(()=>generateAuthoredReport(r,'groq',guard,env(),async()=>{duplicate++;return success();}),429);assert(duplicate===0,'Reserva ignorada');
 });
 await test('preflight4096 seguro e atestação de limite separado obrigatória',async()=>{
  const ready=readiness();checkReadiness4096(ready,limits);assert(ready.available&&ready.maxCompletionTokens===4096&&ready.completionSource==='environment','Preflight');
  for(const bad of [{...ready,maxCompletionTokens:2048},{...ready,reservedTokens:8001},{...ready,strict:false},{...ready,revision:'old'}])await fails(()=>checkReadiness4096(bad,limits));
  await fails(()=>checkReadiness4096(ready,{...limits,outputTpm:2048}));await fails(()=>checkReadiness4096(ready,{...limits,outputTpm:null}));checkReadiness4096(ready,{...limits,outputTpm:null,noSeparateOutputLimit:true});
  await fails(()=>checkHomologationUrl(url,'wrong-project'));await fails(()=>checkHomologationUrl(url+'?secret=x',project));
 });
 const base=()=>Response.json({success:true,report:r,authoringDiagnostics:readiness()});
 const authoredResponse=(extra:any={})=>Response.json({success:true,document:authored(2),validation:{issues:[]},reportBasis:r.basis,snapshotUpdatedAt:r.snapshotUpdatedAt,meta:{model:'openai/gpt-oss-120b',maxCompletionTokens:4096,finishReason:'stop',providerCall:true,cacheHit:false,contractRevision:GROQ_AUTHORING_REVISION,promptTokens:1589,completionTokens:3000,reasoningTokens:600,totalTokens:4589,...extra}});
 await test('roteiro executa prévia autenticada e uma única geração, registrando tentativa antes do envio',async()=>{
  let calls=0,recorded=0;const result=await runOne4096(options,async(_url,init)=>{calls++;const body=JSON.parse(String(init?.body));if(calls===1){assert(body.diagnostics&&!body.author,'Prévia');return base();}assert(recorded===1&&body.author&&body.expectedCompletionTokens===4096&&body.expectedReportBasis===r.basis,'Protocolo');return authoredResponse();},async()=>{recorded++;});assert(result.validated&&calls===2&&recorded===1,'Uma geração');
 });
 await test('roteiro não repete400/429/timeout; cache/modelo inesperado não conta como homologação',async()=>{
  for(const outcome of ['400','429','timeout','cache','model']){let calls=0;const result=await runOne4096(options,async()=>{calls++;if(calls===1)return base();if(outcome==='timeout')throw Error('PRIVATE_TRANSPORT');if(outcome==='cache')return authoredResponse({cacheHit:true,providerCall:false});if(outcome==='model')return authoredResponse({model:'unexpected'});return Response.json({success:false,errorCode:outcome==='400'?'json_validate_failed':'rate_limit_exceeded',completionDiagnostics:{finishReason:'PRIVATE_TEXT',totalTokens:'PRIVATE_NUMBER'}},{status:Number(outcome)});},async()=>{});assert(!result.validated&&calls===2&&!JSON.stringify(result).includes('PRIVATE'),'Retry/vazamento');}
  let calls=0;await fails(()=>runOne4096(options,async()=>{calls++;return Response.json({success:true,report:r,authoringDiagnostics:{...readiness(),maxCompletionTokens:2048}});},async()=>{throw Error('Não deveria registrar');}));assert(calls===1,'Chamou geração sem4096');
 });
 await test('logs/diagnósticos sem chaves, JWT, falha bruta ou dados corporativos',()=>{
  for(const secret of ['SECRET_KEY','PRIVATE_CORPORATE','PRIVATE_MESSAGE','PRIVATE_JWT','PRIVATE_ANON','Acidentes com culpa'])assert(!logs.join('').includes(secret),'Vazamento '+secret);
  assert(logs.some(line=>line.includes('"completionLimit":4096')&&line.includes('"reasoningTokens":600')),'Métricas');
 });
 await Deno.writeTextFile('.validation-tools/groq-v7-output-budget-results.json',JSON.stringify({passed:11,results,realCalls:0},null,2));
}finally{console.info=saved;}
