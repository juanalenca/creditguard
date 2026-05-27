import nbformat as nbf
import os
import subprocess

base_dir = os.path.dirname(os.path.abspath(__file__))
notebooks_dir = os.path.join(base_dir, 'notebooks')
os.makedirs(notebooks_dir, exist_ok=True)

def create_and_execute(filename, cells):
    nb = nbf.v4.new_notebook()
    nb['cells'] = cells
    filepath = os.path.join(notebooks_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        nbf.write(nb, f)
    
    print(f"Executando {filename}...")
    subprocess.run([
        'jupyter', 'nbconvert', '--to', 'notebook', '--execute',
        '--inplace', filepath
    ], check=True)
    print(f"Sucesso: {filename} executado!")

# ==========================================
# 01_data_cleaning_real.ipynb
# ==========================================
nb1_cells = [
    nbf.v4.new_markdown_cell("# Limpeza de Dados (Data Cleaning)\nNeste notebook importamos os datasets reais `cobranca_assessorias.csv` e `fluxo_pagamentos.xlsx`, validamos encoding e tratamos nulos/inconsistências."),
    nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt

# Caminhos
BASE_DIR = os.path.abspath('..')
cobranca_path = os.path.join(BASE_DIR, 'cobranca_assessorias.csv')
pagamentos_path = os.path.join(BASE_DIR, 'fluxo_pagamentos.xlsx')

# Leitura com tratamento de encoding
print("Lendo contratos...")
contratos = pd.read_csv(cobranca_path, encoding='latin1')
print(f"Contratos originais: {contratos.shape}")

print("Lendo pagamentos...")
pagamentos = pd.read_excel(pagamentos_path)
print(f"Pagamentos originais: {pagamentos.shape}")"""),
    nbf.v4.new_markdown_cell("### Limpeza e Padronização de Assessorias e Regiões"),
    nbf.v4.new_code_cell("""# Remover espaços e padronizar
contratos['Nome_Assessoria'] = contratos['Nome_Assessoria'].str.strip()
nome_lower = contratos['Nome_Assessoria'].str.lower()
contratos.loc[nome_lower.str.contains('rtice', na=False), 'Nome_Assessoria'] = 'Vertice Asset e Cobranca'
contratos.loc[nome_lower.str.contains('nix', na=False), 'Nome_Assessoria'] = 'Fenix Recuperacao de Credito'
contratos.loc[nome_lower.str.contains('nexus', na=False), 'Nome_Assessoria'] = 'Nexus Mediacao Financeira'
contratos.loc[nome_lower.str.contains('acerta', na=False), 'Nome_Assessoria'] = 'Acerta Credito Integrado'

contratos['Regiao_Cliente'] = contratos['Regiao_Cliente'].str.strip()
regiao_lower = contratos['Regiao_Cliente'].str.lower()
contratos.loc[regiao_lower == 'nordeste', 'Regiao_Cliente'] = 'Nordeste'
contratos.loc[regiao_lower == 'sudeste', 'Regiao_Cliente'] = 'Sudeste'
contratos.loc[regiao_lower == 'sul', 'Regiao_Cliente'] = 'Sul'
contratos.loc[regiao_lower.str.contains('centro', na=False), 'Regiao_Cliente'] = 'Centro-Oeste'
contratos.loc[regiao_lower == 'norte', 'Regiao_Cliente'] = 'Norte'

print("Assessorias únicas:", contratos['Nome_Assessoria'].unique())
print("Regiões únicas:", contratos['Regiao_Cliente'].unique())"""),
    nbf.v4.new_markdown_cell("### Parse de Valores Monetários e Datas"),
    nbf.v4.new_code_cell("""def parse_money(val):
    if pd.isna(val): return 0.0
    s = str(val).strip().replace('R$', '').strip()
    if ',' in s: s = s.replace('.', '').replace(',', '.')
    try: return float(s)
    except: return 0.0

contratos['Valor_Inadimplente_Inicial'] = contratos['Valor_Inadimplente_Inicial'].apply(parse_money)
contratos['Score_Interno_Risco'] = contratos['Score_Interno_Risco'].fillna(contratos['Score_Interno_Risco'].median())
contratos['Data_Envio_Assessoria'] = pd.to_datetime(contratos['Data_Envio_Assessoria'], errors='coerce')

pagamentos['Data_Vencimento'] = pd.to_datetime(pagamentos['Data_Vencimento'], errors='coerce')
pagamentos['Data_Pagamento'] = pd.to_datetime(pagamentos['Data_Pagamento'], errors='coerce')

print("Dados limpos com sucesso! Salvando versões clean...")
contratos.to_csv('contratos_clean.csv', index=False)
pagamentos.to_csv('pagamentos_clean.csv', index=False)""")
]

# ==========================================
# 02_eda_real.ipynb
# ==========================================
nb2_cells = [
    nbf.v4.new_markdown_cell("# Análise Exploratória (EDA)\nNeste notebook utilizamos Matplotlib para analisar o risco regional e temporal do portfólio."),
    nbf.v4.new_code_cell("""import pandas as pd
import matplotlib.pyplot as plt

# Configuração Matplotlib
plt.style.use('ggplot')

contratos = pd.read_csv('contratos_clean.csv')
pagamentos = pd.read_csv('pagamentos_clean.csv', parse_dates=['Data_Vencimento', 'Data_Pagamento'])
"""),
    nbf.v4.new_markdown_cell("### Inadimplência Regional"),
    nbf.v4.new_code_cell("""inad_regional = contratos.groupby('Regiao_Cliente')['Valor_Inadimplente_Inicial'].sum().sort_values(ascending=True)

plt.figure(figsize=(10, 6))
bars = plt.barh(inad_regional.index, inad_regional.values, color='#4c51bf')
plt.title('Inadimplência por Região', fontsize=14, fontweight='bold')
plt.xlabel('Valor Inadimplente (R$)')
for i, v in enumerate(inad_regional.values):
    plt.text(v, i, f' R$ {v/1e6:.1f}M', va='center')
plt.tight_layout()
plt.show()"""),
    nbf.v4.new_markdown_cell("### Recuperação Temporal de Pagamentos"),
    nbf.v4.new_code_cell("""pagamentos['Mes_Vencimento'] = pagamentos['Data_Vencimento'].dt.to_period('M')
pagamentos['Status'] = pagamentos['Data_Pagamento'].notna().map({True: 'Pago', False: 'Inadimplente'})

evolucao = pagamentos.groupby(['Mes_Vencimento', 'Status'])['Valor_Parcela'].sum().unstack().fillna(0)

evolucao.plot(kind='bar', stacked=True, figsize=(12, 6), color=['#e53e3e', '#38a169'])
plt.title('Evolução de Pagamentos vs Inadimplência (Volume Financeiro)', fontsize=14)
plt.xlabel('Mês')
plt.ylabel('Valor (R$)')
plt.legend(title='Status')
plt.tight_layout()
plt.show()""")
]

# ==========================================
# 03_business_rules_real.ipynb
# ==========================================
nb3_cells = [
    nbf.v4.new_markdown_cell("# Heurísticas e Regras de Negócio\nAqui validamos as regras de negócio para classificação de risco (Baixo, Médio, Alto)."),
    nbf.v4.new_code_cell("""import pandas as pd
import matplotlib.pyplot as plt

contratos = pd.read_csv('contratos_clean.csv')
pagamentos = pd.read_csv('pagamentos_clean.csv', parse_dates=['Data_Vencimento', 'Data_Pagamento'])
"""),
    nbf.v4.new_markdown_cell("### Classificação de Risco\n- Alto: atraso > 60 dias, Ajuizado, Score > 70\n- Médio: atraso > 15 dias, Insucesso\n- Baixo: <= 15 dias, Em Aberto"),
    nbf.v4.new_code_cell("""def classificar_risco(row):
    dias = row['Dias_Em_Atraso_Inicial']
    status = row['Status_Cobranca']
    score = row['Score_Interno_Risco']
    
    if dias > 60 or status == 'Ajuizado' or score > 70:
        return 'Alto'
    elif dias > 15 or status == 'Insucesso':
        return 'Medio'
    else:
        return 'Baixo'

contratos['Nivel_Risco'] = contratos.apply(classificar_risco, axis=1)
dist_risco = contratos['Nivel_Risco'].value_counts()

plt.figure(figsize=(8, 8))
plt.pie(dist_risco, labels=dist_risco.index, autopct='%1.1f%%', colors=['#e53e3e', '#dd6b20', '#38a169'], startangle=140)
plt.title('Distribuição de Risco (Regras de Negócio)', fontweight='bold')
plt.show()

print(dist_risco)""")
]

try:
    create_and_execute('01_data_cleaning_real.ipynb', nb1_cells)
    create_and_execute('02_eda_real.ipynb', nb2_cells)
    create_and_execute('03_business_rules_real.ipynb', nb3_cells)
except Exception as e:
    print(f"Erro ao gerar: {e}")
