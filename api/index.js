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

// --- ROTA DE LOGIN (NOVA) ---
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Busca o usuário no banco
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const usuario = result.rows[0];

        // Verifica a senha (comparação simples para o projeto)
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

// --- ROTAS DE PRODUTOS (CRUD COMPLETO) ---

// 1. LISTAR TODOS (GET)
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// 2. BUSCAR UM (GET)
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

// 3. CRIAR NOVO (POST)
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

// 4. ATUALIZAR (PUT)
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

// 5. DELETAR (DELETE)
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