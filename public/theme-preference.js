// Antes do CSS: preferência pessoal, sem rede nem gravação no snapshot.
(() => {
    let theme='dark';
    try { if(localStorage.getItem('dgranel.theme')==='light')theme='light'; } catch {}
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
})();
