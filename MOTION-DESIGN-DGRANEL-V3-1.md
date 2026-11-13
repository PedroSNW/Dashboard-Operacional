# D'Granel V3.1 — Motion & Premium Experience

Implementação local de 13/11/2026 sobre a V3 atual do workspace. Ponto de restauração: branch `backup/motion-v3-1`, commit `88329f0a608ae0e02f03ba832bfaf723afc79907`. Sem deploy, bibliotecas novas ou chamadas reais a provedores.

## Investigação e decisões

Foram inspecionados HTML, CSS global, camada V3, navegação, temas, persistência, renderização Chart.js, alertas, IA e progresso PDF. A V3 já neutralizava entradas antigas de página/reveal; o CSS legado ainda incluía animação de clique e sombras em todos os botões. O tema exibia o ícone de destino, marcava o estado corporativo como alterado e era carregado do snapshot compartilhado.

O refinamento mantém estrutura, IDs e funções públicas. A animação global antiga de clique deixa de ser acionada no workspace; as novas transições têm escopo e respeitam movimento reduzido. Não foram adicionados GSAP, dependências ou novos frameworks: CSS atende superfícies/estados e Web Animations API atende entradas canceláveis e deslocamento do shell.

## Motion design system

Tokens em `public/motion-v3-1.css`:

| Token | Valor | Uso |
| --- | --- | --- |
| `--motion-micro` | 120 ms | Press/saídas visuais e acompanhamento da barra PDF. |
| `--motion-short` | 190 ms | Navegação, foco, superfícies, diálogos, resposta IA. |
| `--motion-medium` | 260 ms | Sidebar, deslocamento do conteúdo e tema. |
| `--motion-long` | 340 ms | Reserva para componentes maiores, sem animação contínua aplicada. |
| `--ease-productive` | `cubic-bezier(.2,0,.38,.9)` | Estados e adaptação do shell. |
| `--ease-enter` | `cubic-bezier(0,0,.3,1)` | Entrada de superfícies. |
| `--ease-exit` | `cubic-bezier(.2,0,1,.9)` | Saída breve. |

WAAPI lê as durações dos tokens. Animações anteriores do mesmo nó são canceladas; referências são removidas ao finalizar/cancelar. A preferência de movimento reduzido elimina transições CSS e WAAPI, inclusive ao mudar a preferência durante a sessão. Nenhuma função depende do término de animação para executar uma operação de negócio.

Páginas entram com opacidade mínima de 0,88 e deslocamento de 4 px: conteúdo permanece disponível imediatamente. Não há animação linha a linha em tabelas, contagem artificial, atraso de resposta, digitação simulada, brilho contínuo ou `will-change` permanente.

## Botão sol/lua e preferência

- Tema claro ativo: sol em SVG, tooltip e `aria-label` “Tema claro — ativar escuro”.
- Tema escuro ativo: lua em SVG, tooltip e `aria-label` “Tema escuro — ativar claro”.
- Ícone, `currentTheme`, classe do body, `data-theme` e `color-scheme` permanecem sincronizados. Estado lógico não depende de classes Font Awesome.
- `theme-preference.js` lê `dgranel.theme` antes das folhas de estilo; o body recebe a classe correspondente no início da marcação. O script é pequeno, local e não usa rede. A preferência é aplicada novamente na inicialização e leitura do snapshot.
- `toggleTheme()` preserva a assinatura, grava somente no localStorage e não chama `markStateDirty()`. Falha ou bloqueio do armazenamento não impede a troca durante a sessão.
- O campo legado `theme` continua no contrato do snapshot. `sharedTheme` preserva o valor recebido do snapshot para futuras gravações normais; a preferência pessoal não substitui esse campo no payload. Se não houver preferência local, o tema compartilhado continua servindo de fallback após a leitura. Não houve migração de banco.
- Gráficos existentes recebem `update('none')`: atualização de estilo sem recriação nem animação de seus valores. A troca de ícone usa opacidade e rotação de 12 graus; cores de superfície mudam em 260 ms.

Uma preferência compartilhada clara sem preferência local só pode ser conhecida após a leitura remota; não há promessa de conhecer o snapshot antes da autenticação. Preferências locais válidas evitam a inicialização no tema contrário.

## Melhorias por módulo

