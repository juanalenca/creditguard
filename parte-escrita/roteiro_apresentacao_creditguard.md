# Roteiro de Apresentação — CreditGuard AI

## Guia Completo para a Equipe

> **Objetivo deste documento:** Servir como roteiro detalhado para a apresentação do projeto CreditGuard AI. Contém todas as informações necessárias para montar slides, conduzir a fala verbal e responder a perguntas da banca. Todos os números aqui listados foram verificados e validados a partir dos dados reais do sistema.

---

## 1. Visão Geral do Projeto

### O que é o CreditGuard AI

O CreditGuard AI é um **sistema de monitoramento e gestão de inadimplência** desenvolvido como projeto acadêmico com aplicação prática no mercado financeiro. A plataforma foi construída para oferecer a gestores de crédito uma **visão executiva completa** sobre a saúde da carteira de recebíveis, identificando contratos em risco, monitorando a evolução da inadimplência e direcionando ações de recuperação.

**Ponto-chave para a apresentação:** O CreditGuard AI **não é um sistema preditivo e não utiliza machine learning**. Ele opera com **regras heurísticas** — isto é, regras de negócio definidas por critérios objetivos e mensuráveis (como dias de atraso, faixas de valor e histórico de pagamento) para classificar o risco dos contratos. Essa abordagem foi escolhida deliberadamente por ser transparente, auditável e fácil de explicar para stakeholders não-técnicos.

### Escopo dos Dados

| Dimensão | Quantidade |
|---|---|
| Contratos analisados | **10.000** |
| Registros de pagamento processados | **100.000** |
| Registros com outliers tratados | **80** |
| Alertas automáticos gerados | **9.987** |

### Stack Tecnológica Completa

O projeto é dividido em três módulos técnicos que se integram em uma arquitetura full-stack:

| Camada | Tecnologias |
|---|---|
| **Ciência de Dados** | Python, Pandas, Matplotlib |
| **Backend e Banco de Dados** | Node.js, Express, PostgreSQL (Supabase), JWT, bcrypt |
| **Frontend** | React, Vite, TailwindCSS, Recharts, Axios |

### Arquitetura em Três Módulos

O sistema foi projetado em uma arquitetura modular com três camadas independentes que se comunicam:

1. **Módulo de Ciência de Dados** — Responsável pelo processamento dos dados brutos, tratamento de outliers, aplicação das regras heurísticas de classificação de risco e geração de datasets limpos para o banco de dados.
2. **Módulo de Backend e Banco de Dados** — API REST que serve os dados processados, calcula KPIs em tempo real via queries SQL, gerencia autenticação e segurança, e fornece o motor de insights automáticos.
3. **Módulo de Frontend (Interface Executiva)** — Dashboard interativo que apresenta gráficos, tabelas, filtros regionais, exportação de relatórios e alertas visuais para o gestor de crédito.

---

## 2. O Módulo de Ciência de Dados

### 2.1 Datasets Utilizados

O módulo de Ciência de Dados trabalhou com dois conjuntos de dados principais:

- **Dataset de Contratos:** 10.000 registros contendo informações contratuais como valor do contrato, data de início, status, região, assessoria responsável e classificação de risco.
- **Dataset de Pagamentos:** 100.000 registros (média de 10 parcelas por contrato) contendo datas de vencimento, datas de pagamento efetivo, valores pagos, valores em aberto e dias de atraso calculados.

### 2.2 Pipeline ETL (Extract, Transform, Load)

O pipeline de tratamento de dados seguiu as seguintes etapas:

**Extração:** Leitura dos arquivos CSV com os dados brutos de contratos e pagamentos utilizando a biblioteca Pandas em Python.

**Transformação:** Etapa central do pipeline, que incluiu:

- Cálculo dos dias de atraso para cada parcela (diferença entre data de pagamento e data de vencimento)
- Identificação e tratamento de outliers (detalhado na seção seguinte)
- Classificação de risco por regras heurísticas
- Agregação de métricas por contrato, região e assessoria
- Geração de indicadores derivados (atraso médio, aging operacional, taxa de recuperação)

