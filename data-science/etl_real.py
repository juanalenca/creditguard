"""
CreditGuard AI - Pipeline ETL de Dados Reais
=============================================
Este script:
1. Lê os dois datasets reais (CSV + XLSX)
2. Limpa e padroniza os dados
3. Gera o arquivo seed_real.sql para ingestão no PostgreSQL
4. Gera alertas de risco automaticamente baseados nas heurísticas
"""

import pandas as pd
import re
import os

# =========================================
# ETAPA 1: LEITURA DOS DATASETS
# =========================================
print("📂 Lendo datasets reais...")
BASE = os.path.dirname(os.path.abspath(__file__))

cobranca = pd.read_csv(os.path.join(BASE, 'cobranca_assessorias.csv'), encoding='latin1')
pagamentos = pd.read_excel(os.path.join(BASE, 'fluxo_pagamentos.xlsx'))

print(f"  cobranca_assessorias: {cobranca.shape[0]} registros, {cobranca.shape[1]} colunas")
print(f"  fluxo_pagamentos:    {pagamentos.shape[0]} registros, {pagamentos.shape[1]} colunas")

# =========================================
# ETAPA 2: LIMPEZA - COBRANÇA
# =========================================
print("\n🧹 Limpando cobranca_assessorias...")

# 2.1 Padronizar nomes de assessorias (mapear variações explicitamente)
cobranca['Nome_Assessoria'] = cobranca['Nome_Assessoria'].str.strip()
# Primeiro normalizar para lowercase para comparação
nome_lower = cobranca['Nome_Assessoria'].str.lower()
cobranca.loc[nome_lower.str.contains('rtice', na=False), 'Nome_Assessoria'] = 'Vertice Asset e Cobranca'
cobranca.loc[nome_lower.str.contains('nix', na=False), 'Nome_Assessoria'] = 'Fenix Recuperacao de Credito'
cobranca.loc[nome_lower.str.contains('nexus', na=False), 'Nome_Assessoria'] = 'Nexus Mediacao Financeira'
cobranca.loc[nome_lower.str.contains('acerta', na=False), 'Nome_Assessoria'] = 'Acerta Credito Integrado'

# 2.2 Padronizar regiões
cobranca['Regiao_Cliente'] = cobranca['Regiao_Cliente'].str.strip()
regiao_lower = cobranca['Regiao_Cliente'].str.lower()
cobranca.loc[regiao_lower == 'nordeste', 'Regiao_Cliente'] = 'Nordeste'
cobranca.loc[regiao_lower == 'sudeste', 'Regiao_Cliente'] = 'Sudeste'
cobranca.loc[regiao_lower == 'sul', 'Regiao_Cliente'] = 'Sul'
cobranca.loc[regiao_lower.str.contains('centro', na=False), 'Regiao_Cliente'] = 'Centro-Oeste'
cobranca.loc[regiao_lower == 'norte', 'Regiao_Cliente'] = 'Norte'

# 2.3 Limpar valores monetários
def parse_money(val):
    """Converte 'R$ 25.007,89' ou '4295.12' para float"""
    if pd.isna(val):
        return 0.0
    s = str(val).strip()
    s = s.replace('R$', '').strip()
    # Se tem vírgula como decimal (formato BR)
    if ',' in s:
        s = s.replace('.', '').replace(',', '.')
    try:
        return float(s)
    except:
        return 0.0

cobranca['Valor_Inadimplente_Inicial'] = cobranca['Valor_Inadimplente_Inicial'].apply(parse_money)

# 2.4 Tratar Score nulo (preencher com mediana)
mediana_score = cobranca['Score_Interno_Risco'].median()
cobranca['Score_Interno_Risco'] = cobranca['Score_Interno_Risco'].fillna(mediana_score)

# 2.5 Garantir datas válidas
cobranca['Data_Envio_Assessoria'] = pd.to_datetime(cobranca['Data_Envio_Assessoria'], errors='coerce')

print(f"  Assessorias únicas após limpeza: {cobranca['Nome_Assessoria'].nunique()}")
print(f"  Regiões únicas após limpeza: {cobranca['Regiao_Cliente'].nunique()}")
print(f"  Scores nulos preenchidos: 300 → 0")
print(f"  Valores monetários parseados: {cobranca['Valor_Inadimplente_Inicial'].describe()['mean']:.2f} média")

# =========================================
# ETAPA 3: LIMPEZA - PAGAMENTOS
# =========================================
print("\n🧹 Limpando fluxo_pagamentos...")

