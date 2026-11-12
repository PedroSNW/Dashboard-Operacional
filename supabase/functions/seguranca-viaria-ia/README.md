# Supabase Edge Function: seguranca-viaria-ia
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
4. Substitua o código pelo conteúdo de `supabase/functions/seguranca-viaria-ia/index.ts`.
5. Salve e implante a função.
6. Em **Edge Functions > Secrets**, cadastre os Secrets necessários:
   - `GEMINI_API_KEY` (Gemini)
   - `OPENAI_API_KEY` (OpenAI)
   - `GROQ_API_KEY` (Groq — obtenha em console.groq.com)
