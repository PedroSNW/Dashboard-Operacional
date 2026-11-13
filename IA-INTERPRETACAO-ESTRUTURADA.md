# Interpretação estruturada e respostas curtas — 13/11/2026

Referência inicial limpa: `a887bbd`. Alterações locais, sem deploy, banco, tabelas, RLS, Secrets ou dados de produção.

## Diagnóstico

O modelo recebia instruções para produzir seções extensas e evitar números, enquanto o validador tentava reconhecer fatos pelo texto. Isso gerava rejeições de comparações corretas, títulos que sobreviviam aos seus parágrafos e repetição de estatísticas. A saída de 1200 tokens também é compartilhada com raciocínio em GPT-OSS; pedir muitas seções em prosa aumenta o risco de término por `length`. Não foram recebidos nesta rodada os dados reais de uso/raciocínio; a proporção exata desses fatores em produção não foi medida.

## Solução

Os três provedores recebem um contrato JSON curto com seis campos: `resumo`, `fatos`, `atencao`, `hipoteses`, `recomendacoes` e `limitacoes`. Cada campo admite no máximo duas entradas.

Resumo, fatos e atenção contêm referências, não valores livres:

```json
{"id":"indice:0","stat":"ultimo_vs_media","competencia":"Out"}
```

O servidor confere ID, competência, chaves e estatística permitida. Depois gera a frase a partir do cálculo, inclusive a relação acima/abaixo/igual. A referência de outubro não pode escolher uma relação falsa nem substituir seu valor por outro. Para estatísticas globais (`media`, `soma`, `minimo`, `maximo`), competência deve ser string vazia. Referências inválidas são descartadas individualmente, preservando as demais. Se a seção principal ficar sem referência válida, entram os resultados determinísticos.

Hipóteses, recomendações e limitações estruturadas usam códigos de um catálogo controlado. Isso reduz liberdade de redação, mas impede que essas entradas inventem causas, novas metas ou políticas. Os textos distinguem investigação de evidência comprovada. Referências matemáticas não dependem de regex de linguagem natural.