**Carga:** Inserção dos dados tratados no banco de dados PostgreSQL hospedado no Supabase, prontos para consumo pelo backend.

### 2.3 Tratamento de Outliers — Medida de Qualidade de Dados

> **Este é um ponto importante para destacar na apresentação.** O tratamento de outliers demonstra rigor analítico e preocupação com a qualidade dos dados.

Durante a análise exploratória, foram identificados **80 registros** no campo de dias de atraso que continham valores claramente anômalos: **-999 dias** (valores negativos sem sentido prático) e **9999 dias** (equivalente a mais de 27 anos de atraso, o que é implausível).

**Estratégia adotada:** Substituição desses 80 valores pela **mediana** do campo de dias de atraso, que é de **89 dias**. A escolha da mediana (e não da média) foi intencional, pois a mediana é uma medida robusta que não é influenciada por valores extremos, sendo ideal para esse tipo de correção.

**Impacto do tratamento:**
- Antes do tratamento, o atraso médio era distorcido pelos valores de -999 e 9999 dias
- Após o tratamento, o **atraso médio inicial** convergiu para **89,65 dias**, um valor coerente com o perfil da carteira
- A qualidade dos KPIs calculados posteriormente (como aging operacional e taxa de recuperação) depende diretamente dessa etapa de limpeza

### 2.4 Regras Heurísticas de Classificação de Risco

O CreditGuard AI classifica cada contrato em três faixas de risco utilizando **regras heurísticas baseadas em critérios objetivos de negócio**. Essas regras consideram fatores como:

- Quantidade de dias de atraso das parcelas
- Proporção de parcelas vencidas e não pagas
- Valor total em aberto
- Histórico de pagamento do contrato

As regras são determinísticas e transparentes — para qualquer contrato, é possível explicar exatamente por que ele recebeu determinada classificação.

### 2.5 Resultados da Classificação de Risco

A aplicação das regras heurísticas aos 10.000 contratos produziu a seguinte distribuição:

| Classificação | Contratos | Percentual |
|---|---|---|
| **Alto Risco** | 8.958 | 89,6% |
| **Médio Risco** | 1.014 | 10,1% |
| **Baixo Risco** | 28 | 0,3% |
| **Total** | **10.000** | **100%** |

**Interpretação para a apresentação:** A concentração de 89,6% dos contratos na faixa de alto risco indica uma carteira com perfil severo de inadimplência. Isso é esperado, pois os dados representam uma carteira já em situação de cobrança — ou seja, são contratos que já entraram em atraso significativo. Essa distribuição reforça a importância de uma ferramenta como o CreditGuard AI para priorizar ações de recuperação.

### 2.6 Métricas Consolidadas Geradas pelo Módulo de Dados

| Métrica | Valor |
|---|---|
| Atraso médio inicial (pós-tratamento de outliers) | **89,65 dias** |
| Aging operacional | **223,86 dias** |
| Clientes classificados como críticos | **8.958** |
| Contratos com parcelas >90 dias de atraso | **8.862** |
| Contratos com status "Em Aberto" | **4.014 (40,1%)** |

### 2.7 Visualizações Geradas (Matplotlib)

O módulo de Ciência de Dados também gerou visualizações estáticas com Matplotlib para análise exploratória e validação dos dados, incluindo:

- Distribuição de risco (gráfico de barras/pizza)
- Histograma de dias de atraso (antes e depois do tratamento de outliers)
- Distribuição geográfica da inadimplência
- Comparativo de performance por assessoria de cobrança

---

## 3. O Módulo de Backend e Banco de Dados

### 3.1 Arquitetura do Backend

O backend foi construído com **Node.js** e **Express**, seguindo o padrão de API REST. O banco de dados utilizado é o **PostgreSQL**, hospedado na plataforma **Supabase** (que oferece um PostgreSQL gerenciado com API REST e autenticação integrada).

