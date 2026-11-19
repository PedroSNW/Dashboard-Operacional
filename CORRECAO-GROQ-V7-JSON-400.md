# Groq V7 — diagnóstico de HTTP 400 e distinção de HTTP 429

Implementação local, sem deploy, alteração de Secrets/cotas, banco ou cálculos. Ponto de restauração: `.validation-tools/groq-v7-fix-before/seguranca-viaria-ia/`.

## Evidência e causa identificada

O diagnóstico adicional fornecido foi `type: invalid_request_error`, `code: json_validate_failed`, com mensagem de falha na validação do JSON gerado. Isso identifica **falha de geração/validação da saída**, não prova de schema de entrada inválido nem de esgotamento de 8.000 TPM. Não se deve interpretar o gráfico de tokens próximo de zero como prova de consumo exatamente zero nessa falha.

No código anterior, todo 400 autoral recebia a descrição genérica “parâmetros ou contexto”, ocultando essa distinção. Isso foi corrigido: `json_validate_failed` recebe mensagem específica de JSON gerado, preservando HTTP 400 e sem aplicar texto rejeitado.

Também foi reproduzido o encadeamento **400 do provedor → 429 local na tentativa seguinte**: o guard reserva entrada estimada + conclusão máxima + margem. Sem uso informado, conserva essa reserva. Uma reserva de aproximadamente cinco mil tokens pode impedir outra reserva semelhante na janela local de 8.000, mesmo que a Groq não tenha informado esse consumo. O segundo bloqueio não chama a API e não é confirmação de cota esgotada no provedor.

**Limite da conclusão:** na versão local inspecionada, o 400 autoral já era preservado pelo `AuthoringError` e pelo catch da Edge. Não foi reproduzida a combinação de HTTP 429 com o próprio texto do erro 400 na mesma resposta. O 429 local tinha mensagem diferente. Essa combinação exige correlação da requisição e da versão efetivamente publicada; não foi atribuída a uma conversão que não existe no código local. Novos IDs e headers permitem verificar isso na próxima ocorrência.

O motivo exato de a Groq ter produzido/rejeitado aquele JSON continua não comprovado sem `failed_generation` analisado de forma segura ou uma chamada controlada. Não se declarou que um recurso do schema era incompatível sem evidência.

## Payload auditado

Endpoint: `https://api.groq.com/openai/v1/chat/completions`.

| Parâmetro | Antes | Agora |
| --- | --- | --- |
| `model` padrão | `openai/gpt-oss-120b` | Preservado |
| `messages` | Sistema + pacote compacto | Preservados |
| `response_format.type` | `json_schema` | Preservado |
| `json_schema.name` | `authored_report_v1` | Preservado |
| `json_schema.strict` | `true` | Preservado |
| `reasoning_effort` | `medium` | Preservado |
| `max_completion_tokens` | 2.048 padrão; faixa existente 1.024–3.072 | Preservado |
| `temperature` | `0.3` | Preservado |
| `include_reasoning` | Ausente | `false` explícito |
| `reasoning_format` | Ausente | Continua ausente |
| `max_tokens`, ferramentas, streaming | Ausentes | Preservados |

