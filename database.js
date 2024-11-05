require('dotenv').config();
const { Pool } = require('pg');

// Configuração do pool de conexões
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // SSL será usado apenas em produção
    ...(process.env.NODE_ENV === 'production' 
        ? {
            ssl: {
                rejectUnauthorized: false
            }
          } 
        : {})
});

module.exports = pool;
