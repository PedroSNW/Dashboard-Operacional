# Claims e validação semântica da Groq V7

A revisão local é `v7-claim-semantics-7`. A chamada anterior informada pelo operador terminou em HTTP 200 do provedor, `stop` e 3.850 tokens totais. A aplicação descartou as seis seções. O envelope confirma a etapa de validação factual e o código `claim_ref_mismatch`. Ele não contém o texto ou os claims originais, então a reprodução testa as classes de falha observadas, sem atribuir a elas frases corporativas específicas.

## Causas reproduzidas e mudanças

| Classe | Caso sintético | Resultado atual |
| --- | --- | --- |
| Claim ausente das refs | A seção cita `E0.latest` e declara `E0.delta\|decrease` | A geração Groq anexa `E0.delta` se já foi enviado e a redução é verdadeira. Conta o ajuste em `repairedClaimRefs` e registra `claim_ref_attached`. |
| Claim fora da seção | A seção cita somente `E1.latest` e declara `E0.delta\|decrease` | Bloqueia com `claim_ref_not_in_section`. |
| Campo, valor ou direção inadequados | `latest\|decrease`, valor ausente para comparar ou saldo neutro com `improved` | Distingue `claim_field_mismatch`, `claim_value_missing` e `claim_direction_not_validated`. Uma relação invertida produz `claim_relation_factually_false` e uma relação desconhecida produz `claim_relation_unsupported`. |
| Prosa de planejamento lida como resultado | “Diminuir acidentes por meio de ações preventivas” | Aceita o objetivo no infinitivo. “Os acidentes diminuíram” continua exigindo claim válido. |
| Prazo confundido com medida | “Prazo sugerido: 90 dias” com `proposal.days: 90`, versus “O atraso foi de 60 dias” | Aceita o prazo coerente e rejeita a medida sem evidência. Um prazo indicado na proposta deve coincidir com o valor tipado. |
| Hipótese com pressuposto factual ou causal | “A redução pode estar relacionada a uma campanha” | Exige evidência da redução e sinaliza a hipótese para revisão. “A campanha causou a redução” continua bloqueada. |
| Claim de outro indicador autorizando a frase | “A Quantidade de prejuízos diminuiu” apoiada só por redução de acidentes | Bloqueia quando a frase nomeia ou referencia outro indicador. Comparação direta explícita entre indicadores por superioridade fica bloqueada, pois o contrato não fornece uma regra para ela. |

O vínculo automático usa a referência exata já escrita no claim, autorizada pelo registro do payload, e exige que a seção já cite o mesmo indicador. A Edge revalida campo, direção, valor e relação antes de anexar. Não infere um claim da prosa nem troca a direção declarada. O processo de revisão humana continua validando o documento já expandido.

O diagnóstico de cada claim inválido traz índice original, referência existente, referência enviada, presença na seção e códigos fixos. Para claims de formato ilegível, os indicadores de referência ficam falsos. O conteúdo do claim, a chave de evidência, o nome e o valor ficam fora do diagnóstico.

`proposal.days` continua sendo a fonte do horizonte no editor e no PDF. A exceção textual exige uma expressão explícita como “Prazo sugerido” ou “Horizonte proposto”. Em limitações, essa forma continua disponível para descrever um horizonte administrativo sem vinculá-lo a uma ação específica. A enumeração tipada continua aceitando 0, 30, 60 e 90. O contrato atual não tem um campo numérico para etapas ou IDs de ação editáveis. Esses números continuam fora da prosa livre. Percentuais, valores, metas e medidas precisam de evidências.

Uma resposta mista conserva as seções seguras e sinaliza as descartadas. Avisos editoriais seguem para revisão humana. Se todas falharem, a Edge preserva a base determinística e devolve os diagnósticos.

## Arquivos e testes

- Edge `report-authored-core.js`, `groq-authoring-wire.ts`, `report-authoring.ts` e `groq-authoring-contract.ts`.
- Frontend `public/report-authored-core.js` espelhado e `public/report-authoring.js` com mensagens do editor.
- Nova suíte `tests/groq-v7-claim-semantics.test.ts`. Regressões ajustadas em `tests/groq-v7-evidence-registry.test.ts`, `tests/reports-v7-edge.test.ts`, `tests/groq-v7-homologation-dynamic.ts` e `tests/reports-v7-cdp.ts`.

Passaram o type check Deno da Edge e 17 suítes locais, incluindo os cenários de claims, finanças neutras, valores nulos, prazos, objetivos, observações, hipóteses, seis seções e resposta mista. O teste de navegador injeta na interface um documento que passou pelo schema estrito, pela conversão e pela validação factual reais da Edge. A resposta da Groq é simulada. O teste cobre revisão humana, fallback, PDFs Executivo e Completo, layout móvel e desktop e os dois temas.

O schema estrito, o modelo Groq `openai/gpt-oss-120b`, o raciocínio `medium`, o alvo de 5.120 e o orçamento dinâmico foram preservados. A análise de prosa continua heurística. Pode rejeitar paráfrases legítimas e não substitui revisão humana semântica. A garantia determinística aplica-se aos claims e valores projetados pelo registro, com proteções adicionais para a prosa.

## Homologação e rollback

1. Após autorização, publicar a pasta completa da Edge no projeto de homologação e os dois arquivos públicos juntos. O comando da Edge é `supabase functions deploy seguranca-viaria-ia --project-ref <REF_HOMOLOGACAO>`. A configuração de Secrets existente é suficiente.
2. Gerar a base de homologação e solicitar uma única geração autorizada pelo editor. Conferir HTTP 200, revisão `v7-claim-semantics-7`, seções aceitas e as categorias dos eventuais problemas. Revisar o resultado e exportar Executivo e Completo com a mesma geração.
3. Se a tentativa falhar, usar o identificador, códigos e contagens sanitizados para investigação. Para rollback, restaurar em conjunto os quatro módulos Edge e os dois arquivos públicos da revisão `v7-evidence-registry-6`, republicar após autorização e regenerar a base. A tarefa local não alterou dados, RLS ou Secrets.