| Área | Refinamento |
| --- | --- |
| Sidebar | Labels com largura estável/opacidade, ícones alinhados e acento ativo breve. A largura aparente da sidebar muda por recorte (`clip-path`) em 260 ms, sem recalcular a largura do shell em cada quadro; main/topbar mudam a largura uma vez e recebem translação FLIP. O resize existente preserva instâncias. |
| Mobile | Drawer por transform, overlay por opacidade, fundo inerte e foco/Escape da V3 preservados. Overlay decorativo fora da ordem de Tab. |
| Topbar | Hover/borda consistentes, ponto de sincronização, processamento somente durante salvamento real, `aria-busy` no salvar, falha de salvamento explícita. Não pisca para alterações pendentes. |
| KPIs | Realce de borda/sombra discreto, sem levantar cards. Números continuam exatos e imediatos. |
| Chart.js | Tooltips, pontos em hover, legendas, ticks e grades adaptados aos temas. Mantidos `animation:false`, scroll e zoom. Filtros mensais sinalizam mudança com entrada breve do container, sem animar dados ou exportações. |
| Navegação | Entrada apenas quando muda o módulo; atualizações de dados não disparam entrada de página inteira. `switchTab()` mantém sua lógica original de scroll e renderização. |
| Formulários | Focus ring, bordas, feedback de press e seleção das linhas checkbox. Controles nativos preservados. |
| Central IA | Skeleton apenas durante a Promise real, `aria-busy` e status anunciável; saída completa imediatamente disponível com entrada discreta. Falha remove loading e reativa o envio. Groq principal, alternativas e validação inalteradas. |
| Alertas | Sem pulso chamativo em badges críticos, hover discreto. Após a ação de leitura existente, a lista real é atualizada imediatamente; uma cópia visual inerte/oculta para acessibilidade desaparece em 120 ms. A cópia não altera leitura, filtros ou persistência e perde IDs/handlers inline. Foco retorna a uma ação da lista quando o item focado sai. |
| Relatórios | Seleção com fundo/acento dourado, busca com foco, mensagem de prévia destacada. PDF mantém callbacks e compositor da V3; a barra interpola somente entre valores reais já recebidos, sem avanço por relógio. |
| Modais | Entrada com deslocamento/escala discreta, foco e Escape existentes; fechamento lógico imediato com saída visual inerte de 120 ms nos modais legados. SweetAlert2 usa os mesmos tokens. Diálogo nativo de PDF mantém fechamento/proteções da V3. |

As cópias visuais de saída são removidas por fim/cancelamento da animação e por um limite curto de limpeza. Esse limite trata navegadores que adiam eventos de animação em abas de fundo; não mede processamento nem avança o progresso PDF. Os formulários reais e seus valores permanecem nos nós originais.

## Arquivos

Novos de produção:

- `public/theme-preference.js`
- `public/motion-v3-1.css`
- `public/motion-v3-1.js`

Modificados de produção:

- `public/index.html`: bootstrap, CSS/JS V3.1 e versões de cache.
- `public/main.js`: tema, ganchos de apresentação e foco após leitura de alerta.
- `public/workspace-v3.js`: ícone correto, sincronização/falha e integração do shell/overlay.

Novos testes: `tests/theme-preference.test.mjs`, `tests/motion-browser.js`, `tests/motion-cdp.ts`. Atualizados: `tests/v3-static.test.mjs`, `tests/reports-browser.ts`.

Não foram modificados `public/report-pdf.js`, `public/reports.js`, `public/pdf-progress.js`, arquivos de `supabase/`, tabelas, RLS, Secrets, metas, dados de indicadores ou cálculos determinísticos.

## Testes e evidências

As verificações utilizam Chrome real com serviços/indicadores fictícios isolados no fixture e CSP sem acesso à produção. Os arquivos de captura e medição ficam em `.validation-tools/`, ignorado pelo Git.

