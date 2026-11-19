# Supabase Edge Function: seguranca-viaria-ia

> Revisão atual da V7: `v7-integrated-validation-5`. Auditoria, diferenças de contrato, resultados e homologação: [AUDITORIA-CORRECAO-EDGE-V7.md](../../../AUDITORIA-CORRECAO-EDGE-V7.md). O HTTP 200 da Groq não substitui a validação da aplicação.
D'Granel Transportes — Central de Inteligência Artificial Multiprovedor (Gemini, OpenAI & Groq)

Esta função realiza a ponte segura entre o Dashboard Operacional da D'Granel e os provedores oficiais de Inteligência Artificial: **Google Gemini API**, **OpenAI Responses API** e **Groq Chat Completions API**.

A função valida o token JWT do usuário no Supabase Auth corporativo e mantém todas as credenciais de API exclusivamente nos Secrets protegidos do servidor.

## Arquitetura

Dashboard (Browser)
→ Supabase Edge Function `seguranca-viaria-ia`
→ Validação do JWT via `supabase.auth.getUser(token)`
→ Verificação de domínio corporativo (`@dgranel.com.br`)
→ Roteamento por provedor selecionado no payload (`provider: "gemini" | "openai" | "groq"`):
   - **OpenAI**: Leitura de `OPENAI_API_KEY` → chamada à Responses API oficial (`https://api.openai.com/v1/responses`) com autenticação Bearer e timeout de 35s.
   - **Groq**: Leitura de `GROQ_API_KEY` → chamada à Chat Completions API (`https://api.groq.com/openai/v1/chat/completions`) com autenticação Bearer e timeout de 35s.
   - **Google Gemini**: Leitura de `GEMINI_API_KEY` → chamada à Gemini API (`generateContent`) com retry para 503 e timeout individual de 35s.
→ Retorno estruturado e sanitizado ao Dashboard.

A função lê `dashboard_state` com o JWT do usuário para conferir os indicadores recebidos, respeitando RLS. Não altera indicadores, tabelas, políticas nem `audit_logs`.

### Inventário de publicação V7

Há **12 módulos executáveis locais**, mais este README (13 arquivos nesta pasta). O grafo transitivo a partir de `index.ts` foi executado em teste, confirmando a existência de todos os imports:

| Arquivo | Função |
| --- | --- |
| `index.ts` | Handler, autenticação, autorização, RLS, snapshot e roteamento |
| `analytics.js` | Matemática determinística; importa a política de `report-semantics.js` |
| `groq-context.js` | Contexto compacto e erros do provedor |
| `groq-policy.js` | Reserva/consumo, concorrência, limites, cache e cooldown |
| `reports.js` | Construção do relatório validado; necessário na publicação |
| `report-semantics.js` | Natureza financeira e elegibilidade de soma aprovadas em código |
| `report-intelligence.js` | Contexto, prioridades e inteligência determinística |
| `report-management.js` | Catálogo e composição gerencial V6.1 |
| `report-authored-core.js` | Schema interno, evidências, validação factual/editorial e projeções |
| `groq-authoring-wire.ts` | Schema externo estrito e conversão; importa explicitamente o core |
| `groq-authoring-contract.ts` | Revisão e diagnósticos sanitizados de contrato/validação |
| `report-authoring.ts` | Configuração, orçamento, chamada autoral, cache e revisão |

Não publicar apenas `index.ts`. `supabase/functions/deno.json` permanece a configuração do type check. O core deve ser idêntico ao espelho `public/report-authored-core.js`. O chat legado OpenAI usa Responses; a geração autoral V7 usa Chat Completions, assim como a Groq. Gemini autoral usa `generateContent`. Os três fluxos autorais mantêm validação no servidor, sem retries automáticos.

### Validação e logs V7

O schema WireV2 e `strict:true` foram preservados. O schema interno inclui IDs, ordem, prioridade e propostas aninhadas gerados pelo conversor. Claims usam apenas relações enumeradas e referências efetivamente fornecidas; espaços em torno de `|` podem ser normalizados, mas referências não são inventadas. Gráficos também ficam restritos aos indicadores enviados ao modelo.

