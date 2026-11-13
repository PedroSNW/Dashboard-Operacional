# Alterações pendentes — D'Granel V3.1

Correção local em 13/11/2026, baseada no código atual. Restauração: branch `backup/pending-changes`, commit `17d9cd0bc55cbf195e92ebebb0bcfa741a6b26de`. Nenhum deploy ou acesso de escrita à produção realizado.

## Causas encontradas

1. `markStateDirty()` atribuía `true` incondicionalmente. O flag não verificava o payload; chamadas repetidas, reenvio de valores iguais ou desfazer uma edição não restauravam o estado limpo.
2. `selectDashboard()` chamava `saveDashboards()`, embora selecionar uma configuração existente seja navegação pessoal.
3. O zoom marcava o estado como alterado a cada interação, inclusive ao retornar à mesma escala. Os valores entravam em `zoomGraficos` no snapshot compartilhado.
4. `loadStoredDashboards()` chamava `saveDashboards()` durante inicialização; renderizações também recalculavam e reordenavam `sectors` globalmente. Abrir o seletor de setores podia modificar o estado persistível.
5. A leitura reconstruía dashboards removendo widgets padrão existentes e descartando propriedades adicionais. Isso foi corrigido para preservar os widgets e metadados carregados.
6. `initSystem()` chamava sincronização de competências durante renderização. A visualização deixa de alterar essa configuração; importação e edição continuam com os fluxos explícitos existentes.
7. O sucesso usava diferença de `stateRevision`, sem referência ao payload efetivamente confirmado. A cópia enviada era montada somente quando a fila chegava à gravação, depois da espera de autenticação.
8. O POST/upsert compartilhado não conferia `updated_at`; uma sessão antiga podia sobrescrever uma atualização remota mais recente.

O tema da V3.1 já era uma preferência local e não chamava `markStateDirty()`; esse comportamento foi preservado.

## Mapa das chamadas e classificação

| Origem | Classificação e resultado |
| --- | --- |
| Zoom de `wrapCanvasForScroll` | Preferência pessoal: removida a chamada de dirty; armazenamento local. |
| `selectDashboard` | Navegação pessoal: removida chamada indireta via `saveDashboards`. |
| `loadStoredDashboards` | Inicialização/reset: removida chamada indireta. Reset explícito continua marcando alterações ao final. |
| `saveDashboards` | Configuração corporativa: criação/renomeação/exclusão de dashboard; inclusão/remoção de widgets e associações de gráficos/KPIs. Mantido, mas só conteúdo diferente gera pendência. |
| Upload/remoção de logo | Alteração corporativa de identidade: mantida. Repetir valor original não gera pendência. |
| `saveKpis` | Criação, edição e exclusão de KPI: mantida. |
| `saveCustomChartsStorage` | Criação, edição e exclusão de gráfico: mantida. |
| Exclusão/configuração de gráfico padrão | Configuração corporativa: mantida. |
| `saveData` | Valores mensais, meta, nome, unidade, setor, importações e edições efetivas: mantida. |
| `toggleDataLabels` | Configuração compartilhada já persistida: mantida e apresentada como “Rótulos de gráficos”. Não foi migrada silenciosamente para preferência pessoal. |
| Atualização de direção pela governança | Campo corporativo: mantida, agrupada em Governança. |
| `resetData` | Restauração solicitada explicitamente: mantida. |
| `createSector` | Alteração legítima antes não sinalizada: adicionada recomputação de pendências. |
| Navegação, modais, filtros, alertas, renderizações, IA e relatórios | Não escrevem o snapshot nem criam dirty apenas pela interação. |

`stateRevision` continua disponível e incrementa nos pontos de edição, mas não decide se há diferenças nem quais foram salvas.

## Comparação e snapshot

`projectPersistedState()` é a única projeção dos campos do salvamento. `PendingState.clone()` materializa uma cópia JSON, usada pela prévia e pelo transporte. O tracker mantém uma cópia independente da referência confirmada.

