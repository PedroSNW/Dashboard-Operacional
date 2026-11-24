type Env = (name: string) => string | undefined;

export class ApiError extends Error {
    constructor(public status: number, public code: string, message: string, public retryAfter?: number) {
        super(message);
    }
}

export async function readJson(response: Request | Response, limit: number, invalid: ApiError) {
    if (!response.body) throw invalid;
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let size = 0;
    let text = '';
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.length;
            if (size > limit) {
                await reader.cancel();
                throw invalid;
            }
            text += decoder.decode(value, { stream: true });
        }
        return JSON.parse(text + decoder.decode());
    } catch {
        throw invalid;
    } finally {
        reader.releaseLock();
    }
}

const supportedModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const invalidResponse = () => new ApiError(502, 'invalid_groq_response', 'A Groq retornou uma resposta incompleta ou incompatível.');

export function createGroq(env: Env, fetcher: typeof fetch) {
    let running = false;
    let retryAt = 0;

    return async function complete(system: string, input: unknown, schema?: object) {
        const apiKey = env('GROQ_API_KEY')?.trim();
        const model = env('GROQ_MODEL')?.trim() || supportedModels[0];
        if (!apiKey || !supportedModels.includes(model)) {
            throw new ApiError(503, 'groq_configuration', 'Confira a configuração da Groq no Supabase.');
        }
        const wait = Math.ceil((retryAt - Date.now()) / 1000);
        if (wait > 0) throw new ApiError(429, 'groq_rate_limit', 'Aguarde a próxima janela da Groq.', wait);
        if (running) throw new ApiError(429, 'groq_busy', 'Já há uma consulta à Groq em andamento.', 2);
        const body = JSON.stringify({
            model, reasoning_effort: schema ? 'medium' : 'low', include_reasoning: false, max_completion_tokens: schema ? 3200 : 1800,
            messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(input) }],
            ...(schema ? { response_format: { type: 'json_schema', json_schema: { name: 'management_report', strict: true, schema } } } : {}),
        });
        if (new TextEncoder().encode(body).length > 6500) {
            throw new ApiError(422, 'context_too_large', 'O contexto é muito grande. Reduza o recorte ou a pergunta.');
        }

        running = true;
        const signal = AbortSignal.timeout(30_000);
        try {
            const response = await fetcher('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                body, signal, redirect: 'error',
            });
            if (!response.ok) {
                await response.body?.cancel();
                if (response.status === 429) {
                    const header = response.headers.get('Retry-After');
                    const seconds = header && /^\d+$/.test(header) ? Number(header) : 60;
                    const retry = Math.max(1, Math.min(seconds, 86_400));
                    retryAt = Date.now() + retry * 1000;
                    throw new ApiError(429, 'groq_rate_limit', 'A Groq atingiu o limite de uso desta janela.', retry);
                }
                if (response.status === 401 || response.status === 403) {
                    throw new ApiError(503, 'groq_credentials', 'A Groq recusou a credencial configurada no Supabase.');
                }
                throw new ApiError(502, 'groq_unavailable', 'A Groq não concluiu a consulta.');
            }
            const result = await readJson(response, 64 * 1024, invalidResponse());
            const choice = result?.choices?.[0];
            const content = choice?.message?.content;
            if (choice?.finish_reason !== 'stop' || typeof content !== 'string' || !content.trim()) throw invalidResponse();
            return { content: content.trim(), model };
        } catch (error) {
            if (signal.aborted) throw new ApiError(504, 'groq_timeout', 'A Groq excedeu o tempo de resposta.');
            if (error instanceof ApiError) throw error;
            throw new ApiError(502, 'groq_unavailable', 'Não foi possível conectar à Groq.');
        } finally {
            running = false;
        }
    };
}
