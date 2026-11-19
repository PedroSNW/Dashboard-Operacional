// Safe V7 contract diagnostics. Never log provider messages or failed_generation.
import {groqUsage,safeFinishReason} from './groq-policy.js';
export const GROQ_AUTHORING_REVISION='v7-evidence-registry-6';
export function validationDiagnostic(result:any,stage?:string,code?:string,path?:string){
    const first=result?.issues?.find((i:any)=>i.severity==='blocking')??result?.issues?.[0];
    const safe=(globalThis as any).ReportAuthoredCore.safePath;
    const count=(v:any)=>Number.isSafeInteger(v)&&v>=0?v:0;
    return {validationStage:stage??first?.stage??'editorial_validation',validationCode:code??first?.codes?.[0]??'accepted',
        validationCategory:first?.severity==='blocking'?'blocking':first?.severity??(stage?'blocking':'accepted'),validationPath:safe(path??first?.path??'$'),
        sectionEvidenceDiagnostics:result?.sectionEvidenceDiagnostics??[],rejectedSectionsCount:count(result?.rejectedSectionsCount),acceptedSectionsCount:count(result?.acceptedSectionsCount),reviewableIssuesCount:count(result?.reviewableIssuesCount),fatalIssuesCount:count(result?.fatalIssuesCount??(stage?1:0))};
}
const knownCodes=new Set(['json_validate_failed','invalid_request_error','invalid_json_schema','invalid_schema','unsupported_schema','unsupported_parameter','invalid_parameter','context_length_exceeded','rate_limit_exceeded','insufficient_quota','generation_failed']);
const knownTypes=new Set(['invalid_request_error','rate_limit_error','server_error','authentication_error']);
const parameters=['response_format','reasoning_effort','include_reasoning','reasoning_format','max_completion_tokens','max_tokens','temperature','model','messages'];
const keywords=['required','additionalProperties','anyOf','enum','type','properties','items','maxLength','maxItems'];
const safeId=(value:unknown)=>typeof value==='string'&&/^(?!gsk_)[a-zA-Z0-9_-]{1,120}$/.test(value)?value:null;
function failedStructure(text:string){
    const trimmed=text.trim();let quoted=false,escaped=false,open=0;
    for(const character of trimmed){if(quoted){if(escaped)escaped=false;else if(character==='\\')escaped=true;else if(character==='"')quoted=false;}else if(character==='"')quoted=true;else if(character==='{'||character==='[')open++;else if(character==='}'||character===']')open--;}
    const jsonLike=trimmed.startsWith('{')||trimmed.startsWith('[');
    return {jsonLike,incompleteStructure:jsonLike&&(quoted||open>0),reasoningMarkers:/<\/?think>|<\|channel\|>analysis|<\|start\|>assistant/i.test(trimmed),fencedOutput:trimmed.startsWith('```')};
}
export function auditAuthoringSchema(schema:any){
    const issues:string[]=[];let objects=0,properties=0,maxObjectDepth=0,unions=0,numericEnums=0;
    const visit=(s:any,path:string,depth:number)=>{
        if(!s||typeof s!=='object'||Array.isArray(s)){issues.push(path+':schema');return;}
        if(s.anyOf){unions++;if(!Array.isArray(s.anyOf)||!s.anyOf.length)issues.push(path+':anyOf');else s.anyOf.forEach((part:any,index:number)=>visit(part,path+'.anyOf.'+index,depth));return;}
        if(!['string','number','integer','boolean','null','object','array'].includes(s.type))issues.push(path+':type');
        if(s.enum){if(!Array.isArray(s.enum)||!s.enum.length)issues.push(path+':enum');else if(s.enum.some((value:any)=>s.type==='integer'?!Number.isInteger(value):s.type==='string'?typeof value!=='string':false))issues.push(path+':enum_type');if(s.enum.some((v:any)=>typeof v==='number'))numericEnums++;}
        if(s.type==='object'){
            objects++;maxObjectDepth=Math.max(maxObjectDepth,depth+1);
            const keys=Object.keys(s.properties??{});properties+=keys.length;
            if(s.additionalProperties!==false)issues.push(path+':additionalProperties');
            if(!Array.isArray(s.required)||new Set(s.required).size!==keys.length||s.required.length!==keys.length||keys.some(k=>!s.required.includes(k)))issues.push(path+':required');
            keys.forEach(key=>visit(s.properties[key],path+'.properties.'+key,depth+1));
        }else if(s.type==='array')visit(s.items,path+'.items',depth);
    };
    if(schema?.type!=='object'||schema?.anyOf)issues.push('$:root');visit(schema,'$',0);
    return {valid:issues.length===0,issues,objects,properties,maxObjectDepth,unions,numericEnums};
}
export async function schemaFingerprint(schema:any){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(schema))))).map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function authoredProviderFailure(response:Response, schema:any, validate:(value:any,schema:any)=>string[]){
    let payload:any=null;try{payload=await response.json();}catch{/* Preserve HTTP evidence without trusting an error body. */}
    const error=payload?.error??{},message=typeof error.message==='string'?error.message.slice(0,32768):'';
    const code=knownCodes.has(error.code)?error.code:'unknown',type=knownTypes.has(error.type)?error.type:'unknown';
    const hasFailedGeneration=Object.hasOwn(error,'failed_generation')||Object.hasOwn(payload??{},'failed_generation');
    const category=response.status===429?'rate_limit':response.status===413?'payload_too_large':response.status!==400?'provider_error'
        :hasFailedGeneration||code==='json_validate_failed'||code==='generation_failed'||/failed to validate json|generated json|failed to generate|json.*does not match/i.test(message)?'generation_validation'
        :/schema/i.test(message)||['invalid_schema','invalid_json_schema','unsupported_schema'].includes(code)?'invalid_schema'
        :/context|too many tokens|context_length/i.test(message)||code==='context_length_exceeded'?'context_limit'
        :/unsupported|not supported|invalid parameter|must be|must not|not allowed/i.test(message)?'invalid_parameter':'invalid_request';
    const raw=response.headers.get('retry-after');const seconds=raw===null?null:/^\d+(?:\.\d+)?$/.test(raw)?Math.ceil(Number(raw)):Math.max(0,Math.ceil((Date.parse(raw)-Date.now())/1000));
    const requestedParam=typeof error.param==='string'?error.param:'';
    const parameter=parameters.find(p=>requestedParam===p||requestedParam.startsWith(p+'.'))??parameters.find(p=>message.toLowerCase().includes(p))??null;
    const failed=error.failed_generation??payload?.failed_generation;let failedJson='absent',failedSchema='not_checked',schemaIssues:string[]=[],structure:ReturnType<typeof failedStructure>|null=null;
    if(typeof failed==='string'){
        if(failed.length===0)failedJson='empty';else if(failed.length>65536)failedJson='oversized';else{structure=failedStructure(failed);
            try{const generated=JSON.parse(failed);failedJson='valid';const issues=validate(generated,schema);
                // Runtime validator paths originate in untrusted JSON: retain only schema-owned names/indices.
                const allowed=new Set<string>(['$', 'anyOf','properties','items']);const collect=(s:any)=>{if(!s||typeof s!=='object')return;Object.keys(s.properties??{}).forEach(k=>{allowed.add(k);collect(s.properties[k]);});if(s.items)collect(s.items);if(s.anyOf)s.anyOf.forEach(collect);};collect(schema);
                const reasons=new Set(['tipo','enum','null','texto','inteiro','lista','objeto','ausente','extra','schema']);
                schemaIssues=issues.slice(0,8).map(issue=>{const [path,reason]=issue.split(':');const safePath=path.split('.').map(part=>allowed.has(part)?part:/^\d{1,4}$/.test(part)?'[]':'?').join('.');return safePath+':'+(reasons.has(reason)?reason:'invalid');});failedSchema=issues.length?'invalid':'valid';
            }catch{failedJson='invalid';}
        }
    }
    const usageSource=payload?.usage?'response_usage':error?.usage?'error_usage':'unavailable';
    const usage=groqUsage({usage:payload?.usage??error?.usage});
    const finishReason=safeFinishReason(payload?.choices?.[0]?.finish_reason??payload?.finish_reason??error?.finish_reason);
    return {status:response.status,code,type,category,parameter,keyword:keywords.find(k=>message.toLowerCase().includes(k.toLowerCase()))??null,
        requestId:safeId(response.headers.get('x-request-id'))??safeId(response.headers.get('x-groq-request-id'))??(typeof payload?.x_groq?.id==='string'&&payload.x_groq.id.startsWith('req_')?safeId(payload.x_groq.id):null),
        retryAfter:response.status===429&&Number.isFinite(seconds)?seconds:null,failedJson,failedSchema,schemaIssues,failedStructure:structure,usage,usageSource,finishReason,
        // json_validate_failed can incur usage: NEVER assume that it consumed zero tokens.
        preGenerationRejection:response.status===400&&!hasFailedGeneration&&![usage.totalTokens,usage.promptTokens,usage.completionTokens].some(v=>typeof v==='number'&&v>0)&&['invalid_schema','invalid_parameter','context_limit'].includes(category)};
}
export function completionEvidence(limit:number,usage:ReturnType<typeof groqUsage>|null,finishReason:string,structure?:{incompleteStructure:boolean}|null){
    const completionLimitReached=usage?.completionTokens===null||usage?.completionTokens===undefined?null:usage.completionTokens>=limit;
    const truncationEvidence=finishReason==='length'?'provider_reported_length':completionLimitReached&&structure?.incompleteStructure?'cap_and_incomplete_json':completionLimitReached?'cap_reached_unproven_cause':structure?.incompleteStructure?'incomplete_json_unknown_cause':'not_confirmed';
    return {completionLimitReached,truncationEvidence};
}
