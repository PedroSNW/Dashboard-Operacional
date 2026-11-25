(() => {
    const grid = document.getElementById('dynamicChartsContainer');
    const toolbar = document.getElementById('dashboardLayoutToolbar');
    const edit = document.getElementById('dashboardLayoutEdit');
    const actions = document.getElementById('dashboardLayoutActions');
    const help = document.getElementById('dashboardLayoutHelp');
    const status = document.getElementById('dashboardLayoutStatus');
    const desktop = matchMedia('(min-width: 1024px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const columns = 12;
    const rowLimit = 2000;
    const defaults = new Map([['chart1', [8, 7]], ['chart3', [4, 7]], ['chart2', [6, 7]], ['chart4', [6, 7]]]);
    const drafts = new Map();
    const animations = new WeakMap();
    let epoch, owner, cards = [], layout = new Map(), drag, resizeFrame;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const order = (a, b) => a.y - b.y || a.x - b.x;
    const sharesColumns = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x;
    const overlap = (a, b) => sharesColumns(a, b) && a.y < b.y + b.h && a.y + a.h > b.y;
    const height = slots => Math.max(0, ...Array.from(slots.values(), slot => slot.y + slot.h));
    const draft = () => drafts.get(owner);
    const sameSlot = (a, b) => a && b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

    function fit(slots, slot) {
        let colliding;
        while ((colliding = [...slots.values()].filter(other => overlap(slot, other))).length) {
            slot = { ...slot, y: Math.max(...colliding.map(other => other.y + other.h)) };
        }
        return slot;
    }

    function arrange(stored, priority, movingDown = false) {
        const placed = new Map();
        const known = new Map(Object.entries(stored ?? {}));
        const fixed = [];
        const missing = [];
        for (const card of cards) {
            const { key, width, rows } = card;
            const item = known.get(key);
            if (item && ['x', 'y', 'w', 'h'].every(field => Number.isInteger(item[field]))) {
                const w = clamp(item.w, 4, columns);
                const slot = { x: clamp(item.x, 0, columns - w), y: clamp(item.y, 0, rowLimit), w, h: clamp(item.h, 5, 16) };
                fixed.push([key, slot]);
            } else {
                missing.push({ key, width, rows });
            }
        }
        fixed.sort(([keyA, a], [keyB, b]) => {
            if (movingDown && a.y !== b.y) return a.y - b.y;
            if (keyA === priority) return movingDown ? 1 : -1;
            if (keyB === priority) return movingDown ? -1 : 1;
            return order(a, b);
        });
        for (const [key, slot] of fixed) placed.set(key, fit(placed, slot));
        for (const { key, width, rows } of missing) {
            let slot = { x: 0, y: 0, w: width, h: rows };
            while ([...placed.values()].some(other => overlap(slot, other))) {
                slot = slot.x + width < columns ? { ...slot, x: slot.x + 1 } : { ...slot, x: 0, y: slot.y + 1 };
            }
            placed.set(key, slot);
        }
        // Cada cartão sobe até o fim do último cartão que ocupa suas colunas.
        const compact = new Map();
        for (const [key, slot] of [...placed].sort(([, a], [, b]) => order(a, b))) {
            let y = 0;
            for (const above of compact.values()) {
                if (sharesColumns(slot, above)) y = Math.max(y, above.y + above.h);
            }
            compact.set(key, { ...slot, y });
        }
        return compact;
    }

    function collect() {
        const customOrder = new Map(customCharts.map((chart, index) => ['canvas_' + chart.id, index + defaults.size]));
        const defaultOrder = new Map([...defaults.keys()].map((key, index) => [key, index]));
        return [...grid.children].flatMap(node => {
            if (node.classList.contains('hidden')) return [];
            const key = node.querySelector('canvas[id]')?.id;
            if (!key) return [];
            const standard = defaults.get(key);
            if (!dashboardHasWidget(standard ? 'default-chart' : 'custom-chart', standard ? key : key.slice(7))) return [];
            const [width, rows] = standard ?? [clamp(Number(node.dataset.chartSpan) || 6, 4, columns), 7];
            return [{ key, node, width, rows }];
        }).sort((a, b) => (defaultOrder.get(a.key) ?? customOrder.get(a.key)) - (defaultOrder.get(b.key) ?? customOrder.get(b.key)));
    }

    function updateChartSizes() {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            for (const { key, node } of cards) {
                const chart = Chart.getChart(key);
                if (!chart || !node.getClientRects().length) continue;
                applyChartScrollWidth(chart, false);
                chart.resize();
            }
        });
    }

    function addHandles(card, plot) {
        if (card.node.querySelector('.dashboard-chart-handles')) return;
        const controls = document.createElement('div');
        controls.className = 'dashboard-chart-handles';
        for (const [action, text] of [['move', 'Mover'], ['size', 'Redimensionar']]) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'v3-button';
            button.dataset.layoutAction = action;
            button.textContent = text;
            button.setAttribute('aria-label', text + ' ' + card.node.querySelector('h3,h4')?.textContent.trim());
            button.setAttribute('aria-describedby', help.id);
            controls.append(button);
        }
        plot.before(controls);
    }

    function show(animate = false) {
        const editing = Boolean(draft());
        const arranged = editing || Object.keys(owner?.chartLayout ?? {}).length > 0;
        const focused = document.activeElement;
        const positions = animate && !reduced.matches
            ? new Map(cards.map(({ node }) => [node, node.getBoundingClientRect()])) : null;
        grid.toggleAttribute('data-arranged', arranged);
        grid.toggleAttribute('data-editing', editing);
        toolbar.hidden = !cards.length;
        edit.hidden = editing;
        actions.hidden = help.hidden = !editing;
        edit.setAttribute('aria-expanded', String(editing));
        const displayed = arranged ? [...cards].sort((a, b) => order(layout.get(a.key), layout.get(b.key))) : cards;
        for (const { key, node } of displayed) {
            animations.get(node)?.cancel();
            node.dataset.layoutChart = key;
            const plot = node.querySelector('canvas[id]').closest('.chart-scroll-box')?.parentElement
                ?? node.querySelector('canvas[id]').parentElement;
            plot.classList.add('dashboard-chart-plot');
            const { x, y, w, h } = layout.get(key);
            for (const [name, value] of Object.entries({ x: x + 1, y: y + 1, w, h })) node.style.setProperty('--chart-' + name, value);
            if (editing) addHandles({ key, node }, plot);
            else node.querySelector('.dashboard-chart-handles')?.remove();
        }
        const visible = new Set(displayed.map(({ node }) => node));
        let next = [...grid.children].find(node => visible.has(node));
        for (const { node } of displayed) {
            if (node !== next) grid.insertBefore(node, next ?? null);
            next = node.nextElementSibling;
            while (next && !visible.has(next)) next = next.nextElementSibling;
        }
        if (focused?.isConnected && grid.contains(focused) && document.activeElement !== focused) focused.focus({ preventScroll: true });
        if (positions) for (const { node } of cards) {
            const { left, top } = node.getBoundingClientRect();
            const before = positions.get(node);
            if (left !== before.left || top !== before.top) {
                animations.set(node, node.animate([{ translate: `${before.left-left}px ${before.top-top}px` }, { translate: 'none' }], { duration: 160, easing: 'ease-out' }));
            }
        }
        updateChartSizes();
    }

    function refresh() {
        endDrag();
        if (epoch !== sessionEpoch) { epoch = sessionEpoch; drafts.clear(); }
        for (const board of drafts.keys()) if (!dashboards.includes(board)) drafts.delete(board);
        owner = getActiveDashboard();
        cards = collect();
        layout = arrange(draft()?.slots ?? owner?.chartLayout);
        show();
    }

    function projectChange(key, next) {
        const current = layout.get(key);
        if (sameSlot(current, next)) return layout;
        const slots = Object.fromEntries(layout);
        slots[key] = next;
        return arrange(slots, key, next.y > current.y);
    }

    function change(key, next) {
        const projected = projectChange(key, next);
        if ([...projected].every(([id, slot]) => sameSlot(layout.get(id), slot))) return;
        layout = projected;
        draft().slots = Object.fromEntries(layout);
        draft().changed = true;
        show(true);
        const slot = layout.get(key);
        status.textContent = `Gráfico ajustado. Coluna ${slot.x+1}, linha ${slot.y+1}, ${slot.w} colunas de largura e ${slot.h} linhas de altura.`;
    }

    function mobilePosition(key, target, after) {
        const from = layout.get(key), to = layout.get(target);
        if (!to || key === target) return from;
        return { ...from, x: 0, y: after ? to.y + to.h : to.y };
    }

    function adjusted(slot, action, dx, dy) {
        if (action === 'size') return { ...slot, w: clamp(slot.w + dx, 4, columns - slot.x), h: clamp(slot.h + dy, 5, 16) };
        return { ...slot, x: clamp(slot.x + dx, 0, columns - slot.w), y: clamp(slot.y + dy, 0, Math.min(rowLimit, height(layout))) };
    }

    function dragFrame(panning = true) {
        const { point, key, action, slot, start } = drag;
        const edge = 60;
        if (panning && (point.y < edge || point.y > innerHeight - edge)) window.scrollBy({ top: point.y < edge ? -10 : 10, behavior: 'instant' });
        const rect = grid.getBoundingClientRect();
        const gap = 16, row = 64, column = (rect.width + gap)/columns;
        drag.next = adjusted(slot, action, desktop.matches ? Math.round((point.x-start.x)/column) : 0,
            Math.round((point.y-rect.top-start.y)/row));
        const nearby = document.elementFromPoint(point.x, point.y)?.closest('[data-layout-chart]');
        if (!desktop.matches && action === 'move') {
            const target = nearby?.getBoundingClientRect();
            drag.next = mobilePosition(key, nearby?.dataset.layoutChart, target && point.y > target.top + target.height/2);
            if (target) Object.assign(drag.preview.style, {
                left: '0', top: `${(point.y > target.top+target.height/2 ? target.bottom : target.top)-rect.top-2}px`,
                width: '100%', height: '4px',
            });
        } else {
            const requested = drag.next;
            if (!sameSlot(drag.requested, requested)) {
                drag.requested = requested;
                drag.projected = projectChange(key, requested).get(key);
            }
            const next = drag.projected;
            Object.assign(drag.preview.style, {
                left: `${desktop.matches ? next.x*column : 0}px`,
                top: `${desktop.matches ? next.y*row : start.cardTop}px`,
                width: desktop.matches ? `${next.w*column-gap}px` : '100%',
                height: `${next.h*row-gap}px`,
            });
        }
        if (panning) drag.frame = requestAnimationFrame(() => dragFrame());
    }

    function endDrag() {
        if (!drag) return;
        const { frame, preview, handle, pointer } = drag;
        drag = undefined;
        cancelAnimationFrame(frame);
        preview.remove();
        if (handle.hasPointerCapture(pointer)) handle.releasePointerCapture(pointer);
    }

    grid.addEventListener('pointerdown', event => {
        const handle = event.target.closest('[data-layout-action]');
        if (!handle || !draft() || event.button !== 0 || drag) return;
        const card = handle.closest('[data-layout-chart]'), key = card.dataset.layoutChart;
        const preview = document.createElement('div');
        preview.className = 'dashboard-layout-preview';
        preview.setAttribute('aria-hidden', 'true');
        grid.append(preview);
        handle.setPointerCapture(event.pointerId);
        const rect = grid.getBoundingClientRect();
        const point = { x: event.clientX, y: event.clientY };
        drag = { key, action: handle.dataset.layoutAction, handle, pointer: event.pointerId, preview, point,
            slot: layout.get(key), start: { x: point.x, y: point.y-rect.top, cardTop:card.getBoundingClientRect().top-rect.top } };
        drag.frame = requestAnimationFrame(() => dragFrame());
    });
    grid.addEventListener('pointermove', event => {
        if (drag?.pointer === event.pointerId) drag.point = { x: event.clientX, y: event.clientY };
    });
    grid.addEventListener('pointerup', event => {
        if (drag?.pointer !== event.pointerId) return;
        drag.point = { x: event.clientX, y: event.clientY };
        dragFrame(false);
        const { key, next } = drag;
        endDrag();
        if (next && owner === getActiveDashboard()) change(key, next);
    });
    grid.addEventListener('pointercancel', endDrag);
    grid.addEventListener('lostpointercapture', event => { if (event.pointerId === drag?.pointer) endDrag(); });
    grid.addEventListener('keydown', event => {
        const handle = event.target.closest('[data-layout-action]');
        if (!handle || !draft()) return;
        const deltas = { ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0] };
        const delta = deltas[event.key];
        if (!delta) return;
        event.preventDefault();
        const [dx, dy] = delta, key = handle.closest('[data-layout-chart]').dataset.layoutChart;
        const action = handle.dataset.layoutAction;
        if (desktop.matches && action === 'move' && dy) {
            const from = layout.get(key);
            const neighbours = [...layout.values()].filter(slot => sharesColumns(from, slot) && (slot.y - from.y) * dy > 0);
            const target = neighbours.sort((a, b) => (a.y - b.y) * dy)[0];
            if (target) change(key, { ...from, y: target.y });
        } else if (desktop.matches || action === 'size') {
            change(key, adjusted(layout.get(key), action, desktop.matches ? dx : 0, dy));
        } else if (dy) {
            const list = [...layout].sort(([,a], [,b]) => order(a,b));
            change(key, mobilePosition(key, list[list.findIndex(([id]) => id === key)+dy]?.[0], dy > 0));
        }
    });
    edit.addEventListener('click', () => {
        if (!owner || !cards.length || drafts.has(owner)) return;
        drafts.set(owner, { initial: new Map(layout), slots: Object.fromEntries(layout), changed: false });
        show();
        cards[0]?.node.querySelector('[data-layout-action]')?.focus();
    });
    function close(apply) {
        const editing = draft();
        if (!editing) return;
        endDrag();
        drafts.delete(owner);
        const changed = editing.changed && [...layout].some(([key, slot]) => !sameSlot(editing.initial.get(key), slot));
        if (apply && changed && owner === getActiveDashboard() && epoch === sessionEpoch) {
            owner.chartLayout = { ...owner.chartLayout, ...Object.fromEntries(layout) };
            saveDashboards();
            status.textContent = 'Layout aplicado. Use Salvar alterações para compartilhar o novo layout.';
        } else status.textContent = apply ? 'Nenhuma alteração de layout.' : 'Edição de layout cancelada.';
        refresh();
        if (!edit.hidden) edit.focus();
    }
    document.getElementById('dashboardLayoutApply').onclick = () => close(true);
    document.getElementById('dashboardLayoutCancel').onclick = () => close(false);
    document.getElementById('view-dashboard').addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !draft() || event.target.closest('dialog,[id^="modal"]')) return;
        event.preventDefault();
        if (drag) endDrag();
        else close(false);
    });
    desktop.addEventListener('change', () => { endDrag(); updateChartSizes(); });
    window.DGranelChartLayout = { refresh, hasDraft: () => epoch === sessionEpoch && drafts.size > 0 };
})();
