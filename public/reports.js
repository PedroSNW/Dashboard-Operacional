// Relatórios sob demanda. Nenhuma gravação em banco ou armazenamento local.
let managementReport = null;
let managementSignature = '';
let managementCharts = [];
let managementBusy = false;
window.resetManagementReport = function(){managementCharts.forEach(c=>c.destroy());managementCharts=[];managementReport=null;managementSignature='';reportEl('reportPreview')?.replaceChildren();if(reportEl('reportExport'))reportEl('reportExport').disabled=true;if(reportEl('reportAI'))reportEl('reportAI').disabled=true;};
const reportEl = id => document.getElementById(id);
const reportValue = value => value === null || value === undefined ? 'Ausente' : new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);
function reportMessage(text) { reportEl('reportStatus').textContent = text; }
function reportReady() {
    if (!supabaseStateLoaded || !supabaseReady || !currentSession) throw Error('Carregue os indicadores reais do Supabase antes de gerar ou exportar.');
    if (hasUnsavedChanges) throw Error('Salve as alterações pendentes antes de gerar o relatório oficial.');
}
function reportSelection() {
    const ids=[...reportEl('reportIndicators').selectedOptions].map(o=>JSON.parse(o.value));
    return {type:reportEl('reportType').value,sector:reportEl('reportSector').value,
        ids,expectedIndicators:currentData.map((i,n)=>({id:i.id??`indice:${n}`,indicador:i.indicador,setor:i.setor??null})).filter(i=>ids.includes(i.id)),
        start:reportEl('reportStart').value,end:reportEl('reportEnd').value};
}
function reportInvalidate() {
    reportEl('reportExport').disabled=true;reportEl('reportAI').disabled=true;
    reportMessage('Filtros alterados. Gere ou atualize a prévia para continuar.');
}
function reportIndicatorOptions() {
    const previous = new Set([...reportEl('reportIndicators').selectedOptions].map(o=>o.value));
    reportEl('reportIndicators').replaceChildren();
    currentData.forEach((i,n)=>{
        if(reportEl('reportSector').value!=='TODOS'&&i.setor!==reportEl('reportSector').value)return;
        const o=new Option(`${i.setor} — ${i.indicador}`,JSON.stringify(i.id??`indice:${n}`));
        o.selected=previous.size?previous.has(o.value):true;reportEl('reportIndicators').add(o);
    });
    reportInvalidate();
}
window.refreshReportFilters = function() {
    const sector=reportEl('reportSector').value;
    reportEl('reportSector').replaceChildren(new Option('Todos os setores','TODOS'));
    [...new Set(currentData.map(i=>i.setor))].filter(Boolean).sort().forEach(s=>reportEl('reportSector').add(new Option(s,s)));
    if([...reportEl('reportSector').options].some(o=>o.value===sector))reportEl('reportSector').value=sector;
    for(const id of ['reportStart','reportEnd']){
        const old=reportEl(id).value;reportEl(id).replaceChildren();
        mesesLabels.forEach(m=>reportEl(id).add(new Option(m,m)));
        if(mesesLabels.includes(old))reportEl(id).value=old;
        else reportEl(id).value=id==='reportStart'?mesesLabels[0]:mesesLabels.at(-1);
    }
    reportIndicatorOptions();
};
async function requestManagementReport(interpret=false) {
    reportReady();
    const {data,error}=await supabaseClient.auth.getSession();
    if(error||!data?.session?.access_token)throw Error('Sessão indisponível. Faça login novamente.');
    const response=await fetch(SUPABASE_AI_FUNCTION_ENDPOINT,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},
        body:JSON.stringify({action:'report',selection:reportSelection(),interpret,provider:reportEl('reportProvider').value,...(interpret?{expectedUpdatedAt:managementReport.snapshotUpdatedAt}:{})})});
    const body=await response.json().catch(()=>null);
    if(!response.ok||!body?.success)throw Error(body?.error||`Relatório indisponível (HTTP ${response.status}).`);
    return body;
}
function reportNode(tag,text,className='') { const node=document.createElement(tag);node.textContent=text;node.className=className;return node; }
function renderManagementReport() {
    managementCharts.forEach(c=>c.destroy());managementCharts=[];
    const preview=reportEl('reportPreview');preview.replaceChildren();const r=managementReport;
    preview.append(reportNode('h2',`D'Granel • Relatório ${r.type}`,'text-xl font-bold'),
        reportNode('p',`${r.competencias[0]} a ${r.competencias.at(-1)} • Gerado ${new Date(r.generatedAt).toLocaleString('pt-BR')} • Snapshot ${r.snapshotUpdatedAt?new Date(r.snapshotUpdatedAt).toLocaleString('pt-BR'):'sem data informada'}`,'text-xs text-slate-400'),
        reportNode('p',`${r.selectedCount} indicadores selecionados; ${r.indicators.length} exibidos; ${r.criticalCount} com atenção por meta/direção. IA ${r.aiUsed?'utilizada':'não utilizada'}.`));
    if(!r.indicators.length)preview.append(reportNode('p','Nenhum indicador corresponde aos critérios críticos no período.'));
    r.indicators.forEach(i=>{
        const card=reportNode('article','','glass-card rounded-2xl border border-slate-700 p-5 space-y-3');
        card.append(reportNode('h3',i.indicador,'font-bold'),reportNode('p',`${i.setor} • Unidade ${i.unidade??'não informada'} • Meta ${i.meta===null?'não cadastrada':reportValue(i.meta)} • Direção ${i.direcaoDesempenho??'indefinida'}`,'text-xs text-slate-400'));
        const s=i.estatisticas;
        card.append(reportNode('p',`Média ${reportValue(s.media)} • Soma ${s.somaAplicavel?reportValue(s.soma):'não aplicável'} • Ausências ${s.ausentes} • ${i.criticalReason??'Sem classificação crítica pelo critério configurado'}`));
        const box=document.createElement('div');box.className='h-56 relative';const canvas=document.createElement('canvas');canvas.setAttribute('aria-label',`Evolução de ${i.indicador}`);canvas.setAttribute('role','img');box.append(canvas);card.append(box);
        const details=document.createElement('details');details.append(reportNode('summary','Série e cálculos detalhados','cursor-pointer text-amber-400'));
        const table=document.createElement('table');table.className='w-full text-sm';const head=document.createElement('tr');['Competência','Valor','Variação absoluta','Variação %'].forEach(t=>head.append(reportNode('th',t)));table.append(head);
        s.mensais.forEach(p=>{const row=document.createElement('tr');[p.competencia,reportValue(p.valor),reportValue(p.variacaoAnterior?.absoluta),reportValue(p.variacaoAnterior?.percentual)].forEach(t=>row.append(reportNode('td',t,'p-2 border-b border-slate-700')));table.append(row);});
        const scroll=document.createElement('div');scroll.className='overflow-x-auto';scroll.append(table);details.append(scroll);card.append(details);preview.append(card);
        const light=document.body.classList.contains('light-theme');
        managementCharts.push(new Chart(canvas,{type:'line',data:{labels:r.competencias,datasets:[{label:i.unidade??'Valor',data:i.valores,borderColor:'#d38b00',backgroundColor:'#d38b0022',spanGaps:false,tension:0.15,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,animation:false,devicePixelRatio:2,plugins:{legend:{display:false},datalabels:{display:false}},scales:{x:{ticks:{color:light?'#334155':'#cbd5e1'}},y:{ticks:{color:light?'#334155':'#cbd5e1'}}}}}));
    });
    if(r.interpretation)preview.append(reportNode('h3','Interpretação gerencial','font-bold'),reportNode('pre',r.interpretation,'whitespace-pre-wrap text-sm'));
    preview.append(reportNode('h3','Metodologia e limitações','font-bold'),reportNode('p',r.limitations.join(' '),'text-xs text-slate-400'));
}
async function generateManagementReport() {
    if(managementBusy)return;managementBusy=true;
    reportEl('reportGenerate').disabled=true;reportEl('reportExport').disabled=true;reportEl('reportAI').disabled=true;
    reportMessage('Lendo snapshot autorizado e calculando o relatório…');
    try {
        const selection=JSON.stringify(reportSelection());const body=await requestManagementReport();
        if(selection!==JSON.stringify(reportSelection()))throw Error('Os filtros mudaram durante a leitura. Gere novamente.');
        managementReport=body.report;managementSignature=selection;renderManagementReport();
        reportEl('reportExport').disabled=false;reportEl('reportAI').disabled=!managementReport.indicators.length;reportMessage('Prévia pronta. Revise antes de exportar; nenhum dado foi gravado.');
    }catch(e){managementReport=null;reportEl('reportPreview').replaceChildren();reportMessage(e.message);}
    finally{managementBusy=false;reportEl('reportGenerate').disabled=false;}
}
async function interpretManagementReport() {
    if(managementBusy||!managementReport)return;managementBusy=true;reportEl('reportAI').disabled=true;
    try {
        if(managementSignature!==JSON.stringify(reportSelection()))throw Error('Atualize a prévia.');
        const body=await requestManagementReport(true);
        if(managementSignature!==JSON.stringify(reportSelection()))throw Error('Os filtros mudaram. Atualize a prévia.');
        managementReport.interpretation=body.response;managementReport.aiUsed=body.meta?.deterministicOnly!==true;
        renderManagementReport();reportMessage('Interpretação disponível. Os números do relatório foram preservados.');
    }catch(e){reportMessage(`Relatório determinístico preservado. Interpretação indisponível: ${e.message}`);}
    finally{managementBusy=false;if(managementSignature===JSON.stringify(reportSelection()))reportEl('reportAI').disabled=false;}
}
const reportLoadScript = src => new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Biblioteca PDF local indisponível.'));document.head.append(s);});
let reportPdfLibraries;
async function loadReportPdfLibraries(){if(!reportPdfLibraries)reportPdfLibraries=(async()=>{await reportLoadScript('vendor/jspdf-4.2.1.umd.min.js');await reportLoadScript('vendor/jspdf-autotable-5.0.8.min.js');await reportLoadScript('report-pdf.js?v=3');})();try{await reportPdfLibraries;}catch(e){reportPdfLibraries=null;throw e;}}
window.buildManagementPdf = function(r, images=[]) { return window.ReportPdf.build(r,images); };
const reportPaint = () => new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
function reportDownloadBlob(blob,name){const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download=name;link.hidden=true;document.body.append(link);try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}}
async function exportManagementReport(){
    if(managementBusy)return;
    managementBusy=true;const source=managementReport;const signature=managementSignature;
    const buttons=['reportExport','reportGenerate','reportAI','reportRefresh'].map(reportEl);const previous=buttons.map(b=>b.disabled);buttons.forEach(b=>b.disabled=true);
    try{
        if(!source)throw Error('Gere uma prévia atualizada.');
        PdfProgress.open(`Relatório ${source.type}`,source.indicators.length);await reportPaint();
        reportReady();const {data,error}=await supabaseClient.auth.getSession();if(error||!data?.session?.access_token)throw Error('Sessão indisponível. Faça login novamente.');
        if(signature!==JSON.stringify(reportSelection()))throw Error('Os filtros mudaram. Atualize a prévia.');
        if(source.snapshotUpdatedAt&&lastSupabaseSavedAt>Date.parse(source.snapshotUpdatedAt))throw Error('Os dados foram atualizados. Gere uma nova prévia.');
        PdfProgress.update('Carregando bibliotecas locais',5);await reportPaint();await loadReportPdfLibraries();
        PdfProgress.update('Bibliotecas carregadas',10);await reportPaint();
        const report=JSON.parse(JSON.stringify(source)),charts=[...managementCharts],images=[];
        for(let n=0;n<charts.length;n++){
            images.push(managementChartImages([charts[n]])[0]);
            PdfProgress.update('Preparando gráficos',10+35*(n+1)/Math.max(1,charts.length),n+1,charts.length);await reportPaint();
        }
        PdfProgress.update('Compondo páginas do PDF',45,0,report.indicators.length);await reportPaint();
        const doc=await window.ReportPdf.buildAsync(report,images,event=>{
            const percent=event.stage==='compose'?45+40*event.processed/Math.max(1,event.total):85+9*event.processed/Math.max(1,event.total);
            PdfProgress.update(event.stage==='compose'?'Compondo páginas do PDF':'Finalizando páginas',percent,event.processed,event.total);
        },reportPaint);
        PdfProgress.update('Finalizando o documento — serialização local',null);await reportPaint();
        const blob=doc.output('blob');
        if(!(blob instanceof Blob)||!blob.size)throw Error('O documento gerado está vazio.');
        PdfProgress.update('Preparando download',97);await reportPaint();
        reportReady();if(managementReport!==source||managementSignature!==signature||signature!==JSON.stringify(reportSelection()))throw Error('A prévia mudou durante a geração. Gere novamente.');
        const name=`DGranel-${report.type}-${new Date(report.generatedAt).toISOString().slice(0,10)}.pdf`;
        reportDownloadBlob(blob,name);PdfProgress.finish(name);reportMessage('Download iniciado. A confirmação de gravação depende do navegador.');
    }catch(e){if(window.PdfProgress?.dialog?.open)PdfProgress.error(e.message);reportMessage(`PDF não gerado: ${e.message}`);}
    finally{managementBusy=false;buttons.forEach((b,n)=>b.disabled=previous[n]);if(!managementReport||managementSignature!==JSON.stringify(reportSelection())){reportEl('reportExport').disabled=true;reportEl('reportAI').disabled=true;}}
}
function managementChartImages(charts=managementCharts){return charts.map(chart=>{
    const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=500;
    const renderer=new Chart(canvas,{type:'line',data:{labels:[...chart.data.labels],datasets:chart.data.datasets.map(d=>({...d,data:[...d.data],pointRadius:3,borderWidth:2}))},options:{responsive:false,animation:false,devicePixelRatio:2,plugins:{legend:{display:false},datalabels:{display:false}},scales:{x:{ticks:{color:'#334155',font:{size:16},maxTicksLimit:12,maxRotation:0}},y:{ticks:{color:'#334155',font:{size:16}}}}}});
    try {
        const image=document.createElement('canvas');image.width=canvas.width;image.height=canvas.height;
        const ctx=image.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,image.width,image.height);ctx.drawImage(canvas,0,0);
        return image.toDataURL('image/png');
    }finally{renderer.destroy();}
});}
document.addEventListener('DOMContentLoaded',()=>{
    reportEl('reportSector').addEventListener('change',reportIndicatorOptions);
    for(const id of ['reportType','reportStart','reportEnd','reportIndicators'])reportEl(id).addEventListener('change',reportInvalidate);
    reportEl('reportAll').addEventListener('click',()=>{[...reportEl('reportIndicators').options].forEach(o=>o.selected=true);reportInvalidate();});
    reportEl('reportGenerate').addEventListener('click',generateManagementReport);
    reportEl('reportRefresh').addEventListener('click',()=>{window.refreshReportFilters();reportMessage('Filtros atualizados a partir do Dashboard. Gere para reler o Supabase.');});
    reportEl('reportAI').addEventListener('click',interpretManagementReport);
    reportEl('reportExport').addEventListener('click',exportManagementReport);
});
