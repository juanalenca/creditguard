const pool = require('../config/db');

// =============================================
// KPIs BÁSICOS
// =============================================
exports.getKpis = async () => {
  const refRes = await pool.query("SELECT MAX(data_vencimento) as ref_date FROM pagamentos");
  const refDate = refRes.rows[0].ref_date;
  
  const result = await pool.query(`
    SELECT 
      (SELECT COALESCE(SUM(valor_parcela), 0) FROM pagamentos WHERE data_pagamento IS NULL AND data_vencimento <= $1) as inadimplencia_total,
      (SELECT COALESCE(SUM(valor_pago), 0) FROM pagamentos WHERE data_pagamento IS NOT NULL AND data_pagamento > data_vencimento AND DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', $1::date)) as recuperacao_mes,
      (SELECT COALESCE(AVG($1::date - data_vencimento), 0) FROM pagamentos WHERE data_pagamento IS NULL AND data_vencimento <= $1) as atraso_medio,
      (SELECT COUNT(DISTINCT id_contrato) FROM alertas_risco WHERE nivel_risco = 'Alto') as clientes_criticos
  `, [refDate]);
  return result.rows[0];
};

// =============================================
// EVOLUÇÃO TEMPORAL
// =============================================
exports.getEvolucao = async (regiao) => {
  const refRes = await pool.query("SELECT MAX(data_vencimento) as ref_date FROM pagamentos");
  const refDate = refRes.rows[0].ref_date;
  let query = `
    SELECT * FROM (
      SELECT TO_CHAR(p.data_vencimento, 'YYYY-MM') as mes, SUM(p.valor_parcela) as total
      FROM pagamentos p
  `;
  const params = [refDate];
  
  if (regiao) {
    query += ` JOIN contratos c ON p.id_contrato = c.id_contrato`;
  }
  
  query += ` WHERE p.data_pagamento IS NULL AND p.data_vencimento <= $1::date`;
  
  if (regiao) {
    params.push(regiao);
    query += ` AND c.regiao = $${params.length}`;
  }
  
  query += `
      GROUP BY TO_CHAR(p.data_vencimento, 'YYYY-MM')
      ORDER BY mes DESC
      LIMIT 6
    ) sub
    ORDER BY mes ASC
  `;
  
  const result = await pool.query(query, params);
  return result.rows;
};

// =============================================
// RISCO REGIONAL
// =============================================
exports.getRiscoRegional = async (regiao) => {
  const refRes = await pool.query("SELECT MAX(data_vencimento) as ref_date FROM pagamentos");
  const refDate = refRes.rows[0].ref_date;
  let query = `
    SELECT c.regiao, SUM(p.valor_parcela) as total
    FROM contratos c
    JOIN pagamentos p ON c.id_contrato = p.id_contrato
    WHERE p.data_pagamento IS NULL AND p.data_vencimento <= $1::date
  `;
  const params = [refDate];
  
  if (regiao) {
    params.push(regiao);
    query += ` AND c.regiao = $${params.length}`;
  }
  
  query += ` GROUP BY c.regiao ORDER BY total DESC`;
  
  const result = await pool.query(query, params);
  return result.rows;
};

// =============================================
// CONTRATOS (antigo "Clientes")
// =============================================
exports.getClientes = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];
  
  if (filters.regiao) {
    params.push(filters.regiao);
    where.push(`regiao = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    where.push(`status_cobranca = $${params.length}`);
  }
  if (filters.busca) {
    params.push(`%${filters.busca}%`);
    where.push(`(id_contrato ILIKE $${params.length} OR nome_assessoria ILIKE $${params.length})`);
  }
  
  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
  
  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;
  
  const result = await pool.query(
    `SELECT * FROM contratos ${whereClause} ORDER BY id LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );
  
  const countParams = params.slice(0, params.length - 2);
  const countRes = await pool.query(`SELECT COUNT(*) FROM contratos ${whereClause}`, countParams);
  
  return { data: result.rows, total: parseInt(countRes.rows[0].count) };
};

// =============================================
// CONTRATOS CRÍTICOS
// =============================================
exports.getClientesCriticos = async () => {
  const refRes = await pool.query("SELECT MAX(data_vencimento) as ref_date FROM pagamentos");
  const refDate = refRes.rows[0].ref_date;
  const result = await pool.query(`
    SELECT DISTINCT c.*
    FROM contratos c
    JOIN pagamentos p ON c.id_contrato = p.id_contrato
    WHERE p.data_pagamento IS NULL 
    AND $1::date - p.data_vencimento > 60
    ORDER BY c.valor_inadimplente DESC
    LIMIT 50
  `, [refDate]);
  return result.rows;
};

