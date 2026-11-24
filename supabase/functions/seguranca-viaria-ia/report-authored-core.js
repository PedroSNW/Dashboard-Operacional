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
    function claimIssue(claim, pack) {
        const relation=claim.relation;
        if(!relations.includes(relation))return 'claim_relation_unsupported';
        if(!Object.hasOwn(pack.facts,claim.ref))return 'unknown_ref';
        const fact=pack.facts[claim.ref];
        if(relation==='observed')return null; // The deterministic projection may say “Ausente”.
        const trend=['increase','decrease','stable','improved','worsened'].includes(relation);
        if(fact.field!==(trend?'delta':'latest'))return 'claim_field_mismatch';
        const target=relation==='outside_target'||relation==='within_target';
        const performance=target||['improved','worsened'].includes(relation);
        if(performance&&(fact.neutral||!['menor_melhor','maior_melhor'].includes(fact.direction)))return 'claim_direction_not_validated';
        if(!Number.isFinite(fact.value))return 'claim_value_missing';
        let matches;
        if(trend){
            const improved=fact.direction==='menor_melhor'?fact.value<0:fact.value>0;
            matches={increase:fact.value>0,decrease:fact.value<0,stable:fact.value===0,improved,worsened:!improved}[relation];
            if(performance&&fact.value===0)matches=false;
        }else if(target){
            if(typeof fact.outside!=='boolean')return 'claim_value_missing';
            matches=relation==='outside_target'?fact.outside:!fact.outside;
        }else{
            const mean=pack.facts[claim.ref.replace(/\.latest$/,'.mean')]?.value;
            if(!Number.isFinite(mean))return 'claim_value_missing';
            matches={above_mean:fact.value>mean,below_mean:fact.value<mean,equal_mean:fact.value===mean}[relation];
        }
        return matches?null:'claim_relation_factually_false';
    }
    const checkClaim=(claim,pack)=>claimIssue(claim,pack)===null;
    // Free prose is editorial interpretation, never promoted to a verified numerical fact.
    // Numerical facts are placeholders resolved by deterministic projection, plus typed claims.
    function textIssues(text, refs, pack, kind='analysis', days=null) {
        const issues=[],tokens=[...text.matchAll(/\{\{([^{}]+)\}\}/g)];
        for(const [,ref] of tokens)if(!refs.includes(ref)||!pack.facts[ref])issues.push('referencia_textual');
        let prose=text.replace(/\{\{[^{}]+\}\}/g,'');
        if(kind==='limitation'||days!==null){
            prose=prose.replace(/\b((?:prazo|horizonte)\s+(?:proposto|sugerido)\s*(?::|de)\s*(?:até\s+)?)(30|60|90|trinta|sessenta|noventa)\s+dias\b(?!\s+de\b)/gi,(full,label,duration)=>{
                const number={trinta:30,sessenta:60,noventa:90}[duration.toLowerCase()]??Number(duration);
                return kind==='limitation'||number===days?label+'prazo administrativo':full;
            });
        }
        if(/[\p{N}%]|\b(?:zero|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|quarenta|cinquenta|sessenta|noventa|cem|mil|por cento|metade|dobr\w*|triplic\w*)\b/iu.test(normalize(prose)))issues.push('numero_livre');
        if(/[<>]|https?:|javascript:|```/i.test(prose))issues.push('conteudo_nao_editorial');
        const n=normalize(prose);
        const causal=n.replace(/nao (?:e |ha )?(?:uma )?(?:causa|relacao causal|causalidade|efeito) comprovad[oa]/g,'limitação causal').replace(/nao (?:(?:e|sao|foi|foram) )?(?:comprova\w*|demonstra\w*|causad[oa])/g,'limitação causal');
        const causalAssertion=causal.replace(/\b(?:pode|poderia)\s+(?:ter sido causad[oa]|decorrer|resultar)\b/g,'possibilidade');
        if(/causad[oa]|devido a|decorre de|comprovad|demonstrou que|provocou|resultou em|causou|explica a|acidentes (?:ficaram|mais) graves/.test(causalAssertion))issues.push('causalidade_nao_comprovada');
        if(/punir|demitir|sancionar|aplicar sanc|determina-se|condenar|ajuizar/.test(n))issues.push('decisao_nao_autorizada');
        if(/ignore (?:as |todas)|system prompt|api.key|segredo|token de sessao/.test(n))issues.push('instrucao_invalida');
        return issues;
    }
    // Paths are schema-owned names and indices only; never use model-supplied IDs/keys in logs.
    const pathKeys=new Set(['$','authoredReportVersion','title','sections','id','type','text','refs','order','priority','claims','ref','relation','proposal','problem','objective','actions','owner','days','monitoring','completion','foundation','chartIds','limitations','recommendations']);
    const safePath=path=>String(path).split(':')[0].split('.').map(k=>pathKeys.has(k)?k:/^\d{1,4}$/.test(k)?k:'?').slice(0,12).join('.');
    const comparisons=[[/aument\w*|cresceu|crescimento/,'increase'],[/diminui\w*|reducao|reduziu|caiu|queda/,'decrease'],[/permaneceu estavel/,'stable'],[/fora da meta/,'outside_target'],[/dentro da meta/,'within_target'],[/acima da media/,'above_mean'],[/abaixo da media/,'below_mean'],[/melhorou/,'improved'],[/piorou/,'worsened']];
    const comparisonText=text=>normalize(text).replace(/\b(?:nao (?:(?:e possivel|se pode) )?(?:afirmar|concluir|comprova\w*|inferir|demonstra\w*)|sem comprovar)(?: que)?(?: houve)?(?: uma)?\s+(?:reducao|aumento|melhora|piora)\b/g,'limitação');
    // Remove prospective verbs, not the sentence around them. An observed result
    // in the same sentence must still be checked.
    const maskObjectives=text=>text.replace(/\b(?:para|a fim de|objetivo de|visando)\s+(?:reduzir|diminuir|aumentar|melhorar)\b/g,' para atuar')
        .replace(/^(\s*(?:proposta de\s+)?)(?:reduzir|diminuir|aumentar|melhorar)\b/,'$1atuar')
        .replace(/\b(?:avaliar|investigar|verificar) se (?:houve|ocorreu) (?:uma )?(?:reducao|aumento|queda|melhora|piora)\b/g,'investigar a evolução');
    const tentative=text=>/^(?:\s*)(?:propoe-se|sugere-se|recomenda-se|se aprov)/.test(normalize(text))&&!/foi |houve |observad|registrou|apresentou/.test(normalize(text));
    function referenceDiagnostic(section, index, pack, allowed) {
        const diagnostic={sectionIndex:index,sectionType:types.includes(section.type)?section.type:null,
            referenceCount:section.refs.length,recognizedReferenceCount:0,unknownReferenceCount:0,
            outOfScopeReferenceCount:0,malformedReferenceCount:0,invalidClaimsCount:0,
            referenceState:section.refs.length?'present':'empty',codes:[],claimIssues:[]};
        const classify=ref=>{
            if(!/^E(?:0|[1-9]\d*)\.[a-zA-Z][a-zA-Z0-9_]*$/.test(ref))return 'invalid_ref_format';
            if(!Object.hasOwn(pack.facts,ref))return 'unknown_ref';
            if(!allowed.has(ref))return 'ref_not_sent';
            return null;
        };
        const addClaimIssue=(claimIndex,ref,codes)=>diagnostic.claimIssues.push({
            claimIndex,referenceExists:ref!==null&&Object.hasOwn(pack.facts,ref),
            referenceSent:ref!==null&&allowed.has(ref),inSection:ref!==null&&section.refs.includes(ref),codes
        });
        for(const ref of section.refs){
            const code=classify(ref);
            if(code==='invalid_ref_format')diagnostic.malformedReferenceCount++;
            else if(code==='unknown_ref')diagnostic.unknownReferenceCount++;
            else if(code==='ref_not_sent')diagnostic.outOfScopeReferenceCount++;
            else diagnostic.recognizedReferenceCount++;
            if(code)diagnostic.codes.push(code);
        }
        for(const [claimIndex,claim] of section.claims.entries()){
            const scopeIssue=classify(claim.ref);
            const inSection=section.refs.includes(claim.ref);
            const factualIssue=scopeIssue?null:claimIssue(claim,pack);
            const codes=[scopeIssue,!inSection?'claim_ref_not_in_section':null,factualIssue].filter(Boolean);
            if(codes.length){
                diagnostic.invalidClaimsCount++;
                diagnostic.codes.push(...codes);
                addClaimIssue(claimIndex,claim.ref,codes);
            }
        }
        return diagnostic;
    }
    function validate(document, pack, allowedRefs=null, {groqGeneration=false}={}) {
        const structural=checkSchema(document),issues=[];
        const add=(section,codes,severity,path,stage)=>{if(codes.length)issues.push({section,codes:[...new Set(codes)],severity,path:safePath(path),stage});};
        if(structural.length){add(null,['schema_invalido'],'blocking',structural[0],'internal_schema_validation');return {valid:false,document:null,issues,structural:structural.map(safePath),acceptedSectionsCount:0,rejectedSectionsCount:Array.isArray(document?.sections)?document.sections.length:0,reviewableIssuesCount:0,fatalIssuesCount:1};}
        const result=clone(document),ids=new Set(),seen=new Set(),seenActions=new Set(),originalCount=result.sections.length;
        const allowed=new Set(allowedRefs??Object.keys(pack.facts)),sectionEvidenceDiagnostics=[];
        const titleIssues=textIssues(result.title,[],pack);
        add(null,titleIssues,'blocking','$.title','evidence_validation');
        if(groqGeneration&&titleIssues.length)result.title='Relatório gerencial';
        if(!result.title.trim()||result.title.length>100){add(null,['titulo_invalido'],'editorial','$.title','editorial_validation');if(!result.title.trim())result.title='Relatório gerencial';}
        if(!originalCount)add(null,['quantidade_secoes'],'blocking','$.sections','internal_schema_validation');
        else if(originalCount>10)add(null,['quantidade_secoes'],'review','$.sections','editorial_validation');
        result.sections=result.sections.filter((s,index)=>{
            const codes=[],review=[],editorial=[],refs=s.refs,path='$.sections.'+index;
            if(!/^[a-z][a-z0-9_-]{0,35}$/.test(s.id)||ids.has(s.id))codes.push('id_secao');ids.add(s.id);
            if(s.order!==index+1)editorial.push('ordem_invalida');
            if(!s.title.trim()||s.title.length>90){editorial.push('titulo_invalido');if(!s.title.trim())s.title='Seção para revisão';}
            if(!s.text.trim())codes.push('secao_vazia');
            // The claim already names an exact fact. Attach it only when the same
            // indicator is already cited and the independent claim check passes.
            let repairedClaimRefs=0;
            if(groqGeneration&&refs.length){
                const citedKeys=new Set(refs.filter(ref=>allowed.has(ref)).map(ref=>ref.split('.')[0]));
                for(const claim of s.claims){
                    if(!refs.includes(claim.ref)&&refs.length<40&&allowed.has(claim.ref)&&citedKeys.has(claim.ref.split('.')[0])&&checkClaim(claim,pack)){
                        refs.push(claim.ref);
                        repairedClaimRefs++;
                    }
                }
            }
            if(repairedClaimRefs)editorial.push('claim_ref_attached');
            const evidenceDiagnostic=referenceDiagnostic(s,index,pack,allowed);
            codes.push(...evidenceDiagnostic.codes);
            if(new Set(refs).size!==refs.length)editorial.push('referencia_repetida');
            const fields=[s.title,s.text,...(s.proposal?[s.proposal.problem,s.proposal.objective,...s.proposal.actions,s.proposal.owner,s.proposal.monitoring,s.proposal.completion]:[])];
            fields.forEach((text,n)=>codes.push(...textIssues(text,refs,pack,n>1?'proposal':s.type,s.proposal?.days??null)));
            if(fields.some(t=>t.length>1800))review.push('texto_longo');
            if(s.type==='hypothesis'&&/\b(?:pode|poderia)\b.{0,45}\b(?:caus\w*|relacionad\w*|decorrer|resultar)\b/.test(normalize(s.text)))review.push('hipotese_causal_para_revisao');
            const sentences=fields.flatMap(t=>t.replace(/\{\{([^{}]+)\}\}/g,(_,ref)=>' '+ref.replace('.','_')+' ').split(/[.!?;\n]+|\bcontrasta com\b|\benquanto\b/i)).filter(Boolean);
            let asserted=false;
            for(const sentence of sentences){
                const narrative=maskObjectives(comparisonText(sentence));
                const names=pack.items.filter(item=>{
                    const name=normalize(item.name);
                    const index=narrative.indexOf(name);
                    return (name.length>3&&index>=0&&!/\w/.test(narrative[index-1]??'')&&!/\w/.test(narrative[index+name.length]??''))||new RegExp('\\b'+item.key.toLowerCase()+'_[a-z]+\\b').test(narrative);
                });
                if(/\b(?:superou|ultrapassou|maior que|menor que|superior a|inferior a)\b/.test(narrative)&&names.length>1){asserted=true;codes.push('comparacao_entre_indicadores');}
                for(const [pattern,relation] of comparisons)if(pattern.test(narrative)){
                    asserted=true;
                    const matching=s.claims.filter(c=>c.relation===relation&&checkClaim(c,pack));
                    if(names.length?!names.every(item=>matching.some(c=>c.ref.startsWith(item.key+'.'))):!matching.length)codes.push('comparacao_sem_afirmacao_estruturada');
                }
                if(/(?:indicador|resultado|acidente|ocorrencia|registro|saldo|meta)/.test(narrative)&&/\b(?:houve|registrou|apresentou|ficou|atingiu|observad\w*|foi superior|foi inferior)\b/.test(narrative)){asserted=true;if(!s.claims.length)codes.push('afirmacao_sem_evidencia');}
                if(refs.length&&refs.every(ref=>pack.facts[ref]?.neutral)&&/melhorou|piorou|favoravel|desfavoravel|recuperacao comprovada/.test(narrative))codes.push('julgamento_sem_direcao');
            }
            const qualitative=s.type==='hypothesis'||Boolean(s.proposal)||/hipotese|orientacao|propost|sugest|recomenda|para avaliacao/.test(normalize(s.text));
            const hasPlaceholder=fields.some(text=>/\{\{[^{}]+\}\}/.test(text));
            if(!refs.length&&(s.claims.length||asserted||!qualitative||hasPlaceholder))codes.unshift('missing_refs');
            if(codes.length||!refs.length||repairedClaimRefs){
                evidenceDiagnostic.repairedClaimRefs=repairedClaimRefs;
                evidenceDiagnostic.codes=codes.length?[...new Set(codes)]:[refs.length?'claim_ref_attached':'qualitative_section_without_ref'];
                sectionEvidenceDiagnostics.push(evidenceDiagnostic);
            }
            if(s.proposal&&(!s.proposal.actions.length||!s.proposal.problem.trim()||!s.proposal.objective.trim()||!s.proposal.monitoring.trim()||!s.proposal.completion.trim()))review.push('proposta_incompleta');
            if(s.proposal&&s.proposal.actions.every(a=>normalize(a).length<25||/^(acompanhar|avaliar resultados|sustentar tratativas|verificar o escopo)[.! ]*$/.test(normalize(a))))review.push('recomendacao_generica');
            if(s.proposal)for(const action of s.proposal.actions){const normalized=normalize(action);if(seenActions.has(normalized))review.push('repeticao');seenActions.add(normalized);}
            if(['recommendation','campaign','action','evolution'].includes(s.type)&&!s.proposal)review.push('proposta_ausente');
            if(/^(acompanhar|verificar o escopo|avaliar as proximas competencias)[.! ]*$/.test(normalize(s.text)))review.push('texto_generico');
            if(seen.has(normalize(s.text)))review.push('repeticao');seen.add(normalize(s.text));
            add(s.id,codes,'blocking',path,'evidence_validation');add(s.id,review,'review',path,'editorial_validation');add(s.id,editorial,'editorial',path,'editorial_validation');
            return !codes.length;
        });
        const chartKeys=new Set([...allowed].map(ref=>ref.split('.')[0]));
        const validCharts=result.chartIds.filter(key=>chartKeys.has(key));
        if(validCharts.length!==result.chartIds.length)add(null,['grafico_inexistente'],'blocking','$.chartIds','evidence_validation');
        if(groqGeneration)result.chartIds=validCharts;
        const validLimitations=result.limitations.filter((text,index)=>{
            const unsupported=comparisons.some(([pattern])=>pattern.test(comparisonText(text))&&!tentative(text));
            const codes=[...textIssues(text,[],pack,'limitation'),...(unsupported?['afirmacao_sem_evidencia']:[])];
            add(null,codes,'blocking','$.limitations.'+index,'evidence_validation');
            if(text.length>1800)add(null,['texto_longo'],'review','$.limitations.'+index,'editorial_validation');
            return !codes.length;
        });
        if(groqGeneration)result.limitations=validLimitations;
        const blocking=issues.filter(i=>i.severity==='blocking'),fatal=!result.sections.length||!groqGeneration&&blocking.some(i=>i.section===null);
        result.sections.forEach((s,index)=>s.order=index+1);
        return {valid:!blocking.length&&!fatal,document:fatal?null:result,issues,structural:[],sectionEvidenceDiagnostics,acceptedSectionsCount:result.sections.length,rejectedSectionsCount:originalCount-result.sections.length,reviewableIssuesCount:issues.filter(i=>i.severity!=='blocking').length,fatalIssuesCount:blocking.length,reviewRequired:issues.some(i=>i.severity!=='blocking')};
    }
    function resolve(text, pack) {return text.replace(/\{\{([^{}]+)\}\}/g,(_,ref)=>project(ref,pack)??'[Referência indisponível]');}
    function lines(section, pack) {
        const p=section.proposal;
        return [resolve(section.text,pack),...section.claims.map(c=>project(c.ref,pack)+' · '+({observed:'observação',increase:'aumento descritivo',decrease:'redução descritiva',stable:'estabilidade',within_target:'dentro da meta',outside_target:'fora da meta',above_mean:'acima da média',below_mean:'abaixo da média',equal_mean:'igual à média',improved:'melhora descritiva pela direção cadastrada',worsened:'piora descritiva pela direção cadastrada'}[c.relation])),
            ...(p?['Sugestão para avaliação: '+resolve(p.problem,pack),'Objetivo sugerido: '+resolve(p.objective,pack),...p.actions.map(a=>'Ação sugerida: '+resolve(a,pack)),'Área sugerida: '+resolve(p.owner,pack),p.days?'Horizonte sugerido: até '+p.days+' dias.':'Prazo a pactuar.','Monitoramento: '+resolve(p.monitoring,pack),'Conclusão proposta: '+resolve(p.completion,pack)]:[])];
    }
    globalThis.ReportAuthoredCore={schema,types,relations,evidence,validate,checkSchema,checkClaim,claimIssue,textIssues,project,resolve,lines,clone,safePath,referenceDiagnostic};
})();
