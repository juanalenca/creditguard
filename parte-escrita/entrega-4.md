# Entrega 4 - Dashboard Executivo

## 1. Arquitetura do Dashboard e Segurança

O Dashboard Executivo é a principal interface de consumo analítico do CreditGuard AI. Ele foi construído como uma Single Page Application (SPA) em React, utilizando Vite, TailwindCSS, Axios e Recharts. Sua função é transformar os dados tratados pela camada de Ciência de Dados em informações visuais, filtros operacionais, indicadores financeiros e alertas acionáveis.

A interface não utiliza dados mockados. Os valores exibidos são calculados a partir dos datasets reais processados pelo pipeline de dados:

- `cobranca_assessorias.csv`: 10.000 contratos.
- `fluxo_pagamentos.xlsx`: 100.000 registros de pagamentos.
- `contratos_clean.csv`: base de contratos limpa e sem outliers.
- `pagamentos_clean.csv`: base de pagamentos limpa.
- `seed_real.sql`: carga final para o PostgreSQL.

### Autenticação e Segurança

O acesso ao dashboard exige autenticação. O backend Node.js/Express valida as credenciais no PostgreSQL, utiliza bcrypt para proteção das senhas e emite um JSON Web Token (JWT). Esse token é enviado pelo frontend no cabeçalho das requisições:

```text
Authorization: Bearer <token_jwt>
```

As rotas de KPIs, contratos, alertas, evolução temporal e insights são protegidas por middleware de autenticação. Dessa forma, o dashboard funciona como uma interface gerencial controlada, adequada para dados financeiros sensíveis.

## 2. Fluxo Real de Dados e Datasets

O fluxo de dados do dashboard começa na camada de Ciência de Dados e termina na interface visual consumida pelos usuários.

```text
Datasets reais -> Python/Pandas -> PostgreSQL -> Backend Node.js/Express -> React Dashboard
```

O processo executado é:

1. Leitura dos arquivos `cobranca_assessorias.csv` e `fluxo_pagamentos.xlsx`.
2. Tratamento de encoding, datas, valores monetários e campos nulos.
3. Tratamento de **80 outliers** de atraso, substituídos pela mediana válida de **89 dias**.
4. Geração dos arquivos `contratos_clean.csv` e `pagamentos_clean.csv`.
5. Geração do `seed_real.sql`.
6. Carga das tabelas `contratos`, `pagamentos` e `alertas_risco` no PostgreSQL.
7. Cálculo dos KPIs via consultas SQL no backend.
8. Consumo dos dados pelo frontend React via Axios.

O dashboard utiliza a data de referência derivada da própria base de pagamentos, cuja última data de vencimento é **26/03/2026**.

## 3. Perfis Atendidos e Benefícios Estratégicos

O painel foi desenhado para apoiar diretamente três áreas:

### 3.1 Diretoria

A diretoria utiliza a visão consolidada para acompanhar exposição financeira, inadimplência monitorada, recuperação, concentração regional e evolução temporal. O painel oferece leitura rápida da carteira e apoia decisões estratégicas sobre priorização de regiões, assessorias e volume de recuperação.

### 3.2 Setor Financeiro

O setor financeiro utiliza os KPIs para acompanhar valores vencidos, recuperação do mês, variação mensal e aging operacional. Essa visão ajuda a estimar pressão no fluxo de caixa, risco de perda e evolução do passivo financeiro.

### 3.3 Operação de Cobrança

A operação de cobrança utiliza as telas de contratos, alertas e detalhes individuais para priorizar os clientes críticos. Os filtros por região, status, busca textual e nível de risco permitem ação tática sobre contratos específicos.

## 4. KPIs Obrigatórios e Métricas Implementadas

A Entrega 4 exige que o dashboard apoie os indicadores de inadimplência, recuperação, aging, risco regionalizado e tendência temporal. Todos esses itens foram implementados.

### 4.1 Taxa de Inadimplência

No dashboard, a inadimplência é calculada pela soma das parcelas vencidas e não pagas:

