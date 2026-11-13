import {compactGroqContext,estimateTokens,GROQ_MARGIN,GROQ_INPUT_BUDGET,GROQ_MAX_BODY_BYTES,GROQ_OUTPUT_BUDGET,groqFailure} from '../supabase/functions/seguranca-viaria-ia/groq-context.js';
import {analyzeIndicator,analyticalResponse} from '../supabase/functions/seguranca-viaria-ia/analytics.js';
import {readFileSync} from 'node:fs';
const assert=(v,m)=>{if(!v)throw Error(m);};
const make=(count,months)=>{
 const competencias=Array.from({length:months},(_,i)=>`${i%12+1}/${2020+Math.floor(i/12)}`);
 const indicadores=Array.from({length:count},(_,i)=>{const item={id:`i${i}`,indicador:i<2?`Acidentes ${i}`:`Indicador ${i}`,setor:'Segurança',unidade:'Qtd',meta:30,direcaoDesempenho:'menor_melhor',valores:competencias.map((_,j)=>j%4===0?null:j)};return {...item,estatisticas:analyzeIndicator(item,competencias)};});
 return {competencias,indicadores,totalIndicadoresNoDashboard:count,totalIndicadoresSelecionados:count,contextoParcial:false};
};
for(const [name,count,months,question] of [['dois indicadores',2,9],['dez indicadores',10,9,'Todos os indicadores'],['75 disponíveis, acidentes',75,12],['pergunta geral',75,12,'Analise todos os indicadores'],['muitas competências',2,120]]){
 const context=make(count,months), original=JSON.stringify(context), prompt=question??'Analise acidentes';
 const compact=compactGroqContext(context,prompt);
 assert(compact.estimatedTokens<=GROQ_INPUT_BUDGET-GROQ_MARGIN,name+' orçamento');
 assert(JSON.stringify(context)===original,'Snapshot alterado');
 const sent=JSON.parse(compact.messages[1].content.slice(compact.messages[1].content.indexOf('{')));
 assert(sent.indicadores[0].indicador==='Acidentes 0','Priorização');
 assert(sent.indicadores[0].estatisticas.soma===context.indicadores[0].estatisticas.soma,'Precisão');
 assert(compact.omitted===0&&compact.summarized===0 || sent.contextoParcial,'Parcialidade');
 for(const item of sent.indicadores)if(item.valores)assert(item.valores.length===months && item.valores[0]===null,'Série truncada/null');
 const back=readFileSync('supabase/functions/seguranca-viaria-ia/index.ts','utf8');
 const instructions=back.slice(back.indexOf('    const SYSTEM_INSTRUCTION_TEXT ='),back.indexOf('    // 5. Integração com OpenAI'));
 const oldMessages=new Function('contextText','prompt',instructions+';return [{role:"system",content:EFFECTIVE_SYSTEM_INSTRUCTION},{role:"user",content:MODEL_USER_INPUT}];')(original,prompt);
 const model='openai/gpt-oss-120b';
 const beforeBody=JSON.stringify({model,messages:oldMessages,temperature:0.3,max_tokens:4096});
 const afterBody=JSON.stringify({model,messages:compact.messages,temperature:0.3,max_completion_tokens:GROQ_OUTPUT_BUDGET,reasoning_effort:'low'});
 const afterBytes=new TextEncoder().encode(afterBody).length;
 assert(afterBytes<=GROQ_MAX_BODY_BYTES,'Corpo completo acima do limite');
 if(!question) assert(compact.sent===2,'Enviou indicadores desnecessários');
 if(name==='dois indicadores')assert(sent.indicadores[0].meta===30,'Meta alterada');
 console.log('PASS',name,JSON.stringify({beforeRequestBytes:new TextEncoder().encode(beforeBody).length,beforeEstimate:estimateTokens(oldMessages),afterRequestBytes:afterBytes,afterEstimate:compact.estimatedTokens,sent:compact.sent,omitted:compact.omitted,summarized:compact.summarized}));
 assert(analyticalResponse(context,'Análise qualitativa.').includes('Soma:'),'Relatório matemático perdido');
}
for(const [status,message,category] of [[429,'tokens per minute','tokens'],[429,'requests limit','requests'],[429,'daily quota','quota'],[400,'context length exceeded','context_limit'],[400,'unsupported parameter','invalid_request'],[413,'too big','payload_too_large']]){
 const res=await groqFailure(Response.json({error:{code:'SECRET',message:message+' SECRET'}},{status,headers:{'retry-after':'30','x-request-id':'req-safe'}}));
 assert(res.category===category && res.retryAfter===30 && !JSON.stringify(res).includes('SECRET'),'Diagnóstico');
}
let summaryTest=false;
for(let months=130;months<=400;months+=10){
 try {const c=compactGroqContext(make(2,months),'Analise acidentes');if(c.summarized){assert(c.estimatedTokens<=3100,'Resumo acima orçamento');summaryTest=true;break;}}catch(e){if(e.message!=='GROQ_CONTEXT_BUDGET')throw e;}
}
assert(summaryTest,'Estratégia de resumo não exercitada');
let rejected=false;try{compactGroqContext(make(2,1200),'Analise acidentes');}catch(e){rejected=e.message==='GROQ_CONTEXT_BUDGET';}
assert(rejected,'Contexto impossível não rejeitado com segurança');
const zero=make(2,9);zero.indicadores[0].meta=0;
const zeroSent=compactGroqContext(zero,'Acidentes');
const zeroData=JSON.parse(zeroSent.messages[1].content.slice(zeroSent.messages[1].content.indexOf('{')));
assert(zeroData.indicadores[0].meta===0 && zeroData.indicadores[0].valores[0]===null,'Null/meta zero perdidos');
console.log('PASS classificação 429/400/413, retry-after, sanitização, resumo e orçamento impossível');
