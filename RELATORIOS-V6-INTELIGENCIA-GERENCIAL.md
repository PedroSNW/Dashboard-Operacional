# Relatórios V6 — inteligência gerencial

Implementação local em 17/11/2026. Nenhum deploy, alteração de banco, RLS, Secrets, indicadores, salvamento corporativo ou logs de auditoria. Os ensaios usam dados fictícios e mocks; não representam aprovação editorial dos gestores nem medição da qualidade da Groq real.

## Retomada e conclusão — 18/11/2026

A inspeção da retomada conferiu os dez arquivos rastreados modificados, os sete arquivos novos, o prompt original e as evidências locais. A implementação não foi reiniciada. Já estavam concluídos o modelo V6, contexto opcional, integração com os três adaptadores, catálogo, plano de evolução, prévia e composição PDF. Faltavam repetir os testes após os últimos ajustes, inspecionar os PDFs finais com gráficos e consolidar este documento.

Na revisão final, foi retirada uma duplicação entre avanços e desafios: um indicador que melhora e ainda está fora da referência mantém os números completos nos avanços e recebe uma ressalva específica nos desafios. Nenhum número ou evidência dos apêndices foi removido. Também foram revalidados o formulário final sem linha isolada, o rótulo de prioridade de acompanhamento sem gravidade presumida e a rejeição de estruturas malformadas.

Concluídos localmente: type check estrito, quinze suítes de regressão com saída zero, 36 combinações V6, 18 cenários do handler e ensaios Chrome nas sete larguras descritas abaixo. As quatro suítes afetadas pelo ajuste editorial (`reports-v6`, `reports-v4`, `pdf`, `v3-static`) foram repetidas com aprovação. Não foi necessário alterar os módulos matemáticos, o guard Groq ou a persistência. As verificações reais/humanas permanecem explicitamente separadas no final deste documento.

## Diagnóstico e arquitetura

A V5 organizava o PDF em corpo executivo e apêndices completos. A V5.1 preservou essa apresentação e introduziu o perfil Groq `2048/medium`, orçamento compacto, controle de consumo, cache autorizado e telemetria segura. A priorização editorial ainda dependia principalmente do sinal numérico contra a meta; não havia contexto gerencial tipado nem plano de evolução por iniciativa.

A V6 acrescenta `report-intelligence.js`, dentro da própria pasta da Edge Function. O fluxo é: autenticação existente → leitura autorizada do snapshot → validação do recorte → cálculos existentes em `analytics.js` → catálogo gerencial validado → modelo editorial V6 → prévia e PDF. O navegador consome o modelo validado; não redefine os cálculos. O contrato fechado de seleção de estratégias da IA continua na versão 4, por compatibilidade; o modelo de apresentação e `reportMeta.reportVersion` são V6.

`analytics.js`, `groq-context.js` e `groq-policy.js` não foram alterados. Os testes comparam integralmente os indicadores calculados com a cópia anterior em `.validation-tools/v6-before/`. O manifesto SHA-256 e a referência Git desse ponto de restauração estão nessa pasta, que é local e ignorada pelo Git.

## Leitura e critérios

O resumo executivo tem cinco blocos: panorama, avanços, desafios, prioridades e encaminhamentos. O corpo desenvolve avanços, desafios, panorama, prioridades, contexto opcional, iniciativas, próximos 90 dias, conclusão e metodologia. As prioridades relacionam situação, evidência calculada, significado, proposta e acompanhamento.

São dimensões separadas:

- **Desempenho:** resultado da competência final contra a meta cadastrada atual e a direção. Se a competência final estiver ausente, não a substituímos silenciosamente pelo último dado válido.
- **Evolução:** comparação descritiva dos extremos válidos; oscilações e lacunas são qualificadas. Dois pontos não demonstram tendência robusta; um ponto não demonstra evolução. Não há projeção de ultrapassagem nem atribuição causal.
- **Criticidade operacional:** somente critérios explicitamente aprovados em configuração de código. `OPERATIONAL_POLICY.criteria` inicia vazio. A apresentação informa pendência de validação, inclusive para indicadores cujo nome sugira gravidade.

