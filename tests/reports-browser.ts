import { generateReport } from '../supabase/functions/seguranca-viaria-ia/report-ai.ts';
import { report } from './report-fixtures.mjs';

const read = (path: string) => Deno.readTextFile(path);
let html = await read('public/index.html');
const localScripts = [...html.matchAll(/<script src="([a-z][a-z0-9.-]+\.js)(?:\?[^"]*)?"><\/script>/g)].map(match => match[1]);
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<link\b[^>]*>/gi, '')
    .replace(/\sonerror="[^"]*"/g, '').replace(/src="https:[^"]*"/g, 'src="data:,"');
const preview = { ...report(4), basis: 'fixture-report' };
const generated = await generateReport(preview, async (_instruction, input: any) => ({
    content: JSON.stringify({
        summary: { text: 'A gestão deve conferir as pendências antes de ampliar a intervenção.', refs: [input.indicators[0].key] },
        findings: [{ type: 'integrated', title: 'Lacuna de tratamento', text: 'Conferir os registros que ficaram pendentes pode orientar a decisão.', refs: [input.indicators[0].key] }],
        actions: [{ title: 'Revisar o fluxo de conferência', text: 'Analisar as pendências com a operação.', refs: [input.indicators[0].key],
            method:'post',audience:'Equipes de operação',owner: 'Segurança Viária', followUp: 'Acompanhar o fechamento dos registros.', days: 30 }],
    }),
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
    'const smokeLogo='+JSON.stringify(btoa(String.fromCharCode(...await Deno.readFile('public/report-logo-dgranel.png'))))+';',
    'const smokeBrand='+JSON.stringify('data:image/png;base64,'+btoa(Array.from(await Deno.readFile('public/dgranel-mark.png'),byte=>String.fromCharCode(byte)).join('')))+';',
    `
addEventListener('load',async()=>{
    const status=document.createElement('pre');status.id='report-validation';document.body.append(status);
    const assert=(valid,message)=>{if(!valid)throw Error(message);};
    const node=id=>document.getElementById(id);
    try {
        for(const image of document.querySelectorAll('.fleet-scene img')){
            image.src=smokeFleet[image.getAttribute('src')];
        }
        document.querySelectorAll('img[src="dgranel-mark.png"]').forEach(image=>{image.srcset=smokeBrand;});
        currentData=smokeReport.indicators.map(i=>({...i,und:i.unidade}));
        mesesLabels=smokeReport.competencias;
        sectors=[...new Set(currentData.map(i=>i.setor))];
        supabaseStateLoaded=supabaseReady=true;
        currentSession={access_token:'mock',user:{id:'reviewer',email:'teste@dgranel.com.br'}};
        window.__session=currentSession;
        document.body.classList.add('authenticated');
        confirmPersistedSnapshot(projectPersistedState(),smokeReport.snapshotUpdatedAt);
        let fail=true,onepageFailure=true,logoLoaded=false;const actions=[];
        window.fetch=async(url,options)=>{
            if(String(url).includes('/rest/v1/audit_logs?'))return Response.json([]);
            if(url==='report-logo-dgranel.png'){
                logoLoaded=true;
                return new Response(Uint8Array.from(atob(smokeLogo),ch=>ch.charCodeAt(0)));
            }
            assert(String(url).endsWith('/seguranca-viaria-ia'),'Rota única');
            const body=JSON.parse(options.body);actions.push(body.action);
            if(body.action==='chat'){
                assert(Object.keys(body).length===2,'O navegador enviou dados operacionais para a consulta');
                return Response.json({success:true,response:'<b>Resposta como texto</b>',evidence:['Resultado oficial do teste.'],coverage:{sent:3,selected:4}});
            }
            if(body.action==='preview')return Response.json({success:true,report:smokeReport});
            if(body.action==='onepage'){
                assert(Object.keys(body).length===4&&body.orientation==='landscape'&&body.expectedUpdatedAt===smokeReport.snapshotUpdatedAt,
                    'A OnePage enviou dados ou recorte incompatíveis');
                const ids=body.selection.ids;
                assert(ids.length===2&&ids[0]===smokeReport.indicators[0].id&&ids[1]===smokeReport.indicators[1].id,'Seleção da OnePage com IA');
                if(onepageFailure)return Response.json({success:false,error:'Montagem indisponível no teste'},{status:502});
                const options={title:'',text:'',width:'full',chart:'line',tone:'neutral',target:false,comparison:false,labels:false};
                return Response.json({success:true,snapshotUpdatedAt:smokeReport.snapshotUpdatedAt,composition:{
                    title:'OnePage da reunião',subtitle:'Indicadores escolhidos',blocks:[
                        {...options,type:'kpi',width:'half',indicators:[ids[0]],comparison:true},
                        {...options,type:'note',title:'Pauta',text:'Revisar a evolução na próxima reunião.',width:'half',indicators:[]},
                        {...options,type:'chart',indicators:[ids[1]],chart:'bar',target:true},
                        {...options,type:'table',indicators:ids},
                    ],
                }});
            }
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
        window.refreshOperationalUI();
        assert(node('workspacePerformanceLegend').textContent.includes('Na meta')&&node('v3Count').textContent==='4','Panorama operacional');
        document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}));
        const search=node('workspaceSearch'),query=search.querySelector('input');
        assert(search.open&&!search.textContent.includes('Auditoria'),'Busca global e acesso à auditoria');
        query.value='relatorios';query.dispatchEvent(new Event('input'));
        query.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
        assert(!search.open&&!node('view-reports').classList.contains('hidden'),'Navegação pelo teclado');
        node('reportType').value='mensal';
        node('reportType').dispatchEvent(new Event('change'));
        assert(node('reportStart').value===node('reportEnd').value&&node('reportEnd').disabled,'Período mensal');
        node('reportType').value='comparativo';
        node('reportType').dispatchEvent(new Event('change'));
        node('reportEnd').value=smokeReport.competencias.at(-1);
        refreshReportFilters();
        assert(!node('reportAI').disabled&&node('reportDownload').hidden,'Análise direta e exportação antes da prévia');
        await ReportAuthoring.generate();
        assert(managementReport?.basis===smokeReport.basis&&actions.join(',')==='chat,preview,generate','O clique de IA deve preparar e analisar');
        assert(!node('reportExport').disabled&&node('reportStatus').textContent.includes('Falha simulada'),'Falha Groq bloqueou a base');
        assert(window.buildManagementPdf(managementReport).getNumberOfPages()>1,'PDF da base');
        fail=false;await ReportAuthoring.generate();
        assert(node('reportExport').disabled&&!node('reportEditorial').hidden,'Revisão obrigatória');
        assert(node('reportEditorial').textContent.includes('Síntese executiva')&&node('reportEditorial').textContent.includes('Evidências oficiais'),'Leitura da análise');
        const sections=[...node('reportEditorial').querySelectorAll('nav button')];
        sections.at(-1).click();
        const format=[...node('reportEditorial').querySelectorAll('select')].find(field=>field.value==='post');
        assert(format&&node('reportEditorial').textContent.includes('Público'),'Revisão de formato e público');
        format.value='stories';format.dispatchEvent(new Event('change'));
        node('reportEditorial').querySelector('nav button').click();
        const input=document.querySelector('#reportEditorial textarea');
        input.value='Houve 999 acidentes.';input.dispatchEvent(new Event('input'));
        node('reportEditorialAck').click();
        assert(node('reportEditorialSave').disabled,'Revisão aceitou número sem evidência');
        ReportAuthoring.restoreSection(smokeGeneration.document.sections[0].id);node('reportEditorialAck').click();
        await ReportAuthoring.save();
        assert(managementReport.authored?.reviewed&&!node('reportExport').disabled,'Revisão e exportação');
        for(const exportFormat of ['executive','complete']){
            const pdf=window.buildManagementPdf({...managementReport,exportFormat});
            assert(pdf.reportLayout.authored&&pdf.reportLayout.format===exportFormat&&pdf.output('arraybuffer').byteLength>1000,'PDF '+exportFormat);
            assert(pdf.reportLayout.blocks.some(block=>block.text?.includes('Como acompanhar')),'Acompanhamento no PDF');
            assert(pdf.reportLayout.blocks.some(block=>block.text?.includes('Formato · Stories')),'Formato revisado no PDF');
        }
        reportPdfLibraries=Promise.resolve();
        let downloaded=false;
        reportDownloadBlob=(blob,name)=>{downloaded=blob.size>1000&&name.endsWith('.pdf');};
        const scheduleFrame=window.requestAnimationFrame;
        window.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),0);
        try{await exportManagementReport();}finally{window.requestAnimationFrame=scheduleFrame;}
        assert(logoLoaded&&downloaded,'Exportação do PDF com a logo: '+node('reportStatus').textContent);
        if(PdfProgress.dialog.open)PdfProgress.dialog.close();
        switchTab('onepage');
        const edit=(root,label,value)=>{
            const input=[...node(root).querySelectorAll('label')].find(item=>item.querySelector('span')?.textContent===label)?.querySelector('input, select, textarea');
            assert(input,'Campo OnePage ausente: '+label);
            if(input.type==='checkbox')input.checked=value;
            else input.value=value;
            input.dispatchEvent(new Event(input.matches('select, [type=checkbox]')?'change':'input'));
        };
        const add=label=>[...node('opAdd').querySelectorAll('button')].find(item=>item.textContent==='+ '+label).click();
        const tick=()=>new Promise(resolve=>requestAnimationFrame(resolve));
        edit('opSettings','Título','Dados da operação');
        edit('opSettings','Orientação','landscape');
        add('Indicador');
        const indicators=()=>[...node('opInspector').querySelectorAll('select')].find(item=>item.options[0].textContent==='Selecione o indicador');
        edit('opInspector','Indicador',indicators().options[1].value);
        edit('opInspector','Comparar com a competência anterior',true);
        edit('opInspector','Balão de observação','Conferir na reunião.');
        add('Gráfico');
        edit('opInspector','Indicador',indicators().options[1].value);
        edit('opInspector','Tipo de gráfico','bar');
        edit('opInspector','Exibir meta cadastrada',true);
        add('Tabela');
        node('opInspector').querySelector('.op-indicator-list input').click();
        add('Balão');
        edit('opInspector','Título do bloco','Ponto de atenção');
        edit('opInspector','Conteúdo','Acompanhar o próximo ciclo.');
        edit('opInspector','Estilo do balão','attention');
        node('opBlocks').querySelector('li:last-child button:nth-child(2)').click();
        add('Texto');
        edit('opInspector','Conteúdo','Próximos passos.');
        await tick();
        const preview=node('opPreview');
        assert(preview.querySelectorAll('.op-card').length===5&&preview.textContent.includes('Conferir na reunião.'),'Balão em indicador ou blocos ausentes');
        assert(preview.querySelector('.op-paper').dataset.orientation==='landscape','Prévia horizontal');
        assert(preview.querySelectorAll('.op-card')[2].dataset.tone==='attention','Ordem ou estilo do balão');
        assert(preview.querySelector('.op-data-table tbody tr')&&preview.querySelector('.op-kpi-value').textContent===fmtVal(smokeReport.indicators[0].valores.at(-1)),'Tabela ou valor da competência');
        if(typeof Chart.version==='string')assert(preview.querySelector('.op-chart-image')?.src.startsWith('data:image/png'),'Gráfico OnePage não renderizado');
        const draftValues=currentData[0].valores;
        currentData[0].valores=draftValues.map(()=>9999);
        OnePage.refresh();
        await tick();
        assert(preview.querySelector('.op-kpi-value').textContent===fmtVal(smokeReport.indicators[0].valores.at(-1)),'A OnePage usou valores ainda não sincronizados');
        currentData[0].valores=draftValues;
        node('opPresent').click();
        assert(node('opPresentation').open&&node('opPresentationPage').querySelector('.op-paper').dataset.orientation==='landscape'&&
            node('opPresentationPage').textContent.includes('Dados da operação')&&!node('opPresentationPage').querySelector('button'),'Modo de apresentação horizontal');
        node('opClose').click();
        let printed=false;
        const print=window.print;
        window.print=()=>{
            const host=node('opPrintHost');
            printed=Boolean(host?.dataset.orientation==='landscape'&&host.querySelectorAll('.op-card').length===5&&host.textContent.includes('Dados da operação'));
            dispatchEvent(new Event('afterprint'));
        };
        await node('opPrint').onclick();
        window.print=print;
        assert(printed,'Composição para impressão');
        const originalId=node('opPages').value;
        node('opDuplicate').click();
        const copyId=node('opPages').value;
        assert(originalId!==copyId&&node('opPages').selectedOptions[0].text.includes('(cópia)'),'Duplicação de página');
        node('opDelete').click();
        const deleteDialog=node('opConfirmDelete');
        const closed=new Promise(resolve=>deleteDialog.addEventListener('close',resolve,{once:true}));
        deleteDialog.close('delete');
        await closed;
        assert(![...node('opPages').options].some(option=>option.value===copyId),'Exclusão da cópia');
        for(const key of Object.keys(localStorage).filter(key=>key.startsWith('dgranel.onepage.v1.reviewer.'))){
            const data=JSON.parse(localStorage.getItem(key));
            assert(!JSON.stringify(data).includes('"valores"'),'Armazenamento local copiou valores do snapshot');
        }
        OnePage.reset();
        OnePage.refresh();
        assert(node('opPages').value===originalId,'Página não restaurada do armazenamento local');
        const viewer=currentSession;
        currentSession={...viewer,user:{...viewer.user,id:'outro-usuario'}};
        OnePage.reset();
        OnePage.refresh();
        assert(![...node('opPages').options].some(option=>option.value===originalId),'OnePage apareceu para outra conta');
        currentSession=viewer;
        OnePage.reset();
        OnePage.refresh();
        assert(node('opSettings').querySelector('select').value==='landscape','Orientação horizontal não persistiu');
        node('opAiOpen').click();
        const aiDialog=node('opAiDialog'),aiForm=node('opAiForm'),aiChecks=node('opAiFields').querySelectorAll('.op-indicator-list input');
        assert(aiDialog.open&&aiChecks[0].checked&&!aiChecks[1].checked,'Seleção inicial do assistente');
        aiChecks[1].click();
        await aiForm.onsubmit(new Event('submit'));
        assert(aiDialog.open&&node('opAiStatus').textContent.includes('indisponível')&&node('opPages').value===originalId,
            'Falha da IA alterou a página manual');
        onepageFailure=false;
        await aiForm.onsubmit(new Event('submit'));
        await tick();
        assert(!aiDialog.open&&node('opPages').value!==originalId&&[...node('opPages').options].some(o=>o.value===originalId)&&
            preview.querySelectorAll('.op-card').length===4&&preview.textContent.includes('Revisar a evolução')&&
            preview.querySelector('.op-paper').dataset.orientation==='landscape','Composição da IA não criou página editável separada');
        edit('opInspector','Título do bloco','Resultado para a reunião');
        await tick();
        assert(preview.textContent.includes('Resultado para a reunião'),'Bloco gerado pela IA não editável');
        await tick();
        assert(document.documentElement.scrollWidth<=innerWidth+2,'Rolagem horizontal na OnePage');
        if(location.hash.startsWith('#onepage-print')||location.hash==='#onepage-preview'){
            if(location.hash.startsWith('#onepage-print')){
                if(location.hash==='#onepage-print'){
                    node('opPages').value=originalId;
                    node('opPages').dispatchEvent(new Event('change'));
                    edit('opSettings','Orientação','portrait');
                }
                window.print=()=>{};
                await node('opPrint').onclick();
                window.print=print;
            }
            status.textContent='PASS OnePage isolada para validação visual.';
            return;
        }
        node('workspaceSearchTrigger').click();
        query.value='autuacoes';query.dispatchEvent(new Event('input'));
        assert(search.querySelector('.workspace-search-result')?.textContent.includes('Autuações'),'Busca de indicador sem acentos');
        search.close();
        document.body.classList.add('developer-mode');
        for(const module of ['home','dashboard','datagrid','intelligence','reports','onepage','governance','audit']){
            switchTab(module);
            await new Promise(resolve=>setTimeout(resolve,20));
            assert(!node('view-'+module).classList.contains('hidden')&&node('tab-'+module).getAttribute('aria-current')==='page','Abertura de '+module);
            assert(document.documentElement.scrollWidth<=innerWidth+2,'Rolagem horizontal em '+module+' com '+innerWidth+' px');
        }
        document.body.classList.remove('developer-mode');
        assert(!hasUnsavedChanges&&!window.__errors.length,window.__errors.join('; ')||'IA alterou o dashboard');
        if(location.hash==='#visual'){
            applyTheme('light');
            switchTab('home');
            document.querySelectorAll('img[src="report-logo-dgranel.png"]').forEach(img=>{img.src='data:image/png;base64,'+smokeLogo;});
        }
        status.textContent='PASS oito módulos, relatórios e edição, apresentação, impressão e persistência da OnePage em '+innerWidth+' px.';
    }catch(error){status.textContent='FAIL '+error.message+' '+window.__errors.join('; ');}
});
`
].join('\n');

const optionalChart = await read('.validation-tools/chart.js').catch(() => '');
const optionalTailwind = await read('.validation-tools/tailwind.js').catch(() => '');
const fleet = Object.fromEntries(await Promise.all([
    ['maxresdefault.jpg', 'image/jpeg'],
    ['comboio-dia.webp', 'image/webp'],
].map(async ([file, mime]) => {
    const bytes = await Deno.readFile('public/' + file);
    return [file, 'data:' + mime + ';base64,' + btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))];
})));
const scripts = [setup, optionalTailwind, optionalChart, 'const smokeFleet='+JSON.stringify(fleet)+';',
    ...await Promise.all(localScripts.map(file => read('public/' + file))),
    await read('public/vendor/jspdf-4.2.1.umd.min.js'),
    await read('public/vendor/jspdf-autotable-5.0.8.min.js'),
    await read('public/report-pdf.js'), checks];
const styles = await Promise.all(['style.css','workspace-v3.css','motion-v3-1.css','pending-changes.css','workspace-v3-2.css','report-authoring.css','workspace-ui.css','dashboard-layout.css','onepage.css'].map(file => read('public/' + file)));
html = html.replace('<head>', () => "<head><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:\"><style>" + styles.join('\n') + '</style>');
html = html.replace('</body>', () => scripts.map(script => '<script>'+script.replace(/<\/script/gi,'<\\/script')+'</script>').join('\n')+'</body>');
await Deno.mkdir('.validation-tools', { recursive: true });
await Deno.writeTextFile('.validation-tools/reports-browser.html', html);
