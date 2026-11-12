// Executável em Node 22+: node tests/ia-context.test.js
// Fontes reais, Supabase e provedores simulados; nenhuma chamada externa.
async function runAuditTests(front, back, Encoder) {
    const results = [];
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const assert = (value, label) => { if (!value) throw new Error(label); };
    const test = async (label, fn) => { await fn(); results.push(label); };
    const clone = value => JSON.parse(JSON.stringify(value));
    const sample = [
        { indicador: 'Total de acidentes - Mensal', setor: 'Sinistros', meta: 40, und: 'Qtd', direcaoDesempenho: 'menor_melhor', valores: [20, null, 30] },
        { indicador: 'Acidentes com culpa - Mensal', setor: 'Outro setor', meta: 0, und: 'Qtd', valores: [0, 2, 1] },
        { indicador: 'SCORE', setor: 'Motoristas', meta: 600, und: 'pts', valores: [500, 510, null] },
        { indicador: 'CRLV liberados', setor: 'Documentação', meta: 100, und: '%', valores: [90, 95, 99] },
        { indicador: 'Multas', setor: 'Autuações', meta: 0, und: 'Qtd', valores: [4, 5, 2] }
    ];
    const months = ['Jan', 'Fev', 'Mar'];
    const prep = front.slice(front.indexOf('function prepararContextoIndicadoresIA('), front.indexOf('async function chamarEdgeFunctionIA('));
    const call = front.slice(front.indexOf('async function chamarEdgeFunctionIA('), front.indexOf('async function executarTesteIA('));
    function frontend(data = sample, extra = {}, fetch = async () => ({ ok: true, json: async () => ({ success: true, contextVersion: 1, response: 'mock' }) })) {
        return new Function('TextEncoder', 'fetch', `
          let currentData = ${JSON.stringify(data)}, mesesLabels = ${JSON.stringify(months)};
          let supabaseStateLoaded = ${extra.loaded !== false}, supabaseReady = true, hasUnsavedChanges = ${extra.dirty === true};
          const currentAiProvider = 'groq', SUPABASE_AI_FUNCTION_ENDPOINT = 'mock', SUPABASE_PUBLISHABLE_KEY = 'public';
          const supabaseClient = { auth: { getSession: async () => ({ data: { session: { access_token: 'mock' } } }) } };
          ${prep}\n${call}\nreturn { prepare: prepararContextoIndicadoresIA, call: chamarEdgeFunctionIA };
        `)(Encoder, fetch);
    }
    await test('1. Bloqueia dados não carregados e edições não salvas', () => {
        for (const extra of [{ loaded: false }, { dirty: true }]) {
            let failed = false; try { frontend(sample, extra).prepare('acidentes'); } catch { failed = true; }
            assert(failed, 'Dados não confirmados foram aceitos');
        }
        assert(!front.includes('currentData = Array.isArray(sharedIndicators) ?'), 'Fallback remoto permanece');
    });
    await test('1b. Falha de leitura remota não instala dados padrão', async () => {
        const loader = front.slice(front.indexOf('async function carregarDadosCompartilhados('), front.indexOf('\nfunction saveData('));
        const state = await new AsyncFunction('console', `
            let currentData = [], supabaseReady = true, supabaseStateLoaded = false;
            let hasUnsavedChanges = false, lastSupabaseSavedAt = null;
            const carregarDadosSupabase = async () => ({ data: { indicadores: null } });
            const initSystem = () => {}, showAlert = () => {}, updateLastSaveStatus = () => {};
            ${loader}\nawait carregarDadosCompartilhados();
            return {currentData, supabaseStateLoaded};
        `)({error:()=>{}});
        assert(state.currentData.length === 0 && state.supabaseStateLoaded === false, 'Fallback silencioso de exemplos');
    });
    await test('2. Acidentes/sinistros, setores distintos e outros temas', () => {
        for (const q of ['acidentes', 'sinistros']) {
            const c = frontend().prepare(q);
            assert(c.indicadores.length === 2, 'Seleção de acidentes incorreta');
        }
        assert(frontend().prepare('documentação').indicadores.some(i => i.indicador === 'CRLV liberados'), 'Documentação ausente');
        assert(frontend().prepare('autuações').indicadores.some(i => i.indicador === 'Multas'), 'Multas ausentes');
        assert(frontend().prepare('acidentes e score').indicadores.some(i => i.indicador === 'SCORE'), 'Consulta multitema falhou');
    });
    let captured;
    await test('3. Contexto e bytes UTF-8 no fetch real do frontend', async () => {
        const api = frontend(sample, {}, async (_, options) => {
            captured = JSON.parse(options.body);
            assert(new Encoder().encode(options.body).length <= 25 * 1024, 'Payload excessivo');
            return { ok: true, json: async () => ({ success: true, contextVersion: 1, response: 'mock' }) };
        });
        await api.call('acidentes', { provider: 'groq' });
        assert(captured.context.indicadores.length === 2, 'Contexto não enviado');
        const many = Array.from({length: 75}, (_, i) => ({ ...sample[0], indicador: `Indicador ${i} ` + 'á'.repeat(160), valores: [1, null, 3] }));
        const c = frontend(many).prepare('visão geral');
        assert(c.contextoParcial && c.totalIndicadoresEnviados < 75, 'Recorte não sinalizado');
        assert(c.indicadores.every(i => i.valores.length === 3), 'Série truncada');
        assert(new Encoder().encode(JSON.stringify(c)).length <= 18 * 1024, 'Contexto excessivo');
    });
    // Executa o bloco de validação da Edge, removendo apenas assertions TS.
    const validation = back.slice(back.indexOf('    const rawContext = body.context;'), back.indexOf('    const rawProvider ='))
        .replace(/ as Record<string, unknown>/g, '').replace(/ as string \| null/g, '').replace(/ as number/g, '');
    class HttpError extends Error { constructor(message, status) { super(message); this.status = status; } }
    async function validate(context, denied = false) {
        const query = { select: () => query, eq: () => query, single: async () => ({data: denied ? null : {data: {indicadores: sample, mesesLabels: months}}, error: denied ? {} : null}) };
        return new AsyncFunction('body','supabaseClient','TextEncoder','HttpError', validation + '\nreturn contextText;')(
            {context}, {from: () => query}, Encoder, HttpError);
    }
    let verified;
    await test('4. Edge verifica contexto contra snapshot autorizado', async () => {
        verified = await validate(captured.context);
        assert(JSON.parse(verified).indicadores.length === 2, 'Contexto não interpretado');
        for (const change of [c => {c.indicadores[0].valores[0] = 999;}, c => {c.competencias[0] = 'Abr';}, c => {c.origem = 'exemplo';}]) {
            const c = clone(captured.context); change(c); let failed = false;
            try { await validate(c); } catch { failed = true; } assert(failed, 'Contexto adulterado aceito');
        }
        let denied = false; try { await validate(captured.context, true); } catch { denied = true; }
        assert(denied, 'Falha RLS ignorada');
    });
    await test('5. Payloads Groq, OpenAI e Gemini contêm os mesmos dados', () => {
        const instructions = back.slice(back.indexOf('    const SYSTEM_INSTRUCTION_TEXT ='), back.indexOf('    // 5. Integração com OpenAI'));
        const built = new Function('contextText','prompt', instructions + '\nreturn {system:EFFECTIVE_SYSTEM_INSTRUCTION,user:MODEL_USER_INPUT};')(verified, 'Analise acidentes');
        for (const name of ['groq','openai','gemini']) {
            const start = back.indexOf(`      const ${name}Payload =`) >= 0 ? back.indexOf(`      const ${name}Payload =`) : back.indexOf(`    const ${name}Payload =`);
            const snippet = back.slice(start, back.indexOf('\n    };', start) + 7);
            // Os blocos internos terminam com seis espaços.
            const end = back.indexOf('\n      };', start);
            const source = name === 'gemini' ? snippet : back.slice(start, end + 9);
            const payload = new Function('EFFECTIVE_SYSTEM_INSTRUCTION','MODEL_USER_INPUT',`${source}\nreturn ${name}Payload;`.replaceAll(`${name}Model`, "'modelo-mock'"))(built.system,built.user);
            const text = name === 'groq' ? payload.messages[1].content : name === 'openai' ? payload.input : payload.contents[0].parts[0].text;
            assert(text.includes(verified), `${name} perdeu contexto`);
            const system = name === 'groq' ? payload.messages[0].content : name === 'openai' ? payload.instructions : payload.systemInstruction.parts[0].text;
            assert(!system.includes(verified), 'Dados misturados às instruções privilegiadas');
        }
    });
    await test('6. Resposta simulada e detecção de backend antigo', async () => {
        assert((await frontend().call('acidentes')).response === 'mock', 'Resposta não interpretada');
        let failed = false;
        try { await frontend(sample, {}, async () => ({ok:true,json:async()=>({success:true,response:'antiga'})})).call('acidentes'); } catch { failed = true; }
        assert(failed, 'Backend antigo aceito');
        assert(back.includes('sem solicitar planilha externa'), 'Orientação para análise ausente');
    });
    await test('7. Null, zero, metas e direção indefinida preservados', () => {
        const c = JSON.parse(verified);
        assert(c.indicadores[0].valores[1] === null, 'Null convertido');
        assert(c.indicadores[1].valores[0] === 0 && c.indicadores[1].meta === 0, 'Zero perdido');
        assert(c.indicadores[1].direcaoDesempenho === null, 'Direção inventada');
    });
    await test('8. Sintaxe frontend e ligações da interface preservadas', () => {
        new Function(front);
        assert(front.includes('await chamarEdgeFunctionIA(prompt, { provider })'), 'Botão desconectado');
        assert(front.includes('responseBody.textContent = resultado.response'), 'Resposta insegura');
        assert(front.includes('if (silencioso && hasUnsavedChanges) return;'), 'Sobrescrita local não protegida');
    });
    return results;
}
if (typeof process !== 'undefined' && process.versions?.node) {
    (async () => {
        const fs = await import('node:fs');
        const results = await runAuditTests(fs.readFileSync('public/main.js','utf8'), fs.readFileSync('supabase/functions/seguranca-viaria-ia/index.ts','utf8'), TextEncoder);
        results.forEach(label => console.log('PASS', label));
    })().catch(error => { console.error(error); process.exitCode = 1; });
}