Para os IDs conhecidos `openai/gpt-oss-120b` e `openai/gpt-oss-20b`, a Groq recebe `response_format: {type: "json_object"}` e mantém raciocínio baixo. JSON mode não garante o contrato semântico: o validador local continua obrigatório. Não foi enviado um esquema estrito extenso, para preservar orçamento e evitar presumir suporte uniforme dos modelos configuráveis. A viabilidade e os modos estão descritos na [documentação Groq](https://console.groq.com/docs/structured-outputs). Gemini/OpenAI e modelos Groq alternativos recebem a instrução JSON sem parâmetros novos específicos de formato, mantendo compatibilidade e fallback.

JSON inválido/incompleto não é exibido. O servidor usa uma síntese determinística e não repete a chamada. Prosa legada tem fallback conservador: o filtro anterior preserva recomendações aproveitáveis, remove títulos isolados e deixa os fatos numéricos sob responsabilidade da camada determinística. Esse fallback ainda usa padrões e pode rejeitar frases legítimas ou deixar passar paráfrases não cobertas; não é garantia semântica universal.

## Experiência e orçamento

- Perguntas diretas de média, soma ou extremos, sem pedido gerencial/evolutivo, são respondidas depois da autenticação e conferência do snapshot **sem chamada ao modelo**, com `meta.deterministicOnly: true` e consumo de tokens zero nessa resposta.
- A seleção simples prioriza nomes exatos também fora do caso de culpa, evitando complementares que só compartilham palavras. A seleção continua lexical; nomes ambíguos exigem confirmação humana.
- Só aparecem títulos com conteúdo. Frases idênticas entre seções são deduplicadas.
- Consultas simples mostram somente a estatística pedida e limitações materiais, quando houver. Consultas gerenciais mostram resultados, atenção, recomendações e cobertura, sem repetir automaticamente todas as métricas.
- Motivos técnicos de rejeição foram movidos para os detalhes, preservados expansíveis. A resposta principal não mostra nomes de regras internas.
- Em `finish_reason: length`, a Groq entrega o fallback determinístico em vez de texto/JSON cortado ou erro por conteúdo vazio. `meta.finishReason` preserva o diagnóstico. Não há nova chamada automática.
- Saída permanece **1200 tokens**, entrada estimada **3500 com margem de 400**, corpo Groq **6000 bytes UTF-8**. A entrada é medida incluindo as novas instruções; o corpo completo inclui o parâmetro JSON mode e é conferido antes do fetch. Estimativa de tokens continua aproximada, sem tokenizer do modelo.
- HTTP 413, HTTP 429, `retry-after`, autenticação, validação do snapshot e compactação permanecem ativos. Cálculos, metas, direções, null/zero e competências retroativas foram preservados.

## Arquivos alterados

- `supabase/functions/seguranca-viaria-ia/analytics.js`: contrato, referências, catálogo, composição e fallback.
- `supabase/functions/seguranca-viaria-ia/index.ts`: resposta simples sem API, instruções menores, JSON mode nos GPT-OSS conhecidos e fallback por limite de saída.
- `supabase/functions/seguranca-viaria-ia/groq-context.js`: instrução compacta estruturada; conversa genérica sem contexto conserva resposta breve em prosa.
- `public/main.js`: seleção simples e identificação do resultado calculado pelo sistema.
- `public/index.html`: versão do script atualizada.
- `tests/structured.test.mjs` novo; adaptação das suites `presentation`, `analytics`, `ia-context`, `groq-budget` e `edge-handler` ao novo contrato.

## Testes executados

Todos passaram em Deno 2.9.8:

| Caso solicitado | Evidência |
| --- | --- |
| Resposta simples | Apenas média na síntese; handler confirma zero chamadas ao fetch do provedor |
| Análise gerencial | Seções preenchidas, referências resolvidas e cobertura preservada |
| Comparação com média | Referência a outubro gera 9 abaixo da média 13,4; junho continua correto nos detalhes |
| JSON válido | Tipos, seis campos, referências e códigos aceitos |
| JSON inválido | Objeto truncado, array, campos/tipos incorretos e ID inexistente recebem fallback |
| Limite de saída | Handler simula `length` com conteúdo vazio; resposta 200 traz síntese matemática e diagnóstico em meta |
| Recomendações válidas | Catálogo estruturado e recomendação segura em prosa legada preservados |
| Afirmações inconsistentes | Valores livres e propriedades inventadas rejeitados, fatos seguros preservados |
| Sem títulos vazios | Verificação automatizada de seções e deduplicação |
| Groq/Gemini/OpenAI | Handler completo com respostas JSON e APIs simuladas |

Também passaram suites anteriores de intenção/período, matemática, payload, HTTP 413/429, orçamento, logs sanitizados, type check estrito da Edge e `git diff --check`. O handler tem doze cenários. Chrome headless com perfil separado, página sem rede e bibliotecas externas simuladas passou: exibição segura, cobertura, botões e detalhes expandindo/recolhendo. Não foi chamada uma API real nem foram testados gráficos/CDNs reais nesta rodada.

Reprodução com Deno, na raiz:

```powershell
deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
deno run --allow-read tests/structured.test.mjs
deno run --allow-read tests/presentation.test.mjs
deno run --allow-read tests/analytics.test.mjs
deno run --allow-read tests/ia-context.test.js
deno run --allow-read tests/groq-budget.test.mjs
deno run --allow-read --allow-write=.validation-tools --allow-env=SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_PUBLISHABLE_KEYS,GROQ_API_KEY,OPENAI_API_KEY,GEMINI_API_KEY,DASHBOARD_ALLOWED_ORIGINS,GROQ_MODEL,OPENAI_MODEL,GEMINI_MODEL tests/edge-handler.test.ts
```

## Publicação e homologação

Somente após autorização, publicar primeiro a função existente com **os três arquivos na mesma pasta**:

```text
index.ts
analytics.js
groq-context.js
```

Pelo editor Supabase, substituir os três conteúdos locais e usar Deploy. Alternativa CLI já autenticada, na raiz:

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

Depois publicar `public/main.js` e `public/index.html` no projeto Vercel existente, preservando assets, preset estático e saída `public`. No CLI já vinculado: `vercel deploy` para preview e, após homologação/autorização, `vercel deploy --prod`. Não publicar testes, relatórios ou `.validation-tools` como conteúdo público.

Homologar: média de culpa isoladamente (modelo `deterministico`, sem tokens), análise gerencial, referência mensal, intervalo janeiro-setembro e consulta geral. Conferir cobertura, detalhes e `meta.finishReason`; analisar uso real do provedor sem expor tokens/prompts. Compatibilidade do modelo ativo com JSON mode, taxa de respostas estruturadas válidas e consumo efetivo de raciocínio ainda precisam de observação real. Nenhuma etapa de publicação foi executada aqui.
