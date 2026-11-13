# Correção específica de HTTP 413 — 13/11/2026

## Diagnóstico confirmado

Os logs fornecidos confirmam rejeição HTTP 413 da Groq, convertida em 502 pela versão publicada. OPTIONS 204 corresponde a preflight permitido, não comprova sucesso da chamada à IA. A Groq documenta 413 como requisição grande demais, separadamente de 429: [erros oficiais](https://console.groq.com/docs/errors).

O código que produzia `Groq API error response { status: 413 }` não tratava 413 e caía no fallback 502. O código local da etapa anterior já continha tratamento específico com marcador diferente (`Groq API error`); isso indica possível divergência de versão publicada. Não foi acessado o servidor para confirmar sua versão.

A origem comprovada da expansão no código é o enriquecimento depois do limite frontend/Edge: série original mais valores repetidos em objetos mensais, desvios e textos redundantes. A compactação anterior retirava redundâncias, mas só limitava uma estimativa de tokens das mensagens, sem teto explícito para o corpo completo, e ainda podia preencher o orçamento com indicadores pouco relacionados. Essas lacunas foram corrigidas.

O corpo original de erro da Groq e o payload real de produção não foram fornecidos. Portanto, não é possível recuperar seu tamanho exato ou o limite efetivo que o provedor aplicou a partir do status isolado. As medições abaixo são bytes exatos de serializações de fixtures, não medições da requisição de produção.

## Correção aplicada

- `groq-context.js`: teto ajustável de **6000 bytes do corpo completo**, entrada estimada de 3500 tokens com margem interna de 400, saída máxima de 1200 tokens. Há reserva de 512 bytes para o envelope fora das mensagens, seguida de conferência exata do envelope real em `index.ts`. Esses são limites locais de engenharia, não limites oficiais da Groq.
- Seleção por palavras relevantes e temas (acidentes/sinistros, multas/autuações, documentação/CRLV, velocidade, score). Perguntas gerais admitem recorte informado. Perguntas de acidentes não enviam outros temas só porque ainda há espaço.
- Estatísticas temporais (primeiro/último e tendência) são acrescentadas ao modelo quando a pergunta pede evolução/comparações ou visão geral. A camada matemática completa permanece preservada no servidor e na resposta.
- Nomes, setores, unidades, metas, direção, competências e identificação permanecem. Os valores originais seguem uma vez. Se uma série completa não cabe, tenta-se resumo explicitamente identificado; indicadores omitidos são contados. Não há corte arbitrário de séries ou JSON, arredondamento de dados para compactar, compressão opaca ou alteração de snapshot.
- A mesma string `groqBody` é medida em UTF-8 e passada ao `fetch`. A conferência ocorre antes da rede. As mensagens são somente sistema e pergunta com contexto; **não há histórico de chat** sendo reenviado.
- 413 upstream retorna 413 com orientação específica para reduzir o escopo, sem retry idêntico e sem recomendar apenas aguardar. 429 mantém classificação, `retry-after` e cooldown local por instância.
- Logs de erro incluem status, código em allowlist, categoria, request ID validado, `requestBytes`, `inputBytes`, `systemBytes`, `messageCount`, `sentIndicators` e estimativa de tokens. Não registram indicadores, prompts, JWT ou API keys.
- Sucesso retorna `meta.requestBytes`, `sentIndicators` e `contextBuild: "groq-compact-bytes-v2"`, permitindo conferir o caminho publicado. `meta.inputBytes` continua significando bytes das mensagens; não deve ser confundido com corpo completo.

A estimativa continua sendo bytes UTF-8 das mensagens divididos por dois mais overhead de 64 tokens. Não é um tokenizer e não garante contagem exata. O tamanho do corpo é exato; o consumo real de tokens é o retornado pela Groq. A redução de contexto não garante que toda cota por minuto da organização será respeitada por vários usuários.

## Medições do corpo completo

Modelo de fixture: `openai/gpt-oss-120b`. Antes: instruções longas, contexto analítico completo, saída 4096. Depois: envelope compacto, saída 1200, raciocínio baixo. Os bytes incluem nome do modelo e todos os parâmetros JSON, sem cabeçalhos HTTP.

| Fixture | Bytes antes | Bytes depois | Indicadores enviados depois |
| --- | ---: | ---: | --- |
| Dois indicadores, nove competências, acidentes | 9107 | 2405 | Dois, sem omissão |
| Dez indicadores, consulta de todos | 33328 | 5414 | Cinco, cinco omitidos e informados |
| 75 disponíveis, pergunta de acidentes | 297221 | 2462 | Dois de acidentes, demais fora da interpretação |
| 75 indicadores, pergunta geral | 297232 | 5523 | Cinco, setenta omitidos e informados |
| Dois indicadores, 120 competências | 65764 | 4478 | Dois, sem cortar séries |

Os cenários grandes são testes de estresse do construtor no servidor; não significam que esses conjuntos completos ultrapassariam a seleção inicial de 18 KiB do frontend. Os números determinísticos completos do contexto original recebido continuam na resposta, inclusive quando a interpretação é parcial.

## Testes executados

Todos passaram no Deno 2.9.8:

1. Dois indicadores e nove competências: relevância, JSON válido e corpo completo abaixo do teto.
2. Dez indicadores: seleção parcial explicitamente informada.
3. Todos os indicadores: corpo abaixo do teto, sem alteração do contexto original.
4. Perguntas gerais: recorte determinístico informado.
5. Contextos acima do orçamento: resumo sinalizado ou rejeição local segura quando impossível.
6. Valores nulos, meta zero, precisão das estatísticas e séries completas.
7. 413 simulado no handler completo: retorna 413, mensagem específica, registra tamanho e efetua exatamente uma chamada.
8. 429 simulado: respeita `retry-after`, retorna cabeçalho e bloqueia nova chamada durante cooldown.
9. Suite matemática anterior: médias, somas, extremos, variações e demais cenários preservados.
10. Handler dos três provedores: snapshot validado → cálculos → payload → resposta; Gemini/OpenAI preservados.

Também passaram os nove cenários anteriores, dez cenários do handler completo (incluindo 400, timeout e parsing), sanitização dos logs, type check estrito da Edge com dependências reais em cache e `git diff --check`. Timeout é simulado por AbortError; não foi feita chamada à API real nem novo teste visual nesta rodada.

## Arquivos e publicação

Correção local em `index.ts`, `groq-context.js`, `tests/groq-budget.test.mjs`, `tests/edge-handler.test.ts` e relatórios. As adaptações da etapa anterior em `tests/ia-context.test.js` permanecem. `analytics.js` e o frontend foram preservados. Nenhum banco, RLS, Secret ou indicador foi alterado. Não houve deploy.

No editor Supabase da função existente `seguranca-viaria-ia`, publicar **os três arquivos na mesma pasta**:

```text
index.ts
analytics.js
groq-context.js
```

Substituir pelo conteúdo local atual, preservar os imports relativos e então clicar em Deploy. Não colar somente `index.ts`.

Alternativa CLI autenticada no projeto correto, na raiz do repositório:

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

Não executar comandos de Secrets, migrações ou alterações de autenticação. Não é necessário republicar a Vercel por esta mudança de backend.

Após publicação autorizada, testar a pergunta simples sobre acidentes. Em sucesso, conferir `meta.contextBuild === "groq-compact-bytes-v2"`, `meta.requestBytes <= 6000` e `meta.sentIndicators`. Se ainda houver 413, consultar o novo log `Groq API error`, anotando somente status, código, request ID e métricas de tamanho. Se aparecer o marcador antigo ou 413 upstream virar 502, conferir se a função correta foi atualizada. A validação real de credenciais, limites da conta e respostas do modelo continua pendente; não há garantia de sucesso remoto baseada somente em mocks.
