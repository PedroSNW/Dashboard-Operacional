import {readFileSync,writeFileSync} from 'node:fs';
import {buildReport} from '../supabase/functions/seguranca-viaria-ia/reports.js';
import {context,report as sampleReport} from './report-fixtures.mjs';
const m={exports:{}};new Function('module','exports',readFileSync('public/vendor/jspdf-4.2.1.umd.min.js','utf8'))(m,m.exports);
const table={exports:{}};new Function('module','exports','require',readFileSync('public/vendor/jspdf-autotable-5.0.8.min.js','utf8'))(table,table.exports,()=>m.exports);table.exports.applyPlugin(m.exports.jsPDF);
const source=readFileSync('public/reports.js','utf8');
const code=source.slice(source.indexOf('window.buildManagementPdf ='),source.indexOf('\nasync function exportManagementReport'));
const win={jspdf:m.exports};
new Function('window',readFileSync('public/report-content.js','utf8'))(win);
new Function('window',readFileSync('public/report-pdf.js','utf8'))(win);
new Function('window','reportValue',code)(win,v=>v===null||v===undefined?'Ausente':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v));
const stored={mesesLabels:Array.from({length:60},(_,n)=>`${n%12+1}/${2020+Math.floor(n/12)}`),indicadores:Array.from({length:4},(_,n)=>({indicador:`Indicador gerencial ${n}`,setor:'Sinistros',und:'Qtd',meta:0,direcaoDesempenho:'menor_melhor',valores:Array.from({length:60},(_,i)=>i%6===0?null:i)}))};
const report=buildReport(stored,{type:'comparativo',sector:'TODOS',ids:['indice:0','indice:1','indice:2','indice:3'],start:'1/2020',end:'12/2024'});
const doc=win.buildManagementPdf(report);
for(let page=1;page<=doc.getNumberOfPages();page++)if(!doc.internal.pages[page].join('\n').includes("D'GRANEL"))throw Error('Cabeçalho ausente na página '+page);
if(doc.getNumberOfPages()<5)throw Error('Paginação multipágina não exercitada');
const buffer=new Uint8Array(doc.output('arraybuffer'));writeFileSync('.validation-tools/report-test.pdf',buffer);
writeFileSync('.validation-tools/report-fixture.json',JSON.stringify(report));
console.log(`PASS PDF A4 com ${doc.getNumberOfPages()} páginas e ${buffer.length} bytes; tabelas paginadas. Artefato: .validation-tools/report-test.pdf`);
const short=buildReport(stored,{type:'comparativo',sector:'TODOS',ids:['indice:0','indice:1'],start:'1/2020',end:'9/2020'});
const shortPdf=win.buildManagementPdf(short);if(shortPdf.getNumberOfPages()>10)throw Error('Espaço excessivo no relatório curto com plano de ação');
console.log('PASS relatório curto compacto: '+shortPdf.getNumberOfPages()+' páginas');
const narrative=win.buildManagementPdf({...short,management:undefined,aiUsed:true,interpretation:Array(120).fill('ANALISE GERENCIAL TESTE: investigar registros sem presumir causas e preservar revisões retroativas.').join('\n')});
if(narrative.getNumberOfPages()<=shortPdf.getNumberOfPages()||!narrative.internal.pages.some(p=>p?.join(' ').includes('ANALISE GERENCIAL TESTE')))throw Error('Interpretação longa não preservada');
for(let page=1;page<=narrative.getNumberOfPages();page++)if(!narrative.internal.pages[page].join('\n').includes("D'GRANEL"))throw Error('Cabeçalho ausente na interpretação longa');
console.log('PASS interpretação longa, continuação e cabeçalhos em todas as páginas');
const progress=[];
const asyncDoc=await win.ReportPdf.buildAsync(short,[],event=>progress.push(event),()=>Promise.resolve());
if(progress.filter(e=>e.stage==='compose').length!==short.indicators.length||progress.filter(e=>e.stage==='finalize').length!==asyncDoc.getNumberOfPages())throw Error('Callbacks não correspondem ao trabalho real');
console.log('PASS composição assíncrona: um callback por indicador e por página finalizada');
const single=buildReport(stored,{type:'executivo',sector:'TODOS',ids:['indice:0'],start:'1/2020',end:'9/2020'});
const singleProgress=[];
const singleDoc=await win.ReportPdf.buildAsync(single,[],event=>singleProgress.push(event),()=>Promise.resolve());
if(!singleDoc.output('arraybuffer').byteLength||singleProgress.filter(e=>e.stage==='compose').length!==1)throw Error('PDF individual inválido');
console.log('PASS PDF individual com um indicador e callback correspondente');

new Function('window',readFileSync('public/report-executive.js','utf8'))(win);
new Function('globalThis',readFileSync('public/report-evidence.js','utf8'))(win);
const logo=new Uint8Array(readFileSync('public/report-logo-dgranel.png'));
const sample={...sampleReport(8),basis:'dados-ficticios'};
const refs=win.ReportEvidence.evidence(sample).items.slice(0,2).map(item=>item.key);
sample.authored={reviewed:true,basis:sample.basis,snapshotUpdatedAt:sample.snapshotUpdatedAt,evidenceKeys:refs,
    document:{title:'Relatório gerencial de segurança viária',sections:[
        {id:'section-0',order:1,priority:'primary',type:'summary',title:'Síntese executiva',
            text:'Avaliar a rotina de conferência dos registros de autuação e investigar as pendências com a equipe de operações.',refs,days:0},
        {id:'section-1',order:2,priority:'supporting',type:'action',title:'Revisar a conferência de autuações',
            text:'Mapear os pontos de espera na triagem e revisar a passagem de informações entre as equipes.',refs,days:30,
            method:'checklist',audience:'Equipes de triagem',owner:'Segurança Viária e Operações',followUp:'Conferir o fechamento das pendências com as equipes responsáveis.'},
        {id:'section-2',order:3,priority:'supporting',type:'action',title:'Orientar o envio de documentos',
            text:'Publicar no canal interno um exemplo de envio completo e indicar onde tirar dúvidas.',refs,days:30,
            method:'post',audience:'Motoristas e líderes de turno',owner:'Segurança Viária',followUp:'Acompanhar as devoluções por falta de documentação.'},
    ]}};
