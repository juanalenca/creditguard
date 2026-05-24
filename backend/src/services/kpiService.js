const pool = require('../config/db');

exports.getKpis = async () => {
  const result = await pool.query(`
    SELECT 
      (SELECT COALESCE(SUM(valor_parcela), 0) FROM pagamentos WHERE data_pagamento IS NULL AND data_vencimento < CURRENT_DATE) as inadimplencia_total,
      (SELECT COALESCE(SUM(valor_parcela), 0) FROM pagamentos WHERE data_pagamento > data_vencimento AND DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', CURRENT_DATE)) as recuperacao_mes,
      (SELECT COALESCE(AVG(CURRENT_DATE - data_vencimento), 0) FROM pagamentos WHERE data_pagamento IS NULL AND data_vencimento < CURRENT_DATE) as atraso_medio,
      (SELECT COUNT(DISTINCT cliente_id) FROM alertas_risco) as clientes_criticos
  `);
  return result.rows[0];
};

exports.getEvolucao = async () => {
  const result = await pool.query(`
    SELECT TO_CHAR(data_vencimento, 'YYYY-MM') as mes, SUM(valor_parcela) as total
    FROM pagamentos
    WHERE data_pagamento IS NULL AND data_vencimento < CURRENT_DATE
    GROUP BY TO_CHAR(data_vencimento, 'YYYY-MM')
    ORDER BY mes ASC
    LIMIT 6
  `);
  return result.rows;
};

exports.getRiscoRegional = async () => {
  const result = await pool.query(`
    SELECT c.cidade, SUM(p.valor_parcela) as total
    FROM clientes c
    JOIN contratos ct ON c.id = ct.cliente_id
    JOIN pagamentos p ON ct.id = p.contrato_id
    WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
    GROUP BY c.cidade
    ORDER BY total DESC
  `);
  return result.rows;
};

exports.getClientes = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const result = await pool.query('SELECT * FROM clientes ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]);
  const countRes = await pool.query('SELECT COUNT(*) FROM clientes');
  return { data: result.rows, total: parseInt(countRes.rows[0].count) };
};

exports.getClientesCriticos = async () => {
  const result = await pool.query(`
    SELECT DISTINCT c.* 
    FROM clientes c
    JOIN contratos ct ON c.id = ct.cliente_id
    JOIN pagamentos p ON ct.id = p.contrato_id
    WHERE p.data_pagamento IS NULL 
    AND CURRENT_DATE - p.data_vencimento > 60
  `);
  return result.rows;
};
