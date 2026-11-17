// Uma projeção de apresentação para prévia e PDF; não calcula estatísticas.
window.ReportContent={
    panorama(r,fmt){
        const direction=i=>({menor_melhor:'Menor é melhor',maior_melhor:'Maior é melhor',neutro:'Neutra'}[i.direcaoDesempenho]??'Não definida');
        return r.indicators.map(i=>{const s=i.estatisticas,last=s.mensais.at(-1);return [i.indicador+'\n'+i.setor+' / '+(i.unidade??'não informada'),`${fmt(last?.valor)}\n${last?.competencia??'—'}`,`${fmt(i.meta)}\n${direction(i)}`,fmt(s.primeiroUltimo?.percentual),i.critical?'Atenção':s.validos?'Sem sinalização':'Sem dados'];});
    },
    evolution(i){
        const p=i.estatisticas.primeiroUltimo,delta=p?.absoluta,direction=i.direcaoDesempenho;
        if(delta===null||delta===undefined)return 'Evolução indisponível: faltam extremos comparáveis.';
        const numeric=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(delta);
        const assessment=!['menor_melhor','maior_melhor'].includes(direction)?'sem classificação de desempenho':delta===0?'mesmo valor nos extremos':(direction==='menor_melhor'?delta<0:delta>0)?'melhora descritiva':'piora descritiva';
        const unit=p.pontosPercentuais!==null&&p.pontosPercentuais!==undefined?'p.p.':i.unidade??'(unidade não informada)';
        return `De ${p.de} a ${p.ate}: ${assessment}; variação absoluta ${numeric} ${unit}.`;
    },
    // Seleção editorial estável; nenhuma estatística é recalculada ou alterada.
    editorial(r){
        const limits={executivo:3,mensal:3,trimestral:4,anual:5,comparativo:4,critico:5};
        const count=r.indicators.length,cap=Math.min(count,limits[r.type]??3);
        const ordered=r.indicators.map((i,index)=>({i,index})).sort((a,b)=>Number(b.i.critical)-Number(a.i.critical)||a.index-b.index);
        const priority=ordered.slice(0,cap).map(x=>x.i),m=this.valid(r.management,r)?r.management:null;
        const scope=`${count} de ${r.selectedCount} indicadores selecionados; ${r.competencias[0]??'sem competência'} a ${r.competencias.at(-1)??'sem competência'}; setor ${r.sector==='TODOS'?'todos':r.sector??'não informado'}.`;
        const focus={executivo:'Decisões e prioridades operacionais',mensal:'Resultados recentes e tratativas imediatas',trimestral:'Tendências e recorrência no intervalo',anual:'Avaliação consolidada e prioridades de gestão',comparativo:'Diferenças entre competências selecionadas',critico:'Pontos de atenção segundo metas e direções'}[r.type]??'Análise de desempenho';
        return {scope,focus,priority,management:m,volume:count<=5?'pequeno':count<=15?'médio':'grande',
            selection:`Corpo executivo: ${cap} indicadores, priorizando os sinalizados por meta/direção e, em empate, a ordem da seleção. Todos os ${count} indicadores do recorte constam dos apêndices. A seleção editorial não é uma classificação adicional de risco.`,
            summary:[scope,`${r.criticalCount} indicadores com atenção pelos critérios configurados.`,...priority.slice(0,3).map(i=>`${i.indicador}: ${i.criticalReason||'sem sinalização crítica pelos critérios configurados'}. ${this.evolution(i)}`)],
            limitations:[...new Set([...(r.limitations??[]),...(m?.limitations??[]),'Competências são revisáveis; não representam necessariamente períodos encerrados. Ausência não equivale a zero. Agregados não comprovam causas individuais.'])]};
    },
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
