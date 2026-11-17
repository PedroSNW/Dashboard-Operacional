// Comparação reproduzível; offline por padrão. Nunca lê snapshot/credenciais Supabase.
import {buildReport,buildReportManagement,compactReportContext} from '../supabase/functions/seguranca-viaria-ia/reports.js';
import {GROQ_MAX_BODY_BYTES,groqFailure} from '../supabase/functions/seguranca-viaria-ia/groq-context.js';
import {createGroqGuard,groqUsage,safeFinishReason,GROQ_LIMITS} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
export const profiles=[{name:'previous',maxCompletionTokens:1200,reasoningEffort:'low'},{name:'candidate',maxCompletionTokens:2048,reasoningEffort:'medium'},{name:'comparison-only',maxCompletionTokens:3072,reasoningEffort:'medium'}];
export function fixture(count=5,dashboardCount=count){
    const labels=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const kinds=[['Acidentes','Qtd',0,'menor_melhor'],['Velocidade','Qtd',2,'menor_melhor'],['Documentação','%',95,'maior_melhor'],['Sem dados','Qtd',null,null],['Volume neutro','Qtd',null,'neutro']];
    const stored={mesesLabels:labels,indicadores:Array.from({length:dashboardCount},(_,n)=>{const [indicador,und,meta,direcaoDesempenho]=kinds[n%5];return {indicador:indicador+' '+n,setor:'Setor fictício',und,meta,direcaoDesempenho,valores:labels.map((_,m)=>n%5===3||m===2?null:n%5===2?80+m:m+n)};})};
    return buildReport(stored,{type:'comparativo',sector:'TODOS',ids:Array.from({length:count},(_,n)=>'indice:'+n),start:'Jan',end:'Dez'});
}
export function payload(compact,profile){return {model:'openai/gpt-oss-120b',messages:compact.messages,temperature:.3,max_completion_tokens:profile.maxCompletionTokens,response_format:{type:'json_object'},reasoning_effort:profile.reasoningEffort};}
export function evaluate(report,text,sentIds,finishReason='stop'){
    const before=JSON.stringify(report.indicators),management=buildReportManagement(report,finishReason==='length'?null:text,sentIds);
    return {validatedSelection:!management.audit.fallback,deterministicValuesUnchanged:JSON.stringify(report.indicators)===before,uniqueActions:new Set(management.actionPlan.map(a=>a.title+':'+a.priority)).size===management.actionPlan.length,
        actions:management.actionPlan.length,campaigns:management.campaignSuggestions.length,communications:management.communicationSuggestions.length,truncated:finishReason==='length',fallback:management.audit.fallback,qualitativeReviewRequired:true};
}
if(import.meta.main){
    const live=Deno.args.includes('--live'),key=live?Deno.env.get('GROQ_API_KEY'):null;
    if(live&&!key)throw Error('Comparação real não executada: GROQ_API_KEY ausente no ambiente local.');
    const report=fixture(5,75),compact=compactReportContext(report),guard=createGroqGuard(),results=[];
    let oldCompact=null;try{const old=await import(new URL('../.validation-tools/v51-before/report-management.js',import.meta.url).href);oldCompact=old.compactReportContext(report);}catch{/* Baseline local opcional. */}
    for(const profile of profiles){
        const body=JSON.stringify(payload(compact,profile)),bytes=new TextEncoder().encode(body).length;
        const row={profile:profile.name,maxCompletionTokens:profile.maxCompletionTokens,reasoningEffort:profile.reasoningEffort,inputEstimatedTokens:compact.estimatedTokens,requestBytes:bytes,sent:compact.sent,omitted:compact.omitted,
            conservativeReservation:compact.estimatedTokens+profile.maxCompletionTokens+GROQ_LIMITS.margin,mode:live?'live':'offline',actualUsage:null,latencyMs:null,finishReason:null,qualityChecks:null};
        if(bytes>GROQ_MAX_BODY_BYTES||row.conservativeReservation>GROQ_LIMITS.tokensPerMinute)throw Error('Perfil fora do orçamento conservador.');
        if(!live||profile.name==='comparison-only'&&!Deno.args.includes('--include-3072')){results.push(row);continue;}
        let admission=guard.reserve(row.conservativeReservation);
        if(!admission.allowed){if(admission.retryAfter>60)throw Error('Limite diário ou cooldown: interromper comparação, sem retry da API.');await new Promise(r=>setTimeout(r,admission.retryAfter*1000));admission=guard.reserve(row.conservativeReservation);}
        if(!admission.allowed)throw Error('Reserva indisponível; comparação interrompida.');
        const start=performance.now();let usage=null;
        try{
            const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body,signal:AbortSignal.timeout(35000)});
            guard.observe(response.headers);
            row.latencyMs=Math.round(performance.now()-start);
            if(!response.ok){const failure=await groqFailure(response);guard.observe(response.headers,response.status,failure.retryAfter);row.failure={status:failure.status,category:failure.category,retryAfter:failure.retryAfter};results.push(row);break;}
            const data=await response.json();usage=groqUsage(data);row.latencyMs=Math.round(performance.now()-start);row.actualUsage=usage;row.finishReason=safeFinishReason(data.choices?.[0]?.finish_reason);
            row.qualityChecks=evaluate(report,data.choices?.[0]?.message?.content??'',compact.sentIds,row.finishReason);results.push(row);
        }catch(error){row.latencyMs=Math.round(performance.now()-start);row.failure={status:null,category:['AbortError','TimeoutError'].includes(error?.name)?'timeout':'transport_or_parsing',retryAfter:null};results.push(row);break;
        }finally{guard.finish(admission.ticket,usage);}
    }
    const result={model:'openai/gpt-oss-120b',realApiExecuted:live,tokenizer:'conservative UTF-8 bytes/2 + overhead; not an exact tokenizer',baselineContext:oldCompact?{estimatedTokens:oldCompact.estimatedTokens,bytes:oldCompact.bytes,requestBytes:new TextEncoder().encode(JSON.stringify(payload(oldCompact,profiles[0]))).length,systemBytes:new TextEncoder().encode(oldCompact.messages[0].content).length,sent:oldCompact.sent,omitted:oldCompact.omitted}:null,context:{messageCount:compact.messages.length,systemBytes:new TextEncoder().encode(compact.messages[0].content).length,messagesBytes:compact.bytes},results};
    await Deno.writeTextFile('.validation-tools/groq-v51-comparison'+(live?'-live':'')+'.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}
