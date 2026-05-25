const pool = require('../config/db');

// ─── KPIs básicos ───────────────────────────────────────────────────────────────

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

// ─── Evolução da inadimplência (com filtro opcional por região) ─────────────────

exports.getEvolucao = async (regiao) => {
  const params = [];
  let whereExtra = '';

  if (regiao) {
    params.push(regiao);
    whereExtra = `AND c.regiao = $${params.length}`;
  }

  const result = await pool.query(`
    SELECT * FROM (
      SELECT TO_CHAR(p.data_vencimento, 'YYYY-MM') as mes, SUM(p.valor_parcela) as total
      FROM pagamentos p
      JOIN contratos ct ON p.contrato_id = ct.id
      JOIN clientes c ON ct.cliente_id = c.id
      WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
      ${whereExtra}
      GROUP BY TO_CHAR(p.data_vencimento, 'YYYY-MM')
      ORDER BY mes DESC
      LIMIT 6
    ) sub
    ORDER BY mes ASC
  `, params);
  return result.rows;
};

// ─── Risco regional (com filtro opcional por região) ────────────────────────────

exports.getRiscoRegional = async (regiao) => {
  const params = [];
  let whereExtra = '';

  if (regiao) {
    params.push(regiao);
    whereExtra = `AND c.regiao = $${params.length}`;
  }

  const result = await pool.query(`
    SELECT c.cidade, SUM(p.valor_parcela) as total
    FROM clientes c
    JOIN contratos ct ON c.id = ct.cliente_id
    JOIN pagamentos p ON ct.id = p.contrato_id
    WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
    ${whereExtra}
    GROUP BY c.cidade
    ORDER BY total DESC
  `, params);
  return result.rows;
};

// ─── Clientes com filtros (regiao, estado, busca) ───────────────────────────────

exports.getClientes = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (filters.regiao) {
    params.push(filters.regiao);
    conditions.push(`regiao = $${params.length}`);
  }

  if (filters.estado) {
    params.push(filters.estado);
    conditions.push(`estado = $${params.length}`);
  }

  if (filters.busca) {
    params.push(`%${filters.busca}%`);
    conditions.push(`(nome ILIKE $${params.length} OR cpf_cnpj ILIKE $${params.length})`);
  }

  const whereClause = conditions.length > 0
    ? 'WHERE ' + conditions.join(' AND ')
    : '';

  // Parâmetros de paginação sempre por último
  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const result = await pool.query(
    `SELECT * FROM clientes ${whereClause} ORDER BY id LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  // Contagem usa os mesmos filtros, sem paginação
  const countParams = params.slice(0, params.length - 2);
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM clientes ${whereClause}`,
    countParams
  );

  return { data: result.rows, total: parseInt(countRes.rows[0].count) };
};

// ─── Clientes críticos ──────────────────────────────────────────────────────────

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

// ─── Alertas com filtro por nível de risco ──────────────────────────────────────

exports.getAlertas = async (page = 1, limit = 10, nivelRisco) => {
  const offset = (page - 1) * limit;
  const params = [];
  let whereExtra = '';

  if (nivelRisco) {
    params.push(nivelRisco);
    whereExtra = `WHERE a.nivel_risco = $${params.length}`;
  }

  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const result = await pool.query(`
    SELECT a.*, c.nome as cliente_nome
    FROM alertas_risco a
    JOIN clientes c ON a.cliente_id = c.id
    ${whereExtra}
    ORDER BY a.criado_em DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `, params);

  const countParams = nivelRisco ? [nivelRisco] : [];
  const countWhere = nivelRisco ? 'WHERE nivel_risco = $1' : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM alertas_risco ${countWhere}`,
    countParams
  );

  return { data: result.rows, total: parseInt(countRes.rows[0].count) };
};

// ─── Pagamentos ─────────────────────────────────────────────────────────────────

exports.getPagamentos = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(`
    SELECT p.*, c.nome as cliente_nome, ct.valor_total
    FROM pagamentos p
    JOIN contratos ct ON p.contrato_id = ct.id
    JOIN clientes c ON ct.cliente_id = c.id
    ORDER BY p.data_vencimento DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
  const countRes = await pool.query('SELECT COUNT(*) FROM pagamentos');
  return { data: result.rows, total: parseInt(countRes.rows[0].count) };
};

// ─── Autenticação ───────────────────────────────────────────────────────────────

