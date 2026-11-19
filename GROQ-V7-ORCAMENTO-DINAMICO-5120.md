# Groq V7 — alvo 5.120, orçamento dinâmico e homologação

Implementação local em 19/11/2026. `deploymentRevision`: **`v7-groq-dynamic-5120-4`**. Nenhuma publicação, geração real, alteração de Secret ou escrita em banco foi executada.

## 1. Causa do teto persistente

Evidência fornecida pelo operador: `e660e33d-250e-437e-a252-09ec652ace19`, HTTP400 `json_validate_failed`, modelo120b, entrada1.583, saída2.048, `completionDiagnostics.limit:2048`, revisão `v7-groq-output-4096-3`.

A revisão anterior apenas permitia configurar até4.096. Seu **padrão continuava2.048**. `authorConfig()` também retornava2.048 silenciosamente para variável ausente/inválida/fora da faixa. Assim, a revisão nova no diagnóstico nunca foi prova de que4.096 estavam ativos. Publicar código não configura uma variável remota; configurar `.env` local não altera o ambiente publicado.

Confirmado no código anterior: a V7 usava `authorConfig(Deno.env.get,'groq')`, serializava `config.completion` em `max_completion_tokens` e registrava o mesmo valor em `completionDiagnostics.limit`. Não havia outro adaptador/intermediário reduzindo esse valor no caminho autoral. `body.author===true` retorna nesse caminho antes do adaptador legado do handler. Não existe truncamento local global de texto em2.048; permanecem a rejeição integral de respostas >128KiB e os limites de estrutura já existentes.

A evidência real confirma que aquela execução usou a configuração2048 do código anterior. **Não foi possível consultar os valores dos Secrets nem o bundle/versão da plataforma Supabase**: não há conector Supabase disponível nem CLI Supabase instalada nesta sessão. Não foram procuradas/impressas credenciais locais. Continua pendente distinguir remotamente variável ausente, explicitamente2048, inválida, nome incorreto ou alteração feita em outro projeto. Não atribuir ao provedor um teto próprio de2048 com essa evidência.

O novo código removeu esse retorno silencioso da Groq V7: variável ausente significa alvo5120 explícito; valor inválido, vazio ou legado2048 gera503 `local_configuration`/`invalid_authoring_configuration`, sem chamada. Mesmo5120 não garante que o JSON terminará: o nexo causal completo do `json_validate_failed` e a qualidade real ainda exigem homologação.

## 2. Configuração implementada

Configurações da Groq autoral V7, lidas no servidor:

| Nome | Sem variável | Faixa válida | Comportamento |
| --- | ---: | --- | --- |
| `REPORT_V7_COMPLETION_TOKENS` | 5120 | Inteiro4096–7168 | Alvo antes do orçamento; nunca volta silenciosamente para2048 |
| `REPORT_V7_TOKEN_MARGIN` | 800 | Inteiro400–1600 | Margem conservadora por chamada |
| `REPORT_V7_GROQ_INPUT_TPM` | Desconhecido/null | Inteiro1–8000 | Limite separado de entrada, somente se confirmado na conta |
| `REPORT_V7_GROQ_OUTPUT_TPM` | Desconhecido/null | Inteiro1–8000 | Limite separado de saída, somente se confirmado na conta |
| `REPORT_V7_MAX_BYTES` | 6000 | Inteiro3500–6000 | Teto de requisição UTF-8 existente |
| `REPORT_V7_INPUT_TOKENS` | 3500 | Inteiro2000–4000 | Teto de entrada estimada existente |

Valores presentes inválidos nas configurações acima bloqueiam a Groq V7 com mensagem que identifica o nome e a faixa, sem ecoar seu conteúdo. O teto7168 é proteção de engenharia local, não cota oficial ou promessa de saída. O piso4096 é uma reserva mínima conservadora para o contrato completo, não garantia matemática de completude. Não se tenta gerar com reserva abaixo desse piso.

Modelo principal permanece `openai/gpt-oss-120b`; `strict:true`, schema WireV2, prompts, seleção/cobertura de evidências, `medium`, `include_reasoning:false`, temperatura0,3 e timeout35s permanecem. Não houve encurtamento adicional do conteúdo ou das recomendações. OpenAI/Gemini e o perfil legado V5.1 conservam sua política anterior; o2048 de `GROQ_REPORT_PROFILE` pertence ao fluxo V5.1, não sobrescreve o retorno antecipado V7.

