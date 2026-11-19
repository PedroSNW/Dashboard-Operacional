// Shallow Groq transport contract. The internal editor/evidence contract remains unchanged.
import './report-authored-core.js';
const str={type:'string'},list={type:'array',items:str};
const object=(properties:Record<string,any>)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const GROQ_AUTHORING_WIRE_SCHEMA=object({title:str,
    sections:{type:'array',items:object({type:{type:'string',enum:['summary','advances','challenges','integrated','priorities','hypothesis','conclusion']},title:str,text:str,refs:list,claims:list})},
    recommendations:{type:'array',items:object({type:{type:'string',enum:['recommendation','campaign','action','evolution']},title:str,text:str,refs:list,
        problem:str,objective:str,actions:list,owner:str,days:{type:'integer',enum:[0,30,60,90]},monitoring:str,completion:str,foundation:{type:'string',enum:['direct','descriptive','investigation','preventive']}})},
    chartIds:list,limitations:list});

export function expandGroqAuthoring(wire:any, onInvalidClaim?:(sectionIndex:number,issue:{claimIndex:number;code:string;ref:string|null})=>void){
    const sections=wire.sections.map((s:any,index:number)=>{
        const claims=s.claims.flatMap((claim:string,claimIndex:number)=>{
            const parts=claim.split('|').map(part=>part.trim());
            const malformed=parts.length!==2||!parts[0]||!parts[1];
            if(malformed||!(globalThis as any).ReportAuthoredCore.relations.includes(parts[1])){
                if(!onInvalidClaim)throw Error(malformed?'INVALID_WIRE_CLAIM':'INVALID_WIRE_RELATION');
                onInvalidClaim(index,{claimIndex,code:malformed?'invalid_claim_format':'claim_relation_unsupported',ref:malformed?null:parts[0]});
                return [];
            }
            return [{ref:parts[0],relation:parts[1]}];
        });
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
export const GROQ_WIRE_INSTRUCTION='Gere só JSON executivo conforme o schema. Prefira seis entradas úteis: sections interpreta resultados; recommendations propõe ações, campanhas e horizontes de trinta, sessenta e noventa dias quando fundamentados. O catálogo é apoio. Identifique cada linha pela chave E<n> da primeira coluna, mesmo fora de ordem ou com saltos. Para refs, claims e {{placeholders}}, use apenas chave.campo de linhas presentes: latest,target,mean,delta,percent. Nunca use posição, nome ou chave sem campo. chartIds usa só a chave E<n> enviada. Claims ref|relation: increase/decrease/stable/improved/worsened usam delta; within_target/outside_target/above_mean/below_mean/equal_mean usam latest; observed aceita qualquer campo. Ex.: E0.delta|decrease apenas se E0 estiver presente. Inclua em refs a referência exata de cada claim. Claims verificam resultados; valores só por placeholders. refs vazias somente em hipótese, orientação ou proposta sem afirmações factuais. Recomendações trazem ações específicas, área sugerida, monitoramento e conclusão, sem afirmar aprovação ou resultados. Use proposal.days para prazos; evite números na prosa. latest é a competência final, inclusive null; lastValid é contexto do último dado disponível, sem referência própria. Preserve neutralidade financeira e declare cobertura parcial. Sem repetição ou raciocínio interno. Prefira textos até 1800 caracteres; máximo 12000 e 40 itens por array, com até 40 entradas entre sections e recommendations.';
