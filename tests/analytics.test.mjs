import { analyzeIndicator, analyticalResponse } from '../supabase/functions/seguranca-viaria-ia/analytics.js';
import { readFileSync } from 'node:fs';

export function runEnrichmentTest(back, analyze = analyzeIndicator, render = analyticalResponse) {
    const source = back.slice(back.indexOf('    const analyticalContext ='), back.indexOf('    const SYSTEM_INSTRUCTION_TEXT =')).replace('(text: string): string', '(text)');
    const context = {competencias:['Jan','Fev'],indicadores:[{indicador:'Teste',unidade:'Qtd',valores:[2,4],meta:3}],totalIndicadoresNoDashboard:1,contextoParcial:false};
    const output = new Function('contextText','analyzeIndicator','analyticalResponse', source + '\nreturn {context:JSON.parse(contextText), response:composeResponse("Verificar hipóteses.")};')(JSON.stringify(context),analyze,render);
    if (output.context.indicadores[0].estatisticas.soma !== 6 || !output.response.includes('Soma: 6')) throw Error('Integração analítica Edge falhou');
    return 'Enriquecimento e composição reais da Edge passaram.';
}

export function runAnalyticsTests(analyze = analyzeIndicator, render = analyticalResponse) {
    const assert = (v, msg) => { if (!v) throw new Error(msg); };
    const near = (a,b) => Math.abs(a-b)<1e-9;
    const labels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set'];
    const item = (valores, extra={}) => ({indicador:'Acidentes', unidade:'Qtd', meta:30, direcaoDesempenho:'menor_melhor', valores,...extra});
    const a = analyze(item([11,12,8,17,21,13,16,17,10]),labels);
    assert(a.soma===125 && near(a.media,125/9) && a.maximo===21 && a.minimo===8 && near(a.mensais[4].desvioMediaPercentual,51.2),'A: culpa');
    const b = analyze(item([26,33,38,49,32,38,43,46,40]),labels);
    assert(b.soma===345 && near(b.media,345/9) && b.maximo===49 && b.acimaMeta===8,'B: total e meta');
    const c = analyze(item([10,null,0,20]),labels.slice(0,4));
    assert(c.soma===30 && c.media===10 && c.validos===3 && c.ausentes===1 && c.mensais[2].valor===0 && c.mensais[2].variacaoAnterior===null,'C: ausências');
    const d = analyze(item([0,2],{meta:0}),labels.slice(0,2));
    assert(d.meta===0 && d.acimaMeta===1 && d.mensais[1].desvioMeta.percentual===null && d.primeiroUltimo.percentual===null,'D: meta e base zero');
    for (const direcaoDesempenho of ['neutro',null]) {
        assert(analyze(item([1,2,3],{direcaoDesempenho}),labels.slice(0,3)).tendencia.maiorSequenciaPiora===0,'E: direção');
    }
    const context = {indicadores:[{...item([10,null,0,20]),estatisticas:c}], totalIndicadoresNoDashboard:75, contextoParcial:true};
    assert(render(context,'Investigar hipóteses sem presumir causas.').includes('omitidos por tamanho'),'F: parcial');
    assert(render(context,'Média 999').includes('texto do modelo foi omitido'),'Validação de números livres');
    const changed = analyze(item([15,...[12,8,17,21,13,16,17,10]]),labels);
    assert(changed.soma===129,'H: atualização retroativa permitida');
    const rate = analyze(item([1,2],{indicador:'Acidente por milhão de km',unidade:'Qtd'}),labels.slice(0,2));
    assert(rate.soma===null && rate.tipoMedia.includes('não taxa agregada'),'I: denominador');
    const percent = analyze(item([10,20],{unidade:'%'}),labels.slice(0,2));
    assert(percent.soma===null && percent.mensais[1].variacaoAnterior.pontosPercentuais===10 && percent.mensais[1].variacaoAnterior.percentual===100,'Pontos percentuais');
    const sorted = analyze(item([3,1,2]),['Mar/2026','Jan/2026','Fev/2026']);
    assert(sorted.mensais[0].valor===1 && sorted.primeiroUltimo.absoluta===2,'Ordem cronológica');
    assert(!analyze(item([1,3]),['Jan','Set/2026']).tendencia.comparavel,'Competências incompatíveis');
    assert(analyze(item([]),labels.slice(0,2)).ausentes===2,'Posições inexistentes');
    assert(analyze(item([9,9],{meta:null}),labels.slice(0,2)).meta===null,'Meta ausente');
    assert(analyze(item([1,2],{meta:40}),labels.slice(0,2)).meta===40,'K: meta do snapshot');
    const huge = analyze(item([Number.MAX_VALUE, Number.MAX_VALUE]),labels.slice(0,2));
    assert(huge.soma === null && Number.isFinite(huge.media), 'Overflow da soma');
    const delta = analyze(item([-Number.MAX_VALUE,Number.MAX_VALUE]),labels.slice(0,2));
    assert(delta.primeiroUltimo.absoluta === null && delta.primeiroUltimo.percentual === null && delta.tendencia.maiorSequenciaPiora === 0, 'Overflow da variação');
    return 'Cenários analíticos A–F, H–I, K e casos de precisão/ordenação/overflow passaram.';
}
if (typeof process !== 'undefined') {
    console.log(runAnalyticsTests());
    console.log(runEnrichmentTest(readFileSync('supabase/functions/seguranca-viaria-ia/index.ts','utf8')));
}