A configuração extensível aceita identidade exata do indicador (ID, nome e setor), categoria, nível, referência e aprovação explícita. As categorias disponíveis são segurança humana, sinistros e consequências graves, conformidade legal, risco financeiro, risco operacional e eficiência administrativa. O cliente não pode enviar essa configuração. Como há IDs posicionais legados, nome e setor também precisam coincidir; mudanças exigem revisão da configuração. Alterações aprovadas devem incrementar a versão da política.

A ordem editorial considera: criticidade operacional alta validada; meta e evolução desfavoráveis; deterioração; lacuna da meta; dados/critérios insuficientes; acompanhamento. Empates mantêm a seleção. Os limites de prioridades por tipo são 3, 3, 4, 5, 4 e 5 (executivo, mensal, trimestral, anual, comparativo e crítico). Essa ordem representa acompanhamento gerencial, sem equivaler a gravidade humana, legal ou financeira. Os rótulos legados internos do contrato V4 não são apresentados como criticidade operacional na V6.

O teste concreto cobre autuações tratadas de 193 para 275, referência 300, maior é melhor: **melhora de 42,49%, ainda fora da referência**. Outro caso passa de 1 para 9, referência 10, menor é melhor: **deterioração, ainda dentro da referência**. Isso evita esconder tanto avanços quanto desafios simultâneos.

Não existe, no contrato utilizado, histórico de metas verificado por competência. A meta atual é apenas referência para comparações históricas; não afirmamos que vigorava no passado. Os cálculos originais permanecem intactos e essa ressalva fica na metodologia.

## Contexto da Gestão

Painel opcional recolhido, com ações realizadas, dificuldades, conquistas, prioridades, objetivos e observações. Limites: 320 caracteres por campo, 1.200 no conjunto e 2.400 bytes UTF-8 para a representação dos textos normalizados no servidor. O teto de bytes pode rejeitar textos acentuados antes do limite de caracteres; a interface apresenta o erro sem truncar o relato.

O rascunho fica em memória/DOM, sem localStorage, gravação de banco ou alteração da projeção corporativa. Não é um rascunho persistente após recarregar a página. O logout/reset limpa os campos; a identidade da sessão também é conferida. Qualquer alteração no recorte desvincula o contexto, mesmo quando o filtro retorna ao valor anterior. Reutilizar exige clicar em **Vincular este contexto ao recorte atual**. Os campos permanecem visíveis para revisão, sem inclusão automática.

Editar o contexto invalida a prévia e impede exportação/análise até regenerá-la. A assinatura do frontend e o SHA-256 da base no servidor incluem o contexto e a versão da política. Uma mudança de contexto com uma base antiga gera HTTP 409; não reutiliza uma análise de outro contexto.

O contexto integra o relatório como **relato não verificado**, sem substituir dados, metas ou fontes. Ações informadas podem estar pendentes de validação, informadas como em execução ou informadas como concluídas. Isso não muda o estado das iniciativas propostas.

Objetivos têm tipo sugerido, informado pela gestão ou informado como aprovado. O último exige uma confirmação explícita; continua identificado como declaração sem verificação independente. Não existe aprovação inferida pelo texto nem alteração de meta oficial.

O envio ao provedor externo exige marcar **Permitir o envio deste contexto à IA**, desmarcado por padrão. Sem isso, a Edge recebe o contexto para compor o relatório, mas o adaptador envia `managementInformation: null` aos três provedores. Com consentimento, o contexto entra somente no JSON de dados, identificado como relato não verificado. Não entra nas instruções do sistema.

Chaves desconhecidas, tipos inválidos, excesso de tamanho e comandos ostensivos são rejeitados. A heurística de injeção é defesa auxiliar: a proteção principal é separar os dados e manter a resposta fechada em IDs/estratégias autorizados, sem prosa arbitrária do modelo. A interface usa `textContent`. Comunicação pública é resolvida exclusivamente pelo catálogo; não copia textos privados do contexto. Não há garantia de detectar toda instrução maliciosa possível.

