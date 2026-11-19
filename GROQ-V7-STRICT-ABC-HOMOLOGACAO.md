# D’Granel V7 — contrato estrito simplificado e homologação A/B/C

Implementação local em 18/11/2026. **Zero chamadas reais à Groq, zero deploy e zero alterações de dados corporativos.** Esta é uma correção candidata, não uma solução definitivamente homologada na API.

## 1. Diagnóstico confirmado e hipóteses

O incidente informado tem `errorOrigin: provider`, `providerStatus: 400`, `errorCode: json_validate_failed`, revisão `v7-groq-diagnostics-1` e diagnóstico `aba2817a-fea1-4760-b172-b59b3afe38ad`. A mudança anterior de `include_reasoning` não resolveu a geração real.

A auditoria do código e do corpo serializado confirma: **o pedido já utilizava `response_format.type: json_schema` e `strict: true`**. Não foi presumido best-effort. O endpoint continua Chat Completions e o modelo padrão é `openai/gpt-oss-120b`, documentado como compatível com Structured Outputs estrito. [Documentação da Groq](https://console.groq.com/docs/structured-outputs).

Não foi encontrado defeito formal em `required`, fechamento de objetos ou serialização do contrato anterior. A mensagem `json_validate_failed` identifica falha de geração/validação da resposta, não demonstra por si só rejeição da definição do schema. Também não demonstra limite de TPM.

Continuam hipóteses, sem comprovação no incidente:

- Interação entre complexidade do contrato, instruções e geração do provedor.
- Saída incompleta dentro dos 2.048 tokens, que também incluem raciocínio.
- JSON malformado ou conteúdo adicional no resultado rejeitado.
- Particularidade do serviço/modelo na geração estrita, apesar de um schema formalmente admitido.

Os valores de `failedJson`, `failedSchema`, `schemaIssues` e demais métricas daquele diagnóstico real não foram fornecidos nesta etapa. Não foi buscado nem registrado seu conteúdo bruto. **Não é possível afirmar qual hipótese causou a falha real.**

## 2. `strict` efetivo e comparação de schemas

| Item | Antes | Depois |
| --- | --- | --- |
| `response_format.type` | `json_schema` | `json_schema` |
| `strict` em código e no JSON enviado | **true** | **true** |
| Nome do schema enviado | `authored_report_v1` | `authored_report_wire_v2` |
| Objetos no schema | 4 | 3 |
| Profundidade máxima de objetos | 3 | 2 |
| Propriedades somadas | 24 | 22 |
| Ramos `anyOf` | 1 | 0 |
| Bytes do schema serializado | 1.759 | 1.449 |
| Enums numéricos | Versão + horizonte | Horizonte |

Não foi afirmado que `anyOf`, null ou enums numéricos sejam proibidos pela Groq. A simplificação retira redundância e trabalho editorial mecânico; é uma alteração controlada para diminuir complexidade, não prova de incompatibilidade desses recursos.

O contrato público/interno do editor V7 **não foi alterado**. Um contrato específico de transporte Groq é reconstruído no servidor para o mesmo documento interno:

```text
Groq: title, sections[], recommendations[], chartIds[], limitations[]
  → validar integralmente o schema de transporte
  → gerar somente IDs, versão, ordem e prioridade editorial padrão
  → converter afirmações ref|relation em referências estruturadas
  → reconstruir proposal/null no contrato interno existente
  → executar a validação factual V7 original
  → revisão humana e PDF existentes
```

Diferenças concretas:

- A IA não precisa escrever `authoredReportVersion`, IDs de seção, `order` e `priority`. São metadados editoriais gerados pelo servidor, sem alterar IDs de indicadores.
- As propostas passam a uma lista `recommendations`, sem a união objeto/null de `proposal` em cada parágrafo.
- As afirmações do transporte usam strings exatas `ref|relation`, por exemplo `E0.delta|decrease`. A conversão é fechada; formato inválido não é corrigido silenciosamente e relações/valores continuam conferidos pelo validador original.
- A interpretação, os títulos, o diagnóstico, as ações, o monitoramento e os planos continuam sendo escritos pela IA. O servidor não substitui essa redação por catálogo ou frases prontas.
- A ordem escolhida nas listas é preservada; inicialmente a narrativa precede as propostas. O editor mantém reordenação, ocultação e prioridade editorial ajustável.
- Todos os objetos enviados permanecem com `additionalProperties: false` e todas as propriedades requeridas. O horizonte continua limitado a `0/30/60/90`.
- Null e zero nos dados de entrada não foram modificados. A eliminação do nullable no **transporte de propostas** não muda os valores dos indicadores; `proposal: null` continua existindo no documento interno quando apropriado.

Garantia deslocada explicitamente: a gramática enviada garante que cada claim é uma string; o delimitador, o enum da relação e a existência da referência são garantidos pelo servidor, não pelo decoder. Isso pode produzir rejeição semântica após HTTP 200, mas não permite exportar uma afirmação inválida. Não se atribui ao schema simplificado uma garantia factual que ele não oferece.

## 3. Prompt, parâmetros e serialização

Foram separados o papel/regras de segurança e instruções compactas do novo transporte, retirando instruções redundantes de IDs/ordem que a IA deixou de produzir. Mantidas referências determinísticas, distinção entre fato/hipótese/sugestão, cuidado financeiro, contexto não confiável, linguagem executiva e ausência de causalidade inventada.

Preservados: modelo `openai/gpt-oss-120b`, `reasoning_effort: medium`, `max_completion_tokens: 2048` por padrão, `temperature: 0.3`, `include_reasoning: false`, timeout de 35 segundos e teto de 6.000 bytes. Não foi acrescentado `reasoning_format`, que não é suportado para GPT-OSS na documentação específica. [Reasoning da Groq](https://console.groq.com/docs/reasoning).

Não houve aumento automático de entrada, saída, TPM ou cotas. A opção manual de 3.072 tokens já existia; na matriz desta entrega ela foi usada somente com mocks.

Antes do fetch de produção, o JSON já serializado é novamente lido. Seu `strict` precisa continuar verdadeiro e o fingerprint do schema serializado precisa ser igual ao fingerprint do schema criado. Divergência impede a chamada. O mesmo corpo medido é enviado à API, sem SDK que reconstrua parâmetros.

Fingerprint anterior, correspondente ao contrato interno que era enviado:

```text
306a44c5a4b195378297d1079157a4d192221de50a097651a97503871d100755
```

Fingerprint do novo contrato Groq:

```text
f9b786abdbe841089a6e31b2d3354c967d6e14f3d5e17bfdddef0e464b386445
```

Nova revisão de diagnóstico: **`v7-groq-strict-wire-2`**. Logs/metadados distinguem o transporte Groq do contrato interno e registram os dois fingerprints. Se aparecer revisão antiga após publicação autorizada futura, investigar a versão efetivamente atendida antes de comparar resultados.

## 4. Segurança e tratamento de falhas

O schema de transporte é validado antes da reconstrução. Depois, o mesmo validador V7 confere escopo, referências, unidades, direção, relações, números e regras textuais auxiliares. Nenhum valor, meta, competência ou estatística é criado na reconstrução. A validação de revisão humana continua usando o contrato interno e relendo a base autorizada.

`failed_generation` só é analisado em memória. O diagnóstico agora pode registrar, sem conteúdo bruto:

- JSON ausente, vazio, inválido, válido ou excessivo.
- Compatibilidade com o schema efetivamente enviado e caminhos sanitizados.
- Estrutura aparentemente incompleta.
- Presença de marcadores de raciocínio ou bloco de código.

“Estrutura incompleta” é apenas um sinal; não comprova que o orçamento causou truncamento. Em resposta 200, o `finish_reason` continua sendo verificado. `length` ou encerramento incompatível não são tratados como relatório completo.

400 de geração, 400 de parâmetros/schema, 429 local, 429 do provedor, timeout e resposta incompatível continuam separados. Não foram criados retries, troca automática de provedor/modelo, recuperação do texto rejeitado ou uso de `strict: false`/`json_object` no caminho Groq autoral. Uma falha mantém o relatório determinístico e a exportação sem IA.

## 5. Medições locais e testes executados

Medições com fixtures fictícias idênticas, sem API:

| Indicadores selecionados | Requisição antes/depois | Entrada estimada antes/depois | Resumos enviados antes/depois |
| --- | --- | --- | --- |
| 1 | 4.359 / 4.181 bytes | 2.244 / 2.155 | 1 / 1 |
| 2 | 4.587 / 4.409 bytes | 2.358 / 2.269 | 2 / 2 |
| 15 | 5.999 / 5.998 bytes | 3.064 / 3.063 | 10 / 11 |
| 40 | 6.000 / 5.999 bytes | 3.064 / 3.064 | 10 / 11 |

O exemplo de resposta simulada com plano de 30/60/90 dias passou de 3.811 para 3.369 bytes no transporte. Isso mede tamanho do exemplo, **não tokens reais, latência ou probabilidade de sucesso da Groq**. A estimativa continua bytes UTF-8/2 + 64, sem tokenizador exato. Resultados: `.validation-tools/groq-v7-strict-wire-audit.json`.

Validação executada:

- Type check Deno da Edge com a configuração do projeto e do protocolo controlado: aprovado.
- Treze suítes locais aprovadas: protocolo A/B/C, compatibilidade Groq, V7, handler V7, handler legado, V5.1, orçamento, analytics, interpretação estruturada, V6.1, PDF V7, pending-state e contratos V3.2. Manifesto: `.validation-tools/groq-v7-strict-wire-tests.json`.
- A/B/C com respostas simuladas válidas, mesmo modelo/prompt/dados/orçamento; comparação do schema criado com o serializado.
- C completo reconstruído no domínio: evidências, propostas e horizontes 30/60/90; números inventados, referências falsas e relações contraditórias rejeitados.
- Matriz offline de 36 combinações: A/B/C × volumes 1/15/40 × prompt neutro/produção × conclusão 2.048/3.072. Nenhuma chamada real dessa matriz.
- Erros 400, 429, timeout, JSON/schema inválido, truncamento, diagnóstico sem vazamento, limite de três tentativas e parada após falha.
- Chrome local com o documento reconstruído: 320 e 1440 px, dois temas, editor/restauração/ordem/ocultação, sessão/filtros/fallback, PDFs Executivo/Completo com 1/15/40, progresso e download único. Log: `.validation-tools/groq-wire-browser.log`.

Resultados de mocks são explicitamente marcados `executionMode: mock` e `productionValidated: false`, mesmo quando o payload é idêntico ao de produção e a validação local passa. O protocolo preparado registra `networkCalls: 0`.

## 6. Protocolo de homologação: até três chamadas manuais

Não foi executado contra a API. O script de preparação não chama a rede, não lê a chave e não acessa Supabase:

```powershell
.\.validation-tools\deno.exe run tests/groq-v7-controlled-protocol.ts --prepare
```

Padrão: dois indicadores fictícios, prompt de produção, conclusão 2.048, raciocínio medium, mesmo modelo. O C usa **o mesmo corpo serializado da geração de produção**, incluindo o nome do schema; `matchesProductionPayload` precisa ser verdadeiro. Cada caso registra schemaHash, serializedSchemaHash, requestHash, dataHash, bytes e perfil.

| Etapa | Schema | Interpretação possível |
| --- | --- | --- |
| A | Título e resumo | Testa a geração estrita mínima com o mesmo ambiente/prompt |
| B | Título, resumo, conclusões e indicadores relacionados | Acrescenta estrutura e referências de escopo |
| C | Narrativa, recomendações, evidências e horizontes sugeridos | Exercita o novo contrato completo e validação V7 |

Somente um operador autorizado, com chave já disponível no ambiente local, pode executar cada comando abaixo. **Não executar todos em sequência automática.** Não copiar chave para arquivo, código, log ou conversa.

```powershell
# Chamada 1 — somente após autorização do operador
.\.validation-tools\deno.exe run --allow-env=GROQ_API_KEY --allow-net=api.groq.com --allow-read=.validation-tools/groq-v7-protocol --allow-write=.validation-tools/groq-v7-protocol tests/groq-v7-controlled-protocol.ts --confirm-live --session v7_homologacao --case A

# Após sucesso de A e cooldown, autorizar a chamada 2
.\.validation-tools\deno.exe run --allow-env=GROQ_API_KEY --allow-net=api.groq.com --allow-read=.validation-tools/groq-v7-protocol --allow-write=.validation-tools/groq-v7-protocol tests/groq-v7-controlled-protocol.ts --confirm-live --session v7_homologacao --case B

# Após sucesso de B e cooldown, autorizar a chamada 3
.\.validation-tools\deno.exe run --allow-env=GROQ_API_KEY --allow-net=api.groq.com --allow-read=.validation-tools/groq-v7-protocol --allow-write=.validation-tools/groq-v7-protocol tests/groq-v7-controlled-protocol.ts --confirm-live --session v7_homologacao --case C
```

O script exige a ordem, impede repetir etapa, limita a três chamadas por sessão e grava a tentativa **antes** do envio. Há lock local, mínimo de um minuto após a resposta e respeito ao `Retry-After` maior. Se uma etapa falhar ou for interrompida, não permite continuar automaticamente; analisar o diagnóstico. Não misturar o probe antigo ou outros clientes nessa sessão. O limite do script não coordena todo o consumo da organização.

Estados/resultados ficam em `.validation-tools/groq-v7-protocol/v7_homologacao.json`, sem Secrets, prompts ou respostas brutas. Não editar o arquivo para contornar limite/cooldown. Um lock residual após encerramento abrupto deve ser inspecionado pelo operador antes de nova autorização; não existe retomada automática de chamada.

Leitura dos resultados:

- A falha: interromper; não concluir que o contrato completo é o culpado. Examinar ambiente, prompt, serviço/modelo e sinais de saída.
- A passa e B falha: a dificuldade começa antes do contrato completo; distinguir schema válido, encerramento e validação das referências.
- A/B passam e C falha: complexidade do contrato completo, carga de saída e interação com o prompt permanecem candidatas; examinar os sinais, sem inventar causa.
- C 200 mas `schemaValid`/`factualValid` falsos: não é homologação funcional.
- C com `finishReason: stop`, validação estrutural/factual, `productionValidated: true` e plano contextual adequado: evidência de geração real bem-sucedida para esse recorte, não garantia para todos os relatórios.

A/B são **somente diagnósticos**, nunca documentos aceitos pelo editor/PDF. O resultado inclui `horizons` e `ninetyDayPlanComplete` no C para avaliar a presença dos horizontes; a qualidade de cada ação ainda exige revisão humana.

Para investigação posterior, há parâmetros explícitos `--prompt neutral`, `--volume 1|2|15|40` e `--completion 2048|3072`. Preparar essas variantes offline é livre de chamadas. Mudar o perfil durante uma sessão é bloqueado. Uma nova experiência real exige outra autorização e planejamento; não há busca automática de configurações. **C com prompt neutro não comprova o payload de produção** e não recebe `productionValidated: true`.

## 7. Arquivos, publicação e preservação

Mudanças de produção nesta rodada:

- `supabase/functions/seguranca-viaria-ia/groq-authoring-wire.ts`: novo schema de transporte e reconstrução.
- `supabase/functions/seguranca-viaria-ia/report-authoring.ts`: integração, prompt, dupla validação e verificação da serialização.
- `supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts`: revisão e sinais estruturais seguros.

Novos testes/protocolo: `tests/groq-v7-controlled-protocol.ts` e `tests/groq-v7-controlled-protocol.test.ts`. Ajustados mocks de V7/handler/compatibilidade e fixtures; o runner de navegador recebeu `--wire` e passou a usar IDs do documento em vez de nomes fixos de fixture.

Nenhum arquivo de produção do frontend, editor, UX V3.2, cálculos, RLS ou persistência foi alterado nesta rodada. As mudanças locais de diagnóstico e status da rodada anterior foram preservadas, não sobrescritas.

Não foi feito deploy. Para publicação futura autorizada, publicar a pasta completa da função, com os **dois auxiliares** `groq-authoring-contract.ts` e `groq-authoring-wire.ts`, além de todos os imports existentes. Não copiar somente `index.ts` e não desabilitar JWT. Não há publicação de frontend nem migração de banco para essa correção. Preferir projeto de homologação.

O protocolo direto permite testar a API antes de qualquer publicação da Edge. Mesmo que passe, a integração no ambiente autorizado ainda deve conferir sessão, leitura do snapshot, revisão humana e exportação sem alterar dados corporativos.

## 8. Rollback e critérios de encerramento

O ponto de restauração foi criado **antes desta rodada** em `.validation-tools/groq-v7-contract-before/seguranca-viaria-ia/`. Ele preserva a revisão anterior `v7-groq-diagnostics-1`, incluindo a distinção de status já implementada.

Rollback local, se decidido pelo responsável:

```powershell
Copy-Item -LiteralPath '.validation-tools/groq-v7-contract-before/seguranca-viaria-ia/report-authoring.ts' -Destination 'supabase/functions/seguranca-viaria-ia/report-authoring.ts'
Copy-Item -LiteralPath '.validation-tools/groq-v7-contract-before/seguranca-viaria-ia/groq-authoring-contract.ts' -Destination 'supabase/functions/seguranca-viaria-ia/groq-authoring-contract.ts'
```

O arquivo novo `groq-authoring-wire.ts` pode permanecer sem referência; não é necessário apagá-lo. Executar type check/regressões após a restauração. Se houve publicação posterior por operador autorizado, a restauração local não muda o servidor: publicar a versão anterior mediante autorização separada. Não restaurar dados, tabelas, RLS ou Secrets, pois não foram modificados.

**Estado final desta entrega:** simplificação e protocolos implementados, testes locais/mocks aprovados, nenhuma chamada real realizada. A causa detalhada do JSON rejeitado original e o sucesso real do contrato novo continuam pendentes de homologação. Não se declarou correção definitiva nem geração autoral real bem-sucedida.
