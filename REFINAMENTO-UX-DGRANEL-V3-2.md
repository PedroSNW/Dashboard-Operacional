# D’Granel — Refinamento UX V3.2

Implementação local em 18/11/2026. Sem deploy, chamadas reais aos provedores ou escrita em produção.

## 1. Auditoria, restauração e contratos

O trabalho foi incremental sobre a V3.1/V6.1 existente. Antes das edições, os arquivos públicos HTML/JS/CSS foram copiados para `.validation-tools/ux32-before/public/`. O HEAD e o manifesto SHA-256 estão em `HEAD.txt` e `manifest.json` nessa pasta. Esse material local, ignorado pelo Git, deve ser guardado antes de limpar a pasta de validação.

Entrada: `public/index.html`, scripts clássicos compartilhando o estado existente. `main.js` mantém autenticação, dados, dashboards, indicadores e motores; `workspace-v3.js/css` organiza o shell; `motion-v3-1.js/css` controla o movimento; `pending-state.js` compara payloads e `pending-changes.js` apresenta a revisão. `reports.js` coordena seleção, prévia, IA e exportação, apoiado pelos módulos de conteúdo e PDF.

Os novos assets `workspace-v3-2.css/js` entram depois dos assets existentes correspondentes. Reutilizam nós, IDs e eventos; o script novo apresenta dados já calculados e não implementa transporte. O inventário automatizado está em `.validation-tools/ux32-inventory.json`: **217 IDs estáticos e 74 eventos inline originais preservados**. Há também IDs criados pelo shell em execução, cobertos nos testes de navegador.

| Tela/fluxo | Contrato e ação preservados | Refinamento |
| --- | --- | --- |
| Login e sessão | Autenticação corporativa e bloqueio por leitura/sessão | Mensagens anunciáveis e estado operacional |
| Navegação | Mesmas seções; Configurações no rodapé | Tooltip acessível, drawer, foco e Escape |
| Visão geral | Contagens provenientes do motor existente | Significado dos KPIs, três atalhos, foco e alertas compactos |
| Inteligência | Regras, IDs, categorias, severidade e leitura originais | Grupos visuais, filtros, detalhes e carga progressiva |
| Dashboards | Controladores de dashboard, gráfico, KPI, meses e zoom | Formulários, foco, scroll e proteção de rascunho |
| Indicadores | Edição, competências revisáveis e importação/exportação | Tabela navegável e células pendentes identificadas |
| Relatórios | `managementReport`, assinatura, contexto, IA opcional e PDF | Configurar/Preparar/Exportar e seleção persistente nos filtros |
| Governança e auditoria | Direções, metas e permissões existentes | Limpeza de filtros, rótulos e legibilidade |
| Salvamento | Snapshot validado, comparação real e `updated_at` | Destaque visual e atualização do estado dos botões |

## 2. Problemas e prioridades

Prioridade alta: seleção explicitamente limpa era preenchida novamente; checkboxes perdiam foco por reconstrução; lista de alertas criava milhares de nós; formulários editados podiam fechar por Escape sem aviso; botões de relatório não refletiam imediatamente todas as invalidações já verificadas pela exportação.

Prioridade média: mensagens extensas/repetidas; seletores sem contexto suficiente; setas coloridas confundiam variação numérica com desempenho; regras legadas de header/hover no tema claro conflitavam com o shell/motion; metadados operacionais de 10/11 px e bordas pouco identificáveis.

As fases executadas foram auditoria, tokens/CSS, home/alertas, relatórios, tabelas/formulários, governança/salvamento e regressão. Não houve substituição integral do frontend.

## 3. Mudanças por módulo

### Design system, navegação e formulários

Mantidos azul-marinho, dourado e tokens semânticos existentes. Acrescentados apenas tokens usados para metadados e bordas de controles. Metadados densos relevantes passaram para pelo menos 12 px, sem ampliar indiscriminadamente tabelas. Severidades têm texto além da cor. Removidos conflitos confirmados de header/hover e transições duplicadas; o CSS V3.2 não contém `!important`. O motor de movimento V3.1 foi preservado.

Sidebar recolhida tem tooltip compartilhado por ponteiro/foco, com `aria-describedby` e fechamento por Escape. Drawer mantém retorno de foco. Modais têm nome acessível, foco no primeiro campo editável, scroll interno e camada acima da sidebar. Cancelar/fechar/Escape pede confirmação apenas quando o conteúdo do formulário difere do estado de abertura; o fechamento após salvar continua normal. A proteção evita confirmação duplicada entre os handlers existentes.

