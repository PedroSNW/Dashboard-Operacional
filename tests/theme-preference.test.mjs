import {readFileSync} from 'node:fs';
const code=readFileSync('public/theme-preference.js','utf8');
for(const [value,expected]of [['light','light'],['dark','dark'],[null,'dark'],['invalid','dark'],['blocked','dark']]){
    const document={documentElement:{dataset:{},style:{}}};
    const localStorage={getItem:()=>{if(value==='blocked')throw Error('Storage bloqueado');return value;}};
    new Function('document','localStorage',code)(document,localStorage);
    if(document.documentElement.dataset.theme!==expected||document.documentElement.style.colorScheme!==expected)throw Error('Bootstrap de tema: '+value);
}
console.log('PASS bootstrap antes do CSS: claro/escuro, preferência ausente/inválida e armazenamento bloqueado');
