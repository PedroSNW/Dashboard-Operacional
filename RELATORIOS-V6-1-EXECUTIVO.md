# Relatórios V6.1 — Executivo e Completo

Implementação local em 18/11/2026. Sem deploy e sem alteração de dados, tabelas, RLS, Secrets, direções oficiais ou salvamento corporativo. Ponto de restauração: `.validation-tools/v61-before/`, com a referência Git e os arquivos anteriores. A V6 existente foi ampliada, sem reiniciar a arquitetura.

## Formatos e fluxo

| Aspecto | Executivo — padrão recomendado | Completo — técnico |
|---|---|---|
| Objetivo | Leitura durante a reunião | Conferência e rastreabilidade detalhada |
| Abertura | Parágrafo de síntese e até três avanços, desafios e prioridades | Estrutura documental V6 preservada |
| Resultados | Até seis análises curtas, com evidência numérica apresentada uma vez | Panorama, análises, histórico e estatísticas |
| Gráficos | Até cinco séries relevantes; menos quando não há histórico útil | Todos os gráficos elegíveis da V6 |
| Pontos de atenção | Todos relacionados no quadro, inclusive sem gráfico | Detalhamento e evidências nos apêndices |
| Ações | Problema, ação, área sugerida, prazo e acompanhamento | Plano e propostas integrais do catálogo |
| 90 dias | Investigar/iniciar, executar/acompanhar, avaliar/ajustar | Plano V6 detalhado |
| Apêndices | Não incluídos por padrão | Cadastro, histórico, gráficos complementares e evidências |
| Rastreabilidade | Fonte, snapshot, período, tipo, base de conferência e limites essenciais | Os mesmos elementos e metodologia ampliada |

O seletor fica antes da exportação, na mesma barra dos botões Groq e PDF. A prévia permanece recolhida; ao expandir, reflete o formato selecionado. Trocar o formato reaproveita `managementReport` e `managementSignature`, sem leitura adicional do Supabase, chamada à IA ou invalidação artificial dos filtros. O formato não entra na assinatura analítica nem no contexto gerencial. Durante uma operação incompatível, o seletor fica desabilitado. Os arquivos baixados incluem o formato no nome.

Exportar continua independente da expansão. As imagens são geradas apenas para o formato escolhido e mantêm os índices dos indicadores originais. O progresso é emitido pelo trabalho concluído, sem temporizador de conclusão; chamadas concorrentes continuam produzindo um download. A seleção parcial de gráficos não elimina pontos de atenção: todos são relacionados em um quadro, incluindo indicadores neutros com relevância operacional explicitamente validada.

Não há alegação de conformidade ABNT integral. O Executivo adapta a organização documental para reduzir páginas iniciais; o Completo preserva a estrutura V6, margens, fonte, tabelas, histórico e apêndices. Ambos têm sumário com páginas e links reais. Textos/células extensos continuam paginados.

## Linguagem e exemplos

As narrativas usam valores e diferenças já calculados. Não calculam novas taxas de negócio, somam unidades diferentes ou inventam causas. A frase acompanha a direção oficial, a meta atual, a qualidade do histórico e, quando necessário, a natureza financeira.

| Antes | Depois / comportamento V6.1 |
|---|---|
| “Fora da meta de referência; melhora.” | “O resultado melhorou, mas a meta atual […] ainda não foi alcançada.” |
| “Há avanço entre os extremos.” | Nome, valores e datas aparecem em uma frase: “[…] passou de […] para […]. Houve redução/aumento de […]%.” |
| “Rever as próximas competências do mesmo indicador.” | “Conferir os novos registros com a área responsável, usando a mesma unidade e os critérios validados.” |
| “Investigação do escopo e dos critérios.” | No plano executivo: “Esclarecer o indicador e definir a próxima ação”, indicando quais registros precisam ser obtidos. |
| Saldo menor tratado automaticamente como piora | “A mudança precisa ser avaliada após confirmar se o valor representa saldo ou movimentação financeira; queda de saldo não significa, por si só, piora.” |

Caso fictício testado: ocorrências de 17 para 9, direção menor é melhor e meta zero. A narrativa apresenta redução de **47,06%**, mantém a meta zero e explica que ela não foi alcançada. Não arredondamos esse exemplo para um número factual diferente. Base inicial zero não produz percentual inventado. Um registro isolado não é apresentado como evolução; dois registros e lacunas recebem ressalvas específicas.

