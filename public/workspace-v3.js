// Camada de experiência: preserva os nós, IDs e comandos existentes.
(() => {
    const $=id=>document.getElementById(id);
    const element=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e;};
    const modules={home:'Visão geral',dashboard:'Painéis',datagrid:'Indicadores',intelligence:'Inteligência',reports:'Relatórios',governance:'Governança',audit:'Auditoria'};
    const paths={home:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',dashboard:'M3 3h7v7H3zM14 3h7v11h-7zM3 14h7v7H3zM14 18h7v3h-7z',datagrid:'M3 4h18v16H3zM3 10h18M9 4v16',intelligence:'M4 20V10m8 10V4m8 16v-7M2 20h20',reports:'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7',governance:'M4 7h16M4 17h16M9 4v6M15 14v6',audit:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',bell:'M6 9a6 6 0 0 1 12 0v7l2 2H4l2-2zm4 12h4',save:'M4 3h13l4 4v14H3V3zM7 3v6h9V3M7 21v-8h10v8',theme:'M12 3a9 9 0 1 0 0 18z'};
    paths.search='M15.5 15.5 21 21M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0';
    paths.attention='M3 6l6 6 4-4 7 8m-6 0h6v-6';
    paths.menu='M3 5h18v14H3zM9 5v14';
    function icon(node,name){if(!node)return;node.innerHTML=`<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"></path></svg>`;}
    let sidebar,header,main,toggle,lastFocus,drawer=false;
    const mobile=()=>matchMedia('(max-width: 1023px)').matches;
    const resizeCharts=()=>requestAnimationFrame(()=>{
        for(const chart of Object.values(Chart.instances||{})){
            if(!chart.canvas?.getClientRects().length)continue;
            applyChartScrollWidth(chart,false);
            chart.resize();
        }
    });
    window.DGranelPresentation = {
        setReading(reading) {
            const loading = $('workspaceLoading');
            if (!loading) return;
            document.body.toggleAttribute('data-reading', reading);
            for (const view of loading.parentElement.querySelectorAll('.page-view')) {
                view.inert = reading;
                view.setAttribute('aria-busy', String(reading));
            }
            loading.hidden = !reading;
        },
        toast(title, detail, state = 'success', host = document.body) {
            let stack = host.querySelector(':scope > .workspace-toasts');
            if (!stack) {
                stack = element('div', '', 'workspace-toasts');
                host.append(stack);
            }
            const notice = element('div', '', 'workspace-toast');
            notice.dataset.state = state;
            notice.setAttribute('role', state === 'error' ? 'alert' : 'status');
            const copy = element('div');
            copy.append(element('strong', title));
            if (detail) copy.append(element('p', detail));
            const close = element('button', '×', 'visual-button-ghost');
            close.type = 'button';
            close.setAttribute('aria-label', 'Fechar notificação');
            notice.append(copy, close);
            stack.append(notice);
            const dismiss = () => notice.remove();
            let timer = setTimeout(dismiss, state === 'success' ? 6500 : 12000);
            const pause = () => clearTimeout(timer);
            const resume = () => {
                if (notice.matches(':hover, :focus-within')) return;
                pause();
                timer = setTimeout(dismiss, 5000);
            };
            close.onclick = () => { pause(); dismiss(); };
            notice.addEventListener('pointerenter', pause);
            notice.addEventListener('pointerleave', resume);
            notice.addEventListener('focusin', pause);
            notice.addEventListener('focusout', () => requestAnimationFrame(resume));
        }
    };
    window.DGranelTheme?.scheme?.addEventListener('change', () => {
        if (window.DGranelTheme.stored()) return;
        applyTheme(window.DGranelTheme.preferred());
        Object.values(Chart.instances || {}).forEach(chart => chart.update('none'));
    });
    function closeDrawer(){drawer=false;document.body.classList.remove('v3-drawer-open');if(main)main.inert=false;if(header)header.inert=false;sidebar?.removeAttribute('aria-modal');sidebar?.removeAttribute('role');toggle?.setAttribute('aria-expanded',String(!mobile()&&!document.body.classList.contains('v3-sidebar-collapsed')));if(mobile())sidebar.inert=true;lastFocus?.focus();}
    function menu(){
        if(mobile()){
            lastFocus=toggle;drawer=true;sidebar.inert=false;
            sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');
            document.body.classList.add('v3-drawer-open');main.inert=true;header.inert=true;
            toggle.setAttribute('aria-expanded','true');sidebar.querySelector('button').focus();
            return;
        }
        const collapsed=document.body.classList.toggle('v3-sidebar-collapsed');
        toggle.setAttribute('aria-expanded',String(!collapsed));
        const transition=document.body.getAnimations().find(animation=>animation.transitionProperty==='--workspace-sidebar-width');
        if(transition)transition.finished.then(resizeCharts,()=>{});
        else resizeCharts();
    }
    window.onWorkspaceNavigation=tab=>{
        if(!$('v3Title'))return;$('v3Title').textContent=modules[tab]||'Visão geral';$('v3Title').title=modules[tab]||tab;
        $('v3ContextActions').hidden=tab!=='datagrid';
        for(const [key] of Object.entries(modules))$( `tab-${key}`)?.setAttribute('aria-current',key===tab?'page':'false');
        if(drawer)closeDrawer();window.refreshOperationalUI();resizeCharts();
    };
    function setupSearch(actions){
        const trigger=element('button','','workspace-search-trigger');
        trigger.id='workspaceSearchTrigger';
        trigger.type='button';
        trigger.setAttribute('aria-label','Buscar módulos e indicadores');
        trigger.setAttribute('aria-haspopup','dialog');
        trigger.setAttribute('aria-keyshortcuts','Control+k Meta+k');
        const magnifier=element('i');
        icon(magnifier,'search');
        magnifier.setAttribute('aria-hidden','true');
        trigger.append(magnifier,element('span','Buscar'),element('kbd',/Mac/.test(navigator.platform)?'⌘ K':'Ctrl K'));
        actions.prepend(trigger);

        const dialog=element('dialog','','workspace-search');
        dialog.id='workspaceSearch';
        dialog.setAttribute('aria-labelledby','workspaceSearchTitle');
        dialog.innerHTML='<header><h2 id="workspaceSearchTitle">Buscar</h2><button type="button" aria-label="Fechar busca">Esc</button></header><input type="search" aria-label="Buscar módulos e indicadores" placeholder="Nome do módulo, indicador ou setor"><div class="workspace-search-results"></div><p class="workspace-search-tip">Use as setas para navegar e Enter para abrir.</p>';
        document.body.append(dialog);
        const input=dialog.querySelector('input'),results=dialog.querySelector('.workspace-search-results');
        window.closeWorkspaceSearch=()=>{if(dialog.open)dialog.close();input.value='';results.replaceChildren();};
        const normalize=value=>String(value??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
        function result(label,detail,open){
            const row=element('button','','workspace-search-result');
            row.type='button';row.append(element('strong',label),element('span',detail));
            row.onclick=()=>{dialog.close();open();};
            results.append(row);
        }
        function render(){
            const terms=normalize(input.value).trim().split(/\s+/).filter(Boolean);
            const matches=value=>terms.every(term=>normalize(value).includes(term));
            results.replaceChildren();
            for(const [key,label] of Object.entries(modules)){
                if(key==='audit'&&!document.body.classList.contains('developer-mode'))continue;
                if(matches(label))result(label,'Módulo',()=>{switchTab(key);$('v3Title').focus();});
            }
            if(terms.length&&supabaseStateLoaded&&supabaseReady){
                currentData.map((item,index)=>({item,index}))
                    .filter(({item})=>matches(`${item.indicador} ${item.setor??''}`)).slice(0,10)
                    .forEach(({item,index})=>result(item.indicador,item.setor||'Indicador',()=>openDetailModal(index)));
            }
            if(!results.children.length)results.append(element('p','Nenhum resultado para esta busca.','workspace-search-empty'));
        }
        function open(){
            if(!document.body.classList.contains('authenticated')||drawer||document.querySelector('dialog[open],div.fixed[id^="modal"]:not(.hidden)'))return false;
            input.value='';render();dialog.showModal();input.focus();return true;
        }
        trigger.onclick=open;
        dialog.querySelector('header button').onclick=()=>dialog.close();
        input.oninput=render;
        dialog.addEventListener('keydown',event=>{
            const buttons=[...results.querySelectorAll('button')];
            const index=buttons.indexOf(document.activeElement);
            if(event.key==='Enter'&&document.activeElement===input&&buttons.length){event.preventDefault();buttons[0].click();}
            if(!buttons.length||!['ArrowDown','ArrowUp'].includes(event.key))return;
            event.preventDefault();
            if(event.key==='ArrowUp'&&index===0){input.focus();return;}
            const next=event.key==='ArrowDown'?(index+1)%buttons.length:index<0?buttons.length-1:index-1;
            buttons[next].focus();
        });
        document.addEventListener('keydown',event=>{
            if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'&&open())event.preventDefault();
        });
    }
    window.refreshOperationalUI=()=>{
        if(window.DGranelUX?.refreshOperational){window.DGranelUX.refreshOperational();return;}
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
        const label=document.querySelector('label[for="reportIndicators"]');if(label){label.textContent='Indicadores';label.id='reportIndicatorsLabel';}
        const box=element('div','','v3-indicator-picker');box.id='reportIndicatorPicker';box.setAttribute('role','group');box.setAttribute('aria-labelledby','reportIndicatorsLabel');
        const search=element('input');search.id='reportIndicatorSearch';search.type='search';search.placeholder='Pesquisar por indicador ou setor';search.setAttribute('aria-label','Pesquisar seleção de indicadores');
        const count=element('p','','v3-picker-count');count.id='reportIndicatorCount';count.setAttribute('role','status');
        const list=element('div','','v3-picker-list');list.id='reportIndicatorOptions';list.setAttribute('role','group');list.setAttribute('aria-label','Opções de indicadores');
        const clear=element('button','Limpar seleção','v3-button');clear.id='reportIndicatorClear';clear.type='button';
        const checks=new Map(),normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
        const sync=()=>{for(const option of select.options){const input=checks.get(option.value);if(input)input.checked=option.selected;}count.textContent=select.selectedOptions.length+' de '+select.options.length+' selecionados no setor atual';};
        const render=()=>{list.replaceChildren();checks.clear();let group='',visible=0;for(const option of [...select.options].sort((a,b)=>a.textContent.localeCompare(b.textContent,'pt-BR'))){if(!normalize(option.textContent).includes(normalize(search.value)))continue;const sector=option.textContent.split(' — ')[0];if(sector!==group){list.append(element('h4',sector));group=sector;}const row=element('label','','v3-picker-option'),check=element('input');check.type='checkbox';check.checked=option.selected;check.dataset.indicatorValue=option.value;check.setAttribute('aria-label',option.textContent);check.onchange=()=>{option.selected=check.checked;select.dispatchEvent(new Event('change',{bubbles:true}));};row.append(check,element('span',option.textContent.slice(option.textContent.indexOf(' — ')+3)));list.append(row);checks.set(option.value,check);visible++;}if(!visible)list.append(element('p',select.options.length?'Nenhum indicador corresponde à pesquisa.':'Nenhum indicador disponível neste setor.','ux-empty'));sync();};
        search.oninput=render;clear.onclick=()=>window.clearReportIndicatorSelection();select.addEventListener('change',sync);$('reportAll').addEventListener('click',sync);new MutationObserver(render).observe(select,{childList:true});
        box.append(search,count,clear,list);select.after(box);render();
    }
    function setupModalAccessibility(){
        const origins=new WeakMap();
        let outsideFocus=document.activeElement;
        document.addEventListener('focusin',e=>{if(!e.target.closest('[role="dialog"],dialog'))outsideFocus=e.target;});
        for(const modal of document.querySelectorAll('div.fixed[id^="modal"]')){
            modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');const heading=modal.querySelector('h2[id],h3[id]');if(heading)modal.setAttribute('aria-labelledby',heading.id);
            for (const close of modal.querySelectorAll('button:not([aria-label]):has(.fa-xmark)')) close.setAttribute('aria-label', 'Fechar janela');
            let visible=!modal.classList.contains('hidden');
            new MutationObserver(()=>{const next=!modal.classList.contains('hidden');if(next&&!visible){origins.set(modal,outsideFocus);requestAnimationFrame(()=>{if(modal.classList.contains('hidden'))return;const target=modal.querySelector('input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled])')||modal.querySelector('button');target?.focus();});}if(!next&&visible)origins.get(modal)?.focus();visible=next;}).observe(modal,{attributes:true,attributeFilter:['class']});
        }
        document.addEventListener('keydown',e=>{
            if(drawer||document.querySelector('dialog[open]'))return;const modal=[...document.querySelectorAll('div.fixed[id^="modal"]')].find(m=>!m.classList.contains('hidden'));if(!modal)return;
            if(e.key==='Escape'){e.preventDefault();if(window.DGranelUX?.requestModalClose)window.DGranelUX.requestModalClose(modal.id);else closeModal(modal.id);}
            if(e.key==='Tab'){const items=[...modal.querySelectorAll('button:not([disabled]),input:not([type=hidden]),select,textarea,summary,a[href]')].filter(e=>e.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
        });
    }
    document.addEventListener('DOMContentLoaded',()=>{
        document.body.classList.add('workspace-v3');header=document.querySelector('header');main=document.querySelector('main');
        sidebar=element('aside','','v3-sidebar');sidebar.id='v3Sidebar';sidebar.setAttribute('aria-label','Navegação principal');document.body.prepend(sidebar);
        const closer=element('button','Fechar menu','v3-drawer-close');closer.onclick=closeDrawer;sidebar.append(closer);
        const brand=$('developerModeTrigger').parentElement;brand.classList.add('v3-brand');sidebar.append(brand);
        const brandDescription=brand.querySelector('p');
        brandDescription.className='';brandDescription.textContent='Operação e segurança viária';
        const nav=header.querySelector('nav');nav.className='v3-nav';sidebar.append(nav);
        for(const [key,label] of Object.entries(modules)){
            const button=$(`tab-${key}`),graphic=button.querySelector('i');
            button.className=button.classList.contains('active')?'tab-btn active':'tab-btn';
            button.replaceChildren();
            if(graphic){graphic.className='';icon(graphic,key);button.append(graphic);}
            button.append(element('span',label));button.title=label;button.setAttribute('aria-label',label);
        }
        for(const [key,title] of [['home','Operação'],['intelligence','Inteligência'],['governance','Gestão']])$(`tab-${key}`).before(element('p',title,'v3-nav-group'));
        const actions=$('headerAlertsBtn').parentElement;actions.className='v3-top-actions';
        const contextual=element('section','','v3-context-actions');contextual.id='v3ContextActions';
        ['openChartModal()','openNewIndicatorModal()'].forEach(command=>{const button=actions.querySelector(`[onclick="${command}"]`);if(button)contextual.append(button);});main.prepend(contextual);contextual.hidden=true;
        const chartAction=contextual.querySelector('[onclick="openChartModal()"]');
        if(chartAction)$('view-dashboard').querySelector('[onclick="openChartModal()"]')?.replaceWith(chartAction);
        const theme=$('themeToggleBtn');actions.insertBefore(theme,$('headerToolsMenu'));
        const account=element('p','','v3-user-email');account.id='v3UserEmail';$('headerToolsMenu').querySelector('summary').setAttribute('aria-label','Menu da conta e ferramentas');$('headerToolsMenu').querySelector('div').prepend(account);
        // Move o mesmo details e seus controles; preserva IDs, listeners e onclicks.
        const settings=$('headerToolsMenu'),settingsSummary=settings.querySelector('summary'),settingsPanel=settings.querySelector('div');
        settingsSummary.className='v3-settings-toggle';
        settingsSummary.title='Configurações';settingsSummary.setAttribute('aria-label','Configurações');
        settingsSummary.querySelector('span').textContent='Configurações';
        const gear=settingsSummary.querySelector('i');gear.className='fa-solid fa-gear';
        gear.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m9 3-.5 2-2 1.2-2-.5-2 3.5L4 10.7v2.6l-1.5 1.5 2 3.5 2-.5 2 1.2.5 2h4l.5-2 2-1.2 2 .5 2-3.5-1.5-1.5v-2.6L20 9.2l-2-3.5-2 .5L14 5l-.5-2Z"/><circle cx="11.5" cy="12" r="3"/></svg>';
        settingsPanel.classList.add('v3-settings-panel');settingsPanel.id='v3SettingsPanel';settingsSummary.setAttribute('aria-controls',settingsPanel.id);
        const footer=element('footer','','v3-sidebar-footer');footer.append(settings);sidebar.append(footer);
        // O recorte da sidebar recolhida cortaria o submenu. Move só o painel
        // aberto para fora do recorte e o devolve ao mesmo details ao fechar.
        const restoreSettingsPanel=()=>{settings.append(settingsPanel);settingsPanel.classList.remove('v3-settings-floating');settingsPanel.style.removeProperty('left');settingsPanel.style.removeProperty('bottom');settingsPanel.style.removeProperty('max-height');};
        settings.addEventListener('toggle',()=>{
            settingsSummary.setAttribute('aria-expanded',String(settings.open));
            if(settings.open&&!mobile()&&document.body.classList.contains('v3-sidebar-collapsed')){
                const rect=settingsSummary.getBoundingClientRect();document.body.append(settingsPanel);settingsPanel.classList.add('v3-settings-floating');
                settingsPanel.style.left='calc(var(--workspace-sidebar-width) + 12px)';settingsPanel.style.bottom=`${Math.max(12,innerHeight-rect.bottom)}px`;settingsPanel.style.maxHeight=`${Math.max(120,innerHeight-32)}px`;
                settingsPanel.querySelector('button')?.focus();
            }else restoreSettingsPanel();
        });
        const settingsEscape=e=>{if(e.key==='Escape'&&settings.open){e.preventDefault();e.stopPropagation();settings.open=false;settingsSummary.focus();}};
        settings.addEventListener('keydown',settingsEscape);settingsPanel.addEventListener('keydown',settingsEscape);
        const closeSettings=()=>{if(settings.open){settings.open=false;restoreSettingsPanel();}};
        window.addEventListener('resize',closeSettings);
        new MutationObserver(()=>{if(!document.body.classList.contains('authenticated')||(mobile()&&!drawer)||settingsPanel.classList.contains('v3-settings-floating')&&!document.body.classList.contains('v3-sidebar-collapsed'))closeSettings();}).observe(document.body,{attributes:true,attributeFilter:['class']});
        toggle=element('button','','v3-menu-toggle');icon(toggle,'menu');toggle.id='v3MenuToggle';toggle.setAttribute('aria-label','Expandir ou recolher navegação');toggle.setAttribute('aria-controls','v3Sidebar');toggle.setAttribute('aria-expanded','true');toggle.onclick=menu;
        const titles=element('div','','v3-page-title');const breadcrumb=element('small','Segurança viária');breadcrumb.id='v3Breadcrumb';const title=element('h1','Visão geral');title.id='v3Title';title.tabIndex=-1;titles.append(breadcrumb,title);
        const sync=element('span','Aguardando dados','v3-sync');sync.id='v3Sync';sync.setAttribute('role','status');
        header.className='v3-topbar';header.replaceChildren(toggle,titles,sync,actions);document.body.prepend(sidebar);
        setupSearch(actions);
        icon($('headerAlertsBtn').querySelector('i'),'bell');icon($('saveStateButtonIcon'),'save');applyTheme(currentTheme);
        const backdrop=element('button','','v3-drawer-backdrop');backdrop.tabIndex=-1;backdrop.setAttribute('aria-hidden','true');backdrop.setAttribute('aria-label','Fechar navegação');backdrop.onclick=closeDrawer;sidebar.after(backdrop);
        if(mobile()){sidebar.inert=true;toggle.setAttribute('aria-expanded','false');}
        document.addEventListener('keydown',e=>{if(!drawer)return;if(e.key==='Escape'){e.preventDefault();closeDrawer();}if(e.key==='Tab'){const focus=[...sidebar.querySelectorAll('button:not([disabled]),summary,a,input')].filter(e=>e.getClientRects().length);const a=focus[0],b=focus.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}}});
        matchMedia('(max-width: 1023px)').addEventListener('change',()=>{closeDrawer();sidebar.inert=mobile();resizeCharts();});
        const home=$('view-home');const institutional=element('details','','v3-institutional');institutional.append(element('summary',"Sobre a operação D'Granel e setores monitorados"));while(home.firstChild)institutional.append(home.firstChild);home.append(institutional);
        const overview=element('section','','v3-overview');overview.id='v3Overview';
        overview.innerHTML=`
            <div class="workspace-intro">
                <div class="workspace-intro-copy">
                    <h2>Visão geral da operação</h2>
                    <p id="v3OverviewStatus"></p>
                    <div id="v3QuickActions" class="v3-quick-actions"></div>
                </div>
                <div class="fleet-scene" role="img" aria-label="Comboio de carretas D’Granel sobre uma ponte">
                    <img src="maxresdefault.jpg" alt="" width="1024" height="576" loading="lazy" decoding="async">
                    <img class="fleet-scene-day" src="comboio-dia.webp" alt="" width="1280" height="720" loading="lazy" decoding="async">
                </div>
            </div>
            <div class="v3-metric-grid" aria-label="Resumo operacional">
                <article data-metric="total"><i aria-hidden="true"></i><span>Indicadores disponíveis</span><strong id="v3Count">—</strong></article>
                <article data-metric="attention"><i aria-hidden="true"></i><span>Fora da meta</span><strong id="v3Attention">—</strong></article>
                <article data-metric="alerts"><i aria-hidden="true"></i><span>Alertas gerados</span><strong id="v3Alerts">—</strong></article>
                <article data-metric="direction"><i aria-hidden="true"></i><span>Direção não configurada</span><strong id="v3Directions">—</strong></article>
            </div>
            <div class="v3-home-columns">
                <div class="workspace-home-main">
                    <section class="workspace-panel workspace-performance">
                        <h2>Desempenho dos indicadores</h2>
                        <div id="workspacePerformanceBar" class="workspace-performance-bar" aria-hidden="true"></div>
                        <div id="workspacePerformanceLegend" class="workspace-performance-legend"></div>
                    </section>
                    <section class="workspace-panel"><h2>Indicadores em foco</h2><div id="v3Priority"></div></section>
                </div>
                <section class="workspace-panel workspace-home-alerts"><h2>Alertas recentes</h2><p id="uxAlertBreakdown"></p><div id="v3RecentAlerts"></div></section>
            </div>`;
        home.prepend(overview);
        ['intelligence','attention','bell','governance'].forEach((name,index)=>icon(overview.querySelectorAll('[data-metric] i')[index],name));
        for(const [label,action,className] of [['Abrir painéis',()=>switchTab('dashboard'),'v3-button workspace-primary'],['Abrir relatórios',()=>switchTab('reports'),'v3-button']]){
            const button=element('button',label,className);button.type='button';button.onclick=action;$('v3QuickActions').append(button);
        }
        const filters=element('div','','v3-filter-status');
        const results=element('div','','indicator-filter-summary');
        const active=element('p');active.id='v3ActiveFilters';
        const clear=element('button','Limpar filtros','v3-button');clear.type='button';
        clear.onclick=()=>{
            $('searchInput').value='';
            for(const id of ['setorFilter','statusFilter','unitFilter'])$(id).value='TODOS';
            renderTable();window.refreshOperationalUI();$('searchInput').focus();
        };
        const count=$('filteredCount').parentElement;
        count.before(filters);results.append(count,active);filters.append(results,clear);
        ['searchInput','setorFilter','statusFilter','unitFilter'].forEach(id=>$(id).addEventListener('input',()=>window.refreshOperationalUI()));
        const suggestions=element('div','','v3-query-suggestions');['Qual foi a média de acidentes com culpa?','Analise acidentes e acidentes com culpa','Analise todos os indicadores'].forEach(q=>{const b=element('button',q,'v3-button');b.onclick=()=>{$('aiPromptInput').value=q;$('aiPromptInput').focus();};suggestions.append(b);});$('aiPromptInput').parentElement.before(suggestions);
        $('aiPromptInput').setAttribute('aria-describedby','v3AIDisclaimer');const disclaimer=element('p','A interpretação usa indicadores agregados autorizados; não consulta registros individuais.','v3-help');disclaimer.id='v3AIDisclaimer';$('aiPromptInput').parentElement.after(disclaimer);
        setupReportsSelection();window.onWorkspaceNavigation('home');
        setupModalAccessibility();
        new MutationObserver(()=>window.refreshOperationalUI()).observe($('lastSavedTag'),{childList:true,characterData:true,subtree:true});
    });
})();