Os valores numéricos acima são configurações da aplicação. Não aumentam TPM/RPM/TPD/RPD da conta. Limites existentes do guard continuam8000TPM,20RPM,100000TPD e500RPD, ou valores remotos menores conhecidos. Não foram alteradas cotas.

## 3. Cálculo dinâmico

1. Construir o contexto e schema completo exatamente como antes, com o alvo configurado.
2. Estimar entrada por `ceil(bytes UTF-8/2)+64`, incluindo schema e todas as mensagens. Continua sendo aproximação conservadora, **não tokenizador**. As contagens reais de1583 fornecidas pelo operador não substituem a estimativa de outro payload.
3. Consultar estado do guard, sem reservar: considerar consumo/reservas da janela móvel de60s, consumo/reservas diárias e o saldo/teto remoto conhecido pelos headers. Disponibilidade combinada é o menor desses saldos, nunca maior que8000.
4. Calcular:

   ```text
   conclusão = min(alvo configurado,
                   saldo combinado - entrada estimada - margem,
                   saldo separado de saída - margem, quando conhecido)
   reserva = entrada estimada + conclusão + margem
   ```

   A entrada estimada+margem também deve caber no saldo separado de entrada, quando conhecido.
5. Bloquear se houver cooldown, operação concorrente, limite de requisições ou conclusão calculada<4096. Não reduzir para2048. O diagnóstico distingue o valor calculado de uma chamada efetivamente enviada: em bloqueio, `limit` e `effectiveCompletionLimit` ficamnull; `calculatedCompletionLimit` mostra a tentativa de planejamento.
6. Reescrever apenas `max_completion_tokens` no JSON serializado, sem alterar prompts ou evidências. Planejamento e reserva definitiva são síncronos, sem `await` entre eles; o guard revalida admissão e impede concorrência. Só depois enviar a requisição uma vez.
7. Após a resposta, conciliar a reserva com o total real informado+margem. Não assumir consumo igual ao máximo solicitado. Sem uso informado/timeout/JSON gerado inválido, conservar a reserva; não atribuir zero. Uso de raciocínio é registrado separadamente e não somado novamente ao total. Rejeição comprovadamente anterior à geração pode liberar tokens, mantendo a contagem de requisições.

Resultados locais com margem800 e janela vazia:

| Selecionados | Enviados | Bytes | Entrada estimada | Alvo | Efetivo | Reserva |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 2 | 4409 | 2269 | 5120 | 4931 | 8000 |
| 15 | 11 | 5998 | 3063 | 5120 | 4137 | 8000 |
| 40 | 11 | 5999 | 3064 | 5120 | 4136 | 8000 |
| 75 | 11 | 5999 | 3064 | 5120 | 4136 | 8000 |

São dados fictícios. A cobertura parcial já existente continua explícita e não remove os dados da base/PDF. Também foi testado5120 integral quando o conjunto entrada+margem permite, com margem400 configurada explicitamente em mock; **o padrão permanece800**. Não reduzir margem automaticamente para forçar5120.

Se o saldo separado de saída confirmado for5000 e a margem800, a conclusão fica no máximo4200. Se esse limite for2048, a tentativa autoral será bloqueada; não há redução de qualidade nem contorno da cota.

