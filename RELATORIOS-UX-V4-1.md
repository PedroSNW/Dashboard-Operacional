# Central de Relatórios V4.1 — UX

Implementação local, sem deploy. Nenhuma alteração em Supabase, Edge Functions, RLS, Secrets, cálculos, recomendações V4 ou compositor PDF.

## Mudanças

- Configuração e seleção de indicadores permanecem no início.
- Uma única barra reúne **Aplicar análise Groq**, **Exportar PDF**, status e processamento antes da prévia. Gemini/OpenAI continuam em **Outros provedores**; o texto do botão acompanha o provedor selecionado.
- A barra acompanha a rolagem com distância da topbar. Em janelas com até 600 px de altura, fica no fluxo normal para não consumir a área útil da tela.
- Gerar prévia exibe um resumo limitado a contagens, período, setor e até três pontos de atenção, com indicação de quantos outros existem.
- **Ver prévia completa / Recolher prévia** usa `aria-expanded`, `aria-controls`, região rotulada e botão nativo com foco visível.
- Gráficos, tabelas e textos detalhados são montados somente ao expandir. Recolher destrói as instâncias de gráficos e remove esses nós; os dados completos continuam em `managementReport`.
- Uma nova geração começa recolhida. A aplicação da análise mantém a preferência de expansão atual e atualiza a mesma prévia.
- A camada V3 deixou de mover análise/exportação para depois dos detalhes. IDs, funções e controles existentes foram preservados.

## Exportação e proteção

O PDF prepara as imagens diretamente de `managementReport.indicators`, usando a mesma rotina anterior de renderização em canvas de 1400 × 500, `devicePixelRatio: 2` e fundo branco. Não depende de canvas visível nem de expandir a prévia. O compositor, a projeção de conteúdo `ReportContent`, as recomendações e os gráficos/tabelas do documento não foram alterados.

`managementSignature`, autenticação, leitura validada, pendências e checagens de snapshot continuam protegendo o envio/exportação. A seleção e o provedor são capturados antes da espera pela sessão. A leitura também é revalidada antes de instalar uma prévia recebida.

Durante operações, ficam indisponíveis as ações concorrentes de geração, análise, exportação, atualização de filtros e mudança de provedor. É possível consultar/expandir a prévia existente e ajustar filtros; se os filtros mudarem, a assinatura bloqueia o uso da prévia antiga. Ações são recalculadas ao finalizar, inclusive em caso de erro.

Não há consulta automática à Groq ao gerar, expandir, recolher ou exportar. Cache, fallback, conteúdo V4, progresso real e proteção contra download duplicado foram mantidos.

## Arquivos

Produção:

- `public/index.html`: áreas de configuração, ações e prévia; cache atualizado.
- `public/workspace-v3.js`: remoção do reposicionamento legado após a prévia.
- `public/reports.js`: resumo, detalhes sob demanda, estados dos controles e gráficos de exportação independentes da tela.
- `public/style.css`: barra compacta/sticky, menu secundário e responsividade.

Testes novos: `tests/reports-v41-fixtures.mjs`, `tests/reports-v41-browser.js`.

Testes adaptados: `tests/reports-browser.ts`, `tests/reports-cdp.ts`. O fixture antigo agora verifica o estado recolhido antes de expandir explicitamente para suas regressões de gráficos.

## Validação

- Chrome com serviços simulados em **320, 360, 390, 768, 1024, 1440 e 1920 px**, com temas claro/escuro intercalados.
- Em cada largura, relatórios de **1, 15 e 40 indicadores**: resumo recolhido, expansão/recolhimento, limpeza de gráficos e dados completos em memória.
- PDF real gerado em memória com prévia recolhida: quantidade completa de imagens e séries, conteúdo numérico completo, callbacks reais, fim em 100% e um único acionamento de download diante de chamadas concorrentes.
- Análise válida e falha simulada: prévia preservada, mesma projeção de conteúdo V4, sem consulta redundante ou chamada na exportação.
- Filtros alterados desabilitam análise/exportação; uma chamada programática com assinatura divergente não baixa o arquivo.
- Enter expande/recolhe; posição da barra foi verificada abaixo da topbar, sem overflow global.
- Estado persistível, recomendações e cálculos comparados antes/depois, sem diferenças.
- Passaram testes de relatórios V4, PDF, analytics, contexto IA, estado de pendências e sintaxe/IDs.
- A regressão V3 exercita navegação, gráficos, falhas de biblioteca/imagem/renderização e recuperação de controles em fixture independente.

Capturas locais: `.validation-tools/reports-v41-{320,360,mobile,768,1024,desktop,1920}.png`, com dados fictícios. `mobile` = 390 px; `desktop` = 1440 px.

Para repetir a matriz nova neste ambiente:

```powershell
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/reports-v41-fixtures.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/reports-browser.ts
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools --allow-net=127.0.0.1:9337 --allow-run='C:\Program Files\Google\Chrome\Application\chrome.exe' tests/reports-cdp.ts --reports-v41
```

## Limitações

Expandir dezenas de gráficos ainda pode custar processamento; agora esse custo ocorre somente por solicitação. Reabrir detalhes recria os gráficos para evitar manter dezenas de instâncias ocultas. Exportar continua preparando todas as imagens em resolução de PDF, com o custo de memória/tempo correspondente.

Os testes não utilizaram APIs nem gravações reais. O acionamento do download foi observado por mock do downloader; não se afirma que o navegador gravou o arquivo no computador. Não houve validação em aparelhos físicos, Safari ou leitores de tela.

## Publicação manual

Publicar os quatro arquivos de produção juntos no frontend Vercel existente, preservando todos os demais assets. As URLs de cache do HTML foram atualizadas. Não publicar `.validation-tools/` ou fixtures.

Não é necessário publicar Edge Function, alterar banco, RLS ou Secrets. Nenhum deploy foi executado.
