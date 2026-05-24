import random
from faker import Faker
from datetime import datetime, timedelta

fake = Faker('pt_BR')
Faker.seed(42)
random.seed(42)

NUM_CLIENTES = 150
CIDADES_REGIOES = [
    ('Recife', 'PE', 'Nordeste'),
    ('Olinda', 'PE', 'Nordeste'),
    ('Jaboatão dos Guararapes', 'PE', 'Nordeste'),
    ('Paulista', 'PE', 'Nordeste'),
    ('São Paulo', 'SP', 'Sudeste'),
    ('Campinas', 'SP', 'Sudeste'),
]

sql_statements = []

# ==========================================
# 1. USUÁRIOS
# ==========================================
sql_statements.append("INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES")
sql_statements.append("('Administrador Geral', 'admin@creditguard.com', 'hashed_pass_mock', 'admin'),")
sql_statements.append("('Analista Financeiro', 'analista@creditguard.com', 'hashed_pass_mock', 'analista');\n")

# ==========================================
# 2. CLIENTES
# ==========================================
clientes_sql = []
sql_statements.append("INSERT INTO clientes (id, nome, cpf_cnpj, telefone, regiao, cidade, estado, data_cadastro) VALUES")

for i in range(1, NUM_CLIENTES + 1):
    nome = fake.name().replace("'", "''")
    cpf = fake.cpf()
    telefone = fake.phone_number()
    cidade, estado, regiao = random.choice(CIDADES_REGIOES)
    data_cadastro = fake.date_between(start_date='-2y', end_date='-6m').strftime('%Y-%m-%d')
    
    clientes_sql.append(f"({i}, '{nome}', '{cpf}', '{telefone}', '{regiao}', '{cidade}', '{estado}', '{data_cadastro}')")

sql_statements.append(",\n".join(clientes_sql) + ";\n")

# ==========================================
# 3. CONTRATOS E PAGAMENTOS (PARCELAS)
# ==========================================
contratos_sql = []
pagamentos_sql = []
alertas_sql = []

contrato_id = 1
pagamento_id = 1
alerta_id = 1

sql_statements.append("INSERT INTO contratos (id, cliente_id, valor_total, saldo_devedor, data_contrato, status) VALUES")

hoje = datetime.now().date()

for cliente_id in range(1, NUM_CLIENTES + 1):
    num_contratos = random.choices([1, 2, 3], weights=[0.7, 0.2, 0.1])[0]
    
    for _ in range(num_contratos):
        valor_total = round(random.uniform(5000, 150000), 2)
        num_parcelas = random.choices([12, 24, 36, 48, 60])[0]
        valor_parcela = round(valor_total / num_parcelas, 2)
        
        # Decide the start date of the contract
        dias_inicio = random.randint(30, 700)
        data_contrato = hoje - timedelta(days=dias_inicio)
        
        # Determine the risk profile of this contract (70% in day, 20% slight delay, 10% critical)
        perfil = random.choices(['em_dia', 'atraso_leve', 'atraso_critico'], weights=[0.7, 0.2, 0.1])[0]
        
        saldo_devedor = valor_total
        status = 'ativo'
        
        # Generate installments (parcelas)
        parcelas_deste_contrato = []
        for p in range(1, num_parcelas + 1):
            data_venc = data_contrato + timedelta(days=30 * p)
            
            # Se a data_vencimento ainda vai chegar
            if data_venc > hoje:
                data_pag = "NULL"
            else:
                # Já venceu. O perfil decide se pagou ou não.
                if perfil == 'em_dia':
                    # Pagou em dia ou alguns dias antes
                    data_pag = f"'{data_venc - timedelta(days=random.randint(0, 5))}'"
                    saldo_devedor -= valor_parcela
                elif perfil == 'atraso_leve':
                    # Pagou com pequeno atraso, ou a última está atrasada
                    if p == num_parcelas or random.random() < 0.3:
                        data_pag = "NULL" # Ainda não pagou e venceu (atrasada)
                    else:
                        data_pag = f"'{data_venc + timedelta(days=random.randint(1, 29))}'"
                        saldo_devedor -= valor_parcela
                elif perfil == 'atraso_critico':
                    # Várias parcelas sem pagar
                    if random.random() < 0.6:
                        data_pag = "NULL" # Não pagou
                    else:
                        data_pag = f"'{data_venc + timedelta(days=random.randint(5, 65))}'"
                        saldo_devedor -= valor_parcela
            
            parcelas_deste_contrato.append(f"({pagamento_id}, {contrato_id}, {valor_parcela}, '{data_venc}', {data_pag})")
            
            # Se é uma parcela atrasada crítica (>60 dias), gerar um alerta de risco alto
            if data_pag == "NULL" and data_venc < hoje:
                dias_atraso = (hoje - data_venc).days
                if dias_atraso > 60:
                    alertas_sql.append(f"({alerta_id}, {cliente_id}, 'Alto', 'Cliente com parcela {p} atrasada há {dias_atraso} dias.', '{hoje}')")
                    alerta_id += 1
                    status = 'inadimplente'
                elif dias_atraso > 15 and status != 'inadimplente':
                    alertas_sql.append(f"({alerta_id}, {cliente_id}, 'Medio', 'Atraso detectado na parcela {p}.', '{hoje}')")
                    alerta_id += 1
                    status = 'inadimplente' if status == 'inadimplente' else 'ativo'
                    
            pagamento_id += 1
            
        contratos_sql.append(f"({contrato_id}, {cliente_id}, {valor_total}, {saldo_devedor:.2f}, '{data_contrato}', '{status}')")
        pagamentos_sql.extend(parcelas_deste_contrato)
        contrato_id += 1

sql_statements.append(",\n".join(contratos_sql) + ";\n")

sql_statements.append("INSERT INTO pagamentos (id, contrato_id, valor_parcela, data_vencimento, data_pagamento) VALUES")
# To avoid huge statements, chunk pagamentos
CHUNK_SIZE = 1000
for i in range(0, len(pagamentos_sql), CHUNK_SIZE):
    chunk = pagamentos_sql[i:i + CHUNK_SIZE]
    if i > 0:
        sql_statements.append("INSERT INTO pagamentos (id, contrato_id, valor_parcela, data_vencimento, data_pagamento) VALUES")
    sql_statements.append(",\n".join(chunk) + ";\n")

if alertas_sql:
    sql_statements.append("INSERT INTO alertas_risco (id, cliente_id, nivel_risco, descricao, criado_em) VALUES")
    sql_statements.append(",\n".join(alertas_sql) + ";\n")

# Atualizar sequências
sql_statements.append(f"SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));")
sql_statements.append(f"SELECT setval('clientes_id_seq', (SELECT MAX(id) FROM clientes));")
sql_statements.append(f"SELECT setval('contratos_id_seq', (SELECT MAX(id) FROM contratos));")
sql_statements.append(f"SELECT setval('pagamentos_id_seq', (SELECT MAX(id) FROM pagamentos));")
sql_statements.append(f"SELECT setval('alertas_risco_id_seq', (SELECT COALESCE(MAX(id), 1) FROM alertas_risco));")

with open('../../database/seed.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))

print(f"✅ Mock data gerado com sucesso! Arquivo 'seed.sql' criado na pasta database.")
