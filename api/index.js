const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o Banco de Dados
// IMPORTANTE: Na Vercel, o padrão costuma ser DATABASE_URL. 
// Se usar POSTGRES_URL, garanta que a variável tem esse nome lá.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Rota Raiz
app.get('/', (req, res) => {
    res.send('API do VF Amigurumis está rodando! 🚀');
});

// --- ROTAS DE PRODUTOS (Em Inglês para bater com o Front-End) ---

// [GET] /products - Retorna todos os produtos
app.get('/products', async (req, res) => {
    try {
        // A tabela criada tem colunas: id, name, price, image, description
        const result = await pool.query('SELECT * FROM produtos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// [GET] /products/:id - Retorna um produto específico
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

// Exportar o app para a Vercel
module.exports = app;