// V6.1: projeção editorial. Reutiliza somente valores e diferenças já calculados.
window.ReportExecutive={
    format(value){return value==='complete'?'complete':'executive';},
    financial(i,d){return d?.measurement??{monetary:/^(r\$|reais|brl)$/i.test(String(i.unidade??'').trim()),neutral:/^(r\$|reais|brl)$/i.test(String(i.unidade??'').trim()),canSum:!/^(r\$|reais|brl)$/i.test(String(i.unidade??'').trim())};},
    sum(r,i,fmt){const d=r.intelligence?.dimensions.find(d=>d.indicatorId===i.id),m=this.financial(i,d);return !m.canSum?'Não consolidar':i.estatisticas.somaAplicavel?fmt(i.estatisticas.soma):'N/A';},
    meeting(r){
        const fmt=value=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);
        const percent=value=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1,signDisplay:'exceptZero'}).format(value)+'%';
        const month=value=>{
            if(!value)return '';
            const [short,year]=value.split('/');
            const names={Jan:'janeiro',Fev:'fevereiro',Mar:'março',Abr:'abril',Mai:'maio',Jun:'junho',Jul:'julho',Ago:'agosto',Set:'setembro',Out:'outubro',Nov:'novembro',Dez:'dezembro'};
            return names[short]&&year?names[short]+' de '+year:value;
        };
        const byId=id=>r.indicators.find(i=>i.id===id);
        const {volumeId,rateId,distanceId,severityId}=r.roadSafety??{};
        const [volume,rate,distance,severity]=[volumeId,rateId,distanceId,severityId].map(byId);
        const recent=i=>i?.estatisticas.mensais.at(-1);
        const value=i=>recent(i)?.valor;
        const show=i=>value(i)==null?'Dado ausente':fmt(value(i));
        const previous=volume?.estatisticas.mensais.at(-2),current=recent(volume),delta=current?.variacaoAnterior,desvio=current?.desvioMeta;
        const competency=month(r.competencias.at(-1));
        const cards=volume?[
            [show(volume),'Total de acidentes'],
            [show(rate),'Acidentes por milhão de km'],
            [show(distance),'Quilometragem (km)'],
            [show(severity),'Tombamento próprio']
        ]:[...new Set([...this.build(r).detailIds,...r.indicators.map(i=>i.id)])].slice(0,4).map(byId).map(i=>[show(i),i.indicador+(i.unidade?' ('+i.unidade+')':'')]);
        const direction=delta?.absoluta==null?'':delta.absoluta>0?'subiram':delta.absoluta<0?'caíram':'ficaram estáveis';
        const targetSide=desvio?.absoluta==null?'':desvio.absoluta>0?'acima':desvio.absoluta<0?'abaixo':'';
        const headline=volume
            ? current?.valor==null?`Total de acidentes sem registro em ${competency}.`:`${competency.charAt(0).toUpperCase()+competency.slice(1)} teve ${show(volume)} ${current.valor===1?'acidente':'acidentes'}`+
                (targetSide?`, ${fmt(Math.abs(desvio.absoluta))} ${targetSide} da meta de ${fmt(volume.estatisticas.meta)}${desvio.percentual==null?'':' ('+percent(desvio.percentual)+')'}.`:desvio?.absoluta===0?' e atingiu a meta cadastrada.':'.')
            : 'Resultados da competência '+competency;
        const movement=direction?`Os acidentes ${direction==='ficaram estáveis'?'se mantiveram em '+show(volume)+' frente a '+month(previous.competencia):`${direction} de ${fmt(previous.valor)} em ${month(previous.competencia)} para ${show(volume)} em ${competency}${delta.percentual==null?'':' ('+percent(delta.percentual)+')'}`}.`:'';
        const exposure=value(rate)!=null&&value(distance)!=null
            ? `A taxa foi de ${show(rate)} acidentes por milhão de km, com ${show(distance)} km rodados.`:'';
        const chartIds=volume?[volume.id,rate?.id].filter(id=>id!=null):this.build(r).chartIds.slice(0,2);
        const agenda=volume
            ? 'Definir quem vai revisar os registros da última competência e qual medida preventiva será acompanhada até a próxima reunião.'
            : 'Pactuar as prioridades do recorte, a área responsável e o critério de acompanhamento até a próxima reunião.';
        const chartTitle=direction?`Acidentes ${direction} em ${competency}${targetSide?` e ficaram ${targetSide} da meta`:''}`:'Total de acidentes por competência';
        return {cards,headline,movement,exposure,agenda,chartIds,chartTitle,volumeId,rateId};
    },
    revisions(r,previous){
        if(!previous||!previous.snapshotUpdatedAt||previous.snapshotUpdatedAt===r.snapshotUpdatedAt
            ||previous.type!==r.type||previous.sector!==r.sector)return null;
        const before=new Map(previous.indicators.map(i=>[i.id,i])),changed=[];
        const oldMonths=new Set(previous.competencias),overlap=r.competencias.filter(c=>oldMonths.has(c));
        if(!overlap.length||before.size!==r.indicators.length||r.indicators.some(i=>{
            const old=before.get(i.id);
            return !old||old.indicador!==i.indicador||old.setor!==i.setor||old.unidade!==i.unidade;
        }))return null;
        for(const i of r.indicators){
            const values=new Map(before.get(i.id).estatisticas.mensais.map(p=>[p.competencia,p.valor]));
            for(const point of i.estatisticas.mensais){
                if(values.has(point.competencia)&&values.get(point.competencia)!==point.valor){
                    changed.push({name:i.indicador,competency:point.competencia,before:values.get(point.competencia),after:point.valor});
                }
            }
        }
        return {previousCutoff:previous.snapshotUpdatedAt,changed};
    },
    narrative(i,d){
        const s=i.estatisticas,points=s.mensais.filter(p=>p.valor!==null),first=points[0],last=points.at(-1),final=s.mensais.at(-1),p=s.primeiroUltimo;
        const f=v=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v),unit=i.unidade??'',m=this.financial(i,d);
        const off=d?.off??(final?.valor!==null&&s.meta!==null&&(s.direcao==='menor_melhor'?final?.valor>s.meta:s.direcao==='maior_melhor'?final?.valor<s.meta:false));
        const improved=d?.improved??(points.length>1&&p?.absoluta!==null&&(s.direcao==='menor_melhor'?p?.absoluta<0:s.direcao==='maior_melhor'?p?.absoluta>0:false)),worse=d?.worse??(points.length>1&&p?.absoluta!==null&&(s.direcao==='menor_melhor'?p?.absoluta>0:s.direcao==='maior_melhor'?p?.absoluta<0:false));
        if(!last)return `${i.indicador}: não há dados disponíveis no período. A área responsável precisa conferir os registros antes de avaliar o resultado.`;
        let line=points.length>1?`${i.indicador} passou de ${f(first.valor)} (${first.competencia}) para ${f(last.valor)} ${unit} (${last.competencia}).`:`${i.indicador} registrou ${f(last.valor)} ${unit} em ${last.competencia}; um único resultado não permite avaliar a evolução.`;
        if(points.length>1&&p?.absoluta!==null&&p?.absoluta!==undefined){const movement=p.absoluta>0?'aumento':p.absoluta<0?'redução':'estabilidade';if(p.absoluta===0)line+=' O valor permaneceu estável entre essas datas.';else if(p.percentual!==null)line+=` Houve ${movement} de ${f(Math.abs(p.percentual))}%.`;else line+=` A variação percentual não pode ser calculada porque o valor inicial é zero.`;}
        if(m.neutral)line+=' A mudança precisa ser avaliada após confirmar se o valor representa saldo ou movimentação financeira; queda de saldo não significa, por si só, piora.';
        else if(!final||final.valor===null)line+=' Falta o registro do último mês selecionado; o valor acima é o último disponível.';
        else if(!['menor_melhor','maior_melhor'].includes(s.direcao))line+=' A direção não permite classificar o resultado como melhora ou piora.';
        else if(s.meta===null)line+=' Falta uma meta validada para avaliar o resultado.';
        else if(improved&&off)line+=` O resultado melhorou, mas a meta atual de ${f(s.meta)} ${unit} ainda não foi alcançada.`;
        else if(worse&&!off)line+=` O resultado ainda atende à meta atual de ${f(s.meta)} ${unit}, mas a piora merece atenção antes do próximo acompanhamento.`;
        else if(off)line+=` A meta atual de ${f(s.meta)} ${unit} ainda não foi alcançada; é necessário avaliar as pendências com a área responsável.`;
        else line+=' O resultado atende à meta atual; acompanhar sua continuidade no próximo período.';
        if(m.neutral&&final?.valor===null)line+=' Falta o registro do último mês selecionado.';
        if(points.length===2)line+=' A comparação se limita a dois registros.';
        if(s.ausentes)line+=' Há meses sem registro; as lacunas foram preservadas.';
        if(d?.trend?.startsWith('Oscilação'))line+=' O percurso oscilou; a mudança não foi uniforme.';
        return line;
    },
    build(r){
        const v=r.intelligence,byId=id=>r.indicators.find(i=>i.id===id),dimension=id=>v?.dimensions.find(d=>d.indicatorId===id),unique=a=>[...new Set(a)],normal=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
        const priority=unique([...(v?.priorityIds??[]),...r.indicators.filter(i=>i.critical).map(i=>i.id)]),advances=(v?.achievements??[]).filter(id=>!this.financial(byId(id),dimension(id)).neutral).slice(0,3),challenges=(v?.challenges??[]).slice(0,3),critical=r.indicators.filter(i=>i.critical||dimension(i.id)?.operational?.validated&&dimension(i.id).operational.level==='Alta');
        const detailIds=unique([...priority.slice(0,3),...advances,...challenges]).filter(id=>byId(id)).slice(0,6);
        const chartCandidates=unique([...priority,...advances,...(v?.charts.kept??[])]),eligible=new Set(v?.charts.kept??r.indicators.filter(i=>i.valores.filter(v=>v!==null).length>1&&new Set(i.valores.filter(v=>v!==null)).size>1).map(i=>i.id));
        const chartIds=chartCandidates.filter(id=>eligible.has(id)).slice(0,5),groups=new Map();
        for(const a of v?.actions??[]){const key=normal(a.title)+'|'+normal(a.tasks.join(' '))+'|'+normal(a.owner);if(groups.has(key)){groups.get(key).indicatorIds=unique([...groups.get(key).indicatorIds,...a.indicatorIds]);continue;}groups.set(key,{...a,indicatorIds:[...a.indicatorIds]});}
        const actions=[...groups.values()].map((a,n)=>{const related=a.indicatorIds.map(byId).filter(Boolean),d=dimension(related[0]?.id),neutral=related.some(i=>this.financial(i,dimension(i.id)).neutral);return {...a,ref:'A'+(n+1),title:a.title==='Investigação do Escopo e dos Critérios'?'Esclarecer o indicador e definir a próxima ação':a.title,problem:neutral?'Confirmar a natureza dos valores antes de decidir.':d?.off?'Meta ainda não alcançada.':d?.worse?'Resultado piorou no período.':'Verificar registros e oportunidades de melhoria.',monitoring:'Conferir '+related.map(i=>i.indicador).join('; ')+' no próximo período, com a mesma unidade e critérios.',status:'Sugerida'};});
        const observations=[];
        for(const pair of r.management?.jointObservations??[]){const items=Array.isArray(pair.indicatorIds)?pair.indicatorIds.map(byId):[];if(pair.relation!=='simultaneous'||items.length!==2||items.some(i=>!i||i.estatisticas.validos<2))continue;const [a,b]=items.map(i=>i.estatisticas.primeiroUltimo);if(!a||!b||!Number.isFinite(a.absoluta)||!Number.isFinite(b.absoluta)||a.de!==b.de||a.ate!==b.ate)continue;const movement=p=>p.absoluta===0?'permaneceu estável':p.absoluta<0?'diminuiu':'aumentou';if(!observations.some(o=>o.ids.every(id=>pair.indicatorIds.includes(id))))observations.push({ids:[...pair.indicatorIds],text:'Entre '+a.de+' e '+a.ate+', '+items[0].indicador+' '+movement(a)+', enquanto '+items[1].indicador+' '+movement(b)+'. São observações simultâneas; os dados não demonstram relação causal.'});if(observations.length===2)break;}
        for(const id of detailIds){if(observations.length===2)break;const i=byId(id),a=i.estatisticas.primeiroUltimo;if(!a||!a.absoluta)continue;const partner=detailIds.map(byId).find(j=>j.id!==id&&j.estatisticas.primeiroUltimo?.de===a.de&&j.estatisticas.primeiroUltimo?.ate===a.ate&&j.estatisticas.primeiroUltimo.absoluta*a.absoluta<0&&!observations.some(o=>o.ids.includes(j.id)||o.ids.includes(id)));if(partner)observations.push({ids:[id,partner.id],text:`Entre ${a.de} e ${a.ate}, ${i.indicador} ${a.absoluta<0?'diminuiu':'aumentou'}, enquanto ${partner.indicador} ${partner.estatisticas.primeiroUltimo.absoluta<0?'diminuiu':'aumentou'}. São mudanças simultâneas; os dados agregados não demonstram que uma causou a outra.`});}
        return {version:'6.1',scope:`${r.indicators.length} indicadores de ${r.competencias[0]} a ${r.competencias.at(-1)}`,paragraph:r.indicators.length?(advances.length?(critical.length?'Há resultados melhores, mas ainda existem pendências que precisam de decisão. Priorize as ações relacionadas aos pontos de atenção e confirme os registros que exigem validação.':'Os resultados selecionados mostram melhora. Avalie a continuidade das ações pertinentes e acompanhe os próximos registros antes de concluir que o avanço será permanente.'):'A leitura deve começar pelos dados e critérios que precisam de validação. Discuta as pendências identificadas e combine com as áreas responsáveis os próximos passos. '):'Nenhum indicador corresponde ao recorte. Revise a seleção antes de definir ações.',advances,challenges,priorities:priority.slice(0,3),detailIds,criticalIds:critical.map(i=>i.id),chartIds,actions,observations,
            horizons:[{days:30,title:'Investigar e iniciar',lines:actions.map(a=>a.ref+': '+(a.tasks[0]??'Validar os registros e combinar a primeira atividade.'))},{days:60,title:'Executar e acompanhar',lines:actions.map(a=>a.ref+': '+(a.tasks[1]??a.monitoring))},{days:90,title:'Avaliar e ajustar',lines:actions.length?['Comparar os novos resultados dos indicadores relacionados às ações, verificar as pendências e ajustar o plano com as áreas responsáveis.']:['Reavaliar os dados disponíveis e definir o próximo ciclo.']}],
            limitations:['Metas atuais são referências; sua vigência histórica não foi verificada. Dados ausentes não são zero e os registros podem ser revisados.','Mudanças simultâneas não comprovam causas. Ações, áreas e prazos são sugestões; objetivos informados como aprovados continuam sendo declarações da gestão.',...(r.indicators.some(i=>this.financial(i,dimension(i.id)).monetary)?['Valores financeiros sem natureza validada e saldos não são consolidados como receitas ou exposição acumulada. A direção oficial foi preservada.']:[]),...(r.management?.limitations??[]).filter(s=>s.startsWith('Síntese complementar parcial:'))],
            selection:`Foram selecionadas ${chartIds.length} séries para gráficos. Todos os ${critical.length} pontos de atenção do recorte estão relacionados no quadro, mesmo quando não têm gráfico. Histórico, evidências integrais e metodologia ampliada estão disponíveis no formato Completo.`};
    }
};
