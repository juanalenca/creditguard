import os
import subprocess

import nbformat as nbf


base_dir = os.path.dirname(os.path.abspath(__file__))
notebooks_dir = os.path.join(base_dir, "notebooks")
os.makedirs(notebooks_dir, exist_ok=True)


def create_and_execute(filename, cells):
    nb = nbf.v4.new_notebook()
    nb["cells"] = cells
    filepath = os.path.join(notebooks_dir, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        nbf.write(nb, f)

    print(f"Executando {filename}...")
    subprocess.run(
        ["jupyter", "nbconvert", "--to", "notebook", "--execute", "--inplace", filepath],
        check=True,
        cwd=notebooks_dir,
    )
    print(f"Sucesso: {filename} executado!")


nb1_cells = [
    nbf.v4.new_markdown_cell(
        "# Limpeza de Dados (Data Cleaning)\n"
        "Este notebook trata os datasets `cobranca_assessorias.csv` e "
        "`fluxo_pagamentos.xlsx`, padroniza campos e corrige inconsistencias "
        "antes de gerar os arquivos limpos usados pelo ETL e pelo banco."
    ),
    nbf.v4.new_code_cell(
        """import os
import pandas as pd

BASE_DIR = os.path.abspath('..')
cobranca_path = os.path.join(BASE_DIR, 'cobranca_assessorias.csv')
pagamentos_path = os.path.join(BASE_DIR, 'fluxo_pagamentos.xlsx')

contratos = pd.read_csv(cobranca_path, encoding='latin1')
pagamentos = pd.read_excel(pagamentos_path)

print(f'Contratos originais: {contratos.shape}')
print(f'Pagamentos originais: {pagamentos.shape}')"""
    ),
    nbf.v4.new_markdown_cell("## Padronizacao de dimensoes"),
    nbf.v4.new_code_cell(
        """contratos['Nome_Assessoria'] = contratos['Nome_Assessoria'].str.strip()
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

print('Assessorias padronizadas:')
print(contratos['Nome_Assessoria'].value_counts().sort_index())
print('\\nRegioes padronizadas:')
print(contratos['Regiao_Cliente'].value_counts().sort_index())"""
    ),
    nbf.v4.new_markdown_cell("## Tipos, nulos e outliers"),
    nbf.v4.new_code_cell(
        """def parse_money(val):
    if pd.isna(val):
        return 0.0
    s = str(val).strip().replace('R$', '').strip()
    if ',' in s:
        s = s.replace('.', '').replace(',', '.')
    try:
        return float(s)
    except ValueError:
        return 0.0


score_nulos = int(contratos['Score_Interno_Risco'].isna().sum())
contratos['Valor_Inadimplente_Inicial'] = contratos['Valor_Inadimplente_Inicial'].apply(parse_money)
contratos['Score_Interno_Risco'] = contratos['Score_Interno_Risco'].fillna(contratos['Score_Interno_Risco'].median())
contratos['Data_Envio_Assessoria'] = pd.to_datetime(contratos['Data_Envio_Assessoria'], errors='coerce')

dias_validos = contratos['Dias_Em_Atraso_Inicial'].between(0, 365)
dias_invalidos = int((~dias_validos).sum())
mediana_dias_validos = int(contratos.loc[dias_validos, 'Dias_Em_Atraso_Inicial'].median())
contratos.loc[~dias_validos, 'Dias_Em_Atraso_Inicial'] = mediana_dias_validos

pagamentos['Data_Vencimento'] = pd.to_datetime(pagamentos['Data_Vencimento'], errors='coerce')
pagamentos['Data_Pagamento'] = pd.to_datetime(pagamentos['Data_Pagamento'], errors='coerce')
pagamentos['Forma_Pagamento'] = pagamentos['Forma_Pagamento'].str.strip()
pagamentos['Indicador_Contemplado'] = pagamentos['Indicador_Contemplado'].str.strip()

duplicatas_pagamentos = int(pagamentos.duplicated(subset=['ID_Pagamento']).sum())
pagamentos = pagamentos.drop_duplicates(subset=['ID_Pagamento'])

print(f'Scores nulos imputados pela mediana: {score_nulos}')
print(f'Atrasos invalidos tratados: {dias_invalidos}')
print(f'Mediana usada para atraso invalido: {mediana_dias_validos} dias')
print(f'Duplicatas de pagamento removidas: {duplicatas_pagamentos}')
print('\\nAtraso inicial apos limpeza:')
print(contratos['Dias_Em_Atraso_Inicial'].describe())"""
    ),
    nbf.v4.new_markdown_cell("## Exportacao dos dados limpos"),
    nbf.v4.new_code_cell(
        """contratos.to_csv('contratos_clean.csv', index=False)
pagamentos.to_csv('pagamentos_clean.csv', index=False)

print('contratos_clean.csv e pagamentos_clean.csv atualizados.')
print(f'Contratos limpos: {contratos.shape}')
print(f'Pagamentos limpos: {pagamentos.shape}')"""
    ),
]


nb2_cells = [
    nbf.v4.new_markdown_cell(
        "# Analise Exploratoria (EDA)\n"
        "Este notebook consolida os principais KPIs, regioes, assessorias e "
        "comportamentos financeiros encontrados nas bases limpas."
    ),
    nbf.v4.new_code_cell(
        """import pandas as pd
import matplotlib.pyplot as plt

plt.style.use('ggplot')

contratos = pd.read_csv('contratos_clean.csv')
pagamentos = pd.read_csv('pagamentos_clean.csv', parse_dates=['Data_Vencimento', 'Data_Pagamento'])"""
    ),
    nbf.v4.new_markdown_cell("## KPIs oficiais da analise"),
    nbf.v4.new_code_cell(
        """ref_date = pagamentos['Data_Vencimento'].max()
parcelas_vencidas = pagamentos[pagamentos['Data_Vencimento'] <= ref_date]
parcelas_abertas = parcelas_vencidas[parcelas_vencidas['Data_Pagamento'].isna()]
pagamentos_atrasados = pagamentos[
    pagamentos['Data_Pagamento'].notna()
    & (pagamentos['Data_Pagamento'] > pagamentos['Data_Vencimento'])
]

valor_inadimplente_contratos = contratos['Valor_Inadimplente_Inicial'].sum()
inadimplencia_monitorada_parcelas = parcelas_abertas['Valor_Parcela'].sum()
taxa_inadimplencia_parcelas = len(parcelas_abertas) / len(parcelas_vencidas) * 100
taxa_recuperacao_pagamentos = len(pagamentos_atrasados) / len(parcelas_vencidas) * 100
valor_recuperado_atrasado = pagamentos_atrasados['Valor_Pago'].sum()
atraso_inicial_medio = contratos['Dias_Em_Atraso_Inicial'].mean()
aging_operacional = (ref_date - parcelas_abertas['Data_Vencimento']).dt.days.mean()
taxa_acordo_contratos = contratos['Status_Cobranca'].eq('Acordo Firmado').mean() * 100

kpis = pd.DataFrame([
    ['Valor inadimplente dos contratos', valor_inadimplente_contratos],
    ['Inadimplencia monitorada em parcelas abertas', inadimplencia_monitorada_parcelas],
    ['Taxa de inadimplencia em parcelas', taxa_inadimplencia_parcelas],
    ['Taxa de recuperacao por pagamentos atrasados', taxa_recuperacao_pagamentos],
    ['Valor pago em parcelas recuperadas com atraso', valor_recuperado_atrasado],
    ['Atraso medio inicial dos contratos', atraso_inicial_medio],
    ['Aging operacional das parcelas abertas', aging_operacional],
    ['Taxa de acordo firmado em contratos', taxa_acordo_contratos],
], columns=['KPI', 'Valor'])

print(f'Data de referencia da base: {ref_date.date()}')
print(kpis.to_string(index=False))"""
    ),
    nbf.v4.new_markdown_cell("## Inadimplencia regional"),
    nbf.v4.new_code_cell(
        """inad_regional_contratos = contratos.groupby('Regiao_Cliente')['Valor_Inadimplente_Inicial'].sum().sort_values(ascending=False)

plt.figure(figsize=(10, 6))
inad_regional_contratos.sort_values().plot(kind='barh', color='#4c51bf')
plt.title('Valor inadimplente dos contratos por regiao')
plt.xlabel('Valor inadimplente (R$)')
plt.tight_layout()
plt.show()

print(inad_regional_contratos.round(2))"""
    ),
    nbf.v4.new_markdown_cell("## Tendencia temporal de pagamentos"),
    nbf.v4.new_code_cell(
        """pagamentos['Mes_Vencimento'] = pagamentos['Data_Vencimento'].dt.to_period('M')
pagamentos['Status_Parcela'] = pagamentos['Data_Pagamento'].notna().map({True: 'Paga', False: 'Aberta'})
evolucao = pagamentos.groupby(['Mes_Vencimento', 'Status_Parcela'])['Valor_Parcela'].sum().unstack().fillna(0)

evolucao.plot(kind='bar', stacked=True, figsize=(12, 6), color=['#e53e3e', '#38a169'])
plt.title('Evolucao temporal de parcelas pagas e abertas')
plt.xlabel('Mes de vencimento')
plt.ylabel('Valor (R$)')
plt.tight_layout()
plt.show()

print(evolucao.tail(6).round(2))"""
    ),
    nbf.v4.new_markdown_cell("## Desempenho das assessorias"),
    nbf.v4.new_code_cell(
        """assessorias = contratos.groupby('Nome_Assessoria').agg(
    contratos=('ID_Contrato', 'count'),
    acordos=('Status_Cobranca', lambda s: (s == 'Acordo Firmado').sum()),
    insucessos=('Status_Cobranca', lambda s: (s == 'Insucesso').sum()),
    ajuizados=('Status_Cobranca', lambda s: (s == 'Ajuizado').sum()),
    valor_total=('Valor_Inadimplente_Inicial', 'sum'),
)
assessorias['taxa_acordo_pct'] = assessorias['acordos'] / assessorias['contratos'] * 100
assessorias['taxa_insucesso_pct'] = assessorias['insucessos'] / assessorias['contratos'] * 100
assessorias = assessorias.sort_values('taxa_acordo_pct', ascending=False)

print(assessorias.round(2))"""
    ),
]


nb3_cells = [
    nbf.v4.new_markdown_cell(
        "# Heuristicas e Regras de Negocio\n"
        "Validacao do motor decisorio baseado em regras. O projeto atual usa "
        "heuristicas, nao um modelo preditivo treinado."
    ),
    nbf.v4.new_code_cell(
        """import pandas as pd
import matplotlib.pyplot as plt

contratos = pd.read_csv('contratos_clean.csv')
pagamentos = pd.read_csv('pagamentos_clean.csv', parse_dates=['Data_Vencimento', 'Data_Pagamento'])"""
    ),
    nbf.v4.new_markdown_cell(
        "## Regra de risco\n"
        "- Alto: atraso inicial > 60 dias, status Ajuizado ou score > 70.\n"
        "- Medio: atraso inicial entre 16 e 60 dias ou status Insucesso.\n"
        "- Baixo: atraso inicial ate 15 dias sem agravantes."
    ),
    nbf.v4.new_code_cell(
        """def classificar_risco(row):
    dias = row['Dias_Em_Atraso_Inicial']
    status = row['Status_Cobranca']
    score = row['Score_Interno_Risco']

    if dias > 60 or status == 'Ajuizado' or score > 70:
        return 'Alto'
    if dias > 15 or status == 'Insucesso':
        return 'Medio'
    return 'Baixo'


contratos['Nivel_Risco'] = contratos.apply(classificar_risco, axis=1)
dist_risco = contratos['Nivel_Risco'].value_counts()

plt.figure(figsize=(8, 8))
plt.pie(
    dist_risco,
    labels=dist_risco.index,
    autopct='%1.1f%%',
    colors=['#e53e3e', '#dd6b20', '#38a169'],
    startangle=140,
)
plt.title('Distribuicao de risco apos limpeza')
plt.show()

print(dist_risco)
print((dist_risco / len(contratos) * 100).round(2))"""
    ),
    nbf.v4.new_markdown_cell("## Contratos prioritarios"),
    nbf.v4.new_code_cell(
        """prioritarios = contratos[
    (contratos['Nivel_Risco'] == 'Alto')
    & (contratos['Status_Cobranca'].isin(['Em Aberto', 'Insucesso', 'Ajuizado']))
].sort_values(['Valor_Inadimplente_Inicial', 'Dias_Em_Atraso_Inicial'], ascending=False)

print(f'Contratos de risco alto: {int((contratos[\"Nivel_Risco\"] == \"Alto\").sum())}')
print(f'Contratos prioritarios para cobranca: {len(prioritarios)}')
print(prioritarios[
    ['ID_Contrato', 'Nome_Assessoria', 'Regiao_Cliente', 'Status_Cobranca',
     'Dias_Em_Atraso_Inicial', 'Score_Interno_Risco', 'Valor_Inadimplente_Inicial']
].head(15).to_string(index=False))"""
    ),
]


try:
    create_and_execute("01_data_cleaning_real.ipynb", nb1_cells)
    create_and_execute("02_eda_real.ipynb", nb2_cells)
    create_and_execute("03_business_rules_real.ipynb", nb3_cells)
except Exception as e:
    print(f"Erro ao gerar notebooks: {e}")