Avanços e desafios não repetem os mesmos números quando um indicador melhora e ainda está fora da meta. As iniciativas equivalentes são agrupadas por título, atividades e área, independentemente de IDs ou referências diferentes; os indicadores relacionados são preservados. Objetivos e situações informadas pela gestão continuam separados das propostas, sempre identificadas como sugeridas.

## Leitura conjunta e Groq

A Groq continua principal, com o perfil V5.1 **2.048 tokens / medium**, teto de payload de 6.000 bytes, orçamento de entrada estimada e margem existentes. Chat, Gemini e OpenAI mantêm seus parâmetros. `analytics.js`, `groq-context.js` e `groq-policy.js` permanecem idênticos ao ponto de restauração, conferidos por SHA-256. O timeout, 413, 429/Retry-After, guard, cache, concorrência e logs seguros foram preservados.

O contrato gerencial continua `version: 4`, com os seis campos anteriores obrigatórios. Foi acrescentado **um campo opcional**, aceito pelos três adaptadores:

```json
{
  "jointObservations": [
    {"indicatorIds": ["indice:0", "indice:1"], "relation": "simultaneous"}
  ]
}
```

Esse trecho é uma extensão do objeto completo, não substitui seus campos obrigatórios. Respostas antigas sem o campo continuam válidas. O limite é de dois pares; IDs precisam estar no conjunto enviado, ser distintos e ter pelo menos dois valores válidos e extremos nas mesmas competências. Campos extras, causa livre, relação `causal`, ID inventado e par inconsistente acionam o fallback. Não é permitido que a IA escreva números factuais ou prosa livre nesse contrato.

O renderer transforma os pares aceitos em texto natural e explicita que simultaneidade não comprova causa. Sem pares da IA, a síntese determinística pode relacionar mudanças de sinais opostos com extremos temporais coincidentes, com a mesma ressalva. Não cruza pessoas, registros individuais, denominadores ou bases externas. A seleção de estratégias pelo modelo também continua influenciando o plano, sem aumentar a extensão solicitada.

O `reportBasis` inclui o marcador editorial 6.1 e a versão da política de natureza econômica, além dos dados, contexto e política operacional existentes. Isso impede reutilizar uma base anterior à nova interpretação. O formato de exportação continua fora dessa base, para não repetir análises ao trocar apenas a apresentação. O `reportMeta.reportVersion` permanece 6 e o modelo V6 permanece compatível; a apresentação executiva identifica a edição 6.1.

Não foi consumida a API real. Contagem real de entrada/saída/raciocínio, qualidade da seleção do modelo, latência e cotas reais permanecem não medidas. O aumento pequeno das instruções/metadata compete pelo mesmo orçamento, podendo reduzir a quantidade de indicadores enviada. O fallback e as tabelas preservam o recorte completo. Formato não altera o payload analítico.

## Interpretação financeira

O novo `report-semantics.js` contém `MEASUREMENT_POLICY`: configuração somente de código, inicialmente vazia, com identidade exata (ID, nome, setor), referência e aprovação explícita. Tipos disponíveis: `balance` (saldo), `flow` (fluxo), `rate` (taxa), `quantity` (quantidade). Não são aceitos do payload do usuário nem inferidos como classificação aprovada pelo nome do indicador.

Unidade monetária reconhecida sem natureza validada recebe leitura neutra. Saldo validado também não tem sua queda automaticamente tratada como piora. A direção oficial e os cálculos legados permanecem no snapshot/modelo, para compatibilidade e conferência. A soma aritmética legada pode continuar existindo internamente; **não é enviada como total financeiro à IA nem apresentada como receita/exposição consolidada**. A prévia e o PDF mostram “Não consolidar” para saldo ou valor monetário não classificado. Taxas continuam sem soma. Fluxos/quantidades só recebem a semântica autorizada quando há configuração aprovada.

Criticidade operacional continua independente dessa natureza. Um indicador neutro pode ter relevância operacional se um critério corporativo aprovado a sustentar. Sem esse critério, a classificação permanece pendente, sem gravidade inferida do nome. Nenhum critério de produção foi preenchido ou aprovado nesta implementação.

## Comparação de páginas e integridade

Comparação automatizada com a cópia V6 anterior, **mesmos fixtures e mesmos valores**, sem imagens na composição de medição:

| Indicadores | Contexto | V6 anterior | V6.1 Executivo | V6.1 Completo |
|---|---|---:|---:|---:|
| 1 | não | 9 | 3 | 8 |
| 1 | sim | 9 | 3 | 9 |
| 15 | não | 19 | 5 | 19 |
| 15 | sim | 20 | 5 | 19 |
| 40 | não | 32 | 6 | 32 |
| 40 | sim | 32 | 7 | 32 |

