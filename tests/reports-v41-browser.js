async function runReportV41Checks(fixtures){
    const assert=(v,m)=>{if(!v)throw Error(m);},clone=v=>JSON.parse(JSON.stringify(v)),wait=ms=>new Promise(r=>setTimeout(r,ms));
    const oldFetch=window.fetch,oldLoader=loadReportPdfLibraries,oldDownload=reportDownloadBlob,oldImages=managementChartImages,oldBuild=ReportPdf.buildAsync;
    try{for(const fixture of fixtures){
        const n=fixture.indicators.length;currentData=fixture.indicators.map(i=>({...clone(i),und:i.unidade}));mesesLabels=[...fixture.competencias];supabaseStateLoaded=supabaseReady=true;lastSupabaseSavedAt=null;
        confirmPersistedSnapshot(projectPersistedState(),'2026-11-17T00:00:00.000Z');
        switchTab('reports');window.refreshReportFilters();document.getElementById('reportType').value='comparativo';document.getElementById('reportProvider').value='groq';document.getElementById('reportAll').click();
        const state=PendingState.stable(projectPersistedState());let calls=0,downloads=0,imageCount=0,pdfCount=0,release=null,mode='valid';
        window.fetch=async(url,options)=>{calls++;const body=JSON.parse(options.body);if(!body.interpret)return {ok:true,json:async()=>({success:true,report:clone(fixture)})};
            if(mode==='failure'){await new Promise(r=>release=r);return {ok:false,status:429,json:async()=>({error:'Limite simulado'})};}
            const management=clone(fixture.management);management.audit={structured:true,fallback:false,rejections:[]};return {ok:true,json:async()=>({success:true,management,reportBasis:fixture.basis,response:'Resumo de teste',meta:{deterministicOnly:false}})};};
        await generateManagementReport();const source=managementReport,content=JSON.stringify(ReportContent.sections(source));
        assert(source.indicators.length===n&&managementCharts.length===0&&!document.querySelector('#reportPreview canvas'),'Gráficos antecipados '+n);
        assert(document.getElementById('reportPreviewDetails').hidden&&document.getElementById('reportPreviewToggle').textContent==='Ver prévia completa','Recolhida por padrão');
        assert(Boolean(document.getElementById('reportActions').compareDocumentPosition(document.getElementById('reportPreview'))&Node.DOCUMENT_POSITION_FOLLOWING),'Ações depois da prévia');
        assert(document.querySelectorAll('#reportAI').length===1&&document.querySelectorAll('#reportExport').length===1,'Barra duplicada');
        document.getElementById('reportPreviewToggle').click();assert(managementCharts.length===n&&!document.getElementById('reportPreviewDetails').hidden,'Expansão '+n);
        document.getElementById('reportPreviewToggle').click();assert(managementCharts.length===0&&document.getElementById('reportPreviewDetails').hidden,'Recolhimento/limpeza');
        loadReportPdfLibraries=async()=>{};reportDownloadBlob=blob=>{assert(blob.size>0,'PDF vazio');downloads++;};
        managementChartImages=charts=>{assert(charts[0].data.labels.length===12&&charts[0].data.datasets[0].data.length===12,'Série incompleta no PDF');imageCount+=charts.length;return oldImages(charts);};
        ReportPdf.buildAsync=async function(report,images,...args){assert(images.length===n&&JSON.stringify(report.indicators)===JSON.stringify(source.indicators),'Conteúdo/PDF diferente');const doc=await oldBuild.call(this,report,images,...args);pdfCount++;return doc;};
        await Promise.all([exportManagementReport(),exportManagementReport()]);
        assert(downloads===1&&pdfCount===1&&imageCount===n&&calls===1&&managementCharts.length===0,'Exportação recolhida/duplicada/consulta automática '+n);
        assert(PdfProgress.history.some(e=>e.stage==='Preparando gráficos'&&e.processed===n)&&PdfProgress.history.at(-1).percent===100,'Progresso real '+n);PdfProgress.dialog.close();
        await interpretManagementReport();assert(calls===2&&document.getElementById('reportPreviewDetails').hidden&&managementCharts.length===0,'Groq expandiu prévia');
        assert(JSON.stringify(ReportContent.sections(source))===content,'Conteúdo V4 alterado');
        await interpretManagementReport();assert(calls===2,'Groq redundante');
        mode='failure';document.getElementById('reportProvider').value='gemini';document.getElementById('reportProvider').dispatchEvent(new Event('change'));const pending=interpretManagementReport();
        for(let t=0;!release&&t<100;t++)await wait(10);
        assert(managementBusy&&document.getElementById('reportExport').disabled&&!document.getElementById('reportProcessing').hidden&&!document.getElementById('reportPreviewToggle').disabled,'Processamento/concorrência');release();await pending;
        assert(!managementBusy&&managementReport===source&&JSON.stringify(ReportContent.sections(source))===content,'Falha perdeu dados');
        document.getElementById('reportStart').value='Fev';document.getElementById('reportStart').dispatchEvent(new Event('change'));
        assert(document.getElementById('reportExport').disabled&&document.getElementById('reportAI').disabled&&document.getElementById('reportActions').dataset.state==='stale','Filtro não invalidou '+JSON.stringify({busy:managementBusy,start:document.getElementById('reportStart').value,state:document.getElementById('reportActions').dataset.state,signature:managementSignature,selection:reportSelection()}));
        await exportManagementReport();assert(downloads===1,'Exportação inconsistente');PdfProgress.dialog.close();
        document.getElementById('reportStart').value='Jan';document.getElementById('reportStart').dispatchEvent(new Event('change'));
        assert(PendingState.stable(projectPersistedState())===state&&!hasUnsavedChanges,'Estado persistido alterado');
        assert(document.documentElement.scrollWidth<=innerWidth+1,'Overflow '+innerWidth);
        console.log('PASS V4.1',n,'indicadores: resumo/recolhida/expandida, PDF completo sem expansão, progresso/download único, Groq/falha, cache e filtros');
    }
    document.getElementById('reportProvider').value='groq';document.getElementById('reportProvider').dispatchEvent(new Event('change'));
    document.getElementById('reportPreviewToggle').focus();return 'PASS V4.1 fixtures 1/15/40; nenhum cálculo, recomendação ou estado persistido alterado';
    }finally{window.fetch=oldFetch;loadReportPdfLibraries=oldLoader;reportDownloadBlob=oldDownload;managementChartImages=oldImages;ReportPdf.buildAsync=oldBuild;}
}