Tabelas largas mantêm rolagem horizontal localizada e região alcançável por teclado. Células alteradas usam os caminhos do comparador existente, borda, asterisco e nome acessível incluindo o valor; desfazer remove o destaque. Zoom continua local. Não foram criadas regras de fechamento de competência nem alterações automáticas de metas/direções.

### Visão geral e inteligência

Cards explicam suas contagens e não equiparam ausência de meta/direção a resultado desfavorável. Indicadores em foco apresentam nome oficial, unidade, competência, valor/meta, situação calculada e variação descritiva. Os três atalhos são Consultar indicadores, Ver alertas e Gerar relatório.

Alertas são agrupados visualmente por indicador e competência. Cada registro original mantém categoria, severidade, leitura e detalhes completos acessíveis. A severidade vem exclusivamente do motor existente. Há filtros de leitura, severidade, setor, indicador, competência e categoria, indicação de filtros ativos e limpeza. A carga inicial é de até 20 grupos, ampliada por botão; contagens distinguem registros, grupos e notificações. Notificações não são sinistros. As análises deixam a explicação completa expansível, junto do resultado/cálculo/encaminhamento, sem mudar o motor.

**Leitura de alertas:** o legado usa `localStorage`, chave `dgranel_alerts_read_v1`, compartilhada no navegador. Não é armazenamento isolado por usuário nem persistência no servidor. A V3.2 preserva esse contrato e usa linguagem “neste navegador”; falhas de armazenamento recebem feedback. Alterar isolamento exige trabalho específico autorizado, não uma mudança estética.

### Relatórios V6.1

Mesma página, sem wizard: Configurar inclui Contexto da Gestão; Preparar reúne gerar/atualizar prévia, Groq opcional e provedor alternativo; Exportar conserva o seletor Executivo/Completo e o PDF. Não há duplicação de controles. A barra só fica sticky em desktop com altura disponível suficiente e sem ocupar mais de 32% da janela; no mobile permanece no fluxo.

Pesquisa e checkboxes continuam sincronizados com o `<select>` interno e os IDs reais. A seleção é lembrada ao filtrar por setor; limpar é uma intenção explícita, mantida até nova seleção. Alterar um checkbox não reconstrói a lista nem perde foco. Encerrar/resetar a sessão limpa também a seleção interna.

Botões explicam ausência de seleção, sessão/leitura indisponível, pendências, falta de prévia, processamento e filtros alterados. O estado visual também usa a verificação de snapshot antigo que já existia na exportação. A atualização do comparador de pendências refresca esses estados após salvar. Não foram alterados payloads, assinatura, requisições, cálculos, conteúdo, recomendações ou compositor PDF. Prévia recolhida, renderização sob demanda, progresso real e exportação sem expandir permanecem.

## 4. Arquivos

Publicação do frontend: `public/index.html`, `public/main.js`, `public/style.css`, `public/workspace-v3.js`, `public/workspace-v3.css`, `public/pending-changes.js`, `public/reports.js`, **`public/workspace-v3-2.js` e `public/workspace-v3-2.css` novos**.

Testes/ferramentas: `tests/reports-browser.ts` ajustado para comparação antes/depois; novos `tests/ux32-static.test.mjs`, `tests/ux32-browser.js`, `tests/ux32-cdp.ts` e `tests/ux32-audit.mjs`. Este documento registra a entrega.

O teste de preservação compara integralmente sete módulos: conteúdo, executivo, PDF, pending-state, preferência de tema, progresso PDF e motion JS. Compara também treze funções de cálculo, alertas, leitura, snapshot, persistência, CSV, indicador e auditoria com a cópia anterior. `git diff --exit-code -- supabase` não encontrou alteração. Nenhuma Edge Function precisa ser publicada nesta entrega.

## 5. Testes e regressões

