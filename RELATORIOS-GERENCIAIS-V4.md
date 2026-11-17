# Relatórios Gerenciais D'Granel V4

Implementação local em 17/11/2026. Restauração: branch `backup/reports-v4`, commit `c0a4de3` (versão atual do workspace antes desta tarefa). Nenhum deploy, migração, alteração de RLS/Secrets ou escrita em produção foi realizado.

## Resultado e arquitetura

O relatório passa a conter diagnóstico por indicador, pontos de atenção, síntese, plano de ação, campanhas educativas e propostas de comunicação. Capa, paleta, fontes, gráficos, tabelas, cabeçalhos e rodapés institucionais foram preservados. A ampliação de conteúdo aumenta a quantidade de páginas quando necessário.

O fluxo permanece autenticado: usuário → Edge Function → leitura de `dashboard_state` com JWT/RLS → cálculos existentes → relatório. A geração da prévia não consulta provedores. O aprofundamento é opcional e explícito, com Groq como padrão e Gemini/OpenAI disponíveis. Exportar utiliza somente o conteúdo já recebido; não consulta provedores ou grava dados.

`analytics.js`, suas fórmulas e `groq-context.js` não foram alterados. O relatório numérico continua com todos os indicadores do recorte e a mesma semântica de filtros. O plano não executa ações, cria alertas, publica materiais ou atribui responsáveis aprovados.

## Conteúdo gerencial

Cada diagnóstico utiliza estatísticas já calculadas: último valor válido/competência, meta, média, extremos, quantidade de ausências, variação entre primeiro/último valor válido, competências fora da meta e maiores sequências descritivas de melhora/piora. Ausências, neutralidade, direção indefinida e meta ausente mantêm suas limitações. Não se atribui criticidade por nome, setor ou unidade.

Os pontos de atenção reutilizam `critical` e `criticalReason`, derivados de meta/direção e evolução descritiva no construtor anterior. A prioridade proposta “Alta” só ocorre a partir desses critérios; não significa causa identificada nem classificação técnica de gravidade de um evento individual.

Cada ação contém título, problema/oportunidade, indicador relacionado, evidência, objetivo, procedimentos sugeridos, público, área responsável sugerida, prioridade, prazo proposto, monitoramento, critério de avaliação e observações. Os campos são propostas sujeitas à avaliação da empresa. Não há nomes de responsáveis, promessa percentual de eficácia ou ações apresentadas como executadas.

| Tipo | Limite de ações distintas antes de agrupar repetições | Foco/prazo proposto |
| --- | --- | --- |
| Executivo | 3 | Decisões e próximo ciclo de gestão. |
| Mensal | 3 | Tratativas e próximo acompanhamento mensal. |
| Trimestral | 4 | Persistência e próximo ciclo trimestral. |
| Anual | 5 | Prioridades históricas e planejamento do ciclo anual. |
| Comparativo | 4 | Períodos/indicadores comparáveis. |
| Crítico | 5 | Avaliação dos pontos de atenção identificados. |

Ações repetidas de mesmo tema/prioridade são agrupadas, preservando indicadores e evidências. Campanhas e conteúdos repetidos também são consolidados. O plano é priorizado, não uma lista exaustiva de intervenções para cada indicador; a cobertura numérica permanece completa.

## Estrutura compacta e validação da resposta

Para controlar tokens e impedir afirmações inventadas, o provedor escolhe referências e estratégias de um catálogo validado, em vez de repetir estatísticas ou escrever campos operacionais livres. Exemplo ilustrativo de contrato (não é dado real):

```json
{
  "executiveDiagnosis": [{"indicatorId": "indice:0", "stat": "ultimo"}],
  "priorityRisks": [{"indicatorId": "indice:0"}],
  "actionPlan": [{"indicatorId": "indice:0", "strategy": "defensiva"}],
  "campaignSuggestions": [{"indicatorId": "indice:0", "strategy": "distracao"}],
  "communicationSuggestions": [{"indicatorId": "indice:0", "strategy": "distracao", "channel": "stories", "format": "cards"}],
  "limitations": ["agregados", "causalidade", "revisaveis"]
}
```

