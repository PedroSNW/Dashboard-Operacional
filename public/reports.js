// Relatórios sob demanda. Nenhuma gravação em banco ou armazenamento local.
let managementReport = null;
let managementSignature = '';
let managementCharts = [];
let managementBusy = false;
const reportChosenIds=new Set();let reportSelectionInitialized=false;
window.resetManagementReport = function(){window.ReportAuthoring?.reset();managementCharts.forEach(c=>c.destroy());managementCharts=[];managementReport=null;managementSignature='';reportChosenIds.clear();reportSelectionInitialized=false;reportEl('reportIndicators')?.replaceChildren();clearReportContext(false);updateReportContextUI();reportEl('reportPreview')?.replaceChildren();reportUpdateActions();};
const reportEl = id => document.getElementById(id);
const reportValue = value => value === null || value === undefined ? 'Ausente' : new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);
const reportExportFormat=()=>window.ReportExecutive?.format(reportEl('reportFormat')?.value)??'complete';
const reportFormatChartIds=r=>reportExportFormat() === "executive" ? window.ReportExecutive.build(r).chartIds : window.ReportContent.chartIds(r);
const REPORT_CONTEXT_FIELDS=['actionsTaken','difficulties','achievements','priorities','goals','observations'];
let reportContextScope='',reportContextDetached=false,reportContextOwner=null;
function clearReportContext(notify=true){
    REPORT_CONTEXT_FIELDS.forEach(k=>{if(reportEl('reportContext-'+k))reportEl('reportContext-'+k).value='';});
    for(const id of ['reportContextApproval','reportContextShare'])if(reportEl(id))reportEl(id).checked=false;
    if(reportEl('reportContextGoalKind'))reportEl('reportContextGoalKind').value='suggested';
    if(reportEl('reportContextActionStatus'))reportEl('reportContextActionStatus').value='pending_validation';
    reportContextScope='';reportContextDetached=false;reportContextOwner=null;
    if(notify){updateReportContextUI();reportInvalidate();}
}
function reportContextValue(){
    if(reportContextOwner&&reportContextOwner!==currentSession?.user?.id){clearReportContext(false);return null;}
    if(reportContextDetached||reportContextScope&&reportContextScope!==JSON.stringify(reportSelection()))return null;
    const fields=Object.fromEntries(REPORT_CONTEXT_FIELDS.map(k=>[k,(reportEl('reportContext-'+k)?.value??'').replace(/\r\n?/g,'\n').trim()]));
    if(!Object.values(fields).some(Boolean))return null;
    return {version:1,...fields,goalKind:reportEl('reportContextGoalKind').value,approvalConfirmed:reportEl('reportContextGoalKind').value==='approved'&&reportEl('reportContextApproval').checked,actionStatus:reportEl('reportContextActionStatus').value,shareWithAI:reportEl('reportContextShare').checked};
}
function reportSignature(){return JSON.stringify({selection:reportSelection(),managementContext:reportContextValue()});}
function updateReportContextUI(){
    const selection=JSON.stringify(reportSelection());if(reportContextScope&&reportContextScope!==selection)reportContextDetached=true;
    let total=0;REPORT_CONTEXT_FIELDS.forEach(k=>{const n=reportEl('reportContext-'+k)?.value.length??0;total+=n;if(reportEl('reportContextCount-'+k))reportEl('reportContextCount-'+k).textContent=n+'/320';});
    if(reportEl('reportContextTotal')){reportEl('reportContextTotal').textContent=total+'/1200 caracteres no total';reportEl('reportContextTotal').dataset.overLimit=String(total>1200);}
    if(reportEl('reportContextFields'))reportEl('reportContextFields').disabled=managementBusy||reportContextDetached;
    if(reportEl('reportContextRebind')){reportEl('reportContextRebind').hidden=!reportContextDetached;reportEl('reportContextRebind').disabled=managementBusy;}
    if(reportEl('reportContextClear'))reportEl('reportContextClear').disabled=managementBusy;
    if(reportEl('reportContextApproval'))reportEl('reportContextApproval').disabled=managementBusy||reportEl('reportContextGoalKind').value!=='approved';
    if(reportEl('reportContextScope'))reportEl('reportContextScope').textContent=reportContextDetached?'Contexto de outro recorte: preservado para revisão, mas não será incluído. Vincule explicitamente ou limpe os campos.':total?'Contexto vinculado a esta seleção. Alterações exigem gerar nova prévia.':'Sem contexto complementar. Nenhum texto será enviado ao provedor.';
}
function validateReportContext(context){
    if(!context)return;
    if(REPORT_CONTEXT_FIELDS.some(k=>context[k].length>320)||REPORT_CONTEXT_FIELDS.reduce((n,k)=>n+context[k].length,0)>1200)throw Error('O contexto admite 320 caracteres por campo e 1200 no total.');
    if(context.goals&&context.goalKind==='approved'&&!context.approvalConfirmed)throw Error('Confirme explicitamente a aprovação informada ou selecione outro tipo de objetivo.');
}
function initReportContext(){
    const changed=()=>{if(!reportContextScope){reportContextScope=JSON.stringify(reportSelection());reportContextOwner=currentSession?.user?.id??null;}updateReportContextUI();reportInvalidate();};
    REPORT_CONTEXT_FIELDS.forEach(k=>reportEl('reportContext-'+k)?.addEventListener('input',changed));
    ['reportContextGoalKind','reportContextActionStatus','reportContextApproval','reportContextShare'].forEach(id=>reportEl(id)?.addEventListener('change',changed));
    reportEl('reportContextClear')?.addEventListener('click',()=>clearReportContext());
    reportEl('reportContextRebind')?.addEventListener('click',()=>{reportContextScope=JSON.stringify(reportSelection());reportContextDetached=false;reportContextOwner=currentSession?.user?.id??null;updateReportContextUI();reportInvalidate();});
    updateReportContextUI();
}

