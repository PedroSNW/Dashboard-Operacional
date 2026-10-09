// DADOS PADRÃO (INICIALIZAÇÃO)
const initialData = [{"setor": "Controle de Sinistro", "indicador": "ACIDENTE POR (MILHAO) DE KM RODADO - Mensal", "meta": 0.0, "und": "%", "valores": [3.5, 4.43, 4.17, 5.51, 3.58, 4.09, null]}, {"setor": "Controlde de Sinistro", "indicador": "Acidentes com culpa - Mensal", "meta": 0.0, "und": "Qtd", "valores": [11.0, 12.0, 8.0, 17.0, 21.0, 13.0, 16.0]}, {"setor": "Controle de Sinistro", "indicador": "Número de acidentes com lesões - veículos proprios - Mensal", "meta": 0.0, "und": "Qtd", "valores": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]}, {"setor": "Controle de Sinistro", "indicador": "Número de acidentes com lesões envolvendo Terceiros - Mensal", "meta": 0.0, "und": "Qtd", "valores": [0.0, 0.0, 1.0, 0.0, 2.0, 0.0, 1.0]}, {"setor": "Controle de Sinistro", "indicador": "Numero de mortes - proprios - Mensal", "meta": 0.0, "und": "Qtd", "valores": [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0]}, {"setor": "Controle de Sinistro", "indicador": "Número de mortes -Terceiros - Mensal", "meta": 0.0, "und": "Qtd", "valores": [0.0, 0.0, 0.0, 1.0, 2.0, 0.0, 1.0]}, {"setor": "Controle de Sinistro", "indicador": "Total de acidentes - Mensal", "meta": 40.0, "und": "Qtd", "valores": [26.0, 33.0, 38.0, 49.0, 32.0, 38.0, 43.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "VEÍCULOS ATIVOS (semirreboques)", "meta": 2500.0, "und": "Qtd", "valores": [2015.0, 1972.0, 1968.0, 1959.0, 1947.0, 1947.0, 1932.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "VEÍCULOS ATIVOS (cavalo mecânico)", "meta": 1300.0, "und": "Qtd", "valores": [1234.0, 1208.0, 1223.0, 1231.0, 1221.0, 1204.0, 1190.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "Cronotacógrafo - Mensal", "meta": 100.0, "und": "%", "valores": [62.25, 64.29, 64.37, 97.44, 98.61, 98.51, 98.43]}, {"setor": "Controle de Veículos / Documentação", "indicador": "Veículos emplacados - Mensal", "meta": 0.0, "und": "Qtd", "valores": [68.0, 36.0, 36.0, 31.0, 31.0, 23.0, 11.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "Veículos Vendidos", "meta": 0.0, "und": "Qtd", "valores": [27.0, 24.0, 35.0, 35.0, 23.0, 45.0, 49.0]}, {"setor": "Controle de Veículos / Documentação", "indicador": "% CRLV LIBERADOS - Mensal", "meta": 100.0, "und": "%", "valores": [5.13, 79.45, 91.9, 96.51, 97.3, 99.18, 99.59]}, {"setor": "Controle de Penalidade/Autuações", "indicador": "Redução quantidade de multas por frota - Mensal", "meta": 0.35, "und": "%", "valores": [0.59, 0.46, 0.5, 0.58, 0.35, 0.55, null]}, {"setor": "Controle de Penalidade", "indicador": "% de multas pagas com 20% de desconto - Mensal", "meta": 20.0, "und": "%", "valores": [20.0, 18.0, 15.0, 23.0, 16.0, 10.67, 12.08]}, {"setor": "Controle de Penalidade", "indicador": "% de multas pagas com 40% de desconto - Mensal", "meta": 10.0, "und": "%", "valores": [42.0, 39.0, 56.0, 38.0, 55.0, 48.71, 47.35]}, {"setor": "Controle de Penalidade", "indicador": "Multas Cobradas Motoristas - Mensal", "meta": 50000.0, "und": "Qtd", "valores": [159.0, 161.0, 188.0, 99.0, 185.0, 245.0, 297.0]}, {"setor": "Controle de Penalidade", "indicador": "Multas Mapeadas Mês - Mensal", "meta": 0.0, "und": "Qtd", "valores": [595.0, 528.0, 651.0, 924.0, 407.0, 644.0, 478.0]}, {"setor": "Controle de Penalidade", "indicador": "Multas Pagas Mês - Mensal", "meta": 0.0, "und": "Qtd", "valores": [843.0, 707.0, 602.0, 556.0, 854.0, 1199.0, 1134.0]}, {"setor": "Controle de de Autuações", "indicador": "Defesas administrativas", "meta": 50000.0, "und": "Qtd", "valores": [3.0, 16.0, 6.0, 2.0, 29.0, 35.0, 13.0]}, {"setor": "Controle de de Autuações", "indicador": "Autuações tratadas", "meta": 50000.0, "und": "Qtd", "valores": [267.0, 100.0, 229.0, 278.0, 262.0, 278.0, 246.0]}, {"setor": "Controle de de Autuações", "indicador": "Responsabilidade da empresa", "meta": 50000.0, "und": "Qtd", "valores": [96.0, 28.0, 70.0, 30.0, 30.0, 37.0, 13.0]}, {"setor": "Controle de de Autuações", "indicador": "Já identificado pelo agente", "meta": 50000.0, "und": "Qtd", "valores": [17.0, 4.0, 5.0, 14.0, 6.0, 12.0, 16.0]}, {"setor": "Controle de de Autuações", "indicador": "Identificar (solicitou ser identificado, mas não possui termo)", "meta": 50000.0, "und": "Qtd", "valores": [27.0, 36.0, 46.0, 40.0, 42.0, 39.0, 32.0]}, {"setor": "Controle de de Autuações", "indicador": "PRF", "meta": 50000.0, "und": "Qtd", "valores": [42.0, 12.0, 47.0, 65.0, 84.0, 93.0, 72.0]}, {"setor": "Controle de de Autuações", "indicador": "Identificado", "meta": 50000.0, "und": "Qtd", "valores": [27.0, 36.0, 46.0, 40.0, 42.0, 43.0, 49.0]}, {"setor": "Controle de de Autuações", "indicador": "Agregados Identificados", "meta": 50000.0, "und": "Qtd", "valores": [1.0, null, 1.0, 2.0, 8.0, 3.0, 6.0]}, {"setor": "Controle de de Autuações", "indicador": "Agregados não Identificado", "meta": 50000.0, "und": "Qtd", "valores": [null, null, 15.0, 7.0, 14.0, 2.0, 8.0]}, {"setor": "Controle de de Autuações", "indicador": "Não Identificado frota", "meta": 50000.0, "und": "Qtd", "valores": [33.0, 3.0, 13.0, 47.0, 22.0, 32.0, 28.0]}, {"setor": "Controle de de Autuações", "indicador": "Não Identificado 24h", "meta": 50000.0, "und": "Qtd", "valores": [12.0, 1.0, 11.0, 19.0, 14.0, 17.0, 22.0]}, {"setor": "Controle de de Autuações", "indicador": "Defesas ANTT", "meta": 50000.0, "und": "Qtd", "valores": [null, null, null, null, 28.0, 29.0, null]}, {"setor": "Controle de SCORE do motorista", "indicador": "SCORE - Mensal", "meta": 600.0, "und": "Qtd", "valores": [249.0, 318.0, 405.0, 460.0, 497.0, 589.0, null]}, {"setor": "Controle de Velocidade", "indicador": "Numero de motoristas com ocorrencias acima da velocidade permitida - Mensal", "meta": 0.0, "und": "Qtd", "valores": [542.0, 580.0, 673.0, 640.0, 584.0, 597.0, 540.0]}];

const SUPABASE_URL = 'https://hlasqurthnnhmszojrce.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYXNxdXJ0aG5uaG1zem9qcmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzE3MjQsImV4cCI6MjEwMjkwNzcyNH0.m_Om19_gEfT_ab1QjeUVQWF-oimhtasu7_xXsNMHPrg';
const SUPABASE_STATE_ENDPOINT = `${SUPABASE_URL}/rest/v1/dashboard_state`;
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
let hasUnsavedChanges = false;
let isSavingState = false;
let stateRevision = 0;
let supabaseSaveQueue = Promise.resolve();

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
    display: () => showDataLabels,
    color: () => document.body.classList.contains('light-theme') ? '#111827' : '#f8fafc',
    anchor: 'end',
    align: 'bottom',
    clamp: true,
    font: { size: 10, weight: 'bold' },
    formatter: value => value === null || value === undefined ? '' : Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
};

// CARREGAMENTO INICIAL
document.addEventListener('DOMContentLoaded', async () => {
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
    });
    document.getElementById('selectAllDashboardMonths')?.addEventListener('click', () => {
        selectedDashboardMonths = null;
        renderDashboardMonthFilter();
        renderCharts();
        renderDynamicCharts();
    });
    document.getElementById('clearDashboardMonths')?.addEventListener('click', () => {
        selectedDashboardMonths = [];
        renderDashboardMonthFilter();
        renderCharts();
        renderDynamicCharts();
    });

    const { data } = await supabaseClient.auth.getSession();
    await handleAuthSession(data.session);

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        handleAuthSession(session);
    });
});

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
        appInitialized = false;
        supabaseStateLoaded = false;
        return;
    }

    if (appInitialized) return;
    appInitialized = true;
    currentData = JSON.parse(JSON.stringify(initialData));
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

