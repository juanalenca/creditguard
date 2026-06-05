require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const hash = await bcrypt.hash('mock123', 10);
    console.log("NOVO HASH:", hash);
    const result = await pool.query(
      "UPDATE usuarios SET senha_hash = $1 WHERE email = 'admin@linus.com'",
      [hash]
    );
    console.log("Banco atualizado com sucesso. Linhas afetadas:", result.rowCount);
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await pool.end();
  }
}
run();
