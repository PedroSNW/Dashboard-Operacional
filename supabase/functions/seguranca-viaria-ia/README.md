# Supabase Edge Function: seguranca-viaria-ia
D'Granel Transportes — Central de Inteligência Artificial (Etapa 1)

Esta função realiza a ponte entre o Dashboard Operacional da D'Granel e a Gemini API do Google. A função valida o usuário no Supabase Auth e mantém a chave Gemini exclusivamente nos Secrets do servidor.

## Arquitetura

Dashboard (Browser)
→ Supabase Edge Function `seguranca-viaria-ia`
→ validação do JWT via `supabase.auth.getUser(token)`
→ leitura de `GEMINI_API_KEY` nos Secrets
→ Gemini API (`v1beta`, `generateContent`)
→ resposta ao Dashboard

A função não lê nem altera `dashboard_state`, `audit_logs` ou os indicadores.

## Secrets e variáveis

Configure no Supabase Dashboard:

- `GEMINI_API_KEY` — obrigatório; chave criada no Google AI Studio.
- `GEMINI_MODEL` — opcional; padrão `gemini-3.8-flash`.
- `DASHBOARD_ALLOWED_ORIGINS` — opcional, mas recomendado em produção; lista de origens permitidas separadas por vírgula, por exemplo `https://seu-dominio.com,https://www.seu-dominio.com`.

As variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` são fornecidas pelo ambiente da Edge Function do Supabase.

Se `DASHBOARD_ALLOWED_ORIGINS` não estiver configurada, a função usa `Access-Control-Allow-Origin: *` para facilitar o primeiro teste. Configure a lista de origens antes de disponibilizar a função em produção. CORS não substitui autenticação.

## Proteções implementadas

- Aceita apenas `POST` e trata preflight `OPTIONS`.
- Valida o JWT consultando o Supabase Auth no servidor.
- Restringe o acesso a e-mails terminados exatamente em `@dgranel.com.br`.
- Limita o corpo a 25 KB e o prompt a 1.000 caracteres.
- Rejeita JSON inválido e prompts vazios ou acima do limite.
- Timeout de 15 segundos na chamada à Gemini API.
- Limite local de 3 chamadas simultâneas por instância.
- Limite local de 10 chamadas por usuário por janela de 60 segundos.
- Não retorna stack trace ou mensagens internas inesperadas ao navegador.
- Não executa operações no banco de dados do Dashboard.

**Limitação dos limites locais:** Supabase Edge Functions podem atender requisições em várias instâncias. Os limites de concorrência e frequência implementados em memória são proteções básicas por instância e não constituem rate limiting global/distribuído. Para controle global em produção, será necessário um mecanismo compartilhado (por exemplo, Redis/Upstash ou uma solução persistente com operação atômica).

## Endpoint Gemini

A função utiliza:

`https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent`

A chave é enviada no cabeçalho `x-goog-api-key`, nunca na URL nem ao frontend.

Modelo padrão configurado: `gemini-3.8-flash`. Confirme a disponibilidade e as cotas do modelo no projeto Google AI Studio antes do teste real.

## Implantação pelo Supabase Dashboard (sem CLI)

1. Abra o projeto no Supabase Dashboard.
2. Entre em **Edge Functions**.
3. Crie ou abra a função `seguranca-viaria-ia`.
4. Cole o conteúdo do `index.ts` revisado.
5. Publique a função.
6. Em **Edge Functions > Secrets**, configure `GEMINI_API_KEY`.
7. Configure `GEMINI_MODEL` apenas se desejar substituir o padrão.
8. Configure `DASHBOARD_ALLOWED_ORIGINS` com a origem real do Dashboard antes da produção.

## Testes pendentes

Após publicar e configurar os Secrets, testar:

1. `OPTIONS` com origem permitida e origem não permitida.
2. `POST` sem JWT (esperado: 401).
3. `POST` com JWT inválido/expirado (esperado: 401).
4. Conta fora do domínio corporativo (esperado: 403).
5. JSON inválido, corpo acima de 25 KB e prompt acima de 1.000 caracteres.
6. Limite local de frequência e concorrência.
7. Chamada autenticada com `GEMINI_API_KEY` e modelo válidos.
8. Confirmar nos logs que não há chave, JWT ou stack trace expostos.

Nenhum teste de integração com Supabase ou Gemini é declarado como executado por este arquivo.