exports.getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

// ─── Detalhe do cliente ─────────────────────────────────────────────────────────

exports.getClienteById = async (id) => {
  const cliente = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
  if (cliente.rows.length === 0) return null;
  
  const contratos = await pool.query('SELECT * FROM contratos WHERE cliente_id = $1 ORDER BY data_contrato DESC', [id]);
  
  for (let contrato of contratos.rows) {
    const parcelas = await pool.query('SELECT * FROM pagamentos WHERE contrato_id = $1 ORDER BY data_vencimento ASC', [contrato.id]);
    contrato.parcelas = parcelas.rows;
  }
  
  return { ...cliente.rows[0], contratos: contratos.rows };
};

// ─── KPIs Avançados ─────────────────────────────────────────────────────────────

exports.getKpisAvancados = async () => {
  // Taxa de recuperação: % de parcelas vencidas que foram pagas neste mês
  const taxaRecuperacao = await pool.query(`
    SELECT
      CASE
        WHEN total_vencidas = 0 THEN 0
        ELSE ROUND((recuperadas::numeric / total_vencidas) * 100, 2)
      END as taxa_recuperacao
    FROM (
      SELECT
        (SELECT COUNT(*) FROM pagamentos WHERE data_vencimento < CURRENT_DATE AND data_pagamento IS NOT NULL) as recuperadas,
        (SELECT COUNT(*) FROM pagamentos WHERE data_vencimento < CURRENT_DATE) as total_vencidas
    ) sub
  `);

  // Clientes reincidentes: clientes com mais de 1 contrato com parcelas vencidas não pagas
  const reincidentes = await pool.query(`
    SELECT COUNT(*) as clientes_reincidentes
    FROM (
      SELECT ct.cliente_id
      FROM contratos ct
      JOIN pagamentos p ON ct.id = p.contrato_id
      WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
      GROUP BY ct.cliente_id
      HAVING COUNT(DISTINCT ct.id) > 1
    ) sub
  `);

  // Contratos em risco: contratos ativos com pelo menos uma parcela vencida não paga
  const contratosEmRisco = await pool.query(`
    SELECT COUNT(DISTINCT ct.id) as contratos_em_risco
    FROM contratos ct
    JOIN pagamentos p ON ct.id = p.contrato_id
    WHERE ct.status = 'ativo'
    AND p.data_pagamento IS NULL
    AND p.data_vencimento < CURRENT_DATE
  `);

  // Inadimplência por região: soma dos valores vencidos não pagos por região
  const inadimplenciaPorRegiao = await pool.query(`
    SELECT c.regiao, COALESCE(SUM(p.valor_parcela), 0) as total
    FROM clientes c
    JOIN contratos ct ON c.id = ct.cliente_id
    JOIN pagamentos p ON ct.id = p.contrato_id
    WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
    GROUP BY c.regiao
    ORDER BY total DESC
  `);

  // Variação mensal: diferença percentual do total de inadimplência entre o mês atual e o anterior
  const variacaoMensal = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', p.data_vencimento) = DATE_TRUNC('month', CURRENT_DATE) THEN p.valor_parcela END), 0) as mes_atual,
      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', p.data_vencimento) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN p.valor_parcela END), 0) as mes_anterior
    FROM pagamentos p
    WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
  `);

  const mesAtual = parseFloat(variacaoMensal.rows[0].mes_atual);
  const mesAnterior = parseFloat(variacaoMensal.rows[0].mes_anterior);
  const variacao = mesAnterior === 0
    ? (mesAtual > 0 ? 100 : 0)
    : parseFloat((((mesAtual - mesAnterior) / mesAnterior) * 100).toFixed(2));

  return {
    taxa_recuperacao: parseFloat(taxaRecuperacao.rows[0].taxa_recuperacao),
    clientes_reincidentes: parseInt(reincidentes.rows[0].clientes_reincidentes),
    contratos_em_risco: parseInt(contratosEmRisco.rows[0].contratos_em_risco),
    inadimplencia_por_regiao: inadimplenciaPorRegiao.rows,
    variacao_mensal: variacao
  };
};

// ─── Insights inteligentes ──────────────────────────────────────────────────────

exports.getInsights = async () => {
  const insights = [];

  // 1. Cidade com maior % de inadimplência total
  const cidadeResult = await pool.query(`
    WITH inadimplencia_cidade AS (
      SELECT c.cidade, SUM(p.valor_parcela) as total_cidade
      FROM clientes c
      JOIN contratos ct ON c.id = ct.cliente_id
      JOIN pagamentos p ON ct.id = p.contrato_id
      WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
      GROUP BY c.cidade
    ),
    total AS (
      SELECT COALESCE(SUM(total_cidade), 1) as total_geral FROM inadimplencia_cidade
    )
    SELECT ic.cidade, ROUND((ic.total_cidade / t.total_geral) * 100, 1) as percentual
    FROM inadimplencia_cidade ic, total t
    ORDER BY ic.total_cidade DESC
    LIMIT 1
  `);

  if (cidadeResult.rows.length > 0) {
    const { cidade, percentual } = cidadeResult.rows[0];
    insights.push({
      tipo: 'concentracao',
      texto: `${cidade} concentra ${percentual}% da inadimplência total.`,
      icone: 'MapPin'
    });
  }

  // 2. Risco de clientes com >2 contratos vs <=2
  const riscoContratos = await pool.query(`
    WITH clientes_info AS (
      SELECT
        ct.cliente_id,
        COUNT(DISTINCT ct.id) as total_contratos,
        COUNT(DISTINCT CASE WHEN p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE THEN p.id END) as parcelas_inadimplentes,
        COUNT(DISTINCT p.id) as total_parcelas
      FROM contratos ct
      JOIN pagamentos p ON ct.id = p.contrato_id
      GROUP BY ct.cliente_id
    )
    SELECT
      CASE WHEN SUM(CASE WHEN total_contratos > 2 THEN total_parcelas END) = 0 THEN 0
           ELSE ROUND(
             (SUM(CASE WHEN total_contratos > 2 THEN parcelas_inadimplentes END)::numeric /
              NULLIF(SUM(CASE WHEN total_contratos > 2 THEN total_parcelas END), 0)) * 100, 1
           )
      END as taxa_mais_2,
      CASE WHEN SUM(CASE WHEN total_contratos <= 2 THEN total_parcelas END) = 0 THEN 0
           ELSE ROUND(
             (SUM(CASE WHEN total_contratos <= 2 THEN parcelas_inadimplentes END)::numeric /
              NULLIF(SUM(CASE WHEN total_contratos <= 2 THEN total_parcelas END), 0)) * 100, 1
           )
      END as taxa_ate_2
    FROM clientes_info
  `);

  if (riscoContratos.rows.length > 0) {
    const { taxa_mais_2, taxa_ate_2 } = riscoContratos.rows[0];
    const taxaMais = parseFloat(taxa_mais_2) || 0;
    const taxaAte = parseFloat(taxa_ate_2) || 0;
    const diff = taxaAte === 0 ? 0 : parseFloat((((taxaMais - taxaAte) / taxaAte) * 100).toFixed(1));
    insights.push({
      tipo: 'reincidencia',
      texto: `Clientes com mais de 2 contratos apresentam risco ${Math.abs(diff)}% ${diff >= 0 ? 'maior' : 'menor'}.`,
      icone: 'AlertTriangle'
    });
  }

  // 3. Região com maior crescimento mês a mês na inadimplência
  const crescimentoRegiao = await pool.query(`
    WITH mensal AS (
      SELECT
        c.regiao,
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', p.data_vencimento) = DATE_TRUNC('month', CURRENT_DATE) THEN p.valor_parcela END), 0) as atual,
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', p.data_vencimento) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN p.valor_parcela END), 0) as anterior
      FROM clientes c
      JOIN contratos ct ON c.id = ct.cliente_id
      JOIN pagamentos p ON ct.id = p.contrato_id
      WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
      GROUP BY c.regiao
    )
    SELECT regiao,
      CASE WHEN anterior = 0 THEN 0
           ELSE ROUND(((atual - anterior) / anterior) * 100, 1)
      END as variacao
    FROM mensal
    ORDER BY variacao DESC
    LIMIT 1
  `);

  if (crescimentoRegiao.rows.length > 0) {
    const { regiao, variacao } = crescimentoRegiao.rows[0];
    insights.push({
      tipo: 'crescimento',
      texto: `A região ${regiao} apresentou crescimento de ${variacao}% na inadimplência.`,
      icone: 'TrendingUp'
    });
  }

  // 4. Clientes com atraso > 90 dias
  const atraso90 = await pool.query(`
    SELECT COUNT(DISTINCT ct.cliente_id) as total
    FROM contratos ct
    JOIN pagamentos p ON ct.id = p.contrato_id
    WHERE p.data_pagamento IS NULL
    AND CURRENT_DATE - p.data_vencimento > 90
  `);

  insights.push({
    tipo: 'atraso_grave',
    texto: `${atraso90.rows[0].total} clientes possuem atraso superior a 90 dias.`,
    icone: 'Clock'
  });

  // 5. Média de inadimplência por cliente por região (mostra a maior)
  const mediaRegiao = await pool.query(`
    WITH inad_por_cliente AS (
      SELECT c.regiao, ct.cliente_id, SUM(p.valor_parcela) as total_inad
      FROM clientes c
      JOIN contratos ct ON c.id = ct.cliente_id
      JOIN pagamentos p ON ct.id = p.contrato_id
      WHERE p.data_pagamento IS NULL AND p.data_vencimento < CURRENT_DATE
      GROUP BY c.regiao, ct.cliente_id
    )
    SELECT regiao, ROUND(AVG(total_inad), 2) as media
    FROM inad_por_cliente
    GROUP BY regiao
    ORDER BY media DESC
    LIMIT 1
  `);

  if (mediaRegiao.rows.length > 0) {
    const { regiao, media } = mediaRegiao.rows[0];
    const mediaFormatada = parseFloat(media).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    insights.push({
      tipo: 'media_regional',
      texto: `A média de inadimplência por cliente na região ${regiao} é de R$ ${mediaFormatada}.`,
      icone: 'DollarSign'
    });
  }

  return insights;
};

// ─── Tendências (mês atual vs anterior) ─────────────────────────────────────────

exports.getTendencias = async () => {
  // Inadimplência: soma das parcelas vencidas não pagas
  const inadimplencia = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', CURRENT_DATE) THEN valor_parcela END), 0) as atual,
      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN valor_parcela END), 0) as anterior
    FROM pagamentos
    WHERE data_pagamento IS NULL AND data_vencimento < CURRENT_DATE
  `);

  // Recuperação: soma das parcelas pagas após o vencimento
  const recuperacao = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', CURRENT_DATE) THEN valor_parcela END), 0) as atual,
      COALESCE(SUM(CASE WHEN DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN valor_parcela END), 0) as anterior
    FROM pagamentos
    WHERE data_pagamento IS NOT NULL AND data_pagamento > data_vencimento
  `);

  // Atraso médio (em dias) das parcelas vencidas não pagas
  const atrasoMedio = await pool.query(`
    SELECT
      COALESCE(AVG(CASE WHEN DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', CURRENT_DATE) THEN CURRENT_DATE - data_vencimento END), 0) as atual,
      COALESCE(AVG(CASE WHEN DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN CURRENT_DATE - data_vencimento END), 0) as anterior
    FROM pagamentos
    WHERE data_pagamento IS NULL AND data_vencimento < CURRENT_DATE
  `);

  // Novos alertas de risco
  const novosAlertas = await pool.query(`
    SELECT
      COUNT(CASE WHEN DATE_TRUNC('month', criado_em) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as atual,
      COUNT(CASE WHEN DATE_TRUNC('month', criado_em) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN 1 END) as anterior
    FROM alertas_risco
  `);

  /**
   * Calcula variação percentual e direção entre dois valores.
   */
  const calcVariacao = (atual, anterior) => {
    const a = parseFloat(atual);
    const b = parseFloat(anterior);
    const variacao = b === 0
      ? (a > 0 ? 100 : 0)
      : parseFloat((((a - b) / b) * 100).toFixed(2));
    return {
      atual: a,
      anterior: b,
      variacao_pct: Math.abs(variacao),
      direcao: a >= b ? 'up' : 'down'
    };
  };

  return {
    inadimplencia: calcVariacao(inadimplencia.rows[0].atual, inadimplencia.rows[0].anterior),
    recuperacao: calcVariacao(recuperacao.rows[0].atual, recuperacao.rows[0].anterior),
    atraso_medio: calcVariacao(atrasoMedio.rows[0].atual, atrasoMedio.rows[0].anterior),
    novos_alertas: calcVariacao(novosAlertas.rows[0].atual, novosAlertas.rows[0].anterior)
  };
};
