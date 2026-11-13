// Camada de experiência: preserva os nós, IDs e comandos existentes.
(() => {
    const $=id=>document.getElementById(id);
    const element=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e;};
    const modules={home:'Visão geral',dashboard:'Dashboards',datagrid:'Indicadores',intelligence:'Central de Inteligência',reports:'Relatórios Gerenciais',governance:'Governança',audit:'Auditoria'};
    const paths={home:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',dashboard:'M3 3h7v7H3zM14 3h7v11h-7zM3 14h7v7H3zM14 18h7v3h-7z',datagrid:'M3 4h18v16H3zM3 10h18M9 4v16',intelligence:'M4 20V10m8 10V4m8 16v-7M2 20h20',reports:'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7',governance:'M4 7h16M4 17h16M9 4v6M15 14v6',audit:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',bell:'M6 9a6 6 0 0 1 12 0v7l2 2H4l2-2zm4 12h4',save:'M4 3h13l4 4v14H3V3zM7 3v6h9V3M7 21v-8h10v8',theme:'M12 3a9 9 0 1 0 0 18z'};
    function icon(node,name){if(!node)return;node.innerHTML=`<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"></path></svg>`;}
    let sidebar,header,main,toggle,lastFocus,drawer=false;
    const mobile=()=>matchMedia('(max-width: 1023px)').matches;
    const resizeCharts=()=>requestAnimationFrame(()=>Object.values(Chart.instances||{}).forEach(chart=>chart.resize()));
    function closeDrawer(){drawer=false;document.body.classList.remove('v3-drawer-open');if(main)main.inert=false;if(header)header.inert=false;sidebar?.removeAttribute('aria-modal');sidebar?.removeAttribute('role');toggle?.setAttribute('aria-expanded','false');if(mobile())sidebar.inert=true;lastFocus?.focus();}
    function menu(){if(mobile()){lastFocus=toggle;drawer=true;sidebar.inert=false;sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');document.body.classList.add('v3-drawer-open');main.inert=true;header.inert=true;toggle.setAttribute('aria-expanded','true');sidebar.querySelector('button').focus();}else{const previousLeft=main.getBoundingClientRect().left;document.body.classList.toggle('v3-sidebar-collapsed');window.DGranelMotion?.shellChanged(previousLeft);toggle.setAttribute('aria-expanded',String(!document.body.classList.contains('v3-sidebar-collapsed')));resizeCharts();}}
    window.onWorkspaceNavigation=tab=>{
        if(!$('v3Title'))return;$('v3Title').textContent=modules[tab]||'Visão geral';$('v3Title').title=modules[tab]||tab;$('v3Breadcrumb').textContent=`Operação / ${modules[tab]||tab}`;
        $('v3ContextActions').hidden=!['dashboard','datagrid'].includes(tab);
        for(const [key] of Object.entries(modules))$( `tab-${key}`)?.setAttribute('aria-current',key===tab?'page':'false');
        if(drawer)closeDrawer();window.refreshOperationalUI();resizeCharts();
    };
    window.refreshOperationalUI=()=>{
        if(!$('v3Sync'))return;
        const loaded=supabaseStateLoaded&&supabaseReady;
        const saveFailed=$('lastSavedTag')?.textContent==='Falha ao salvar';
        $('v3Sync').textContent=isSavingState?'Salvando…':!loaded?'Dados indisponíveis':saveFailed?'Falha ao salvar':hasUnsavedChanges?'Alterações pendentes':'Sincronizado';
        $('v3Sync').dataset.state=isSavingState?'loading':!loaded||saveFailed?'error':hasUnsavedChanges?'warning':'success';
        if($('v3UserEmail'))$('v3UserEmail').textContent=currentSession?.user?.email||'Sessão corporativa';
        if(!$('v3Overview'))return;
        const alerts=loaded?generateDeterministicAlerts():[];
        const attention=loaded?currentData.filter(i=>calcMetrics(i).status==='ACOMPANHAR'):[];
        for(const [id,value] of [['v3Count',currentData.length],['v3Attention',attention.length],['v3Alerts',alerts.length],['v3Directions',currentData.filter(i=>!getIntelligenceDirection(i)).length]])$(id).textContent=loaded?String(value):'—';
        $('v3OverviewStatus').textContent=loaded?`Snapshot carregado • ${lastSupabaseSavedAt?new Date(lastSupabaseSavedAt).toLocaleString('pt-BR'):'Data de sincronização indisponível'} • Competências revisáveis`:'Aguardando leitura autorizada do Supabase. Nenhum exemplo é apresentado como dado real.';
        $('v3RecentAlerts').replaceChildren();
        alerts.slice(0,4).forEach(a=>{const row=element('button',`${a.severity||'Atenção'} • ${a.indicator||a.title||'Alerta'} — ${a.message||''}`,'v3-list-row');row.onclick=()=>navigateToAlerts();$('v3RecentAlerts').append(row);});
        if(!alerts.length)$('v3RecentAlerts').append(element('p',loaded?'Nenhum alerta gerado pelos critérios configurados.':'Alertas indisponíveis.'));
        $('v3Priority').replaceChildren();
        (attention.length?attention:currentData.filter(i=>getIntelligenceDirection(i))).slice(0,3).forEach(i=>{
            if(!loaded)return;const m=getMonthlyData(i),last=getLastValid(m.values,m.labels);const card=element('article','','v3-priority-card');card.append(element('h3',i.indicador),element('strong',last.val===null?'Sem dados':fmtVal(last.val,i.und)),element('p',`Competência ${last.month} • Meta ${i.meta===null||i.meta===undefined?'não cadastrada':fmtVal(i.meta,i.und)}`),element('small',`Direção: ${getIntelligenceDirection(i)||'indefinida'}`));$('v3Priority').append(card);
        });
        if(!$('v3Priority').children.length)$('v3Priority').append(element('p','Nenhum indicador com direção configurada disponível.'));
        const active=['searchInput','setorFilter','statusFilter','unitFilter'].map(id=>$(id)).filter(Boolean).filter(e=>e.value&&e.value!=='TODOS');
        $('v3ActiveFilters').textContent=active.length?active.map(e=>e.tagName==='SELECT'?e.selectedOptions[0].textContent:e.value).join(' • '):'Nenhum filtro ativo';
    };
    function setupReportsSelection(){
        const select=$('reportIndicators');select.hidden=true;select.style.display='none';
        const label=document.querySelector('label[for="reportIndicators"]');if(label)label.textContent='Indicadores • marque as opções desejadas';
        const box=element('div','','v3-indicator-picker');const search=element('input');search.type='search';search.placeholder='Pesquisar indicadores ou setor';search.setAttribute('aria-label','Pesquisar seleção de indicadores');
        const count=element('p','','v3-picker-count');const list=element('div','','v3-picker-list');
        const clear=element('button','Limpar seleção','v3-button');clear.type='button';
        const render=()=>{list.replaceChildren();let group='';for(const option of select.options){if(!option.textContent.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()))continue;const sector=option.textContent.split(' — ')[0];if(sector!==group){list.append(element('h4',sector));group=sector;}const label=element('label','','v3-picker-option'),check=element('input');check.type='checkbox';check.checked=option.selected;check.onchange=()=>{option.selected=check.checked;select.dispatchEvent(new Event('change',{bubbles:true}));};label.append(check,element('span',option.textContent));list.append(label);}count.textContent=`${select.selectedOptions.length} de ${select.options.length} selecionados`;};
        search.oninput=render;clear.onclick=()=>{[...select.options].forEach(o=>o.selected=false);select.dispatchEvent(new Event('change',{bubbles:true}));};
        select.addEventListener('change',render);$('reportAll').addEventListener('click',render);new MutationObserver(render).observe(select,{childList:true});
        box.append(search,count,clear,list);select.after(box);render();
    }
    function setupModalAccessibility(){
        const origins=new WeakMap();
        let outsideFocus=document.activeElement;
        document.addEventListener('focusin',e=>{if(!e.target.closest('[role="dialog"],dialog'))outsideFocus=e.target;});
        for(const modal of document.querySelectorAll('div.fixed[id^="modal"]')){
            modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');const heading=modal.querySelector('h2[id],h3[id]');if(heading)modal.setAttribute('aria-labelledby',heading.id);
            let visible=!modal.classList.contains('hidden');
            new MutationObserver(()=>{const next=!modal.classList.contains('hidden');if(next&&!visible){origins.set(modal,outsideFocus);requestAnimationFrame(()=>{if(!modal.classList.contains('hidden'))modal.querySelector('button,input:not([type=hidden]),select,textarea')?.focus();});}if(!next&&visible)origins.get(modal)?.focus();visible=next;}).observe(modal,{attributes:true,attributeFilter:['class']});
        }
        document.addEventListener('keydown',e=>{
            if(drawer||document.querySelector('dialog[open]'))return;const modal=[...document.querySelectorAll('div.fixed[id^="modal"]')].find(m=>!m.classList.contains('hidden'));if(!modal)return;
            if(e.key==='Escape'){e.preventDefault();closeModal(modal.id);}
            if(e.key==='Tab'){const items=[...modal.querySelectorAll('button:not([disabled]),input:not([type=hidden]),select,textarea,summary,a[href]')].filter(e=>e.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
        });
    }
    document.addEventListener('DOMContentLoaded',()=>{
        document.body.classList.add('workspace-v3');header=document.querySelector('header');main=document.querySelector('main');
        sidebar=element('aside','','v3-sidebar');sidebar.id='v3Sidebar';sidebar.setAttribute('aria-label','Navegação principal');document.body.prepend(sidebar);
        const closer=element('button','Fechar menu','v3-drawer-close');closer.onclick=closeDrawer;sidebar.append(closer);
        const brand=$('developerModeTrigger').parentElement;brand.classList.add('v3-brand');sidebar.append(brand);
        const nav=header.querySelector('nav');nav.className='v3-nav';sidebar.append(nav);
        for(const [key,label] of Object.entries(modules)){const button=$(`tab-${key}`),graphic=button.querySelector('i');button.replaceChildren();if(graphic){icon(graphic,key);button.append(graphic);}button.append(element('span',label));button.title=label;button.setAttribute('aria-label',label);}
        for(const [key,title] of [['home','Operação'],['intelligence','Inteligência'],['governance','Gestão']])$(`tab-${key}`).before(element('p',title,'v3-nav-group'));
        const actions=$('headerAlertsBtn').parentElement;actions.className='v3-top-actions';
        const contextual=element('section','','v3-context-actions');contextual.id='v3ContextActions';
        ['openChartModal()','openNewIndicatorModal()'].forEach(command=>{const button=actions.querySelector(`[onclick="${command}"]`);if(button)contextual.append(button);});main.prepend(contextual);contextual.hidden=true;
        const theme=$('themeToggleBtn');actions.insertBefore(theme,$('headerToolsMenu'));
        const account=element('p','','v3-user-email');account.id='v3UserEmail';$('headerToolsMenu').querySelector('summary').setAttribute('aria-label','Menu da conta e ferramentas');$('headerToolsMenu').querySelector('div').prepend(account);
        toggle=element('button','☰','v3-menu-toggle');toggle.id='v3MenuToggle';toggle.setAttribute('aria-label','Expandir ou recolher navegação');toggle.setAttribute('aria-controls','v3Sidebar');toggle.setAttribute('aria-expanded','true');toggle.onclick=menu;
        const titles=element('div','','v3-page-title');const breadcrumb=element('small','Operação / Visão geral');breadcrumb.id='v3Breadcrumb';const title=element('h1','Visão geral');title.id='v3Title';titles.append(breadcrumb,title);
        const sync=element('span','Aguardando dados','v3-sync');sync.id='v3Sync';sync.setAttribute('role','status');
        header.className='v3-topbar';header.replaceChildren(toggle,titles,sync,actions);document.body.prepend(sidebar);
        icon($('headerAlertsBtn').querySelector('i'),'bell');icon($('saveStateButtonIcon'),'save');applyTheme(currentTheme);
        const backdrop=element('button','','v3-drawer-backdrop');backdrop.tabIndex=-1;backdrop.setAttribute('aria-hidden','true');backdrop.setAttribute('aria-label','Fechar navegação');backdrop.onclick=closeDrawer;sidebar.after(backdrop);
        if(mobile()){sidebar.inert=true;toggle.setAttribute('aria-expanded','false');}
        document.addEventListener('keydown',e=>{if(!drawer)return;if(e.key==='Escape'){e.preventDefault();closeDrawer();}if(e.key==='Tab'){const focus=[...sidebar.querySelectorAll('button:not([disabled]),summary,a,input')].filter(e=>e.getClientRects().length);const a=focus[0],b=focus.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}}});
        matchMedia('(max-width: 1023px)').addEventListener('change',()=>{closeDrawer();sidebar.inert=mobile();resizeCharts();});
        const home=$('view-home');const institutional=element('details','','v3-institutional');institutional.append(element('summary',"Sobre a operação D'Granel e setores monitorados"));while(home.firstChild)institutional.append(home.firstChild);home.append(institutional);
        const overview=element('section','','v3-overview');overview.id='v3Overview';overview.innerHTML='<div class="v3-section-heading"><div><p class="v3-eyebrow">SEGURANÇA VIÁRIA</p><h2>Operação em perspectiva</h2><p id="v3OverviewStatus"></p></div></div><div class="v3-metric-grid"><article><span>Indicadores disponíveis</span><strong id="v3Count">—</strong></article><article><span>Fora da meta</span><strong id="v3Attention">—</strong></article><article><span>Alertas gerados · não ocorrências</span><strong id="v3Alerts">—</strong></article><article><span>Direção não configurada</span><strong id="v3Directions">—</strong></article></div><div id="v3QuickActions" class="v3-quick-actions"></div><div class="v3-home-columns"><section><h2>Indicadores em foco</h2><div id="v3Priority"></div></section><section><h2>Alertas recentes</h2><div id="v3RecentAlerts"></div></section></div>';
        home.prepend(overview);
        for(const [title,action] of [['Abrir dashboards',()=>switchTab('dashboard')],['Consultar indicadores',()=>switchTab('datagrid')],['Gerar relatório',()=>switchTab('reports')],['Ver alertas',()=>navigateToAlerts()],['Acessar Groq',()=>{switchTab('intelligence');switchIntelligenceSubtab('pilot');setAiProvider('groq');}]]){const b=element('button',title,'v3-button');b.onclick=action;$('v3QuickActions').append(b);}
        const filters=element('div','','v3-filter-status');const active=element('span');active.id='v3ActiveFilters';const clear=element('button','Limpar filtros','v3-button');clear.onclick=()=>{$('searchInput').value='';for(const id of ['setorFilter','statusFilter','unitFilter'])$(id).value='TODOS';renderTable();window.refreshOperationalUI();};filters.append(active,clear);$('searchInput').closest('section').append(filters);
        ['searchInput','setorFilter','statusFilter','unitFilter'].forEach(id=>$(id).addEventListener('input',()=>window.refreshOperationalUI()));
        const suggestions=element('div','','v3-query-suggestions');['Qual foi a média de acidentes com culpa?','Analise acidentes e acidentes com culpa','Analise todos os indicadores'].forEach(q=>{const b=element('button',q,'v3-button');b.onclick=()=>{$('aiPromptInput').value=q;$('aiPromptInput').focus();};suggestions.append(b);});$('aiPromptInput').parentElement.before(suggestions);
        $('aiPromptInput').setAttribute('aria-describedby','v3AIDisclaimer');const disclaimer=element('p','A interpretação usa indicadores agregados autorizados; não consulta registros individuais.','v3-help');disclaimer.id='v3AIDisclaimer';$('aiPromptInput').parentElement.after(disclaimer);
        setupReportsSelection();window.onWorkspaceNavigation('home');
        setupModalAccessibility();
        $('reportType').closest('.report-filters').before(element('h3','1. Configuração','v3-report-heading'));
        $('reportIndicators').parentElement.before(element('h3','2. Seleção de indicadores','v3-report-heading'));
        const preview=$('reportPreview'),step=element('section','','v3-report-step');preview.before(step);step.append(element('h2','3. Prévia para revisão'),preview);
        const finalStep=element('section','','v3-report-step v3-export-actions');step.after(finalStep);finalStep.append(element('h2','4. Interpretação opcional'),$('reportAI').parentElement,element('h2','5. Exportação'),$('reportExport'));
        new MutationObserver(()=>window.refreshOperationalUI()).observe($('lastSavedTag'),{childList:true,characterData:true,subtree:true});
    });
})();