| Teste | Resultado / escopo |
| --- | --- |
| `v3-static.test.mjs` | Passou: 190 IDs preservados, sem duplicação, sintaxe de sete scripts e seis pares semânticos >= 4,5:1. |
| `theme-preference.test.mjs` | Passou: bootstrap claro/escuro, chave ausente/inválida e armazenamento bloqueado. |
| `reports.test.mjs` | Passou: tipos, recortes, nulos, meta zero, neutralidade, imutabilidade e falha de leitura. |
| `structured.test.mjs` | Passou: JSON, referências, valores inventados, deduplicação e fallback. |
| `presentation.test.mjs` | Passou: relevância, períodos, parcialidade e fatos canônicos. |
| `analytics.test.mjs` | Passou: precisão, ordenação, overflow e composição determinística. |
| `ia-context.test.js` | Passou: proteções de estado, contexto/payload, três provedores, nulos/zeros e ligações da UI. |
| `groq-budget.test.mjs` | Passou: orçamentos, contextos e erros 400/413/429 com sanitização. |
| `edge-handler.test.ts` | Passou: 13 cenários completos mockados, autenticação, CORS, leitura negada, provedores, timeout e falhas. |
| Deno check | Passou com `supabase/functions/deno.json` e cache local. Nenhum ajuste de backend necessário. |
| `pdf.test.mjs` | Passou: um indicador, curto de 2 páginas, longo de 10 páginas, narrativa longa e callbacks de indicador/página. |
| `reports-cdp.ts --v3` | Matriz V3: regressões de prévia, gráficos, falha IA, exportação, callbacks, download único, falhas de biblioteca/imagem, filtros, edição, CSV/salvamento simulados, foco e proteção Supabase. |
| `motion-cdp.ts` | Matriz V3.1: ambos os temas em 320/390/768/1024/1440/1920, alternância repetida, sol/lua/tooltip/ARIA, tema persistido após reload, dados/revisão intactos, instâncias sem recriação, limpeza de animações, skeleton real, falha IA, alertas e foco. Caso adicional 1440 com movimento reduzido. |

As duas matrizes passaram na execução final. O teste adicional `motion-cdp.ts --keyboard` passou em 320 px e 1440 px: abertura por Enter, navegação por Tab/Enter, Escape e retorno do foco no mobile; os sete módulos foram acionados por Enter no desktop com movimento reduzido. O protocolo CDP exige o texto de Enter (`\r`) além do keycode; o teste foi corrigido para enviar o evento completo.

Uma execução intermediária detectou retenção de cópia visual de alerta quando o navegador adiou o evento de animação. O limite de limpeza foi acrescentado e a matriz completa passou novamente. Leitor de tela, testes em aparelhos físicos e integrações reais não estão homologados por esses testes.

## Performance

Medição local CDP em Chrome headless com o fixture da V3 preservado e o fixture atual. Carga: dez trocas rápidas de tema, navegação pelos módulos e um ciclo de recolher/expandir sidebar em desktop. São amostras únicas de diagnóstico, não um benchmark estatístico de produção. Bibliotecas estão em cache local e não há custo real de CDN, rede, autenticação ou APIs.

Uma primeira medição detectou redesenhos durante a transição contínua da largura do conteúdo. A implementação foi ajustada: largura útil final aplicada uma vez, movimento por transform e resize existente. Não se animam números, séries ou canvas. A sidebar usa recorte animado em lugar da animação de largura, com labels fixas.

Os arquivos `.validation-tools/motion-before-metrics.json` e `motion-after-metrics.json` contêm DOMContentLoaded, tempo de tarefas, contagens de layout/estilo e heap observado. Variações de garbage collection tornam deltas isolados de memória inadequados para concluir ausência de vazamentos. A limpeza das animações/elementos temporários também é verificada funcionalmente.

Amostra comparável em 1440 px, tema escuro:

| Métrica | V3 preservada | V3.1 final | V3.1 com movimento reduzido |
| --- | --- | --- | --- |
| DOMContentLoaded do fixture | 449 ms | 380 ms | 383 ms |
| Tempo acumulado de tarefas na sequência | 521 ms | 679 ms | 615 ms |
| Layouts na sequência | 27 | 48 | 25 |
| Recálculos de estilo | 59 | 84 | 38 |
| Heap JS observado no final | 24,46 MB | 20,23 MB | 20,02 MB |

Há custo adicional de tarefas/estilo nessa sequência sintética; não há evidência para declarar ganho global de velocidade. A V3.1 também atualiza os gráficos de relatórios na troca de tema, que a V3 não incluía na lista de atualização. A primeira versão intermediária com largura animada continuamente havia registrado cerca de 777 ms de tarefas e 70 layouts em 1440 px; o recorte/FLIP reduziu esses valores na amostra final. Amostras únicas não isolam variância da máquina nem permitem atribuir toda a diferença à animação. A homologação em aparelhos modestos continua pendente.