Comparação canônica ordena apenas chaves de objetos. A ordem dos arrays é preservada: reordenar competências, indicadores, widgets ou séries não é descartado. `null` e zero são diferentes. Referências recriadas, ordenação de propriedades e operações sem mudança de conteúdo não contam. Alterar e restaurar o valor original elimina a diferença automaticamente.

A referência é capturada após a leitura autorizada e interpretação dos formatos legados já suportados: coleções opcionais ausentes recebem os defaults do loader, dashboards sem identificador/nome recebem os fallbacks existentes e seleção inválida recebe um dashboard disponível. Esses defaults de compatibilidade não aparecem como uma edição do usuário. Em snapshots completos e válidos, a projeção equivale ao conteúdo recebido; o teste de navegador verifica isso. Valores, metas e direções não são recalculados para construir a referência.

A projeção não modifica o estado ou o objeto remoto. A renderização não redefine setores ou competências. A referência só é substituída por uma nova leitura aceita ou pela confirmação válida do payload enviado.

## Preferências pessoais e contrato legado

- Tema continua em `dgranel.theme`, como na V3.1.
- Dashboard selecionado e zoom ficam em `dgranel.view.<id-do-usuário>` no localStorage, quando permitido pelo navegador.
- Ao carregar, os campos compartilhados antigos ainda servem de fallback para usuários sem preferência local.
- `activeDashboardId` e `zoomGraficos` continuam no payload com os valores compartilhados de referência; navegação e zoom locais não os substituem numa futura gravação corporativa.
- Se o dashboard compartilhado for realmente excluído, a projeção aponta para um dashboard restante. Essa mudança é parte da exclusão legítima e aparece na prévia.
- A configuração compartilhada de rótulos de gráficos permanece compartilhada.

Essa mudança de comportamento é deliberada e explícita: os campos antigos não foram removidos, não houve migração de dados e seleção/zoom do usuário deixam de criar pendências corporativas. Se armazenamento local estiver bloqueado, a preferência só dura durante a sessão.

## Central de alterações e salvamento

Botão compacto próximo a Salvar com contador, estado e resumo no hover. Abre um diálogo nativo acessível nos dois temas e em mobile, com categorias expansíveis, setor/indicador/competência, campo, valor anterior e novo. Objetos adicionados/removidos oferecem detalhes completos. Logos não exibem conteúdo base64.

Cada diferença de campo é contada; uma inclusão/remoção de registro é uma diferença contendo o registro completo. Arrays existentes são comparados por posição, portanto grandes reordenações podem produzir várias diferenças. Categorias são renderizadas inicialmente em lotes de 100 e oferecem “Mostrar mais”, sem truncar o payload ou perder o total.

1. Salvar/Ctrl+S valida as proteções da leitura e abre a prévia. Não envia dados nessa ação.
2. Sem diferenças, o botão de gravação fica desabilitado; o botão da central permite consultar o estado vazio.
3. Confirmar salvamento verifica a correspondência entre a prévia e o estado atual. Se houver mudança sem atualização da prévia, solicita revisão em vez de enviar outro conteúdo silenciosamente.
4. Uma cópia isolada do payload e da versão é capturada. `isSavingState` impede envios simultâneos pela UI; a fila existente continua serializando gravações.
5. Após a resposta válida, o snapshot de referência avança para exatamente a cópia enviada. O estado atual é comparado novamente; alterações surgidas durante o envio continuam pendentes.
6. Erros, conflitos, sessão expirada ou confirmação inválida não limpam a referência nem as diferenças. O indicador sai de Salvando em `finally`.
7. A requisição de escrita tem timeout de 30 segundos. Um timeout pode ocorrer depois de o servidor aplicar a operação: a UI informa que não houve confirmação, conserva as diferenças e não tenta reenviar automaticamente.
8. Logout/troca de usuário limpa a central e invalida respostas antigas por geração de sessão. Isso não promete desfazer uma operação que já tenha chegado ao servidor.

O painel pode ser fechado durante o envio; isso não cancela a gravação. A gravação confirmada não fica aguardando o request de auditoria: o log existente é disparado separadamente, e falha do log não transforma uma gravação confirmada em falha de persistência.

