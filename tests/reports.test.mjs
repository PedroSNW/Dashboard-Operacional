import {buildReport} from '../supabase/functions/seguranca-viaria-ia/reports.js';
const assert=(v,m)=>{if(!v)throw Error(m);};
const labels=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const stored={mesesLabels:labels,indicadores:[{indicador:'Acidentes',setor:'Sinistros',und:'Qtd',meta:0,direcaoDesempenho:'menor_melhor',valores:[10,null,0,20,3,4,5,6,7,8,9,10]},{indicador:'Taxa',setor:'Frota',und:'%',meta:0,direcaoDesempenho:'neutro',valores:Array(12).fill(5)}]};
const original=JSON.stringify(stored);
const selection={type:'mensal',sector:'Sinistros',ids:['indice:0'],start:'Jan',end:'Jan'};
let r=buildReport(stored,selection);assert(r.indicators[0].estatisticas.soma===10&&!r.aiUsed,'Mensal sem IA');
r=buildReport(stored,{...selection,type:'trimestral',end:'Mar'});assert(r.indicators[0].estatisticas.soma===10&&r.indicators[0].estatisticas.ausentes===1&&r.indicators[0].estatisticas.validos===2,'Trimestral nulos/zero');
r=buildReport(stored,{...selection,type:'anual',end:'Dez'});assert(r.competencias.length===12,'Anual');
r=buildReport(stored,{...selection,type:'comparativo',start:'Mar',end:'Abr'});assert(r.indicators[0].estatisticas.soma===20&&r.indicators[0].estatisticas.primeiroUltimo.percentual===null,'Intervalo base zero');
r=buildReport(stored,{type:'executivo',sector:'TODOS',ids:['indice:0','indice:1'],start:'Jan',end:'Dez'});assert(r.indicators.length===2&&r.indicators[1].estatisticas.soma===null&&!r.indicators[1].critical,'Setores, taxas e neutro');
r=buildReport(stored,{type:'critico',sector:'TODOS',ids:['indice:0','indice:1'],start:'Jan',end:'Dez'});assert(r.indicators.length===1&&r.indicators[0].meta===0,'Crítico/meta zero');
for(const bad of [{...selection,end:'Mar'},{...selection,type:'trimestral',end:'Abr'},{...selection,sector:'Frota'},{...selection,ids:['ausente']},{...selection,start:'Dez',end:'Jan'}]){let rejected=false;try{buildReport(stored,bad);}catch{rejected=true;}assert(rejected,'Seleção inválida aceita');}
let rejected=false;try{buildReport(null,selection);}catch{rejected=true;}assert(rejected,'Estado ausente');
assert(JSON.stringify(stored)===original,'Snapshot alterado');
let stale=false;try{buildReport(stored,{...selection,expectedIndicators:[{id:'indice:0',indicador:'Nome antigo',setor:'Sinistros'}]});}catch{stale=true;}assert(stale,'Identidade alterada aceita');
console.log('PASS relatórios mensal/trimestral/anual/comparativo/crítico/executivo, setor, IDs, período, nulos, meta zero, neutro, sem IA, imutabilidade e falha de leitura');
