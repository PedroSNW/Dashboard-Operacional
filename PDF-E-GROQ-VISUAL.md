# PDFs executivos e Groq principal — 13/11/2026

Implementação local, sem deploy. Não houve alteração de backend, banco, RLS, Secrets, indicadores, `dashboard_state` ou `audit_logs`. A skill Sites foi aplicada no fluxo local-only. As validações usaram dados fictícios e mocks; não houve consulta a dados reais.

## O que mudou por arquivo

| Arquivo | Mudança |
| --- | --- |
| `public/report-pdf.js` — novo | Compositor visual independente, com paleta/métricas centralizadas e componentes para cabeçalho, títulos, métricas, texto, tabelas e rodapé |
| `public/reports.js` | Mantém a interface `buildManagementPdf`, delega ao compositor novo e carrega esse arquivo sob demanda junto das bibliotecas PDF existentes |
| `public/main.js` | Groq como padrão inicial e fallback; sincronização visual no carregamento, estado `aria-pressed`, alternativas preservadas e seleção manual respeitada durante a sessão |
| `public/index.html` | Groq em primeiro plano com selo “IA principal”; Gemini/OpenAI em “Outros provedores”, ainda acessíveis; testes secundários agrupados; microcopy e versões de assets atualizadas |
| `public/style.css` | Componentes `.ai-provider`, `.ai-provider-primary`, `.ai-alternatives`, tags e foco acessível, com tokens locais e variantes claro/escuro |
| `tests/pdf.test.mjs` | Paginação compacta, interpretação longa e presença de cabeçalho em todas as páginas |
| `tests/reports-browser.ts` | Carrega o compositor novo no teste isolado |
| `tests/reports-cdp.ts` | Confere padrão Groq, troca entre os três provedores, botão principal, acessibilidade das alternativas e screenshots responsivos |

Não havia preferência de provedor persistida no código anterior; nenhuma chave de armazenamento foi criada ou apagada. Gemini/OpenAI continuam selecionáveis e os testes específicos continuam disponíveis. O botão principal acompanha a escolha manual, começando em Groq. Os endpoints, modelos e credenciais não foram alterados.

## Visual do PDF

- Cabeçalho inicial institucional azul-marinho e dourado com marca tipográfica D'Granel, título, tipo, período, emissão em horário de Brasília e identificação de uso interno.
- Resumo com quatro cards (selecionados, exibidos, atenção e competências), cobertura e principais alertas. Quando há espaço, o gráfico de um indicador em foco aparece nessa primeira página e não é repetido no detalhe.
- Margens laterais de 14 mm, tipografia Helvetica com pesos e tamanhos consistentes e divisórias discretas.
- Removidas quebras fixas por indicador e página exclusiva de metodologia. O fluxo usa o espaço disponível, mantendo reserva antes de blocos e paginação automática para textos/tabelas longos.
- Faixas compactas de estatísticas, metadados e direção em linguagem legível; todos os valores continuam vindo dos cálculos existentes.
- Tabelas com cabeçalho forte, zebra sutil, divisórias leves, primeira coluna à esquerda e números à direita. Cabeçalhos repetem em continuação; linhas não são divididas entre páginas.
- Cabeçalho reduzido e rodapé institucional em todas as páginas, com número/total. Miolo branco para leitura e impressão.
- Gráficos locais de alta resolução preservados, sem serviços remotos ou nova biblioteca. jsPDF e AutoTable existentes continuam sendo utilizados.

Não foi baixado um logo externo ou interpretado HTML de usuário; a identidade é feita com marca tipográfica, paleta e elementos vetoriais seguros.

## Testes e evidência

- PDF de quatro indicadores e sessenta competências, sem gráficos: **15 páginas antes → 10 páginas agora**, mantendo os dados.
- PDF curto de dois indicadores e nove competências: **2 páginas**.
- Demonstração completa com gráficos reais Chart.js: **12 páginas**, com identificação de dados fictícios na capa.
- Interpretação longa: texto preservado em várias páginas e cabeçalho presente em todas.
- PDF renderizado com Ghostscript e inspecionado visualmente em páginas iniciais e de continuação: resumo, gráfico em foco, tabelas e hierarquia conferidos. Não é uma revisão de todos os PDFs possíveis.
- Chrome isolado, com dados fictícios e rede bloqueada na página: passou em **1440 px escuro** e **390 px claro**, sem overflow da página, incluindo relatórios, PDF e falha simulada da IA.
- Groq padrão, seleção de Gemini/OpenAI/Groq, `aria-pressed`, CTA e alternativas acessíveis: passaram em ambos os tamanhos.
- Suites anteriores de matemática, relatórios, interpretação, contexto, orçamento e handler dos três provedores passaram. Type check da Edge passou com dependências em cache; não houve alteração nesse código.
- `git diff --check` passou.

Artefatos locais de demonstração (ignorados no Git):

- `.validation-tools/report-charts.pdf` — PDF completo com gráficos e dados fictícios.
- `.validation-tools/report-test.pdf` — teste de tabelas longas.
- `.validation-tools/ai-desktop.png` e `ai-mobile.png` — Central de IA.
- `.validation-tools/report-desktop.png` e `report-mobile.png` — Relatórios.
- `.validation-tools/final-design-01.png` e `final-design-02.png` — páginas renderizadas do PDF.

Para repetir os testes básicos, na raiz:

```powershell
deno run --allow-read --allow-write=.validation-tools tests/pdf.test.mjs
deno run --allow-read tests/ia-context.test.js
git diff --check
```

Os testes de navegador usam os assets auxiliares e o perfil isolado descritos na entrega anterior. Os executáveis não integram a produção. A validação não utilizou APIs reais, nem verificou impressão em papel ou todos os navegadores. Relatórios com títulos excepcionalmente longos e conjuntos maiores devem ser homologados com os dados atuais.

## Publicação e validação visual

Somente frontend nesta rodada: publicar no projeto Vercel existente os arquivos atuais `index.html`, `main.js`, `style.css`, `reports.js` e **o novo `report-pdf.js`**, preservando a pasta `vendor` e demais assets. O novo arquivo é obrigatório para exportar. Não é necessário republicar Supabase por este patch.

Manter o projeto estático com saída `public`. Usar o fluxo aprovado da organização; pelo CLI já vinculado, `vercel deploy` gera preview e `vercel deploy --prod` publica produção após autorização. Nenhum desses comandos foi executado aqui. Não enviar testes ou `.validation-tools` como conteúdo público.

Após publicação autorizada:

1. Recarregar a página e abrir a Central de IA: Groq deve iniciar ativa com selo “IA principal” e CTA “Enviar para Groq”.
2. Abrir “Outros provedores”, selecionar Gemini/OpenAI e conferir que CTA e estado ativo acompanham a escolha. Retornar a Groq.
3. Gerar prévia e exportar um relatório curto e outro longo, com e sem interpretação.
4. Conferir primeira página, tabela continuada, gráfico, metodologia e última página: ausência de cortes, cabeçalho/rodapé, totais e valores ausentes.
5. Repetir claro/escuro e em celular. O PDF mantém sua própria paleta institucional, independentemente do tema da interface.

## Base preparada para redesign

O compositor PDF foi separado dos cálculos e da lógica de relatório, com uma paleta e medidas concentradas em `ReportPdf.theme`. Isso permite evoluir identidade, espaçamento e tipografia sem alterar dados ou APIs. A interface de IA ganhou classes de componente, estados acessíveis e variáveis CSS locais; textos e alternativas foram organizados sem uma refatoração global. Não houve mudança de framework, serviços ou dependências.
