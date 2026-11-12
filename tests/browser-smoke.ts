// Gera uma cópia isolada da interface real, sem rede e sem credenciais reais.
const root = new URL('../',import.meta.url);
let html = await Deno.readTextFile(new URL('public/index.html',root));
const main = await Deno.readTextFile(new URL('public/main.js',root));
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,'');
const setup = `
window.__errors=[];addEventListener('error',e=>window.__errors.push(e.message));addEventListener('unhandledrejection',e=>window.__errors.push(String(e.reason)));
window.Chart={register(){},defaults:{plugins:{}},getChart(){return null}};window.ChartDataLabels={};
window.Swal={fire:async()=>({isConfirmed:false})};
window.__session=null;window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:window.__session}}),onAuthStateChange(){}}})};
window.fetch=async(url,init)=>{window.__payload=JSON.parse(init.body);return {ok:true,json:async()=>({success:true,contextVersion:1,model:'mock',response:'Resultados verificados — soma: 6',meta:{}})}};
`;
const checks = `
addEventListener('load',async()=>{
 const status=document.createElement('pre');status.id='validation-result';document.body.append(status);
 try {
  if(currentData.length!==0)throw Error('Exemplos instalados sem sessão');
  currentData=[{indicador:'Total de acidentes',setor:'Sinistros',und:'Qtd',meta:3,valores:[2,4],direcaoDesempenho:'menor_melhor'}];mesesLabels=['Jan','Fev'];supabaseStateLoaded=true;supabaseReady=true;hasUnsavedChanges=false;
  window.__session={access_token:'mock-browser-token'};
  document.getElementById('aiPromptInput').value='Analise acidentes';
  await executarTesteIA('groq');
  if(document.getElementById('aiResponseBody').textContent!=='Resultados verificados — soma: 6')throw Error('Renderização resposta');
  if(document.getElementById('aiTestButton').disabled)throw Error('Botão não reativado');
  if(window.__payload.context.indicadores[0].valores[1]!==4)throw Error('Payload incorreto');
  if(!document.getElementById('aiResponseMeta').textContent.includes('1/1'))throw Error('Cobertura ausente');
  if(window.__errors.length)throw Error(window.__errors.join(';'));
  status.textContent='PASS: inicialização sem sessão, payload Groq, resposta textContent, cobertura e botão reativado; sem erros JS. Bibliotecas externas simuladas.';
 }catch(e){status.textContent='FAIL: '+e.message+'; erros: '+window.__errors.join(';');}
});`;
const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:">`;
html = html.replace('<head>',()=>'<head>'+csp+`<script>${setup}</script>`).replace('</body>',()=>`<script>${main.replace(/<\/script/gi,'<\\/script')}</script><script>${checks}</script></body>`);
await Deno.writeTextFile(new URL('.validation-tools/browser-smoke.html',root),html);
console.log('Fixture isolada gerada em .validation-tools/browser-smoke.html');
