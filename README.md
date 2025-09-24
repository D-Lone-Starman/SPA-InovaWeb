# SPA-InovaWeb
# InovaWeb Dashboard SPA

## Descrição
O **InovaWeb Dashboard** é uma **Single Page Application (SPA)** desenvolvida com **HTML, CSS, JavaScript e Bootstrap**, que permite gerenciar produtos, vendas e carrinho de compras de forma dinâmica e responsiva.  

O projeto integra com uma **API REST** (simulada com **JSON Server** ou Node + Express) para persistência de dados, permitindo que o dashboard **atualize informações em tempo real** sem recarregar a página.

---

## Funcionalidades

### SPA (Single Page Application)
- Todas as seções (Dashboard, Produtos, Vendas, Carrinho) estão em um único `index.html`.
- A navegação é feita via **JavaScript**, atualizando o conteúdo do `<div id="content">` dinamicamente.
- Não há recarregamento de página ao alternar entre abas.

### Dashboard
- Mostra um resumo dos produtos cadastrados e vendas realizadas.
- Atualiza automaticamente conforme novos produtos ou vendas são adicionados.

### Produtos
- CRUD completo de produtos:
  - Adicionar novo produto (modal com formulário).
  - Editar produto existente.
  - Excluir produto.
- Botão **Adicionar ao Carrinho** para cada produto, enviando-o diretamente para o carrinho via API.

### Carrinho
- Exibe produtos adicionados ao carrinho.
- Mostra **total da compra** e **saldo disponível** do usuário.
- Permite **adicionar saldo**.
- Permite **finalizar compra**, debitando do saldo e limpando o carrinho.
- Todas as operações são feitas sem recarregar a página.

### Vendas
- Lista todas as vendas registradas na API.
- Mostra valor total acumulado no dashboard.

### Integração com API
- API REST simulada com **JSON Server** ou Node + Express.
- Endpoints disponíveis:
  - `GET /produtos` → listar produtos
  - `POST /produtos` → adicionar produto
  - `PUT /produtos/:id` → editar produto
  - `DELETE /produtos/:id` → excluir produto
  - `GET /carrinho` → listar itens do carrinho
  - `POST /carrinho` → adicionar item ao carrinho
  - `POST /comprar` → finalizar compra
  - `GET /saldo` → consultar saldo
  - `POST /saldo` → adicionar saldo
  - `GET /vendas` → listar vendas

---

## Estrutura de Arquivos

/public
index.html → SPA principal
style.css → Estilos customizados
main.js → Lógica da SPA (renderização, CRUD, carrinho)
db.json → Banco de dados JSON para JSON Server


---

## Como Rodar o Projeto

### 1. Instalar JSON Server
```bash
npm install -g json-server

2. Criar o arquivo db.json

Exemplo inicial:

{
  "produtos": [
    { "id": 1, "nome": "Notebook Gamer", "preco": 4500 },
    { "id": 2, "nome": "Mouse Sem Fio", "preco": 120 },
    { "id": 3, "nome": "Teclado Mecânico RGB", "preco": 350 },
    { "id": 4, "nome": "Monitor Full HD 24\"", "preco": 900 },
    { "id": 5, "nome": "Headset com Microfone", "preco": 280 }
  ],
  "vendas": [
    { "id": 101, "valor": 1200 },
    { "id": 102, "valor": 4500 },
    { "id": 103, "valor": 350 },
    { "id": 104, "valor": 1800 }
  ],
  "carrinho": [],
  "saldo": { "saldo": 1000 }
}

3. Rodar o JSON Server

json-server --watch db.json --port 3000

4. Abrir o Dashboard

    Abra index.html no navegador.

    Navegue entre Dashboard, Produtos, Vendas e Carrinho.

    Teste adicionar produtos, adicionar ao carrinho, adicionar saldo e finalizar compras.

Observações

    Todos os dados são persistidos na API (JSON Server), garantindo que o dashboard continue consistente mesmo após recarregar a página.

    A SPA permite uma interface fluida e amigável, eliminando recarregamentos desnecessários.

    Você pode substituir o JSON Server por um back-end Node + Express real, mantendo a mesma estrutura de endpoints.

Tecnologias Utilizadas

    HTML5

    CSS3

    JavaScript (ES6)

    Bootstrap 5

    JSON Server (para API REST simulada)
