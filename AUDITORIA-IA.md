# Auditoria da Central de IA — 12/11/2026

## Resultado e causa

Correções locais implementadas; sem deploy, chamadas reais aos provedores ou alterações de dados, Secrets, tabelas e RLS. Estado inicial do Git limpo; referência anterior às alterações: `d74773c` (`Fix bugs Groq`).

A versão local original já incluía `context` na requisição e o incorporava às instruções enviadas a Groq, Gemini e OpenAI. Portanto, não há evidência local de que o backend simplesmente descartasse esse campo. Não foi possível determinar a causa exata da resposta observada em produção sem comparar a função publicada, a versão servida pelo navegador e uma requisição autenticada real. Publicação desatualizada é hipótese, não causa comprovada.

Falhas comprovadas no código: carregamento remoto inválido podia instalar `initialData`; IA não verificava se `currentData` vinha de uma leitura bem-sucedida ou continha edições pendentes; backend aceitava qualquer objeto como contexto, sem conferir indicadores autorizados; dados operacionais eram concatenados nas instruções privilegiadas; não havia confirmação do contrato implantado. A seleção por temas já existia, assim como medição UTF-8; essas partes foram preservadas e reforçadas.

## Fluxo corrigido

1. Login inicia indicadores vazios; leitura remota válida instala os indicadores reais. Falha exibe aviso, bloqueia gravação e consulta de IA, sem instalar exemplos. Logout limpa o conjunto da memória. Restauração de padrões continua sendo uma ação explícita da interface.
2. Consulta exige leitura remota válida e nenhuma edição pendente. Seleção normaliza acentos, prioriza nome completo e associa acidentes/sinistros, multas/autuações, velocidade, documentação, frota e score, inclusive em setores distintos.
3. Contexto conserva identificação, valores, competências, metas, unidade, direção e atualização. Não converte `null` em zero nem corta séries. Mantém o limite conservador de 17 KiB na seleção, verifica 18 KiB após os metadados e verifica 25 KiB no corpo completo. Perguntas gerais recebem um recorte determinístico na ordem dos registros quando tudo não cabe. O recorte não é amostra estatisticamente representativa nem permite concluir sobre todos os indicadores.
4. Edge valida autenticação corporativa e contrato. Relê `dashboard_state` com o JWT do usuário e a chave pública, sob RLS, conferindo competências, IDs, nomes, setores, valores, metas, unidades e direções. Dados alterados retornam 409; leitura negada retorna 403. Essa leitura adicional é necessária para verificar a origem e acrescenta latência.
5. Texto livre de metadados do cliente é descartado. Os campos operacionais verificados seguem como dados na entrada do usuário; instruções ficam separadas para os três provedores. As regras exigem competências disponíveis, análise mensal, variações, cuidado com base zero, direção indefinida, metas e revisão retroativa. Prompt injection continua sendo um risco residual de modelos; a separação e as instruções não constituem garantia absoluta.
6. Groq permanece disponível com o mesmo modelo configurado. Orçamento de saída Groq/Gemini aumentado para 4096 tokens, para reduzir cortes de análises mensais; isso pode aumentar o uso da cota existente. Nenhuma integração ou plano foi contratado.
7. Sucesso confirma `contextVersion: 1`; frontend rejeita uma função antiga sem confirmação. O cache da referência ao script foi atualizado. A resposta usa `textContent`; a interface informa a quantidade enviada/selecionada e eventuais omissões.

## Arquivos

| Arquivo | Alteração |
| --- | --- |
| `public/main.js` | Origem e estado dos dados, seleção, contrato, contagens, detecção de backend antigo e correções pontuais de CSV/XSS |
| `public/index.html` | Versão da URL de `main.js` |
| `supabase/functions/seguranca-viaria-ia/index.ts` | Verificação do snapshot sob RLS, validação e separação de instruções/dados |
| `supabase/functions/seguranca-viaria-ia/README.md` | Contrato e comportamento atualizados |
| `tests/ia-context.test.js` | Testes reproduzíveis sem rede |
| `AUDITORIA-IA.md` | Relatório e publicação |

CSS, imagens, dados reais, credenciais e políticas não foram alterados. Nenhum indicador ou gráfico foi removido.

## Testes e limites da evidência

Nove cenários passaram no motor JavaScript V8 da ferramenta de execução, com fontes locais reais e mocks:

| Cenário | Resultado |
| --- | --- |
| Bloqueio de origem não carregada e de alterações pendentes | Passou |
| Leitura remota inválida sem fallback para exemplos | Passou |
| Acidentes/sinistros, múltiplos setores e temas | Passou |
| Payload real do frontend, bytes UTF-8, recorte de 75 registros e séries completas | Passou |
| Bloco real de validação Edge: contexto, adulteração, competências e leitura negada | Passou |
| Objetos reais de payload Groq/OpenAI/Gemini com o mesmo contexto e instruções separadas | Passou |
| Interpretação da resposta simulada e rejeição de backend antigo | Passou |
| Preservação de null, zero, meta zero e direção indefinida | Passou |
| Sintaxe completa do frontend e vínculos estáticos de interface | Passou |

O ambiente não tem Node/Deno disponíveis. A execução V8 usou um contador UTF-8 compatível para a interface `TextEncoder.encode(...).length`; em Node, o teste usa o `TextEncoder` nativo. Para o bloco da Edge, foram removidas apenas assertions TypeScript antes da avaliação. Os testes não executam o servidor Deno completo, nem seu gateway de autenticação, streaming do corpo, CORS ou timeouts. Não equivalem a `deno check` ou a um teste integrado da função inteira.

