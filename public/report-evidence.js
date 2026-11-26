// Shared evidence and editorial review. The Edge copy is verified in tests.
(() => {
    const clone = value => JSON.parse(JSON.stringify(value));
    const normalize = text => text.normalize('NFKC').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    function idKey(indicator) {
        const {id,indicador,setor,unidadeCadastro=indicator.unidade}=indicator;
        const stable=typeof id==='number'&&Number.isSafeInteger(id)
            || typeof id==='string'&&id.length>0&&!/^indice:\d+$/.test(id);
        const identity=JSON.stringify(stable?['id',id]:['legacy',indicador,setor,unidadeCadastro]);
        // Stable local identity, not a secret or an authorization mechanism.
        let hash=14695981039346656037n;
        for(const byte of new TextEncoder().encode(identity))hash=BigInt.asUintN(64,(hash^BigInt(byte))*1099511628211n);
        return 'K'+hash.toString(16).padStart(16,'0');
    }
    const privateData = text => /[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11,14}\b|\b[A-Z]{3}[- ]?\d[A-Z\d]\d{2}\b|\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/i.test(text);
    const fmt = value => value == null ? 'indisponível' : new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 2}).format(value);
    const objectKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
        && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
    const types = ['summary','integrated','hypothesis','action','conclusion'];
    const horizons = [30,60,90];
    const actionMethods = Object.freeze({
        post:'Post', stories:'Stories', campanha:'Campanha', flyer:'Flyer',
        dds:'DDS', comunicado:'Comunicado interno', checklist:'Checklist', processo:'Ajuste de processo',
    });
    function evidence(report, allowed = null) {
        const facts = Object.create(null), items = [];
        const dimensions = new Map((report.intelligence?.dimensions ?? []).map(item => [item.indicatorId, item]));
        const scope = allowed && new Set(allowed);
        const identities=report.indicators.map(indicator=>[idKey(indicator),indicator]);
        const counts=new Map();
        for(const [key] of identities)counts.set(key,(counts.get(key)??0)+1);
        for (const [key,indicator] of identities) {
            if (counts.get(key)!==1 || scope && !scope.has(key) || typeof indicator.indicador!=='string'
                || privateData([indicator.indicador, indicator.setor, indicator.unidade].join(' '))) continue;
            const d = dimensions.get(indicator.id), s = indicator.estatisticas;
            const recent = s.mensais.at(-1), previous = s.mensais.at(-2);
            const last = s.mensais.findLast(p => p.valor !== null);
            const fact = {
                key, id: indicator.id, name: indicator.indicador, sector: indicator.setor, unit: indicator.unidade,
                period: [report.competencias[0], report.competencias.at(-1)], target: s.meta, targetStatus: indicator.targetStatus, direction: s.direcao,
                latest: recent ? {competency: recent.competencia, value: recent.valor, state: recent.estado} : null,
                lastValid: recent?.valor === null && last ? {competency: last.competencia, value: last.valor} : null,
                monthChange: recent?.variacaoAnterior ? {from: previous.competencia, previous: previous.valor, ...recent.variacaoAnterior} : null,
                targetDeviation: recent?.desvioMeta ?? null,
                change: s.primeiroUltimo, performance: d?.performance ?? null, trend: d?.trend ?? null,
                measurement: d?.measurement ?? null, governance: d?.operational?.validated ? d.operational : null,
                limitations: d?.caveats ?? []
            };
            items.push(fact);
            facts[key] = fact;
        }
        return {items, facts};
    }
    function project(key, pack) {
        const fact = Object.hasOwn(pack.facts, key) ? pack.facts[key] : null;
        if (!fact) return null;
        const latest = fact.latest;
        const change = fact.change;
        const delta = d => fmt(d.absoluta)+(d.percentual==null?'':' ('+fmt(d.percentual)+'%)');
        return [
            fact.name + (latest ? ' · '+latest.competency : '')+' · '+(latest?.value===0?'zero registrado':'resultado '+fmt(latest?.value))+(latest?.value!=null&&fact.unit ? ' '+fact.unit : ''),
            fact.targetStatus==='zero_unconfirmed'?'meta zero a confirmar':fact.target==null?'meta não cadastrada':fact.target===0?'meta zero confirmada':'meta atual '+fmt(fact.target),
            fact.targetDeviation ? 'desvio da meta '+delta(fact.targetDeviation) : null, fact.performance,
            latest?.value == null && fact.lastValid ? 'último dado disponível em '+fact.lastValid.competency+': '+fmt(fact.lastValid.value)+(fact.unit ? ' '+fact.unit : '') : null,
            fact.monthChange ? 'vs. mês anterior ('+fact.monthChange.from+') '+delta(fact.monthChange) : null,
            change ? 'de '+change.de+' a '+change.ate+' '+delta(change) : null
        ].filter(Boolean).join(' · ');
    }
    function inspectText(text, refs, pack) {
        const n = normalize(text);
        const codes = [];
        if (/\p{N}|%|\br\$|\b(?:zero|um milhao|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|mil|milhoes|dobrou|triplicou|metade|por cento)\b/u.test(n)) codes.push('numero_livre');
        if (privateData(text) || /[<>{}\u202a-\u202e\u2066-\u2069]|https?:|javascript:|ignore (?:as|todas)|api.key|system prompt|token de sessao/.test(n)) codes.push('conteudo_nao_editorial');
        const claims = n.replace(/\bnao (?:comprova\w*|demonstra\w*|permite concluir)\b/g, 'sem confirmação');
        if (/\b(?:causou|provocou|foi causad[oa]|devido a|decorre de|demonstrou que|comprova que)\b/.test(claims)) codes.push('causalidade_nao_comprovada');
        if (/\b(?:saldo|financeir\w*|prejuiz\w*)\b/.test(n) && /\b(?:somad\w*|soma|totaliz\w*)\b/.test(n)) codes.push('soma_financeira');
        if (/\b(?:melhorou|melhoraram|piorou|pioraram|ganho comprovado|recuperacao comprovada)\b/.test(n)
            && (refs.some(key=>pack.facts[key]?.measurement?.neutral)
                || pack.items.some(fact=>fact.measurement?.neutral && normalize(fact.name).length>3 && n.includes(normalize(fact.name)))
                || !refs.length && /\b(?:saldo|financeir\w*)\b/.test(n))) codes.push('julgamento_sem_direcao');
        return codes;
    }
    function validate(document, pack) {
        const issues = [], add = (section, codes, severity='blocking') => { if(codes.length) issues.push({section,codes:[...new Set(codes)],severity}); };
        const sectionShape = ['id','type','title','text','refs','order','priority','days'];
        const actionShape = [...sectionShape,'owner','followUp'];
        const str = (value, max) => typeof value==='string' && value.trim().length>0 && value.length<=max;
        const hasActionFields = section => section?.type==='action' && str(section.owner,100) && str(section.followUp,420)
            && (objectKeys(section,actionShape) || objectKeys(section,[...actionShape,'method','audience'])
                && typeof section.method==='string' && Object.hasOwn(actionMethods,section.method) && str(section.audience,100));
        const shape = objectKeys(document,['title','sections'])
            && str(document.title,100) && Array.isArray(document.sections) && document.sections.length>0 && document.sections.length<=16
            && document.sections.every(section=>(objectKeys(section,sectionShape)||hasActionFields(section)) && types.includes(section.type)
                && str(section.title,90) && str(section.text,1800) && typeof section.id==='string' && /^section-\d{1,2}$/.test(section.id)
                && ['primary','supporting'].includes(section.priority)
                && (section.type==='action' ? [0,...horizons].includes(section.days) : section.days===0)
                && Array.isArray(section.refs) && section.refs.length<=8 && section.refs.every(key=>typeof key==='string'));
        if(!shape){add(null,['schema_invalido']);return {valid:false,document:null,issues};}
        add(null,inspectText(document.title,[],pack));
        const seen=new Set();
        document.sections.forEach((s,index)=>{
            if(seen.has(s.id)||s.order!==index+1)add(s.id,['schema_invalido']);
            seen.add(s.id);
            const badRefs = s.refs.some(key=>!Object.hasOwn(pack.facts,key));
            if(badRefs || new Set(s.refs).size!==s.refs.length || ['integrated','hypothesis'].includes(s.type)&&!s.refs.length)add(s.id,['evidencia_inexistente']);
            const texts = [s.title,s.text,...(s.owner ? [s.owner,s.followUp] : []),...(s.audience ? [s.audience] : [])];
            add(s.id,texts.flatMap(text=>inspectText(text,s.refs,pack)));
            if(/\b(?:houve|registrou|registraram|aumentou|aumentaram|reduziu|reduziram|diminuiu|diminuiram|melhorou|melhoraram|piorou|pioraram|ficou|atingiu|observad\w*)\b/i.test(normalize(s.text)))
                add(s.id,['verificar_interpretacao'],'review');
        });
        const valid=!issues.some(issue=>issue.severity==='blocking');
        return {valid,document:valid?clone(document):null,issues};
    }
    function lines(section, pack) {
        return [(section.type==='hypothesis' ? 'Hipótese a verificar · ' : '')+section.text,
            ...(section.method ? ['Formato · '+actionMethods[section.method], 'Público · '+section.audience] : []),
            ...(section.owner ? ['Área sugerida · '+section.owner] : []),
            ...(section.days ? ['Prazo sugerido · '+section.days+' dias'] : section.type==='action' ? ['Prazo a pactuar'] : []),
            ...(section.followUp ? ['Como acompanhar · '+section.followUp] : []),
            ...section.refs.map(key=>project(key,pack)).filter(Boolean).map(line=>'Evidência oficial · '+line)];
    }
    globalThis.ReportEvidence = {evidence,validate,project,lines,clone,privateData,actionMethods};
})();
