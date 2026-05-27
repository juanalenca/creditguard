# Entrega 3 — Ciência de Dados e Modelagem Preditiva

## 1. Processo de Limpeza de Dados (Data Cleaning)
A base real fornecida compunha-se de dois datasets:
- `cobranca_assessorias.csv`: 10.000 registros de contratos.
- `fluxo_pagamentos.xlsx`: 100.000 registros de trilha de pagamentos (histórico).

**Tratamento realizado (`01_data_cleaning_real.ipynb`):**
- **Padronização Strings:** Nomes de assessorias possuíam erros de *trailing spaces* e variações na capitalização. Foram aplicados métodos de expressão regular via Pandas (`str.lower()`, `str.contains()`) para unificar as 4 assessorias principais.
- **Parsing Monetário:** A coluna `Valor_Inadimplente_Inicial` continha símbolos "R$" e formatação PT-BR (vírgula decimal). Construímos uma heurística de substituição para garantir floats puros.
- **Datas:** Tratamento dos timestamps com `pd.to_datetime(errors='coerce')` para lidar com eventuais erros de digitação na captura.

## 2. Análise Exploratória de Dados (EDA)
Através do script `02_eda_real.ipynb`, utilizando **Matplotlib**, geramos visualizações da concentração do risco geográfico.

- A região Nordeste apresentou-se como líder absoluta da inadimplência (R$ 7.6 milhões), seguida do Sudeste (R$ 7.2 milhões).
- Analisando a linha do tempo (Pagos vs. Vencidos não-pagos), percebemos uma deterioração drástica no fluxo de caixa previsto nos últimos três meses analisados.

## 3. KPIs Derivativos e Padrões Matemáticos
O sistema adota um conjunto de indicadores:
- **Inadimplência Total (R$):** Acumulado financeiro das parcelas em aberto.
- **Taxa de Recuperação (%):** Aferida pela divisão do montante atrasado recebido vs. total da dívida. Atualmente o motor capturou ~25,4% de recuperação.
- **Contratos Críticos:** Identificam volumetria absoluta de clientes na faixa alarmante (>90 dias de atraso). (Identificados: 8.862 contratos).

## 4. Algoritmos Heurísticos e Regras de Negócio
No notebook `03_business_rules_real.ipynb`, estipulamos uma matriz de risco automatizada, injetando alertas de sistema baseados em três colunas simultâneas:

- **Risco Alto:** `Dias Atraso > 60` OU `Status Cobrança == 'Ajuizado'` OU `Score Risco > 70`.
- **Risco Médio:** `Dias Atraso > 15` OU `Status Cobrança == 'Insucesso'`.
- **Risco Baixo:** Todos os demais (`Em Aberto` em vias normais).

## 5. Insights Gerados pela Aplicação
O endpoint do backend traduziu os dados do Data Science em linguagem natural para apoio à decisão:
- **Concentração:** O Nordeste é responsável por 37.3% de todo o débito na carteira.
- **Performance de Assessoria:** A "Acerta Credito Integrado" gerou a maior taxa de resolução, revertendo 35% de sua carteira alocada em acordos.
- **Custo Regional:** O ticket médio da inadimplência não está na região de maior volume, e sim na Região Norte (R$ 6.505,20 por contrato isolado).

---
*Gerado automaticamente pelo sistema de documentação analítica do CreditGuard AI.*
