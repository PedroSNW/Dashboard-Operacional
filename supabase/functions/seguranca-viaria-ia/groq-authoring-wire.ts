// Shallow Groq transport contract. The internal editor/evidence contract remains unchanged.
const str={type:'string'},list={type:'array',items:str};
const object=(properties:Record<string,any>)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const GROQ_AUTHORING_WIRE_SCHEMA=object({title:str,
    sections:{type:'array',items:object({type:{type:'string',enum:['summary','advances','challenges','integrated','priorities','hypothesis','conclusion']},title:str,text:str,refs:list,claims:list})},
    recommendations:{type:'array',items:object({type:{type:'string',enum:['recommendation','campaign','action','evolution']},title:str,text:str,refs:list,
        problem:str,objective:str,actions:list,owner:str,days:{type:'integer',enum:[0,30,60,90]},monitoring:str,completion:str,foundation:{type:'string',enum:['direct','descriptive','investigation','preventive']}})},
    chartIds:list,limitations:list});

export function expandGroqAuthoring(wire:any){
    const sections=wire.sections.map((s:any,index:number)=>{
        const claims=s.claims.map((claim:string)=>{const parts=claim.split('|');if(parts.length!==2||!parts[0]||!parts[1])throw Error('INVALID_WIRE_CLAIM');return {ref:parts[0],relation:parts[1]};});
        return {id:'section_'+(index+1),type:s.type,title:s.title,text:s.text,refs:[...s.refs],claims,proposal:null};
    });
    for(const [index,p] of wire.recommendations.entries())sections.push({id:'proposal_'+(index+1),type:p.type,title:p.title,text:p.text,refs:[...p.refs],claims:[],
        proposal:{problem:p.problem,objective:p.objective,actions:[...p.actions],owner:p.owner,days:p.days,monitoring:p.monitoring,completion:p.completion,foundation:p.foundation}});
    return {authoredReportVersion:1,title:wire.title,sections:sections.map((s:any,index:number)=>({...s,order:index+1,priority:['summary','priorities'].includes(s.type)?'primary':'supporting'})),chartIds:[...wire.chartIds],limitations:[...wire.limitations]};
}

// Probe contracts never enter the application/editor. A/B are diagnostic only.
export const GROQ_PROBE_SCHEMAS={
    A:object({title:str,summary:str}),
    B:object({title:str,summary:str,conclusions:list,relatedIndicators:list}),
    C:GROQ_AUTHORING_WIRE_SCHEMA,
};
export const GROQ_WIRE_INSTRUCTION='Produza somente JSON executivo conforme o schema, sem raciocínio interno. Até seis entradas no total: sections contém interpretações; recommendations contém propostas, campanhas e planos contextualizados, incluindo horizontes de trinta, sessenta e noventa dias quando fundamentados. Cada entrada deve acrescentar uma conclusão ou decisão relevante, sem repetir textos. O catálogo é apoio, não limite para propostas novas. Referências: E0.latest, E0.target, E0.mean, E0.delta, E0.percent, substituindo E0 pela chave recebida. Números no texto somente por {{E0.latest}} ou outra referência válida, nunca livres. Claims são strings ref|relation: increase/decrease/stable/improved/worsened usam delta; within_target/outside_target/above_mean/below_mean/equal_mean usam latest; observed permite qualquer campo. Exemplo: E0.delta|decrease. Não julgue finanças sem natureza validada nem direção neutra. Propostas devem ter ações específicas, área sugerida, monitoramento e conclusão proposta; não são tarefas aprovadas. Use frases curtas e poucas ações por proposta para completar o JSON no orçamento. Arrays vazios quando faltar base; reconheça cobertura parcial. IDs e ordem editoriais são organizados pelo servidor.';