Para repetir com Node instalado, na raiz: `node tests/ia-context.test.js`. Verificação adicional: `deno check supabase/functions/seguranca-viaria-ia/index.ts` em ambiente Deno com acesso às dependências. `git diff --check` passou. A verificação de funções encontrou um parser CSV duplicado; foi removida a definição antiga, que já era sobrescrita pela posterior.

Não houve teste visual no navegador, escrita de persistência, leitura de indicadores reais autenticados ou chamada real a um modelo. Logo, apresentação real de valores, cálculos e recomendações por Groq ainda exige homologação. O teste de regressão cobre sintaxe e vínculos; não comprova renderização completa de gráficos, alertas ou persistência em produção.

## Achados adicionais

| Gravidade | Achado e situação |
| --- | --- |
| Alta, corrigido | Fallback silencioso de estado remoto inválido para exemplos e ausência de verificação da origem na consulta |
| Alta, corrigido | Possível quebra do atributo HTML da logo e de strings JavaScript em botões de KPI/gráfico por valores importados; escaping de atributo/serialização corrigidos |
| Alta, pendente | Persistência envia snapshot completo com upsert; usuários simultâneos ainda podem sobrescrever alterações. Fila local não resolve concorrência entre usuários. Exige estratégia transacional/versionada a combinar; banco não foi alterado |
| Não verificada | RLS e permissões efetivas não estão versionadas neste repositório. O domínio corporativo e o bloqueio visual da auditoria não substituem RLS. Conferir políticas no ambiente autorizado |
| Média, pendente | `calcMetrics` ainda deduz direção pelo nome para classificações antigas do Dashboard. A IA usa a direção configurada; harmonizar a apresentação dos cartões/tabelas é trabalho adicional |
| Média, pendente | `syncMonthLabels` pode gerar anos a partir de uma base fixa; `getMonthlyData` pode deslocar séries maiores que os rótulos. A IA rejeita séries incompatíveis/competências divergentes, evitando inventar datas, mas esses estados exigem revisão das competências persistidas |
| Média, corrigido | CSV usava `includes('')`, sempre verdadeiro, forçando releitura ISO-8859-1. Agora tenta essa alternativa apenas diante do caractere de substituição Unicode |
| Média, pendente | CORS permite `*` quando `DASHBOARD_ALLOWED_ORIGINS` não está definido. Autenticação permanece obrigatória. Conferir a configuração existente; nenhum Secret alterado |
| Média, limitação existente | Rate limit em memória é por instância; não é uma cota global distribuída |
| Baixa, pendente | Bibliotecas por CDN com versões amplas e sem integridade; atualizações podem mudar comportamento. Não foram atualizadas nesta correção |

Não foi demonstrada duplicação de listeners na revisão estática. Sem rastreamento no navegador, não há comprovação de ausência de vazamentos, renderizações excessivas ou chamadas duplicadas em todas as interações.

## Pendências e publicação — somente após autorização

1. Conferir no projeto correto se o usuário corporativo pode ler `dashboard_state` id 1 sob RLS. O estado deve conter `indicadores` e `mesesLabels` persistidos. Registros legados sem competências explícitas são recusados pela IA: não atribuir meses/anos por aproximação. Revisar a origem antes de salvar competências pelo fluxo normal do Dashboard.
2. Executar `deno check` e os testes no ambiente com os runtimes instalados. Para autenticação/publicação, usar as ferramentas oficiais já autorizadas da organização; não colocar credenciais no frontend nem alterar Secrets para este patch.
3. Publicar primeiro a Edge Function no projeto já configurado. Na raiz, com Supabase CLI instalada e sessão autorizada:

```powershell
supabase login
supabase functions deploy seguranca-viaria-ia --project-ref hlasqurthnnhmszojrce
```

Se o CLI solicitar configuração inicial, usar `supabase init` para gerar configuração local e revisar os arquivos gerados antes da publicação. Preservar a configuração de autenticação existente. A função continua validando o JWT com `getUser`; não acrescentar `--no-verify-jwt` sem verificar a configuração do gateway do projeto. Não executar migrações nem comandos de Secrets.

Referência: [publicação de Edge Functions](https://supabase.com/docs/guides/functions/deploy).

4. No projeto existente da Vercel, manter a raiz do repositório, Framework Preset `Other`, sem build para os arquivos estáticos e Output Directory `public`. Publicar os arquivos revisados pelo fluxo habitual aprovado. Alternativa com CLI instalada, após vincular/verificar o projeto existente:

```powershell
vercel link
vercel deploy
# Após conferir o preview e obter autorização de produção:
vercel deploy --prod
```

Não criar outro projeto por engano. Uma publicação via Git pode ocorrer automaticamente ao enviar para a branch configurada; este trabalho não fez push. Referências: [configuração de build](https://vercel.com/docs/builds/configure-a-build), [CLI de publicação](https://vercel.com/docs/cli/deploy).

5. Após carregar a versão nova no navegador, entrar com a conta corporativa, confirmar os indicadores reais, salvar alterações pendentes e perguntar: “Analise os indicadores de acidentes e acidentes com culpa, apresentando seus valores mensais e a evolução dos resultados.” No painel Network, conferir `context`, nomes/valores/competências, HTTP 200 e `contextVersion: 1`, sem copiar tokens para logs. Comparar a resposta com a tabela, incluindo null, meta zero, direção indefinida e meses retroativos. Repetir com os outros provedores apenas se suas credenciais existentes estiverem habilitadas e houver cota.
6. Validar visualmente gráficos, filtros, alertas e recarregamento. Qualquer teste que grave dados deve ocorrer em ambiente de homologação autorizado; não gravar exemplos na produção. Até essas verificações, a integração está corrigida localmente e testada com mocks, mas não homologada em produção.
