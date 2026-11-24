import { createHandler } from '../supabase/functions/seguranca-viaria-ia/handler.ts';
import { context, stored } from './report-fixtures.mjs';

const assert = (value: unknown, message: string) => { if (!value) throw Error(message); };
const database = stored(15);
const selection = { type: 'comparativo', sector: 'TODOS', ids: database.indicadores.map((_, i) => 'indice:' + i), start: 'Jan', end: 'Dez' };
let updatedAt = '2026-11-20T12:00:00Z';
let email = 'teste@dgranel.com.br';
let allowRead = true;
let groqStatus = 200;
let completion = 'stop';
let groqCalls = 0;
let captured: any;
const fetcher: typeof fetch = async (url, init) => {
    const endpoint = new URL(String(url));
    const headers = new Headers(init?.headers);
    if (endpoint.hostname === 'example.supabase.co') {
        assert(headers.get('Authorization') === 'Bearer session' && headers.get('apikey') === 'public', 'Leitura sem JWT ou chave pública');
        if (endpoint.pathname === '/auth/v1/user') return Response.json({ id: 'tester', email, email_confirmed_at: updatedAt });
        assert(endpoint.pathname === '/rest/v1/dashboard_state' && endpoint.searchParams.get('id') === 'eq.1', 'Leitura fora do snapshot');
        return Response.json(allowRead ? [{ data: database, updated_at: updatedAt }] : []);
    }
    assert(endpoint.href === 'https://api.groq.com/openai/v1/chat/completions' && headers.get('Authorization') === 'Bearer mock-groq', 'Transporte Groq');
    groqCalls++;
    captured = JSON.parse(String(init?.body));
    const input = JSON.parse(captured.messages[1].content);
    assert(!JSON.stringify(input).includes('indice:'), 'Identificador interno enviado ao provedor');
    if (groqStatus !== 200) return Response.json({ error: 'RAW_PRIVATE_ERROR' }, { status: groqStatus, headers: { 'Retry-After': '17' } });
    const answer = input.question ? 'Confira as competências e os dados disponíveis.' : JSON.stringify({
        highlights: [input.indicators[0].key, 'inventado', input.indicators[0].key],
        actions: input.actions.map((item: { key: string }) => item.key),
        unexpected: 'Houve 999 acidentes.',
    });
    return Response.json({ choices: [{ finish_reason: completion, message: { content: answer } }] });
};
const settings: Record<string, string> = {
    SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'public',
    GROQ_API_KEY: 'mock-groq', DASHBOARD_ALLOWED_ORIGINS: 'https://dashboard.example',
};
const handler = createHandler(key => settings[key], fetcher);
async function invoke(body: object, expected = 200, origin = 'https://dashboard.example', token = 'session') {
    const response = await handler(new Request('https://edge.example', {
        method: 'POST', headers: { Origin: origin, ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body),
    }));
    const result = await response.json();
    assert(response.status === expected && result.success === (expected === 200), JSON.stringify(result));
    assert(Boolean(result.diagnosticId), 'Diagnóstico ausente');
    return { response, result };
}

await invoke({ action: 'preview', selection }, 403, 'https://other.example');
await invoke({ action: 'preview', selection }, 401, undefined, '');
email = 'teste@example.org';
await invoke({ action: 'preview', selection }, 403);
email = 'teste@dgranel.com.br';
allowRead = false;
await invoke({ action: 'chat', question: 'Acidentes' }, 403);
allowRead = true;
await invoke({ action: 'chat', question: 'Acidentes', values: [999] }, 400);
assert(groqCalls === 0, 'Solicitação não autorizada chegou à Groq');

const managementContext = context(false);
const preview = (await invoke({ action: 'preview', selection, managementContext })).result.report;
const basis = { selection, managementContext, expectedUpdatedAt: updatedAt, expectedReportBasis: preview.basis };
assert(preview.indicators.length === 15 && groqCalls === 0, 'Prévia consumiu IA ou perdeu indicadores');
await invoke({ action: 'generate', ...basis, expectedReportBasis: 'incorreto' }, 409);
const generated = (await invoke({ action: 'generate', ...basis })).result;
assert(groqCalls === 1 && captured.response_format.json_schema.strict, 'Contrato Groq');
assert(!JSON.stringify(captured).includes(managementContext.observations), 'Contexto sem consentimento enviado');
assert(generated.evidenceKeys.length === 8 && generated.coverage.partial && generated.document.sections.length > 1, 'Cobertura ou conteúdo');
assert(!/inventado|999 acidentes/.test(JSON.stringify(generated.document)), 'Conteúdo arbitrário do provedor aceito');
const review = { action: 'review', ...basis, document: generated.document, reviewAcknowledged: true };
await invoke({ ...review, reviewAcknowledged: false }, 422);
await invoke(review);
const invalid = structuredClone(generated.document);
invalid.sections[0].text = 'Houve 999 acidentes.';
await invoke({ ...review, document: invalid }, 422);
updatedAt = '2026-11-21T12:00:00Z';
await invoke(review, 409);
updatedAt = basis.expectedUpdatedAt;
assert(groqCalls === 1, 'Revisão acionou a Groq');

const shared = context(true);
const withContext = (await invoke({ action: 'preview', selection, managementContext: shared })).result.report;
await invoke({ action: 'generate', ...basis, managementContext: shared, expectedReportBasis: withContext.basis });
assert(JSON.stringify(captured).includes(shared.observations), 'Contexto autorizado ausente');
const chat = (await invoke({ action: 'chat', question: 'Acidentes' })).result;
assert(chat.coverage.sent <= 6 && chat.response.includes('competências') && !captured.response_format, 'Central');
assert(JSON.parse(captured.messages[1].content).indicators[0].name.startsWith('Acidentes'), 'Recorte da pergunta');
assert(chat.evidence[0].startsWith('Acidentes') && chat.evidence.length === chat.coverage.sent, 'Evidências oficiais da consulta');
await invoke({ action: 'chat', question: 'Contato pessoa@example.test' }, 422);
completion = 'length';
await invoke({ action: 'generate', ...basis }, 502);
completion = 'stop';
groqStatus = 429;
const limited = await invoke({ action: 'chat', question: 'Acidentes' }, 429);
assert(limited.response.headers.get('Retry-After') === '17' && !JSON.stringify(limited.result).includes('RAW_PRIVATE_ERROR'), 'Limite ou vazamento');
const before = groqCalls;
await invoke({ action: 'generate', ...basis }, 429);
await invoke({ action: 'preview', selection });
assert(groqCalls === before, 'Cooldown ou prévia fizeram nova chamada');
console.log('PASS Edge única, JWT/RLS, prévia, chat, geração com evidências, revisão, snapshot, privacidade e limite Groq.');
