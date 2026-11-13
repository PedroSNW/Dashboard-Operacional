# Groq: orçamento e diagnóstico — 13/11/2026

Atualização: os logs posteriormente fornecidos confirmaram HTTP 413. A revisão específica, as novas medições do corpo completo e a publicação estão em `GROQ-413.md`. As hipóteses e medidas abaixo registram a etapa anterior, não o diagnóstico atualizado.

Referência anterior: `f3d76b5`. Nenhum deploy, chamada real a provedor, alteração de snapshot, banco, RLS ou Secrets.

## Evidência e causa

Foi comprovado no código que o contexto crescia depois da validação dos 18 KiB de entrada: cada indicador passava a carregar a série original e objetos mensais com os mesmos valores, variações e desvios. Acrescentavam-se estatísticas, textos de limitações repetidos e instruções extensas. O limite de entrada do frontend não limitava esse JSON enriquecido enviado à Groq. A reserva de saída era 4096 tokens.

Isso comprova desperdício e risco de ultrapassar orçamento, mas **não comprova o HTTP status da falha observada em produção**. A mensagem genérica informada vinha do fallback para status não tratados; 429 e 400 tinham mensagens próprias. Sem logs da implantação real, não se pode concluir que era TPM. 413 e outros status não tratados também eram possibilidades. Nenhuma chave ou sessão real foi consultada para reproduzir o incidente.

