# Entrega 3 - Ciência de Dados

## 1. Introdução

O processo de Ciência de Dados do projeto CreditGuard AI teve como objetivo transformar dados financeiros brutos em informações estratégicas para apoio à recuperação de crédito, monitoramento da inadimplência e tomada de decisão gerencial.

A análise foi desenvolvida com Python, Pandas, Matplotlib e notebooks Jupyter. Essa camada analítica foi responsável por executar limpeza, padronização, análise exploratória, definição de métricas, geração de visualizações e classificação heurística de risco. Os resultados tratados foram posteriormente integrados ao PostgreSQL e consumidos pelo backend Node.js/Express, alimentando os KPIs, alertas, gráficos e insights exibidos no dashboard executivo.

Os dados utilizados foram fornecidos em dois datasets reais:

- `cobranca_assessorias.csv`: base de contratos enviados para assessorias de cobrança.
- `fluxo_pagamentos.xlsx`: histórico de parcelas, vencimentos e pagamentos.

Após a correção dos dados, a base consolidada passou a conter **10.000 contratos**, **100.000 registros de pagamentos**, **0 outliers de atraso** e **9.987 alertas automáticos** gerados por regras heurísticas. É importante destacar que o projeto não implementa modelo supervisionado de Machine Learning. A classificação de risco é feita por regras determinísticas, transparentes e auditáveis.

## 2. Base de Dados Utilizada

### 2.1 Dataset de Cobrança

Arquivo: `data-science/cobranca_assessorias.csv`

Características principais:

- 10.000 registros de contratos financeiros.
- Informações de assessoria responsável pela cobrança.
- Dias de atraso inicial do contrato.
- Valor inadimplente inicial.
- Status de cobrança.
- Score interno de risco.
- Região do cliente.

Principais campos utilizados:

| Campo | Finalidade Analítica |
|---|---|
| `ID_Contrato` | Identificação única do contrato |
| `Nome_Assessoria` | Assessoria responsável pela cobrança |
| `Data_Envio_Assessoria` | Data de envio do contrato para cobrança |
| `Dias_Em_Atraso_Inicial` | Dias de atraso na entrada da base |
| `Valor_Inadimplente_Inicial` | Exposição financeira inicial do contrato |
| `Status_Cobranca` | Situação operacional do contrato |
| `Score_Interno_Risco` | Indicador interno de risco |
| `Regiao_Cliente` | Região geográfica do cliente |

### 2.2 Dataset de Fluxo de Pagamentos

Arquivo: `data-science/fluxo_pagamentos.xlsx`

Características principais:

- 100.000 registros de pagamentos e parcelas.
- Histórico de vencimentos.
- Datas de pagamento.
- Valores de parcela.
- Valores efetivamente pagos.
- Formas de pagamento.
- Indicador de contemplação.

Principais campos utilizados:

| Campo | Finalidade Analítica |
|---|---|
| `ID_Pagamento` | Identificação do pagamento |
| `ID_Contrato` | Chave de relacionamento com contratos |
| `Numero_Parcela` | Número da parcela |
| `Data_Vencimento` | Data prevista de vencimento |
| `Data_Pagamento` | Data efetiva de pagamento |
| `Valor_Parcela` | Valor esperado da parcela |
| `Valor_Pago` | Valor efetivamente pago |
| `Forma_Pagamento` | Canal de pagamento utilizado |
| `Indicador_Contemplado` | Indicação de contemplação |

## 3. Processo Analítico Implementado

A etapa de Ciência de Dados foi organizada em três notebooks principais:

- `01_data_cleaning_real.ipynb`: limpeza, padronização e validação dos dados.
- `02_eda_real.ipynb`: análise exploratória, gráficos, KPIs e padrões.
- `03_business_rules_real.ipynb`: regras heurísticas de risco e priorização.