O cache autorizado V5.1 continua em memória por até cinco minutos e pode conter o modelo gerencial/contexto da resposta. Ele é isolado por usuário/base/payload, não constitui persistência corporativa e não escreve esses textos nos logs.

## Iniciativas e próximos 90 dias

Cada iniciativa mantém problema/evidência, objetivo, atividades, área sugerida, prazo sugerido, indicador e critério de acompanhamento. Recebe uma referência A1, A2 etc. e situação **Sugerida**. Pessoas não são designadas e nenhuma tarefa é criada no banco.

O catálogo anterior foi preservado e recebeu estratégias específicas de tratamento de autuações, identificação, SCORE, valores financeiros agregados e investigação de escopo desconhecido. O tema orienta a estratégia, sem determinar gravidade. A estratégia financeira exige também unidade monetária e significado compatível; não presume cobrança, recuperação efetiva ou processo jurídico. Sinistros, velocidade, documentação e comunicação preventiva continuam disponíveis. Há deduplicação de propostas e campanhas, limites por tipo e preservação das evidências completas.

O plano de evolução usa as atividades de cada iniciativa: até 30 dias, sua primeira etapa; até 60 dias, a segunda etapa; até 90 dias, reavaliar os resultados disponíveis e revisar o próximo ciclo. Os mesmos indicadores e critérios são referenciados pelo código da iniciativa. São horizontes após a decisão de iniciar, não compromissos aprovados ou promessa de efeito. Objetivos relatados permanecem separados. JSON inválido, truncado ou sem referências válidas conserva o fallback determinístico.

## Prévia, gráficos e PDF

As ações continuam antes da prévia, na barra única existente. Gerar não chama a IA. A prévia inicia recolhida, com contagens, avanços, desafios, prioridades e indicação do contexto. Expandir cria somente gráficos úteis; recolher destrói essas instâncias. Exportar independe de expandir.

Séries constantes e com menos de dois valores válidos dispensam gráfico; o motivo é explícito e todas as competências, zeros, ausências, unidades e estatísticas permanecem nas tabelas. Gráficos relevantes usam a mesma série, sem preencher lacunas e com eixo iniciado em zero; valores negativos continuam considerados pelo Chart.js.

A apresentação preserva o padrão V5: A4, margens esquerda/superior 30 mm e direita/inferior 20 mm, corpo 12 pt, quadros/tabelas/notas 10 pt, identificação, fontes, sumário com páginas/links reais e apêndices completos. Não foi refeita uma certificação normativa ABNT. O objetivo de 4–8 páginas se aplica ao corpo executivo médio, não ao total com histórico e propostas completas. Relatórios extensos continuam com dezenas de páginas quando necessário para preservar os dados.

O panorama de mais de 15 indicadores é seletivo no corpo e integral no apêndice. As ressalvas gerais ficam na metodologia; ressalvas específicas de lacunas/escopo permanecem próximas da evidência. O formulário final reserva espaço para evitar uma última linha isolada. A exportação mantém imagens nas posições originais dos indicadores, progresso por etapas efetivamente concluídas, bloqueio de concorrência e download único.

## Groq e comparação reproduzível

Nenhuma alteração em modelo, perfil, guard ou teto V5.1: `openai/gpt-oss-120b`, conclusão 2.048 tokens e raciocínio `medium` para relatórios; chat 1.200/low; timeout 35 s; sem retry idêntico. São preservados tratamento de 413, 429/Retry-After, logs seguros e os adaptadores Gemini/OpenAI. Não houve chamada real aos provedores.

O contexto compacto prioriza IDs editoriais do recorte e evidências determinísticas, acrescentando a limitação de metas históricas, criticidade somente se validada e contexto consentido. Mantém limite de 6.000 bytes no payload, reserva de envelope de 512 bytes e entrada estimada até 3.100 tokens (3.500 menos margem 400). A estimativa usa bytes UTF-8/2 mais overhead; não é tokenizador nem contagem real. A reserva de consumo soma entrada estimada, conclusão e margem 400. Tetos de engenharia preservados: 8.000 TPM, 20 RPM, 100 mil TPD, 500 RPD, sujeitos aos limites reais inferiores da conta. O guard é por instância; não garante coordenação entre instâncias Supabase.

