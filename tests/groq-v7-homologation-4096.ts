// ONE Groq generation through a published homologation Edge Function. Offline by default.
import {GROQ_AUTHORING_REVISION} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts';
import {authorConfig,authorPayload} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import '../public/report-authored-core.js';
import {fixture} from './reports-v7-fixtures.mjs';
const C=(globalThis as any).ReportAuthoredCore;
const count=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
const safeCompletion=(d:any)=>d?{limit:count(d.limit),promptTokens:count(d.promptTokens),completionTokens:count(d.completionTokens),reasoningTokens:count(d.reasoningTokens),totalTokens:count(d.totalTokens),finishReason:['stop','length','unknown','content_filter'].includes(d.finishReason)?d.finishReason:'unknown',truncationEvidence:['provider_reported_length','cap_and_incomplete_json','cap_reached_unproven_cause','incomplete_json_unknown_cause','not_confirmed'].includes(d.truncationEvidence)?d.truncationEvidence:'not_confirmed'}:null;
export type OperatorLimits={tpm:number;outputTpm:number|null;noSeparateOutputLimit:boolean};
export function checkReadiness4096(readiness:any,limits:OperatorLimits){
    if(!Number.isSafeInteger(limits.tpm)||limits.tpm<=0||limits.tpm>8000)throw Error('Confirme um teto combinado válido, até 8000 TPM.');
    if(limits.outputTpm===null?!limits.noSeparateOutputLimit:limits.noSeparateOutputLimit||!Number.isSafeInteger(limits.outputTpm)||limits.outputTpm<4096)throw Error('Confirme o limite separado de saída ou sua ausência no console.');
    if(!readiness?.available||!readiness.providerConfigured||readiness.revision!==GROQ_AUTHORING_REVISION||readiness.model!=='openai/gpt-oss-120b'||readiness.maxCompletionTokens!==4096||readiness.strict!==true||readiness.reasoningEffort!=='medium')throw Error('Homologação publicada não confirma o perfil estrito de 4096. Nenhuma geração permitida.');
    if(!Number.isSafeInteger(readiness.reservedTokens)||readiness.reservedTokens>limits.tpm||readiness.requestBytes>6000)throw Error('A reserva excede o teto autorizado. Aguarde ou ajuste o recorte, sem aumentar cotas.');
}
export function checkHomologationUrl(url:string,project:string){
    if(!/^[a-z0-9]{20}$/.test(project))throw Error('Project ref de homologação inválido.');
    const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.hostname!==project+'.supabase.co'||parsed.port||parsed.username||parsed.password||parsed.search||parsed.hash||parsed.pathname!=='/functions/v1/seguranca-viaria-ia')throw Error('Endpoint não corresponde ao projeto de homologação confirmado.');
}
async function post(url:string,headers:Record<string,string>,body:any,transport:typeof fetch){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
    try{const response=await transport(url,{method:'POST',headers,body:JSON.stringify(body),redirect:'error',signal:controller.signal});let bytes=0;const chunks:Uint8Array[]=[],reader=response.body?.getReader();if(reader)for(;;){const next=await reader.read();if(next.done)break;bytes+=next.value.length;if(bytes>2*1024*1024){await reader.cancel();throw Error('Resposta excedeu o limite local de segurança.');}chunks.push(next.value);}const all=new Uint8Array(bytes);let n=0;for(const chunk of chunks){all.set(chunk,n);n+=chunk.length;}let data;try{data=JSON.parse(new TextDecoder().decode(all));}catch{throw Error('Resposta de homologação não é JSON válido.');}return {response,data};}
    finally{clearTimeout(timer);}
}
export async function runOne4096(options:{url:string;project:string;jwt:string;anonKey:string;selection:any;limits:OperatorLimits},transport:typeof fetch,beforeGeneration:()=>Promise<void>){
    checkHomologationUrl(options.url,options.project);
    const headers={'Content-Type':'application/json',Authorization:'Bearer '+options.jwt,apikey:options.anonKey};
    const baseBody={action:'report',provider:'groq',selection:options.selection,managementContext:null};
    const preflight=await post(options.url,headers,{...baseBody,diagnostics:true},transport);
    if(!preflight.response.ok||!preflight.data?.success||!preflight.data.report?.basis||!preflight.data.report?.snapshotUpdatedAt)throw Error('Prévia autenticada indisponível. Nenhuma geração executada.');
    checkReadiness4096(preflight.data.authoringDiagnostics,options.limits);
    await beforeGeneration(); // Persist the single attempt BEFORE sending any author request.
    const started=performance.now();
    try{
        const result=await post(options.url,headers,{...baseBody,author:true,expectedCompletionTokens:4096,expectedReportBasis:preflight.data.report.basis,expectedUpdatedAt:preflight.data.report.snapshotUpdatedAt},transport);
        const body=result.data;
        if(!result.response.ok||!body?.success)return {validated:false,httpStatus:result.response.status,diagnosticId:/^[a-f0-9-]{36}$/.test(body?.diagnosticId??'')?body.diagnosticId:null,errorCode:['json_validate_failed','rate_limit_exceeded','minute_budget','invalid_authoring_response'].includes(body?.errorCode)?body.errorCode:'other_error',providerStatus:typeof body?.providerStatus==='number'?body.providerStatus:null,
            completionDiagnostics:safeCompletion(body?.completionDiagnostics),retryAfter:count(body?.retryAfter),automaticRetries:0};
        const meta=body.meta,checked=C.validate(body.document,C.evidence(preflight.data.report));
        const validated=checked.valid&&body.validation?.issues?.length===0&&body.reportBasis===preflight.data.report.basis&&body.snapshotUpdatedAt===preflight.data.report.snapshotUpdatedAt&&meta?.model==='openai/gpt-oss-120b'&&meta?.maxCompletionTokens===4096&&meta?.finishReason==='stop'&&meta?.providerCall===true&&meta?.cacheHit===false&&meta?.contractRevision===GROQ_AUTHORING_REVISION;
        return {validated,httpStatus:result.response.status,providerCall:meta?.providerCall===true,cacheHit:meta?.cacheHit===true,model:meta?.model==='openai/gpt-oss-120b'?meta.model:'unexpected_model',maxCompletionTokens:count(meta?.maxCompletionTokens),promptTokens:count(meta?.promptTokens),completionTokens:count(meta?.completionTokens),reasoningTokens:count(meta?.reasoningTokens),totalTokens:count(meta?.totalTokens),finishReason:meta?.finishReason==='stop'?'stop':'not_stop',latencyMs:Math.round(performance.now()-started),providerLatencyMs:count(meta?.latencyMs),sectionCount:checked.document?.sections.length??0,automaticRetries:0};
    }catch{return {validated:false,httpStatus:null,outcome:'transport_or_response_failure',automaticRetries:0};}
}
async function main(){
    const args=Deno.args,get=(name:string,fallback='')=>{const n=args.indexOf(name);return n<0?fallback:args[n+1];};
    if(!args.includes('--confirm-live')){const built=authorPayload(fixture(2),'groq','openai/gpt-oss-120b',{...authorConfig(()=>undefined),completion:4096});console.log({networkCalls:0,generationCalls:0,publicationRequired:true,explicitOperatorAuthorizationRequired:true,revision:GROQ_AUTHORING_REVISION,maxCompletionTokens:4096,strict:true,reasoningEffort:'medium',requestBytes:built.bytes,inputEstimatedTokens:built.estimatedTokens,reservedTokens:built.estimatedTokens+4096+400,unchangedTpmCeiling:8000});return;}
    if(!args.includes('--confirm-published-homologation')||!args.includes('--confirm-idle-window'))throw Error('Confirme publicação em homologação e janela sem outras análises/reservas/cooldown.');
    const project=get('--expected-project-ref'),url=Deno.env.get('DGRANEL_HOMOLOGATION_FUNCTION_URL')??'',jwt=Deno.env.get('DGRANEL_HOMOLOGATION_JWT')??'',anonKey=Deno.env.get('DGRANEL_HOMOLOGATION_ANON_KEY')??'';
    checkHomologationUrl(url,project);if(!jwt||!anonKey)throw Error('Credenciais de homologação ausentes. Nenhuma chamada executada.');
    const limits={tpm:Number(get('--tpm','8000')),outputTpm:args.includes('--output-tpm')?Number(get('--output-tpm')):null,noSeparateOutputLimit:args.includes('--no-separate-output-limit')};
    // Validate quota attestation before even the read-only preflight.
    checkReadiness4096({available:true,providerConfigured:true,revision:GROQ_AUTHORING_REVISION,model:'openai/gpt-oss-120b',maxCompletionTokens:4096,strict:true,reasoningEffort:'medium',reservedTokens:0,requestBytes:0},limits);
    let selection;try{selection=JSON.parse(await Deno.readTextFile(get('--selection-file')));}catch{throw Error('Seleção local de homologação inválida.');}
    if(!selection||typeof selection!=='object'||!Array.isArray(selection.ids)||!selection.ids.length||Object.keys(selection).some(k=>!['type','sector','ids','expectedIndicators','start','end'].includes(k)))throw Error('Envie somente o recorte e IDs dos dados fictícios já existentes na homologação.');
    const directory=new URL('../.validation-tools/groq-v7-output-test/',import.meta.url);await Deno.mkdir(directory,{recursive:true});const marker=new URL(project+'.json',directory),lockPath=new URL(project+'.lock',directory),lock=await Deno.open(lockPath,{createNew:true,write:true});
    try{
        try{await Deno.stat(marker);throw Error('A tentativa única deste projeto já foi registrada. Nenhum retry permitido.');}catch(error){if(!(error instanceof Deno.errors.NotFound))throw error;}
        const result=await runOne4096({url,project,jwt,anonKey,selection,limits},fetch,async()=>{await Deno.writeTextFile(marker,JSON.stringify({revision:GROQ_AUTHORING_REVISION,project,attemptedAt:Date.now(),maxCompletionTokens:4096,status:'started'}),{createNew:true});});
        await Deno.writeTextFile(marker,JSON.stringify({revision:GROQ_AUTHORING_REVISION,project,maxCompletionTokens:4096,result},null,2));console.log(JSON.stringify(result,null,2));if(!result.validated)Deno.exitCode=1;
    }finally{lock.close();await Deno.remove(lockPath);}
}
if(import.meta.main)await main();
