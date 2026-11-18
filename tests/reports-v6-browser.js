async function runReportV6Checks(fixtures){
 const assert=(v,m)=>{if(!v)throw Error(m);},clone=v=>JSON.parse(JSON.stringify(v));
 let calls=0,mode='valid',downloads=0,lastBody;const originalDownload=reportDownloadBlob,originalLoader=loadReportPdfLibraries,originalBuild=ReportPdf.buildAsync;
 if(innerWidth===1440)ReportPdf.buildAsync=async function(...args){const doc=await originalBuild.apply(this,args);window.__v6pdfs??={};window.__v6pdfs[args[0].indicators.length]={pdf:doc.output('datauristring').split(',')[1],layout:doc.reportLayout};return doc;};
 const ctx=document.getElementById('reportContext-actionsTaken'),change=(id,value,event='change')=>{document.getElementById(id).value=value;document.getElementById(id).dispatchEvent(new Event(event,{bubbles:true}));};
 loadReportPdfLibraries=async()=>{};reportDownloadBlob=blob=>{assert(blob.size>0,'PDF vazio');downloads++;};
 try{for(const fixture of fixtures){
  clearReportContext();resetManagementReport();currentData=fixture.indicators.map(i=>({...clone(i),und:i.unidade}));mesesLabels=[...fixture.competencias];supabaseStateLoaded=supabaseReady=true;lastSupabaseSavedAt=null;
  confirmPersistedSnapshot(projectPersistedState(),'2026-11-17T12:00:00Z');switchTab('reports');refreshReportFilters();change('reportType','comparativo');document.getElementById('reportAll').click();change('reportProvider','groq');
  const persisted=PendingState.stable(projectPersistedState());let active;
  window.fetch=async(url,opt)=>{calls++;lastBody=JSON.parse(opt.body);const b=lastBody;
   if(!b.interpret){active=__v6.buildReport({mesesLabels,indicadores:currentData},b.selection,'2026-11-17T12:00:00Z',b.managementContext);delete active.context;active.basis=JSON.stringify([b.selection,b.managementContext]);return {ok:true,json:async()=>({success:true,report:clone(active)})};}
   if(mode==='failure')return {ok:false,status:429,json:async()=>({error:'Limite simulado; prévia preservada.'})};
   const p={executiveDiagnosis:[{indicatorId:active.indicators[0].id,stat:'evolucao'}],priorityRisks:[],actionPlan:[{indicatorId:active.indicators[0].id,strategy:'tratativas'}],campaignSuggestions:[],communicationSuggestions:[],limitations:[]};
   const management=__v6.buildReportManagement(active,mode==='truncated'?'{':JSON.stringify(p));const intelligence=__v6.buildReportIntelligence(active,management);
   return {ok:true,json:async()=>({success:true,management,intelligence,reportBasis:active.basis,meta:{deterministicOnly:mode==='truncated'}})};
  };
  const start=calls;mode='valid';await generateManagementReport();const r=managementReport,n=r.indicators.length;
  assert(n===fixture.indicators.length&&calls===start+1,'Seleção/chamada automática');assert(managementCharts.length===0&&document.getElementById('reportPreviewDetails').hidden,'Prévia deve iniciar recolhida');
  const numbers=JSON.stringify(r.indicators);setManagementPreviewExpanded(true);assert(managementCharts.length===ReportContent.chartIds(r).length,'Gráficos seletivos');
  assert(document.querySelectorAll('#reportPreviewDetails h3').length>4,'Seções gerenciais');assert(![...document.querySelectorAll('#reportPreviewDetails h3')].some(e=>!e.textContent.trim()),'Título vazio');setManagementPreviewExpanded(false);assert(managementCharts.length===0,'Limpeza dos gráficos');
  await interpretManagementReport();assert(managementReport.aiUsed&&managementReport.management.audit.structured&&JSON.stringify(managementReport.indicators)===numbers,'IA válida/alterou dados');
  const afterAI=calls;await interpretManagementReport();assert(calls===afterAI,'Análise duplicada');
  change('reportProvider','gemini');mode='truncated';await interpretManagementReport();assert(managementReport.management.audit.fallback,'JSON truncado sem fallback');
  change('reportProvider','openai');mode='failure';await interpretManagementReport();assert(managementReport&&JSON.stringify(managementReport.indicators)===numbers&&!managementBusy,'Falha perdeu relatório');
  change('reportContext-actionsTaken','Orientação interna fictícia <img src=x onerror=alert(1)>','input');
  assert(document.getElementById('reportExport').disabled&&reportContextValue().shareWithAI===false,'Contexto não invalidou/consentimento implícito');
  change('reportContext-goals','Objetivo proposto','input');change('reportContextGoalKind','approved');let rejected=false;try{validateReportContext(reportContextValue());}catch{rejected=true;}assert(rejected,'Aprovação presumida');
  change('reportContextGoalKind','management');change('reportContextActionStatus','reported_in_progress');mode='valid';await generateManagementReport();
  assert(managementReport.managementContext.actionsTaken.includes('fictícia')&&JSON.stringify(managementReport.indicators)===numbers,'Contexto modificou matemática');
  setManagementPreviewExpanded(true);assert(!document.querySelector('#reportPreviewDetails img[src="x"]'),'HTML do relato executado');setManagementPreviewExpanded(false);
  document.getElementById('reportContextShare').checked=true;document.getElementById('reportContextShare').dispatchEvent(new Event('change'));await generateManagementReport();assert(lastBody.managementContext.shareWithAI,'Consentimento não enviado');
  change('reportStart','Fev');assert(reportContextValue()===null&&ctx.value.includes('fictícia')&&document.getElementById('reportContextFields').disabled,'Reutilização em outro recorte');
  change('reportStart','Jan');assert(reportContextValue()===null,'Retorno reutilizou contexto automaticamente');document.getElementById('reportContextRebind').click();assert(reportContextValue()!==null,'Vínculo explícito falhou');await generateManagementReport();
  if(innerWidth===1440){const before=downloads,network=calls;await Promise.all([exportManagementReport(),exportManagementReport()]);assert(downloads===before+1&&calls===network,'Download duplicado/consulta durante PDF');assert(PdfProgress.history.at(-1).percent===100&&PdfProgress.history.some(h=>h.stage==='Preparando gráficos'),'Progresso real ausente');PdfProgress.dialog.close();}
  assert(PendingState.stable(projectPersistedState())===persisted&&!hasUnsavedChanges,'Contexto criou alteração corporativa');assert(document.documentElement.scrollWidth<=innerWidth+1,'Overflow '+innerWidth);
  console.log('PASS V6 navegador',n,'indicadores em',innerWidth,'px');
 }
 clearReportContext();assert(!ctx.value&&!reportContextValue(),'Contexto não limpo');change('reportProvider','groq');await generateManagementReport();document.getElementById('reportPreviewToggle').focus();
 return 'PASS V6 1/15/40: prévia, gráficos seletivos, IA válida/truncada/falha, consentimento, isolamento, vínculo, estado e PDF recolhido (desktop)';
 }finally{reportDownloadBlob=originalDownload;loadReportPdfLibraries=originalLoader;ReportPdf.buildAsync=originalBuild;}
}
