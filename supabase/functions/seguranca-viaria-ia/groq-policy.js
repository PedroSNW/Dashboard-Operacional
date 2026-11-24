// Política local V5.1. Não altera Secrets; tetos de engenharia, não cotas oficiais.
export const GROQ_REPORT_PROFILE=Object.freeze({name:'reports-v5.1',maxCompletionTokens:2048,reasoningEffort:'medium'});
export const GROQ_LIMITS=Object.freeze({tokensPerMinute:8000,requestsPerMinute:20,tokensPerDay:100000,requestsPerDay:500,margin:400,cacheMs:300000,cacheEntries:32});
export function groqProfile(report,model){
    const oss=['openai/gpt-oss-120b','openai/gpt-oss-20b'].includes(model);
    return {name:report?GROQ_REPORT_PROFILE.name:'chat-v5',maxCompletionTokens:report?GROQ_REPORT_PROFILE.maxCompletionTokens:1200,reasoningEffort:oss?(report?GROQ_REPORT_PROFILE.reasoningEffort:'low'):null};
}
const count=v=>Number.isSafeInteger(v)&&v>=0?v:null;
export function groqUsage(data){
    const u=data?.usage,promptTokens=count(u?.prompt_tokens),completionTokens=count(u?.completion_tokens);
    const reported=count(u?.total_tokens),sum=promptTokens!==null&&completionTokens!==null?promptTokens+completionTokens:null;
    return {promptTokens,completionTokens,reasoningTokens:count(u?.completion_tokens_details?.reasoning_tokens),
        totalTokens:reported===null?sum:sum===null?reported:Math.max(reported,sum)};
}
export function safeFinishReason(value){return ['stop','length','tool_calls','function_call','content_filter'].includes(value)?value:'unknown';}
// Headers de reset usam durações, p.ex. 1m2.5s. Não aceitar texto arbitrário nos logs.
export function resetMs(value){
    if(typeof value!=='string'||value.length>80||!/^\d+(?:\.\d+)?(?:ms|s|m|h|d)(?:\d+(?:\.\d+)?(?:ms|s|m|h|d))*$/.test(value))return null;
    let ms=0;for(const [,n,unit] of value.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h|d)/g))ms+=Number(n)*({ms:1,s:1000,m:60000,h:3600000,d:86400000}[unit]);
    return Number.isFinite(ms)?ms:null;
}
/** Limite de uma instância. Não promete coordenação distribuída ou contabilização de outros clientes. */
export function createGroqGuard(now=()=>Date.now(),limits=GROQ_LIMITS){
    const events=[];let active=false,blockedUntil=0,tokenCeiling=limits.tokensPerMinute,requestCeiling=limits.requestsPerDay;
    let tokenRemaining=null,tokenReset=0,requestRemaining=null,requestReset=0;
    const budget=(options={})=>{
        const time=now();while(events.length&&events[0].at+86400000<=time)events.shift();
        const minute=events.filter(e=>e.at+60000>time),sum=(list,key)=>list.reduce((n,e)=>n+(e[key]??e.tokens),0);
        const minuteBudget=tokenCeiling-sum(minute,'tokens'),dailyBudget=limits.tokensPerDay-sum(events,'tokens'),remoteBudget=tokenReset>time&&tokenRemaining!==null?tokenRemaining:Infinity;
        const availableTokenBudget=Math.max(0,Math.min(minuteBudget,dailyBudget,remoteBudget));
        const reason=time<blockedUntil?'provider_cooldown':active?'concurrent_request':minute.length>=limits.requestsPerMinute?'minute_budget':events.length>=requestCeiling?'daily_budget':requestReset>time&&requestRemaining===0?'provider_requests':null;
        const untilEnough=(list,key,available,required,ceiling,windowMs)=>{
            if(required==null||required<=available)return time;
            if(required>ceiling)return time+windowMs;
            for(const event of list){
                available+=event[key]??event.tokens;
                if(available>=required)return event.at+windowMs;
            }
            return time+windowMs;
        };
        const inputBudget=options.inputTpm==null?null:options.inputTpm-sum(minute,'inputTokens');
        const outputBudget=options.outputTpm==null?null:options.outputTpm-sum(minute,'outputTokens');
        const tokenUntil=options.requiredTokens==null
            ? dailyBudget<=minuteBudget&&dailyBudget<=remoteBudget?(events[0]?.at??time)+86400000:remoteBudget<minuteBudget?tokenReset:(minute[0]?.at??time)+60000
            : Math.max(
                untilEnough(minute,'tokens',minuteBudget,options.requiredTokens,tokenCeiling,60000),
                untilEnough(events,'tokens',dailyBudget,options.requiredTokens,limits.tokensPerDay,86400000),
                options.requiredTokens>remoteBudget?tokenReset:time,
                untilEnough(minute,'inputTokens',inputBudget??Infinity,options.requiredInput,options.inputTpm,60000),
                untilEnough(minute,'outputTokens',outputBudget??Infinity,options.requiredOutput,options.outputTpm,60000)
            );
        const requestUntil=Math.max(blockedUntil,
            active?time+1000:time,
            minute.length>=limits.requestsPerMinute?minute[minute.length-limits.requestsPerMinute].at+60000:time,
            requestCeiling>0&&events.length>=requestCeiling?events[events.length-requestCeiling].at+86400000:time,
            requestRemaining===0?requestReset:time);
        const until=Math.max(active?time:tokenUntil,requestUntil);
        return {availableTokenBudget,availableInputTokenBudget:inputBudget===null?null:Math.max(0,inputBudget),
            availableOutputTokenBudget:outputBudget===null?null:Math.max(0,outputBudget),
            reason,retryAfter:Math.max(1,Math.ceil((until-time)/1000))};
    };
    return {
        budget,
        reserve(tokens,options={}){
            const time=now();while(events.length&&events[0].at+86400000<=time)events.shift();
            const deny=(reason,until)=>({allowed:false,reason,retryAfter:Math.max(1,Math.ceil((until-time)/1000)),ticket:null});
            if(time<blockedUntil)return deny('provider_cooldown',blockedUntil);
            if(active)return deny('concurrent_request',time+1000);
            if(!Number.isSafeInteger(tokens)||tokens<=0||tokens>tokenCeiling)return deny('request_budget',time+60000);
            if(tokenReset>time&&tokenRemaining!==null&&tokens>tokenRemaining)return deny('provider_tokens',tokenReset);
            if(requestReset>time&&requestRemaining!==null&&requestRemaining<1)return deny('provider_requests',requestReset);
            const minute=events.filter(e=>e.at+60000>time),sum=list=>list.reduce((n,e)=>n+e.tokens,0);
            if(minute.length>=limits.requestsPerMinute||sum(minute)+tokens>tokenCeiling)return deny('minute_budget',(minute[0]?.at??time)+60000);
            if(events.length>=requestCeiling||sum(events)+tokens>limits.tokensPerDay)return deny('daily_budget',(events[0]?.at??time)+86400000);
            const split=budget(options);
            if(options.inputTpm!=null&&(count(options.inputTokens)===null||options.inputTokens+(options.margin??limits.margin)>split.availableInputTokenBudget))return deny('provider_input_budget',time+60000);
            if(options.outputTpm!=null&&(count(options.outputTokens)===null||options.outputTokens+(options.margin??limits.margin)>split.availableOutputTokenBudget))return deny('provider_output_budget',time+60000);
            const ticket={at:time,tokens,margin:options.margin??limits.margin,inputTokens:options.inputTokens??tokens,outputTokens:options.outputTokens??tokens};events.push(ticket);active=true;
            if(tokenReset>time&&tokenRemaining!==null)tokenRemaining=Math.max(0,tokenRemaining-tokens);
            if(requestReset>time&&requestRemaining!==null)requestRemaining=Math.max(0,requestRemaining-1);
            return {allowed:true,reason:null,retryAfter:0,ticket};
        },
        /** @param {any} ticket @param {ReturnType<typeof groqUsage>|null} usage */
        finish(ticket,usage=null,rejectedBeforeGeneration=false){
            // Uso não informado / timeout / erro: reter a reserva inteira, sem crédito fictício.
            const total=count(usage?.totalTokens);
            if(ticket&&total!==null){ticket.tokens=total+(ticket.margin??limits.margin);ticket.inputTokens=count(usage?.promptTokens)??ticket.inputTokens;ticket.outputTokens=count(usage?.completionTokens)??ticket.outputTokens;}
            // Keep RPM/RPD events. Release token reservation only for explicit pre-generation rejection.
            // A generated JSON failure, timeout, or unknown error MUST retain its reservation.
            else if(ticket&&rejectedBeforeGeneration){ticket.tokens=0;ticket.inputTokens=0;ticket.outputTokens=0;}
            active=false;
        },
        /** @param {Headers} headers @param {number} status @param {number|null} retryAfter */
        observe(headers,status=200,retryAfter=null){
            const time=now(),read=name=>{const raw=headers.get(name);return raw!==null&&/^\d+$/.test(raw)?count(Number(raw)):null;};
            const ceiling=read('x-ratelimit-limit-tokens');if(ceiling!==null&&ceiling>0)tokenCeiling=Math.min(limits.tokensPerMinute,ceiling);
            const requestLimit=read('x-ratelimit-limit-requests');if(requestLimit!==null)requestCeiling=Math.min(limits.requestsPerDay,requestLimit);
            const tokens=read('x-ratelimit-remaining-tokens'),requests=read('x-ratelimit-remaining-requests');
            if(tokens!==null){tokenRemaining=tokens;tokenReset=time+(resetMs(headers.get('x-ratelimit-reset-tokens'))??60000);}
            if(requests!==null){requestRemaining=requests;requestReset=time+(resetMs(headers.get('x-ratelimit-reset-requests'))??86400000);}
            if(status===429)blockedUntil=Math.max(blockedUntil,time+Math.max(1,retryAfter??60)*1000);
        }
    };
}
