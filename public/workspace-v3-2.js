// V3.2: apresentação e estado efêmero. Não contém transporte, escrita ou regras analíticas.
(() => {
    const $=id=>document.getElementById(id),node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e;};
    const severity={CRITICO:'Crítico',ATENCAO:'Atenção',INFORMATIVO:'Informativo'},category={variation:'Variação entre registros',target:'Comparação com a meta',trend:'Evolução no período',anomaly:'Variação atípica',freshness:'Atualização',insufficient:'Dados insuficientes'};
    let initialized=false,alertLimit=20,alertSignature='',homeSignature='',pendingChanges=[];
    const formBaselines=new WeakMap(),closing=new Set();
    const formState=modal=>JSON.stringify([...modal.querySelectorAll('input,select,textarea')].map(e=>[e.id,e.type==='checkbox'||e.type==='radio'?e.checked:e.value]));
    const loaded=()=>Boolean(currentSession&&supabaseStateLoaded&&supabaseReady);
    const statusFor=a=>a.category==='target'?(a.severity==='INFORMATIVO'?'Comparação registrada para acompanhamento.':'Resultado sinalizado pela regra de meta; confira os registros.') : a.category==='freshness'?'Verifique a atualização dos dados deste indicador.':a.category==='trend'?'Consulte a evolução e a direção cadastrada antes de decidir.':a.category==='anomaly'?'Uma mudança de padrão pede conferência dos registros.':'Compare os resultados e a direção de desempenho nos detalhes.';
    function badge(a){const b=node('span',severity[a.severity]??a.severity,'ux-severity');b.dataset.severity=a.severity;return b;}
    function updateAlertCounts(alerts){
        const counts={CRITICO:0,ATENCAO:0,INFORMATIVO:0,unread:0};alerts.forEach(a=>{if(a.severity in counts)counts[a.severity]++;if(!a.isRead)counts.unread++;});
        [['alertsCountCritical',counts.CRITICO],['alertsCountAttention',counts.ATENCAO],['alertsCountInfo',counts.INFORMATIVO],['subtabAlertsBadge',counts.unread]].forEach(([id,n])=>{if($(id))$(id).textContent=String(n);});updateHeaderAlertsBadge(counts.unread);
        return counts;
    }
    function populate(select,options){const old=select.value;select.replaceChildren(new Option('Todos','TODOS'));options.forEach(([value,label])=>select.add(new Option(label,value)));if([...select.options].some(o=>o.value===old))select.value=old;}
    function renderAlerts(){
        if(!initialized)return;
        const container=$('alertsContainer');if(!container)return;
        try{
            const alerts=loaded()?generateDeterministicAlerts():[];populateAlertSectorsFilter();updateAlertCounts(alerts);
            populate($('alertFilterIndicator'),currentData.map((i,n)=>[String(n),i.indicador+' · '+i.setor]));
            populate($('alertFilterCompetency'),[...new Set(alerts.map(a=>a.competency))].map(c=>[c,c]));
            const filters=Object.fromEntries(['View','Severity','Sector','Indicator','Competency','Category'].map(k=>[k,$('alertFilter'+k).value]));
            const signature=JSON.stringify([currentSession?.user?.id,filters]);if(signature!==alertSignature){alertSignature=signature;alertLimit=20;}
            const filtered=alerts.filter(a=>(filters.View!=='unread'||!a.isRead)&&(filters.View!=='read'||a.isRead)&&(filters.Severity==='TODOS'||a.severity===filters.Severity)&&(filters.Sector==='TODOS'||a.sector===filters.Sector)&&(filters.Indicator==='TODOS'||String(a.indicatorIndex)===filters.Indicator)&&(filters.Competency==='TODOS'||a.competency===filters.Competency)&&(filters.Category==='TODOS'||a.category===filters.Category));
            filtered.sort((a,b)=>({CRITICO:0,ATENCAO:1,INFORMATIVO:2}[a.severity]-{CRITICO:0,ATENCAO:1,INFORMATIVO:2}[b.severity]));
            const groups=new Map();for(const a of filtered){const key=JSON.stringify([Number.isInteger(a.indicatorIndex)?a.indicatorIndex:[a.sector,a.indicator],a.competency]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(a);}
            const expanded=new Set([...container.querySelectorAll('details[open]')].map(e=>e.dataset.alertDetails));const focused=document.activeElement?.closest('[data-alert-id]')?.dataset.alertId;
            container.replaceChildren();let rendered=0;
            for(const records of [...groups.values()].slice(0,alertLimit)){
                const first=records[0],group=node('section','','ux-alert-group');const heading=node('header','','ux-alert-group-heading');heading.append(node('h3',first.indicator),node('p',first.sector+' · '+first.competency));group.append(heading);
                for(const a of records){const article=node('article','','ux-alert-record');article.dataset.alertId=a.id;article.dataset.severity=a.severity;article.classList.toggle('is-read',a.isRead);
                    const top=node('div','','ux-alert-top');top.append(badge(a),node('span',category[a.category]??a.category,'ux-meta'),node('span',a.isRead?'Lido':'Não lido','ux-read-state'));
                    const read=node('button',a.isRead?'Marcar não lido':'Marcar lido','v3-button');read.type='button';read.setAttribute('aria-label',(a.isRead?'Marcar como não lido: ':'Marcar como lido: ')+a.indicator+' · '+a.competency+' · '+(category[a.category]??a.category));read.onclick=()=>{read.disabled=true;toggleAlertReadState(a.id);refreshOperational();if(getReadAlertIds().has(a.id)===a.isRead)$('alertFilterSummary').textContent='Não foi possível confirmar a leitura neste navegador. Verifique as permissões de armazenamento e tente novamente.';};top.append(read);article.append(top,node('p',statusFor(a)));
                    const details=node('details','','ux-alert-details');details.dataset.alertDetails=a.id;details.open=expanded.has(a.id);details.append(node('summary','Ver registro original, cálculo e recomendação'));
                    for(const [label,value] of [['Mensagem original',a.message],['Resultado observado',a.technicalExplanation],['Cálculo',a.calculation],['Encaminhamento sugerido',a.recommendation],['Identificação',a.id+' · '+a.detectedAt]]){const p=node('p');p.append(node('strong',label+': '),document.createTextNode(String(value??'Não informado')));details.append(p);}
                    if(Number.isInteger(a.indicatorIndex)&&currentData[a.indicatorIndex]){const inspect=node('button','Abrir indicador','v3-button');inspect.type='button';inspect.onclick=()=>openDetailModal(a.indicatorIndex);details.append(inspect);}article.append(details);group.append(article);rendered++;
                }container.append(group);
            }
            if(!container.children.length)container.append(node('p',loaded()?'Nenhuma notificação corresponde aos filtros. Isso não comprova ausência de risco.':'Notificações indisponíveis. É necessário validar a leitura do Supabase.','ux-empty'));
            $('alertFilteredCount').textContent=String(filtered.length);
            $('alertFilterSummary').textContent=`${rendered} de ${filtered.length} notificações exibidas em ${Math.min(alertLimit,groups.size)} grupos. ${alerts.length} no conjunto. Notificações não são sinistros.`;
            $('alertActiveFilters').textContent=Object.entries(filters).filter(([k,v])=>k==='View'?v!=='all':v!=='TODOS').map(([k])=>$('alertFilter'+k).selectedOptions[0].textContent).join(' · ')||'Nenhum filtro ativo';
            $('alertLoadMore').hidden=alertLimit>=groups.size;
            if(focused)queueMicrotask(()=>{const record=[...container.querySelectorAll('[data-alert-id]')].find(e=>e.dataset.alertId===focused);record?.querySelector('button')?.focus();});
        }catch{container.replaceChildren(node('p','Não foi possível apresentar as notificações. Atualize os filtros ou refaça a leitura dos dados.','ux-empty'));$('alertLoadMore').hidden=true;}
    }
    function refreshOperational(){
        if(!initialized)return;
        if(!$('v3Sync'))return;
        const ready=loaded(),failed=$('lastSavedTag')?.textContent==='Falha ao salvar';
        const label=!currentSession?'Sessão encerrada':isSavingState?'Salvando…':!ready?'Leitura indisponível':failed?'Falha ao salvar':hasUnsavedChanges?'Alterações pendentes':'Sincronizado';
        if($('v3Sync').textContent!==label)$('v3Sync').textContent=label;
        $('v3Sync').dataset.state=isSavingState?'loading':!ready||failed?'error':hasUnsavedChanges?'warning':'success';$('v3Sync').title=label+(failed?' — As alterações continuam pendentes. Consulte a prévia de salvamento.':'');
        if($('v3UserEmail'))$('v3UserEmail').textContent=currentSession?.user?.email??'Sessão corporativa';
        const active=['searchInput','setorFilter','statusFilter','unitFilter'].map($).filter(e=>e?.value&&e.value!=='TODOS');$('v3ActiveFilters').textContent=active.map(e=>e.tagName==='SELECT'?e.selectedOptions[0].textContent:e.value).join(' · ')||'Nenhum filtro ativo';
        if($('view-home').classList.contains('hidden'))return;
        const alerts=ready?generateDeterministicAlerts():[],counts=updateAlertCounts(alerts),attention=ready?currentData.filter(i=>calcMetrics(i).status==='ACOMPANHAR'):[],focus=(attention.length?attention:currentData.filter(i=>getIntelligenceDirection(i))).slice(0,3);
        const signature=JSON.stringify([ready,currentSession?.user?.id,lastSupabaseSavedAt,counts,currentData.length,attention.length,currentData.filter(i=>!getIntelligenceDirection(i)).length,focus,alerts.slice(0,4)]);if(homeSignature===signature)return;homeSignature=signature;
        for(const [id,n] of [['v3Count',currentData.length],['v3Attention',attention.length],['v3Alerts',alerts.length],['v3Directions',currentData.filter(i=>!getIntelligenceDirection(i)).length]])$(id).textContent=ready?String(n):'—';
        $('v3OverviewStatus').textContent=ready?`Snapshot carregado · ${lastSupabaseSavedAt?new Date(lastSupabaseSavedAt).toLocaleString('pt-BR'):'Data de sincronização indisponível'} · Competências revisáveis`:'Aguardando leitura autorizada. Nenhum exemplo é apresentado como dado real.';
        $('uxAlertBreakdown').textContent=ready?`${counts.CRITICO} críticos · ${counts.ATENCAO} de atenção · ${counts.INFORMATIVO} informativos · ${counts.unread} não lidos`:'Contagens indisponíveis';
        $('v3Priority').replaceChildren();if(ready)focus.forEach(i=>{const index=currentData.indexOf(i),m=calcMetrics(i),card=node('article','','v3-priority-card'),name=node('h3',i.indicador);name.title=i.indicador;card.append(name,node('strong',m.last===null?'Sem dados':fmtVal(m.last,i.und)),node('p',`${m.lastMonth} · ${i.und??'Unidade não informada'} · Meta ${i.meta===null||i.meta===undefined?'não cadastrada':fmtVal(i.meta,i.und)}`),node('p',m.status==='ACOMPANHAR'?'Fora da meta — avaliar pendências':m.status==='OK'?'Meta atendida':'Sem avaliação pela configuração disponível'),node('p',getMonthlyData(i).values.filter(v=>v!==null&&v!==undefined).length<2?'Histórico insuficiente para comparar a evolução.':`Variação descritiva: ${m.diff>0?'aumento':m.diff<0?'redução':'sem mudança nos extremos'}.`,'ux-meta'));const button=node('button','Ver indicador','v3-button');button.type='button';button.onclick=()=>openDetailModal(index);card.append(button);$('v3Priority').append(card);});
        if(!$('v3Priority').children.length)$('v3Priority').append(node('p','Nenhum indicador disponível para esta leitura.','ux-empty'));
        $('v3RecentAlerts').replaceChildren();alerts.slice(0,4).forEach(a=>{const card=node('article','','ux-recent-alert');card.append(badge(a),node('h3',a.indicator),node('p',category[a.category]+' · '+a.competency,'ux-meta'),node('p',statusFor(a)),node('small',a.isRead?'Lido neste navegador':'Não lido neste navegador'));const b=node('button','Ver detalhes','v3-button');b.type='button';b.onclick=()=>{navigateToAlerts();$('alertFilterView').value='all';$('alertFilterIndicator').value=String(a.indicatorIndex);$('alertFilterCompetency').value=a.competency;renderAlerts();};card.append(b);$('v3RecentAlerts').append(card);});
        if(!alerts.length)$('v3RecentAlerts').append(node('p',ready?'Nenhuma notificação gerada pelos critérios existentes.':'Notificações indisponíveis.','ux-empty'));
    }
    function reportState({consistent}={}){
        if(!initialized)return;
        const selected=$('reportIndicators').selectedOptions.length,stale=managementReport&&(consistent===false||managementSignature!==reportSignature());
        const reason=managementBusy?'Processamento em andamento.':!currentSession?'Sessão encerrada. Entre novamente.':!supabaseStateLoaded||!supabaseReady?'Valide a leitura do Supabase antes de continuar.':hasUnsavedChanges?'Salve as alterações pendentes antes de continuar.':!selected?'Selecione pelo menos um indicador.':stale?(managementSignature!==reportSignature()?'Os filtros foram alterados. Atualize a prévia.':'Os dados foram atualizados. Gere uma nova prévia.'):!managementReport?'Gere a prévia antes de aplicar a análise ou exportar.':'';
        if($('reportActionHint'))$('reportActionHint').textContent=reason||'Prévia atualizada. A análise Groq é opcional; os dois formatos usam a mesma base.';
        for(const id of ['reportAI','reportExport']){$(id).setAttribute('aria-describedby','reportActionHint');$(id).title=$(id).disabled?reason:'';$(id).setAttribute('aria-disabled',String($(id).disabled));}
        if(!selected||!loaded()||hasUnsavedChanges)$('reportGenerate').disabled=true;
        $('reportGenerate').title=$('reportGenerate').disabled?reason:'';$('reportGenerate').setAttribute('aria-describedby','reportActionHint');
    }
    async function requestModalClose(id){const modal=$(id);if(!modal||closing.has(modal))return;const before=formBaselines.get(modal);if(before!==undefined&&formState(modal)!==before){closing.add(modal);try{const result=await fireThemedAlert({title:'Descartar o que foi digitado?',text:'Os campos ainda não foram aplicados. Você pode continuar editando.',icon:'question',showCancelButton:true,confirmButtonText:'Descartar campos',cancelButtonText:'Continuar editando'});if(!result.isConfirmed)return;}finally{closing.delete(modal);}}closeModal(id);}
    function decorateTable(){
        const changes=new Map();for(const c of pendingChanges){const p=c.path.split('.');if(p[0]!=='indicadores')continue;if(!changes.has(p[1]))changes.set(p[1],[]);changes.get(p[1]).push(p);}
        for(const row of $('tableBody')?.rows??[]){const paths=changes.get(row.dataset.indicatorIndex)??[];for(const cell of row.cells){let changed=paths.some(p=>p[2]==='valores'?cell.dataset.competencyIndex===p[3]:cell.dataset.indicatorField===p[2]);cell.classList.toggle('ux-cell-changed',changed);if(changed){cell.dataset.pending='true';cell.setAttribute('aria-label',cell.textContent.trim()+'. Alteração pendente: '+(row.querySelector('[data-indicator-field="indicador"]')?.textContent??'indicador')+'. Confira a prévia de salvamento.');}else{delete cell.dataset.pending;cell.removeAttribute('aria-label');}}}
    }
    window.DGranelUX={renderAlerts,refreshOperational,reportState,requestModalClose,decorateTable,pendingChanged(state){pendingChanges=state.changes;decorateTable();if(initialized)reportUpdateActions();}};
    document.addEventListener('DOMContentLoaded',()=>{
        document.body.classList.add('workspace-v32');
        const alertFilters=$('alertFilterSector').parentElement;alertFilters.classList.add('ux-alert-filters');
        alertFilters.after($('alertFilteredCount').parentElement.parentElement);
        for(const [id,label] of [['Indicator','Indicador'],['Competency','Competência'],['Category','Categoria']]){const wrapper=node('label',label),select=node('select');select.id='alertFilter'+id;select.setAttribute('aria-label','Filtrar por '+label.toLowerCase());select.add(new Option('Todos','TODOS'));if(id==='Category')Object.entries(category).forEach(([v,l])=>select.add(new Option(l,v)));select.onchange=renderAlerts;wrapper.append(select);alertFilters.append(wrapper);}
        for(const id of ['View','Severity','Sector']){const select=$('alertFilter'+id),wrapper=node('label',{View:'Leitura',Severity:'Severidade',Sector:'Setor'}[id]);select.before(wrapper);wrapper.append(select);}
        const summary=node('p','','ux-meta');summary.id='alertFilterSummary';summary.setAttribute('role','status');const active=node('p','','ux-meta');active.id='alertActiveFilters';const clear=node('button','Limpar filtros','v3-button');clear.id='alertClearFilters';clear.type='button';clear.onclick=()=>{['View','Severity','Sector','Indicator','Competency','Category'].forEach(k=>$('alertFilter'+k).value=k==='View'?'all':'TODOS');renderAlerts();};alertFilters.after(active,clear,summary);
        const more=node('button','Carregar mais notificações','v3-button');more.id='alertLoadMore';more.type='button';more.onclick=()=>{alertLimit+=20;renderAlerts();};$('alertsContainer').after(more);
        document.querySelectorAll('[onclick^="filterAlertsBySeverityQuick"]').forEach(e=>{e.setAttribute('role','button');e.tabIndex=0;e.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();e.click();}};});
        const descriptions=['Consulte os registros disponíveis.','Avaliação por meta e direção; não é um ranking de gravidade.','Regras automáticas; não representa quantidade de sinistros.','Configurações que precisam de validação.'];document.querySelectorAll('.v3-metric-grid article').forEach((e,n)=>e.append(node('p',descriptions[n],'ux-meta')));
        const breakdown=node('p','','ux-meta');breakdown.id='uxAlertBreakdown';$('v3QuickActions').before(breakdown);
        const config=$('reportType').closest('section');config.id='reportConfigureStage';config.append($('reportContextPanel'));
        const previousGenerateContainer=$('reportGenerate').parentElement;
        const actions=$('reportActions'),format=$('reportFormat').closest('label'),original=$('reportAI').parentElement,flow=node('div','','ux-report-flow'),prepare=node('section'),exportArea=node('section');
        prepare.append(node('h3','2. Preparar','v3-report-heading'));const row=node('div','','report-actions-buttons');[$('reportGenerate'),$('reportRefresh'),$('reportAI'),$('reportProvider').closest('details')].forEach(e=>row.append(e));prepare.append(row);
        exportArea.append(node('h3','3. Exportar','v3-report-heading'),format,$('reportExport'));flow.append(prepare,exportArea);actions.insertBefore(flow,original);original.remove();if(!previousGenerateContainer.children.length)previousGenerateContainer.remove();$('reportActionsTitle').textContent='Preparar e exportar';
        const hint=node('p','','ux-action-hint');hint.id='reportActionHint';hint.setAttribute('role','status');actions.append(hint);
        const sticky=()=>actions.classList.toggle('ux-sticky',innerWidth>=1280&&innerHeight>=850&&actions.getBoundingClientRect().height<innerHeight*.32);new ResizeObserver(sticky).observe(actions);window.addEventListener('resize',sticky);
        for(const area of document.querySelectorAll('.overflow-x-auto')){area.tabIndex=0;area.setAttribute('role','region');area.setAttribute('aria-label',area.closest('#view-datagrid')?'Tabela de indicadores, com rolagem horizontal':'Tabela com rolagem horizontal');}
        $('jsonEditor').setAttribute('aria-label','Editor JSON dos dados, uso autorizado');$('authMessage').setAttribute('role','status');$('authMessage').setAttribute('aria-live','polite');
        for(const modal of document.querySelectorAll('div.fixed[id^="modal"]')){const heading=modal.querySelector('h2,h3');if(heading){if(!heading.id)heading.id=modal.id+'Title';modal.setAttribute('aria-labelledby',heading.id);}modal.querySelectorAll('[onclick^="closeModal"]').forEach(b=>{b.type='button';b.setAttribute('aria-label','Fechar '+(heading?.textContent??'diálogo'));});let visible=!modal.classList.contains('hidden');new MutationObserver(()=>{const next=!modal.classList.contains('hidden');if(next&&!visible)formBaselines.set(modal,formState(modal));visible=next;}).observe(modal,{attributes:true,attributeFilter:['class']});}
        document.addEventListener('click',e=>{const button=e.target.closest('button[onclick^="closeModal"]'),modal=button?.closest('div.fixed[id^="modal"]');if(modal&&formBaselines.has(modal)&&formState(modal)!==formBaselines.get(modal)){e.preventDefault();e.stopImmediatePropagation();requestModalClose(modal.id);}},true);
        const tooltip=node('div','','ux-tooltip');tooltip.id='uxNavTooltip';tooltip.hidden=true;tooltip.setAttribute('role','tooltip');document.body.append(tooltip);let tooltipOwner;
        const hideTooltip=()=>{tooltip.hidden=true;if(tooltipOwner){const ids=(tooltipOwner.getAttribute('aria-describedby')??'').split(' ').filter(id=>id&&id!==tooltip.id);if(ids.length)tooltipOwner.setAttribute('aria-describedby',ids.join(' '));else tooltipOwner.removeAttribute('aria-describedby');}tooltipOwner=null;};
        const showTooltip=target=>{const owner=target.closest('.v3-nav button,#headerToolsMenu>summary');if(!owner||innerWidth<1024||!document.body.classList.contains('v3-sidebar-collapsed'))return;hideTooltip();tooltipOwner=owner;tooltip.textContent=owner.getAttribute('aria-label')||owner.title;tooltip.hidden=false;const r=owner.getBoundingClientRect();tooltip.style.left=Math.min(innerWidth-250,r.right+12)+'px';tooltip.style.top=Math.min(innerHeight-50,Math.max(8,r.top))+'px';owner.setAttribute('aria-describedby',[owner.getAttribute('aria-describedby'),tooltip.id].filter(Boolean).join(' '));};
        document.addEventListener('focusin',e=>showTooltip(e.target));document.addEventListener('focusout',hideTooltip);document.addEventListener('pointerover',e=>showTooltip(e.target));document.addEventListener('pointerout',e=>{if(tooltipOwner&&!tooltipOwner.contains(e.relatedTarget))hideTooltip();});document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTooltip();});window.addEventListener('resize',hideTooltip);document.addEventListener('click',hideTooltip);
        const gov=$('governanceSearch');if(gov){const clear=node('button','Limpar filtros de governança','v3-button');clear.type='button';clear.onclick=()=>{gov.value='';$('governanceSectorFilter').value='TODOS';$('governanceDirectionFilter').value='TODOS';renderGovernanceDashboard();};gov.closest('section').append(clear);}
        document.addEventListener('focusin',e=>{const bar=$('reportActions'),header=document.querySelector('header.v3-topbar');if(e.target.closest('#reportActions,#v3Sidebar,dialog,[role=dialog]'))return;const top=e.target.getBoundingClientRect().top,bottom=bar.classList.contains('ux-sticky')?bar.getBoundingClientRect().bottom:header.getBoundingClientRect().bottom;if(top>=0&&top<bottom)window.scrollBy({top:top-bottom-12,behavior:'auto'});});
        initialized=true;homeSignature='';refreshOperational();reportUpdateActions();renderAlerts();
    });
})();
