// DADOS PADRÃO (INICIALIZAÇÃO)
const initialData = [{"setor": "Controle de Sinistro", "indicador": "ACIDENTE POR (MILHAO) DE KM RODADO - Mensal", "meta": 0.0, "und": "%", "valores": [3.5, 4.43, 4.17, 5.51, 3.58, 4.09, null]}, {"setor": "Controlde de Sinistro", "indicador": "Acidentes com culpa - Mensal", "meta": 0.0, "und": "Qtd", "valores": [11.0, 12.0, 8.0, 17.0, 21.0, 13.0, 16.0]}, {"setor": "Controle de Sinistro", "indicador": "Número de acidentes com lesões - veículos proprios - Mensal", "meta": 0.0, "und": "Qtd", "valores": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]}, {"setor": "Controle de Sinistro", "indicador": "Número de acidentes com lesões envolvendo Terceiros - Mensal", "meta": 0.0, "und": "Qtd", "valores": [0.0, 0.0, 1.0, 0.0, 2.0, 0.0, 1.0]}, {"setor": "Controle de Sinistro", "indicador": "Numero de mortes - proprios - Mensal", "meta": 0.0, "und": "Qtd", "valores": [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0]}, {"setor": "Controle de Sinistro", "indicador": "Número de mortes -Terceiros - Mensal", "meta": 0.0, "und": "Qtd", "valores": [0.0, 0.0, 0.0, 1.0, 2.0, 0.0, 1.0]}, {"setor": "Controle de Sinistro", "indicador": "Total de acidentes - Mensal", "meta": 40.0, "und": "Qtd", "valores": [26.0, 33.0, 38.0, 49.0, 32.0, 38.0, 43.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "VEÍCULOS ATIVOS (semirreboques)", "meta": 2500.0, "und": "Qtd", "valores": [2015.0, 1972.0, 1968.0, 1959.0, 1947.0, 1947.0, 1932.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "VEÍCULOS ATIVOS (cavalo mecânico)", "meta": 1300.0, "und": "Qtd", "valores": [1234.0, 1208.0, 1223.0, 1231.0, 1221.0, 1204.0, 1190.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "Cronotacógrafo - Mensal", "meta": 100.0, "und": "%", "valores": [62.25, 64.29, 64.37, 97.44, 98.61, 98.51, 98.43]}, {"setor": "Controle de Veículos / Documentação", "indicador": "Veículos emplacados - Mensal", "meta": 0.0, "und": "Qtd", "valores": [68.0, 36.0, 36.0, 31.0, 31.0, 23.0, 11.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "Veículos Vendidos", "meta": 0.0, "und": "Qtd", "valores": [27.0, 24.0, 35.0, 35.0, 23.0, 45.0, 49.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "% CRLV LIBERADOS - Mensal", "meta": 100.0, "und": "%", "valores": [5.13, 79.45, 91.9, 96.51, 97.3, 99.18, 99.59]}, {"setor": "Controle de Penalidade/Autuações", "indicador": "Redução quantidade de multas por frota - Mensal", "meta": 0.35, "und": "%", "valores": [0.59, 0.46, 0.5, 0.58, 0.35, 0.55, null]}, {"setor": "Controle de Penalidade", "indicador": "% de multas pagas com 20% de desconto - Mensal", "meta": 20.0, "und": "%", "valores": [20.0, 18.0, 15.0, 23.0, 16.0, 10.67, 12.08]}, {"setor": "Controle de Penalidade", "indicador": "% de multas pagas com 40% de desconto - Mensal", "meta": 10.0, "und": "%", "valores": [42.0, 39.0, 56.0, 38.0, 55.0, 48.71, 47.35]}, {"setor": "Controle de Penalidade", "indicador": "Multas Cobradas Motoristas - Mensal", "meta": 50000.0, "und": "Qtd", "valores": [159.0, 161.0, 188.0, 99.0, 185.0, 245.0, 297.0]}, {"setor": "Controle de Penalidade", "indicador": "Multas Mapeadas Mês - Mensal", "meta": 0.0, "und": "Qtd", "valores": [595.0, 528.0, 651.0, 924.0, 407.0, 644.0, 478.0]}, {"setor": "Controle de Penalidade", "indicador": "Multas Pagas Mês - Mensal", "meta": 0.0, "und": "Qtd", "valores": [843.0, 707.0, 602.0, 556.0, 854.0, 1199.0, 1134.0]}, {"setor": "Controle de de Autuações", "indicador": "Defesas administrativas", "meta": 50000.0, "und": "Qtd", "valores": [3.0, 16.0, 6.0, 2.0, 29.0, 35.0, 13.0]}, {"setor": "Controle de de Autuações", "indicador": "Autuações tratadas", "meta": 50000.0, "und": "Qtd", "valores": [267.0, 100.0, 229.0, 278.0, 262.0, 278.0, 246.0]}, {"setor": "Controle de de Autuações", "indicador": "Responsabilidade da empresa", "meta": 50000.0, "und": "Qtd", "valores": [96.0, 28.0, 70.0, 30.0, 30.0, 37.0, 13.0]}, {"setor": "Controle de de Autuações", "indicador": "Já identificado pelo agente", "meta": 50000.0, "und": "Qtd", "valores": [17.0, 4.0, 5.0, 14.0, 6.0, 12.0, 16.0]}, {"setor": "Controle de de Autuações", "indicador": "Identificar (solicitou ser identificado, mas não possui termo)", "meta": 50000.0, "und": "Qtd", "valores": [27.0, 36.0, 46.0, 40.0, 42.0, 39.0, 32.0]}, {"setor": "Controle de de Autuações", "indicador": "PRF", "meta": 50000.0, "und": "Qtd", "valores": [42.0, 12.0, 47.0, 65.0, 84.0, 93.0, 72.0]}, {"setor": "Controle de de Autuações", "indicador": "Identificado", "meta": 50000.0, "und": "Qtd", "valores": [27.0, 36.0, 46.0, 40.0, 42.0, 43.0, 49.0]}, {"setor": "Controle de de Autuações", "indicador": "Agregados Identificados", "meta": 50000.0, "und": "Qtd", "valores": [1.0, null, 1.0, 2.0, 8.0, 3.0, 6.0]}, {"setor": "Controle de de Autuações", "indicador": "Agregados não Identificado", "meta": 50000.0, "und": "Qtd", "valores": [null, null, 15.0, 7.0, 14.0, 2.0, 8.0]}, {"setor": "Controle de de Autuações", "indicador": "Não Identificado frota", "meta": 50000.0, "und": "Qtd", "valores": [33.0, 3.0, 13.0, 47.0, 22.0, 32.0, 28.0]}, {"setor": "Controle de de Autuações", "indicador": "Não Identificado 24h", "meta": 50000.0, "und": "Qtd", "valores": [12.0, 1.0, 11.0, 19.0, 14.0, 17.0, 22.0]}, {"setor": "Controle de de Autuações", "indicador": "Defesas ANTT", "meta": 50000.0, "und": "Qtd", "valores": [null, null, null, null, 28.0, 29.0, null]}, {"setor": "Controle de SCORE do motorista", "indicador": "SCORE - Mensal", "meta": 600.0, "und": "Qtd", "valores": [249.0, 318.0, 405.0, 460.0, 497.0, 589.0, null]}, {"setor": "Controle de Velocidade", "indicador": "Numero de motoristas com ocorrencias acima da velocidade permitida - Mensal", "meta": 0.0, "und": "Qtd", "valores": [542.0, 580.0, 673.0, 640.0, 584.0, 597.0, 540.0]}];

const SUPABASE_URL = 'https://hlasqurthnnhmszojrce.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_w6wowhTeTPXuDiZTgSjCgA_pw_5UuQO';
const SUPABASE_STATE_ENDPOINT = `${SUPABASE_URL}/rest/v1/dashboard_state`;
const SUPABASE_AI_FUNCTION_ENDPOINT = `${SUPABASE_URL}/functions/v1/seguranca-viaria-ia`;
const DEFAULT_LOGO_SRC = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1dNCR2-JnxH8MXB-2umhVPO385SbK0cg5Yy1-nk7tmg&s=10.png';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const BASE_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
let mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];

let currentData = [];
let sectors = [];
let customCharts = [];
let kpiCards = [];
let defaultChartConfigs = {};
let editingDefaultChartId = null;
let chart1Inst = null, chart2Inst = null, chart3Inst = null, chart4Inst = null, modalChartInst = null;
let dynamicChartInstances = {};
let showDataLabels = false;
let selectedDashboardMonths = null;
let currentTheme = 'dark';
let customLogoSrc = null;
let lastSupabaseSavedAt = null;
let supabaseReady = false;
let supabaseStateLoaded = false;
let developerModeClickCount = 0;
let developerModeClickTimer = null;
let detailModalIndex = null;
let dashboards = [];
let activeDashboardId = null;
let currentSession = null;
let appInitialized = false;
let initialHomeOpened = false;
let hasUnsavedChanges = false;
let isSavingState = false;
let stateRevision = 0;
let supabaseSaveQueue = Promise.resolve();
let intelligenceRenderRevision = 0;
let intelligenceVisibleLimit = 24;
let revealObserver = null;
const observedRevealElements = new WeakSet();

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const renderTableDebounced = debounce(renderTable, 300);

Chart.register(ChartDataLabels);
Chart.defaults.animation = false;
Chart.defaults.plugins.datalabels = {
    display: ctx => showDataLabels && ctx.dataset.data[ctx.dataIndex] != null,
    color: () => document.body.classList.contains('light-theme') ? '#111827' : '#f8fafc',
    anchor: 'end',
    align: 'bottom',
    clamp: true,
    font: { size: 10, weight: 'bold' },
    formatter: (value, context) => {
        const dataset = context?.dataset || {};
        return formatChartValue(value, resolveChartUnit(dataset));
    }
};

const CHART_ZOOM_MIN = 0.25;
const CHART_ZOOM_MAX = 4;
const CHART_ZOOM_STEP = 0.25;
const chartZoomState = {};

function chartPxPerLabel(chart) {
    const datasets = chart.data.datasets || [];
    const hasBars = datasets.some(dataset => (dataset.type || chart.config.type) === 'bar');
    return hasBars ? 50 + datasets.length * 80 : 130;
}

function applyChartScrollWidth(chart, doResize = true) {
    const inner = chart.canvas.closest('.chart-scroll-inner');
    if (!inner) return;
    const scroller = inner.parentElement;
    const zoom = chartZoomState[chart.canvas.id] || 1;
    const labels = (chart.data.labels || []).length || 1;
    inner.style.width = `${Math.max(scroller.clientWidth, labels * chartPxPerLabel(chart) * zoom)}px`;
    if (doResize) chart.resize();
}

function wrapCanvasForScroll(canvas) {
    if (canvas.closest('.chart-scroll-inner')) return;
    const box = document.createElement('div');
    box.className = 'chart-scroll-box';
    box.innerHTML = `
        <div class="chart-zoom-bar">
            <span class="chart-zoom-hint">Ctrl + roda do mouse = zoom</span>
            <button type="button" data-z="out" title="Diminuir zoom" aria-label="Diminuir zoom">−</button>
            <span class="chart-zoom-label">100%</span>
            <button type="button" data-z="in" title="Aumentar zoom" aria-label="Aumentar zoom">+</button>
            <button type="button" data-z="reset" title="Ajustar à tela" aria-label="Ajustar à tela">↺</button>
        </div>
        <div class="chart-scroller"><div class="chart-scroll-inner"></div></div>`;
    canvas.parentElement.insertBefore(box, canvas);
    const inner = box.querySelector('.chart-scroll-inner');
    const scroller = box.querySelector('.chart-scroller');
    const label = box.querySelector('.chart-zoom-label');
    inner.appendChild(canvas);

    const setZoom = (value, reset = false) => {
        const zoom = Math.min(CHART_ZOOM_MAX, Math.max(CHART_ZOOM_MIN, value));
        const centerRatio = (scroller.scrollLeft + scroller.clientWidth / 2) / (inner.scrollWidth || 1);
        chartZoomState[canvas.id] = zoom;
        markStateDirty();
        label.textContent = `${Math.round(zoom * 100)}%`;
        const chart = Chart.getChart(canvas);
        if (chart) applyChartScrollWidth(chart);
        scroller.scrollLeft = reset ? 0 : centerRatio * inner.scrollWidth - scroller.clientWidth / 2;
    };

    label.textContent = `${Math.round((chartZoomState[canvas.id] || 1) * 100)}%`;
    box.querySelector('[data-z="in"]').onclick = () => setZoom((chartZoomState[canvas.id] || 1) + CHART_ZOOM_STEP);
    box.querySelector('[data-z="out"]').onclick = () => setZoom((chartZoomState[canvas.id] || 1) - CHART_ZOOM_STEP);
    box.querySelector('[data-z="reset"]').onclick = () => setZoom(1, true);
    scroller.addEventListener('wheel', event => {
        if (!event.ctrlKey) return;
        event.preventDefault();
        setZoom((chartZoomState[canvas.id] || 1) + (event.deltaY < 0 ? CHART_ZOOM_STEP : -CHART_ZOOM_STEP));
    }, { passive: false });
}

Chart.register({
    id: 'scrollZoomWrapper',
    beforeInit(chart) {
        const type = chart.config.type;
        const id = chart.canvas.id || '';
        if (['radar', 'doughnut', 'pie', 'polarArea'].includes(type)) return;
        if (!/^(chart[1-4]|canvas_.+)$/.test(id)) return;
        wrapCanvasForScroll(chart.canvas);
    },
    afterInit(chart) {
        if (!chart.canvas.closest('.chart-scroll-inner')) return;
        applyChartScrollWidth(chart, false);
        const label = chart.canvas.closest('.chart-scroll-box')?.querySelector('.chart-zoom-label');
        if (label) label.textContent = `${Math.round((chartZoomState[chart.canvas.id] || 1) * 100)}%`;
    }
});

// CARREGAMENTO INICIAL
document.addEventListener('DOMContentLoaded', async () => {
    setAiProvider(currentAiProvider);
    setupRevealObserver();
    initSmartNavbar();
    applyTheme('dark');
    updateLastSaveStatus();
    setInterval(updateLastSaveStatus, 60 * 1000);
    updateDeveloperModeLockIcon();
    setupAuthForm();
    document.getElementById('saveStateButton').addEventListener('click', saveCurrentState);
    document.getElementById('dashboardMonthOptions')?.addEventListener('change', event => {
        if (event.target.type !== 'checkbox') return;
        const availableMonths = getDashboardMonthLabels();
        const checkedMonths = [...document.querySelectorAll('#dashboardMonthOptions input:checked')]
            .map(input => input.value);
        selectedDashboardMonths = checkedMonths.length === availableMonths.length ? null : checkedMonths;
        updateDashboardMonthSummary(availableMonths);
        renderCharts();
        renderDynamicCharts();
        renderIntelligenceDashboard();
    });
    document.getElementById('selectAllDashboardMonths')?.addEventListener('click', () => {
        selectedDashboardMonths = null;
        renderDashboardMonthFilter();
        renderCharts();
        renderDynamicCharts();
        renderIntelligenceDashboard();
    });
    document.getElementById('clearDashboardMonths')?.addEventListener('click', () => {
        selectedDashboardMonths = [];
        renderDashboardMonthFilter();
        renderCharts();
        renderDynamicCharts();
        renderIntelligenceDashboard();
    });
    ['intelligenceSectorFilter', 'intelligenceIndicatorFilter', 'intelligencePeriodFilter', 'intelligenceSeverityFilter', 'intelligenceCategoryFilter']
        .forEach(id => document.getElementById(id)?.addEventListener('change', () => {
            intelligenceVisibleLimit = 24;
            if (id === 'intelligenceSectorFilter') {
                const indicatorFilter = document.getElementById('intelligenceIndicatorFilter');
                if (indicatorFilter) indicatorFilter.value = 'TODOS';
            }
            renderIntelligenceDashboard();
        }));
    document.getElementById('intelligenceLoadMore')?.addEventListener('click', () => {
        intelligenceVisibleLimit += 24;
        renderIntelligenceDashboard();
    });
    ['governanceSearch', 'governanceSectorFilter', 'governanceDirectionFilter'].forEach(id => {
        const element = document.getElementById(id);
        element?.addEventListener(id === 'governanceSearch' ? 'input' : 'change', renderGovernanceDashboard);
    });

    const { data } = await supabaseClient.auth.getSession();
    await handleAuthSession(data.session);

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        handleAuthSession(session);
    });
});

function initSmartNavbar() {
    const header = document.querySelector('header');
    if (!header) return;

    const lastScrollBySource = new Map([[window, window.scrollY]]);
    const scrollAnchorBySource = new Map([[window, window.scrollY]]);
    const scrollDirectionBySource = new Map();
    const pendingScrollBySource = new Map();
    let scrollUpdatePending = false;
    const scrollThresholdDown = 10;
    const scrollThresholdUp = 600;

    const processScroll = (source, currentScrollY) => {
        const activeElement = document.activeElement;
        const activeInput = activeElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement.tagName);
        if (header.matches(':hover') || (activeInput && header.contains(activeElement))) {
            header.classList.remove('nav-hidden');
            lastScrollBySource.set(source, currentScrollY);
            scrollAnchorBySource.set(source, currentScrollY);
            scrollDirectionBySource.delete(source);
            return;
        }

        const lastScrollY = lastScrollBySource.get(source) ?? 0;
        if (currentScrollY <= 30) {
            header.classList.remove('nav-hidden');
            scrollAnchorBySource.set(source, currentScrollY);
            scrollDirectionBySource.delete(source);
        } else if (currentScrollY !== lastScrollY) {
            const direction = currentScrollY > lastScrollY ? 'down' : 'up';
            if (scrollDirectionBySource.get(source) !== direction) {
                scrollDirectionBySource.set(source, direction);
                scrollAnchorBySource.set(source, lastScrollY);
            }

            const scrollAnchor = scrollAnchorBySource.get(source) ?? lastScrollY;
            if (direction === 'down' && currentScrollY >= scrollAnchor + scrollThresholdDown) {
                header.classList.add('nav-hidden');
            } else if (direction === 'up' && currentScrollY <= scrollAnchor - scrollThresholdUp) {
                header.classList.remove('nav-hidden');
            }
        }
        lastScrollBySource.set(source, currentScrollY);
    };

    const queueScrollUpdate = (source, currentScrollY) => {
        pendingScrollBySource.set(source, currentScrollY);
        if (scrollUpdatePending) return;
        scrollUpdatePending = true;
        window.requestAnimationFrame(() => {
            pendingScrollBySource.forEach((position, source) => processScroll(source, position));
            pendingScrollBySource.clear();
            scrollUpdatePending = false;
        });
    };

    window.addEventListener('scroll', () => {
        queueScrollUpdate(window, window.scrollY);
    }, { passive: true });
    document.addEventListener('scroll', event => {
        if (event.target === document) return;
        const container = event.target;
        if (typeof container?.scrollTop === 'number') {
            queueScrollUpdate(container, container.scrollTop);
        }
    }, { passive: true, capture: true });

    window.addEventListener('mousemove', event => {
        if (event.clientY <= 20 && header.classList.contains('nav-hidden')) {
            header.classList.remove('nav-hidden');
        }
    }, { passive: true });

    header.addEventListener('focusin', () => header.classList.remove('nav-hidden'));
    header.addEventListener('focusout', () => {
        if (!header.matches(':focus-within')) return;
        header.classList.remove('nav-hidden');
    });

    window.resetSmartNavbar = () => {
        header.classList.remove('nav-hidden');
        lastScrollBySource.forEach((_position, source) => {
            const currentPosition = source === window ? window.scrollY : source.scrollTop || 0;
            lastScrollBySource.set(source, currentPosition);
            scrollAnchorBySource.set(source, currentPosition);
            scrollDirectionBySource.delete(source);
        });
    };
}

function resetNavbarOnTabChange() {
    window.resetSmartNavbar?.();
    document.querySelector('header')?.classList.remove('nav-hidden');
}

function setupRevealObserver() {
    if (revealObserver || !('IntersectionObserver' in window)) return;

    revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            element.classList.remove('reveal-pending');
            element.classList.add('reveal-visible');
            revealObserver.unobserve(element);
            element.addEventListener('transitionend', event => {
                if (event.propertyName === 'opacity') element.style.transitionDelay = '';
            }, { once: true });
            element.querySelectorAll('[data-count-to]').forEach(animateKpiCount);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
}