| Execução local | Resultado e alcance |
| --- | --- |
| `ux32-static.test.mjs` | Aprovado: IDs, sintaxe dos scripts alterados, sete módulos e treze funções preservados; sem transporte no novo script |
| `v3-static.test.mjs` | Aprovado: contratos V3, sintaxe e seis pares semânticos de texto com contraste >= 4,5:1 |
| `analytics`, `structured`, `presentation` | Aprovados: cálculos, interpretação estruturada e apresentação |
| `groq-budget`, `groq-v51`, `ia-context`, `edge-handler` | Aprovados com mocks: orçamento, contexto, três provedores e falhas; nenhuma API real |
| `reports`, `reports-v4`, `reports-v5`, `reports-v6`, `reports-v61`, `pdf` | Aprovados: regressões determinísticas, conteúdo e geração PDF |
| `pending-state`, `theme-preference` | Aprovados: comparação real, null/zero, desfazer, snapshot e preferência local |
| Chrome/CDP UX V3.2 | Aprovado nas 14 combinações: 320, 375, 430, 768, 1024, 1440 e 1920 px × claro/escuro |
| Tarefas + salvamento no Chrome | Aprovados em 375/1440 px × dois temas: CRUD de dashboard/KPI/gráfico, meses, zoom, CSV, revisão, sucesso/falha/conflito, edição em voo, clique duplicado, sessão e leitura negada, com backend simulado |
| Chrome/CDP V6.1 final | Aprovado em sete larguras: Executivo/Completo, 1/15/40 indicadores, IA válida/inválida/falha, filtros/contexto, prévia recolhida, PDF/progresso e callback de download único |

As 17 suítes do lote de regressão e seus códigos de saída estão em `.validation-tools/ux32-regression.json`; logs individuais `ux32-*.log`. Testes rápidos de sintaxe/contratos, contexto IA, apresentação e pendências foram repetidos após os ajustes finais. Logs de navegador: `ux32-after-test.log` e `ux32-reports-browser-final.log`.

O navegador verifica autenticação simulada, navegação/temas, drawer/tooltip, contagens consistentes, filtros/leitura e falha de armazenamento, carregamento progressivo, seleção/foco/limpeza, prévia desatualizada por filtro/snapshot, modais, governança/permissões e ausência de mudanças no payload corporativo durante visualização. Enter/Escape são enviados pelo CDP; movimento reduzido é emulado e conferido após atualização da media query. Há verificação adicional com altura de 420 px para modal/scroll/camadas. As execuções incluem ausência de overflow horizontal indevido e erros JavaScript detectados pelo harness.

Na importação CSV, o parser de terceiros é simulado e o pipeline da aplicação é exercitado com null/zero. Na exportação CSV e PDF, o callback/download é interceptado para contar uma única solicitação. PDFs são efetivamente compostos pelo código local; a caixa de salvamento do sistema operacional não é homologada por esse teste.

## 6. Evidências visuais

Capturas locais com dados fictícios, não dados de produção. As telas antes/depois principais existem em desktop 1440 e mobile 375, em ambos os temas:

| Tela | Antes | Depois |
| --- | --- | --- |
| Home desktop escuro | [Antes](.validation-tools/ux32-before-home-1440-dark.png) | [Depois](.validation-tools/ux32-after-home-1440-dark.png) |
| Home mobile claro | [Antes](.validation-tools/ux32-before-home-375-light.png) | [Depois](.validation-tools/ux32-after-home-375-light.png) |
| Alertas desktop escuro | [Antes](.validation-tools/ux32-before-intelligence-1440-dark.png) | [Depois](.validation-tools/ux32-after-intelligence-1440-dark.png) |
| Alertas mobile claro | [Antes](.validation-tools/ux32-before-intelligence-375-light.png) | [Depois](.validation-tools/ux32-after-intelligence-375-light.png) |
| Relatórios desktop claro | [Antes](.validation-tools/ux32-before-reports-1440-light.png) | [Depois](.validation-tools/ux32-after-reports-1440-light.png) |
| Relatórios mobile escuro | [Antes](.validation-tools/ux32-before-reports-375-dark.png) | [Depois](.validation-tools/ux32-after-reports-375-dark.png) |

Para as outras combinações, trocar `light`/`dark` ou `375`/`1440` nesses nomes. Também foram geradas capturas `ux32-after-{dashboard,datagrid,governance,audit,analyses,report-actions}-{375,1440}-{dark,light}.png` e `ux32-keyboard-height.png`. Os recursos de rede são bloqueados no harness; imagens remotas de marca podem aparecer indisponíveis. Essas capturas não homologam carregamento de CDN em produção.

## 7. Performance medida

Fixture comum: 77 indicadores fictícios, 12 competências e 271 notificações. Três amostras de `renderAlertsList` por combinação, mediana registrada, Chrome headless local. Antes eram apresentados todos os registros; depois, inicialmente até 20 grupos, com os demais disponíveis sob demanda. **8.672 → 480 nós internos na lista inicial: redução de aproximadamente 94,5%.** Não é redução do total de registros nem comparação do custo de renderizar a lista completa.

