import {readFileSync,writeFileSync} from 'node:fs';
import {buildReport,buildReportManagement} from '../supabase/functions/seguranca-viaria-ia/reports.js';
const assert=(v,m)=>{if(!v)throw Error(m);};const clone=v=>JSON.parse(JSON.stringify(v));
const m={exports:{}};new Function('module','exports',readFileSync('public/vendor/jspdf-4.2.1.umd.min.js','utf8'))(m,m.exports);
const t={exports:{}};new Function('module','exports','require',readFileSync('public/vendor/jspdf-autotable-5.0.8.min.js','utf8'))(t,t.exports,()=>m.exports);t.exports.applyPlugin(m.exports.jsPDF);
const win={jspdf:m.exports};new Function('window',readFileSync('public/report-content.js','utf8'))(win);new Function('window',readFileSync('public/report-pdf.js','utf8'))(win);
let old=null;try{old={...win};new Function('window',readFileSync('.validation-tools/v5-before/report-pdf.js','utf8'))(old);}catch{old=null;}
const labels=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const fixture={mesesLabels:labels,indicadores:[
 {indicador:'Acidentes com culpa',setor:'Sinistros',und:'Qtd',meta:0,direcaoDesempenho:'menor_melhor',valores:[9,null,0,12,10,8,7,9,8,11,13,14]},
 {indicador:'Velocidade',setor:'Operação',und:'Qtd',meta:2,direcaoDesempenho:'menor_melhor',valores:Array(12).fill(4)},
 {indicador:'Conformidade documental',setor:'Frota',und:'%',meta:95,direcaoDesempenho:'maior_melhor',valores:Array(12).fill(80)},
 {indicador:'Sem classificação',setor:'Gestão',und:'Qtd',meta:null,valores:Array(12).fill(null)},
 {indicador:'Indicador neutro de velocidade',setor:'Gestão',und:'Qtd',meta:0,direcaoDesempenho:'neutro',valores:Array(12).fill(8)}]};
