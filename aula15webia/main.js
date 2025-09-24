// =======================
// CONFIGURAÇÃO DA API
// =======================
const API_BASE = "http://localhost:3000";

// =======================
// FUNÇÕES DE NAVEGAÇÃO
// =======================
function navigate(page, event) {
    let content = "";
    if (page === "dashboard") {
        renderDashboard();
    } else if (page === "produtos") {
        renderProdutos();
    } else if (page === "vendas") {
        renderVendas();
    } else if (page === "carrinho") {
        renderCarrinho();
    }

    if (event) {
        document.querySelectorAll("#sidebar .nav-link").forEach((link) =>
            link.classList.remove("active")
        );
        event.target.classList.add("active");
    }
}

// =======================
// DASHBOARD
// =======================
async function renderDashboard() {
    const produtos = await getProdutos();
    const vendas = await getVendas();

    document.getElementById("content").innerHTML = `
    <h2>Resumo</h2>
    <div class="row">
      <div class="col-md-4">
        <div class="card text-white bg-primary mb-3">
          <div class="card-body">
            <h5 class="card-title">Produtos</h5>
            <p class="card-text">Total: ${produtos.length}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-white bg-success mb-3">
          <div class="card-body">
            <h5 class="card-title">Vendas</h5>
            <p class="card-text">R$ ${vendas.reduce((t, v) => t + v.valor, 0)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =======================
// PRODUTOS (CRUD)
// =======================
async function renderProdutos() {
    const produtos = await getProdutos();

    document.getElementById("content").innerHTML = `
    <h2>Gerenciar Produtos</h2>
    <button class="btn btn-primary mb-3" onclick="abrirModal()">Adicionar Produto</button>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Preço</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${produtos
            .map(
                (p) => `
          <tr>
            <td>${p.id}</td>
            <td>${p.nome}</td>
            <td>R$ ${p.preco}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editarProduto(${p.id})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="removerProduto(${p.id})">Excluir</button>
              <button class="btn btn-success btn-sm" onclick="addToCart(${p.id})">Adicionar ao Carrinho</button>
            </td>
          </tr>
        `
            )
            .join("")}
      </tbody>
    </table>
  `;
}

async function addToCart(id) {
    // Busca o produto pelo id
    const produto = await fetch(`${API_BASE}/produtos/${id}`).then((res) => res.json());

    // Adiciona ao carrinho via API
    await fetch(`${API_BASE}/carrinho`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto),
    });

    alert(`${produto.nome} adicionado ao carrinho!`);
}



// Modal de Produto
const produtoModal = new bootstrap.Modal(document.getElementById("produtoModal"));

function abrirModal() {
    document.getElementById("produtoForm").reset();
    document.getElementById("produtoId").value = "";
    document.querySelector("#produtoModal .modal-title").innerText = "Adicionar Produto";
    produtoModal.show();
}

document.getElementById("produtoForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById("produtoId").value;
    const nome = document.getElementById("produtoNome").value;
    const preco = parseFloat(document.getElementById("produtoPreco").value);

    if (id) {
        await fetch(`${API_BASE}/produtos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, nome, preco }),
        });
    } else {
        await fetch(`${API_BASE}/produtos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, preco }),
        });
    }

    produtoModal.hide();
    renderProdutos();
});

async function editarProduto(id) {
    const produto = await fetch(`${API_BASE}/produtos/${id}`).then((res) => res.json());
    document.getElementById("produtoId").value = produto.id;
    document.getElementById("produtoNome").value = produto.nome;
    document.getElementById("produtoPreco").value = produto.preco;
    document.querySelector("#produtoModal .modal-title").innerText = "Editar Produto";
    produtoModal.show();
}

async function removerProduto(id) {
    if (confirm("Deseja excluir este produto?")) {
        await fetch(`${API_BASE}/produtos/${id}`, { method: "DELETE" });
        renderProdutos();
    }
}

// =======================
// VENDAS
// =======================
async function renderVendas() {
    const vendas = await getVendas();

    document.getElementById("content").innerHTML = `
    <h2>Histórico de Vendas</h2>
    <ul class="list-group">
      ${vendas
            .map((v) => `<li class="list-group-item">Venda #${v.id} - R$ ${v.valor}</li>`)
            .join("")}
    </ul>
  `;
}

// =======================
// CARRINHO
// =======================
async function renderCarrinho() {
    const carrinho = await fetch(`${API_BASE}/carrinho`).then((res) => res.json());
    const saldo = await fetch(`${API_BASE}/saldo`).then((res) => res.json());

    document.getElementById("content").innerHTML = `
    <h2>Seu Carrinho</h2>
    <div id="cart-items">
      ${carrinho.length === 0
            ? "<p>Seu carrinho está vazio.</p>"
            : carrinho.map((item) => `<p>${item.nome} - R$${item.preco}</p>`).join("")
        }
    </div>
    <h2 id="cart-total">Total: R$${carrinho.reduce((acc, item) => acc + item.preco, 0)}</h2>
    <p>Saldo: R$${saldo.saldo}</p>
    <button class="btn btn-success" onclick="finalizePurchase()">Finalizar Compra</button>
    <div class="mt-3">
      <input type="number" id="saldo-input" placeholder="Valor a adicionar" min="0">
      <button class="btn btn-primary" onclick="addBalance()">Adicionar Saldo</button>
    </div>
  `;
}

async function finalizePurchase() {
    const res = await fetch(`${API_BASE}/comprar`, { method: "POST" });
    const data = await res.json();

    if (data.sucesso) {
        alert("Compra realizada com sucesso!");
    } else {
        alert(data.msg);
    }
    renderCarrinho();
}

async function addBalance() {
    const valor = parseFloat(document.getElementById("saldo-input").value);
    if (!valor || valor <= 0) return;

    // chamada à API
    await fetch(`${API_BASE}/saldo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor })
    });

    alert("Saldo adicionado!");
    renderCarrinho(); // atualiza a página da SPA sem recarregar
}


// =======================
// FUNÇÕES AUXILIARES DE API
// =======================
async function getProdutos() {
    return fetch(`${API_BASE}/produtos`).then((res) => res.json());
}

async function getVendas() {
    return fetch(`${API_BASE}/vendas`).then((res) => res.json());
}

// =======================
// INICIALIZAÇÃO
// =======================
navigate("dashboard");