### 3.2 Queries SQL e Cálculo de KPIs

O backend é responsável por executar queries SQL que calculam os KPIs exibidos no dashboard. Os principais indicadores calculados em tempo real são:

| KPI | Query/Cálculo | Resultado |
|---|---|---|
| Valor inadimplente (contratos) | Soma dos valores dos contratos classificados como inadimplentes | **R$ 62.308.840,80** |
| Inadimplência monitorada (parcelas) | Soma das parcelas vencidas e não pagas visíveis no dashboard | **R$ 20.621.400,00** |
| Recuperação no mês | Soma dos valores efetivamente pagos no período | **R$ 1.431.904,74** |
| Taxa de recuperação | (Recuperação / Inadimplência monitorada) × 100 | **25,5%** |
| Variação mensal | Comparação da inadimplência entre meses consecutivos | **-4,18%** |
| Alertas automáticos | Contagem de contratos que acionaram regras de alerta | **9.987** |

### 3.3 Serviço de KPIs (KPI Service)

O KPI Service é um módulo do backend responsável por:

- Receber requisições do frontend com filtros (região, período, assessoria)
- Executar as queries SQL parametrizadas contra o banco de dados
- Formatar os resultados em JSON para consumo pelo frontend
- Cachear resultados frequentes para otimizar performance

### 3.4 Motor de Insights Automáticos (Insights Engine)

O Insights Engine é um componente que analisa os dados e gera observações textuais automáticas para o gestor. Exemplos de insights gerados:

- "A região Nordeste concentra 37,3% da inadimplência monitorada"
- "A assessoria Acerta Crédito Integrado apresenta a melhor taxa de acordo (35%)"
- "8.862 contratos possuem parcelas com atraso superior a 90 dias"
- "A variação mensal da inadimplência é de -4,18%, indicando tendência de redução"

Esses insights são exibidos em cards no dashboard, oferecendo ao gestor uma leitura rápida da situação sem necessidade de interpretar gráficos.

### 3.5 Segurança e Autenticação

| Recurso | Tecnologia | Descrição |
|---|---|---|
| Autenticação | **JWT (JSON Web Tokens)** | Tokens assinados para controle de sessão sem estado (stateless) |
| Hash de senhas | **bcrypt** | Algoritmo de hash com salt para armazenamento seguro de senhas |
| Comunicação | **HTTPS** | Tráfego criptografado entre frontend e backend |
| Controle de acesso | **Middleware Express** | Validação de token em rotas protegidas |

---

## 4. O Módulo de Frontend (Interface Executiva)

### 4.1 Tecnologias do Frontend

| Tecnologia | Função |
|---|---|
| **React** | Biblioteca principal para construção da interface com componentes reutilizáveis |
| **Vite** | Build tool para desenvolvimento rápido com hot module replacement |
| **TailwindCSS** | Framework de CSS utilitário para estilização responsiva |
| **Recharts** | Biblioteca de gráficos baseada em React para visualizações interativas |
| **Axios** | Cliente HTTP para comunicação com a API backend |

### 4.2 Telas Principais do Dashboard

**Tela de Login:**
- Autenticação com email e senha
- Validação de credenciais via JWT
- Redirecionamento automático para o dashboard após login bem-sucedido

**Dashboard Principal (Visão Executiva):**
- Cards de KPIs no topo: valor inadimplente, recuperação no mês, taxa de recuperação, variação mensal, alertas automáticos
- Gráfico de evolução da inadimplência ao longo do tempo (linha temporal)
- Gráfico de distribuição de risco (Alto / Médio / Baixo)
- Gráfico de inadimplência por região (barras horizontais ou mapa)
- Tabela de contratos críticos com paginação

**Tela de Detalhamento Regional:**
- Filtros por região (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)
- Comparativo de métricas entre regiões
- Destaque para ticket médio por região

