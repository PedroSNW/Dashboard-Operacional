# Validação técnica final — 12/11/2026

Referência inicial limpa no Git: `26980da`. Nenhuma leitura autenticada de produção, escrita de dados, migração, alteração de RLS, Secrets ou deploy foi feita. Foi baixado, com autorização, Deno oficial portátil para `.validation-tools/`, ignorado no Git. Não publicar essa pasta.

## Resultados executados

Ambiente: Windows, Deno 2.9.8, V8 15.0.245.2-rusty, TypeScript 6.0.3. Não havia configuração Deno no projeto: foi adicionada `supabase/functions/deno.json`, com `strict: true` e tarefa `check`. Não foram desativadas verificações de tipos ou validações de certificados. Dependências reais foram obtidas com acesso autorizado; a repetição final usou cache local.

| Verificação | Resultado e alcance |
| --- | --- |
| Type check Edge | **Passou**, `deno check --config supabase/functions/deno.json --cached-only supabase/functions/seguranca-viaria-ia/index.ts` |
| Sintaxe/integração de imports locais | **Passou**, `deno check --no-remote public/main.js supabase/functions/seguranca-viaria-ia/analytics.js tests/ia-context.test.js tests/analytics.test.mjs tests/edge-handler.test.ts tests/browser-smoke.ts`. Arquivos JS são analisados/importados sem habilitar `checkJs`; isto não equivale a tipagem estrita de todo o frontend |
| Analytics A | **Passou**: soma 125, média 125/9, máximo 21, mínimo 8, maio 51,2% acima da média |
| Analytics B | **Passou**: soma 345, média 345/9, máximo 49, oito meses acima da meta de teste 30 |
| Analytics C | **Passou**: 10/null/0/20 → soma 30, média 10, três válidos e um ausente |
| Analytics D/E | **Passou**: meta/base zero, direção neutra/indefinida |
| Analytics F/H/I/K | **Passou com dados de teste**: contexto parcial, revisão retroativa, taxa sem denominador e meta do snapshot recebido. K não é comprovação de dados de produção |
| Analytics adicionais | **Passou**: pontos percentuais, ordem cronológica, competências incompatíveis, posições ausentes, meta ausente, rejeição de números livres e overflow |
| Bloco real de enriquecimento/composição | **Passou**: estatísticas calculadas integram o contexto e a seção numérica |
| Suite anterior: origem | **Passou**: bloqueia dados não carregados/edições pendentes e fallback de leitura inválida |
| Suite anterior: seleção | **Passou**: acidentes/sinistros, multitemas e setores distintos |
| Suite anterior: payload | **Passou**: UTF-8, seleção parcial e preservação das séries |
| Suite anterior: Edge | **Passou com mocks**: validação do snapshot e rejeição de adulteração/leitura negada |
| Suite anterior: três provedores | **Passou com mocks**: dados separados das instruções |
| Suite anterior: resposta/nulos/interface | **Passou**: interpretação do contrato, rejeição de backend antigo, null/zero e vínculos estáticos |
| Handler completo: CORS/método | **Passou**: OPTIONS permitido 204, origem proibida 403, GET 405 |
| Handler completo: autenticação | **Passou com Auth simulado**: Bearer ausente/inválido 401, sem ler o snapshot |
| Handler completo: payload | **Passou**: corpo UTF-8 excessivo 413, JSON inválido 400 |
| Handler completo: autorização/dados | **Passou com RLS simulada**: leitura negada 403, valores adulterados 409 e nenhuma chamada ao provedor |
| Handler completo: Groq | **Passou com fetch simulado**: API recebe soma 345 e oito valores acima da meta; resposta traz 345, 38,33 e `contextVersion: 1` |
| Handler completo: OpenAI/Gemini | **Passou com fetch simulado**, mesmo percurso de cálculo e serialização |
| Handler completo: contrato inválido | **Passou**: parcialidade inconsistente 400, provedor inválido 400 e prompt com 1001 caracteres 413 |
| Handler completo: erro Groq | **Passou**: HTTP 429 retorna erro sanitizado |
| Navegador real | **Passou no Chrome headless**, cópia isolada do HTML/JS reais com CSP sem rede e mocks: inicialização sem sessão, payload Groq, `textContent`, contagem 1/1, botão reativado e nenhum erro JS |
| Whitespace | **Passou**, `git diff --check` |

As suítes anteriores contêm nove cenários; a nova suite do handler completo contém nove cenários. A suite de analytics mantém os casos nomeados e verificações adicionais, sem anunciar um total artificial de asserts.

## Como os testes do handler funcionam

`tests/edge-handler.test.ts` compila e executa uma cópia temporária do handler TypeScript completo, substituindo somente os imports externos de `serve`/`createClient` e o transporte `fetch`. O módulo analítico real é importado. Não há permissão de rede; Request/Response, parsing JSON, limites do corpo, CORS, regras de autenticação, validação, enriquecimento, payloads de provedores e resposta final são executados pelo Deno. As variáveis locais de teste são restauradas no fim. Isso não testa o gateway Supabase nem suas bibliotecas em execução real; o type check usa os imports reais.

