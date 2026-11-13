// Sem dependências e sem acesso ao banco. Recebe somente o snapshot verificado.
export function scopeAnalysis(context, prompt) {
    const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const q=norm(prompt), general=/\btod[oa]s\b/.test(q);
    let items=context.indicadores;
    if(/media|soma|minimo|maximo/.test(q)&&!/analise|evolu|todos|gerencial/.test(q)) {
        const exact=items.filter(i=>{const n=norm(i.indicador).replace(/\s*-?\s*mensal$/,'').trim();return n&&q.includes(n);});
        if(exact.length)items=exact;
    }
    const culpa=/acident\w* com culpa|sinistr\w* com culpa/.test(q);
    const remainder=q.replace(/acident\w* com culpa|sinistr\w* com culpa/g,'');
    if(culpa&&!general) {
        const explicit=context.indicadores.filter(i=>{const n=norm(i.indicador).replace(/\s*-?\s*mensal$/,'').trim();return n && q.includes(n);});
        const other=/multa|autuac|score|velocidade|crlv|document|quilometr|receita|custo|les|morte|obito|fatal|trein/;
        const requested=(remainder.match(new RegExp(other.source,'g'))||[]);
        items=items.filter(i=>(norm(i.indicador).includes('culpa')&&!norm(i.indicador).includes('sem culpa')) || (/acident|sinistr/.test(remainder)&&/total de acident/.test(norm(i.indicador))) || explicit.includes(i) || requested.some(t=>norm(i.indicador).includes(t)));
    }
    const names=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const pattern=names.join('|');
    const range=q.match(new RegExp(`(${pattern})\\s+(?:a|ate)\\s+(${pattern})`));
    let indexes=context.competencias.map((_,i)=>i);
    if(range) {
        const start=names.indexOf(range[1]),end=names.indexOf(range[2]);
        const monthOf=label=>{const s=norm(label);const m=s.match(/^(\d{1,2})\//);return m?Number(m[1])-1:names.findIndex(n=>s.startsWith(n.slice(0,3)));};
        const year=q.match(/\b(20\d{2})\b/)?.[1];
        if(end<start)throw Error('INTERVALO_AMBIGUO');
        indexes=indexes.filter(i=>{const label=context.competencias[i],month=monthOf(label);return month>=start&&month<=end&&(!year||new RegExp(`(?:${year}|${year.slice(2)})$`).test(String(label)));});
        const selected=context.competencias.filter((_,i)=>indexes.includes(i));
        const parsedYears=new Set(selected.map(s=>String(s).match(/(?:\/|\s)(\d{2}|\d{4})$/)?.[1]??'sem_ano'));
        if(!indexes.length||parsedYears.size>1)throw Error('INTERVALO_AMBIGUO');
    }
    return {...context,totalIndicadoresSelecionados:items.length+(context.contextoParcial?Math.max(0,(context.totalIndicadoresSelecionados??context.indicadores.length)-context.indicadores.length):0),competencias:indexes.map(i=>context.competencias[i]),indicadores:items.map(item=>({...item,valores:indexes.map(i=>item.valores?.[i]??null)})),intervaloSolicitado:range?range[0]:null};
}

export const INTERPRETATION_CONTRACT = 'Retorne somente JSON curto, sem prosa nem markdown: {"resumo":[],"fatos":[],"atencao":[],"hipoteses":[],"recomendacoes":[],"limitacoes":[]}. Resumo/fatos/atencao contêm no máximo duas referências {"id":"ID recebido","stat":"media|soma|minimo|maximo|ultimo_vs_media","competencia":"rótulo recebido ou string vazia"}; não escreva valores ou comparações. Hipoteses: códigos verificar_registros ou associacao_nao_validada. Recomendacoes: códigos investigar_registros, revisar_direcao ou avaliar_prevencao. Limitacoes: códigos dados_agregados, retroativos ou denominador_sem_vinculo. Máximo dois códigos por campo; arrays vazios quando não aplicável. Não copie todo o relatório. A tarefa é escolher referências, não calcular ou justificar seu raciocínio.';

export function analysisPresentation(context, interpretation, prompt = '') {
    const base=legacyAnalysisPresentation(context,'');
    const fmt=v=>v===null?'indisponível':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v);
    const catalog={
        verificar_registros:'Hipótese para investigação: conferir os registros individuais autorizados antes de atribuir causas.',
        associacao_nao_validada:'Hipótese para investigação: verificar se há associação documentada entre os indicadores.',
        investigar_registros:'Investigar os registros autorizados das competências destacadas, sem presumir causas.',
        revisar_direcao:'Revisar a classificação humana dos indicadores cuja direção não está definida.',
        avaliar_prevencao:'Avaliar ações preventivas com a equipe responsável, sem criar novas metas oficiais.',
        dados_agregados:'Os indicadores são agregados e não comprovam causas ou resultados individuais.',
        retroativos:'As competências permanecem sujeitas a revisões retroativas.',
        denominador_sem_vinculo:'Uma taxa por quilometragem exige vínculo e período compatíveis entre numerador e denominador; esse vínculo não foi validado.'
    };
    const resolve=ref=>{
        if(!ref||typeof ref!=='object'||Array.isArray(ref)||Object.keys(ref).length!==3||!['id','stat','competencia'].every(k=>Object.hasOwn(ref,k))||typeof ref.competencia!=='string')return null;
        const item=context.indicadores.find(i=>i.id===ref.id);if(!item)return null;
        const s=item.estatisticas;
        if(ref.competencia && !context.competencias.includes(ref.competencia))return null;
        if(ref.stat==='ultimo_vs_media'){
            const p=ref.competencia?s.mensais.find(p=>p.competencia===ref.competencia):s.mensais.filter(p=>p.valor!==null).at(-1);
            if(!p||p.valor===null||s.media===null)return null;
            return `${item.indicador}, ${p.competencia}: ${fmt(p.valor)}, ${p.valor<s.media?'abaixo':p.valor>s.media?'acima':'igual'} à média ${fmt(s.media)}.`;
        }
        const labels={media:'média',soma:'Soma',minimo:'mínimo',maximo:'máximo'};
        if(!Object.hasOwn(labels,ref.stat)||ref.competencia)return null;
        return `${item.indicador}: ${labels[ref.stat]} ${fmt(s[ref.stat])}${item.unidade?' '+item.unidade:''}.`;
    };
    let parsed=null;try {parsed=JSON.parse(String(interpretation));}catch { /* fallback sem nova chamada */ }
    const fields=['resumo','fatos','atencao','hipoteses','recomendacoes','limitacoes'];
    const valid=parsed&&typeof parsed==='object'&&!Array.isArray(parsed)&&Object.keys(parsed).length===fields.length&&fields.every(k=>Array.isArray(parsed[k])&&parsed[k].length<=2);
    const sections={};const rejected=[];
    if(valid) for(const field of fields){
        sections[field]=[];
        for(const entry of parsed[field]){
            const text=['resumo','fatos','atencao'].includes(field)?resolve(entry)
                : typeof entry==='string' && ({hipoteses:['verificar_registros','associacao_nao_validada'],recomendacoes:['investigar_registros','revisar_direcao','avaliar_prevencao'],limitacoes:['dados_agregados','retroativos','denominador_sem_vinculo']}[field]||[]).includes(entry)?catalog[entry]:null;
            if(text)sections[field].push(text);else rejected.push({reason:'referencia_ou_codigo_invalido'});
        }
    }
    else if(String(interpretation).trim()) {
        rejected.push({reason:'estrutura_invalida'});
        if(!String(interpretation).trim().startsWith('{')) {
            const legacy=legacyAnalysisPresentation(context,interpretation);
            const safe=legacy.summary.split('Hipóteses e recomendações\n')[1]?.split('\nProteção analítica:')[0]??'';
            sections.recomendacoes=safe.split('\n').filter(s=>s.trim()&&!/^(?:#+\s*)?(?:resumo executivo|fatos observados|pontos de aten[çc][aã]o|hip[oó]teses|recomenda[çc][oõ]es|limita[çc][oõ]es)\s*:?$/i.test(s.trim()));
        }
    }
    // Fatos e comparações sempre resolvidos pelo sistema, nunca por números do modelo.
    const q=String(prompt).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const simple=/media|soma|minimo|maximo/.test(q)&&!(/analise|evolu|todos|gerencial/.test(q));
    const requested=['media','soma','minimo','maximo'].filter(k=>q.includes(k));
    const defaults=context.indicadores.slice(0,8).flatMap(i=>(simple?requested:['media','ultimo_vs_media']).map(stat=>resolve({id:i.id,stat,competencia:''})).filter(Boolean));
    const seen=new Set();const unique=lines=>lines.filter(line=>{if(seen.has(line))return false;seen.add(line);return true;});
    const lines=[];
    const add=(heading,texts)=>{const clean=unique(texts);if(clean.length){if(heading)lines.push(heading);lines.push(...clean);}};
    if(simple)add('',defaults);
    else {
        add('Resumo executivo',valid?(sections.resumo.length?sections.resumo:defaults):defaults);
        add('Resultados relevantes',valid?sections.fatos:[]);
        add('Pontos de atenção',valid?sections.atencao:[]);
        add('Hipóteses para investigação',valid?sections.hipoteses:[]);
        add('Recomendações',sections.recomendacoes?.length?sections.recomendacoes:[catalog.investigar_registros]);
    }
    const limitations=valid?sections.limitacoes:[];
    if(context.contextoParcial)limitations.push('Consulta parcial: há indicadores omitidos do contexto.');
    if(context.indicadores.length>8)limitations.push('Os demais indicadores recebidos permanecem disponíveis nos detalhes técnicos.');
    if(!context.indicadores.length)limitations.push('O indicador solicitado não foi recebido no contexto autorizado.');
    if(context.indicadores.some(i=>i.estatisticas.ausentes>0))limitations.push('Há competências com valores ausentes, preservados nos detalhes.');
    if(!simple)limitations.push(`Cobertura: ${context.indicadores.length}/${context.totalIndicadoresNoDashboard} indicadores; competências ${context.competencias[0]??'indisponíveis'} a ${context.competencias.at(-1)??'indisponíveis'}.`);
    add('Limitações importantes',limitations);
    const audit=rejected.length?'\nValidação da interpretação: '+rejected.map(r=>r.reason).join(', '):'';
    return {summary:lines.join('\n'),details:base.details+audit,rejections:rejected,structured:Boolean(valid)};
}

function legacyAnalysisPresentation(context, interpretation) {
    const fmt=v=>v===null?'indisponível':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v);
    const facts=[], comparisons=[];
    for(const item of context.indicadores) {
        const s=item.estatisticas;
        facts.push(`${item.indicador}: média ${fmt(s.media)}; Soma: ${s.somaAplicavel?fmt(s.soma):'não aplicável'}; mínimo ${fmt(s.minimo)}; máximo ${fmt(s.maximo)}.`);
        for(const p of s.mensais) if(p.valor!==null&&s.media!==null) comparisons.push(`${item.indicador}, ${p.competencia}: ${fmt(p.valor)}, ${p.valor<s.media?'abaixo':p.valor>s.media?'acima':'igual'} à média ${fmt(s.media)}.`);
        const last=s.mensais.filter(p=>p.valor!==null).at(-1);
        if(last&&s.media!==null)facts.push(`${item.indicador}, ${last.competencia}: ${fmt(last.valor)}, ${last.valor<s.media?'abaixo':last.valor>s.media?'acima':'igual'} à média ${fmt(s.media)}.`);
    }
    const rejected=[];
    const accepted=[];
    for(const part of String(interpretation).split(/\n|(?<=[.!?])\s+/).filter(s=>s.trim())) {
        const line=part.trim().replace(/^\d+[.)]\s*/, '');
        if(facts.includes(line)||comparisons.includes(line)){accepted.push(line);continue;}
        const withoutCompetencies=context.competencias.reduce((s,c)=>s.split(String(c)).join('COMPETENCIA'),line);
        const reason=/\p{N}|%/u.test(withoutCompetencies)?'numero_factual_nao_validado'
            : /acima|abaixo|m[eé]dia|melhorou|piorou|aumento|aumentou|redu[çc][aã]o|reduziu|superior|inferior|cresce|caiu|queda|m[aá]xim|m[ií]nim|\bmaior\b|\bmenor\b/i.test(line)?'comparacao_nao_estruturada'
            : /causou|causad|devido a|rotas cr[ií]ticas|hor[aá]rios cr[ií]ticos|n[aã]o (?:h[aá]|existem) dados|meta intermedi[aá]ria/i.test(line)?'afirmacao_sem_evidencia':null;
        if(reason)rejected.push({reason});else accepted.push(line);
    }
    const notes=[`Cobertura: ${context.indicadores.length}/${context.totalIndicadoresNoDashboard} indicadores. ${context.contextoParcial?'Consulta parcial: há indicadores omitidos.':'Nenhuma omissão por tamanho entre os selecionados.'}`,
        `Competências: ${context.competencias.join(', ')}. Valores ausentes não são zero; competências permanecem revisáveis.`];
    if(!context.indicadores.length)notes.push('O indicador solicitado não foi recebido no contexto autorizado desta consulta; isso não comprova sua inexistência no Dashboard.');
    if(context.indicadores.length>1) {
        const outside=context.indicadores.filter(i=>{const s=i.estatisticas;const last=s.mensais.filter(p=>p.valor!==null).at(-1);return last&&s.meta!==null&&(s.direcao==='menor_melhor'?last.valor>s.meta:s.direcao==='maior_melhor'?last.valor<s.meta:false);}).length;
        notes.push(`Panorama do conjunto recebido: ${context.indicadores.filter(i=>i.estatisticas.validos>0).length} indicador(es) com dados, ${outside} fora da meta no último valor válido conforme direção, ${context.indicadores.filter(i=>i.estatisticas.meta===null).length} sem meta e ${context.indicadores.filter(i=>!i.estatisticas.direcao).length} sem direção definida. Não há soma entre unidades diferentes.`);
    }
    const intro=context.indicadores.length>8?facts.slice(0,8).concat(`Síntese limitada a oito constatações; todos os ${context.indicadores.length} indicadores recebidos estão nos detalhes técnicos.`):facts;
    return {summary:['Resumo executivo',...notes,...intro,'Pontos de atenção',...context.indicadores.slice(0,8).map(i=>`${i.indicador}: ${i.estatisticas.ausentes} valor(es) ausente(s); meta ${fmt(i.meta)}, direção ${i.direcaoDesempenho??'indefinida: requer classificação humana'}.`),
        'Hipóteses e recomendações',...(accepted.length?accepted:['Investigar os resultados com os registros individuais autorizados, sem presumir causas ou fechar competências. Taxas por quilometragem exigem denominador com associação e período compatíveis; não há vínculo validado neste contexto.']),
        ...(rejected.length?[`Proteção analítica: ${rejected.length} trecho(s) não verificado(s) substituído(s) pela síntese determinística. Motivos: ${[...new Set(rejected.map(r=>r.reason))].join(', ')}.`]:[])].join('\n'),
        details:analyticalResponse(context,'')+'\nComparações verificadas\n'+comparisons.join('\n'),rejections:rejected};
}

export function analyzeIndicator(item, labels) {
    const numeric = v => typeof v === 'number' && Number.isFinite(v);
    const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const parse = label => {
        const s = String(label).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const m = s.match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
        const y = s.match(/(?:\/|\s)(\d{4}|\d{2})$/);
        const month = m ? Number(m[1]) - 1 : months.indexOf(s.slice(0,3));
        const rawYear = m ? Number(m[2]) : y ? Number(y[1]) : null;
        return { month, year: rawYear === null ? null : rawYear < 100 ? 2000 + rawYear : rawYear };
    };
    const points = labels.map((competencia, i) => ({competencia, valor: numeric(item.valores?.[i]) ? item.valores[i] : null, ...parse(competencia)}));
    const dated = points.every(p => p.year !== null);
    const undated = points.every(p => p.year === null);
    const keys = points.map(p => `${p.year}:${p.month}`);
    const comparable = points.every(p => p.month >= 0 && p.month < 12) && (dated || undated) && new Set(keys).size === keys.length;
    if (comparable) points.sort((a,b) => (a.year ?? 0) - (b.year ?? 0) || a.month - b.month);
    const valid = points.filter(p => p.valor !== null);
    const values = valid.map(p => p.valor);
    const finite = v => Number.isFinite(v) ? v : null;
    const total = finite(values.reduce((a,b) => a+b, 0));
    const mean = values.length ? (total === null ? finite(values.reduce((a,b) => a+b/values.length, 0)) : total / values.length) : null;
    const unit = String(item.unidade ?? '').toLowerCase();
    const rate = /%|taxa|milhao|milhão|por\s+.*km|\/.*km/.test(unit + ' ' + String(item.indicador).toLowerCase());
    const additive = !rate && /^(qtd|quantidade|un|unidade|r\$)$/.test(unit.trim()) && !/score|media|média|indice|índice/.test(String(item.indicador).toLowerCase());
    const direction = ['menor_melhor','maior_melhor','neutro'].includes(item.direcaoDesempenho) ? item.direcaoDesempenho : null;
    const target = numeric(item.meta) ? item.meta : null;
    const change = (a,b) => ({absoluta: finite(b-a), percentual: a === 0 ? null : finite((b-a)/Math.abs(a)*100), pontosPercentuais: unit.includes('%') ? finite(b-a) : null});
    const monthly = points.map((p,i) => {
        const previous = points[i-1];
        const adjacent = previous && (dated ? p.year*12+p.month - (previous.year*12+previous.month) === 1 : p.month-previous.month === 1);
        return {competencia:p.competencia, valor:p.valor,
            estado:p.valor === null ? 'ausente' : p.valor === 0 ? 'zero_registrado' : 'valor_registrado',
            variacaoAnterior: comparable && adjacent && previous.valor !== null && p.valor !== null ? change(previous.valor,p.valor) : null,
            desvioMediaPercentual: p.valor === null || mean === null || mean === 0 ? null : finite((p.valor-mean)/Math.abs(mean)*100),
            desvioMeta: p.valor === null || target === null ? null : change(target,p.valor)};
    });
    let streak = 0, longestImprove = 0, longestWorse = 0, kind = null;
    for (const p of monthly) {
        const d = p.variacaoAnterior?.absoluta;
        const next = d === undefined || d === null || d === 0 || !direction || direction === 'neutro' ? null : (direction === 'menor_melhor' ? d < 0 : d > 0) ? 'melhora' : 'piora';
        streak = next && next === kind ? streak+1 : next ? 1 : 0; kind = next;
        if (kind === 'melhora') longestImprove = Math.max(longestImprove,streak);
        if (kind === 'piora') longestWorse = Math.max(longestWorse,streak);
    }
    const min = values.length ? Math.min(...values) : null, max = values.length ? Math.max(...values) : null;
    return {mensais:monthly, validos:values.length, ausentes:points.length-values.length,
        soma:additive && values.length ? total : null, somaAplicavel:additive,
        media:mean, tipoMedia:rate ? 'média simples das taxas mensais, não taxa agregada ponderada' : 'média aritmética dos valores válidos',
        minimo:min, maximo:max, competenciasMinimo:valid.filter(p=>p.valor===min).map(p=>p.competencia), competenciasMaximo:valid.filter(p=>p.valor===max).map(p=>p.competencia),
        meta:target, direcao:direction, acimaMeta:target === null ? null : values.filter(v=>v>target).length,
        abaixoMeta:target === null ? null : values.filter(v=>v<target).length, igualMeta:target === null ? null : values.filter(v=>v===target).length,
        primeiroUltimo:comparable && valid.length>1 ? {de:valid[0].competencia, ate:valid.at(-1).competencia, ...change(valid[0].valor,valid.at(-1).valor)} : null,
        tendencia:{metodo:'comparação descritiva primeiro/último valor válido; sem inferência causal ou teste estatístico', comparavel:comparable, maiorSequenciaMelhora:longestImprove, maiorSequenciaPiora:longestWorse},
        limitacoes:['Competências permanentemente revisáveis; não são meses fechados.', 'Null/posição sem valor é ausência de informação, não ausência de eventos.', ...(comparable ? [] : ['Competências incompatíveis ou ambíguas: comparações temporais suspensas.']), ...(rate ? ['Sem denominadores: não calcular taxa agregada por quilometragem.'] : [])]};
}

export function analyticalResponse(context, interpretation) {
    const fmt = v => v === null ? 'indisponível' : new Intl.NumberFormat('pt-BR', {maximumFractionDigits:2}).format(v);
    const lines = ['Resultados calculados pelo sistema (valores arredondados apenas para exibição).'];
    lines.push(`Cobertura: ${context.indicadores.length}/${context.totalIndicadoresNoDashboard} indicadores do Dashboard; ${context.contextoParcial ? 'há indicadores selecionados omitidos por tamanho' : 'nenhuma omissão por tamanho entre os selecionados'}. Essa cobertura não comprova completude dos meses.`);
    for (const item of context.indicadores) {
        const s = item.estatisticas;
        lines.push(`\n${item.indicador} — ${item.setor} (${item.unidade ?? 'unidade não informada'})`,
            `Meta: ${s.meta === null ? 'Meta não cadastrada' : fmt(s.meta)}; direção: ${s.direcao ?? 'indefinida: requer classificação humana'}.`,
            ...s.mensais.map(p=>`${p.competencia}: ${p.valor === null ? 'valor ausente' : fmt(p.valor)}; variação anterior: ${p.variacaoAnterior ? `${fmt(p.variacaoAnterior.absoluta)}${p.variacaoAnterior.pontosPercentuais !== null ? ' pontos percentuais' : ' (absoluta)'}; ${fmt(p.variacaoAnterior.percentual)}% (relativa)` : 'indisponível'}; desvio da média: ${fmt(p.desvioMediaPercentual)}%.`),
            `Dados válidos: ${s.validos}; ausentes: ${s.ausentes}. Soma: ${s.somaAplicavel ? fmt(s.soma) : 'não aplicável'}. Média: ${fmt(s.media)} (${s.tipoMedia}).`,
            `Mínimo: ${fmt(s.minimo)} (${s.competenciasMinimo.join(', ')}); máximo: ${fmt(s.maximo)} (${s.competenciasMaximo.join(', ')}).`,
            `Acima/abaixo/igual à meta: ${fmt(s.acimaMeta)}/${fmt(s.abaixoMeta)}/${fmt(s.igualMeta)}.`,
            s.primeiroUltimo ? `De ${s.primeiroUltimo.de} a ${s.primeiroUltimo.ate}: variação absoluta ${fmt(s.primeiroUltimo.absoluta)}; percentual ${fmt(s.primeiroUltimo.percentual)}%.` : 'Comparação temporal insuficiente.',
            `Método: ${s.tendencia.metodo}. Maiores sequências de melhora/piora: ${s.tendencia.maiorSequenciaMelhora}/${s.tendencia.maiorSequenciaPiora} transições mensais consecutivas, conforme direção cadastrada.`,
            ...s.limitacoes);
    }
    // O texto livre nunca é a fonte da seção numérica. Recusa conservadora,
    // sem tentar corrigir números arbitrários extraídos de prosa.
    const unsafe = /\p{N}|%/u.test(interpretation);
    lines.push('\nInterpretação qualitativa', unsafe
        ? 'O texto do modelo foi omitido por conter números fora da seção calculada. Consulte os resultados verificados acima e solicite uma interpretação sem números.'
        : interpretation);
    return lines.join('\n');
}
