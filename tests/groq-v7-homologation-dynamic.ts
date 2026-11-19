// Offline unless explicitly authorized. One authored request through homologation, never retries.
import {GROQ_AUTHORING_REVISION} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts';
import {prepareAuthoringDiagnostic} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {checkHomologationUrl} from './groq-v7-homologation-4096.ts';
import {fixture} from './reports-v7-fixtures.mjs';
const C=(globalThis as any).ReportAuthoredCore;
export type Limits={tpm:number;inputTpm:number|null;outputTpm:number|null;noSeparateLimits:boolean};
const count=(v:any)=>Number.isSafeInteger(v)&&v>=0?v:null;
export function safeBudget(d:any){const result:any={};for(const key of ['configuredCompletionLimit','requestedCompletionLimit','effectiveCompletionLimit','estimatedPromptTokens','estimatedReservedTotal','availableTokenBudget','tokenMargin','promptTokens','completionTokens','reasoningTokens','totalTokens','limit'])result[key]=count(d?.[key]);result.deploymentRevision=d?.deploymentRevision===GROQ_AUTHORING_REVISION?GROQ_AUTHORING_REVISION:'unexpected_revision';result.finishReason=['stop','length','unknown','content_filter'].includes(d?.finishReason)?d.finishReason:'unknown';result.budgetAdjustmentReason=['none','available_token_budget','provider_output_budget','provider_input_budget','insufficient_json_budget','provider_cooldown','concurrent_request','minute_budget','daily_budget','provider_requests','invalid_configuration'].includes(d?.budgetAdjustmentReason)?d.budgetAdjustmentReason:'unknown';return result;}
export function checkLimits(limits:Limits){
 if(!Number.isSafeInteger(limits.tpm)||limits.tpm<=0||limits.tpm>8000)throw Error('Confirme TPM combinado até 8000.');
 if(limits.noSeparateLimits?(limits.inputTpm!==null||limits.outputTpm!==null):![limits.inputTpm,limits.outputTpm].every(n=>Number.isSafeInteger(n)&&n!>0&&n!<=8000))throw Error('Confirme ambos os limites separados, ou sua ausência no console.');
}
export function checkReadiness(d:any,limits:Limits){
 checkLimits(limits);
 if(!d?.available||!d.canGenerate||!d.providerConfigured||d.deploymentRevision!==GROQ_AUTHORING_REVISION||d.model!=='openai/gpt-oss-120b'||d.strict!==true||d.reasoningEffort!=='medium'||d.configuredCompletionLimit!==5120||d.requestedCompletionLimit!==5120)throw Error('Homologação não confirma o perfil configurado5120/strict/medium. Sem geração.');
 if(count(d.effectiveCompletionLimit)===null||d.effectiveCompletionLimit<4096||d.effectiveCompletionLimit>5120||count(d.tokenMargin)===null||d.tokenMargin<400||d.tokenMargin>1600||count(d.estimatedPromptTokens)===null||d.estimatedReservedTotal!==d.estimatedPromptTokens+d.effectiveCompletionLimit+d.tokenMargin||d.estimatedReservedTotal>Math.min(limits.tpm,d.availableTokenBudget)||d.requestBytes>6000)throw Error('Reserva publicada incompatível com o limite disponível. Sem geração.');
 if(limits.noSeparateLimits?(d.configuredInputTpm!==null||d.configuredOutputTpm!==null):(d.configuredInputTpm!==limits.inputTpm||d.configuredOutputTpm!==limits.outputTpm||d.estimatedPromptTokens+d.tokenMargin>limits.inputTpm!||d.effectiveCompletionLimit+d.tokenMargin>limits.outputTpm!))throw Error('Limites separados publicados divergem da confirmação do operador.');
}
async function post(url:string,headers:Record<string,string>,body:any,transport:typeof fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
 try{const response=await transport(url,{method:'POST',headers,body:JSON.stringify(body),redirect:'error',signal:controller.signal});let bytes=0;const chunks:Uint8Array[]=[],reader=response.body?.getReader();if(reader)for(;;){const n=await reader.read();if(n.done)break;bytes+=n.value.length;if(bytes>2*1024*1024){await reader.cancel();throw Error('Resposta excedeu limite de leitura.');}chunks.push(n.value);}const buffer=new Uint8Array(bytes);let at=0;for(const chunk of chunks){buffer.set(chunk,at);at+=chunk.length;}let parsed;try{parsed=JSON.parse(new TextDecoder().decode(buffer));}catch{throw Error('Resposta não contém JSON válido. Conteúdo não registrado.');}return {response,body:parsed};}
 finally{clearTimeout(timer);}
}
export async function runOneDynamic(options:{url:string;project:string;jwt:string;anonKey:string;selection:any;limits:Limits},transport:typeof fetch,beforeGeneration:()=>Promise<void>){
 checkHomologationUrl(options.url,options.project);checkLimits(options.limits);
 const headers={'Content-Type':'application/json',Authorization:'Bearer '+options.jwt,apikey:options.anonKey},base={action:'report',provider:'groq',selection:options.selection,managementContext:null};
 const preview=await post(options.url,headers,{...base,diagnostics:true},transport);
 if(!preview.response.ok||!preview.body?.success||!preview.body.report?.basis||!preview.body.report?.snapshotUpdatedAt)throw Error('Prévia autenticada indisponível. Nenhuma geração.');
 const ready=preview.body.authoringDiagnostics;checkReadiness(ready,options.limits);await beforeGeneration();const start=performance.now();
 try{
  const {response,body}=await post(options.url,headers,{...base,author:true,expectedCompletionTokens:ready.effectiveCompletionLimit,expectedReportBasis:preview.body.report.basis,expectedUpdatedAt:preview.body.report.snapshotUpdatedAt},transport);
  if(!response.ok||!body?.success)return {validated:false,httpStatus:response.status,providerStatus:count(body?.providerStatus),diagnosticId:/^[a-f0-9-]{36}$/.test(body?.diagnosticId??'')?body.diagnosticId:null,completionDiagnostics:safeBudget(body?.completionDiagnostics),retryAfter:count(body?.retryAfter),automaticRetries:0};
  const meta=body.meta,checked=C.validate(body.document,C.evidence(preview.body.report));
  const validated=checked.valid&&body.validation?.issues?.length===0&&body.reportBasis===preview.body.report.basis&&body.snapshotUpdatedAt===preview.body.report.snapshotUpdatedAt&&meta?.providerCall===true&&meta?.cacheHit===false&&meta?.model==='openai/gpt-oss-120b'&&meta?.deploymentRevision===GROQ_AUTHORING_REVISION&&meta?.configuredCompletionLimit===5120&&meta?.requestedCompletionLimit===5120&&meta?.effectiveCompletionLimit===ready.effectiveCompletionLimit&&meta?.maxCompletionTokens===ready.effectiveCompletionLimit&&meta?.finishReason==='stop'&&meta?.estimatedReservedTotal===ready.estimatedReservedTotal;
  return {validated,httpStatus:response.status,completionDiagnostics:safeBudget(meta),providerCall:meta?.providerCall===true,cacheHit:meta?.cacheHit===true,latencyMs:Math.round(performance.now()-start),providerLatencyMs:count(meta?.latencyMs),sections:checked.document?.sections.length??0,automaticRetries:0,editorAndPdfRealCheck:'pending_operator'};
 }catch{return {validated:false,httpStatus:null,outcome:'transport_or_response_failure',automaticRetries:0};}
}
async function main(){
 const args=Deno.args,get=(key:string,fallback='')=>{const n=args.indexOf(key);return n<0?fallback:args[n+1];};
 if(!args.includes('--confirm-live')){console.log(JSON.stringify({networkCalls:0,generationCalls:0,operatorAuthorizationRequired:true,diagnostics:prepareAuthoringDiagnostic(fixture(2),()=>undefined)},null,2));return;}
 if(!args.includes('--confirm-published-homologation')||!args.includes('--confirm-idle-window'))throw Error('Confirme homologação publicada e janela sem reservas/cooldown/outros clientes.');
 const project=get('--expected-project-ref'),url=Deno.env.get('DGRANEL_HOMOLOGATION_FUNCTION_URL')??'',jwt=Deno.env.get('DGRANEL_HOMOLOGATION_JWT')??'',anonKey=Deno.env.get('DGRANEL_HOMOLOGATION_ANON_KEY')??'';checkHomologationUrl(url,project);if(!jwt||!anonKey)throw Error('Credenciais de homologação ausentes.');
 const limits={tpm:Number(get('--tpm','8000')),inputTpm:args.includes('--input-tpm')?Number(get('--input-tpm')):null,outputTpm:args.includes('--output-tpm')?Number(get('--output-tpm')):null,noSeparateLimits:args.includes('--no-separate-limits')};checkLimits(limits);
 let selection;try{selection=JSON.parse(await Deno.readTextFile(get('--selection-file')));}catch{throw Error('Seleção local inválida.');}if(!selection||typeof selection!=='object'||!Array.isArray(selection.ids)||!selection.ids.length||Object.keys(selection).some(k=>!['type','sector','ids','expectedIndicators','start','end'].includes(k)))throw Error('Seleção deve referenciar somente dados fictícios já existentes na homologação.');
 const dir=new URL('../.validation-tools/groq-v7-dynamic-test/',import.meta.url);await Deno.mkdir(dir,{recursive:true});const marker=new URL(project+'-'+GROQ_AUTHORING_REVISION+'.json',dir),lockPath=new URL(project+'.lock',dir),lock=await Deno.open(lockPath,{createNew:true,write:true});
 try{
  try{await Deno.stat(marker);throw Error('Tentativa desta revisão já registrada. Não repetir.');}catch(error){if(!(error instanceof Deno.errors.NotFound))throw error;}
  const result=await runOneDynamic({url,project,jwt,anonKey,selection,limits},fetch,async()=>{await Deno.writeTextFile(marker,JSON.stringify({deploymentRevision:GROQ_AUTHORING_REVISION,attemptedAt:Date.now(),status:'started'}),{createNew:true});});
  await Deno.writeTextFile(marker,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.validated)Deno.exitCode=1;
 }finally{lock.close();await Deno.remove(lockPath);}
}
if(import.meta.main)await main();