function reportMessage(text) { reportEl('reportStatus').textContent = text;reportUpdateActions(); }
function reportHasCurrentPreview(){
    return Boolean(managementReport&&managementSignature===reportSignature()
        &&!(managementReport.snapshotUpdatedAt&&lastSupabaseSavedAt>Date.parse(managementReport.snapshotUpdatedAt)));
}
const fixedReportPeriods={mensal:1,trimestral:3,anual:12};
function reportPeriodValid(){
    const start=mesesLabels.indexOf(reportEl('reportStart').value),end=mesesLabels.indexOf(reportEl('reportEnd').value);
    const length=fixedReportPeriods[reportEl('reportType').value];
    return start>=0&&end>=start&&(!length||end-start+1===length);
}
function syncReportPeriod(){
    const start=reportEl('reportStart'),end=reportEl('reportEnd');
    const length=fixedReportPeriods[reportEl('reportType').value];
    [...start.options].forEach((option,index)=>{option.disabled=Boolean(length&&index+length>mesesLabels.length);});
    if(start.selectedOptions[0]?.disabled&&length<=mesesLabels.length)start.selectedIndex=mesesLabels.length-length;
    if(length&&start.selectedIndex>=0)end.selectedIndex=Math.min(mesesLabels.length-1,start.selectedIndex+length-1);
    else if(end.selectedIndex<start.selectedIndex)end.selectedIndex=start.selectedIndex;
    [...end.options].forEach((option,index)=>{option.disabled=index<start.selectedIndex;});
}
function reportUpdateActions(){
    const consistent=reportHasCurrentPreview();
    const available=supabaseStateLoaded&&supabaseReady&&currentSession&&!hasUnsavedChanges;
    const canPrepare=Boolean(available&&reportPeriodValid()&&reportEl('reportIndicators').selectedOptions.length);
    const ready=Boolean(consistent&&available);
    for(const id of ['reportRefresh','reportFormat','reportType','reportSector','reportStart','reportIndicators','reportAll','reportIndicatorSearch','reportIndicatorClear']){
        if(reportEl(id))reportEl(id).disabled=managementBusy;
    }
    if(reportEl('reportIndicatorPicker'))reportEl('reportIndicatorPicker').inert=managementBusy;
    reportEl('reportEnd').disabled=managementBusy||Boolean(fixedReportPeriods[reportEl('reportType').value]);
    reportEl('reportGenerate').disabled=managementBusy||!canPrepare;
    reportEl('reportAI').disabled=managementBusy||!canPrepare;
    reportEl('reportExport').disabled=managementBusy||!ready;
    reportEl('reportResults').hidden=!consistent;
    reportEl('reportDownload').hidden=!consistent;
    reportEl('reportDownloadState').textContent=managementReport?.authored?'Análise revisada, pronta para baixar.':'Prévia com os dados oficiais.';
    reportEl('reportActions')?.setAttribute('aria-busy',String(managementBusy));
    if(reportEl('reportProcessing'))reportEl('reportProcessing').hidden=!managementBusy;
    window.DGranelUX?.reportState({consistent,ready});
    window.ReportAuthoring?.update({consistent,canPrepare});
}
function reportSetBusy(value){managementBusy=value;updateReportContextUI();reportUpdateActions();}
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
    updateReportContextUI();
    const stale=managementReport&&managementSignature!==reportSignature();
    reportMessage(stale?'Filtros alterados. Gere ou atualize a prévia para continuar.':managementReport?'A prévia corresponde aos filtros atuais.':'Escolha os filtros e gere uma prévia.');
}
function reportIndicatorOptions() {
    if(reportEl('reportIndicators').options.length)captureReportIndicatorSelection();
    if(!reportSelectionInitialized&&currentData.length){currentData.forEach((i,n)=>reportChosenIds.add(JSON.stringify(i.id??`indice:${n}`)));reportSelectionInitialized=true;}
    reportEl('reportIndicators').replaceChildren();
    currentData.forEach((i,n)=>{
        if(reportEl('reportSector').value!=='TODOS'&&i.setor!==reportEl('reportSector').value)return;
        const o=new Option(`${i.setor} — ${i.indicador}`,JSON.stringify(i.id??`indice:${n}`));
        o.selected=reportChosenIds.has(o.value);reportEl('reportIndicators').add(o);
    });
    reportInvalidate();
}
function captureReportIndicatorSelection(){reportSelectionInitialized=true;for(const option of reportEl('reportIndicators').options){if(option.selected)reportChosenIds.add(option.value);else reportChosenIds.delete(option.value);}}
window.clearReportIndicatorSelection=()=>{reportChosenIds.clear();reportSelectionInitialized=true;[...reportEl('reportIndicators').options].forEach(o=>o.selected=false);reportEl('reportIndicators').dispatchEvent(new Event('change',{bubbles:true}));};
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
    syncReportPeriod();
    reportIndicatorOptions();
};
async function requestManagementReport() {
    reportReady();
    const managementContext=reportContextValue();
    validateReportContext(managementContext);
    const body=await requestDashboardEdge({action:'preview',selection:reportSelection(),managementContext});
    if(!body.report || typeof body.report.basis!=='string')throw Error('Prévia incompatível com a função publicada.');
    return body;
}
function reportNode(tag,text,className='') { const node=document.createElement(tag);node.textContent=text;node.className=className;return node; }
function renderManagementReport(expanded=reportEl('reportPreviewToggle')?.getAttribute('aria-expanded')==='true'){
    managementCharts.forEach(c=>c.destroy());managementCharts=[];
    const r=managementReport,preview=reportEl('reportPreview');preview.replaceChildren();
    if(window.ReportAuthoring?.renderCompact(preview,r,expanded))return;
    preview.append(reportNode('h2',`Relatório ${r.type}`,'text-lg font-bold'),reportNode('p',`${r.indicators.length} indicadores no relatório · ${r.selectedCount} selecionados · ${r.criticalCount} pontos de atenção`),reportNode('p',`${r.competencias[0]} a ${r.competencias.at(-1)} · ${r.sector==='TODOS'?'Todos os setores':r.sector??'Setor selecionado'}`,'text-sm text-slate-400'));
    if(reportExportFormat()==='executive'){
        const e=ReportExecutive.build(r);preview.append(reportNode('p','Formato Executivo · síntese para reunião','text-sm'),reportNode('p',e.paragraph,'text-sm'),reportNode('p',`${e.chartIds.length} séries selecionadas para gráficos. Todos os pontos de atenção aparecem na prévia; o histórico integral está no formato Completo.`,'text-xs'));
    }else if(window.ReportContent.validIntelligence(r.intelligence,r)){
        const v=r.intelligence,grid=reportNode('div','','report-v6-summary');
        for(const [title,ids] of [['Avanços',v.achievements],['Desafios',v.challenges]]){const area=reportNode('section');area.append(reportNode('h3',title,'font-bold'));area.append(reportNode('p',ids.length?`${ids.length} indicadores · ${v.dimensions.find(d=>d.indicatorId===ids[0]).name}`:'Sem situação comprovável pelos critérios disponíveis.','text-sm'));grid.append(area);}preview.append(grid);
        preview.append(reportNode('p','Prioridades: '+v.priorityIds.slice(0,2).map(id=>v.dimensions.find(d=>d.indicatorId===id).name).join('; '),'text-sm'));
        if(v.evolutionPlan.length)preview.append(reportNode('p',`Plano de evolução: 30 / 60 / 90 dias · ${v.actions.length} iniciativas sugeridas.`,'text-sm'));
        preview.append(reportNode('p',v.context?`Contexto da gestão incluído como relato não verificado; ${v.context.shareWithAI?'envio à IA permitido quando solicitado':'fora da solicitação à IA'}.`:'Sem contexto gerencial. Criticidade operacional depende de critérios validados.','text-xs'));
    }else{
    const attention=r.indicators.filter(i=>i.critical);const list=reportNode('ul','','report-preview-attention');
    attention.slice(0,3).forEach(i=>list.append(reportNode('li',`${i.indicador}: ${i.criticalReason}`)));
    if(!attention.length)list.append(reportNode('li','Sem pontos de atenção pelos critérios configurados. Consulte as limitações no conteúdo completo.'));
    if(attention.length>3)list.append(reportNode('li',`${attention.length-3} outros pontos de atenção no conteúdo completo.`));preview.append(list);
    }
    const toggle=reportNode('button','Ver prévia completa','v3-button');toggle.id='reportPreviewToggle';toggle.type='button';toggle.setAttribute('aria-controls','reportPreviewDetails');toggle.setAttribute('aria-expanded','false');toggle.onclick=()=>setManagementPreviewExpanded(toggle.getAttribute('aria-expanded')!=='true');
    const details=reportNode('div','','report-preview-details space-y-5');details.id='reportPreviewDetails';details.hidden=true;details.setAttribute('role','region');details.setAttribute('aria-label','Conteúdo completo do relatório');preview.append(toggle,details);
    if(expanded)setManagementPreviewExpanded(true);
    window.ReportAuthoring?.preview(preview);
}
function setManagementPreviewExpanded(expanded){
    const toggle=reportEl('reportPreviewToggle'),details=reportEl('reportPreviewDetails');if(!toggle||!details)return;
    toggle.setAttribute('aria-expanded',String(expanded));toggle.textContent=expanded?'Recolher prévia':'Ver prévia completa';details.hidden=!expanded;
    if(expanded){
        if(details.dataset.rendered!=='true'){try{renderManagementReportDetails();details.dataset.rendered='true';}catch{managementCharts.forEach(c=>c.destroy());managementCharts=[];details.replaceChildren(reportNode('p','Não foi possível desenhar os detalhes. O relatório permanece em memória para nova tentativa ou exportação.'));reportMessage('Detalhes indisponíveis. Recolha e abra novamente para tentar.');}}
        else managementCharts.forEach(c=>c.resize());
    }else{managementCharts.forEach(c=>c.destroy());managementCharts=[];details.replaceChildren();delete details.dataset.rendered;}
}
function managementChartSource(i,r=managementReport){return {data:{labels:[...r.competencias],datasets:[{label:i.unidade??'Valor',data:[...i.valores],borderColor:'#d38b00',backgroundColor:'#d38b0022',spanGaps:false,tension:0.15,pointRadius:3}]}};}
function renderIndicatorTechnicalCards(preview,r){
    r.indicators.forEach(i=>{
        const card=reportNode('article','','glass-card rounded-2xl border border-slate-700 p-5 space-y-3');
        card.append(reportNode('h3',i.indicador,'font-bold'),reportNode('p',`${i.setor} • Unidade ${i.unidade??'não informada'} • Meta ${i.meta===null?'não cadastrada':reportValue(i.meta)} • Direção ${i.direcaoDesempenho??'indefinida'}`,'text-xs text-slate-400'));
        const s=i.estatisticas;
        card.append(reportNode('p',`Média ${reportValue(s.media)} • Soma ${window.ReportExecutive?ReportExecutive.sum(r,i,reportValue):s.somaAplicavel?reportValue(s.soma):'não aplicável'} • Ausências ${s.ausentes} • ${r.intelligence?.dimensions.find(d=>d.indicatorId===i.id)?.measurement?.neutral?'Significado financeiro pendente de validação':i.criticalReason??'Sem classificação crítica pelo critério configurado'}`));
        const hasChart=(r.authored?reportFormatChartIds(r):window.ReportContent.chartIds(r)).includes(i.id);
        const box=document.createElement('div');box.className='h-56 relative';const canvas=document.createElement('canvas');canvas.setAttribute('aria-label',`Evolução de ${i.indicador}`);canvas.setAttribute('role','img');if(hasChart){box.append(canvas);card.append(box);}else card.append(reportNode('p','Gráfico dispensado: série constante ou histórico insuficiente. Consulte a tabela integral.','text-xs'));
        const details=document.createElement('details');details.append(reportNode('summary','Série e cálculos detalhados','cursor-pointer text-amber-400'));
        const table=document.createElement('table');table.className='w-full text-sm';const head=document.createElement('tr');['Competência','Valor','Variação absoluta','Variação %'].forEach(t=>head.append(reportNode('th',t)));table.append(head);
        s.mensais.forEach(p=>{const row=document.createElement('tr');[p.competencia,reportValue(p.valor),reportValue(p.variacaoAnterior?.absoluta),reportValue(p.variacaoAnterior?.percentual)].forEach(t=>row.append(reportNode('td',t,'p-2 border-b border-slate-700')));table.append(row);});
        const scroll=document.createElement('div');scroll.className='overflow-x-auto';scroll.append(table);details.append(scroll);card.append(details);preview.append(card);
        const light=document.body.classList.contains('light-theme');
        if(hasChart)managementCharts.push(new Chart(canvas,{type:'line',data:{labels:r.competencias,datasets:[{label:i.unidade??'Valor',data:i.valores,borderColor:'#d38b00',backgroundColor:'#d38b0022',spanGaps:false,tension:0.15,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,animation:false,devicePixelRatio:2,plugins:{legend:{display:false},datalabels:{display:false}},scales:{x:{ticks:{color:light?'#334155':'#cbd5e1'}},y:{beginAtZero:true,ticks:{color:light?'#334155':'#cbd5e1'}}}}}));
    });
}
function renderManagementReportV6Details(){
    managementCharts.forEach(c=>c.destroy());managementCharts=[];const r=managementReport,v=r.intelligence,root=reportEl('reportPreviewDetails');root.replaceChildren();
    let number=0;
    const paragraph=(area,line)=>area.append(reportNode('p',line,'text-sm'));
    const table=(area,head,rows)=>{const scroll=reportNode('div','','overflow-x-auto');scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',head.join(', '));const t=reportNode('table','','w-full text-sm'),thead=reportNode('thead'),tr=reportNode('tr');head.forEach(label=>{const th=reportNode('th',label,'p-2 text-left');th.scope='col';tr.append(th);});thead.append(tr);t.append(thead);const body=reportNode('tbody');rows.forEach(values=>{const row=reportNode('tr');values.forEach(text=>row.append(reportNode('td',text,'p-2 border-b border-slate-700')));body.append(row);});t.append(body);scroll.append(t);area.append(scroll);};
    for(const section of window.ReportContent.v6Sections(r)){
        if(section.key==='priorities'&&!section.blocks.length||section.key==='panorama'&&!r.indicators.length)continue;
        const area=reportNode('section','','report-management-section space-y-3');area.dataset.reportSection=section.key;area.append(reportNode('h3',`${++number} ${section.title}`,'font-bold text-lg'));
        if(section.key==='panorama')table(area,['Indicador / unidade','Resultado / meta atual','Desempenho / tendência','Criticidade operacional'],ReportContent.v6Overview(r,reportValue));
        if(section.key==='actions')v.actions.forEach(a=>{const card=reportNode('article','','glass-card p-4 rounded-xl space-y-2');card.append(reportNode('h4',a.ref+' · '+a.title,'font-bold'));[a.priority+' · '+a.status,a.problem,a.objective,...a.tasks,'Área sugerida: '+a.owner,'Prazo sugerido: '+a.timeline,'Monitorar: '+a.monitoring,a.criterion].forEach(line=>paragraph(card,line));area.append(card);});
        if(section.key==='evolution'){paragraph(area,'Horizontes sugeridos após a decisão de iniciar; não representam compromissos aprovados.');v.evolutionPlan.forEach(h=>{const block=reportNode('article','','glass-card p-4 rounded-xl');block.append(reportNode('h4',`Até ${h.days} dias`,'font-bold'));h.items.forEach(a=>paragraph(block,`${a.ref}: ${a.task} · ${a.goal}`));area.append(block);});}
        section.blocks.forEach(b=>{const article=reportNode('article','','space-y-2');article.append(reportNode('h4',b.title,'font-bold'));[...new Set(b.lines)].forEach(line=>paragraph(article,line));area.append(article);});
        if(section.note)paragraph(area,section.note);root.append(area);
    }
    const methodology=reportNode('section','','report-management-section');methodology.append(reportNode('h3','Metodologia e limitações','font-bold text-lg'));v.limitations.forEach(l=>paragraph(methodology,l));root.append(methodology);
    root.append(reportNode('h3','Apêndices técnicos — dados completos','font-bold text-lg'));renderIndicatorTechnicalCards(root,r);
    const omitted=v.charts.excluded;if(omitted.length)paragraph(root,`${omitted.length} gráficos constantes ou sem histórico suficiente foram dispensados; os dados permanecem nas tabelas.`);
}

function renderManagementExecutiveDetails(){
    managementCharts.forEach(c=>c.destroy());managementCharts=[];const r=managementReport,e=ReportExecutive.build(r),root=reportEl('reportPreviewDetails');root.replaceChildren();
    const section=(title,lines)=>{const area=reportNode('section','','space-y-2');area.append(reportNode('h3',title,'font-bold text-lg'));lines.forEach(line=>area.append(reportNode('p',line,'text-sm')));root.append(area);return area;};
    const name=id=>r.indicators.find(i=>i.id===id)?.indicador??String(id),dimension=id=>r.intelligence?.dimensions.find(d=>d.indicatorId===id);
    section('Síntese para decisão',[e.paragraph,...e.advances.map(id=>'Avanço: '+name(id)),...e.challenges.map(id=>'Atenção: '+name(id)),...e.priorities.map(id=>'Prioridade sugerida: '+name(id))]);
    section('Resultados que orientam a reunião',e.detailIds.map(id=>ReportExecutive.narrative(r.indicators.find(i=>i.id===id),dimension(id))));
    if(e.observations.length)section('Leitura conjunta dos resultados',e.observations.map(o=>o.text));
    section('Pontos de atenção do recorte',e.criticalIds.length?e.criticalIds.map(id=>{const d=dimension(id);return name(id)+': '+(d?.operational?.validated&&d.operational.level==='Alta'?'avaliar o critério operacional aprovado: '+d.operational.reference:ReportExecutive.financial(r.indicators.find(i=>i.id===id),d).neutral?'validar a natureza dos valores.':d?.off?'avaliar a distância da meta.':d?.worse?'avaliar a piora no período.':'critério operacional validado; consultar a área responsável.');}):['Sem pontos sinalizados pelos critérios disponíveis; isso não comprova ausência de risco.']);
    for(const id of e.chartIds){const i=r.indicators.find(i=>i.id===id),area=section(i.indicador,[]),box=reportNode('div','','h-56 relative'),canvas=document.createElement('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Evolução de '+i.indicador);box.append(canvas);area.append(box);managementCharts.push(new Chart(canvas,{type:'line',data:managementChartSource(i,r).data,options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false},datalabels:{display:false}},scales:{y:{beginAtZero:true}}}}));}
    section('Plano de ação — propostas para avaliação',e.actions.map(a=>`${a.ref} · ${a.title}. ${a.problem} ${a.tasks[0]??a.objective} Área sugerida: ${a.owner}. ${a.timeline} ${a.monitoring} Situação: ${a.status}.`));
    e.horizons.forEach(h=>section(h.days+' dias — '+h.title,h.lines));
    const context=ReportContent.v6Sections(r).find(s=>s.key==='context');if(context)section('Contexto informado pela gestão',context.blocks.flatMap(b=>[b.title+': '+b.lines.join(' ')]));
    section('Base e limites da análise',[e.selection,...e.limitations,'Snapshot: '+(r.snapshotUpdatedAt??'não informado')+' · Base: '+(r.basis??'não informada')]);
}
function renderManagementReportDetails() {
    if(window.ReportAuthoring?.renderDetails())return;
    if(reportExportFormat()==='executive'){renderManagementExecutiveDetails();return;}
    if(window.ReportContent.validIntelligence(managementReport.intelligence,managementReport)){renderManagementReportV6Details();return;}
    managementCharts.forEach(c=>c.destroy());managementCharts=[];
    const preview=reportEl('reportPreviewDetails');preview.replaceChildren();const r=managementReport;
    preview.append(reportNode('h2',`D'Granel • Relatório ${r.type}`,'text-xl font-bold'),
        reportNode('p',`${r.competencias[0]} a ${r.competencias.at(-1)} • Gerado ${new Date(r.generatedAt).toLocaleString('pt-BR')} • Snapshot ${r.snapshotUpdatedAt?new Date(r.snapshotUpdatedAt).toLocaleString('pt-BR'):'sem data informada'}`,'text-xs text-slate-400'),
        reportNode('p',`${r.selectedCount} indicadores selecionados; ${r.indicators.length} exibidos; ${r.criticalCount} com atenção por meta/direção.`));
    const sections=window.ReportContent.sections(r);
    if(!sections.diagnosis.length)preview.append(reportNode('p','Conteúdo gerencial complementar indisponível nesta versão. Os resultados numéricos permanecem disponíveis.','text-xs text-slate-400'));
    const renderSections=items=>items.forEach(section=>{
        const area=reportNode('section','','report-management-section space-y-3');area.append(reportNode('h3',section.title,'font-bold text-lg'));
        section.blocks.forEach(block=>{const card=reportNode('article','','glass-card rounded-xl p-4 space-y-2');card.append(reportNode('h4',block.title,'font-bold'));block.lines.forEach(line=>card.append(reportNode('p',line,'text-sm')));area.append(card);});
        if(!section.blocks.length)area.append(reportNode('p','Não há propostas específicas para este recorte. Consulte os critérios e as limitações.','text-sm'));
        preview.append(area);
    });
    const editorial=window.ReportContent.editorial(r);
    const section=(title,lines)=>{preview.append(reportNode('h3',title,'font-bold text-lg'));lines.forEach(line=>preview.append(reportNode('p',line,'text-sm')));};
    section('1 Resumo executivo',editorial.summary);
    section('2 Panorama de desempenho',['Todos os resultados por indicador constam dos apêndices abaixo, com unidade, competência, meta e direção.']);
    const overview=document.createElement('table');overview.className='w-full text-sm';
    const overviewHead=document.createElement('thead'),overviewHeader=document.createElement('tr');
    ['Indicador / setor / unidade','Recente / competência','Meta / direção','Variação %','Situação'].forEach(label=>{const th=reportNode('th',label,'p-2 text-left');th.scope='col';overviewHeader.append(th);});overviewHead.append(overviewHeader);overview.append(overviewHead);
    const overviewBody=document.createElement('tbody');window.ReportContent.panorama(r,reportValue).forEach(values=>{const row=document.createElement('tr');values.forEach(value=>row.append(reportNode('td',value,'p-2 border-b border-slate-700')));overviewBody.append(row);});overview.append(overviewBody);
    const overviewScroll=reportNode('div','','overflow-x-auto');overviewScroll.tabIndex=0;overviewScroll.setAttribute('role','region');overviewScroll.setAttribute('aria-label','Panorama de desempenho; role horizontalmente para ver todas as colunas');overviewScroll.append(overview);preview.append(overviewScroll);
    section('3 Análise dos indicadores prioritários',[editorial.selection]);
    renderSections([{title:'Resultados prioritários',blocks:sections.diagnosis[0]?.blocks.filter((b,index)=>editorial.priority.some(i=>i.id===editorial.management?.executiveDiagnosis[index]?.indicatorId))??[]}]);
    section('4 Riscos e oportunidades de melhoria',['Pontos de atenção por meta/direção; evidências completas nos apêndices.']);
    renderSections([{title:'Riscos prioritários',blocks:sections.diagnosis[1]?.blocks.filter((b,index)=>editorial.priority.some(i=>i.id===editorial.management?.priorityRisks[index]?.indicatorId))??[]}]);
    section('5 Plano de ação e recomendações preventivas',['Propostas para avaliação. Responsáveis e prazos dependem de aprovação.']);
    renderSections(sections.final.slice(1));
    section('6 Conclusão executiva',['Priorizar a revisão das evidências dos '+r.criticalCount+' indicadores com atenção e pactuar o acompanhamento das iniciativas propostas.']);
    section('7 Metodologia e limitações',editorial.limitations);
    section('Apêndices técnicos — cadastro, estatísticas e histórico completo',['Todos os indicadores do recorte permanecem disponíveis abaixo e no PDF, inclusive quando a prévia está recolhida.']);
    if(!r.indicators.length)preview.append(reportNode('p','Nenhum indicador corresponde aos critérios críticos no período.'));
    renderIndicatorTechnicalCards(preview,r);
    renderSections(sections.diagnosis);
    renderSections(sections.final.slice(0,1));
    preview.append(reportNode('h3','Metodologia e limitações','font-bold'),reportNode('p',r.limitations.join(' '),'text-xs text-slate-400'));
}
function focusReportResults(){
    const heading=reportEl('reportResultsHeading');
    heading.focus({preventScroll:true});
    heading.scrollIntoView({block:'start'});
}
async function generateManagementReport({forAnalysis=false}={}) {
    if(managementBusy)return false;reportSetBusy(true);
    reportMessage('Preparando os indicadores do recorte…');
    try {
        const selection=reportSignature();const body=await requestManagementReport();
        reportReady();
        if(selection!==reportSignature())throw Error('Os filtros mudaram durante a leitura. Gere novamente.');
        window.ReportAuthoring?.reset();managementReport=body.report;managementSignature=selection;renderManagementReport(false);
        reportMessage('Prévia pronta.');
        if(!forAnalysis)focusReportResults();
        return true;
    }catch(e){
        reportMessage(e.message);
        return false;
    }
    finally{reportSetBusy(false);}
}
const reportLoadScript = src => new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Biblioteca PDF local indisponível.'));document.head.append(s);});
let reportPdfLibraries;
async function loadReportPdfLibraries(){if(!reportPdfLibraries)reportPdfLibraries=(async()=>{await reportLoadScript('vendor/jspdf-4.2.1.umd.min.js');await reportLoadScript('vendor/jspdf-autotable-5.0.8.min.js');await reportLoadScript('report-pdf.js?v=analysis');})();try{await reportPdfLibraries;}catch(e){reportPdfLibraries=null;throw e;}}
window.buildManagementPdf = function(r, images=[]) { return window.ReportPdf.build(r,images); };
const reportPaint = () => new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
function reportDownloadBlob(blob,name){const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download=name;link.hidden=true;document.body.append(link);try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}}
async function exportManagementReport(){
    if(managementBusy)return;
    reportSetBusy(true);const source=managementReport;const signature=managementSignature;const sourceOwner=currentSession?.user?.id;
    try{
        if(!source)throw Error('Gere uma prévia atualizada.');
        window.ReportAuthoring?.assertExportable(source);
        PdfProgress.open(`Relatório ${source.type}`,source.indicators.length);await reportPaint();
        reportReady();const {data,error}=await supabaseClient.auth.getSession();if(error||!data?.session?.access_token)throw Error('Sessão indisponível. Faça login novamente.');
        if(signature!==reportSignature())throw Error('Os filtros mudaram. Atualize a prévia.');
        if(source.snapshotUpdatedAt&&lastSupabaseSavedAt>Date.parse(source.snapshotUpdatedAt))throw Error('Os dados foram atualizados. Gere uma nova prévia.');
        await window.ReportAuthoring?.verifyExport(source);
        PdfProgress.update('Carregando bibliotecas locais',5);await reportPaint();await loadReportPdfLibraries();
        PdfProgress.update('Bibliotecas carregadas',10);await reportPaint();
        const report=JSON.parse(JSON.stringify(source));report.exportFormat=reportExportFormat();const chartIds=reportFormatChartIds(report),selected=report.indicators.map((i,index)=>({i,index})).filter(({i})=>chartIds.includes(i.id)),charts=selected.map(({i})=>managementChartSource(i,report)),images=Array(report.indicators.length).fill(null);
        for(let n=0;n<charts.length;n++){
            images[selected[n].index]=managementChartImages([charts[n]])[0];
            PdfProgress.update('Preparando gráficos',10+35*(n+1)/Math.max(1,charts.length),n+1,charts.length);await reportPaint();
        }
        PdfProgress.update('Compondo páginas do PDF',45,0,report.indicators.length);await reportPaint();
        let logo=null;const loadedLogo=document.getElementById('dashboardLogo');
        if(loadedLogo?.complete&&loadedLogo.naturalWidth){try{const c=document.createElement('canvas');c.width=c.height=128;c.getContext('2d').drawImage(loadedLogo,0,0,128,128);logo=c.toDataURL('image/png');}catch{/* Imagem sem CORS: usar assinatura textual. */}}
        const doc=await window.ReportPdf.buildAsync(report,images,event=>{
            const fraction=event.processed/Math.max(1,event.total);
            const stage={diagnosis:['Preparando diagnóstico',45,7],compose:['Compondo páginas do PDF',52,26],figures:['Preparando gráficos complementares',78,6],management:['Diagramando plano de ação',84,6],finalize:['Finalizando páginas',90,4]}[event.stage];
            PdfProgress.update(stage[0],stage[1]+stage[2]*fraction,event.processed,event.total);
        },reportPaint,{logo});
        PdfProgress.update('Finalizando o documento — serialização local',null);await reportPaint();
        const blob=doc.output('blob');
        if(!(blob instanceof Blob)||!blob.size)throw Error('O documento gerado está vazio.');
        PdfProgress.update('Preparando download',97);await reportPaint();
        reportReady();if(managementReport!==source||managementSignature!==signature||signature!==reportSignature()||currentSession?.user?.id!==sourceOwner)throw Error('A prévia ou sessão mudou durante a geração. Gere novamente.');
        const name=`DGranel-${report.type}-${report.exportFormat}-${new Date(report.generatedAt).toISOString().slice(0,10)}.pdf`;
        reportDownloadBlob(blob,name);PdfProgress.finish(name);reportMessage('Download iniciado. A confirmação de gravação depende do navegador.');
    }catch(e){if(window.PdfProgress?.dialog?.open)PdfProgress.error(e.message);reportMessage(`PDF não gerado: ${e.message}`);}
    finally{reportSetBusy(false);}
}
function managementChartImages(charts=managementReport?.indicators.map(i=>managementChartSource(i))??[]){return charts.map(chart=>{
    const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=500;
    const renderer=new Chart(canvas,{type:'line',data:{labels:[...chart.data.labels],datasets:chart.data.datasets.map(d=>({...d,data:[...d.data],pointRadius:3,borderWidth:2}))},options:{responsive:false,animation:false,devicePixelRatio:2,plugins:{legend:{display:false},datalabels:{display:false}},scales:{x:{ticks:{color:'#334155',font:{size:28},maxTicksLimit:12,maxRotation:0}},y:{beginAtZero:true,ticks:{color:'#334155',font:{size:28}}}}}});
    try {
        const image=document.createElement('canvas');image.width=canvas.width;image.height=canvas.height;
        const ctx=image.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,image.width,image.height);ctx.drawImage(canvas,0,0);
        return image.toDataURL('image/png');
    }finally{renderer.destroy();}
});}
document.addEventListener('DOMContentLoaded',()=>{
    reportEl('reportIndicators').addEventListener('change',captureReportIndicatorSelection);
    reportEl('reportFormat')?.addEventListener('change',()=>{reportEl('reportFormatHint').textContent=reportExportFormat()==='executive'?'Síntese para reunião.':'Inclui histórico e apêndices.';if(managementReport)renderManagementReport();});
    initReportContext();
    reportEl('reportSector').addEventListener('change',reportIndicatorOptions);
    for(const id of ['reportType','reportStart'])reportEl(id).addEventListener('change',()=>{syncReportPeriod();reportInvalidate();});
    for(const id of ['reportEnd','reportIndicators'])reportEl(id).addEventListener('change',reportInvalidate);
    reportEl('reportAll').addEventListener('click',()=>{[...reportEl('reportIndicators').options].forEach(o=>o.selected=true);reportEl('reportIndicators').dispatchEvent(new Event('change'));});
    reportEl('reportGenerate').addEventListener('click',()=>generateManagementReport());
    reportEl('reportRefresh').addEventListener('click',()=>{window.refreshReportFilters();reportMessage('Filtros atualizados a partir do Dashboard. Gere para reler o Supabase.');});
    reportEl('reportAI').addEventListener('click',()=>window.ReportAuthoring.generate());
    reportEl('reportExport').addEventListener('click',exportManagementReport);
    const header=document.querySelector('header');
    if(header){const updateOffset=()=>document.documentElement.style.setProperty('--report-topbar-height',`${header.getBoundingClientRect().height}px`);new ResizeObserver(updateOffset).observe(header);updateOffset();}
    reportUpdateActions();
});
