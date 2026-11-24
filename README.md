# Dashboard Operacional D’Granel

O dashboard está em `public/`. A Central de IA e os relatórios gerenciais usam a Edge Function `seguranca-viaria-ia` no Supabase.

## IA e relatórios

- A Central recebe uma pergunta e usa um recorte dos indicadores autorizados para responder com Groq.
- **Gerar análise com IA** prepara a prévia, interpreta os indicadores e apresenta propostas com área sugerida, prazo e acompanhamento. As seções citam evidências do recorte. O dashboard projeta números e metas diretamente da base.
- Em **Preparar sem IA**, a prévia é calculada a partir do snapshot do Supabase e pode ser exportada diretamente.
- A análise com IA passa por revisão antes da exportação. A sessão corporativa, o recorte e o snapshot são conferidos no servidor. O acesso aos dados usa o token do usuário e as políticas RLS.

## Configuração e publicação

No painel do Supabase, confirme o Secret `GROQ_API_KEY` que já está em uso. A função usa `openai/gpt-oss-120b` por padrão. O Secret opcional `GROQ_MODEL` também aceita `openai/gpt-oss-20b`. Use `DASHBOARD_ALLOWED_ORIGINS` para configurar origens separadas por vírgula.

A partir da raiz do repositório, com a CLI autenticada no projeto correto, publique a função e em seguida o conteúdo de `public/`.

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref <PROJETO>
```

Entre com uma conta corporativa, faça uma pergunta na Central e gere, revise e exporte um relatório. Depois de confirmar os dois fluxos, remova a função antiga `seguranca-viaria-groq-v2` no mesmo projeto, caso ainda esteja publicada. [Publicação de Edge Functions no Supabase](https://supabase.com/docs/guides/functions/deploy) · [Structured Outputs da Groq](https://console.groq.com/docs/structured-outputs)

## Testes locais

```powershell
deno check supabase/functions/seguranca-viaria-ia/index.ts tests/groq-edge.test.ts
deno run --deny-net tests/groq-edge.test.ts
deno run tests/analytics.test.mjs
deno run tests/reports.test.mjs
deno run --allow-read --allow-write=.validation-tools --deny-net tests/pdf.test.mjs
deno run --allow-read --allow-write=.validation-tools --deny-net tests/reports-browser.ts
```

Abra `.validation-tools/reports-browser.html` para conferir a Central, a prévia, a recuperação após falha da Groq, a revisão e os dois formatos de PDF com dados fictícios. O teste da Edge simula Supabase e Groq.