Os mesmos dados fictícios, sem resposta de API, foram comparados à cópia V5.1 anterior. V5 e V5.1 compartilham a apresentação anterior, portanto não simulamos uma diferença de qualidade de modelo entre elas. Valores abaixo são do tipo comparativo, sem imagens na composição de medição, incluindo apêndices; tempos são amostras locais e variam por máquina:

| Indicadores | Contexto V6 | Páginas V5.1 → V6 | Corpo V5.1 → V6 | Entrada estimada V5.1 → V6 | Payload V6 | Indicadores enviados V5.1 → V6 |
|---|---|---|---|---|---|---|
| 1 | não | 8 → 9 | 2 → 2 | 1.141 → 1.323 | 2.676 bytes | 1 → 1 |
| 1 | sim | 8 → 9 | 2 → 3 | 1.141 → 1.626 | 3.282 bytes | 1 → 1 |
| 15 | não | 18 → 19 | 4 → 5 | 2.635 → 2.785 | 5.601 bytes | 7 → 6 |
| 15 | sim | 18 → 20 | 4 → 6 | 2.635 → 2.801 | 5.633 bytes | 7 → 5 |
| 40 | não | 30 → 32 | 5 → 5 | 2.635 → 2.780 | 5.591 bytes | 7 → 6 |
| 40 | sim | 30 → 32 | 5 → 5 | 2.635 → 2.791 | 5.612 bytes | 7 → 5 |

O contexto fictício compartilhado acrescenta informação, mas compete pelo mesmo orçamento: em 15/40 indicadores envia cinco em vez de seis. A seleção parcial é explicitada; o diagnóstico determinístico e as tabelas continuam cobrindo todos. Não alegamos redução de tokens: no fixture de um indicador, o custo estimado aumenta; nos maiores, o teto limita a cobertura da IA. A reserva máxima dessas amostras é 2.801 + 2.048 + 400 = 5.249 tokens, sem constituir garantia do uso real.

Na mesma amostra, os gráficos elegíveis caem de 15 para 11 e de 40 para 30 pela exclusão documentada de constantes/insuficientes. PDFs com gráficos reais são exercitados separadamente no Chrome: 1/15/40 indicadores produziram 9/24/43 páginas totais, 1/11/30 figuras e 3/7/7 páginas de corpo, com contexto fictício. Os apêndices explicam a maior parte do volume nos recortes grandes. A composição sem imagens ficou aproximadamente entre 30 e 300 ms nessas seis amostras; isso não mede latência da Groq, rasterização dos gráficos ou download.

Evidências de melhoria funcional: duas dimensões simultâneas demonstradas pelos casos 193→275 e 1→9; criticidade pendente em vez de inferida pelo nome; cinco blocos executivos; iniciativas específicas do catálogo; contexto tipado e consentido; horizonte vinculado a cada iniciativa. O total de páginas cresceu levemente. Clareza, utilidade das tratativas e aprovação editorial ainda exigem avaliação humana e ensaios reais; não foram pontuadas como se houvesse comparação cega de modelos.

## Testes e evidências

Resultado da execução final (todos locais; chamadas externas e leitura do Supabase substituídas por mocks):

