(() => {
    const $ = id => document.getElementById(id);
    const types = {kpi:'Indicador', chart:'Gráfico', table:'Tabela', note:'Balão', text:'Texto'};
    const colors = {blue:'#174D92', teal:'#067064', amber:'#825008', rose:'#9C3151'};
    const orientations = {
        portrait:{label:'Vertical', width:760, height:1030},
        landscape:{label:'Horizontal', width:1100, height:702},
    };
    const aiIndicatorLimit = 12;
    const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const number = new Intl.NumberFormat('pt-BR', {maximumFractionDigits:2});
    const percent = new Intl.NumberFormat('pt-BR', {maximumFractionDigits:1, signDisplay:'exceptZero'});
    const blankSource = {months:[], items:[], version:null};
    const unset = '';
    let owner, page, selected, source = blankSource, frame, printHost, deleteId, aiDraft;
    let pages = new Map(), storageError = false;

    function node(tag, text, className) {
        const el = document.createElement(tag);
        if (text !== undefined) el.textContent = text;
        if (className) el.className = className;
        return el;
    }

    function button(label, run, className) {
        const el = node('button', label, className);
        el.type = 'button';
        el.onclick = run;
        return el;
    }

    function field(label, value, update, options = {}) {
        const group = node('label', undefined, 'op-field');
        const control = node(options.choices ? 'select' : options.rows ? 'textarea' : 'input');
        if (options.choices) {
            const choices = [...options.choices];
            if (value && !choices.some(([id]) => id === value)) choices.push([value, options.missing ?? value + ' · indisponível']);
            control.append(...choices.map(([id, text]) => new Option(text, id)));
        } else {
            control.maxLength = options.rows ? 600 : 120;
            if (options.rows) control.rows = options.rows;
        }
        control.value = value ?? '';
        control.addEventListener(options.choices ? 'change' : 'input', () => update(control.value));
        group.append(node('span', label), control);
        return group;
    }

    function toggle(label, checked, update) {
        const group = node('label', undefined, 'op-check');
        const input = node('input');
        input.type = 'checkbox';
        input.checked = checked;
        input.onchange = () => update(input.checked);
        group.append(input, node('span', label));
        return group;
    }

    const storagePrefix = () => 'dgranel.onepage.v1.' + owner + '.';
    function newPage() {
        return {version:1, id:crypto.randomUUID(), title:'Nova OnePage', subtitle:'', accent:'blue',
            orientation:'portrait', start:'', end:'', blocks:[], updated:0};
    }

    function loadPages() {
        try {
            const prefix = storagePrefix();
            for (const key of Object.keys(localStorage).filter(key => key.startsWith(prefix))) {
                let stored;
                try { stored = JSON.parse(localStorage.getItem(key)); } catch { continue; }
                if (stored?.version !== 1 || key !== prefix + stored.id || typeof stored.title !== 'string' ||
                    !Array.isArray(stored.blocks) || !stored.blocks.every(b => b && Object.hasOwn(types,b.type) && typeof b.id === 'string')) continue;
                stored.orientation = stored.orientation === 'landscape' ? 'landscape' : 'portrait';
                pages.set(stored.id, stored);
            }
        } catch {
            storageError = true;
        }
        page = [...pages.values()].sort((a,b) => b.updated - a.updated)[0] ?? newPage();
    }

    function persist() {
        page.updated = Date.now();
        pages.set(page.id, page);
        try {
            localStorage.setItem(storagePrefix() + page.id, JSON.stringify(page));
            storageError = false;
        } catch {
            storageError = true;
        }
        updateStatus();
    }

    function updateStatus() {
        $('opStatus').textContent = storageError ? 'Armazenamento local indisponível. Alterações mantidas nesta aba.'
            : page.updated ? 'Salvo neste navegador' : 'As páginas ficam salvas neste navegador.';
    }

    function title(p) { return p.title.trim() || 'OnePage sem título'; }
    function blockTitle(block) { return block.title.trim() || source.items.find(i => i.key === block.indicator)?.name || types[block.type]; }
    function selectPage(next) {
        page = next;
        selected = page.blocks[0]?.id;
        renderEditor();
        schedulePreview();
    }

    function readSource() {
        const snap = pendingTracker.reference;
        if (!supabaseReady || !supabaseStateLoaded || !snap) return blankSource;
        const counts = new Map();
        const items = snap.indicadores.map((i,index) => {
            const identity = typeof i.id === 'string' || typeof i.id === 'number'
                ? ['id',i.id] : ['legacy',i.setor,i.indicador,i.und];
            const base = JSON.stringify(identity);
            const occurrence = counts.get(base) ?? 0;
            counts.set(base, occurrence + 1);
            return {key:JSON.stringify([...identity,occurrence]), id:i.id??'indice:'+index, name:i.indicador, sector:i.setor, unit:i.und, meta:i.meta,
                zeroConfirmed:i.metaZeroConfirmada === true, values:i.valores};
        });
        return {months:snap.mesesLabels, items, version:pendingTracker.version};
    }

    function competency(label) {
        const numeric = label.match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
        const named = label.match(/^(\p{L}+)(?:[ /](\d{2}|\d{4}))?$/u);
        const short = named?.[1].normalize('NFD').replace(/\p{M}/gu,'').slice(0,3).toLowerCase();
        const month = numeric ? Number(numeric[1])-1 : monthNames.findIndex(m => m.toLowerCase() === short);
        const rawYear = numeric?.[2] ?? named?.[2] ?? '2026';
        const year = Number(rawYear.length === 2 ? '20' + rawYear : rawYear);
        return monthNames[month] ? {label:monthNames[month] + '/' + year,key:year*12+month} : {label,key:null};
    }

    function period(block = {}, document = page) {
        const first = block.start || document.start, last = block.end || document.end;
        const start = first ? source.months.indexOf(first) : 0;
        const end = last ? source.months.indexOf(last) : source.months.length - 1;
        if (!source.months.length || start < 0 || end < start) return [];
        return source.months.slice(start, end + 1).map((label,n) => ({...competency(label),index:start+n}));
    }

    function change(target, key, value, redraw = false) {
        target[key] = value;
        persist();
        if (redraw) renderEditor();
        else {
            const option = $('opPages').selectedOptions[0];
            if (option?.value === page.id) option.textContent = title(page);
            const blockButton = $('opBlocks').querySelector('[aria-pressed="true"] strong');
            const block = page.blocks.find(b => b.id === selected);
            if (blockButton && block) blockButton.textContent = blockTitle(block);
            syncButtons();
        }
        schedulePreview();
    }

    function newBlock(type) {
        return {id:crypto.randomUUID(), type, title:'', text:'', note:'', width:type === 'kpi' ? 'half' : 'full',
            indicator:unset, indicators:[], start:'', end:'', chart:'line', target:false, comparison:false, labels:false, tone:'accent'};
    }

    function addBlock(type) {
        const block = newBlock(type);
        page.blocks.push(block);
        selected = block.id;
        persist();
        renderEditor();
        $('opInspector').querySelector('input')?.focus();
        schedulePreview();
    }

    function moveBlock(block, step) {
        const from = page.blocks.indexOf(block), to = from + step;
        if (to < 0 || to >= page.blocks.length) return;
        page.blocks.splice(from,1);
        page.blocks.splice(to,0,block);
        persist();
        renderEditor();
        $('opBlocks').querySelector('[aria-pressed="true"]')?.focus();
        schedulePreview();
    }

    function renderEditor() {
        const library = [...pages.values()];
        if (!pages.has(page.id)) library.push(page);
        $('opPages').replaceChildren(...library.map(p => new Option(title(p),p.id)));
        $('opPages').value = page.id;
        updateStatus();
        const update = key => value => change(page,key,value);
        const months = source.months.map(m => [m,competency(m).label]);
        $('opSettings').replaceChildren(
            field('Título',page.title,update('title')),
            field('Subtítulo',page.subtitle,update('subtitle'),{rows:2}),
            orientationField(page.orientation,update('orientation')),
            field('Cor de destaque',page.accent,update('accent'),{choices:[['blue','Azul'],['teal','Verde'],['amber','Âmbar'],['rose','Vinho']]}),
            node('p', source.months.length ? 'Período padrão dos blocos de dados' : 'Dados sincronizados indisponíveis.', 'op-field-hint'),
            dateFields(page,months,['Primeira competência','Última competência'])
        );
        $('opBlocks').replaceChildren(...page.blocks.map((b, i) => {
            const li = node('li');
            const select = button('', () => {selected = b.id;renderEditor();$('opBlocks').querySelector('[aria-pressed="true"]')?.focus();schedulePreview();});
            select.append(node('span',types[b.type]),node('strong',blockTitle(b)));
            select.setAttribute('aria-pressed',String(selected === b.id));
            const up = button('↑',() => moveBlock(b,-1));
            const down = button('↓',() => moveBlock(b,1));
            up.setAttribute('aria-label','Subir bloco ' + blockTitle(b));
            down.setAttribute('aria-label','Descer bloco ' + blockTitle(b));
            up.disabled = i === 0;
            down.disabled = i === page.blocks.length - 1;
            li.append(select,up,down);
            return li;
        }));
        syncButtons();
        renderInspector(page.blocks.find(b => b.id === selected),months);
    }

    function syncButtons() {
        $('opDelete').disabled = !pages.has(page.id);
        $('opAiOpen').disabled = !source.version || !source.items.length;
        $('opPresent').disabled = $('opPrint').disabled = page.blocks.length === 0;
    }

    function orientationField(value, update) {
        return field('Orientação',value,update,{choices:Object.entries(orientations).map(([id,setting])=>[id,setting.label])});
    }

    function dateFields(target, months, defaults, update = (key,value) => change(target,key,value)) {
        const row = node('div',undefined,'op-split');
        row.append(...['start','end'].map((key,n) => field(n ? 'Até' : 'De',target[key],
            value => update(key,value),{choices:[['',defaults[n]],...months]})));
        return row;
    }

    function indicatorPicker(block, {label='Indicadores da tabela', limit=Infinity, update} = {}) {
        const wrapper = node('fieldset',undefined,'op-picker');
        const search = node('input');
        search.type = 'search';
        search.placeholder = 'Buscar por indicador ou setor';
        search.setAttribute('aria-label','Filtrar ' + label.toLowerCase());
        const list = node('div',undefined,'op-indicator-list');
        const save = update ?? (keys => change(block,'indicators',keys));
        const render = () => {
            const normalize = s => String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
            const items = source.items.filter(i => normalize(i.name + ' ' + i.sector).includes(normalize(search.value.trim())));
            list.replaceChildren(...items.map(i => {
                const selected = block.indicators.includes(i.key);
                const check = toggle(i.name + (i.sector ? ' · ' + i.sector : ''),selected,checked => {
                    save(checked ? [...block.indicators,i.key] : block.indicators.filter(id => id !== i.key));
                    for (const input of list.querySelectorAll('input')) input.disabled = !input.checked && block.indicators.length >= limit;
                });
                check.querySelector('input').disabled = !selected && block.indicators.length >= limit;
                return check;
            }));
            if (!items.length) list.append(node('p','Nenhum indicador encontrado.','op-field-hint'));
        };
        search.oninput = render;
        wrapper.append(node('legend',label),search,list);
        const absent = block.indicators.filter(key => !source.items.some(i => i.key === key));
        if (absent.length) wrapper.append(button('Remover ' + absent.length + ' seleção(ões) indisponível(is)', () => {
            change(block,'indicators',block.indicators.filter(key => !absent.includes(key)),true);
        }));
        render();
        return wrapper;
    }

    function renderInspector(block, months) {
        const inspector = $('opInspector');
        inspector.replaceChildren();
        if (!block) return;
        const update = key => value => change(block,key,value);
        inspector.append(
            node('h4','Editar ' + types[block.type].toLowerCase()),
            field('Título do bloco',block.title,update('title')),
            field('Largura',block.width,update('width'),{choices:[['full','Página inteira'],['half','Metade'],['third','Um terço']]}));
        if (block.type === 'text' || block.type === 'note') {
            inspector.append(field('Conteúdo',block.text,update('text'),{rows:4}));
            if (block.type === 'note') inspector.append(field('Estilo do balão',block.tone,update('tone'),
                {choices:[['accent','Destaque'],['neutral','Neutro'],['attention','Atenção']]}));
        } else {
            if (block.type === 'table') inspector.append(indicatorPicker(block));
            else inspector.append(field('Indicador',block.indicator,update('indicator'),
                {choices:[['','Selecione o indicador'],...source.items.map(i => [i.key,i.name + (i.sector ? ' · ' + i.sector : '')])],missing:'Indicador indisponível'}));
            inspector.append(dateFields(block,months,['Período da página','Período da página']));
            if (block.type === 'chart') {
                inspector.append(field('Tipo de gráfico',block.chart,update('chart'),{choices:[['line','Linha'],['bar','Colunas']]}),
                    toggle('Exibir valores no gráfico',block.labels,update('labels')));
            } else inspector.append(toggle('Comparar com a competência anterior',block.comparison,update('comparison')));
            inspector.append(toggle('Exibir meta cadastrada',block.target,update('target')),
                field('Balão de observação',block.note,update('note'),{rows:2}));
        }
        const actions = node('div',undefined,'op-actions');
        actions.append(
            button('Duplicar bloco',() => {
                const copy = {...structuredClone(block),id:crypto.randomUUID()};
                page.blocks.splice(page.blocks.indexOf(block)+1,0,copy);
                selected = copy.id;
                persist();renderEditor();schedulePreview();
                $('opInspector').querySelector('input')?.focus();
            }),
            button('Remover bloco',() => {
                const index = page.blocks.indexOf(block);
                page.blocks.splice(index,1);
                selected = (page.blocks[index] ?? page.blocks[index-1])?.id;
                persist();renderEditor();schedulePreview();
                ($('opBlocks').querySelector('[aria-pressed="true"]') ?? $('opAdd').firstElementChild)?.focus();
            },'op-danger')
        );
        inspector.append(actions);
    }

    function valueAt(item,point) {
        const value = point && item.values?.[point.index];
        return Number.isFinite(value) ? value : null;
    }

    function valueText(value,unit) {
        if (value === null) return 'Sem dado';
        return fmtVal(value,unit) + (unit && !['Qtd','R$','%'].includes(unit) ? ' ' + unit : '');
    }

    function targetText(item) {
        if (item.meta === 0 && !item.zeroConfirmed) return 'Zero a confirmar';
        return Number.isFinite(item.meta) ? valueText(item.meta,item.unit) : 'Sem meta cadastrada';
    }

    function previousMonth(points) {
        const previous = points.at(-2), current = points.at(-1);
        return previous?.key != null && current?.key != null && current.key - previous.key === 1 ? previous : null;
    }

    function comparison(item, points) {
        const previous = valueAt(item,previousMonth(points)), current = valueAt(item,points.at(-1));
        if (previous === null || current === null) return 'Sem comparação';
        const diff = current - previous;
        if (diff === 0) return 'Estável';
        if (!Number.isFinite(diff)) return 'Sem comparação';
        if (previous === 0) return (diff > 0 ? '+' : '') + number.format(diff) + (item.unit === '%' ? ' p.p.' : '');
        const ratio = diff / Math.abs(previous) * 100;
        return Number.isFinite(ratio) ? percent.format(ratio) + '%' : 'Sem comparação';
    }

    function resultsTable(block, items, points) {
        const table = node('table',undefined,'op-data-table');
        const head = node('thead'), row = node('tr'), body = node('tbody');
        const headers = ['Indicador',points.at(-1).label];
        const previous = previousMonth(points);
        if (block.comparison) headers.push(previous ? 'Vs. ' + previous.label : 'Vs. anterior');
        if (block.target) headers.push('Meta');
        for (const text of headers) {const th = node('th',text);th.scope='col';row.append(th);}
        head.append(row);
        for (const item of items) {
            const line = node('tr'), label = node('th',item.name);
            label.scope = 'row';
            if (item.sector) label.append(node('small',item.sector));
            line.append(label,node('td',valueText(valueAt(item,points.at(-1)),item.unit)));
            if (block.comparison) line.append(node('td',comparison(item,points)));
            if (block.target) line.append(node('td',targetText(item)));
            body.append(line);
        }
        table.append(head,body);
        return table;
    }

    function chartImage(block,item,points) {
        const chart = node('canvas');
        chart.width = {third:430,half:570,full:900}[block.width] ?? 900;
        chart.height = page.orientation === 'landscape' && block.width === 'full' ? 204 : 290;
        const color = colors[page.accent] ?? colors.blue;
        const data = points.map(p => valueAt(item,p));
        const target = block.target && Number.isFinite(item.meta) && (item.meta !== 0 || item.zeroConfirmed);
        const datasets = [{label:item.name, data, borderColor:color, backgroundColor:block.chart === 'bar' ? color : '#0000',
            borderWidth:2, pointRadius:data.length <= 18 ? 3 : 0, spanGaps:false}];
        if (target) datasets.push({type:'line',label:'Meta',data:data.map(() => item.meta),borderColor:'#825008',borderDash:[7,5],
            borderWidth:1.5,backgroundColor:'#0000',pointRadius:0,datalabels:{display:false}});
        let instance;
        try {
            instance = new Chart(chart,{
                type:block.chart === 'bar' ? 'bar' : 'line',
                data:{labels:points.map(p => p.label),datasets},
                options:{responsive:false,animation:false,devicePixelRatio:2,layout:{padding:{top:block.labels?16:2,right:12}},
                    plugins:{legend:{display:false},tooltip:{enabled:false},datalabels:{display:ctx => block.labels &&
                        (ctx.dataIndex % Math.ceil(data.length/16) === 0 || ctx.dataIndex === data.length - 1),
                        color:'#192e4d',anchor:'end',align:'top',clamp:true,formatter:v=>v == null ? '' : number.format(v)}},
                    scales:{x:{ticks:{color:'#435572',font:{size:14},maxTicksLimit:8,maxRotation:0},grid:{display:false}},
                        y:{beginAtZero:block.chart === 'bar',ticks:{color:'#435572',font:{size:14},maxTicksLimit:6,callback:v=>number.format(v)},
                            grid:{color:'#dae4f3'}}}}
            });
            const image = node('img');
            image.alt = 'Gráfico de ' + item.name + '. ' + points.map((p,n) => p.label + ', ' + valueText(data[n],item.unit)).join('; ');
            image.src = chart.toDataURL();
            image.width = chart.width;
            image.height = chart.height;
            image.className = 'op-chart-image';
            return image;
        } catch {
            return null;
        } finally {
            instance?.destroy();
        }
    }

    function renderData(block, card) {
        const points = period(block);
        const keys = block.type === 'table' ? block.indicators : [block.indicator];
        const items = keys.map(key => source.items.find(item => item.key === key)).filter(Boolean);
        const meta = text => card.append(node('p',text,'op-paper-meta'));
        if (!points.length) {
            meta(source.months.length ? 'Período indisponível. Confira as competências escolhidas.' : 'Dados sincronizados indisponíveis.');
            return;
        }
        if (!items.length) {
            meta(keys.some(Boolean) ? 'Indicador indisponível no snapshot.' : 'Selecione os indicadores do bloco.');
            return;
        }
        if (block.type === 'table') {
            card.append(resultsTable(block,items,points));
            if (items.length < keys.length) meta('Há indicadores selecionados indisponíveis no snapshot.');
            return;
        }
        const item = items[0];
        let chartShown = false;
        if (block.type === 'kpi') {
            const current = points.at(-1);
            card.append(node('strong',valueText(valueAt(item,current),item.unit),'op-kpi-value'));
            meta(current.label + (item.sector ? ' · ' + item.sector : ''));
            const previous = previousMonth(points);
            if (block.comparison) meta(comparison(item,points) + (previous ? ' vs. ' + previous.label : ''));
        } else {
            meta((item.unit || 'Valor') + ' · ' + periodText(points));
            const image = points.some(p => valueAt(item,p) !== null) ? chartImage(block,item,points) : null;
            if (image) {
                card.append(image);
                chartShown = true;
            }
            else {
                const fallback = node('p',points.map(p => p.label + ' · ' + valueText(valueAt(item,p),item.unit)).join('  |  '),'op-paper-meta');
                card.append(fallback);
            }
        }
        if (block.target) meta((chartShown && Number.isFinite(item.meta) && (item.meta !== 0 || item.zeroConfirmed) ? 'Linha tracejada · ' : '') + 'Meta · ' + targetText(item));
    }

    function periodText(points) {
        return points.length === 1 ? points[0].label : points.length ? points[0].label + ' a ' + points.at(-1).label : '';
    }

    function paper(editable = false) {
        const sheet = node('article',undefined,'op-paper');
        sheet.dataset.orientation = page.orientation;
        const color = colors[page.accent] ?? colors.blue;
        sheet.style.setProperty('--op-paper-accent',color);
        const head = node('header',undefined,'op-paper-header');
        const mark = node('span','D’GRANEL','op-paper-brand');
        head.append(mark,node('h2',title(page)));
        if (page.subtitle.trim()) head.append(node('p',page.subtitle,'op-paper-subtitle'));
        const range = periodText(period());
        if (range && page.blocks.some(b => ['kpi','chart','table'].includes(b.type))) head.append(node('p',range,'op-paper-range'));
        sheet.append(head);
        const grid = node('div',undefined,'op-paper-grid');
        for (const block of page.blocks) {
            const card = node('section',undefined,'op-card');
            card.dataset.width = block.width;
            card.dataset.type = block.type;
            if (block.type === 'note') card.dataset.tone = block.tone;
            if (editable && block.id === selected) card.classList.add('op-current');
            const heading = node('h3');
            heading.append(editable ? button(blockTitle(block),() => {
                selected = block.id;
                renderEditor();schedulePreview();
                $('opInspector').querySelector('input')?.focus();
            }) : node('span',blockTitle(block)));
            card.append(heading);
            if (block.type === 'text' || block.type === 'note') card.append(node('p',block.text || 'Adicione o conteúdo do bloco.','op-copy'));
            else {
                renderData(block,card);
                if (block.note.trim()) card.append(node('aside',block.note,'op-callout'));
            }
            grid.append(card);
        }
        if (!page.blocks.length) grid.append(node('p','Adicione um bloco para montar sua página.','op-empty'));
        sheet.append(grid);
        if (page.blocks.some(b => ['kpi','chart','table'].includes(b.type))) {
            const time = source.version != null ? new Date(source.version) : null;
            const cutoff = time && Number.isFinite(time.getTime())
                ? ' · Corte ' + time.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}) + ' (Brasília)' : '';
            sheet.append(node('footer','Fonte · Dashboard D’Granel' + cutoff,'op-paper-foot'));
        }
        return sheet;
    }

    function schedulePreview() {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            if (!page || owner !== currentSession?.user?.id) return;
            $('opPreview').replaceChildren(paper(true));
            if ($('opPresentation').open) $('opPresentationPage').replaceChildren(paper());
        });
    }

    function clearPrint() {
        printHost?.remove();
        printHost = null;
        document.body.classList.remove('op-printing');
    }

    function preparePrint() {
        clearPrint();
        printHost = node('div',undefined,'op-print-host');
        printHost.id = 'opPrintHost';
        const format = orientations[page.orientation];
        printHost.dataset.orientation = page.orientation;
        printHost.style.setProperty('--op-print-width',format.width + 'px');
        printHost.setAttribute('aria-hidden','true');
        const sheet = paper();
        printHost.append(sheet);
        document.body.append(printHost);
        const scale = Math.min(0.94, format.height / sheet.offsetHeight);
        sheet.style.setProperty('--op-print-scale',String(scale));
        document.body.classList.add('op-printing');
        return printHost;
    }

    function openAI() {
        const available = new Set(source.items.map(item => item.key));
        const currentKeys = new Set(page.blocks.flatMap(b => b.type === 'table' ? b.indicators : [b.indicator]).filter(key => available.has(key)));
        const draft = {
            indicators:currentKeys.size <= aiIndicatorLimit ? [...currentKeys] : [], orientation:page.orientation,
            start:page.start, end:page.end, accent:page.accent, version:source.version, busy:false,
        };
        aiDraft = draft;
        const update = (key,value) => {
            draft[key] = value;
            $('opAiStatus').textContent = '';
            syncAI(draft);
        };
        $('opAiFields').replaceChildren(
            orientationField(draft.orientation,value => update('orientation',value)),
            dateFields(draft,source.months.map(m => [m,competency(m).label]),['Primeira competência','Última competência'],update),
            indicatorPicker(draft,{label:'Indicadores da OnePage',limit:aiIndicatorLimit,update:keys => update('indicators',keys)})
        );
        $('opAiStatus').textContent = '';
        syncAI(draft);
        $('opAiDialog').showModal();
    }

    function syncAI(draft) {
        $('opAiFields').disabled = draft.busy;
        $('opAiGenerate').disabled = draft.busy || !draft.indicators.length || !period({},draft).length;
        $('opAiForm').setAttribute('aria-busy',String(draft.busy));
    }

    async function composeAI(event) {
        event.preventDefault();
        const draft = aiDraft, user = owner;
        if (!draft || draft.busy || $('opAiGenerate').disabled) return;
        const points = period({},draft);
        const chosen = new Set(draft.indicators);
        const selectedItems = source.items.filter(item => chosen.has(item.key));
        if (draft.version !== source.version || selectedItems.length !== chosen.size) {
            $('opAiStatus').textContent = 'Os dados disponíveis mudaram. Feche e reabra a montagem para refazer a seleção.';
            return;
        }
        draft.busy = true;
        syncAI(draft);
        $('opAiStatus').textContent = 'Montando a página com a Groq…';
        try {
            const result = await requestDashboardEdge({
                action:'onepage', orientation:draft.orientation, expectedUpdatedAt:draft.version,
                selection:{type:'executivo', sector:'TODOS', ids:selectedItems.map(item => item.id),
                    start:source.months[points[0].index], end:source.months[points.at(-1).index]},
            });
            if (aiDraft !== draft || owner !== user || currentSession?.user?.id !== user || !$('opAiDialog').open) return;
            if (source.version !== draft.version || result.snapshotUpdatedAt !== draft.version) {
                throw Error('Atualize os dados do Dashboard e abra novamente a montagem com IA.');
            }
            const keys = new Map(selectedItems.map(item => [item.id,item.key]));
            const composition = result.composition;
            if (!composition || typeof composition.title !== 'string' || typeof composition.subtitle !== 'string' ||
                !Array.isArray(composition.blocks) || !composition.blocks.length || composition.blocks.some(b =>
                    !b || !Object.hasOwn(types,b.type) || !Array.isArray(b.indicators) || b.indicators.some(id => !keys.has(id)))) {
                throw Error('A composição retornada é incompatível com os indicadores selecionados.');
            }
            const blocks = composition.blocks.map(b => {
                const refs = b.indicators.map(id => keys.get(id));
                const isNote = b.type === 'text' || b.type === 'note';
                return {...newBlock(b.type),width:b.width,title:b.title,text:isNote?b.text:'',
                    note:isNote?'':b.text,indicator:b.type==='table'?'':refs[0]??'',indicators:b.type==='table'?refs:[],
                    chart:b.chart,tone:b.tone,target:b.target,comparison:b.comparison,labels:b.labels};
            });
            $('opAiDialog').close();
            selectPage({...newPage(),title:composition.title,subtitle:composition.subtitle,orientation:draft.orientation,
                accent:draft.accent,start:draft.start,end:draft.end,blocks});
            persist();
            $('opPages').focus();
            window.DGranelPresentation?.toast('OnePage criada com IA','Revise os blocos no editor antes de apresentar.');
        } catch (error) {
            if (aiDraft === draft && $('opAiDialog').open) $('opAiStatus').textContent = error.message;
        } finally {
            if (aiDraft === draft) {
                draft.busy = false;
                syncAI(draft);
            }
        }
    }

    function refresh() {
        if (!$('view-onepage') || $('view-onepage').classList.contains('hidden')) return;
        const user = currentSession?.user?.id;
        if (!user) return;
        source = readSource();
        if (owner !== user) {
            owner = user;
            pages = new Map();
            storageError = false;
            loadPages();
            selected = page.blocks[0]?.id;
        }
        renderEditor();
        schedulePreview();
    }

    function reset() {
        owner = page = selected = deleteId = aiDraft = null;
        source = blankSource;
        pages.clear();
        cancelAnimationFrame(frame);
        clearPrint();
        if ($('opPresentation')?.open) $('opPresentation').close();
        if ($('opConfirmDelete')?.open) $('opConfirmDelete').close();
        if ($('opAiDialog')?.open) $('opAiDialog').close();
        for (const id of ['opPages','opSettings','opBlocks','opInspector','opPreview','opPresentationPage','opStatus','opAiFields','opAiStatus']) $(id)?.replaceChildren();
    }

    window.OnePage = {refresh,reset};
    document.addEventListener('DOMContentLoaded',() => {
        for (const [id,label] of Object.entries(types)) $('opAdd').append(button('+ ' + label,() => addBlock(id)));
        $('opPages').onchange = event => {const next = pages.get(event.target.value);if (next) selectPage(next);};
        $('opNew').onclick = () => {selectPage(newPage());persist();renderEditor();$('opSettings').querySelector('input').focus();};
        $('opDuplicate').onclick = () => {
            const copy = {...structuredClone(page),id:crypto.randomUUID(),title:title(page).slice(0,110) + ' (cópia)'};
            selectPage(copy);persist();renderEditor();
        };
        $('opDelete').onclick = () => {
            deleteId = page.id;
            $('opDeleteName').textContent = title(page);
            $('opConfirmDelete').returnValue = 'cancel';
            $('opConfirmDelete').showModal();
        };
        $('opConfirmDelete').addEventListener('close',() => {
            if ($('opConfirmDelete').returnValue !== 'delete' || !deleteId || !pages.has(deleteId)) return;
            try {
                localStorage.removeItem(storagePrefix() + deleteId);
                storageError = false;
            } catch {
                storageError = true;
                updateStatus();
                return;
            }
            pages.delete(deleteId);
            deleteId = null;
            selectPage(pages.values().next().value ?? newPage());
            $('opPages').focus();
        });
        $('opPresent').onclick = () => {
            $('opPresentationPage').replaceChildren(paper());
            $('opPresentation').showModal();
        };
        $('opClose').onclick = () => $('opPresentation').close();
        $('opPresentation').addEventListener('close',() => $('opPresentationPage').replaceChildren());
        $('opAiOpen').onclick = openAI;
        $('opAiCancel').onclick = () => $('opAiDialog').close();
        $('opAiForm').onsubmit = composeAI;
        $('opAiDialog').addEventListener('close',() => {
            if ($('opAiDialog').open) return;
            aiDraft = null;
            $('opAiFields').replaceChildren();
            $('opAiStatus').textContent = '';
        });
        $('opPrint').onclick = async () => {
            const host = preparePrint(), user = owner;
            const ready = Promise.allSettled([...host.querySelectorAll('img')].map(image => image.decode()));
            let deadline;
            await Promise.race([ready,new Promise(resolve => {deadline = setTimeout(resolve,180);})]);
            clearTimeout(deadline);
            if (host === printHost && user === currentSession?.user?.id) window.print();
        };
        addEventListener('afterprint',clearPrint);
    });
})();
