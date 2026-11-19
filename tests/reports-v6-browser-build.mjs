// Empacotamento exclusivo do teste: executa os módulos reais no mock do navegador.
const read=p=>Deno.readTextFile(p),dir='supabase/functions/seguranca-viaria-ia/';
const wrap=async(file,inject,names)=>`(()=>{${inject}\n${(await read(dir+file)).replace(/^import .*;\r?\n/gm,'').replace(/^export \{.*\} from .*;\r?\n/gm,'').replace(/\bexport /g,'')}\nreturn {${names}};})()`;
const S=await wrap('report-semantics.js','','measurementAssessment,MEASUREMENT_POLICY');
const A=await wrap('analytics.js','const {measurementAssessment,MEASUREMENT_POLICY}=S;','analyzeIndicator,INTERPRETATION_CONTRACT');
const G=await wrap('groq-context.js','const {INTERPRETATION_CONTRACT}=A;','estimateTokens,GROQ_INPUT_BUDGET,GROQ_MARGIN,GROQ_MAX_BODY_BYTES,GROQ_ENVELOPE_RESERVE');

const I=await wrap('report-intelligence.js','const {measurementAssessment,MEASUREMENT_POLICY}=S;','normalizeManagementContext,buildReportIntelligence,operationalAssessment');
const M=await wrap('report-management.js','const {measurementAssessment}=S;const {estimateTokens,GROQ_INPUT_BUDGET,GROQ_MARGIN,GROQ_MAX_BODY_BYTES,GROQ_ENVELOPE_RESERVE}=G;','buildReportManagement');
const R=await wrap('reports.js','const {analyzeIndicator}=A,{buildReportManagement}=M,{normalizeManagementContext,buildReportIntelligence,operationalAssessment}=I;','buildReport');
const bundle=`(()=>{const S=${S},A=${A},G=${G},I=${I},M=${M},R=${R};window.__v6={...R,...M,...I};})();`;
let html=await read('.validation-tools/reports-browser.html');
// O smoke inicial ainda usa a fixture V6; agora considera somente os gráficos úteis.
html=html.replace('managementCharts.length!==report.indicators.length','managementCharts.length!==ReportContent.chartIds(report).length');
html=html.replace('</body>',()=>'<script>'+bundle.replace(/<\/script/gi,'<\\/script')+'</script></body>');
await Deno.writeTextFile('.validation-tools/reports-v6-browser.html',html);
