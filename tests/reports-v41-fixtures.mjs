import {buildReport} from '../supabase/functions/seguranca-viaria-ia/reports.js';
import {writeFileSync} from 'node:fs';
const labels=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const fixtures=[1,15,40].map(count=>{const stored={mesesLabels:labels,indicadores:Array.from({length:count},(_,i)=>({indicador:`Acidentes — indicador de teste ${i}`,setor:'Teste de Segurança',und:'Qtd',meta:0,direcaoDesempenho:'menor_melhor',valores:labels.map((_,n)=>n===2?null:n+i)}))};const report=buildReport(stored,{type:'comparativo',sector:'TODOS',ids:stored.indicadores.map((_,i)=>`indice:${i}`),start:'Jan',end:'Dez'});delete report.context;return {...report,basis:`fixture-v41-${count}`};});
writeFileSync('.validation-tools/reports-v41-fixtures.json',JSON.stringify(fixtures));
console.log('PASS fixtures isolados de 1, 15 e 40 indicadores, calculados pelo construtor V4 existente');
