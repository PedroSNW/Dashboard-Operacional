import {createGroqGuard,GROQ_LIMITS,groqUsage,groqProfile,resetMs,safeFinishReason} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {compactReportContext,buildReportManagement,buildReport} from '../supabase/functions/seguranca-viaria-ia/reports.js';
import {GROQ_MAX_BODY_BYTES,GROQ_INPUT_BUDGET,GROQ_MARGIN,groqFailure} from '../supabase/functions/seguranca-viaria-ia/groq-context.js';
import {fixture,payload,profiles,evaluate} from './groq-v51-benchmark.mjs';
const assert=(ok,msg)=>{if(!ok)throw Error(msg);};let time=0;
const clock=()=>time,guard=createGroqGuard(clock),cost=3100+2048+400;
let a=guard.reserve(cost);assert(a.allowed,'Reserva inicial');assert(!guard.reserve(100).allowed,'Concorrência permitida');guard.finish(a.ticket);
assert(!guard.reserve(cost).allowed,'TPM não reservado com uso desconhecido');time=60000;a=guard.reserve(cost);assert(a.allowed,'Janela não liberada');guard.finish(a.ticket,{totalTokens:500});
a=guard.reserve(cost);assert(a.allowed,'Uso real não conciliado');guard.finish(a.ticket);
const headers=new Headers({'x-ratelimit-limit-tokens':'8000','x-ratelimit-remaining-tokens':'100','x-ratelimit-reset-tokens':'1m2.5s'});guard.observe(headers);
assert(guard.reserve(500).retryAfter===63,'Headers de tokens ignorados');time+=63000;a=guard.reserve(500);assert(a.allowed,'Reset header');guard.finish(a.ticket);
guard.observe(new Headers(),429,120);assert(guard.reserve(500).retryAfter===120,'Retry-After');time+=120000;a=guard.reserve(500);assert(a.allowed,'Cooldown expirado');guard.finish(a.ticket);
const daily=createGroqGuard(clock,{...GROQ_LIMITS,tokensPerDay:7000});a=daily.reserve(6000);daily.finish(a.ticket);time+=60000;assert(daily.reserve(2000).reason==='daily_budget','TPD ignorado');time+=86400000;assert(daily.reserve(2000).allowed,'Janela diária');
const requests=createGroqGuard(clock,{...GROQ_LIMITS,requestsPerMinute:1});a=requests.reserve(1);requests.finish(a.ticket);assert(requests.reserve(1).reason==='minute_budget','RPM ignorado');
const rpd=createGroqGuard(clock,{...GROQ_LIMITS,requestsPerDay:1});a=rpd.reserve(1);rpd.finish(a.ticket);time+=60000;assert(rpd.reserve(1).reason==='daily_budget','RPD ignorado');
const remote=createGroqGuard(clock);remote.observe(new Headers({'x-ratelimit-remaining-requests':'0','x-ratelimit-reset-requests':'24h'}));assert(remote.reserve(1).retryAfter===86400,'Cota remota diária ignorada');
const lower=createGroqGuard(clock);lower.observe(new Headers({'x-ratelimit-limit-tokens':'2000'}));assert(lower.reserve(2048).reason==='request_budget','Teto real inferior ignorado');
const lowerRpd=createGroqGuard(clock);lowerRpd.observe(new Headers({'x-ratelimit-limit-requests':'1'}));a=lowerRpd.reserve(1);lowerRpd.finish(a.ticket);time+=60000;assert(lowerRpd.reserve(1).reason==='daily_budget','Header de limite RPD ignorado');
assert(resetMs('1h2m3.5s')===3723500&&resetMs('texto privado')===null,'Parser de reset');
const usage=groqUsage({usage:{prompt_tokens:100,completion_tokens:200,total_tokens:300,completion_tokens_details:{reasoning_tokens:150}}});assert(usage.totalTokens===300&&usage.reasoningTokens===150,'Raciocínio somado duas vezes');
assert(groqUsage({}).totalTokens===null&&groqUsage({usage:{total_tokens:-1}}).totalTokens===null,'Uso ausente/inválido virou zero');
assert(groqUsage({usage:{prompt_tokens:100,completion_tokens:200,total_tokens:1}}).totalTokens===300,'Total inconsistente subcontado');
assert(groqProfile(true,'openai/gpt-oss-120b').maxCompletionTokens===2048&&groqProfile(true,'openai/gpt-oss-120b').reasoningEffort==='medium'&&groqProfile(false,'openai/gpt-oss-120b').maxCompletionTokens===1200&&groqProfile(true,'custom').reasoningEffort===null,'Perfis');
assert(safeFinishReason('SECRET')==='unknown','Finish reason não sanitizado');
for(const [selected,total] of [[1,1],[2,2],[5,75],[15,75],[75,75]]){
 const r=fixture(selected,total),before=JSON.stringify(r),compact=compactReportContext(r),input=JSON.parse(compact.messages[1].content);
 assert(compact.estimatedTokens<=GROQ_INPUT_BUDGET-GROQ_MARGIN&&compact.sent+compact.omitted===selected,'Orçamento/cobertura');
 assert(input.indicators.every(i=>r.indicators.some(v=>v.id===i.id))&&input.total===selected,'Escopo do usuário ignorado');
 if(selected===5){assert(compact.sent===5&&input.indicators.some(i=>i.target===0)&&input.indicators.some(i=>i.last===null),'Nulos/meta zero ou contexto pequeno perdidos');}
 if(selected>15)assert(compact.omitted>0&&input.partial,'75 enviados indiscriminadamente');
 for(const profile of profiles){const body=payload(compact,profile);assert(new TextEncoder().encode(JSON.stringify(body)).length<=GROQ_MAX_BODY_BYTES&&compact.estimatedTokens+profile.maxCompletionTokens+GROQ_MARGIN<=8000&&!Object.hasOwn(body,'max_tokens'),'Envelope/reserva');}
 assert(JSON.stringify(r)===before,'Snapshot alterado');
}
const r=fixture(),before=JSON.stringify(r.indicators),compact=compactReportContext(r);
const noTarget=buildReport({mesesLabels:['Jan','Fev'],indicadores:[{indicador:'Sem meta',setor:'Teste',und:'Qtd',meta:null,direcaoDesempenho:'menor_melhor',valores:[1,2]}]},{type:'comparativo',sector:'TODOS',ids:['indice:0'],start:'Jan',end:'Fev'});
assert(JSON.parse(compactReportContext(noTarget).messages[1].content).indicators[0].persistence.outside===null,'Persistência sem meta não pode virar zero');
const proposal={executiveDiagnosis:[{indicatorId:'indice:0',stat:'evolucao'}],priorityRisks:[{indicatorId:'indice:1'}],actionPlan:[{indicatorId:'indice:0',strategy:'defensiva'},{indicatorId:'indice:0',strategy:'defensiva'}],campaignSuggestions:[{indicatorId:'indice:0',strategy:'distracao'}],communicationSuggestions:[{indicatorId:'indice:0',strategy:'distracao',channel:'stories',format:'cards'}],limitations:['causalidade']};
const m=buildReportManagement(r,JSON.stringify(proposal),compact.sentIds);
assert(m.audit.structured&&m.executiveDiagnosis[0].evidence[0].includes('variação absoluta')&&m.actionPlan[0].evidence[0].text===m.executiveDiagnosis[0].evidence[0],'Referência de tendência ignorada');
assert(m.priorityRisks[0].indicatorId==='indice:1'&&m.priorityRisks.length===r.indicators.filter(i=>i.critical).length,'Ordem ou cobertura dos riscos');
assert(m.actionPlan.length===1&&m.campaignSuggestions.length===1&&m.communicationSuggestions[0].channel==='Instagram · stories','Deduplicação/comunicação');
for(const invalid of ['{',JSON.stringify({...proposal,actionPlan:[{indicatorId:'indice:70',strategy:'defensiva'}]}),JSON.stringify({...proposal,actionPlan:[{indicatorId:'indice:0',strategy:'inventada'}]}),JSON.stringify({...proposal,actionPlan:[{indicatorId:'indice:0',strategy:'defensiva',cause:'SECRET'}]})])assert(evaluate(r,invalid,compact.sentIds).fallback,'Resposta inválida aceita');
for(const profile of profiles){const result=evaluate(r,JSON.stringify(proposal),compact.sentIds);assert(result.validatedSelection&&result.uniqueActions&&result.deterministicValuesUnchanged,'Contrato do perfil '+profile.name);}
assert(evaluate(r,'{"incompleto":',compact.sentIds,'length').fallback&&JSON.stringify(r.indicators)===before,'Truncamento ou cálculo');
for(const message of ['TPD limit','requests per day']){const f=await groqFailure(Response.json({error:{message}},{status:429}));assert(f.category==='quota','Cota diária classificada como TPM');}
console.log('PASS V5.1: perfis 1200/low, 2048/medium e 3072/medium; mesmos fixtures, bytes/tokens estimados, escopo 1/2/5/15/75, null/meta zero, referências, prioridades, catálogo/Instagram, deduplicação, fallback, TPM/RPM/TPD/RPD, headers/reset/Retry-After, concorrência, uso desconhecido e raciocínio sem dupla contagem. Qualidade real do modelo não medida.');