Além dos notebooks, o script `etl_real.py` automatiza a geração dos datasets limpos e do arquivo `database/seed_real.sql`, utilizado para carregar o PostgreSQL com os dados tratados.

Fluxo implementado:

```text
CSV/XLSX -> Python/Pandas -> limpeza e validação -> notebooks -> seed_real.sql -> PostgreSQL -> APIs -> dashboard
```

## 3.1 Processamento e Limpeza dos Dados (Data Cleaning)

O processo de limpeza foi executado no notebook `01_data_cleaning_real.ipynb` e consolidado no script `etl_real.py`.

Durante a leitura inicial, foram identificados:

- Contratos originais: `(10000, 8)`.
- Pagamentos originais: `(100000, 9)`.
- Scores internos nulos: `300`.
- Duplicatas em pagamentos: `0`.
- Parcelas não pagas: `27.357`.

Trecho de leitura e validação inicial:

```python
contratos = pd.read_csv(cobranca_path, encoding='latin1')
pagamentos = pd.read_excel(pagamentos_path)

print(f"Contratos originais: {contratos.shape}")
print(f"Pagamentos originais: {pagamentos.shape}")
```

### Tratamentos Aplicados

| Etapa | Tratamento Realizado | Resultado |
|---|---|---|
| Encoding | Leitura explícita da base CSV em `latin1` | Dados carregados sem perda estrutural |
| Padronização textual | Normalização de assessorias e regiões | 4 assessorias e 5 regiões padronizadas |
| Conversão monetária | Conversão de valores em formato textual para número | Média de R$ 6.230,88 por contrato |
| Scores nulos | Imputação pela mediana | 300 nulos reduzidos para 0 |
| Duplicatas | Verificação em pagamentos | 0 duplicatas removidas |
| Datas | Conversão de vencimento e pagamento para formato de data | Base apta a cálculo de aging |
| Outliers de atraso | Valores fora de 0 a 365 dias substituídos pela mediana válida | 80 outliers tratados |

### Tratamento de Outliers

O principal ajuste técnico da base foi o tratamento dos outliers de atraso. Foram encontrados **80 registros inválidos** no campo `Dias_Em_Atraso_Inicial`:

| Tipo de Outlier | Quantidade | Valor Original |
|---|---:|---:|
| Atraso negativo | 50 | -999 dias |
| Atraso extremamente elevado | 30 | 9999 dias |

Esses valores não representam situações operacionais plausíveis. Para preservar os 10.000 contratos sem excluir registros da amostra, os atrasos fora do intervalo operacional de **0 a 365 dias** foram substituídos pela mediana dos atrasos válidos, igual a **89 dias**. A mediana foi escolhida por ser robusta a valores extremos e por manter a tendência central da base sem distorcer os KPIs.

Resultado após a limpeza:

- Contratos limpos: `10.000`.
- Pagamentos limpos: `100.000`.
- Outliers remanescentes: `0`.
- Atraso mínimo: `15 dias`.
- Atraso máximo: `207 dias`.
- Atraso médio inicial pós-limpeza: `89,65 dias`.

## 3.2 Execução da Análise Exploratória de Dados

A análise exploratória foi desenvolvida no notebook `02_eda_real.ipynb`, utilizando os arquivos limpos `contratos_clean.csv` e `pagamentos_clean.csv`.

As análises realizadas incluíram:

- Distribuição regional da inadimplência.
- Concentração financeira por assessoria.
- Evolução temporal de parcelas pagas e abertas.
- Frequência de atrasos.
- Distribuição dos níveis de risco.
- Volume financeiro recuperado.
- Comparação entre valor inadimplente dos contratos e parcelas vencidas não pagas.
- Desempenho operacional das assessorias de cobrança.

### Figura 1 - Inadimplência Monitorada por Região

![Figura 1 - Inadimplência monitorada por região](../data-science/notebooks/figures/fig_01_inadimplencia_regional.png)

