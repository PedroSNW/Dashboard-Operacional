import {authorPayload, AuthoringError, generateAuthoredReport} from '../supabase/functions/seguranca-viaria-ia/report-authoring.ts';
import {createGroqGuard} from '../supabase/functions/seguranca-viaria-ia/groq-policy.js';
import {GROQ_PROPOSAL_TYPES, GROQ_WIRE_SCHEMA_NAME, expandGroqAuthoring} from '../supabase/functions/seguranca-viaria-ia/groq-authoring-wire.ts';
import {fixture, authored, wireDocument} from './reports-v7-fixtures.mjs';
import {prepareProbeCases, runProbeCase} from './groq-v7-controlled-protocol.ts';

const C=(globalThis as any).ReportAuthoredCore;
const report=fixture(2);
const wire=wireDocument(authored(2));
wire.recommendations=GROQ_PROPOSAL_TYPES.map((type,index)=>({...wire.recommendations[index%3],type}));
const expected=['recommendation','campaign','action','evolution'];
const assert=(ok:unknown,message:string)=>{if(!ok)throw Error(message);};
const success=(value:unknown)=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]});
const body=JSON.parse(authorPayload(report,'groq','openai/gpt-oss-120b').body);
const schema=body.response_format.json_schema.schema;
const proposalTypes=(s:any)=>s.properties.recommendations.items.properties.type.enum;
assert(body.model==='openai/gpt-oss-120b'&&body.response_format.type==='json_schema'&&body.response_format.json_schema.strict===true&&body.response_format.json_schema.name===GROQ_WIRE_SCHEMA_NAME,'Envelope estrito');
assert(body.reasoning_effort==='medium'&&body.include_reasoning===false&&JSON.stringify(proposalTypes(schema))===JSON.stringify(expected),'Enum e raciocínio');
for(const type of expected)assert(body.messages[0].content.includes(type+' = '),'Categoria sem orientação');
assert(!C.checkSchema(wire,schema).length,'Enum misto');
const proposals=expandGroqAuthoring(wire).sections.filter((section:any)=>section.proposal);
assert(JSON.stringify(proposals.map((section:any)=>section.type))===JSON.stringify(expected),'Conversão de tipos');
assert(JSON.stringify(proposals.map((section:any)=>section.refs))===JSON.stringify(wire.recommendations.map((section:any)=>section.refs)),'Referências alteradas');
for(const type of ['', 'PRIVATE_ENUM', 'Campaign']){
    const invalid=structuredClone(wire);
    invalid.recommendations[1].type=type;
    assert(C.checkSchema(invalid,schema).includes('$.recommendations.1.type:enum'),'Índice ou enum não validado');
    let rejected=false;
    try{expandGroqAuthoring(invalid);}catch(e){rejected=e instanceof Error&&e.message==='INVALID_WIRE_PROPOSAL_TYPE';}
    assert(rejected,'Conversão aceitou tipo inválido');
}
const cases=await prepareProbeCases({volume:2,prompt:'production',completion:3072,recommendationEnum:true});
const answers={A:{recommendations:[{type:'campaign'}]},B:{recommendations:expected.map(type=>({type}))},C:wire};
for(const kind of ['A','B','C'] as const){
    const result=await runProbeCase(cases[kind],'mock',async(_url,init)=>{
        const payload=JSON.parse(String(init?.body));
        const format=payload.response_format;
        assert(format.json_schema.strict===true&&JSON.stringify(proposalTypes(format.json_schema.schema))===JSON.stringify(expected),'Schema serializado do caso '+kind);
        return success(answers[kind]);
    });
    assert(result.outcome==='schema_valid','Caso '+kind);
}
const log=console.info, logs:string[]=[];
console.info=(...args)=>logs.push(JSON.stringify(args));
try{
    const invalid=structuredClone(wire);
    invalid.recommendations[1].type='PRIVATE_ENUM';
    invalid.recommendations[1].title='PRIVATE_CONTENT';
    for(const source of ['message','generation','both']){
        const error={
            code:'json_validate_failed',
            message:source==='generation'?'PRIVATE_MESSAGE':"Generated JSON does not match the expected schema. Error: jsonschema: '/recommendations/1/type' does not validate with /properties/recommendations/items/properties/type/enum: PRIVATE_MESSAGE",
            ...(source==='message'?{}:{failed_generation:JSON.stringify(invalid)})
        };
        let calls=0;
        try{
            await generateAuthoredReport(report,'groq',createGroqGuard(),key=>key==='GROQ_API_KEY'?'PRIVATE_KEY':undefined,async()=>{
                calls++;
                return Response.json({error},{status:400,headers:{'x-request-id':'req_enum_fixture'}});
            });
            throw Error('Falha foi convertida em sucesso');
        }catch(e){
            if(!(e instanceof AuthoringError))throw e;
            const d=e.diagnostic.validation;
            assert(e.status===400&&calls===1&&e.diagnostic.code==='json_validate_failed','Status ou retry incorreto');
            assert(d?.validationStage==='provider_schema_validation'&&d.validationCategory==='enum_mismatch'&&d.arrayIndex===1&&d.schemaField==='recommendations[].type'&&d.enumName==='GROQ_PROPOSAL_TYPES','Diagnóstico de enum');
            assert(d?.providerRequestId==='req_enum_fixture'&&d.strict===true&&d.schemaName===GROQ_WIRE_SCHEMA_NAME,'Correlação com payload');
            assert(d?.confirmedInFailedGeneration===(source!=='message')&&d.reportedByProvider===(source!=='generation'),'Origem da confirmação');
            assert(!JSON.stringify(e.diagnostic).includes('PRIVATE_'),'Vazamento no erro');
        }
    }
    assert(!logs.join('').includes('PRIVATE_'),'Vazamento nos logs');
}finally{console.info=log;}
console.log('PASS enum estrito A/B/C, quatro categorias, conversão, referência e HTTP 400 sanitizado');
