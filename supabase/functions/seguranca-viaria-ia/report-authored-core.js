// V7 shared contract. Mirrored byte-for-byte into the Edge Function for deployment.
(() => {
    const clone = value => JSON.parse(JSON.stringify(value));
    const types = ['summary','advances','challenges','integrated','priorities','hypothesis','recommendation','campaign','action','evolution','conclusion'];
    const relations = ['observed','increase','decrease','stable','within_target','outside_target','above_mean','below_mean','equal_mean','improved','worsened'];
    const string = {type:'string'}, strings = {type:'array',items:string};
    const object = properties => ({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
    const schema = object({authoredReportVersion:{type:'integer',enum:[1]},title:string,sections:{type:'array',items:object({
        id:string,type:{type:'string',enum:types},title:string,text:string,refs:strings,order:{type:'integer'},priority:{type:'string',enum:['primary','supporting']},
        claims:{type:'array',items:object({ref:string,relation:{type:'string',enum:relations}})},
        proposal:{anyOf:[{type:'null'},object({problem:string,objective:string,actions:strings,owner:string,days:{type:'integer',enum:[0,30,60,90]},monitoring:string,completion:string,foundation:{type:'string',enum:['direct','descriptive','investigation','preventive']}})]}
    })},chartIds:strings,limitations:strings});
    const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    function evidence(report) {
        const facts = {}, items = report.indicators.map((i,n) => {
            const s=i.estatisticas, d=report.intelligence?.dimensions?.find(d=>d.indicatorId===i.id), key='E'+n;
            const lastValid=s.mensais.filter(p=>p.valor!==null).at(-1)??null,last=s.mensais.at(-1)??null;
            const neutral=d?.measurement?.neutral===true||!['menor_melhor','maior_melhor'].includes(i.direcaoDesempenho);
            const outside=!neutral&&last&&last.valor!==null&&i.meta!==null?(i.direcaoDesempenho==='menor_melhor'?last.valor>i.meta:last.valor<i.meta):null;
            const fields={latest:last?.valor??null,target:i.meta,mean:s.media,delta:s.primeiroUltimo?.absoluta??null,percent:s.primeiroUltimo?.percentual??null};
            for(const [field,value] of Object.entries(fields))facts[key+'.'+field]={indicatorId:i.id,field,value,unit:field==='percent'?'%':i.unidade,competency:last?.competencia??null,direction:i.direcaoDesempenho,outside,neutral};
            return {key,id:i.id,name:i.indicador,sector:i.setor,unit:i.unidade,target:i.meta,direction:i.direcaoDesempenho,
                latest:last?{competency:last.competencia,value:last.valor}:null,lastValid:lastValid?{competency:lastValid.competencia,value:lastValid.valor}:null,mean:s.media,delta:fields.delta,percent:fields.percent,range:s.primeiroUltimo?{from:s.primeiroUltimo.de,to:s.primeiroUltimo.ate}:null,
                series:s.mensais.map(p=>({competency:p.competencia,value:p.valor})),outside,neutral,
                operational:d?.operational??null,measurement:d?.measurement??null};
        });
        return {version:1,basis:report.basis??null,snapshotUpdatedAt:report.snapshotUpdatedAt,period:[...report.competencias],type:report.type,sector:report.sector,items,facts,
            managementContext:report.managementContext?.shareWithAI?clone(report.managementContext):null,limitations:[...report.limitations]};
    }
    function checkSchema(value, spec=schema, path='$') {
        if(spec.anyOf)return spec.anyOf.some(s=>checkSchema(value,s,path).length===0)?[]:[path+':tipo'];
        if(spec.enum&&!spec.enum.includes(value))return [path+':enum'];
        if(spec.type==='null')return value===null?[]:[path+':null'];
        if(spec.type==='string')return typeof value==='string'&&value.length<=12000?[]:[path+':texto'];
        if(spec.type==='integer')return Number.isInteger(value)?[]:[path+':inteiro'];
        if(spec.type==='array')return Array.isArray(value)&&value.length<=40?value.flatMap((v,n)=>checkSchema(v,spec.items,path+'.'+n)):[path+':lista'];
        if(spec.type==='object'){
            if(!value||typeof value!=='object'||Array.isArray(value))return [path+':objeto'];
            return [...spec.required.filter(k=>!Object.hasOwn(value,k)).map(k=>path+'.'+k+':ausente'),...Object.keys(value).filter(k=>!Object.hasOwn(spec.properties,k)).map(k=>path+'.'+k+':extra'),...Object.keys(spec.properties).filter(k=>Object.hasOwn(value,k)).flatMap(k=>checkSchema(value[k],spec.properties[k],path+'.'+k))];
        }
        return [path+':schema'];
    }
    const format = value => value===null?'Ausente':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);
    function project(ref, pack) {
        if(!Object.hasOwn(pack.facts,ref))return null;const f=pack.facts[ref];
        const item=pack.items.find(i=>i.id===f.indicatorId);
        if(!item)return null;
        return `${item.name}: ${{latest:'resultado recente',target:'meta atual',mean:'média dos registros válidos',delta:'variação absoluta',percent:'variação percentual'}[f.field]} ${format(f.value)}${f.unit?' '+f.unit:''}${f.competency?' · '+f.competency:''}`;
    }
    function checkClaim(claim, pack) {
        if(!relations.includes(claim.relation))return false;
        if(!Object.hasOwn(pack.facts,claim.ref))return false;const f=pack.facts[claim.ref];
        if(claim.relation==='observed')return true;
        if(f.value===null)return false;
        if(['increase','decrease','stable'].includes(claim.relation))return f.field==='delta'&&(claim.relation==='increase'?f.value>0:claim.relation==='decrease'?f.value<0:f.value===0);
        if(['improved','worsened'].includes(claim.relation))return f.field==='delta'&&!f.neutral&&f.value!==0&&((f.direction==='menor_melhor'?f.value<0:f.value>0)===(claim.relation==='improved'));
        if(['above_mean','below_mean','equal_mean'].includes(claim.relation)){const mean=pack.facts[claim.ref.replace(/\.latest$/,'.mean')]?.value;return f.field==='latest'&&mean!==null&&mean!==undefined&&(claim.relation==='above_mean'?f.value>mean:claim.relation==='below_mean'?f.value<mean:f.value===mean);}
        return f.field==='latest'&&f.outside!==null&&(claim.relation==='outside_target'?f.outside:!f.outside);
    }
    // Free prose is editorial interpretation, never promoted to a verified numerical fact.
    // Numerical facts are placeholders resolved by deterministic projection, plus typed claims.
    function textIssues(text, refs, pack, kind='analysis') {
        const issues=[],tokens=[...text.matchAll(/\{\{([^{}]+)\}\}/g)];
        for(const [,ref] of tokens)if(!refs.includes(ref)||!pack.facts[ref])issues.push('referencia_textual');
        let prose=text.replace(/\{\{[^{}]+\}\}/g,'');
        if(['limitation','proposal'].includes(kind))prose=prose.replace(/\b(?:30|60|90|trinta|sessenta|noventa)\s+dias\b/gi,'prazo sugerido');
        if(['hypothesis','proposal','limitation'].includes(kind))prose=prose.replace(/\b(?:dois|duas|três|tres)\s+(?:etapas|frentes|eixos|pilares)\b/gi,'etapas propostas');
        if(/[\p{N}%]|\b(?:zero|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|quarenta|cinquenta|sessenta|noventa|cem|mil|por cento|metade|dobr\w*|triplic\w*)\b/iu.test(normalize(prose)))issues.push('numero_livre');
        if(/[<>]|https?:|javascript:|```/i.test(prose))issues.push('conteudo_nao_editorial');
        const n=normalize(prose);
        const causal=n.replace(/nao (?:e |ha )?(?:uma )?(?:causa|relacao causal|causalidade|efeito) comprovad[oa]/g,'limitação causal').replace(/nao (?:(?:e|sao|foi|foram) )?(?:comprova\w*|demonstra\w*|causad[oa])/g,'limitação causal');
        if(/causad[oa]|devido a|decorre de|comprovad|demonstrou que|provocou|resultou em|acidentes (?:ficaram|mais) graves/.test(causal)&&kind!=='hypothesis')issues.push('causalidade_nao_comprovada');
        if(/punir|demitir|sancionar|aplicar sanc|determina-se|condenar|ajuizar/.test(n))issues.push('decisao_nao_autorizada');
        if(/ignore (?:as |todas)|system prompt|api.key|segredo|token de sessao/.test(n))issues.push('instrucao_invalida');
        return issues;
    }
    // Paths are schema-owned names and indices only; never use model-supplied IDs/keys in logs.
    const pathKeys=new Set(['$','authoredReportVersion','title','sections','id','type','text','refs','order','priority','claims','ref','relation','proposal','problem','objective','actions','owner','days','monitoring','completion','foundation','chartIds','limitations','recommendations']);
    const safePath=path=>String(path).split(':')[0].split('.').map(k=>pathKeys.has(k)?k:/^\d{1,4}$/.test(k)?k:'?').slice(0,12).join('.');
    const comparisons=[[/aument\w*|cresceu|crescimento/,'increase'],[/diminui\w*|reducao|reduziu|caiu|queda/,'decrease'],[/permaneceu estavel/,'stable'],[/fora da meta/,'outside_target'],[/dentro da meta/,'within_target'],[/acima da media/,'above_mean'],[/abaixo da media/,'below_mean'],[/melhorou/,'improved'],[/piorou/,'worsened']];
    const comparisonText=text=>normalize(text).replace(/\b(?:nao (?:(?:e possivel|se pode) )?(?:afirmar|concluir|comprova\w*|inferir|demonstra\w*)|sem comprovar)(?: que)?(?: houve)?(?: uma)?\s+(?:reducao|aumento|melhora|piora)\b/g,'limitação');
    const tentative=text=>/propoe|propost|suger|recomend|objetiv|a fim de|poderia|hipotese|possibilidade|se aprov|para reduzir|para aumentar/.test(normalize(text))&&!/foi |houve |observad|registrou|apresentou/.test(normalize(text));
    function validate(document, pack, allowedRefs=null) {
        const structural=checkSchema(document),issues=[];
        const add=(section,codes,severity,path,stage)=>{if(codes.length)issues.push({section,codes:[...new Set(codes)],severity,path:safePath(path),stage});};
        if(structural.length){add(null,['schema_invalido'],'blocking',structural[0],'internal_schema_validation');return {valid:false,document:null,issues,structural:structural.map(safePath),acceptedSectionsCount:0,rejectedSectionsCount:Array.isArray(document?.sections)?document.sections.length:0,reviewableIssuesCount:0,fatalIssuesCount:1};}
        const result=clone(document),ids=new Set(),seen=new Set(),seenActions=new Set(),originalCount=result.sections.length;
        add(null,textIssues(result.title,[],pack),'blocking','$.title','evidence_validation');
        if(!result.title.trim()||result.title.length>100){add(null,['titulo_invalido'],'editorial','$.title','editorial_validation');if(!result.title.trim())result.title='Relatório gerencial';}
        if(!originalCount)add(null,['quantidade_secoes'],'blocking','$.sections','internal_schema_validation');
        else if(originalCount>10)add(null,['quantidade_secoes'],'review','$.sections','editorial_validation');
        result.sections=result.sections.filter((s,index)=>{
            const codes=[],review=[],editorial=[],refs=s.refs,path='$.sections.'+index;
            if(!/^[a-z][a-z0-9_-]{0,35}$/.test(s.id)||ids.has(s.id))codes.push('id_secao');ids.add(s.id);
            if(s.order!==index+1)editorial.push('ordem_invalida');
            if(!s.title.trim()||s.title.length>90){editorial.push('titulo_invalido');if(!s.title.trim())s.title='Seção para revisão';}
            if(!s.text.trim())codes.push('secao_vazia');
            if(refs.some(ref=>!Object.hasOwn(pack.facts,ref)||allowedRefs&&!allowedRefs.includes(ref)))codes.push('evidencia_inexistente');
            if(new Set(refs).size!==refs.length)editorial.push('referencia_repetida');
            if(s.claims.some(c=>!refs.includes(c.ref)||!checkClaim(c,pack)))codes.push('afirmacao_inconsistente');
            const fields=[s.title,s.text,...(s.proposal?[s.proposal.problem,s.proposal.objective,...s.proposal.actions,s.proposal.owner,s.proposal.monitoring,s.proposal.completion]:[])];
            fields.forEach((text,n)=>codes.push(...textIssues(text,refs,pack,n>1?'proposal':s.type)));
            if(fields.some(t=>t.length>1800))review.push('texto_longo');
            const sentences=[s.title,s.text,...fields.slice(2)].flatMap(t=>t.replace(/\{\{[^{}]+\}\}/g,'').split(/[.!?\n]+/)).filter(Boolean);
            let asserted=false;
            for(const sentence of sentences){const narrative=comparisonText(sentence);if(tentative(sentence))continue;
                for(const [pattern,relation] of comparisons)if(pattern.test(narrative)){asserted=true;if(!s.claims.some(c=>c.relation===relation&&checkClaim(c,pack)))codes.push('comparacao_sem_afirmacao_estruturada');}
                if(/(?:indicador|resultado|acidente|ocorrencia|registro|saldo|meta)/.test(narrative)&&/\b(?:houve|registrou|apresentou|ficou|atingiu|observad\w*|foi superior|foi inferior)\b/.test(narrative)){asserted=true;if(!s.claims.length)codes.push('afirmacao_sem_evidencia');}
                if(refs.length&&refs.every(ref=>pack.facts[ref]?.neutral)&&/melhorou|piorou|favoravel|desfavoravel|recuperacao comprovada/.test(narrative))codes.push('julgamento_sem_direcao');
            }
            const qualitative=s.type==='hypothesis'||Boolean(s.proposal)||/hipotese|orientacao|propost|sugest|recomenda|para avaliacao/.test(normalize(s.text));
            if(!refs.length&&(s.claims.length||asserted||!qualitative))codes.push('evidencia_inexistente');
            if(s.proposal&&(!s.proposal.actions.length||!s.proposal.problem.trim()||!s.proposal.objective.trim()||!s.proposal.monitoring.trim()||!s.proposal.completion.trim()))review.push('proposta_incompleta');
            if(s.proposal&&s.proposal.actions.every(a=>normalize(a).length<25||/^(acompanhar|avaliar resultados|sustentar tratativas|verificar o escopo)[.! ]*$/.test(normalize(a))))review.push('recomendacao_generica');
            if(s.proposal)for(const action of s.proposal.actions){const normalized=normalize(action);if(seenActions.has(normalized))review.push('repeticao');seenActions.add(normalized);}
            if(['recommendation','campaign','action','evolution'].includes(s.type)&&!s.proposal)review.push('proposta_ausente');
            if(/^(acompanhar|verificar o escopo|avaliar as proximas competencias)[.! ]*$/.test(normalize(s.text)))review.push('texto_generico');
            if(seen.has(normalize(s.text)))review.push('repeticao');seen.add(normalize(s.text));
            add(s.id,codes,'blocking',path,'evidence_validation');add(s.id,review,'review',path,'editorial_validation');add(s.id,editorial,'editorial',path,'editorial_validation');
            return !codes.length;
        });
        if(result.chartIds.some(key=>!pack.items.some(i=>i.key===key)||allowedRefs&&!allowedRefs.some(ref=>ref.startsWith(key+'.'))))add(null,['grafico_inexistente'],'blocking','$.chartIds','evidence_validation');
        result.limitations.forEach((text,index)=>{const unsupported=comparisons.some(([pattern])=>pattern.test(comparisonText(text))&&!tentative(text));add(null,[...textIssues(text,[],pack,'limitation'),...(unsupported?['afirmacao_sem_evidencia']:[])],'blocking','$.limitations.'+index,'evidence_validation');if(text.length>1800)add(null,['texto_longo'],'review','$.limitations.'+index,'editorial_validation');});
        const blocking=issues.filter(i=>i.severity==='blocking'),fatal=blocking.some(i=>i.section===null)||!result.sections.length;
        result.sections.forEach((s,index)=>s.order=index+1);
        return {valid:!blocking.length&&!fatal,document:fatal?null:result,issues,structural:[],acceptedSectionsCount:result.sections.length,rejectedSectionsCount:originalCount-result.sections.length,reviewableIssuesCount:issues.filter(i=>i.severity!=='blocking').length,fatalIssuesCount:blocking.length,reviewRequired:issues.some(i=>i.severity!=='blocking')};
    }
    function resolve(text, pack) {return text.replace(/\{\{([^{}]+)\}\}/g,(_,ref)=>project(ref,pack)??'[Referência indisponível]');}
    function lines(section, pack) {
        const p=section.proposal;
        return [resolve(section.text,pack),...section.claims.map(c=>project(c.ref,pack)+' · '+({observed:'observação',increase:'aumento descritivo',decrease:'redução descritiva',stable:'estabilidade',within_target:'dentro da meta',outside_target:'fora da meta',above_mean:'acima da média',below_mean:'abaixo da média',equal_mean:'igual à média',improved:'melhora descritiva pela direção cadastrada',worsened:'piora descritiva pela direção cadastrada'}[c.relation])),
            ...(p?['Sugestão para avaliação: '+resolve(p.problem,pack),'Objetivo sugerido: '+resolve(p.objective,pack),...p.actions.map(a=>'Ação sugerida: '+resolve(a,pack)),'Área sugerida: '+resolve(p.owner,pack),p.days?'Horizonte sugerido: até '+p.days+' dias.':'Prazo a pactuar.','Monitoramento: '+resolve(p.monitoring,pack),'Conclusão proposta: '+resolve(p.completion,pack)]:[])];
    }
    globalThis.ReportAuthoredCore={schema,types,relations,evidence,validate,checkSchema,checkClaim,textIssues,project,resolve,lines,clone,safePath};
})();
