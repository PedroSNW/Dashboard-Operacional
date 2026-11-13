# Redesign D'Granel V3

Implementação local em 13/11/2026. Nenhum deploy realizado. Ponto de restauração: branch `backup/redesign-v3`, commit `5561a0d9c213d56b9aebcedd56d05a24728098b5`.

## Inventário e abordagem

A SPA continua em HTML/CSS/JavaScript, com `switchTab()`, Chart.js, PapaParse, Supabase e o compositor jsPDF existentes. Os 190 IDs do HTML anterior foram preservados; componentes são reposicionados sem substituir seus contratos e eventos. A implantação foi dividida em shell/navegação, módulos operacionais, relatórios/progresso e validação. Não houve migração de framework nem de modelo de dados.

| Área | Resultado |
| --- | --- |
| Login | Identidade consistente com os temas; fluxo de autenticação preservado. |
| Navegação | Sidebar agrupada em Operação, Inteligência e Gestão; recolhimento desktop; drawer mobile com Escape, foco e conteúdo de fundo inerte. Topbar estável, título contextual, sincronização, salvar, notificações, tema e menu de conta. |
| Visão geral | Indicadores disponíveis, fora da meta, alertas gerados e direções pendentes; prioridades, alertas recentes e atalhos. Conteúdo institucional preservado em bloco recolhível. Contagens derivam do estado existente validado, sem números decorativos ou inferência por nome. |
| Dashboards | Cards mais legíveis, direção e variação temporal no KPI, valores reais imediatos, ações contextuais. Instâncias, widgets, zoom e scroll preservados. Sidebar solicita resize, sem reconstruir gráficos. Unidades diferentes usam eixos independentes nos gráficos cartesianos. Título causal substituído por evolução comparativa. |
| Indicadores | Busca, filtros ativos/limpeza, contagem, tabela com identificação fixa e scroll local. Estado vazio distingue ausência de resultados de leitura indisponível. Linguagem “Fora da meta”. Importação e edição preservadas. |
| Inteligência | Superfícies e hierarquia comuns, atalhos de perguntas, indicação de uso de agregados; Groq principal e Gemini/OpenAI disponíveis. Alertas, diagnóstico e respostas determinísticas continuam usando os módulos existentes. |
| Governança e auditoria | Navegação agrupada, tabelas/cards com contraste e leitura consistentes; controles e histórico existentes preservados. |
| Relatórios | Etapas Configuração, Seleção, Prévia, Interpretação e Exportação. Busca e checkboxes por setor com contagem/limpeza, sincronizados ao `reportIndicators` original. Prévia e proteções de desatualização preservadas. |

## Design system

`public/workspace-v3.css` centraliza tokens `--ds-*`: fundo, superfície, elevação, borda, texto, texto secundário, marca, sucesso, atenção, erro, informação, tipografia, espaçamento, raio, sombra e transição. Azul-marinho e dourado, com alternativas claras. Sidebar 248 px, recolhida 80 px, drawer abaixo de 1024 px; breakpoints são aplicados em media queries (variáveis CSS não substituem condições de media queries).

Estilos são progressivos e limitados ao workspace. Cards deixam de usar blur e deslocamentos decorativos; valores não recebem animação de contagem. Foco visível, nomes acessíveis, `aria-current`, estados textuais, diálogo de progresso e suporte a `prefers-reduced-motion`. Modais existentes recebem papel, rótulo, foco inicial, contenção de Tab e Escape.

## Progresso real do PDF

O visual do PDF aprovado foi mantido. `ReportPdf.build()` continua síncrono e compatível; `buildAsync()` utiliza o mesmo compositor gerador, liberando a interface entre indicadores e páginas finalizadas. Não existe temporizador que avance o percentual.

| Faixa | Trabalho observado |
| --- | --- |
| 0–5% | Validação de sessão, estado Supabase, filtros e prévia; início das bibliotecas. |
| 10% | Bibliotecas carregadas. |
| 10–45% | Imagens efetivamente preparadas, uma por gráfico. |
| 45–85% | Indicadores efetivamente compostos, um callback por indicador. |
| 85–94% | Cabeçalhos/rodapés das páginas efetivamente finalizados. Total de páginas só aparece após a composição. |
| Indeterminado | Serialização síncrona final do documento. |
| 97% | Blob pronto e verificação final antes do download. |
| 100% | Um único download solicitado ao navegador. Mensagem: “Download iniciado”. |

