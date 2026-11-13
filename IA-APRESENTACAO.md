# Central de IA: intenção, período e apresentação — 13/11/2026

Implementação local, sem deploy, alteração de banco, RLS, Secrets ou dados reais. As mudanças locais anteriores de compactação/HTTP 413 foram preservadas.

## Mudanças

`public/main.js`: perguntas específicas sobre acidentes com culpa priorizam esse indicador, preservando o total quando solicitado junto, nomes completos e outros temas explicitamente reconhecidos. A seleção deixa de arrastar um setor inteiro apenas por compartilhar o tema. Respostas com `technicalDetails` mostram a síntese primeiro e um elemento nativo `details/summary` para expandir/recolher o relatório técnico. Ambos usam `textContent`, sem interpretar HTML do modelo. O frontend continua aceitando respostas anteriores sem esse campo.

`public/index.html`: URL de `main.js` atualizada para evitar cache da interface anterior.

`analytics.js`: `scopeAnalysis` recorta a intenção e o intervalo antes do cálculo. Atua somente sobre a cópia de contexto que já passou pela conferência do snapshot autorizado; os dados originais permanecem intactos. Um intervalo reconhecido como “janeiro a setembro” seleciona essas posições antes de calcular média, soma e comparações. Outubro não chega à análise do modelo nem aos detalhes dessa resposta. Competências sem ano não recebem ano inventado. Intervalos sem correspondência, misturando anos ou cruzando o fim do ano de forma ambígua retornam pedido de esclarecimento, sem produzir uma análise aproximada.

`analysisPresentation` gera fatos e comparações verificadas diretamente dos cálculos. A síntese mostra indicadores solicitados, estatísticas principais, último valor em relação à média, pontos de atenção e sugestões. Consultas gerais acrescentam panorama do conjunto: indicadores com dados, sem metas/direções e fora da meta no último valor válido conforme direção cadastrada. Não agrega valores de unidades diferentes. Em conjuntos extensos, a síntese limita constatações e avisa; todos os cálculos recebidos ficam nos detalhes.

`index.ts`: usa o novo escopo antes do enriquecimento e retorna `response` resumido e `technicalDetails` completo em Groq, Gemini e OpenAI. A interpretação parcial da Groq continua identificada separadamente da cobertura matemática. Não há chamadas adicionais ou retries para reformular texto.

## Filtro e precisão

O novo filtro funciona por trecho, sem descartar automaticamente toda a interpretação. Identifica `numero_factual_nao_validado`, `comparacao_nao_estruturada` e `afirmacao_sem_evidencia`. Remove numeração de tópicos; reconhece rótulos de competências disponíveis; aceita números em frases canônicas idênticas aos fatos determinísticos. Números livres em outros formatos continuam sendo recusados conservadoramente, mesmo quando possam coincidir com um valor válido. Isso evita aprovar a atribuição errada de um número correto a outro mês.

Comparações livres como “outubro acima da média” são removidas e substituídas pelos fatos do sistema. Trechos seguros são mantidos. Se nenhum trecho for aproveitável, há síntese determinística útil e recomendação de investigação. Recomendações não ganham status de causa, meta ou política oficial. Sem vínculo cadastrado entre quilometragem e acidentes/período, não há cálculo automático de nova taxa e a limitação é específica.

O filtro é conservador e baseado em padrões, não uma prova de consistência semântica de qualquer frase. Pode rejeitar conteúdo legítimo ou deixar passar paráfrases qualitativas não cobertas. Não valida números escritos por extenso em todo contexto possível. Decisões operacionais continuam exigindo revisão humana. Os fatos numéricos e comparações principais exibidos pelo sistema não dependem desse filtro nem da aritmética do modelo.

## Testes

Executados com Deno 2.9.8, fontes reais e mocks de Supabase/provedores:

