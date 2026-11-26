import {normalizeManagementContext,buildReportIntelligence,operationalAssessment} from './report-intelligence.js';
export {buildReportIntelligence} from './report-intelligence.js';
import {analyzeIndicator} from './analytics.js';
import {buildReportManagement} from './report-management.js';
export {buildReportManagement} from './report-management.js';

const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function reportCompetency(label) {
    const numeric = label.match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
    const named = label.match(/^(\p{L}+)(?:[ /](\d{2}|\d{4}))?$/u);
    const month = numeric ? Number(numeric[1]) - 1 : monthNames.findIndex(m => m.toLowerCase() === normalize(named?.[1]).slice(0,3));
    // O calendário original do Dashboard usa meses sem sufixo para 2026.
    const year = numeric?.[2] ?? named?.[2] ?? '2026';
    if (month < 0 || month > 11) throw Error('REPORT: Competência inválida.');
    return { label: monthNames[month] + '/' + (year.length === 2 ? '20' + year : year), key: Number(year.length === 2 ? '20' + year : year) * 12 + month };
}

function roadSafetyRole(indicator) {
    if (!/sinistro/.test(normalize(indicator.setor))) return null;
    const name = normalize(indicator.indicador).trim().replace(/\s*-\s*mensal$/, '');
    if (name === 'total de acidentes') return 'volume';
    if (/^acidentes? (?:com culpa )?por\s+\(?milhao\)?\s+de km rodad[oa]s?$/.test(name)) return name.includes('com culpa') ? 'faultRate' : 'rate';
    if (/^(?:km['’]?s?|quilometros) rodados$/.test(name)) return 'distance';
    if (name === 'tombamento proprio') return 'severity';
    if (name === 'acidentes com culpa') return 'fault';
    return null;
}

function roadSafetySummary(indicators) {
    const total = indicators.filter(i => i.roadSafetyRole === 'volume');
    if (total.length !== 1) return null;
    const unique = role => {
        const matches = indicators.filter(i => i.roadSafetyRole === role && i.setor === total[0].setor);
        return matches.length === 1 ? matches[0] : null;
    };
    const rate = unique('rate'), distance = unique('distance'), severity = unique('severity');
    const common = total[0].estatisticas.mensais.flatMap((p, n) => {
        const km = distance?.estatisticas.mensais[n]?.valor;
        return p.valor !== null && p.valor >= 0 && km > 0 ? [{ ...p, km }] : [];
    });
    const km = common.reduce((sum, p) => sum + p.km, 0);
    const accidents = common.reduce((sum, p) => sum + p.valor, 0);
    const accumulatedRate = km ? accidents / km * 1e6 : null;
    return { volumeId: total[0].id, rateId: rate?.id ?? null, distanceId: distance?.id ?? null, severityId: severity?.id ?? null,
        accumulated: accumulatedRate !== null && Number.isFinite(accumulatedRate) && Number.isFinite(km) && Number.isFinite(accidents)
            ? { rate: accumulatedRate, km, accidents, competencies: common.map(p => p.competencia) } : null };
}

/** @param {any} stored @param {any} selection @param {any} updatedAt @param {any} managementContext */
export function buildReport(stored, selection, updatedAt = null, managementContext = null) {
    const reportContext=normalizeManagementContext(managementContext);
    if(!stored||!Array.isArray(stored.indicadores)||!Array.isArray(stored.mesesLabels))throw Error('REPORT: Estado remoto indisponível.');
    const labels=stored.mesesLabels;
    if(labels.some(l=>typeof l!=='string')||new Set(labels).size!==labels.length)throw Error('REPORT: Rótulos de competências inválidos ou duplicados.');
    const {type,sector,ids,start,end}=selection??{};
    if(!['executivo','mensal','trimestral','anual','comparativo','critico'].includes(type)||!Array.isArray(ids)||!ids.length||ids.length>500||new Set(ids).size!==ids.length)throw Error('REPORT: Selecione o tipo e os indicadores.');
    const a=labels.indexOf(start),b=labels.indexOf(end);
    if(a<0||b<a)throw Error('REPORT: Intervalo de competências inválido.');
    const calendar=labels.slice(a,b+1).map(reportCompetency);
    if(calendar.some((c,n)=>n>0&&c.key-calendar[n-1].key!==1))throw Error('REPORT: O período precisa de competências consecutivas e ordenadas.');
    const competencies=calendar.map(c=>c.label);
    if(type==='mensal'&&competencies.length!==1)throw Error('REPORT: Mensal exige uma competência.');
    if(type==='trimestral'&&competencies.length!==3)throw Error('REPORT: Trimestral exige três competências consecutivas.');
    if(type==='anual'&&competencies.length!==12)throw Error('REPORT: Anual exige doze competências consecutivas.');
    const items=stored.indicadores.map((i,n)=>({...i,id:i.id??`indice:${n}`})).filter(i=>ids.includes(i.id));
    if(items.length!==ids.length||items.some(i=>sector&&sector!=='TODOS'&&i.setor!==sector))throw Error('REPORT: Seleção indisponível no snapshot autorizado. Atualize os filtros.');
    if(selection.expectedIndicators && (!Array.isArray(selection.expectedIndicators)||selection.expectedIndicators.length!==items.length||items.some(i=>!selection.expectedIndicators.some(e=>e.id===i.id&&e.indicador===i.indicador&&e.setor===(i.setor??null)))))throw Error('REPORT: Os indicadores mudaram desde a seleção. Recarregue o Dashboard antes de gerar.');
    const source=items.map(i=>{
        const role=roadSafetyRole(i);
        const unit=role==='rate'?'acidentes por milhão de km':role==='faultRate'?'acidentes com culpa por milhão de km':role==='distance'?'km':i.und??null;
        const targetStatus=i.meta==null?'missing':i.meta===0?(i.metaZeroConfirmada===true?'zero_confirmed':'zero_unconfirmed'):'registered';
        return {id:i.id,indicador:i.indicador,setor:i.setor??null,unidade:unit,unidadeCadastro:i.und??null,meta:i.meta??null,targetStatus,roadSafetyRole:role,direcaoDesempenho:i.direcaoDesempenho??null,ultimaAtualizacao:i.ultimaAtualizacao??null,valores:i.valores};
    });
    const indicators=source.map(i=>{
        if(!Array.isArray(i.valores)||i.valores.length>labels.length||i.valores.some(v=>v!==null&&(typeof v!=='number'||!Number.isFinite(v)))||(i.meta!==null&&(typeof i.meta!=='number'||!Number.isFinite(i.meta))))throw Error('REPORT: Indicador com valores ou alinhamento de competências inválidos.');
        const item={...i,valores:competencies.map((_,n)=>i.valores[a+n]??null)};
        const stats=analyzeIndicator({...item,meta:item.targetStatus==='zero_unconfirmed'?null:item.meta},competencies);
        if(!stats.tendencia.comparavel)throw Error('REPORT: Competências ambíguas; revise os rótulos antes de gerar.');
        const last=stats.mensais.at(-1);
        const off=last&&last.valor!==null&&stats.meta!==null&&(stats.direcao==='menor_melhor'?last.valor>stats.meta:stats.direcao==='maior_melhor'?last.valor<stats.meta:false);
        const d=stats.primeiroUltimo?.absoluta;
        const worse=d!==null&&d!==undefined&&(stats.direcao==='menor_melhor'?d>0:stats.direcao==='maior_melhor'?d<0:false);
        return {...item,estatisticas:stats,critical:Boolean(off||worse),criticalReason:off?'Resultado da competência final fora da meta':worse?'Piora descritiva entre primeiro e último valor válido':null};
    });
    const report={type,sector,competencias:competencies,generatedAt:new Date().toISOString(),snapshotUpdatedAt:updatedAt,selectedCount:items.length,indicators:type==='critico'?indicators.filter(i=>i.critical||operationalAssessment(i).level==='Alta'):indicators,criticalCount:indicators.filter(i=>i.critical).length,
        limitations:['Dados agregados; competências permanentemente revisáveis.','Valores ausentes não são zero. Taxas não são somadas; médias de taxas não são ponderadas sem denominadores vinculados.','Tendência é descritiva, não causa comprovada. Direção neutra/indefinida não recebe julgamento.'],aiUsed:false};
    const result={...report,managementContext:reportContext,management:buildReportManagement(report)};
    return {...result,roadSafety:roadSafetySummary(result.indicators),intelligence:buildReportIntelligence(result)};
}
