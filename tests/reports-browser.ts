const root=new URL('../',import.meta.url);
const read=p=>Deno.readTextFile(new URL(p,root));
let html=await read('public/index.html');
html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,'');
html=html.replace(/\sonerror="[^"]*"/g,'').replace(/src="https:[^"]*"/g,'src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="');
const report=JSON.parse(await read('.validation-tools/report-fixture.json'));delete report.context;
const setup=`window.__errors=[];addEventListener('error',e=>window.__errors.push(e.message));addEventListener('unhandledrejection',e=>window.__errors.push(String(e.reason)));window.ChartDataLabels={id:'mock-labels'};window.Swal={fire:async()=>({})};window.__session=null;window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:window.__session}}),onAuthStateChange(){}}})};`;
const checks=`
addEventListener('load',async()=>{
 const result=document.createElement('pre');result.id='report-validation';result.style.whiteSpace='pre-wrap';result.style.wordBreak='break-word';document.body.append(result);
 try{
  const report=${JSON.stringify(report)};
  currentData=report.indicators.map(i=>({...i,und:i.unidade}));mesesLabels=report.competencias;supabaseStateLoaded=true;supabaseReady=true;hasUnsavedChanges=false;currentSession={access_token:'mock-report'};window.__session=currentSession;
  window.fetch=async(url,options)=>{const body=JSON.parse(options.body);if(body.interpret)return {ok:false,status:429,json:async()=>({error:'Groq indisponível no teste'})};return {ok:true,json:async()=>({success:true,report})};};
  document.body.classList.add('authenticated');switchTab('reports');document.getElementById('reportType').value='comparativo';
  await generateManagementReport();
  if(!managementReport||managementCharts.length!==4||document.getElementById('reportExport').disabled)throw Error('Prévia/gráficos');
  await interpretManagementReport();if(!managementReport||managementReport.aiUsed||!document.getElementById('reportStatus').textContent.includes('preservado'))throw Error('Falha IA apagou relatório');
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const doc=window.buildManagementPdf(managementReport,managementChartImages());
  doc.setPage(1);doc.setTextColor(245,185,55);doc.setFontSize(13);doc.text('DEMONSTRACAO - DADOS FICTICIOS',18,265);
  if(doc.getNumberOfPages()<10)throw Error('PDF não multipágina');
  const pdf=document.createElement('textarea');pdf.id='report-pdf';pdf.hidden=true;pdf.textContent=doc.output('datauristring').split(',')[1];document.body.append(pdf);
  if(location.hash.includes('light'))applyTheme('light');
  if(document.documentElement.scrollWidth>innerWidth+3)throw Error('Overflow horizontal');
  if(window.__errors.length)throw Error(window.__errors.join(';'));
  result.textContent='PASS relatório sem IA, quatro gráficos Chart.js reais, falha Groq preserva prévia, PDF multipágina com gráficos, filtros, tema e sem overflow em '+innerWidth+'px';
 }catch(e){result.textContent='FAIL '+e.message;}
});`;
const scripts=[setup,await read('.validation-tools/tailwind.js'),await read('.validation-tools/chart.js'),await read('public/vendor/jspdf-4.2.1.umd.min.js'),await read('public/vendor/jspdf-autotable-5.0.8.min.js'),await read('public/report-pdf.js'),await read('public/main.js'),await read('public/reports.js'),checks];
const tags=scripts.map(s=>'<script>'+s.replace(/<\/script/gi,'<\\/script')+'</script>').join('\n');
html=html.replace('<head>',()=>`<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:"><style>${Deno.readTextFileSync(new URL('public/style.css',root))}</style>`).replace('</body>',()=>tags+'</body>');
await Deno.writeTextFile(new URL('.validation-tools/reports-browser.html',root),html);