Os pesos indicam unidades de trabalho, não estimativa de tempo. Há oportunidades de pintura por `requestAnimationFrame` e agendamento entre lotes. Renderizar um gráfico, compor uma tabela individual muito longa e serializar o Blob ainda podem bloquear temporariamente a thread; não há progresso simulado dentro dessas chamadas. Web Worker não foi introduzido.

Diálogo nativo com `progressbar`, atributos ARIA, status `aria-live`, nome e etapa/contagem. Exportação concorrente bloqueada; controles restaurados em `finally`; biblioteca/imagem/renderização inválida preservam a prévia. Não há cancelamento fictício: durante a composição o diálogo não fecha por Escape, e oferece Fechar ao concluir/falhar. URL temporária do Blob é revogada após o acionamento. O sistema não afirma que o arquivo foi gravado no computador.

## Arquivos

Novos de produção: `public/workspace-v3.css`, `public/workspace-v3.js`, `public/pdf-progress.js`.

Modificados de produção: `public/index.html`, `public/main.js`, `public/reports.js`, `public/report-pdf.js`.

Testes: novos `tests/v3-static.test.mjs`, `tests/workspace-v3-browser.js`; atualizados `tests/pdf.test.mjs`, `tests/reports-browser.ts`, `tests/reports-cdp.ts`. Este documento registra a entrega. Arquivos de validação locais ficam em `.validation-tools/`, ignorado pelo Git.

## Validação executada

| Verificação | Resultado e escopo |
| --- | --- |
| Sintaxe e contratos | Cinco arquivos JS analisados; 190 IDs anteriores presentes, nenhum ID duplicado. |
| Contraste | Seis pares de tokens de texto/superfície >= 4,5:1; não representa certificação de todas as combinações da aplicação. |
| Edge Function | `deno check --cached-only --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts` passou. |
| Regressão automatizada | Suítes `reports`, `structured`, `presentation`, `analytics`, `ia-context`, `groq-budget` e `edge-handler` passaram; provedores e serviços simulados. |
| PDF | Relatório longo de 10 páginas, curto de 2 páginas, narrativa longa e cabeçalhos por página; callbacks assíncronos por indicador e página. Caso de um indicador também incluído. |
| Chrome real, dados simulados | 320 escuro, 360 claro, 390 claro, 768 escuro, 1024 claro, 1440 escuro e 1920 claro: prévia sem IA, quatro gráficos reais, PDF multipágina, falha Groq preservando prévia, filtros, tema e ausência de overflow global. |
| Fluxos V3 | Em 320/390/1440: todos os módulos, KPI, gráfico personalizado, zoom, busca, modal de edição/Escape, seleção checkbox, progresso monotônico/callbacks, clique duplicado com download único, falhas de biblioteca/renderização/imagem e restauração. |
| Proteções e persistência | Bloqueio de relatório/salvamento sem leitura validada. Pipeline de importação CSV com parser substituído e salvamento com rede simulada, preservando meta zero/valor zero. Não equivale a testar parser CSV ou gravação reais. |
| Provedores | Groq como padrão e troca Gemini/OpenAI/Groq na UI; contratos dos três provedores cobertos pelos testes mockados. Nenhuma API real consultada. |

Para repetir, use Deno disponível no PATH ou `.validation-tools/deno.exe` neste ambiente. Testes PDF precisam de `.validation-tools/` para artefatos. Exemplo:

```powershell
$env:DENO_DIR = Join-Path (Get-Location) '.validation-tools/cache'
.\.validation-tools\deno.exe run --allow-read tests/v3-static.test.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/pdf.test.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/reports-browser.ts
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools --allow-net=127.0.0.1:9337 --allow-run='C:\Program Files\Google\Chrome\Application\chrome.exe' tests/reports-cdp.ts --v3
```

O fixture do navegador usa cópias locais de bibliotecas em `.validation-tools/`, CSP restritiva, autenticação e fetch simulados. Não aponta para produção. A prova de download observa o Blob e um único acionamento; não verifica gravação em disco pelo usuário.

