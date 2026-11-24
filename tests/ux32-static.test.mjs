const assert=(v,m)=>{if(!v)throw Error(m);};
const read=p=>Deno.readTextFile(p),before='.validation-tools/ux32-before/public/';
const html=await read('public/index.html'),old=await read(before+'index.html'),ids=s=>[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const removed=new Set(['reportProvider','aiAlternativeProviders','currentProviderLabel','currentProviderApiInfo','provider-btn-groq','provider-btn-openai','provider-btn-gemini','badge-provider-groq','badge-provider-openai','badge-provider-gemini']);
assert(ids(old).every(id=>removed.has(id)||ids(html).includes(id))&&new Set(ids(html)).size===ids(html).length,'IDs removidos/duplicados');
for(const file of ['main.js','ai.js','reports.js','workspace-v3.js','workspace-v3-2.js','pending-changes.js','report-evidence.js','report-authoring.js','report-pdf.js'])new Function(await read('public/'+file));
// V7 extends the PDF compositor intentionally; its legacy and authored output have dedicated regressions.
for(const file of ['report-content.js','report-executive.js','pending-state.js','theme-preference.js','pdf-progress.js','motion-v3-1.js'])assert(await read('public/'+file)===await read(before+file),'Contrato preservado alterado '+file);
const fn=(s,name)=>{const start=s.search(new RegExp('^(?:async )?function '+name+'\\(','m'));if(start<0)throw Error(name);const next=s.slice(start+1).search(/^(?:async )?function /m);return s.slice(start,next<0?s.length:start+1+next).trim();};
const main=await read('public/main.js'),oldMain=await read(before+'main.js');
for(const name of ['calcMetrics','generateAutomaticAnalyses','generateDeterministicAlerts','getReadAlertIds','saveReadAlertIds','projectPersistedState','saveReviewedState','persistirEstadoSupabase','carregarDadosCompartilhados','getIntelligenceDirection','saveIndicatorForm','parseCSVContent','registrarLog'])assert(fn(main,name)===fn(oldMain,name),'Regra ou persistência alterada '+name);
assert(!(await read('public/workspace-v3-2.css')).includes('!important'),'Sobrescrita nova indiscriminada');assert(!(await read('public/workspace-v3-2.js')).includes('fetch('),'Transporte na camada visual');
console.log('PASS V3.2/V7: IDs, sintaxe, seis módulos preservados, treze funções de dados/motor/persistência idênticas, sem fetch ou !important na camada visual V3.2. PDF verificado pelas regressões V6.1/V7.');