| Viewport/tema | Mediana antes | Mediana depois | Home antes/depois (uma amostra) |
| --- | --- | --- | --- |
| 375 escuro | 70,1 ms | 27,8 ms | 27,5 / 25,4 ms |
| 375 claro | 70,4 ms | 28,0 ms | 27,8 / 25,6 ms |
| 1440 escuro | 72,2 ms | 28,6 ms | 29,1 / 26,0 ms |
| 1440 claro | 67,5 ms | 28,3 ms | 26,5 / 25,4 ms |

As medições detalhadas estão em `.validation-tools/ux32-before-metrics.json`, `ux32-after-metrics.json` e `ux32-comparison.json`. São observações locais sujeitas à carga do computador, não benchmark de hardware modesto nem garantia de latência em produção. A primeira combinação de 320 px teve carga concorrente da regressão PDF e não é usada na comparação. Não se afirma ganho geral da home, motor analítico, memória ou rede.

Seletores atualizam checkboxes incrementalmente; home evita reconstrução idêntica e renderização pesada quando oculta; gráficos da prévia continuam sob demanda. Nenhuma biblioteca nova foi adicionada. Os assets novos acrescentam código frontend; não se afirma redução de bytes de download. Dependências/CDNs existentes foram preservados.

## 8. Acessibilidade e limites de homologação

Foram tratados rótulos, nomes de diálogos, foco, tooltips, Escape, regiões roláveis, `aria-expanded`, `aria-disabled`, status anunciáveis, contraste de pares de texto e estados com texto/forma além da cor. O foco recebe ajuste para não ficar sob áreas fixas. Referências: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [alvos mínimos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) e [foco não encoberto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum).

Isso não constitui certificação WCAG AA. Restam homologação com leitor de tela, contraste de todos os estados/gráficos e uso humano por teclado. Emulação de viewport/altura reduzida não substitui aparelho físico, teclado virtual, notch/safe areas reais, zoom do sistema e toque. Testar computadores modestos e outros navegadores antes da publicação.

Também dependem do ambiente real: login/renovação de sessão Supabase, permissões reais, leitura/salvamento e conflito entre usuários, armazenamento bloqueado pelas políticas corporativas, Groq/Gemini/OpenAI e suas cotas, CDN e download do SO. Os contratos são preservados e há cobertura por mocks; não se declara homologação em produção. Nenhuma escrita real foi usada. O compositor e conteúdo PDF V6.1 permanecem intactos, mas a aprovação visual humana final do documento continua recomendada.

## 9. Reprodução e publicação manual

Usar o Deno local `.validation-tools/deno.exe` ou instalação equivalente. Para reproduzir a comparação estática é necessário preservar a pasta `ux32-before`. Comandos a partir da raiz:

```powershell
$env:DENO_DIR = "$PWD\.validation-tools\cache"
& .\.validation-tools\deno.exe run --allow-read tests/ux32-static.test.mjs
& .\.validation-tools\deno.exe run --allow-read --allow-write tests/reports-browser.ts --v4
& .\.validation-tools\deno.exe run --allow-all tests/ux32-cdp.ts
& .\.validation-tools\deno.exe run --allow-read --allow-write tests/ux32-audit.mjs
& .\.validation-tools\deno.exe run --allow-read --allow-write tests/reports-v6-browser-build.mjs
& .\.validation-tools\deno.exe run --allow-all tests/reports-v6-cdp.ts --v61
```

CDP exige Chrome no caminho configurado nos runners e acesso local às portas de depuração. Executar medições sem outras cargas pesadas concorrentes. O runner usa fixtures e mocks locais.

Para publicar, após homologação e autorização fora desta entrega:

1. Guardar cópia dos nove arquivos públicos anteriores e dos assets novos.
2. Publicar no mesmo hosting estático os oito arquivos JS/CSS listados na seção 4, incluindo os dois novos, sem alterar configuração de backend.
3. Publicar `public/index.html` por último. Ele contém as referências/cache queries da V3.2. Respeitar eventual processo de build já usado pelo hosting; não copiar testes ou `.validation-tools` para o site.
4. Limpar o cache de distribuição do frontend quando aplicável e recarregar. Verificar Network: ambos os assets novos devem retornar 200 e não haver erros no console.
5. Conferir sidebar, home, filtros, seleção explicitamente limpa, relatórios com prévia recolhida, temas e mobile. Homologar operações reais somente em ambiente autorizado, com dados de teste.
6. Se necessário, reverter os nove arquivos públicos em conjunto para a cópia anterior, especialmente o HTML e suas referências. Não é necessária migração ou reversão de banco.

**Não executar deploy de Edge Functions, SQL, alteração de RLS, Secrets ou dados para esta mudança. Nada foi publicado automaticamente.**
