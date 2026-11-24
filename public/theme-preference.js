// Resolve a preferência antes de carregar o CSS.
(() => {
    const scheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
    const stored = () => {
        try {
            const value = localStorage.getItem('dgranel.theme');
            if (value === 'light' || value === 'dark') return value;
        } catch {}
        return null;
    };
    const preferred = () => stored() ?? (scheme?.matches ? 'dark' : 'light');
    const theme = preferred();
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    globalThis.DGranelTheme = { stored, preferred, scheme };
})();
