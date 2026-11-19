# V7 — orçamento de conclusão e homologação controlada

Implementação local em 19/11/2026. Revisão: `v7-groq-output-4096-3`. Sem deploy, sem chamadas reais, sem alteração de Secrets, banco, RLS, cálculos ou frontend.

## Diagnóstico e limites da conclusão

| Evidência real fornecida pelo operador | Entrada | Saída | Latência |
| --- | ---: | ---: | ---: |
| HTTP 200 | 1.589 | 2.045 | 4,701 s |
| HTTP 400 `json_validate_failed` | 1.589 | 2.048 | 4,626 s |

Falha: `0989277a-bff7-4c4c-b3c7-64b073ce1ccc`, revisão anterior `v7-groq-strict-wire-2`. O envelope compartilhado confirma origem no provedor e HTTP 400, mas não contém uso, raciocínio, `finish_reason` ou sinais de `failed_generation`. As contagens acima vieram do operador, não foram extraídas desse envelope. Não se pode inferir o tamanho do JSON visível a partir da saída total.

**Confirmado pelo código:** o padrão enviado era `max_completion_tokens: 2048`. A configuração `REPORT_V7_COMPLETION_TOKENS` aceitava 1.024–3.072; fornecer 4.096 retornava silenciosamente ao padrão de 2.048. Isso foi corrigido para aceitar até 4.096 na Groq. OpenAI/Gemini continuam com o teto anterior de 3.072. Nenhuma configuração remota foi alterada. O padrão de 2.048 permanece até decisão explícita do operador em homologação.

**Causa do HTTP 400 ainda não comprovada:** atingir exatamente 2.048 torna orçamento insuficiente uma hipótese forte, mas falta o motivo de encerramento ou evidência estrutural do JSON incompleto. O HTTP 200 com 2.045 mostra que a proximidade do teto também pode ocorrer com conclusão válida. Um sucesso em 4.096 permitirá homologar esse perfil; isoladamente, não prova toda a causalidade da falha anterior.

Não foi encontrado corte global local em 2.048: a resposta é rejeitada integralmente acima de 128 KiB; o diagnóstico estrutural inspeciona até 65.536 caracteres de `failed_generation`, sem recuperar/aplicar seu texto. Limites existentes de campos e listas do validador continuam inalterados. Timeout de 35 s permanece; as latências relatadas estão abaixo dele.

## Antes e depois

| Item | Antes | Depois |
| --- | --- | --- |
| Padrão de conclusão V7 | 2.048 | 2.048 |
| Override Groq de 4.096 | Revertia para 2.048 | Aceito explicitamente |
| `strict` efetivo serializado | `true` | `true` |
| Schema/prompt/seleção de evidências | Wire V2 | Idênticos |
| Modelo principal | `openai/gpt-oss-120b` | Idêntico |
| `reasoning_effort` / `include_reasoning` | `medium` / `false` | Idênticos |
| Temperatura | 0,3 | Idêntica |
| Teto de requisição | 6.000 bytes UTF-8 | Idêntico |
| Tratamento de 400 | Sem retry | Idêntico, com métricas adicionais |
| Diagnóstico | Sinais estruturais | Também uso, teto e evidência de truncamento |

O gerador agora usa a configuração recebida por injeção para construir o payload efetivo. Assim, os mocks e a pré-verificação exercitam o mesmo caminho de configuração da produção. `expectedCompletionTokens` é apenas uma asserção: divergência com a configuração do servidor retorna 409 antes de qualquer chamada, sem permitir ao cliente aumentar o orçamento.