A Figura 1 apresenta a inadimplência monitorada no nível de parcelas vencidas e não pagas. Essa é a métrica operacional exibida no dashboard. A região **Nordeste** concentra o maior volume, com **R$ 7.686.150,00**, seguida pelo **Sudeste**, com **R$ 7.260.950,00**.

| Região | Inadimplência Monitorada |
|---|---:|
| Nordeste | R$ 7.686.150,00 |
| Sudeste | R$ 7.260.950,00 |
| Sul | R$ 3.116.950,00 |
| Centro-Oeste | R$ 1.592.000,00 |
| Norte | R$ 965.350,00 |

### Figura 2 - Evolução Temporal de Parcelas Pagas e Abertas

![Figura 2 - Evolução temporal](../data-science/notebooks/figures/fig_02_evolucao_temporal.png)

A Figura 2 demonstra o comportamento mensal dos valores de parcelas pagas e abertas. Essa visualização permite acompanhar tendências de recuperação financeira e observar a formação da inadimplência ao longo do tempo.

### Figura 3 - Distribuição Heurística de Risco

![Figura 3 - Distribuição heurística de risco](../data-science/notebooks/figures/fig_03_distribuicao_risco.png)

A Figura 3 representa a distribuição dos contratos após aplicação das regras heurísticas de risco. A concentração em risco alto indica que a carteira analisada possui perfil crítico, exigindo priorização operacional.

| Nível de Risco | Quantidade | Percentual |
|---|---:|---:|
| Alto | 8.958 | 89,58% |
| Médio | 1.014 | 10,14% |
| Baixo | 28 | 0,28% |

### Figura 4 - Taxa de Acordo por Assessoria

![Figura 4 - Taxa de acordo por assessoria](../data-science/notebooks/figures/fig_04_assessorias_taxa_acordo.png)

A Figura 4 compara a taxa de acordo das assessorias. A assessoria **Acerta Credito Integrado** apresentou a maior taxa de acordo, com aproximadamente **35,05%**, apesar de possuir menor volume de contratos em comparação com Fenix e Vertice.

| Assessoria | Contratos | Acordos | Taxa de Acordo |
|---|---:|---:|---:|
| Fenix Recuperacao de Credito | 3.034 | 1.014 | 33,42% |
| Vertice Asset e Cobranca | 3.003 | 1.022 | 34,03% |
| Nexus Mediacao Financeira | 2.037 | 696 | 34,17% |
| Acerta Credito Integrado | 1.926 | 675 | 35,05% |

## 3.3 Definição de Métricas de Desempenho (KPIs)

Os KPIs foram definidos para medir inadimplência, recuperação, aging, risco e concentração regional. Um ponto essencial da correção foi separar duas métricas financeiras que antes apareciam misturadas.

### Dicionário Oficial de KPIs

| KPI | Fórmula | Valor Atual | Interpretação |
|---|---|---:|---|
| Valor inadimplente dos contratos | `SUM(Valor_Inadimplente_Inicial)` | R$ 62.308.840,80 | Exposição financeira inicial no nível de contrato |
| Inadimplência monitorada | `SUM(valor_parcela)` de parcelas vencidas e não pagas | R$ 20.621.400,00 | Valor operacional em aberto exibido no dashboard |
| Taxa de recuperação | Parcelas vencidas pagas com atraso / parcelas vencidas | 25,50% | Eficiência de recuperação da carteira |
| Recuperação no mês | `SUM(valor_pago)` de pagamentos atrasados no mês de referência | R$ 1.431.904,74 | Valor recuperado no período |
| Atraso médio inicial | `AVG(Dias_Em_Atraso_Inicial)` após limpeza | 89,65 dias | Atraso médio na entrada do contrato |
| Aging operacional | Média de dias entre data de referência e vencimento de parcelas abertas | 223,86 dias | Envelhecimento médio das parcelas vencidas não pagas |
| Clientes críticos | Contratos com alerta de nível Alto | 8.958 | Volume priorizado para cobrança |
| Contratos com atraso superior a 90 dias | Contratos com parcelas abertas acima de 90 dias | 8.862 | Carteira crítica por aging de parcelas |
| Alertas automáticos | Registros criados na tabela `alertas_risco` | 9.987 | Contratos sinalizados pelo motor heurístico |

