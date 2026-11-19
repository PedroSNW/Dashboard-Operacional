# Groq V7 e o enum de propostas

A revisão local `v7-proposal-enum-8` explicita as categorias no prompt, preserva o contrato estrito e identifica a segunda recomendação no diagnóstico sem expor o valor rejeitado.

## Evidência e requisição

A revisão publicada `v7-claim-semantics-7` recebeu HTTP 400 `json_validate_failed` para a requisição Groq `req_01m7tecam9e2gb32p95w0ysz0t`, com ID Edge `bd6621c9-c4d2-4ccd-b184-f7ecc666b07f`. A mensagem do provedor aponta para `/recommendations/1/type`. Isso confirma que o provedor rejeitou o tipo da segunda recomendação contra os quatro literais esperados. A mensagem não informa qual literal foi gerado.

O caminho autoral em `report-authoring.ts` usa o mesmo corpo JSON que valida e entrega ao transporte. A requisição local capturada em mock confirma `openai/gpt-oss-120b`, `response_format.type: json_schema`, `response_format.json_schema.strict: true`, nome `authored_report_wire_v2`, `reasoning_effort: medium`, `include_reasoning: false` e temperatura 0,3. `max_completion_tokens` continua calculado pelo orçamento dinâmico da Edge com alvo de 5.120. O schema serializado tem objetos fechados, propriedades obrigatórias e o enum abaixo. A validação checa o hash do schema antes do envio e registra os parâmetros lidos do corpo serializado. `index.ts` encaminha os campos sanitizados do erro ao cliente pelo envelope existente.