`include_reasoning: false` controla a exposição do raciocínio na resposta; não é uma instrução para desligar o raciocínio. Por isso, contagens de raciocínio são monitoradas separadamente quando informadas. Não se soma raciocínio novamente ao total reportado. Referências oficiais: [API](https://console.groq.com/docs/api-reference), [Reasoning](https://console.groq.com/docs/reasoning).

## Orçamento e consumo

O limite de entrada continua estimado por `ceil(bytes UTF-8/2) + 64`, incluindo mensagens e schema serializados. É uma estimativa conservadora, não um tokenizador nem medição real de consumo. Não houve redução adicional do conteúdo ou do plano autoral para acomodar 2.048.

Medições locais com dados fictícios; bytes e entrada estimada iguais antes/depois, pois somente o número de quatro dígitos do teto mudou:

| Indicadores selecionados | Enviados | Bytes | Entrada estimada | Reserva com saída 2.048 | Reserva com saída 4.096 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 2 | 4.409 | 2.269 | 4.717 | 6.765 |
| 15 | 11 | 5.998 | 3.063 | 5.511 | 7.559 |
| 40 | 11 | 5.999 | 3.064 | 5.512 | 7.560 |
| 75 | 11 | 5.999 | 3.064 | 5.512 | 7.560 |

Reserva = entrada estimada + conclusão máxima + margem de 400. A cobertura parcial continua declarada; os indicadores omitidos do contexto permanecem na base determinística/PDF. O teto combinado local de 8.000 TPM não aumentou. RPM/RPD/TPD, cooldown, cache e exclusão de chamadas concorrentes foram preservados. O controle é por instância e não coordena todo o tráfego da organização ou de outros clientes.

Confirmar os limites reais da conta no console, inclusive possíveis ITPM/OTPM separados. Limites são organizacionais; 8.000 combinados não garantem 4.096 de saída disponíveis. O roteiro exige confirmação explícita do limite separado de saída ou da ausência dessa divisão. Se existir limite de entrada separado, conferir também que suporta a entrada estimada mostrada no preflight. [Rate Limits da Groq](https://console.groq.com/docs/rate-limits).

## Diagnóstico seguro

Sucesso e erro passam a registrar contagens de entrada/saída/raciocínio/total, limite efetivo, latência e motivo de encerramento. Erros extraem uso tanto de `usage` quanto de `error.usage`, quando presentes. Ausência de uso permanece `null`, sem atribuir consumo zero. HTTP 400 com consumo informado não libera a reserva como rejeição anterior à geração.

O envelope de erro inclui `completionDiagnostics` com números e categorias seguras. Logs conservam identificador da requisição do provedor, `diagnosticId`, revisão, hash do schema e sinais estruturais existentes, sem prompts, indicadores, chaves, JWTs, texto de raciocínio ou `failed_generation` bruto.

Interpretação de `truncationEvidence`:

- `provider_reported_length`: o provedor informou `finish_reason: length`; a resposta é rejeitada.
- `cap_and_incomplete_json`: saída reportada atingiu o teto e o JSON aparenta estar incompleto; evidências convergentes, sem prova isolada de causalidade.
- `cap_reached_unproven_cause`: atingiu o teto, sem sinal estrutural suficiente.
- `incomplete_json_unknown_cause`: estrutura incompleta, sem contagem que confirme o teto.
- `not_confirmed`: sem evidência suficiente; não significa ausência comprovada de truncamento.

HTTP 400 continua 400; 429 conserva `Retry-After`; timeout retorna 504. Não existem retries automáticos de geração. JSON inválido não é aplicado. Base, editor, revisão factual e exportação sem IA permanecem disponíveis.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| Deno check Edge com `supabase/functions/deno.json` | Passou |
| Deno check dos dois novos arquivos de testes/roteiro | Passou |
| `groq-v7-output-budget.test.ts` | 11 grupos passaram, sem rede |
| `groq-v7-controlled-protocol.test.ts` | Passou com mocks; protocolo A/B/C anterior preservado |
| `groq-v7-compatibility.test.ts` | 8 grupos passaram |
| `reports-v7.test.ts` | 14 grupos passaram; três provedores com mocks |
| `reports-v7-edge.test.ts` | Handler executado com auth/RLS/transporte simulados; passou |
| `edge-handler.test.ts` | Passou |
| `analytics.test.mjs` | Passou |
| `groq-budget.test.mjs` | Passou |
| `groq-v51.test.mjs` | Passou |
| `reports-v61.test.mjs` | Passou, 144 combinações |
| `reports-v7-pdf.test.mjs` | Passou, 18 combinações |
| `pending-state.test.mjs` | Passou |
| `ux32-static.test.mjs` | Passou; verificação estática |
| Preparação offline do roteiro 4.096 | Passou com `--deny-net --deny-env`; zero chamadas |
| Revisão de whitespace com `git diff --check` | Passou |
| Geração real com 4.096 / qualidade / latência reais | Não executada; depende de publicação e autorização |
| Interface em navegador nesta alteração | Não executada; frontend inalterado |

Os novos mocks cobrem configuração 2.048/3.072/4.096, payload serializado, evidências e cobertura, resposta válida acima de 2.048, `stop` próximo do teto, `length`, 400 com JSON incompleto e uso reportado, uso aninhado, 429, timeout, reserva, logs seguros e pré-verificação sem geração. O protocolo recusa contar cache ou modelo inesperado como homologação real.

Resultados por suíte em `.validation-tools/groq-v7-output-edge-v7.json` e `.validation-tools/groq-v7-output-regression.json`; detalhes novos em `.validation-tools/groq-v7-output-budget-results.json`.

## Publicação e uma única chamada real — somente pelo operador autorizado

1. Escolher projeto **de homologação** e recorte com dados fictícios já existentes. Não criar/editar dados reais para o teste. Confirmar manualmente os limites da conta Groq e disponibilidade diária. Guardar o valor anterior de `REPORT_V7_COMPLETION_TOKENS` e a versão anterior dos arquivos.
2. Após aprovação, publicar a função inteira, incluindo suas dependências locais, preservando a configuração atual de autenticação. Com CLI já autenticada, na raiz do projeto:

   ```powershell
   supabase functions deploy seguranca-viaria-ia --project-ref <REF_HOMOLOGACAO>
   ```

   O comando acima é documentação; não foi executado. Não publicar somente `index.ts`: ele importa outros arquivos locais. Não usar `--no-verify-jwt`.

3. O operador configura explicitamente **apenas em homologação** o valor de engenharia `REPORT_V7_COMPLETION_TOKENS=4096`, usando a configuração de ambiente existente da função. Isso é o teto por chamada, não alteração de cota da conta. Nenhum Secret foi modificado por esta implementação. Se não houver autorização para configurar o valor, parar: publicar o código sozinho conserva 2.048.
4. Aguardar pelo menos cinco minutos desde a última geração para expirar cache, respeitando todo `Retry-After`/reset ainda vigente. Reservar janela sem outras análises de usuários/clientes na conta. Uma nova janela requer nova autorização, não retries automáticos.
5. Preparar `homolog-selection.json` com o mesmo recorte selecionado na prévia: somente `type`, `sector`, `ids`, `expectedIndicators` se usado, `start`, `end`. Usar IDs/períodos efetivamente existentes na homologação. Não colocar credenciais nesse arquivo. Manter o recorte das chamadas anteriores quando disponível; igualdade de contagem de entrada, sozinha, não comprova identidade do prompt.
6. Disponibilizar no ambiente do processo, sem imprimir seus valores: `DGRANEL_HOMOLOGATION_FUNCTION_URL` (`https://<REF_HOMOLOGACAO>.supabase.co/functions/v1/seguranca-viaria-ia`), `DGRANEL_HOMOLOGATION_JWT` (sessão corporativa autorizada) e `DGRANEL_HOMOLOGATION_ANON_KEY`. A chave Groq permanece exclusivamente no servidor.
7. Preparação offline segura, sem permissões de rede/ambiente:

   ```powershell
   .\.validation-tools\deno.exe run --deny-net --deny-env tests/groq-v7-homologation-4096.ts --prepare
   ```

8. Executar uma vez, após aprovação explícita. Substituir o project ref e o caminho do arquivo. Se o console confirmar OTPM separado >=4.096, substituir `--no-separate-output-limit` por `--output-tpm <LIMITE_CONFIRMADO>`; não afirmar ausência sem verificar:

   ```powershell
   .\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools/groq-v7-output-test --allow-env=DGRANEL_HOMOLOGATION_FUNCTION_URL,DGRANEL_HOMOLOGATION_JWT,DGRANEL_HOMOLOGATION_ANON_KEY --allow-net=<REF_HOMOLOGACAO>.supabase.co tests/groq-v7-homologation-4096.ts --confirm-live --confirm-published-homologation --confirm-idle-window --expected-project-ref <REF_HOMOLOGACAO> --selection-file homolog-selection.json --tpm 8000 --no-separate-output-limit
   ```

   As flags são confirmações do operador, não mecanismos que aguardam ou concedem autorização automaticamente. O roteiro primeiro faz **uma leitura autenticada da base**, sem IA, e exige revisão correta, modelo 120b, `strict:true`, `medium`, configuração publicada de 4.096, reserva dentro do teto e provedor configurado. Só então registra a tentativa e envia **uma única solicitação autoral**. São duas requisições HTTP à Edge, das quais apenas a segunda pode chamar a Groq.

   O registro local `.validation-tools/groq-v7-output-test/<REF>.json` é gravado antes da geração; o script não admite outra tentativa nesse projeto, inclusive após 400/429/timeout. Não apagar o registro para repetir. O teste não usa o protocolo antigo A/B/C de três chamadas. Não há escrita em banco.

9. Aceitar como geração homologada apenas `validated:true`, HTTP 200, modelo120b, `maxCompletionTokens:4096`, `finishReason:stop`, `providerCall:true`, `cacheHit:false`, revisão nova, mesma base/snapshot e documento aprovado estrutural/factualmente sem issues. Revisar também a qualidade autoral no editor, sem editar números ou aplicar texto inválido. O script deixa exportação/estado da interface intactos.
10. Se falhar, parar. Coletar apenas saída sanitizada do roteiro e logs por `diagnosticId`: tokens, motivo de encerramento, teto, latência e sinais estruturais. HTTP 400 não deve ser repetido automaticamente. Se não houver `usage` ou `finish_reason`, registrar desconhecido. Nunca enviar `failed_generation` bruto, Secrets ou dados corporativos para diagnóstico.

## Arquivos e rollback

Publicar na função, com o restante das dependências locais preservadas:

- `supabase/functions/seguranca-viaria-ia/report-authoring.ts`: override4.096, uso da configuração injetada, pré-verificação e métricas.
- `supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts`: revisão e sinais de conclusão/uso seguros.
- `supabase/functions/seguranca-viaria-ia/index.ts`: diagnóstico opcional autenticado, asserção do teto e envelope seguro.

Somente locais: `tests/groq-v7-output-budget.test.ts`, `tests/groq-v7-homologation-4096.ts`, extensão de `tests/reports-v7-edge.test.ts` e este documento. Nenhum arquivo do frontend/PDF/schema autoral foi modificado.

Rollback pelo operador: restaurar o valor anterior de `REPORT_V7_COMPLETION_TOKENS` na homologação (ou removê-lo se antes inexistente), restaurar os três arquivos da versão anterior e republicar apenas nesse projeto após aprovação. Cópia local anterior disponível em `.validation-tools/groq-v7-output-before/seguranca-viaria-ia/`. O perfil anterior usa a revisão `v7-groq-strict-wire-2`; confirmar essa revisão no diagnóstico. Não restaurar banco, tabelas ou dados: não foram alterados. Preservar o registro do teste para auditoria.
