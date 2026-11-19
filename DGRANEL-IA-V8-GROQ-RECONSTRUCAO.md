# D’Granel IA V8 com Groq

A V8 usa a nova Edge Function `seguranca-viaria-groq-v2`. A Central de Relatórios mantém o mesmo fluxo de prévia, edição e exportação. A chave de ativação no HTML vem com `v7` para permitir publicação e homologação separadas. A revisão da Edge é `groq-v8-1`.

## Arquitetura

| Componente | Responsabilidade |
| --- | --- |
| `supabase/functions/seguranca-viaria-groq-v2/index.ts` | JWT, domínio corporativo confirmado, leitura sob RLS, validação do recorte, vínculo com o snapshot e as operações `preview`, `generate`, `review` e `probe` |
| `engine.ts` na pasta da nova função | Prompt, contrato Groq, seleção de contexto, orçamento, chamada única, validação da resposta e adaptação para apresentação |
| `report-v8-core.js` na pasta da nova função e em `public/` | Registro determinístico de evidências, proteção textual conservadora, verificação local e projeção no editor e PDF. Um teste confirma igualdade byte a byte. |
| `public/index.html`, `reports.js`, `report-authoring.js`, `report-pdf.js` | Ativação, rota da Central, editor existente e composição dos mesmos PDFs |

A V8 importa `reports.js` da pasta anterior para executar `buildReport` e suas dependências determinísticas. A leitura usa a chave pública do Supabase e o JWT do usuário, com verificação por `auth.getUser`. A Edge usa a linha já utilizada de `dashboard_state` sob RLS. Seleções inválidas, domínio externo, snapshot antigo e campos arbitrários do cliente são rejeitados. Não há escrita.

Os adaptadores de Gemini e OpenAI, claims, conversão wire e validação autoral do V7 ficam fora do fluxo V8. O chat e outros consumidores da Edge antiga mantêm seus contratos. Ao publicar a nova função, conservar a árvore completa de `supabase/functions` no repositório para que o CLI possa resolver os imports locais do motor determinístico.

## Conteúdo e evidências

O contrato estrito tem cinco campos obrigatórios e objetos fechados. A forma é `{summary, findings: [{title, text, evidenceKeys}], actions: [{title, text, evidenceKeys}], conclusion, limitations}`. Não há enum de categoria, claim, IDs editoriais ou horizonte no JSON do modelo. O servidor monta o panorama, os achados, os encaminhamentos e a conclusão. O prompt pede avanços, desafios, interpretação integrada e campanhas apenas quando pertinentes. As primeiras três ações, quando existem, recebem horizontes sugeridos de 30, 60 e 90 dias. O editor permite mudar o prazo ou marcá-lo como a pactuar.

O registro usa chaves estáveis derivadas do ID persistido. Para registros antigos cujo ID tem a forma posicional `indice:N`, deriva a identidade de nome, setor e unidade. Se duas identidades gerarem a mesma chave, as duas ficam fora do pacote. Renomear um registro sem ID persistido muda sua chave. O hash local identifica a evidência dentro do recorte e não concede acesso. A autorização vem do snapshot validado e dos IDs presentes no pacote efetivamente enviado.

O modelo recebe os indicadores necessários que cabem no orçamento, priorizados pelas dimensões determinísticas. Cada entrada inclui nome, setor, unidade, período, meta, direção, resultado da competência final, último valor válido quando houver lacuna final, variação, situação, tendência, natureza financeira, governança validada e limitações. A competência final ausente continua `null` e zero continua zero. A série completa permanece na prévia e nos apêndices do PDF Completo. O contexto da gestão só vai ao modelo quando `shareWithAI` estiver marcado. É enviado como relato sem confirmação independente. A proteção bloqueia padrões reconhecíveis de identificação pessoal. Ela não detecta todos os nomes ou informações sensíveis possíveis.

