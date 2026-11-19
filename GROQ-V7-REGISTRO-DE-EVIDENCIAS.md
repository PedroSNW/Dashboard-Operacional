# Registro de evidências da Groq V7

Revisão local `v7-evidence-registry-6`. A execução real informada pelo operador terminou com HTTP 200, `stop`, 2.435 tokens de conclusão e cinco seções rejeitadas. O código anterior reunia referência vazia, malformada, desconhecida e omitida sob `evidencia_inexistente`. O diagnóstico disponível não permite recuperar a categoria exata de cada uma das cinco seções reais.

## Reprodução e causa comprovada em teste

O relatório atribui `E<n>` na ordem da base validada. A seleção para a Groq prioriza indicadores e pode omitir linhas para respeitar o orçamento. As chaves continuam estáveis e a ordem da mensagem pode ter saltos. A instrução anterior mencionava a chave recebida, mas não explicava esses saltos nem diferenciava a chave da posição da linha e do ID interno também enviado. O conversor preservava refs e placeholders. O filtro antigo comparava os fatos do relatório completo com um conjunto construído separadamente a partir dos indicadores selecionados. Não houve evidência de que ele descartasse uma referência exata que estivesse de fato na mensagem.

Com 75 indicadores fictícios, foram enviadas nove linhas nesta ordem `E1, E2, E4, E0, E9, E10, E12, E17, E18`. A quarta linha usa `E0`. Derivar a chave da posição começando em zero gera `E3.latest`, que existe na base completa e ficou fora da mensagem. Cinco seções sintéticas usando essa chave foram rejeitadas com `ref_not_sent`. Cinco usando referências exatas autorizadas passaram. O teste comprova a falha de interpretação posicional e reproduz o descarte coletivo, mas não identifica o texto que a Groq retornou na execução real.

## Contrato

| Elemento | Antes | Revisão atual |
| --- | --- | --- |
| Identidade no payload Groq | Chave E e ID interno na mesma linha | A primeira coluna contém a chave literal E, única identidade usada pelo modelo |
| `refs`, referências em claims e placeholders | Strings com exemplos e checagem local | Chave literal mais campo presente no registro serializado, com `latest`, `target`, `mean`, `delta` e `percent` |
| `chartIds` | Chaves E conferidas separadamente | Chave literal de uma linha presente no mesmo registro de referências |
| Campo nulo | Fato conhecido com valor ausente | Continua nulo. Uma relação dependente de valor ou meta continua sujeita ao motor determinístico |
| Alias ou posição | Não autorizados pelo validador | Continuam sem conversão para fatos. `E0` só é aceito como chave de gráfico |
| Claims inválidos | Sintaxe ou relação inválida podia descartar todo o documento na conversão | A seção correspondente é rejeitada. Seções válidas de uma resposta mista podem seguir com indicação de parcialidade |

A aplicação deriva o registro das linhas e colunas efetivamente serializadas, intersectadas com os fatos determinísticos. Claims e placeholders também precisam constar em `refs` da própria seção. A conversão não inventa referências nem usa nomes para resolver identidade. `lastValid` é informação contextual e não ganha uma referência própria. O schema estrutural Groq continua estrito. Permanecem o alvo de 5.120, orçamento dinâmico, margem, raciocínio `medium`, validação factual e fallback.

## Diagnóstico seguro

`sectionEvidenceDiagnostics` aparece no erro e nos logs associados ao mesmo ID. Em uma resposta aproveitável, aparece dentro de `validation`. Cada entrada traz índice de base zero da seção expandida, tipo previsto pelo contrato, estado das refs, quantidades de refs totais, reconhecidas e autorizadas, desconhecidas, fora do escopo e malformadas, número de claims inválidos e códigos fixos. Não inclui a própria referência, nomes, IDs de indicadores, valores ou textos gerados.

- `missing_refs` diferencia campo ausente de array vazio pelo estado `missing` ou `empty`. Campo de tipo incorreto fica `malformed` e continua falhando no schema.
- `invalid_ref_format` cobre, por exemplo, a chave sem campo, espaços e nomes textuais. `unknown_ref` indica chave e campo em forma válida que não existem no pacote.
- `ref_not_sent` identifica um fato existente no pacote completo que ficou fora da mensagem do modelo.
- `claim_ref_mismatch` indica referência autorizada ausente nas refs da seção. `unsupported_relation`, `invalid_claim_format` e `incompatible_claim` distinguem relação desconhecida, sintaxe inválida e contradição com os dados.
- `qualitative_section_without_ref` é informativo para uma seção qualitativa aprovada sem refs. Afirmação factual sem refs é bloqueada.

O formato estrito limita a estrutura, enquanto a correção das referências ainda depende das escolhas da geração. Nomes duplicados não criam aliases. O filtro textual continua conservador e não equivale a validação semântica completa da prosa. A cobertura pode ser parcial conforme o recorte e o orçamento. Nenhum resultado de homologação real foi medido.

## Testes e publicação

Passaram o type check Deno da Edge, 16 suítes locais e quatro cenários no Chrome com backend simulado, em 320 e 1.440 px nos dois temas. A suíte de evidências exercitou refs exatas, chaves sem campo, campos inexistentes, escopo, claims, seções sem refs, cinco seções válidas, cinco erros distintos, descarte coletivo, resposta mista, seleção parcial, reordenação, nomes duplicados, dados ausentes e finanças neutras. As regressões incluíram editor e PDFs Executivo e Completo. Nenhuma chamada real foi executada.

Arquivos de publicação alterados na Edge: `report-authoring.ts`, `groq-authoring-wire.ts`, `groq-authoring-contract.ts` e `report-authored-core.js`. O arquivo público `public/report-authored-core.js` deve acompanhar a publicação como espelho. O grafo de módulos e o espelho passaram na verificação. Foram atualizados os testes `edge-v7-integrated.test.ts` e `reports-v7-edge.test.ts` e acrescentado `groq-v7-evidence-registry.test.ts`.

1. Em uma publicação autorizada, enviar a pasta completa da Edge e atualizar o core público no frontend de homologação. Usar `supabase functions deploy seguranca-viaria-ia --project-ref <REF_HOMOLOGACAO>` com o projeto correto e a autenticação existente. A revisão não exige alteração de Secrets.
2. Gerar uma nova base com dados de homologação. Depois de autorização para a chamada, solicitar uma única geração pelo editor para verificar toda a cadeia com a mesma resposta.
3. Conferir HTTP 200 da Groq, documento aceito pela Edge, revisão `v7-evidence-registry-6` e diagnóstico de eventuais seções descartadas. Após revisão humana, exportar Executivo e Completo. Em falha, coletar os códigos e contagens por seção e o ID, sem compartilhar conteúdo bruto.
4. Para rollback, restaurar em conjunto os quatro arquivos da Edge e o core público da revisão anterior `v7-integrated-validation-5`, republicar somente em operação autorizada e regenerar a base. Dados persistidos e Secrets não precisam de restauração.