A documentação Groq consultada lista, para o modelo padrão `openai/gpt-oss-120b`, limites gratuitos publicados de 30 RPM, 1000 RPD, 8000 TPM e 200000 TPD. Isso não substitui os limites efetivos da conta, nem é uma garantia permanente. Consultar [rate limits](https://console.groq.com/docs/rate-limits) e o console da organização. Não foi alterado o modelo configurado.

## Arquitetura preservada e otimização

Os cálculos continuam executados integralmente após a autenticação e conferência do snapshot autorizado no Supabase. O relatório determinístico completo continua no servidor e na resposta. Só a entrada da interpretação Groq é compactada:

- Série original enviada uma vez, competências compartilhadas uma vez, sem objetos mensais redundantes.
- Estatísticas compactas: soma quando aplicável, média e seu tipo, extremos/competências, contagens, comparação com meta, primeiro/último e tendência. Números não são arredondados para reduzir contexto.
- Nome, setor, unidade, meta, direção e ID preservados. Null e zero continuam distintos.
- Indicadores já selecionados pelo frontend são priorizados novamente pela correspondência da pergunta com nome/setor. Ordem estável para perguntas gerais. Isso não é amostra representativa de todos os indicadores.
- Se uma série inteira não couber, tenta-se um resumo determinístico do indicador com `serieOmitida: true`, sem cortar a série original. Se ainda não couber, omite-se o indicador da interpretação. Contagens, flags e aviso visível informam a diferença entre cobertura do modelo e relatório matemático completo recebido.
- Se nem um indicador couber, retorna 413 local com orientação para especificar a pergunta. JSON nunca é cortado em caracteres.
- Instruções da Groq condensadas, mantendo regras de metas, direções, ausência, revisão retroativa, não causalidade, privacidade, hipóteses e gravidade. Gemini/OpenAI continuam com os caminhos anteriores.

Os limites frontend → Edge continuam sendo 25 KiB de corpo, 18 KiB de contexto e 1000 caracteres de pergunta. Nenhum snapshot é modificado pelo orçamento.

## Orçamento

Em `groq-context.js`, constantes ajustáveis em código, sem necessidade de alterar Secrets:

| Item | Configuração |
| --- | --- |
| Entrada estimada total | 3500 tokens |
| Margem reservada dentro da entrada | 400 tokens |
| Entrada admitida pela seleção | até 3100 tokens estimados |
| Saída | `max_completion_tokens: 1200`, incluindo raciocínio quando aplicável |
| GPT-OSS padrão | `reasoning_effort: low`, somente para os IDs GPT-OSS conhecidos |
| Timeout | 35 segundos, incluindo leitura do corpo da resposta |

Estimativa: `ceil(bytes UTF-8 do JSON de todas as mensagens / 2) + 64`. Inclui sistema, pergunta, dados, papéis e overhead estimado; não há histórico no fluxo atual. **Não é um tokenizador e não representa limite exato ou garantia superior para qualquer texto.** Foi escolhida como aproximação conservadora para o JSON operacional; a API continua sendo a fonte de tokens efetivos. A margem de entrada soma-se à reserva de saída/raciocínio. O orçamento não garante TPM para várias requisições simultâneas ou feitas por usuários diferentes.

`max_tokens` foi substituído por `max_completion_tokens`, de acordo com a [referência da API Groq](https://console.groq.com/docs/api-reference). Tokens de raciocínio consomem a reserva, não são um orçamento adicional gratuito. Respostas com `finish_reason: length` são sinalizadas como incompletas; ausência de conteúdo após esse motivo tem erro específico.

## Medidas antes/depois

Fixtures sintéticas, não consumo observado na conta. As duas medidas usam a mesma estimativa bytes/2 e incluem instruções. O cenário de 75 indicadores é um teste de estresse do enriquecimento; não afirma que o frontend enviaria exatamente essa fixture inteira pelo limite de 18 KiB.

| Fixture | Bytes antes → depois | Tokens estimados antes → depois | Cobertura Groq |
| --- | --- | --- | --- |
| Dois indicadores, nove competências | 9028 → 2940 | 4578 → 1534 | Ambos, séries completas |
| 75 indicadores, doze competências | 297142 → 5397 | 148635 → 2763 | Cinco enviados, setenta omitidos e informados |
| Dois indicadores, 120 competências | 65685 → 5023 | 32907 → 2576 | Ambos, séries completas |

A seção matemática continua disponível para todos os indicadores que passaram pelo contexto validado original. A interpretação não pode concluir sobre dados omitidos.

## Tratamento de falhas

- 429: classifica tokens, requisições, cota ou limite não especificado conforme mensagem recebida. Só usa essa mensagem para classificar; nunca a devolve ou registra integralmente.
- `retry-after`: aceita segundos ou data HTTP; retorna tempo sanitizado no corpo e cabeçalho. Sem indicação, usa espera conservadora de sessenta segundos. Nenhum retry automático. Bloqueio temporário por instância reduz cliques repetidos; não é rate limit distribuído.
- 400: distingue contexto excessivo de requisição/parâmetros inválidos e identifica o HTTP upstream na mensagem sanitizada. O frontend recebe 502 para rejeição upstream 400, distinguindo-a de seu próprio contrato inválido.
- 413: tratado explicitamente como excesso de tamanho, retornando 413.
- Timeout: 504 separado de limites de uso. JSON inválido/conteúdo ausente: 502 específico.
- Logs: provedor, status, categoria, código em allowlist, request ID validado, espera e métricas de tamanho/estimativa. Nenhum prompt, valor interno, token de autenticação, API key ou mensagem bruta.
- Respostas bem-sucedidas: `meta.inputEstimatedTokens`, `inputBytes`, `omittedIndicators`, `summarizedSeries` e uso real devolvido pelo provedor.

## Arquivos modificados

- `supabase/functions/seguranca-viaria-ia/index.ts`
- `supabase/functions/seguranca-viaria-ia/groq-context.js` (novo)
- `tests/groq-budget.test.mjs` (novo)
- `tests/edge-handler.test.ts`
- `tests/ia-context.test.js` (adaptação do mock ao novo objeto de mensagens)
- Este relatório.

`analytics.js` e o frontend não precisaram ser alterados. O novo módulo compacto não substitui a camada matemática.

## Testes executados

Com Deno local 2.9.8:

1. Dois indicadores: orçamento, integridade, null e prioridade — passou.
2. Todos os indicadores: seleção sob orçamento e parcialidade explícita — passou.
3. Muitas competências: preservação das séries; testes adicionais exercitaram resumo e rejeição segura quando impossível — passaram.
4. Payload: estimativa de todas as mensagens dentro da entrada admitida; JSON válido — passou.
5. 429 tokens/requisições/cota, `retry-after`, cabeçalho e bloqueio sem nova chamada — passaram com mocks.
6. 400 por contexto e por parâmetro; 413 — passaram com mocks.
7. Timeout — passou injetando `AbortError` no transporte simulado; não é uma medição de espera real por trinta e cinco segundos.
8. Suite analítica e composição do relatório matemático — passaram, sem mudança dos resultados.
9. Handler completo dos três provedores — passou com fetch e Supabase simulados; dez cenários no total.
10. Sentinela secreta inserida na mensagem upstream, verificação de JWT e valores ausentes nos logs — passou.
11. Nove cenários da suite anterior — passaram.
12. Type check estrito da Edge com dependências reais em cache e `git diff --check` — passaram.

Comandos na raiz:

```powershell
deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
deno run --allow-read tests/groq-budget.test.mjs
deno run --allow-read tests/analytics.test.mjs
deno run --allow-read tests/ia-context.test.js
deno run --allow-read --allow-write=.validation-tools --allow-env=SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_PUBLISHABLE_KEYS,GROQ_API_KEY,OPENAI_API_KEY,GEMINI_API_KEY,DASHBOARD_ALLOWED_ORIGINS,GROQ_MODEL,OPENAI_MODEL,GEMINI_MODEL tests/edge-handler.test.ts
```

Não houve chamada real à Groq nem teste visual novo nesta rodada. RLS efetiva, credenciais, cotas e modelo ativo ainda exigem ambiente autorizado. A estimativa não valida o tokenizer real. Os limites da proteção qualitativa e do runtime publicados continuam os já documentados.

## Publicação e identificação do erro real

Somente após autorização: no editor da função existente, atualizar **três arquivos na mesma pasta**: `index.ts`, `analytics.js` e `groq-context.js`. Manter imports relativos e publicar o conjunto. Não colar somente `index.ts`.

Alternativa, CLI já autenticada no projeto correto, na raiz:

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

Preservar autenticação, Secrets e RLS existentes. Nenhum frontend mudou; não é necessário novo deploy Vercel por este patch. [Publicação Supabase](https://supabase.com/docs/guides/functions/deploy).

Se o erro persistir, consultar os logs da função procurando `Groq API error` e anotar apenas status, categoria, código, request ID, estimativa de tokens/bytes e `retryAfter`. No navegador, conferir o erro sanitizado e, em sucesso, comparar `meta.promptTokens` real com `inputEstimatedTokens`. Conferir os limites efetivos no console Groq usando o request ID. Não copiar JWT, cabeçalhos de autorização ou o payload do Dashboard para relatórios públicos. Em 429, aguardar o prazo indicado; em 400, usar a categoria para distinguir contexto de parâmetros; em 413, reduzir escopo; em 504, investigar latência separadamente de cota. Não aumentar o orçamento às cegas.