São amostras do tipo comparativo, sem IA e com histórico de doze competências; não são limites de páginas. O contexto compartilhado é fictício e é o mesmo na comparação com a V6. A paginação reserva o bloco curto de metodologia/rastreabilidade para evitar fragmentá-lo entre páginas.

Gráficos reais foram ensaiados separadamente no Chrome, nos dois formatos sobre a mesma prévia, sem contexto e antes de solicitar IA:

| Indicadores | Executivo: páginas / figuras | Completo: páginas / figuras |
|---|---|---|
| 1 | 3 / 1 | 9 / 1 |
| 15 | 6 / 5 | 22 / 11 |
| 40 | 8 / 5 | 42 / 30 |

Os metadados estão em `v61-real-charts-*-layout.json`. O mock de rastreabilidade usa SHA-256, com o mesmo tamanho de identificador da Edge; não utiliza JSON de filtros como se fosse o identificador de produção.

A comparação verifica igualdade integral de `indicators` com a V6 anterior: resultados, metas, direções, ausências e estatísticas calculadas. O Executivo declara expressamente não incluir histórico; seus metadados registram a cobertura de pontos de atenção e a base completa, sem fingir que o histórico foi desenhado. O Completo conserva a cobertura mensal de todos os indicadores e os apêndices.

As estimativas de tokens/bytes estão em `.validation-tools/v61-metrics.json`. A estimativa continua baseada em bytes UTF-8/2 mais overhead, não em tokenizador compatível. O teste exige mensagens até 5.488 bytes (6.000 menos reserva de envelope 512), entrada estimada até 3.100 e exercita os payloads efetivos do handler com mocks. Não há equivalência exata entre caracteres e tokens. Trocar formato gera **zero chamadas adicionais**, portanto não muda o consumo por si só.

Há evidência objetiva de redução de páginas e repetição editorial; não houve avaliação cega por gestores ou comparação da qualidade de respostas reais dos modelos. Clareza percebida e utilidade das recomendações precisam de aceitação humana.

## Testes locais

- **V6.1:** 144 combinações — seis tipos × dois formatos × 1/15/40 indicadores × com/sem contexto × com/sem IA simulada. Mesma base V6, margens A4, sumário, cobertura, nulos, meta zero, saldo/fluxo/neutro, indicadores neutros com relevância operacional aprovada fictícia, deduplicação de ações, narrativa, pares estruturados válidos e inválidos, títulos extensos, orçamento e progresso.
- **V6:** 36 combinações preservadas e casos de contexto, consentimento, assinatura, dimensões e fallback.
- **Handler:** 18 cenários com mocks: três provedores, autenticação, CORS, leitura negada, dados adulterados, 400/413/429, Retry-After, timeout, parsing, contexto, cache, concorrência e logs sem conteúdo sensível.
- **Regressão:** analytics, structured, presentation, reports, reports-v4, reports-v5, pdf, groq-budget, groq-v51, pending-state, theme-preference, v3-static e ia-context executados com aprovação. Os testes V5 incluem células desenhadas, textos/células extensos e imagens reais previamente capturadas.
- **Navegador:** 320, 360, 390, 768, 1024, 1440 e 1920 px, alternando claro/escuro, três quantidades e dois formatos. Troca sem leitura/IA adicional, mesma assinatura, expansão/recolhimento, gráficos corretos, contexto preservado, filtros bloqueando exportação desatualizada, IA válida/inválida/falha, teclado na prévia/contexto, barra sem sobrepor a navegação e ausência de overflow/erros JS. Em 1440 px, seis exportações reais recolhidas com progresso e bloqueio de download duplicado.
- **Type check:** Deno estrito com a configuração do projeto. **Visual:** capturas da interface e páginas dos PDFs fictícios, além das verificações automatizadas de geometria.

Comandos principais na raiz:

```powershell
$env:DENO_DIR='.validation-tools/cache'
.validation-tools/deno.exe check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
.validation-tools/deno.exe run --allow-read --allow-write tests/reports-v61.test.mjs
.validation-tools/deno.exe run --allow-read --allow-write --allow-env tests/edge-handler.test.ts
.validation-tools/deno.exe run --allow-read --allow-write tests/reports-v6-fixtures.mjs
.validation-tools/deno.exe run --allow-read --allow-write tests/reports-browser.ts --v4
.validation-tools/deno.exe run --allow-read --allow-write tests/reports-v6-browser-build.mjs
.validation-tools/deno.exe run --allow-all tests/reports-v6-cdp.ts --v61
```