O servidor verifica estrutura e autorização de todas as chaves. Achados exigem referência. Indicadores omitidos continuam disponíveis como dados oficiais da prévia e do PDF Completo, porém estão fora do registro autoral. As projeções de valores vêm das mesmas estatísticas determinísticas que construíram o contexto. O texto autoral é identificado no PDF como interpretação para revisão ou proposta. O filtro bloqueia números livres reconhecíveis, tentativas de usar marcadores, certas afirmações causais, consolidação de saldo e julgamentos financeiros incompatíveis. Afirmações descritivas reconhecidas geram aviso de conferência. Toda edição invalida a confirmação anterior e exige nova confirmação e verificação no servidor. O filtro não prova a verdade de toda paráfrase nem resulta em validação factual integral da prosa.

Se a geração for inválida, a aplicação mantém a base determinística e explica a etapa da falha. A revisão fica em memória, sem mudança de salvamento corporativo. Os PDFs Executivo e Completo seguem o compositor existente, com linhas oficiais separadas da prosa. A exportação autoral V8 reconfere a base e as referências pela Edge, sem consultar a Groq novamente. Trocar o formato não gera uma análise.

## Configuração e orçamento

| Configuração | Comportamento |
| --- | --- |
| `GROQ_API_KEY` | Credencial da Groq no ambiente da Edge |
| `REPORT_V8_RESPONSE_MODE` | Padrão `strict`. Alternativa explícita `json_object` somente para decisão do operador se a homologação comprovar falha recorrente no estrito |
| `REPORT_V8_TOKEN_MARGIN` | Padrão 800. Aceita inteiro de 400 a 1.600 |
| `REPORT_V8_INPUT_TPM` e `REPORT_V8_OUTPUT_TPM` | Opcionais. Padrão 8.000 em cada dimensão, sujeito ao teto combinado. Configurar quando a conta informar limites separados menores |
| `REPORT_V8_ENABLE_SYNTHETIC_PROBE` | Padrão desligado. O operador pode habilitar explicitamente com `true` apenas para a sonda de homologação |
| `DASHBOARD_ALLOWED_ORIGINS` | Mesma lista permitida usada na função anterior. Configurar as origens conhecidas no ambiente de homologação quando a lista já for usada |

Modelo fixo `openai/gpt-oss-120b`, raciocínio `medium`, sem texto de raciocínio no retorno, alvo 5.120 e piso operacional 3.072 de conclusão. O contexto usa contagem conservadora de bytes UTF-8 sobre o envelope serializado para estimar entrada. A Edge reserva entrada, limite efetivo de conclusão e margem. O cálculo considera uso na janela local e saldo informado em headers, quando disponível. A reserva é conciliada quando o provedor informa uso. Se o piso ou os limites configurados não couberem, a operação falha antes da chamada. Existe uma geração simultânea por instância e bloqueio no editor. Outras instâncias e clientes da organização ainda podem consumir a mesma cota. Não há retry automático. O timeout de chamada é de 35 segundos.

