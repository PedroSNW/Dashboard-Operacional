# Precisão analítica — 12/11/2026

## Causas e solução

Referência preservada no Git: `55ca8a5`. A integração existente já entregava dados reais aos provedores, mas deixava a aritmética no texto livre do modelo. Instruções não garantiam médias, percentuais ou contagens corretas. Além disso, `calcMetrics` ainda inferia direção pelo nome. Não houve alterações de dados, políticas, Secrets, migrações ou deploy.

Arquivos alterados: `supabase/functions/seguranca-viaria-ia/analytics.js` (novo), `index.ts` no mesmo diretório, `public/main.js`, `tests/analytics.test.mjs` (novo), README da função e este relatório.

A Edge mantém a seleção atual, autenticação e conferência do snapshot autorizado no Supabase. Só depois dessa conferência calcula estatísticas, acrescenta-as ao contexto e encaminha o mesmo conjunto aos três provedores. IDs, valores originais e metadados não são substituídos por exemplos. A atualização informada ao modelo passa a vir do snapshot do servidor. A composição final gera a seção numérica diretamente do cálculo e acrescenta a interpretação qualitativa do modelo. Nenhuma dependência foi adicionada.

O contrato frontend e seus limites permanecem: contexto de entrada até 18 KiB e corpo até 25 KiB, com medição UTF-8. O enriquecimento acontece no servidor, depois desse limite de entrada, e aumenta o tamanho encaminhado ao provedor. Consultas gerais podem produzir respostas extensas; a cobertura é declarada, sem truncar séries.

## Cálculos determinísticos

- Soma apenas para unidades reconhecidamente aditivas; não soma percentuais, taxas, score ou unidades desconhecidas.
- Média dos valores numéricos finitos, mínimo/máximo e todas as competências empatadas; contagem de valores válidos/ausentes, preservando zero.
- Variação entre competências mensais adjacentes com dados e entre primeiro/último valor válido. Lacunas não viram evidência de melhora. Base zero gera percentual indisponível.
- Diferença em pontos percentuais separada da variação percentual relativa.
- Meta atual, inclusive zero; contagens acima/abaixo/igual e desvios absolutos/relativos em relação à meta.
- Desvio percentual de cada valor em relação à média.
- Ordenação cronológica de competências reconhecidas; mistura de rótulos com e sem ano ou competências duplicadas suspende comparações temporais. Rótulos sem ano só são ordenados dentro de um ciclo anual; não autorizam inferir um ano nem uma passagem entre anos.
- Sequências de melhora/piora apenas com direção cadastrada e meses consecutivos. Neutro/indefinido não recebe julgamento. Método de tendência é explicitamente comparação descritiva primeiro/último, sem inferência causal ou significância estatística.

Médias de taxas são identificadas como médias simples mensais, nunca taxas agregadas ponderadas. Não se calculam taxas por quilometragem sem denominadores. Não há agregação entre indicadores. Arredondamento ocorre na exibição, com até duas casas decimais; valores internos não são previamente arredondados.

## Confiabilidade e preservação

A resposta exibida continua usando o campo `response` e `textContent`, preservando chat, botões e provedores. Groq mantém endpoint, autenticação e modelo existentes. As regras comuns exigem separar fatos, interpretações, hipóteses e recomendações; vedam causas presumidas, limites oficiais inventados, resultados individuais, fechamento de competências e bloqueio de retroatividade. Há cautela explícita para mortes e lesões.

Os números da seção calculada não dependem da resposta do modelo. O texto qualitativo com algarismos Unicode ou `%` é recusado conservadoramente e substituído por aviso, sem apagar os cálculos. Isso pode descartar uma interpretação útil que mencione uma competência numerada. Não é um validador semântico universal: números escritos por extenso, causalidade ou recomendações inadequadas ainda exigem revisão humana. Não prometemos tornar infalível a saída de um modelo.

`calcMetrics` deixou de inferir direção pelo nome. Cartões/tabelas sem direção ou com direção neutra apresentam status `N/A`; a classificação depende da configuração humana existente. Não foram alterados cadastros nem metas.

## Testes

Executados no V8 da ferramenta, usando as fontes reais e mocks, sem chamadas externas:

| Caso | Resultado |
| --- | --- |
| A: acidentes com culpa | Soma 125, média 125/9, mínimo 8, máximo 21 e maio 51,2% acima da média |
| B: total de acidentes | Soma 345, média 345/9, máximo 49; oito valores acima da meta de teste 30 |
| C: 10, null, 0, 20 | Soma 30, média 10, três válidos, um ausente |
| D/E | Meta zero preservada, percentuais de base zero indisponíveis; neutro/indefinido sem sequências classificadas |
| F | Omissão por tamanho sinalizada; cobertura não equivale à completude dos meses |
| G | Suite anterior confirma payload Groq com contexto verificado; novo teste executa o bloco real de enriquecimento e composição da Edge |
| H | Revisão do valor de janeiro recalcula a soma, sem bloqueio por existir setembro |
| I | Taxa por milhão de km não é somada e a média é identificada como não ponderada |
| J | Nove cenários anteriores passaram novamente, incluindo sintaxe frontend, seleção, payload e vínculos da interface |
| K | Mocks confirmam rejeição de snapshot adulterado e uso da meta fornecida; não houve consulta autenticada à produção |

Também passaram ordenação, competências incompatíveis, meta ausente, posições sem valor e rejeição de números livres. Os exemplos A/B existem somente no arquivo de testes. Nenhum foi instalado no Dashboard.

Node/Deno não estão disponíveis neste ambiente. No V8, imports/exports e apenas as assertions TypeScript necessárias aos blocos testados foram removidos para avaliação; foi usado o contador UTF-8 da suite anterior. Não houve execução completa do runtime Deno, teste visual, persistência real ou chamada a Groq/Gemini/OpenAI. A cobertura J é sintática e por mocks; não comprova todos os gráficos ou fluxos de produção.

Reprodução na raiz, com Node moderno e Deno disponíveis:

```powershell
node tests/analytics.test.mjs
node tests/ia-context.test.js
deno check supabase/functions/seguranca-viaria-ia/index.ts
git diff --check
```

## Publicação e intervenção humana

Somente após autorização, usando o projeto existente e suas configurações de autenticação:

```powershell
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

O deploy deve incluir o novo `analytics.js`, importado por `index.ts`; não publicar apenas o conteúdo isolado do arquivo principal. Não executar migrações ou comandos de Secrets. Depois, na Vercel existente, manter preset `Other`, saída `public`, sem build de frontend; publicar pelo fluxo aprovado ou `vercel deploy` para preview e, após aprovação, `vercel deploy --prod`. Conferir o vínculo antes de usar o CLI. Referências: [Supabase](https://supabase.com/docs/guides/functions/deploy), [Vercel](https://vercel.com/docs/cli/deploy).

Pendências: executar o type check no ambiente apropriado, homologar com usuário corporativo e metas atuais, conferir os cálculos contra a tabela e testar gráficos, alertas, importação/exportação e recarregamento em homologação. Conferir a utilidade/volume das respostas gerais e a cota de tokens existente. Políticas RLS, concorrência entre usuários e competências legadas ambíguas permanecem nos limites descritos em `AUDITORIA-IA.md`. Decisões sobre direção e metas continuam exclusivamente humanas.
