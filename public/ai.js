async function requestDashboardEdge(payload) {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data?.session?.access_token) throw Error('Sessão indisponível. Faça login novamente.');
    let response;
    try {
        response = await fetch(SUPABASE_AI_FUNCTION_ENDPOINT, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_PUBLISHABLE_KEY,
                Authorization: 'Bearer ' + data.session.access_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch {
        throw Error('Não foi possível conectar ao serviço. Verifique a conexão e tente novamente.');
    }
    const body = await response.json().catch(() => null);
    if (response.ok && body?.success) return body;
    const diagnostic = body?.diagnosticId ?? response.headers.get('X-DGranel-Diagnostic-Id');
    const message = typeof body?.error === 'string' ? body.error : 'O serviço não concluiu a operação.';
    const failure = Error(message + (typeof diagnostic === 'string' && /^[a-z\d-]{1,80}$/i.test(diagnostic)
        ? ' (diagnóstico ' + diagnostic + ')' : ''));
    failure.retryAfter = response.status === 429 ? Math.max(1, Math.min(86400, Number(body?.retryAfter ?? response.headers.get('Retry-After')) || 60)) : 0;
    throw failure;
}

document.addEventListener('DOMContentLoaded', () => {
    const byId = id => document.getElementById(id);
    const form = byId('aiQuestionForm');
    if (!form) return;
    const input = byId('aiPromptInput');
    const button = byId('aiTestButton');
    const status = byId('aiStatusText');
    const dot = byId('aiStatusDot');
    const container = byId('aiResponseContainer');
    const body = byId('aiResponseBody');
    const meta = byId('aiResponseMeta');
    window.resetAIConversation = () => {
        container.classList.add('hidden');
        body.textContent = '';
        meta.textContent = '';
        status.textContent = 'Pronto para envio';
        dot.className = 'h-2 w-2 rounded-full bg-slate-500';
    };
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question || button.disabled) return;
        const owner = currentSession?.user?.id;
        let retryAfter = 0;
        button.disabled = true;
        container.classList.remove('hidden');
        container.setAttribute('aria-busy', 'true');
        status.textContent = 'Consultando a Groq…';
        dot.className = 'h-2 w-2 rounded-full bg-amber-400';
        body.textContent = '';
        meta.textContent = '';
        window.DGranelMotion?.aiState('loading');
        try {
            if (!owner || !supabaseStateLoaded || !supabaseReady) throw Error('Carregue os indicadores do Supabase antes de consultar.');
            if (hasUnsavedChanges) throw Error('Salve as alterações antes de consultar os indicadores.');
            const result = await requestDashboardEdge({ action: 'chat', question });
            if (owner !== currentSession?.user?.id) return;
            body.textContent = result.response;
            if (Array.isArray(result.evidence) && result.evidence.length) {
                const details = document.createElement('details');
                const summary = document.createElement('summary');
                summary.textContent = 'Indicadores oficiais consultados';
                details.className = 'mt-4 border-t border-slate-700 pt-3';
                details.append(summary);
                for (const line of result.evidence) {
                    const row = document.createElement('p');
                    row.textContent = line;
                    details.append(row);
                }
                body.append(details);
            }
            meta.textContent = result.coverage ? result.coverage.sent + ' de ' + result.coverage.selected + ' indicadores no contexto' : '';
            status.textContent = 'Resposta da Groq';
            dot.className = 'h-2 w-2 rounded-full bg-emerald-400';
        } catch (error) {
            if (owner !== currentSession?.user?.id) return;
            retryAfter = error.retryAfter || 0;
            status.textContent = 'Consulta indisponível';
            dot.className = 'h-2 w-2 rounded-full bg-rose-400';
            body.textContent = error.message + (retryAfter ? ' Tente novamente em ' + retryAfter + ' s.' : '');
        } finally {
            container.setAttribute('aria-busy', 'false');
            window.DGranelMotion?.aiState('complete');
            if (retryAfter) setTimeout(() => { button.disabled = false; }, retryAfter * 1000);
            else button.disabled = false;
        }
    });
});