**Tela de Assessorias:**
- Ranking de assessorias por taxa de acordo
- Volume de contratos por assessoria
- Performance comparativa

### 4.3 Gráficos e Visualizações Interativas (Recharts)

Os gráficos do dashboard são interativos e construídos com a biblioteca Recharts. Principais visualizações:

- **Gráfico de barras — Inadimplência por Região:** Exibe os valores de inadimplência monitorada por região geográfica, permitindo identificar rapidamente as regiões mais críticas.
- **Gráfico de pizza — Distribuição de Risco:** Mostra a proporção de contratos em cada faixa de risco (Alto 89,6%, Médio 10,1%, Baixo 0,3%).
- **Gráfico de linha — Evolução Temporal:** Acompanha a variação da inadimplência ao longo dos meses, evidenciando tendências de melhora ou piora.
- **Gráfico de barras — Performance de Assessorias:** Compara a taxa de acordo de cada assessoria de cobrança.

### 4.4 Filtros e Interatividade

O dashboard oferece filtros que permitem ao gestor segmentar a análise:

- **Filtro por Região:** Norte, Nordeste, Centro-Oeste, Sudeste, Sul
- **Filtro por Período:** Seleção de mês/ano para análise temporal
- **Filtro por Faixa de Risco:** Alto, Médio, Baixo
- **Filtro por Status:** Em Aberto, Pago, Em Acordo, etc.

Todos os KPIs e gráficos são atualizados dinamicamente quando o usuário aplica um filtro.

### 4.5 Exportação de Relatórios

O sistema permite exportar os dados filtrados em formato de relatório, possibilitando que o gestor compartilhe análises com sua equipe ou com a diretoria sem necessidade de acesso ao sistema.

---

## 5. Dicionário de KPIs

> **ATENÇÃO — SEÇÃO CRÍTICA:** Esta seção explica a diferença entre os dois principais valores financeiros do sistema. Essa distinção deve ficar absolutamente clara na apresentação, pois é uma das perguntas mais prováveis da banca.

### 5.1 Valor Inadimplente de Contratos — R$ 62.308.840,80

**O que é:** É o **valor total da exposição da carteira** — ou seja, a soma dos valores de todos os contratos que possuem algum grau de inadimplência. Representa o montante total que está em risco.

**Como é calculado:** Soma do campo `valor_contrato` de todos os contratos classificados como inadimplentes pelo sistema (aqueles que possuem parcelas vencidas e não pagas).

**Analogia para explicar:** Se um cliente tem um contrato de R$ 50.000 e deixou de pagar 3 parcelas de R$ 5.000 cada, o **valor inadimplente do contrato** é R$ 50.000 (o valor total do contrato em risco), e não apenas R$ 15.000.

**Quando usar:** Para medir o tamanho total da exposição da carteira e o risco agregado que a instituição enfrenta.

---

### 5.2 Inadimplência Monitorada (Parcelas) — R$ 20.621.400,00

**O que é:** É o **valor efetivo das parcelas vencidas e não pagas** que estão sendo ativamente monitoradas pelo dashboard. Representa o dinheiro que deveria ter entrado no caixa mas não entrou.

**Como é calculado:** Soma do campo `valor_parcela` de todas as parcelas cujo status é "vencida" e que não possuem registro de pagamento.

**Analogia para explicar:** Usando o mesmo exemplo anterior: se o contrato é de R$ 50.000 e o cliente deixou de pagar 3 parcelas de R$ 5.000 cada, a **inadimplência monitorada** é R$ 15.000 (apenas as parcelas efetivamente vencidas).

**Quando usar:** Para medir o impacto real no fluxo de caixa e dimensionar o esforço de cobrança necessário.

---

### 5.3 A Diferença Explicada de Forma Simples

