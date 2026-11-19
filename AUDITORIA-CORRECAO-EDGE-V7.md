# Auditoria e correção integrada da Edge Function V7

Data: 19/11/2026. Revisão local: **`v7-integrated-validation-5`**.

Implementação e validação locais concluídas. Nenhum deploy, chamada real à Groq, alteração de Secret, credencial, banco, RLS ou dado corporativo foi executado. **A falha real ainda não está definitivamente homologada.**

## Evidência real e limite do diagnóstico

O operador informou Groq HTTP 200, `finish_reason:stop`, entrada 1583, conclusão 2856, total 4439 e limite efetivo 4147, na revisão `v7-groq-dynamic-5120-4`. A aplicação rejeitou com `invalid_authoring_response`.

Essa chamada concluiu abaixo do teto enviado. Não há evidência de truncamento nessa execução. O erro é posterior à resposta do provedor, no caminho de parse/conversão/validação. O código anterior reunia várias rejeições sob a mesma classificação, e o envelope disponível não permite afirmar **qual delas ocorreu naquela resposta específica**. Não foi solicitado nem registrado o texto corporativo bruto para inferir a causa.

Foram reproduzidos defeitos locais concretos, corrigidos abaixo. A próxima homologação poderá distinguir a etapa exata sem expor a resposta da IA.

## 1. Erros confirmados e correções

| Defeito anterior | Correção |
| --- | --- |
| Falhas diferentes após200 viravam `invalid_authoring_response` | Etapas, códigos, categorias, caminhos e contadores específicos no envelope/log |
| Texto acima de1800 caracteres contrariava um limite implícito de runtime não refletido no wire e descartava o documento | Texto preservado para revisão até 12000 caracteres; teto seguro continua bloqueante e diagnosticado |
| Toda seção exigia refs, inclusive hipótese/orientação sem afirmação factual | Qualitativo identificado pode ter refs/claims vazias; alegações factuais continuam exigindo evidência |
| Repetição, proposta incompleta e recomendação genérica eliminavam seções | Avisos de revisão humana, sem descarte automático |
| Títulos e organização eram tratados como falha fatal | Avisos editoriais; títulos vazios recebem rótulo genérico seguro, sem inventar resultados |
| Limitação com “30 dias” falhava por número livre | Horizontes propostos30/60/90 dias permitidos em limitações/campos da proposta; números de resultados continuam bloqueados |
| Algumas negações de causalidade eram identificadas como causalidade afirmada | Tratamento específico de ressalvas negativas; causalidade não demonstrada continua bloqueada |
| Relação desconhecida dentro de string de claim só aparecia como erro interno genérico | Relações validadas na expansão; formato/enum desconhecido produzem `wire_expansion` seguro |
| Espaços em torno de `ref\|relation` podiam provocar rejeição desnecessária | Normalização apenas dos espaços, seguida de validação integral da relação/ref |
| Gráfico podia referenciar indicador do relatório não enviado ao modelo | Validação de gráficos usa também `allowedRefs`, como as seções |
| `analytics.js` considerava R$ somável pela unidade | Natureza financeira deve ser aprovada pela política em código; saldo/desconhecido não somam |
| `latest` usava o último valor válido, mesmo com lacuna final | `latest` representa a competência final; `lastValid` é separado e datado |

No período de implementação, o teste de conversão isolada apontou a necessidade de declarar a dependência do core no próprio módulo wire; o import foi incluído e o grafo final foi verificado. O teste de navegador ampliado também foi corrigido para fechar seu diálogo de PDF antes de testar foco. Esses testes passaram após os ajustes; o comportamento do diálogo da aplicação não foi alterado.

## 2. Classificação e garantias

**Bloqueantes:** schema incompatível/perigoso, IDs inválidos/duplicados, referências inexistentes/fora do envio, claims sem sustentação ou contraditórios, números factuais livres, comparação observada sem claim válido, julgamento financeiro sem direção/natureza, conteúdo inseguro, comandos/instruções indevidos e gráficos fora do escopo enviado.

**Revisão humana:** texto longo, repetição, proposta recuperável, recomendação pouco específica ou genérica e proposta ausente em seção de recomendação. O documento continua acessível; essas observações não significam aprovação institucional nem validação semântica integral da prosa.

**Editorial:** títulos, ordem, referências repetidas e organização. A ordem é normalizada, títulos vazios recebem rótulos neutros e os avisos permanecem disponíveis. Não há corte silencioso de texto.

