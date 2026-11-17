// Uma projeção de apresentação para prévia e PDF; não calcula estatísticas.
window.ReportContent={
    valid(m,r){
        const text=s=>typeof s==='string'&&s.length<16000,strings=a=>Array.isArray(a)&&a.every(text),id=id=>r.indicators.some(i=>i.id===id);
        return Boolean(m?.version===4&&Array.isArray(m.executiveDiagnosis)&&m.executiveDiagnosis.every(d=>id(d.indicatorId)&&text(d.title)&&text(d.situation)&&strings(d.evidence)&&strings(d.limitations))&&
            Array.isArray(m.priorityRisks)&&m.priorityRisks.every(p=>id(p.indicatorId)&&text(p.title)&&text(p.description)&&text(p.evidence))&&
            Array.isArray(m.actionPlan)&&m.actionPlan.every(a=>['title','problem','objective','audience','suggestedOwner','priority','suggestedTimeline','monitoringIndicator','evaluationCriterion','basis'].every(k=>text(a[k]))&&strings(a.actions)&&strings(a.observations)&&Array.isArray(a.relatedIndicators)&&a.relatedIndicators.every(i=>id(i.id)&&text(i.name))&&Array.isArray(a.evidence)&&a.evidence.every(e=>id(e.indicatorId)&&text(e.text)))&&
            Array.isArray(m.campaignSuggestions)&&m.campaignSuggestions.every(c=>id(c.indicatorId)&&['title','objective','audience','basis','message','limitations'].every(k=>text(c[k])))&&
            Array.isArray(m.communicationSuggestions)&&m.communicationSuggestions.every(c=>id(c.indicatorId)&&['theme','objective','audience','channel','format','message','callToAction','riskRelation','suggestedPeriod','limitations'].every(k=>text(c[k])))&&strings(m.limitations));
    },
    sections(r){
        const m=r.management;if(!this.valid(m,r))return {diagnosis:[],final:[]};
        return {diagnosis:[{title:'Diagnóstico executivo',blocks:m.executiveDiagnosis.map(d=>({title:d.title,lines:[d.situation,...d.evidence,...d.limitations]}))},{title:'Principais pontos de atenção',blocks:m.priorityRisks.length?m.priorityRisks.map(p=>({title:p.title,lines:[p.description,p.evidence]})):[{title:'Acompanhamento',lines:['Nenhum ponto de atenção pelos critérios configurados; isso não comprova ausência de risco operacional.']}]}],
            final:[{title:'Síntese gerencial',blocks:[{title:'Orientação para decisão',lines:m.limitations}]},
            {title:'PLANO DE AÇÃO E RECOMENDAÇÕES PREVENTIVAS',blocks:m.actionPlan.map(a=>({title:a.title,lines:[`Prioridade: ${a.priority} · ${a.basis}`,`Problema ou oportunidade: ${a.problem}`,`Indicador: ${a.relatedIndicators.map(i=>i.name).join('; ')}`,...a.evidence.map(e=>`Evidência: ${e.text}`),`Objetivo: ${a.objective}`,...a.actions.map(s=>`Ação proposta: ${s}`),`Público-alvo: ${a.audience}`,`Área responsável sugerida: ${a.suggestedOwner}`,`Prazo sugerido: ${a.suggestedTimeline}`,`Monitorar: ${a.monitoringIndicator}`,`Critério de avaliação: ${a.evaluationCriterion}`,...a.observations]}))},
            {title:'Sugestões de Campanhas e Comunicação',blocks:[...m.campaignSuggestions.map(c=>({title:c.title,lines:[`Base: ${c.basis}`,`Objetivo: ${c.objective}`,`Público-alvo: ${c.audience}`,`Mensagem proposta: ${c.message}`,c.limitations]})),...m.communicationSuggestions.map(c=>({title:`Conteúdo proposto: ${c.theme}`,lines:[`Objetivo: ${c.objective}`,`Público-alvo: ${c.audience}`,`Canal e formato: ${c.channel} · ${c.format}`,`Mensagem principal: ${c.message}`,`Chamada: ${c.callToAction}`,c.riskRelation,c.suggestedPeriod,c.limitations]}))]}]};
    }
};
