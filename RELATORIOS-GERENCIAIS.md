# Central de Relatórios Gerenciais — 13/11/2026

Implementação local concluída, sem deploy, persistência de relatórios, migrações, alteração de banco/RLS/Secrets ou dados reais. Aplicada a skill Sites no modo local-only, usando o checkout existente e sem registrar/publicar outro site.

## Funcionalidades

Nova aba **Relatórios Gerenciais**, com setor/todos, seleção múltipla de indicadores, competências inicial/final, tipo de relatório, atualização dos filtros, geração/atualização da prévia, interpretação opcional e exportação PDF. Mantém visual e temas do Dashboard, com filtros em coluna no mobile e grade em telas maiores.

Tipos: executivo, mensal (uma competência), trimestral (três competências consecutivas), anual (doze competências consecutivas), comparativo e crítico. Anual representa o período de doze competências selecionado; não presume fechamento de exercício. Mensal/trimestral/anual rejeitam quantidades incompatíveis em vez de trocar silenciosamente o período. Intervalos precisam estar ordenados, ser consecutivos e ter rótulos não ambíguos.

O relatório crítico mostra os indicadores cujo último valor válido está fora da meta conforme direção cadastrada, ou que têm piora descritiva entre primeiro/último valor válido. O método é explícito e não atribui causalidade ou gravidade pelo nome. Direção neutra/indefinida não é classificada como positiva/negativa. O executivo exibe o conjunto escolhido com contagem de atenção; não soma unidades diferentes.

## Dados e arquitetura

A interface exige login, leitura inicial bem-sucedida e ausência de edições pendentes. Ao gerar, a Edge Function existente recebe apenas a seleção e relê `dashboard_state` com o JWT do usuário, sob RLS. O novo módulo `reports.js` usa `analyzeIndicator` da camada existente. O filtro de competências ocorre antes dos cálculos, preservando null, zero, meta zero, metas ausentes e direção. Valores maiores que a lista de competências são rejeitados para evitar deslocamento silencioso.

IDs, setor e nomes escolhidos são conferidos com o snapshot remoto. Isso evita trocar um indicador silenciosamente quando um registro legado identificado por posição foi reordenado. Mudanças de filtros invalidam exportação/interpretação até gerar novamente. O relatório informa data de geração e timestamp do snapshot; não promete sincronização contínua após gerado. Logout limpa a prévia da memória e bloqueia os botões.

Sem IA, nenhuma chamada a provedor é feita. Quando solicitada, a interpretação usa as mesmas proteções de contexto, estatísticas, JSON validado, limites Groq e HTTP 413/429 existentes. Ela recebe exatamente o período e os indicadores exibidos, incluindo o filtro crítico. Se o snapshot mudou desde a prévia, é exigida atualização. Se a IA falhar, os números, gráficos e exportação permanecem disponíveis. O usuário vê o motivo e pode exportar sem interpretação. Nenhuma chamada paga nova ou serviço de relatórios foi criado.

O caminho de relatórios constrói contexto no servidor a partir de dados autorizados; não submete esse contexto interno ao limite de 18 KiB de dados fornecidos pelo navegador. O corpo externo continua limitado a 25 KiB; a requisição efetiva da Groq continua limitada a 6000 bytes. Gemini/OpenAI preservam suas proteções anteriores e podem rejeitar contextos extensos; isso não impede exportação determinística.

## PDF

