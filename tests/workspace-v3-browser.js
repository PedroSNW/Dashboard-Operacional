async function runWorkspaceV3Checks(){
    const assert=(v,m)=>{if(!v)throw Error(m);};
    let downloads=0;const loader=loadReportPdfLibraries,download=reportDownloadBlob,images=managementChartImages;
    loadReportPdfLibraries=async()=>{};reportDownloadBlob=(blob)=>{assert(blob.size>0,'Blob vazio');downloads++;};
    const source=managementReport;
    try{
        await Promise.all([exportManagementReport(),exportManagementReport()]);
        assert(downloads===1,'Download duplicado');assert(!managementBusy,'Ocupação presa');
        const events=PdfProgress.history.filter(e=>e.percent!==null);
        assert(events.at(-1).percent===100&&events.every((e,n)=>n===0||e.percent>=events[n-1].percent),'Progresso não monotônico');
        assert(PdfProgress.history.some(e=>e.stage==='Preparando gráficos'&&e.processed===managementCharts.length),'Callback gráfico');
        assert(PdfProgress.history.some(e=>e.stage==='Compondo páginas do PDF'&&e.processed===source.indicators.length),'Callback indicador');
        assert(PdfProgress.history.some(e=>e.stage==='Finalizando páginas'&&e.processed===e.total),'Callback páginas');
        PdfProgress.dialog.close();
        loadReportPdfLibraries=async()=>{throw Error('Biblioteca ausente no teste');};await exportManagementReport();
        assert(!managementBusy&&managementReport===source&&!document.getElementById('reportExport').disabled&&downloads===1,'Erro biblioteca');PdfProgress.dialog.close();
        loadReportPdfLibraries=async()=>{};managementChartImages=()=>{throw Error('Renderização inválida no teste');};await exportManagementReport();
        assert(!managementBusy&&managementReport===source&&downloads===1,'Erro renderização');PdfProgress.dialog.close();
        managementChartImages=()=>['imagem inválida'];await exportManagementReport();
        assert(!managementBusy&&downloads===1,'Imagem inválida');PdfProgress.dialog.close();
    }finally{loadReportPdfLibraries=loader;reportDownloadBlob=download;managementChartImages=images;}
    const native=document.getElementById('reportIndicators');const checks=[...document.querySelectorAll('.v3-picker-option input')];
    assert(native.selectedOptions.length===checks.length,'Checkboxes fora de sincronia');checks[0].click();assert(native.selectedOptions.length===checks.length-1,'Seleção checkbox');checks[0].click();
    dashboards=[{id:'test-dashboard',name:'Dashboard de teste',widgets:[{type:'kpi',ref:'test-kpi'},{type:'custom-chart',ref:'test-chart'},{type:'default-chart',ref:'chart4'}]}];activeDashboardId='test-dashboard';
    kpiCards=[{id:'test-kpi',title:'Indicador de teste',indicator:0,unit:'Qtd',color:'amber'}];
    customCharts=[{id:'test-chart',title:'Comparação de teste',type:'line',ind1:0,ind2:1,span:6,axisMode:'independent'}];defaultChartConfigs.chart4={title:'Comparação descritiva',type:'line',ind1:0,ind2:1};
    syncSectorsFromData();initSystem();
    for(const tab of ['home','dashboard','datagrid','intelligence','reports','governance']){switchTab(tab);assert(!document.getElementById('view-'+tab).classList.contains('hidden'),'Módulo '+tab);}
    document.body.classList.add('developer-mode');switchTab('audit');assert(!document.getElementById('view-audit').classList.contains('hidden'),'Auditoria');
    switchTab('dashboard');assert(document.querySelector('#kpiContainer [data-count-to]'),'KPI');assert(Object.values(Chart.instances).some(c=>c.canvas.id==='canvas_test-chart'),'Gráfico personalizado');
    const zoom=document.querySelector('.chart-scroll-box [data-z="in"]');assert(zoom,'Zoom');zoom.click();assert(hasUnsavedChanges,'Zoom não acionou estado');hasUnsavedChanges=false;
    switchTab('datagrid');document.getElementById('searchInput').value='inexistente';renderTable();assert(document.getElementById('filteredCount').textContent==='0','Busca');document.getElementById('searchInput').value='';renderTable();
    document.getElementById('v3MenuToggle').focus();openNewIndicatorModal();await new Promise(r=>setTimeout(r,60));
    assert(!document.getElementById('modalEdit').classList.contains('hidden')&&document.getElementById('modalEdit').getAttribute('role')==='dialog','Edição acessível');
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await Promise.resolve();assert(document.getElementById('modalEdit').classList.contains('hidden'),'Escape edição');
    const ready=supabaseStateLoaded;supabaseStateLoaded=false;let blocked=false;try{reportReady();}catch{blocked=true;}assert(blocked,'Proteção Supabase');supabaseStateLoaded=ready;
    supabaseStateLoaded=false;let saveBlocked=false;try{await persistirEstadoSupabase();}catch{saveBlocked=true;}assert(saveBlocked,'Gravação sem leitura');supabaseStateLoaded=ready;
    const savedData=currentData,savedMonths=[...mesesLabels],savedSectors=[...sectors],papa=window.Papa;
    window.Papa={parse:(_text,options)=>options.complete({data:[['Setor','Indicador','Meta','Und.','Direção','Jan','Fev'],['Sinistros','CSV de teste','0','Qtd','menor_melhor','5','0']]})};
    try{parseCSVContent('parser simulado','teste.csv',true);assert(currentData.some(i=>i.indicador==='CSV de teste'&&i.meta===0&&i.valores.includes(0)),'Pipeline CSV');}
    finally{currentData=savedData;mesesLabels=savedMonths;sectors=savedSectors;window.Papa=papa;hasUnsavedChanges=false;}
    await saveCurrentState();assert(!isSavingState&&!hasUnsavedChanges,'Salvamento simulado');
    switchTab('home');refreshOperationalUI();
    if(innerWidth<1024){document.getElementById('v3MenuToggle').click();assert(document.body.classList.contains('v3-drawer-open')&&document.querySelector('main').inert,'Drawer');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert(!document.body.classList.contains('v3-drawer-open')&&document.activeElement.id==='v3MenuToggle','Escape/foco');}
    else{document.getElementById('v3MenuToggle').click();assert(document.body.classList.contains('v3-sidebar-collapsed'),'Recolher');document.getElementById('v3MenuToggle').click();}
    return 'PASS V3 progresso real/monotônico, callbacks, download único, erros, seleção, navegação, KPIs, gráfico, zoom, busca, Supabase e foco';
}
