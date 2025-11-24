# Back-End - E-commerce de Amigurumis (TF05)

Back-end do trabalho final da disciplina de WEB. API desenvolvida em Node.js com Express e PostgreSQL (Neon).

## Integrantes
* Vinicius Araújo Matos (github.com/matosIfnmg)
* [Adicione os outros integrantes aqui]

## 🔗 Links
* **URL da API (Deploy):** [LINK DA VERCEL AQUI - COLOCAR DEPOIS]
* **Repositório Front-End:** https://github.com/matosIfnmg/trabalho-final-web

## 🎲 Banco de Dados
Os arquivos do modelo de dados estão na pasta `db`.
* [Modelo Conceitual](db/modelo_conceitual.png)
* [Modelo Lógico](db/modelo_logico.png)
* [DDL (Estrutura)](db/DDL.sql)
* [DML (Dados)](db/DML.sql)

## 📖 Documentação dos Endpoints

### Categorias

**[GET] /categorias**
* **Descrição:** Retorna a lista de todas as categorias cadastradas.

### Produtos

**[GET] /produtos**
* **Descrição:** Retorna todos os produtos disponíveis.

**[GET] /produtos/{id}**
* **Descrição:** Retorna os detalhes de um único produto.

**[POST] /produtos**
* **Descrição:** Cadastra um novo produto.
* **Body (JSON):**
```json
{
  "nome": "Amigurumi Exemplo",
  "descricao": "Descrição do produto",
  "preco": 59.90,
  "estoque": 10,
  "categoria_id": 1,
  "imagem_principal_url": "[http://exemplo.com/foto.jpg](http://exemplo.com/foto.jpg)"
}# back-end-tf-web
