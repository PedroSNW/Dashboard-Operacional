// Sem biblioteca: animações canceláveis e restritas aos containers que mudaram.
(() => {
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const active=new Map();let lastPage='home',themeTimer;
    const duration=name=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name))||0;
    function enter(node,frames=[{opacity:.88,transform:'translateY(4px)'},{opacity:1,transform:'none'}],shell=false){
        if(!node)return;active.get(node)?.cancel();active.delete(node);
        if(reduced.matches||!node.animate)return;
        const animation=node.animate(frames,{duration:duration(shell?'--motion-medium':'--motion-short'),easing:shell?'cubic-bezier(.2,0,.38,.9)':'cubic-bezier(0,0,.3,1)'});
        active.set(node,animation);const clear=()=>{if(active.get(node)===animation)active.delete(node);};animation.onfinish=clear;animation.oncancel=clear;
    }
    function visualExit(node,frames){
        if(reduced.matches||!node?.animate)return;
        const rect=node.getBoundingClientRect();if(!rect.width||!rect.height)return;
        const ghost=node.cloneNode(true);ghost.inert=true;ghost.setAttribute('aria-hidden','true');ghost.removeAttribute('id');ghost.removeAttribute('role');ghost.removeAttribute('data-alert-id');
        for(const e of [ghost,...ghost.querySelectorAll('*')]){e.removeAttribute('id');for(const a of [...e.attributes])if(a.name.startsWith('on'))e.removeAttribute(a.name);}
        ghost.classList.add('motion-visual-exit');
        Object.assign(ghost.style,{position:'fixed',inset:'auto',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',margin:'0',pointerEvents:'none',zIndex:'80'});
        document.body.append(ghost);const a=ghost.animate(frames,{duration:duration('--motion-micro'),easing:'cubic-bezier(.2,0,1,.9)'});active.set(ghost,a);
        let deadline;const cleanup=()=>{clearTimeout(deadline);ghost.remove();active.delete(ghost);a.onfinish=a.oncancel=null;a.cancel();};
        a.onfinish=a.oncancel=cleanup;
        // Abas em segundo plano podem adiar animationfinish; nunca reter cópias visuais.
        deadline=setTimeout(cleanup,duration('--motion-micro')+50);
    }
    reduced.addEventListener('change',()=>{if(reduced.matches){active.forEach(a=>a.cancel());active.clear();document.body.classList.remove('theme-transition');}});
    window.DGranelMotion={
        navigate(tab){if(tab===lastPage)return;lastPage=tab;enter(document.getElementById('view-'+tab));},
        shellChanged(previousLeft){
            if(reduced.matches)return;
            for(const node of [document.querySelector('main'),document.querySelector('.v3-topbar')]){active.get(node)?.cancel();const delta=previousLeft-node.getBoundingClientRect().left;enter(node,[{transform:`translateX(${delta}px)`},{transform:'none'}],true);}
        },
        chartsChanged(){enter(document.querySelector('#view-dashboard .chart-scroll-box')?.parentElement);},
        retireAlert(id){
            if(reduced.matches||document.getElementById('alertFilterView')?.value!=='unread')return;
            const card=[...document.querySelectorAll('[data-alert-id]')].find(c=>c.dataset.alertId===id);if(!card)return;
            const rect=card.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;
            visualExit(card,[{opacity:.65},{opacity:0}]);
        },
        retireModal(modal){if(modal&&!modal.classList.contains('hidden'))visualExit(modal,[{opacity:1},{opacity:0}]);},
        themeChanged(icon){clearTimeout(themeTimer);if(reduced.matches)return;document.body.classList.add('theme-transition');enter(icon,[{opacity:.6,transform:'rotate(-12deg)'},{opacity:1,transform:'rotate(0)'}]);themeTimer=setTimeout(()=>document.body.classList.remove('theme-transition'),duration('--motion-medium')+30);},
        aiState(state){const body=document.getElementById('aiResponseBody');if(!body)return;if(state==='loading'){const skeleton=document.createElement('div');skeleton.className='motion-ai-skeleton';skeleton.setAttribute('aria-hidden','true');skeleton.innerHTML='<span></span><span></span><span></span>';body.append(skeleton);}else{body.querySelector('.motion-ai-skeleton')?.remove();enter(body);}},
        get activeCount(){return active.size;}
    };
    document.addEventListener('DOMContentLoaded',()=>{
        document.getElementById('aiStatusText')?.setAttribute('role','status');
        const sync=document.getElementById('v3Sync'),save=document.getElementById('saveStateButton');
        if(sync&&save){const update=()=>{save.dataset.state=sync.dataset.state;save.setAttribute('aria-busy',String(sync.dataset.state==='loading'));};new MutationObserver(update).observe(sync,{attributes:true,attributeFilter:['data-state']});update();}
        for(const modal of document.querySelectorAll('div.fixed[id^="modal"]')){let visible=!modal.classList.contains('hidden');new MutationObserver(()=>{const next=!modal.classList.contains('hidden');if(next&&!visible)enter(modal.firstElementChild);if(!next)active.get(modal.firstElementChild)?.cancel();visible=next;}).observe(modal,{attributes:true,attributeFilter:['class']});}
        // Aparência interativa do Chart.js; PDF usa canvas destacado e animation:false.
        const chartAppearance=chart=>{
            if(!chart.canvas.closest('main'))return;
            const light=document.body.classList.contains('light-theme'),text=light?'#52657b':'#9aabc0';
            const tooltip=chart.options.plugins.tooltip;
            if(tooltip){Object.assign(tooltip,{backgroundColor:light?'#ffffff':'#17263a',titleColor:light?'#172b43':'#edf2f8',bodyColor:light?'#52657b':'#edf2f8',borderColor:light?'#d8e0e9':'#2a3b50',borderWidth:1,padding:12,cornerRadius:8});}
            if(chart.options.plugins.legend?.labels)chart.options.plugins.legend.labels.color=text;
            for(const axis of Object.values(chart.options.scales||{})){if(axis.ticks)axis.ticks.color=text;if(axis.pointLabels)axis.pointLabels.color=text;if(axis.grid)axis.grid.color=light?'#172b4317':'#edf2f817';}
            if(chart.options.elements.point)chart.options.elements.point.hoverRadius=5;
        };
        Chart.register({id:'dgranel-motion-presentation',beforeInit:chartAppearance,beforeUpdate:chartAppearance});
    });
})();
