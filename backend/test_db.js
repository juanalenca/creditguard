const pool = require('./src/config/db');

async function testDb() {
    try {
        const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != \'pg_catalog\' AND schemaname != \'information_schema\';');
        console.log("Tables found:", res.rows.map(r => r.tablename));
        const res2 = await pool.query('SELECT count(*) FROM clientes;');
        console.log("Number of clients:", res2.rows[0].count);
    } catch (err) {
        console.error("DB Connection Error:", err.message);
    } finally {
        pool.end();
    }
}

testDb();