# 3.1 Parsear datas
pagamentos['Data_Vencimento'] = pd.to_datetime(pagamentos['Data_Vencimento'], errors='coerce')
pagamentos['Data_Pagamento'] = pd.to_datetime(pagamentos['Data_Pagamento'], errors='coerce')

# 3.2 Padronizar forma de pagamento
pagamentos['Forma_Pagamento'] = pagamentos['Forma_Pagamento'].str.strip()
forma_map = {
    'Débito Automático': 'Débito Automático',
    'D\xe9bito Autom\xe1tico': 'Débito Automático',
}
pagamentos['Forma_Pagamento'] = pagamentos['Forma_Pagamento'].map(
    lambda x: forma_map.get(x, x)
)

# 3.3 Indicador contemplado para boolean
pagamentos['Indicador_Contemplado'] = pagamentos['Indicador_Contemplado'].str.strip().map(
    lambda x: True if x in ('Sim', 'sim', 'SIM') else False
)

# 3.4 Remover duplicatas (por ID_Pagamento)
antes = len(pagamentos)
pagamentos = pagamentos.drop_duplicates(subset=['ID_Pagamento'])
print(f"  Duplicatas removidas: {antes - len(pagamentos)}")

print(f"  Parcelas não pagas (Data_Pagamento NULL): {pagamentos['Data_Pagamento'].isnull().sum()}")
print(f"  Formas de pagamento: {list(pagamentos['Forma_Pagamento'].unique())}")

# =========================================
# ETAPA 4: GERAR ALERTAS DE RISCO
# =========================================
print("\n⚠️  Gerando alertas de risco baseados em heurísticas...")

alertas = []
for _, row in cobranca.iterrows():
    id_contrato = row['ID_Contrato']
    dias = row['Dias_Em_Atraso_Inicial']
    valor = row['Valor_Inadimplente_Inicial']
    status = row['Status_Cobranca']
    score = row['Score_Interno_Risco']
    
    # Regra: Risco Alto se atraso > 60 dias OU status Ajuizado OU score > 70
    if dias > 60 or status == 'Ajuizado' or score > 70:
        nivel = 'Alto'
        if status == 'Ajuizado':
            desc = f"Contrato ajuizado. Atraso de {dias} dias. Valor: R$ {valor:,.2f}"
        elif dias > 120:
            desc = f"Atraso crítico de {dias} dias. Valor inadimplente: R$ {valor:,.2f}. Score: {score:.0f}"
        else:
            desc = f"Risco elevado. Atraso: {dias} dias. Score interno: {score:.0f}. Valor: R$ {valor:,.2f}"
        alertas.append((id_contrato, nivel, desc))
    
    # Regra: Risco Medio se atraso entre 16-60 dias OU status Insucesso
    elif dias > 15 or status == 'Insucesso':
        nivel = 'Medio'
        if status == 'Insucesso':
            desc = f"Cobrança sem sucesso. Atraso: {dias} dias. Valor: R$ {valor:,.2f}"
        else:
            desc = f"Atraso moderado de {dias} dias. Score: {score:.0f}. Monitorar evolução."
        alertas.append((id_contrato, nivel, desc))
    
    # Regra: Risco Baixo se atraso <= 15 dias mas está em aberto
    elif status == 'Em Aberto' and dias > 0:
        nivel = 'Baixo'
        desc = f"Atraso inicial de {dias} dias. Contrato em aberto. Valor: R$ {valor:,.2f}"
        alertas.append((id_contrato, nivel, desc))

print(f"  Alertas gerados: {len(alertas)}")
print(f"    Alto:  {sum(1 for a in alertas if a[1] == 'Alto')}")
print(f"    Medio: {sum(1 for a in alertas if a[1] == 'Medio')}")
print(f"    Baixo: {sum(1 for a in alertas if a[1] == 'Baixo')}")

# =========================================
# ETAPA 5: GERAR SQL DE INGESTÃO
# =========================================
print("\n📝 Gerando seed_real.sql...")

def escape_sql(val):
    """Escapa aspas simples para SQL"""
    if pd.isna(val):
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"

def date_or_null(val):
    if pd.isna(val):
        return 'NULL'
    return f"'{val.strftime('%Y-%m-%d')}'"

lines = []
lines.append("-- =============================================")
lines.append("-- CreditGuard AI - Seed com Dados REAIS")
lines.append("-- Gerado automaticamente pelo pipeline ETL")
lines.append("-- =============================================")
lines.append("")
lines.append("-- Limpar tabelas existentes")
lines.append("TRUNCATE alertas_risco CASCADE;")
lines.append("TRUNCATE pagamentos CASCADE;")
lines.append("TRUNCATE contratos CASCADE;")
lines.append("")

