import {AuthoringError, generateAuthoredReport} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {createGroqGuard} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {fixture, authored, wireDocument} from './reports-v7-fixtures.mjs';
const C=(globalThis as any).ReportAuthoredCore;
const report=fixture(4);
const pack=C.evidence(report);
const assert=(condition:unknown,message:string)=>{if(!condition)throw Error(message);};
const synthetic=()=>wireDocument(authored(2));
const hypothesis={type:'hypothesis',title:'Hipótese operacional',text:'Investigar possíveis fatores operacionais antes de selecionar uma intervenção.',refs:[],claims:[]};
async function generate(wire:any){
    const transport:typeof fetch=async(_url,init)=>{
        const payload=JSON.parse(String(init?.body));
        assert(payload.response_format.json_schema.strict&&payload.reasoning_effort==='medium','Contrato Groq');
        return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(wire)}}]});
    };
    return generateAuthoredReport(report,'groq',createGroqGuard(),key=>key==='GROQ_API_KEY'?'mock-key':undefined,transport);
}
async function firstClaimError(refs:string[],claim:string){
    const wire=synthetic();
    wire.sections=[{...wire.sections[0],text:'Conferir os registros disponíveis.',refs,claims:[claim]}];
    wire.recommendations=[];
    try{await generate(wire);}catch(e){
        if(!(e instanceof AuthoringError))throw e;
        return (e.diagnostic.validation?.sectionEvidenceDiagnostics as any[])[0].claimIssues[0];
    }
    throw Error('Claim inválido aceito');
}
const info=console.info,logs:string[]=[];
console.info=(...values)=>logs.push(JSON.stringify(values));
try{
    for(const [ref,relation] of [['E0.delta','decrease'],['E1.delta','increase'],['E0.latest','outside_target'],['E2.delta','decrease']]){
        assert(C.checkClaim({ref,relation},pack),'Claim válido recusado');
    }
    for(const [refs,claim,code] of [
        [['E0.latest'],'E0.latest|decrease','claim_field_mismatch'],
        [['E0.delta'],'E0.delta|increase','claim_relation_factually_false'],
        [['E1.latest'],'E0.delta|decrease','claim_ref_not_in_section'],
        [['E2.latest'],'E2.latest|within_target','claim_direction_not_validated'],
        [['E2.delta'],'E2.delta|improved','claim_direction_not_validated'],
        [['E0.delta'],'E0.delta|PRIVATE_RELATION','claim_relation_unsupported'],
    ] as const){
        const issue=await firstClaimError([...refs],claim);
        assert(issue.referenceExists&&issue.referenceSent&&issue.claimIndex===0&&issue.codes.includes(code),code);
    }
    const gap=fixture(1);
    gap.indicators[0].estatisticas.mensais.at(-1)!.valor=null;
    assert(C.claimIssue({ref:'E0.latest',relation:'outside_target'},C.evidence(gap))==='claim_value_missing','Nulo virou resultado');
    const neutral=fixture(1);
    neutral.indicators[0].direcaoDesempenho=null;
    assert(C.claimIssue({ref:'E0.delta',relation:'improved'},C.evidence(neutral))==='claim_direction_not_validated','Direção ausente');
    const wire=synthetic();
    wire.sections[0].refs=['E0.latest'];
    wire.sections.push(hypothesis);
    wire.recommendations[0].objective='Diminuir acidentes por meio de ações preventivas.';
    wire.recommendations[1].text='Investigar medidas para reduzir acidentes.';
    wire.recommendations[2].monitoring='Prazo sugerido: 90 dias. Conferir registros autorizados.';
    const result=await generate(wire);
    assert(result.validation.acceptedSectionsCount===6&&!result.validation.partial,'Seis seções');
    assert(result.document.sections[0].refs.includes('E0.delta')&&result.validation.sectionEvidenceDiagnostics[0].repairedClaimRefs===1,'Reparo não auditado');
    assert(result.document.sections.filter((s:any)=>s.proposal).map((s:any)=>s.proposal.days).join(',')==='30,60,90','Horizontes');
    for(const [text,type,refs,claims,expected] of [
        ['Os acidentes diminuíram.','hypothesis',[],[],'missing_refs'],
        ['A redução pode estar relacionada a uma campanha.','hypothesis',[],[],'missing_refs'],
        ['A redução pode estar relacionada a uma campanha.','hypothesis',['E0.delta'],[{ref:'E0.delta',relation:'decrease'}],null],
        ['A campanha causou a redução.','hypothesis',['E0.delta'],[{ref:'E0.delta',relation:'decrease'}],'causalidade_nao_comprovada'],
        ['Os acidentes diminuíram 35%.','summary',['E0.delta'],[{ref:'E0.delta',relation:'decrease'}],'numero_livre'],
        ['A Quantidade de prejuízos diminuiu.','summary',['E0.delta','E1.delta'],[{ref:'E0.delta',relation:'decrease'}],'comparacao_sem_afirmacao_estruturada'],
        ['{{E0.latest}} superou {{E1.latest}}.','summary',['E0.latest','E1.latest'],[],'comparacao_entre_indicadores'],
    ] as const){
        const doc:any=authored(1);
        Object.assign(doc.sections[0],{text,type,refs,claims});
        const checked=C.validate(doc,pack);
        assert(expected?checked.issues.some((i:any)=>i.codes.includes(expected))&&!checked.valid:checked.valid,'Semântica: '+text);
    }
    const mixed=synthetic();
    mixed.recommendations[0].actions=['Acompanhar'];
    mixed.recommendations[1].monitoring='O atraso foi de 60 dias.';
    mixed.recommendations[2].monitoring='Prazo sugerido: 30 dias.';
    const partial=await generate(mixed);
    assert(partial.validation.partial&&partial.validation.rejectedSectionsCount===2&&partial.validation.reviewableIssuesCount>0,'Mistura editorial e bloqueante');
    assert(!logs.join('').includes('PRIVATE_RELATION')&&!logs.join('').includes('Quantidade de prejuízos'),'Vazamento nos logs');
    console.log('PASS claims, seis seções, prazos tipados, hipóteses, comparação e resposta mista');
}finally{console.info=info;}
