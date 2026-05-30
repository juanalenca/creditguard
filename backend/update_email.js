require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function updateEmail() {
  try {
    const res = await pool.query(
      "UPDATE usuarios SET email = 'admin@linus.com' WHERE email = 'admin@creditguard.com'"
    );
    console.log('Email atualizado com sucesso no banco de dados Supabase.', res.rowCount);
  } catch (err) {
    console.error('Erro ao atualizar email no banco:', err);
  } finally {
    await pool.end();
  }
}

updateEmail();
