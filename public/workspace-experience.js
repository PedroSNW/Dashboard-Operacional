(() => {
    const $ = id => document.getElementById(id);
    let dialog, notice, origin, retrying = false;
    const date = new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'});
    function refresh() {
        const ready = supabaseReady && supabaseStateLoaded && Boolean(pendingTracker.reference);
        if (notice) notice.hidden = !currentSession || ready;
        if (!dialog?.open) return;
        if (!currentSession) {dialog.close();return;}
        const confirmed = pendingTracker.version ? new Date(pendingTracker.version) : null;
        $('workspaceDataState').textContent = retrying ? 'Consultando o Supabase…'
            : ready ? 'Base sincronizada' : 'Leitura indisponível';
        $('workspaceDataState').dataset.state = retrying ? 'loading' : ready ? 'success' : 'error';
        $('workspaceDataCutoff').textContent = confirmed && Number.isFinite(confirmed.valueOf()) ? date.format(confirmed)+' (Brasília)' : 'Sem leitura confirmada nesta sessão';
        $('workspaceDataPending').textContent = isSavingState ? 'Salvamento em andamento' : hasUnsavedChanges
            ? 'Alterações locais aguardam confirmação de salvamento' : 'Nenhuma alteração pendente';
        $('workspaceDataRetry').hidden = ready || hasUnsavedChanges;
        $('workspaceDataRetry').disabled = retrying || isSavingState;
        $('workspaceDataReview').hidden = !hasUnsavedChanges;
    }
    function open(from) {
        if (!currentSession || dialog.open) return;
        origin = from;
        $('workspaceDataMessage').textContent = '';
        dialog.showModal();
        refresh();
    }
    window.DGranelDataStatus = {refresh};

    document.addEventListener('DOMContentLoaded',() => {
        const sync = $('v3Sync');
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'workspace-data-trigger';
        trigger.setAttribute('aria-haspopup','dialog');
        trigger.setAttribute('aria-label','Dados e privacidade');
        sync.replaceWith(trigger);
        trigger.append(sync);
        trigger.onclick = () => open(trigger);
        $('workspaceDataMenu').onclick = () => {
            const settings = $('headerToolsMenu');
            settings.open = false;
            open(settings.querySelector('summary'));
        };
        const skip = document.createElement('a');
        skip.className = 'workspace-skip';
        skip.href = '#workspaceMain';
        skip.textContent = 'Ir para o conteúdo';
        skip.onclick = event => {event.preventDefault();$('workspaceMain').focus();};
        document.body.prepend(skip);

        notice = document.createElement('section');
        notice.className = 'workspace-data-notice';
        notice.hidden = true;
        notice.setAttribute('aria-label','Disponibilidade dos dados');
        const state = document.createElement('p');
        state.textContent = 'A base corporativa está indisponível. Consulte o estado da leitura para sincronizar novamente.';
        const inspect = document.createElement('button');
        inspect.type = 'button';
        inspect.className = 'v3-button';
        inspect.textContent = 'Ver estado dos dados';
        inspect.setAttribute('aria-haspopup','dialog');
        inspect.onclick = () => open(inspect);
        notice.append(state,inspect);
        $('workspaceLoading').after(notice);

        dialog = document.createElement('dialog');
        dialog.id = 'workspaceDataDialog';
        dialog.className = 'workspace-data-dialog';
        dialog.setAttribute('aria-labelledby','workspaceDataTitle');
        dialog.innerHTML = [
            '<div class="workspace-data-head"><h2 id="workspaceDataTitle">Dados e privacidade</h2>',
            '<form method="dialog"><button class="v3-button" autofocus>Fechar</button></form></div>',
            '<section class="workspace-data-summary"><p id="workspaceDataState" role="status"></p>',
            '<dl><dt>Origem</dt><dd>Base corporativa no Supabase</dd>',
            '<dt>Última base confirmada</dt><dd id="workspaceDataCutoff"></dd>',
            '<dt>Salvamento</dt><dd id="workspaceDataPending"></dd></dl>',
            '<div class="workspace-data-actions"><button type="button" class="v3-button" id="workspaceDataRetry" hidden>Tentar sincronizar</button>',
            '<button type="button" class="v3-button" id="workspaceDataReview" hidden>Revisar alterações</button></div>',
            '<p id="workspaceDataMessage" role="status"></p></section>',
            '<dl class="workspace-data-policy">',
            '<div><dt>Dados compartilhados</dt><dd>Alterações de indicadores entram na base corporativa após a confirmação de salvamento.</dd></div>',
            '<div><dt>OnePage e preferências</dt><dd>Layouts da OnePage, tema e preferências de visualização ficam neste navegador. PDF e PowerPoint são gerados aqui e baixados para o seu dispositivo.</dd></div>',
            '<div><dt>Uso da IA</dt><dd>Ao acionar a IA, a Groq recebe um recorte agregado autorizado. O contexto gerencial dos relatórios é incluído se você habilitar o compartilhamento.</dd></div>',
            '<div><dt>Competências</dt><dd>Os registros podem ser revisados após o corte. Um valor ausente indica falta de registro. Zero é um valor informado.</dd></div></dl>',
        ].join('');
        document.body.append(dialog);
        $('workspaceDataReview').onclick = () => {dialog.close();window.PendingChangesUI?.open();};
        $('workspaceDataRetry').onclick = async () => {
            if (retrying || hasUnsavedChanges || isSavingState) return;
            retrying = true;
            $('workspaceDataMessage').textContent = '';
            refresh();
            try {
                await carregarDadosCompartilhados(true);
                if (dialog.open && !supabaseStateLoaded) $('workspaceDataMessage').textContent = 'A leitura segue indisponível. Tente sincronizar novamente.';
            } finally {
                retrying = false;
                refresh();
            }
        };
        dialog.addEventListener('close',()=> {
            if (!document.querySelector('dialog[open]') && currentSession) origin?.focus();
        });
        refresh();
    });
})();