function showAlert(title, text, icon = 'info') {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#EAB308',
        background: '#111C38',
        color: '#fff'
    });
}

function downloadChart(chartCanvasId, fileName) {
    const canvas = document.getElementById(chartCanvasId);
    if (!canvas) return;

    const chart = Chart.getChart(canvas);
    const imageURL = chart ? chart.toBase64Image() : canvas.toDataURL('image/png');
    const safeFileName = String(fileName || 'grafico').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
    const link = document.createElement('a');
    link.download = `${safeFileName}.png`;
    link.href = imageURL;
    document.body.appendChild(link);
    link.click();
    link.remove();

    Swal.fire({
        title: 'Download Concluído!',
        text: 'O gráfico foi salvo no seu computador.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#111C38',
        color: '#f8fafc'
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
    button.innerHTML = isLight
        ? '<i class="fa-solid fa-moon text-sky-500"></i> <span>Tema escuro</span>'
        : '<i class="fa-solid fa-sun text-amber-400"></i> <span>Tema claro</span>';
}

function getDefaultDashboardWidgets() {
    return [
        { id: 'widget_kpi1', type: 'kpi', ref: 'kpi1' },
        { id: 'widget_kpi2', type: 'kpi', ref: 'kpi2' },
        { id: 'widget_kpi3', type: 'kpi', ref: 'kpi3' },
        { id: 'widget_kpi4', type: 'kpi', ref: 'kpi4' },
        { id: 'widget_chart1', type: 'default-chart', ref: 'chart1' },
        { id: 'widget_chart2', type: 'default-chart', ref: 'chart2' },
        { id: 'widget_chart3', type: 'default-chart', ref: 'chart3' },
        { id: 'widget_chart4', type: 'default-chart', ref: 'chart4' }
    ];
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

    Swal.fire({
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

        Swal.fire({
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
                <img id="dashboardLogo" src="${src}" alt="D'Granel Logo" class="h-full w-full object-cover rounded-[10px]" onerror="handleLogoError(this)">
                <div class="absolute inset-0 bg-slate-950/80 text-amber-400 text-[9px] font-bold uppercase tracking-tighter flex items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity p-1 select-none">Alterar<br>Logo</div>
            `;
        }
    }
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

function getChartTypeOptions(type, scales) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: type === 'horizontalBar' ? 'y' : 'x',
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales
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
    Swal.fire({
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

        Swal.fire({
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
            borderColor: ['#10b981', '#eab308', '#f43f5e', '#38bdf8'][index],
            backgroundColor: ['rgba(16,185,129,.25)', 'rgba(234,179,8,.25)', 'rgba(244,63,94,.25)', 'rgba(56,189,248,.25)'][index],
            borderWidth: 2,
            tension: 0.3,
            fill: config.type === 'line',
            ...(usesIndependentAxes ? { yAxisID: `y${index + 1}` } : {})
        }));
        if (chartId === 'chart2' && indicators.length > 1) datasets = [{ label: config.title, data: labels.map((_, index) => indicators.reduce((sum, item) => sum + (getDashboardChartData(item).values[index] || 0), 0)), backgroundColor: 'rgba(56,189,248,.6)', borderRadius: 6 }];
        const scales = config.type === 'radar'
            ? { r: { min: 0, beginAtZero: true, pointLabels: { color: '#cbd5e1' } } }
            : { x: { ticks: { color: '#94a3b8' } }, y: { min: 0, beginAtZero: true, ticks: { color: '#94a3b8' } } };
        if (supportsYAxis && indicators.length > 1 && !usesIndependentAxes) {
            const values = indicators.flatMap(indicator => getDashboardChartData(indicator).values)
                .filter(value => value !== null && value !== undefined && Number.isFinite(Number(value)));
            const maxValue = values.length ? Math.max(...values) * 1.1 : undefined;
            scales.y.max = maxValue > 0 ? maxValue : undefined;
        }
        if (usesIndependentAxes) {
            delete scales.y;
            indicators.forEach((_, index) => {
                scales[`y${index + 1}`] = {
                    type: 'linear',
                    position: 'left',
                    offset: index > 0,
                    min: 0,
                    beginAtZero: true,
                    ticks: { color: ['#10b981', '#eab308', '#f43f5e', '#38bdf8'][index] },
                    grid: { drawOnChartArea: index === 0 }
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
    if (!button) return;

    const label = button.querySelector('span');
    button.disabled = isSavingState;
    if (label) label.textContent = isSavingState ? 'Salvando...' : hasUnsavedChanges ? 'Salvar alterações' : 'Salvar agora';
    button.classList.toggle('bg-amber-500', hasUnsavedChanges && !isSavingState);
    button.classList.toggle('hover:bg-amber-400', hasUnsavedChanges && !isSavingState);
    button.classList.toggle('bg-emerald-600', !hasUnsavedChanges || isSavingState);
    button.classList.toggle('hover:bg-emerald-500', !hasUnsavedChanges || isSavingState);
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
    try {
        const sharedState = await carregarDadosSupabase(silencioso);
        const remoteSavedAt = sharedState?.updated_at
            ? new Date(sharedState.updated_at).getTime()
            : null;
        if (silencioso && Number.isFinite(remoteSavedAt) && remoteSavedAt <= lastSupabaseSavedAt) return;

        supabaseStateLoaded = true;
        if (Number.isFinite(remoteSavedAt)) {
            lastSupabaseSavedAt = remoteSavedAt;
            updateLastSaveStatus(remoteSavedAt);
        }

        if (sharedState && sharedState.data) {
            const dataObj = sharedState.data;
            const sharedIndicators = Array.isArray(dataObj) ? dataObj : dataObj.indicadores;
            currentData = Array.isArray(sharedIndicators) ? sharedIndicators : JSON.parse(JSON.stringify(initialData));
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
                widgets: Array.isArray(dashboard.widgets) ? dashboard.widgets : []
            }));
            activeDashboardId = dashboards.some(dashboard => dashboard.id === dataObj.activeDashboardId)
                ? dataObj.activeDashboardId
                : dashboards[0].id;
            mesesLabels = Array.isArray(dataObj.mesesLabels) ? dataObj.mesesLabels.filter(isMonthLabel) : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
            showDataLabels = dataObj.showDataLabels === true;
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
    const dashboardView = document.getElementById('view-dashboard');
    if (dashboardView && !dashboardView.classList.contains('hidden')) {
        renderCharts();
        renderDynamicCharts();
    }
    renderTable();
    updateJSONEditor();
    const detailModal = document.getElementById('modalDetail');
    if (detailModal && !detailModal.classList.contains('hidden') && detailModalIndex !== null) {
        refreshDetailModal(detailModalIndex);
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

    const nextView = document.getElementById(`view-${tabName}`);
    const currentView = document.querySelector('main > div:not(.hidden)');
    if (!nextView || currentView === nextView) return;

    document.querySelectorAll('main > div').forEach(view => {
        view.classList.add('hidden');
    });

    if (currentView) currentView.classList.add('hidden');
    nextView.classList.remove('hidden');

    ['dashboard', 'datagrid', 'audit'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.remove('active');
    });

    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName === 'dashboard') {
        renderCharts();
        renderDynamicCharts();
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
    const lowerIsBetter = /acidente|sinistro|morte|multa|autua[cç][aã]o|velocidade|ocorr[eê]ncia|redu[cç][aã]o|n[aã]o identificado/i.test(item.indicador);
    const status = !Number.isFinite(meta) ? 'N/A' : (lowerIsBetter ? last <= meta : last >= meta) ? 'OK' : 'ACOMPANHAR';

    return { avg, min, max, last, lastMonth: lastObj.month, status, diff };
}

function fmtVal(val, unit = '') {
    if (val === null || val === undefined || isNaN(val)) return '-';
    let formatted = val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    return unit === '%' ? formatted + '%' : formatted;
}

// RENDERIZAÇÃO DOS KPIS D'GRANEL
function renderKPIs() {
    const kpiContainer = document.getElementById('kpiContainer');
    kpiContainer.innerHTML = '';

    document.getElementById('kpiTotalCount').textContent = currentData.length;
    document.getElementById('kpiMonthsCount').textContent = mesesLabels.length;

    const findIndicator = text => currentData.findIndex(item => item.indicador.includes(text));
    const defaults = [
        { id: 'kpi1', title: '% CRLV Liberados', indicator: findIndicator('% CRLV LIBERADOS'), unit: '%', color: 'emerald', icon: 'fa-file-check', badge: 'Regularização OK' },
        { id: 'kpi2', title: 'Score do Motorista', indicator: findIndicator('SCORE'), unit: 'pts', color: 'amber', icon: 'fa-star', badge: 'Em Elevação' },
        { id: 'kpi3', title: 'Excesso de Velocidade', indicator: findIndicator('velocidade permitida'), unit: '', color: 'rose', icon: 'fa-gauge-high', badge: 'Risco Operacional' },
        { id: 'kpi4', title: 'Multas Cobradas', indicator: findIndicator('Multas Cobradas Motoristas'), unit: '', color: 'amber', icon: 'fa-receipt', badge: 'Atenção Elevada' }
    ];
    const savedById = Object.fromEntries(kpiCards.map(card => [card.id, card]));
    const cards = [...defaults.map(card => ({ ...card, ...savedById[card.id] })), ...kpiCards.filter(card => !defaults.some(item => item.id === card.id))]
        .filter(card => !card.deleted);

    cards.forEach(c => {
        if (!dashboardHasWidget('kpi', c.id)) return;
        const indicator = currentData[c.indicator] || { valores: [] };
        const monthly = getMonthlyData(indicator);
        const last = getLastValid(monthly.values, monthly.labels);
        const unit = c.unit || indicator.und || '';
        const color = ['emerald', 'amber', 'rose', 'sky', 'violet'].includes(c.color) ? c.color : 'sky';
        const el = document.createElement('div');
        el.className = 'glass-card page-load-item rounded-2xl p-5 flex flex-col justify-between';
        el.innerHTML = `
            <div class="flex items-start justify-between">
                <div>
                    <span class="text-xs text-slate-400 font-medium">${escapeHtml(c.title)}</span>
                    <div class="text-2xl font-extrabold text-white mt-1">${fmtVal(last.val, unit === '%' ? '%' : '')}${unit && unit !== '%' ? ` ${unit}` : ''}</div>
                </div>
                <div class="p-3 rounded-xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/20">
                    <i class="fa-solid ${c.icon} text-lg"></i>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center gap-2 text-xs">
                <span class="text-slate-400">Último: ${escapeHtml(last.month)}</span>
                <span class="text-slate-300">Meta: ${fmtVal(indicator.meta, unit === '%' ? '%' : '')}${unit && unit !== '%' && indicator.meta !== null && indicator.meta !== undefined ? ` ${unit}` : ''}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-${color}-500/10 text-${color}-400 border border-${color}-500/20">${escapeHtml(c.badge)}</span>
            </div>
            <div class="flex justify-end gap-1 mt-3">
                <button onclick="openKpiModal('${escapeHtml(c.id)}')" title="Editar Balão" class="p-1.5 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-lg transition text-xs"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteKpi('${escapeHtml(c.id)}')" title="Excluir Balão" class="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg transition text-xs"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        kpiContainer.appendChild(el);
    });
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
    const config = kpiId ? getKpiConfig(kpiId) : { id: `kpi_${Date.now()}`, title: '', indicator: 0, unit: '', color: 'sky', icon: 'fa-chart-simple', badge: 'Personalizado' };
    document.getElementById('kpiConfigId').value = config.id;
    document.getElementById('kpiConfigTitle').value = config.title;
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
    const config = {
        id,
        title: document.getElementById('kpiConfigTitle').value,
        indicator: parseInt(document.getElementById('kpiConfigIndicator').value),
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
    Swal.fire({
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

        Swal.fire({
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
                { label: '% CRLV', data: monthlyValues(crlvObj), type: 'line', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.3, yAxisID: 'y1' },
                { label: 'Score Motorista', data: monthlyValues(scoreObj), type: 'line', borderColor: '#eab308', borderDash: [5, 5], tension: 0.3, yAxisID: 'y2' },
                { label: 'Acidentes', data: monthlyValues(acidentesObj), backgroundColor: 'rgba(244, 63, 94, 0.8)', borderRadius: 6, yAxisID: 'y3' },
                { label: 'Multas Motorista', data: monthlyValues(multasObj), backgroundColor: 'rgba(234, 179, 8, 0.7)', borderRadius: 6, yAxisID: 'y3' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y1: { position: 'left', min: 0, beginAtZero: true, max: 100, ticks: { color: '#94a3b8' } },
                y2: { position: 'right', min: 0, beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { drawOnChartArea: false } },
                y3: { position: 'right', min: 0, beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { drawOnChartArea: false } }
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
                    <button onclick="openChartModal('${escapeHtml(c.id)}')" title="Editar Gráfico" class="p-1.5 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-lg transition text-xs">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="deleteCustomChart('${escapeHtml(c.id)}')" title="Excluir Gráfico" class="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg transition text-xs">
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
            maxValue = maxValue > 0 ? maxValue * 1.1 : 100; // Adiciona 10% de margem
        }

        const scalesObj = {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        };

        if (c.type !== 'radar' && c.type !== 'doughnut' && c.type !== 'polarArea') {
            if (indicatorObjects.length > 1) {
                if (usesIndependentAxes) {
                    indicatorObjects.forEach((_, index) => {
                        scalesObj[`y${index + 1}`] = {
                            type: 'linear',
                            position: 'left',
                            offset: index > 0,
                            min: 0,
                            beginAtZero: true,
                            ticks: { color: datasetColors[index] },
                            grid: { drawOnChartArea: index === 0 }
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
                    <button onclick="openDetailModal(${origIndex})" title="Inspecionar" class="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition"><i class="fa-solid fa-eye"></i></button>
                    <button onclick="openEditModal(${origIndex})" title="Editar" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteIndicator(${origIndex})" title="Excluir" class="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg transition"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
            <td class="py-2.5 px-3 font-medium text-slate-400 text-[11px]">${escapeHtml(item.setor)}</td>
            <td class="py-2.5 px-3 font-semibold text-white text-[11px]">${escapeHtml(item.indicador)}</td>
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
            <span class="text-[10px] text-slate-400 block mb-0.5">${mes}</span>
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
    
    renderMonthlyInputs(monthly.values);
    document.getElementById('modalEdit').classList.remove('hidden');
}

async function saveIndicatorForm(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('editIndex').value);
    const vals = [];

    mesesLabels.forEach((_, i) => {
        const inputEl = document.getElementById(`val_${i}`);
        const v = inputEl ? inputEl.value : '';
        vals.push(v !== '' ? parseFloat(v) : null);
    });

    const newItem = {
        setor: document.getElementById('editSetor').value,
        indicador: document.getElementById('editIndicador').value,
        meta: parseFloat(document.getElementById('editMeta').value) || 0,
        und: document.getElementById('editUnd').value,
        valores: vals
    };

    if (idx === -1) {
        currentData.push(newItem);
    } else {
        currentData[idx] = newItem;
    }

    saveData(currentData);
    await registrarLog('ATUALIZAÇÃO/CRIAÇÃO', `Indicador: ${newItem.indicador} (Setor: ${newItem.setor})`);
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

async function registrarLog(acao, detalhes = '') {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return;

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
    } catch (error) {
        console.error('Erro ao registrar log de auditoria:', error);
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
                            : 'p-3 text-slate-300';
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
        saveData(parsed);
        initSystem();
        showAlert('Sucesso!', 'Alterações salvas com sucesso!', 'success');
    } catch(e) {
        showAlert('Erro na validação', 'Verifique a sintaxe do JSON.', 'error');
    }
}

function parseCSVContent(csvText, sourceName = "CSV", silencioso = false) {
    Papa.parse(csvText, {
encoding: "ISO-8859-1",
skipEmptyLines: 'greedy',
complete: function(results) {
    const rows = results.data;
    let newParsed = [];
    let headerIndex = -1;

    // Localiza a linha de cabeçalho
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i].map(c => String(c).trim());
        if (r[0] === 'Setor' && r.includes('Indicador')) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        showAlert('Cabeçalho não encontrado', 'Não foi possível localizar o cabeçalho no arquivo CSV.', 'error');
        return;
    }

    const headerRow = rows[headerIndex].map(c => String(c).trim());
    
    const metaCols = ['Setor', 'Indicador', 'Meta', 'Und.', 'Und', 'Unidade', 'Direção', 'Direcao', 'Ano'];

    let valStartIdx = 6;

    // Identifica dinamicamente onde começam os meses ignorando colunas de cadastro
    for (let c = 7; c < headerRow.length; c++) {
        const col = headerRow[c].toLowerCase();
        
        // Pula colunas fixas (evita que 'Setor' seja lido como 'Setembro')
        if (metaCols.includes(col)) continue;

        if (BASE_MONTHS.some(bm => col.startsWith(bm.toLowerCase()))) {
            valStartIdx = c;
            break;
        }
    }

    // Extrai apenas os nomes dos meses
    const monthIndexes = headerRow
        .map((header, index) => ({ header, index }))
        .filter(({ header, index }) => index >= valStartIdx && isMonthLabel(header));
    const extractedMonths = monthIndexes.map(({ header }) => header);
    if (extractedMonths.length > 0 && typeof syncMonthLabels === 'function') {
        syncMonthLabels(extractedMonths);
    }

    // Mapeia os dados do indicador apontando os valores apenas a partir da coluna de meses
    for (let i = headerIndex + 1; i < rows.length; i++) {
        const row = rows[i].map(c => String(c).trim());
        if (row.length > 1 && row[0] !== '') {
            newParsed.push({
                setor: row[0],
                indicador: row[1] || '',
                meta: parsePtNum(row[2]),
                und: row[3] || 'Qtd',
                valores: monthIndexes.map(({ index }) => parsePtNum(row[index]))
            });
        }
    }

    if (newParsed.length > 0) {
        if (typeof saveData === 'function') saveData(newParsed);
        if (typeof initSystem === 'function') initSystem();
        showAlert('Sincronização concluída', `${newParsed.length} indicadores sincronizados de [${sourceName}] com ${extractedMonths.length} meses.`, 'success');
    } else {
        showAlert('Nenhum dado válido', 'A planilha foi lida, mas nenhum dado válido foi encontrado.', 'warning');
    }
}
    });
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

// Processador de arquivo com detecção de encoding UTF-8 / ISO
function processCSV(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
let content = e.target.result;
if (content.includes('')) {
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
    
    // Identifica onde começam os meses sem tratar a coluna Ano como dado mensal
    const metadataHeaders = new Set([
        'setor', 'indicador', 'meta', 'und', 'unidade', 'direcao', 'direção', 'ano'
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
    if (extractedMonths.length > 0) {
        syncMonthLabels(extractedMonths);
    }

    // Extrai as linhas de dados
    for (let i = headerIndex + 1; i < rows.length; i++) {
        const row = rows[i].map(c => cleanStr(c));
        if (row.length > 1 && row[0] !== '') {
            newParsed.push({
                setor: row[0],
                indicador: row[1] || '',
                meta: parsePtNum(row[2]),
                und: row[3] || 'Qtd',
                valores: monthIndexes.map(({ index }) => parsePtNum(row[index]))
            });
        }
    }

    if (newParsed.length > 0) {
        saveData(newParsed);
        initSystem();
        if (!silencioso) {
            showAlert('Sucesso!', `${newParsed.length} indicadores atualizados com ${mesesLabels.length} meses.`, 'success');
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
    const headers = ['Setor', 'Indicador', 'Meta', 'Und.', ...mesesLabels];
    const escapeCSV = value => {
        const text = value === null || value === undefined ? '' : String(value);
        return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const rows = currentData.map(item => [
        item.setor,
        item.indicador,
        item.meta,
        item.und,
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
    Swal.fire({
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

        Swal.fire({
            title: 'Dados restaurados!',
            text: 'Os dados padrões foram carregados.',
            icon: 'success',
            background: '#111C38',
            color: '#f8fafc',
            confirmButtonColor: '#EAB308'
        });
    });
}
