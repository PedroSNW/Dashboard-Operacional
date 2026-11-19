async function runReportV8Checks(fixtures,results){
    const assert=(valid,message)=>{if(!valid)throw Error(message);};
    const clone=value=>JSON.parse(JSON.stringify(value));
    const change=(id,value,event='change')=>{
        const node=document.getElementById(id);
        if(node.type==='checkbox')node.checked=value;else node.value=value;
        node.dispatchEvent(new Event(event,{bubbles:true}));
    };
    const oldFetch=window.fetch,oldDownload=reportDownloadBlob,oldLoader=loadReportPdfLibraries,oldBuild=ReportPdf.buildAsync;
    const initial=fixtures.at(-1);
    currentData=initial.indicators.map(i=>({id:i.id,indicador:i.indicador,setor:i.setor,und:i.unidade,meta:i.meta,direcaoDesempenho:i.direcaoDesempenho,valores:i.valores}));
    mesesLabels=[...initial.competencias];
    sectors=[...new Set(currentData.map(i=>i.setor))];
    supabaseStateLoaded=supabaseReady=true;
    currentSession={access_token:'mock',user:{id:'reviewer',email:'teste@dgranel.com.br'}};
    window.__session=currentSession;
    confirmPersistedSnapshot(projectPersistedState(),initial.snapshotUpdatedAt);
    refreshReportFilters();
    change('reportType','comparativo');change('reportStart','Jan');change('reportEnd','Mar');
    switchTab('reports');
    const persisted=PendingState.stable(projectPersistedState());
    assert(document.getElementById('reportProvider').closest('details').hidden,'Seletor multiprovedor visível');
    assert(document.getElementById('reportAI').textContent==='Gerar relatório com Groq','Rótulo');
    let sample, generationCalls=0,downloads=0, reviews=0, rejectGeneration=false,stale=false;
    window.__v7pdfs={};
    window.__v7metrics=[];
    loadReportPdfLibraries=async()=>{};
    reportDownloadBlob=blob=>{assert(blob.size>1000,'PDF vazio');downloads++;};
    window.fetch=async(url,options)=>{
        assert(String(url).endsWith('/seguranca-viaria-groq-v2'),'Rota V8');
        const body=JSON.parse(options.body);
        assert(!Object.hasOwn(body,'provider')&&!Object.hasOwn(body,'values'),'Provedor ou números do cliente');
        if(body.action==='preview')return Response.json({success:true,report:sample});
        assert(body.expectedReportBasis===sample.basis&&body.expectedUpdatedAt===sample.snapshotUpdatedAt,'Snapshot não vinculado');
        if(body.action==='generate'){
            generationCalls++;
            if(rejectGeneration)return Response.json({success:false,error:'Groq indisponível no teste.'},{status:400});
            return Response.json({success:true,authoredReportVersion:8,reportBasis:sample.basis,snapshotUpdatedAt:sample.snapshotUpdatedAt,...results[sample.indicators.length]});
        }
        assert(body.action==='review'&&body.reviewAcknowledged===true,'Revisão sem confirmação');
        reviews++;
        if(stale)return Response.json({success:false,error:'O snapshot mudou.'},{status:409});
        const data=results[sample.indicators.length];
        const check=ReportV8Core.validate(body.document,ReportV8Core.evidence(sample,data.evidenceKeys));
        return Response.json({success:check.valid,document:check.document,reportBasis:sample.basis,snapshotUpdatedAt:sample.snapshotUpdatedAt},{status:check.valid?200:422});
    };
    try{
        for(const report of fixtures){
            sample=report;
            const count=sample.indicators.length;
            for(const option of document.getElementById('reportIndicators').options)option.selected=sample.indicators.some(i=>JSON.stringify(i.id)===option.value);
            captureReportIndicatorSelection();
            const before=generationCalls;
            await generateManagementReport();
            assert(managementReport?.basis===sample.basis&&generationCalls===before,'Prévia consumiu IA');
            if(count===1){
                rejectGeneration=true;await ReportAuthoring.generate();
                assert(managementReport&&!managementReport.authored&&!document.getElementById('reportExport').disabled,'Fallback indisponível após erro');
                rejectGeneration=false;
            }
            await ReportAuthoring.generate();
            assert(ReportAuthoring.inspect().draft&&document.getElementById('reportExport').disabled,'Exportação sem revisão');
            const field=document.querySelector('#reportEditorial textarea');
            field.value='Houve 999 acidentes.';field.dispatchEvent(new Event('input',{bubbles:true}));
            change('reportEditorialAck',true);
            assert(document.getElementById('reportEditorialSave').disabled,'Edição numérica exportável');
            const first=ReportAuthoring.inspect().draft.sections[0];
            ReportAuthoring.restoreSection(first.id);
            const nav=()=>[...document.querySelectorAll('#reportEditorial button')];
            nav().find(b=>b.textContent==='Mover abaixo').click();
            assert(ReportAuthoring.inspect().draft.sections[1].id===first.id,'Reordenação');
            nav().find(b=>b.textContent==='Ocultar seção').click();
            assert(ReportAuthoring.inspect().hidden.includes(first.id),'Ocultação');
            ReportAuthoring.restoreAll();
            const title=document.querySelector('#reportEditorial > label input');
            title.value='Relatório revisado pela gestão';title.dispatchEvent(new Event('input',{bubbles:true}));
            change('reportEditorialAck',true);
            await ReportAuthoring.save();
            assert(managementReport.authored?.version===8&&managementReport.authored.reviewed,'Revisão');
            const after=generationCalls,beforeReview=reviews;
            for(const format of ['executive','complete']){
                change('reportFormat',format);
                let progress=false;
                ReportPdf.buildAsync=async(...args)=>{
                    const callback=args[2];
                    args[2]=state=>{progress=true;callback(state);};
                    const pdf=await oldBuild.apply(ReportPdf,args);
                    window.__v7pdfs[count+'-'+format]={pdf:pdf.output('datauristring').split(',')[1],layout:pdf.reportLayout};
                    return pdf;
                };
                const beforeDownload=downloads;
                await exportManagementReport();
                const layout=window.__v7pdfs[count+'-'+format]?.layout;
                assert(downloads===beforeDownload+1&&progress&&layout?.version===8&&layout.sourceIds.length===count,'PDF/progresso '+format);
                assert(layout.blocks.some(block=>block.text?.includes('Evidência oficial')),'Evidência oficial ausente no PDF');
                assert(layout.blocks.every(block=>block.y>=29.99&&block.bottom<=277.01&&block.x+block.width<=190.01),'Corte de texto');
                window.__v7metrics.push({count,format,pages:layout.pages});
                PdfProgress.dialog?.close();
            }
            assert(generationCalls===after&&reviews===beforeReview+2,'Exportação consumiu IA ou não conferiu snapshot');
            stale=true;const beforeStale=downloads;await exportManagementReport();stale=false;
            assert(downloads===beforeStale&&managementReport,'Exportou snapshot antigo ou perdeu base');
            PdfProgress.dialog?.close();
            nav().find(b=>b.textContent==='Usar relatório sem IA').click();
            assert(!managementReport.authored&&!document.getElementById('reportExport').disabled,'Fallback após revisão');
        }
        assert(PendingState.stable(projectPersistedState())===persisted&&!hasUnsavedChanges,'Edição alterou salvamento');
        await ReportAuthoring.generate();
        assert(!window.__errors.length&&document.querySelector('[data-section-title]'),'Montagem do editor');
        return 'PASS V8 prévia, Groq exclusiva, revisão, snapshot, fallback e PDFs Executivo/Completo para 1/15/40 indicadores';
    }finally{window.fetch=oldFetch;reportDownloadBlob=oldDownload;loadReportPdfLibraries=oldLoader;ReportPdf.buildAsync=oldBuild;}
}
