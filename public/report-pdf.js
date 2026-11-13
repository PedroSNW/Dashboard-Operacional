// Componentes de PDF independentes dos cálculos e da interface.
// Paleta e métricas centralizadas para a próxima etapa de design.
window.ReportPdf = {
    theme: Object.freeze({navy:[10,23,43],gold:[217,153,35],ink:[25,39,57],muted:[91,108,127],paper:[245,248,251],line:[221,228,235],margin:14,bodyTop:30,bodyBottom:278}),
    build(r,images=[]) { const steps=this.compose(r,images);let step;do{step=steps.next();}while(!step.done);return step.value; },
    async buildAsync(r,images=[],onProgress=()=>{},yieldUI=()=>new Promise(resolve=>setTimeout(resolve,0))) {
        const steps=this.compose(r,images);let step;
        do{step=steps.next();if(!step.done){onProgress(step.value);await yieldUI();}}while(!step.done);
        return step.value;
    },
    *compose(r,images=[]) {
        const T=this.theme, doc=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
        const W=210-2*T.margin;
        const fmt=v=>v===null||v===undefined?'Indisponível':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v);
        const date=new Date(r.generatedAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
        const period=`${r.competencias[0]} a ${r.competencias.at(-1)}`;
        const direction={menor_melhor:'Menor é melhor',maior_melhor:'Maior é melhor',neutro:'Neutra'};
        let y=76;
        const font=(size=9,bold=false,color=T.ink)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);};
        const ensure=height=>{if(y+height>T.bodyBottom){doc.addPage();y=T.bodyTop;}};
        const paragraph=(value,size=9,color=T.muted)=>{
            font(size,false,color);const lines=doc.splitTextToSize(String(value),W);
            for(const line of lines){ensure(4.5);font(size,false,color);doc.text(line,T.margin,y);y+=4.5;}
            y+=2;
        };
        const heading=(title,kicker)=>{
            ensure(17);if(kicker){font(7.2,true,T.gold);doc.text(kicker.toUpperCase(),T.margin,y);y+=5;}
            font(13,true);doc.text(title,T.margin,y);y+=8;
        };
        const metric=(x,label,value,width,height=21)=>{
            doc.setFillColor(...T.paper);doc.roundedRect(x,y,width,height,2,2,'F');
            font(7,true,T.muted);doc.text(label.toUpperCase(),x+3,y+5);
            font(17,true);doc.text(String(value),x+3,y+15);
        };
        const gap=3,card=(W-gap*3)/4;
        metric(T.margin,'Selecionados',r.selectedCount,card);
        metric(T.margin+card+gap,'No relatório',r.indicators.length,card);
        metric(T.margin+(card+gap)*2,'Pontos de atenção',r.criticalCount,card);
        metric(T.margin+(card+gap)*3,'Competências',r.competencias.length,card);
        y+=30;heading('Resumo executivo','Visão de gestão');
        paragraph(`Cobertura: ${r.indicators.length} de ${r.selectedCount} indicadores selecionados. Setor: ${r.sector==='TODOS'?'todos os setores':r.sector??'selecionado'}. IA ${r.aiUsed?'utilizada como apoio interpretativo':'não utilizada; análise determinística'}.`);
        const critical=r.indicators.filter(i=>i.critical);
        if(critical.length){font(8,true,T.ink);doc.text('PRINCIPAIS PONTOS DE ATENÇÃO',T.margin,y);y+=5;critical.slice(0,3).forEach(i=>paragraph(`${i.indicador}: ${i.criticalReason}.`,8.5,T.ink));if(critical.length>3)paragraph(`Outros ${critical.length-3} indicadores com atenção estão detalhados a seguir.`,8);}
        else paragraph('Nenhum ponto de atenção pelos critérios de meta e direção configurados. Isso não comprova ausência de risco operacional.',8.5);
        paragraph('Competências revisáveis. Ausências não equivalem a zero. Não há consolidação entre unidades diferentes.',8);
        const focusIndex=Math.max(0,r.indicators.findIndex(i=>i.critical));
        let executiveFocus=-1;
        if(images[focusIndex]&&doc.getCurrentPageInfo().pageNumber===1&&y+76<=T.bodyBottom){
            const focus=r.indicators[focusIndex];
            font(7.5,true,T.gold);doc.text('INDICADOR EM FOCO',T.margin,y);y+=5;
            paragraph(focus.indicador,9,T.ink);
            doc.addImage(images[focusIndex],'PNG',T.margin,y,W,65);y+=71;executiveFocus=focusIndex;
        }
        if(r.interpretation){heading('Interpretação gerencial','Apoio à decisão');paragraph(r.interpretation,9,T.ink);}
        for(const [n,i] of r.indicators.entries()){
            // Mantém título, metadados, métricas e início do gráfico/tabela juntos.
            const showChart=Boolean(images[n]&&n!==executiveFocus);
            ensure(showChart?135:66);
            doc.setDrawColor(...T.line);doc.line(T.margin,y,196,y);y+=7;
            font(7.5,true,T.gold);doc.text(`INDICADOR ${String(n+1).padStart(2,'0')} / ${String(r.indicators.length).padStart(2,'0')}`,T.margin,y);y+=6;
            const title=doc.splitTextToSize(i.indicador,W);for(const line of title){ensure(6);font(12,true);doc.text(line,T.margin,y);y+=5.5;}
            paragraph(`${i.setor}  |  ${i.unidade??'Unidade não informada'}  |  Meta: ${i.meta===null?'não cadastrada':fmt(i.meta)}  |  ${direction[i.direcaoDesempenho]??'Direção não definida'}`,8);
            const s=i.estatisticas;
            ensure(18);doc.setFillColor(...T.paper);doc.roundedRect(T.margin,y,W,15,1.5,1.5,'F');
            const stats=[['MÉDIA',fmt(s.media)],['SOMA',s.somaAplicavel?fmt(s.soma):'Não aplicável'],['MÍN. / MÁX.',`${fmt(s.minimo)} / ${fmt(s.maximo)}`],['AUSÊNCIAS',String(s.ausentes)]];
            stats.forEach(([label,value],idx)=>{const x=T.margin+idx*W/4+3;font(6.8,true,T.muted);doc.text(label,x,y+4.5);font(10,true);doc.text(value,x,y+11);});y+=21;
            if(i.criticalReason)paragraph(`Atenção: ${i.criticalReason}.`,8.5,T.ink);
            if(showChart){ensure(73);font(7.5,true,T.muted);doc.text('EVOLUÇÃO MENSAL',T.margin,y);y+=3;doc.addImage(images[n],'PNG',T.margin,y,W,65);y+=69;}
            ensure(22);
            doc.autoTable({startY:y,margin:{left:T.margin,right:T.margin,top:T.bodyTop,bottom:21},
                head:[['Competência',`Resultado (${i.unidade??'valor'})`,'Variação absoluta','Variação %']],
                body:s.mensais.map(p=>[p.competencia,p.valor===null?'Ausente':fmt(p.valor),fmt(p.variacaoAnterior?.absoluta),fmt(p.variacaoAnterior?.percentual)]),
                styles:{font:'helvetica',fontSize:8.2,cellPadding:2.1,overflow:'linebreak',textColor:T.ink,lineColor:T.line,lineWidth:0.1},
                headStyles:{fillColor:T.navy,textColor:255,fontStyle:'bold',cellPadding:2.7},alternateRowStyles:{fillColor:T.paper},
                columnStyles:{0:{cellWidth:32,halign:'left'},1:{halign:'right'},2:{halign:'right'},3:{halign:'right'}},
                rowPageBreak:'avoid',showHead:'everyPage'});
            y=doc.lastAutoTable.finalY+9;
            yield {stage:'compose',processed:n+1,total:r.indicators.length};
        }
        ensure(46);heading('Metodologia e limitações','Rastreabilidade');
        r.limitations.forEach(l=>paragraph(l,8));
        paragraph('Médias usam somente valores válidos. Percentuais com base zero são indisponíveis. Piora é a comparação descritiva entre primeiro e último valor válido conforme direção cadastrada, sem atribuição causal. Taxas não são somadas nem ponderadas sem denominadores compatíveis.',8);
        paragraph(`Snapshot: ${r.snapshotUpdatedAt??'data não informada'}. Gerado em ${date} (Brasília).`,7.5);
        const pages=doc.getNumberOfPages();
        for(let p=1;p<=pages;p++){
            doc.setPage(p);doc.setFillColor(...T.navy);doc.rect(0,0,210,p===1?64:22,'F');
            doc.setFillColor(...T.gold);doc.rect(T.margin,p===1?16:8,2,p===1?12:7,'F');
            font(p===1?23:11,true,[255,255,255]);doc.text("D'GRANEL",T.margin+6,p===1?25:14);
            if(p===1){font(7,false,[218,226,235]);doc.text(`EMISSÃO ${date}`,196,23,{align:'right'});doc.text('USO INTERNO / GESTÃO OPERACIONAL',196,29,{align:'right'});font(8,true,T.gold);doc.text('TRANSPORTES  /  SEGURANÇA VIÁRIA',T.margin+6,32);font(18,true,[255,255,255]);doc.text('Relatório Gerencial',T.margin,46);font(9,false,[218,226,235]);doc.text(`${r.type.toUpperCase()}   |   ${period}`,T.margin,55);}
            else {font(8,false,[218,226,235]);doc.text(`${r.type.toUpperCase()}  /  ${period}`,196,14,{align:'right'});}
            doc.setDrawColor(...T.line);doc.line(T.margin,283,196,283);font(7.5,true,T.ink);doc.text("D'Granel Transportes  •  Uso interno",T.margin,288);font(7.5,false,T.muted);doc.text(`${p} / ${pages}`,196,288,{align:'right'});
            yield {stage:'finalize',processed:p,total:pages};
        }
        return doc;
    }
};