### Diferença entre R$ 62,3 mi e R$ 20,6 mi

O valor de **R$ 62.308.840,80** representa a exposição dos contratos no momento em que entraram na base de cobrança. Já o valor de **R$ 20.621.400,00** representa apenas as parcelas vencidas e não pagas na data de referência da base, sendo a métrica operacional exibida pelo dashboard.

Essas métricas não são contraditórias. Elas respondem perguntas diferentes:

- **Quanto a carteira expõe no nível de contrato?** R$ 62,3 milhões.
- **Quanto está vencido e não pago no nível de parcela?** R$ 20,6 milhões.

## 3.4 Mapeamento de Padrões Identificados na Base

A análise exploratória permitiu identificar padrões importantes para o negócio:

- A inadimplência monitorada está concentrada nas regiões Nordeste e Sudeste.
- A região Nordeste responde por aproximadamente **37,3%** do valor em aberto monitorado.
- O Sudeste também apresenta volume elevado, com **R$ 7,26 milhões** em parcelas vencidas e não pagas.
- A carteira possui alta concentração de contratos classificados como risco alto: **8.958 contratos**.
- Contratos com atraso inicial superior a 60 dias, status ajuizado ou score acima de 70 são os principais responsáveis pela geração de risco alto.
- **4.014 contratos** permanecem com status "Em Aberto", equivalentes a **40,1%** da carteira.
- **8.862 contratos** possuem parcelas com atraso superior a 90 dias.
- A assessoria **Acerta Credito Integrado** apresenta a maior taxa de acordo, com **35,05%**.
- A região **Norte** possui o maior ticket médio de inadimplência por contrato: **R$ 6.505,20**.

### Figura 5 - Valor Inadimplente dos Contratos por Região

![Figura 5 - Valor inadimplente dos contratos por região](../data-science/notebooks/figures/fig_05_valor_contratos_regiao.png)

A Figura 5 apresenta a exposição financeira no nível de contrato. Essa visão complementa a inadimplência monitorada por parcela e ajuda a dimensionar a carteira sob responsabilidade das assessorias.

| Região | Valor Inadimplente dos Contratos |
|---|---:|
| Nordeste | R$ 22.748.368,22 |
| Sudeste | R$ 21.556.882,87 |
| Sul | R$ 9.828.722,06 |
| Centro-Oeste | R$ 5.026.348,66 |
| Norte | R$ 3.148.518,99 |

## 3.5 Extração de Insights Acionáveis para o Negócio

Com base nos padrões encontrados, foram definidos insights acionáveis para apoiar diretoria, financeiro e operação de cobrança.

### Insight 1 - Priorizar Nordeste e Sudeste

As regiões Nordeste e Sudeste concentram juntas mais de R$ 14,9 milhões em parcelas vencidas e não pagas. Isso indica que campanhas de cobrança, renegociação e acompanhamento gerencial devem começar por essas regiões.

### Insight 2 - Atuar sobre a carteira crítica

O sistema identificou **8.958 contratos de risco alto** e **8.862 contratos com parcelas acima de 90 dias de atraso**. Esses contratos devem ser priorizados pela operação de cobrança, pois representam maior probabilidade de perda financeira e menor eficiência de recuperação espontânea.

### Insight 3 - Usar performance das assessorias como critério de gestão

A taxa de acordo por assessoria permite comparar desempenho operacional. A Acerta Credito Integrado apresentou a maior taxa de acordo, enquanto Fenix e Vertice concentram maior volume de contratos. Esse cruzamento apoia decisões de redistribuição de carteira, metas e acompanhamento de produtividade.

