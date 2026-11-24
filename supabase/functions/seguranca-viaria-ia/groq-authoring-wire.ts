// Groq transport contract. The internal editor/evidence contract remains unchanged.
import './report-authored-core.js';
const str={type:'string'},list={type:'array',items:str};
const object=(properties:Record<string,any>)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const GROQ_WIRE_SCHEMA_NAME='authored_report_wire_v3';
export const GROQ_PROPOSAL_TYPES=['recommendation','campaign','action','evolution'] as const;
const proposalType={type:'string',enum:GROQ_PROPOSAL_TYPES};
export const GROQ_PROPOSAL_TYPE_INSTRUCTION='Em recommendations[].type: recommendation = recomendação, campaign = campanha, action = ação operacional, evolution = etapa do plano.';
export const GROQ_PROPOSAL_ENUM_PROBE_SCHEMA=object({recommendations:{type:'array',items:object({type:proposalType})}});
const claim=object({ref:str,relation:{type:'string',enum:(globalThis as any).ReportAuthoredCore.relations}});
export const GROQ_AUTHORING_WIRE_SCHEMA=object({title:str,
    sections:{type:'array',items:object({type:{type:'string',enum:['summary','advances','challenges','integrated','priorities','hypothesis','conclusion']},title:str,text:str,refs:list,claims:{type:'array',items:claim}})},
    recommendations:{type:'array',items:object({type:proposalType,title:str,text:str,refs:list,
        problem:str,objective:str,actions:list,owner:str,days:{type:'integer',enum:[0,30,60,90]},monitoring:str,completion:str,foundation:{type:'string',enum:['direct','descriptive','investigation','preventive']}})},
    chartIds:list,limitations:list});

export function expandGroqAuthoring(wire:any){
    const sections=wire.sections.map((s:any,index:number)=>({
        id:'section_'+(index+1),type:s.type,title:s.title,text:s.text,refs:[...s.refs],
        claims:s.claims.map((claim:{ref:string;relation:string})=>({...claim})),proposal:null
    }));
    for(const [index,p] of wire.recommendations.entries()){
        if(!GROQ_PROPOSAL_TYPES.some(type=>type===p.type))throw Error('INVALID_WIRE_PROPOSAL_TYPE');
        sections.push({id:'proposal_'+(index+1),type:p.type,title:p.title,text:p.text,refs:[...p.refs],claims:[],
            proposal:{problem:p.problem,objective:p.objective,actions:[...p.actions],owner:p.owner,days:p.days,monitoring:p.monitoring,completion:p.completion,foundation:p.foundation}});
    }
    return {authoredReportVersion:1,title:wire.title,sections:sections.map((s:any,index:number)=>({...s,order:index+1,priority:['summary','priorities'].includes(s.type)?'primary':'supporting'})),chartIds:[...wire.chartIds],limitations:[...wire.limitations]};
}

// Probe contracts never enter the application/editor. A/B are diagnostic only.
export const GROQ_PROBE_SCHEMAS={
    A:object({title:str,summary:str}),
    B:object({title:str,summary:str,conclusions:list,relatedIndicators:list}),
    C:GROQ_AUTHORING_WIRE_SCHEMA,
};
export const GROQ_WIRE_INSTRUCTION=GROQ_PROPOSAL_TYPE_INSTRUCTION+' Escreva em português, com até seis entradas concisas no total. Interprete resultados em sections e proponha ações com área, monitoramento e conclusão em recommendations. Prazo só em days (0 se a pactuar). Em qualquer texto, valores só em marcadores como {{E0.latest}}. Não escreva datas, prazos ou quantidades por extenso. Use a chave literal da primeira coluna, mesmo com saltos. refs, claims[].ref e marcadores usam chave.campo (latest,target,mean,delta,percent); chartIds usa só a chave. Claim: {"ref":"E0.delta","relation":"decrease"}. Cite em refs cada campo usado. Tendência usa delta; meta e média usam latest; observed aceita qualquer campo. Propostas e hipóteses sem fatos podem ter refs vazias. latest é a competência final, inclusive null; lastValid é contexto. Declare cobertura parcial sem contagens.';
