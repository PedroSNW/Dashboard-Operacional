import {analysisPresentation,analyzeIndicator,scopeAnalysis} from '../supabase/functions/seguranca-viaria-ia/analytics.js';
const assert=(v,m)=>{if(!v)throw Error(m);};
const item={id:'culpa',indicador:'Acidentes com culpa',unidade:'Qtd',direcaoDesempenho:'menor_melhor',meta:0,valores:[11,12,8,17,21,13,16,17,10,9]};
const context={indicadores:[item],competencias:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out'],totalIndicadoresNoDashboard:75,contextoParcial:false};
item.estatisticas=analyzeIndicator(item,context.competencias);
const schema=()=>({resumo:[{id:'culpa',stat:'media',competencia:''}],fatos:[],atencao:[{id:'culpa',stat:'ultimo_vs_media',competencia:'Out'}],hipoteses:[],recomendacoes:['investigar_registros'],limitacoes:[]});
let p=analysisPresentation(context,JSON.stringify(schema()),'Analise acidentes');
assert(p.structured&&p.rejections.length===0&&p.summary.includes('Out: 9, abaixo à média 13,4'),'Comparação estruturada');
assert(p.summary.includes('Investigar os registros autorizados'),'Recomendação válida');
let bad=schema();bad.atencao=[{id:'culpa',stat:'ultimo_vs_media',competencia:'Out',valor:999}];
p=analysisPresentation(context,JSON.stringify(bad));
assert(p.rejections.length===1&&!p.summary.includes('999')&&p.summary.includes('13,4'),'Valor inventado');
bad=schema();bad.resumo=[{id:'fora-contexto',stat:'media',competencia:''}];
p=analysisPresentation(context,JSON.stringify(bad));assert(p.summary.includes('13,4'),'Referência inválida com fallback');
for(const invalid of ['{"resumo":','[]','{"resumo":[999]}','Resumo executivo\nPontos de atenção\nRecomendações\nA média é 999.']){
 p=analysisPresentation(context,invalid,'Analise');
 assert(p.summary.includes('13,4')&&!p.summary.includes('999')&&!p.summary.includes('estrutura_invalida'),'Fallback discreto');
 const lines=p.summary.split('\n');for(let i=0;i<lines.length;i++)if(['Resumo executivo','Resultados relevantes','Pontos de atenção','Hipóteses para investigação','Recomendações','Limitações importantes'].includes(lines[i]))assert(lines[i+1]&&!['Resumo executivo','Resultados relevantes','Pontos de atenção','Hipóteses para investigação','Recomendações','Limitações importantes'].includes(lines[i+1]),'Título vazio');
}
bad=schema();bad.fatos=[...bad.resumo];
p=analysisPresentation(context,JSON.stringify(bad));assert(p.summary.split('Acidentes com culpa: média').length===2,'Duplicação');
p=analysisPresentation(context,JSON.stringify(schema()),'Qual foi a média de acidentes com culpa?');
assert(p.summary==='Acidentes com culpa: média 13,4 Qtd.','Resposta simples');
p=analysisPresentation(context,'Recomendações\nRecomenda-se conferir os registros autorizados.');
assert(p.summary.includes('Recomenda-se conferir'),'Fallback conserva recomendação');
console.log('PASS JSON válido/inválido, comparação referenciada, referência/valor inventado, deduplicação, títulos, resposta simples e recomendação fallback');