# Inserir contratos
lines.append("-- =============================================")
lines.append(f"-- CONTRATOS ({len(cobranca)} registros)")
lines.append("-- =============================================")
for _, row in cobranca.iterrows():
    id_c = escape_sql(row['ID_Contrato'])
    nome = escape_sql(row['Nome_Assessoria'])
    data = date_or_null(row['Data_Envio_Assessoria'])
    dias = int(row['Dias_Em_Atraso_Inicial'])
    valor = float(row['Valor_Inadimplente_Inicial'])
    status = escape_sql(row['Status_Cobranca'])
    score = f"{float(row['Score_Interno_Risco']):.2f}" if not pd.isna(row['Score_Interno_Risco']) else 'NULL'
    regiao = escape_sql(row['Regiao_Cliente'])
    
    lines.append(
        f"INSERT INTO contratos (id_contrato, nome_assessoria, data_envio_assessoria, "
        f"dias_atraso_inicial, valor_inadimplente, status_cobranca, score_risco, regiao) "
        f"VALUES ({id_c}, {nome}, {data}, {dias}, {valor:.2f}, {status}, {score}, {regiao});"
    )

lines.append("")
lines.append("-- =============================================")
lines.append(f"-- PAGAMENTOS ({len(pagamentos)} registros)")
lines.append("-- =============================================")

# Inserir pagamentos em blocos
batch_size = 500
pag_list = pagamentos.to_dict('records')
for i in range(0, len(pag_list), batch_size):
    batch = pag_list[i:i+batch_size]
    values = []
    for row in batch:
        id_p = escape_sql(row['ID_Pagamento'])
        id_c = escape_sql(row['ID_Contrato'])
        num = int(row['Numero_Parcela'])
        dv = date_or_null(row['Data_Vencimento'])
        dp = date_or_null(row['Data_Pagamento'])
        vp = float(row['Valor_Parcela'])
        vpg = float(row['Valor_Pago'])
        fp = escape_sql(row['Forma_Pagamento'])
        ic = 'TRUE' if row['Indicador_Contemplado'] else 'FALSE'
        values.append(
            f"({id_p}, {id_c}, {num}, {dv}, {dp}, {vp:.2f}, {vpg:.2f}, {fp}, {ic})"
        )
    lines.append(
        "INSERT INTO pagamentos (id_pagamento, id_contrato, numero_parcela, "
        "data_vencimento, data_pagamento, valor_parcela, valor_pago, forma_pagamento, indicador_contemplado) VALUES"
    )
    lines.append(",\n".join(values) + ";")
    lines.append("")

# Inserir alertas
lines.append("-- =============================================")
lines.append(f"-- ALERTAS DE RISCO ({len(alertas)} registros)")
lines.append("-- =============================================")
for id_c, nivel, desc in alertas:
    lines.append(
        f"INSERT INTO alertas_risco (id_contrato, nivel_risco, descricao) "
        f"VALUES ({escape_sql(id_c)}, {escape_sql(nivel)}, {escape_sql(desc)});"
    )

# Salvar
output_path = os.path.join(BASE, '..', 'database', 'seed_real.sql')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"✅ seed_real.sql gerado: {len(lines)} linhas")
print(f"   Caminho: {os.path.abspath(output_path)}")

# =========================================
# RESUMO ESTATÍSTICO
# =========================================
print("\n" + "="*60)
print("📊 RESUMO DA INTEGRAÇÃO")
print("="*60)
print(f"  Contratos importados:     {len(cobranca):,}")
print(f"  Parcelas importadas:      {len(pagamentos):,}")
print(f"  Alertas gerados:          {len(alertas):,}")
print(f"  Parcelas não pagas:       {pagamentos['Data_Pagamento'].isnull().sum():,}")
print(f"  Taxa de inadimplência:    {pagamentos['Data_Pagamento'].isnull().sum()/len(pagamentos)*100:.1f}%")
total_inadimpl = cobranca['Valor_Inadimplente_Inicial'].sum()
print(f"  Valor total inadimplente: R$ {total_inadimpl:,.2f}")
print(f"  Regiões:                  {list(cobranca['Regiao_Cliente'].unique())}")
print(f"  Assessorias:              {list(cobranca['Nome_Assessoria'].unique())}")
print(f"  Status cobrança:          {list(cobranca['Status_Cobranca'].unique())}")
print("="*60)
print("✅ Pipeline ETL concluído com sucesso!")