## Capturas

Antes: `.validation-tools/v3-before/report-desktop.png`, `report-mobile.png`, `ai-desktop.png`, `ai-mobile.png`. Não foram capturadas baselines de todas as telas.

Depois: `.validation-tools/v3-{home,dashboard,datagrid,intelligence,reports,governance,audit,login}-{320,mobile,desktop}.png`; progresso em `v3-pdf-progress-{320,mobile,desktop}.png`. `mobile` corresponde a 390 px; `desktop` a 1440 px. Relatórios e IA também têm capturas nas sete larguras (`report-*` e `ai-*`). As capturas usam indicadores fictícios. Login foi capturado visualmente, sem autenticação real. As capturas `intelligence` mostram o módulo ativo no fixture; não documentam todas as subabas.

Exemplos locais: [visão geral](.validation-tools/v3-home-desktop.png), [indicadores mobile](.validation-tools/v3-datagrid-320.png), [progresso PDF](.validation-tools/v3-pdf-progress-desktop.png), [relatórios antes](.validation-tools/v3-before/report-desktop.png), [relatórios depois](.validation-tools/v3-reports-desktop.png).

## Limitações e homologação pendente

- Autenticação real, expiração de sessão, rede Supabase, gravação, CSV via arquivo real/drag and drop, logs reais, logo personalizada e chamadas reais Groq/Gemini/OpenAI precisam de homologação autorizada. Não foram declaradas aprovadas por simulações.
- Filtros mensais, todas as combinações de widgets, exportações individuais de gráficos, edição persistida e notificações/leitura persistida não receberam testes completos de ponta a ponta. Lógicas existentes foram preservadas.
- Contraste foi testado em pares semânticos e a navegação/foco foi exercitada em Chrome; leitor de tela, Safari/iOS, Firefox e auditoria WCAG completa permanecem pendentes.
- O modo desenvolvedor por cliques/classe CSS permanece como comportamento legado de interface, não é autorização. Permissões de auditoria e ações administrativas devem ser verificadas no backend/RLS em revisão específica; nenhuma política foi alterada nem foi adicionada busca privilegiada pela nova UI.
- Regras amplas do CSS claro legado e dependências CDN continuam existentes. Migrar os seletores restantes e empacotar dependências são etapas futuras, para evitar uma troca radical neste redesign.
- Os testes não constituem benchmark de desempenho de snapshots extremos; tabelas individuais muito longas ainda podem bloquear a composição.

## Publicação manual na Vercel

1. Revisar o diff e manter a branch de restauração. Não publicar `.validation-tools/`, fixtures ou screenshots como parte do site.
2. Incluir os sete arquivos de produção listados acima no commit/artefato, preservando todo o restante de `public/`, especialmente `vendor/`, imagens e configurações existentes. Publicar somente `index.html` quebra os novos recursos.
3. No projeto Vercel existente, confirmar a raiz já usada. Para configuração estática com raiz no repositório: Framework Preset `Other`, sem comando de build, Output Directory `public`. Se a raiz já for `public`, manter essa configuração equivalente; não criar um segundo diretório `public/public`.
4. Usar primeiro um Preview Deployment pela branch revisada, seguindo a integração Git existente. Não alterar variáveis, Secrets, domínios ou configurações Supabase.
5. No preview, validar login autorizado, leitura, navegação/temas e seleção de indicadores; gerar PDF com um e vários indicadores, conferir que há um único download e que falhas permitem repetir. Testes que gravam devem usar somente ambiente/dados de homologação autorizados.
6. Após aprovação humana, promover o preview validado ou publicar pela branch de produção conforme o fluxo Vercel existente. Nenhuma dessas ações foi executada nesta tarefa.
7. Para rollback, restaurar na branch de publicação o conteúdo do commit de backup, revisar o diff e publicar manualmente. Não fazer reset destrutivo da árvore de trabalho.

Não é necessário publicar Edge Function no Supabase para este redesign. `supabase/` não tem alterações; dados de produção, tabelas, RLS, Secrets, metas, direções, histórico e cálculos determinísticos permaneceram inalterados.