```sql
SELECT COALESCE(SUM(valor_parcela), 0)
FROM pagamentos
WHERE data_pagamento IS NULL
  AND data_vencimento <= $1;
```

Valor atual:

- **Inadimplência monitorada:** R$ 20.621.400,00.
- **Parcelas não pagas:** 27.357.
- **Taxa financeira de inadimplência:** aproximadamente 27,34%.

Esse indicador representa o montante efetivamente vencido e em aberto, não a exposição total dos contratos.

### 4.2 Índice de Recuperação de Crédito

A taxa de recuperação mede a proporção de parcelas vencidas que foram pagas, mesmo com atraso.

Valor atual:

- **Taxa de recuperação:** 25,50%.
- **Recuperação no mês:** R$ 1.431.904,74.

Esse KPI permite acompanhar a eficiência da cobrança e comparar desempenho ao longo do tempo.

### 4.3 Tempo Médio de Atraso (Aging)

O aging operacional é calculado com base nas parcelas vencidas e não pagas, considerando a diferença entre a data de referência e a data de vencimento.

Valor atual:

- **Aging operacional:** 223,86 dias.

Também existe o atraso médio inicial dos contratos, calculado após a limpeza dos outliers:

- **Atraso médio inicial:** 89,65 dias.

A diferença entre esses dois valores é esperada. O atraso inicial descreve o contrato na entrada da base; o aging operacional descreve o envelhecimento atual das parcelas em aberto.

### 4.4 Análise de Risco Regionalizado

O dashboard apresenta a inadimplência por região com base nas parcelas abertas. Essa visão permite identificar concentração geográfica do risco.

![Figura 1 - Inadimplência monitorada por região](../data-science/notebooks/figures/fig_01_inadimplencia_regional.png)

| Região | Valor Monitorado | Participação Aproximada |
|---|---:|---:|
| Nordeste | R$ 7.686.150,00 | 37,3% |
| Sudeste | R$ 7.260.950,00 | 35,2% |
| Sul | R$ 3.116.950,00 | 15,1% |
| Centro-Oeste | R$ 1.592.000,00 | 7,7% |
| Norte | R$ 965.350,00 | 4,7% |

### 4.5 Curva de Tendência Temporal

A evolução temporal é exibida em gráfico de linha, permitindo observar variações no volume de parcelas abertas e pagas ao longo dos meses.

![Figura 2 - Evolução temporal de parcelas](../data-science/notebooks/figures/fig_02_evolucao_temporal.png)

Essa curva apoia a análise de tendência da inadimplência e ajuda a identificar períodos de aumento ou redução do risco financeiro.

## 5. Visão Geral da Interface

O dashboard executivo organiza os dados em módulos visuais e operacionais.

### 5.1 Dashboard Executivo Geral

A tela inicial exibe os principais KPIs:

| Indicador | Valor Atual |
|---|---:|
| Inadimplência monitorada | R$ 20.621.400,00 |
| Recuperação no mês | R$ 1.431.904,74 |
| Aging operacional | 223,86 dias |
| Clientes críticos | 8.958 |

Além dos cards, a tela apresenta gráficos de evolução temporal, risco regional e últimos alertas.

### 5.2 Distribuição Heurística de Risco

![Figura 3 - Distribuição heurística de risco](../data-science/notebooks/figures/fig_03_distribuicao_risco.png)

A distribuição de risco é calculada com base nas regras heurísticas:

| Nível | Critério |
|---|---|
| Alto | Atraso inicial superior a 60 dias, status ajuizado ou score acima de 70 |
| Médio | Atraso entre 16 e 60 dias ou status de insucesso |
| Baixo | Atraso até 15 dias e ausência de indicadores críticos |

Distribuição dos contratos:

| Nível | Contratos |
|---|---:|
| Alto | 8.958 |
| Médio | 1.014 |
| Baixo | 28 |

### 5.3 Tela de Alertas

A Central de Alertas lista os contratos sinalizados pelo motor heurístico. Foram gerados **9.987 alertas automáticos**:

