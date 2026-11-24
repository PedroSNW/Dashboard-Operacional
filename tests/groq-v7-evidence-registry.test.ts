import {authorPayload, generateAuthoredReport, AuthoringError} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {createGroqGuard} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {fixture} from './reports-v7-fixtures.mjs';
const core=(globalThis as any).ReportAuthoredCore;
const report=fixture(75);
report.indicators[0].indicador=report.indicators[1].indicador='Nome duplicado fictício';
const built=authorPayload(report,'groq','openai/gpt-oss-120b');
const context=JSON.parse(built.payload.messages![1].content);
const keys:string[]=context.indicators.map((row:any[])=>row[0]);
const omitted=built.pack.items.find((item:any)=>!keys.includes(item.key)).key;
const assert=(condition:unknown,message:string)=>{if(!condition)throw Error(message);};
assert(keys[0]!=='E0'&&keys.includes('E0')&&!keys.includes(omitted),'Fixture precisa reordenar e omitir');
assert(!context.columns.includes('id')&&built.coverage.partial,'Identidade ambígua');
assert(built.pack.facts['E0.latest'].indicatorId!==built.pack.facts['E1.latest'].indicatorId,'Nomes iguais confundiram IDs');
assert(JSON.stringify(built.allowedRefs)===JSON.stringify(keys.flatMap(key=>context.columns.map((field:string)=>key+'.'+field).filter((ref:string)=>Object.hasOwn(built.pack.facts,ref)))),'Registro diverge do payload');
const section=(refs:string[],claims:{ref:string;relation:string}[]=[],text='Orientação para avaliar os registros disponíveis.',type='summary')=>({type,title:'Síntese gerencial',text,refs,claims});
const decrease={ref:'E0.delta',relation:'decrease'};
const good=section(['E0.latest','E0.delta'],[decrease],'Houve redução no indicador do recorte. Consulte {{E0.latest}}.');
const response=(sections:any[],chartIds:string[]=['E0'])=>({title:'Análise gerencial',sections,recommendations:[],chartIds,limitations:[]});
async function generate(document:any){
    return await generateAuthoredReport(report,'groq',createGroqGuard(),k=>k==='GROQ_API_KEY'?'mock-key':undefined,async()=>{
        return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(document)}}]});
    });
}
async function reject(document:any){
    try{await generate(document);}catch(e){if(e instanceof AuthoringError)return e.diagnostic.validation as any;throw e;}
    throw Error('Resposta inválida aceita');
}
const info=console.info, logs:string[]=[];
console.info=(...args)=>logs.push(JSON.stringify(args));
try{
    const all=await generate(response(Array.from({length:5},()=>good)));
    assert(all.validation.acceptedSectionsCount===5&&!all.validation.partial,'Cinco seções válidas');
    const errors=[
        section(['E0']),section(['E0.invalidField']),section([omitted+'.latest']),
        section(['E1.latest'],[decrease]),section(['E0.latest'],[{ref:'E0.latest',relation:'decrease'}]),
    ];
    const invalid=await reject(response(errors));
    const diagnostics=invalid.sectionEvidenceDiagnostics;
    const expected=['invalid_ref_format','unknown_ref','ref_not_sent','claim_ref_not_in_section','claim_field_mismatch'];
    assert(invalid.rejectedSectionsCount===5&&invalid.acceptedSectionsCount===0,'Descarte coletivo');
    assert(diagnostics.every((entry:any,index:number)=>entry.sectionIndex===index&&entry.sectionType==='summary'&&entry.codes[0]===expected[index]),'Classificação por seção');
    assert(diagnostics[0].malformedReferenceCount===1&&diagnostics[1].unknownReferenceCount===1&&diagnostics[2].outOfScopeReferenceCount===1&&diagnostics[3].invalidClaimsCount===1,'Contagens');
    const partial=await generate(response([good,...errors]));
    assert(partial.validation.partial&&partial.document.sections.length===1,'Mistura factual');
    assert((await reject(response([section(['E0.delta'],[{ref:'E0.delta',relation:'increase'}])]))).validationCode==='claim_relation_factually_false','Relação falsa');
    const without=await generate(response([section([],[],'Hipótese para avaliar a qualidade dos registros.','hypothesis')]));
    assert(without.validation.sectionEvidenceDiagnostics[0].codes[0]==='qualitative_section_without_ref','Hipótese sem referências');
    assert((await reject(response([section([],[],'Houve redução no resultado.','hypothesis')]))).validationCode==='missing_refs','Fato sem refs');
    const missing=section([]) as any;
    delete missing.refs;
    assert((await reject(response([missing]))).sectionEvidenceDiagnostics[0].referenceState==='missing','Campo ausente');
    assert((await reject(response([section(['Nome duplicado fictício'])]))).validationCode==='invalid_ref_format','Nome aceito');
    assert((await reject(response([section(['E999.latest'])]))).validationCode==='unknown_ref','Indicador inventado');
    const withoutChart=await generate(response([good],[omitted]));
    assert(withoutChart.validation.partial&&withoutChart.validation.validationCode==='grafico_inexistente'&&!withoutChart.document.chartIds.length,'Gráfico omitido');
    assert((await reject(response([section(['E0.latest'],[],'Avaliar {{E999.latest}}.')]))).validationCode==='referencia_textual','Placeholder externo');
    const misleadingPosition=keys.findIndex((_,index)=>!keys.includes('E'+index));
    assert(misleadingPosition>=0,'Fixture precisa de posição que aponte para chave omitida');
    const repeated=await reject(response(Array.from({length:5},()=>section(['E'+misleadingPosition+'.latest']))));
    assert(repeated.sectionEvidenceDiagnostics.every((entry:any)=>entry.codes[0]==='ref_not_sent'),'Reprodução coletiva');
    assert(!core.checkClaim({ref:'E2.delta',relation:'improved'},built.pack),'Financeiro neutro julgado');
    const gap=fixture(1);
    gap.indicators[0].estatisticas.mensais.at(-1)!.valor=null;
    const gapBuilt=authorPayload(gap,'groq','openai/gpt-oss-120b');
    assert(gapBuilt.allowedRefs.includes('E0.latest')&&gapBuilt.pack.facts['E0.latest'].value===null&&!core.checkClaim({ref:'E0.latest',relation:'outside_target'},gapBuilt.pack),'Ausência virou resultado');
    assert(!JSON.stringify(logs).includes('Nome duplicado fictício')&&!JSON.stringify(logs).includes('inventada'),'Diagnóstico divulgou conteúdo');
    console.log('PASS registro serializado, cinco seções válidas, cinco erros, mistura, lacunas, neutralidade e privacidade');
}finally{console.info=info;}