Estrutura perigosa/incompatível, referências inexistentes, números factuais livres, claims contraditórios e riscos de segurança são bloqueantes. Partes inválidas são removidas com marcação explícita de parcialidade; nada aproveitável gera erro. Repetição, recomendação genérica, proposta recuperável, extensão e títulos são avisos de revisão/editoria, sem descarte automático. Toda geração continua exigindo confirmação humana antes da revisão local/exportação. Uma seção estritamente qualitativa identificada pode ter refs/claims vazias, desde que não afirme resultados factuais. Horizontes propostos30/60/90 dias são permitidos em limitações/propostas; isso não libera números de indicadores.

Campos seguros: `validationStage`, `validationCode`, `validationCategory`, `validationPath`, `acceptedSectionsCount`, `rejectedSectionsCount`, `reviewableIssuesCount`, `fatalIssuesCount`, `diagnosticId` e `contractRevision`. Estágios: `response_parse`, `wire_schema_validation`, `wire_expansion`, `internal_schema_validation`, `evidence_validation`, `editorial_validation`. Em erros, aparecem no envelope; em sucessos/revisões, em `validation`; logs registram o mesmo resumo. Caminhos contêm apenas nomes do contrato e índices; nunca registrar IDs/textos arbitrários, chaves, JWTs, prompts, dados corporativos ou resposta bruta. `providerStatus:200` com erro HTTP 502 da aplicação significa rejeição local, não falha/cota da Groq.

Texto preferencialmente até 1800 caracteres; acima disso permanece para revisão, até o limite seguro12000 por campo. Arrays têm proteção de40 itens e o documento interno de40 seções; o prompt prefere até 6 entradas e informa o teto total. Mais de10 seções gera aviso editorial. A resposta continua limitada a128 KiB, sem truncagem/reparo automático de JSON. Requests de revisão continuam sujeitos ao limite de corpo existente.

R$ não implica soma: natureza desconhecida/saldo não são somados; fluxo/quantidade monetária só com política aprovada em código. O catálogo real de naturezas não foi alterado. `latest` identifica a competência final, mesmo ausente; `lastValid` distingue o último registro disponível. Variações entre extremos válidos continuam descritivas e não são confundidas com dado atual.

### Configuração, validação e homologação atuais

O alvo 5120, `REPORT_V7_TOKEN_MARGIN` padrão800, orçamento dinâmico,8000 TPM,strict,medium, controle por instância e cooldown foram preservados. Não há novos Secrets obrigatórios nesta auditoria. Configuração válida anterior permanece; consultar as faixas em [orçamento dinâmico](../../../GROQ-V7-ORCAMENTO-DINAMICO-5120.md). Estimativa de entrada é bytesUTF-8/2+64, não contagem real. Uso reportado e raciocínio são medidos separadamente, sem dupla contagem. Controles locais não coordenam todos os isolates/clientes da organização.

```powershell
.\.validation-tools\deno.exe check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
.\.validation-tools\deno.exe run --allow-read --allow-write --allow-env --deny-net tests/edge-v7-integrated.test.ts
.\.validation-tools\deno.exe run --allow-read --allow-write tests/edge-v7-module-graph.test.ts
```

Executar da raiz do projeto. Só após aprovação do operador, publicar a pasta completa no projeto de homologação com `supabase functions deploy seguranca-viaria-ia --project-ref <REF_HOMOLOGACAO>`, mantendo autenticação. Atualizar conjuntamente os dois arquivos frontend `report-authored-core.js` e `report-authoring.js`; impedir novas gerações enquanto houver versões mistas. Regenerar a base após a atualização, preservando a detecção de prévia desatualizada. Não alterar banco/RLS/Secrets para esta auditoria.

