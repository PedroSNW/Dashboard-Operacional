# Groq V5.1 — auditoria, controle de consumo e comparação

Implementação local em 17/11/2026. **Nenhum deploy nem alteração de tabelas, RLS, Secrets, indicadores ou salvamento.** Nenhum arquivo em `public/`, compositor PDF ou regra ABNT foi alterado.

## Resultado e decisão

Adotado como candidato inicial nos relatórios: `openai/gpt-oss-120b`, `max_completion_tokens: 2048`, `reasoning_effort: medium`. O perfil anterior era `1200/low`. Não foi configurada saída de 8.000 tokens. A Groq permanece principal no fluxo de relatórios já existente.

`3072/medium` foi comparado **offline em orçamento e contratos**, permanecendo fora da configuração de produção. `high` não foi ativado nem avaliado como melhoria: não há benefício mensurado que o justifique.

Não há `GROQ_API_KEY` disponível no ambiente local. **Nenhuma chamada real foi executada.** A escolha de 2048/medium segue o candidato solicitado e os limites de engenharia; não é uma conclusão experimental de superioridade do modelo. Consumo real, qualidade gerada, latência da API e frequência real de truncamento continuam sem medição. Os mocks verificam o software, não o raciocínio de uma configuração de IA.

## Auditoria anterior às alterações

| Item | Encontrado antes |
|---|---|
| Modelo padrão | `openai/gpt-oss-120b`, com override existente `GROQ_MODEL` |
| Parâmetro de saída | `max_completion_tokens: 1200`; sem `max_tokens` no adaptador Groq |
| Raciocínio | `low` nos modelos GPT-OSS |
| Entrada | Orçamento 3500, margem interna 400; estimativa efetiva até 3100 tokens |
| Estimador | UTF-8 do JSON de todas as mensagens / 2, arredondado, mais 64; não é tokenizador exato |
| Corpo serializado | Até 6000 bytes; reserva de envelope de 512 bytes no compactador |
| Histórico | Duas mensagens, sistema e usuário; sem histórico de conversa enviado no relatório |
| Timeout | 35 s, incluindo leitura do corpo da resposta |
| Tentativas | Uma chamada por solicitação Groq; sem retry automático; relatório Gemini também com uma tentativa |
| 429 | Categoria sanitizada, `Retry-After`, cooldown em memória; sem reserva acumulada de tokens |
| Uso disponível | `prompt_tokens`, `completion_tokens`, `total_tokens` na resposta, com zero como substituto quando ausentes |
| Uso não acompanhado | Tokens de raciocínio e latência; faltavam logs de sucesso consistentes |
| Encerramento | `finish_reason` no metadata; `length` acionava fallback determinístico |
| Duplicação | Frontend já possui trava de operação/cache de enriquecimento; servidor permitia até três requisições gerais por instância e não tinha cache de relatórios Groq |
| Contexto | Apenas indicadores do relatório autorizado, priorizando os críticos e removendo itens inteiros quando não cabiam; parcialidade explícita |
| Resolução | Catálogo validado, JSON com IDs/códigos; referências de diagnóstico e prioridade eram validadas, mas a escolha de `stat` e a ordem dos riscos não influenciavam a projeção final |