// =============================================
// DETALHE DO CONTRATO
// =============================================
exports.getClienteById = async (id) => {
  const contrato = await pool.query('SELECT * FROM contratos WHERE id = $1', [id]);
  if (contrato.rows.length === 0) return null;
  
  const parcelas = await pool.query(
    'SELECT * FROM pagamentos WHERE id_contrato = $1 ORDER BY numero_parcela ASC',
    [contrato.rows[0].id_contrato]
  );
  
  const alertas = await pool.query(
    'SELECT * FROM alertas_risco WHERE id_contrato = $1 ORDER BY criado_em DESC',
    [contrato.rows[0].id_contrato]
  );
  
  return {
    ...contrato.rows[0],
    parcelas: parcelas.rows,
    alertas: alertas.rows
  };
};

// =============================================
// ALERTAS
// =============================================
exports.getAlertas = async (page = 1, limit = 10, nivelRisco = null) => {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  
  if (nivelRisco) {
    params.push(nivelRisco);
    where = `WHERE a.nivel_risco = $${params.length}`;
  }
  
  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;
  
  const result = await pool.query(`
    SELECT a.*, c.regiao, c.nome_assessoria, c.valor_inadimplente
    FROM alertas_risco a
    JOIN contratos c ON a.id_contrato = c.id_contrato
    ${where}
    ORDER BY a.criado_em DESC
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `, params);
  
  const countParams = nivelRisco ? [nivelRisco] : [];
  const countWhere = nivelRisco ? 'WHERE nivel_risco = $1' : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM alertas_risco ${countWhere}`, countParams);
  
  return { data: result.rows, total: parseInt(countRes.rows[0].count) };
};

// =============================================
// PAGAMENTOS
// =============================================
exports.getPagamentos = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(`
    SELECT p.*, c.regiao, c.nome_assessoria
    FROM pagamentos p
    JOIN contratos c ON p.id_contrato = c.id_contrato
    ORDER BY p.data_vencimento DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
  const countRes = await pool.query('SELECT COUNT(*) FROM pagamentos');
  return { data: result.rows, total: parseInt(countRes.rows[0].count) };
};

// =============================================
// AUTENTICAÇÃO
// =============================================
exports.getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

