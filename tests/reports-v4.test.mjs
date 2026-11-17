import {readFileSync,writeFileSync} from 'node:fs';
import {buildReport,buildReportManagement,compactReportContext} from '../supabase/functions/seguranca-viaria-ia/reports.js';
import {GROQ_INPUT_BUDGET,GROQ_MARGIN,GROQ_OUTPUT_BUDGET,GROQ_MAX_BODY_BYTES} from '../supabase/functions/seguranca-viaria-ia/groq-context.js';
const assert=(v,m)=>{if(!v)throw Error(m);},clone=v=>JSON.parse(JSON.stringify(v));
const stored={mesesLabels:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],indicadores:[
 {indicador:'Acidentes com culpa',setor:'Sinistros',und:'Qtd',meta:0,direcaoDesempenho:'menor_melhor',valores:[9,null,0,12,10,8,7,9,8,11,13,14]},
 {indicador:'Velocidade',setor:'Operação',und:'Qtd',meta:2,direcaoDesempenho:'menor_melhor',valores:Array(12).fill(4)},
 {indicador:'Conformidade documental',setor:'Frota',und:'%',meta:95,direcaoDesempenho:'maior_melhor',valores:Array(12).fill(80)},
 {indicador:'Sem classificação',setor:'Gestão',und:'Qtd',meta:null,valores:Array(12).fill(null)},
 {indicador:'Indicador neutro de velocidade',setor:'Gestão',und:'Qtd',meta:0,direcaoDesempenho:'neutro',valores:Array(12).fill(8)}]};
