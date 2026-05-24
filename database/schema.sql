-- Tabela de Acesso ao Sistema
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) DEFAULT 'analista'
);

-- Cadastro da Carteira de Clientes (com Risco Regional)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    regiao VARCHAR(50),      -- Ex: Nordeste, Sudeste
    cidade VARCHAR(100),     -- Ex: Recife, Olinda
    estado VARCHAR(2),       -- Ex: PE, SP
    data_cadastro DATE DEFAULT CURRENT_DATE
);

-- Títulos/Dívidas dos Clientes
CREATE TABLE contratos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    valor_total DECIMAL(12,2) NOT NULL,
    saldo_devedor DECIMAL(12,2) NOT NULL,
    data_contrato DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo' -- 'ativo', 'quitado', 'inadimplente'
);

-- Parcelas e Histórico (Base para Análise Temporal e Inadimplência)
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    contrato_id INTEGER REFERENCES contratos(id) ON DELETE CASCADE,
    valor_parcela DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE                -- Se NULL e data_vencimento < CURRENT_DATE = Atraso
);

-- Notificações de Risco e Histórico de Críticos
CREATE TABLE alertas_risco (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    nivel_risco VARCHAR(20),           -- 'Medio', 'Alto'
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