| Verificação | Resultado | Cobertura principal |
|---|---|---|
| Deno check com configuração do projeto | Aprovado | Edge Function e imports |
| `analytics.test.mjs` | Aprovado | Cálculos, precisão e ordenação |
| `structured.test.mjs` | Aprovado | Contrato JSON, referências e fallback |
| `presentation.test.mjs` | Aprovado | Escopo, seleção e camadas |
| `groq-budget.test.mjs` | Aprovado | Bytes/tokens estimados e 400/413/429 |
| `groq-v51.test.mjs` | Aprovado | Perfis, guard, métricas e consumo |
| `reports.test.mjs` | Aprovado | Seis tipos, filtros e integridade |
| `reports-v4.test.mjs` | Aprovado; repetido após ajuste final | Catálogo, evidências, PDF extenso e orçamento |
| `reports-v5.test.mjs` | Aprovado | 24 combinações, células desenhadas, textos extensos e gráficos |
| `pdf.test.mjs` | Aprovado; repetido após ajuste final | Paginação, continuidade e progresso |
| `pending-state.test.mjs` | Aprovado | Persistência e igualdade do snapshot |
| `theme-preference.test.mjs` | Aprovado | Inicialização dos temas |
| `v3-static.test.mjs` | Aprovado; repetido após ajuste final | Sintaxe, IDs e contraste dos pares existentes |
| `ia-context.test.js` | Aprovado | Payload, sessão, dados e três adaptadores |
| `reports-v6.test.mjs` | Aprovado; repetido após ajuste final | 36 combinações e casos adicionais V6 |
| `edge-handler.test.ts` | Aprovado | 18 cenários, três provedores e segurança com mocks |
| Chrome / `reports-v6-cdp.ts` | Aprovado; repetido após ajuste final | 21 cenários de quantidade/largura, dois temas, teclado na prévia e no contexto, três exportações reais |

Nenhuma linha dessa tabela representa chamada real à Groq, Gemini ou OpenAI. O quadro abaixo detalha os ensaios e suas limitações.

- **Type check Deno:** configuração estrita `supabase/functions/deno.json`; Edge completa verificada.
- **V6:** 36 combinações (seis tipos × 1/15/40 × com/sem contexto), comparação integral dos cálculos anteriores, margens A4, sumário, cobertura, prioridades, catálogo, metas, dois pontos/um ponto, criticidade aprovada fictícia/pendente, consentimento, contexto contraditório, aprovação explícita, injeção ostensiva, estrutura malformada, contexto acentuado próximo do limite e fallback.
- **Handler:** 18 cenários com mocks, incluindo sessão, RLS negada, snapshot adulterado, filtros, três provedores, contexto/hash/consentimento, 400/413/429, Retry-After, timeout, parsing, truncamento, logs sem conteúdo sensível, cache e concorrência.
- **Regressão:** analytics, structured, presentation, groq-budget, groq-v51, reports, reports-v4, reports-v5, pdf, pending-state, theme-preference, v3-static e ia-context. O ensaio V5 também verifica as células realmente desenhadas (valores/estatísticas/histórico), textos/células extensos, progresso e PDFs com imagens reais previamente capturadas.
- **Chrome isolado:** 1/15/40 em 320, 360, 390, 768, 1024, 1440 e 1920 px, alternando claro/escuro; prévia recolhida/expandida, gráficos seletivos, modelo válido/truncado, falha de IA, consentimento, escape HTML, aprovação, mudança/revinculação do contexto, ausência de alterações corporativas, teclado, barra sem sobrepor a navegação e ausência de overflow/erros JS. Exportação real recolhida, progresso e bloqueio de download duplicado para as três quantidades em 1440 px.
- **Revisão visual:** capturas da interface e PDFs fictícios com contato de páginas, incluindo corpo, tabelas e apêndices. A geometria automatizada abrange todas as combinações; não equivale a revisão humana de cada página de todos os relatórios possíveis.

Comandos usados na raiz (Deno local, cache em `.validation-tools/cache`):

```powershell
$env:DENO_DIR='.validation-tools/cache'
.validation-tools/deno.exe check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
.validation-tools/deno.exe run --allow-read --allow-write --allow-env tests/edge-handler.test.ts
.validation-tools/deno.exe run --allow-read --allow-write tests/reports-v6.test.mjs
.validation-tools/deno.exe run --allow-read --allow-write tests/reports-v6-fixtures.mjs
.validation-tools/deno.exe run --allow-read --allow-write tests/reports-browser.ts --v4
.validation-tools/deno.exe run --allow-read --allow-write tests/reports-v6-browser-build.mjs
.validation-tools/deno.exe run --allow-all tests/reports-v6-cdp.ts
```

O último comando abre Chrome headless com perfil isolado e CSP sem rede no documento de teste. Não utiliza a sessão Supabase do usuário. Os demais arquivos de regressão são executados individualmente por `deno run --allow-read --allow-write --allow-env tests/ARQUIVO`.

