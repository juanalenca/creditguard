# 🏗️ Arquitetura do Sistema — CreditGuard AI

> Documento de Arquitetura Técnica  
> Versão 1.0 · Maio 2026

---

## Sumário

1. [Diagrama de Arquitetura do Sistema](#1-diagrama-de-arquitetura-do-sistema)
2. [Fluxo do Sistema — User Flow](#2-fluxo-do-sistema--user-flow)
3. [Fluxo ETL — Pipeline de Dados](#3-fluxo-etl--pipeline-de-dados)
4. [Modelo Lógico — Diagrama ER](#4-modelo-lógico--diagrama-er)
5. [Segurança e Governança](#5-segurança-e-governança)
6. [Classificação de Risco — Heurísticas](#6-classificação-de-risco--heurísticas)

---

## 1. Diagrama de Arquitetura do Sistema

Visão macro dos quatro pilares tecnológicos e seus protocolos de comunicação.

```mermaid
flowchart TB
    subgraph FRONTEND["🖥️ Frontend — React/Vite"]
        direction TB
        FE_APP["React 19 + Vite 8"]
        FE_TW["TailwindCSS 4"]
        FE_RC["Recharts 2"]
        FE_RR["React Router DOM 7"]
        FE_AX["Axios — HTTP Client"]
        FE_APP --- FE_TW
        FE_APP --- FE_RC
        FE_APP --- FE_RR
        FE_APP --- FE_AX
    end

    subgraph BACKEND["⚙️ Backend — Node.js/Express"]
        direction TB
        BE_SRV["Express 5 — Porta 5000"]
        BE_AUTH["Middleware JWT"]
        BE_CORS["Middleware CORS"]
        BE_CTRL["Controllers"]
        BE_SVC["Services — KPI Service"]
        BE_SRV --- BE_CORS
        BE_CORS --- BE_AUTH
        BE_AUTH --- BE_CTRL
        BE_CTRL --- BE_SVC
    end

    subgraph DATABASE["🗄️ Banco de Dados"]
        DB_PG["PostgreSQL — Supabase"]
        DB_TB1["usuarios"]
        DB_TB2["clientes"]
        DB_TB3["contratos"]
        DB_TB4["pagamentos"]
        DB_TB5["alertas_risco"]
        DB_PG --- DB_TB1
        DB_PG --- DB_TB2
        DB_PG --- DB_TB3
        DB_PG --- DB_TB4
        DB_PG --- DB_TB5
    end

    subgraph DATASCIENCE["🔬 Data Science — Python"]
        DS_PY["Python 3 + Faker"]
        DS_PD["Pandas — Análise Exploratória"]
        DS_NB["Jupyter Notebooks"]
        DS_PY --- DS_PD
        DS_PD --- DS_NB
    end

    FE_AX -- "HTTP REST / JSON\nPorta 5000" --> BE_SRV
    BE_SVC -- "SQL via pg Pool\nPorta 6543" --> DB_PG
    DS_PY -- "CSV / DataFrame\nseed.sql" --> DB_PG

    style FRONTEND fill:#1e3a5f,stroke:#60a5fa,color:#e0f2fe
    style BACKEND fill:#1a3320,stroke:#4ade80,color:#dcfce7
    style DATABASE fill:#3b1f0b,stroke:#fb923c,color:#fff7ed
    style DATASCIENCE fill:#3b0764,stroke:#c084fc,color:#f5f3ff
```

### Resumo das Comunicações

| Origem | Destino | Protocolo | Detalhe |
|--------|---------|-----------|---------|
| Frontend | Backend | HTTP REST / JSON | Axios → Express na porta 5000 |
| Backend | PostgreSQL | SQL / TCP | pg Pool → Supabase na porta 6543 |
| Data Science | PostgreSQL | SQL / Seed | Faker gera CSV → seed.sql → PostgreSQL |

---

## 2. Fluxo do Sistema — User Flow

Jornada completa do usuário dentro da plataforma, desde o login até a exportação de dados.

```mermaid
flowchart LR
    A["👤 Usuário"] --> B["📋 Tela de Login"]
    B -- "POST /api/login" --> C{"🔐 Autenticação JWT"}
    C -- "❌ Credenciais Inválidas" --> B
    C -- "✅ Token Gerado" --> D["📊 Dashboard"]

    D --> E["👥 Clientes"]
    D --> F["⚠️ Alertas de Risco"]
    D --> G["📈 Inteligência Analítica"]

    E --> H["🔍 Detalhe do Cliente"]
    H --> I["📄 Contratos e Parcelas"]
    E --> J["📥 Exportar CSV"]

    F --> K["🏷️ Filtro por Nível"]
    K --> L["Baixo / Médio / Alto"]

    G --> M["📉 Evolução da Inadimplência"]
    G --> N["🗺️ Risco Regional por Cidade"]

    style A fill:#0ea5e9,stroke:#0284c7,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#10b981,stroke:#059669,color:#fff
```

### Páginas e Rotas do Frontend

| Rota | Componente | Descrição | Autenticação |
|------|-----------|-----------|:------------:|
| `/login` | `Login.jsx` | Tela de autenticação | ❌ Pública |
| `/` | `Dashboard.jsx` | Painel principal com KPIs e gráficos | ✅ JWT |
| `/clientes` | `Clientes.jsx` | Lista paginada de clientes | ✅ JWT |
| `/clientes/:id` | `ClienteDetail.jsx` | Ficha completa do cliente | ✅ JWT |
| `/alertas` | `Alertas.jsx` | Central de alertas de risco | ✅ JWT |

---

## 3. Fluxo ETL — Pipeline de Dados

Pipeline completo desde a geração sintética de dados até a visualização no painel React.

```mermaid
flowchart LR
    subgraph GERACAO["1️⃣ Geração de Dados"]
        G1["Python 3 + Faker"]
        G2["01_gerador_mock.py"]
        G1 --> G2
    end

    subgraph TRANSFORMACAO["2️⃣ Transformação"]
        T1["Pandas DataFrame"]
        T2["Limpeza e Validação"]
        T3["Análise Exploratória"]
        T4["02_analise_exploratoria.ipynb"]
        T1 --> T2
        T2 --> T3
        T3 --> T4
    end

    subgraph CARGA["3️⃣ Carga"]
        C1["seed.sql gerado"]
        C2["schema.sql — DDL"]
        C3["PostgreSQL Supabase"]
        C2 --> C3
        C1 --> C3
    end

    subgraph CONSUMO["4️⃣ Consumo"]
        CO1["API REST — Express"]
        CO2["KPI Service — Queries SQL"]
        CO3["React UI — Dashboard"]
        CO1 --> CO2
        CO2 --> CO3
    end

    G2 -- "CSV / DataFrame" --> T1
    T2 -- "INSERT statements" --> C1
    C3 -- "pg Pool — SQL" --> CO1

    style GERACAO fill:#7c3aed,stroke:#6d28d9,color:#fff
    style TRANSFORMACAO fill:#2563eb,stroke:#1d4ed8,color:#fff
    style CARGA fill:#ea580c,stroke:#c2410c,color:#fff
    style CONSUMO fill:#059669,stroke:#047857,color:#fff
```

### Detalhamento das Etapas

| Etapa | Ferramenta | Artefato Produzido | Localização |
|-------|-----------|-------------------|-------------|
| Geração | Python + Faker | Dados sintéticos realistas | `data-science/notebooks/01_gerador_mock.py` |
| Análise | Pandas + Jupyter | Relatório exploratório | `data-science/notebooks/02_analise_exploratoria.ipynb` |
| Esquema DDL | SQL | Estrutura das 5 tabelas | `database/schema.sql` |
| Carga Seed | SQL | ~350KB de dados mock | `database/seed.sql` |
| API REST | Express + pg | Endpoints JSON | `backend/src/` |
| Visualização | React + Recharts | Dashboard interativo | `frontend/src/` |

---

## 4. Modelo Lógico — Diagrama ER

Modelo entidade-relacionamento completo com as cinco tabelas do sistema e seus relacionamentos.

```mermaid
erDiagram
    USUARIOS {
        serial id PK
        varchar nome
        varchar email UK
        varchar senha_hash
        varchar perfil
    }

    CLIENTES {
        serial id PK
        varchar nome
        varchar cpf_cnpj UK
        varchar telefone
        varchar regiao
        varchar cidade
        varchar estado
        date data_cadastro
    }

    CONTRATOS {
        serial id PK
        integer cliente_id FK
        decimal valor_total
        decimal saldo_devedor
        date data_contrato
        varchar status
    }

    PAGAMENTOS {
        serial id PK
        integer contrato_id FK
        decimal valor_parcela
        date data_vencimento
        date data_pagamento
    }

    ALERTAS_RISCO {
        serial id PK
        integer cliente_id FK
        varchar nivel_risco
        text descricao
        timestamp criado_em
    }

    CLIENTES ||--o{ CONTRATOS : "possui"
    CONTRATOS ||--o{ PAGAMENTOS : "gera"
    CLIENTES ||--o{ ALERTAS_RISCO : "dispara"
```

### Dicionário de Dados

#### Tabela `usuarios`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `SERIAL` | PK | Identificador único |
| `nome` | `VARCHAR(100)` | NOT NULL | Nome completo do operador |
| `email` | `VARCHAR(100)` | UNIQUE, NOT NULL | Email para login |
| `senha_hash` | `VARCHAR(255)` | NOT NULL | Hash bcrypt da senha |
| `perfil` | `VARCHAR(20)` | DEFAULT 'analista' | Papel no sistema |

#### Tabela `clientes`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `SERIAL` | PK | Identificador único |
| `nome` | `VARCHAR(150)` | NOT NULL | Nome ou razão social |
| `cpf_cnpj` | `VARCHAR(20)` | UNIQUE, NOT NULL | Documento fiscal |
| `telefone` | `VARCHAR(20)` | — | Contato telefônico |
| `regiao` | `VARCHAR(50)` | — | Região geográfica |
| `cidade` | `VARCHAR(100)` | — | Cidade do cliente |
| `estado` | `VARCHAR(2)` | — | UF do cliente |
| `data_cadastro` | `DATE` | DEFAULT CURRENT_DATE | Data de inclusão |

#### Tabela `contratos`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `SERIAL` | PK | Identificador único |
| `cliente_id` | `INTEGER` | FK → clientes | Referência ao cliente |
| `valor_total` | `DECIMAL(12,2)` | NOT NULL | Valor original do contrato |
| `saldo_devedor` | `DECIMAL(12,2)` | NOT NULL | Saldo remanescente |
| `data_contrato` | `DATE` | NOT NULL | Data de assinatura |
| `status` | `VARCHAR(20)` | DEFAULT 'ativo' | ativo / quitado / inadimplente |

#### Tabela `pagamentos`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `SERIAL` | PK | Identificador único |
| `contrato_id` | `INTEGER` | FK → contratos | Referência ao contrato |
| `valor_parcela` | `DECIMAL(12,2)` | NOT NULL | Valor da parcela |
| `data_vencimento` | `DATE` | NOT NULL | Data de vencimento |
| `data_pagamento` | `DATE` | NULLABLE | Data efetiva do pagamento |

> **Regra de negócio:** Se `data_pagamento IS NULL` e `data_vencimento < CURRENT_DATE`, a parcela é considerada **em atraso**.

#### Tabela `alertas_risco`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | `SERIAL` | PK | Identificador único |
| `cliente_id` | `INTEGER` | FK → clientes | Referência ao cliente |
| `nivel_risco` | `VARCHAR(20)` | — | Baixo / Medio / Alto |
| `descricao` | `TEXT` | — | Descrição narrativa do risco |
| `criado_em` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Data/hora de criação |

---

## 5. Segurança e Governança

### 5.1 Pipeline de Segurança no Backend

Fluxo completo de uma requisição autenticada, do recebimento até a resposta.

```mermaid
flowchart LR
    A["🌐 Request HTTP"] --> B["🔒 CORS Middleware"]
    B --> C["🛡️ Auth Middleware"]
    C --> D{"🔑 JWT Válido?"}
    D -- "❌ 401 Unauthorized" --> E["⛔ Resposta de Erro"]
    D -- "✅ Token Decodificado" --> F["📋 Controller"]
    F --> G["⚙️ Service Layer"]
    G --> H["🗄️ PostgreSQL"]
    H --> I["📦 JSON Response"]

    style A fill:#64748b,stroke:#475569,color:#fff
    style D fill:#f59e0b,stroke:#d97706,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style I fill:#10b981,stroke:#059669,color:#fff
```

### 5.2 Proteção de Rotas no Frontend

Mecanismo de guarda de rotas utilizando `PrivateRoute` com verificação de token no `localStorage`.

```mermaid
flowchart LR
    A["🧭 Navegação para Rota Protegida"] --> B["🔐 PrivateRoute"]
    B --> C{"🎫 Token no localStorage?"}
    C -- "❌ Sem token" --> D["↩️ Redirect para /login"]
    C -- "✅ Token presente" --> E["✅ Renderiza Componente"]
    E --> F["📐 Layout + Sidebar"]
    F --> G["📄 Página Solicitada"]

    style B fill:#7c3aed,stroke:#6d28d9,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#ef4444,stroke:#dc2626,color:#fff
    style G fill:#10b981,stroke:#059669,color:#fff
```

### 5.3 Detalhamento Técnico da Segurança

| Camada | Tecnologia | Detalhamento |
|--------|-----------|-------------|
| **CORS** | `cors` middleware | Permite requisições cross-origin do frontend |
| **Autenticação** | `jsonwebtoken` | Tokens JWT com expiração de 8 horas |
| **Hashing** | `bcrypt` | Hash de senhas com salt rounds |
| **Transporte** | HTTPS / Supabase | Conexão cifrada com o banco na nuvem |
| **Variáveis** | `dotenv` | Segredos isolados em `.env` fora do controle de versão |
| **Frontend Guard** | `PrivateRoute` | HOC que valida presença do token antes de renderizar |

### 5.4 Estrutura do Token JWT

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": 1,
    "perfil": "analista",
    "iat": 1748200000,
    "exp": 1748228800
  }
}
```

---

## 6. Classificação de Risco — Heurísticas

### Regras de Classificação

O sistema classifica os clientes em três níveis de risco com base no histórico de pagamentos e atrasos.

```mermaid
flowchart TD
    A["📊 Avaliar Cliente"] --> B{"Dias de Atraso?"}
    
    B -- "0 a 15 dias" --> C["🟢 BAIXO"]
    B -- "16 a 60 dias" --> D["🟡 MÉDIO"]
    B -- "Acima de 60 dias" --> E["🔴 ALTO"]
    
    A --> F{"Múltiplos Contratos\nInadimplentes?"}
    F -- "✅ Sim" --> E
    F -- "❌ Não" --> B

    C --> G["Monitoramento padrão"]
    D --> H["Alerta preventivo gerado"]
    E --> I["Ação imediata requerida"]

    style C fill:#22c55e,stroke:#16a34a,color:#fff
    style D fill:#eab308,stroke:#ca8a04,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style G fill:#dcfce7,stroke:#86efac,color:#166534
    style H fill:#fef9c3,stroke:#fde047,color:#713f12
    style I fill:#fee2e2,stroke:#fca5a5,color:#991b1b
```

### Tabela de Critérios

| Nível | Ícone | Critério | Ação do Sistema |
|-------|:-----:|----------|----------------|
| **Baixo** | 🟢 | Atraso ≤ 15 dias | Monitoramento padrão — sem alerta |
| **Médio** | 🟡 | Atraso entre 16 e 60 dias | Alerta preventivo gerado automaticamente |
| **Alto** | 🔴 | Atraso > 60 dias **OU** múltiplos contratos inadimplentes | Ação imediata — cliente marcado como crítico |

### Implementação no Backend

A identificação de clientes críticos é realizada pela query no `kpiService.js`:

```sql
-- Clientes com atraso superior a 60 dias (Risco Alto)
SELECT DISTINCT c.* 
FROM clientes c
JOIN contratos ct ON c.id = ct.cliente_id
JOIN pagamentos p ON ct.id = p.contrato_id
WHERE p.data_pagamento IS NULL 
  AND CURRENT_DATE - p.data_vencimento > 60;
```

### Métricas Calculadas (KPIs)

| KPI | Cálculo | Descrição |
|-----|---------|-----------|
| **Inadimplência Total** | `SUM(valor_parcela)` onde `data_pagamento IS NULL` e vencida | Soma de todas as parcelas em atraso |
| **Recuperação do Mês** | `SUM(valor_parcela)` onde `data_pagamento > data_vencimento` no mês atual | Parcelas pagas com atraso neste mês |
| **Atraso Médio** | `AVG(CURRENT_DATE - data_vencimento)` das parcelas vencidas | Média de dias de atraso |
| **Clientes Críticos** | `COUNT(DISTINCT cliente_id)` na tabela de alertas | Total de clientes com alertas ativos |

---

> **Documento gerado em:** Maio 2026  
> **Projeto:** CreditGuard AI — Plataforma Analítica de Recuperação de Crédito  
> **Disciplina:** Projeto Universitário — Semanas 2 e 3
