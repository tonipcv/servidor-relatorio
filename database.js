require('dotenv').config();
const { Pool } = require('pg');

// Usando a connectionString diretamente
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Certifique-se de definir essa variável no .env
    ssl: {
        rejectUnauthorized: false // Necessário para conexões SSL, dependendo do provedor de hospedagem
    }
});

module.exports = pool;