| Aspecto | Valor Inadimplente (Contratos) | Inadimplência Monitorada (Parcelas) |
|---|---|---|
| **Valor** | **R$ 62.308.840,80** | **R$ 20.621.400,00** |
| **O que mede** | Exposição total da carteira | Parcelas efetivamente vencidas |
| **Granularidade** | Nível do contrato | Nível da parcela |
| **Perspectiva** | Risco potencial total | Impacto real no caixa |
| **Pergunta que responde** | "Quanto dinheiro está em risco?" | "Quanto dinheiro já deveria ter entrado e não entrou?" |

**Frase para usar na apresentação:**
> "O R$ 62,3 milhões representa a exposição total da carteira — é o valor somado de todos os contratos que apresentam inadimplência. Já os R$ 20,6 milhões são as parcelas efetivamente vencidas e não pagas, ou seja, o dinheiro que já deveria ter sido recebido. A diferença entre os dois números existe porque um contrato inadimplente pode ter parcelas futuras que ainda não venceram."

---

### 5.4 Demais KPIs do Sistema

| KPI | Valor | Definição |
|---|---|---|
| **Recuperação no Mês** | R$ 1.431.904,74 | Valor total efetivamente recebido de parcelas que estavam em atraso durante o mês vigente |
| **Taxa de Recuperação** | 25,5% | Percentual da inadimplência monitorada que foi recuperada. Cálculo: (R$ 1.431.904,74 ÷ parcelas inadimplentes do período) × 100 |
| **Atraso Médio Inicial** | 89,65 dias | Média de dias de atraso das parcelas vencidas, calculada após o tratamento dos 80 outliers (substituição de -999 e 9999 pela mediana de 89 dias) |
| **Aging Operacional** | 223,86 dias | Tempo médio que um contrato inadimplente permanece em situação de atraso no ciclo operacional de cobrança. Métrica que mede a "idade" da inadimplência |
| **Clientes Críticos** | 8.958 | Número de contratos classificados como Alto Risco pelas regras heurísticas |
| **Contratos >90 dias** | 8.862 | Contratos que possuem pelo menos uma parcela com atraso superior a 90 dias |
| **Contratos Em Aberto** | 4.014 (40,1%) | Contratos cujo status atual é "Em Aberto", sem acordo formalizado e sem quitação |
| **Alertas Automáticos** | 9.987 | Total de alertas gerados automaticamente pelo sistema para contratos que atingiram critérios de atenção |
| **Variação Mensal** | -4,18% | Variação percentual da inadimplência entre o mês atual e o mês anterior. O valor negativo indica redução (melhora) |

---

### 5.5 KPIs Regionais — Inadimplência Monitorada por Região

| Região | Valor Inadimplente | % do Total | Destaque |
|---|---|---|---|
| **Nordeste** | R$ 7,68M | 37,3% | Maior volume absoluto de inadimplência |
| **Sudeste** | R$ 7,26M | — | Segunda maior concentração |
| **Sul** | R$ 3,11M | — | — |
| **Centro-Oeste** | R$ 1,59M | — | — |
| **Norte** | R$ 0,96M | — | Maior ticket médio: **R$ 6.505,20** |

**Observação sobre o Norte:** Apesar de ter o menor volume absoluto (R$ 0,96M), a região Norte apresenta o **maior ticket médio** (R$ 6.505,20 por contrato). Isso significa que, embora haja menos contratos inadimplentes, cada contrato individual possui um valor médio mais alto — o que pode exigir estratégias de cobrança diferenciadas.

---

### 5.6 Performance de Assessorias

| Assessoria | Taxa de Acordo | Observação |
|---|---|---|
| **Acerta Crédito Integrado** | **35%** | Melhor performance entre todas as assessorias |

**Interpretação:** A assessoria Acerta Crédito Integrado se destaca com uma taxa de acordo de 35%, indicando que 35% dos contratos sob sua gestão resultaram em negociação formalizada. Esse indicador é fundamental para avaliar a efetividade das assessorias terceirizadas de cobrança.

---

## 6. Conclusão para a Apresentação

### 6.1 Pontos-Chave para Reforçar no Fechamento

