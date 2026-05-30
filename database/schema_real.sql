-- =============================================
-- CreditGuard AI - Schema Real (Dados do Professor)
-- Adaptado para os datasets: cobranca_assessorias.csv + fluxo_pagamentos.xlsx
-- =============================================

-- Tabela de Acesso ao Sistema
DROP TABLE IF EXISTS alertas_risco, pagamentos, contratos, clientes CASCADE;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) DEFAULT 'analista'
);

-- Contratos de Cobrança (origem: cobranca_assessorias.csv)
CREATE TABLE IF NOT EXISTS contratos (
    id SERIAL PRIMARY KEY,
    id_contrato VARCHAR(20) UNIQUE NOT NULL,       -- CONTR_2026_XXXXX
    nome_assessoria VARCHAR(150),
    data_envio_assessoria DATE,
    dias_atraso_inicial INTEGER DEFAULT 0,
    valor_inadimplente DECIMAL(12,2) DEFAULT 0,
    status_cobranca VARCHAR(30),                    -- 'Em Aberto', 'Acordo Firmado', 'Insucesso', 'Ajuizado'
    score_risco DECIMAL(5,2),
    regiao VARCHAR(50)                              -- 'Nordeste', 'Sudeste', 'Sul', 'Norte', 'Centro-Oeste'
);

-- Parcelas e Fluxo de Pagamento (origem: fluxo_pagamentos.xlsx)
CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    id_pagamento VARCHAR(20) UNIQUE NOT NULL,       -- PAG_XXXXXXX
    id_contrato VARCHAR(20) NOT NULL REFERENCES contratos(id_contrato) ON DELETE CASCADE,
    numero_parcela INTEGER,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,                            -- NULL = não pago
    valor_parcela DECIMAL(12,2) NOT NULL,
    valor_pago DECIMAL(12,2) DEFAULT 0,
    forma_pagamento VARCHAR(30),                    -- 'Boleto', 'Pix', 'Débito Automático'
    indicador_contemplado BOOLEAN DEFAULT FALSE
);

-- Alertas de Risco (gerados pelo sistema)
CREATE TABLE IF NOT EXISTS alertas_risco (
    id SERIAL PRIMARY KEY,
    id_contrato VARCHAR(20) REFERENCES contratos(id_contrato) ON DELETE CASCADE,
    nivel_risco VARCHAR(20),                        -- 'Baixo', 'Medio', 'Alto'
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_contrato ON pagamentos(id_contrato);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_pagamento ON pagamentos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_contratos_regiao ON contratos(regiao);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status_cobranca);
CREATE INDEX IF NOT EXISTS idx_alertas_contrato ON alertas_risco(id_contrato);

-- Usuário admin padrão
INSERT INTO usuarios (nome, email, senha_hash, perfil) 
VALUES ('Administrador Geral', 'admin@linus.com', 'hashed_pass_mock', 'admin')
ON CONFLICT (email) DO NOTHING;