Homologação definitiva: uma geração real autorizada, Groq 200/stop, servidor aceitando conteúdo factual/estrutural válido (avisos editoriais podem exigir revisão), editor disponível e PDFs Executivo/Completo exportados após confirmação humana. Escolher o fluxo manual da interface para comprovar tudo com a mesma geração; não executar também o roteiro API. O roteiro `tests/groq-v7-homologation-dynamic.ts` permanece offline sem confirmação, admite no máximo uma geração por revisão e conserva os novos sinais seguros. Sua verificação API não comprova editor/PDF automaticamente. Não repetir400/429/timeout sem nova decisão do operador.

Rollback: restaurar os módulos da versão anterior e os dois JS frontend em conjunto; republicar somente sob autorização. Backup local em `.validation-tools/v7-integrated-before/`. Nenhum Secret ou dado foi alterado; não há rollback de banco. Preservar logs e registros da tentativa e manter o relatório sem IA enquanto a homologação estiver pendente. A versão anterior volta a rejeitar alguns textos válidos e possui a elegibilidade monetária antiga: rollback é contingência operacional, não correção desse defeito.

## Contrato de contexto v1

### Camada matemática

`analytics.js` calcula estatísticas após validar o snapshot e enriquece o contexto de todos os provedores. O servidor gera a seção numérica da resposta; o modelo fornece interpretação qualitativa sem números. Texto livre com algarismos ou `%` é omitido conservadoramente. A regra não valida toda afirmação semântica. Consulte `PRECISAO-ANALITICA.md` para métodos, testes e limitações. Teste adicional: `node tests/analytics.test.mjs`. Inclua o módulo `analytics.js` na publicação da função.

O Dashboard envia `context` com `versao: 1`, `origem: "supabase"`, competências, contagens e indicadores selecionados. Limites: 18 KiB de contexto, 25 KiB de corpo total e 1000 caracteres de pergunta. As medições usam bytes UTF-8. A seleção usa até 17 KiB antes de incluir a observação de parcialidade e mantém as séries completas.

Cada indicador contém `id` (ID persistido ou `indice:N`), nome, setor, meta, unidade, direção e valores. O servidor compara esses campos com `dashboard_state` e rejeita dados adulterados/desatualizados com HTTP 409. Falha de leitura autorizada retorna 403. O estado deve ter `mesesLabels` persistido e compatível com as séries; rótulos sem ano não autorizam inferir o ano.

Os dados verificados seguem na mensagem do usuário; as regras seguem separadas em `system`, `instructions` ou `systemInstruction`. Texto livre de observação do cliente não é encaminhado. Respostas de sucesso incluem `contextVersion: 1`; o frontend detecta uma função antiga sem essa confirmação. Publique a função antes do frontend.

Antes de consultar, carregue os dados e salve eventuais edições. A interface exibe quantos indicadores selecionados foram enviados e avisa quando houve omissões por tamanho. Não há truncamento das séries. A defesa por instruções reduz prompt injection, mas não garante a fidelidade de toda resposta gerada.

Testes locais sem rede: `node tests/ia-context.test.js`, na raiz do repositório. Consulte `AUDITORIA-IA.md` para resultados, limitações e publicação.

## Secrets e variáveis de ambiente

Configure no Supabase Dashboard (**Edge Functions > Secrets**):

### Credenciais Google Gemini:
- `GEMINI_API_KEY` — obrigatório para consultas Gemini; chave obtida no Google AI Studio.
- `GEMINI_MODEL` — opcional; padrão: `gemini-3.8-flash`.

### Credenciais OpenAI:
- `OPENAI_API_KEY` — obrigatório para consultas OpenAI; chave da API OpenAI com permissão para Responses API.
- `OPENAI_MODEL` — opcional; padrão: `gpt-4o-mini` (compatível com Responses API).

### Credenciais Groq:
- `GROQ_API_KEY` — obrigatório para consultas Groq; chave obtida em console.groq.com.
- `GROQ_MODEL` — opcional; padrão: `openai/gpt-oss-120b` (MoE ~117B parâmetros, ~500 tok/s, 128k ctx).