### Insight 4 - Separar exposição de contrato e valor vencido

A exposição total de contratos é de **R$ 62,3 milhões**, enquanto a inadimplência operacional monitorada é de **R$ 20,6 milhões**. Essa distinção evita interpretações incorretas e permite decisões mais precisas: diretoria acompanha exposição, enquanto cobrança atua sobre parcelas vencidas e não pagas.

### Insight 5 - Manter regras transparentes

Como o sistema utiliza regras heurísticas, cada classificação pode ser explicada. Isso aumenta a auditabilidade e facilita a defesa da solução em ambiente acadêmico e corporativo.

## 4. Regras Heurísticas de Negócio

As regras de negócio foram implementadas no notebook `03_business_rules_real.ipynb` e no ETL.

Trecho conceitual:

```python
if dias > 60 or status == 'Ajuizado' or score > 70:
    return 'Alto'
elif dias > 15 or status == 'Insucesso':
    return 'Medio'
else:
    return 'Baixo'
```

Classificação utilizada:

| Nível | Critério |
|---|---|
| Baixo | Atraso inicial até 15 dias, sem indicadores críticos adicionais |
| Médio | Atraso entre 16 e 60 dias ou status de insucesso |
| Alto | Atraso superior a 60 dias, status ajuizado ou score interno acima de 70 |

Essas regras geraram **9.987 alertas automáticos**:

| Nível do Alerta | Quantidade |
|---|---:|
| Alto | 8.958 |
| Médio | 1.014 |
| Baixo | 15 |

A diferença entre **28 contratos de risco baixo** e **15 alertas de risco baixo** ocorre porque nem todo contrato de baixo risco gera alerta na tabela operacional. A distribuição de risco avalia todos os contratos; a tabela de alertas registra apenas contratos sinalizados pelo motor operacional.

## 5. Integração com o Sistema

Após o tratamento, os dados foram integrados ao banco PostgreSQL por meio do arquivo `database/seed_real.sql`, gerado automaticamente pelo pipeline.

Fluxo de integração:

```text
data-science/cobranca_assessorias.csv
data-science/fluxo_pagamentos.xlsx
        |
        v
data-science/etl_real.py
        |
        v
database/seed_real.sql
        |
        v
PostgreSQL -> Backend Node.js -> Frontend React
```

O backend consome os dados por consultas SQL agregadas no serviço `kpiService.js`, garantindo que os indicadores do dashboard sejam calculados diretamente a partir do banco atualizado.

## 6. Ferramentas Utilizadas

| Ferramenta | Finalidade |
|---|---|
| Python | Processamento e automação do pipeline |
| Pandas | Limpeza, transformação e análise dos datasets |
| Matplotlib | Geração de gráficos analíticos |
| Jupyter Notebook | Documentação executável da análise |
| PostgreSQL | Armazenamento relacional e analítico |
| Node.js/Express | APIs REST e cálculo de KPIs |
| React | Dashboard executivo |
| Recharts | Visualização interativa no frontend |
| Supabase | Hospedagem PostgreSQL |

## 7. Conclusão

A Entrega 3 consolidou a etapa de Ciência de Dados do CreditGuard AI. O processo permitiu transformar dados financeiros brutos em datasets limpos, métricas confiáveis, visualizações exploratórias, regras heurísticas e insights acionáveis.

Os principais resultados foram:

- Tratamento de **80 outliers** de atraso.
- Geração de base limpa com **10.000 contratos** e **100.000 pagamentos**.
- Definição de KPIs oficiais e separação entre exposição de contrato e inadimplência de parcelas.
- Identificação de **8.958 contratos de risco alto**.
- Geração de **9.987 alertas automáticos**.
- Produção de figuras e análises utilizadas pelo dashboard executivo.

Assim, a camada de Ciência de Dados passou a sustentar tecnicamente os módulos de backend, banco de dados, dashboard e inteligência analítica da solução.
