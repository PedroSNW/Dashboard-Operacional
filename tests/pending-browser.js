async function runPendingChecks(){
    const assert=(v,m)=>{if(!v)throw Error(m);},clone=PendingState.clone,wait=ms=>new Promise(r=>setTimeout(r,ms));
    const until=async condition=>{for(let n=0;n<100;n++){if(condition())return;await wait(20);}throw Error('Tempo de espera de teste excedido');};
    const originalFetch=window.fetch,originalLog=registrarLog;
    let calls=0,applied=0,failure=false,invalid=false,release=null,defer=false;
    let server={id:1,updated_at:'2026-11-13T10:00:00.000Z',data:{...projectPersistedState(),indicadores:[{setor:'Teste A',indicador:'Indicador de teste A',und:'Qtd',meta:0,direcaoDesempenho:'menor_melhor',valores:[9,null,0]},{setor:'Teste B',indicador:'Indicador de teste B',und:'%',meta:80,direcaoDesempenho:'maior_melhor',valores:[70,80,90]}],setores:['Teste B','Teste A'],mesesLabels:['Jan','Fev','Mar'],dashboards:[{id:'a',name:'Principal',widgets:[]},{id:'b',name:'Secundário',widgets:[]}],activeDashboardId:'a',graficos:[],kpis:[],graficosPadrao:{},zoomGraficos:{},theme:'dark',logo:null}};
    window.fetch=async(url,options)=>{
        if(String(url).includes('/dashboard_state')){
            if(options?.method==='PATCH'){
                calls++;assert(options.headers.Prefer==='return=representation','Confirmação ausente');const body=JSON.parse(options.body),expected=new URL(url).searchParams.get('updated_at');
                assert(expected==='eq.'+server.updated_at,'Filtro de versão');
                if(failure)return {ok:false,status:500};
                const finish=()=>{server={id:'1',...clone(body)};applied++;return {ok:true,json:async()=>invalid?{}:[clone(server)]};};
                if(defer)return new Promise(resolve=>release=()=>resolve(finish()));return finish();
            }return {ok:true,json:async()=>[clone(server)]};
        }return {ok:true,json:async()=>[]};
    };
    registrarLog=async()=>true;
    try{
        localStorage.removeItem(personalViewKey());await carregarDadosCompartilhados();
        const baseline=clone(server.data);assert(!hasUnsavedChanges&&PendingState.equal(projectPersistedState(),baseline),'Carga/renderização gera pendência');
        for(const tab of ['home','dashboard','datagrid','intelligence','reports','governance'])switchTab(tab);
        toggleTheme();toggleTheme();selectDashboard('b');chartZoomState.chart1=2;savePersonalView();markStateDirty();
        openNewIndicatorModal();closeModal('modalEdit');renderTable();renderKPIs();renderCharts();updateSaveButton();
        assert(!hasUnsavedChanges&&PendingState.equal(projectPersistedState(),baseline),'Interação visual gera pendência');
        assert(sharedViewPreferences.activeDashboardId==='a'&&activeDashboardId==='b','Dashboard local/legado');
        const ai=chamarEdgeFunctionIA;try{chamarEdgeFunctionIA=async()=>({response:'Resultado de teste',meta:{deterministicOnly:true}});await executarTesteIA('groq');assert(!hasUnsavedChanges&&PendingState.equal(projectPersistedState(),baseline),'Consulta IA gera pendências');}finally{chamarEdgeFunctionIA=ai;}
        await saveCurrentState();assert(calls===0&&document.getElementById('pendingChangesDialog').open,'Sem diferenças escreve');document.getElementById('pendingChangesDialog').close();
        currentData[0].valores[0]=10;markStateDirty();assert(hasUnsavedChanges&&inspectPendingState().changes.length===1,'Valor mensal');
        currentData[0].meta=1;currentData[0].direcaoDesempenho='neutro';markStateDirty();assert(inspectPendingState().changes.length===3,'Meta/direção');
        currentData=clone(baseline.indicadores);markStateDirty();assert(!hasUnsavedChanges,'Desfazer alterações');
        customCharts.push({id:'c',title:'Gráfico de teste',type:'line',ind1:0});kpiCards.push({id:'k',title:'KPI de teste',indicator:0});dashboards[0].name='Nome editado';markStateDirty();
        assert(new Set(inspectPendingState().changes.map(c=>c.category)).size===3,'Gráfico/KPI/dashboard');
        customCharts=[];kpiCards=[];dashboards=clone(baseline.dashboards);currentData[0].valores[0]=10;markStateDirty();
        await saveCurrentState();assert(calls===0,'Salvar sem confirmação');
        document.querySelector('#pendingChangesList details').open=true;assert(document.getElementById('pendingChangesList').textContent.includes('Indicador de teste A')&&document.getElementById('pendingChangesList').textContent.includes('Jan'),'Prévia detalhada');
        const reviewed=clone(inspectPendingState().payload);document.getElementById('pendingSaveConfirm').click();await until(()=>!isSavingState);
        assert(calls===1&&applied===1&&!hasUnsavedChanges&&PendingState.equal(server.data,reviewed),'Confirmação/payload/baseline');
        document.getElementById('pendingChangesDialog').close();
        currentData[0].meta=2;markStateDirty();failure=true;await saveReviewedState(inspectPendingState().payload);assert(hasUnsavedChanges&&!isSavingState&&pendingTracker.version===server.updated_at,'Falha perde pendência');failure=false;
        defer=true;const inFlight=clone(inspectPendingState().payload);const saving=saveReviewedState(inFlight);await until(()=>Boolean(release));
        await saveReviewedState(inFlight);const attempts=calls;currentData[0].valores[2]=7;markStateDirty();release();await saving;release=null;defer=false;
        assert(calls===attempts&&hasUnsavedChanges&&inspectPendingState().changes.length===1&&server.data.indicadores[0].valores[2]===0,'Concorrência/edição em voo');
        currentData[0].valores[2]=0;markStateDirty();assert(!hasUnsavedChanges,'Desfazer até payload confirmado');
        currentData[0].meta=3;markStateDirty();const beforeCalls=calls;window.__session=null;await saveReviewedState(inspectPendingState().payload);assert(calls===beforeCalls&&hasUnsavedChanges&&!isSavingState,'Sessão expirada');window.__session=currentSession;
        const mock=window.fetch;window.fetch=async(url,options)=>options?.method==='PATCH'?{ok:true,json:async()=>[]}:mock(url,options);
        await saveReviewedState(inspectPendingState().payload);assert(hasUnsavedChanges&&pendingTracker.version===server.updated_at,'Conflito apagou alterações');window.fetch=mock;
        invalid=true;await saveReviewedState(inspectPendingState().payload);assert(hasUnsavedChanges,'Resposta inválida confirmou');invalid=false;
        // Restaurar fixture remoto após a escrita cuja confirmação foi inválida.
        await carregarDadosCompartilhados();assert(!hasUnsavedChanges,'Releitura confirmada');
        currentData[0].meta=4;markStateDirty();defer=true;const oldSave=saveReviewedState(inspectPendingState().payload);await until(()=>Boolean(release));
        const session=currentSession;await handleAuthSession(null);release();await oldSave;release=null;defer=false;
        assert(!pendingTracker.reference&&!document.getElementById('pendingChangesDialog').open&&!hasUnsavedChanges,'Logout aceitou resposta antiga');
        currentSession=session;window.__session=session;document.body.classList.add('authenticated');await carregarDadosCompartilhados();
        window.fetch=async(url,options)=>String(url).includes('/dashboard_state')&&!options?.method?{ok:false,status:503}:mock(url,options);
        await carregarDadosCompartilhados(true);assert(!supabaseStateLoaded&&!supabaseReady,'Leitura falha validada');const noWrite=calls;await saveReviewedState(projectPersistedState());assert(calls===noWrite,'Salvou sem leitura');
        window.fetch=mock;await carregarDadosCompartilhados();
        currentData[0].valores[0]+=1;markStateDirty();document.getElementById('pendingChangesButton').focus();await saveCurrentState();
        assert(document.activeElement.id==='pendingClose'&&document.documentElement.scrollWidth<=innerWidth+1,'Foco/mobile');
        assert(window.__errors.length===0,window.__errors.join(';'));
        return 'PASS snapshot real, navegação/tema/dashboard/zoom/modal sem pendências, valores/meta/direção/configurações, desfazer, prévia, payload, sucesso/falha/conflito, edição em voo, clique duplicado, sessão/logout, leitura negada e painel responsivo';
    }finally{window.fetch=originalFetch;registrarLog=originalLog;}
}