Geração no navegador com [jsPDF 4.2.1](https://github.com/parallax/jsPDF/releases/tag/v4.2.1) e [AutoTable 5.0.8](https://github.com/simonbengtsson/jsPDF-AutoTable/releases/tag/v5.0.8), MIT, versões fixadas com licenças em `public/vendor`. Aproximadamente 442 KiB de JavaScript minificado, carregados sob demanda na exportação. A versão jsPDF foi escolhida considerando as correções de segurança publicadas. Não usa conversão HTML, serviços remotos, fontes remotas nem uploads de indicadores.

PDF A4 com capa D'Granel, tipo, período, geração, uso de IA, resumo executivo, indicadores e metas, gráficos, tabela mensal, observações e metodologia/limitações. AutoTable repete o cabeçalho, divide tabelas e evita quebrar uma linha entre páginas. Rodapés indicam página/total. As lacunas dos gráficos não viram zero. Gráficos exportados têm canvas próprio de 1400×500, escala de renderização dupla e fundo branco; não dependem do tamanho/tema da tela.

## Arquivos

Produção criados:

- `public/reports.js`
- `public/vendor/jspdf-4.2.1.umd.min.js`
- `public/vendor/jspdf-autotable-5.0.8.min.js`
- `public/vendor/jspdf.LICENSE`, `autotable.LICENSE`, `README.txt`
- `supabase/functions/seguranca-viaria-ia/reports.js`

Produção alterados: `public/index.html`, `public/main.js`, `public/style.css`, `supabase/functions/seguranca-viaria-ia/index.ts`.

Testes criados: `tests/reports.test.mjs`, `tests/pdf.test.mjs`, `tests/reports-browser.ts`, `tests/reports-cdp.ts`. Suites `analytics`, `ia-context` e `edge-handler` adaptadas para executar o caminho novo e preservar regressão.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| Mensal, trimestral, anual, comparativo, executivo e crítico | Passou, com fixtures |
| Setores e indicadores; IDs inexistentes e identidade alterada | Passou, seleção incompatível rejeitada |
| Período antes dos cálculos e alinhamento | Passou, intervalos inválidos rejeitados |
| Null, zero, meta zero e direção neutra | Passou |
| Relatório sem IA | Passou no core, handler e navegador; sem chamada a provedor |
| Interpretação do relatório | Passou no handler com mock, incluindo período mensal correto e rejeição de snapshot alterado |
| Falha simulada Groq | Passou no navegador, mantendo prévia/PDF determinísticos |
| PDF multipágina | Passou, arquivo A4 real de 15 páginas; AutoTable dividiu tabelas |
| PDF com gráficos | Passou com Chart.js real e jsPDF real no Chrome; PNGs locais incorporados |
| Revisão visual do PDF | Capa, tabela inicial, tabela continuada e página com gráfico rasterizadas com Ghostscript e inspecionadas; cabeçalhos, rodapés e linhas legíveis nas páginas revisadas |
| Temas/responsividade | Passou no Chrome com viewport real 1440 px escuro e 390 px claro, sem overflow horizontal da página |
| Regressão | Suites de matemática, apresentação estruturada, orçamento Groq, nove cenários anteriores e treze cenários do handler passaram |
| Type check | Edge passou com Deno 2.9.8/TypeScript 6.0.3 e dependências reais em cache |
| Whitespace | `git diff --check` passou |

Os testes usam snapshots fictícios e mocks de Auth/Supabase/provedores. O navegador usa Chart.js e bibliotecas PDF reais, com rede bloqueada na página de teste. As primeiras verificações visuais encontraram problemas do fixture (estado autenticado ausente e linha diagnóstica sem quebra causando falsa largura); corrigidos antes dos testes finais. Também foi ajustada a proporção do gráfico exportado após inspecionar o primeiro PDF.

Artefatos locais ignorados no Git:

- `.validation-tools/report-charts.pdf`: demonstração com gráficos e identificação de dados fictícios na capa.
- `.validation-tools/report-test.pdf`: teste de paginação de tabelas.
- `.validation-tools/report-desktop.png`, `report-mobile.png`: screenshots finais.

Reprodução, na raiz com Deno:

```powershell
deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
deno run --allow-read tests/reports.test.mjs
deno run --allow-read --allow-write=.validation-tools tests/pdf.test.mjs
deno run --allow-read --allow-write=.validation-tools --allow-env=SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_PUBLISHABLE_KEYS,GROQ_API_KEY,OPENAI_API_KEY,GEMINI_API_KEY,DASHBOARD_ALLOWED_ORIGINS,GROQ_MODEL,OPENAI_MODEL,GEMINI_MODEL tests/edge-handler.test.ts
```

Os testes visuais exigem os assets auxiliares de teste em `.validation-tools`, Chrome e o perfil isolado. Os executáveis/fixtures não são dependências de produção. Executar também as suites anteriores documentadas nos relatórios de IA para regressão completa.

## Limitações

- Homologação autenticada contra RLS e dados reais não foi executada. Nenhuma chamada real a Groq/Gemini/OpenAI foi feita nesta rodada.
- Cada geração exige Supabase disponível; a funcionalidade não promete geração offline. A IA é dispensável.
- O snapshot é pontual, identificado por data; alterações posteriores exigem nova geração. Não há persistência, agendamento ou histórico de PDFs.
- Indicadores legados sem rótulos suficientes ou com competências ambíguas precisam ser revisados pelo usuário; o relatório não inventa meses/anos.
- Muitos gráficos/períodos longos podem consumir memória e produzir PDFs grandes. Foram testados quatro indicadores e sessenta competências em PDF, além dos casos unitários; não há benchmark para todos os conjuntos reais.
- Revisão visual feita nas páginas representativas descritas, não de todos os documentos possíveis. Confirmar a impressão no equipamento da empresa e outros navegadores. Fonte PDF padrão cobre português corrente, não todo o Unicode.
- A prévia respeita claro/escuro; o PDF usa capa escura e miolo branco para legibilidade/impressão, independentemente do tema.

## Publicação após autorização

Primeiro atualizar a função existente no Supabase com **quatro arquivos na mesma pasta**:

```text
index.ts
analytics.js
groq-context.js
reports.js
```

No editor web, substituir/criar os arquivos e publicar o conjunto. Alternativa CLI autenticada no projeto correto, na raiz:

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

Não executar migrações ou alterações de Secrets/RLS. Em seguida, publicar a pasta `public` completa na Vercel existente, incluindo **`reports.js` e `vendor` com as duas bibliotecas e licenças**, além de HTML/JS/CSS e assets anteriores. Manter preset estático `Other` e saída `public`. Fluxo CLI já vinculado: `vercel deploy` para preview e, após homologação/autorização, `vercel deploy --prod`. Não publicar `.validation-tools`, testes ou relatórios como conteúdo público.

Homologar leitura de conta corporativa, seis tipos, filtros, dados ausentes, meta zero, direção neutra, falha da IA e exportação; comparar números com a tabela real. Verificar que nenhuma operação de escrita ocorre. Nenhuma dessas publicações foi feita durante esta implementação.
