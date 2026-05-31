# CreditGuard AI

**Plataforma web analitica para recuperacao de credito, monitoramento de inadimplencia e inteligencia gerencial.**

O CreditGuard AI integra Ciencia de Dados, PostgreSQL/Supabase, backend Node.js/Express e frontend React para transformar dados financeiros em KPIs, alertas, insights e dashboards executivos.

---

## Sumario

- [Visao Geral](#visao-geral)
- [Stack Tecnologica](#stack-tecnologica)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalacao e Execucao](#instalacao-e-execucao)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Regra Oficial de Risco](#regra-oficial-de-risco)
- [Funcionalidades](#funcionalidades)
- [Resultados Analiticos](#resultados-analiticos)

---

## Visao Geral

A solucao foi desenvolvida a partir de dois datasets financeiros reais:

- `data-science/cobranca_assessorias.csv`, com 10.000 contratos financeiros.
- `data-science/fluxo_pagamentos.xlsx`, com 100.000 registros de pagamentos.

Esses dados sao processados por um pipeline ETL em Python/Pandas, carregados no PostgreSQL hospedado no Supabase e consumidos pelo backend Node.js por meio de consultas SQL analiticas. O frontend React apresenta os indicadores em dashboards, graficos, tabelas, alertas e central de inteligencia.

---

## Stack Tecnologica

### Frontend

| Tecnologia | Finalidade |
|:--|:--|
| React + Vite | Interface web e SPA |
| TailwindCSS | Estilizacao responsiva |
| Recharts | Graficos e visualizacoes analiticas |
| React Router DOM | Rotas e navegacao protegida |
| Axios | Consumo das APIs REST |
| Lucide React | Iconografia da interface |

### Backend

| Tecnologia | Finalidade |
|:--|:--|
| Node.js | Runtime do servidor |
| Express | API REST |
| PostgreSQL `pg` | Conexao com o banco |
| JSON Web Token | Autenticacao stateless |
| bcrypt | Hash seguro de senhas |
| dotenv | Configuracao por variaveis de ambiente |
| CORS | Controle de acesso entre frontend e backend |

### Banco de Dados e Dados

| Tecnologia | Finalidade |
|:--|:--|
| PostgreSQL | Banco relacional e analitico |
| Supabase | Hospedagem do PostgreSQL em nuvem |
| Python | Pipeline ETL |
| Pandas | Limpeza, transformacao e consolidacao dos datasets |
| Matplotlib | Analises graficas nos notebooks |
| Jupyter Notebook | Documentacao e validacao analitica |

---

## Arquitetura

Fluxo principal da solucao:

```text
Datasets CSV/XLSX
        |
        v
Python + Pandas (ETL)
        |
        v
PostgreSQL (Supabase)
        |
        v
Node.js + Express (API REST)
        |
        v
React Dashboard
```

O sistema utiliza uma arquitetura modular, separando responsabilidades entre tratamento de dados, persistencia, regras de negocio, APIs e interface executiva.

Documentacao complementar: [docs/arquitetura.md](docs/arquitetura.md)

---

## Estrutura do Projeto

```text
creditguard/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/apiController.js
│   │   ├── middleware/auth.js
│   │   ├── routes/api.js
│   │   ├── services/kpiService.js
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/exportCsv.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── database/
│   ├── schema_real.sql
│   └── seed_real.sql
│
├── data-science/
│   ├── cobranca_assessorias.csv
│   ├── fluxo_pagamentos.xlsx
│   ├── etl_real.py
│   └── notebooks/
│       ├── 01_data_cleaning_real.ipynb
│       ├── 02_eda_real.ipynb
│       └── 03_business_rules_real.ipynb
│
├── entregas.txt
├── slides_e_falas.txt
└── README.md
```

---

## Instalacao e Execucao

### Pre-requisitos

- Node.js 18+.
- npm.
- Python 3.10+ para executar o pipeline de dados.
- Projeto PostgreSQL no Supabase.

### Banco de Dados

No SQL Editor do Supabase, execute:

```text
database/schema_real.sql
database/seed_real.sql
```

O arquivo `schema_real.sql` cria as tabelas principais do sistema, e o `seed_real.sql` carrega os dados tratados pelo pipeline ETL.

### Backend

```bash
cd backend
npm install
npm start
```

Servidor padrao:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicacao padrao:

```text
http://localhost:5173
```

---

## Variaveis de Ambiente

Crie o arquivo `backend/.env` com as credenciais do Supabase e a chave JWT:

```env
DB_HOST=aws-1-us-west-2.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.seu_projeto_id
DB_PASSWORD=sua_senha_segura
JWT_SECRET=sua_chave_jwt_secreta
```

O backend tambem possui valores padrao para desenvolvimento, mas a execucao correta do projeto deve utilizar o `.env` apontando para o banco PostgreSQL/Supabase.

---

## Endpoints da API

Base URL:

```text
http://localhost:5000/api
```

### Autenticacao

| Metodo | Rota | Descricao | Auth |
|:--|:--|:--|:--:|
| POST | `/login` | Autentica usuario e retorna JWT | Nao |

Exemplo de credencial de demonstracao:

```json
{
  "email": "admin@linus.com",
  "password": "mock123"
}
```

As senhas sao armazenadas como hash bcrypt no banco, e o login utiliza `bcrypt.compare()`.

### Dashboard e KPIs

| Metodo | Rota | Descricao | Auth |
|:--|:--|:--|:--:|
| GET | `/kpis` | KPIs principais do dashboard | JWT |
| GET | `/kpis/avancados` | Indicadores complementares | JWT |
| GET | `/dashboard/evolucao` | Evolucao temporal da inadimplencia | JWT |
| GET | `/dashboard/risco-regional` | Inadimplencia por regiao | JWT |
| GET | `/tendencias` | Tendencias comparativas | JWT |

### Contratos, Alertas e Inteligencia

| Metodo | Rota | Descricao | Auth |
|:--|:--|:--|:--:|
| GET | `/clientes` | Lista paginada de contratos, com filtros | JWT |
| GET | `/clientes/:id` | Detalhe do contrato, parcelas e alertas | JWT |
| GET | `/clientes/criticos` | Visao operacional de contratos em atraso | JWT |
| GET | `/alertas` | Alertas de risco com filtro por nivel | JWT |
| GET | `/pagamentos` | Historico de pagamentos | JWT |
| GET | `/insights` | Insights automaticos da carteira | JWT |

Todas as rotas protegidas exigem:

```text
Authorization: Bearer <token_jwt>
```

---

## Regra Oficial de Risco

A regra oficial apresentada no projeto classifica os contratos em tres niveis:

| Nivel | Criterio |
|:--|:--|
| Baixo | Ate 15 dias de atraso |
| Medio | Entre 16 e 60 dias de atraso |
| Alto | Acima de 60 dias, status ajuizado ou score interno acima de 70 |

A aplicacao dessas regras permitiu identificar **8.925 contratos classificados como risco alto**.

---

## Funcionalidades

### Dashboard Executivo

- KPIs de inadimplencia, recuperacao, atraso medio e risco.
- Evolucao temporal da inadimplencia.
- Risco regional por regiao.
- Alertas recentes.

### Portfolio de Contratos

- Listagem paginada de contratos.
- Filtros por regiao, status e busca textual.
- Detalhamento do contrato.
- Historico de parcelas e pagamentos.

### Central de Alertas

- Alertas gerados automaticamente pelas regras heuristicas.
- Filtro por nivel de risco.
- Visualizacao operacional para apoio a cobranca.

### Central de Inteligencia

- Insights automaticos gerados por consultas SQL analiticas.
- KPIs derivativos.
- Ranking regional.
- Graficos de distribuicao e tendencia.

### Exportacao CSV

- Exportacao de KPIs, contratos, parcelas, alertas e insights em CSV.
- Arquivos gerados com BOM UTF-8 para melhor compatibilidade com planilhas.

### Seguranca

- Login com email e senha.
- Senhas armazenadas com bcrypt.
- Emissao de JWT com expiracao.
- Rotas protegidas no backend.
- Protecao de rotas no frontend.

---

## Resultados Analiticos

Os resultados apresentados no pitch derivam dos datasets reais e das regras oficiais do projeto:

| Indicador | Resultado |
|:--|:--|
| Inadimplencia monitorada | R$ 20,6 milhoes |
| Taxa de recuperacao | 25,49% |
| Contratos classificados como risco alto | 8.925 |

Esses indicadores sustentam a proposta do CreditGuard AI como uma solucao integrada para apoio a decisao, priorizacao de cobranca e monitoramento financeiro.

---

## Licenca

Projeto academico desenvolvido para fins educacionais.