Os três arquivos novos de produção somam aproximadamente 14 KB sem compressão, sem downloads de novas bibliotecas. O arquivo `motion-keyboard-metrics.json` pertence à verificação adicional concorrente com a regressão PDF e não foi usado nessa comparação.

Não foram medidos INP/LCP/CLS de produção, utilização de CPU em dispositivo modesto ou consumo de bateria. Não se declara que a animação tem custo zero ou que todo o produto ficou mais rápido.

## Capturas

Antes: `.validation-tools/v3-1-before/v3-home-desktop.png`, `v3-reports-mobile.png`, `ai-desktop.png`. Fixture V3 integral preservado em `v3-1-before/reports-browser.html` para comparação.

Depois: `.validation-tools/motion-{home,dashboard,datagrid,intelligence,reports,governance,audit}-{320,1440}-{dark,light}.png`. Capturas registram estados estáticos, não a fluidez de movimento. A suíte V3 também gera capturas do progresso PDF e dos módulos em mobile/desktop. Não há baseline de todas as telas/temas.

## Reproduzir localmente

Neste ambiente há Deno em `.validation-tools/deno.exe` e Chrome no caminho abaixo. `reports-browser.ts` exige as bibliotecas locais de validação em `.validation-tools/` e o fixture gerado por `pdf.test.mjs`; nenhum deles deve ser publicado.

```powershell
.\.validation-tools\deno.exe run --allow-read tests/theme-preference.test.mjs
.\.validation-tools\deno.exe run --allow-read tests/v3-static.test.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/pdf.test.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/reports-browser.ts
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools --allow-net=127.0.0.1:9338 --allow-run='C:\Program Files\Google\Chrome\Application\chrome.exe' tests/motion-cdp.ts
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools --allow-net=127.0.0.1:9338 --allow-run='C:\Program Files\Google\Chrome\Application\chrome.exe' tests/motion-cdp.ts --keyboard
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools --allow-net=127.0.0.1:9337 --allow-run='C:\Program Files\Google\Chrome\Application\chrome.exe' tests/reports-cdp.ts --v3
```

## Pendências e limites

- Homologar autenticação, leitura/gravação autorizadas, alertas reais e provedores reais em ambiente apropriado. Não foram enviados dados corporativos a APIs nem feitas gravações reais nesta tarefa.
- Preferências locais dependem do armazenamento permitido pelo navegador; se bloqueado, persistência após reload não é possível, mas a interface continua funcionando.
- Modo desenvolvedor legado continua sem constituir autorização de backend. Nenhuma política ou permissão foi alterada.
- CSS claro legado, dependências CDN e renderizações de gráficos ao trocar módulos são da V3 e continuam presentes. O motion não adiciona reconstruções; uma revisão futura pode reduzir reconstruções já existentes.
- Fechamento visual nativo do diálogo PDF permanece imediato; a entrada e os estados receberam acabamento. Não há cancelamento fictício nem alteração da geração.
- Sem Web Animations API, entradas são omitidas; as funções de negócio continuam. O caminho de cópias visuais só é usado quando a API existe.
- Navegação por Tab/Escape e contraste de tokens foram testados; isso não equivale a certificação WCAG 2.2 AA completa ou validação manual com leitor de tela.

## Publicação manual

1. Revisar o diff contra `backup/motion-v3-1` e manter esse ponto de restauração.
2. Publicar o conteúdo de `public/` com os três novos arquivos de produção e as três modificações listadas acima. Preservar os arquivos V3, vendor e assets. Não publicar apenas o HTML nem incluir `.validation-tools/` no site.
3. Usar a configuração estática Vercel existente. Se a raiz do projeto é o repositório: preset `Other`, sem build, saída `public`. Se a raiz já é `public`, preservar a configuração equivalente.
4. Criar manualmente um preview pela branch revisada, seguindo o fluxo Git já adotado. Validar tema persistido, ambos os temas, drawer/teclado, gráficos e PDF; respeitar as origens autorizadas já existentes.
5. Só após revisão humana, promover o preview ou publicar na branch de produção. Nenhum comando de deploy foi executado.
6. Rollback: restaurar os arquivos do commit de referência na branch de publicação, revisar e republicar pelo processo habitual. Não usar reset destrutivo no workspace.

Não há publicação de Edge Function nem alteração de Secrets necessária para a V3.1.
