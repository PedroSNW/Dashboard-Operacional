import { ApiError, createGroq, readJson } from './groq.ts';
import { answerQuestion, generateReport, reviewReport } from './report-ai.ts';
import { buildReport } from './reports.js';
import { generateOnePage, ONEPAGE_INDICATOR_LIMIT } from './onepage-ai.ts';

const actions = {
    chat: ['action', 'question'],
    preview: ['action', 'selection', 'managementContext'],
    generate: ['action', 'selection', 'managementContext', 'expectedUpdatedAt', 'expectedReportBasis'],
    review: ['action', 'selection', 'managementContext', 'expectedUpdatedAt', 'expectedReportBasis', 'document', 'reviewAcknowledged'],
    onepage: ['action', 'selection', 'expectedUpdatedAt', 'orientation'],
};

export function createHandler(env = Deno.env.get, fetcher: typeof fetch = fetch) {
    const complete = createGroq(env, fetcher);
    const allowedOrigins = (env('DASHBOARD_ALLOWED_ORIGINS') ?? '').split(',').map(origin => origin.trim()).filter(Boolean);

    async function readSnapshot(request: Request) {
        const token = request.headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
        if (!token) throw new ApiError(401, 'session_required', 'Faça login com sua conta corporativa.');
        const url = env('SUPABASE_URL')?.replace(/\/+$/, '');
        let key = env('SUPABASE_ANON_KEY') || env('SUPABASE_PUBLISHABLE_KEY');
        if (!key) {
            try { key = JSON.parse(env('SUPABASE_PUBLISHABLE_KEYS') ?? '{}').default; } catch { /* Configuration error below. */ }
        }
        if (!url || typeof key !== 'string' || !key) throw new ApiError(503, 'supabase_configuration', 'Configuração do Supabase indisponível.');
        const get = (path: string) => fetcher(url + path, {
            headers: { apikey: key!, Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(10_000), redirect: 'error',
        });
        const unavailable = new ApiError(503, 'supabase_unavailable', 'O Supabase está temporariamente indisponível.');
        const getResponse = async (path: string) => {
            try { return await get(path); } catch { throw unavailable; }
        };
        const auth = await getResponse('/auth/v1/user');
        if (auth.status >= 500) throw unavailable;
        if (!auth.ok) throw new ApiError(401, 'invalid_session', 'A sessão expirou ou é inválida.');
        const user = await readJson(auth, 32 * 1024, unavailable);
        if (!user?.id || !user.email_confirmed_at || !/^[^@\s]+@dgranel\.com\.br$/i.test(user.email ?? '')) {
            throw new ApiError(403, 'corporate_access_required', 'Acesso restrito a contas corporativas confirmadas.');
        }
        const snapshot = await getResponse('/rest/v1/dashboard_state?select=data,updated_at&id=eq.1');
        if (snapshot.status >= 500) throw unavailable;
        const denied = new ApiError(403, 'snapshot_denied', 'A base autorizada não está disponível.');
        if (!snapshot.ok) throw denied;
        const rows = await readJson(snapshot, 8 * 1024 * 1024, denied);
        const row = Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
        if (!row?.data || typeof row.updated_at !== 'string') throw denied;
        return row as { data: unknown; updated_at: string };
    }

    return async function handle(request: Request) {
        const diagnosticId = crypto.randomUUID();
        const origin = request.headers.get('Origin');
        const allowed = !origin || !allowedOrigins.length || allowedOrigins.includes(origin);
        const headers = new Headers({
            'Cache-Control': 'no-store', Vary: 'Origin',
            'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Expose-Headers': 'Retry-After, X-DGranel-Diagnostic-Id',
            'X-DGranel-Diagnostic-Id': diagnosticId,
        });
        if (allowed && origin) headers.set('Access-Control-Allow-Origin', origin);
        const json = (body: object, status = 200) => Response.json({ ...body, diagnosticId }, { status, headers });

        try {
            if (!allowed) throw new ApiError(403, 'origin_denied', 'Origem não autorizada.');
            if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
            if (request.method !== 'POST') throw new ApiError(405, 'method_not_allowed', 'Use POST.');
            if (!request.headers.has('Authorization')) throw new ApiError(401, 'session_required', 'Faça login com sua conta corporativa.');
            const invalid = new ApiError(400, 'invalid_request', 'Operação ou campos inválidos.');
            const body = await readJson(request, 64 * 1024, invalid);
            if (!body || Array.isArray(body) || typeof body.action !== 'string' || !Object.hasOwn(actions, body.action)
                || Object.keys(body).some(key => !actions[body.action as keyof typeof actions].includes(key))) throw invalid;
            const remote = await readSnapshot(request);
            if (body.action === 'chat') {
                const question = typeof body.question === 'string' ? body.question.trim() : '';
                if (!question || new TextEncoder().encode(question).length > 1200) throw invalid;
                return json({ success: true, ...await answerQuestion(remote.data, question, complete) });
            }

            const stale = body.action === 'onepage'
                ? new ApiError(409, 'stale_snapshot', 'Atualize os dados do Dashboard antes de montar a OnePage.')
                : new ApiError(409, 'stale_snapshot', 'Gere uma nova prévia com a base e os filtros atuais.');
            if (body.action !== 'preview' && remote.updated_at !== body.expectedUpdatedAt) throw stale;
            if (body.action === 'onepage' &&
                (!['portrait', 'landscape'].includes(body.orientation) || body.selection?.type !== 'executivo' ||
                    !Array.isArray(body.selection.ids) || body.selection.ids.length > ONEPAGE_INDICATOR_LIMIT)) throw invalid;
            let report;
            try { report = buildReport(remote.data, body.selection, remote.updated_at, body.managementContext ?? null); }
            catch { throw new ApiError(422, 'invalid_selection', 'Confira o recorte e o contexto gerencial.'); }
            if (body.action === 'onepage') return json({ success: true, snapshotUpdatedAt: remote.updated_at,
                composition: await generateOnePage(report, body.orientation, complete) });
            const identity = JSON.stringify([remote.updated_at, report.type, report.sector, report.competencias, report.indicators, report.managementContext]);
            const basis = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity))),
                byte => byte.toString(16).padStart(2, '0')).join('');
            if (body.action === 'preview') return json({ success: true, report: { ...report, basis } });
            if (body.expectedReportBasis !== basis) throw stale;
            const result = { success: true, reportBasis: basis, snapshotUpdatedAt: remote.updated_at };
            if (body.action === 'generate') return json({ ...result, ...await generateReport(report, complete) });
            if (body.reviewAcknowledged !== true) throw new ApiError(422, 'review_required', 'Confirme a revisão antes de salvar.');
            return json({ ...result, ...reviewReport(report, body.document) });
        } catch (error) {
            const failure = error instanceof ApiError ? error : new ApiError(500, 'internal_failure', 'Não foi possível concluir a operação.');
            if (failure.retryAfter) headers.set('Retry-After', String(failure.retryAfter));
            if (failure.status >= 500) console.warn('Edge IA', { diagnosticId, code: failure.code, status: failure.status });
            return json({ success: false, code: failure.code, error: failure.message, retryAfter: failure.retryAfter }, failure.status);
        }
    };
}
