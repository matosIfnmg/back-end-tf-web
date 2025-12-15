const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o Banco de Dados
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

// --- ROTA DE LOGIN ---
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

        const usuario = result.rows[0];
        if (usuario.senha === senha) {
            res.json({ message: 'Login realizado com sucesso' });
        } else {
            res.status(401).json({ error: 'Senha incorreta' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao realizar login' });
    }
});

// --- ROTAS DE CATEGORIAS (NOVA) ---
app.get('/categories', async (req, res) => {
    try {
        // Busca todas as categorias distintas que existem nos produtos
        const result = await pool.query('SELECT DISTINCT category FROM produtos WHERE category IS NOT NULL');
        // Transforma em uma lista simples de strings
        const categories = result.rows.map(row => row.category).filter(c => c && c.trim() !== '');
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// --- ROTAS DE PRODUTOS ---

// Filtro por Categoria
app.get('/products/category/:categoryName', async (req, res) => {
    const { categoryName } = req.params;
    try {
        const result = await pool.query('SELECT * FROM produtos WHERE category ILIKE $1', [categoryName]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao filtrar categoria' });
    }
});

// Listar Todos
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Buscar Um
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

// Criar Novo
app.post('/products', async (req, res) => {
    const { id, name, price, image, description, stock, category } = req.body;
    try {
        const generatedId = id || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const query = `
            INSERT INTO produtos (id, name, price, image, description, stock, category) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const values = [generatedId, name, price, image, description, stock || 0, category || 'Geral'];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

// Atualizar
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, image, description, stock, category } = req.body;
    try {
        const query = `
            UPDATE produtos 
            SET name = $1, price = $2, image = $3, description = $4, stock = $5, category = $6
            WHERE id = $7 RETURNING *
        `;
        const values = [name, price, image, description, stock, category, id];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// Deletar
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

module.exports = app;