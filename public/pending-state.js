// Comparação de conteúdo JSON: a mesma cópia alimenta prévia e transporte.
(() => {
    const clone=value=>JSON.parse(JSON.stringify(value));
    const stable=value=>JSON.stringify(sort(value));
    function sort(value){if(Array.isArray(value))return value.map(sort);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,sort(value[k])]));return value;}
    const equal=(a,b)=>stable(a)===stable(b);
    const labels={indicadores:'Indicadores',setores:'Setores',graficos:'Gráficos',graficosPadrao:'Gráficos padrão',kpis:'KPIs',dashboards:'Dashboards',mesesLabels:'Competências',showDataLabels:'Rótulos de gráficos',activeDashboardId:'Dashboard compartilhado',zoomGraficos:'Zoom compartilhado',theme:'Tema compartilhado',logo:'Identidade visual'};
    function diff(before,after){
        const changes=[];
        function visit(a,b,path,category){
            if(equal(a,b))return;
            if(Array.isArray(a)&&Array.isArray(b)){
                // Ordem é significativa: não ordenar nem casar IDs para esconder reordenação.
                for(let i=0;i<Math.max(a.length,b.length);i++)visit(a[i],b[i],[...path,i],category);
            }else if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
                for(const key of [...new Set([...Object.keys(a),...Object.keys(b)])].sort())visit(a[key],b[key],[...path,key],category);
            }else{
                const root=path[0],index=path[1];const item=after[root]?.[index]||before[root]?.[index];
                const field=path.at(-1),monthly=root==='indicadores'&&path[2]==='valores';
                const names={meta:'Meta',direcaoDesempenho:'Direção de desempenho',indicador:'Nome',setor:'Setor',und:'Unidade',title:'Título',name:'Nome',widgets:'Widgets',indicator:'Indicador de referência'};
                changes.push({category:root==='indicadores'&&field==='direcaoDesempenho'?'Governança':category,sector:root==='indicadores'?item?.setor:null,indicator:root==='indicadores'?item?.indicador:null,
                    subject:item?.indicador||item?.title||item?.name||item?.id||String(index??''),
                    competency:monthly?(after.mesesLabels?.[field]||before.mesesLabels?.[field]||`Posição ${Number(field)+1}`):null,
                    field:monthly?'Valor mensal':path.length===2&&((a&&typeof a==='object')||(b&&typeof b==='object'))?'Registro':names[field]||String(field),path:path.join('.'),
                    before:a,after:b,kind:a===undefined?'Adicionado':b===undefined?'Removido':'Alterado'});
            }
        }
        for(const key of new Set([...Object.keys(before),...Object.keys(after)]))visit(before[key],after[key],[key],labels[key]||key);
        return changes;
    }
    class Tracker{
        constructor(){this.clear();}
        clear(){this.reference=null;this.version=null;}
        accept(data,version){this.reference=clone(data);this.version=version;}
        inspect(data){const payload=clone(data);return {payload,key:stable(payload),changes:this.reference?diff(this.reference,payload):[],loaded:this.reference!==null};}
    }
    window.PendingState={clone,stable,equal,diff,Tracker};
})();