### Configurações de Domínio e Supabase:
- `DASHBOARD_ALLOWED_ORIGINS` — opcional, mas recomendado em produção; lista de origens permitidas separadas por vírgula (ex.: `https://seu-dominio.com,https://www.seu-dominio.com`).
- `SUPABASE_URL` e `SUPABASE_ANON_KEY` — injetados automaticamente pelo ambiente Supabase Edge Function.

## Endpoints das APIs Externas

1. **Google Gemini:**
   `https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent`
   Chave enviada no cabeçalho `x-goog-api-key`.

2. **OpenAI Responses API:**
   `https://api.openai.com/v1/responses`
   Autenticação enviada via cabeçalho HTTP `Authorization: Bearer {OPENAI_API_KEY}`.

3. **Groq Chat Completions API:**
   `https://api.groq.com/openai/v1/chat/completions`
   Autenticação enviada via cabeçalho HTTP `Authorization: Bearer {GROQ_API_KEY}`.

## Proteções implementadas

- Aceita apenas método `POST` e responde preflight `OPTIONS` (CORS).
- Validação estrita do JWT consultando o Supabase Auth no servidor.
- Restrição obrigatória a e-mails corporativos terminados em `@dgranel.com.br`.
- Validação e sanitização de payload (limite de 25 KB no corpo e 1.000 caracteres no prompt).
- Limite em memória por instância (concorrência máxima de 3 requisições simultâneas e taxa de 10 chamadas/minuto por usuário).
- Timeout individual de 35 segundos em todos os provedores com `AbortController`.
- Sanitização de respostas de erro: nenhuma chave, token ou stack trace interno é retornado ao cliente ou exposto em logs.

## Implantação pelo Supabase Dashboard (sem CLI)

1. Acesse o projeto no painel do Supabase.
2. Navegue até **Edge Functions**.
3. Selecione a função `seguranca-viaria-ia` (ou crie-a caso ainda não exista).
4. Envie o conjunto completo da pasta: `index.ts`, `analytics.js`, `groq-context.js`, **`groq-policy.js`**, `reports.js`, `report-management.js`, **`report-intelligence.js`** e **`report-semantics.js`**, com esses nomes e no mesmo nível. Publicar apenas `index.ts` causa erro de módulo ausente.
5. Revise a versão e publique manualmente somente quando autorizado. Preserve as opções de autenticação da implantação atual.
6. Na atualização V6, mantenha os Secrets existentes; não é necessário criar ou alterar credenciais.

### Relatórios V5.1

Groq V5.1: `2048` tokens de conclusão e esforço `medium` nos modelos GPT-OSS; chat comum mantém `1200/low`. OpenAI/Gemini preservam seus parâmetros. Tetos, cache autorizado e controle de chamadas estão em `groq-policy.js`. O controle é por instância, não distribuído. A comparação real de qualidade ainda depende de homologação com a API.

Groq autoral V7 usa alvo `5120`, margem padrão `800` e limite efetivo dinâmico dentro de8000 TPM. `REPORT_V7_COMPLETION_TOKENS` aceita inteiros4096–7168; valor presente inválido bloqueia a geração, sem fallback2048. `REPORT_V7_TOKEN_MARGIN` aceita400–1600. Limites separados reais podem ser configurados em `REPORT_V7_GROQ_INPUT_TPM`/`REPORT_V7_GROQ_OUTPUT_TPM`. Consultar [diagnóstico, publicação, homologação única e rollback](../../../GROQ-V7-ORCAMENTO-DINAMICO-5120.md); nenhuma alteração local publica código ou Secrets automaticamente.

Auditoria, medições, testes e procedimento separado de publicação: [GROQ-V5-1-RELATORIOS.md](../../../GROQ-V5-1-RELATORIOS.md).


## Relatórios V6.1

Os formatos Executivo e Completo usam a mesma base. A V6.1 acrescenta o módulo local `report-semantics.js` e o campo opcional fechado `jointObservations` ao contrato gerencial V4, sem invalidar respostas anteriores. A classificação financeira inicia pendente; saldos não são tratados como fluxo. Consulte `RELATORIOS-V6-1-EXECUTIVO.md`. Publique os oito módulos da função juntos; não há migração nem novo Secret.
