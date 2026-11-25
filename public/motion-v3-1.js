// Sem biblioteca: animações canceláveis e restritas aos containers que mudaram.
(() => {
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const active=new Map();let lastPage='home',themeTimer;
    const motionToken=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const duration=name=>parseFloat(motionToken(name))||0;
    function cancelWithin(container){
        if(!container)return;
        for(const [node,animation] of active){
            if(container.contains(node)){animation.cancel();active.delete(node);}
        }
    }
    function enter(node,frames=[{opacity:.88,transform:'translateY(4px)'},{opacity:1,transform:'none'}]){
        if(!node)return;active.get(node)?.cancel();active.delete(node);
        if(reduced.matches||!node.animate)return;
        const animation=node.animate(frames,{duration:duration('--motion-short'),easing:motionToken('--ease-enter')||'ease-out'});
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
        navigate(tab){
            if(tab===lastPage)return;
            cancelWithin(document.getElementById('view-'+lastPage));
            lastPage=tab;
            enter(document.getElementById('view-'+tab),[{opacity:.78,transform:'translateY(5px)'},{opacity:1,transform:'none'}]);
        },
        panelChanged(previous,next){
            cancelWithin(previous);
            enter(next);
        },
        chartsChanged(){
            for(const section of document.querySelectorAll('#view-dashboard :is(.dashboard-default-charts, #dynamicChartsContainer)')){
                if(section.getClientRects().length)enter(section,[{opacity:.92},{opacity:1}]);
            }
        },
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
        Chart.register({ id: 'dgranel-motion-presentation', beforeUpdate: styleChart });
    });

    function styleChart(chart) {
        if (!chart.canvas.closest('main, #modalDetail')) return;

        const theme = getComputedStyle(document.body);
        const token = name => theme.getPropertyValue(name).trim();
        const text = token('--ds-muted');
        const grid = token('--ds-chart-grid');
        const palette = ['--ds-series-1', '--ds-series-2', '--ds-series-3', '--ds-series-4'].map(token);
        const font = { family: 'Inter, sans-serif', size: 12, weight: 500 };
        const { legend, tooltip } = chart.options.plugins;
        if (legend?.labels) Object.assign(legend.labels, { color: text, font, boxWidth: 12, boxHeight: 8 });
        if (tooltip) {
            Object.assign(tooltip, {
                backgroundColor: '#18181B', titleColor: '#FAFAFA', bodyColor: '#E4E4E7',
                borderColor: '#3F3F46', borderWidth: 1, padding: 8, cornerRadius: 8,
                titleFont: { ...font, weight: 600 }, bodyFont: font, boxWidth: 8, boxHeight: 8
            });
        }

        for (const [id, axis] of Object.entries(chart.options.scales || {})) {
            const orientation = axis.axis || chart.scales[id]?.axis || id[0];
            if (axis.ticks) Object.assign(axis.ticks, { color: text, font });
            if (axis.title) Object.assign(axis.title, { color: text, font });
            if (axis.pointLabels) Object.assign(axis.pointLabels, { color: text, font });
            if (axis.angleLines) axis.angleLines.color = grid;
            if (axis.border) axis.border.display = false;
            if (axis.grid) {
                Object.assign(axis.grid, { color: grid, lineWidth: 1, drawTicks: false });
                if (orientation === 'x') axis.grid.drawOnChartArea = false;
            }
        }

        chart.data.datasets.forEach((dataset, index) => {
            const color = palette[index % palette.length];
            const type = dataset.type || chart.config.type;
            if (type === 'doughnut' || type === 'pie' || type === 'polarArea') {
                dataset.backgroundColor = dataset.data.map((_, index) => palette[index % palette.length]);
                dataset.borderColor = token('--ds-surface');
                return;
            }
            dataset.borderColor = color;
            if (type === 'line' || type === 'radar') {
                dataset.borderWidth = 2;
                dataset.pointBackgroundColor = color;
                dataset.pointBorderColor = color;
            }
            dataset.backgroundColor = type === 'line' && dataset.fill
                ? ({ chart }) => {
                    const area = chart.chartArea;
                    if (!area) return `${color}22`;
                    const fade = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
                    fade.addColorStop(0, `${color}2E`);
                    fade.addColorStop(1, `${color}03`);
                    return fade;
                }
                : type === 'radar' ? `${color}22` : type === 'bar' ? `${color}AA` : color;
        });
        if (chart.options.elements.point) chart.options.elements.point.hoverRadius = 5;
    }
})();