Não havia evidência local de quantos tokens reais a conta gastou ou de que aumentar o orçamento resolveria truncamentos. Os limites de modelo e de conta são conceitos distintos: a [página do modelo](https://console.groq.com/docs/model/openai/gpt-oss-120b) informa janela de contexto de 131.072 e máximo de saída de 65.536; isso não autoriza consumir esses valores sob a cota observada de 8.000 TPM.

## Mudanças implementadas

### Contexto e fundamentação

- Preservados os tetos de 3500/3100 estimados e 6000 bytes. Não são enviados todos os indicadores do dashboard por padrão.
- O contexto compacto acrescenta competência do último valor válido, persistência fora da meta e maiores sequências descritivas de melhora/piora, exclusivamente das estatísticas já calculadas. Sem meta, a persistência fora dela fica `null`, não zero.
- Instruções orientam a selecionar evidências relevantes, distinguir lacunas de desempenho e evitar monitoramento genérico quando há estratégia específica pertinente. O formato continua sendo JSON curto com referências e estratégias permitidas, sem prosa factual ou valores inventados.
- Referências válidas `ultimo`, `media`, `evolucao` e `persistencia` passam a escolher a primeira evidência do diagnóstico e a fundamentação da ação. Todas as evidências e indicadores continuam presentes no diagnóstico; nenhum cálculo foi modificado.
- A ordem de riscos validada passa a orientar a apresentação; os demais riscos do recorte são preservados. O catálogo, critérios de criticidade, textos das estratégias, limites de ações por tipo e deduplicação permanecem.
- Campanhas e comunicação continuam limitadas às opções validadas: feed, stories, reels ou comunicado; cards, vídeo ou mensagem. Não há calendário automático, causalidade presumida ou números operacionais em material público.

A melhoria verificável é que referências anteriormente ignoradas agora influenciam a fundamentação e a ordem. A qualidade das escolhas que a Groq fará com `medium` exige avaliação real.

### Perfil e telemetria

`groq-policy.js` centraliza a política, sem novos Secrets ou parâmetros controlados pelo cliente:

- Relatórios GPT-OSS: 2048/medium. Chat comum GPT-OSS: 1200/low, preservado.
- Outros modelos Groq não recebem esforço incompatível; o override existente do modelo permanece.
- OpenAI e Gemini mantêm seus parâmetros de saída anteriores. Recebem o contexto de relatórios enriquecido pelo construtor compartilhado.
- Timeout continua em 35 s. Não foi ampliado sem evidência de necessidade.

Logs seguros `Groq request metrics` / `Groq API error` incluem modelo configurado, perfil, teto de conclusão, esforço, estimativa de entrada, bytes, indicadores enviados/omitidos/resumidos, tokens informados, tempo da etapa Groq, `finishReason`, status e resultado. Erros também preservam código/categoria sanitizados, identificador de requisição quando válido e `retry-after` quando disponível.

`prompt_tokens`, `completion_tokens`, `total_tokens` são lidos defensivamente. `completion_tokens_details.reasoning_tokens` é registrado **quando fornecido**. Ausência/invalidez fica `null`, não zero. Raciocínio não é somado novamente à conclusão. Quando o total informado é menor que a soma entrada+conclusão, a contabilização conservadora usa a soma. Não se estima a quantidade de tokens a partir do texto de raciocínio.

O conteúdo de `message.reasoning`, prompts, valores/nomes de indicadores, JWTs, chaves, respostas brutas e hashes de cache não são registrados. Motivos de encerramento desconhecidos são sanitizados para `unknown`. Um cache hit ou bloqueio antes da API registra consumo novo zero porque não houve chamada; uso histórico retornado do cache vem identificado como `usageSource: cached_original` e `currentRequestTokens: 0`.

### Limites e chamadas

O controle acumulado abrange também o chat Groq, que compartilha a conta; a mudança de perfil de saída é restrita aos relatórios. Tetos locais conservadores, ajustáveis no código:

| Controle | Valor |
|---|---:|
| Tokens/minuto | 8000, conforme limite observado pelo usuário |
| Requisições/minuto | 20 |
| Tokens/24 h móveis | 100.000 |
| Requisições/24 h móveis | 500 |
| Margem por chamada | 400 tokens adicionais |
| Chamadas Groq simultâneas | Uma por instância |
| Cache de resultados validados | Cinco minutos, até 32 entradas por instância |

20 RPM, 500 RPD e 100.000 TPD são **tetos de engenharia**, não uma afirmação de cotas da conta. A [documentação de limites da Groq](https://console.groq.com/docs/rate-limits) consultada indica que os limites são organizacionais e podem variar. Confirmar os limites exatos da organização, inclusive eventuais limites separados de entrada/saída; valores inferiores devem prevalecer.

Antes do envio, reserva-se `entrada estimada + conclusão máxima + 400`. Depois, o uso informado concilia a reserva, mantendo a margem. Sem uso confiável, timeout ou erro, a reserva inteira é mantida, evitando crédito fictício. Não há fracionamento automático em várias análises para escapar do limite.

Headers de teto, saldo e reset reduzem o espaço disponível. `x-ratelimit-limit-tokens` refere-se a TPM; `x-ratelimit-limit-requests` e os respectivos saldos/reset referem-se a RPD, conforme a documentação. Durações como `1m2.5s` são interpretadas sem registrar texto arbitrário.

429 respeita `Retry-After` numérico ou data HTTP. Sem ele, usa-se 60 s para taxa e 24 h para cota diária identificada. `TPD`, `RPD` e `insufficient_quota` são tratados como cota. Não há retry automático da mesma chamada; o teto local pode exigir espera maior que o provedor.

O cache só guarda conteúdo aceito, por usuário + base validada + corpo/configuração. JWT, domínio corporativo, RLS/leitura e snapshot continuam sendo verificados **antes** do cache. Estrutura rejeitada ou truncada não é cacheada. Uma segunda operação enquanto há chamada Groq em andamento recebe 429 sem atingir a API.

**Limite material:** guardas, contador diário e cache vivem em uma instância da Edge Function. Não coordenam instâncias diferentes nem outros clientes da mesma conta; reinício perde esse estado. Assim, não há garantia distribuída de 8000 TPM apenas com este código. Os limites da Groq continuam sendo a autoridade final e seus 429 são respeitados. Garantia global preventiva exigiria coordenação externa compartilhada; nenhuma tabela, serviço ou Secret foi criado para isso.

## Comparação medida offline

Fixture: dashboard fictício de 75 indicadores, com cinco selecionados, 12 competências, zero, nulos, meta zero, taxa percentual e direção neutra/ausente. Os 70 indicadores fora da seleção não são tratados como omissão do contexto selecionado.

Comparação da entrada anterior e proposta:

| Medida | Anterior | V5.1 |
|---|---:|---:|
| Indicadores enviados do escopo | 5/5 | 5/5 |
| Omitidos do escopo | 0 | 0 |
| Tokens de entrada estimados | 1668 | 2126 |
| Bytes das mensagens | 3207 | 4123 |
| Bytes do sistema | 1036 | 1457 |
| Bytes da requisição completa | 3363 | 4282 |
| Mensagens / histórico adicional | 2 / nenhum | 2 / nenhum |

O aumento é intencional: evidência de persistência/competência e orientação de qualidade, com teto intacto. Não foi apresentado como economia de entrada.

Para isolar a configuração, o benchmark usa **as mesmas mensagens V5.1** nos três perfis:

| Perfil | Entrada estimada | Teto conclusão | Esforço | Reserva com margem | Bytes |
|---|---:|---:|---|---:|---:|
| Referência de parâmetros antigos | 2126 | 1200 | low | 3726 | 4279 |
| Candidato adotado | 2126 | 2048 | medium | 4574 | 4282 |
| Comparação, não adotada | 2126 | 3072 | medium | 5598 | 4282 |

No pior caso permitido pelo compactador: `3100 + 2048 + 400 = 5548`, deixando 2452 tokens de diferença para o teto de 8000 em uma solicitação. Isso não constitui autorização para outra solicitação sem passar pela janela acumulada. Para 3072, a reserva máxima seria 6572, com folga menor.

Cobertura dos mesmos fixtures grandes (dashboard com 75):

| Selecionados | Anterior enviado / omitido | V5.1 enviado / omitido | Entrada V5.1 estimada | Bytes V5.1 |
|---|---:|---:|---:|---:|
| 15 | 10 / 5 | 7 / 8 | 2752 | 5535 |
| 40 | 10 / 30 | 7 / 33 | 2752 | 5535 |
| 75 | 10 / 65 | 7 / 68 | 2752 | 5535 |

Mais evidência por indicador reduz a cobertura complementar sob o mesmo teto. A parcialidade é informada; diagnóstico determinístico e relatório mantêm todo o recorte. Não houve truncamento de JSON, alteração do snapshot ou conversão de nulo em zero.

### Qualidade e latência

| Critério | Resultado disponível |
|---|---|
| Correção factual | Cálculos preservados; referências e estratégias inválidas rejeitadas nos testes controlados |
| Fundamentação | `stat` escolhido passa a orientar evidência real; prioridade válida orienta ordem, sem remover os demais riscos |
| Tratativas / campanhas / Instagram | Catálogo, canais, campos públicos e propostas validados; pertinência gerada pelo modelo ainda não avaliada |
| Repetição | Ação duplicada é eliminada nos três perfis com a mesma resposta controlada |
| Clareza / utilidade executiva | Restrições de concisão preservadas; julgamento humano de novas respostas reais pendente |
| Tokens reais de entrada/saída/raciocínio | Não medidos; campos permanecem `null` no resultado offline |
| Latência real da API | Não medida; não se atribuiu o tempo dos mocks ao modelo |
| Truncamento | `length` e JSON incompleto simulados acionam fallback; frequência real não medida |
| PDF / ABNT | Nenhuma alteração visual; regressão local do compositor passou |

O mesmo JSON controlado nos três perfis verifica o contrato e a resolução, não demonstra que um perfil gera esse JSON com maior frequência. Não foi fabricada nota de qualidade nem latência comparativa.

## Validação executada

Passaram:

- `tests/groq-v51.test.mjs`: três perfis, fixtures 1/2/5/15/75, escopo, limites estimados/bytes, nulos/metas, referências de tendência, prioridade, catálogo/Instagram, deduplicação, fallback, TPM/RPM/TPD/RPD, headers/reset, cooldown e uso desconhecido.
- `tests/edge-handler.test.ts`: **17 cenários**, handler compilado de produção com Auth/Supabase/fetch simulados; três provedores, CORS, JWT, RLS, adulteração, relatórios, truncamento, timeout, parsing, 400/413/429, perfil efetivo, uso/raciocínio, cache isolado/autorizado, ausência de repetição simultânea e logs sanitizados. O mock contém texto secreto de raciocínio e erro para detectar vazamento.
- Analytics, structured, presentation, contexto IA e orçamento Groq: precisão, seleção, interpretação e segurança preservadas.
- Relatórios dos seis tipos, V4, PDF multipágina/assíncrono e pendências: passaram.
- Estática frontend: 190 IDs, sintaxe dos dez scripts e pares de contraste preservados.
- `deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts`: passou com as configurações e cache locais.
- Comparação offline: `tests/groq-v51-benchmark.mjs`; resultado em `.validation-tools/groq-v51-comparison.json`, com `realApiExecuted: false`.

Foram adaptados os harnesses existentes para a nova dependência de política e para um relógio virtual que separa as janelas de quota nos cenários isolados. Não foi relaxada a validação de autenticação ou snapshot. Não foram repetidos testes visuais de navegador ou impressão, pois o frontend e o PDF não sofreram alterações.

## Arquivos modificados

Produção:

- `supabase/functions/seguranca-viaria-ia/index.ts`: perfil, métricas, reserva, cache autorizado, concorrência e leitura segura de uso.
- `supabase/functions/seguranca-viaria-ia/groq-policy.js`: **novo**, perfis, tetos, janela móvel, headers, contabilização e sanitização.
- `supabase/functions/seguranca-viaria-ia/groq-context.js`: identificação de cota diária em erros 429.
- `supabase/functions/seguranca-viaria-ia/report-management.js`: evidências compactas, instruções e aplicação efetiva das referências validadas.

Documentação: este relatório e `supabase/functions/seguranca-viaria-ia/README.md`, corrigindo a publicação que antes sugeria enviar somente `index.ts`.

Testes: novos `tests/groq-v51.test.mjs`, `tests/groq-v51-benchmark.mjs`; adaptados `tests/edge-handler.test.ts`, `tests/ia-context.test.js` e `tests/reports-v4.test.mjs`. O teste de envelope V4 passou a usar o perfil real 2048/medium, em vez de simular os parâmetros antigos.

`analytics.js`, `reports.js`, catálogo de estratégias e todos os arquivos de `public/` permanecem inalterados. Referência anterior local em `.validation-tools/v51-before/`; não publicar essa pasta.

## Repetição e homologação real

Na raiz, com Deno disponível:

```powershell
deno run --allow-read tests/groq-v51.test.mjs
deno run --allow-read --allow-write=.validation-tools --allow-env tests/edge-handler.test.ts
deno run --allow-read --allow-write=.validation-tools tests/groq-v51-benchmark.mjs
deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
```

O baseline de contexto depende da cópia local opcional anterior; se não existir, o benchmark informa `baselineContext: null`. As comparações entre perfis usam sempre o mesmo fixture e mensagens atuais.

Quando uma chave já estiver disponível em **ambiente local autorizado**, sem editar Secrets ou inserir credenciais nos arquivos, o comando abaixo compara 1200/low e 2048/medium com dados fictícios:

```powershell
deno run --allow-read --allow-write=.validation-tools --allow-env=GROQ_API_KEY --allow-net=api.groq.com tests/groq-v51-benchmark.mjs --live
```

A comparação real de 3072 exige opção explícita adicional `--include-3072`, depois de confirmar a necessidade. O script mantém solicitações sequenciais, reserva pela janela, espera local quando necessário e interrompe a comparação após erro/429, sem repetir a requisição do provedor. Não faz chamadas Supabase nem publica código. Sem chave, a execução real falha explicitamente; não é marcada como aprovada.

O JSON `groq-v51-comparison-live.json` terá uso/latência/encerramento e checagens de estrutura, integridade e repetição. Conteúdo bruto de raciocínio não é salvo. A revisão humana deve verificar fundamentação, pertinência das iniciativas, clareza, adequação do canal e ausência de causalidade; checagem estrutural não substitui essa avaliação.

Escolher o menor teto que complete consistentemente as respostas estruturadas com boa pertinência. Só considerar 3072 se 2048 truncar com frequência ou apresentar ganho verificável que compense a folga menor. Só estudar `high` após vantagem mensurada com `medium`; não há configuração `high` nesta entrega.

## Publicação manual separada — Edge Function

**Nenhuma publicação foi executada. O frontend não precisa ser republicado.**

1. Revisar o diff, executar os checks e confirmar os limites reais da organização Groq, inclusive os diários. Ajustes de política, se necessários, ficam no código; não requerem novos Secrets.
2. Publicar o conjunto completo da função, preservando nomes e diretório:
   - `index.ts`
   - `analytics.js` (inalterado, dependência necessária)
   - `groq-context.js`
   - **`groq-policy.js` (novo e obrigatório)**
   - `reports.js` (inalterado, dependência necessária)
   - `report-management.js`
3. Pelo CLI Supabase instalado e autenticado no projeto correto, na raiz:

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref <PROJECT_REF>
```

Preencher `<PROJECT_REF>` com a referência do projeto autorizado. Não executar migrations, comandos de banco ou `secrets set`; não alterar opções de autenticação da implantação existente. Pelo editor do Dashboard, enviar os seis arquivos como conjunto, no mesmo nível. **Enviar só `index.ts` repete o erro de módulo ausente**, especialmente com o novo `groq-policy.js`.

4. Após publicação autorizada, abrir uma sessão normal, gerar a prévia determinística e solicitar Groq uma vez. Conferir `profile: reports-v5.1`, limite 2048, esforço medium, bytes, uso real e `finishReason`. Confirmar que a prévia continua disponível se a análise falhar.
5. Repetir a mesma solicitação com a mesma base dentro da mesma instância: deve poder reutilizar cache, sem nova chamada. Base/usuário diferentes não compartilham a entrada. Confirmar que filtros alterados e snapshot divergente continuam bloqueando o enriquecimento desatualizado.
6. Avaliar respostas reais antes de promover configurações de maior consumo. Em 429, usar a categoria e o `Retry-After` sanitizados e conferir o painel de limites da Groq, sem tentativas em sequência.

## Fontes técnicas consultadas

- [Groq — API Reference](https://console.groq.com/docs/api-reference): `max_completion_tokens`, compatibilidade de `reasoning_effort` e formato de resposta.
- [Groq — Reasoning](https://console.groq.com/docs/reasoning): esforço e apresentação do raciocínio; não foi aplicado `reasoning_format` aos modelos GPT-OSS.
- [Groq — Rate Limits](https://console.groq.com/docs/rate-limits): âmbito organizacional, TPM/RPM/TPD/RPD, headers de limite/reset e 429. O limite observado de 8000 é tratado como teto local, não garantia de franquia livre.
- [Groq — GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b): capacidades e distinção entre limites do modelo e limites da conta.
