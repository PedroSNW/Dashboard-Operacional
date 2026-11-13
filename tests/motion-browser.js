async function runMotionChecks(){
    const assert=(v,m)=>{if(!v)throw Error(m);},wait=ms=>new Promise(r=>setTimeout(r,ms));
    const data=JSON.stringify(currentData),revision=stateRevision,dirty=hasUnsavedChanges,shared=sharedTheme;
    const ids=Object.keys(Chart.instances).join(',');
    for(let n=0;n<8;n++){
        toggleTheme();const light=document.body.classList.contains('light-theme'),button=document.getElementById('themeToggleBtn');
        assert(currentTheme===(light?'light':'dark'),'Tema lógico');
        assert(button.title===(light?'Tema claro — ativar escuro':'Tema escuro — ativar claro'),'Tooltip');
        assert(button.getAttribute('aria-label')===button.title&&button.dataset.theme===currentTheme,'Nome acessível');
        const path=button.querySelector('svg path').getAttribute('d');assert(light?path.includes('M12 3V1'):path.includes('20.5'),'Sol/lua');
        assert(localStorage.getItem('dgranel.theme')===currentTheme&&preferredTheme()===currentTheme,'Persistência local');
    }
    assert(revision===stateRevision&&dirty===hasUnsavedChanges&&shared===sharedTheme&&data===JSON.stringify(currentData),'Tema alterou dados corporativos');
    assert(Object.keys(Chart.instances).join(',')===ids,'Tema recriou gráficos');
    const current=currentTheme;localStorage.setItem('dgranel.theme','inválido');assert(preferredTheme('light')==='light','Preferência inválida');localStorage.setItem('dgranel.theme',current);
    for(let n=0;n<3;n++)for(const page of ['home','dashboard','datagrid','intelligence','reports','governance']){switchTab(page);assert(!document.getElementById('view-'+page).classList.contains('hidden'),'Página oculta');}
    await wait(340);assert(DGranelMotion.activeCount===0,'Animações sem limpeza');
    switchTab('intelligence');switchIntelligenceSubtab('pilot');
    const request=chamarEdgeFunctionIA;
    try{
        let release;chamarEdgeFunctionIA=()=>new Promise(resolve=>release=resolve);
        const pending=executarTesteIA('groq');await wait(0);
        assert(document.querySelector('#aiResponseContainer[aria-busy=true] .motion-ai-skeleton'),'Skeleton sem solicitação');
        release({response:'Síntese de teste',meta:{deterministicOnly:true}});await pending;
        assert(!document.querySelector('.motion-ai-skeleton')&&document.getElementById('aiResponseContainer').getAttribute('aria-busy')==='false','Loading preso');
        chamarEdgeFunctionIA=async()=>{throw Error('Falha simulada de conexão');};await executarTesteIA('groq');
        assert(!document.getElementById('aiTestButton').disabled&&!document.querySelector('.motion-ai-skeleton'),'Falha IA');
    }finally{chamarEdgeFunctionIA=request;}
    switchIntelligenceSubtab('alerts');document.getElementById('alertFilterView').value='unread';
    const read=localStorage.getItem(ALERT_READ_STORAGE_KEY);localStorage.removeItem(ALERT_READ_STORAGE_KEY);renderAlertsList();
    try{const card=document.querySelector('[data-alert-id]');if(card){const id=card.dataset.alertId;toggleAlertReadState(id);assert(getReadAlertIds().has(id),'Leitura não atualizada');assert(![...document.querySelectorAll('#alertsContainer [data-alert-id]')].some(e=>e.dataset.alertId===id),'Alerta lido ainda listado');await wait(200);assert(!document.querySelector('article[inert]'),'Resíduo visual de alerta');}}
    finally{if(read===null)localStorage.removeItem(ALERT_READ_STORAGE_KEY);else localStorage.setItem(ALERT_READ_STORAGE_KEY,read);renderAlertsList();}
    const tag=document.getElementById('lastSavedTag'),old=tag.textContent;tag.textContent='Falha ao salvar';refreshOperationalUI();assert(document.getElementById('v3Sync').dataset.state==='error','Falha anunciada como salvo');tag.textContent=old;refreshOperationalUI();
    document.getElementById('v3MenuToggle').focus();openNewIndicatorModal();await wait(60);assert(document.getElementById('modalEdit').contains(document.activeElement),'Foco modal');closeModal('modalEdit');await wait(0);
    assert(document.activeElement.id==='v3MenuToggle','Restauração foco modal');
    await wait(340);if(matchMedia('(prefers-reduced-motion: reduce)').matches){assert(DGranelMotion.activeCount===0,'WAAPI em redução');assert(getComputedStyle(document.querySelector('.v3-sidebar')).transitionDuration==='0s','CSS em redução');}
    assert(window.__errors.length===0,window.__errors.join(';'));
    return 'PASS tema/sol/lua/persistência, dados intactos, gráficos sem recriação, limpeza de animações, skeleton real, IA com falha, alertas, erro de salvamento e foco';
}