Na documentação, a Groq inclui o modelo de 120B no modo estrito e descreve decodificação restrita ao schema. O código local e a revisão anterior inspecionada declaram o modo estrito. Sem o envelope serializado ou o log correlacionado da requisição histórica, a configuração efetiva daquela execução e o motivo pelo qual o valor inválido chegou à validação do provedor continuam em aberto. O prompt anterior também descrevia propostas, ações, campanhas e evolução sem mapear cada sentido para o literal exigido. Essa ambiguidade foi confirmada no código, mas sua contribuição para a resposta real ainda é hipótese. [Structured Outputs da Groq](https://console.groq.com/docs/structured-outputs)

## Contrato e diagnóstico

| Literal | Uso |
| --- | --- |
| `recommendation` | Recomendação gerencial |
| `campaign` | Campanha preventiva ou educativa |
| `action` | Ação operacional proposta |
| `evolution` | Etapa do plano de evolução |

O prompt exige exatamente um desses valores em inglês em `recommendations[].type`. O schema, a conversão e os testes sintéticos usam a mesma lista. O contrato interno em `report-authored-core.js` reconhece os quatro tipos. A conversão preserva o tipo, as referências e o texto autoral. Vazio, tradução ou categoria desconhecida continuam inválidos. Não há reclassificação automática, pois a mesma proposta pode ter características de ação operacional e de etapa de evolução. Uma mudança futura de transporte exigiria um discriminador tipado que produzisse uma categoria inequívoca.

O novo diagnóstico mantém `errorCode: json_validate_failed` e HTTP 400. Inclui `validationStage: provider_schema_validation`, `validationCode: recommendation_type_enum`, `validationCategory: enum_mismatch`, `schemaField: recommendations[].type`, `validationPath: $.recommendations.1.type`, `arrayIndex: 1`, `enumName: GROQ_PROPOSAL_TYPES`, revisão, nome do schema, modo estrito, hash serializado e ID Groq quando fornecido. O índice começa em zero.

`reportedByProvider` indica que a mensagem aponta para o campo e o índice. `confirmedInFailedGeneration` indica que o JSON de falha disponível foi analisado localmente e confirmou o enum nesse índice. A inspeção usa os limites existentes de tamanho. Logs e resposta carregam somente os metadados fixos e não incluem o literal errado, a mensagem original ou o documento bruto.

## Testes manuais

A/B usam um schema mínimo com o mesmo caminho e enum. A solicita uma proposta e B solicita quatro em ordem, uma de cada categoria. C usa o schema completo e uma fixture fictícia. Os três serializam `strict: true` e usam o mesmo modelo e raciocínio. O protocolo direto usa um teto fixo de 3.072 para isolar os contratos, enquanto o fluxo publicado usa o orçamento dinâmico. C verifica o contrato e os fatos da fixture, sem substituir a homologação pelo editor.

No PowerShell, preparar os casos e imprimir o corpo mínimo para eventual suporte. Esses comandos funcionam sem credenciais e com rede proibida.

```powershell
.\.validation-tools\deno.exe run --deny-net --deny-env tests/groq-v7-controlled-protocol.ts --recommendation-enum --completion 3072 --prepare
.\.validation-tools\deno.exe run --deny-net --deny-env tests/groq-v7-controlled-protocol.ts --recommendation-enum --completion 3072 --print-request --case A
```

Para investigar uma falha na segunda entrada, exportar também o caso B substituindo `--case A` por `--case B`. Se a falha só ocorrer no completo, exportar C. Enviar ao suporte apenas o caso sintético que reproduzir, seu ID Groq, o caminho sanitizado e o resultado. O ID histórico acima pode acompanhar a descrição da ocorrência original. A documentação pede casos reproduzíveis para HTTP 400 no modo estrito. [Structured Outputs da Groq](https://console.groq.com/docs/structured-outputs)

Após autorização do operador, disponibilizar `GROQ_API_KEY` no ambiente do processo sem imprimir seu valor. Conferir a cota e a janela de consumo no console. Executar manualmente uma chamada por comando, com sessão nova, mantendo a mesma sessão e perfil de A a C.

```powershell
.\.validation-tools\deno.exe run --allow-env=GROQ_API_KEY --allow-net=api.groq.com --allow-read=.validation-tools/groq-v7-protocol --allow-write=.validation-tools/groq-v7-protocol tests/groq-v7-controlled-protocol.ts --recommendation-enum --completion 3072 --confirm-live --case A --session enum-homologacao
```

Se A passar, aguardar o intervalo registrado pelo roteiro e qualquer limite informado pela Groq, então repetir o comando com `--case B`. Fazer o mesmo para C apenas se B passar. O roteiro interrompe a sequência em falha, usa uma chamada por execução e conserva o resultado sanitizado. O teto de cada teste e o intervalo não garantem saldo organizacional quando outros clientes usam a mesma conta. [Limites da Groq](https://console.groq.com/docs/rate-limits)

## Publicação e rollback

Passaram o type check Deno, 18 suítes locais e quatro cenários em Chrome com a Edge e o frontend locais e a Groq simulada. A regressão de schema cobre as quatro categorias juntas, tipo desconhecido, tipo vazio, segunda recomendação inválida e conversão com preservação de referências. O handler foi testado com HTTP 400, etapa, índice e sanitização. Editor e PDFs Executivo e Completo passaram em 320 e 1.440 px nos temas claro e escuro. O preparo A/B/C também executou com rede e credenciais desabilitadas.

Arquivos da Edge modificados incluem `groq-authoring-wire.ts`, `groq-authoring-contract.ts` e `report-authoring.ts`. Os testes usam `groq-v7-proposal-enum.test.ts`, `groq-v7-controlled-protocol.ts` e `reports-v7-edge.test.ts`. A publicação autorizada usa a pasta completa da função e o projeto de homologação.

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref <REF_HOMOLOGACAO>
```

Para homologar o fluxo completo, gerar uma base fictícia, pedir uma geração autorizada no Dashboard, confirmar o conteúdo aceito pela Edge, revisar no editor e exportar PDFs Executivo e Completo. Para rollback, restaurar em conjunto os três arquivos da Edge da revisão `v7-claim-semantics-7` e republicar no projeto correto. A tarefa local não executou deploy, alterações de Secrets ou chamadas reais. A resolução em produção permanece em aberto até a geração real validada.
