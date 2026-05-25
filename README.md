# 🛡️ CreditGuard AI

**Plataforma Web Analítica para Recuperação de Crédito e Prevenção de Inadimplência**

> Sistema full-stack para monitoramento financeiro em tempo real, análise de inadimplência por região, classificação de risco heurística e geração de alertas inteligentes. Desenvolvido como projeto acadêmico universitário com arquitetura profissional de mercado.

---

## 📋 Sumário

- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Regras de Negócio](#-regras-de-negócio)
- [Funcionalidades](#-funcionalidades)
- [Entregas Acadêmicas](#-entregas-acadêmicas)

---

## 🚀 Stack Tecnológica

### Frontend
| Tecnologia | Versão | Finalidade |
|:-----------|:------:|:-----------|
| ⚛️ **React** | 19.2 | Biblioteca de UI com componentes reativos |
| ⚡ **Vite** | 8.0 | Bundler e dev server ultrarrápido |
| 🎨 **TailwindCSS** | 4.3 | Estilização utilitária responsiva |
| 📊 **Recharts** | 2.15 | Gráficos interativos para dashboards |
| 🧭 **React Router DOM** | 7.15 | Navegação SPA com rotas protegidas |
| 🔗 **Axios** | 1.16 | Cliente HTTP para consumo da API |
| 🎯 **Lucide React** | 1.16 | Biblioteca de ícones modernos |

### Backend
| Tecnologia | Versão | Finalidade |
|:-----------|:------:|:-----------|
| 🟢 **Node.js** | 20+ | Runtime JavaScript no servidor |
| 🚂 **Express** | 5.2 | Framework HTTP minimalista |
| 🔐 **JSON Web Token** | 9.0 | Autenticação stateless via JWT |
| 🔒 **bcrypt** | 5.1 | Hash seguro de senhas |
| 🐘 **pg** | 8.21 | Driver nativo PostgreSQL |
| 📁 **dotenv** | 17.4 | Gerenciamento de variáveis de ambiente |
| 🌐 **CORS** | 2.8 | Controle de origens cruzadas |

### Banco de Dados
| Tecnologia | Finalidade |
|:-----------|:-----------|
| 🐘 **PostgreSQL** | SGBD relacional robusto |
| ☁️ **Supabase** | Hospedagem cloud com pooling de conexões |

### Data Science
| Tecnologia | Finalidade |
|:-----------|:-----------|
| 🐍 **Python 3** | Geração de dados sintéticos |
| 🐼 **Pandas** | Análise exploratória de dados |
| 🎭 **Faker** | Geração de dados mock realistas |
| 📓 **Jupyter Notebook** | Documentação interativa de análises |

---

## 🏗️ Arquitetura do Sistema

A arquitetura segue o padrão **MVC** com separação em quatro camadas independentes:

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────┐      SQL/TCP       ┌─────────────────┐
│   Frontend      │ ──────────────────► │   Backend       │ ──────────────────► │  PostgreSQL     │
│  React + Vite   │    Porta 5000      │  Express + JWT  │    Porta 6543      │   Supabase      │
│  Porta 5173     │ ◄────────────────── │                 │ ◄────────────────── │                 │
└─────────────────┘                     └─────────────────┘                     └─────────────────┘
                                                                                        ▲
                                                                                        │ seed.sql
                                                                               ┌────────┴────────┐
                                                                               │  Data Science   │
                                                                               │  Python/Faker   │
                                                                               └─────────────────┘
```

> 📖 **Documentação completa com diagramas Mermaid:** [docs/arquitetura.md](docs/arquitetura.md)

---

## 📁 Estrutura do Projeto

```
credit-guard/
├── 📂 backend/                          # API REST — Node.js/Express
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   └── db.js                    # Pool de conexão PostgreSQL
│   │   ├── 📂 controllers/
│   │   │   └── apiController.js         # Lógica dos endpoints
│   │   ├── 📂 middleware/
│   │   │   └── auth.js                  # Middleware JWT
│   │   ├── 📂 routes/
│   │   │   └── api.js                   # Definição das rotas
│   │   ├── 📂 services/
│   │   │   └── kpiService.js            # Queries SQL e regras de negócio
│   │   └── server.js                    # Entry point Express
│   ├── .env                             # Variáveis de ambiente
│   └── package.json
│
├── 📂 frontend/                         # SPA — React/Vite
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── KpiCard.jsx              # Card de indicador KPI
│   │   │   ├── Layout.jsx               # Layout wrapper com Outlet
│   │   │   ├── Login.jsx                # Tela de autenticação
│   │   │   └── Sidebar.jsx              # Barra lateral de navegação
│   │   ├── 📂 pages/
│   │   │   ├── Alertas.jsx              # Central de alertas de risco
│   │   │   ├── ClienteDetail.jsx        # Ficha completa do cliente
│   │   │   ├── Clientes.jsx             # Lista paginada de clientes
│   │   │   └── Dashboard.jsx            # Painel principal com gráficos
│   │   ├── 📂 utils/
│   │   │   └── exportCsv.js             # Utilitário de exportação CSV
│   │   ├── App.jsx                      # Roteamento e PrivateRoute
│   │   ├── main.jsx                     # Bootstrap React
│   │   └── index.css                    # Estilos globais
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── 📂 database/                         # Scripts SQL
│   ├── schema.sql                       # DDL — Estrutura das tabelas
│   └── seed.sql                         # DML — Dados mock (~350KB)
│
├── 📂 data-science/                     # Pipeline de dados
│   └── 📂 notebooks/
│       ├── 01_gerador_mock.py           # Script de geração de dados
│       └── 02_analise_exploratoria.ipynb # Notebook de análise EDA
│
├── 📂 docs/                             # Documentação técnica
│   └── arquitetura.md                   # Diagramas de arquitetura
│
└── README.md                            # Este arquivo
```

---

## ⚙️ Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ e **npm** 9+
- **Python** 3.10+ (para o pipeline de dados)
- Conta no **Supabase** (ou PostgreSQL local)

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/credit-guard.git
cd credit-guard
```

### 2. Configurar o Banco de Dados

#### Opção A — Supabase (Cloud)
1. Crie um projeto no [Supabase](https://supabase.com)
2. No **SQL Editor**, execute o conteúdo de `database/schema.sql`
3. Em seguida, execute `database/seed.sql` para popular com dados mock

#### Opção B — PostgreSQL Local
1. Inicie o serviço PostgreSQL (`services.msc` → `postgresql-x64-17`)
2. Crie o banco: `CREATE DATABASE creditguard;`
3. Execute `schema.sql` e depois `seed.sql` via pgAdmin ou psql

### 3. Iniciar o Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend/` (veja seção abaixo) e então:

```bash
npm start
# Servidor rodando em http://localhost:5000
```

### 4. Iniciar o Frontend

```bash
cd frontend
npm install
npm run dev
# Aplicação disponível em http://localhost:5173
```

---

## 🔐 Variáveis de Ambiente

Crie o arquivo `backend/.env` com as seguintes variáveis:

```env
# === Banco de Dados ===
DB_HOST=aws-1-us-west-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.seu_projeto_id
DB_PASSWORD=sua_senha_segura

# === Autenticação ===
JWT_SECRET=sua_chave_jwt_secreta_aqui
```

> ⚠️ **Importante:** Nunca versione o arquivo `.env`. Adicione-o ao `.gitignore`.

---

## 📡 Endpoints da API

Base URL: `http://localhost:5000/api`

### Autenticação

| Método | Rota | Descrição | Auth |
|:------:|:-----|:----------|:----:|
| `POST` | `/api/login` | Autentica o usuário e retorna token JWT | ❌ |

**Body da requisição:**
```json
{
  "email": "analista@creditguard.com",
  "password": "mock123"
}
```

**Resposta de sucesso:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "name": "Analista Demo",
    "email": "analista@creditguard.com",
    "perfil": "analista"
  }
}
```

### Dashboard e KPIs

| Método | Rota | Descrição | Auth |
|:------:|:-----|:----------|:----:|
| `GET` | `/api/kpis` | KPIs principais: inadimplência, recuperação, atraso médio, críticos | 🔐 JWT |
| `GET` | `/api/kpis/avancados` | KPIs avançados com métricas detalhadas | 🔐 JWT |
| `GET` | `/api/dashboard/evolucao` | Evolução mensal da inadimplência (últimos 6 meses) | 🔐 JWT |
| `GET` | `/api/dashboard/risco-regional` | Distribuição de inadimplência por cidade | 🔐 JWT |

### Clientes

| Método | Rota | Descrição | Auth |
|:------:|:-----|:----------|:----:|
| `GET` | `/api/clientes?page=&limit=&regiao=&busca=` | Lista paginada com filtros por região e busca textual | 🔐 JWT |
| `GET` | `/api/clientes/criticos` | Clientes com atraso > 60 dias (risco alto) | 🔐 JWT |
| `GET` | `/api/clientes/:id` | Ficha completa: dados + contratos + parcelas | 🔐 JWT |

**Parâmetros de query:**
| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | `integer` | `1` | Página atual |
| `limit` | `integer` | `10` | Registros por página |
| `regiao` | `string` | — | Filtro por região geográfica |
| `busca` | `string` | — | Busca textual por nome ou CPF/CNPJ |

### Alertas e Monitoramento

| Método | Rota | Descrição | Auth |
|:------:|:-----|:----------|:----:|
| `GET` | `/api/alertas?page=&limit=&nivel=` | Lista paginada de alertas de risco | 🔐 JWT |
| `GET` | `/api/pagamentos` | Histórico de pagamentos com dados do cliente | 🔐 JWT |

### Inteligência Analítica

| Método | Rota | Descrição | Auth |
|:------:|:-----|:----------|:----:|
| `GET` | `/api/insights` | Insights automáticos sobre a carteira | 🔐 JWT |
| `GET` | `/api/tendencias` | Tendências e projeções de inadimplência | 🔐 JWT |

### Autenticação nas Requisições

Todas as rotas protegidas exigem o header `Authorization`:

```
Authorization: Bearer <token_jwt>
```

---

## 📏 Regras de Negócio

### Classificação de Risco

O sistema utiliza heurísticas baseadas no histórico de pagamentos para classificar clientes:

| Nível | Critério | Ação do Sistema |
|:-----:|:---------|:----------------|
| 🟢 **Baixo** | Atraso ≤ 15 dias | Monitoramento padrão |
| 🟡 **Médio** | Atraso entre 16 e 60 dias | Alerta preventivo gerado automaticamente |
| 🔴 **Alto** | Atraso > 60 dias **OU** múltiplos contratos inadimplentes | Cliente marcado como crítico — ação imediata |

### Definição de Inadimplência

Uma parcela é considerada **em atraso** quando:
- `data_pagamento IS NULL` (não foi paga)
- `data_vencimento < CURRENT_DATE` (já venceu)

### Status de Contratos

| Status | Descrição |
|--------|-----------|
| `ativo` | Contrato em vigência com parcelas pendentes |
| `quitado` | Todas as parcelas foram pagas |
| `inadimplente` | Contrato com parcelas vencidas e não pagas |

---

## ✨ Funcionalidades

### 📊 Dashboard Analítico
- **KPIs em tempo real:** inadimplência total, recuperação mensal, atraso médio, clientes críticos
- **Gráfico de evolução:** linha temporal da inadimplência nos últimos 6 meses
- **Risco regional:** distribuição geográfica por cidade com gráfico de barras

### 👥 Gestão de Clientes
- Listagem paginada com navegação por páginas
- Filtros por **região** e **busca textual** (nome/CPF)
- **Ficha completa** com contratos, parcelas e histórico de pagamentos
- Identificação visual de clientes **críticos** (atraso > 60 dias)

### ⚠️ Central de Alertas
- Listagem paginada de alertas de risco
- Filtros por **nível de risco** (Baixo, Médio, Alto)
- Detalhamento com nome do cliente, descrição e data de criação

### 📈 Inteligência Analítica
- **Insights automáticos** sobre a saúde da carteira de crédito
- **Tendências e projeções** de inadimplência futura
- Evolução temporal e distribuição regional

### 📥 Exportação CSV
- Utilitário integrado para exportar dados em formato CSV
- Dados formatados para análise em planilhas

### 🔐 Autenticação e Segurança
- Login com **email e senha** com hash bcrypt
- Token **JWT** com expiração de 8 horas
- **Rotas protegidas** no frontend (`PrivateRoute`)
- Middleware de autenticação no backend
- **CORS** configurado para requisições cross-origin
- Variáveis sensíveis isoladas em `.env`

---

## 🎓 Entregas Acadêmicas

### Semana 2 — Fundamentos e MVP
| Entrega | Status | Descrição |
|---------|:------:|-----------|
| Modelagem do banco de dados | ✅ | 5 tabelas com relacionamentos FK e constraints |
| Script DDL (`schema.sql`) | ✅ | Criação estrutural completa do banco |
| Geração de dados mock | ✅ | Python/Faker gerando ~350KB de dados realistas |
| Seed do banco (`seed.sql`) | ✅ | População automática das tabelas |
| API REST básica | ✅ | Endpoints de login, KPIs e listagens |
| Autenticação JWT | ✅ | Login com token e middleware de verificação |
| Dashboard com gráficos | ✅ | KPI Cards + Recharts para evolução e risco |

### Semana 3 — Aprofundamento e Analytics
| Entrega | Status | Descrição |
|---------|:------:|-----------|
| Classificação de risco heurística | ✅ | Baixo / Médio / Alto com critérios definidos |
| Central de alertas | ✅ | Listagem paginada com filtros por nível |
| Ficha detalhada do cliente | ✅ | Contratos, parcelas e histórico completo |
| Risco regional por cidade | ✅ | Mapa de calor de inadimplência geográfica |
| Exportação CSV | ✅ | Download de dados para análise offline |
| KPIs avançados | ✅ | Métricas detalhadas de saúde da carteira |
| Insights e tendências | ✅ | Análise inteligente com projeções |
| Documentação de arquitetura | ✅ | Diagramas Mermaid profissionais |

---

## 📄 Licença

Projeto acadêmico — desenvolvido para fins educacionais.

---

<p align="center">
  <strong>🛡️ CreditGuard AI</strong> — Inteligência para Recuperação de Crédito
  <br>
  <em>Desenvolvido com 💚 para fins acadêmicos · 2026</em>
</p>