O primeiro teste de navegador falhou por um erro na montagem da cópia de teste: `String.replace` interpretava sequências `$` do código incluído. Corrigido o gerador para usar callback, a repetição passou. Não era uma falha do `public/main.js`. Esse smoke usa Chart/Supabase simulados e não comprova desenho de gráficos, CDN, layout visual completo ou operações autenticadas.

## Correções desta validação

- `index.ts`: verifica consistência entre contagens e `contextoParcial`, rejeita metas não numéricas/não finitas, remove instrução conflitante que pedia ao modelo repetir números e deixa de registrar a mensagem livre de erro do Gemini.
- `analytics.js`: impede `Infinity`/`NaN` nos resultados de soma, variações e desvios; tenta média numericamente representável quando só a soma ultrapassa o limite. Resultado fora da faixa numérica é indisponível e não gera sequência de melhora/piora. Testes de regressão adicionados.
- `supabase/functions/deno.json`: configuração explícita para o type check estrito da Edge.
- `tests/analytics.test.mjs`: casos extremos adicionados.
- `tests/edge-handler.test.ts` e `tests/browser-smoke.ts`: novos testes.
- `.gitignore`: exclui executável, cache, perfil e artefatos locais de validação.

O frontend não precisou ser alterado nesta validação: o contrato `success`, `response`, `meta` e `contextVersion: 1` foi preservado e testado até a exibição no DOM. O cálculo é chamado depois da autenticação e da igualdade com o snapshot lido usando o JWT do usuário; nenhum exemplo de teste é instalado como dado do Dashboard. CORS sem `DASHBOARD_ALLOWED_ORIGINS` continua permitindo `*`, com autenticação obrigatória; não alteramos a configuração do servidor. Rate limit continua por instância.

## Reprodução

Na raiz, com Deno instalado (ou substituindo `deno` por `.\.validation-tools\deno.exe`):

```powershell
deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
deno run --allow-read tests/analytics.test.mjs
deno run --allow-read tests/ia-context.test.js
New-Item -ItemType Directory -Force .validation-tools
deno run --allow-read --allow-write=.validation-tools --allow-env=SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_PUBLISHABLE_KEYS,GROQ_API_KEY,OPENAI_API_KEY,GEMINI_API_KEY,DASHBOARD_ALLOWED_ORIGINS,GROQ_MODEL,OPENAI_MODEL,GEMINI_MODEL tests/edge-handler.test.ts
deno run --allow-read --allow-write=.validation-tools tests/browser-smoke.ts
git diff --check
```

A última fixture deve ser aberta num Chrome headless com perfil separado, `--dump-dom --virtual-time-budget=3000`, por URL `file:///.../.validation-tools/browser-smoke.html`. O DOM final precisa conter `pre#validation-result` com `PASS`. Abrir a fixture não abre o Dashboard de produção; a CSP bloqueia conexões externas.

## Arquivos a publicar e sequência exata

**Supabase:** publicar juntos `supabase/functions/seguranca-viaria-ia/index.ts` e `supabase/functions/seguranca-viaria-ia/analytics.js`. No editor web da função existente `seguranca-viaria-ia`, substituir o conteúdo de ambos os arquivos, na mesma pasta, e então usar Deploy. O import deve permanecer `./analytics.js`; não publicar só `index.ts`.

Alternativa CLI, na raiz, com Supabase CLI instalada e sessão autorizada no projeto correto:

```powershell
supabase login
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

Preservar as configurações existentes de autenticação, origens e Secrets. Não usar comandos de migração, de banco ou de Secrets. A configuração Deno e os testes devem acompanhar o repositório para validação futura; não precisam ser colados no editor web. [Documentação oficial Supabase](https://supabase.com/docs/guides/functions/deploy).

**Vercel:** nenhum arquivo de frontend mudou nesta rodada. Se a versão de precisão analítica anterior já está publicada, não é necessário republicar a Vercel por este patch de backend. Se ainda não está, publicar a pasta `public` atual, incluindo `index.html`, `main.js`, `style.css` e os assets existentes. No projeto Vercel existente: preset `Other`, saída `public`, sem build para o frontend estático. Pelo CLI já vinculado ao projeto correto:

```powershell
vercel deploy
# Depois de validar o preview e obter autorização de produção:
vercel deploy --prod
```

Não enviar `.validation-tools`, testes ou relatórios como conteúdo público. Não houve push nem deploy neste trabalho. [Documentação oficial Vercel](https://vercel.com/docs/cli/deploy).

## O que ainda exige ambiente real

1. Token corporativo real, gateway de JWT, políticas RLS efetivas e leitura do snapshot autorizado. Não foi testada produção.
2. Segredos, modelo disponível, limites de cota, latência, timeout/retry e respostas reais de Groq, Gemini e OpenAI. As APIs foram simuladas; não há declaração de chamada real aprovada.
3. Valores/metas atuais comparados à resposta numa sessão autenticada. O modelo ainda pode errar interpretações qualitativas; o filtro de algarismos não valida todo o significado da prosa.
4. CORS com a origem real e o valor efetivo de `DASHBOARD_ALLOWED_ORIGINS`.
5. Gráficos com Chart.js real, aparência, filtros, alertas, importação/exportação e persistência em homologação. Não escrever dados de exemplo em produção.
6. Compatibilidade exata com a versão Deno utilizada pelo runtime Supabase e empacotamento no serviço. O type check local passou em Deno 2.9.8; o deploy real não foi executado.
