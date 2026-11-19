// Optional, ONE paid/quota-consuming call using fictitious data only. Never deploys or touches Supabase.
import {generateAuthoredReport,AuthoringError} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {createGroqGuard} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {fixture} from './reports-v7-fixtures.mjs';
if(!Deno.args.includes('--confirm-live'))throw Error('Use --confirm-live para autorizar uma única chamada real com dados fictícios.');
const apiKey=Deno.env.get('GROQ_API_KEY');if(!apiKey)throw Error('GROQ_API_KEY não disponível no ambiente local. Nenhuma chamada executada.');
try{const result=await generateAuthoredReport(fixture(1),'groq',createGroqGuard(),key=>key==='GROQ_API_KEY'?apiKey:undefined);console.log({validated:true,sectionCount:result.document.sections.length,reviewRequired:result.validation.reviewRequired,meta:result.meta});}
catch(error){if(error instanceof AuthoringError){console.log({validated:false,httpStatus:error.status,diagnostic:error.diagnostic,retryAfter:error.retryAfter??null});Deno.exitCode=1;}else throw Error('Falha inesperada do teste real. Nenhum conteúdo foi registrado.');}
