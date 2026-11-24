// Composição dos relatórios A4 com a identidade visual da D’Granel.
window.ReportPdf={
 theme:Object.freeze({navy:[9,39,71],blue:[11,76,142],gold:[244,204,24],ink:[29,43,58],muted:[75,97,119],
  pale:[237,244,251],line:[211,224,236],white:[255,255,255],margin:30,right:20,bodyTop:30,bodyBottom:277}),
 build(r,images=[],options={}){const it=this.compose(r,images,options);let s;do{s=it.next();}while(!s.done);return s.value;},
 async buildAsync(r,images=[],onProgress=()=>{},yieldUI=()=>new Promise(r=>setTimeout(r,0)),options={}){const it=this.compose(r,images,options);let s;do{s=it.next();if(!s.done){onProgress(s.value);await yieldUI();}}while(!s.done);return s.value;},
 *compose(r,images=[],options={}){
 const executive=r.exportFormat==='executive'&&Boolean(window.ReportExecutive);
 const {navy,blue,gold,ink,muted,pale,line,white}=this.theme;
 const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true}),E=window.ReportContent.editorial(r),m=E.management,W=160,V=E.version===6?r.intelligence:null,chartIds=new Set(executive?window.ReportExecutive.build(r).chartIds:window.ReportContent.chartIds(r));
 const fmt=v=>v===null||v===undefined?'Indisp.':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v);
 const direction=i=>({menor_melhor:'Menor é melhor',maior_melhor:'Maior é melhor',neutro:'Neutra'}[i.direcaoDesempenho]??'Não definida');
 const period=`${r.competencias[0]??'Não informado'} a ${r.competencias.at(-1)??'Não informado'}`,date=new Date(r.generatedAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
 const source='Fonte: Dashboard D’Granel, snapshot validado do Supabase.';
 const toc=[],layout=[],tables=[],figures=[],counters={Tabela:0,Quadro:0};let y=30,tableNo=0,figureNo=0;
 const page=()=>doc.getCurrentPageInfo().pageNumber;
 const font=(size=12,bold=false,color=ink)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);};
 const newPage=()=>{doc.addPage();y=30;};
 const ensure=h=>{if(y+h>277&&y>30)newPage();};
 const text=(value,size=12,bold=false,center=false,color=ink)=>{
  font(size,bold);const lines=doc.splitTextToSize(String(value??''),W),step=size*.352778*1.15;
  for(const line of lines){ensure(step);font(size,bold,color);doc.text(line,center?110:30,y+size*.352778,{align:center?'center':'left'});layout.push({page:page(),kind:'text',x:30,y,bottom:y+step,width:W,text:line});y+=step;}y+=2;
 };
 const heading=(title,entry=false,center=false)=>{
  const size=entry?14:12;font(size,true);const h=doc.splitTextToSize(title,W).length*size*.352778*1.15+3;
  ensure(Math.min(h+14,247));
  if(entry){
   toc.push({title,page:page()});doc.setFillColor(...gold);doc.rect(30,y,11,.9,'F');y+=3;
  }
  text(title,size,true,center,entry?navy:blue);y+=2;
 };
 function cover(title){
  const label=executive?'EDIÇÃO EXECUTIVA':'EDIÇÃO COMPLETA';
  const size=28,step=12; font(size,true,white);
  const lines=doc.splitTextToSize(title.replace(/segurança viária/giu,'SEGURANÇA VIÁRIA'),W-25),height=29+step*lines.length;
  doc.setFillColor(...navy);doc.rect(30,y,W,height,'F');
  doc.setFillColor(...blue);doc.triangle(190,y+height-35,190,y+height,153,y+height,'F');
  doc.setFillColor(...gold);doc.rect(42,y+8,19,1.1,'F');font(9,true,gold);doc.text(label,42,y+15);
  font(size,true,white);
  lines.forEach((content,index)=>{
   const top=y+19+index*step;doc.text(content,42,top+size*.352778);
   layout.push({kind:'text',page:page(),x:42,y:top,bottom:top+step,width:W-25,text:content});
  });
  y+=height+7;
  const metrics=[[r.indicators.length,'Indicadores no recorte'],[r.criticalCount,'Pontos de atenção'],[r.competencias.length,'Competências']];
  const cardWidth=(W-8)/metrics.length;
  metrics.forEach(([value,caption],index)=>{
   const x=30+index*(cardWidth+4);doc.setFillColor(...pale);doc.roundedRect(x,y,cardWidth,19,1,1,'F');
   font(17,true,navy);doc.text(String(value??'—'),x+4,y+8);
   font(8,false,muted);doc.text(caption,x+4,y+14);
  });
  y+=25;
  text(`Período: ${period} · Setor: ${r.sector==='TODOS'?'Todos os setores':r.sector??'Não informado'}`,10,true,false,navy);
  text(`Emissão: ${date} (Brasília)`,9,false,false,muted);
 }
 function contents(){
  newPage();text('Sumário',25,true,false,navy);y+=6;
  return {number:page(),top:y};
 }
 const table=(title,head,body,widths=[],numeric=[],kind='Tabela')=>{
  // AutoTable não consegue manter inteira uma linha maior que a própria página.
  // Dividir previamente células muito extensas mantém todos os trechos e sinaliza continuidade.
  font(10);const safeRows=[];
  for(const row of body){const wrapped=row.map((v,n)=>doc.splitTextToSize(String(v??'Indisp.'),(widths[n]??W/head.length)-3));
   const count=Math.max(1,...wrapped.map(a=>Math.ceil(a.length/44)));
   for(let part=0;part<count;part++)safeRows.push(wrapped.map((lines,n)=>{const content=lines.slice(part*44,(part+1)*44).join('\n');return part&&n===0?`(continuação)\n${content}`:content;}));
  }
  const number=++tableNo,displayNumber=++counters[kind],caption=`${kind} ${displayNumber} – ${title}`;font(10,true);
  const firstHeight=Math.max(1,...(safeRows[0]??[]).map(s=>s.split('\n').length))*4.06+14;
  ensure(doc.splitTextToSize(caption,W).length*4.1+Math.min(firstHeight,220));
  const startPage=page();tables.push({number,displayNumber,kind,title,page:startPage,rows:body.length});text(caption,10,true);
  const columnStyles={};widths.forEach((w,n)=>columnStyles[n]={cellWidth:w,halign:numeric.includes(n)?'right':'left'});
  doc.autoTable({startY:y,margin:{left:30,right:20,top:38,bottom:25},tableWidth:W,head:[head],body:safeRows.length?safeRows:[head.map((_,n)=>n===0?'Sem registros neste recorte.':'—')],theme:'plain',
   styles:{font:'helvetica',fontSize:10,cellPadding:1.5,overflow:'linebreak',textColor:ink,lineWidth:0},
   headStyles:{fontStyle:'bold',textColor:white,fillColor:navy},alternateRowStyles:{fillColor:pale},columnStyles,rowPageBreak:'avoid',showHead:'everyPage',
   willDrawPage:()=>{if(page()!==startPage){font(10,true,blue);doc.text(`${kind} ${displayNumber} – continuação`,30,34);}},
   didDrawCell:d=>{if(d.section==='body')layout.push({kind:'cell',page:page(),x:d.cell.x,y:d.cell.y,bottom:d.cell.y+d.cell.height,width:d.cell.width,table:number,row:d.row.index,column:d.column.index,text:d.cell.text.join('\n')});}
  });y=doc.lastAutoTable.finalY+2;doc.setDrawColor(...line);doc.line(30,y,190,y);y+=1;text(source,9,false,false,muted);y+=2;
 };
 const graph=(i,index)=>{if(!images[index]||!chartIds.has(i.id))return;const caption=`Gráfico ${++figureNo} – ${i.indicador} (${i.unidade??'unidade não informada'})`;
  font(10,true);ensure(doc.splitTextToSize(caption,W).length*4.1+78);text(caption,10,true);
  if(y+72>277){newPage();text(`Gráfico ${figureNo} – continuação da identificação anterior`,10,true);}
  figures.push({number:figureNo,id:i.id,page:page()});
  doc.addImage(images[index],'PNG',30,y,W,57);layout.push({kind:'graph',page:page(),x:30,y,bottom:y+57,width:W});y+=59;text(`${source} ${period}. Lacunas preservadas.`,10);
 };
 const unique=a=>[...new Set(a.filter(x=>typeof x==='string'&&x.trim()))];
 function* finishPdf(contentsPage,historyColumns=null){
 const {number:tocPage,top:tocY}=contentsPage;
 const pages=doc.getNumberOfPages();
 doc.setPage(tocPage);
 const perColumn=Math.ceil(toc.length/2),width=(W-10)/2;
 for(let column=0;column<2;column++){
  const x=30+column*(width+10);let top=tocY;
  for(const entry of toc.slice(column*perColumn,(column+1)*perColumn)){
   font(11,true,navy);const lines=doc.splitTextToSize(entry.title,width-16),height=Math.max(11,lines.length*5+4);
   if(top+height>277)throw Error('Sumário excedeu a página reservada.');
   doc.setFillColor(...pale);doc.roundedRect(x,top+1,11,9,1,1,'F');
   font(9,true,blue);doc.text(String(entry.page),x+5.5,top+7,{align:'center'});
   font(11,true,navy);lines.forEach((content,index)=>doc.text(content,x+15,top+5.5+index*5));
   doc.setDrawColor(...line);doc.line(x,top+height,x+width,top+height);
   doc.link(x,top,width,height,{pageNumber:entry.page});top+=height+5;
  }
 }
 let logoHeight=0;
 if(options.logo){try{const logo=doc.getImageProperties(options.logo);logoHeight=34*logo.height/logo.width;}catch{/* A assinatura textual ocupa o mesmo cabeçalho. */}}
 for(let p=1;p<=pages;p++){
  doc.setPage(p);
  if(logoHeight){doc.addImage(options.logo,'PNG',30,15-logoHeight/2,34,logoHeight,'dgranel-header');}
  else{font(10,true,blue);doc.text("D'GRANEL",30,17);}
  font(9,true,navy);doc.text('SEGURANÇA VIÁRIA',190,16,{align:'right'});
  doc.setLineWidth(.2);doc.setDrawColor(...line);doc.line(30,23.5,190,23.5);doc.setDrawColor(...gold);doc.setLineWidth(.8);doc.line(30,23.5,58,23.5);
  doc.setLineWidth(.2);doc.setDrawColor(...line);doc.line(30,282,190,282);
  font(9,false,muted);doc.text('D’Granel  |  Uso interno',30,288);doc.text(`${p} / ${pages}`,190,288,{align:'right'});
  yield {stage:'finalize',processed:p,total:pages};
 }
 doc.reportLayout={version:executive?'6.1':V?6:5,format:executive?'executive':'complete',pages,toc,tocPage,tables,figures,historyColumns,blocks:layout,coverage:r.indicators.map(i=>({id:i.id,months:executive?0:i.estatisticas.mensais.length})),historyIncluded:!executive,sourceIds:r.indicators.map(i=>i.id),criticalCoverage:executive?window.ReportExecutive.build(r).criticalIds:null,margins:{left:30,right:20,top:30,bottom:20}};return doc;
 }
 doc.setProperties({title:`D'Granel – Relatório ${r.type}`,subject:`${period} – ${r.sector}`,author:"D'Granel",creator:'Dashboard Operacional D’Granel'});
 if(r.authored){
  const authored=r.authored,C=window.ReportEvidence;
  if(!Array.isArray(authored.evidenceKeys)||!authored.evidenceKeys.length)throw Error('Registro de evidências indisponível.');
  const pack=C?.evidence(r,authored.evidenceKeys),checked=C?.validate(authored.document,pack);
  if(!C||!authored.reviewed||authored.basis!==r.basis||authored.snapshotUpdatedAt!==r.snapshotUpdatedAt||!checked?.valid)throw Error('Conteúdo editorial incompatível com a base do PDF.');
  const draft=checked.document;
  cover(draft.title);
  text('Documento de apoio à decisão. Interpretações e sugestões revisadas localmente não representam aprovação institucional. Áreas, iniciativas e prazos dependem de validação da gestão.',10);
  if(authored.coverage?.partial)text(`A elaboração abrange ${authored.coverage.sent} de ${authored.coverage.selected} indicadores selecionados. A interpretação não representa cobertura integral do recorte.`,10);
  const authoredContents=contents();newPage();
  let number=0;
  for(const section of draft.sections){
   heading(`${++number} ${section.title}`,true);
   C.lines(section,pack).forEach((line,index)=>{
    const evidence=line.startsWith('Evidência oficial · ');
    text(line,index===0?12:10,false,false,evidence?muted:ink);
   });
   if(section.refs.length)text('Referências: '+section.refs.join('; ')+'.',9,false,false,muted);
   yield {stage:'diagnosis',processed:number,total:draft.sections.length};
  }
  heading(`${++number} Resultados e evidências`,true);
  table('Resultados oficiais do recorte',['Indicador / setor / unidade','Recente / competência','Meta / direção','Variação %','Situação'],window. ReportContent.panorama(r,fmt),[49,30,32,20,29],[1,3]);
  for(const [index,i] of r.indicators.entries()){graph(i,index);yield {stage:'figures',processed:index+1,total:r.indicators.length};}
  if(r.managementContext){
   heading(`${++number} Contexto informado pela gestão`,true);
   text('Relato gerencial sem confirmação independente; não altera indicadores, metas oficiais ou evidências. Propostas e situação de ações precisam de validação da gestão.',10);
   for(const [field,label] of [['actionsTaken','Ações informadas'],['difficulties','Dificuldades relatadas'],['achievements','Conquistas relatadas'],['priorities','Prioridades informadas'],['goals','Objetivos relatados ou propostos'],['observations','Observações']])if(r.managementContext[field]){heading(label);text(r.managementContext[field]);}
  }
  heading(`${++number} Metodologia e rastreabilidade`,true);
  unique([...r.limitations,'As linhas de evidência oficial são projetadas do snapshot. O texto autoral é interpretação ou proposta conferida pela gestão.','Contexto da gestão é relato sem confirmação independente. Médias usam apenas valores válidos; null não equivale a zero. Saldos não são somados como fluxos.']).forEach(line=>text(line,10));
  text(`Fonte: snapshot autorizado do Supabase (${r.snapshotUpdatedAt??'não informado'}). Base: ${r.basis??'não informada'}.`,10);
  text('Chaves de evidência: '+pack.items.map(i=>i.key+' = '+String(i.id)+' / '+i.name).join('; '),10);
  if(!executive){
   heading('APÊNDICE A — Histórico e estatísticas',true);text('Cobertura integral do recorte, independente da seleção editorial. Ausências preservadas.',10);
   table('Estatísticas determinísticas',['Indicador / unidade','Média','Mínimo','Máximo','Ausências','Soma aplicável'],r.indicators.map(i=>[i.indicador+' / '+(i.unidade??'não informada'),fmt(i.estatisticas.media),fmt(i.estatisticas.minimo),fmt(i.estatisticas.maximo),fmt(i.estatisticas.ausentes),window.ReportExecutive.sum(r,i,fmt)]),[50,22,22,22,20,24],[1,2,3,4,5]);
   for(let offset=0;offset<r.competencias.length;offset+=4){const months=r.competencias.slice(offset,offset+4),width=(W-48)/months.length;
    table('Histórico — '+months[0]+' a '+months.at(-1),['Indicador',...months],r.indicators.map(i=>[i.indicador,...months.map(c=>{const p=i.estatisticas.mensais.find(p=>p.competencia===c);return `${fmt(p?.valor??null)}\nVar. ${fmt(p?.variacaoAnterior?.absoluta??null)}\nVar. % ${fmt(p?.variacaoAnterior?.percentual??null)}`;})]),[48,...months.map(()=>width)],months.map((_,n)=>n+1));
    yield {stage:'compose',processed:Math.min(offset+4,r.competencias.length),total:r.competencias.length};
   }
   heading('APÊNDICE B — Referências de evidências',true);
   for(const item of pack.items){heading(item.key+' — '+item.name);text(C.project(item.key,pack),10);}
  }
  const pdf=yield* finishPdf(authoredContents,executive?null:4);pdf.reportLayout.authored=true;pdf.reportLayout.editorialSectionIds=draft.sections.map(s=>s.id);return pdf;
 }
 if(executive){
  const e=window.ReportExecutive.build(r),byId=id=>r.indicators.find(i=>i.id===id),dimension=id=>V?.dimensions.find(d=>d.indicatorId===id),name=id=>byId(id)?.indicador??String(id);
  cover('Relatório executivo de segurança viária');text(e.scope,10);
  heading('Síntese para decisão');text(e.paragraph);
  for(const [label,ids] of [['Avanços',e.advances],['Pontos de atenção',e.challenges],['Prioridades sugeridas',e.priorities]])text(label+': '+(ids.length?ids.map(name).join('; '):'nenhum resultado identificado por esses critérios.')+'.',10);
  const executiveContents=contents();newPage();
  heading('1 Resultados para a reunião',true);
  if(!e.detailIds.length)text('Não há dados suficientes no recorte. Conferir a seleção e os registros antes de avaliar resultados.');
  for(const [n,id] of e.detailIds.entries()){const i=byId(id);text(window.ReportExecutive.narrative(i,dimension(id)));yield {stage:'diagnosis',processed:n+1,total:e.detailIds.length+e.chartIds.length};}
  if(e.observations.length){heading('Leitura conjunta');e.observations.forEach(o=>text(o.text));}
  text(e.selection,10);
  if(e.criticalIds.length)table('Pontos que precisam de acompanhamento — cobertura integral',['Indicador / setor','Avaliação para decisão'],e.criticalIds.map(id=>{const i=byId(id),d=dimension(id),m=window.ReportExecutive.financial(i,d);return [i.indicador+'\n'+i.setor,d?.operational?.validated&&d.operational.level==='Alta'?'Avaliar o critério operacional aprovado: '+d.operational.reference+(m.neutral?' Confirmar também a natureza financeira.':''):m.neutral?'Confirmar a natureza financeira antes de julgar a variação.':d?.off?'Meta ainda não alcançada.':d?.worse?'Resultado piorou; avaliar as pendências.':'Validar os critérios e a cobertura disponível.'];}),[66,94]);
  for(const [n,id] of e.chartIds.entries()){const i=byId(id);graph(i,r.indicators.indexOf(i));yield {stage:'diagnosis',processed:e.detailIds.length+n+1,total:e.detailIds.length+e.chartIds.length};}
  heading('2 Plano de ação resumido',true);text('Iniciativas sugeridas. Áreas e prazos dependem de avaliação da gestão.',10);
  table('Ações para discussão',['Problema / indicadores','Ação sugerida','Área sugerida','Prazo','Acompanhamento'],e.actions.map(a=>[a.problem+'\n'+a.indicatorIds.map(name).join('; '),a.ref+' · '+a.title+'\n'+(a.tasks[0]??a.objective),a.owner,a.timeline,a.monitoring]),[34,47,27,23,29],[],'Quadro');
  yield {stage:'compose',processed:1,total:1};
  heading('3 Próximos 90 dias',true);text('Horizontes sugeridos após a decisão de iniciar. Não representam objetivos aprovados.',10);
  table('Plano de evolução',['Horizonte','Próximo passo'],e.horizons.map(h=>[`${h.days} dias\n${h.title}`,h.lines.join('\n')||'Conferir os dados e pactuar a próxima atividade.']),[35,125],[],'Quadro');
  yield {stage:'management',processed:1,total:1};
  const context=window.ReportContent.v6Sections(r).find(s=>s.key==='context');
  if(context){heading('4 Contexto informado pela gestão',true);for(const b of context.blocks){heading(b.title);b.lines.forEach(l=>text(l));}text('Relato sem confirmação independente; não altera os indicadores nem suas metas.',10);}
  const methodLines=[...e.limitations,'Criticidade operacional só é afirmada quando há critério aprovado; as demais classificações permanecem pendentes. Histórico e evidências integrais podem ser exportados no formato Completo.',`Fonte: snapshot autorizado do Supabase (${r.snapshotUpdatedAt??'data não informada'}). Base de conferência: ${r.basis??'não informada'}. `];
  font(10);ensure(Math.min(247,18+methodLines.reduce((h,line)=>h+doc.splitTextToSize(line,W).length*4.056947+2,0)));
  heading(`${context?5:4} Base e limites da análise`,true);methodLines.forEach(line=>text(line,10));
  return yield* finishPdf(executiveContents);
 }
 cover('Relatório gerencial de segurança viária');text(E.focus);
 text('Documento de apoio à decisão. As propostas dependem de avaliação e aprovação das áreas responsáveis.');
 newPage();heading('RESUMO',false,true);
 text(`Este relatório apresenta ${E.scope} Seu objetivo é apoiar ${E.focus.toLowerCase()}. O método utiliza valores validados do snapshot do Supabase e estatísticas determinísticas, respeitando unidades, metas, direções e valores ausentes. Foram identificados ${r.criticalCount} indicadores com atenção pelos critérios configurados. O corpo executivo apresenta as prioridades e propostas de acompanhamento; os apêndices preservam o histórico do recorte e o conteúdo gerencial validado. As competências permanecem sujeitas a revisão. A análise é descritiva e não estabelece causalidade nem comprova ausência de risco quando não há sinalização. As iniciativas apresentadas são sugestões para avaliação, sem garantia de resultados. A leitura relaciona a situação observada às evidências disponíveis, à avaliação de desempenho e aos encaminhamentos sugeridos. O acompanhamento exige conferir a qualidade dos registros e pactuar responsáveis e prazos. A comparação temporal deve respeitar o escopo de cada indicador e as limitações documentadas.`);
 text('Palavras-chave: desempenho operacional; indicadores; gestão preventiva; acompanhamento.');
 const completeContents=contents();newPage();
 if(V){
 let sectionNumber=0;
 for(const section of window.ReportContent.v6Sections(r)){
  if(section.key==='priorities'&&!section.blocks.length||section.key==='panorama'&&!r.indicators.length)continue;
  heading(`${++sectionNumber} ${section.title}`,true);
  if(section.key==='panorama'){
   text('Meta cadastrada atual usada como referência; vigência histórica não verificada. Desempenho, evolução e criticidade operacional são dimensões distintas.',10);
   if(r.indicators.length>15)text('Panorama executivo selecionado; tabela completa de todos os indicadores no Apêndice A.',10);
   table('Panorama gerencial do recorte',['Indicador / setor / unidade','Recente / meta atual','Desempenho / tendência','Criticidade operacional'],window.ReportContent.v6Overview(r,fmt,true),[47,34,51,28]);
  }
  if(section.key==='actions'){
   table('Iniciativas para avaliação',['Ref. / prioridade','Iniciativa / objetivo','Área / prazo sugeridos','Situação / verificação'],V.actions.map(a=>[a.ref+'\n'+a.priority,a.title+'\n'+a.objective,a.owner+'\n'+a.timeline,a.status+'\nCritério completo: '+a.ref+' no Apêndice D.']),[28,59,39,34],[],'Quadro');
   const communications=m?.communicationSuggestions??[];
   if(communications.length)table('Comunicação preventiva para avaliação',['Tema','Canal / formato','Orientação pública'],communications.map(c=>[c.theme,c.channel+' / '+c.format,c.message]),[55,40,65],[],'Quadro');
  }
  if(section.key==='evolution'){
   text('Horizontes sugeridos após a decisão de iniciar; não representam compromissos aprovados. A referência A identifica cada iniciativa no plano e no Apêndice D.',10);
   table('Plano de evolução — próximos 90 dias',['Horizonte','Atividades adaptadas às iniciativas','Acompanhamento'],V.evolutionPlan.map(h=>[`Até ${h.days} dias`,h.items.map(a=>a.ref+' · '+a.task).join('\n'),h.items.map(a=>a.ref).join(', ')+': verificar mesmos indicadores e critérios do Apêndice D.\n'+(V.goals?.label??'Objetivos sugeridos; pactuação necessária.')]),[24,94,42],[],'Quadro');
  }
  for(const [index,b] of section.blocks.entries()){
   heading(b.title);unique(b.lines).forEach(line=>text(line,12));
   if(section.key==='priorities'){const i=r.indicators.find(i=>i.id===b.id);if(i)graph(i,r.indicators.indexOf(i));yield {stage:'diagnosis',processed:index+1,total:section.blocks.length};}
  }
  if(section.note)text(section.note,10);
 }
 heading(`${++sectionNumber} Metodologia e limitações`,true);
 unique([...V.limitations,...(m?.limitations??[]).filter(l=>l.startsWith('Síntese complementar parcial:')||l.startsWith('Plano priorizado:'))]).forEach(l=>text(l,10));
 text('Médias usam somente valores válidos. Percentuais com base zero são indisponíveis. Não há consolidação entre unidades diferentes. A direção cadastrada orienta a comparação descritiva, não uma previsão.',10);
 text(`Snapshot: ${r.snapshotUpdatedAt??'não informado'}; emissão ${date} (Brasília). Base: ${r.basis??'não informada'}.`,10);
 }else{
 heading('1 Resumo executivo',true);text(E.focus);E.summary.forEach(l=>text(l));
 text(m?.actionPlan.length?`Decisões sugeridas: avaliar ${m.actionPlan.slice(0,2).map(a=>a.title).join('; ')}. Responsáveis, prazos e critérios são propostas descritas na seção 5.`:'Encaminhamento: validar a cobertura dos dados e pactuar o acompanhamento com as áreas responsáveis.');
 text('Atenção por meta/direção não comprova causalidade; ausência de sinalização não comprova ausência de risco.');
 heading('2 Panorama de desempenho',true);text('A Tabela 1 compara resultados do mesmo indicador. Variação: primeiro e último valor válido. Não há consolidação entre unidades.');
 table('Desempenho consolidado do recorte',['Indicador / setor / unidade','Recente / competência','Meta / direção','Variação %','Situação'],window.ReportContent.panorama(r,fmt),[49,30,32,20,29],[1,3]);
 heading('3 Análise dos indicadores prioritários',true);text(E.selection);
 if(!E.priority.length)text('Nenhum indicador corresponde ao recorte selecionado.');
 for(const [n,i] of E.priority.entries()){heading(i.indicador);const s=i.estatisticas;
  text(`Resultado: média ${fmt(s.media)} ${i.unidade??''}; mínimo ${fmt(s.minimo)}; máximo ${fmt(s.maximo)}. Valores ausentes: ${s.ausentes}.`);
  text(`Avaliação: ${i.criticalReason||'sem sinalização crítica pelos critérios cadastrados; verificar cobertura, meta e direção antes de concluir.'}`);
  const actions=m?.actionPlan.filter(a=>a.relatedIndicators.some(x=>x.id===i.id))??[];
  text(`Encaminhamento: ${actions.length?actions.map(a=>a.title).join('; '):'validar os registros e acompanhar as próximas competências.'}`);
  graph(i,r.indicators.indexOf(i));yield {stage:'diagnosis',processed:n+1,total:E.priority.length};
 }
 heading('4 Riscos e oportunidades de melhoria',true);text('Pontos de atenção derivam de metas e direções cadastradas. Evidências completas e ressalvas individuais: Apêndice D.');
 if(m?.priorityRisks.length)table('Riscos e evidências prioritários',['Indicador / prioridade','Ponto de atenção','Evidência'],m.priorityRisks.filter(p=>E.priority.some(i=>i.id===p.indicatorId)).map(p=>[`${p.title}\n${p.priority??'Atenção'}`,p.description,p.evidence]),[44,58,58],[],'Quadro');else text('Sem riscos adicionais classificados. Validar qualidade e completude antes de decidir.');
 heading('5 Plano de ação e recomendações preventivas',true);text('As iniciativas são propostas para avaliação, não ações executadas ou aprovadas. Objetivos, público, evidências, etapas e ressalvas completos: Apêndice D.');
 table('Plano de ação consolidado',['Prioridade / indicadores','Iniciativa','Responsável / prazo sugeridos','Acompanhamento'],(m?.actionPlan??[]).map((a,n)=>[`${a.priority}\n${a.relatedIndicators.length} relacionados; ver A${n+1} no Apêndice D.`,`A${n+1} · ${a.title}`,`${a.suggestedOwner}\n${a.suggestedTimeline}`,`Indicadores relacionados à iniciativa.\n${a.evaluationCriterion}`]),[34,42,42,42],[],'Quadro');
 const groups=new Map();for(const c of m?.campaignSuggestions??[]){const key=JSON.stringify([c.title,c.objective,c.message,c.audience,c.basis,c.limitations]);if(!groups.has(key))groups.set(key,{c,ids:[]});groups.get(key).ids.push(c.indicatorId);}
 table('Campanhas e comunicação para avaliação',['Iniciativa / público','Canal e formato','Indicadores relacionados'],[...groups.values()].map(({c,ids})=>[`${c.title}\n${c.audience}`,'Campanha proposta',ids.map(id=>r.indicators.find(i=>i.id===id)?.indicador??id).join('; ')]).concat((m?.communicationSuggestions??[]).map(c=>[`${c.theme}\n${c.audience}`,`${c.channel} / ${c.format}`,r.indicators.find(i=>i.id===c.indicatorId)?.indicador??c.indicatorId])),[65,35,60],[],'Quadro');
 heading('6 Conclusão executiva',true);text(`${r.criticalCount} indicadores requerem atenção pelos critérios configurados. Priorizar a revisão das evidências e a avaliação das iniciativas da seção 5, pactuando responsáveis e prazos antes da execução. Monitorar os indicadores relacionados nas competências seguintes, sem prometer redução de eventos ou atribuir causas a dados agregados.`);
 heading('7 Metodologia e limitações',true);text('Dados: snapshot validado do Supabase. Médias consideram apenas valores válidos. Percentuais com base zero são indisponíveis. A direção cadastrada orienta a comparação descritiva. Taxas não são somadas nem ponderadas sem denominadores compatíveis. Metas nulas e zero têm significados distintos.');
 unique(E.limitations).forEach(l=>text(l));text(E.selection);text(`Snapshot: ${r.snapshotUpdatedAt??'não informado'}; emissão ${date} (Brasília). Base: ${r.basis??'não informada'}.`,10);
 }
 heading('REFERÊNCIAS',true,true);text(`D’GRANEL. Dashboard operacional: snapshot de indicadores. Dados internos; atualização ${r.snapshotUpdatedAt??'não informada'}; consulta na emissão ${date}.`);
 heading('APÊNDICE A – Cadastro e estatísticas',true,true);text('Indisp. = indisponível; N/A = soma não aplicável. As tabelas preservam o cadastro e as estatísticas exibidas na versão anterior.');
 if(V&&r.indicators.length>15)table('Panorama gerencial completo',['Indicador / setor / unidade','Recente / meta atual','Desempenho / tendência','Criticidade operacional'],window.ReportContent.v6Overview(r,fmt),[47,34,51,28]);
 if(V&&V.charts.excluded.length){for(const reason of new Set(V.charts.excluded.map(x=>x.reason)))text(reason+' — IDs: '+V.charts.excluded.filter(x=>x.reason===reason).map(x=>String(x.id)).join('; ')+'. Dados integrais nas tabelas.',10);}
 table('Cadastro dos indicadores',['Indicador / identificação','Setor / unidade','Meta / direção','Atualização'],r.indicators.map(i=>[`${i.indicador}\nID: ${i.id}`,`${i.setor}\n${i.unidade??'Não informada'}`,`${fmt(i.meta)}\n${direction(i)}`,i.ultimaAtualizacao??'Não informada']),[57,32,36,35]);
 const statsRows=[];for(const [n,i] of r.indicators.entries()){const s=i.estatisticas;statsRows.push([i.indicador,fmt(s.media),window.ReportExecutive?window.ReportExecutive.sum(r,i,fmt):s.somaAplicavel?fmt(s.soma):'N/A',fmt(s.minimo),fmt(s.maximo),String(s.ausentes)]);yield {stage:'compose',processed:n+1,total:r.indicators.length};}
 table('Estatísticas determinísticas por indicador',['Indicador','Média','Soma','Mínimo','Máximo','Ausências'],statsRows,[55,21,21,21,21,21],[1,2,3,4,5]);
 heading('APÊNDICE B – Histórico completo',true,true);text('Cada célula mensal contém, nesta ordem: resultado; variação absoluta; variação percentual em relação à competência anterior. Ausente = valor nulo; Indisp. = comparação indisponível. Unidade e meta: Apêndice A. Todos os resultados do recorte estão incluídos.');
 font(10);const fitsSix=[...r.competencias,...r.indicators.flatMap(i=>i.estatisticas.mensais.flatMap(p=>[p.valor===null?'Ausente':fmt(p.valor),fmt(p.variacaoAnterior?.absoluta),`${fmt(p.variacaoAnterior?.percentual)}%`]))].every(value=>doc.getTextWidth(String(value))<=(W-48)/6-3);
 const historyColumns=fitsSix?6:4;
 for(let offset=0;offset<r.competencias.length;offset+=historyColumns){const months=r.competencias.slice(offset,offset+historyColumns),width=(W-48)/months.length;
  table(`Histórico – ${months[0]} a ${months.at(-1)}`,['Indicador',...months],r.indicators.map(i=>[i.indicador,...months.map(c=>{const p=i.estatisticas.mensais.find(p=>p.competencia===c);return `${p?.valor===null||p?.valor===undefined?'Ausente':fmt(p.valor)}\n${fmt(p?.variacaoAnterior?.absoluta)}\n${fmt(p?.variacaoAnterior?.percentual)}%`;})]),[48,...months.map(()=>width)],months.map((_,n)=>n+1));
 }
 const complementary=r.indicators.map((i,n)=>({i,n})).filter(({i,n})=>!E.priority.includes(i)&&images[n]&&chartIds.has(i.id));
 if(!V||complementary.length){
 heading('APÊNDICE C – Gráficos complementares',true,true);text('Gráficos prioritários junto à análise executiva. Séries numéricas integrais no Apêndice B.');
 for(const [index,{i,n}] of complementary.entries()){graph(i,n);yield {stage:'figures',processed:index+1,total:complementary.length};}
 if(!images.some(Boolean))text('Gráficos não fornecidos ao compositor nesta execução. Consulte o histórico numérico integral.');
 }
 heading('APÊNDICE D – Evidências e propostas completas',true,true);text('Evidências e iniciativas do catálogo validado. Ressalvas gerais centralizadas na metodologia; condições específicas permanecem junto ao indicador.',10);
 const sections=window.ReportContent.sections(r),communicationBlocks=sections.final[2]?.blocks??[];
 const blocks=[...(sections.final[1]?.blocks??[]),...new Map(communicationBlocks.map(b=>[JSON.stringify({title:b.title,lines:unique(b.lines)}),b])).values()];
 if(m){
  // Une diagnóstico, risco e evidência da ação somente quando os textos são idênticos,
  // mantendo a associação por ID. Não remove fatos por similaridade ou por palavras-chave.
  const evidenceRows=r.indicators.map(i=>{
   const diagnoses=m.executiveDiagnosis.filter(d=>d.indicatorId===i.id),risks=m.priorityRisks.filter(p=>p.indicatorId===i.id);
   const evidence=unique([...diagnoses.flatMap(d=>[d.situation,...d.evidence,...d.limitations]),...risks.flatMap(p=>[p.description,p.evidence,...(V?[]:[`Prioridade: ${p.priority??'não informada'}`])]),...m.actionPlan.flatMap(a=>a.evidence.filter(e=>e.indicatorId===i.id).map(e=>e.text))]);
   return [i.indicador,evidence.join('\n')||'Sem interpretação complementar.'];
  });
  table('Diagnóstico e evidências por indicador',['Indicador','Evidências e ressalvas'],evidenceRows,[42,118],[],'Quadro');
 }
 for(const [n,b] of blocks.entries()){
  const action=n<(m?.actionPlan.length??0)?m.actionPlan[n]:null;
  heading(action?`A${n+1} – ${b.title}`:b.title);
  unique(b.lines).filter(line=>(!action||!line.startsWith('Evidência: '))&&(!V||!['A associação ao indicador não confirma causas individuais.','Responsável e prazo são sugestões, sujeitos à avaliação e aprovação da empresa.'].includes(line))).forEach(line=>{
   if(action&&V&&line.startsWith('Prioridade:'))text('Prioridade de acompanhamento: '+V.actions[n].priority+'. Criticidade operacional conforme panorama validado.',10);
   else if(action&&line===`Monitorar: ${action.relatedIndicators.map(i=>i.name).join('; ')}`)text('Monitorar: os mesmos indicadores relacionados acima.',10);
   else text(line,10);
  });
  if(action&&V)text('Situação: Sugerida. Objetivos e responsáveis por área dependem de pactuação.',10);
  if(action)text('Evidências: quadro de diagnóstico deste apêndice, associadas aos indicadores relacionados.',10);
  yield {stage:'management',processed:n+1,total:blocks.length};
 }
 if(!m&&r.interpretation){heading('Interpretação gerencial');text(r.interpretation);}if(!blocks.length&&!r.interpretation)text('Conteúdo complementar indisponível. Dados determinísticos preservados nos apêndices anteriores.');
 if(V)ensure(65); // Manter o formulário curto inteiro, sem uma última linha isolada.
 heading('FORMULÁRIO DE IDENTIFICAÇÃO',true,true);text(`Título: Relatório gerencial ${r.type}. Autor-entidade e instituição executora: D’Granel. Projeto: Dashboard operacional. Classificação: uso interno. Data: ${date}. Edição editorial: ${V?'V6':'V5'}. Período: ${period}.`);
 text('Endereço institucional, local de publicação, instituição patrocinadora e identificadores bibliográficos: não informados no cadastro. Não foram inferidos.');text('Resumo e palavras-chave: elementos iniciais. Distribuição interna eletrônica.');
 return yield* finishPdf(completeContents,historyColumns);
 }
};
