import {measurementAssessment,MEASUREMENT_POLICY} from './report-semantics.js';
// V6: critérios de apresentação sobre estatísticas já calculadas. Sem acesso a banco ou rede.
export const CONTEXT_LIMITS=Object.freeze({field:320,total:1200,bytes:2400});
// Somente configuração revisada em código; jamais aceitar classificação do payload do cliente.
// Entrada: {indicatorId,name,sector,category,level,approved:true,reference}. Vazia até validação da empresa.
export const OPERATIONAL_POLICY=Object.freeze({version:1,criteria:Object.freeze([])});
const FIELDS=['actionsTaken','difficulties','achievements','priorities','goals','observations'];
const GOALS=['suggested','management','approved'],STATES=['pending_validation','reported_in_progress','reported_completed'];
export function normalizeManagementContext(raw){
    if(raw===null||raw===undefined)return null;
    if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['version',...FIELDS,'goalKind','approvalConfirmed','actionStatus','shareWithAI'].includes(k)))throw Error('REPORT: Contexto gerencial incompatível.');
    if(raw.version!==1||!GOALS.includes(raw.goalKind)||!STATES.includes(raw.actionStatus)||typeof raw.shareWithAI!=='boolean'||typeof raw.approvalConfirmed!=='boolean')throw Error('REPORT: Tipo, situação ou consentimento do contexto inválidos.');
    const result={version:1};let total=0;
    for(const k of FIELDS){if(typeof raw[k]!=='string'||raw[k].length>CONTEXT_LIMITS.field)throw Error('REPORT: Cada campo do contexto admite até 320 caracteres.');result[k]=raw[k].replace(/\r\n?/g,'\n').trim();total+=result[k].length;}
    if(total>CONTEXT_LIMITS.total||new TextEncoder().encode(JSON.stringify(result)).length>CONTEXT_LIMITS.bytes)throw Error('REPORT: O contexto excede 1200 caracteres ou o limite de bytes.');
    if(!total)return null;
    // Defesa auxiliar. A segurança depende também do isolamento em JSON e do contrato fechado da resposta.
    if(FIELDS.some(k=>/^(?:ignore|ignorar|desconsidere|substitua|revele|execute)\b.{0,80}(?:instru|regra|sistema|prompt|comando|segredo)|<\/?(?:system|script)>|system\s*prompt/im.test(result[k])))throw Error('REPORT: Remova instruções para a IA ou comandos dos campos de contexto.');
    if(result.goals&&raw.goalKind==='approved'&&!raw.approvalConfirmed)throw Error('REPORT: Confirme explicitamente a aprovação informada do objetivo ou selecione outro tipo.');
    return {...result,goalKind:raw.goalKind,approvalConfirmed:raw.goalKind==='approved'&&raw.approvalConfirmed,actionStatus:raw.actionStatus,shareWithAI:raw.shareWithAI};
}
export function operationalAssessment(i,policy=OPERATIONAL_POLICY){
    const categories=['Segurança humana','Sinistros e consequências graves','Conformidade legal','Risco financeiro','Risco operacional','Eficiência administrativa'];
    const c=policy.criteria.find(c=>c.indicatorId===i.id&&c.name===i.indicador&&c.sector===i.setor&&c.approved===true&&categories.includes(c.category)&&['Alta','Média','Baixa'].includes(c.level)&&typeof c.reference==='string'&&c.reference.trim());
    return c?{validated:true,category:c.category,level:c.level,reference:c.reference}:{validated:false,category:null,level:null,reference:null};
}
const fmt=v=>v===null||v===undefined?'indisponível':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v);
const distinct=a=>[...new Set(a.filter(Boolean))];
export function assessIndicator(i,policy=OPERATIONAL_POLICY){
    const s=i.estatisticas,valid=s.mensais.filter(p=>p.valor!==null),first=valid[0]??null,last=valid.at(-1)??null,recent=s.mensais.at(-1)??null;
    const measurement=measurementAssessment(i),directed=!measurement.neutral&&['menor_melhor','maior_melhor'].includes(s.direcao),delta=s.primeiroUltimo?.absoluta;
    const performance=!recent||recent.valor===null?'Sem dados recentes':measurement.neutral?'Avaliação financeira pendente':!directed?'Sem julgamento pela direção':s.meta===null?'Sem meta validada':(s.direcao==='menor_melhor'?recent.valor<=s.meta:recent.valor>=s.meta)?'Dentro da meta de referência':'Fora da meta de referência';
    const endpoint=measurement.neutral?'Variação financeira sem classificação':!directed?'Sem julgamento pela direção':delta===null||delta===undefined||valid.length<2?'Histórico insuficiente':delta===0?'Estabilidade entre extremos':(s.direcao==='menor_melhor'?delta<0:delta>0)?'Melhora':'Piora';
    const changes=s.mensais.filter(p=>p.variacaoAnterior?.absoluta!==null&&p.variacaoAnterior?.absoluta!==undefined).map(p=>p.variacaoAnterior.absoluta);
    const oscillating=directed&&changes.some(v=>v>0)&&changes.some(v=>v<0),trend=oscillating?`Oscilação; ${endpoint.toLowerCase()} no saldo entre extremos`:endpoint;
    const off=performance==='Fora da meta de referência',worse=endpoint==='Piora',improved=endpoint==='Melhora',operational=operationalAssessment(i,policy);
    const priority=operational.validated&&operational.level==='Alta'?0:off&&worse?1:worse?2:off?3:!recent||recent.valor===null||!directed||s.meta===null?4:5;
    const priorityLabel=['Critério operacional validado','Meta e evolução desfavoráveis','Revisar deterioração','Reduzir lacuna da meta','Validar dados e critérios','Acompanhamento'][priority];
    const evidence=last?`${valid.length>1?`${first.competencia}: ${fmt(first.valor)}; `:''}${last.competencia}: ${fmt(last.valor)} ${i.unidade??'(unidade não informada)'}. ${valid.length>1&&s.primeiroUltimo?`Variação absoluta ${fmt(delta)} ${s.primeiroUltimo.pontosPercentuais!==null?'p.p.':i.unidade??''}; relativa ${fmt(s.primeiroUltimo.percentual)}${s.primeiroUltimo.percentual===null?'':'%'}.`:''} Meta atual de referência: ${fmt(s.meta)}.`:'Não há valores válidos no intervalo.';
    const meaning=!recent||recent.valor===null?'Validar a cobertura antes de avaliar o resultado recente.':!directed?'Pactuar a direção antes de atribuir melhora ou piora.':off&&improved?'Há avanço entre os extremos, mas a referência de meta ainda não foi alcançada. Sustentar as tratativas e avaliar as barreiras restantes.':!off&&worse&&s.meta!==null?'A referência de meta é atendida, porém houve deterioração entre os extremos. Avaliar o processo antes de concluir sobre sua continuidade; não há previsão de ultrapassagem.':off?'A distância da referência exige avaliar pendências e procedimentos com a área responsável, sem atribuir causa pelos agregados.':s.meta===null?'A evolução pode ser descrita; pactuar uma referência antes de julgar cumprimento de meta.':improved?'O avanço descritivo pode orientar o acompanhamento da continuidade, sem atribuir êxito a uma ação específica.':'Manter a verificação de cobertura e das condições de comparação.';
    const caveats=distinct([valid.length===2?'Comparação descritiva entre dois pontos; não caracteriza tendência robusta.':null,oscillating?'A trajetória oscila; o saldo não representa evolução uniforme.':null,s.ausentes?'Lacunas interrompem sequências comparáveis.':null,recent?.valor===null&&last?`Último dado disponível é de ${last.competencia}, não da competência final.`:null]);
    return {indicatorId:i.id,name:i.indicador,performance,endpoint,trend,improved,worse,off,priority,priorityLabel,operational,evidence,meaning:measurement.neutral?measurement.note:meaning,caveats:distinct([...caveats,measurement.note]),first,last,recent,measurement};
}
export function chartSelection(r){
    const kept=[],excluded=[];
    for(const i of r.indicators){const values=i.valores.filter(v=>v!==null),reason=values.length<2?'Histórico insuficiente para gráfico de evolução':new Set(values).size===1?'Série constante; consultar tabela integral':null;
        (reason?excluded:kept).push(reason?{id:i.id,reason}:i.id);}
    return {kept,excluded};
}
export function buildReportIntelligence(r,management=r.management,context=r.managementContext??null,policy=OPERATIONAL_POLICY){
    const dimensions=r.indicators.map(i=>assessIndicator(i,policy)),cap={executivo:3,mensal:3,trimestral:4,anual:5,comparativo:4,critico:5}[r.type]??3;
    const ranked=[...dimensions].sort((a,b)=>a.priority-b.priority),priority=ranked.slice(0,cap),achievements=ranked.filter(d=>d.improved),challenges=ranked.filter(d=>d.off||d.worse||d.performance==='Sem dados recentes');
    const focus={executivo:'Decisões e prioridades do ciclo de gestão',mensal:'Resultado recente e tratativas imediatas; comparação limitada à seleção',trimestral:'Evolução, recorrência e revisão do próximo ciclo trimestral',anual:'Mudanças no intervalo anual e prioridades do próximo planejamento',comparativo:'Diferenças descritivas entre competências comparáveis',critico:'Pontos de atenção e criticidade operacional apenas quando validada'}[r.type];
    const actions=(management?.actionPlan??[]).map((a,index)=>{const related=dimensions.filter(d=>a.relatedIndicators.some(i=>i.id===d.indicatorId)).sort((x,y)=>x.priority-y.priority);return {ref:`A${index+1}`,title:a.title,indicatorIds:a.relatedIndicators.map(i=>i.id),problem:a.problem,evidence:a.evidence.map(e=>e.text),objective:a.objective,tasks:a.actions,owner:a.suggestedOwner,timeline:a.suggestedTimeline,monitoring:a.monitoringIndicator,criterion:a.evaluationCriterion,status:'Sugerida',priority:related[0]?.priorityLabel??'Validar proposta'};});
    const goals=context?.goals?{text:context.goals,kind:context.goalKind,label:{suggested:'Objetivo sugerido',management:'Objetivo informado pela gestão',approved:'Objetivo informado como aprovado; confirmação da gestão, sem verificação independente'}[context.goalKind]}:null;
    const reportedActions=context?.actionsTaken?context.actionsTaken.split(/\n/).filter(s=>s.trim()).map(text=>({text,status:{pending_validation:'Pendente de validação',reported_in_progress:'Informada como em execução',reported_completed:'Informada como concluída'}[context.actionStatus],source:'Relato da gestão; sem confirmação independente'})):[];
    const evolutionPlan=[30,60,90].map((days,index)=>({days,items:actions.map(a=>({ref:a.ref,title:a.title,task:index<2?(a.tasks[index]??a.tasks[0]):`Reavaliar ${a.title.toLowerCase()} pelos resultados disponíveis e revisar o próximo ciclo.`,monitoring:a.monitoring,criterion:a.criterion,status:'Sugerida',goal:goals?.label??'Objetivo sugerido; pactuação necessária'}))}));
    const summary=[{title:'Panorama geral',lines:[`${r.indicators.length} indicadores no recorte; ${achievements.length} com melhora descritiva entre extremos e ${dimensions.filter(d=>d.worse).length} com piora. Não há índice geral que agregue unidades diferentes.`,focus]},
        {title:'Conquistas e avanços',lines:achievements.length?achievements.slice(0,2).map(d=>`${d.name}: ${d.endpoint.toLowerCase()}; ${d.off?'meta de referência ainda não alcançada':d.performance.toLowerCase()}.`):['Não foi identificado avanço descritivo comprovável no intervalo selecionado.']},
        {title:'Desafios e pontos de atenção',lines:challenges.length?challenges.slice(0,2).map(d=>`${d.name}: ${d.performance.toLowerCase()}; ${d.endpoint.toLowerCase()}.`):['Sem desafios sinalizados por esses critérios; verificar cobertura e critérios disponíveis.']},
        {title:'Prioridades gerenciais',lines:priority.length?priority.slice(0,2).map(d=>`${d.name}: ${d.priorityLabel.toLowerCase()}.`):['Nenhum indicador corresponde ao recorte.']},
        {title:'Encaminhamentos',lines:actions.length?[`Avaliar ${actions.slice(0,2).map(a=>a.title).join('; ')}. Pactuar área responsável, objetivo e critério de acompanhamento.`]:['Validar o recorte e as informações necessárias antes de propor iniciativas.']}];
    return {version:6,policyVersion:policy.version,measurementPolicyVersion:MEASUREMENT_POLICY.version,focus,dimensions,priorityIds:priority.map(d=>d.indicatorId),achievements:achievements.map(d=>d.indicatorId),challenges:challenges.map(d=>d.indicatorId),summary,
        selection:`Prioridade por criticidade operacional validada, combinação meta/evolução, deterioração, lacuna da meta e qualidade dos dados; empates mantêm a ordem do recorte. A ordem matemática não representa gravidade humana, legal ou financeira. Corpo limitado a ${cap} prioridades; dados integrais nos apêndices.`,
        context,reportedActions,goals,actions,evolutionPlan:actions.length?evolutionPlan:[],charts:chartSelection(r),
        limitations:['Dados ausentes não são zero; competências são revisáveis.','Evolução descritiva não comprova causa nem resultado de intervenções. Recomendações são sugestões, não aprovação ou promessa de efeito.','Histórico verificado de metas indisponível. Comparações históricas usam a meta cadastrada atual somente como referência, sem afirmar sua vigência no passado.',dimensions.some(d=>!d.operational.validated)?'Criticidade operacional sem critérios validados para parte ou todo o recorte; classificação pendente de validação da empresa.':null,context?'Informações da gestão são relatos não verificados e podem divergir dos indicadores; conciliar fontes antes de decidir. Não alteram cálculos nem metas oficiais.':null].filter(Boolean)};
}