O navegador usa perfil isolado, CSP sem rede no documento e mocks, sem sessão ou dados de produção. Evidências ficam em `.validation-tools/`, ignorada pelo Git: `v61-metrics.json`, `v61-final-*.log`, `v61-regression.json`, `v61-final-tests.json`, `v61-browser.log`, PDFs/layouts `v61-*` e capturas do harness V6 reutilizado. Não publicar esses arquivos no site.

Os PDFs são efetivamente compostos e serializados nos testes. O callback de download é interceptado para verificar uma chamada por operação; a confirmação de salvamento pelo sistema operacional depende do navegador e não foi declarada como testada. Também há teste de rejeição de pares cuja diferença calculada esteja indisponível, evitando inventar direção de movimento após overflow.

## Arquivos modificados

Frontend:

- `public/index.html`: seletor e carregamento/cache dos assets V6.1.
- `public/style.css`: seletor responsivo e foco visível.
- `public/reports.js`: projeção por formato, reaproveitamento da base, gráficos e exportação.
- `public/report-content.js`: leitura natural também nos resultados do Completo.
- `public/report-pdf.js`: compositor executivo e finalização compartilhada, mantendo o caminho completo.
- **Novo** `public/report-executive.js`: projeção determinística, síntese, leitura conjunta, deduplicação e seleção de gráficos.

Edge Function (`supabase/functions/seguranca-viaria-ia/`):

- `report-intelligence.js`: leitura financeira neutra e versão da política econômica.
- `report-management.js`: contexto financeiro, estratégias seguras e extensão opcional fechada de pares.
- `index.ts`: versão da base de conferência/cache.
- **Novo** `report-semantics.js`: política validada de natureza dos indicadores.
- `README.md`: empacotamento dos oito módulos e compatibilidade.

Testes: novos `tests/reports-v61.test.mjs` e `tests/reports-v61-browser.js`; ajustes no harness `tests/reports-browser.ts`, `tests/reports-v6-browser-build.mjs` e `tests/reports-v6-cdp.ts`. Os testes anteriores não foram substituídos ou apagados.

## Publicação manual — não executada

1. Preserve a versão publicada para reversão e confira o projeto Supabase.
2. Publique primeiro a função `seguranca-viaria-ia` com **oito módulos no mesmo nível**: `index.ts`, `analytics.js`, `groq-context.js`, `groq-policy.js`, `reports.js`, `report-management.js`, `report-intelligence.js`, `report-semantics.js`. Não publicar somente `index.ts`. Preserve as configurações de autenticação e os Secrets atuais.
3. Alternativa CLI, substituindo o identificador: `supabase functions deploy seguranca-viaria-ia --project-ref SEU_PROJECT_REF`. Não executar migrations, alteração de Secrets ou flags que desabilitem a autenticação.
4. Confira uma prévia autenticada sem IA e sem escrita. Depois publique os seis arquivos frontend listados acima nos caminhos correspondentes do hosting atual, preservando os demais assets. O novo `report-executive.js` é obrigatório; os parâmetros de cache são V6.1.
5. Recarregue sem cache. Gere uma prévia, troque Executivo/Completo e confirme que não há nova leitura/chamada à IA. Exporte os dois sem expandir. Faça uma análise Groq somente por solicitação explícita e confirme a preservação dos números. Teste contexto e filtros alterados bloqueando exportação até nova prévia.
6. Se necessário, reverta frontend e função juntos usando a cópia V6 de `.validation-tools/v61-before/`. Não há migração a desfazer.

## Limitações e aceitação pendente

- APIs reais não foram chamadas; tokens reais, latência, cotas e qualidade da escolha de estratégias/pares da Groq permanecem pendentes. Os mocks não certificam o comportamento do serviço externo.
- A política de natureza econômica e a criticidade operacional precisam de critérios corporativos aprovados. Não foi inferida uma classificação oficial por nome nem alterada a direção para corrigir supostos cadastros.
- Não há histórico verificado de metas por competência. As comparações usam a meta atual como referência e registram a limitação.
- O Executivo é uma seleção editorial identificada; não substitui o Completo quando a reunião exigir histórico integral. Gráficos não são produzidos para séries constantes ou insuficientes.
- O contexto permanece efêmero, com consentimento externo separado, sem se tornar prova de execução ou aprovação. O cache autorizado em memória e o guard por instância seguem as limitações documentadas da V5.1/V6; não foi criada coordenação distribuída.
- Acessibilidade foi verificada por teclado/Chrome e layouts, sem certificação com leitores de tela ou dispositivos físicos. Impressão e aprovação editorial devem ser revisadas com recortes reais autorizados, sem escrever em produção.