Limitação: guard por instância, sem coordenação distribuída entre todos os isolates/clientes da conta. Tráfego externo pode gerar429 mesmo após aprovação local. Headers e `Retry-After` são respeitados, sem retries automáticos; não há garantia global de disponibilidade. Alguns limites separados só são verificáveis no console: ausência de variável significa desconhecido, não ausência comprovada de divisão. [Documentação Groq sobre limites](https://console.groq.com/docs/rate-limits).

## 4. Diagnósticos

Campos novos no `meta` de uma geração enviada e nos `completionDiagnostics` de erro dessa geração:

| Campo | Significado |
| --- | --- |
| `configuredCompletionLimit` | Alvo escolhido pela configuração válida/default5120 |
| `requestedCompletionLimit` | Alvo lógico solicitado pelo gerador antes da redução; atualmente igual ao configurado |
| `effectiveCompletionLimit` | Valor final colocado em `max_completion_tokens` e passado ao transporte |
| `completionDiagnostics.limit` | Mesmo valor do JSON efetivamente passado ao transporte; null quando nenhuma chamada foi enviada |
| `estimatedPromptTokens` | Estimativa de todas as mensagens/schema serializados |
| `estimatedReservedTotal` | Entrada estimada+conclusão planejada+margem |
| `availableTokenBudget` | Saldo conservador disponível antes da reserva |
| `budgetAdjustmentReason` | Motivo explícito da redução/bloqueio ou `none` |
| `deploymentRevision` | Marcador do código local/publicado, não versão Supabase nem prova do valor configurado |

Também disponíveis: `completionSource` (`default_5120`/`environment`), `tokenMargin`, saldos e tetos separados quando conhecidos, uso real de entrada/saída/raciocínio/total, `finishReason`, latência, ID diagnóstico e status/origem do erro. Uso ausente permanecenull. Respostas de cache indicam `providerCall:false`, `cacheHit:true`, `currentRequestTokens:0` e `usageSource:cached_original`; suas métricas originais não contam como nova geração real. A chave do cache incorpora a política/revisão para não misturar perfis.

HTTP400 continua400;429 continua429 com espera; timeout504. `length` e JSON/schema inválidos não são aplicados. Flags estruturais de `failed_generation` permanecem seguras, sem seu conteúdo bruto. Não registrar Secrets, JWTs, prompts, raciocínio textual ou dados corporativos. No editor aparece apenas um aviso discreto quando há redução, por exemplo5120→4931; a formatação do PDF não foi alterada.

## 5. Testes executados

| Verificação | Resultado |
| --- | --- |
| Deno check Edge com `supabase/functions/deno.json` | Passou |
| Deno check testes de orçamento, handler e roteiros de homologação | Passou |
| Sintaxe dos dois JS modificados, via parser Deno/V8 | Passou; Node não está instalado |
| `groq-v7-output-budget.test.ts` | 14 grupos passaram, mocks sem rede |
| `groq-v7-controlled-protocol.test.ts` | Passou, mocks do protocolo históricoA/B/C |
| `groq-v7-compatibility.test.ts` | 8 grupos passaram |
| `reports-v7.test.ts` | 14 grupos passaram, incluindo Groq/OpenAI/Gemini com mocks |
| `reports-v7-edge.test.ts` | Passou com handler real e auth/RLS/transporte simulados; configuração2048 retorna503, sem chamar provedor |
| `edge-handler.test.ts` | Passou |
| `groq-v51.test.mjs` | Passou |
| `groq-budget.test.mjs` | Passou |
| `analytics.test.mjs` | Passou |
| `reports-v61.test.mjs` | Passou,144 combinações |
| `reports-v7-pdf.test.mjs` | Passou,18 combinações |
| `pending-state.test.mjs` | Passou |
| `ux32-static.test.mjs` | Passou |
| Navegador Chrome offline,320/1440px, claro/escuro | Passou nos4 cenários; editor, aviso de redução, revisão, teclado, fallback, filtros, sessão, bloqueio de duplicação, PDFs1/15/40 nos formatos Executivo/Completo e progresso |
| Preparação do roteiro com `--deny-net --deny-env` | Passou; zero chamadas |
| `git diff --check` | Passou |
| Geração real após publicação/Secrets | **Não executada** |
| Qualidade autoral real/causa definitiva do400 | **Ainda não homologadas** |
| Editor/PDF usando a resposta real da Groq | **Pendente do operador**; testes locais usaram mocks |

O primeiro processo de navegador no sandbox ficou sem progresso e foi encerrado exclusivamente pelo comando do teste. A execução autorizada fora do sandbox passou; não foram encerrados processos normais do usuário.

Resultados locais: `.validation-tools/groq-v7-dynamic-results.json`, `.validation-tools/groq-v7-dynamic-suites.json`, `.validation-tools/v7-browser-smoke-results.json`. Os14 grupos novos cobrem configuração ausente/inválida,5120 integral e redução explícita, wire/diagnóstico iguais,8kTPM, consumo real/raciocínio, concorrência, ITPM/OTPM, headers,400,429,timeout,JSON inválido,fallback,pré-verificação e uma chamada controlada sem retries.

## 6. Configuração e publicação em homologação — operador autorizado

Estes comandos são instruções; não foram executados. Usar projeto de homologação, não produção. Secrets Supabase são do projeto e podem afetar outras funções que leiam os mesmos nomes: confirmar o projeto e guardar os valores anteriores antes da mudança.

1. Confirmar no console Groq o modelo120b,8000TPM observado, saldos/cotas diárias e eventual divisão ITPM/OTPM. Aguardar todos os cooldowns/reset/`Retry-After` e ao menos cinco minutos desde a última geração para expirar cache; reservar janela sem outras análises na organização.
2. Registrar a revisão atualmente publicada e a configuração anterior. No Supabase Dashboard do projeto correto, conferir os nomes em **Edge Functions → Secrets**. `supabase secrets list --project-ref <REF_HOMOLOGACAO>` lista os registros, mas não substitui a verificação do valor efetivo no preflight. Nunca compartilhar o valor de `GROQ_API_KEY`.
3. Após aprovação, publicar a função completa, preservando suas dependências locais e autenticação:

   ```powershell
   supabase functions deploy seguranca-viaria-ia --project-ref <REF_HOMOLOGACAO>
   ```

   Não publicar somente `index.ts` nem usar `--no-verify-jwt`. Publicar também `public/report-authoring.js` no frontend de homologação pelo processo habitual do projeto, apenas para o aviso de redução. A Edge é compatível com o frontend anterior; não é necessário modificar PDFs.
4. No mesmo projeto, definir explicitamente os números para facilitar auditoria:

   ```powershell
   supabase secrets set REPORT_V7_COMPLETION_TOKENS=5120 REPORT_V7_TOKEN_MARGIN=800 --project-ref <REF_HOMOLOGACAO>
   ```

   Alternativa: cadastrar exatamente os mesmos nomes/valores em Edge Functions → Secrets. Se a variável estiver ausente, o novo código usa5120/800; se ainda estiver2048, a geração será bloqueada com503. Não mudar `GROQ_API_KEY`, RLS, tabelas ou cotas. As variáveis remotas são lidas via `Deno.env.get`; editar um arquivo local não as publica. [Procedimento oficial de Secrets](https://supabase.com/docs/guides/functions/secrets).
5. Se a conta tiver divisão, definir os valores **reais confirmados**, sem inventar números:

   ```powershell
   supabase secrets set REPORT_V7_GROQ_INPUT_TPM=<ITPM_CONFIRMADO> REPORT_V7_GROQ_OUTPUT_TPM=<OTPM_CONFIRMADO> --project-ref <REF_HOMOLOGACAO>
   ```

   Se não houver divisão confirmada, deixar ambas ausentes. Variável existente deve ser revisada pelo operador, não simplesmente ignorada. Não aumentar esses números para contornar um bloqueio. Também revisar eventuais valores inválidos de `REPORT_V7_MAX_BYTES`/`REPORT_V7_INPUT_TOKENS`.
6. Usar recorte de dados fictícios **já existentes** na homologação, sem criar/escrever dados, em `homolog-selection.json` com apenas `type`, `sector`, `ids`, `expectedIndicators` se aplicável, `start`, `end`. Dar preferência ao recorte da falha quando disponível, respeitando confidencialidade. Preparar no ambiente do processo `DGRANEL_HOMOLOGATION_FUNCTION_URL`, `DGRANEL_HOMOLOGATION_JWT` (sessão corporativa) e `DGRANEL_HOMOLOGATION_ANON_KEY`; nunca imprimir/gravar os valores. A URL deve ser exatamente `https://<REF_HOMOLOGACAO>.supabase.co/functions/v1/seguranca-viaria-ia`.
7. Primeiro, preparação inteiramente offline:

   ```powershell
   .\.validation-tools\deno.exe run --deny-net --deny-env tests/groq-v7-homologation-dynamic.ts --prepare
   ```

   Isso só mostra o planejamento da fixture local; não comprova publicação nem configuração remota.
8. Somente depois de autorização explícita, executar o roteiro abaixo uma vez. `<REF_HOMOLOGACAO>` deve ser substituído pelo project ref correto. `--no-separate-limits` é confirmação de ausência de divisão **verificada no console**, não uma escolha para ignorar limites:

   ```powershell
   .\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools/groq-v7-dynamic-test --allow-env=DGRANEL_HOMOLOGATION_FUNCTION_URL,DGRANEL_HOMOLOGATION_JWT,DGRANEL_HOMOLOGATION_ANON_KEY --allow-net=<REF_HOMOLOGACAO>.supabase.co tests/groq-v7-homologation-dynamic.ts --confirm-live --confirm-published-homologation --confirm-idle-window --expected-project-ref <REF_HOMOLOGACAO> --selection-file homolog-selection.json --tpm 8000 --no-separate-limits
   ```

   Se houver divisão, substituir `--no-separate-limits` por `--input-tpm <ITPM_CONFIRMADO> --output-tpm <OTPM_CONFIRMADO>`. O roteiro compara esses valores com o preflight do servidor e bloqueia divergências.

   O roteiro faz primeiro uma leitura autenticada da prévia com `diagnostics:true` (**sem Groq**). Confere modelo, revisão,strict,medium, configuração5120, conclusão efetiva>=4096 e reserva dentro dos saldos. Grava a tentativa antes de enviar a única solicitação autoral e passa `expectedCompletionTokens` como asserção do valor efetivo, não como sobrescrita. Se a disponibilidade mudar,409 bloqueia a geração; não há retry.

   São duas requisições HTTP à Edge e no máximo **uma** geração Groq. Registro persistente: `.validation-tools/groq-v7-dynamic-test/<REF>-v7-groq-dynamic-5120-4.json`. A tentativa não é repetida depois de400,429,timeout ou cache. Não apagar o registro para repetir. O antigo roteiro4096 foi desativado para chamadas reais; o protocolo históricoA/B/C não deve ser usado para esta homologação.
9. Exigir `validated:true`, HTTP200, `providerCall:true`, `cacheHit:false`, revisão nova, `configuredCompletionLimit:5120`, `requestedCompletionLimit:5120`, `effectiveCompletionLimit>2048`, `maxCompletionTokens` igual ao efetivo, reserva<=saldo e `finishReason:stop`. Registrar entrada/saída/raciocínio/total quando fornecidos, latência e eventual redução. Ausência de tokens reportados continua desconhecida. Nenhum400 pode ser tratado como validação aprovada.
10. Para confirmar editor e PDF com **a mesma geração real**, escolher o teste manual no frontend de homologação **em substituição ao script da etapa8**. Gerar apenas a prévia sem IA; consultar previamente o endpoint autenticado com o mesmo payload da prévia e `diagnostics:true` (sem `author:true`), conferindo os campos acima. Depois clicar uma única vez em gerar a elaboração Groq. Na aba Network, conferir a resposta dessa única solicitação `author:true`, incluindo status, limites, reserva e uso; deixar a resposta chegar ao editor, revisar e salvar apenas a revisão local, exportar Executivo e Completo e conferir referências, progresso e download único. Manter o mesmo recorte/ambiente/conta, sem expor credenciais. A revisão no servidor e as exportações não precisam chamar Groq. **Escolher um modo de geração, nunca executar script e botão para a mesma autorização.**

   Se foi escolhido o script, o documento real não é importado automaticamente no editor: essa validação integrada fica pendente; não repetir a Groq apenas para testá-la. Não declarar resolução definitiva sem geração real válida e revisão do relatório resultante.
11. Em falha, parar e coletar somente IDs/status/origem, limites configurado/solicitado/efetivo, reserva/saldo, tokens,latência,`finish_reason` e sinais estruturais sanitizados. Não coletar o texto bruto de `failed_generation`.400 sem uso/finish conhecido não comprova truncamento, mesmo perto do limite.5120 configurado e efetivo menor só é correto se houver motivo explícito e reserva consistente.

## 7. Arquivos e rollback

Código de publicação:

- `supabase/functions/seguranca-viaria-ia/report-authoring.ts`: configuração validada, alvo5120, margem800, planejamento, payload/diagnóstico efetivos, cache por política e preflight.
- `supabase/functions/seguranca-viaria-ia/groq-policy.js`: consulta de saldos, reservas com margem por chamada, dimensões entrada/saída e conciliação de uso, preservando a política V5.1.
- `supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts`: revisão `v7-groq-dynamic-5120-4`.
- `supabase/functions/seguranca-viaria-ia/index.ts`: preflight consulta o mesmo guard do handler.
- `public/report-authoring.js`: aviso discreto de redução no editor; não altera o PDF.

Somente validação/documentação: `tests/groq-v7-homologation-dynamic.ts` (novo), `tests/groq-v7-output-budget.test.ts`, `tests/groq-v7-homologation-4096.ts` (bloqueio do roteiro real antigo), `tests/groq-v7-compatibility.test.ts`, `tests/reports-v7.test.ts`, `tests/reports-v7-edge.test.ts`, `tests/reports-v7-browser.js`, README da função, nota no relatório4096 e este relatório.

Rollback autorizado pelo operador: preservar os registros; restaurar os quatro arquivos da função e `public/report-authoring.js` da versão anterior, republicar no projeto de homologação e restaurar/remover as variáveis para seus valores anteriores, incluindo margem e limites separados se tiverem sido configurados. Cópia da função anterior em `.validation-tools/groq-v7-dynamic-before/seguranca-viaria-ia/`; o frontend anterior pode ser recuperado pelo Git. Não combinar código anterior com alvo5120: o código antigo reverte valores fora da faixa para2048. Se necessário, permanecer no relatório determinístico até nova homologação. Nenhuma restauração de banco/dados é necessária.
