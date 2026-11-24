// Editorial draft only, held in session memory. Never enters dashboard pending state.
(() => {
    const C=window.ReportEvidence;
    const $=id=>document.getElementById(id),el=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
    const packFor=(source,keys)=>C.evidence(source,keys);
    let cooldownUntil=0;
    let state=null,root=null,activeId=null,mode='deterministic',phase='Sem dados';
    const waitSeconds=()=>Math.max(0,Math.ceil((cooldownUntil-Date.now())/1000));
    const owner=()=>currentSession?.user?.id;
    const key=()=>JSON.stringify([owner(),managementSignature,managementReport?.basis,managementReport?.snapshotUpdatedAt]);
    const compatible=()=>state&&state.key===key()&&managementSignature===reportSignature()&&supabaseStateLoaded&&supabaseReady&&!hasUnsavedChanges&&!(managementReport.snapshotUpdatedAt&&lastSupabaseSavedAt>Date.parse(managementReport.snapshotUpdatedAt));
    function reset(){if(managementReport)delete managementReport.authored;state=null;activeId=null;mode='deterministic';phase='Sem dados';root?.replaceChildren();if(root)root.hidden=true;}
    const status=text=>{phase=text;reportMessage(text);if($('reportEditorialState'))$('reportEditorialState').textContent=text;};
    async function request(action, document){
        reportReady();
        const payload={action,selection:reportSelection(),managementContext:reportContextValue(),
            expectedUpdatedAt:managementReport.snapshotUpdatedAt,expectedReportBasis:managementReport.basis,
            ...(action==='review'?{document,reviewAcknowledged:true}:{})};
        try{return await requestDashboardEdge(payload);}
        catch(error){
            if(action==='generate'&&error.retryAfter){
                cooldownUntil=Date.now()+error.retryAfter*1000;
                setTimeout(reportUpdateActions,error.retryAfter*1000);
                error.message+=' Tente novamente em '+error.retryAfter+' s.';
            }
            throw error;
        }
    }
    async function generate(){
        if(managementBusy)return;
        try{reportReady();if(!managementReport||managementSignature!==reportSignature())throw Error('Gere uma base validada para os filtros atuais.');
            if(compatible()){mode='authored';render();status('Pronto para revisão. A elaboração existente foi preservada, sem nova chamada.');return;}
            const wait=waitSeconds();if(wait)throw Error(`Tente novamente em ${wait} s.`);
            reportSetBusy(true);const source=managementReport,signature=key();status('Análise solicitada — selecionando destaques com Groq…');
            const body=await request('generate');
            if(!body.document)throw Error('Versão da elaboração incompatível. Use a base sem IA.');
            reportReady();if(source!==managementReport||signature!==key()||managementSignature!==reportSignature()||body.reportBasis!==source.basis||body.snapshotUpdatedAt!==source.snapshotUpdatedAt)throw Error('Conteúdo desatualizado. Gere novamente a base.');
            const keys=body.evidenceKeys;
            if(!Array.isArray(keys)||!keys.length||new Set(keys).size!==keys.length||keys.some(key=>typeof key!=='string'))throw Error('Registro de evidências da Groq indisponível.');
            status('Validando referências e estrutura…');const pack=packFor(source,keys),check=C.validate(body.document,pack);
            if(pack.items.length!==keys.length)throw Error('Registro de evidências incompatível com a base.');
            if(!check.valid)throw Error('Resposta autoral incompatível. O relatório sem IA foi preservado.');
            state={key:signature,evidenceKeys:keys,original:C.clone(body.document),draft:C.clone(body.document),pack,coverage:body.coverage,issues:body.validation?.issues??[],hidden:[],saved:null,dirty:false,acknowledged:false};mode='authored';activeId=state.draft.sections[0]?.id;
            render();status('Pronto para revisão — confira as interpretações e sugestões antes de salvar a revisão local.');
        }catch(e){status('Erro recuperável: '+e.message+' O relatório sem IA permanece disponível.');}
        finally{reportSetBusy(false);}
    }
    function candidate(){const doc=C.clone(state.draft);doc.sections=doc.sections.filter(s=>!state.hidden.includes(s.id)).map((s,index)=>({...s,order:index+1}));return doc;}
    function changed(){state.draft.sections.forEach((s,index)=>s.order=index+1);state.dirty=true;state.acknowledged=false;delete managementReport.authored;phase='Revisão alterada';$('reportEditorialState').textContent=phase;if($('reportEditorialAck'))$('reportEditorialAck').checked=false;validateVisible();updatePreview();updateExportState();}
    function updateExportState(){const button=$('reportExport');if(!button||mode!=='authored'||!state)return;const blocked=!compatible()||!state.saved||state.dirty||!state.acknowledged||!managementReport?.authored;button.disabled=managementBusy||blocked;button.setAttribute('aria-disabled',String(button.disabled));if(blocked){button.title='Revise o texto e salve a revisão local, ou escolha usar o relatório sem IA.';if($('reportActionHint'))$('reportActionHint').textContent=button.title;}else button.title='Exportar a revisão local validada.';}
    function updatePreview(){const body=$('reportEditorialPreviewBody');if(!body)return;body.replaceChildren(el('h3',state.draft.title));for(const section of candidate().sections){body.append(el('h3',section.title));C.lines(section,state.pack).forEach(line=>body.append(el('p',line)));}}
    function validateVisible(){
        const check=C.validate(candidate(),state.pack),labels={schema_invalido:'Estrutura incompatível',verificar_interpretacao:'Confira a afirmação nas evidências oficiais',soma_financeira:'Revise a consolidação financeira',conteudo_nao_editorial:'Remova conteúdo sensível',numero_livre:'Use a evidência oficial para números',evidencia_inexistente:'Evidência fora do recorte',causalidade_nao_comprovada:'Revise a relação causal',julgamento_sem_direcao:'Revise o julgamento do indicador'};
        $('reportEditorialIssues').textContent=check.issues.length?check.issues.map(i=>`${i.severity==='blocking'?'Correção obrigatória':'Revisão humana'} · ${state.draft.sections.find(s=>s.id===i.section)?.title??'Documento'}: ${i.codes.map(code=>labels[code]??'Revise o conteúdo desta seção').join('; ')}`).join(' · '):'Referências estruturadas consistentes. O conteúdo interpretativo exige revisão humana.';
        $('reportEditorialSave').disabled=managementBusy||!check.valid||!$('reportEditorialAck').checked;
        return check;
    }
    async function save(){
        if(managementBusy||!compatible())return;
        const check=validateVisible();if(!check.valid||!$('reportEditorialAck').checked)return;
        reportSetBusy(true);const source=managementReport,signature=key(),doc=check.document;status('Validando evidências no snapshot autorizado…');
        try{const body=await request('review',doc);reportReady();if(source!==managementReport||signature!==key()||managementSignature!==reportSignature()||body.reportBasis!==source.basis||body.snapshotUpdatedAt!==source.snapshotUpdatedAt)throw Error('A base mudou durante a revisão.');
            if(JSON.stringify(body.document)!==JSON.stringify(doc)||!C.validate(body.document,state.pack).valid)throw Error('Revisão retornada incompatível.');
            state.saved=C.clone(doc);state.issues=check.issues;state.draft.title=doc.title;for(const s of doc.sections){const draft=state.draft.sections.find(d=>d.id===s.id);if(draft)draft.title=s.title;}state.dirty=false;state.acknowledged=true;
            source.authored={evidenceKeys:state.evidenceKeys,document:C.clone(doc),basis:source.basis,snapshotUpdatedAt:source.snapshotUpdatedAt,owner:owner(),reviewed:true,coverage:state.coverage};
            renderManagementReport();render();status('Revisão validada — pronto para exportação. Revisão em memória, sem aprovação institucional.');
        }catch(e){status('Erro recuperável: '+e.message);}
        finally{reportSetBusy(false);}
    }
    function button(text,action){const b=el('button',text,'v3-button');b.type='button';b.onclick=action;return b;}
    function field(label,value,oninput,multiline=true){const wrap=el('label',label,'report-editor-field'),input=el(multiline?'textarea':'input');input.value=value;input.maxLength=multiline?1800:90;if(multiline)input.rows=5;input.oninput=()=>{oninput(input.value);changed();};wrap.append(input);return wrap;}
    function restoreSection(id){const original=state.original.sections.find(s=>s.id===id);state.draft.sections=state.draft.sections.map(s=>s.id===id?C.clone(original):s);state.hidden=state.hidden.filter(key=>key!==id);changed();render();}
    function restoreAll(){state.draft=C.clone(state.original);state.hidden=[];changed();render();}
    function render(){
        if(!root||!state)return;root.hidden=mode!=='authored';if(root.hidden)return;
        root.replaceChildren(el('h2','Revisão do relatório','v3-report-heading'));
        const statusNode=el('p',phase);statusNode.id='reportEditorialState';statusNode.setAttribute('role','status');root.append(statusNode);
        root.append(el('p','O rascunho fica somente nesta sessão. Edite interpretações; números oficiais aparecem nas referências e não são editáveis. Propostas dependem de avaliação da gestão.','ux-meta'));
        if(state.coverage?.partial){
            const coverage=`Cobertura parcial da elaboração: ${state.coverage.sent} de ${state.coverage.selected} indicadores. Dados completos preservados no relatório sem IA e nos apêndices.`;
            root.append(el("p",coverage,"ux-action-hint"));
        }
        if(state.issues.length)root.append(el('p',state.issues.some(i=>i.severity==='blocking')?'Trechos inconsistentes foram removidos da resposta. Revise as seções preservadas.':'Há sugestões de revisão editorial. O texto foi preservado para avaliação humana.','ux-action-hint'));
        root.append(field('Título do documento',state.draft.title,value=>state.draft.title=value,false));
        const layout=el('div','','report-editor-layout'),nav=el('nav');nav.setAttribute('aria-label','Seções da revisão');
        for(const s of state.draft.sections){const b=button((state.hidden.includes(s.id)?'Oculta · ':'')+s.title,()=>{activeId=s.id;render();root.querySelector('[data-section-title]')?.focus();});b.setAttribute('aria-current',String(s.id===activeId));nav.append(b);}
        const s=state.draft.sections.find(s=>s.id===activeId)??state.draft.sections[0];activeId=s?.id;
        const editor=el('section');if(s){const title=field('Título da seção',s.title,value=>s.title=value,false);title.querySelector('input').dataset.sectionTitle='true';editor.append(title,field('Interpretação / hipótese / sugestão',s.text,value=>s.text=value));
            const priorityLabel=el('label','Prioridade editorial'),priority=el('select');priority.add(new Option('Principal','primary'));priority.add(new Option('Complementar','supporting'));priority.value=s.priority;priority.onchange=()=>{s.priority=priority.value;changed();};priorityLabel.append(priority);editor.append(priorityLabel);
            editor.append(el("p","Confira o texto com as evidências oficiais abaixo.","ux-meta"));
            const evidence=el('details'),summary=el('summary','Evidências oficiais — somente leitura');evidence.append(summary);s.refs.forEach(ref=>evidence.append(el('p',C.project(ref,state.pack)??'Referência inválida')));editor.append(evidence);
            if(s.type==='action'){
                const wrap=el('label','Horizonte sugerido'),days=el('select');
                for(const d of [0,30,60,90])days.add(new Option(d?`${d} dias`:'A pactuar',String(d)));
                days.value=String(s.days);days.onchange=()=>{s.days=Number(days.value);changed();};wrap.append(days);editor.append(wrap);
            }
            const controls=el('div','','report-editor-controls');for(const [delta,label] of [[-1,'Mover acima'],[1,'Mover abaixo']]){const b=button(label,()=>{const from=state.draft.sections.indexOf(s),to=from+delta;[state.draft.sections[from],state.draft.sections[to]]=[state.draft.sections[to],state.draft.sections[from]];changed();render();});const index=state.draft.sections.indexOf(s);b.disabled=index+delta<0||index+delta>=state.draft.sections.length;controls.append(b);}
            controls.append(button(state.hidden.includes(s.id)?'Mostrar seção':'Ocultar seção',()=>{state.hidden=state.hidden.includes(s.id)?state.hidden.filter(id=>id!==s.id):[...state.hidden,s.id];changed();render();}),button('Restaurar seção',()=>restoreSection(s.id)));editor.append(controls);
            const original=el('details');original.append(el('summary','Comparar com texto gerado'),el('p',state.original.sections.find(o=>o.id===s.id)?.text??''));editor.append(original);
        }layout.append(nav,editor);root.append(layout);
        const issues=el('p');issues.id='reportEditorialIssues';issues.setAttribute('role','status');root.append(issues);
        const ackLabel=el('label','','report-editor-ack'),ack=el('input');ack.type='checkbox';ack.id='reportEditorialAck';ack.checked=state.acknowledged;ack.onchange=()=>{state.acknowledged=ack.checked;validateVisible();updateExportState();};ackLabel.append(ack,document.createTextNode('Revisei as interpretações e as sugestões. Esta revisão não equivale à aprovação institucional.'));root.append(ackLabel);
        const actions=el('div','','report-editor-controls'),saveButton=button('Salvar revisão local',save);saveButton.id='reportEditorialSave';actions.append(saveButton,button('Descartar revisão',()=>{state.draft=C.clone(state.saved??state.original);state.hidden=[];changed();render();}),button('Restaurar versão gerada',restoreAll),button('Usar relatório sem IA',()=>{mode='deterministic';delete managementReport.authored;root.hidden=true;renderManagementReport();status('Base pronta — exportação sem elaboração autoral. Rascunho compatível preservado em memória.');}));root.append(actions);
        const preview=el('details'),previewBody=el('div');previewBody.id='reportEditorialPreviewBody';preview.append(el('summary','Prévia do documento revisado'),previewBody);root.append(preview);updatePreview();validateVisible();
        root.querySelectorAll('input,textarea,select,button').forEach(n=>{if(managementBusy)n.disabled=true;});
    }
    function update({consistent,ready}){
        if(!root)return;if(state&&(!owner()||state.key!==key()||!consistent)){reset();phase='Conteúdo desatualizado — gere novamente a base.';}
        if(!state&&phase==='Sem dados'&&managementReport&&consistent)phase='Base pronta';
        const ai=$('reportAI');if(ai){
            const coolingDown=waitSeconds()>0&&!(compatible());
            ai.textContent=coolingDown?'Aguardando disponibilidade da IA':'Gerar relatório com Groq';
            ai.disabled=managementBusy||!ready||!managementReport?.indicators.length||coolingDown;
            ai.setAttribute('aria-disabled',String(ai.disabled));
            ai.title=coolingDown?'A geração será liberada após o intervalo informado.':'Selecionar destaques e propostas com Groq';
        }
        if($('reportGenerate'))$('reportGenerate').textContent='Gerar base sem IA';
        if(state&&root&&!root.hidden)render();updateExportState();
    }
    function assertExportable(source){if(mode!=='authored')return;if(!compatible()||!state.saved||state.dirty||!source.authored||!state.acknowledged)throw Error('Revise o texto e salve uma revisão local validada, ou escolha usar o relatório sem IA.');if(!C.validate(source.authored.document,packFor(source,state.evidenceKeys)).valid)throw Error('A revisão não passou na validação de evidências.');}
    async function verifyExport(source){
        if(!source.authored)return;
        const body=await request('review',source.authored.document);
        if(body.reportBasis!==source.basis||body.snapshotUpdatedAt!==source.snapshotUpdatedAt||JSON.stringify(body.document)!==JSON.stringify(source.authored.document))
            throw Error('A revisão não corresponde ao snapshot autorizado.');
    }
    function preview(container){if(!managementReport?.authored)return;const doc=managementReport.authored.document;container.prepend(el('p',doc.title+' · revisão local pronta para exportação','ux-meta'));}
    function renderCompact(container,r,expanded){
        if(!r.authored)return false;const doc=r.authored.document,pack=packFor(r,r.authored.evidenceKeys);if(!C.validate(doc,pack).valid)throw Error('A revisão não corresponde à base atual.');
        container.append(el('h2',doc.title,'v3-report-heading'),el('p',`${r.indicators.length} indicadores · ${r.competencias[0]} a ${r.competencias.at(-1)} · ${reportExportFormat()==='executive'?'Executivo':'Completo'}`,'ux-meta'),el('p',doc.sections[0].text),el('p','Revisão local validada. Propostas dependem de avaliação e aprovação da gestão.','ux-meta'));
        const toggle=button('Ver prévia completa',()=>setManagementPreviewExpanded(toggle.getAttribute('aria-expanded')!=='true'));toggle.id='reportPreviewToggle';toggle.setAttribute('aria-controls','reportPreviewDetails');toggle.setAttribute('aria-expanded','false');const details=el('div','','report-preview-details space-y-5');details.id='reportPreviewDetails';details.hidden=true;details.setAttribute('role','region');details.setAttribute('aria-label','Conteúdo completo da revisão validada');container.append(toggle,details);if(expanded)setManagementPreviewExpanded(true);return true;
    }
    function renderDetails(){
        const r=managementReport;if(!r?.authored)return false;const container=$('reportPreviewDetails'),pack=packFor(r,r.authored.evidenceKeys),doc=r.authored.document;container.replaceChildren();
        if(!C.validate(doc,pack).valid)throw Error('Revisão inválida.');
        for(const s of doc.sections){const area=el('section','','report-management-section space-y-3');area.dataset.reportSection=s.id;area.append(el('h3',s.title,'v3-report-heading'));C.lines(s,pack).forEach(line=>area.append(el('p',line)));container.append(area);}
        container.append(el('h3','Resultados oficiais e evidências','v3-report-heading'));
        if(reportExportFormat()==='complete')renderIndicatorTechnicalCards(container,r);
        else{ReportContent.panorama(r,reportValue).forEach(row=>container.append(el('p',row.join(' · '),'ux-meta')));for(const id of reportFormatChartIds(r)){const i=r.indicators.find(i=>i.id===id),canvas=el('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Evolução de '+i.indicador);const box=el('div','','h-56 relative');box.append(canvas);container.append(box);managementCharts.push(new Chart(canvas,{type:'line',...managementChartSource(i,r),options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false},datalabels:{display:false}}}}));}}
        if(r.managementContext){container.append(el('h3','Contexto informado pela gestão','v3-report-heading'),el('p','Relato sem confirmação independente; não altera indicadores ou metas oficiais.','ux-meta'));for(const [field,label] of [['actionsTaken','Ações informadas'],['difficulties','Dificuldades'],['achievements','Conquistas relatadas'],['priorities','Prioridades'],['goals','Objetivos relatados ou propostos'],['observations','Observações']])if(r.managementContext[field])container.append(el('h4',label),el('p',r.managementContext[field]));}
        container.append(el('h3','Metodologia e limitações','v3-report-heading'));[...new Set(r.limitations)].forEach(line=>container.append(el('p',line,'ux-meta')));return true;
    }
    window.ReportAuthoring={generate,reset,update,assertExportable,verifyExport,preview,renderCompact,renderDetails,save,restoreSection,restoreAll,inspect:()=>state?C.clone({phase,mode,...state}):{phase,mode}};
    document.addEventListener('DOMContentLoaded',()=>{root=el('section','','glass-card report-editor');root.id='reportEditorial';root.hidden=true;$('reportActions').after(root);const share=$('reportContextShare');if(share)share.closest('label')?.append(el('span',' Compartilhe somente informações gerenciais autorizadas, sem nomes de motoristas, documentos, placas ou detalhes jurídicos sensíveis.','ux-meta'));reportUpdateActions();});
})();
