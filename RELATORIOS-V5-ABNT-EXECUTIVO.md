# Relatórios gerenciais V5 — ABNT e leitura executiva

Implementação local de 17/11/2026. Nenhum deploy, alteração de banco, RLS, Secrets ou dados. Base de restauração: branch `backup/reports-v5`, no commit `b8ea7df`. PDFs e fontes anteriores preservados em `.validation-tools/v5-before/` (pasta ignorada pelo Git).

## Referências consultadas e alcance normativo

A referência principal é a **ABNT NBR 10719:2015**, 4ª edição de 25/05/2015. Foi consultado o [texto da norma disponibilizado pela UFPB](https://www.propesq.ufpb.br/propesq/contents/downloads/normas-abnt/abnt_nbr_10719.pdf/%40%40download/file/ABNT_NBR_10719.pdf), especialmente seções 4 e 5. A edição também consta do [catálogo de orientações da Biblioteca do Instituto de Geociências da Unicamp](https://www.ige.unicamp.br/totem/biblioteca/servicos_disponiveis/abnt/). Não foi localizada edição posterior nas fontes institucionais consultadas. Não houve acesso autenticado ao catálogo comercial ABNT para certificar o estado de vigência em 17/11/2026.

Foram conferidos formato A4, margens recomendadas de 30 mm à esquerda/acima e 20 mm à direita/abaixo, espaçamento simples, tamanho recomendado 12, pré-textuais contados sem número visível e continuação da paginação nos apêndices. A norma admite aplicação oportuna a relatórios administrativos. Folha de rosto, resumo e sumário orientam os elementos iniciais; usa-se formulário de identificação em vez de inventar ficha catalográfica.

Referências complementares consultadas antes da implementação:

- [ABNT NBR 6024:2012, texto disponibilizado pela UFSC](https://cnm.paginas.ufsc.br/files/2020/02/ABNT-NBR-6024.pdf): numeração arábica, sequência das seções, separação entre indicativo e título e elementos sem numeração.
- [ABNT NBR 6027:2012, texto disponibilizado pela UFSC](https://cnm.paginas.ufsc.br/files/2020/02/ABNT-NBR-6027.pdf): ordem e grafia dos títulos, indicação de páginas, exclusão dos pré-textuais e links internos do sumário eletrônico.
- **ABNT NBR 6023:2025**, 3ª edição de 21/05/2025: edição identificada no [texto disponibilizado pela UFES](https://engenhariaedesenvolvimentosustentavel.ufes.br/sites/engenhariaedesenvolvimentosustentavel.ufes.br/files/field/anexo/abnt_nbr_6023_-_referencias.pdf) e na [orientação atual da biblioteca UFES](https://sib.ufes.br/normalizacao). Não foi mantida automaticamente a edição 2018 indicada por guias antigos.
- **ABNT NBR 6028:2021** e **10520:2023**: identificadas e orientações consultadas no [material institucional da Biblioteca Universitária UFSC, atualizado em agosto/2023](https://repositorio.ufsc.br/bitstream/handle/123456789/198047/Relat%C3%B3rio%20t%C3%A9cnico%20e%20ou%20cient%C3%ADfico_11-08-2023.pdf?sequence=4). Não houve auditoria integral dessas normas. O resumo é um parágrafo com palavras-chave; não há citações operacionais externas nem reprodução de trechos de terceiros.
- **IBGE. Normas de apresentação tabular. 3. ed. Rio de Janeiro: IBGE, 1993**: [texto disponibilizado pela Unicamp](https://www3.eco.unicamp.br/biblioteca/images/arquivos/pdf/Norma_de_apresentacao_tabular_IBGE_1993.pdf). Consulta editorial para títulos, fontes, cabeçalhos, continuidade e ausência de moldura vertical nas tabelas. O endereço direto do IBGE respondeu 403 nesta sessão.

A NBR 14724 não foi adotada como norma principal. Fontes antigas podem misturar recomendações acadêmicas; as medidas e o espaçamento foram conferidos no texto da NBR 10719, que recomenda espaço simples.

## Aplicação e divergências

O resultado é um relatório corporativo **orientado pelas normas**, não uma declaração de conformidade integral ou certificação ABNT.

| Item | Aplicação / limite |
|---|---|
| Papel / margens | A4 vertical, corpo em x=30–190 mm e y=30–277 mm; impressão em anverso. Não foi criado modo frente/verso com margens espelhadas. |
| Tipografia | Helvetica, texto principal e títulos em 12 pt, entrelinha simples de 1,15. Tabelas, legendas, fontes e apêndice de propostas em 10 pt uniforme. O uso de 10 pt no conteúdo técnico é adaptação corporativa à recomendação geral de tamanho 12; não representa conformidade irrestrita. |
| Cores | Texto preto e páginas brancas; logo e filete dourado preservam identidade. Não se aplicou fundo comercial ou grandes cards decorativos. |
| Pré-textuais | Identificação institucional, resumo e sumário em páginas próprias; páginas contadas, sem número visível; corpo inicia na página 4. O espaço livre inicial é intencional. |
| Identificação | Autor-entidade D’Granel; local/endereço institucional e patrocinador ausentes são explicitamente indicados como não informados. O formulário não substitui uma revisão bibliográfica/institucional humana. |
| Seções | Sete seções numeradas, referências e apêndices sem numeração, centralizados. Seções fluem na mesma página para reduzir separadores; não há página por indicador. |
| Paginação / sumário | Numeração arábica no alto à direita a partir do corpo, contínua até o final. Sumário preenchido depois da paginação, com links. Reservada uma página para os títulos fixos; excesso gera erro explícito. |
| Tabelas / quadros | Sequências independentes, títulos acima, fontes abaixo, cabeçalho repetido, linhas preservadas e continuidade sinalizada. Não foi auditada integralmente toda a apresentação tabular IBGE. |
| Figuras | Gráficos numerados, nome/unidade, fonte e intervalo; sem duplicação entre corpo e apêndice. A auditoria de todas as citações cruzadas exigidas por normalização continua pendente. |
| Referências | Apenas fonte interna efetivamente usada para os dados; bibliografia normativa real registrada neste documento. Não se inventou bibliografia para recomendações operacionais. Não há geração automática de referências a fontes externas de pesquisa. |
| Logo | Reutiliza a imagem já carregada, se o canvas puder lê-la. Sem CORS ou imagem inválida, mantém assinatura textual D’Granel; não realiza nova chamada externa. |

## Estrutura editorial

1. Resumo executivo: escopo, principais alertas, evolução descritiva pelos extremos/direção já calculados, decisões sugeridas e ressalva de causalidade.
2. Panorama: tabela de resultado recente/competência, unidade, setor, meta, direção, variação e situação.
3. Indicadores prioritários: resultado, avaliação, encaminhamento e gráficos selecionados.
4. Riscos e oportunidades: pontos prioritários e evidências.
5. Plano de ação: iniciativa, prioridade, referência dos indicadores relacionados, área/prazo sugeridos e acompanhamento; campanhas e comunicação para avaliação.
6. Conclusão: encaminhamentos sem prometer efeitos causais.
7. Metodologia e limitações: critérios existentes, competência revisável, ausências, base zero e rastreabilidade.

Referências e apêndices A (cadastro/estatísticas), B (histórico integral), C (gráficos complementares), D (evidências/propostas completas), seguidos do formulário de identificação.

A profundidade do corpo usa no máximo 3 indicadores no executivo/mensal, 4 no trimestral/comparativo e 5 no anual/crítico, limitada à quantidade disponível. Prioridade: sinalização crítica já calculada; empate: ordem original. É uma seleção editorial explicitada no documento, não novo cálculo/classificação de risco. Todos os indicadores do **recorte retornado** permanecem nos apêndices; o relatório crítico continua respeitando seu filtro original.

Não existe limite arbitrário de páginas. Histórico usa seis competências por tabela apenas quando a medição dos textos em 10 pt cabe nas células; caso contrário usa quatro. Texto longo continua em páginas seguintes.

## Conciliação e concisão

- O diagnóstico, o risco e a evidência de ação são reunidos por ID no Apêndice D. Só textos exatamente iguais são deduplicados; fatos diferentes são mantidos.
- Ações V4 permanecem intactas no objeto original. O corpo remete aos detalhes A1, A2 etc.; a relação nominal completa, objetivo, etapas, público, evidências, critérios e observações continuam no apêndice.
- A lista de monitoramento é substituída por referência aos mesmos indicadores somente quando o texto coincide exatamente com a relação nominal já impressa.
- Campanhas/peças integralmente idênticas podem compartilhar apresentação; iniciativas distintas não são fundidas por semelhança textual.
- Séries não são duplicadas entre gráficos executivos e complementares. Não há soma entre unidades incompatíveis ou transformação de ausência em zero.
- A projeção V4 de conteúdo é comparada com a cópia anterior nos testes locais; valores mensais e variações são conferidos nas células efetivamente desenhadas.

## Arquivos e motor PDF

Arquivos de produção modificados:

- `public/report-content.js`: seleção editorial e panorama compartilhados, mantendo `valid()` e `sections()` V4.
- `public/report-pdf.js`: compositor V5, texto medido, quebras, tabelas consolidadas, divisão de células maiores que uma página, legendas, sumário final, apêndices, identificação e diagnóstico local de layout.
- `public/reports.js`: nova organização da prévia expandida, tabela compartilhada, logo já carregado, rótulos maiores nos gráficos exportados e carregamento `report-pdf.js?v=5`.
- `public/index.html`: cache de `report-content.js?v=5` e `reports.js?v=5`.

Testes adicionados/adaptados: `tests/reports-v5.test.mjs`, `tests/reports-v4.test.mjs`, `tests/reports-v4-browser.js`, `tests/reports-v41-browser.js`, `tests/reports-cdp.ts`.

`build()` e `buildAsync()` continuam disponíveis. Os callbacks correspondem aos indicadores preparados, prioridades compostas, gráficos complementares incorporados, blocos de propostas diagramados e páginas finalizadas. O compositor assíncrono libera a interface entre os gráficos complementares; o estágio aparece como “Preparando gráficos complementares”, com contagem real. `doc.reportLayout` serve para auditoria local de medidas/cobertura; não é enviado a serviços nem gravado em logs. Tabelas maiores que uma página são divididas por linhas medidas, preservando trechos e indicando continuação.

Não foi necessário alterar `style.css`, `workspace-v3.js`, fornecedores ou Edge Functions. A prévia permanece recolhida por padrão, com ações antes do conteúdo e gráficos sob demanda. Exportação não depende da expansão. Assinatura/filtros, sessão, verificação de dados, concorrência, erros e download único permanecem ativos.

## Groq e dados

Não houve alteração de prompts, modelos, limites, estatísticas, snapshot, tratamento de 413/429, Groq/Gemini/OpenAI ou fallback V4. Nenhuma chamada automática foi introduzida. As mudanças são editoriais e locais.

## Testes e medições

Resultados detalhados e artefatos locais em `.validation-tools/`. Os executáveis/fixtures não devem ser publicados.

- **V5:** 24 combinações (6 tipos × 1/5/15/40 selecionados); sem dados, direção indefinida/neutra, metas nulas/zero, títulos extensos, 90 ações distintas, responsável longo, conteúdo estruturado e fallback.
- **Layout:** formato A4, margens de textos/células/figuras, cobertura integral do recorte, numeração de seções, sumário com páginas válidas, cabeçalhos e callbacks; conferência de valores e variações nas células desenhadas.
- **Regressão PDF/V4:** histórico de 60 competências, interpretação longa, planos extensos, conteúdo V4 preservado, imutabilidade e progresso.
- **Analytics/structured/presentation/contexto/orçamento:** passaram; incluindo matemática, nulos, metas, contexto compacto, parâmetros/provedores e sanitização de erros.
- **Handler Edge:** 14 cenários com mocks sem rede, incluindo autenticação/RLS simulada, payload/CORS, três provedores, relatórios, 400/413/429, timeout, parsing e fallback.
- **Deno:** `deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts` passou com o cache local.
- **Frontend:** 190 IDs preservados, sintaxe de dez scripts, seis pares de contraste, preferências de tema e estado de alterações pendentes passaram.
- **Chrome:** matriz em 320, 360, 390, 768, 1024, 1440 e 1920 px com temas intercalados; 1/15/40 indicadores por largura; prévia recolhida/expandida, gráficos reais, exportação recolhida, progresso, download único, AI simulada válida/falha, cache, filtros desatualizados, Enter/foco e barra sem sobreposição passaram. A regressão final de conteúdo também verificou nomes iguais em indicadores distintos: prioridades associadas por ID, sem incluir os homônimos fora da seleção.

Medições editoriais sem imagens (mesmo relatório nos compositores anterior e V5; tempos da V5, sem API/rede):

| Indicadores, executivo | Páginas antes → V5 | Bytes antes → V5 | Composição V5 |
|---|---:|---:|---:|
| 1 | 3 → 8 | 10.937 → 22.491 | 62 ms |
| 5 | 9 → 13 | 24.323 → 31.102 | 74 ms |
| 15 | 18 → 17 | 50.185 → 40.284 | 128 ms |
| 40 | 42 → 29 | 114.045 → 66.777 | 256 ms |

O fixture V4 de 40 indicadores passou de **43 para 28 páginas**, sem imagens. Não se afirma redução universal: pré-textuais próprios, margens maiores, fonte principal 12 e recomendações extensas tornam relatórios pequenos e alguns cenários mais longos. O ganho ocorre principalmente na consolidação de grandes conjuntos. PDFs com todas as imagens têm tamanho e tempo adicionais, variáveis por equipamento.

Foi medida a diferença de heap antes/depois de cada composição. Ela pode ser negativa devido à coleta de lixo e não é pico de memória; não há afirmação de redução de memória. Métricas completas ficam em `.validation-tools/v5-metrics.json`.


Medições adicionais com imagens Chart.js reais, capturadas localmente a partir dos fixtures (composição em Deno, sem tempo de captura das imagens nem serialização/download):

| Indicadores / gráficos | Páginas antes → V5 | Bytes antes → V5 | Composição V5 |
|---|---:|---:|---:|
| 1 | 4 → 9 | 78.674 → 89.855 | 760 ms |
| 15 | 23 → 21 | 1.086.056 → 1.071.137 | 11.347 ms |
| 40 | 56 → 43 | 3.018.998 → 2.956.514 | 31.161 ms |

A diferença de tempo entre ambientes é relevante: incorporar as 40 imagens consumiu cerca de 31 segundos nesta medição. Isso não inclui as etapas de sessão, captura dos gráficos, serialização ou download. Os callbacks não simulam esse custo.

### Inspeção visual

Foram rasterizadas e examinadas as páginas das dez amostras editoriais: executivo sem imagens com 1/5/15/40 indicadores (8/13/17/29 páginas), título/ações extensos (23), célula extensa (22) e gráficos reais com 1/5/15/40 indicadores (9/15/21/43). Total: **200 páginas**, verificadas em pranchas de todas as páginas, com ampliações a 100 dpi no início, histórico, gráficos intermediários e final. Isso é inspeção visual de layout, não revisão frase a frase de 200 páginas em zoom.

Artefatos finais: `.validation-tools/v5-inspection-release/`, `.validation-tools/v5-zoom-{4,18,26,43}.png`, PDFs `v5-executivo-*.pdf`, `v5-extenso.pdf`, `v5-celula-extensa.pdf` e `v5-graficos-*.pdf`. As demais combinações da matriz são verificadas automaticamente; não se afirma revisão textual integral de todos os artefatos de teste.

Foram corrigidos durante a validação: rótulos pequenos nos gráficos, repetição de evidências, células maiores que uma página, identificação de quadros/tabelas em sequências independentes, seleção visual por nome em vez de ID e página final criada apenas pela linha de total. As pranchas atuais mostram a retirada dessa página; não foram observadas sobreposições ou cortes nas amostras inspecionadas. O espaço dos pré-textuais e o encerramento natural de seções continuam explícitos.

## Limitações e homologação real

Os testes usaram dados fictícios e serviços simulados. Ainda dependem de ambiente real: sessão/autorização efetivas, dados atuais do Supabase, respostas reais dos provedores, quotas e disponibilidade, logo institucional/CORS do ambiente, gravação efetiva pelo navegador, leitores de tela, Safari/aparelhos físicos e impressão em papel. Revisão normativa especializada deve avaliar referências, identificação institucional e demais adaptações antes de declarar conformidade integral.

A exportação preserva todos os gráficos, portanto conjuntos grandes continuam exigindo CPU e memória. Fechar a prévia destrói os gráficos de tela, sem apagar o relatório ou os dados usados no PDF.

## Repetir a validação

Na raiz do projeto, com Deno disponível:

```powershell
deno run --allow-read --allow-write=.validation-tools tests/reports-v5.test.mjs
deno run --allow-read --allow-write=.validation-tools tests/pdf.test.mjs
deno run --allow-read --allow-write=.validation-tools tests/reports-v4.test.mjs
deno run --allow-read --allow-write=.validation-tools --allow-env tests/edge-handler.test.ts
deno check --config supabase/functions/deno.json supabase/functions/seguranca-viaria-ia/index.ts
```

O teste também verifica todas as células de média, soma aplicável, mínimo, máximo, ausências e histórico mensal desenhadas em cada combinação. A comparação automática anterior/V5 é opcional quando a cópia local `.validation-tools/v5-before/` não existe; os demais asserts continuam executando. O teste V5 cria fixtures em memória. Os três cenários adicionais com imagens reais são executados somente quando `.validation-tools/v5-chart-images.json` foi capturado no navegador; sua ausência não é declarada como aprovação desses cenários. Chrome usa o harness já existente (`tests/reports-browser.ts`, `tests/reports-cdp.ts --reports-v41`) e os assets auxiliares Chart.js/Tailwind locais das validações anteriores. Sem esses assets, o teste de navegador não é considerado executado.

## Publicação manual — somente frontend

1. Revisar o diff e manter backup da versão aprovada.
2. Publicar **juntos**, na saída estática `public` do projeto Vercel já existente: `index.html`, `report-content.js`, `report-pdf.js` e `reports.js`. Preservar todos os outros assets, inclusive `vendor/`.
3. Pelo fluxo Git aprovado, abrir/revisar o commit/PR e promover a versão somente após autorização. Se a organização usa CLI já vinculado, `vercel deploy` cria preview; `vercel deploy --prod` promove produção. Esses comandos não foram executados.
4. Após a publicação autorizada, conferir no navegador que o HTML carrega `report-content.js?v=5`, `reports.js?v=5` e, ao exportar, `report-pdf.js?v=5`. Recarregar sem cache se necessário.
5. Em sessão autorizada, gerar uma prévia curta e outra longa, conferir filtros, solicitar Groq explicitamente e exportar com prévia recolhida. Conferir sumário, primeira página textual, páginas intermediárias, histórico, gráficos, nulos/meta zero e última página. Alterar um filtro e verificar bloqueio de exportação desatualizada.

**Não publicar Edge Function por esta mudança.** Não executar migrações, editar RLS, tabelas, Secrets ou indicadores. Não publicar `.validation-tools/`, PDFs fictícios ou testes como conteúdo público.
