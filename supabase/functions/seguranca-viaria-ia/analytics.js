// Sem dependências e sem acesso ao banco. Recebe somente o snapshot verificado.
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
    const total = values.reduce((a,b) => a+b, 0);
    const mean = values.length ? total / values.length : null;
    const unit = String(item.unidade ?? '').toLowerCase();
    const rate = /%|taxa|milhao|milhão|por\s+.*km|\/.*km/.test(unit + ' ' + String(item.indicador).toLowerCase());
    const additive = !rate && /^(qtd|quantidade|un|unidade|r\$)$/.test(unit.trim()) && !/score|media|média|indice|índice/.test(String(item.indicador).toLowerCase());
    const direction = ['menor_melhor','maior_melhor','neutro'].includes(item.direcaoDesempenho) ? item.direcaoDesempenho : null;
    const target = numeric(item.meta) ? item.meta : null;
    const change = (a,b) => ({absoluta: b-a, percentual: a === 0 ? null : (b-a)/Math.abs(a)*100, pontosPercentuais: unit.includes('%') ? b-a : null});
    const monthly = points.map((p,i) => {
        const previous = points[i-1];
        const adjacent = previous && (dated ? p.year*12+p.month - (previous.year*12+previous.month) === 1 : p.month-previous.month === 1);
        return {competencia:p.competencia, valor:p.valor,
            estado:p.valor === null ? 'ausente' : p.valor === 0 ? 'zero_registrado' : 'valor_registrado',
            variacaoAnterior: comparable && adjacent && previous.valor !== null && p.valor !== null ? change(previous.valor,p.valor) : null,
            desvioMediaPercentual: p.valor === null || mean === null || mean === 0 ? null : (p.valor-mean)/Math.abs(mean)*100,
            desvioMeta: p.valor === null || target === null ? null : change(target,p.valor)};
    });
    let streak = 0, longestImprove = 0, longestWorse = 0, kind = null;
    for (const p of monthly) {
        const d = p.variacaoAnterior?.absoluta;
        const next = d === undefined || d === 0 || !direction || direction === 'neutro' ? null : (direction === 'menor_melhor' ? d < 0 : d > 0) ? 'melhora' : 'piora';
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
