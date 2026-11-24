import {readFileSync} from 'node:fs';
const code=readFileSync('public/theme-preference.js','utf8');
for (const [value, systemDark, expected] of [
    ['light', true, 'light'], ['dark', false, 'dark'],
    [null, true, 'dark'], [null, false, 'light'],
    ['invalid', true, 'dark'], ['blocked', false, 'light']
]) {
    const document = { documentElement: { dataset: {}, style: {} } };
    const localStorage = { getItem: () => { if (value === 'blocked') throw Error('Storage bloqueado'); return value; } };
    const scope = { matchMedia: () => ({ matches: systemDark }) };
    new Function('document', 'localStorage', 'globalThis', code)(document, localStorage, scope);
    if (document.documentElement.dataset.theme !== expected || document.documentElement.style.colorScheme !== expected || scope.DGranelTheme.preferred() !== expected) {
        throw Error(`Bootstrap de tema: ${value}, sistema escuro ${systemDark}`);
    }
}
console.log('PASS bootstrap antes do CSS: preferência pessoal, sistema e armazenamento bloqueado');
