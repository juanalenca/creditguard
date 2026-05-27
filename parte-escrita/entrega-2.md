# Entrega 2 — Engenharia de Requisitos

## 1. Requisitos Funcionais (RF)
| ID | Descrição |
|----|-----------|
| RF01 | O sistema deve permitir o login protegido utilizando autenticação JWT. |
| RF02 | O sistema deve apresentar um Dashboard Executivo sumarizando Inadimplência Total, Recuperação, Atraso Médio e Clientes Críticos. |
| RF03 | O sistema deve calcular a Variação Mensal da Inadimplência comparando dinamicamente o último mês vigente no dataset com o mês anterior. |
| RF04 | O sistema deve gerar insights automáticos baseados nos dados reais (ex: maior concentração de inadimplência, melhor assessoria). |
| RF05 | O sistema deve permitir a visualização gráfica (Pizza e Barras) do Risco Regional em proporção monetária. |
| RF06 | O sistema deve possuir uma tela com listagem paginada dos contratos. |
| RF07 | O sistema deve possuir uma funcionalidade nativa de exportação das métricas (Insights e KPIs) em formato CSV. |

## 2. Requisitos Não Funcionais (RNF)
| ID | Descrição |
|----|-----------|
| RNF01 | O backend deve ser desenvolvido em Node.js e Express, garantindo resposta em tempo ágil para paginação de grandes massas de dados. |
| RNF02 | O frontend deve ser construído em React + Vite, com estilização baseada no TailwindCSS para garantir uma interface moderna (Dark Theme). |
| RNF03 | O banco de dados relacional (PostgreSQL) deve possuir modelagem otimizada (1:N) suportando o volume de 10k contratos e 100k pagamentos. |
| RNF04 | O sistema deve possuir arquitetura segura de rotas protegidas por Bearer Tokens no lado do cliente. |

## 3. Histórias de Usuário
**História 1 (Diretor Financeiro):**
*Como* Diretor Financeiro, *quero* acessar um dashboard que apresente de forma resumida e executiva os principais KPIs de recuperação e inadimplência regional, *para que* eu possa embasar minhas decisões de alocação de recursos entre as assessorias de cobrança.

**História 2 (Coordenador de Cobrança):**
*Como* Coordenador, *quero* visualizar os insights e regras de negócio geradas matematicamente pelo motor de Data Science, *para que* eu identifique instantaneamente comportamentos anômalos (ex: concentração de inadimplência no Nordeste).

**História 3 (Analista Operacional):**
*Como* Analista, *quero* poder exportar os KPIs ou Insights para um arquivo CSV estruturado, *para que* eu consiga integrar esses dados em minhas planilhas de reporte semanal.

## 4. Backlog Priorizado e Critérios de Aceitação

### Sprint 1: Fundação & Modelagem
- **Item:** Modelagem e ETL dos Datasets Reais (`cobranca_assessorias` e `fluxo_pagamentos`).
- **Aceitação:** Banco PostgreSQL alimentado via script sem dados nulos destrutivos (clean data).

### Sprint 2: Motor Analítico e Backend
- **Item:** Criação dos endpoints da API REST `/kpis`, `/tendencias` e `/insights`.
- **Aceitação:** A API deve rodar as queries em SQL puro (sem ORM) e lidar com a lógica temporal referenciada ao `MAX(data_vencimento)`.

### Sprint 3: Dashboard e UI/UX Executiva
- **Item:** Componentização de gráficos (Recharts) e KPI Cards no React.
- **Aceitação:** Interface deve lidar corretamente com formatação escalar de milhões (ex: R$ 7.6M) e semáforo de variação (+/-).

---
*Gerado automaticamente pelo sistema de documentação analítica do CreditGuard AI.*