`include_reasoning: false` é endurecimento de compatibilidade/confidencialidade da resposta, **não desativa o raciocínio nem garante redução de seu consumo**. Não foi apresentado como causa comprovada do incidente. A documentação específica GPT-OSS admite essa opção e não suporta `reasoning_format` nesse modelo; por isso não foi acrescentado `parsed`/`hidden`. [Groq: reasoning](https://console.groq.com/docs/reasoning), [referência da API](https://console.groq.com/docs/api-reference).

## JSON Schema estrito

O contrato continua exatamente o mesmo em `public/report-authored-core.js` e no espelho da Edge. Não foi trocado por `json_object`, `strict: false`, parsing permissivo ou recuperação automática de texto em erro.

Foi adicionada auditoria recursiva antes do envio: raiz objeto, objetos fechados, correspondência entre propriedades e `required`, tipos dos enums, arrays e ramos `anyOf`. São calculados profundidade de objetos, quantidade de propriedades e fingerprint SHA-256. Não foram inventados limites de profundidade/propriedades que não estivessem documentados para essa API.

A estrutura atual tem objetos fechados com todos os campos requeridos, união nulo/objeto em `proposal`, enums de texto e inteiros. A documentação permite esses recursos e informa suporte estrito ao modelo configurado. **Auditoria local não equivale a uma resposta 200 real da Groq.** [Structured Outputs](https://console.groq.com/docs/structured-outputs).

Não há evidência suficiente para adaptar/remover o `anyOf`, enums numéricos ou aninhamentos. Se um diagnóstico futuro apontar uma restrição específica, o caminho/keyword sanitizados permitirão uma alteração orientada por evidência.

## Erros e reservas

| Situação | HTTP da Edge | Diagnóstico |
| --- | --- | --- |
| Groq `json_validate_failed` | 400 | `errorOrigin: provider`, `providerStatus: 400`, código preservado |
| Groq rejeita schema/parâmetro/contexto | 400 | Categoria técnica própria; sem retry |
| Groq limita consumo | 429 | Origem provedor, `Retry-After` preservado |
| Guard local bloqueia concorrência/reserva | 429 | `errorOrigin: local_guard`, status do provedor nulo, nenhuma chamada |
| Timeout | 504 | Origem transporte |
| Resposta 200 com JSON/schema incompatível | 502 | Falha de resposta; nenhum conteúdo aplicado |
| Schema local quebrado antes do envio | 500 | `local_contract`; não atribuído ao provedor |

Foi localizado outro mapeamento impreciso no ramo Groq legado do `index.ts`: 400 era convertido em **502**, não 429. Ele agora preserva 400, assim como 413 e 429. O teste correspondente foi atualizado para exigir o status correto.

O guard mantém suas cotas e conserva reservas para `json_validate_failed`, timeout e consumo desconhecido. Somente rejeições explicitamente anteriores à geração podem liberar a reserva de tokens; o evento continua contabilizado em RPM/RPD. `failed_generation` presente ou uso positivo impedem essa liberação. Não há crédito de tokens presumido para a falha relatada pelo usuário, aumento de limites ou retries automáticos.

## Diagnóstico seguro

Headers: `X-DGranel-IA-Revision: v7-groq-diagnostics-1` e `X-DGranel-Diagnostic-Id` nos erros autorais. CORS permite lê-los, junto de `Retry-After`.

O corpo inclui `httpStatus`, `providerStatus`, `errorOrigin`, `errorCode`, `diagnosticId` e `contractRevision`. O HTTP emitido continua sendo o status numérico da mesma exceção. Se Network mostrar 429 mas `httpStatus` for 400, guardar os identificadores e investigar a versão/gateway/intermediário, pois os testes da Edge emitem 400/400.

Logs técnicos registram modelo, modo estrito, parâmetros seguros, hash/métricas do schema, bytes, estimativa de tokens, uso informado e disposição da reserva. Códigos, tipos, parâmetros e keywords são selecionados de listas conhecidas; mensagens brutas não são registradas.

`failed_generation` é analisado somente em memória. Os logs indicam JSON ausente/vazio/inválido/válido/excessivo e compatibilidade estrutural; caminhos são reduzidos a nomes do schema e índices. Nenhum valor, texto de relatório, campo extra privado, prompt ou raciocínio é impresso. Esse conteúdo nunca é recuperado para exportação nem tratado como sucesso.

## Medição local de requisição

Fixtures fictícias idênticas antes/depois; corpo completo, incluindo schema e parâmetros:

| Indicadores selecionados | Bytes antes/depois | Entrada estimada antes/depois | Resumos enviados antes/depois |
| --- | --- | --- | --- |
| 1 | 4.333 / 4.359 | 2.231 / 2.244 | 1 / 1 |
| 15 | 5.997 / 5.999 | 3.063 / 3.064 | 10 / 10 |
| 40 | 6.000 / 6.000 | 3.064 / 3.064 | 10 / 10 |

Preservados teto de 6.000 bytes, entrada estimada conservadora e conclusão padrão de 2.048. A estimativa é bytes UTF-8/2 + 64, não um tokenizador real. A seleção de históricos é novamente ajustada para caber; não há truncamento de JSON. Medição: `.validation-tools/groq-v7-request-audit.json`.

## Arquivos alterados

- `supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts`: novo, auditoria e diagnóstico sanitizado.
- `report-authoring.ts`: parâmetros explícitos, classificação de falhas, correlação e auditoria.
- `groq-policy.js`: tratamento restrito de reserva para rejeição comprovadamente anterior à geração.
- `index.ts`: preservação de status, envelope/headers de diagnóstico e ajuste do ramo legado.
- `tests/groq-v7-compatibility.test.ts`: novo, oito grupos específicos de regressão.
- `tests/groq-v7-live-probe.ts`: novo, teste real opcional com uma chamada e dados fictícios.
- `tests/reports-v7-edge.test.ts`, `tests/edge-handler.test.ts`: exigência do 400 correto no handler real com mocks.

Nenhum arquivo do frontend/editor V7, UX V3.2, conteúdo V6.1 ou motor determinístico foi modificado nesta correção.

## Validação executada

Type check da Edge com `supabase/functions/deno.json`: aprovado. Type check do probe opcional: aprovado.

Dez suítes locais passaram: `groq-v7-compatibility`, `reports-v7`, `reports-v7-edge`, `edge-handler`, `groq-v51`, `groq-budget`, `analytics`, `reports-v61`, `reports-v7-pdf` e `pending-state`. O novo teste específico foi repetido após os últimos ajustes. Manifesto: `.validation-tools/groq-v7-fix-tests.json`.

Cobertura específica: 400 realista `json_validate_failed`, 400 de schema/parâmetro, reservas e 429 local subsequente, 429 do provedor/Retry-After, timeout, JSON/schema inválido, resposta autoral válida com evidências e ausência de vazamento de dados nos logs. O handler completo confirma status HTTP, corpo e identificadores sem rede real.

**Não executado:** teste contra a API real. `GROQ_API_KEY` não está disponível no ambiente local. Não foram acessados Secrets do Supabase, nem os logs reais da conta. Portanto a resolução definitiva da falha de geração, a aceitação do payload e o consumo real continuam pendentes de homologação.

## Teste controlado e publicação manual

Para teste opcional posterior, com uma chave já disponível no ambiente de um terminal autorizado:

```powershell
.\.validation-tools\deno.exe run --allow-env=GROQ_API_KEY --allow-net=api.groq.com tests/groq-v7-live-probe.ts --confirm-live
```

Esse script faz **uma única chamada**, com um indicador fictício; não lê Supabase, não repete 400 e não exibe textos corporativos/Secrets. Ele consome cota. Não foi executado nesta entrega.

Após homologação e autorização de publicação, enviar a pasta completa da função, incluindo o **novo** `groq-authoring-contract.ts` e todos os auxiliares importados. Não publicar apenas `index.ts`. Não é necessária publicação de frontend para esta correção.

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref <PROJECT_REF>
```

O comando acima é somente instrução: **nenhum deploy foi realizado**. Não alterar cotas, Secrets ou verificações de JWT. Em nova falha, correlacionar Network e logs usando diagnóstico/revisão; registrar somente status, código, categoria, parâmetro/keyword, fingerprint e indicadores estruturais de falha. Não copiar `failed_generation` com dados corporativos para logs ou conversas.