`valid:true` significa ausência de bloqueantes e presença de conteúdo aproveitável. Avisos de revisão/editoria podem coexistir com isso. Toda geração continua com `reviewRequired:true`, exige confirmação humana e revisão local antes da exportação autoral. A revisão no servidor retorna os avisos, mesmo quando a estrutura e os fatos são aceitos.

Quando há partes inválidas e partes válidas, somente as partes aprovadas permanecem, com `partial:true`, contagem de seções rejeitadas e avisos explícitos. O documento original não é promovido a “integralmente validado”. Afirmações bloqueadas não chegam ao editor/PDF como resultados verificados. Sem seções aproveitáveis, ou com bloqueante global, a aplicação retorna erro e preserva a base determinística/exportação sem IA.

Limitação importante: referências, valores e claims estruturados são verificados matematicamente. A prosa livre continua sendo interpretação sujeita a revisão, com filtros conservadores para afirmações observadas, números e segurança. Não existe garantia automática de validação semântica de todas as frases em linguagem natural. Nunca tratar o texto qualitativo como auditoria factual independente.

## 3. Contratos e conversão

O **schema JSON externo WireV2 permanece inalterado**: objetos fechados (`additionalProperties:false`), todos os campos obrigatórios, arrays de seções/recomendações, claims como strings e propostas sem aninhamento adicional. `strict:true` e modelo 120b foram preservados. O modo estrito verifica o contrato JSON enviado; a política factual/editorial da aplicação é uma camada adicional. [Structured Outputs da Groq](https://console.groq.com/docs/structured-outputs).

O schema interno também preserva sua forma e `authoredReportVersion:1`: IDs, ordem, prioridade, claims como objetos e propostas aninhadas. O conversor gera IDs únicos `section_N`/`proposal_N`, ordem sequencial e prioridade editorial, sem inventar evidências. Todos os campos da proposta, incluindo fundamentos, monitoramento e horizonte, são mantidos. Strings de claim são separadas em duas partes; apenas espaços são normalizados. Relação desconhecida ou formato ambíguo é rejeitado, não reinterpretado.

Regras alinhadas no prompt e no runtime:

- Arrays vazios quando não há base; refs vazias só em conteúdo qualitativo identificado sem afirmação de resultado.
- Resultados de indicadores exigem refs válidas, claims verificáveis e placeholders para valores.
- Como o wire de recomendações não possui claims próprios, recomendações expressam propostas; comparações observadas devem ficar nas seções com claims.
- Limitações podem conter horizontes propostos, não estatísticas inventadas.
- Até6 entradas é preferência editorial, não motivo de descarte. Mais de10 seções gera aviso; proteção total de40 seções internas/40 itens por array permanece. O prompt informa o teto total entre seções e recomendações.
- Texto acima de1800 caracteres é revisável; acima de12000 por campo continua incompatível com o limite seguro da aplicação. Resposta máxima128 KiB; corpo de revisão mantém o limite existente. Não há ampliação arbitrária desses limites nem reparo de JSON.
- IDs e referências não são criados a partir de inferências da IA. Gráficos só usam indicadores do pacote efetivamente enviado.

O editor foi alterado apenas para interpretar avisos, tratar seções sem refs sem mostrar `{{undefined}}`, normalizar títulos pela mesma validação e manter a confirmação humana. Estilos, formatos e diagramação dos PDFs não foram modificados.

## 4. Diagnóstico pós-HTTP 200

| `validationStage` | Exemplos de `validationCode` |
| --- | --- |
| `response_parse` | `provider_body_invalid_json`, `content_invalid_json`, `provider_envelope_incompatible`, `incomplete_generation`, `response_too_large` |
| `wire_schema_validation` | `wire_schema_incompatible` |
| `wire_expansion` | `wire_claim_syntax`, `wire_claim_relation` |
| `internal_schema_validation` | `internal_schema_incompatible`, `schema_invalido` |
| `evidence_validation` | `evidencia_inexistente`, `afirmacao_inconsistente`, `numero_livre`, `comparacao_sem_afirmacao_estruturada`, `grafico_inexistente` |
| `editorial_validation` | `accepted` ou avisos como `repeticao`, `recomendacao_generica`, `proposta_incompleta`, `texto_longo` |

Também disponíveis: `validationCategory` (`blocking`, `review`, `editorial`, `accepted`), `validationPath`, `acceptedSectionsCount`, `rejectedSectionsCount`, `reviewableIssuesCount`, `fatalIssuesCount`, `contractRevision`, `diagnosticId` e as métricas anteriores de orçamento/uso/latência/encerramento.

Nos erros, o resumo aparece no envelope e nos logs com os mesmos valores. Em sucessos e revisões, fica em `validation`. Contadores são de grupos de problemas/seções, sem nomes ou textos das seções. Caminhos são compostos por nomes do contrato e índices; propriedades arbitrárias viram `?`. Por exemplo, um campo extra privado resulta em `$.?`, sem seu nome. IDs modelados não são usados como caminhos técnicos.

Exemplo sanitizado de rejeição local, validado por mock do handler:

```json
{
  "httpStatus": 502,
  "errorOrigin": "response_validation",
  "providerStatus": 200,
  "errorCode": "wire_schema_incompatible",
  "validationStage": "wire_schema_validation",
  "validationCode": "wire_schema_incompatible",
  "validationCategory": "blocking",
  "validationPath": "$.sections",
  "acceptedSectionsCount": 0,
  "rejectedSectionsCount": 0,
  "reviewableIssuesCount": 0,
  "fatalIssuesCount": 1,
  "contractRevision": "v7-integrated-validation-5"
}
```

O `diagnosticId` real é gerado por solicitação, não fixado no exemplo. Contagens de uso informadas pelo provedor são preservadas mesmo se a aplicação rejeitar. Uso ausente permanece null; não há extração de valores de texto bruto nem consumo zero fictício. HTTP 400/429 mantêm suas distinções e não ganham retries. Timeout e resposta grande continuam falhas seguras.

Uma exceção inesperada após HTTP 200 conserva a etapa ativa e recebe `validation_runtime_failure`, sem expor a mensagem bruta da exceção. Esse caminho foi testado com stream de resposta interrompido. Falha de leitura/execução não é apresentada indistintamente como erro factual ou limite de tokens.

## 5. Financeiro e lacunas finais

`analytics.js` importa `measurementAssessment` e a política existente de `report-semantics.js`. Não lê classificação financeira do cliente, do modelo ou de campos livres do snapshot. O catálogo aprovado em código continua vazio; nenhum indicador real foi reclassificado.

Comparação fictícia registrada em `tests/financial-v7-before.json`, valores `[80,null,40]` em R$:

| Estatística | Antes | Depois |
| --- | ---: | ---: |
| Soma sem natureza validada | 120 | null/não aplicável |
| Média | 60 | 60 |
| Variação entre extremos válidos | -40 | -40 |
| Valores/competências/meta/direção | Originais | Idênticos |

O teste compara todas as propriedades anteriores das estatísticas, permitindo alteração somente de `soma`/`somaAplicavel` nesse caso. Política fictícia aprovada como saldo continua não somável; como fluxo permite120; sem aprovação volta a não somável. Quantidades, taxas, média, extremos, sequências, ausências, zeros, metas e competências retroativas passaram nas regressões. A matriz V6.1 compara a base anterior com uma única exceção explícita para essa correção monetária.

Para `[5,2,null]` entre Jan/Fev/Mar, `latest` é `{competency:Mar,value:null}`, e `lastValid` é `{competency:Fev,value:2}`. Não se julga a meta da competência final usando o valor anterior. A variação histórica entre os dois valores válidos continua -3, identificada pelo período real. O contexto só envia `lastValid` adicional quando há lacuna final, evitando duplicar o mesmo valor quando a competência final está preenchida.

Após publicação, gerar nova base: a assinatura inclui os resultados calculados, e a proteção de prévia desatualizada deve bloquear bases antigas quando aplicável. Não há alteração de dados persistidos.

## 6. Orçamento e segurança preservados

Alvo5120; margem padrão800; teto local8000 TPM; piso de conclusão 4096; orçamento dinâmico, saldos conhecidos, limites separados quando configurados, cooldown, cache e exclusão de concorrência preservados. `strict:true`, `medium`, `include_reasoning:false` e validação factual permanecem. Não há novos Secrets obrigatórios ou mudança de cota.

O prompt recebeu regras de contrato/qualitativo e correções de contexto, sem reduzir a profundidade solicitada. O limite de bytes continua6000 e a cobertura parcial permanece explícita. Na fixture de dois indicadores, o payload atual mede5069 bytes, estima2599 tokens de entrada e reserva4601de conclusão + 800de margem, total 8000. Em seleções15/40/75, a seleção atual envia7indicadores, com5998 bytes, estimativa3063 e conclusão 4137. São medidas de fixtures locais, não contagens da chamada real.

A estimativa por bytesUTF-8/2+64 inclui schema e todas as mensagens, mas não é tokenização real. O exemplo real fornecido consumiu4439 tokens, abaixo da reserva. Reservar o máximo não significa consumir esse máximo. Raciocínio informado é acompanhado sem soma dupla ao total. Proteção por instância não equivale a coordenação de toda a organização; continuam valendo os limites reais do provedor e `Retry-After`.

## 7. Testes realizados

| Teste | Resultado |
| --- | --- |
| Deno type check da Edge com configuração do projeto | Passou |
| Type check dos testes/roteiros modificados verificados | Passou |
| Sintaxe JS dos arquivos compartilhados/editor/teste de navegador | Passou pelo parser Deno/V8 |
| `edge-v7-integrated.test.ts` | 15 grupos; cobre os 13 cenários solicitados, diagnóstico, finanças, lacunas e privacidade; passou sem rede |
| `edge-v7-module-graph.test.ts` | 12 módulos locais/imports e espelho frontend/Edge; passou |
| `groq-v7-output-budget.test.ts` | 14 grupos,5120, ajustes,reservas,concorrência,HTTPs,timeout; passou |
| `groq-v7-controlled-protocol.test.ts` | Passou com mocks; não executado ao vivo |
| `groq-v7-compatibility.test.ts` | 8 grupos; passou |
| `reports-v7.test.ts` | 14 grupos, três provedores, factual, revisão e fallback; passou |
| `reports-v7-edge.test.ts` | Handler real com auth/RLS/transporte simulados; passou, inclusive Groq 200→erro local com diagnóstico |
| `edge-handler.test.ts` | Passou |
| `groq-v51.test.mjs` | Passou |
| `groq-budget.test.mjs` | Passou |
| `analytics.test.mjs` | Passou |
| `reports-v61.test.mjs` | 144 combinações; passou com comparação e correção monetária explícita |
| `reports-v7-pdf.test.mjs` | 18 combinações, Executivo/Completo; passou |
| `pending-state.test.mjs` | Passou |
| `ux32-static.test.mjs` | Passou |
| Chrome offline320/1440px, claro/escuro | 4 cenários passaram; editor, referências, revisão, avisos, qualitativo,30 dias, teclado, sessão, filtros, fallback, PDFs e downloads únicos |
| `git diff --check` | Passou |
| Nova Groq real, servidor/editor/PDF integrados | **Não executada; depende de autorização/publicação em homologação** |

Os testes de navegador usam frontend e biblioteca PDF reais, com fixtures fictícias e backend simulado. Houve exportação dos dois formatos também após revisão de seção qualitativa/recomendação com avisos. Não equivalem a teste real da Groq nem a validação de conteúdo corporativo.

Resultados em `.validation-tools/edge-v7-integrated-results.json`, `.validation-tools/edge-v7-integrated-suites.json`, `.validation-tools/edge-v7-module-graph.json`, `.validation-tools/groq-v7-dynamic-results.json` e `.validation-tools/v7-browser-smoke-results.json`.

## 8. Arquivos alterados e necessários

Publicação da função completa, preservando os **12 módulos** listados no README; os que foram corrigidos nesta tarefa:

- `analytics.js`: política de elegibilidade financeira.
- `report-authored-core.js`: categorias, fatos, qualitativo, limites e `latest`/`lastValid`.
- `groq-authoring-wire.ts`: import explícito do core, conversão segura e prompt alinhado.
- `groq-authoring-contract.ts`: revisão e resumo sanitizado.
- `report-authoring.ts`: etapas específicas, contexto, resposta/revisão com avisos.
- `report-intelligence.js`: exposição explícita de `recent` junto do último válido.
- `reports.js`: julgamento da meta recente sem preencher lacuna com último valor válido.
- `index.ts`: propagação dos novos diagnósticos no envelope.
- `README.md`: inventário, configuração, fluxos de API, testes, logs e operação.

Frontend necessário: `public/report-authored-core.js` (espelho byte a byte) e `public/report-authoring.js` (interpretação dos avisos e qualitativo). Nenhuma mudança no desenho do PDF, banco, RLS, indicadores, relatórios persistidos ou salvamento.

Testes novos: `tests/edge-v7-integrated.test.ts`, `tests/edge-v7-module-graph.test.ts`, `tests/financial-v7-before.json`. Testes ajustados: `groq-v7-output-budget.test.ts`, `groq-v7-homologation-dynamic.ts`, `reports-v7.test.ts`, `reports-v7-edge.test.ts`, `reports-v61.test.mjs`, `reports-v6-browser-build.mjs` e `reports-v7-browser.js`.

## 9. Publicação e homologação controladas

1. Não publicar automaticamente. Selecionar projeto/frontend de homologação, guardar a versão anterior e reservar janela sem outras análises Groq, respeitando cooldown e limites da conta. Conferir configuração existente5120/margem 800. **Nenhuma alteração de Secret é necessária por esta auditoria.**
2. Publicar a pasta completa da função, mantendo todos os imports locais e a autenticação. Com CLI já instalada/autenticada, a partir da raiz:

   ```powershell
   supabase functions deploy seguranca-viaria-ia --project-ref <REF_HOMOLOGACAO>
   ```

   Esse comando não foi executado. Não publicar somente `index.ts`, não usar `--no-verify-jwt`, não mudar RLS/Secrets/credenciais. Publicar os dois JS frontend de homologação pelo fluxo habitual do projeto. Evitar gerações enquanto houver versões mistas: o core anterior pode rejeitar qualitativo/texto longo válido nesta revisão.
3. Gerar nova base sem IA com dados fictícios existentes. Conferir snapshot, período, indicadores e sessão. A base pode ser exportada sem IA antes de qualquer teste do provedor.
4. Depois de autorização explícita, escolher **uma única forma** de gerar. Para homologar servidor+editor+PDF com a mesma resposta, preferir o frontend: clicar uma vez na geração autoral, sem retries. Não executar também o roteiro API. Se for escolhido `tests/groq-v7-homologation-dynamic.ts`, seguir o roteiro anterior de confirmação de projeto/limites, sabendo que ele testa a API e não importa a resposta no editor; o teste integrado permanecerá pendente.
5. Na resposta e logs, conferir `contractRevision/deploymentRevision:v7-integrated-validation-5`, modelo 120b, alvo configurado5120, limite efetivo coerente com reserva, Groq 200/stop, uso e latência quando informados. Em sucesso, conferir `validation`: contagem de seções aceitas positiva, nenhuma afirmação bloqueante retida, avisos corretamente classificados. `strict:true` não substitui esses testes.
6. Abrir o editor, confirmar seções qualitativas e avisos de revisão, conferir valores projetados pelas evidências oficiais e preencher/refinar o que for necessário. Nenhuma recomendação deve ser apresentada como ação aprovada ou causa comprovada. Confirmar a revisão humana e salvar somente a revisão local; essa operação não chama Groq novamente.
7. Exportar **Executivo e Completo** sem nova geração de IA. Conferir títulos, evidências, limitações, paginação, gráficos, progresso e um download por ação. Confirmar que o relatório sem IA continua acessível e que não houve alteração no estado de salvamento corporativo.
8. Se o provedor retornar200 e a aplicação rejeitar, coletar somente etapa/código/categoria/caminho sanitizado/contadores, ID diagnóstico, revisão, limites, uso/latência/encerramento. Parar; não enviar a resposta bruta, não repetir automaticamente nem desativar validação para obter200.

**Critério de encerramento da falha real:** nova Groq 200, conteúdo seguro aceito pelo servidor, revisão disponível no editor e PDF exportado corretamente. Os mocks e os defeitos reproduzidos não substituem esse critério.

## 10. Rollback e limitações

Backup anterior da função e dos dois JS frontend: `.validation-tools/v7-integrated-before/`. Se necessário, o operador restaura o conjunto anterior e republica somente após autorização, mantendo versões frontend/Edge compatíveis. Preservar diagnósticos da tentativa e voltar ao relatório determinístico enquanto a homologação estiver pendente. Nenhum Secret ou dado foi alterado; não há rollback de banco.

O rollback também restaura os limites editoriais excessivos e a elegibilidade monetária antiga; é contingência, não correção desses defeitos. Não alterar dados financeiros para disfarçar a diferença de cálculo. Bases antigas devem ser regeneradas conforme a versão ativa, preservando a proteção por assinatura.

Continuam pendentes a identificação da causa específica da resposta corporativa anterior e a validação de qualidade com uma geração real. Não houve acesso à configuração remota publicada nem confirmação de limites adicionais específicos da conta. A proteção local é por instância, e a interpretação qualitativa exige revisão humana.
