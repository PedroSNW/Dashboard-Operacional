import {measurementAssessment} from './report-semantics.js';

// Catálogo de propostas: nomes de indicadores só selecionam temas, nunca criticidade.
const CATALOG={
    investigacao:{title:'Investigação do Escopo e dos Critérios',family:'geral',objective:'Identificar as informações necessárias para uma tratativa específica, sem inventar o processo medido.',actions:['Validar com a área responsável o processo, universo, unidade e direção do indicador.','Solicitar os componentes e registros autorizados necessários para entender a variação e as pendências.','Definir uma tratativa específica somente após conferir essas informações.'],owner:'Gestão de Indicadores e Área Responsável',message:null},
    tratativas:{title:'Fluxo de Tratamento de Autuações',family:'tratativas',objective:'Avaliar o avanço das tratativas e as pendências que ainda limitam o atendimento da referência.',actions:['Conferir o fluxo e as pendências agregadas de tratamento com a equipe responsável.','Revisar etapas, prazos internos e condições de identificação em fontes autorizadas.','Comparar as competências seguintes com a referência e registrar os obstáculos informados.'],owner:'Equipe de Tratativas e Operações',message:'Siga os procedimentos internos de comunicação e tratamento de autuações.'},
    identificacao:{title:'Revisão do Fluxo de Identificação',family:'identificacao',objective:'Avaliar lacunas do processo de identificação sem expor pessoas ou presumir infrações individuais.',actions:['Verificar a cobertura e as pendências agregadas de identificação com as áreas autorizadas.','Revisar o recebimento e a conferência das informações necessárias ao processo.','Acompanhar a evolução das pendências, respeitando os acessos autorizados.'],owner:'Operações e Equipe de Tratativas',message:null},
    financeiro:{title:'Rastreabilidade dos Valores Agregados',family:'financeiro',objective:'Conferir o escopo dos valores e avaliar a necessidade de detalhamento autorizado, sem presumir cobranças ou processos existentes.',actions:['Validar a classificação e o significado dos valores agregados com a área responsável.','Solicitar rastreabilidade autorizada e avaliar pendências; consultar as áreas financeira e jurídica somente quando houver base e necessidade.','Reavaliar as próximas competências sem somar saldos ou atribuir recuperação a iniciativas não comprovadas.'],owner:'Área Financeira e Gestão Responsável',message:null},
    score:{title:'Análise dos Componentes do SCORE',family:'score',objective:'Avaliar a evolução do SCORE conforme a direção cadastrada e verificar os componentes disponíveis.',actions:['Validar o escopo e a comparabilidade do SCORE acompanhado.','Solicitar aos responsáveis os componentes necessários para orientar tratativas específicas.','Reavaliar as próximas competências sem atribuir causas à variação agregada.'],owner:'Gestão de Indicadores e Operações',message:null},
    velocidade:{title:'Campanha de Velocidade Segura',family:'velocidade',objective:'Reforçar a condução compatível com limites e condições da via.',actions:['Revisar orientações de velocidade e distância de segurança em DDS.','Avaliar procedimentos e registros autorizados com a operação, sem atribuir causas pelos agregados.','Preparar material educativo e acompanhar as próximas competências.'],owner:'Segurança Viária e Operações',message:'Velocidade segura começa com atenção às condições da via e distância de segurança.'},
    defensiva:{title:'Condução Defensiva e Antecipação de Riscos',family:'sinistros',objective:'Avaliar oportunidades de prevenção e reforçar práticas de condução defensiva.',actions:['Revisar procedimentos preventivos com a equipe de Segurança Viária.','Planejar DDS sobre antecipação de riscos e condições adversas.','Investigar registros individuais autorizados antes de atribuir causas ou propor intervenções específicas.'],owner:'Segurança Viária e Treinamento',message:'Antecipe riscos, mantenha distância e adapte a condução às condições da via.'},
    documentacao:{title:'Conformidade Documental da Frota',family:'documentacao',objective:'Organizar a verificação e o tratamento de pendências documentais.',actions:['Conferir pendências em fontes autorizadas e validar o universo acompanhado.','Propor checklist de acompanhamento com a área de Frota.','Verificar requisitos aplicáveis antes de liberar veículos e revisar os registros do indicador.'],owner:'Frota e Conformidade',message:'Confira a documentação e siga os procedimentos de liberação antes da operação.'},
    infracoes:{title:'Reforço de Orientações sobre Infrações',family:'infracoes',objective:'Avaliar registros e orientar práticas de prevenção de infrações.',actions:['Conferir a classificação dos registros antes de identificar recorrências.','Preparar orientações sobre procedimentos e conduta segura.','Reunir Segurança Viária e Operações para avaliar encaminhamentos.'],owner:'Segurança Viária e Operações',message:'Respeite a sinalização e os procedimentos: segurança faz parte de cada trajeto.'},
    distracao:{title:'Direção sem Distrações',family:'preventiva',objective:'Conscientizar sobre atenção à condução, sem atribuir os resultados ao uso de celular.',actions:['Propor a campanha Celular e Volante Não Combinam para avaliação.','Preparar DDS e materiais sobre atenção à estrada e parada segura para uso de dispositivos.','Submeter materiais à comunicação e à Segurança Viária antes da divulgação.'],owner:'Segurança Viária e Comunicação',message:'Uma distração ao volante pode mudar tudo. Mantenha o foco na estrada.'},
    fadiga:{title:'Descanso é Segurança',family:'preventiva',objective:'Reforçar a prevenção da fadiga sem presumir sua participação nos resultados.',actions:['Orientar sobre reconhecimento de sinais de fadiga e comunicação com a operação.','Revisar o planejamento de jornadas e pausas conforme exigências aplicáveis e procedimentos internos.','Preparar DDS e materiais sobre descanso e decisão de não prosseguir sem condições seguras.'],owner:'Segurança Viária e Operações',message:'Reconheça os sinais de fadiga e siga os procedimentos de descanso e comunicação da operação.'},
    qualidade:{title:'Qualidade e Atualização das Informações',family:'governanca',objective:'Priorizar dados completos e alinhados às competências antes de concluir sobre desempenho.',actions:['Conferir ausências na fonte autorizada e manter os campos ausentes identificados.','Validar unidade, período e critérios de registro com a área responsável.','Registrar revisões pelo fluxo de edição existente e reavaliar o relatório.'],owner:'Área responsável pelo indicador e Governança',message:null},
    governanca:{title:'Revisão de Metas e Direção de Desempenho',family:'governanca',objective:'Esclarecer os critérios de avaliação sem inventar metas.',actions:['Submeter meta e direção à validação da área responsável.','Documentar o significado e a unidade do indicador.','Atualizar a configuração apenas pelo fluxo autorizado, após aprovação.'],owner:'Gestão e Governança de Dados',message:null},
    monitoramento:{title:'Acompanhamento do Indicador',family:'geral',objective:'Manter o acompanhamento e verificar oportunidades de melhoria sem presumir causas.',actions:['Revisar os resultados no ciclo de gestão com a área responsável.','Investigar registros autorizados quando houver necessidade de detalhamento.','Comparar competências futuras com critérios e escopo consistentes.'],owner:'Área responsável pelo indicador',message:null}
};
const TYPES={executivo:{cap:3,focus:'Decisões gerenciais e poucas prioridades.',timeline:'Proposta: iniciar no próximo ciclo de decisão, após aprovação.'},mensal:{cap:3,focus:'Tratativas de curto prazo na competência selecionada.',timeline:'Proposta: avaliar no próximo acompanhamento mensal.'},trimestral:{cap:4,focus:'Evolução e persistência no trimestre selecionado.',timeline:'Proposta: distribuir as atividades pelo próximo ciclo trimestral.'},anual:{cap:5,focus:'Evolução histórica e prioridades estratégicas.',timeline:'Proposta: incluir no planejamento preventivo do próximo ciclo anual, após aprovação.'},comparativo:{cap:4,focus:'Diferenças descritivas sem somar unidades incompatíveis.',timeline:'Proposta: revisar após o próximo período comparável.'},critico:{cap:5,focus:'Encaminhamentos relativos aos pontos de atenção observados.',timeline:'Proposta: priorizar a avaliação no próximo encontro operacional.'}};
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const fmt=v=>v===null||v===undefined?'indisponível':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v);
const family=i=>/autuac|multa/.test(norm(i.indicador))&&/tratad|tratamento/.test(norm(i.indicador))?'tratativas':/identific/.test(norm(i.indicador))?'identificacao':/score/.test(norm(i.indicador))?'score':/r\$|reais|moeda/.test(norm(i.unidade))&&/recuper|ressarc|cobranc|inadimpl|reembols/.test(norm(i.indicador))?'financeiro':/velocidade/.test(norm(i.indicador))?'velocidade':/acident|sinistr/.test(norm(i.indicador))?'sinistros':/crlv|document|cronotac/.test(norm(i.indicador))?'documentacao':/infrac|multa|autuac/.test(norm(i.indicador))?'infracoes':'geral';
function diagnose(i){
    const s=i.estatisticas,last=s.mensais.filter(p=>p.valor!==null).at(-1),directed=Boolean(s.direcao&&s.direcao!=='neutro'),judged=directed&&s.meta!==null;
    const outside=judged?(s.direcao==='menor_melhor'?s.acimaMeta:s.abaixoMeta):null;
    const situation=!last?'Dados insuficientes para avaliar o resultado atual.':!directed?'Sem julgamento de desempenho pela configuração disponível.':i.criticalReason??(s.meta===null?'Meta não cadastrada; a evolução pode ser descrita, mas não há avaliação contra a meta.':'Último valor válido atende à meta; isso não comprova ausência de risco operacional.');
    const evidence=[last?`Último valor válido: ${fmt(last.valor)} ${i.unidade??''}, competência ${last.competencia}; meta ${fmt(s.meta)}.`:'Nenhum valor válido no período.',
        `Média: ${fmt(s.media)}; mínimo: ${fmt(s.minimo)}; máximo: ${fmt(s.maximo)}. Válidos: ${s.validos}; ausentes: ${s.ausentes}.`,
        s.primeiroUltimo?`De ${s.primeiroUltimo.de} a ${s.primeiroUltimo.ate}: variação absoluta ${fmt(s.primeiroUltimo.absoluta)}; relativa ${s.primeiroUltimo.percentual===null?'indisponível':fmt(s.primeiroUltimo.percentual)+'%'}.`:'Comparação temporal insuficiente.',
        outside===null?'Persistência fora da meta não classificada.':`${outside} competências fora da referência de meta atual (vigência histórica não verificada).`,
        `Maiores sequências de melhora/piora: ${s.tendencia.maiorSequenciaMelhora}/${s.tendencia.maiorSequenciaPiora} transições consecutivas. Tendência descritiva, sem inferência causal.`];
    const measurement=measurementAssessment(i);
    return {indicatorId:i.id,title:i.indicador,situation:measurement.neutral?measurement.note:situation,evidence,limitations:[...(measurement.note?[measurement.note]:[]),...(s.ausentes?['Ausências interrompem a interpretação de sequências.']:[]),...(!directed?['Sem direção de desempenho para classificar melhora/piora.']:[]),...(s.meta===null?['Meta ausente: avaliação contra a meta indisponível.']:[])]};
}
function allowed(i,code){
    if(!Object.hasOwn(CATALOG,code))return false;
    if(code==='financeiro')return measurementAssessment(i).monetary&&i.estatisticas.validos>0;
    if(code==='qualidade')return i.estatisticas.ausentes>0||!i.estatisticas.validos;
    if(code==='governanca')return !i.estatisticas.direcao||i.estatisticas.meta===null;
    if(code==='monitoramento')return true;
    if(!i.estatisticas.validos||!i.estatisticas.direcao||i.estatisticas.direcao==='neutro')return false;
    return CATALOG[code].family===family(i)||(CATALOG[code].family==='preventiva'&&['sinistros','velocidade'].includes(family(i)));
}
function defaultCode(i){if(!i.estatisticas.validos)return 'qualidade';if(measurementAssessment(i).monetary)return 'financeiro';if(!i.estatisticas.direcao||i.estatisticas.meta===null)return 'governanca';return Object.keys(CATALOG).find(c=>CATALOG[c].family===family(i)&&allowed(i,c))||(i.estatisticas.ausentes?'qualidade':'monitoramento');}
function action(r,i,code){
    const c=CATALOG[code],d=diagnose(i),general=c.family==='preventiva',basis=general?'Preventiva geral':code==='monitoramento'?'Requer investigação':'Baseada em indicador';
    return {title:c.title,problem:d.situation,relatedIndicators:[{id:i.id,name:i.indicador}],evidence:[{indicatorId:i.id,text:d.evidence[0]}],objective:c.objective,actions:[...c.actions],audience:c.family==='governanca'?'Equipe responsável pelos registros':c.family==='documentacao'?'Frota e equipe de liberação':'Motoristas e equipes operacionais',suggestedOwner:c.owner,priority:i.critical?'Alta':!i.estatisticas.validos||!i.estatisticas.direcao||i.estatisticas.meta===null?'Validar dados':'Acompanhamento',suggestedTimeline:TYPES[r.type].timeline,monitoringIndicator:i.indicador,evaluationCriterion:'Comparar as próximas competências com a meta e direção cadastradas, conferindo qualidade e escopo dos registros. A evolução isolada não comprova efeito causal da ação.',basis,observations:[general?'Medida educativa geral: não há evidência neste contexto de que esse fator causou o resultado.':'A associação ao indicador não confirma causas individuais.','Responsável e prazo são sugestões, sujeitos à avaliação e aprovação da empresa.']};
}
function campaign(i,code){const c=CATALOG[code];return {indicatorId:i.id,title:c.title,objective:c.objective,audience:'Motoristas e equipes operacionais',basis:CATALOG[code].family==='preventiva'?'Preventiva geral':'Baseada em indicador',message:c.message,limitations:'Proposta educativa sujeita à avaliação; não representa ação executada nem causa comprovada.'};}
function communication(i,code,channel='comunicado',format='cards'){
    const c=CATALOG[code];return {indicatorId:i.id,theme:c.title,objective:c.objective,audience:'Motoristas e público interessado em segurança viária',channel:{feed:'Instagram · feed',stories:'Instagram · stories',reels:'Instagram · Reels',comunicado:'Comunicação interna'}[channel],format:{cards:'Sequência de cards educativos',video:'Vídeo educativo breve',mensagem:'Comunicado com orientação prática'}[format],message:c.message,callToAction:'Compartilhe esta orientação e coloque a segurança em prática.',riskRelation:'Conscientização preventiva; não comprova relação causal com resultados operacionais.',suggestedPeriod:'Proposta: veicular no próximo ciclo de comunicação, após aprovação.',limitations:'Não incluir números operacionais, nomes, locais ou registros individuais no material público.'};
}
/** @param {any} report */
export function buildReportManagement(report){
    const {type,indicators}=report;
    const plan=[],campaigns=[],communications=[];
    const ranked=[...indicators].sort((a,b)=>Number(b.critical)-Number(a.critical)||Number(!b.estatisticas.validos)-Number(!a.estatisticas.validos));
    for(const indicator of ranked){
        const candidate=action(report,indicator,defaultCode(indicator));
        const existing=plan.find(item=>item.title===candidate.title&&item.priority===candidate.priority);
        if(existing){
            existing.relatedIndicators.push(...candidate.relatedIndicators);
            existing.evidence.push(...candidate.evidence);
            existing.monitoringIndicator+='; '+candidate.monitoringIndicator;
        }else if(plan.length<TYPES[type].cap)plan.push(candidate);
    }
    for(const indicator of ranked){
        const code=defaultCode(indicator);
        if(!CATALOG[code].message||campaigns.some(item=>item.title===CATALOG[code].title))continue;
        campaigns.push(campaign(indicator,code));
        communications.push(communication(indicator,code));
        if(campaigns.length===2)break;
    }
    const priorities=['Alta','Validar dados','Acompanhamento'];
    plan.sort((a,b)=>priorities.indexOf(a.priority)-priorities.indexOf(b.priority));
    const risks=indicators.filter(item=>item.critical).map(item=>({
        indicatorId:item.id,title:item.indicador,priority:'Alta',
        description:measurementAssessment(item).neutral?measurementAssessment(item).note:item.criticalReason,
        evidence:diagnose(item).evidence[0]
    }));
    return {version:4,executiveDiagnosis:indicators.map(diagnose),priorityRisks:risks,actionPlan:plan,campaignSuggestions:campaigns,communicationSuggestions:communications,
        limitations:[TYPES[type].focus,'Propostas de ação e comunicação sujeitas à avaliação da empresa. Não há atribuição causal ou eficácia garantida.',
            ...(!indicators.length?['Nenhum indicador corresponde ao recorte; não há base para propor ações específicas.']:[]),
            ...(indicators.length>plan.length?['O plano prioriza '+plan.length+' ações para '+indicators.length+' indicadores.']:[])]};
}