function initPXStyleAnimations(root = document) {
    setupRevealObserver();
    const elements = [
        ...(root.matches?.('.glass-card, .kpi-card') ? [root] : []),
        ...root.querySelectorAll('.glass-card, .kpi-card')
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    elements.forEach((element, index) => {
        if (observedRevealElements.has(element)) return;
        observedRevealElements.add(element);

        if (reduceMotion || !revealObserver) {
            element.classList.add('reveal-visible');
            element.querySelectorAll('[data-count-to]').forEach(animateKpiCount);
            return;
        }

        element.classList.add('reveal-pending');
        element.style.transitionDelay = `${Math.min(index * 55, 330)}ms`;
        revealObserver.observe(element);
    });
}

function animateKpiCount(element) {
    const target = Number(element.dataset.countTo);
    if (!Number.isFinite(target)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.textContent = `${target.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${element.dataset.countUnit || ''}`;
        return;
    }

    const startedAt = performance.now();
    const duration = 850;
    const step = timestamp => {
        const progress = Math.min((timestamp - startedAt) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const value = target * easedProgress;
        element.textContent = `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${element.dataset.countUnit || ''}`;
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function setupAuthForm() {
    document.getElementById('authForm')?.addEventListener('submit', event => {
        event.preventDefault();
        signInUser();
    });
    document.getElementById('signupButton')?.addEventListener('click', signUpUser);
}

function showAuthMessage(text, isError = true) {
    const message = document.getElementById('authMessage');
    if (!message) return;
    message.textContent = text;
    message.className = `min-h-5 text-xs ${isError ? 'text-rose-400' : 'text-emerald-400'}`;
}

function updateLastSaveStatus(timestamp = lastSupabaseSavedAt) {
    const tag = document.getElementById('lastSavedTag');
    if (!tag) return;

    const savedAt = new Date(timestamp);
    if (!Number.isFinite(timestamp) || Number.isNaN(savedAt.getTime())) {
        tag.textContent = 'Ainda não sincronizado';
        return;
    }

    const elapsedMinutes = Math.floor(Math.max(0, Date.now() - savedAt.getTime()) / 60000);
    const elapsedLabel = elapsedMinutes === 0
        ? 'Agora'
        : elapsedMinutes < 60
            ? `há ${elapsedMinutes} min`
            : elapsedMinutes < 1440
                ? `há ${Math.floor(elapsedMinutes / 60)} h`
                : `há ${Math.floor(elapsedMinutes / 1440)} d`;
    const time = savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    tag.textContent = `${elapsedLabel} · ${time}`;
}

function getAuthCredentials() {
    const email = document.getElementById('authEmail').value.trim().toLowerCase();
    const password = document.getElementById('authPassword').value;

    if (!email.endsWith('@dgranel.com.br')) throw new Error('DOMAIN_NOT_ALLOWED');
    if (password.length < 8) throw new Error('PASSWORD_TOO_SHORT');
    return { email, password };
}

async function signInUser() {
    try {
        const { email, password } = getAuthCredentials();
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showAuthMessage('Login realizado com sucesso.', false);
    } catch (error) {
        showAuthMessage(error.message === 'DOMAIN_NOT_ALLOWED'
            ? 'Use um e-mail corporativo @dgranel.com.br.'
            : error.message === 'PASSWORD_TOO_SHORT'
                ? 'A senha deve possuir pelo menos 8 caracteres.'
                : 'Não foi possível realizar o login.');
    }
}

async function signUpUser() {
    try {
        const { email, password } = getAuthCredentials();
        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        showAuthMessage('Cadastro realizado. Verifique seu e-mail para confirmar a conta.', false);
    } catch (error) {
        showAuthMessage(error.message === 'DOMAIN_NOT_ALLOWED' || error.message?.includes('dgranel.com.br')
            ? 'Apenas e-mails @dgranel.com.br podem criar contas.'
            : 'Não foi possível criar a conta.');
    }
}

async function signOutUser() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error('Erro ao encerrar sessão:', error);
}

async function handleAuthSession(session) {
    currentSession = session;
    document.body.classList.toggle('authenticated', Boolean(session));

    if (!session) {
        window.resetManagementReport?.();
        appInitialized = false;
        supabaseStateLoaded = false;
        supabaseReady = false;
        currentData = [];
        Object.keys(chartZoomState).forEach(key => delete chartZoomState[key]);
        return;
    }

    if (appInitialized) return;
    appInitialized = true;
    currentData = [];
    hasUnsavedChanges = false;
    sectors = [];
    customCharts = [];
    kpiCards = [];
    defaultChartConfigs = {};
    dashboards = [{ id: 'dashboard_main', name: 'Geral', widgets: getDefaultDashboardWidgets() }];
    activeDashboardId = dashboards[0].id;
    showDataLabels = false;
    currentTheme = 'dark';
    customLogoSrc = null;
    applyTheme(currentTheme);
    setupDragAndDrop();
    await carregarDadosCompartilhados();
    updateSaveButton();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function fireThemedAlert(options) {
    const isLight = document.body.classList.contains('light-theme');
    return Swal.fire({
        ...options,
        background: isLight ? '#ffffff' : '#111C38',
        color: isLight ? '#1e293b' : '#f8fafc'
    });
}

function showAlert(title, text, icon = 'info') {
    return fireThemedAlert({
        title,
        text,
        icon,
        confirmButtonColor: '#EAB308'
    });
}

function downloadChart(chartCanvasId, fileName) {
    const canvas = document.getElementById(chartCanvasId);
    if (!canvas) return;

    const safeFileName = String(fileName || 'grafico').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
    const card = canvas.closest('.glass-card') || canvas.closest('article') || canvas.parentElement;
    const titleText = card?.querySelector('h3, h4')?.textContent.trim() || '';
    const descText = card?.querySelector('p')?.textContent.trim() || '';
    const hasHeader = Boolean(titleText);
    const scale = canvas.width / (canvas.clientWidth || canvas.width || 1);
    const padding = Math.round(20 * scale);
    const titleFontSize = Math.max(1, Math.round(16 * scale));
    const descFontSize = Math.max(1, Math.round(12 * scale));
    const titleLineHeight = Math.round(20 * scale);
    const descLineHeight = Math.round(16 * scale);
    const titleX = padding + Math.round(14 * scale);
    const maxTextWidth = Math.max(1, canvas.width - titleX - padding);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    const context = tempCanvas.getContext('2d');
    if (!context) return;

    const wrapText = (text, font) => {
        if (!text) return [];
        context.font = font;
        const lines = [];
        let line = '';
        text.split(/\s+/).forEach(word => {
            const candidate = line ? `${line} ${word}` : word;
            if (line && context.measureText(candidate).width > maxTextWidth) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        });
        if (line) lines.push(line);
        return lines;
    };

    const titleFont = `bold ${titleFontSize}px Inter, sans-serif`;
    const descFont = `${descFontSize}px Inter, sans-serif`;
    const titleLines = hasHeader ? wrapText(titleText, titleFont) : [];
    const descLines = descText ? wrapText(descText, descFont) : [];
    const headerPaddingTop = Math.round(14 * scale);
    const headerPaddingBottom = Math.round(14 * scale);
    const descGap = descLines.length ? Math.round(4 * scale) : 0;
    const headerHeight = hasHeader
        ? headerPaddingTop + titleLines.length * titleLineHeight + descGap + descLines.length * descLineHeight + headerPaddingBottom
        : 0;
    tempCanvas.height = canvas.height + headerHeight;

    const isLight = document.body.classList.contains('light-theme');
    context.fillStyle = isLight ? '#ffffff' : '#070D1E';
    context.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    if (hasHeader) {
        const dotRadius = Math.max(1, Math.round(5 * scale));
        const firstTitleBaseline = headerPaddingTop + titleFontSize;
        context.beginPath();
        context.arc(padding, firstTitleBaseline - Math.round(5 * scale), dotRadius, 0, 2 * Math.PI);
        context.fillStyle = '#f59e0b';
        context.fill();

        context.font = titleFont;
        context.fillStyle = isLight ? '#172033' : '#ffffff';
        context.textBaseline = 'alphabetic';
        titleLines.forEach((line, index) => {
            context.fillText(line, titleX, firstTitleBaseline + index * titleLineHeight, maxTextWidth);
        });

        if (descLines.length) {
            context.font = descFont;
            context.fillStyle = isLight ? '#64748b' : '#94a3b8';
            const descStartY = firstTitleBaseline + titleLines.length * titleLineHeight + descGap;
            descLines.forEach((line, index) => {
                context.fillText(line, padding, descStartY + index * descLineHeight, maxTextWidth);
            });
        }
    }

    context.drawImage(canvas, 0, headerHeight);

    const link = document.createElement('a');
    link.download = `${safeFileName}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    link.remove();

    fireThemedAlert({
        title: 'Download Concluído!',
        text: 'O gráfico foi salvo com cabeçalho, título e tema atual.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;

    button.classList.remove('icon-click-feedback');
    void button.offsetWidth;
    button.classList.add('icon-click-feedback');
    button.addEventListener('animationend', () => {
        button.classList.remove('icon-click-feedback');
    }, { once: true });
});

function applyTheme(theme) {
    const isLight = theme === 'light';
    currentTheme = isLight ? 'light' : 'dark';
    document.body.classList.toggle('light-theme', isLight);
    const button = document.getElementById('themeToggleBtn');
    if (!button) return;

    button.title = isLight ? 'Ativar tema escuro' : 'Ativar tema claro';
    button.setAttribute('aria-label', button.title);
    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
        icon.className = isLight
            ? 'fa-solid fa-moon w-4 text-sky-400'
            : 'fa-solid fa-sun w-4 text-amber-400';
    }
}

function getDefaultDashboardWidgets() {
    return [];
}

function loadStoredDashboards() {
    dashboards = [{ id: 'dashboard_main', name: 'Geral', widgets: getDefaultDashboardWidgets() }];

    dashboards = dashboards.map((dashboard, index) => ({
        id: dashboard.id || `dashboard_${index + 1}`,
        name: dashboard.name || `Dashboard ${index + 1}`,
        widgets: Array.isArray(dashboard.widgets) ? dashboard.widgets : []
    }));
    activeDashboardId = dashboards[0].id;
    if (!dashboards.some(dashboard => dashboard.id === activeDashboardId)) activeDashboardId = dashboards[0].id;

    const defaultDashboard = dashboards[0];
    customCharts.forEach(chart => {
        if (!defaultDashboard.widgets.some(widget => widget.type === 'custom-chart' && widget.ref === chart.id)) {
            defaultDashboard.widgets.push({ id: `widget_${chart.id}`, type: 'custom-chart', ref: chart.id });
        }
    });
    saveDashboards();
}

function saveDashboards() {
    markStateDirty();
}

function getActiveDashboard() {
    return dashboards.find(dashboard => dashboard.id === activeDashboardId) || dashboards[0];
}

function dashboardHasWidget(type, ref) {
    return Boolean(getActiveDashboard()?.widgets?.some(widget => widget.type === type && widget.ref === ref));
}

function renderDashboardTabs() {
    const container = document.getElementById('dashboardTabs');
    const activeDashboard = getActiveDashboard();
    if (!container || !activeDashboard) return;

    activeDashboardId = activeDashboard.id;
    container.replaceChildren();
    dashboards.forEach(dashboard => {
        const button = document.createElement('button');
        button.className = `dashboard-tab ${dashboard.id === activeDashboardId ? 'active' : ''} shrink-0 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 text-slate-300 transition`;
        button.addEventListener('click', () => selectDashboard(dashboard.id));

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-table-columns';
        const name = document.createElement('span');
        name.textContent = dashboard.name;
        button.append(icon, name);

        const rename = document.createElement('i');
        rename.className = 'fa-solid fa-pen text-[10px] opacity-70 hover:opacity-100';
        rename.title = 'Renomear dashboard';
        rename.addEventListener('click', event => {
            event.stopPropagation();
            renameDashboard(dashboard.id);
        });
        button.appendChild(rename);

        if (dashboards.length > 1) {
            const remove = document.createElement('i');
            remove.className = 'fa-solid fa-xmark text-[10px] opacity-70 hover:text-rose-400';
            remove.title = 'Excluir dashboard';
            remove.addEventListener('click', event => {
                event.stopPropagation();
                deleteDashboard(dashboard.id);
            });
            button.appendChild(remove);
        }

        container.appendChild(button);
    });
}

function selectDashboard(id) {
    if (!dashboards.some(dashboard => dashboard.id === id)) return;
    const previousIndex = dashboards.findIndex(dashboard => dashboard.id === activeDashboardId);
    const nextIndex = dashboards.findIndex(dashboard => dashboard.id === id);
    const direction = nextIndex >= previousIndex ? 'next' : 'previous';
    activeDashboardId = id;
    saveDashboards();
    renderDashboardTabs();
    renderKPIs();
    renderCharts();
    renderDynamicCharts();
    animateDashboardTransition(direction);
}

function animateDashboardTransition(direction) {
    const dashboardView = document.getElementById('view-dashboard');
    if (!dashboardView) return;
    dashboardView.classList.remove('dashboard-slide-next', 'dashboard-slide-previous');
    void dashboardView.offsetWidth;
    dashboardView.classList.add(direction === 'previous' ? 'dashboard-slide-previous' : 'dashboard-slide-next');
}

function createDashboard() {
    const name = prompt('Nome do novo dashboard:', `Dashboard ${dashboards.length + 1}`)?.trim();
    if (!name) return;

    const dashboard = { id: `dashboard_${Date.now()}`, name, widgets: [] };
    dashboards.push(dashboard);
    activeDashboardId = dashboard.id;
    saveDashboards();
    renderDashboardTabs();
    renderKPIs();
    renderCharts();
    renderDynamicCharts();
    animateDashboardTransition('next');
}

function renameDashboard(id) {
    const dashboard = dashboards.find(item => item.id === id);
    if (!dashboard) return;
    const name = prompt('Novo nome do dashboard:', dashboard.name)?.trim();
    if (!name) return;

    dashboard.name = name;
    saveDashboards();
    renderDashboardTabs();
}

function deleteDashboard(id) {
    if (dashboards.length === 1) return;

    fireThemedAlert({
        title: 'Excluir Dashboard?',
        text: 'Este dashboard e seus widgets serão removidos. Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        cancelButtonColor: '#1e293b',
        confirmButtonText: '<i class="fa-solid fa-trash"></i> Sim, excluir',
        cancelButtonText: 'Cancelar',
        background: '#111C38',
        color: '#f8fafc'
    }).then(result => {
        if (!result.isConfirmed) return;

        dashboards = dashboards.filter(dashboard => dashboard.id !== id);
        if (activeDashboardId === id) activeDashboardId = dashboards[0].id;
        saveDashboards();
        renderDashboardTabs();
        renderKPIs();
        renderCharts();
        renderDynamicCharts();

        fireThemedAlert({
            title: 'Dashboard excluído!',
            text: 'O dashboard e seus widgets foram removidos.',
            icon: 'success',
            background: '#111C38',
            color: '#f8fafc',
            confirmButtonColor: '#EAB308'
        });
    });
}

function addWidgetToDashboard() {
    const dashboard = getActiveDashboard();
    if (!dashboard) return;

    const choice = prompt('Digite o widget: KPI, gráfico ou gráfico padrão (1-4).')?.trim().toLowerCase();
    if (!choice) return;

    if (choice === 'kpi' || choice === 'balão') {
        openKpiModal();
        return;
    }
    if (choice.includes('gráfico') || choice.includes('grafico')) {
        openChartModal();
        return;
    }
    if (!['1', '2', '3', '4'].includes(choice)) {
        showAlert('Opção inválida', 'Escolha KPI, gráfico ou um número de gráfico padrão entre 1 e 4.', 'warning');
        return;
    }

    const widget = { id: `widget_chart${choice}_${Date.now()}`, type: 'default-chart', ref: `chart${choice}` };
    if (!dashboard.widgets.some(item => item.type === widget.type && item.ref === widget.ref)) dashboard.widgets.push(widget);
    saveDashboards();
    renderDashboardTabs();
    renderCharts();
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    applyTheme(nextTheme);
    markStateDirty();
    [chart1Inst, chart2Inst, chart3Inst, chart4Inst, modalChartInst, ...Object.values(dynamicChartInstances)]
        .filter(Boolean)
        .forEach(chart => chart.update());
}

function handleDeveloperModeClick() {
    developerModeClickCount += 1;
    clearTimeout(developerModeClickTimer);
    developerModeClickTimer = setTimeout(() => {
        developerModeClickCount = 0;
    }, 2500);

    if (developerModeClickCount === 5) {
        developerModeClickCount = 0;
        toggleDeveloperMode();
    }
}

function toggleDeveloperMode() {
    const isEnabled = document.body.classList.toggle('developer-mode');
    const status = isEnabled ? 'Ativado' : 'Desativado';
    updateDeveloperModeLockIcon(isEnabled);
    console.log(`Modo Desenvolvedor ${status}`);
    switchTab(isEnabled ? 'audit' : 'dashboard');
    showAlert(`Modo Desenvolvedor ${status}`, '', 'info');
}

function updateDeveloperModeLockIcon(isEnabled = document.body.classList.contains('developer-mode')) {
    const icon = document.getElementById('developerModeLockIcon');
    const tab = document.getElementById('tab-audit');
    if (!icon || !tab) return;

    icon.classList.toggle('fa-lock', !isEnabled);
    icon.classList.toggle('fa-lock-open', isEnabled);
    icon.classList.toggle('text-rose-400', !isEnabled);
    icon.classList.toggle('text-emerald-400', isEnabled);
    tab.title = isEnabled ? 'Modo Administrador ativo' : 'Acesso restrito ao Modo Administrador';
    tab.setAttribute('aria-label', tab.title);
}

// ================= LÓGICA DE GERENCIAMENTO DE LOGO =================
function handleLogoError(img) {
    img.onerror = null;
    img.parentElement.innerHTML = `
        <div class="w-full h-full flex items-center justify-center font-black text-slate-950 text-xl tracking-tighter bg-amber-400 rounded-[10px]">D'</div>
        <div class="absolute inset-0 bg-slate-950/80 text-amber-400 text-[9px] font-bold uppercase tracking-tighter flex items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity p-1 select-none">Alterar<br>Logo</div>
    `;
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showAlert('Arquivo inválido', 'Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP, etc).', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        setDashboardLogo(base64Image);
        markStateDirty();
    };
    reader.readAsDataURL(file);
}

function setDashboardLogo(src) {
    customLogoSrc = src;
    const logoImg = document.getElementById('dashboardLogo');
    if (logoImg) {
        logoImg.src = src;
    } else {
        const container = document.querySelector('.relative.group.cursor-pointer');
        if (container) {
            container.innerHTML = `
                <img id="dashboardLogo" src="${escapeHtml(src)}" alt="D'Granel Logo" class="h-full w-full object-cover rounded-[10px]" onerror="handleLogoError(this)">
                <div class="absolute inset-0 bg-slate-950/80 text-amber-400 text-[9px] font-bold uppercase tracking-tighter flex items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity p-1 select-none">Alterar<br>Logo</div>
            `;
        }
    }
    const homeLogo = document.getElementById('homeDashboardLogo');
    if (homeLogo) homeLogo.src = src;
    document.getElementById('removeLogoBtn')?.classList.remove('hidden');
}

function resetLogo() {
    customLogoSrc = null;
    
    const logoInput = document.getElementById('logoInput');
    if (logoInput) logoInput.value = '';

    const logoImg = document.getElementById('dashboardLogo');
    if (logoImg) {
        logoImg.src = DEFAULT_LOGO_SRC;
    } else {
        setDashboardLogo(DEFAULT_LOGO_SRC);
    }
    const homeLogo = document.getElementById('homeDashboardLogo');
    if (homeLogo) homeLogo.src = DEFAULT_LOGO_SRC;

    document.getElementById('removeLogoBtn')?.classList.add('hidden');
    markStateDirty();
}

function loadSavedLogo() {
    if (customLogoSrc) setDashboardLogo(customLogoSrc);
}

// DETECÇÃO E SINCRONIZAÇÃO DINÂMICA DE MESES
function syncMonthLabels(customHeaderMonths = null) {
    if (customHeaderMonths && customHeaderMonths.length > 0) {
        mesesLabels = customHeaderMonths.filter(isMonthLabel);
        return;
    }

    let maxLen = 0;
    currentData.forEach(d => {
        if (d.valores && d.valores.length > maxLen) {
            maxLen = d.valores.length;
        }
    });

    if (maxLen > mesesLabels.length) {
        mesesLabels = [];
        for (let i = 0; i < maxLen; i++) {
            const mName = BASE_MONTHS[i % 12];
            const yearOffset = Math.floor(i / 12);
            mesesLabels.push(yearOffset > 0 ? `${mName}/${26 + yearOffset}` : mName);
        }
    }
}

function loadStoredData() {
    currentData = JSON.parse(JSON.stringify(initialData));
}

function loadStoredSectors() {
    syncSectorsFromData();
}

function syncSectorsFromData() {
    const dataSectors = currentData.map(item => item.setor).filter(Boolean);
    sectors = [...new Set(dataSectors)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function populateSectorSelect(selectedSector = '', syncWithData = true) {
    if (syncWithData) syncSectorsFromData();
    const select = document.getElementById('editSetor');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione um setor</option>';
    sectors.forEach(sector => {
        const option = document.createElement('option');
        option.value = sector;
        option.textContent = sector;
        option.selected = sector === selectedSector;
        select.appendChild(option);
    });
}

function createSector() {
    const name = prompt('Digite o nome do novo setor:');
    const sectorName = name?.trim();
    if (!sectorName) return;

    const existingSector = sectors.find(sector => sector.toLocaleLowerCase() === sectorName.toLocaleLowerCase());
    if (existingSector) {
        populateSectorSelect(existingSector);
        return;
    }

    sectors.push(sectorName);
    sectors.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    populateSectorSelect(sectorName, false);
}

function loadStoredCharts() {
    customCharts = [];
}

function loadStoredKpis() {
    kpiCards = [];
}

function saveKpis() {
    markStateDirty();
}

function loadStoredDefaultCharts() {
    defaultChartConfigs = {};
}

function getDefaultChartConfig(chartId) {
    const findIndicator = text => currentData.findIndex(item => item.indicador.includes(text));
    const defaults = {
        chart1: { title: 'Evolução de Documentação, Score vs Acidentes & Multas', desc: 'Acompanhamento temporal dos indicadores críticos D\'Granel', type: 'bar', ind1: findIndicator('% CRLV LIBERADOS'), ind2: findIndicator('SCORE'), ind3: findIndicator('Total de acidentes'), ind4: findIndicator('Multas Cobradas Motoristas') },
        chart2: { title: 'Dimensionamento da Frota', desc: 'Evolução do volume de frota ativa', type: 'bar', ind1: findIndicator('cavalo mecânico'), ind2: findIndicator('semirreboques') },
        chart3: { title: 'Matriz de Eficiência (%)', desc: 'Comparativo Mês Inicial vs Mais Recente', type: 'radar', ind1: findIndicator('% CRLV LIBERADOS'), ind2: findIndicator('Cronotacógrafo'), ind3: findIndicator('40% de desconto') },
        chart4: { title: 'Correlação: Sinistros vs Excesso de Velocidade', desc: 'Análise de impacto direto: Picos de velocidade vs acidentes', type: 'line', ind1: findIndicator('velocidade permitida'), ind2: findIndicator('Total de acidentes') }
    };
    return { ...defaults[chartId], ...(defaultChartConfigs[chartId] || {}) };
}

function getChartJsType(type) {
    return type === 'horizontalBar' ? 'bar' : type === 'area' ? 'line' : type;
}

function resolveChartUnit(dataset = {}) {
    const rawUnit = dataset.unit || dataset.label || '';
    const unitText = String(rawUnit || '').trim();
    if (!unitText) return '';
    if (unitText.includes('R$')) return 'R$';
    if (unitText.includes('%')) return '%';
    return unitText;
}

function formatChartValue(value, unit = '') {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    const numeric = Number(value);
    const minDecimals = unit === 'R$' ? 2 : Number.isInteger(numeric) ? 0 : 2;
    const formatted = numeric.toLocaleString('pt-BR', {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: 2
    });
    if (unit === 'R$') return `R$ ${formatted}`;
    if (unit === '%') return `${formatted}%`;
    return formatted;
}

function buildAxisTicks(unit = '', color = '#94a3b8') {
    return {
        color,
        callback: value => formatChartValue(value, unit)
    };
}

function getChartTypeOptions(type, scales) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: type === 'horizontalBar' ? 'y' : 'x',
        plugins: {
            legend: { labels: { color: '#94a3b8' } },
            tooltip: {
                callbacks: {
                    label(context) {
                        const tooltipValue = context.parsed?.y ?? context.parsed?.x ?? context.parsed ?? 0;
                        const unit = resolveChartUnit(context.dataset || {});
                        return `${context.dataset.label || 'Valor'}: ${formatChartValue(tooltipValue, unit)}`;
                    }
                }
            }
        },
        scales,
        animation: false
    };
}

function openDefaultChartModal(chartId) {
    editingDefaultChartId = chartId;
    const config = { ...getDefaultChartConfig(chartId), id: `default_${chartId}`, span: '6' };
    customCharts.push(config);
    openChartModal(config.id);
    customCharts = customCharts.filter(chart => chart.id !== config.id);
}

function deleteDefaultChart(chartId) {
    fireThemedAlert({
        title: 'Excluir Gráfico?',
        text: 'Este gráfico padrão será removido do dashboard. Esta ação pode ser desfeita recriando sua configuração.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        cancelButtonColor: '#1e293b',
        confirmButtonText: '<i class="fa-solid fa-trash"></i> Sim, excluir',
        cancelButtonText: 'Cancelar',
        background: '#111C38',
        color: '#f8fafc'
    }).then(result => {
        if (!result.isConfirmed) return;

        defaultChartConfigs[chartId] = { ...getDefaultChartConfig(chartId), deleted: true };
        markStateDirty();
        renderCharts();

        fireThemedAlert({
            title: 'Gráfico excluído!',
            text: 'O gráfico padrão foi removido.',
            icon: 'success',
            background: '#111C38',
            color: '#f8fafc',
            confirmButtonColor: '#EAB308'
        });
    });
}

function renderConfiguredDefaultCharts() {
    ['chart1', 'chart2', 'chart3', 'chart4'].forEach(chartId => {
        const config = getDefaultChartConfig(chartId);
        const card = document.getElementById(`defaultChartCard${chartId.slice(-1)}`);
        if (card) card.classList.toggle('hidden', config.deleted === true || !dashboardHasWidget('default-chart', chartId));
        if (config.deleted) return;
        if (!defaultChartConfigs[chartId]) return;

        const instances = { chart1: chart1Inst, chart2: chart2Inst, chart3: chart3Inst, chart4: chart4Inst };
        if (instances[chartId]) instances[chartId].destroy();
        const indexes = [config.ind1, config.ind2, config.ind3, config.ind4].filter(index => Number.isInteger(index) && index >= 0);
        const indicators = indexes.map(index => currentData[index]).filter(Boolean);
        const labels = getDashboardChartData(indicators[0] || { valores: [] }).labels;
        if (!indicators.length) return;
        const supportsYAxis = !['radar', 'doughnut', 'polarArea', 'horizontalBar'].includes(config.type);
        const usesIndependentAxes = config.axisMode === 'independent' && supportsYAxis && indicators.length > 1;
        let datasets = indicators.map((indicator, index) => ({
            label: indicator.indicador,
            data: getDashboardChartData(indicator).values,
            borderColor: ['#eab308', '#10b981', '#38bdf8', '#f43f5e'][index],
            backgroundColor: ['rgba(234,179,8,.25)', 'rgba(16,185,129,.25)', 'rgba(56,189,248,.25)', 'rgba(244,63,94,.25)'][index],
            borderWidth: 2,
            tension: 0.3,
            fill: config.type === 'line',
            unit: indicator.und || '',
            ...(usesIndependentAxes ? { yAxisID: `y${index + 1}` } : {})
        }));
        if (chartId === 'chart2' && indicators.length > 1) datasets = [{ label: config.title, data: labels.map((_, index) => indicators.reduce((sum, item) => sum + (getDashboardChartData(item).values[index] || 0), 0)), backgroundColor: 'rgba(56,189,248,.6)', borderRadius: 6 }];
        const scales = config.type === 'radar'
            ? { r: { min: 0, beginAtZero: true, pointLabels: { color: '#cbd5e1' } } }
            : { x: { ticks: { color: '#94a3b8' } }, y: { min: 0, beginAtZero: true, ticks: buildAxisTicks(indicators.some(i => i.und === 'R$') ? 'R$' : indicators.some(i => i.und === '%') ? '%' : 'Qtd', '#94a3b8') } };
        if (supportsYAxis && indicators.length > 1 && !usesIndependentAxes) {
            const values = indicators.flatMap(indicator => getDashboardChartData(indicator).values)
                .filter(value => value !== null && value !== undefined && Number.isFinite(Number(value)));
            const maxValue = values.length ? Math.max(...values) * 1.1 : undefined;
            scales.y.max = maxValue > 0 ? maxValue : undefined;
        }
        if (usesIndependentAxes) {
            delete scales.y;
            const colors = ['#eab308', '#10b981', '#38bdf8', '#f43f5e'];

            indicators.forEach((_, index) => {
                const yAxisId = `y${index + 1}`;
                const position = index % 2 === 0 ? 'left' : 'right';

                scales[yAxisId] = {
                    type: 'linear',
                    display: true,
                    position,
                    min: 0,
                    beginAtZero: true,
                    grace: '10%',
                    ticks: {
                        color: colors[index % colors.length],
                        font: { size: 10, weight: 'bold' }
                    },
                    grid: {
                        drawOnChartArea: index === 0,
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                };
            });
        }
        if (config.type === 'horizontalBar') {
            scales.x = { min: 0, beginAtZero: true, ticks: { color: '#94a3b8' } };
            scales.y = { ticks: { color: '#94a3b8' } };
        }
        const chart = new Chart(document.getElementById(chartId).getContext('2d'), { type: getChartJsType(config.type), data: { labels, datasets }, options: getChartTypeOptions(config.type, scales) });
        if (chartId === 'chart1') chart1Inst = chart;
        if (chartId === 'chart2') chart2Inst = chart;
        if (chartId === 'chart3') chart3Inst = chart;
        if (chartId === 'chart4') chart4Inst = chart;
    });
}

async function salvarEstadoSupabase() {
    const pendingSave = supabaseSaveQueue.then(persistirEstadoSupabase);
    supabaseSaveQueue = pendingSave.catch(error => {
        console.error('Erro ao processar gravação no Supabase:', error);
    });
    return pendingSave;
}

function markStateDirty() {
    stateRevision += 1;
    hasUnsavedChanges = true;
    updateSaveButton();
}

function updateSaveButton() {
    const button = document.getElementById('saveStateButton');
    const icon = document.getElementById('saveStateButtonIcon');
    if (!button || !icon) return;

    button.disabled = isSavingState;
    button.classList.toggle('bg-amber-500', hasUnsavedChanges && !isSavingState);
    button.classList.toggle('hover:bg-amber-400', hasUnsavedChanges && !isSavingState);
    button.classList.toggle('bg-emerald-600', !hasUnsavedChanges || isSavingState);
    button.classList.toggle('hover:bg-emerald-500', !hasUnsavedChanges || isSavingState);

    if (isSavingState) {
        icon.className = 'fa-solid fa-spinner animate-spin text-sm';
        button.title = 'Salvando dados no banco...';
    } else {
        icon.className = 'fa-solid fa-floppy-disk text-sm';
        button.title = hasUnsavedChanges ? 'Existem alterações pendentes para salvar (Ctrl+S)' : 'Todas as alterações estão salvas';
    }
    button.setAttribute('aria-label', button.title);
}

async function saveCurrentState() {
    if (isSavingState) return;
    const revisionBeingSaved = stateRevision;
    isSavingState = true;
    updateSaveButton();
    try {
        await salvarEstadoSupabase();
        hasUnsavedChanges = stateRevision !== revisionBeingSaved;
        document.getElementById('lastSavedTag').textContent = 'Salvo agora';
        showAlert('Salvo com sucesso', 'As alterações foram salvas.', 'success');
    } catch (error) {
        console.error('Erro ao salvar o estado no Supabase:', error);
        document.getElementById('lastSavedTag').textContent = 'Falha ao salvar';
        showAlert('Falha ao salvar', 'Não foi possível salvar os dados no banco. Suas alterações continuam nesta tela; verifique a conexão e tente novamente.', 'error');
    } finally {
        isSavingState = false;
        updateSaveButton();
    }
}

async function persistirEstadoSupabase() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) throw new Error('Sessão Supabase indisponível.');
    if (!supabaseStateLoaded) throw new Error('O estado remoto ainda não foi carregado; gravação cancelada para preservar os dados existentes.');

    const data = {
        indicadores: currentData,
        setores: sectors,
        graficos: customCharts,
        graficosPadrao: defaultChartConfigs,
        kpis: kpiCards,
        dashboards,
        activeDashboardId,
        mesesLabels,
        showDataLabels,
        zoomGraficos: chartZoomState,
        theme: currentTheme,
        logo: customLogoSrc
    };

    const response = await fetch(SUPABASE_STATE_ENDPOINT, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
            id: 1,
            data,
            updated_at: new Date().toISOString()
        })
    });

    if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);
    supabaseReady = true;
    lastSupabaseSavedAt = Date.now();
    updateLastSaveStatus();
    await registrarLog('SALVAMENTO', 'Alterações salvas manualmente no banco');
}

async function carregarDadosSupabase(silencioso = false) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return null;

    const response = await fetch(`${SUPABASE_STATE_ENDPOINT}?id=eq.1&select=data,updated_at`, {
        headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);
    const rows = await response.json();
    supabaseReady = true;
    return rows[0] || null;
}

async function carregarDadosCompartilhados(silencioso = false) {
    if (silencioso && hasUnsavedChanges) return;
    try {
        const sharedState = await carregarDadosSupabase(silencioso);
        if (silencioso && hasUnsavedChanges) return;
        const remoteSavedAt = sharedState?.updated_at
            ? new Date(sharedState.updated_at).getTime()
            : null;
        if (silencioso && Number.isFinite(remoteSavedAt) && remoteSavedAt <= lastSupabaseSavedAt) return;

        const remoteData = sharedState?.data;
        const remoteIndicators = Array.isArray(remoteData) ? remoteData : remoteData?.indicadores;
        if (!Array.isArray(remoteIndicators)) {
            throw new Error('Estado remoto ausente ou inválido. Indicadores padrão não serão utilizados.');
        }
        supabaseStateLoaded = true;
        if (Number.isFinite(remoteSavedAt)) {
            lastSupabaseSavedAt = remoteSavedAt;
            updateLastSaveStatus(remoteSavedAt);
        }

        if (sharedState && sharedState.data) {
            const dataObj = sharedState.data;
            const sharedIndicators = Array.isArray(dataObj) ? dataObj : dataObj.indicadores;
            currentData = sharedIndicators;
            sectors = Array.isArray(dataObj.setores) ? dataObj.setores : [];
            if (!sectors.length) syncSectorsFromData();
            customCharts = Array.isArray(dataObj.graficos) ? dataObj.graficos : [];
            defaultChartConfigs = dataObj.graficosPadrao && typeof dataObj.graficosPadrao === 'object' ? dataObj.graficosPadrao : {};
            kpiCards = Array.isArray(dataObj.kpis) ? dataObj.kpis : [];
            dashboards = Array.isArray(dataObj.dashboards) && dataObj.dashboards.length
                ? dataObj.dashboards
                : [{ id: 'dashboard_main', name: 'Geral', widgets: getDefaultDashboardWidgets() }];
            dashboards = dashboards.map((dashboard, index) => ({
                id: dashboard.id || `dashboard_${index + 1}`,
                name: dashboard.name || `Dashboard ${index + 1}`,
                widgets: Array.isArray(dashboard.widgets)
                    ? dashboard.widgets.filter(widget => !(
                        (widget.type === 'kpi' && /^kpi[1-4]$/.test(widget.ref)) ||
                        (widget.type === 'default-chart' && /^chart[1-4]$/.test(widget.ref))
                    ))
                    : []
            }));
            activeDashboardId = dashboards.some(dashboard => dashboard.id === dataObj.activeDashboardId)
                ? dataObj.activeDashboardId
                : dashboards[0].id;
            mesesLabels = Array.isArray(dataObj.mesesLabels) ? dataObj.mesesLabels.filter(isMonthLabel) : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
            showDataLabels = dataObj.showDataLabels === true;
            Object.keys(chartZoomState).forEach(key => delete chartZoomState[key]);
            if (dataObj.zoomGraficos && typeof dataObj.zoomGraficos === 'object') {
                Object.entries(dataObj.zoomGraficos).forEach(([id, value]) => {
                    const zoom = Number(value);
                    if (Number.isFinite(zoom)) {
                        chartZoomState[id] = Math.min(CHART_ZOOM_MAX, Math.max(CHART_ZOOM_MIN, zoom));
                    }
                });
            }
            currentTheme = dataObj.theme === 'light' ? 'light' : 'dark';
            customLogoSrc = typeof dataObj.logo === 'string' && dataObj.logo ? dataObj.logo : null;
            applyTheme(currentTheme);
            if (customLogoSrc) {
                setDashboardLogo(customLogoSrc);
            } else {
                const logoImg = document.getElementById('dashboardLogo');
                if (logoImg) logoImg.src = DEFAULT_LOGO_SRC;
                document.getElementById('removeLogoBtn')?.classList.add('hidden');
            }
            syncMonthLabels();
            initSystem();
            return;
        }

        initSystem();
    } catch (error) {
        supabaseReady = false;
        supabaseStateLoaded = false;
        console.error('Erro ao carregar dados compartilhados:', error);
        if (!silencioso) showAlert('Indicadores indisponíveis', 'Não foi possível carregar os indicadores reais. Os dados padrão não serão usados. Recarregue a página para tentar novamente.', 'error');
        initSystem();
    }
}

function saveData(data) {
    currentData = data;
    syncSectorsFromData();
    syncMonthLabels();
    document.getElementById('lastUpdatedTag').textContent = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    markStateDirty();
}

function saveCustomChartsStorage() {
    markStateDirty();
}

function initSystem() {
    syncMonthLabels();
    renderDashboardMonthFilter();
    renderDashboardTabs();
    updateDataLabelsButton();
    populateSetoresDropdown();
    renderTableHeader();
    renderKPIs();
    renderGovernanceDashboard();
    const dashboardView = document.getElementById('view-dashboard');
    if (dashboardView && !dashboardView.classList.contains('hidden')) {
        renderCharts();
        renderDynamicCharts();
    }
    renderTable();
    updateJSONEditor();
    renderIntelligenceDashboard();
    updateHeaderAlertsBadge();
    const detailModal = document.getElementById('modalDetail');
    if (detailModal && !detailModal.classList.contains('hidden') && detailModalIndex !== null) {
        refreshDetailModal(detailModalIndex);
    }
    initPXStyleAnimations(document);
    if (!initialHomeOpened) {
        initialHomeOpened = true;
        switchTab('home');
    }
}

function toggleDataLabels() {
    showDataLabels = !showDataLabels;
    markStateDirty();
    updateDataLabelsButton();

    [chart1Inst, chart2Inst, chart3Inst, chart4Inst, modalChartInst, ...Object.values(dynamicChartInstances)]
        .filter(Boolean)
        .forEach(chart => chart.update());
}

function updateDataLabelsButton() {
    const button = document.getElementById('toggleDataLabelsBtn');
    if (!button) return;

    button.setAttribute('aria-pressed', String(showDataLabels));
    button.title = showDataLabels ? 'Desativar rótulos de dados nos gráficos' : 'Ativar rótulos de dados nos gráficos';
    button.innerHTML = showDataLabels
        ? '<i class="fa-solid fa-tags text-emerald-400"></i> <span>Ocultar Rótulos</span>'
        : '<i class="fa-solid fa-tags text-amber-400"></i> <span>Mostrar Rótulos</span>';
    button.classList.toggle('border-emerald-500/50', showDataLabels);
    button.classList.toggle('text-emerald-300', showDataLabels);
}

// NAVEGAÇÃO DE ABAS
function switchTab(tabName) {
    if (tabName === 'audit' && !document.body.classList.contains('developer-mode')) {
        return;
    }

    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }

    const nextView = document.getElementById(`view-${tabName}`);
    const currentView = document.querySelector('main > div:not(.hidden)');
    if (!nextView || currentView === nextView) return;
    resetNavbarOnTabChange();

    document.querySelectorAll('main > div').forEach(view => {
        view.classList.add('hidden');
    });

    if (currentView) currentView.classList.add('hidden');
    nextView.classList.remove('hidden');

    ['home', 'dashboard', 'datagrid', 'intelligence', 'governance', 'reports', 'audit'].forEach(t => {
        const button = document.getElementById(`tab-${t}`);
        if (button) button.classList.toggle('active', t === tabName);
    });

    document.getElementById('dashboardWorkspaceSection')?.classList.toggle('hidden', tabName !== 'dashboard');

    if (tabName === 'reports') {
        window.refreshReportFilters?.();
    } else if (tabName === 'dashboard') {
        renderCharts();
        renderDynamicCharts();
    } else if (tabName === 'intelligence') {
        renderIntelligenceDashboard();
        renderAlertsList();
    } else if (tabName === 'governance') {
        renderGovernanceDashboard();
        loadCompetencyAuditHistory();
    } else if (tabName === 'audit') {
        updateJSONEditor();
        carregarLogsAuditoria();
    }
}

// RETORNA ÚLTIMO VALOR VÁLIDO E SEU ÍNDICE
function getLastValid(arr, labels = mesesLabels) {
    if (!arr || !arr.length) return { val: null, idx: -1, month: '-' };
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] !== null && arr[i] !== undefined && !isNaN(arr[i])) {
            return { val: arr[i], idx: i, month: labels[i] || `Mês ${i+1}` };
        }
    }
    return { val: null, idx: -1, month: '-' };
}

function isMonthLabel(label) {
    return /^(jan|janeiro|fev|fevereiro|mar|março|marco|abr|abril|mai|maio|jun|junho|jul|julho|ago|agosto|set|setembro|out|outubro|nov|novembro|dez|dezembro|\d{1,2}\/\d{2,4})/i.test(String(label).normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
}

function getMonthlyData(item) {
    const labels = mesesLabels
        .map(label => String(label))
        .filter(isMonthLabel);
    const values = item?.valores || [];
    const valueOffset = values.length > labels.length ? values.length - labels.length : 0;

    return {
        labels: labels.length ? labels : BASE_MONTHS.slice(0, values.length),
        values: values.slice(valueOffset)
    };
}

function normalizeIndicatorValues(values) {
    const normalized = (Array.isArray(values) ? values : []).map(value => {
        if (value === null || value === undefined || value === '') return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    });
    while (normalized.length && normalized[normalized.length - 1] === null) normalized.pop();
    return normalized;
}

function indicatorValuesChanged(previous, nextValues) {
    if (!previous) return normalizeIndicatorValues(nextValues).some(value => value !== null);
    const previousValues = normalizeIndicatorValues(previous.valores);
    const currentValues = normalizeIndicatorValues(nextValues);
    return previousValues.length !== currentValues.length || previousValues.some((value, index) => value !== currentValues[index]);
}

function getValueForCompetency(item, month, labels) {
    const values = Array.isArray(item?.valores) ? item.valores : [];
    const offset = values.length > labels.length ? values.length - labels.length : 0;
    const index = labels.indexOf(month);
    if (index < 0) return null;
    const value = values[index + offset];
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
}

function compareIndicatorCompetencies(previous, next, previousMonths = mesesLabels, nextMonths = mesesLabels) {
    const labels = [...new Set([...previousMonths, ...nextMonths].filter(isMonthLabel))];
    const nextLabels = nextMonths.filter(isMonthLabel);
    const previousLabels = previousMonths.filter(isMonthLabel);
    const latestAvailable = nextLabels[nextLabels.length - 1] || previousLabels[previousLabels.length - 1];
    return labels.flatMap(month => {
        const previousValue = getValueForCompetency(previous, month, previousMonths);
        const newValue = getValueForCompetency(next, month, nextMonths);
        if (previousValue === newValue) return [];
        return [{
            indicator: next?.indicador || previous?.indicador || 'Indicador sem nome',
            sector: next?.setor || previous?.setor || 'Setor não informado',
            competency: month,
            previousValue,
            newValue,
            isRetroactive: month !== latestAvailable
        }];
    });
}

function collectCompetencyChanges(previousIndicators, nextIndicators, previousMonths = mesesLabels, nextMonths = mesesLabels) {
    const previousGroups = groupIndicatorsByIdentity(previousIndicators);
    const nextGroups = groupIndicatorsByIdentity(nextIndicators);
    const identities = new Set([...previousGroups.keys(), ...nextGroups.keys()]);
    const changes = [];

    identities.forEach(identity => {
        const previousItems = previousGroups.get(identity) || [];
        const nextItems = nextGroups.get(identity) || [];
        const count = Math.max(previousItems.length, nextItems.length);
        for (let index = 0; index < count; index += 1) {
            changes.push(...compareIndicatorCompetencies(previousItems[index] || null, nextItems[index] || null, previousMonths, nextMonths));
        }
    });
    return changes;
}

function formatAuditNumber(value) {
    return value === null || value === undefined ? '(vazio)' : Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 8 });
}

function formatCompetencyAuditDetails(changes, updatedAt = new Date().toISOString()) {
    const changedAt = new Date(updatedAt).toLocaleString('pt-BR');
    return [
        `Data/hora da atualização no Dashboard: ${changedAt}.`,
        'A data de atualização não identifica a data do evento de origem.',
        ...changes.map(change => `${change.indicator} · Setor: ${change.sector} · Competência: ${change.competency} · ${change.isRetroactive ? 'Alteração retroativa (anterior à competência mais recente disponível)' : 'Alteração na competência mais recente disponível'} · valor anterior: ${formatAuditNumber(change.previousValue)} · novo valor: ${formatAuditNumber(change.newValue)}`)
    ].join('\n');
}

function logCompetencyChanges(action, changes, updatedAt = new Date().toISOString(), source = '') {
    if (!changes.length) return registrarLog(action, `${source ? `Origem: ${source}. ` : ''}Nenhuma competência teve alteração de valor.`);
    return registrarLog(action, `${source ? `Origem: ${source}.\n` : ''}${formatCompetencyAuditDetails(changes, updatedAt)}`);
}

async function loadCompetencyAuditHistory() {
    const status = document.getElementById('competencyAuditStatus');
    const container = document.getElementById('competencyAuditHistory');
    if (!status || !container) return;
    status.textContent = 'Carregando alterações de competências...';
    container.replaceChildren();

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            status.textContent = 'Entre para consultar o histórico de alterações.';
            return;
        }

        const query = new URLSearchParams({
            select: 'created_at,user_email,acao,detalhes',
            acao: 'ilike.*ALTERAÇÃO DE VALORES*',
            order: 'created_at.desc',
            limit: '50'
        });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs?${query}`, {
            headers: {
                apikey: SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${session.access_token}`
            }
        });
        if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);

        const logs = await response.json();
        if (!logs.length) {
            status.textContent = 'Ainda não há alterações de valores registradas.';
            return;
        }

        let competencyCount = 0;
        logs.forEach(log => {
            const detailLines = String(log.detalhes || '').split(/\r?\n/);
            const competencyLines = detailLines.filter(line => line.includes('Competência:'));
            if (!competencyLines.length) return;
            competencyCount += competencyLines.length;

            const entry = document.createElement('article');
            entry.className = 'competency-audit-entry';
            const heading = document.createElement('div');
            heading.className = 'flex flex-wrap items-center justify-between gap-2';
            const action = document.createElement('span');
            action.className = 'text-[11px] font-bold uppercase text-amber-400';
            action.textContent = log.acao || 'Alteração de valores';
            heading.appendChild(action);
            const updatedAt = document.createElement('time');
            updatedAt.className = 'text-[11px] text-slate-400';
            updatedAt.dateTime = log.created_at || '';
            updatedAt.textContent = log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : 'Data da auditoria indisponível';
            heading.appendChild(updatedAt);
            entry.appendChild(heading);

            const actor = document.createElement('p');
            actor.className = 'mt-1 text-[11px] text-slate-400';
            actor.textContent = `Usuário: ${log.user_email || 'não informado'}`;
            entry.appendChild(actor);
            competencyLines.forEach(line => {
                const detail = document.createElement('p');
                detail.className = `mt-2 text-xs leading-relaxed ${line.includes('Alteração retroativa') ? 'font-semibold text-amber-300' : 'text-slate-300'}`;
                detail.textContent = line;
                entry.appendChild(detail);
            });
            container.appendChild(entry);
        });

        status.textContent = competencyCount
            ? `${competencyCount} alteração(ões) de competência nos 50 registros mais recentes.`
            : 'Os registros recentes não contêm alterações de competência.';
    } catch (error) {
        console.error('Erro ao carregar histórico de competências:', error);
        status.textContent = 'Não foi possível carregar o histórico. Verifique a conexão e as permissões de leitura da auditoria.';
        status.className = 'text-xs text-rose-400';
    }
}

function applyIndicatorUpdateMetadata(indicators, previousIndicators = currentData, updatedAt = new Date().toISOString()) {
    const previousByIdentity = groupIndicatorsByIdentity(previousIndicators);

    return indicators.map(item => {
        const previous = previousByIdentity.get(getIndicatorIdentity(item.setor, item.indicador))?.shift();
        const updated = { ...item };
        if (indicatorValuesChanged(previous, updated.valores)) {
            updated.ultimaAtualizacao = updatedAt;
        } else if (previous?.ultimaAtualizacao) {
            updated.ultimaAtualizacao = previous.ultimaAtualizacao;
        } else {
            delete updated.ultimaAtualizacao;
        }
        if (updated.direcaoDesempenho === undefined && previous?.direcaoDesempenho !== undefined) {
            updated.direcaoDesempenho = previous.direcaoDesempenho;
        }
        return updated;
    });
}

function formatIndicatorUpdatedAt(value) {
    if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return 'Data não disponível (registro legado)';
    return new Date(value).toLocaleString('pt-BR');
}

const getChartMonthData = getMonthlyData;

function getDashboardMonthLabels() {
    return [...new Set(mesesLabels.filter(isMonthLabel))];
}

function updateDashboardMonthSummary(availableMonths = getDashboardMonthLabels()) {
    const summary = document.getElementById('dashboardMonthSummary');
    if (!summary) return;

    const selectedCount = selectedDashboardMonths === null
        ? availableMonths.length
        : selectedDashboardMonths.filter(month => availableMonths.includes(month)).length;
    summary.textContent = availableMonths.length === 0
        ? 'Sem meses'
        : selectedCount === availableMonths.length
            ? 'Todos os meses'
            : selectedCount === 0
                ? 'Nenhum mês'
                : `${selectedCount} selecionado(s)`;
}

function renderDashboardMonthFilter() {
    const container = document.getElementById('dashboardMonthOptions');
    if (!container) return;

    const availableMonths = getDashboardMonthLabels();
    if (selectedDashboardMonths !== null) {
        const validSelection = selectedDashboardMonths.filter(month => availableMonths.includes(month));
        selectedDashboardMonths = selectedDashboardMonths.length > 0 && validSelection.length === 0 && availableMonths.length > 0
            ? null
            : validSelection;
    }

    container.replaceChildren();
    availableMonths.forEach(month => {
        const label = document.createElement('label');
        label.className = 'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = month;
        checkbox.checked = selectedDashboardMonths === null || selectedDashboardMonths.includes(month);
        checkbox.className = 'accent-amber-400';

        const text = document.createElement('span');
        text.textContent = month;
        label.append(checkbox, text);
        container.appendChild(label);
    });

    updateDashboardMonthSummary(availableMonths);
}

function getSelectedDashboardMonthLabels(labels = mesesLabels) {
    const monthLabels = labels.filter(isMonthLabel);
    return selectedDashboardMonths === null
        ? monthLabels
        : monthLabels.filter(month => selectedDashboardMonths.includes(month));
}

function getDashboardChartData(item) {
    const { labels, values } = getChartMonthData(item);
    const monthIndexes = labels
        .map((_, index) => index)
        .filter(index => selectedDashboardMonths === null || selectedDashboardMonths.includes(labels[index]));

    return {
        labels: monthIndexes.map(index => labels[index]),
        values: monthIndexes.map(index => values[index] ?? null)
    };
}

const INTELLIGENCE_DIRECTION_LABELS = {
    menor_melhor: 'Menor é melhor',
    maior_melhor: 'Maior é melhor',
    neutro: 'Neutra'
};

function renderGovernanceDashboard() {
    const rows = document.getElementById('governanceIndicatorRows');
    if (!rows) return;

    const configuredCount = currentData.filter(item => getIntelligenceDirection(item)).length;
    const pendingCount = currentData.length - configuredCount;
    document.getElementById('governanceConfiguredCount').textContent = configuredCount;
    document.getElementById('governancePendingCount').textContent = pendingCount;
    document.getElementById('governanceCompletionPercent').textContent = `${currentData.length ? Math.round(configuredCount / currentData.length * 100) : 0}%`;

    const sectorFilter = document.getElementById('governanceSectorFilter');
    const previousSector = sectorFilter.value || 'TODOS';
    sectorFilter.replaceChildren(new Option('Todos os setores', 'TODOS'));
    [...new Set(currentData.map(item => item.setor).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .forEach(sector => sectorFilter.add(new Option(sector, sector)));
    if ([...sectorFilter.options].some(option => option.value === previousSector)) sectorFilter.value = previousSector;

    const search = document.getElementById('governanceSearch').value.trim().toLocaleLowerCase('pt-BR');
    const directionFilter = document.getElementById('governanceDirectionFilter').value;
    const filteredIndicators = currentData.map((item, index) => ({ item, index })).filter(({ item }) => {
        const direction = getIntelligenceDirection(item);
        const matchesSector = sectorFilter.value === 'TODOS' || item.setor === sectorFilter.value;
        const matchesDirection = directionFilter === 'TODOS'
            || (directionFilter === 'PENDENTE' ? !direction : direction === directionFilter);
        const searchable = `${item.setor || ''} ${item.indicador || ''}`.toLocaleLowerCase('pt-BR');
        return matchesSector && matchesDirection && searchable.includes(search);
    });

    rows.replaceChildren();
    filteredIndicators.forEach(({ item, index }) => {
        const row = document.createElement('tr');
        row.className = 'governance-row hover:bg-slate-800/30 transition';
        const sectorCell = document.createElement('td');
        sectorCell.className = 'p-3 text-slate-400';
        sectorCell.textContent = item.setor || 'Setor não informado';
        const nameCell = document.createElement('td');
        nameCell.className = 'p-3 font-semibold text-slate-200';
        nameCell.textContent = item.indicador || `Indicador ${index + 1}`;
        const directionCell = document.createElement('td');
        directionCell.className = 'p-3';
        const select = document.createElement('select');
        select.className = 'governance-direction-select rounded-lg border border-slate-700 bg-[#070D1E] px-2.5 py-2 text-xs text-slate-200';
        select.setAttribute('aria-label', `Direção de desempenho: ${item.indicador}`);
        select.add(new Option('Pendente de configuração', ''));
        select.add(new Option(INTELLIGENCE_DIRECTION_LABELS.menor_melhor, 'menor_melhor'));
        select.add(new Option(INTELLIGENCE_DIRECTION_LABELS.maior_melhor, 'maior_melhor'));
        select.add(new Option(INTELLIGENCE_DIRECTION_LABELS.neutro, 'neutro'));
        select.value = getIntelligenceDirection(item) || '';
        select.addEventListener('change', () => updateIndicatorDirection(index, select.value));
        directionCell.appendChild(select);
        const updatedCell = document.createElement('td');
        updatedCell.className = 'p-3 text-slate-400';
        updatedCell.textContent = formatIndicatorUpdatedAt(item.ultimaAtualizacao);
        row.append(sectorCell, nameCell, directionCell, updatedCell);
        rows.appendChild(row);
    });
    document.getElementById('governanceIndicatorCount').textContent = `Exibindo ${filteredIndicators.length} de ${currentData.length} indicadores.`;
}

function updateIndicatorDirection(index, directionValue) {
    const item = currentData[index];
    if (!item) return;
    const direction = normalizeIndicatorDirection(directionValue);
    const previousDirection = getIntelligenceDirection(item);
    if (previousDirection === direction) return;

    if (direction) item.direcaoDesempenho = direction;
    else delete item.direcaoDesempenho;
    markStateDirty();
    renderGovernanceDashboard();
    renderIntelligenceDashboard();
    registrarLog('CONFIGURAÇÃO DE DIREÇÃO', `${item.indicador} (${item.setor}): ${INTELLIGENCE_DIRECTION_LABELS[previousDirection] || 'pendente'} → ${INTELLIGENCE_DIRECTION_LABELS[direction] || 'pendente'}`);
}

function getIntelligenceDirection(item) {
    return Object.prototype.hasOwnProperty.call(INTELLIGENCE_DIRECTION_LABELS, item?.direcaoDesempenho)
        ? item.direcaoDesempenho
        : null;
}

function getIntelligencePoints(item, periodMode = 'dashboard') {
    const monthly = getMonthlyData(item);
    let points = monthly.labels.map((month, index) => ({
        month,
        index,
        value: monthly.values[index]
    })).filter(point => point.value !== null && point.value !== undefined && Number.isFinite(Number(point.value)))
        .map(point => ({ ...point, value: Number(point.value) }));

    if (periodMode === 'dashboard' && selectedDashboardMonths !== null) {
        points = points.filter(point => selectedDashboardMonths.includes(point.month));
    } else if (periodMode === 'last3') {
        points = points.slice(-3);
    } else if (periodMode === 'last6') {
        points = points.slice(-6);
    }
    return points;
}

function getIntelligenceMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function getIntelligenceTrend(points) {
    if (points.length < 3) return null;
    const recent = points.slice(-3);
    const changes = recent.slice(1).map((point, index) => point.value - recent[index].value);
    const allUp = changes.every(change => change > 0);
    const allDown = changes.every(change => change < 0);
    const baseline = Math.max(...recent.map(point => Math.abs(point.value)), 1);
    const relativeRange = (Math.max(...recent.map(point => point.value)) - Math.min(...recent.map(point => point.value))) / baseline;

    if (relativeRange <= 0.05) return { kind: 'stable', recent };
    if (allUp) return { kind: 'up', recent };
    if (allDown) return { kind: 'down', recent };

    const longer = points.slice(-5);
    const signs = longer.slice(1).map((point, index) => Math.sign(point.value - longer[index].value)).filter(Boolean);
    const oscillations = signs.slice(1).filter((sign, index) => sign !== signs[index]).length;
    return { kind: oscillations >= 2 ? 'oscillating' : 'variable', recent };
}

function getIntelligenceProjection(points) {
    if (points.length < 4) return null;
    const sample = points.slice(-6);
    const meanX = sample.reduce((sum, point) => sum + point.index, 0) / sample.length;
    const meanY = sample.reduce((sum, point) => sum + point.value, 0) / sample.length;
    const numerator = sample.reduce((sum, point) => sum + (point.index - meanX) * (point.value - meanY), 0);
    const denominator = sample.reduce((sum, point) => sum + (point.index - meanX) ** 2, 0);
    if (!denominator) return null;
    const slope = numerator / denominator;
    const estimate = sample[sample.length - 1].value + slope;
    if (!Number.isFinite(estimate)) return null;
    return estimate;
}

function getIntelligenceSeverityForChange(item, change, changePercent) {
    const direction = getIntelligenceDirection(item);
    if (!direction || direction === 'neutro' || change === 0) return 'INFORMATIVO';
    const isWorsening = direction === 'menor_melhor' ? change > 0 : change < 0;
    if (!isWorsening) return 'INFORMATIVO';
    if (changePercent === null) return 'ATENCAO';
    const magnitude = Math.abs(changePercent);
    if (magnitude >= 25) return 'CRITICO';
    if (magnitude >= 10) return 'ATENCAO';
    return 'INFORMATIVO';
}

function generateAutomaticAnalyses({ periodMode = 'dashboard', sector = 'TODOS', indicatorIndex = 'TODOS' } = {}) {
    const analyses = [];
    const eligible = currentData
        .map((item, index) => ({ item, index }))
        .filter(({ item, index }) => (sector === 'TODOS' || item.setor === sector)
            && (indicatorIndex === 'TODOS' || String(index) === String(indicatorIndex)));

    eligible.forEach(({ item, index }) => {
        const points = getIntelligencePoints(item, periodMode);
        const direction = getIntelligenceDirection(item);
        const base = {
            indicator: item.indicador || 'Indicador sem nome',
            sector: item.setor || 'Setor não informado',
            indicatorIndex: index,
            direction,
            unit: item.und || '',
            points
        };
        const add = analysis => analyses.push({ ...base, ...analysis });

        if (typeof item.ultimaAtualizacao !== 'string' || !Number.isFinite(Date.parse(item.ultimaAtualizacao))) {
            add({
                category: 'freshness',
                severity: 'INFORMATIVO',
                title: 'Data de atualização indisponível',
                period: 'Registro legado ou sem data',
                current: null,
                previous: null,
                change: null,
                changePercent: null,
                explanation: 'Não há uma data confiável registrada para a última atualização deste indicador. O sistema não atribuiu uma data retroativa.',
                recommendation: 'A data será registrada automaticamente quando os valores deste indicador forem alterados ou importados.',
                calculation: 'Campo ultimaAtualizacao ausente ou inválido; não foi estimada a idade do dado.'
            });
        } else {
            const ageDays = Math.floor((Date.now() - Date.parse(item.ultimaAtualizacao)) / 86400000);
            if (ageDays >= 45) {
                add({
                    category: 'freshness',
                    severity: 'ATENCAO',
                    title: 'Atualização antiga',
                    period: formatIndicatorUpdatedAt(item.ultimaAtualizacao),
                    current: null,
                    previous: null,
                    change: null,
                    changePercent: null,
                    explanation: `A última atualização registrada ocorreu há ${ageDays} dias. O limite de acompanhamento adotado é 45 dias; isso indica idade do registro, não prova que os dados estejam incorretos.`,
                    recommendation: 'Confirme com o setor responsável se houve atualização mais recente dos valores.',
                    calculation: `Idade calculada a partir de ultimaAtualizacao: ${ageDays} dia(s); critério informativo do sistema: 45 dias.`
                });
            }
        }

        if (points.length < 2) {
            add({
                category: 'insufficient',
                severity: 'INFORMATIVO',
                title: points.length ? 'Histórico insuficiente para comparar' : 'Sem dados válidos no período',
                period: points[0]?.month || 'Período selecionado',
                current: points[0]?.value ?? null,
                previous: null,
                change: null,
                changePercent: null,
                explanation: points.length
                    ? 'Há apenas um valor numérico disponível; não é possível calcular variação ou tendência com confiança.'
                    : 'Não há valores numéricos disponíveis para este indicador no período selecionado.',
                recommendation: points.length
                    ? 'Aguarde novos registros mensais antes de avaliar tendências.'
                    : 'Atualize o histórico do indicador antes de tirar conclusões.',
                calculation: `Pontos numéricos disponíveis: ${points.length}. Valores nulos foram ignorados.`
            });
            return;
        }

        const current = points[points.length - 1];
        const previous = points[points.length - 2];
        const change = current.value - previous.value;
        const changePercent = previous.value === 0 ? null : (change / Math.abs(previous.value)) * 100;

        if (change !== 0) {
            const movement = change > 0 ? 'aumento' : 'redução';
            const directionText = !direction || direction === 'neutro'
                ? 'A variação é descritiva; a direção de desempenho não permite afirmar melhora ou piora.'
                : direction === 'menor_melhor'
                    ? (change < 0 ? 'A variação favorece a direção configurada.' : 'A variação é contrária à direção configurada.')
                    : (change > 0 ? 'A variação favorece a direção configurada.' : 'A variação é contrária à direção configurada.');
            add({
                category: 'variation',
                severity: getIntelligenceSeverityForChange(item, change, changePercent),
                title: `${movement[0].toUpperCase()}${movement.slice(1)} em relação ao registro anterior`,
                period: `${previous.month} → ${current.month}`,
                current: current.value,
                previous: previous.value,
                change,
                changePercent,
                explanation: `O valor passou de ${formatChartValue(previous.value, item.und)} em ${previous.month} para ${formatChartValue(current.value, item.und)} em ${current.month}. ${changePercent === null ? 'A variação percentual não foi calculada porque o valor anterior é zero.' : `Variação de ${Math.abs(changePercent).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%.`} ${directionText}`,
                recommendation: direction && direction !== 'neutro'
                    ? (getIntelligenceSeverityForChange(item, change, changePercent) === 'CRITICO' || getIntelligenceSeverityForChange(item, change, changePercent) === 'ATENCAO'
                        ? 'Verifique os registros deste período e acompanhe o próximo valor antes de atribuir causas.'
                        : 'Mantenha o acompanhamento da série para confirmar a evolução.')
                    : 'Configure a direção de desempenho no cadastro para habilitar interpretações de melhora ou piora.',
                calculation: `Variação absoluta: ${formatChartValue(change, item.und)}. Fórmula percentual: (atual − anterior) ÷ |anterior| × 100${previous.value === 0 ? '; indisponível com base zero' : ` = ${changePercent.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`}.`
            });
        }

        const meta = item.meta === '' || item.meta === null || item.meta === undefined ? NaN : Number(item.meta);
        if (Number.isFinite(meta) && direction && direction !== 'neutro') {
            const isBelowHigherTarget = direction === 'maior_melhor' && current.value < meta;
            const isAboveLowerTarget = direction === 'menor_melhor' && current.value > meta;
            const isMet = !isBelowHigherTarget && !isAboveLowerTarget;
            const distance = direction === 'maior_melhor' ? meta - current.value : current.value - meta;
            const relativeDistance = meta === 0 ? (distance > 0 ? Infinity : 0) : distance / Math.abs(meta);
            const severity = isMet
                ? 'INFORMATIVO'
                : relativeDistance >= 0.15
                    ? 'CRITICO'
                    : 'ATENCAO';
            const attainment = direction === 'maior_melhor'
                ? (meta > 0 ? Math.min(100, Math.max(0, current.value / meta * 100)) : null)
                : (current.value === 0 ? 100 : meta > 0 ? Math.min(100, Math.max(0, meta / current.value * 100)) : null);
            add({
                category: 'target',
                severity,
                title: isMet ? 'Meta atingida' : relativeDistance <= 0.1 ? 'Próximo do limite da meta' : 'Desvio em relação à meta',
                period: current.month,
                current: current.value,
                previous: null,
                change: null,
                changePercent: null,
                explanation: isMet
                    ? `O valor de ${formatChartValue(current.value, item.und)} atende à meta de ${formatChartValue(meta, item.und)} segundo a direção configurada (${INTELLIGENCE_DIRECTION_LABELS[direction]}).`
                    : `O valor atual é ${formatChartValue(current.value, item.und)} e a meta é ${formatChartValue(meta, item.und)} (${direction === 'maior_melhor' ? 'maior é melhor' : 'menor é melhor'}).${attainment === null ? '' : ` Atingimento estimado: ${attainment.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%.`}`,
                recommendation: isMet
                    ? 'Continue acompanhando a série para confirmar a manutenção do resultado.'
                    : 'Acompanhe o indicador e revise os registros relacionados; esta comparação não identifica causas.',
                calculation: `Distância absoluta até a meta: ${formatChartValue(Math.abs(current.value - meta), item.und)}.${relativeDistance === Infinity ? ' Meta igual a zero; distância percentual relativa não se aplica.' : ` Direção aplicada: ${INTELLIGENCE_DIRECTION_LABELS[direction]}.`}`
            });
        }

        const trend = getIntelligenceTrend(points);
        if (trend) {
            const recentValues = points.slice(-3).map(point => point.value);
            const avg3 = recentValues.reduce((sum, value) => sum + value, 0) / recentValues.length;
            const last6 = points.slice(-6).map(point => point.value);
            const avg6 = last6.length === 6 ? last6.reduce((sum, value) => sum + value, 0) / last6.length : null;
            const projection = getIntelligenceProjection(points);
            const lowestPoint = points.reduce((lowest, point) => point.value < lowest.value ? point : lowest);
            const highestPoint = points.reduce((highest, point) => point.value > highest.value ? point : highest);
            const bestPoint = direction === 'maior_melhor' ? highestPoint : direction === 'menor_melhor' ? lowestPoint : null;
            const worstPoint = direction === 'maior_melhor' ? lowestPoint : direction === 'menor_melhor' ? highestPoint : null;
            const descriptions = {
                up: direction === 'menor_melhor' ? 'Crescimento contínuo, contrário à direção configurada.' : direction === 'maior_melhor' ? 'Crescimento contínuo, favorável à direção configurada.' : 'Crescimento contínuo observado, sem interpretação de desempenho.',
                down: direction === 'maior_melhor' ? 'Redução contínua, contrária à direção configurada.' : direction === 'menor_melhor' ? 'Redução contínua, favorável à direção configurada.' : 'Redução contínua observada, sem interpretação de desempenho.',
                stable: 'Os três últimos valores apresentam variação relativa de até 5%; a série está estável neste recorte.',
                oscillating: 'A série alternou direção em mais de um dos últimos intervalos; há oscilação frequente neste recorte.',
                variable: 'Os últimos valores variaram sem uma direção contínua identificável.'
            };
            const trendIsWorse = (trend.kind === 'up' && direction === 'menor_melhor') || (trend.kind === 'down' && direction === 'maior_melhor');
            add({
                category: 'trend',
                severity: trendIsWorse ? 'ATENCAO' : 'INFORMATIVO',
                title: ({ up: 'Tendência de crescimento', down: 'Tendência de redução', stable: 'Indicador estável', oscillating: 'Oscilações frequentes', variable: 'Comportamento variável' })[trend.kind],
                period: trend.recent.map(point => point.month).join(' → '),
                current: current.value,
                previous: null,
                change: null,
                changePercent: null,
                explanation: `${descriptions[trend.kind]} ${bestPoint && worstPoint
                    ? `Melhor resultado registrado: ${formatChartValue(bestPoint.value, item.und)} (${bestPoint.month}); pior resultado: ${formatChartValue(worstPoint.value, item.und)} (${worstPoint.month}).`
                    : `Menor registro: ${formatChartValue(lowestPoint.value, item.und)} (${lowestPoint.month}); maior registro: ${formatChartValue(highestPoint.value, item.und)} (${highestPoint.month}).`}`,
                recommendation: trendIsWorse
                    ? 'Acompanhe os próximos registros e investigue os dados operacionais relacionados, sem presumir causalidade.'
                    : direction && direction !== 'neutro' && trend.kind !== 'stable'
                        ? 'Mantenha as práticas atuais sob acompanhamento para verificar se a tendência se confirma.'
                        : 'Use novos períodos para confirmar se o comportamento observado se mantém.',
                calculation: `Média dos últimos 3 registros válidos: ${formatChartValue(avg3, item.und)}.${avg6 === null ? ' Ainda não há seis registros válidos para média semestral.' : ` Média dos últimos 6 registros válidos: ${formatChartValue(avg6, item.und)}.`}${projection === null ? ' Projeção indisponível: histórico insuficiente.' : ` Estimativa linear para o próximo período: ${formatChartValue(projection, item.und)} (estimativa, não garantia).`}`
            });
        }

        if (points.length >= 6) {
            const values = points.map(point => point.value);
            const median = getIntelligenceMedian(values);
            const deviations = values.map(value => Math.abs(value - median));
            const mad = getIntelligenceMedian(deviations);
            const currentDeviation = Math.abs(current.value - median);
            const threshold = mad > 0 ? 3.5 * 1.4826 * mad : Math.max(Math.abs(median) * 0.1, 1);
            if (currentDeviation > threshold) {
                const anomalyWorsens = direction === 'menor_melhor'
                    ? current.value > median
                    : direction === 'maior_melhor' ? current.value < median : false;
                add({
                    category: 'anomaly',
                    severity: anomalyWorsens ? 'ATENCAO' : 'INFORMATIVO',
                    title: 'Variação atípica identificada',
                    period: current.month,
                    current: current.value,
                    previous: median,
                    change: current.value - median,
                    changePercent: median === 0 ? null : ((current.value - median) / Math.abs(median)) * 100,
                    explanation: `O valor atual (${formatChartValue(current.value, item.und)}) se distancia da mediana histórica (${formatChartValue(median, item.und)}). O método robusto foi aplicado com ${points.length} registros válidos; isso sinaliza uma diferença estatística, não sua causa.`,
                    recommendation: 'Confira o registro deste período e os dados de origem antes de tomar uma decisão operacional.',
                    calculation: `Mediana: ${formatChartValue(median, item.und)}; desvio absoluto mediano (MAD): ${formatChartValue(mad, item.und)}; limiar robusto: ${formatChartValue(threshold, item.und)}.`
                });
            }
        }
    });

    return analyses;
}

const INTELLIGENCE_CATEGORY_LABELS = {
    variation: 'Variação mensal',
    target: 'Meta',
    trend: 'Tendência',
    anomaly: 'Anomalia',
    freshness: 'Atualização',
    insufficient: 'Dados insuficientes'
};

function populateIntelligenceFilters() {
    const sectorSelect = document.getElementById('intelligenceSectorFilter');
    const indicatorSelect = document.getElementById('intelligenceIndicatorFilter');
    if (!sectorSelect || !indicatorSelect) return;

    const previousSector = sectorSelect.value || 'TODOS';
    const previousIndicator = indicatorSelect.value || 'TODOS';
    sectorSelect.replaceChildren(new Option('Todos os setores', 'TODOS'));
    [...new Set(currentData.map(item => item.setor).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .forEach(sector => sectorSelect.add(new Option(sector, sector)));
    if ([...sectorSelect.options].some(option => option.value === previousSector)) sectorSelect.value = previousSector;

    indicatorSelect.replaceChildren(new Option('Todos os indicadores', 'TODOS'));
    currentData.forEach((item, index) => {
        if (sectorSelect.value !== 'TODOS' && item.setor !== sectorSelect.value) return;
        indicatorSelect.add(new Option(item.indicador || `Indicador ${index + 1}`, String(index)));
    });
    if ([...indicatorSelect.options].some(option => option.value === previousIndicator)) indicatorSelect.value = previousIndicator;
}

function getIntelligencePeriodLabel(mode) {
    if (mode === 'last3') return 'Últimos 3 registros válidos por indicador';
    if (mode === 'last6') return 'Últimos 6 registros válidos por indicador';
    if (mode === 'all') return 'Todo o histórico disponível';
    const months = selectedDashboardMonths === null
        ? mesesLabels.filter(isMonthLabel)
        : selectedDashboardMonths;
    return months.length ? months.join(', ') : 'Nenhum mês selecionado no Dashboard';
}

function appendIntelligenceText(parent, tagName, text, className = '') {
    const element = document.createElement(tagName);
    element.textContent = text;
    if (className) element.className = className;
    parent.appendChild(element);
    return element;
}

async function renderIntelligenceDashboard() {
    const list = document.getElementById('intelligenceAnalysisList');
    const status = document.getElementById('intelligenceStatus');
    if (!list || !status) return;

    const renderRevision = ++intelligenceRenderRevision;
    status.className = 'rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300';
    status.textContent = 'Processando os indicadores e períodos disponíveis...';
    list.replaceChildren();
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (renderRevision !== intelligenceRenderRevision) return;

    try {
        populateIntelligenceFilters();
        const periodMode = document.getElementById('intelligencePeriodFilter')?.value || 'dashboard';
        const sector = document.getElementById('intelligenceSectorFilter')?.value || 'TODOS';
        const indicatorIndex = document.getElementById('intelligenceIndicatorFilter')?.value || 'TODOS';
        const generated = generateAutomaticAnalyses({ periodMode, sector, indicatorIndex });
        const severityFilter = document.getElementById('intelligenceSeverityFilter')?.value || 'TODOS';
        const categoryFilter = document.getElementById('intelligenceCategoryFilter')?.value || 'TODOS';
        const filtered = generated.filter(analysis => (severityFilter === 'TODOS' || analysis.severity === severityFilter)
            && (categoryFilter === 'TODOS' || analysis.category === categoryFilter));
        filtered.sort((a, b) => ({ CRITICO: 0, ATENCAO: 1, INFORMATIVO: 2 }[a.severity] - { CRITICO: 0, ATENCAO: 1, INFORMATIVO: 2 }[b.severity]));
        const visible = filtered.slice(0, intelligenceVisibleLimit);
        const loadMoreButton = document.getElementById('intelligenceLoadMore');
        if (loadMoreButton) loadMoreButton.classList.toggle('hidden', visible.length >= filtered.length);

        const counts = generated.reduce((result, analysis) => {
            result[analysis.severity] += 1;
            return result;
        }, { CRITICO: 0, ATENCAO: 0, INFORMATIVO: 0 });
        document.getElementById('intelligenceCriticalCount').textContent = counts.CRITICO;
        document.getElementById('intelligenceAttentionCount').textContent = counts.ATENCAO;
        document.getElementById('intelligenceInfoCount').textContent = counts.INFORMATIVO;
        document.getElementById('intelligencePeriodLabel').textContent = getIntelligencePeriodLabel(periodMode);
        document.getElementById('intelligenceUpdatedAt').textContent = new Date().toLocaleString('pt-BR');

        const configuredCandidates = currentData.filter(item => sector === 'TODOS' || item.setor === sector);
        const unconfiguredCount = configuredCandidates.filter(item => !getIntelligenceDirection(item)).length;
        status.className = 'rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs leading-relaxed text-slate-300';
        status.textContent = `${visible.length} de ${filtered.length} análise(s) exibida(s) após os filtros (${generated.length} no conjunto selecionado). ${unconfiguredCount} indicador(es) ainda sem direção configurada; variações e tendências desses indicadores são somente descritivas. A competência mais recente pode receber atualizações posteriores.`;

        if (filtered.length === 0) {
            if (loadMoreButton) loadMoreButton.classList.add('hidden');
            status.className = 'rounded-xl border border-slate-700 bg-slate-800/40 p-5 text-sm text-slate-300';
            status.textContent = currentData.length === 0
                ? 'Não há indicadores carregados para analisar.'
                : 'Nenhuma análise corresponde aos filtros atuais. Amplie os filtros ou selecione outro período.';
            appendIntelligenceText(list, 'div', 'Nenhuma análise encontrada para esta combinação de filtros.', 'col-span-full rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400');
            return;
        }

        const severityPresentation = {
            CRITICO: { label: 'Crítico', icon: 'fa-triangle-exclamation', className: 'intelligence-analysis-critical' },
            ATENCAO: { label: 'Atenção', icon: 'fa-circle-exclamation', className: 'intelligence-analysis-attention' },
            INFORMATIVO: { label: 'Informativo', icon: 'fa-circle-info', className: 'intelligence-analysis-info' }
        };

        visible.forEach(analysis => {
            const presentation = severityPresentation[analysis.severity];
            const card = document.createElement('article');
            card.className = `intelligence-analysis ${presentation.className} page-load-item`;
            const top = document.createElement('div');
            top.className = 'flex flex-wrap items-center justify-between gap-2';
            const badge = document.createElement('span');
            badge.className = 'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide';
            badge.innerHTML = `<i class="fa-solid ${presentation.icon}" aria-hidden="true"></i>`;
            appendIntelligenceText(badge, 'span', presentation.label);
            top.appendChild(badge);
            appendIntelligenceText(top, 'span', INTELLIGENCE_CATEGORY_LABELS[analysis.category] || 'Análise', 'text-[10px] font-semibold text-slate-400');
            card.appendChild(top);

            appendIntelligenceText(card, 'h3', analysis.title, 'mt-3 text-sm font-bold text-white');
            appendIntelligenceText(card, 'p', analysis.indicator, 'mt-1 text-xs font-semibold text-slate-200');
            appendIntelligenceText(card, 'p', `${analysis.sector} · ${analysis.period}`, 'mt-1 text-[11px] text-slate-400');
            appendIntelligenceText(card, 'p', analysis.explanation, 'mt-3 text-xs leading-relaxed text-slate-300');

            const details = document.createElement('details');
            details.className = 'mt-3 border-t border-slate-700/70 pt-3';
            appendIntelligenceText(details, 'summary', 'Ver cálculo e recomendação', 'cursor-pointer text-xs font-semibold text-amber-400');
            appendIntelligenceText(details, 'p', analysis.calculation, 'mt-2 text-[11px] leading-relaxed text-slate-400');
            appendIntelligenceText(details, 'p', `Recomendação: ${analysis.recommendation}`, 'mt-2 text-xs leading-relaxed text-slate-300');
            if (analysis.direction) appendIntelligenceText(details, 'p', `Direção configurada: ${INTELLIGENCE_DIRECTION_LABELS[analysis.direction]}.`, 'mt-2 text-[11px] text-slate-400');
            card.appendChild(details);

            if (Number.isInteger(analysis.indicatorIndex) && currentData[analysis.indicatorIndex]) {
                const inspectButton = document.createElement('button');
                inspectButton.type = 'button';
                inspectButton.className = 'mt-3 inline-flex items-center gap-2 text-xs font-semibold text-amber-400 transition hover:text-amber-300';
                inspectButton.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Inspecionar indicador';
                inspectButton.addEventListener('click', () => openDetailModal(analysis.indicatorIndex));
                card.appendChild(inspectButton);
            }
            list.appendChild(card);
        });
        initPXStyleAnimations(list);
    } catch (error) {
        console.error('Erro ao processar análises de indicadores:', error);
        status.className = 'rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 text-sm text-rose-300';
        status.textContent = 'Não foi possível processar as análises. Confira os dados dos indicadores e tente atualizar novamente.';
        appendIntelligenceText(list, 'div', 'Erro ao processar os indicadores.', 'rounded-xl border border-rose-500/20 p-5 text-sm text-rose-300');
    }
}

// ============================================================================
// CENTRAL DE NOTIFICAÇÕES & ALERTAS OPERACIONAIS (MOTOR DETERMINÍSTICO)
// ============================================================================

let currentIntelligenceSubtab = 'alerts';
const ALERT_READ_STORAGE_KEY = 'dgranel_alerts_read_v1';

function getReadAlertIds() {
    try {
        const stored = localStorage.getItem(ALERT_READ_STORAGE_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
}

function saveReadAlertIds(readSet) {
    try {
        localStorage.setItem(ALERT_READ_STORAGE_KEY, JSON.stringify([...readSet]));
    } catch (err) {
        console.warn('Falha ao persistir estado de leitura no localStorage:', err);
    }
}

function computeAlertFingerprint(indicatorKey, category, competency) {
    const raw = `${indicatorKey}||${category}||${competency}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `alert_${Math.abs(hash).toString(36)}`;
}

/**
 * Constrói a mensagem padronizada, profissional e objetiva para o alerta.
 */
function buildStandardAlertMessage(category, severity, indicatorName, competency, details = {}) {
    const name = indicatorName || 'Indicador';
    const comp = competency || 'competência recente';

    if (category === 'target') {
        if (severity === 'CRITICO') {
            return `ALERTA CRÍTICO: O indicador ${name} apresentou resultado desfavorável em ${comp}, ultrapassando significativamente a meta estabelecida. A situação exige atenção imediata da equipe de Segurança Viária e avaliação de medidas corretivas.`;
        }
        if (severity === 'ATENCAO') {
            return `ATENÇÃO: O indicador ${name} não atingiu a meta planejada na competência ${comp}. Recomenda-se acompanhamento e alinhamento com a operação.`;
        }
        return `RESULTADO POSITIVO: O indicador ${name} atingiu a meta estabelecida para a competência ${comp}. Recomenda-se manter o acompanhamento operacional.`;
    }

    if (category === 'trend') {
        if (severity === 'CRITICO' || severity === 'ATENCAO') {
            return `ATENÇÃO: O indicador ${name} apresenta uma tendência contínua de piora nas últimas competências avaliadas (${comp}). Recomenda-se investigar os fatores operacionais e adotar medidas preventivas.`;
        }
        return `ACOMPANHAMENTO: O indicador ${name} apresenta estabilidade ou comportamento consistente nas últimas competências (${comp}).`;
    }

    if (category === 'variation') {
        if (severity === 'CRITICO') {
            return `ALERTA CRÍTICO: O indicador ${name} registrou uma variação desfavorável acentuada na passagem para ${comp}. Necessário averiguar as ocorrências do período.`;
        }
        if (severity === 'ATENCAO') {
            return `ATENÇÃO: O indicador ${name} apresentou piora em relação à competência anterior (${comp}). Recomenda-se monitorar os próximos fechamentos.`;
        }
        return `RESULTADO POSITIVO: O indicador ${name} apresentou evolução favorável em relação à competência anterior (${comp}). Recomenda-se manter as boas práticas.`;
    }

    if (category === 'anomaly') {
        return `ATENÇÃO: Foi identificada uma variação atípica estatística no indicador ${name} na competência ${comp}, distanciando-se do padrão histórico mediano. Recomenda-se conferência dos dados registrados.`;
    }

    if (category === 'freshness') {
        return `ATENÇÃO: O indicador ${name} está sem registros de atualização recentes há mais de 45 dias. Recomenda-se verificar se há novas informações da frota para lançamento.`;
    }

    return `INFORMATIVO: O indicador ${name} possui registros a serem acompanhados na competência ${comp}.`;
}

/**
 * Gera a lista de notificações operacionais unificando regras analíticas determinísticas.
 */
function generateDeterministicAlerts() {
    const rawAnalyses = generateAutomaticAnalyses({ periodMode: 'all', sector: 'TODOS', indicatorIndex: 'TODOS' });
    const readSet = getReadAlertIds();
    const alertsMap = new Map();

    rawAnalyses.forEach(analysis => {
        // Ignora análises informativas que não representem eventos de interesse
        if (analysis.category === 'insufficient') return;

        const indicator = analysis.indicator || 'Indicador';
        const sector = analysis.sector || 'Geral';
        const competency = analysis.period || 'Geral';
        const category = analysis.category || 'variation';
        const severity = analysis.severity || 'INFORMATIVO';
        const indicatorKey = `${sector}::${indicator}`;

        const fingerprint = computeAlertFingerprint(indicatorKey, category, competency);
        const isRead = readSet.has(fingerprint);

        const standardMessage = buildStandardAlertMessage(category, severity, indicator, competency);

        // Se já existe alerta para o mesmo indicador, categoria e período, prioriza a maior severidade (sem duplicar)
        if (alertsMap.has(fingerprint)) {
            const existing = alertsMap.get(fingerprint);
            const severityRank = { CRITICO: 3, ATENCAO: 2, INFORMATIVO: 1 };
            if ((severityRank[severity] || 0) > (severityRank[existing.severity] || 0)) {
                existing.severity = severity;
                existing.title = analysis.title;
                existing.message = standardMessage;
                existing.technicalExplanation = analysis.explanation;
                existing.calculation = analysis.calculation;
                existing.recommendation = analysis.recommendation;
            }
            return;
        }

        alertsMap.set(fingerprint, {
            id: fingerprint,
            indicator,
            sector,
            competency,
            category,
            severity, // 'CRITICO' | 'ATENCAO' | 'INFORMATIVO'
            title: analysis.title,
            message: standardMessage,
            technicalExplanation: analysis.explanation,
            calculation: analysis.calculation,
            recommendation: analysis.recommendation,
            indicatorIndex: analysis.indicatorIndex,
            isRead,
            detectedAt: analysis.detectedAt || new Date().toLocaleDateString('pt-BR')
        });
    });

    return Array.from(alertsMap.values());
}

function switchIntelligenceSubtab(subtabName) {
    currentIntelligenceSubtab = subtabName;

    // Atualiza botões
    ['alerts', 'analyses', 'pilot'].forEach(tab => {
        const btn = document.getElementById(`subtab-btn-${tab}`);
        const content = document.getElementById(`subtab-content-${tab}`);
        const isActive = tab === subtabName;

        if (btn) {
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('border-amber-500/30', isActive);
            btn.classList.toggle('bg-amber-500/15', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('border-slate-700', !isActive);
            btn.classList.toggle('bg-slate-800/60', !isActive);
            btn.classList.toggle('text-slate-300', !isActive);
        }
        if (content) {
            content.classList.toggle('hidden', !isActive);
        }
    });

    if (subtabName === 'alerts') {
        renderAlertsList();
    } else if (subtabName === 'analyses') {
        renderIntelligenceDashboard();
    }
}

function toggleAlertReadState(alertId) {
    const readSet = getReadAlertIds();
    if (readSet.has(alertId)) {
        readSet.delete(alertId);
    } else {
        readSet.add(alertId);
    }
    saveReadAlertIds(readSet);
    renderAlertsList();
}

function markAllAlertsAsRead() {
    const alerts = generateDeterministicAlerts();
    const readSet = getReadAlertIds();
    alerts.forEach(a => readSet.add(a.id));
    saveReadAlertIds(readSet);
    renderAlertsList();
    showAlert('Notificações atualizadas', 'Todos os alertas vigentes foram marcados como lidos.', 'success');
}

function resetAlertsReadState() {
    try {
        localStorage.removeItem(ALERT_READ_STORAGE_KEY);
        renderAlertsList();
        showAlert('Histórico restaurado', 'O status de leitura de todas as notificações foi redefinido.', 'info');
    } catch (err) {
        console.error('Falha ao limpar leituras:', err);
    }
}

function filterAlertsBySeverityQuick(severity) {
    const select = document.getElementById('alertFilterSeverity');
    if (select) {
        select.value = severity;
        renderAlertsList();
    }
}

function populateAlertSectorsFilter() {
    const sectorFilter = document.getElementById('alertFilterSector');
    if (!sectorFilter) return;

    const currentVal = sectorFilter.value || 'TODOS';
    sectorFilter.replaceChildren(new Option('Todos os Setores', 'TODOS'));
    [...new Set(currentData.map(item => item.setor).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .forEach(sec => sectorFilter.add(new Option(sec, sec)));

    if ([...sectorFilter.options].some(opt => opt.value === currentVal)) {
        sectorFilter.value = currentVal;
    }
}

function updateHeaderAlertsBadge(explicitCount = null) {
    const badge = document.getElementById('headerAlertsBadge');
    if (!badge) return;

    let unreadCount = explicitCount;
    if (unreadCount === null) {
        const alerts = generateDeterministicAlerts();
        unreadCount = alerts.filter(a => !a.isRead).length;
    }

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function navigateToAlerts() {
    switchTab('intelligence');
    switchIntelligenceSubtab('alerts');
    const container = document.getElementById('alertsContainer') || document.getElementById('subtab-content-alerts');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderAlertsList() {
    const container = document.getElementById('alertsContainer');
    if (!container) return;

    populateAlertSectorsFilter();
    const allAlerts = generateDeterministicAlerts();

    // Contadores gerais (baseados no estado real da base)
    const counts = allAlerts.reduce((acc, a) => {
        acc[a.severity] = (acc[a.severity] || 0) + 1;
        if (!a.isRead) acc.unreadTotal += 1;
        return acc;
    }, { CRITICO: 0, ATENCAO: 0, INFORMATIVO: 0, unreadTotal: 0 });

    updateHeaderAlertsBadge(counts.unreadTotal);

    const elCrit = document.getElementById('alertsCountCritical');
    const elAtt = document.getElementById('alertsCountAttention');
    const elInfo = document.getElementById('alertsCountInfo');
    const badgeUnread = document.getElementById('subtabAlertsBadge');

    if (elCrit) elCrit.textContent = counts.CRITICO;
    if (elAtt) elAtt.textContent = counts.ATENCAO;
    if (elInfo) elInfo.textContent = counts.INFORMATIVO;
    if (badgeUnread) {
        badgeUnread.textContent = counts.unreadTotal;
        badgeUnread.className = counts.unreadTotal > 0
            ? 'ml-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-extrabold text-rose-300 animate-pulse'
            : 'ml-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400';
    }

    // Aplicação dos filtros do usuário
    const viewMode = document.getElementById('alertFilterView')?.value || 'unread';
    const severityFilter = document.getElementById('alertFilterSeverity')?.value || 'TODOS';
    const sectorFilter = document.getElementById('alertFilterSector')?.value || 'TODOS';

    const filtered = allAlerts.filter(alert => {
        if (viewMode === 'unread' && alert.isRead) return false;
        if (viewMode === 'read' && !alert.isRead) return false;
        if (severityFilter !== 'TODOS' && alert.severity !== severityFilter) return false;
        if (sectorFilter !== 'TODOS' && alert.sector !== sectorFilter) return false;
        return true;
    });

    // Ordenação: CRITICO primeiro, depois ATENCAO, depois INFORMATIVO
    const severityOrder = { CRITICO: 0, ATENCAO: 1, INFORMATIVO: 2 };
    filtered.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const counterSpan = document.getElementById('alertFilteredCount');
    if (counterSpan) counterSpan.textContent = filtered.length;

    container.replaceChildren();

    if (filtered.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'glass-card rounded-2xl p-8 text-center border border-dashed border-slate-700 text-slate-400 space-y-2';
        emptyMsg.innerHTML = `
            <div class="text-2xl text-emerald-400 mb-1"><i class="fa-solid fa-circle-check"></i></div>
            <div class="text-sm font-bold text-white">Nenhuma notificação correspondente encontrada</div>
            <p class="text-xs text-slate-400 max-w-md mx-auto">
                ${viewMode === 'unread' ? 'Parabéns! Todos os alertas deste recorte foram lidos ou não há condições ativas de risco.' : 'Nenhum alerta localizado com os filtros selecionados.'}
            </p>
        `;
        container.appendChild(emptyMsg);
        return;
    }

    const badgeConfig = {
        CRITICO: { label: 'CRÍTICO', icon: 'fa-triangle-exclamation', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', cardBorder: 'alert-card-critical' },
        ATENCAO: { label: 'ATENÇÃO', icon: 'fa-circle-exclamation', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', cardBorder: 'alert-card-attention' },
        INFORMATIVO: { label: 'INFORMATIVO', icon: 'fa-circle-info', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30', cardBorder: 'alert-card-info' }
    };

    filtered.forEach(alert => {
        const conf = badgeConfig[alert.severity] || badgeConfig.INFORMATIVO;
        const card = document.createElement('article');
        card.className = `alert-card ${conf.cardBorder} ${alert.isRead ? 'is-read' : ''} space-y-3`;

        card.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${conf.bg}">
                        <i class="fa-solid ${conf.icon}"></i> ${conf.label}
                    </span>
                    <span class="text-[11px] font-bold text-slate-300">
                        ${escapeHtml(alert.sector)}
                    </span>
                    <span class="text-slate-600">·</span>
                    <span class="text-[11px] text-amber-400 font-semibold">
                        Competência: ${escapeHtml(alert.competency)}
                    </span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                    <span class="text-[11px] text-slate-400"><i class="fa-regular fa-clock"></i> ${escapeHtml(alert.detectedAt)}</span>
                    <button type="button" onclick="toggleAlertReadState('${escapeHtml(alert.id)}')" title="${alert.isRead ? 'Marcar como não lido' : 'Marcar como lido e arquivar'}" class="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-[11px] font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white">
                        <i class="fa-solid ${alert.isRead ? 'fa-envelope-open text-slate-400' : 'fa-check text-emerald-400'}"></i>
                        <span>${alert.isRead ? 'Lido' : 'Marcar lido'}</span>
                    </button>
                </div>
            </div>

            <div>
                <h4 class="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
                    <span>${escapeHtml(alert.indicator)}</span>
                    <span class="text-[11px] font-normal text-slate-400">${escapeHtml(alert.title)}</span>
                </h4>
                <p class="text-xs leading-relaxed text-slate-200 font-medium bg-[#0A1329]/50 border border-slate-800 p-3 rounded-xl">
                    ${escapeHtml(alert.message)}
                </p>
            </div>

            <details class="text-xs text-slate-400 border-t border-slate-800/60 pt-2">
                <summary class="cursor-pointer font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5">
                    <i class="fa-solid fa-circle-nodes text-[11px]"></i> Ver diagnóstico técnico e recomendação
                </summary>
                <div class="mt-2.5 space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] leading-relaxed">
                    <p><strong class="text-slate-300">Explicação:</strong> ${escapeHtml(alert.technicalExplanation)}</p>
                    <p><strong class="text-slate-300">Cálculo Base:</strong> ${escapeHtml(alert.calculation)}</p>
                    <p><strong class="text-amber-400">Ação Sugerida:</strong> ${escapeHtml(alert.recommendation)}</p>
                    ${Number.isInteger(alert.indicatorIndex) && currentData[alert.indicatorIndex] ? `
                        <div class="pt-1">
                            <button type="button" onclick="openDetailModal(${alert.indicatorIndex})" class="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Inspecionar histórico do indicador no painel
                            </button>
                        </div>
                    ` : ''}
                </div>
            </details>
        `;

        container.appendChild(card);
    });
}

// CÁLCULOS ANALÍTICOS DINÂMICOS
function calcMetrics(item) {
    const monthly = getMonthlyData(item);
    const valid = monthly.values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (valid.length === 0) return { avg: null, min: null, max: null, last: null, lastMonth: '-', status: 'N/A', diff: 0 };
    
    const sum = valid.reduce((a, b) => a + b, 0);
    const avg = sum / valid.length;
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    
    const lastObj = getLastValid(monthly.values, monthly.labels);
    const last = lastObj.val;
    const first = valid[0] ?? last;
    const diff = (last !== null && first !== null) ? last - first : 0;
    const meta = item.meta === null || item.meta === undefined || item.meta === '' ? NaN : Number(item.meta);
    const direction = getIntelligenceDirection(item);
    const status = !Number.isFinite(meta) || !direction || direction === 'neutro' ? 'N/A'
        : (direction === 'menor_melhor' ? last <= meta : last >= meta) ? 'OK' : 'ACOMPANHAR';

    return { avg, min, max, last, lastMonth: lastObj.month, status, diff };
}

function fmtVal(val, unit = '') {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return '-';
    const numeric = Number(val);
    const minDecimals = unit === 'R$' ? 2 : Number.isInteger(numeric) ? 0 : 2;
    const formatted = numeric.toLocaleString('pt-BR', {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: 2
    });
    if (unit === 'R$') return `R$ ${formatted}`;
    if (unit === '%') return `${formatted}%`;
    return formatted;
}

// RENDERIZAÇÃO DOS KPIS D'GRANEL
function renderKPIs() {
    const kpiContainer = document.getElementById('kpiContainer');
    if (!kpiContainer) return;
    kpiContainer.innerHTML = '';

    document.getElementById('kpiTotalCount')?.replaceChildren(String(currentData.length));
    document.getElementById('kpiMonthsCount')?.replaceChildren(String(mesesLabels.length));

    kpiCards.filter(card => !card.deleted).forEach(c => {
        if (!dashboardHasWidget('kpi', c.id)) return;
        const indicator = currentData[c.indicator] || { valores: [] };
        const monthly = getMonthlyData(indicator);
        const last = getLastValid(monthly.values, monthly.labels);
        const unit = c.unit || indicator.und || '';
        const color = ['emerald', 'amber', 'rose', 'sky', 'violet'].includes(c.color) ? c.color : 'sky';
        const emojiDisplay = escapeHtml(c.emoji || '📊');
        const el = document.createElement('div');
        el.className = 'glass-card page-load-item rounded-2xl p-5 flex flex-col justify-between';
        const valueMarkup = last.val !== null && last.val !== undefined && Number.isFinite(Number(last.val))
            ? `<span data-count-to="${Number(last.val)}" data-count-unit="${unit === '%' ? '%' : ''}">0</span>`
            : '-';
        el.innerHTML = `
            <div class="flex items-start justify-between">
                <div>
                    <span class="text-xs text-slate-400 font-medium">${escapeHtml(c.title)}</span>
                    <div class="text-2xl font-extrabold text-white mt-1">${valueMarkup}${unit && unit !== '%' && valueMarkup !== '-' ? ` ${unit}` : ''}</div>
                </div>
                <div class="p-2.5 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-2xl">
                    <span>${emojiDisplay}</span>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center gap-2 text-xs">
                <span class="text-slate-400">Último: ${escapeHtml(last.month)}</span>
                <span class="text-slate-300">Meta: ${fmtVal(indicator.meta, unit === '%' ? '%' : '')}${unit && unit !== '%' && indicator.meta !== null && indicator.meta !== undefined ? ` ${unit}` : ''}</span>
            </div>
            <div class="flex justify-end gap-1 mt-3">
                <button onclick="openKpiModal(${escapeHtml(JSON.stringify(c.id))})" title="Editar Balão" class="p-1.5 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-lg transition text-xs"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteKpi(${escapeHtml(JSON.stringify(c.id))})" title="Excluir Balão" class="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg transition text-xs"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        kpiContainer.appendChild(el);
    });
    initPXStyleAnimations(kpiContainer);
}

function populateKpiIndicators(selectedIndex = null) {
    const select = document.getElementById('kpiConfigIndicator');
    select.innerHTML = '';
    currentData.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `[${item.setor}] ${item.indicador}`;
        option.selected = String(index) === String(selectedIndex);
        select.appendChild(option);
    });
}

function getKpiConfig(kpiId) {
    const defaults = {
        kpi1: { title: '% CRLV Liberados', indicator: currentData.findIndex(item => item.indicador.includes('% CRLV LIBERADOS')), unit: '%', color: 'emerald', icon: 'fa-file-check', badge: 'Regularização OK' },
        kpi2: { title: 'Score do Motorista', indicator: currentData.findIndex(item => item.indicador.includes('SCORE')), unit: 'pts', color: 'amber', icon: 'fa-star', badge: 'Em Elevação' },
        kpi3: { title: 'Excesso de Velocidade', indicator: currentData.findIndex(item => item.indicador.includes('velocidade permitida')), unit: '', color: 'rose', icon: 'fa-gauge-high', badge: 'Risco Operacional' },
        kpi4: { title: 'Multas Cobradas', indicator: currentData.findIndex(item => item.indicador.includes('Multas Cobradas Motoristas')), unit: '', color: 'amber', icon: 'fa-receipt', badge: 'Atenção Elevada' }
    };
    return { ...(defaults[kpiId] || {}), ...(kpiCards.find(card => card.id === kpiId) || {}) };
}

function openKpiModal(kpiId = null) {
    const config = kpiId ? getKpiConfig(kpiId) : { id: `kpi_${Date.now()}`, title: '', indicator: 0, unit: '', color: 'sky', emoji: '📊', icon: 'fa-chart-simple', badge: 'Personalizado' };
    document.getElementById('kpiConfigId').value = config.id;
    document.getElementById('kpiConfigTitle').value = config.title;
    document.getElementById('kpiConfigEmoji').value = config.emoji || '📊';
    document.getElementById('kpiConfigUnit').value = config.unit || '';
    document.getElementById('kpiConfigColor').value = config.color || 'sky';
    populateKpiIndicators(config.indicator);
    document.getElementById('modalKpiHeading').innerHTML = kpiId
        ? '<i class="fa-solid fa-pen-to-square text-amber-400"></i> Editar Balão'
        : '<i class="fa-solid fa-chart-simple text-amber-400"></i> Criar Balão';
    document.getElementById('modalKpiConfig').classList.remove('hidden');
}

function saveKpiConfig(event) {
    event.preventDefault();
    const id = document.getElementById('kpiConfigId').value;
    const emojiInput = document.getElementById('kpiConfigEmoji').value.trim();
    const config = {
        id,
        title: document.getElementById('kpiConfigTitle').value,
        indicator: parseInt(document.getElementById('kpiConfigIndicator').value),
        emoji: emojiInput || '📊',
        unit: document.getElementById('kpiConfigUnit').value,
        color: document.getElementById('kpiConfigColor').value,
        icon: id === 'kpi1' ? 'fa-file-check' : id === 'kpi2' ? 'fa-star' : id === 'kpi3' ? 'fa-gauge-high' : id === 'kpi4' ? 'fa-receipt' : 'fa-chart-simple',
        badge: id.startsWith('kpi_') ? 'Personalizado' : getKpiConfig(id).badge
    };
    const index = kpiCards.findIndex(card => card.id === id);
    if (index >= 0) kpiCards[index] = config;
    else kpiCards.push(config);
    const dashboard = getActiveDashboard();
    if (!dashboard.widgets.some(widget => widget.type === 'kpi' && widget.ref === id)) {
        dashboard.widgets.push({ id: `widget_${id}`, type: 'kpi', ref: id });
    }
    saveKpis();
    saveDashboards();
    closeModal('modalKpiConfig');
    renderDashboardTabs();
    renderKPIs();
}

function deleteKpi(kpiId) {
    fireThemedAlert({
        title: 'Excluir Indicador?',
        text: 'Este balão será removido do dashboard. Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        cancelButtonColor: '#1e293b',
        confirmButtonText: '<i class="fa-solid fa-trash"></i> Sim, excluir',
        cancelButtonText: 'Cancelar',
        background: '#111C38',
        color: '#f8fafc'
    }).then(result => {
        if (!result.isConfirmed) return;

        const defaultKpi = ['kpi1', 'kpi2', 'kpi3', 'kpi4'].includes(kpiId);
        if (defaultKpi) {
            const existing = getKpiConfig(kpiId);
            const index = kpiCards.findIndex(card => card.id === kpiId);
            const deleted = { ...existing, id: kpiId, deleted: true };
            if (index >= 0) kpiCards[index] = deleted;
            else kpiCards.push(deleted);
        } else {
            kpiCards = kpiCards.filter(card => card.id !== kpiId);
        }
        getActiveDashboard().widgets = getActiveDashboard().widgets.filter(widget => !(widget.type === 'kpi' && widget.ref === kpiId));
        saveKpis();
        saveDashboards();
        renderDashboardTabs();
        renderKPIs();

        fireThemedAlert({
            title: 'Indicador excluído!',
            text: 'O balão foi removido do dashboard.',
            icon: 'success',
            background: '#111C38',
            color: '#f8fafc',
            confirmButtonColor: '#EAB308'
        });
    });
}

// RENDERIZAÇÃO DOS GRÁFICOS PADRÃO
function renderCharts() {
    const dashboardView = document.getElementById('view-dashboard');
    if (dashboardView && dashboardView.classList.contains('hidden')) return;

    const crlvObj = currentData.find(d => d.indicador.includes('% CRLV LIBERADOS')) || { valores: [] };
    const scoreObj = currentData.find(d => d.indicador.includes('SCORE')) || { valores: [] };
    const multasObj = currentData.find(d => d.indicador.includes('Multas Cobradas Motoristas')) || { valores: [] };
    const acidentesObj = currentData.find(d => d.indicador.includes('Total de acidentes')) || { valores: [] };
    const velObj = currentData.find(d => d.indicador.includes('velocidade permitida')) || { valores: [] };
    const chartMonths = getDashboardChartData(crlvObj).labels.length > 0
        ? getDashboardChartData(crlvObj).labels
        : getSelectedDashboardMonthLabels(mesesLabels);
    const monthlyValues = item => getDashboardChartData(item).values;

    // Chart 1
    const ctx1 = document.getElementById('chart1').getContext('2d');
    if (chart1Inst) chart1Inst.destroy();
    chart1Inst = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: chartMonths,
            datasets: [
                { label: '% CRLV', data: monthlyValues(crlvObj), type: 'line', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.3, yAxisID: 'y1', unit: '%' },
                { label: 'Score Motorista', data: monthlyValues(scoreObj), type: 'line', borderColor: '#eab308', borderDash: [5, 5], tension: 0.3, yAxisID: 'y2', unit: 'pts' },
                { label: 'Acidentes', data: monthlyValues(acidentesObj), backgroundColor: 'rgba(244, 63, 94, 0.8)', borderRadius: 6, yAxisID: 'y3', unit: 'Qtd' },
                { label: 'Multas Motorista', data: monthlyValues(multasObj), backgroundColor: 'rgba(234, 179, 8, 0.7)', borderRadius: 6, yAxisID: 'y3', unit: 'R$' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8' } },
                tooltip: {
                    callbacks: {
                        label(context) {
                            const tooltipValue = context.parsed?.y ?? context.parsed?.x ?? context.parsed ?? 0;
                            const unit = resolveChartUnit(context.dataset || {});
                            return `${context.dataset.label || 'Valor'}: ${formatChartValue(tooltipValue, unit)}`;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y1: { position: 'left', min: 0, beginAtZero: true, max: 100, ticks: buildAxisTicks('%', '#94a3b8') },
                y2: { position: 'right', min: 0, beginAtZero: true, ticks: buildAxisTicks('pts', '#94a3b8'), grid: { drawOnChartArea: false } },
                y3: { position: 'right', min: 0, beginAtZero: true, ticks: buildAxisTicks(multasObj.und === 'R$' ? 'R$' : 'Qtd', '#94a3b8'), grid: { drawOnChartArea: false } }
            }
        }
    });

    // Chart 2 (Evolução da Frota)
    const cavaloObj = currentData.find(d => d.indicador.includes('cavalo mecânico')) || { valores: [] };
    const reboqueObj = currentData.find(d => d.indicador.includes('semirreboques')) || { valores: [] };
    const frotaTotal = chartMonths.map((_, i) => ((monthlyValues(cavaloObj)[i] || 0) + (monthlyValues(reboqueObj)[i] || 0)));

    const ctx2 = document.getElementById('chart2').getContext('2d');
    if (chart2Inst) chart2Inst.destroy();
    chart2Inst = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: chartMonths,
            datasets: [
                { label: 'Frota Ativa Total', data: frotaTotal, backgroundColor: 'rgba(56, 189, 248, 0.6)', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: '#38bdf8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { min: 0, beginAtZero: true, ticks: { color: '#38bdf8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });

    // Chart 3 (Radar D'Granel)
    const tacoObj = currentData.find(d => d.indicador.includes('Cronotacógrafo')) || { valores: [] };
    const desc40Obj = currentData.find(d => d.indicador.includes('40% de desconto')) || { valores: [] };

    const crlvValues = monthlyValues(crlvObj);
    const tacoValues = monthlyValues(tacoObj);
    const desc40Values = monthlyValues(desc40Obj);
    const crlvFirst = crlvValues[0] ?? 0;
    const tacoFirst = tacoValues[0] ?? 0;
    const descFirst = desc40Values[0] ?? 0;

    const crlvLastVal = getLastValid(crlvValues, chartMonths);
    const tacoLastVal = getLastValid(tacoValues, chartMonths);
    const descLastVal = getLastValid(desc40Values, chartMonths);

    const lastMonthLabel = crlvLastVal.month !== '-' ? crlvLastVal.month : chartMonths[chartMonths.length - 1];
    document.getElementById('radarSubTitle').textContent = `Comparativo ${chartMonths[0]} vs ${lastMonthLabel}`;

    const ctx3 = document.getElementById('chart3').getContext('2d');
    if (chart3Inst) chart3Inst.destroy();
    chart3Inst = new Chart(ctx3, {
        type: 'radar',
        data: {
            labels: ['CRLV (%)', 'Cronotacógrafo (%)', 'Multa Desc. 40% (%)'],
            datasets: [
                { label: chartMonths[0], data: [crlvFirst, tacoFirst, descFirst], borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.15)' },
                { label: lastMonthLabel, data: [crlvLastVal.val || 0, tacoLastVal.val || 0, descLastVal.val || 0], borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.25)' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: { r: { min: 0, beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#cbd5e1' }, ticks: { display: false } } }
        }
    });

    // Chart 4 (Sinistros vs Velocidade)
    const ctx4 = document.getElementById('chart4').getContext('2d');
    if (chart4Inst) chart4Inst.destroy();
    chart4Inst = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: chartMonths,
            datasets: [
                {
                    label: 'Excessos de Velocidade',
                    data: monthlyValues(velObj),
                    borderColor: '#eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    borderDash: [5, 5],
                    tension: 0.3,
                    yAxisID: 'yVel',
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Total de Sinistros',
                    data: monthlyValues(acidentesObj),
                    borderColor: '#f43f5e',
                    backgroundColor: '#f43f5e',
                    tension: 0.3,
                    yAxisID: 'ySin',
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                ySin: {
                    type: 'linear', position: 'left', min: 0, beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'Acidentes (Vol.)', color: '#94a3b8', font: { size: 10 } }
                },
                yVel: {
                    type: 'linear', position: 'right', min: 0, beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Infrações de Velocidade', color: '#94a3b8', font: { size: 10 } }
                }
            }
        }
    });
    renderConfiguredDefaultCharts();
}

// ================= SISTEMA DE GRÁFICOS PERSONALIZADOS =================
function openChartModal(chartId = null) {
    if (!chartId) editingDefaultChartId = null;
    populateChartConfigDropdowns();

    if (chartId) {
        const chartObj = customCharts.find(c => c.id === chartId);
        if (!chartObj) return;
        document.getElementById('modalChartHeading').innerHTML = '<i class="fa-solid fa-pen-to-square text-amber-400"></i> Editar Gráfico';
        document.getElementById('chartConfigId').value = chartObj.id;
        document.getElementById('chartConfigTitle').value = chartObj.title;
        document.getElementById('chartConfigDesc').value = chartObj.desc || '';
        document.getElementById('chartConfigType').value = chartObj.type;
        document.getElementById('chartConfigSpan').value = chartObj.span;
        document.getElementById('chartConfigInd1').value = chartObj.ind1;
        document.getElementById('chartConfigInd2').value = chartObj.ind2 || '';
        document.getElementById('chartConfigInd3').value = chartObj.ind3 ?? '';
        document.getElementById('chartConfigInd4').value = chartObj.ind4 ?? '';
        document.querySelector(`input[name="chartAxisMode"][value="${chartObj.axisMode || 'single'}"]`).checked = true;
    } else {
        document.getElementById('modalChartHeading').innerHTML = '<i class="fa-solid fa-chart-line text-amber-400"></i> Criar Gráfico Personalizado';
        document.getElementById('chartConfigId').value = '';
        document.getElementById('chartConfigTitle').value = '';
        document.getElementById('chartConfigDesc').value = '';
        document.getElementById('chartConfigType').value = 'line';
        document.getElementById('chartConfigSpan').value = '6';
        document.getElementById('chartConfigInd1').selectedIndex = 0;
        document.getElementById('chartConfigInd2').value = '';
        document.getElementById('chartConfigInd3').value = '';
        document.getElementById('chartConfigInd4').value = '';
        document.querySelector('input[name="chartAxisMode"][value="single"]').checked = true;
    }

    document.getElementById('modalChartConfig').classList.remove('hidden');
}

function populateChartConfigDropdowns() {
    const select1 = document.getElementById('chartConfigInd1');
    const select2 = document.getElementById('chartConfigInd2');
    const select3 = document.getElementById('chartConfigInd3');
    const select4 = document.getElementById('chartConfigInd4');

    select1.innerHTML = '';
    select2.innerHTML = '<option value="">Nenhum (Gráfico Único)</option>';
    select3.innerHTML = '<option value="">Nenhum</option>';
    select4.innerHTML = '<option value="">Nenhum</option>';

    currentData.forEach((item, index) => {
        const opt1 = document.createElement('option');
        opt1.value = index;
        opt1.textContent = `[${item.setor}] ${item.indicador}`;
        select1.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = index;
        opt2.textContent = `[${item.setor}] ${item.indicador}`;
        select2.appendChild(opt2);
        select3.appendChild(opt2.cloneNode(true));
        select4.appendChild(opt2.cloneNode(true));
    });
}

function saveCustomChart(e) {
    e.preventDefault();

    const id = document.getElementById('chartConfigId').value || 'chart_' + Date.now();
    const title = document.getElementById('chartConfigTitle').value;
    const desc = document.getElementById('chartConfigDesc').value;
    const type = document.getElementById('chartConfigType').value;
    const span = document.getElementById('chartConfigSpan').value;
    const ind1 = parseInt(document.getElementById('chartConfigInd1').value);
    const ind2Val = document.getElementById('chartConfigInd2').value;
    const ind2 = ind2Val !== '' ? parseInt(ind2Val) : null;
    const ind3Val = document.getElementById('chartConfigInd3').value;
    const ind3 = ind3Val !== '' ? parseInt(ind3Val) : null;
    const ind4Val = document.getElementById('chartConfigInd4').value;
    const ind4 = ind4Val !== '' ? parseInt(ind4Val) : null;
    const axisMode = document.querySelector('input[name="chartAxisMode"]:checked').value;

    const chartObject = { id, title, desc, type, span, ind1, ind2, ind3, ind4, axisMode };

    if (editingDefaultChartId) {
        defaultChartConfigs[editingDefaultChartId] = { ...chartObject, deleted: false };
        markStateDirty();
        editingDefaultChartId = null;
        closeModal('modalChartConfig');
        renderCharts();
        return;
    }

    const existingIdx = customCharts.findIndex(c => c.id === id);
    if (existingIdx !== -1) {
        customCharts[existingIdx] = chartObject;
    } else {
        customCharts.push(chartObject);
    }

    const dashboard = getActiveDashboard();
    if (!dashboard.widgets.some(widget => widget.type === 'custom-chart' && widget.ref === id)) {
        dashboard.widgets.push({ id: `widget_${id}`, type: 'custom-chart', ref: id });
    }

    saveCustomChartsStorage();
    saveDashboards();
    closeModal('modalChartConfig');
    renderDashboardTabs();
    renderDynamicCharts();
}

function deleteCustomChart(chartId) {
    if (confirm('Deseja realmente remover este gráfico personalizado?')) {
        customCharts = customCharts.filter(c => c.id !== chartId);
        dashboards.forEach(dashboard => {
            dashboard.widgets = dashboard.widgets.filter(widget => !(widget.type === 'custom-chart' && widget.ref === chartId));
        });
        saveCustomChartsStorage();
        saveDashboards();
        renderDashboardTabs();
        renderDynamicCharts();
    }
}

function renderDynamicCharts() {
    const container = document.getElementById('dynamicChartsContainer');
    
    Object.keys(dynamicChartInstances).forEach(key => {
        if (dynamicChartInstances[key]) {
            dynamicChartInstances[key].destroy();
        }
    });
    dynamicChartInstances = {};

    container.innerHTML = '';

    if (customCharts.length === 0) return;

    customCharts.forEach(c => {
        if (!dashboardHasWidget('custom-chart', c.id)) return;
        const indObj1 = currentData[c.ind1];
        if (!indObj1) return;

        const indicatorIndexes = [c.ind1, c.ind2, c.ind3, c.ind4]
            .filter(index => index !== null && index !== undefined && !isNaN(index));
        const indicatorObjects = indicatorIndexes.map(index => currentData[index]).filter(Boolean);
        const indObj2 = indicatorObjects[1] || null;
        const chartMonthData = getDashboardChartData(indObj1);
        const chartLabels = chartMonthData.labels.length > 0
            ? chartMonthData.labels
            : getSelectedDashboardMonthLabels(mesesLabels);
        const usesIndependentAxes = c.axisMode === 'independent' && indicatorObjects.length > 1;

        const wrapper = document.createElement('div');
        wrapper.className = `lg:col-span-${c.span} glass-card rounded-2xl p-5 flex flex-col`;
        
        wrapper.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h4 class="text-sm font-bold text-white flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        ${escapeHtml(c.title)}
                    </h4>
                    <p class="text-xs text-slate-400">${escapeHtml(c.desc || 'Gráfico Personalizado')}</p>
                </div>
                <div class="flex items-center gap-1">
                    <button onclick="downloadChart(${escapeHtml(JSON.stringify(`canvas_${c.id}`))}, ${escapeHtml(JSON.stringify(c.title || `Grafico_${c.id}`))})" title="Baixar Gráfico em PNG" class="p-1.5 bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 rounded-lg transition text-xs">
                        <i class="fa-solid fa-download"></i>
                    </button>
                    <button onclick="openChartModal(${escapeHtml(JSON.stringify(c.id))})" title="Editar Gráfico" class="p-1.5 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-lg transition text-xs">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="deleteCustomChart(${escapeHtml(JSON.stringify(c.id))})" title="Excluir Gráfico" class="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg transition text-xs">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="relative flex-1 min-h-[280px]">
                <canvas id="canvas_${c.id}"></canvas>
            </div>
        `;

        container.appendChild(wrapper);

        const datasetColors = ['#eab308', '#10b981', '#38bdf8', '#f43f5e'];
        const datasets = indicatorObjects.map((indicator, index) => ({
            label: indicator.indicador,
            data: getDashboardChartData(indicator).values,
            borderColor: datasetColors[index],
            backgroundColor: c.type === 'doughnut'
                ? ['#eab308', '#10b981', '#38bdf8', '#f43f5e']
                : `${datasetColors[index]}33`,
            borderWidth: 2,
            tension: 0.3,
            fill: c.type === 'area',
            unit: indicator.und || '',
            yAxisID: usesIndependentAxes ? `y${index + 1}` : 'y'
        }));

        let maxValue = 0;
        if (indicatorObjects.length > 1 && !usesIndependentAxes) {
            indicatorObjects.forEach(indicator => {
                const values = getDashboardChartData(indicator).values.filter(v => v !== null && v !== undefined && !isNaN(v));
                if (values.length > 0) {
                    maxValue = Math.max(maxValue, Math.max(...values));
                }
            });
            maxValue = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 100; // Adiciona 10% de margem
        }

        const scalesObj = {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        };

        if (c.type !== 'radar' && c.type !== 'doughnut' && c.type !== 'polarArea') {
            if (indicatorObjects.length > 1) {
                if (usesIndependentAxes) {
                    indicatorObjects.forEach((_, index) => {
                        const yAxisId = `y${index + 1}`;
                        const position = index % 2 === 0 ? 'left' : 'right';

                        scalesObj[yAxisId] = {
                            type: 'linear',
                            display: true,
                            position,
                            min: 0,
                            beginAtZero: true,
                            grace: '10%',
                            ticks: {
                                color: datasetColors[index % datasetColors.length],
                                font: { size: 10, weight: 'bold' },
                                callback: value => formatChartValue(value, indicatorObjects[index]?.und || '')
                            },
                            grid: {
                                drawOnChartArea: index === 0,
                                color: 'rgba(255, 255, 255, 0.05)'
                            }
                        };
                    });
                } else {
                    scalesObj.y = {
                        min: 0,
                        max: maxValue > 0 ? maxValue : undefined,
                        beginAtZero: true,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        title: { display: true, text: 'Valores Comparativos', color: '#94a3b8', font: { size: 10, weight: 'bold' } }
                    };
                }
            } else {
                scalesObj.y = { min: 0, beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Valores', color: '#94a3b8', font: { size: 10, weight: 'bold' } } };
            }
        } else if (c.type === 'radar') {
            scalesObj.r = { min: 0, beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#cbd5e1' }, ticks: { display: false } };
        }
        if (c.type === 'horizontalBar') {
            scalesObj.x = { min: 0, beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } };
            scalesObj.y = { ticks: { color: '#94a3b8' } };
        }

        const ctx = document.getElementById(`canvas_${c.id}`).getContext('2d');
        dynamicChartInstances[c.id] = new Chart(ctx, {
            type: getChartJsType(c.type),
            data: {
                labels: chartLabels,
                datasets: datasets
            },
            options: {
                ...getChartTypeOptions(c.type, scalesObj)
            }
        });
    });
    initPXStyleAnimations(container);
}

// POPULAR DROPDOWN SETORES
function populateSetoresDropdown() {
    syncSectorsFromData();
    const select = document.getElementById('setorFilter');
    select.innerHTML = '<option value="TODOS">Todos os Setores</option>';
    sectors.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        select.appendChild(opt);
    });

    document.getElementById('statSetoresCount').textContent = sectors.length;
}

// GERAR CABEÇALHO DINÂMICO DA TABELA
function renderTableHeader() {
    const headerRow = document.getElementById('tableHeaderRow');
    let html = `
        <th class="py-3 px-3">Ações</th>
        <th class="py-3 px-3">Setor</th>
        <th class="py-3 px-3">Indicador</th>
        <th class="py-3 px-2 text-center">Meta</th>
        <th class="py-3 px-2 text-center">Unid.</th>
    `;

    mesesLabels.forEach((m, idx) => {
        const isLast = idx === mesesLabels.length - 1;
        html += `<th class="py-3 px-2 text-right ${isLast ? 'text-amber-300 font-bold' : ''}">${m}</th>`;
    });

    html += `
        <th class="py-3 px-3 text-right bg-amber-950/20">Média</th>
        <th class="py-3 px-3 text-center bg-amber-950/20">Min / Max</th>
        <th class="py-3 px-3 text-center">Tendência</th>
        <th class="py-3 px-3 text-center">Status</th>
    `;

    headerRow.innerHTML = html;
}

// RENDERIZAÇÃO DA TABELA DE CONSULTA COM MESES DINÂMICOS
function getIndicatorTooltip(indicator) {
    const name = String(indicator || '').toLowerCase();
    if (name.includes('score')) return 'Pontuação mensal de condução segura; referência operacional: 600 pontos ou mais.';
    if (name.includes('crlv')) return 'Percentual de veículos da frota com Certificado de Registro e Licenciamento de Veículo liberado.';
    if (name.includes('acidente') && (name.includes('milhao') || name.includes('milhão'))) return 'Quantidade de acidentes normalizada por milhão de quilômetros rodados.';
    return '';
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    const search = document.getElementById('searchInput').value.toLowerCase();
    const setorSel = document.getElementById('setorFilter').value;
    const statusSel = document.getElementById('statusFilter').value;
    const unitSel = document.getElementById('unitFilter').value;

    let okCount = 0;
    let offCount = 0;

    const filtered = currentData.filter((item) => {
        const m = calcMetrics(item);
        if (m.status === 'OK') okCount++;
        if (m.status === 'ACOMPANHAR') offCount++;

        const matchSearch = item.indicador.toLowerCase().includes(search) || item.setor.toLowerCase().includes(search);
        const matchSetor = setorSel === 'TODOS' || item.setor === setorSel;
        const matchStatus = statusSel === 'TODOS' || m.status === statusSel;
        const matchUnit = unitSel === 'TODOS' || item.und === unitSel;

        return matchSearch && matchSetor && matchStatus && matchUnit;
    });

    document.getElementById('statTotalRows').textContent = currentData.length;
    document.getElementById('statMetaOk').textContent = `${((okCount / (currentData.length || 1)) * 100).toFixed(0)}%`;
    document.getElementById('statMetaOff').textContent = offCount;
    document.getElementById('filteredCount').textContent = filtered.length;

    filtered.forEach(item => {
        const origIndex = currentData.indexOf(item);
        const m = calcMetrics(item);
        const monthly = getMonthlyData(item);

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/50 transition border-b border-slate-800/40';

        let trendIcon = '<i class="fa-solid fa-minus text-slate-500"></i>';
        if (m.diff > 0) trendIcon = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-arrow-trend-up"></i> +${fmtVal(m.diff)}</span>`;
        if (m.diff < 0) trendIcon = `<span class="text-rose-400 font-bold"><i class="fa-solid fa-arrow-trend-down"></i> ${fmtVal(m.diff)}</span>`;

        let badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">N/A</span>';
        if (m.status === 'OK') badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">OK</span>';
        if (m.status === 'ACOMPANHAR') badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">ABAIXO</span>';

        let valoresTdHtml = '';
        monthly.labels.forEach((_, idx) => {
            const val = monthly.values[idx] !== undefined ? monthly.values[idx] : null;
            const isLast = idx === monthly.labels.length - 1;
            valoresTdHtml += `<td class="py-2.5 px-2 text-right font-mono text-[11px] ${isLast ? 'font-bold text-amber-300' : ''}">${fmtVal(val)}</td>`;
        });

        tr.innerHTML = `
            <td class="py-2.5 px-3">
                <div class="flex items-center gap-1">
                    <button onclick="openDetailModal(${origIndex})" title="Inspecionar indicador" aria-label="Inspecionar ${escapeHtml(item.indicador)}" class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-amber-500 hover:text-slate-950"><i class="fa-solid fa-eye text-xs" aria-hidden="true"></i></button>
                    <button onclick="openEditModal(${origIndex})" title="Editar indicador" aria-label="Editar ${escapeHtml(item.indicador)}" class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-slate-700"><i class="fa-solid fa-pen text-xs" aria-hidden="true"></i></button>
                    <button onclick="deleteIndicator(${origIndex})" title="Excluir indicador" aria-label="Excluir ${escapeHtml(item.indicador)}" class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-rose-400 transition hover:bg-rose-900/60"><i class="fa-solid fa-trash text-xs" aria-hidden="true"></i></button>
                </div>
            </td>
            <td class="py-2.5 px-3 font-medium text-slate-400 text-[11px]">${escapeHtml(item.setor)}</td>
            <td title="${escapeHtml(getIndicatorTooltip(item.indicador))}" class="py-2.5 px-3 font-semibold text-white text-[11px]">${escapeHtml(item.indicador)}</td>
            <td class="py-2.5 px-2 text-center font-mono text-slate-400 text-[11px]">${item.meta !== null ? escapeHtml(fmtVal(item.meta, item.und)) : '-'}</td>
            <td class="py-2.5 px-2 text-center text-slate-400 text-[11px]">${escapeHtml(item.und)}</td>
            ${valoresTdHtml}
            <td class="py-2.5 px-3 text-right font-mono font-semibold bg-amber-950/20 text-slate-200 text-[11px]">${fmtVal(m.avg, item.und)}</td>
            <td class="py-2.5 px-3 text-center font-mono text-[10px] text-slate-400 bg-amber-950/20">${fmtVal(m.min)} / ${fmtVal(m.max)}</td>
            <td class="py-2.5 px-3 text-center text-[10px]">${trendIcon}</td>
            <td class="py-2.5 px-3 text-center">${badge}</td>
        `;
        tbody.appendChild(tr);
    });
}

// INSPEÇÃO DETALHADA
function openDetailModal(index) {
    const modal = document.getElementById('modalDetail');
    modal.classList.remove('hidden');
    refreshDetailModal(index);
}

function refreshDetailModal(index) {
    const item = currentData[index];
    const modal = document.getElementById('modalDetail');
    if (!item || !modal || modal.classList.contains('hidden')) return;

    detailModalIndex = index;
    const m = calcMetrics(item);
    const chartMonthData = getMonthlyData(item);
    const chartLabels = chartMonthData.labels;

    document.getElementById('modalDetailSetor').textContent = item.setor;
    document.getElementById('modalDetailTitle').textContent = item.indicador;
    document.getElementById('modalDetailUpdatedAt').textContent = `Última atualização: ${formatIndicatorUpdatedAt(item.ultimaAtualizacao)}`;
    document.getElementById('modalDetailMeta').textContent = fmtVal(item.meta, item.und);
    document.getElementById('modalDetailLastLabel').textContent = `Último Valor (${m.lastMonth})`;
    document.getElementById('modalDetailLast').textContent = fmtVal(m.last, item.und);
    document.getElementById('modalDetailAvg').textContent = fmtVal(m.avg, item.und);
    document.getElementById('modalDetailDiffLabel').textContent = `Variação (${mesesLabels[0]} -> ${m.lastMonth})`;
    document.getElementById('modalDetailDiff').textContent = fmtVal(m.diff, item.und);

    // Tabela do Modal
    const head = document.getElementById('modalDetailTableHead');
    head.innerHTML = `<tr>${chartLabels.map(m => `<th class="p-2.5 text-center">${m}</th>`).join('')}</tr>`;

    const tbl = document.getElementById('modalDetailTable');
    tbl.innerHTML = `<tr>${chartMonthData.values.map(value => `<td class="p-2.5 text-center text-slate-200">${fmtVal(value)}</td>`).join('')}</tr>`;

    const canvas = document.getElementById('modalDetailChart');
    if (!canvas) return;

    if (modalChartInst) {
        modalChartInst.data.labels = chartLabels;
        modalChartInst.data.datasets[0].label = item.indicador;
        modalChartInst.data.datasets[0].data = chartMonthData.values;
        modalChartInst.update('none');
        modalChartInst.resize();
        return;
    }

    requestAnimationFrame(() => {
        if (modal.classList.contains('hidden') || detailModalIndex !== index || modalChartInst) return;
        modalChartInst = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: item.indicador,
                    data: chartMonthData.values,
                    borderColor: '#eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#94a3b8' } },
                    y: { min: 0, beginAtZero: true, ticks: { color: '#94a3b8' } }
                }
            }
        });
    });
}

// GERAR CAMPOS DE INPUT MENSAIS NO FORMULÁRIO DE EDIÇÃO
function renderMonthlyInputs(valoresArray = []) {
    const container = document.getElementById('monthlyInputsContainer');
    container.innerHTML = '';

    mesesLabels.forEach((mes, idx) => {
        const val = (valoresArray[idx] !== undefined && valoresArray[idx] !== null) ? valoresArray[idx] : '';
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="val_${idx}" class="text-[10px] text-slate-400 block mb-0.5">${escapeHtml(mes)}</label>
            <input type="number" step="any" id="val_${idx}" value="${val}" class="w-full bg-[#070D1E] border border-slate-700 text-slate-100 text-xs rounded-lg p-2 font-mono">
        `;
        container.appendChild(div);
    });
}

// CRIAR / EDITAR INDICADOR
function openNewIndicatorModal() {
    document.getElementById('modalEditHeading').textContent = 'Novo Indicador';
    document.getElementById('editIndex').value = '-1';
    populateSectorSelect();
    document.getElementById('editIndicador').value = '';
    document.getElementById('editMeta').value = '';
    document.getElementById('editUnd').value = 'Qtd';
    document.getElementById('editDirection').value = '';
    
    renderMonthlyInputs([]);
    document.getElementById('modalEdit').classList.remove('hidden');
}

function openEditModal(index) {
    const item = currentData[index];
    const monthly = getMonthlyData(item);
    document.getElementById('modalEditHeading').textContent = 'Editar Indicador';
    document.getElementById('editIndex').value = index;
    populateSectorSelect(item.setor);
    document.getElementById('editIndicador').value = item.indicador;
    document.getElementById('editMeta').value = item.meta ?? '';
    document.getElementById('editUnd').value = item.und;
    document.getElementById('editDirection').value = getIntelligenceDirection(item) || '';
    
    renderMonthlyInputs(monthly.values);
    document.getElementById('modalEdit').classList.remove('hidden');
}

async function saveIndicatorForm(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('editIndex').value);
    const metaInput = document.getElementById('editMeta').value.trim();
    const vals = [];

    mesesLabels.forEach((_, i) => {
        const inputEl = document.getElementById(`val_${i}`);
        const v = inputEl ? inputEl.value : '';
        vals.push(v !== '' ? parseFloat(v) : null);
    });

    const newItem = {
        setor: document.getElementById('editSetor').value,
        indicador: document.getElementById('editIndicador').value,
        meta: metaInput === '' ? null : Number(metaInput),
        und: document.getElementById('editUnd').value,
        direcaoDesempenho: document.getElementById('editDirection').value || null,
        valores: vals
    };

    const previousItem = idx >= 0 ? currentData[idx] : null;
    const updatedAt = new Date().toISOString();
    const competencyChanges = compareIndicatorCompetencies(previousItem, newItem, mesesLabels, mesesLabels);
    if (indicatorValuesChanged(previousItem, newItem.valores)) {
        newItem.ultimaAtualizacao = updatedAt;
    } else if (previousItem?.ultimaAtualizacao) {
        newItem.ultimaAtualizacao = previousItem.ultimaAtualizacao;
    }

    if (idx === -1) {
        currentData.push(newItem);
    } else {
        currentData[idx] = newItem;
    }

    saveData(currentData);
    if (competencyChanges.length) {
        await logCompetencyChanges('ALTERAÇÃO DE VALORES', competencyChanges, updatedAt);
    } else {
        await registrarLog(idx === -1 ? 'CRIAÇÃO DE INDICADOR' : 'ATUALIZAÇÃO DE CADASTRO', `Indicador: ${newItem.indicador} · Setor: ${newItem.setor} · Sem alteração de valores mensais.`);
    }
    closeModal('modalEdit');
    initSystem();
}

async function deleteIndicator(index) {
    const item = currentData[index];
    if (!item || !confirm(`Tem certeza que deseja excluir o indicador "${item.indicador}"?`)) return;

    const indicatorName = item.indicador;
    currentData.splice(index, 1);
    saveData(currentData);
    await registrarLog('EXCLUSÃO DE INDICADOR', `Indicador excluído: ${indicatorName}`);
    initSystem();
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (id === 'modalDetail') {
        detailModalIndex = null;
        if (modalChartInst) {
            modalChartInst.destroy();
            modalChartInst = null;
        }
    }
}

document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveCurrentState();
        return;
    }

    if (event.key !== 'Escape') return;

    ['modalDetail', 'modalEdit', 'modalChartConfig', 'modalKpiConfig'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal && !modal.classList.contains('hidden')) closeModal(id);
    });
    document.getElementById('headerToolsMenu')?.removeAttribute('open');
});

async function registrarLog(acao, detalhes = '') {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return false;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_PUBLISHABLE_KEY,
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                user_email: session.user.email,
                acao,
                detalhes
            })
        });

        if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);
        return true;
    } catch (error) {
        console.error('Erro ao registrar log de auditoria:', error);
        return false;
    }
}

async function carregarLogsAuditoria() {
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Carregando logs...</td></tr>';

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Entre para consultar os logs de auditoria.</td></tr>';
            return;
        }

        const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs?select=*&order=created_at.desc&limit=50`, {
            headers: {
                'apikey': SUPABASE_PUBLISHABLE_KEY,
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);

        const logs = await response.json();
        tbody.replaceChildren();
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Nenhum log registrado ainda.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-800/50 transition border-b border-slate-800/40';
            const formattedDate = new Date(log.created_at).toLocaleString('pt-BR');
            const values = [formattedDate, log.user_email || 'Sistema', log.acao || '-', log.detalhes || '-'];

            values.forEach((value, index) => {
                const cell = document.createElement('td');
                cell.className = index === 1
                    ? 'p-3 text-amber-400'
                    : index === 0
                        ? 'p-3 text-slate-400'
                        : index === 2
                            ? 'p-3 font-semibold text-white'
                            : 'p-3 min-w-[360px] whitespace-pre-wrap break-words text-slate-300';
                cell.textContent = value;
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar logs de auditoria:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-rose-400">Erro ao carregar os logs de auditoria.</td></tr>';
    }
}

// AUDITORIA JSON
function updateJSONEditor() {
    document.getElementById('jsonEditor').value = JSON.stringify(currentData, null, 2);
}

function copyRawJSON() {
    navigator.clipboard.writeText(document.getElementById('jsonEditor').value);
    showAlert('Sucesso!', 'JSON copiado para a área de transferência!', 'success');
}

function applyRawJSON() {
    try {
        const parsed = JSON.parse(document.getElementById('jsonEditor').value);
        if (!Array.isArray(parsed)) throw new Error('A raiz do JSON deve ser uma lista de indicadores.');
        const previousData = currentData;
        const updatedAt = new Date().toISOString();
        const updatedData = applyIndicatorUpdateMetadata(parsed, previousData, updatedAt);
        const competencyChanges = collectCompetencyChanges(previousData, updatedData, mesesLabels, mesesLabels);
        saveData(updatedData);
        initSystem();
        logCompetencyChanges(competencyChanges.length ? 'ALTERAÇÃO DE VALORES VIA JSON' : 'IMPORTAÇÃO JSON', competencyChanges, updatedAt, `Editor JSON; ${updatedData.length} indicadores`);
        showAlert('Sucesso!', 'Alterações salvas com sucesso!', 'success');
    } catch(error) {
        showAlert('Erro na validação', error.message || 'Verifique a sintaxe do JSON.', 'error');
    }
}

// IMPORTAR / EXPORTAR DADOS
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('csvFileInput');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, p => { p.preventDefault(); p.stopPropagation(); }));
    dropZone.addEventListener('drop', e => { if (e.dataTransfer.files.length) processCSV(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files.length) processCSV(e.target.files[0]); });
}

// Limpeza de caracteres invisíveis e BOM do Excel
function cleanStr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/^\ufeff/, '').trim();
}

// Leitor numérico flexível (suporta %, R$, vírgula e ponto)
function parsePtNum(val) {
    if (val === null || val === undefined) return null;
    let str = cleanStr(val).replace(/%/g, '').replace(/R\$/g, '').trim();
    if (str === '' || str === '-' || str.toLowerCase() === 'none' || str.startsWith('#')) return null;
    
    // Converte formato brasileiro (1.234,56) para float padrão (1234.56)
    if (str.includes(',')) {
str = str.replace(/\./g, '').replace(',', '.');
    }
    let num = parseFloat(str);
    return isNaN(num) ? null : num;
}

function normalizeIndicatorDirection(value) {
    const normalized = String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s-]+/g, '_');
    if (['menor_melhor', 'menor_e_melhor', 'menor', 'lower_is_better'].includes(normalized)) return 'menor_melhor';
    if (['maior_melhor', 'maior_e_melhor', 'maior', 'higher_is_better'].includes(normalized)) return 'maior_melhor';
    if (['neutro', 'neutra', 'neutral', 'nao_definida', 'sem_direcao'].includes(normalized)) return 'neutro';
    return null;
}

function getIndicatorIdentity(sector, indicator) {
    const normalize = value => String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `${normalize(sector)}::${normalize(indicator)}`;
}

function groupIndicatorsByIdentity(indicators) {
    const groups = new Map();
    (Array.isArray(indicators) ? indicators : []).forEach(item => {
        const identity = getIndicatorIdentity(item.setor, item.indicador);
        if (!groups.has(identity)) groups.set(identity, []);
        groups.get(identity).push(item);
    });
    return groups;
}

function mergeImportedIndicators(previousIndicators, importedIndicators, previousMonths, importedMonths) {
    const mergedMonths = [...new Set([...previousMonths, ...importedMonths])];
    const importedGroups = groupIndicatorsByIdentity(importedIndicators);
    const consumed = new Map();
    const mergedIndicators = previousIndicators.map(previous => {
        const identity = getIndicatorIdentity(previous.setor, previous.indicador);
        const occurrence = consumed.get(identity) || 0;
        consumed.set(identity, occurrence + 1);
        const incoming = importedGroups.get(identity)?.[occurrence];
        const values = mergedMonths.map(month => importedMonths.includes(month)
            ? getValueForCompetency(incoming, month, importedMonths)
            : getValueForCompetency(previous, month, previousMonths));

        return { ...previous, valores: values };
    });

    importedGroups.forEach((items, identity) => {
        const alreadyConsumed = consumed.get(identity) || 0;
        items.slice(alreadyConsumed).forEach(incoming => {
            mergedIndicators.push({
                ...incoming,
                valores: mergedMonths.map(month => importedMonths.includes(month)
                    ? getValueForCompetency(incoming, month, importedMonths)
                    : null)
            });
        });
    });

    return { indicators: mergedIndicators, months: mergedMonths };
}

// Processador de arquivo com detecção de encoding UTF-8 / ISO
function processCSV(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
let content = e.target.result;
if (content.includes('\uFFFD')) {
    const r2 = new FileReader();
    r2.onload = (e2) => parseCSVContent(e2.target.result, file.name);
    r2.readAsText(file, "ISO-8859-1");
} else {
    parseCSVContent(content, file.name);
}
    };
    reader.readAsText(file, "UTF-8");
}