## Concorrência remota — mudança explícita no transporte

A fila de promessas sozinha só protege uma aba. Para proteger a versão lida, o frontend passa de POST/upsert para uma atualização condicional da mesma linha:

```text
PATCH /rest/v1/dashboard_state?id=eq.1&updated_at=eq.<versão-lida>
Prefer: return=representation
Body: { data: <payload-revisado>, updated_at: <nova-versão> }
```

Nenhuma linha é criada por esse caminho: a leitura válida da linha já é obrigatória. O contrato interno de `data` é preservado. O retorno precisa conter uma única linha id 1, o conteúdo enviado e uma versão válida posterior à anterior. JSONB pode devolver propriedades em outra ordem; isso não altera a comparação.

Se outra atualização mudar `updated_at` antes da execução, o filtro não corresponde e nenhuma linha é confirmada. Ausência de linha também pode indicar restrição de permissão; a mensagem não atribui a causa exclusivamente a concorrência. Não há merge nem retry automáticos. A atualização filtrada com PATCH e retorno da representação é suportada pelo [PostgREST](https://docs.postgrest.org/en/stable/references/api/tables_views.html#update).

Limites: a proteção depende de os escritores atualizarem a versão corretamente. Clientes antigos que continuam fazendo upsert incondicional ou escritores que reutilizam a mesma versão ainda precisam ser retirados/atualizados. Não foi implantada política de concorrência no banco, bloqueio global ou merge por campo. RLS e permissões de PATCH/retorno precisam de homologação real, sem flexibilizar políticas como parte desta entrega.

## Arquivos

Produção novos: `public/pending-state.js`, `public/pending-changes.js`, `public/pending-changes.css`.

Produção modificados: `public/main.js` e `public/index.html`.

Testes novos: `tests/pending-state.test.mjs`, `tests/pending-browser.js`.

Testes adaptados: `tests/reports-browser.ts`, `tests/reports-cdp.ts`, `tests/workspace-v3-browser.js`, `tests/v3-static.test.mjs`, `tests/ia-context.test.js`. Os mocks passaram a confirmar PATCH com a linha retornada, e os testes antigos deixaram de exigir dirty por zoom ou gravação sem revisão.

Nenhuma alteração em Edge Functions, tabelas, RLS, Secrets, bibliotecas, compositor PDF ou dados reais.

## Testes executados

| Verificação | Resultado e escopo |
| --- | --- |
| `pending-state.test.mjs` | Passou: igualdade JSON, ordem de propriedades, arrays com ordem significativa, null/zero, valor mensal/meta/direção, desfazer, isolamento da referência, edição de gráfico/KPI e séries longas. |
| `reports-cdp.ts --pending` | Passou nas sete larguras 320/360/390/768/1024/1440/1920, alternando os temas: carga real do loader com mock, renderização sem dirty, navegação, tema, seleção/zoom, modal, consulta IA, valores/meta/direção, criação de configurações, desfazer, prévia sem envio, confirmação e igualdade do payload. |
| Concorrência no navegador | Passou com mocks: falha HTTP, resposta inválida, conflito sem linha, clique duplicado, edição durante a espera de escrita, retorno ao payload confirmado, sessão expirada antes do envio, logout durante envio e leitura falhando. |
| Teclado da prévia | Passou: Enter abre, Tab alcança confirmação, Escape fecha e restaura foco; sem overflow global nas larguras testadas. |
| Regressão V3 | Gráficos padrão/personalizados, KPI, zoom, busca, edição, CSV e salvamento simulados, proteções de leitura e PDF com callbacks/download único/falhas são exercitados em fixture independente. |
| Regressão V3.1 | Teste `motion-cdp.ts --keyboard` passou em 320 escuro e 1440 claro com movimento reduzido, incluindo tema e navegação dos módulos por Enter. |
| `v3-static.test.mjs` | Passou: 190 IDs anteriores preservados, sem duplicação, sintaxe de nove scripts e seis pares de contraste semântico. |
| Relatórios/PDF | Passaram `reports.test.mjs` e `pdf.test.mjs`: tipos, nulos/meta zero, um indicador, curto de 2 páginas, longo de 10 páginas e callbacks reais. |
| IA/analytics | Passaram `analytics.test.mjs`, `structured.test.mjs`, `presentation.test.mjs`, `ia-context.test.js`, `groq-budget.test.mjs` e 13 cenários de `edge-handler.test.ts`, todos com provedores simulados. |
| Tema e type check | Passaram `theme-preference.test.mjs` e Deno check com `supabase/functions/deno.json`. |

As matrizes de pendências e V3 usam páginas/fixtures independentes: o teste de pendências encerra sessão, troca o snapshot e deixa uma edição intencional; não se deve reutilizar esse mesmo estado modificado para testar uma prévia PDF anterior. Rodar os comandos separadamente.

Capturas locais: `.validation-tools/pending-{320,360,mobile,768,1024,desktop,1920}.png`; `mobile` representa 390 px e `desktop`, 1440 px. São dados fictícios do fixture, não indicadores corporativos. Os artefatos ficam fora do site e do controle de versão.

```powershell
.\.validation-tools\deno.exe run --allow-read tests/pending-state.test.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/pdf.test.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/reports-browser.ts
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools --allow-net=127.0.0.1:9337 --allow-run='C:\Program Files\Google\Chrome\Application\chrome.exe' tests/reports-cdp.ts --pending
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools --allow-net=127.0.0.1:9337 --allow-run='C:\Program Files\Google\Chrome\Application\chrome.exe' tests/reports-cdp.ts --v3
```

## Limitações e homologação pendente

- Nenhum teste gravou em Supabase real. Validar em homologação autorizada a política existente de UPDATE/SELECT, CORS do PATCH, formato do retorno e precisão/atualização de `updated_at`.
- Testar duas sessões reais concorrentes; os testes executados simulam versionamento e conflitos. Não homologam escritores externos ou clientes antigos.
- Sem merge de alterações conflitantes. Ao detectar conflito, preservar as edições e comparar com uma nova leitura antes de recarregar/descartar. Uma recarga manual da página perde edições ainda não persistidas, como antes; esta etapa não cria backup local de indicadores corporativos.
- Campos opcionais e formatos legados seguem os defaults descritos. Não houve migração dos registros históricos nem inferência de novas competências para produzir o snapshot.
- Navegação por teclado foi testada no Chrome; leitor de tela, outros navegadores e snapshots de escala extrema exigem validação adicional.
- O timeout foi configurado; erros de transporte e restauração do estado foram simulados. Não se aguardou uma conexão real de 30 segundos nem se mediu latência de produção.

## Publicação manual

1. Revisar os arquivos contra `backup/pending-changes` e conservar o ponto de restauração.
2. Publicar os cinco arquivos de produção juntos, preservando os demais assets/V3.1. `pending-state.js` precisa carregar antes de `main.js`, como configurado no HTML. Não publicar `.validation-tools/` ou fixtures.
3. Usar o projeto estático Vercel existente: raiz no repositório, saída `public`, sem build, ou a configuração equivalente já existente com raiz em `public`.
4. Criar primeiro um preview manual e testar a sequência carregar → navegar sem pendências → editar → revisar → confirmar → validar retorno. Testes de escrita devem usar somente dados/ambiente de homologação autorizados.
5. Validar a concorrência em duas sessões e o cenário de permissão negada. Não alterar RLS/Secrets para contornar uma falha; registrar o requisito encontrado para revisão específica.
6. Após aprovação humana, publicar a revisão frontend e garantir que usuários recarreguem abas antigas para adotar a escrita condicionada. Nenhuma dessas ações foi executada nesta tarefa.
7. Rollback por restauração dos arquivos da referência e publicação manual. Isso restaura o transporte anterior e suas limitações de concorrência; não recupera nem altera dados.

Não há deploy de Edge Function ou migração Supabase a executar nesta entrega.
