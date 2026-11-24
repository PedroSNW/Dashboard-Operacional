// Editorial draft only, held in session memory. Never enters dashboard pending state.
(() => {
    const C=window.ReportEvidence;
    const $=id=>document.getElementById(id),el=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
    const packFor=(source,keys)=>C.evidence(source,keys);
    let cooldownUntil=0;
    let state=null,root=null,activeId=null,mode='deterministic',showEditor=false,phase='';
    const waitSeconds=()=>Math.max(0,Math.ceil((cooldownUntil-Date.now())/1000));
    const owner=()=>currentSession?.user?.id;
    const key=()=>JSON.stringify([owner(),managementSignature,managementReport?.basis,managementReport?.snapshotUpdatedAt]);
    const compatible=()=>state&&state.key===key()&&managementSignature===reportSignature()&&supabaseStateLoaded&&supabaseReady&&!hasUnsavedChanges&&!(managementReport.snapshotUpdatedAt&&lastSupabaseSavedAt>Date.parse(managementReport.snapshotUpdatedAt));
    function reset(){if(managementReport)delete managementReport.authored;state=null;activeId=null;mode='deterministic';showEditor=false;phase='';root?.replaceChildren();if(root)root.hidden=true;}
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
        try{reportReady();
            if(compatible()){mode='authored';showEditor=true;status('Revise a análise para baixar o PDF.');focusReportResults();return;}
            const wait=waitSeconds();if(wait)throw Error(`Tente novamente em ${wait} s.`);
            if(!reportHasCurrentPreview()&&!await generateManagementReport({forAnalysis:true}))return;
            if(!managementReport.indicators.length){status('Não há indicadores nesse recorte para analisar.');focusReportResults();return;}
            reportSetBusy(true);const source=managementReport,signature=key();status('A Groq está interpretando os indicadores e formulando propostas…');
            const body=await request('generate');
            if(!body.document)throw Error('Versão da elaboração incompatível. Use a base sem IA.');
            reportReady();if(source!==managementReport||signature!==key()||managementSignature!==reportSignature()||body.reportBasis!==source.basis||body.snapshotUpdatedAt!==source.snapshotUpdatedAt)throw Error('Conteúdo desatualizado. Gere novamente a base.');
            const keys=body.evidenceKeys;
            if(!Array.isArray(keys)||!keys.length||new Set(keys).size!==keys.length||keys.some(key=>typeof key!=='string'))throw Error('Registro de evidências da Groq indisponível.');
            status('Validando referências e estrutura…');const pack=packFor(source,keys),check=C.validate(body.document,pack);
            if(pack.items.length!==keys.length)throw Error('Registro de evidências incompatível com a base.');
            if(!check.valid)throw Error('Resposta autoral incompatível. O relatório sem IA foi preservado.');
            state={key:signature,evidenceKeys:keys,original:C.clone(body.document),draft:C.clone(body.document),pack,coverage:body.coverage,removed:body.validation?.removed??0,hidden:[],saved:null,dirty:false,acknowledged:false};
            mode='authored';showEditor=true;activeId=state.draft.sections[0]?.id;
            status('Análise pronta para revisão.');focusReportResults();
        }catch(e){status(e.message+(reportHasCurrentPreview()?' A prévia sem IA está disponível.':''));}
        finally{reportSetBusy(false);}
    }
    function candidate(){const doc=C.clone(state.draft);doc.sections=doc.sections.filter(s=>!state.hidden.includes(s.id)).map((s,index)=>({...s,order:index+1}));return doc;}
    function changed(){state.draft.sections.forEach((s,index)=>s.order=index+1);state.dirty=true;state.acknowledged=false;delete managementReport.authored;phase='Revisão alterada';$('reportEditorialState').textContent=phase;if($('reportEditorialAck'))$('reportEditorialAck').checked=false;validateVisible();updateExportState();}
    function updateExportState(){const button=$('reportExport');if(!button||mode!=='authored'||!state)return;const blocked=!compatible()||!state.saved||state.dirty||!state.acknowledged||!managementReport?.authored;button.disabled=managementBusy||blocked;button.setAttribute('aria-disabled',String(button.disabled));if(blocked)$('reportDownloadState').textContent='Confirme a revisão ou escolha usar só os dados para baixar o PDF.';}
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
            state.saved=C.clone(doc);state.dirty=false;state.acknowledged=true;showEditor=false;
            source.authored={evidenceKeys:state.evidenceKeys,document:C.clone(doc),basis:source.basis,snapshotUpdatedAt:source.snapshotUpdatedAt,owner:owner(),reviewed:true,coverage:state.coverage};
            renderManagementReport();status('Revisão confirmada. O PDF está pronto para baixar.');
            $('reportActionsTitle').focus();
        }catch(e){status('Erro recuperável: '+e.message);}
        finally{reportSetBusy(false);}
    }
    function button(text,action){const b=el('button',text,'v3-button');b.type='button';b.onclick=action;return b;}
    function field(label,value,oninput,multiline=true,limit=multiline?1800:90){const wrap=el('label',label,'report-editor-field'),input=el(multiline?'textarea':'input');input.value=value;input.maxLength=limit;if(multiline)input.rows=label==='Como acompanhar'?3:5;input.oninput=()=>{oninput(input.value);changed();};wrap.append(input);return wrap;}
    function restoreSection(id){const original=state.original.sections.find(s=>s.id===id);state.draft.sections=state.draft.sections.map(s=>s.id===id?C.clone(original):s);state.hidden=state.hidden.filter(key=>key!==id);changed();render();}
    function render(){
        if(!root||!state)return;root.hidden=mode!=='authored'||!showEditor;if(root.hidden)return;
        root.replaceChildren(el('h3','Confira a análise','report-review-title'));
        const statusNode=el('p',phase);statusNode.id='reportEditorialState';statusNode.setAttribute('role','status');root.append(statusNode);
        root.append(el('p','Confira as seções antes de confirmar. Os valores oficiais já aparecem nas evidências.','ux-meta'));
        if(state.coverage?.partial){
            const coverage=`Cobertura parcial da elaboração: ${state.coverage.sent} de ${state.coverage.selected} indicadores. Dados completos preservados no relatório sem IA e nos apêndices.`;
            root.append(el("p",coverage,"ux-action-hint"));
        }
        if(state.removed)root.append(el('p',state.removed===1?'Um trecho da IA foi omitido na validação.':`${state.removed} trechos da IA foram omitidos na validação.`,'ux-action-hint'));
        const layout=el('div','','report-editor-layout'),nav=el('nav');nav.setAttribute('aria-label','Seções da revisão');
        const sectionNames={summary:'Síntese',integrated:'Achado',hypothesis:'Hipótese',action:'Proposta',conclusion:'Conclusão'};
        for(const s of state.draft.sections){const b=button(s.title,()=>{activeId=s.id;render();root.querySelector('[data-section-title]')?.focus();});b.prepend(el('small',state.hidden.includes(s.id)?'Oculta':sectionNames[s.type],'report-section-kind'));b.setAttribute('aria-current',String(s.id===activeId));nav.append(b);}
        const s=state.draft.sections.find(s=>s.id===activeId)??state.draft.sections[0];activeId=s?.id;
        const editor=el('section','','report-review-body');if(s){const title=field('Título da seção',s.title,value=>s.title=value,false);title.querySelector('input').dataset.sectionTitle='true';editor.append(title,field(s.type==='action'?'O que fazer':'Texto da análise',s.text,value=>s.text=value));
            if(s.type==='action'){
                const wrap=el('label','Horizonte sugerido'),days=el('select');
                for(const d of [0,30,60,90])days.add(new Option(d?`${d} dias`:'A pactuar',String(d)));
                days.value=String(s.days);days.onchange=()=>{s.days=Number(days.value);changed();};wrap.append(days);editor.append(wrap);
                if(Object.hasOwn(s,'owner'))editor.append(field('Área sugerida',s.owner,value=>s.owner=value,false,100),field('Como acompanhar',s.followUp,value=>s.followUp=value,true,420));
            }
            const evidence=el('details','','report-review-evidence'),summary=el('summary','Evidências oficiais');evidence.open=true;evidence.append(summary);s.refs.forEach(ref=>evidence.append(el('p',C.project(ref,state.pack)??'Referência inválida')));editor.append(evidence);
            const controls=el('div','','report-editor-controls');for(const [delta,label] of [[-1,'Mover acima'],[1,'Mover abaixo']]){const b=button(label,()=>{const from=state.draft.sections.indexOf(s),to=from+delta;[state.draft.sections[from],state.draft.sections[to]]=[state.draft.sections[to],state.draft.sections[from]];changed();render();});const index=state.draft.sections.indexOf(s);b.disabled=index+delta<0||index+delta>=state.draft.sections.length;controls.append(b);}
            controls.append(button(state.hidden.includes(s.id)?'Mostrar seção':'Ocultar seção',()=>{state.hidden=state.hidden.includes(s.id)?state.hidden.filter(id=>id!==s.id):[...state.hidden,s.id];changed();render();}),button('Restaurar seção',()=>restoreSection(s.id)));
            const options=el('details');options.append(el('summary','Opções da seção'),controls);editor.append(options);
        }layout.append(nav,editor);root.append(layout);
        const issues=el('p');issues.id='reportEditorialIssues';issues.setAttribute('role','status');root.append(issues);
        const ackLabel=el('label','','report-editor-ack'),ack=el('input');ack.type='checkbox';ack.id='reportEditorialAck';ack.checked=state.acknowledged;ack.onchange=()=>{state.acknowledged=ack.checked;validateVisible();updateExportState();};ackLabel.append(ack,document.createTextNode('Revisei as interpretações e as sugestões. Esta revisão não equivale à aprovação institucional.'));root.append(ackLabel);
        const actions=el('div','','report-editor-controls'),saveButton=button('Confirmar revisão',save);saveButton.id='reportEditorialSave';saveButton.className='report-primary';
        actions.append(saveButton,button('Usar só os dados',()=>{mode='deterministic';showEditor=false;delete managementReport.authored;root.hidden=true;renderManagementReport();status('Prévia com os dados oficiais, pronta para baixar.');}));root.append(actions);
        validateVisible();
        root.querySelectorAll('input,textarea,select,button').forEach(n=>{if(managementBusy)n.disabled=true;});
    }
    function update({consistent,canPrepare}){
        if(!root)return;if(state&&(!owner()||state.key!==key()||!consistent)){reset();phase='Conteúdo desatualizado — gere novamente a base.';}
        const ai=$('reportAI');if(ai){
            const coolingDown=waitSeconds()>0&&!(compatible());
            ai.textContent=coolingDown?'Aguardando a Groq':compatible()?'Reabrir análise':'Gerar análise com IA';
            ai.disabled=managementBusy||!canPrepare||coolingDown;
            ai.setAttribute('aria-disabled',String(ai.disabled));
            ai.title=coolingDown?'A geração será liberada após o intervalo informado.':'';
        }
        if(state)render();
        $('reportPreview').hidden=Boolean(showEditor&&mode==='authored'&&consistent);
        updateExportState();
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
    window.ReportAuthoring={generate,reset,update,assertExportable,verifyExport,preview,renderCompact,renderDetails,save,restoreSection,inspect:()=>state?C.clone({phase,mode,...state}):{phase,mode}};
    document.addEventListener('DOMContentLoaded',()=>{root=$('reportEditorial');reportUpdateActions();});
})();
