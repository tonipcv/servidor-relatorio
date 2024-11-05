const express = require('express');
const cors = require('cors');
const pool = require('./database');
const app = express();

// Configuração mais flexível do CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rota para obter todos os trades
app.get('/trades', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trade');
        res.json(result.rows);
    } catch (error) {
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

app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
});