for(const exportFormat of ['executive','complete']){
    const branded=win.ReportPdf.build({...sample,exportFormat},[],{logo});
    const pages=branded.getNumberOfPages(),layout=branded.reportLayout;
    if(layout.format!==exportFormat||layout.toc.length<4||(exportFormat==='complete'&&layout.toc.some(entry=>entry.page<=layout.tocPage)))throw Error('Seções fora de ordem');
    for(let p=1;p<=pages;p++)if(!branded.internal.pages[p].some(command=>/^\/I\d+ Do$/.test(command)))throw Error('Logo ausente na página '+p);
    if(!layout.blocks.some(block=>block.text?.includes('Como acompanhar')))throw Error('Acompanhamento ausente na edição '+exportFormat);
    if(exportFormat==='complete'&&!layout.blocks.filter(block=>block.page===1).map(block=>block.text).join(' ').includes('SEGURANÇA VIÁRIA'))throw Error('Título da capa');
    if(!layout.blocks.some(block=>block.text?.includes('Formato · Post'))||!layout.blocks.some(block=>block.text?.includes('Público · Motoristas')))throw Error('Formato ou público ausente');
    if(exportFormat==='executive')writeFileSync('.validation-tools/DGranel-relatorio-executivo-demonstracao.pdf',new Uint8Array(branded.output('arraybuffer')));
}
console.log('PASS logo em todas as páginas, sumário e plano de ação nos PDFs Executivo e Completo.');

const roadSafetyData={mesesLabels:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out'],indicadores:[
    ['ACIDENTE POR (MILHAO) DE KM RODADO - Mensal',0,[3.5,4.43,4.17,5.51,3.58,4.09,null,5.3,4.5,3.8]],
    ['Total de acidentes - Mensal',30,[26,33,38,49,32,38,43,44,40,34]],
    ["KM's rodados",10000000,[7430000,null,null,null,null,null,null,8300000,8888889,8945929]],
    ['Tombamento próprio',0,[0,0,0,0,0,0,0,0,0,1]],
    ['Prejuízo - QUANTIDADE',null,[null,null,null,null,4,5,null,8,10,17]],
    ['Boletim de Ocorrência Feitos',null,[0,0,0,0,0,0,0,0,0,null]],
    ['Número de mortes - próprios',0,Array(10).fill(0),true],
].map(([indicador,meta,valores,metaZeroConfirmada])=>({indicador,meta,valores,metaZeroConfirmada,setor:'Controle de Sinistro',und:'Qtd',direcaoDesempenho:'menor_melhor'}))};
const roadSelection={type:'executivo',sector:'TODOS',ids:roadSafetyData.indicadores.map((_,n)=>'indice:'+n),start:'Jan',end:'Out'};
const cutoff='2026-11-25T17:54:18.125Z';
const road={...buildReport(roadSafetyData,roadSelection,cutoff,{...context(),previousMeeting:'Pendente conciliar os registros de campo.'}),exportFormat:'executive'};
const old=structuredClone(roadSafetyData);
old.indicadores[1].valores[9]=32;
const previousReport=buildReport(old,roadSelection,'2026-11-24T17:54:18.125Z');
const meeting=win.ReportPdf.build(road,[],{logo,previousReport});
writeFileSync('.validation-tools/reuniao-dados-de-teste.pdf',new Uint8Array(meeting.output('arraybuffer')));
const textOn=page=>meeting.reportLayout.blocks.filter(b=>b.page===page).map(b=>b.text).join(' ');
if(!['34 acidentes','4 acima da meta de 30 (+13,3%)','40 em setembro de 2026','(-15%)','3,8 acidentes por milhão de km','8.945.929 km','1 Tombamento próprio','25/11/2026','Revisões em 1'].every(s=>textOn(1).includes(s)))throw Error('Resumo determinístico incorreto: '+textOn(1));
if(meeting.reportLayout.figures.map(f=>[f.id,f.page].join(':')).join(',')!=='indice:1:2,indice:0:2'||!textOn(2).includes('Meta cadastrada 30'))throw Error('Gráficos prioritários fora da página de evidências');
if(!['Ações e acompanhamento','Classificação e completude','Acordos anteriores','Pendente conciliar os registros de campo.'].every(s=>textOn(3).includes(s)))throw Error('Plano de ação fora da página de reunião');
const appendix=meeting.reportLayout.blocks.filter(b=>b.page>=4).map(b=>b.text).join(' ').replace(/\s+/g,' ');
if(!/Mai\/2026 a\s+Out\/2026/.test(appendix)||!['Zero confirmado','Zero a confirmar','Meta não cadastrada','0 registrado','Dado ausente','Último dado: 0','Valores alterados'].every(s=>appendix.includes(s)))throw Error('Dados e revisões incompletos no apêndice');
const a=road.roadSafety.accumulated;
if(a.competencies.join(',')!=='Jan/2026,Ago/2026,Set/2026,Out/2026'||a.accidents!==144||a.km!==33564818||a.rate!==a.accidents/a.km*1e6)throw Error('Denominadores desalinhados no acumulado');
console.log('PASS resumo mensal, gráficos, ações, cobertura de dados, acumulado ponderado e revisão entre snapshots.');