// =============================================
// KPIs AVANÇADOS
// =============================================
exports.getKpisAvancados = async () => {
  const refRes = await pool.query("SELECT MAX(data_vencimento) as ref_date FROM pagamentos");
  const refDate = refRes.rows[0].ref_date;

  // Taxa de recuperação: % de parcelas vencidas que foram pagas (mesmo que atrasadas)
  const recup = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE data_pagamento IS NOT NULL AND data_pagamento > data_vencimento) as recuperadas,
      COUNT(*) FILTER (WHERE data_vencimento <= $1::date) as vencidas
    FROM pagamentos
  `, [refDate]);
  const taxa_recuperacao = recup.rows[0].vencidas > 0 
    ? (recup.rows[0].recuperadas / recup.rows[0].vencidas * 100) 
    : 0;

  // Contratos reincidentes (com mais de 3 parcelas atrasadas)
  const reincid = await pool.query(`
    SELECT COUNT(DISTINCT id_contrato) as total
    FROM (
      SELECT id_contrato, COUNT(*) as parcelas_atrasadas
      FROM pagamentos
      WHERE data_pagamento IS NULL AND data_vencimento <= $1::date
      GROUP BY id_contrato
      HAVING COUNT(*) > 3
    ) sub
  `, [refDate]);

  // Contratos em risco (com pelo menos uma parcela vencida não paga)
  const em_risco = await pool.query(`
    SELECT COUNT(DISTINCT id_contrato) as total
    FROM pagamentos
    WHERE data_pagamento IS NULL AND data_vencimento <= $1::date
  `, [refDate]);

  // Inadimplência por região
  const por_regiao = await pool.query(`
    SELECT c.regiao, SUM(p.valor_parcela) as total
    FROM contratos c
    JOIN pagamentos p ON c.id_contrato = p.id_contrato
    WHERE p.data_pagamento IS NULL AND p.data_vencimento <= $1::date
    GROUP BY c.regiao
    ORDER BY total DESC
  `, [refDate]);


  // Variação mensal
  const variacao = await pool.query(`
    SELECT 
      COALESCE(SUM(CASE WHEN TO_CHAR(data_vencimento, 'YYYY-MM') = TO_CHAR($1::date, 'YYYY-MM') 
        THEN valor_parcela ELSE 0 END), 0) as mes_atual,
      COALESCE(SUM(CASE WHEN TO_CHAR(data_vencimento, 'YYYY-MM') = TO_CHAR($1::date - INTERVAL '1 month', 'YYYY-MM') 
        THEN valor_parcela ELSE 0 END), 0) as mes_anterior
    FROM pagamentos
    WHERE data_pagamento IS NULL AND data_vencimento <= $1::date
  `, [refDate]);
  
  const atual = parseFloat(variacao.rows[0].mes_atual);
  const anterior = parseFloat(variacao.rows[0].mes_anterior);
  const variacao_mensal = anterior > 0 ? ((atual - anterior) / anterior * 100) : 0;

  return {
    taxa_recuperacao,
    clientes_reincidentes: parseInt(reincid.rows[0].total),
    contratos_em_risco: parseInt(em_risco.rows[0].total),
    inadimplencia_por_regiao: por_regiao.rows,
    variacao_mensal
  };
};

// =============================================
// INSIGHTS AUTOMÁTICOS
// =============================================
exports.getInsights = async () => {
  const refRes = await pool.query("SELECT MAX(data_vencimento) as ref_date FROM pagamentos");
  const refDate = refRes.rows[0].ref_date;
  const insights = [];

  // 1. Cidade/Região com maior concentração
  const conc = await pool.query(`
    SELECT c.regiao, SUM(p.valor_parcela) as total
    FROM contratos c
    JOIN pagamentos p ON c.id_contrato = p.id_contrato
    WHERE p.data_pagamento IS NULL AND p.data_vencimento <= $1::date
    GROUP BY c.regiao
    ORDER BY total DESC
    LIMIT 1
  `, [refDate]);
  const totalInad = await pool.query(`
    SELECT SUM(valor_parcela) as total FROM pagamentos WHERE data_pagamento IS NULL AND data_vencimento <= $1::date
  `, [refDate]);
  if (conc.rows.length > 0 && totalInad.rows[0].total > 0) {
    const pct = (parseFloat(conc.rows[0].total) / parseFloat(totalInad.rows[0].total) * 100).toFixed(1);
    insights.push({
      tipo: 'concentracao',
      texto: `A região ${conc.rows[0].regiao} concentra ${pct}% da inadimplência total do portfólio.`,
    });
  }

  // 2. Assessoria com melhor recuperação
  const assess = await pool.query(`
    SELECT c.nome_assessoria,
      COUNT(*) FILTER (WHERE c.status_cobranca = 'Acordo Firmado') as acordos,
      COUNT(*) as total
    FROM contratos c
    GROUP BY c.nome_assessoria
    ORDER BY (COUNT(*) FILTER (WHERE c.status_cobranca = 'Acordo Firmado'))::float / NULLIF(COUNT(*), 0) DESC
    LIMIT 1
  `);
  if (assess.rows.length > 0) {
    const taxaAcordo = (assess.rows[0].acordos / assess.rows[0].total * 100).toFixed(1);
    insights.push({
      tipo: 'reincidencia',
      texto: `${assess.rows[0].nome_assessoria} possui a maior taxa de acordo: ${taxaAcordo}% dos contratos sob sua gestão.`,
    });
  }

  // 3. Status da carteira
  const status = await pool.query(`
    SELECT status_cobranca, COUNT(*) as total FROM contratos GROUP BY status_cobranca ORDER BY total DESC
  `);
  if (status.rows.length > 0) {
    const emAberto = status.rows.find(r => r.status_cobranca === 'Em Aberto');
    if (emAberto) {
      const pctAberto = (parseInt(emAberto.total) / 10000 * 100).toFixed(1);
      insights.push({
        tipo: 'crescimento',
        texto: `${pctAberto}% dos contratos permanecem "Em Aberto", representando ${parseInt(emAberto.total).toLocaleString()} contratos sem resolução.`,
      });
    }
  }

  // 4. Clientes com atraso > 90 dias
  const criticos = await pool.query(`
    SELECT COUNT(DISTINCT id_contrato) as total
    FROM pagamentos 
    WHERE data_pagamento IS NULL AND $1::date - data_vencimento > 90
  `, [refDate]);
  insights.push({
    tipo: 'critico',
    texto: `${criticos.rows[0].total} contratos possuem parcelas com atraso superior a 90 dias.`,
  });

  // 5. Média de inadimplência por região
  const media = await pool.query(`
    SELECT c.regiao, ROUND(AVG(c.valor_inadimplente)::numeric, 2) as media
    FROM contratos c
    WHERE c.valor_inadimplente > 0
    GROUP BY c.regiao
    ORDER BY media DESC
    LIMIT 1
  `);
  if (media.rows.length > 0) {
    insights.push({
      tipo: 'media',
      texto: `A região ${media.rows[0].regiao} possui o maior ticket médio de inadimplência: R$ ${Number(media.rows[0].media).toLocaleString('pt-BR', {minimumFractionDigits: 2})}.`,
    });
  }

  return insights;
};

// =============================================
// TENDÊNCIAS
// =============================================
exports.getTendencias = async () => {
  const refRes = await pool.query("SELECT MAX(data_vencimento) as ref_date FROM pagamentos");
  const refDate = refRes.rows[0].ref_date;

  const result = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN TO_CHAR(data_vencimento, 'YYYY-MM') = TO_CHAR($1::date, 'YYYY-MM') AND data_pagamento IS NULL AND data_vencimento <= $1::date THEN valor_parcela END), 0) as inadimpl_atual,
      COALESCE(SUM(CASE WHEN TO_CHAR(data_vencimento, 'YYYY-MM') = TO_CHAR($1::date - INTERVAL '1 month', 'YYYY-MM') AND data_pagamento IS NULL AND data_vencimento <= $1::date THEN valor_parcela END), 0) as inadimpl_anterior,
      COALESCE(SUM(CASE WHEN TO_CHAR(data_pagamento, 'YYYY-MM') = TO_CHAR($1::date, 'YYYY-MM') AND data_pagamento > data_vencimento THEN valor_pago END), 0) as recup_atual,
      COALESCE(SUM(CASE WHEN TO_CHAR(data_pagamento, 'YYYY-MM') = TO_CHAR($1::date - INTERVAL '1 month', 'YYYY-MM') AND data_pagamento > data_vencimento THEN valor_pago END), 0) as recup_anterior
    FROM pagamentos
  `, [refDate]);

  const atraso = await pool.query(`
    SELECT
      COALESCE(AVG(CASE WHEN TO_CHAR(data_vencimento, 'YYYY-MM') = TO_CHAR($1::date, 'YYYY-MM') AND data_pagamento IS NULL AND data_vencimento <= $1::date THEN $1::date - data_vencimento END), 0) as atraso_atual,
      COALESCE(AVG(CASE WHEN TO_CHAR(data_vencimento, 'YYYY-MM') = TO_CHAR($1::date - INTERVAL '1 month', 'YYYY-MM') AND data_pagamento IS NULL AND data_vencimento <= $1::date THEN $1::date - data_vencimento END), 0) as atraso_anterior
    FROM pagamentos
  `, [refDate]);

  const alertasQ = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE DATE_TRUNC('month', criado_em) >= DATE_TRUNC('month', $1::date)) as alertas_atual,
      COUNT(*) FILTER (WHERE DATE_TRUNC('month', criado_em) = DATE_TRUNC('month', $1::date - INTERVAL '1 month')) as alertas_anterior
    FROM alertas_risco
  `, [refDate]);

  const r = result.rows[0];
  const a = atraso.rows[0];
  const al = alertasQ.rows[0];

  const calcVariacao = (atual, anterior) => {
    const v = anterior > 0 ? ((atual - anterior) / anterior * 100) : 0;
    return { atual, anterior, variacao_pct: v, direcao: atual >= anterior ? 'up' : 'down' };
  };

  return {
    inadimplencia: calcVariacao(parseFloat(r.inadimpl_atual), parseFloat(r.inadimpl_anterior)),
    recuperacao: calcVariacao(parseFloat(r.recup_atual), parseFloat(r.recup_anterior)),
    atraso_medio: calcVariacao(parseFloat(a.atraso_atual), parseFloat(a.atraso_anterior)),
    novos_alertas: calcVariacao(parseInt(al.alertas_atual), parseInt(al.alertas_anterior)),
  };
};