const base=buildReport(fixture,{type:'comparativo',sector:'TODOS',ids:fixture.indicadores.map((_,n)=>`indice:${n}`),start:'Jan',end:'Dez'});
const metrics=[];
assert(win.ReportContent.evolution(base.indicators[0]).includes('piora descritiva'),'Direção menor melhor');
assert(win.ReportContent.evolution(base.indicators[3]).includes('indisponível'),'Ausência não pode virar estabilidade');
assert(win.ReportContent.evolution(base.indicators[4]).includes('sem classificação'),'Neutro não pode virar melhora');
const improved=clone(base.indicators[0]);improved.estatisticas.primeiroUltimo.absoluta=-2;assert(win.ReportContent.evolution(improved).includes('melhora descritiva'),'Melhora menor melhor');improved.direcaoDesempenho='maior_melhor';assert(win.ReportContent.evolution(improved).includes('piora descritiva'),'Piora maior melhor');
function check(r,name,images=[]){
 const before=JSON.stringify(r),heap=Deno.memoryUsage().heapUsed,start=performance.now();const pdf=win.ReportPdf.build(r,images),ms=performance.now()-start,mem=Deno.memoryUsage().heapUsed-heap;
 const meta=pdf.reportLayout;assert(JSON.stringify(r)===before,'Mutação do relatório '+name);assert(meta.coverage.length===r.indicators.length&&meta.coverage.every((x,n)=>x.months===r.indicators[n].estatisticas.mensais.length),'Cobertura incompleta');
 assert(meta.figures.length===images.filter(Boolean).length&&new Set(meta.figures.map(f=>f.id)).size===meta.figures.length,'Gráficos omitidos ou duplicados');
 assert(!meta.blocks.some(b=>/^Total de páginas:/.test(b.text??'')),'Contagem redundante pode criar página vazia');
 assert(Math.abs(pdf.internal.pageSize.getWidth()-210)<.1&&Math.abs(pdf.internal.pageSize.getHeight()-297)<.1,'Formato A4');
 for(const b of meta.blocks)assert(b.x>=29.99&&b.x+b.width<=190.01&&b.y>=29.99&&b.bottom<=277.01,`Margem/overflow ${name}: ${JSON.stringify(b)}`);
 const fmt=v=>v===null||v===undefined?'Indisp.':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v),normal=s=>s.replace(/\s+/g,'');
 const summaryTable=meta.tables.find(t=>t.title==='Estatísticas determinísticas por indicador');
 for(const [row,i] of r.indicators.entries()){
  const s=i.estatisticas,expected=[fmt(s.media),s.somaAplicavel?fmt(s.soma):'N/A',fmt(s.minimo),fmt(s.maximo),String(s.ausentes)];
  for(const [n,value] of expected.entries()){const cell=meta.blocks.find(b=>b.kind==='cell'&&b.table===summaryTable.number&&b.row===row&&b.column===n+1);assert(cell&&normal(cell.text)===normal(value),'Estatística desenhada divergente '+name+' '+i.id);}
 }
 for(let offset=0;offset<r.competencias.length;offset+=meta.historyColumns){const months=r.competencias.slice(offset,offset+meta.historyColumns),tab=meta.tables.find(t=>t.title===`Histórico – ${months[0]} a ${months.at(-1)}`);
  for(const [row,i] of r.indicators.entries())for(const [column,c] of months.entries()){
   const p=i.estatisticas.mensais.find(p=>p.competencia===c),expected=`${p.valor===null?'Ausente':fmt(p.valor)} ${fmt(p.variacaoAnterior?.absoluta)} ${fmt(p.variacaoAnterior?.percentual)}%`;
   const cell=meta.blocks.find(b=>b.kind==='cell'&&b.table===tab.number&&b.row===row&&b.column===column+1);assert(cell&&normal(cell.text)===normal(expected),'Série desenhada divergente '+name+' '+i.id+' '+c);
  }
 }
 for(const e of meta.toc)assert(e.page>meta.tocPage&&e.page<=meta.pages,'Sumário inválido');
 assert(meta.toc.map(e=>e.title).slice(0,7).every((x,n)=>x.startsWith(String(n+1)+' ')),'Seções progressivas');
 for(let p=1;p<=meta.pages;p++)assert(pdf.internal.pages[p].join(' ').includes("D'GRANEL"),'Cabeçalho '+p);
 const bytes=new Uint8Array(pdf.output('arraybuffer'));writeFileSync('.validation-tools/'+name+'.pdf',bytes);
 const baseline=old?.ReportPdf.build(r,images);const metric={name,indicators:r.indicators.length,pagesBefore:baseline?.getNumberOfPages()??null,pages:meta.pages,bytesBefore:baseline?.output('arraybuffer').byteLength??null,bytes:bytes.length,ms:Math.round(ms),heapDelta:mem};metrics.push(metric);
 writeFileSync('.validation-tools/'+name+'-layout.json',JSON.stringify(meta));return pdf;
}
const stored={mesesLabels:base.competencias,indicadores:[]};
for(const count of [1,5,15,40]){
 stored.indicadores=Array.from({length:count},(_,n)=>({...clone(base.indicators[n%base.indicators.length]),id:undefined,indicador:base.indicators[n%base.indicators.length].indicador+' '+n,und:base.indicators[n%base.indicators.length].unidade}));
 const selection={sector:'TODOS',ids:stored.indicadores.map((_,n)=>`indice:${n}`),start:stored.mesesLabels[0],end:stored.mesesLabels.at(-1)};
 for(const type of ['executivo','mensal','trimestral','anual','comparativo','critico']){
  const r=buildReport(stored,{...selection,type,end:type==='mensal'?stored.mesesLabels[0]:type==='trimestral'?stored.mesesLabels[2]:selection.end});
  check(r,`v5-${type}-${count}`);
 }
}
const edge=clone(base);edge.indicators[0].indicador='TÍTULO LONGO '+('com revisão retroativa e qualidade dos registros '.repeat(20));
edge.management=buildReportManagement(edge);
edge.management.actionPlan[0].actions=Array.from({length:90},(_,n)=>`AÇÃO ${n}: avaliar procedimentos sem atribuir causas; preservar registros e acompanhar as próximas competências.`).concat('MARCADOR FINAL DA TRATATIVA');
const long=check(edge,'v5-extenso');assert(long.internal.pages.some(p=>p?.join(' ').includes('MARCADOR FINAL DA TRATATIVA')),'Texto longo perdido');
const ai=clone(base);ai.management=buildReportManagement(ai,JSON.stringify({executiveDiagnosis:[{indicatorId:ai.indicators[0].id,stat:'ultimo'}],priorityRisks:[{indicatorId:ai.indicators[0].id}],actionPlan:[{indicatorId:ai.indicators[0].id,strategy:'defensiva'}],campaignSuggestions:[],communicationSuggestions:[],limitations:['agregados']}));check(ai,'v5-estruturado');
// A projeção de conteúdo antigo e novo continua contendo as mesmas propostas e valores.
if(old){const previousContent={};new Function('window',readFileSync('.validation-tools/v5-before/report-content.js','utf8'))(previousContent);assert(JSON.stringify(previousContent.ReportContent.sections(base))===JSON.stringify(win.ReportContent.sections(base)),'Propostas V4 modificadas');}
// Verifica as células efetivamente desenhadas, não apenas a presença do objeto em memória.
const complete=win.ReportPdf.build(base),normal=s=>s.replace(/\s+/g,'');
for(let offset=0;offset<base.competencias.length;offset+=complete.reportLayout.historyColumns){const months=base.competencias.slice(offset,offset+complete.reportLayout.historyColumns),tab=complete.reportLayout.tables.find(t=>t.title===`Histórico – ${months[0]} a ${months.at(-1)}`);
 for(const [n,i] of base.indicators.entries())for(const [column,c] of months.entries()){
  const p=i.estatisticas.mensais.find(p=>p.competencia===c),fmt=v=>v===null||v===undefined?'Indisp.':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v);
  const expected=`${p.valor===null?'Ausente':fmt(p.valor)} ${fmt(p.variacaoAnterior?.absoluta)} ${fmt(p.variacaoAnterior?.percentual)}%`;
  const cell=complete.reportLayout.blocks.find(b=>b.kind==='cell'&&b.table===tab.number&&b.row===n&&b.column===column+1);
  assert(cell&&normal(cell.text)===normal(expected),'Histórico desenhado divergente '+i.id+' '+c);
 }
}
const oversized=clone(base);oversized.management.actionPlan[0].suggestedOwner='RESPONSÁVEL EXTENSO '.repeat(180)+'FIM RESPONSÁVEL';const giant=check(oversized,'v5-celula-extensa');assert(normal(giant.reportLayout.blocks.map(b=>b.text??'').join(' ')).includes(normal('FIM RESPONSÁVEL')),'Célula longa cortada');
const events=[];const asyncPdf=await win.ReportPdf.buildAsync(base,[],e=>events.push(e),()=>Promise.resolve());assert(events.filter(e=>e.stage==='compose').length===base.indicators.length&&events.filter(e=>e.stage==='finalize').length===asyncPdf.getNumberOfPages(),'Progresso real');
// Opcional: imagens Chart.js reais capturadas pelo harness isolado do navegador.
let graphFixtures=[];try{graphFixtures=JSON.parse(readFileSync('.validation-tools/v5-chart-images.json','utf8'));}catch{/* Sem assets auxiliares, não declarar esse cenário como executado. */}
for(const sample of graphFixtures)check(sample.report,'v5-graficos-'+sample.report.indicators.length,sample.images);
if(graphFixtures.length)console.log('PASS gráficos reais capturados no navegador:',graphFixtures.map(s=>s.report.indicators.length).join('/'));
writeFileSync('.validation-tools/v5-metrics.json',JSON.stringify(metrics,null,2));console.log('PASS V5: 24 combinações 6 tipos × 1/5/15/40, casos extensos e estruturados, A4, margens, cobertura, imutabilidade, sumário e progresso.');console.log(JSON.stringify(metrics.filter(x=>x.name.includes('executivo')||x.name==='v5-extenso')));
