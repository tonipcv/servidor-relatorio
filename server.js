require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./database');
const app = express();

// Configuração do CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rota para verificar a saúde do banco de dados
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', message: 'Database connection successful' });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Rota para obter todos os trades
app.get('/trades', async (req, res) => {
    console.log('GET /trades - Iniciando requisição');
    try {
        const result = await pool.query('SELECT * FROM trade');
        console.log('GET /trades - Dados recuperados:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('GET /trades - Erro:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para obter um trade por ID
app.get('/trades/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM trade WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Trade not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para criar um novo trade
app.post('/trades', async (req, res) => {
    const { data, ativo, direcao, percentual, alvo } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO trade (data, ativo, direcao, percentual, alvo, createdat, updatedat) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
            [data, ativo, direcao, percentual, alvo]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para atualizar um trade
app.put('/trades/:id', async (req, res) => {
    const { id } = req.params;
    const { data, ativo, direcao, percentual, alvo } = req.body;
    try {
        const result = await pool.query(
            'UPDATE trade SET data = $1, ativo = $2, direcao = $3, percentual = $4, alvo = $5, updatedat = NOW() WHERE id = $6 RETURNING *',
            [data, ativo, direcao, percentual, alvo, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Trade not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para deletar um trade
app.delete('/trades/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM trade WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Trade not found' });
        res.json({ message: 'Trade deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log('----------------------------------------');
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL:', process.env.DATABASE_URL.split('@')[1]); // Log seguro da URL
    console.log('----------------------------------------');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Fechar a conexão com o banco de dados
        pool.end(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Fechar a conexão com o banco de dados
        pool.end(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    });
});

// Adicionar handler para erros não tratados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