O modo alternativo JSON Object garante formato JSON, com garantias de schema inferiores às do modo estrito. A aplicação inclui o contrato no prompt desse modo e aplica o mesmo parser e as mesmas regras de validação no servidor. A configuração é explícita e aparece em métricas. Falha estrita não muda o modo automaticamente. A Groq documenta suporte estrito no modelo de 120B. [Structured Outputs](https://console.groq.com/docs/structured-outputs)

Os logs da chamada usam ID diagnóstico, revisão, modelo, HTTP, modo, estimativa, limite, uso total, categoria de erro e latência. Não incluem chave, JWT, prompts, texto bruto ou valores corporativos.

## Testes locais

- Deno type check da função V8 e dos testes de motor e handler.
- Contrato estrito serializado, sonda mínima com Groq simulada, JSON inválido, objeto fora do schema, referências existentes e inexistentes, indicadores reordenados, identidade legada ambígua, valores ausentes, metas zero, saldo e neutralidade.
- Hipótese e orientação qualitativa, revisão de texto, rejeição de número inventado, causalidade e dados sensíveis reconhecíveis. Contexto da gestão com e sem consentimento.
- Handler real com Supabase Auth, RLS, snapshot e Groq simulados. Cobertura de recorte, edição e revisão desatualizada.
- Concorrência, orçamento combinado e separado, saldo dos headers, timeout, HTTP 400 e 429 com `Retry-After`. O modo JSON Object continua rejeitando resposta fora do contrato.
- Regressões V7, V6.1 e UX V3.2 com dados fictícios. O ensaio do navegador usa o editor e os PDFs reais, recebe um documento validado pelo motor V8 e simula as respostas da Edge no Dashboard.

Resultados reais da Groq e publicação da nova função permanecem pendentes de homologação autorizada.

O type check passou e as 20 suítes locais passaram. O navegador V8 passou em quatro cenários, cruzando 320 e 1.440 px com temas claro e escuro. Em cada cenário, foram exercitados os dois formatos de PDF para 1, 15 e 40 indicadores, restauração, edição, fallback e bloqueio de exportação por snapshot alterado. A configuração de rollback em `v7` também passou nos quatro cenários de navegador.

## Homologação e rollback

1. Com a meta `dgranel-report-engine` ainda em `v7`, preparar o projeto de homologação e publicar apenas a função nova a partir da raiz do repositório. Conferir as configurações de autenticação e de ambiente do projeto. A função usa o seu próprio `auth.getUser` e a leitura RLS mesmo quando a proteção do gateway também está habilitada.

   ```powershell
   supabase functions deploy seguranca-viaria-groq-v2 --project-ref REF_HOMOLOGACAO
   ```

   Substituir `REF_HOMOLOGACAO` pelo projeto de testes. [Publicação de Edge Functions](https://supabase.com/docs/guides/functions/deploy)

2. Para a primeira homologação do contrato, habilitar temporariamente a sonda sintética no ambiente autorizado e executar uma vez. Os valores das variáveis no exemplo devem ser disponibilizados pelo operador no terminal. Usar JWT de conta corporativa confirmada com leitura autorizada no projeto. A sonda testa autorização e usa texto sintético na chamada ao provedor.

   ```powershell
   $headersV8 = @{ apikey = $env:DGRANEL_HOMOLOGATION_ANON_KEY; Authorization = "Bearer $env:DGRANEL_HOMOLOGATION_JWT" }
   $urlV8 = "$env:DGRANEL_HOMOLOGATION_URL/functions/v1/seguranca-viaria-groq-v2"
   Invoke-RestMethod -Method Post -Uri $urlV8 -Headers $headersV8 -ContentType 'application/json' -Body '{"action":"probe"}'
   ```

   Esperar `success: true`, `probe: true` e `mode: strict`. A desativação da sonda pode ser feita após o teste. Usar o ID diagnóstico em caso de falha e respeitar a janela de consumo.

3. Após a sonda e autorização para a geração completa, publicar o frontend de homologação com os arquivos modificados e trocar a meta para `<meta name="dgranel-report-engine" content="v8">`. Usar snapshot fictício autorizado. Gerar prévia, solicitar uma única elaboração, verificar o texto, conferir evidências, salvar a revisão e exportar ambos os formatos. Conferir fallback, edição sem pendências e sessão desatualizada.
4. Para rollback, trocar a meta para `v7`, publicar o frontend e recarregar a Central. Gerar nova prévia e usar a Edge antiga. Rascunhos autorais permanecem locais à sessão e não migram entre os motores.
5. Após homologação, avaliar em mudança separada quais consumidores ainda usam a função antiga e suas credenciais. Descontinuar a rota autoral legada e só remover provedores, módulos ou Secrets com aprovação. Manter os componentes determinísticos compartilhados e os contratos usados pelo chat até que seus consumidores sejam migrados.
