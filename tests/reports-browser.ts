import { generateReport } from '../supabase/functions/seguranca-viaria-ia/report-ai.ts';
import { report } from './report-fixtures.mjs';

const read = (path: string) => Deno.readTextFile(path);
let html = await read('public/index.html');
const localScripts = [...html.matchAll(/<script src="([a-z][a-z0-9.-]+\.js)(?:\?[^"]*)?"><\/script>/g)].map(match => match[1]);
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<link\b[^>]*>/gi, '')
    .replace(/\sonerror="[^"]*"/g, '').replace(/src="https:[^"]*"/g, 'src="data:,"');
const preview = { ...report(4), basis: 'fixture-report' };
const generated = await generateReport(preview, async (_instruction, input: any) => ({
    content: JSON.stringify({ highlights: input.indicators.map((item: any) => item.key), actions: input.actions.map((item: any) => item.key) }),
    model: 'mock',
}));
const setup = `
window.__errors=[];
addEventListener('error',event=>window.__errors.push(event.message));
addEventListener('unhandledrejection',event=>window.__errors.push(String(event.reason)));
window.ChartDataLabels={id:'mock-labels'};
window.Swal={fire:async()=>({})};
window.__session=null;
window.Chart=class { static defaults={plugins:{}}; static register(){} static getChart(){return null;} destroy(){} };
window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:window.__session}}),onAuthStateChange(){}}})};
`;
const checks = [
    'const smokeReport='+JSON.stringify(preview)+';',
    'const smokeGeneration='+JSON.stringify(generated)+';',
    `
addEventListener('load',async()=>{
    const status=document.createElement('pre');status.id='report-validation';document.body.append(status);
    const assert=(valid,message)=>{if(!valid)throw Error(message);};
    const node=id=>document.getElementById(id);
    try {
        currentData=smokeReport.indicators.map(i=>({...i,und:i.unidade}));
        mesesLabels=smokeReport.competencias;
        sectors=[...new Set(currentData.map(i=>i.setor))];
        supabaseStateLoaded=supabaseReady=true;
        currentSession={access_token:'mock',user:{id:'reviewer',email:'teste@dgranel.com.br'}};
        window.__session=currentSession;
        confirmPersistedSnapshot(projectPersistedState(),smokeReport.snapshotUpdatedAt);
        let fail=true;const actions=[];
        window.fetch=async(url,options)=>{
            assert(String(url).endsWith('/seguranca-viaria-ia'),'Rota única');
            const body=JSON.parse(options.body);actions.push(body.action);
            if(body.action==='chat'){
                assert(Object.keys(body).length===2,'O navegador enviou dados operacionais para a consulta');
                return Response.json({success:true,response:'<b>Resposta como texto</b>',evidence:['Resultado oficial do teste.'],coverage:{sent:3,selected:4}});
            }
            if(body.action==='preview')return Response.json({success:true,report:smokeReport});
            assert(body.expectedReportBasis===smokeReport.basis,'Snapshot não vinculado');
            const identity={success:true,reportBasis:smokeReport.basis,snapshotUpdatedAt:smokeReport.snapshotUpdatedAt};
            if(body.action==='generate')return fail?Response.json({success:false,error:'Falha simulada'},{status:502})
                :Response.json({...identity,...smokeGeneration});
            assert(body.action==='review'&&body.reviewAcknowledged,'Revisão sem confirmação');
            const check=ReportEvidence.validate(body.document,ReportEvidence.evidence(smokeReport,smokeGeneration.evidenceKeys));
            return Response.json({...identity,document:check.document,success:check.valid},{status:check.valid?200:422});
        };
        node('aiQuestionForm').requestSubmit();
        await new Promise(resolve=>setTimeout(resolve,50));
        assert(node('aiResponseBody').firstChild.textContent==='<b>Resposta como texto</b>'&&!node('aiResponseBody').querySelector('b')&&node('aiResponseBody').querySelector('details').textContent.includes('Resultado oficial do teste.'),'Central - '+node('aiStatusText').textContent+' - '+node('aiResponseBody').textContent+' - '+actions.join(','));
        switchTab('reports');
        node('reportType').value='comparativo';
        refreshReportFilters();
        await generateManagementReport();
        assert(managementReport?.basis===smokeReport.basis&&actions.join(',')==='chat,preview','Prévia');
        await ReportAuthoring.generate();
        assert(!node('reportExport').disabled&&node('reportStatus').textContent.includes('Falha simulada'),'Falha Groq bloqueou a base');
        assert(window.buildManagementPdf(managementReport).getNumberOfPages()>1,'PDF da base');
        fail=false;await ReportAuthoring.generate();
        assert(node('reportExport').disabled&&!node('reportEditorial').hidden,'Revisão obrigatória');
        const input=document.querySelector('#reportEditorial textarea');
        input.value='Houve 999 acidentes.';input.dispatchEvent(new Event('input'));
        node('reportEditorialAck').click();
        assert(node('reportEditorialSave').disabled,'Revisão aceitou número sem evidência');
        ReportAuthoring.restoreAll();node('reportEditorialAck').click();
        await ReportAuthoring.save();
        assert(managementReport.authored?.reviewed&&!node('reportExport').disabled,'Revisão e exportação');
        for(const exportFormat of ['executive','complete']){
            const pdf=window.buildManagementPdf({...managementReport,exportFormat});
            assert(pdf.reportLayout.authored&&pdf.reportLayout.format===exportFormat&&pdf.output('arraybuffer').byteLength>1000,'PDF '+exportFormat);
        }
        assert(!hasUnsavedChanges&&!window.__errors.length,window.__errors.join('; ')||'IA alterou o dashboard');
        status.textContent='PASS Central, prévia sem IA, fallback, revisão e PDFs Executivo e Completo na função única.';
    }catch(error){status.textContent='FAIL '+error.message+' '+window.__errors.join('; ');}
});
`
].join('\n');

const optionalChart = await read('.validation-tools/chart.js').catch(() => '');
const scripts = [setup, optionalChart,
    ...await Promise.all(localScripts.map(file => read('public/' + file))),
    await read('public/vendor/jspdf-4.2.1.umd.min.js'),
    await read('public/vendor/jspdf-autotable-5.0.8.min.js'),
    await read('public/report-pdf.js'), checks];
const styles = await Promise.all(['style.css','workspace-v3.css','motion-v3-1.css','pending-changes.css','workspace-v3-2.css','report-authoring.css'].map(file => read('public/' + file)));
html = html.replace('<head>', () => "<head><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:\"><style>" + styles.join('\n') + '</style>');
html = html.replace('</body>', () => scripts.map(script => '<script>'+script.replace(/<\/script/gi,'<\\/script')+'</script>').join('\n')+'</body>');
await Deno.mkdir('.validation-tools', { recursive: true });
await Deno.writeTextFile('.validation-tools/reports-browser.html', html);