// Parser universal flexível
function parseCSVContent(csvText, sourceName = "CSV", silencioso = false) {
    Papa.parse(csvText, {
skipEmptyLines: 'greedy',
complete: function(results) {
    const rows = results.data;
    let newParsed = [];
    let headerIndex = -1;

    // Busca inteligente pelo cabeçalho (independe de acento ou caixa alta/baixa)
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i].map(c => cleanStr(c).toLowerCase());
        const temSetor = r.some(c => c === 'setor');
        const temIndicador = r.some(c => c.includes('indicador'));
        
        if (temSetor && temIndicador) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        showAlert('Cabeçalho não encontrado', "Não foi possível identificar o cabeçalho com 'Setor' e 'Indicador' na planilha.", 'error');
        return;
    }

    const headerRow = rows[headerIndex].map(c => cleanStr(c));
    const previousMonths = [...mesesLabels];
    const previousData = currentData;
    const normalizedHeaders = headerRow.map(header => header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, ''));
    const directionColumnIndex = normalizedHeaders.findIndex(header => ['direcao', 'direcaodesempenho', 'direcaodedesempenho'].includes(header));
    const savedDirections = groupIndicatorsByIdentity(previousData);
    const directionOccurrences = new Map();
    
    // Identifica onde começam os meses sem tratar a coluna Ano como dado mensal
    const metadataHeaders = new Set([
        'setor', 'indicador', 'meta', 'und', 'unidade', 'direcao', 'direção', 'direcao de desempenho', 'ano'
    ]);
    const monthRegex = /^(jan|janeiro|fev|fevereiro|mar|março|marco|abr|abril|mai|maio|jun|junho|jul|julho|ago|agosto|setembro|out|outubro|nov|novembro|dez|dezembro|\d{1,2}\/\d{2,4})/i;
    let valStartIdx = -1;
    let lastMetadataIdx = -1;

    headerRow.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (metadataHeaders.has(normalizedHeader)) lastMetadataIdx = index;
        if (valStartIdx === -1 && monthRegex.test(normalizedHeader)) valStartIdx = index;
    });

    // A planilha sem nomes de mês ainda deve ignorar todas as colunas de cadastro.
    if (valStartIdx === -1) valStartIdx = lastMetadataIdx + 1;

    const monthIndexes = headerRow
        .map((header, index) => ({ header, index }))
        .filter(({ header, index }) => index >= valStartIdx && isMonthLabel(header));
    const extractedMonths = monthIndexes.map(({ header }) => header);

    // Extrai as linhas de dados
    for (let i = headerIndex + 1; i < rows.length; i++) {
        const row = rows[i].map(c => cleanStr(c));
        if (row.length > 1 && row[0] !== '') {
            const identity = getIndicatorIdentity(row[0], row[1] || '');
            const occurrence = directionOccurrences.get(identity) || 0;
            directionOccurrences.set(identity, occurrence + 1);
            const direction = directionColumnIndex >= 0
                ? normalizeIndicatorDirection(row[directionColumnIndex])
                : getIntelligenceDirection(savedDirections.get(identity)?.[occurrence]) || null;
            newParsed.push({
                setor: row[0],
                indicador: row[1] || '',
                meta: parsePtNum(row[2]),
                und: row[3] || 'Qtd',
                direcaoDesempenho: direction,
                valores: monthIndexes.map(({ index }) => parsePtNum(row[index]))
            });
        }
    }

    if (newParsed.length > 0) {
        const merged = mergeImportedIndicators(previousData, newParsed, previousMonths, extractedMonths);
        const nextMonths = merged.months;
        const updatedAt = new Date().toISOString();
        const updatedData = applyIndicatorUpdateMetadata(merged.indicators, previousData, updatedAt);
        const competencyChanges = collectCompetencyChanges(previousData, updatedData, previousMonths, nextMonths);
        if (nextMonths.length) syncMonthLabels(nextMonths);
        saveData(updatedData);
        initSystem();
        logCompetencyChanges(competencyChanges.length ? 'ALTERAÇÃO DE VALORES VIA CSV' : 'IMPORTAÇÃO CSV', competencyChanges, updatedAt, `${sourceName}; ${updatedData.length} indicadores`);
        if (!silencioso) {
            showAlert('Sucesso!', `${updatedData.length} indicadores atualizados com ${mesesLabels.length} meses.`, 'success');
        }
    } else {
        if (!silencioso) {
            showAlert('Nenhum dado válido', 'Nenhum dado válido encontrado abaixo da linha de cabeçalho.', 'warning');
        }
    }
}
    });
}

