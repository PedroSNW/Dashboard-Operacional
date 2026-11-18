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
        if(this.validIntelligence(r.intelligence,r)){const v=r.intelligence;return {scope:`${r.indicators.length} de ${r.selectedCount} indicadores; ${r.competencias[0]} a ${r.competencias.at(-1)}; setor ${r.sector==='TODOS'?'todos':r.sector}.`,focus:v.focus,priority:v.priorityIds.map(id=>r.indicators.find(i=>i.id===id)),management:this.valid(r.management,r)?r.management:null,summary:v.summary.flatMap(b=>b.lines),selection:v.selection,limitations:v.limitations,version:6};}
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
    validIntelligence(v,r){
        const text=x=>typeof x==='string'&&x.length<16000,strings=a=>Array.isArray(a)&&a.every(text),id=x=>r.indicators.some(i=>i.id===x);
        // Verificar os contêineres antes de acessar conteúdo de uma resposta externa.
        if(!v||!Array.isArray(v.actions)||v.actions.some(a=>!a||!Array.isArray(a.indicatorIds))||!Array.isArray(v.dimensions)||v.dimensions.some(d=>!d)||!Array.isArray(v.summary)||v.summary.some(b=>!b)||!Array.isArray(v.evolutionPlan)||v.evolutionPlan.some(h=>!h||!Array.isArray(h.items)||h.items.some(t=>!t))||!Array.isArray(v.reportedActions)||v.reportedActions.some(a=>!a)||!Array.isArray(v.charts?.excluded)||v.charts.excluded.some(x=>!x))return false;
        if(!Array.isArray(v.charts?.kept))return false;
        const chartIds=[...v.charts.kept,...v.charts.excluded.map(x=>x.id)];
        if(chartIds.length!==r.indicators.length||new Set(chartIds).size!==chartIds.length)return false;
        return Boolean(v?.version===6&&Array.isArray(v.dimensions)&&v.dimensions.length===r.indicators.length&&new Set(v.dimensions.map(d=>d.indicatorId)).size===r.indicators.length&&v.dimensions.every(d=>id(d.indicatorId)&&['name','performance','endpoint','trend','priorityLabel','evidence','meaning'].every(k=>text(d[k]))&&strings(d.caveats)&&typeof d.operational?.validated==='boolean')&&Array.isArray(v.priorityIds)&&v.priorityIds.every(id)&&Array.isArray(v.achievements)&&v.achievements.every(id)&&Array.isArray(v.challenges)&&v.challenges.every(id)&&Array.isArray(v.summary)&&v.summary.length===5&&v.summary.every(b=>text(b.title)&&strings(b.lines))&&Array.isArray(v.actions)&&v.actions.every(a=>strings(a.tasks)&&a.status==='Sugerida'&&a.indicatorIds.every(id)&&['ref','title','objective','owner','timeline','monitoring','criterion','priority'].every(k=>text(a[k])))&&Array.isArray(v.evolutionPlan)&&v.evolutionPlan.every(h=>[30,60,90].includes(h.days)&&Array.isArray(h.items)&&h.items.every(t=>['ref','title','task','criterion','monitoring','status','goal'].every(k=>text(t[k]))))&&Array.isArray(v.reportedActions)&&v.reportedActions.every(a=>text(a.text)&&['Informada como em execução','Informada como concluída','Pendente de validação'].includes(a.status))&&(!v.goals||text(v.goals.text)&&['suggested','management','approved'].includes(v.goals.kind)&&text(v.goals.label))&&strings(v.limitations)&&Array.isArray(v.charts?.kept)&&v.charts.kept.every(id)&&Array.isArray(v.charts.excluded)&&v.charts.excluded.every(x=>id(x.id)&&text(x.reason))&&JSON.stringify(v.context??null)===JSON.stringify(r.managementContext??null));
    },
    chartIds(r){return this.validIntelligence(r.intelligence,r)?r.intelligence.charts.kept:r.indicators.map(i=>i.id);},
    v6Sections(r){
        if(!this.validIntelligence(r.intelligence,r))return [];
        const v=r.intelligence,get=id=>v.dimensions.find(d=>d.indicatorId===id),max=3;
        const sections=[{key:'summary',title:'Resumo executivo gerencial',blocks:v.summary.map(b=>({title:b.title,lines:b.lines}))}];
        const resultBlock=d=>({title:d.name,lines:[d.evidence,`${d.performance}; ${d.trend}.`,d.meaning,...d.caveats]});
        const advancesDetailed=new Set(v.achievements.slice(0,max));
        const challengeBlock=d=>advancesDetailed.has(d.indicatorId)?{title:d.name,lines:[`${d.performance}. O avanço detalhado na seção anterior ainda exige acompanhar a lacuna da referência e avaliar as pendências com a área responsável.`]}:resultBlock(d);
        sections.push({key:'achievements',title:'Principais avanços',blocks:v.achievements.length?v.achievements.slice(0,max).map(id=>resultBlock(get(id))):[{title:'Cobertura disponível',lines:['Não há avanço descritivo comprovável no intervalo selecionado.']}],note:v.achievements.length>max?`Outros ${v.achievements.length-max} avanços estão identificados no panorama e nos apêndices.`:null});
        sections.push({key:'challenges',title:'Principais desafios e riscos',blocks:v.challenges.length?v.challenges.slice(0,max).map(id=>challengeBlock(get(id))):[{title:'Cobertura disponível',lines:['Nenhum desafio foi sinalizado por esses critérios; criticidade operacional e cobertura exigem validação própria.']}],note:v.challenges.length>max?`Outros ${v.challenges.length-max} pontos de atenção constam do panorama e dos apêndices.`:null});
        sections.push({key:'panorama',title:'Panorama consolidado dos indicadores',blocks:[]});
        const detailed=new Set([...v.achievements.slice(0,max),...v.challenges.slice(0,max)]);
        sections.push({key:'priorities',title:'Análise dos indicadores prioritários',blocks:v.priorityIds.map(id=>{const d=get(id),actions=v.actions.filter(a=>a.indicatorIds.includes(id));return {id,title:d.name,lines:[`O que aconteceu: ${d.performance}; ${d.trend}.`,...(detailed.has(id)?[]:[d.evidence]),`Significado gerencial: ${d.meaning}`,`O que avaliar: ${actions.map(a=>a.title).join('; ')||'validar cobertura, direção e escopo para definir uma tratativa específica.'}`,`Como acompanhar: rever as próximas competências do mesmo indicador, conferindo a referência atual e o escopo dos registros.`,...(detailed.has(id)?[]:d.caveats)]};})});
        if(v.context){const c=v.context,blocks=[];if(v.reportedActions.length)blocks.push({title:'Ações informadas pela gestão',lines:v.reportedActions.map(a=>`${a.status}: ${a.text}`)});
            for(const [key,label] of [['difficulties','Dificuldades informadas'],['achievements','Conquistas informadas'],['priorities','Prioridades informadas'],['observations','Observações informadas']])if(c[key])blocks.push({title:label,lines:[c[key]]});
            if(v.goals)blocks.push({title:v.goals.label,lines:[v.goals.text]});sections.push({key:'context',title:'Contexto operacional do período',blocks,note:'Relatos da gestão sem verificação independente. Não alteram valores ou metas oficiais; conciliar eventuais divergências com os indicadores.'});}
        if(v.actions.length)sections.push({key:'actions',title:'Plano de ação e recomendações',blocks:[]},{key:'evolution',title:'Plano de evolução — próximos 90 dias',blocks:[]});
        sections.push({key:'conclusion',title:'Conclusão executiva',blocks:[{title:'Decisões para o próximo ciclo',lines:[v.priorityIds.length?`Discutir as prioridades de ${v.priorityIds.slice(0,2).map(id=>get(id).name).join('; ')}. Avaliar as iniciativas propostas, pactuar objetivos e responsáveis por área e verificar a evolução no próximo ciclo.`:'Validar o recorte e os dados disponíveis antes de definir iniciativas.']} ]});
        return sections;
    },
    v6Overview(r,fmt,compact=false){
        const v=r.intelligence,ids=compact&&r.indicators.length>15?new Set([...v.priorityIds,...v.achievements.slice(0,3)]):null;
        return v.dimensions.filter(d=>!ids||ids.has(d.indicatorId)).map(d=>{const i=r.indicators.find(i=>i.id===d.indicatorId),last=i.estatisticas.mensais.at(-1);return [`${i.indicador}\n${i.setor} / ${i.unidade??'não informada'}`,`${fmt(last?.valor)} · ${last?.competencia??'—'}\nMeta atual: ${fmt(i.meta)}`,`${d.performance}\n${d.trend}`,d.operational.validated?`${d.operational.category} · ${d.operational.level}`:'Pendente de validação'];});
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
