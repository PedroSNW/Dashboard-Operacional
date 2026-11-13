import {analyzeIndicator} from './analytics.js';
export function buildReport(stored, selection, updatedAt = null) {
    if(!stored||!Array.isArray(stored.indicadores)||!Array.isArray(stored.mesesLabels))throw Error('REPORT: Estado remoto indisponível.');
    const labels=stored.mesesLabels;
    if(labels.some(l=>typeof l!=='string')||new Set(labels).size!==labels.length)throw Error('REPORT: Rótulos de competências inválidos ou duplicados.');
    const {type,sector,ids,start,end}=selection??{};
    if(!['executivo','mensal','trimestral','anual','comparativo','critico'].includes(type)||!Array.isArray(ids)||!ids.length||ids.length>500||new Set(ids).size!==ids.length)throw Error('REPORT: Selecione o tipo e os indicadores.');
    const a=labels.indexOf(start),b=labels.indexOf(end);
    if(a<0||b<a)throw Error('REPORT: Intervalo de competências inválido.');
    const competencies=labels.slice(a,b+1);
    if(type==='mensal'&&competencies.length!==1)throw Error('REPORT: Mensal exige uma competência.');
    if(type==='trimestral'&&competencies.length!==3)throw Error('REPORT: Trimestral exige três competências consecutivas.');
    if(type==='anual'&&competencies.length!==12)throw Error('REPORT: Anual exige doze competências consecutivas.');
    const items=stored.indicadores.map((i,n)=>({...i,id:i.id??`indice:${n}`})).filter(i=>ids.includes(i.id));
    if(items.length!==ids.length||items.some(i=>sector&&sector!=='TODOS'&&i.setor!==sector))throw Error('REPORT: Seleção indisponível no snapshot autorizado. Atualize os filtros.');
    if(selection.expectedIndicators && (!Array.isArray(selection.expectedIndicators)||selection.expectedIndicators.length!==items.length||items.some(i=>!selection.expectedIndicators.some(e=>e.id===i.id&&e.indicador===i.indicador&&e.setor===(i.setor??null)))))throw Error('REPORT: Os indicadores mudaram desde a seleção. Recarregue o Dashboard antes de gerar.');
    const context={versao:1,origem:'supabase',competencias:[...labels],totalIndicadoresNoDashboard:stored.indicadores.length,totalIndicadoresSelecionados:items.length,totalIndicadoresEnviados:items.length,contextoParcial:false,indicadores:items.map(i=>({id:i.id,indicador:i.indicador,setor:i.setor??null,unidade:i.und??null,meta:i.meta??null,direcaoDesempenho:i.direcaoDesempenho??null,ultimaAtualizacao:i.ultimaAtualizacao??null,valores:i.valores}))};
    const indicators=context.indicadores.map(i=>{
        if(!Array.isArray(i.valores)||i.valores.length>labels.length||i.valores.some(v=>v!==null&&(typeof v!=='number'||!Number.isFinite(v)))||(i.meta!==null&&(typeof i.meta!=='number'||!Number.isFinite(i.meta))))throw Error('REPORT: Indicador com valores ou alinhamento de competências inválidos.');
        const item={...i,valores:competencies.map((_,n)=>i.valores[a+n]??null)};
        const stats=analyzeIndicator(item,competencies);
        if(!stats.tendencia.comparavel)throw Error('REPORT: Competências ambíguas; revise os rótulos antes de gerar.');
        const dated=competencies.map(c=>String(c).match(/(\d{2,4})$/)?.[1]??null);
        const month=c=>{const m=String(c).match(/^(\d{1,2})\//);return m?Number(m[1])-1:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'].indexOf(String(c).slice(0,3).toLowerCase());};
        const key=(c,n)=>(dated[n]?Number(dated[n])%100:0)*12+month(c);
        if(competencies.some((c,n)=>n>0&&key(c,n)-key(competencies[n-1],n-1)!==1))throw Error('REPORT: O período precisa de competências consecutivas e ordenadas.');
        const last=stats.mensais.filter(p=>p.valor!==null).at(-1);
        const off=last&&stats.meta!==null&&(stats.direcao==='menor_melhor'?last.valor>stats.meta:stats.direcao==='maior_melhor'?last.valor<stats.meta:false);
        const d=stats.primeiroUltimo?.absoluta;
        const worse=d!==null&&d!==undefined&&(stats.direcao==='menor_melhor'?d>0:stats.direcao==='maior_melhor'?d<0:false);
        return {...item,estatisticas:stats,critical:Boolean(off||worse),criticalReason:off?'Último valor válido fora da meta':worse?'Piora descritiva entre primeiro e último valor válido':null};
    });
    return {type,sector,competencias:competencies,generatedAt:new Date().toISOString(),snapshotUpdatedAt:updatedAt,selectedCount:items.length,indicators:type==='critico'?indicators.filter(i=>i.critical):indicators,criticalCount:indicators.filter(i=>i.critical).length,
        limitations:['Dados agregados; competências permanentemente revisáveis.','Valores ausentes não são zero. Taxas não são somadas; médias de taxas não são ponderadas sem denominadores vinculados.','Tendência é descritiva, não causa comprovada. Direção neutra/indefinida não recebe julgamento.'],aiUsed:false,context};
}
