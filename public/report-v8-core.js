// Shared V8 evidence and presentation rules. The Edge copy is verified in tests.
(() => {
    const clone = value => JSON.parse(JSON.stringify(value));
    const normalize = text => text.normalize('NFKC').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    function idKey(indicator) {
        const {id,indicador,setor,unidade}=indicator;
        const stable=typeof id==='number'&&Number.isSafeInteger(id)
            || typeof id==='string'&&id.length>0&&!/^indice:\d+$/.test(id);
        const identity=JSON.stringify(stable?['id',id]:['legacy',indicador,setor,unidade]);
        // Stable local identity, not a secret or an authorization mechanism.
        let hash=14695981039346656037n;
        for(const byte of new TextEncoder().encode(identity))hash=BigInt.asUintN(64,(hash^BigInt(byte))*1099511628211n);
        return 'K'+hash.toString(16).padStart(16,'0');
    }
    const privateData = text => /[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11,14}\b|\b[A-Z]{3}[- ]?\d[A-Z\d]\d{2}\b|\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/i.test(text);
    const fmt = value => value == null ? 'indisponível' : new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 2}).format(value);
    const objectKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
        && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
    const types = ['summary','integrated','action','conclusion'];
    const horizons = [30,60,90];
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
            const fact = {
                key, id: indicator.id, name: indicator.indicador, sector: indicator.setor, unit: indicator.unidade,
                period: [report.competencias[0], report.competencias.at(-1)], target: s.meta, direction: s.direcao,
                latest: d?.recent ? {competency: d.recent.competencia, value: d.recent.valor} : null,
                lastValid: d?.recent?.valor === null && d.last ? {competency: d.last.competencia, value: d.last.valor} : null,
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
        return [
            fact.name + (latest ? ' · '+latest.competency : '')+' · resultado '+fmt(latest?.value)+(fact.unit ? ' '+fact.unit : ''),
            'meta atual '+fmt(fact.target), fact.performance,
            change ? 'variação descritiva de '+change.de+' a '+change.ate+': '+fmt(change.absoluta) : null
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
        const str = (value, max) => typeof value==='string' && value.trim().length>0 && value.length<=max;
        const shape = objectKeys(document,['title','sections','chartIds','limitations'])
            && str(document.title,100) && Array.isArray(document.sections) && document.sections.length>0 && document.sections.length<=16
            && Array.isArray(document.chartIds) && document.chartIds.length===0
            && Array.isArray(document.limitations) && document.limitations.length<=8 && document.limitations.every(text=>str(text,1000))
            && document.sections.every(section=>objectKeys(section,sectionShape) && types.includes(section.type)
                && str(section.title,90) && str(section.text,1800) && typeof section.id==='string' && /^v8-[a-z]+-\d{1,2}$/.test(section.id)
                && ['primary','supporting'].includes(section.priority)
                && (section.type==='action' ? [0,...horizons].includes(section.days) : section.days===0)
                && Array.isArray(section.refs) && section.refs.length<=8 && section.refs.every(key=>typeof key==='string'));
        if(!shape){add(null,['schema_invalido']);return {valid:false,document:null,issues};}
        add(null,inspectText(document.title,[],pack));
        for(const text of document.limitations)add(null,inspectText(text,[],pack));
        const seen=new Set();
        document.sections.forEach((s,index)=>{
            if(seen.has(s.id)||s.order!==index+1)add(s.id,['schema_invalido']);
            seen.add(s.id);
            const badRefs = s.refs.some(key=>!Object.hasOwn(pack.facts,key));
            if(badRefs || new Set(s.refs).size!==s.refs.length || s.type==='integrated'&&!s.refs.length)add(s.id,['evidencia_inexistente']);
            add(s.id,[...inspectText(s.title,s.refs,pack),...inspectText(s.text,s.refs,pack)]);
            if(/\b(?:houve|registrou|registraram|aumentou|aumentaram|reduziu|reduziram|diminuiu|diminuiram|melhorou|melhoraram|piorou|pioraram|ficou|atingiu|observad\w*)\b/i.test(normalize(s.text)))
                add(s.id,['verificar_interpretacao'],'review');
        });
        const valid=!issues.some(issue=>issue.severity==='blocking');
        return {valid,document:valid?clone(document):null,issues};
    }
    function lines(section, pack) {
        const label = section.type==='action' ? 'Proposta para avaliação da gestão' : 'Interpretação gerencial revisável';
        return [label+' · '+section.text,
            ...(section.days ? ['Horizonte sugerido pelo sistema · '+section.days+' dias'] : []),
            ...section.refs.map(key=>project(key,pack)).filter(Boolean).map(line=>'Evidência oficial · '+line)];
    }
    globalThis.ReportV8Core = {evidence,validate,project,lines,clone,resolve:text=>text,privateData};
})();