Antes da fala de encerramento, o apresentador deve reforçar os seguintes pontos:

1. **Abordagem heurística e transparente:** O sistema utiliza regras de negócio claras e auditáveis, não "caixas-pretas" de algoritmos. Qualquer classificação de risco pode ser explicada e justificada.

2. **Qualidade dos dados:** O tratamento dos 80 registros com outliers (-999 e 9999 dias, substituídos pela mediana de 89 dias) demonstra preocupação com a integridade analítica. Sem esse tratamento, os KPIs seriam distorcidos e não confiáveis.

3. **Arquitetura completa (full-stack):** O projeto não é apenas um dashboard ou apenas uma análise de dados — é um sistema completo com ciência de dados, backend seguro e frontend interativo, todos integrados.

4. **Resultados concretos e mensuráveis:** O sistema monitora R$ 20,6 milhões em parcelas inadimplentes, identificou R$ 1,4 milhão em recuperação no mês, classificou 8.958 clientes críticos e gerou 9.987 alertas automáticos.

5. **Visão regional e operacional:** O dashboard permite segmentação por região e assessoria, revelando insights como a concentração de 37,3% da inadimplência no Nordeste e a performance diferenciada da assessoria Acerta Crédito Integrado (35% de taxa de acordo).

### 6.2 Sugestão de Fala de Encerramento

> "Para concluir, o CreditGuard AI demonstra como a combinação de ciência de dados, engenharia de software e design de interfaces pode transformar dados brutos de inadimplência em inteligência acionável para gestores de crédito.
>
> Nosso sistema processa 10 mil contratos e 100 mil registros de pagamento, aplica regras heurísticas transparentes para classificar riscos, e entrega tudo isso em um dashboard executivo interativo e seguro.
>
> Os números falam por si: monitoramos R$ 20,6 milhões em inadimplência, identificamos R$ 1,4 milhão em recuperação, e oferecemos ao gestor uma visão completa — desde o panorama geral da carteira de R$ 62,3 milhões até o detalhe de cada contrato individual, com filtros por região, assessoria e faixa de risco.
>
> O CreditGuard AI não é apenas um trabalho acadêmico — é uma ferramenta que poderia ser implantada em uma operação real de crédito, ajudando instituições financeiras a recuperar seus ativos com mais eficiência e inteligência.
>
> Obrigado. Estamos à disposição para perguntas."

---

## Apêndice — Referência Rápida de Números

Para consulta rápida durante a apresentação ou durante perguntas da banca:

| Dado | Valor |
|---|---|
| Total de contratos | 10.000 |
| Total de pagamentos | 100.000 |
| Outliers tratados | 80 (valores -999 e 9999 → mediana 89 dias) |
| Alto Risco | 8.958 (89,6%) |
| Médio Risco | 1.014 (10,1%) |
| Baixo Risco | 28 (0,3%) |
| Valor inadimplente (contratos) | R$ 62.308.840,80 |
| Inadimplência monitorada (parcelas) | R$ 20.621.400,00 |
| Recuperação no mês | R$ 1.431.904,74 |
| Taxa de recuperação | 25,5% |
| Atraso médio inicial | 89,65 dias |
| Aging operacional | 223,86 dias |
| Clientes críticos | 8.958 |
| Contratos >90 dias | 8.862 |
| Contratos Em Aberto | 4.014 (40,1%) |
| Alertas automáticos | 9.987 |
| Variação mensal | -4,18% |
| Nordeste | R$ 7,68M (37,3%) |
| Sudeste | R$ 7,26M |
| Sul | R$ 3,11M |
| Centro-Oeste | R$ 1,59M |
| Norte | R$ 0,96M (ticket médio: R$ 6.505,20) |
| Melhor assessoria | Acerta Crédito Integrado (35% acordo) |
| Stack | Python, Pandas, Matplotlib, PostgreSQL, Node.js, Express, React, Vite, TailwindCSS, Recharts, JWT, bcrypt, Axios, Supabase |