const original=JSON.stringify(stored),selection={type:'executivo',sector:'TODOS',ids:stored.indicadores.map((_,i)=>`indice:${i}`),start:'Jan',end:'Dez'};
for(const type of ['mensal','trimestral','anual','executivo','comparativo','critico']){
 const r=buildReport(stored,{...selection,type,end:type==='mensal'?'Jan':type==='trimestral'?'Mar':'Dez'});
 assert(r.management.version===4&&r.management.actionPlan.length>0,'Tipo/fallback '+type);
 assert(!r.management.priorityRisks.some(i=>i.indicatorId==='indice:4'),'Neutro recebeu criticidade');
}
const report=buildReport(stored,selection),stats=JSON.stringify(report.indicators);
writeFileSync('.validation-tools/report-v4-fixture.json',JSON.stringify(buildReport(stored,{...selection,type:'comparativo'})));
const proposal={executiveDiagnosis:[{indicatorId:'indice:0',stat:'ultimo'}],priorityRisks:[{indicatorId:'indice:0'}],actionPlan:[{indicatorId:'indice:0',strategy:'defensiva'},{indicatorId:'indice:1',strategy:'velocidade'}],campaignSuggestions:[{indicatorId:'indice:0',strategy:'distracao'}],communicationSuggestions:[{indicatorId:'indice:0',strategy:'distracao',channel:'stories',format:'cards'}],limitations:['agregados','causalidade']};
const management=buildReportManagement(report,JSON.stringify(proposal));
assert(management.audit.structured&&!management.audit.fallback&&management.actionPlan.length===2,'Resposta válida');
assert(management.campaignSuggestions[0].basis==='Preventiva geral'&&management.campaignSuggestions[0].limitations.includes('não representa ação executada'),'Prevenção/causalidade');
assert(management.actionPlan[0].evidence[0].text.includes('14')&&management.actionPlan[0].suggestedTimeline.includes('Proposta'),'Evidência/prazo');
for(const raw of ['{',JSON.stringify({actionPlan:[]}),JSON.stringify({...proposal,actionPlan:[]}),JSON.stringify({...proposal,actionPlan:[{indicatorId:'inventado',strategy:'defensiva'}]}),JSON.stringify({...proposal,actionPlan:[{indicatorId:'indice:0',strategy:'defensiva',evidence:'50% causado por celular'}]}),JSON.stringify({...proposal,communicationSuggestions:[{indicatorId:'indice:0',strategy:'distracao',channel:'stories',format:'cards',message:'DADOS PRIVADOS'}]}),JSON.stringify({...proposal,actionPlan:[{indicatorId:'indice:4',strategy:'velocidade'}]})]){
 const m=buildReportManagement(report,raw);assert(m.audit.fallback&&m.actionPlan.length>0&&!JSON.stringify(m).includes('DADOS PRIVADOS'),'Inválido não caiu no fallback');
}
assert(JSON.stringify(report.indicators)===stats&&JSON.stringify(stored)===original,'Cálculos/snapshot alterados');
const window={};new Function('window',readFileSync('public/report-content.js','utf8'))(window);
assert(window.ReportContent.valid(management,report),'Contrato frontend');
const noData=buildReport(stored,{...selection,ids:['indice:3']});assert(noData.management.actionPlan[0].title.includes('Qualidade')&&!noData.management.campaignSuggestions.length,'Ausência de dados');
const empty=buildReport(stored,{...selection,type:'critico',ids:['indice:4']});assert(!empty.indicators.length&&!empty.management.actionPlan.length,'Recorte crítico vazio');
const many={...stored,indicadores:Array.from({length:40},(_,n)=>({...clone(stored.indicadores[n%3]),indicador:`${stored.indicadores[n%3].indicador} ${n}`}))};
const long=buildReport(many,{...selection,type:'anual',ids:many.indicadores.map((_,n)=>`indice:${n}`)}),compact=compactReportContext(long);
const body=JSON.stringify({model:'openai/gpt-oss-120b',messages:compact.messages,temperature:.3,max_completion_tokens:GROQ_OUTPUT_BUDGET,response_format:{type:'json_object'},reasoning_effort:'low'});
assert(new TextEncoder().encode(body).length<=GROQ_MAX_BODY_BYTES&&compact.estimatedTokens<=GROQ_INPUT_BUDGET-GROQ_MARGIN&&compact.omitted>0,'Orçamento completo');
assert(JSON.parse(compact.messages[1].content).partial&&buildReportManagement(long,JSON.stringify(proposal),compact.sentIds).limitations.some(s=>s.includes('parcial')),'Parcialidade explícita');
const m={exports:{}};new Function('module','exports',readFileSync('public/vendor/jspdf-4.2.1.umd.min.js','utf8'))(m,m.exports);const table={exports:{}};new Function('module','exports','require',readFileSync('public/vendor/jspdf-autotable-5.0.8.min.js','utf8'))(table,table.exports,()=>m.exports);table.exports.applyPlugin(m.exports.jsPDF);window.jspdf=m.exports;
new Function('window',readFileSync('public/report-pdf.js','utf8'))(window);
const sections=window.ReportContent.sections({...report,management});assert(sections.final.some(s=>s.title.includes('PLANO DE AÇÃO'))&&sections.final.some(s=>s.title.includes('Comunicação')),'Seções compartilhadas');
const doc=window.ReportPdf.build(long);assert(doc.getNumberOfPages()>40,'PDF dezenas de indicadores não exercitado');
writeFileSync('.validation-tools/report-v4-dozens.pdf',new Uint8Array(doc.output('arraybuffer')));
const expanded=clone(report);expanded.management=management;expanded.management.actionPlan[0].actions=Array(60).fill('AÇÃO EXTENSA: avaliar procedimentos sem atribuir causas, preservar revisões e acompanhar a qualidade dos registros.').concat('MARCADOR FINAL DA TRATATIVA');
const events=[];const extended=await window.ReportPdf.buildAsync(expanded,[],e=>events.push(e),()=>Promise.resolve());
assert(extended.internal.pages.some(p=>p?.join(' ').includes('MARCADOR FINAL DA TRATATIVA')),'Recomendação longa cortada');
assert(events.some(e=>e.stage==='diagnosis')&&events.some(e=>e.stage==='management')&&events.filter(e=>e.stage==='finalize').length===extended.getNumberOfPages(),'Progresso real V4');
for(let p=1;p<=extended.getNumberOfPages();p++)assert(extended.internal.pages[p].join(' ').includes("D'GRANEL"),'Cabeçalho de continuação');
writeFileSync('.validation-tools/report-v4-actions.pdf',new Uint8Array(extended.output('arraybuffer')));
writeFileSync('.validation-tools/report-v4-inspection.json',JSON.stringify({actionPage:extended.internal.pages.findIndex(p=>p?.join(' ').includes('PLANO DE')),lastPage:extended.getNumberOfPages()}));
const front=readFileSync('public/reports.js','utf8'),pdf=readFileSync('public/report-pdf.js','utf8');
assert(!/IA \$\{|IA utilizada|IA não utilizada|utilizada como apoio interpretativo|não utilizada; análise determinística/.test(front+pdf),'Indicação visual de execução');
console.log('PASS V4 seis tipos, números preservados, meta zero/nulos/neutro, JSON válido/inválido, referências/causalidade, ausência de ações/dados, comunicação segura e contrato compartilhado');
console.log('PASS PDF dezenas e recomendações extensas, continuação, cabeçalhos e progresso real. Páginas:',doc.getNumberOfPages(),extended.getNumberOfPages());
console.log('PASS orçamento V4',JSON.stringify({requestBytes:new TextEncoder().encode(body).length,inputEstimatedTokens:compact.estimatedTokens,sent:compact.sent,omitted:compact.omitted,outputBudget:GROQ_OUTPUT_BUDGET}));
