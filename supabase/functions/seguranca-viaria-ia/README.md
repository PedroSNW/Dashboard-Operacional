# Supabase Edge Function: seguranca-viaria-ia
D'Granel Transportes — Central de Inteligência Artificial Multiprovedor (Gemini & OpenAI)

Esta função realiza a ponte segura entre o Dashboard Operacional da D'Granel e os provedores oficiais de Inteligência Artificial: **Google Gemini API** e **OpenAI Responses API**. 

A função valida o token JWT do usuário no Supabase Auth corporativo e mantém todas as credenciais de API exclusivamente nos Secrets protegidos do servidor.

## Arquitetura

Dashboard (Browser)
→ Supabase Edge Function `seguranca-viaria-ia`
→ Validação do JWT via `supabase.auth.getUser(token)`
→ Verificação de domínio corporativo (`@dgranel.com.br`)
→ Roteamento por provedor selecionado no payload (`provider: "gemini" | "openai"`):
   - **Google Gemini**: Leitura de `GEMINI_API_KEY` → chamada à Gemini API (`generateContent`) com retry para 503 e timeout individual de 35s.
   - **OpenAI**: Leitura de `OPENAI_API_KEY` → chamada à Responses API oficial (`https://api.openai.com/v1/responses`) com autenticação Bearer e timeout de 35s.
→ Retorno estruturado e sanitizado ao Dashboard.

A função não lê nem altera `dashboard_state`, `audit_logs` ou os indicadores cadastrados no banco.

## Secrets e variáveis de ambiente

Configure no Supabase Dashboard (**Edge Functions > Secrets**):

### Credenciais Google Gemini:
- `GEMINI_API_KEY` — obrigatório para consultas Gemini; chave obtida no Google AI Studio.
- `GEMINI_MODEL` — opcional; padrão: `gemini-3.8-flash`.

### Credenciais OpenAI:
- `OPENAI_API_KEY` — obrigatório para consultas OpenAI; chave da API OpenAI com permissão para Responses API.
- `OPENAI_MODEL` — opcional; padrão: `gpt-4o-mini` (compatível com Responses API).

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

## Proteções implementadas

- Aceita apenas método `POST` e responde preflight `OPTIONS` (CORS).
- Validação estrita do JWT consultando o Supabase Auth no servidor.
- Restrição obrigatória a e-mails corporativos terminados em `@dgranel.com.br`.
- Validação e sanitização de payload (limite de 25 KB no corpo e 1.000 caracteres no prompt).
- Limite em memória por instância (concorrência máxima de 3 requisições simultâneas e taxa de 10 chamadas/minuto por usuário).
- Timeout individual de 35 segundos em ambas as APIs com `AbortController`.
- Sanitização de respostas de erro: nenhuma chave, token ou stack trace interno é retornado ao cliente ou exposto em logs.

## Implantação pelo Supabase Dashboard (sem CLI)

1. Acesse o projeto no painel do Supabase.
2. Navegue até **Edge Functions**.
3. Selecione a função `seguranca-viaria-ia` (ou crie-a caso ainda não exista).
4. Substitua o código pelo conteúdo de `supabase/functions/seguranca-viaria-ia/index.ts`.
5. Salve e implante a função.
6. Em **Edge Functions > Secrets**, cadastre `GEMINI_API_KEY` e `OPENAI_API_KEY`.
