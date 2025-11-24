const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o Banco de Dados (Neon PostgreSQL)
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Rota Raiz
app.get('/', (req, res) => {
    res.send('API do E-commerce de Amigurumis está rodando! 🚀');
});

// --- ROTAS DE CATEGORIAS ---

// [GET] /categorias - Retorna todas as categorias
app.get('/categorias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// --- ROTAS DE PRODUTOS ---

// [GET] /produtos - Retorna todos os produtos
app.get('/produtos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// [GET] /produtos/:id - Retorna um produto específico
app.get('/produtos/:id', async (req, res) => {
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

// [POST] /produtos - Cadastra um novo produto
app.post('/produtos', async (req, res) => {
    const { nome, descricao, preco, estoque, categoria_id, imagem_principal_url } = req.body;
    try {
        const query = `
            INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id, imagem_principal_url) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [nome, descricao, preco, estoque, categoria_id, imagem_principal_url];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao cadastrar produto' });
    }
});

// [PUT] /produtos/:id - Atualiza um produto
app.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, estoque, status } = req.body;
    try {
        const query = `
            UPDATE produtos 
            SET nome = $1, descricao = $2, preco = $3, estoque = $4, status = $5, atualizado_em = NOW()
            WHERE id = $6 RETURNING *
        `;
        const values = [nome, descricao, preco, estoque, status, id];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// [DELETE] /produtos/:id - Remove um produto
app.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

// Exportar o app para a Vercel (Serverless)
module.exports = app;
