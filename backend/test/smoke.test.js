const assert = require('node:assert/strict');
const pool = require('../src/config/db');
const kpiService = require('../src/services/kpiService');

const EXPECTED = {
  contratos: 10000,
  pagamentos: 100000,
  alertas: 9987,
  clientesCriticos: '8958',
  inadimplenciaTotal: '20621400.00',
};

async function main() {
  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM contratos) AS contratos,
      (SELECT COUNT(*)::int FROM pagamentos) AS pagamentos,
      (SELECT COUNT(*)::int FROM alertas_risco) AS alertas,
      (SELECT COUNT(*)::int FROM contratos WHERE dias_atraso_inicial < 0 OR dias_atraso_inicial > 365) AS outliers
  `);

  assert.deepEqual(counts.rows[0], {
    contratos: EXPECTED.contratos,
    pagamentos: EXPECTED.pagamentos,
    alertas: EXPECTED.alertas,
    outliers: 0,
  });

  const riskCounts = await pool.query(`
    SELECT nivel_risco, COUNT(*)::int AS total
    FROM alertas_risco
    GROUP BY nivel_risco
  `);
  const risks = Object.fromEntries(riskCounts.rows.map((row) => [row.nivel_risco, row.total]));

  assert.equal(risks.Alto, 8958);
  assert.equal(risks.Medio, 1014);
  assert.equal(risks.Baixo, 15);

  const kpis = await kpiService.getKpis();
  assert.equal(kpis.inadimplencia_total, EXPECTED.inadimplenciaTotal);
  assert.equal(kpis.clientes_criticos, EXPECTED.clientesCriticos);
  assert.equal(Number(Number(kpis.atraso_medio).toFixed(2)), 223.86);

  console.log('Smoke test OK: database seed and KPI service are consistent.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
