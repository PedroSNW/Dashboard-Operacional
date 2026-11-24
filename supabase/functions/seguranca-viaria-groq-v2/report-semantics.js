// Classificação revisada em código. Nunca aceitar natureza econômica do payload.
export const MEASUREMENT_POLICY=Object.freeze({version:1,criteria:Object.freeze([])});
export function measurementAssessment(i,policy=MEASUREMENT_POLICY){
    const monetary=/^(r\$|reais|brl)$/i.test(String(i.unidade??i.und??'').trim());
    const entry=policy.criteria.find(c=>c.indicatorId===i.id&&c.name===i.indicador&&c.sector===i.setor&&c.approved===true&&['balance','flow','rate','quantity'].includes(c.kind)&&typeof c.reference==='string'&&c.reference.trim());
    const kind=entry?.kind??null;
    return {monetary,kind,validated:Boolean(entry),reference:entry?.reference??null,
        neutral:monetary&&(!entry||kind==='balance'),canSum:entry?kind==='flow'||kind==='quantity':!monetary,
        note:monetary&&!entry?'Validar se o valor representa saldo, fluxo, taxa ou quantidade antes de avaliar seu significado financeiro.':kind==='balance'?'Saldo é uma posição no período; sua redução não comprova piora e as posições mensais não devem ser somadas.':null};
}