function exportToCSV() {
    const headers = ['Setor', 'Indicador', 'Meta', 'Und.', 'Direção', ...mesesLabels];
    const escapeCSV = value => {
        const text = value === null || value === undefined ? '' : String(value);
        return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const rows = currentData.map(item => [
        item.setor,
        item.indicador,
        item.meta,
        item.und,
        item.direcaoDesempenho || '',
        ...mesesLabels.map((_, index) => item.valores?.[index] ?? '')
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(escapeCSV).join(';'))
        .join('\r\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

    link.href = url;
    link.download = `dashboard-operacional-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}


function resetData() {
    fireThemedAlert({
        title: 'Restaurar dados padrões?',
        text: 'Os dados atuais e a logo personalizada serão substituídos pelos dados originais da D\'Granel. Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        cancelButtonColor: '#1e293b',
        confirmButtonText: '<i class="fa-solid fa-rotate-left"></i> Sim, restaurar',
        cancelButtonText: 'Cancelar',
        background: '#111C38',
        color: '#f8fafc'
    }).then(result => {
        if (!result.isConfirmed) return;

        resetLogo();
        mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
        loadStoredData();
        loadStoredSectors();
        loadStoredCharts();
        loadStoredKpis();
        loadStoredDefaultCharts();
        loadStoredDashboards();
        activeDashboardId = dashboards[0].id;
        showDataLabels = false;
        applyTheme('dark');
        initSystem();
        markStateDirty();
        registrarLog('RESTAURAÇÃO DE DADOS', 'Dados padrões restaurados.');

        fireThemedAlert({
            title: 'Dados restaurados!',
            text: 'Os dados padrões foram carregados.',
            icon: 'success',
            background: '#111C38',
            color: '#f8fafc',
            confirmButtonColor: '#EAB308'
        });
    });
}

// ==========================================
// CENTRAL DE IA — GROQ PRINCIPAL, GEMINI E OPENAI ALTERNATIVOS
// ==========================================

let currentAiProvider = 'groq';

/**
 * Altera o provedor sem remover as alternativas; o padrão inicial é Groq.
 */
function setAiProvider(provider) {
    const prov = ['openai','gemini','groq'].includes(provider) ? provider : 'groq';
    currentAiProvider = prov;
    if (prov !== 'groq') document.getElementById('aiAlternativeProviders')?.setAttribute('open','');

    const btnGemini = document.getElementById('provider-btn-gemini');
    const btnOpenai = document.getElementById('provider-btn-openai');
    const btnGroq   = document.getElementById('provider-btn-groq');
    const badgeGemini = document.getElementById('badge-provider-gemini');
    const badgeOpenai = document.getElementById('badge-provider-openai');
    const badgeGroq   = document.getElementById('badge-provider-groq');
    const label = document.getElementById('currentProviderLabel');
    const apiInfo = document.getElementById('currentProviderApiInfo');
    const promptLabel = document.getElementById('aiPromptLabel');
    const btnText = document.getElementById('aiTestButtonText');

    // Reset all provider buttons to inactive style
    const inactiveClass = 'flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white';
    if (btnGemini) btnGemini.className = inactiveClass;
    if (btnOpenai) btnOpenai.className = inactiveClass;
    if (btnGroq)   btnGroq.className   = inactiveClass;
    if (badgeGemini) badgeGemini.classList.add('hidden');
    if (badgeOpenai) badgeOpenai.classList.add('hidden');
    if (badgeGroq)   badgeGroq.classList.add('hidden');
    [btnGroq,btnGemini,btnOpenai].forEach(button=>{
        if (!button) return;
        button.classList.add('ai-provider');
        if (button === btnGroq) button.classList.add('ai-provider-primary');
        button.setAttribute('aria-pressed',String(button.id===`provider-btn-${prov}`));
    });

    if (prov === 'gemini') {
        if (btnGemini) btnGemini.className = 'flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-500/25';
        if (badgeGemini) badgeGemini.classList.remove('hidden');
        if (label) { label.textContent = 'Google Gemini (gemini-3.8-flash)'; label.className = 'text-amber-400 font-bold'; }
        if (apiInfo) apiInfo.textContent = 'API GenerativeLanguage v1beta';
        if (promptLabel) promptLabel.textContent = 'Pergunta ou solicitação para o Google Gemini:';
        if (btnText) btnText.textContent = 'Enviar para Gemini';
    } else if (prov === 'openai') {
        if (btnOpenai) btnOpenai.className = 'flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500/25';
        if (badgeOpenai) badgeOpenai.classList.remove('hidden');
        if (label) { label.textContent = 'OpenAI (gpt-4o-mini)'; label.className = 'text-emerald-400 font-bold'; }
        if (apiInfo) apiInfo.textContent = 'Responses API (v1/responses)';
        if (promptLabel) promptLabel.textContent = 'Pergunta ou solicitação para a OpenAI:';
        if (btnText) btnText.textContent = 'Enviar para OpenAI';
    } else {
        if (btnGroq) btnGroq.className = 'flex items-center gap-2 rounded-xl border border-violet-500/50 bg-violet-500/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-500/25';
        if (badgeGroq) badgeGroq.classList.remove('hidden');
        if (label) { label.textContent = 'Groq (openai/gpt-oss-120b)'; label.className = 'text-violet-400 font-bold'; }
        if (apiInfo) apiInfo.textContent = 'Chat Completions API (api.groq.com)';
        if (promptLabel) promptLabel.textContent = 'Pergunta ou solicitação para a Groq:';
        if (btnText) btnText.textContent = 'Enviar para Groq';
    }
    if (btnGroq) btnGroq.classList.add('ai-provider','ai-provider-primary');
    if (btnGemini) btnGemini.classList.add('ai-provider');
    if (btnOpenai) btnOpenai.classList.add('ai-provider');
}

/**
 * Função de comunicação reutilizável com a Supabase Edge Function seguranca-viaria-ia.
 * Garante envio seguro de requisições autenticadas sem expor credenciais sensíveis.
 * 
 * @param {string} prompt Mensagem ou pergunta a ser processada.
 * @param {object} [options] Opções adicionais (provedor, temperatura, etc).
 * @returns {Promise<{success: boolean, provider: string, response: string, model: string, meta: object}>}
 */

/**
 * Prepara um recorte compacto e fiel dos indicadores atuais para a Central de IA.
 * Os valores permanecem associados às competências correspondentes; null continua sendo ausência.
 */
function prepararContextoIndicadoresIA(prompt) {
    if (!supabaseStateLoaded || !supabaseReady) {
        throw new Error('Os indicadores reais do Supabase ainda não estão disponíveis. Recarregue o Dashboard e tente novamente.');
    }
    if (hasUnsavedChanges) {
        throw new Error('Salve as alterações pendentes antes de consultar os indicadores pela IA.');
    }
    const normalizar = value => String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const pergunta = normalizar(prompt);
    const termosIgnorados = new Set([
        'para', 'sobre', 'quais', 'qual', 'todos', 'todas', 'liste', 'listar',
        'relatorio', 'analise', 'analisar', 'indicadores', 'indicador', 'dados',
        'mensais', 'mensal', 'disponiveis', 'recebidos', 'contexto', 'minha',
        'meus', 'com', 'sem', 'uma', 'dos', 'das', 'por', 'que', 'como', 'entre',
        'principais', 'evolucao', 'resultados', 'historico', 'pontos', 'atencao'
    ]);
    const termos = [...new Set((pergunta.match(/[a-z0-9]{4,}/g) || [])
        .filter(termo => !termosIgnorados.has(termo)))];

    // Seleção por assunto. Dê preferência ao nome do indicador em vez do setor,
    // pois um setor inteiro pode conter dezenas de indicadores não solicitados.
    const temas = [
        { termos: ['acidente', 'acidentes', 'sinistro', 'sinistros'], regex: /acident|sinistr/ },
        { termos: ['multa', 'multas', 'autuacao', 'autuacoes'], regex: /multa|autuac/ },
        { termos: ['velocidade'], regex: /velocidade/ },
        { termos: ['score'], regex: /score/ },
        { termos: ['documentacao', 'documentos'], regex: /document|crlv|cronotac|emplac/ },
        { termos: ['veiculo', 'veiculos', 'frota', 'crlv', 'cronotacografo'], regex: /veicul|frota|crlv|cronotac/ }
    ];
    const temasSolicitados = temas.filter(tema => tema.termos.some(termo => pergunta.includes(termo)));
    const selecionados = currentData.map((item, index) => {
        const nome = normalizar(item.indicador);
        const setor = normalizar(item.setor);
        let pontos = termos.reduce((soma, termo) => soma + (nome.includes(termo) ? 5 : setor.includes(termo) ? 1 : 0), 0);
        if (nome && pergunta.includes(nome)) pontos += 100;
        if (temasSolicitados.some(tema => tema.regex.test(nome))) pontos += 9;
        else if (temasSolicitados.some(tema => tema.regex.test(setor))) pontos += 2;
        if (pergunta.includes('culpa') && nome.includes('culpa')) pontos += 15;
        if (pergunta.includes('total') && nome.includes('total')) pontos += 6;
        return { item, index, pontos };
    });

    // Sem associação explícita: permite perguntas gerais, mas usa apenas o que
    // couber no limite, deixando claro que a resposta é um recorte parcial.
    const haCorrespondencias = selecionados.some(registro => registro.pontos > 0);
    let candidatos = haCorrespondencias
        ? selecionados.filter(registro => registro.pontos > 0)
        : selecionados;
    if (/acident\w* com culpa|sinistr\w* com culpa/.test(pergunta) && !/\btod[oa]s\b/.test(pergunta)) {
        const restante = pergunta.replace(/acident\w* com culpa|sinistr\w* com culpa/g, '');
        candidatos = candidatos.filter(({item}) => {
            const nome = normalizar(item.indicador);
            const simples = nome.replace(/\s*-?\s*mensal$/, '').trim();
            const outros = restante.match(/multa|autuac|score|velocidade|crlv|document|quilometr|receita|custo|les|morte|obito|fatal|trein/g) || [];
            return (nome.includes('culpa') && !nome.includes('sem culpa')) || (/acident|sinistr/.test(restante) && /total de acident/.test(nome))
                || (simples && pergunta.includes(simples)) || outros.some(termo => nome.includes(termo));
        });
    }
    candidatos.sort((a, b) => b.pontos - a.pontos || a.index - b.index);
    if (/media|soma|minimo|maximo/.test(pergunta) && !/analise|evolu|todos|gerencial/.test(pergunta)) {
        const exatos = candidatos.filter(({item}) => {
            const nome = normalizar(item.indicador).replace(/\s*-?\s*mensal$/, '').trim();
            return nome && pergunta.includes(nome);
        });
        if (exatos.length) candidatos = exatos;
    }

    // As competências são enviadas uma única vez, evitando repetir a string do
    // mês para cada valor e reduzindo drasticamente o tamanho da requisição.
    const contexto = {
        versao: 1,
        origem: 'supabase',
        totalIndicadoresNoDashboard: currentData.length,
        totalIndicadoresSelecionados: candidatos.length,
        totalIndicadoresEnviados: 0,
        contextoParcial: false,
        observacao: 'Dados agregados sujeitos a revisão retroativa. Cada valor corresponde à competência na mesma posição; null é ausência. Não deduzir ano de rótulos sem ano. Atualização não é competência. Contexto parcial não representa todo o dashboard.',
        competencias: [...mesesLabels],
        indicadores: []
    };
    const encoder = new TextEncoder();
    const LIMITE_CONTEXTO_BYTES = 17 * 1024; // margem segura abaixo do limite da Edge Function
    for (const { item, index } of candidatos) {
        const indicador = {
            id: item.id ?? `indice:${index}`,
            indicador: item.indicador ?? null,
            setor: item.setor ?? null,
            meta: item.meta ?? null,
            unidade: item.und ?? null,
            direcaoDesempenho: item.direcaoDesempenho ?? null,
            ultimaAtualizacao: item.ultimaAtualizacao ?? null,
            valores: Array.isArray(item.valores) ? item.valores.map(valor => valor === undefined ? null : valor) : []
        };
        contexto.indicadores.push(indicador);
        contexto.totalIndicadoresEnviados = contexto.indicadores.length;
        if (encoder.encode(JSON.stringify(contexto)).length > LIMITE_CONTEXTO_BYTES) {
            contexto.indicadores.pop();
            contexto.totalIndicadoresEnviados--;
        }
    }
    contexto.contextoParcial = contexto.totalIndicadoresEnviados < candidatos.length;
    if (contexto.contextoParcial) {
        contexto.observacao += ' Foram omitidos indicadores que não couberam no limite. Não conclua que eles não existem; informe que a análise é parcial.';
    }
    if (encoder.encode(JSON.stringify(contexto)).length > 18 * 1024) {
        throw new Error('O contexto excedeu o limite de 18 KB. Especifique os indicadores desejados.');
    }
    if (!contexto.indicadores.length && candidatos.length) {
        throw new Error('Não foi possível compactar os indicadores para a consulta. Verifique se há campos excessivamente longos nos registros.');
    }
    return contexto;
}

async function chamarEdgeFunctionIA(prompt, options = {}) {
    const provider = options.provider || currentAiProvider || 'groq';

    // 1. Obtém sessão ativa do Supabase Auth garantindo renovação de token se expirado
    const { data, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) {
        throw new Error('Falha ao validar a sessão com o Supabase. Tente fazer login novamente.');
    }
    const session = data?.session;

    if (!session || !session.access_token) {
        throw new Error('Sessão expirada ou não autenticada. Faça login novamente para utilizar a IA.');
    }

    // 2. Prepara e envia o contexto real dos indicadores junto da pergunta.
    const contextoIndicadores = prepararContextoIndicadoresIA(prompt);
    const payload = {
        prompt: prompt || 'Explique brevemente o que é Segurança Viária na operação de transporte pesado.',
        provider,
        ...options,
        context: contextoIndicadores
    };
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload)).length;
    if (payloadBytes > 25 * 1024) {
        throw new Error('A solicitação com os dados do Dashboard ultrapassa o limite de 25 KB. Faça uma pergunta mais específica.');
    }

    const response = await fetch(SUPABASE_AI_FUNCTION_ENDPOINT, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => null);

    // 3. Tratamento de respostas e códigos de status
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Edge Function "seguranca-viaria-ia" ainda não foi publicada no Supabase. Publique a função no painel do Supabase para ativar a integração.');
        }
        const provName = provider === 'openai' ? 'OpenAI' : provider === 'groq' ? 'Groq' : 'Gemini';
        const errorMsg = responseData?.error || responseData?.message || responseData?.detail || `Erro na comunicação com a IA (${provName} - HTTP ${response.status}).`;
        throw new Error(errorMsg);
    }

    if (!responseData || !responseData.success) {
        throw new Error(responseData?.error || `A Edge Function não retornou uma resposta válida para o provedor ${provider}.`);
    }

    if (responseData.contextVersion !== 1) {
        throw new Error('A Edge Function publicada não confirma o contrato de contexto atual. Publique a versão local de seguranca-viaria-ia antes de consultar os indicadores.');
    }

    return { ...responseData, contexto: {
        enviados: contextoIndicadores.totalIndicadoresEnviados,
        selecionados: contextoIndicadores.totalIndicadoresSelecionados,
        parcial: contextoIndicadores.contextoParcial
    } };
}

/**
 * Manipulador do botão de teste da interface do Dashboard.
 * Controla os estados de carregamento, latência, exibição de resultados e mensagens amigáveis de erro.
 * 
 * @param {string|null} [targetProvider] Opcionalmente força um provedor específico ('gemini', 'openai' ou 'groq').
 */
async function executarTesteIA(targetProvider = null) {
    const provider = targetProvider || currentAiProvider || 'groq';
    const isGroq = provider === 'groq';
    const isOp = provider === 'openai';
    const providerName = isGroq ? 'Groq' : isOp ? 'OpenAI' : 'Google Gemini';
    const providerColor = isGroq ? 'text-violet-400' : isOp ? 'text-emerald-400' : 'text-amber-400';
    const providerIconClass = isGroq ? 'fa-solid fa-microchip' : isOp ? 'fa-solid fa-bolt' : 'fa-brands fa-google';

    const input = document.getElementById('aiPromptInput');
    const btn = document.getElementById('aiTestButton');
    const btnIcon = document.getElementById('aiTestButtonIcon');
    const btnText = document.getElementById('aiTestButtonText');
    const statusDot = document.getElementById('aiStatusDot');
    const statusText = document.getElementById('aiStatusText');
    const responseContainer = document.getElementById('aiResponseContainer');
    const responseBody = document.getElementById('aiResponseBody');
    const responseMeta = document.getElementById('aiResponseMeta');
    const responseIcon = document.getElementById('aiResponseIcon');
    const responseProviderName = document.getElementById('aiResponseProviderName');

    const prompt = input?.value?.trim() || 'Explique brevemente o que é Segurança Viária na operação de transporte pesado.';

    // Atualiza interface para estado de carregamento
    if (btn) btn.disabled = true;
    if (btnIcon) btnIcon.className = 'fa-solid fa-spinner fa-spin';
    if (btnText) btnText.textContent = `Consultando ${providerName}...`;
    if (statusDot) statusDot.className = 'h-2 w-2 rounded-full bg-amber-400 animate-pulse';
    if (statusText) statusText.textContent = `Aguardando ${providerName}...`;

    if (responseContainer) responseContainer.classList.remove('hidden');
    if (responseIcon) {
        responseIcon.className = `${providerIconClass} ${providerColor}`;
    }
    if (responseProviderName) {
        responseProviderName.textContent = `Resposta do ${providerName}`;
    }
    if (responseBody) {
        responseBody.innerHTML = `<span class="text-slate-400 italic flex items-center gap-2"><i class="fa-solid fa-circle-notch fa-spin ${providerColor}"></i> Enviando solicitação autenticada à Edge Function (${providerName})...</span>`;
    }
    if (responseMeta) responseMeta.textContent = 'Processando...';

    const startTime = performance.now();

    try {
        const resultado = await chamarEdgeFunctionIA(prompt, { provider });
        if (resultado.meta?.deterministicOnly && responseProviderName) responseProviderName.textContent = 'Resultado calculado pelo sistema';
        const durationSec = ((performance.now() - startTime) / 1000).toFixed(2);

        // Sucesso
        if (statusDot) statusDot.className = 'h-2 w-2 rounded-full bg-emerald-400';
        if (statusText) statusText.textContent = `Respondido em ${durationSec}s`;

        if (responseBody) {
            responseBody.textContent = resultado.response;
            if (typeof resultado.technicalDetails === 'string' && resultado.technicalDetails) {
                const details = document.createElement('details');
                details.className = 'mt-4 border-t border-slate-700 pt-3';
                const summary = document.createElement('summary');
                summary.textContent = 'Detalhes técnicos: séries, cálculos, metas e metodologia';
                summary.className = 'cursor-pointer font-semibold text-amber-400';
                const content = document.createElement('pre');
                content.className = 'mt-3 whitespace-pre-wrap text-xs';
                content.textContent = resultado.technicalDetails;
                details.append(summary, content);
                responseBody.appendChild(details);
            }
        }

        if (responseMeta) {
            const tokens = resultado.meta?.totalTokens ? ` • ${resultado.meta.totalTokens} tokens` : '';
            const recorte = resultado.contexto
                ? ` • ${resultado.contexto.enviados}/${resultado.contexto.selecionados} indicadores selecionados${resultado.contexto.parcial ? ' • ANÁLISE PARCIAL: há indicadores omitidos' : ''}`
                : '';
            responseMeta.textContent = `${resultado.model || providerName} • ${durationSec}s${tokens}${recorte}`;
        }
    } catch (error) {
        const durationSec = ((performance.now() - startTime) / 1000).toFixed(2);

        // Erro
        if (statusDot) statusDot.className = 'h-2 w-2 rounded-full bg-rose-400';
        if (statusText) statusText.textContent = `Falha em ${providerName}`;

        if (responseBody) {
            responseBody.innerHTML = `
                <div class="text-rose-400 font-semibold mb-1 flex items-center gap-1.5">
                    <i class="fa-solid fa-triangle-exclamation"></i> Não foi possível obter resposta de ${providerName}:
                </div>
                <div class="text-slate-300 text-xs bg-rose-950/30 border border-rose-900/40 rounded-lg p-3 leading-relaxed">
                    ${escapeHtml(error.message)}
                </div>
            `;
        }

        if (responseMeta) {
            responseMeta.textContent = `Erro (${durationSec}s)`;
        }
    } finally {
        if (btn) btn.disabled = false;
        if (btnIcon) btnIcon.className = 'fa-solid fa-paper-plane';
        if (btnText) btnText.textContent = `Enviar para ${currentAiProvider === 'openai' ? 'OpenAI' : currentAiProvider === 'groq' ? 'Groq' : 'Gemini'}`;
    }
}

/**
 * Executa teste rápido de conexão direta para um provedor específico.
 */
function executarTesteConexaoDireta(provider) {
    setAiProvider(provider);
    executarTesteIA(provider);
}

/**
 * Mantém compatibilidade com chamadas legadas ao Gemini.
 */
function executarTesteGeminiIA() {
    executarTesteConexaoDireta('gemini');
}
