async function runReportV7Checks(fixtures,documents){
 const assert=(v,m)=>{if(!v)throw Error(m);},C=ReportAuthoredCore,change=(id,value,event='change')=>{const n=document.getElementById(id);n.type==='checkbox'?n.checked=value:n.value=value;n.dispatchEvent(new Event(event,{bubbles:true}));},clone=v=>JSON.parse(JSON.stringify(v));
 const oldFetch=window.fetch,oldDownload=reportDownloadBlob,oldLoader=loadReportPdfLibraries,oldBuild=ReportPdf.buildAsync;
 let authorCalls=0,reviewCalls=0,mode='valid',downloads=0,hold,release,requestStarted=false;
 window.__v7pdfs={};const metrics=[];
 const setBase=r=>{ReportAuthoring.reset();for(const o of document.getElementById('reportIndicators').options)o.selected=r.indicators.some(i=>JSON.stringify(i.id)===o.value);captureReportIndicatorSelection();managementReport=clone(r);managementSignature=reportSignature();managementReport.snapshotUpdatedAt='2026-11-18T12:00:00Z';lastSupabaseSavedAt=Date.parse(managementReport.snapshotUpdatedAt);renderManagementReport(false);reportUpdateActions();};
 const r=fixtures[2];currentData=r.indicators.map(i=>({id:i.id,indicador:i.indicador,setor:i.setor,und:i.unidade,meta:i.meta,direcaoDesempenho:i.direcaoDesempenho,valores:[...i.valores]}));mesesLabels=[...r.competencias];sectors=[...new Set(currentData.map(i=>i.setor))];supabaseStateLoaded=supabaseReady=true;currentSession={access_token:'mock',user:{id:'reviewer',email:'teste@dgranel.com.br'}};window.__session=currentSession;
 confirmPersistedSnapshot(projectPersistedState(),'2026-11-18T12:00:00Z');refreshReportFilters();document.getElementById('reportType').value='comparativo';document.getElementById('reportStart').value='Jan';document.getElementById('reportEnd').value='Mar';document.getElementById('reportProvider').value='groq';switchTab('reports');
 const persisted=PendingState.stable(projectPersistedState());
 window.fetch=async(_url,options)=>{
  const body=JSON.parse(options.body);
  if(body.author){authorCalls++;requestStarted=true;if(hold)await hold;if(mode==='failure')return {ok:false,status:429,headers:new Headers({'retry-after':'1'}),json:async()=>({error:'Cota simulada; base preservada.',retryAfter:1})};const document=clone(documents[managementReport.indicators.length]??documents[15]);if(mode==='invalid')document.sections[0].text='Houve 999 acidentes.';return {ok:true,json:async()=>({success:true,authoredReportVersion:1,document,evidence:C.evidence(managementReport),reportBasis:managementReport.basis,snapshotUpdatedAt:managementReport.snapshotUpdatedAt,coverage:{sent:Math.min(12,managementReport.indicators.length),selected:managementReport.indicators.length,partial:managementReport.indicators.length>12,summarizedSeries:0},validation:{issues:[]},meta:{provider:'groq',model:'mock'}})};}
  if(body.reviewDocument){reviewCalls++;const checked=C.validate(body.reviewDocument,C.evidence(managementReport));return {ok:checked.valid,status:checked.valid?200:422,json:async()=>checked.valid?{success:true,document:body.reviewDocument,reportBasis:managementReport.basis,snapshotUpdatedAt:managementReport.snapshotUpdatedAt}:{error:'Revisão inconsistente'}};}
  throw Error('Chamada não esperada');
 };
 loadReportPdfLibraries=async()=>{};reportDownloadBlob=blob=>{assert(blob.size>1000,'PDF vazio');downloads++;};
 try{
  for(const source of fixtures){
   setBase(source);const count=source.indicators.length,before=authorCalls;await ReportAuthoring.generate();assert(authorCalls===before+1&&ReportAuthoring.inspect().draft,'Geração autoral');assert(!document.getElementById('reportEditorial').hidden,'Editor oculto');
   let blocked=false;try{ReportAuthoring.assertExportable(managementReport);}catch{blocked=true;}assert(blocked&&document.getElementById('reportExport').disabled,'Exportação antes de revisão');
   const title=document.querySelector('#reportEditorial>label input');title.value='Panorama revisado para reunião';title.dispatchEvent(new Event('input',{bubbles:true}));assert(ReportAuthoring.inspect().dirty&&!hasUnsavedChanges,'Edição corporativa');
   const sectionTitle=document.querySelector('[data-section-title]');sectionTitle.value='Síntese revisada';sectionTitle.dispatchEvent(new Event('input',{bubbles:true}));
   const text=document.querySelector('#reportEditorial textarea');text.value='O resultado recente foi 999.';text.dispatchEvent(new Event('input',{bubbles:true}));assert(document.getElementById('reportEditorialSave').disabled&&document.getElementById('reportEditorialIssues').textContent.includes('Use uma referência oficial'),'Número manual aceito');
   text.value='Consultar {{constructor}} antes de decidir.';text.dispatchEvent(new Event('input',{bubbles:true}));assert(document.getElementById('reportEditorialSave').disabled,'Referência textual falsa aceita');
   ReportAuthoring.restoreSection('panorama');assert(ReportAuthoring.inspect().draft.sections[0].text===documents[count].sections[0].text,'Restaurar seção');
   const nav=()=>[...document.querySelectorAll('#reportEditorial button')];
   if(count>1){nav().find(b=>b.textContent==='Mover abaixo').click();assert(ReportAuthoring.inspect().draft.sections[1].id==='panorama','Ordenação');nav().find(b=>b.textContent==='Ocultar seção').click();assert(ReportAuthoring.inspect().hidden.includes('panorama'),'Ocultar');nav().find(b=>b.textContent==='Mostrar seção').click();}
   ReportAuthoring.restoreAll();assert(ReportAuthoring.inspect().draft.title===documents[count].title,'Restaurar versão');
   const editTitle=document.querySelector('#reportEditorial>label input');editTitle.value='Documento revisado para discussão';editTitle.dispatchEvent(new Event('input',{bubbles:true}));change('reportEditorialAck',true);await ReportAuthoring.save();
   assert(managementReport.authored?.reviewed&&managementReport.authored.document.title==='Documento revisado para discussão','Revisão não aplicada');ReportAuthoring.assertExportable(managementReport);setManagementPreviewExpanded(true);assert(document.getElementById('reportPreviewDetails').textContent.includes(documents[count].sections[0].title),'Prévia autoral divergente');setManagementPreviewExpanded(false);
   const callsBefore=authorCalls;change('reportFormat','complete');change('reportFormat','executive');await ReportAuthoring.generate();assert(authorCalls===callsBefore,'Formato repetiu chamada');
   for(const format of ['executive','complete']){
    change('reportFormat',format);let sawProgress=false;ReportPdf.buildAsync=async(...args)=>{const callback=args[2];args[2]=event=>{sawProgress=true;callback(event);};const pdf=await oldBuild.apply(ReportPdf,args);window.__v7pdfs[count+'-'+format]={pdf:pdf.output('datauristring').split(',')[1],layout:pdf.reportLayout};return pdf;};
    const beforeDownload=downloads;await exportManagementReport();assert(downloads===beforeDownload+1&&sawProgress,'Download/progresso');const layout=window.__v7pdfs[count+'-'+format].layout;
    assert(layout.version===7&&layout.format===format&&layout.sourceIds.length===count,'Composição V7');assert(layout.blocks.some(b=>b.text?.includes('Documento revisado')),'Versão incorreta');assert(layout.blocks.every(b=>b.y>=29.99&&b.bottom<=277.01&&b.x+b.width<=190.01),'Corte de texto');assert(document.getElementById('reportPreviewDetails').hidden,'Exportação expandiu prévia');
    metrics.push({count,format,pages:layout.pages,charts:layout.figures.length});PdfProgress.dialog?.close();
   }
   const originalTitle=document.querySelector('#reportEditorial>label input');originalTitle.value='Revisão ainda não salva';originalTitle.dispatchEvent(new Event('input',{bubbles:true}));const beforeDownload=downloads;await exportManagementReport();assert(downloads===beforeDownload,'Exportou edição não salva');PdfProgress.dialog?.close();
   nav().find(b=>b.textContent==='Descartar revisão').click();assert(ReportAuthoring.inspect().draft.title==='Documento revisado para discussão','Descartar não restaurou versão salva');
   // Explicit deterministic fallback permits export without the unvalidated draft.
   nav().find(b=>b.textContent==='Usar relatório sem IA').click();assert(!managementReport.authored,'Fallback manteve autoral');ReportAuthoring.assertExportable(managementReport);
  }
  setBase(fixtures[1]);mode='invalid';await ReportAuthoring.generate();assert(!ReportAuthoring.inspect().draft&&managementReport,'JSON incompatível apagou base');
  mode='failure';await ReportAuthoring.generate();assert(managementReport&&!managementReport.authored&&!managementBusy,'Falha sem fallback');
  // Another provider has no Groq cooldown. It still uses the same authored contract.
  change('reportProvider','openai');mode='valid';await new Promise(r=>setTimeout(r,1050));await ReportAuthoring.generate();assert(ReportAuthoring.inspect().draft,'Recuperação');
  change('reportStart','Fev');assert(!ReportAuthoring.inspect().draft&&document.getElementById('reportExport').disabled,'Troca de seleção');change('reportStart','Jan');
  setBase(fixtures[1]);await ReportAuthoring.generate();currentSession={...currentSession,user:{...currentSession.user,id:'another-user'}};reportUpdateActions();assert(!ReportAuthoring.inspect().draft,'Troca de usuário reteve texto');currentSession={...currentSession,user:{...currentSession.user,id:'reviewer'}};
  setBase(fixtures[1]);hold=new Promise(r=>release=r);requestStarted=false;const pending=ReportAuthoring.generate();for(let n=0;!requestStarted&&n<50;n++)await new Promise(r=>setTimeout(r,1));assert(managementBusy&&document.getElementById('reportAI').disabled,'Processamento');await ReportAuthoring.generate();currentSession=null;ReportAuthoring.reset();release();await pending;hold=null;assert(!ReportAuthoring.inspect().draft,'Resposta tardia após logout');currentSession=window.__session;
  assert(PendingState.stable(projectPersistedState())===persisted&&!hasUnsavedChanges,'Rascunho alterou payload');
  setBase(fixtures[1]);await ReportAuthoring.generate();document.querySelector('[data-section-title]').focus();assert(document.activeElement.getAttribute('data-section-title')==='true','Foco editor');
  window.__v7metrics=metrics;assert(!window.__errors.length,'Erros JS');return 'PASS V7 editor/restaurar/ordenar/ocultar/revisão/validação/fallback/sessão/filtros/duplicação + PDFs 1/15/40 Executivo/Completo e progresso real';
 }finally{window.fetch=oldFetch;reportDownloadBlob=oldDownload;loadReportPdfLibraries=oldLoader;ReportPdf.buildAsync=oldBuild;}
}
