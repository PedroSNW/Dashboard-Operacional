async function runReportV4Checks(){
    const assert=(v,m)=>{if(!v)throw Error(m);},clone=v=>JSON.parse(JSON.stringify(v));
    const state=PendingState.stable(projectPersistedState()),revision=stateRevision,source=managementReport,numbers=JSON.stringify(source.indicators),originalFetch=window.fetch;
    source.basis='mock-v4-basis';const base=clone(source.management);let calls=0,mode='valid';
    assert(ReportContent.valid(base,source)&&document.querySelectorAll('.report-management-section').length===5,'Prévia inicial V4');
    assert(base.actionPlan.length&&base.campaignSuggestions.length&&base.communicationSuggestions.length,'Propostas iniciais pertinentes');
    assert(!/IA utilizada|IA não utilizada|análise determinística|utilizada como apoio interpretativo/i.test(document.getElementById('reportPreview').textContent),'Indicação visual de execução');
    window.fetch=async(url,options)=>{
        calls++;const payload=JSON.parse(options.body);assert(payload.expectedReportBasis===source.basis&&payload.interpret===true,'Referência do relatório/ação explícita');
        if(mode==='failure')return {ok:false,status:401,json:async()=>({error:'Sessão de teste expirada'})};
        const management=clone(base);management.audit={structured:true,fallback:false,rejections:[]};
        management.actionPlan[0].title='Campanha de teste <img src=x onerror=alert(1)>';
        return {ok:true,json:async()=>({success:true,reportBasis:source.basis,management:mode==='invalid'?{version:4}:management,response:'Resumo validado',meta:{deterministicOnly:false}})};
    };
    try{
        await interpretManagementReport();assert(calls===1&&source.management.audit.structured&&source.aiUsed,'Resposta válida não aplicada');
        assert(!document.querySelector('#reportPreview img')&&document.getElementById('reportPreview').textContent.includes('<img src=x'),'HTML não tratado como texto');
        await interpretManagementReport();assert(calls===1,'Consulta redundante');
        const accepted=source.management;document.getElementById('reportProvider').value='openai';mode='invalid';await interpretManagementReport();assert(source.management===accepted,'Resposta inválida sobrescreveu propostas');
        mode='failure';await interpretManagementReport();assert(source.management===accepted&&!managementBusy&&!document.getElementById('reportAI').disabled,'Falha perdeu relatório/controle');
        const before=calls,loaded=supabaseStateLoaded;supabaseStateLoaded=false;await interpretManagementReport();supabaseStateLoaded=loaded;assert(calls===before,'Consulta sem leitura validada');
        assert(JSON.stringify(source.indicators)===numbers&&PendingState.stable(projectPersistedState())===state&&stateRevision===revision&&!hasUnsavedChanges,'Relatório alterou estado persistido ou cálculos');
        source.management=base;renderManagementReport();
        const content=ReportContent.sections(source),pdf=buildManagementPdf(source);
        assert(content.final[1].blocks.length===base.actionPlan.length&&pdf.getNumberOfPages()>=3,'Prévia e PDF não compartilham conteúdo');
        assert(calls===before,'PDF disparou consulta');
        const plan=document.querySelectorAll('.report-management-section')[3];plan.scrollIntoView({block:'start'});window.scrollBy(0,-100);
        return 'PASS V4 prévia/plano/campanhas, contrato válido/inválido, fallback preservado, HTML como texto, sem consulta redundante/exportação, números e estado intactos';
    }finally{window.fetch=originalFetch;}
}