| Requisito | Resultado |
| --- | --- |
| Um indicador: média de acidentes com culpa | Passou no seletor frontend e no escopo backend |
| Total de acidentes e acidentes com culpa | Passou, ambos preservados |
| Janeiro a setembro, existindo outubro | Passou; soma 125 na fixture de culpa e outubro excluído. Handler completo também valida o snapshot com outubro e envia somente nove competências ao provedor |
| Outubro e junho abaixo da média | Passou: média 13,4, outubro 9 e junho 13; afirmações contrárias removidas |
| Temas em setores diferentes | Passou, culpa com multas/score preservados nos cenários respectivos |
| Todos os indicadores | Passou, escopo completo do conjunto recebido e síntese com cobertura |
| Números incorretos na resposta | Passou, trecho rejeitado e síntese determinística preservada |
| Números válidos e competências | Passou para fatos canônicos exatos e rótulos disponíveis; prosa numérica arbitrária permanece conservadoramente bloqueada |
| Contexto parcial | Passou, aviso mantido |
| Limite Groq e HTTP 413 | Passou na suite de orçamento e no handler, com resposta 413 específica |
| Síntese e detalhes expansíveis | Passou no Chrome headless, perfil isolado, CSP sem rede e bibliotecas externas simuladas: detalhes iniciam recolhidos, abrem e fecham, sem erro JS |
| Três provedores | Passou no handler completo com mocks, usando a mesma camada matemática/apresentação |

Também passaram a suite analítica, os nove cenários anteriores de integração, onze cenários do handler completo, type check estrito da Edge e `git diff --check`. As fixtures de acidentes existem apenas nos testes. Não houve chamada real a modelos, inspeção visual completa com CDNs reais, persistência ou homologação autenticada nesta rodada.

Testes novos/atualizados: `tests/presentation.test.mjs`, `tests/analytics.test.mjs`, `tests/ia-context.test.js`, `tests/edge-handler.test.ts` e `tests/browser-smoke.ts`. A suite `tests/groq-budget.test.mjs` continua preservada.

Reprodução na raiz:

```powershell
deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
deno run --allow-read tests/presentation.test.mjs
deno run --allow-read tests/analytics.test.mjs
deno run --allow-read tests/ia-context.test.js
deno run --allow-read tests/groq-budget.test.mjs
deno run --allow-read --allow-write=.validation-tools --allow-env=SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_PUBLISHABLE_KEYS,GROQ_API_KEY,OPENAI_API_KEY,GEMINI_API_KEY,DASHBOARD_ALLOWED_ORIGINS,GROQ_MODEL,OPENAI_MODEL,GEMINI_MODEL tests/edge-handler.test.ts
```

## Limitações e homologação

A seleção é lexical e por temas conhecidos, não um modelo semântico. Pedidos com nomes abreviados/ambíguos ou intervalos em formatos não reconhecidos devem ser reformulados; confirmar as competências mostradas na síntese. O recorte de período está no servidor: o frontend envia as séries completas selecionadas para permitir a conferência contra o snapshot, depois o backend recorta antes de calcular.

Consulta geral cobre somente indicadores recebidos e autorizados; não recupera automaticamente os omitidos pelo limite de entrada. Nenhum vínculo de denominadores foi inventado. O orçamento Groq permanece 6000 bytes de corpo, 3500 tokens estimados com margem de 400 e saída 1200. Estatísticas completas continuam fora da entrada compacta do modelo, no relatório técnico. Rate limit e validação real das credenciais/conta permanecem dependentes do ambiente publicado.

## Publicação após autorização

Primeiro, no editor da função Supabase existente `seguranca-viaria-ia`, publicar o conteúdo local atual dos três arquivos na mesma pasta:

```text
index.ts
analytics.js
groq-context.js
```

Ou pela CLI autenticada, na raiz:

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

Depois publicar `public/index.html` e `public/main.js` no projeto Vercel existente, preservando CSS/assets e configuração estática `Other`/saída `public`. Pelo fluxo de publicação já vinculado: `vercel deploy` para preview, validar e, após autorização, `vercel deploy --prod`. Não publicar `.validation-tools` ou testes como conteúdo público.

O backend primeiro é compatível com o frontend anterior, que mostrará a síntese; os detalhes expansíveis aparecem ao atualizar o frontend. Após ambos, homologar com dados atuais: culpa isoladamente, total com culpa, janeiro-setembro, comparação de junho/outubro e consulta geral. Conferir cobertura e período, expandir os detalhes e comparar com os indicadores reais. Nenhuma etapa de publicação foi executada aqui.
