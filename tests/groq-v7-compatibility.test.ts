import '../public/report-authored-core.js';
import {auditAuthoringSchema,authoredProviderFailure,schemaFingerprint} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts';
import {authorPayload,generateAuthoredReport,AuthoringError} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {createGroqGuard,GROQ_LIMITS} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {fixture,authored,wireDocument} from './reports-v7-fixtures.mjs';
import {GROQ_AUTHORING_WIRE_SCHEMA} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-wire.ts';
const C=(globalThis as any).ReportAuthoredCore,assert=(v:any,m:string)=>{if(!v)throw Error(m);},r=fixture(1),logs:string[]=[],savedLog=console.info;
console.info=(...args)=>logs.push(JSON.stringify(args));let passed=0;const results:any[]=[];
async function test(name:string,fn:()=>any){await fn();passed++;results.push({name,status:'passed'});console.log('PASS',name);}
const env=(key:string)=>key.endsWith('_API_KEY')?'SECRET_KEY':undefined;
const response=(status:number,error:any)=>Response.json({error},{status,headers:{'x-request-id':'req-diagnostic-safe','retry-after':'19'}});
async function failure(mock:typeof fetch,guard=createGroqGuard()){try{await generateAuthoredReport(r,'groq',guard,env,mock);throw Error('Sucesso inesperado');}catch(error){assert(error instanceof AuthoringError,'Classe de erro');return error as AuthoringError;}}
try{
 await test('schema estrito auditado recursivamente, sem enfraquecer o contrato',async()=>{
  const audit=auditAuthoringSchema(C.schema);assert(audit.valid&&audit.objects===4&&audit.maxObjectDepth===3&&audit.unions===1,'Auditoria '+JSON.stringify(audit));
  for(const mutate of [(s:any)=>delete s.required,(s:any)=>s.additionalProperties=true,(s:any)=>s.properties.sections.items.properties.proposal.anyOf[1].required.pop(),(s:any)=>s.properties.authoredReportVersion.enum=['1']]){const bad=structuredClone(C.schema);mutate(bad);assert(!auditAuthoringSchema(bad).valid,'Schema inválido passou');}
  assert((await schemaFingerprint(C.schema)).length===64,'Fingerprint');
  const required=C.schema.required;try{C.schema.required=[];let rejected=false;try{authorPayload(r,'groq','openai/gpt-oss-120b');}catch(error){rejected=error instanceof AuthoringError&&error.status===500&&error.diagnostic.origin==='local_contract';}assert(rejected,'Schema local atribuído ao provedor');}finally{C.schema.required=required;}
 });
 await test('payload real preserva schema, medium, teto e separação de raciocínio',()=>{
  const built=authorPayload(r,'groq','openai/gpt-oss-120b'),p=JSON.parse(built.body);assert(p.response_format.type==='json_schema'&&p.response_format.json_schema.strict===true&&JSON.stringify(p.response_format.json_schema.schema)===JSON.stringify(GROQ_AUTHORING_WIRE_SCHEMA),'Strict removido');
  assert(p.reasoning_effort==='medium'&&p.max_completion_tokens===5120&&p.include_reasoning===false&&!('reasoning_format' in p)&&!('max_tokens' in p),'Parâmetros');assert(built.bytes<=6000&&built.estimatedTokens<=3500,'Orçamento');
 });
 await test('400 json_validate_failed é falha da geração; conteúdo privado não é logado nem recuperado',async()=>{
  let calls=0;const error=await failure(async()=>{calls++;return response(400,{code:'json_validate_failed',type:'invalid_request_error',message:"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details. PRIVATE_CORPORATE",failed_generation:'{"PRIVATE_FIELD": "PRIVATE_DATA"}'});});
  assert(error.status===400&&error.retryAfter===undefined&&error.diagnostic.providerStatus===400&&error.diagnostic.origin==='provider'&&error.diagnostic.code==='json_validate_failed','Mapeamento');assert(error.message.includes('JSON gerado')&&calls===1,'Retry ou mensagem');
  const line=logs.find(line=>line.includes('"failedSchema":"invalid"'));assert(line?.includes('json_validate_failed')&&!line.includes('PRIVATE'),'Diagnóstico privado');
 });
 await test('failed_generation vazio, inválido, compatível e excessivo: somente sinais estruturais',async()=>{
  for(const [failed,expected] of [['','empty'],['{','invalid'],[JSON.stringify(authored(1)),'valid'],['X'.repeat(65537),'oversized']]){const d=await authoredProviderFailure(response(400,{code:'json_validate_failed',message:'Failed to validate JSON',failed_generation:failed}),C.schema,C.checkSchema);assert(d.failedJson===expected&&!d.preGenerationRejection,'Classificação');assert(!JSON.stringify(d).includes('Panorama'),'Texto publicado');}
 });
 await test('400 inválido antes de geração não cria TPM fictício, mas conserva RPM/RPD',async()=>{
  const guard=createGroqGuard();let calls=0;for(let n=0;n<2;n++){const e=await failure(async()=>{calls++;return response(400,{type:'invalid_request_error',message:'Invalid schema for response_format. additionalProperties must be false',param:'response_format'});},guard);assert(e.status===400,'400 virou429');}assert(calls===2,'Rejeição prévia reservou tokens');
  const one=createGroqGuard(()=>0,{...GROQ_LIMITS,requestsPerMinute:1});const ticket=one.reserve(5300);one.finish(ticket.ticket,null,true);assert(one.reserve(5300).reason==='minute_budget','RPM alterado');
 });
 await test('400 gerado com uso desconhecido conserva reserva e distingue o 429 LOCAL subsequente',async()=>{
  const guard=createGroqGuard();let calls=0;const mock:typeof fetch=async()=>{calls++;return response(400,{code:'json_validate_failed',message:'Failed to validate JSON'});};const first=await failure(mock,guard),second=await failure(mock,guard);
  assert(first.status===400&&second.status===429&&calls===1,'Sequência não reproduzida');assert(second.diagnostic.origin==='local_guard'&&second.diagnostic.providerStatus===null&&second.diagnostic.code==='insufficient_json_budget'&&!second.message.includes('JSON gerado'),'429 local mascarado');
 });
 await test('429 real respeita Retry-After sem retry e não vira400',async()=>{
  let calls=0;const e=await failure(async()=>{calls++;return response(429,{code:'rate_limit_exceeded',message:'Token limit exceeded'});});assert(e.status===429&&e.retryAfter===19&&e.diagnostic.origin==='provider'&&e.diagnostic.providerStatus===429&&calls===1,'429');
 });
 await test('timeout, JSON/schema inválidos são falhas502/504; resposta válida continua verificável',async()=>{
  assert((await failure(async()=>{throw new DOMException('abort','AbortError');})).status===504,'Timeout');
  for(const content of ['{',JSON.stringify({title:'incompleto'})]){const e=await failure(async()=>Response.json({choices:[{finish_reason:'stop',message:{content}}]}));assert(e.status===502&&e.diagnostic.origin!=='local_guard','Resposta inválida');}
  const ok=await generateAuthoredReport(r,'groq',createGroqGuard(),env,async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(wireDocument(authored(1))),reasoning:'PRIVATE_REASONING'}}]}));assert(C.validate(ok.document,ok.evidence).valid&&ok.validation.reviewRequired,'Validação removida');
 });
 assert(!logs.join('').includes('SECRET_KEY')&&!logs.join('').includes('PRIVATE_DATA')&&!logs.join('').includes('PRIVATE_FIELD')&&!logs.join('').includes('PRIVATE_REASONING')&&!logs.join('').includes('PRIVATE_CORPORATE'),'Vazamento');
 await Deno.writeTextFile('.validation-tools/groq-v7-compatibility-results.json',JSON.stringify({passed,results,audit:auditAuthoringSchema(C.schema)},null,2));
}finally{console.info=savedLog;}