Evidências locais ignoradas pelo Git: `.validation-tools/reports-v6-metrics.json`, `v6-*-layout.json`, `v6-*.pdf`, `v6-real-charts-*.pdf`, `reports-v6-*.png`, pastas `v6-visual`/`v6-visual-final`, `v6-final-tests.json`, `v6-final-*.log` e `v6-final-browser.log`. Os resultados medem este ambiente e os fixtures descritos.

## Arquivos e publicação manual

**Frontend alterado:** `public/index.html`, `public/style.css`, `public/reports.js`, `public/report-content.js`, `public/report-pdf.js`. Os demais assets existentes continuam necessários. Não publicar as pastas de testes/validação como conteúdo do site.

**Edge alterada:** `index.ts`, `reports.js`, `report-management.js`, novo `report-intelligence.js` e README, todos em `supabase/functions/seguranca-viaria-ia/`. Para empacotar, incluir também os três módulos preservados `analytics.js`, `groq-context.js`, `groq-policy.js`.

**Testes:** ajuste `tests/edge-handler.test.ts`; novos `tests/reports-v6.test.mjs`, `reports-v6-fixtures.mjs`, `reports-v6-browser-build.mjs`, `reports-v6-browser.js`, `reports-v6-cdp.ts`. Este documento registra a implementação.

Procedimento, **não executado**:

1. Preserve a versão atual publicada para reversão e confirme o projeto Supabase correto.
2. Publique primeiro a Edge Function `seguranca-viaria-ia`. No editor do Supabase, envie **os sete módulos juntos, no mesmo nível**: `index.ts`, `analytics.js`, `groq-context.js`, `groq-policy.js`, `reports.js`, `report-management.js`, `report-intelligence.js`. Não colar apenas `index.ts`. Preserve autenticação e Secrets existentes.
3. Alternativa via CLI, na raiz do projeto, substituindo o identificador: `supabase functions deploy seguranca-viaria-ia --project-ref SEU_PROJECT_REF`. Não usar `--no-verify-jwt` nem comandos de migrations/Secrets.
4. Confirme uma prévia autenticada sem IA e sem contexto antes de publicar o frontend. Depois envie os cinco arquivos frontend modificados para seus respectivos caminhos no hosting atual, preservando os demais assets. `index.html` e o carregador usam versões de cache V6 para os arquivos alterados.
5. Recarregue a página sem cache e execute a aceitação abaixo. Se necessário, reverta frontend e função em conjunto; a cópia local anterior está em `.validation-tools/v6-before/`.

## Validações ainda dependentes do ambiente real

- Aceitação editorial do gestor: clareza, prioridades, pertinência das iniciativas, plano 30/60/90 e terminologia.
- Critérios corporativos de criticidade: não foram inventados ou preenchidos. Precisam de aprovação e revisão de identidade/versão antes de configuração.
- Sessão/CORS/RLS e snapshot reais, sem nenhuma escrita: prévia sem contexto, com contexto e alteração de filtros.
- Uma análise consentida por provedor autorizado; confirmar uso real de tokens/raciocínio, `finish_reason`, tempo de resposta, cotas/Retry-After e fallback. Os testes locais desses aspectos são mocks; não houve consumo da API real.
- Impressão e leitura humana dos PDFs com os nomes reais, acesso autorizado e recortes efetivos; fontes/margens foram preservadas e testadas, sem promessa de certificação ABNT ou de número fixo de páginas.
- Acessibilidade com leitor de tela e dispositivos físicos; houve teste de teclado e larguras no Chrome, não certificação integral.
- Concorrência entre instâncias da Edge continua fora da garantia do guard em memória V5.1. Não foi introduzida infraestrutura distribuída ou alteração de banco.

Na aceitação, gerar → aplicar Groq explicitamente → exportar ainda recolhido; observar um único download e progresso final. Modificar filtros/contexto e verificar bloqueio de exportação até nova prévia. Conferir que informações privadas não aparecem nas campanhas, e que relatos e propostas continuam com situações diferentes. Nenhuma dessas validações requer gravar dados de produção.
