const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuración del pool de conexiones para PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false // Necesario para Supabase
  }
});

// Verificar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;