O servidor verifica estrutura, limites de listas, IDs efetivamente enviados, estatísticas permitidas, correspondência temática, neutralidade e fundamento dos riscos. Campos adicionais como números, causas, evidência textual ou mensagens públicas arbitrárias são rejeitados. Se faltar plano válido, houver referência inválida, JSON inválido ou truncamento, o conjunto complementar usa o fallback seguro. A validação não depende de regex de prosa livre.

Referências numéricas são resolvidas pelo servidor a partir do relatório calculado. Os campos completos das ações são compostos a partir do catálogo e do tipo de relatório. Isso é uma limitação deliberada: a Groq seleciona e organiza propostas contextualizadas; não redige procedimentos operacionais irrestritos. Novas estratégias e mensagens requerem ampliação revisada do catálogo. O catálogo atual cobre velocidade, condução defensiva/sinistros, documentação, infrações, distração, fadiga, qualidade, governança e acompanhamento.

Os três provedores utilizam o mesmo contrato. JSON mode reduz erros de formato, mas não substitui a validação: a própria [documentação Groq](https://console.groq.com/docs/structured-outputs) distingue JSON válido de conformidade com o esquema. OpenAI usa `text.format` na [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create); Gemini usa o MIME JSON do [generateContent](https://aistudio.google.com/api-reference/generate-content). Compatibilidade com os modelos/contas reais ainda requer homologação.

## Campanhas, comunicação e confidencialidade

As bases são explícitas:

- **Baseada em indicador:** proposta associada ao resultado observado; não confirma causas individuais.
- **Preventiva geral:** distração/celular ou fadiga, quando pertinentes ao escopo viário; não se afirma que causaram os resultados.
- **Requer investigação:** encaminhamento de acompanhamento sem atribuição causal.

Os nomes dos indicadores servem apenas para pertinência temática das propostas; a criticidade continua vindo dos resultados e da direção cadastrada. Indicador neutro não recebe campanha específica como se tivesse desempenho ruim. Ausência de dados prioriza qualidade; direção/meta não configuradas priorizam governança.

Cada sugestão de comunicação apresenta tema, objetivo, público, canal, formato, mensagem, chamada, relação preventiva, período proposto e limites. Há feed, stories, Reels e comunicação interna, em cards, vídeo ou mensagem. Os textos públicos vêm do catálogo e não incorporam valores, nomes, locais ou registros operacionais. Não foram criadas integrações com Instagram nem publicações automáticas.

Não são propostas datas comemorativas específicas ou calendários legais sem verificação externa. Descanso/jornadas são tratados genericamente conforme exigências aplicáveis e procedimentos internos; não se inventam durações legais ou prescrições.

## Fallback e consistência

A prévia inicial já recebe plano preventivo sem consulta ao modelo. O fallback escolhe poucas propostas pertinentes, por prioridade e tema, com evidências calculadas. Não depende de Secrets ou disponibilidade do provedor.

Falha HTTP, timeout, autenticação expirada, JSON inválido, saída truncada ou ausência de plano não invalida os números. Erros de provedor preservam a prévia e as propostas existentes. O frontend valida a estrutura antes de substituir conteúdo; utiliza `textContent`, sem inserir resposta como HTML.

Cada relatório recebe um SHA-256 `basis` do tipo, setor, competências e indicadores calculados. O aprofundamento envia `expectedReportBasis`, além de `expectedUpdatedAt`; mudança de base resulta em 409. O frontend também confere a base recebida antes de aplicar o plano. Isso mantém propostas e números associados à mesma prévia, inclusive quando não há timestamp no fixture legado.

Há cache em memória de aprofundamento aceito por seleção/base/provedor. Repetir o clique não gera outra consulta para a mesma chave. Gerar nova prévia ou mudar o provedor permite outra solicitação explícita. Não há retry automático de relatório em nenhum dos três provedores; o chat mantém seu comportamento anterior. O cooldown de 429/retry-after e os erros específicos 413/400/timeout da Groq foram preservados.

## Apresentação, prévia e PDF

Foram removidas as frases visuais “IA utilizada/não utilizada”, “utilizada como apoio interpretativo” e “análise determinística” usadas como indicação de execução. Metodologia, incertezas, origem, limitações e rastreabilidade continuam. `aiUsed`, dados de execução, uso de tokens e `management.audit` permanecem no contrato técnico; não são exibidos como selo no relatório.

`public/report-content.js` fornece uma única projeção de seções/linhas usada pelo HTML e pelo PDF. Ordem: resumo → diagnóstico/pontos de atenção → indicadores/gráficos/tabelas → síntese → plano → campanhas/comunicação → metodologia/rastreabilidade. A prévia mantém os detalhes de séries expansíveis e cards com acento institucional.

O compositor conserva A4, margem, paleta, tipografia e rodapés. Títulos passam por quebra de linha; parágrafos extensos continuam em páginas subsequentes, com espaço reservado para rodapé. Tabelas preservam cabeçalho de continuação e divisão de linhas existente. Recomendações não são cortadas para caber numa página.

## Progresso real

O gerador síncrono e o assíncrono continuam usando o mesmo compositor. Foram adicionados callbacks por bloco de diagnóstico e por bloco de propostas, mantendo os callbacks por indicador e por página finalizada:

| Faixa | Trabalho concluído |
| --- | --- |
| 0–10% | Validação e bibliotecas. |
| 10–45% | Gráficos efetivamente preparados. |
| 45–52% | Blocos de diagnóstico compostos. |
| 52–78% | Indicadores/tabelas compostos. |
| 78–88% | Síntese, plano, campanhas e comunicação compostos. |
| 88–94% | Páginas finalizadas. |
| Indeterminado | Serialização do documento. |
| 97–100% | Blob pronto e acionamento único de download. |

São pesos de trabalho, não estimativas de duração. A UI recebe oportunidades de renderização entre callbacks; uma tabela/bloco individual muito longo e a serialização ainda podem bloquear temporariamente a thread. Não existe avanço de percentual por relógio. A exportação não consulta a Groq.

## Orçamento e custo

Os tetos Groq anteriores permanecem: entrada estimada 3.500 tokens, margem 400, saída/raciocínio 1.200 tokens e corpo máximo 6.000 bytes UTF-8. A reserva do envelope é de 512 bytes. São limites locais de engenharia, não cotas oficiais do plano ou garantia de tokens reais.

A estimativa utiliza bytes/2 + overhead; não há tokenizador oficial integrado. Sistema e todas as mensagens entram na conta. O corpo serializado final é medido antes do fetch. O contexto usa resumos calculados, sem séries mensais duplicadas, e prioriza indicadores com atenção. A cobertura parcial é explícita na síntese; tabelas e diagnóstico completos não são reduzidos. Se nenhum indicador couber, o fluxo retorna as propostas seguras sem chamar o provedor.

Amostra final executada: 40 indicadores, 12 competências, 10 indicadores enviados e 30 omitidos do contexto complementar; requisição de **5.443 bytes**, estimativa de **2.708 tokens**, teto de saída **1.200**. A cobertura do PDF permaneceu nos 40 indicadores. Esses resultados variam com tamanho dos nomes, unidades e metadados.

OpenAI e Gemini passam a ter teto de saída de 1.200 tokens somente no caminho de relatórios; suas configurações do chat não foram ampliadas. Filtros, prévia, renderização e exportação não consomem cota do provedor. Modelos, preços e limites efetivos da conta não foram consultados com credenciais reais.

## Arquivos

Backend:

- Novo `supabase/functions/seguranca-viaria-ia/report-management.js`: diagnóstico, catálogo, validação, fallback e contexto compacto.
- Modificados `reports.js` e `index.ts` nessa pasta: integração, base do relatório e contratos de provedor.
- `analytics.js` e `groq-context.js` permanecem inalterados.

Frontend:

- Novo `public/report-content.js`: validação/projeção compartilhada.
- Modificados `public/reports.js`, `public/report-pdf.js`, `public/pdf-progress.js`, `public/index.html` e `public/style.css`.
- `main.js`, salvamento, sidebar e estado persistido não foram alterados.

Testes: novos `tests/reports-v4.test.mjs`, `tests/reports-v4-browser.js`; atualizados os testes PDF/browser/CDP, handler, sintaxe e os harnesses que extraem trechos TypeScript da Edge. Não foram alteradas as expectativas dos cálculos numéricos.

## Testes e resultados

| Verificação | Resultado |
| --- | --- |
| `deno check` com `supabase/functions/deno.json` | Passou, usando cache local. |
| `reports-v4.test.mjs` | Passou: seis tipos, números imutáveis, meta zero/nulos/neutro, JSON válido/inválido, campos ausentes, ausência de ações, referência falsa, prosa/causa inventada rejeitada e fallback. |
| Propostas e comunicação | Passou: preventiva geral para distração, evidência referenciada, prazos propostos, mensagens públicas sem conteúdo arbitrário do modelo, qualidade de dados e recorte vazio. |
| Handler completo | Passaram 14 cenários mockados, incluindo relatório V4 válido em Groq/OpenAI/Gemini, base obsoleta, JSON inválido, limite de saída e timeout; autenticação/CORS/erros 400/413/429 preservados. |
| `reports.test.mjs` | Passaram mensal, trimestral, anual, executivo, comparativo e crítico; filtros, nulos, meta zero, neutralidade e snapshot imutável. |
| `pdf.test.mjs` | Passaram um indicador, curto com plano (4 páginas), longo com plano (12 páginas), narrativa legada longa e callbacks. |
| PDF V4 com dezenas | Passou com 40 indicadores em 43 páginas. |
| Recomendações extensas | Passou em PDF de 10 páginas com marcador no final da tratativa e cabeçalhos em todas as páginas. |
| Chrome `--reports-v4` | Passou em 320/360/390/768/1024/1440/1920, alternando temas: cinco gráficos reais, prévia/plano/campanhas, resposta válida/inválida, preservação na falha, HTML como texto, cache, exportação sem consulta e estado persistível intacto. |
| Chrome `--v3` | Passaram progresso monotônico, callbacks, download único, erros de biblioteca/imagem/renderização, restauração, navegação, gráficos/KPI, filtros, edição e CSV/salvamento simulados. |
| Analítica/IA | Passaram `analytics`, `structured`, `presentation`, `ia-context` e `groq-budget`. |
| Estado/tema/sintaxe | Passaram `pending-state`, `theme-preference` e `v3-static`: 190 IDs preservados, dez scripts analisados e seis pares de contraste. |

Os harnesses antigos que extraem snippets do TypeScript precisaram receber `reportCompact=null` e tratar a nova anotação de tipo. As falhas intermediárias eram de montagem desses testes; os testes compilados do handler já passavam e as suítes extraídas foram corrigidas e reexecutadas.

Artefatos locais ignorados pelo Git:

- `.validation-tools/report-v4-dozens.pdf`
- `.validation-tools/report-v4-actions.pdf`
- `.validation-tools/report-v4-plan-page.png` (página renderizada com Ghostscript para inspeção)
- `.validation-tools/reports-v4-{320,360,mobile,768,1024,desktop,1920}.png`

As capturas usam dados fictícios. `mobile` representa 390 px; `desktop`, 1440 px. Não publicar esses arquivos ou fixtures no site.

## Limitações e validações reais pendentes

- Não foram utilizadas APIs reais de Groq, Gemini ou OpenAI. Chaves, cota, qualidade do modelo real, proporção de JSON aceito e latência em produção continuam pendentes de homologação autorizada.
- Mensagens/procedimentos são compostos a partir de catálogo revisável; não há geração irrestrita de campanhas inéditas. Novas categorias precisam de revisão e testes antes de entrar no catálogo.
- O contexto complementar é parcial quando necessário. Não há promessa de o modelo analisar individualmente todos os indicadores de relatórios grandes; o diagnóstico calculado e as tabelas continuam completos.
- Não há apuração de causas, dados individuais, responsável nominal, campanhas executadas ou eficácia garantida. Acompanhamento posterior não comprova causalidade de uma ação.
- Compatibilidade dos modos JSON com cada modelo configurado deve ser homologada. JSON válido não garante contrato válido; o fallback continua obrigatório.
- A fonte Helvetica padrão continua a do PDF aprovado. Layout foi exercitado e uma página de plano foi inspecionada; não houve impressão física ou inspeção visual manual de cada uma das 43 páginas.
- Não houve benchmark em aparelho físico modesto, certificação WCAG completa ou testes em todos os navegadores.

## Publicação manual — Edge Function primeiro

Nenhuma ação abaixo foi executada.

1. Revisar o diff contra `backup/reports-v4`. Não modificar banco, RLS, Secrets ou configuração de autenticação/origens.
2. Validar localmente:

```powershell
$env:DENO_DIR = Join-Path (Get-Location) '.validation-tools/cache'
.\.validation-tools\deno.exe check --cached-only --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
.\.validation-tools\deno.exe run --allow-read tests/reports.test.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/reports-v4.test.mjs
.\.validation-tools\deno.exe run --allow-read --allow-write=.validation-tools tests/pdf.test.mjs
```

3. Após aprovação humana, publicar **toda a pasta da função**, incluindo `index.ts`, `reports.js`, **`report-management.js`**, `analytics.js` e `groq-context.js`. Não colar apenas `index.ts`: os imports locais precisam acompanhar a função.

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

Se usar o editor web, criar/atualizar cada arquivo importado com o mesmo nome/caminho. Manter as configurações JWT/origens existentes. Não executar migrações nem comandos de Secrets.

4. Homologar a função no ambiente autorizado: gerar sem aprofundamento (nenhuma chamada de provedor), aprofundar explicitamente, conferir base/recorte e fallback, inclusive erros de permissão/cota. Não efetuar escritas em indicadores para testar relatórios.

## Publicação manual — frontend

1. Publicar `public/` preservando os arquivos existentes, com `report-content.js`, `reports.js`, `report-pdf.js`, `pdf-progress.js`, `index.html` e `style.css` atualizados. O HTML carrega `report-content.js` antes de `reports.js`; não omitir o arquivo novo.
2. Manter Vercel estático: preset `Other`, sem build, saída `public` quando a raiz é o repositório, ou a configuração equivalente já adotada.
3. Criar preview manual pelo fluxo Git/Vercel existente. Se utilizar CLI já vinculada:

```powershell
vercel deploy
```

4. Revisar nos dois temas e mobile: geração inicial com plano, aprofundamento explícito, resultado de erro, prévia/PDF iguais, ausência de selo de execução, progresso e download único. Só após aprovação humana:

```powershell
vercel deploy --prod
```

Não publicar `.validation-tools/`, testes ou documentos internos como assets do site. Não fazer deploy da pasta raiz contendo esses artefatos como saída pública.

Ordem recomendada: Edge compatível primeiro, depois preview/frontend V4. Frontend V4 com Edge antiga pode mostrar somente os resultados e não aplicar aprofundamento incompatível; atualizar a função antes da homologação completa. Rollback deve restaurar a revisão correspondente de frontend e função, sem alterar dados.
