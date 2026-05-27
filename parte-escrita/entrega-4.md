# Entrega 4 — Dashboard Executivo e Inteligência Visual

## 1. O Dashboard Executivo
Construído utilizando `React`, `TailwindCSS` e `Recharts`, o Dashboard Executivo atua como a interface principal da diretoria, consolidando o imenso volume de dados (10.000 contratos) em métricas tangíveis e instantâneas. A arquitetura foi projetada com Dark Theme para evitar a fadiga visual durante jornadas prolongadas de acompanhamento financeiro.

## 2. Apoio à Diretoria Financeira
O Dashboard provê clareza imediata sobre a saúde de fluxo de caixa da corporação.
O CFO tem acesso direto a quatro pilares:
- **Inadimplência Total** (Apresentada escalonadamente em Milhões - M).
- **Recuperação no Mês** (Valor resgatado líquido).
- **Atraso Médio Global** (Medido em dias, refletindo a morosidade operacional).
- **Clientes Críticos** (Casos sem solução ou ajuizados).

## 3. Apoio ao Gerente de Cobrança (Central Analítica)
Enquanto a aba inicial entrega a visão macro, a **Aba Inteligência** mergulha em dados correlacionais projetados para otimizar as operações:
- Uma estrutura que monitora "Regiões Monitoradas", com um Ranking Regional de inadimplência (Gráfico de Barras horizontais e um *PieChart* colorido).
- **Tendência de Inadimplência:** Um gráfico linear mapeando o histórico dos últimos seis meses.
- **Variação da Inadimplência:** Indicador matemático com setas verde/vermelho. A inteligência semântica foi configurada de forma reversa (a queda do percentual ativa a cor Esmeralda, explicitando "Queda indica melhoria vs mês anterior").

## 4. Insights Automáticos
Através de requisições API via Axios (`/api/insights`), o sistema lê as heurísticas SQL do PostgreSQL e plota na tela cartões inteligentes gerando linguagem natural. O sistema aponta automaticamente qual a assessoria está trazendo o maior índice de acordos e qual região necessita de um reforço nas ações extrajudiciais.

## 5. Exportação e Continuidade
O sistema possibilita a exportação direta de relatórios. Um utilitário processador traduz os JSONs do backend num arquivo formato `.csv` (BOM UTF-8 com separadores em ponto-e-vírgula), permitindo sua inserção imediata no Microsoft Excel para cruzamentos secundários.

---
*Gerado automaticamente pelo sistema de documentação analítica do CreditGuard AI.*
