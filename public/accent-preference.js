(() => {
    const storageKey = 'dgranel.accent';
    const choices = new Set(['purple', 'gold', 'blue', 'red']);
    const root = document.documentElement;
    const normalize = value => choices.has(value) ? value : 'purple';
    let stored;
    try { stored = localStorage.getItem(storageKey); } catch {}
    root.dataset.accent = normalize(stored);

    const syncControls = () => {
        const selected = document.querySelector(`#accentPalette input[value="${root.dataset.accent}"]`);
        if (selected) selected.checked = true;
    };
    const apply = value => {
        const next = normalize(value);
        const changed = next !== root.dataset.accent;
        root.dataset.accent = next;
        syncControls();
        if (changed) {
            // As animações já estão desativadas. O modo padrão atualiza as opções compartilhadas dos pontos.
            for (const chart of Object.values(window.Chart?.instances ?? {})) chart.update();
        }
    };

    document.addEventListener('DOMContentLoaded', syncControls, { once: true });
    document.addEventListener('change', event => {
        const input = event.target;
        if (!input.matches?.('#accentPalette input[type="radio"]') || !input.checked || !choices.has(input.value)) return;
        apply(input.value);
        try { localStorage.setItem(storageKey, input.value); } catch {}
    });
    window.addEventListener('storage', event => {
        if (event.key === storageKey || event.key === null) apply(event.key === null ? null : event.newValue);
    });
})();