| Nível do Alerta | Quantidade |
|---|---:|
| Alto | 8.958 |
| Médio | 1.014 |
| Baixo | 15 |

A tela permite filtrar alertas por nível de risco e exportar os dados em CSV.

### 5.4 Portfólio de Contratos

A tela de contratos permite consultar a carteira completa, com:

- Paginação.
- Busca textual por identificador ou assessoria.
- Filtro por região.
- Filtro por status de cobrança.
- Detalhamento individual do contrato.
- Histórico de parcelas.
- Exportação CSV.

Essa tela atende principalmente a operação de cobrança, pois permite localizar contratos específicos e acompanhar a situação financeira individual.

### 5.5 Central de Inteligência Analítica

A aba de inteligência apresenta KPIs avançados e insights automáticos, como:

- A região Nordeste concentra **37,3%** da inadimplência total monitorada.
- A Acerta Credito Integrado possui a maior taxa de acordo: **35,0%**.
- **40,1%** dos contratos permanecem em aberto, totalizando **4.014 contratos**.
- **8.862 contratos** possuem parcelas com atraso superior a 90 dias.
- A região Norte possui o maior ticket médio de inadimplência: **R$ 6.505,20**.

## 6. Contextualização de Gráficos e Tendências

Os gráficos do dashboard foram construídos para transformar dados financeiros em leitura gerencial rápida.

### 6.1 Evolução de Inadimplência

O gráfico de linha apresenta a tendência dos últimos meses, permitindo observar a flutuação de parcelas abertas e pagas. Essa visualização é útil para diretoria e financeiro acompanharem a pressão de caixa e avaliarem se a carteira está melhorando ou deteriorando.

### 6.2 Risco Regional

O gráfico regional evidencia o peso financeiro por localidade. A concentração no Nordeste e Sudeste sugere necessidade de estratégias específicas para essas regiões, com metas de recuperação e acompanhamento diferenciado.

### 6.3 Performance das Assessorias

![Figura 4 - Taxa de acordo por assessoria](../data-science/notebooks/figures/fig_04_assessorias_taxa_acordo.png)

A comparação entre assessorias permite avaliar eficiência operacional. Embora Fenix e Vertice concentrem maior volume de contratos, a Acerta Credito Integrado apresentou a maior taxa de acordo.

## 7. Filtros, Funcionalidades Operacionais e Exportação

O CreditGuard AI oferece recursos práticos para uso diário:

- Filtros por região, status e nível de risco.
- Busca textual por contrato ou assessoria.
- Paginação de contratos e alertas.
- Tela de detalhe com parcelas e alertas por contrato.
- Exportação CSV de KPIs, contratos, parcelas, alertas e insights.

A exportação CSV utiliza BOM UTF-8 para maior compatibilidade com ferramentas como Microsoft Excel.

## 8. Relação com a Entrega 3

O dashboard é a camada visual da análise de dados. Ele consome os resultados produzidos na Entrega 3:

- Dados limpos.
- Outliers tratados.
- KPIs definidos.
- Regras heurísticas de risco.
- Gráficos de concentração regional.
- Evolução temporal.
- Insights acionáveis.

Isso garante consistência entre Ciência de Dados, backend e interface executiva.

## 9. Conclusão

O Dashboard Executivo do CreditGuard AI cumpre o objetivo de apoiar Diretoria, Financeiro e Operação de Cobrança com indicadores claros, atualizados e acionáveis.

Os requisitos obrigatórios da Entrega 4 foram atendidos:

- Taxa de inadimplência implementada.
- Índice de recuperação calculado.
- Aging operacional exibido.
- Risco regionalizado apresentado.
- Curva de tendência temporal disponível.

Além disso, o painel integra autenticação JWT, rotas protegidas, exportação CSV, central de alertas, portfólio de contratos e inteligência analítica. A solução transforma os dados tratados pela Ciência de Dados em uma interface operacional capaz de orientar priorização de cobrança, acompanhamento financeiro e tomada de decisão estratégica.
