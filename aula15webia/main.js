
// =======================
// CONFIGURAÇÃO DA API
// =======================
const API_BASE = "http://localhost:3000";

// =======================
// FUNÇÕES DE NAVEGAÇÃO
// =======================
async function navigate(page, event) {
    showLoading(true);

    try {
        if (page === "dashboard") {
            await renderDashboard();
        } else if (page === "produtos") {
            await renderProdutos();
        } else if (page === "vendas") {
            await renderVendas();
        } else if (page === "carrinho") {
            await renderCarrinho();
        }

        if (event) {
            document.querySelectorAll("#sidebar .nav-link").forEach((link) =>
                link.classList.remove("active")
            );
            event.target.classList.add("active");
        }

        // Atualizar título da página
        document.getElementById("page-title").textContent =
            page === "dashboard" ? "Dashboard" :
                page === "produtos" ? "Gerenciar Produtos" :
                    page === "vendas" ? "Histórico de Vendas" : "Carrinho de Compras";

        updateCartCount();
    } catch (error) {
        console.error("Erro ao carregar página:", error);
        showError("Erro ao carregar dados. Verifique se o servidor está rodando.");
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    document.getElementById("loading").classList.toggle("d-none", !show);
}

function showError(message) {
    document.getElementById("content").innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>${message}
        </div>
    `;
}

async function refreshData() {
    const activePage = document.querySelector("#sidebar .nav-link.active").textContent.trim().toLowerCase();
    if (activePage.includes("dashboard")) {
        await navigate("dashboard");
    } else if (activePage.includes("produtos")) {
        await navigate("produtos");
    } else if (activePage.includes("vendas")) {
        await navigate("vendas");
    } else if (activePage.includes("carrinho")) {
        await navigate("carrinho");
    }
}

// =======================
// DASHBOARD
// =======================
async function renderDashboard() {
    const [produtos, vendas, saldo] = await Promise.all([
        getProdutos(),
        getVendas(),
        getSaldo()
    ]);

    const totalVendas = vendas.reduce((t, v) => t + v.valor, 0);
    const totalCarrinho = await getCartTotal();

    document.getElementById("content").innerHTML = `
        <div class="row">
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-primary shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                    Total de Produtos
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">${produtos.length}</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-box fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-success shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                    Total de Vendas
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">R$ ${totalVendas.toFixed(2)}</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-info shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                    Saldo Disponível
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">R$ ${saldo.saldo.toFixed(2)}</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-wallet fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-warning shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                    Carrinho Atual
                                </div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">R$ ${totalCarrinho.toFixed(2)}</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-shopping-cart fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Últimos Produtos</h6>
                    </div>
                    <div class="card-body">
                        ${produtos.slice(0, 5).map(p => `
                            <div class="d-flex align-items-center mb-3">
                                <div class="flex-grow-1">
                                    <div class="text-truncate">${p.nome}</div>
                                    <small class="text-muted">R$ ${p.preco.toFixed(2)}</small>
                                </div>
                                <button class="btn btn-sm btn-outline-primary" onclick="addToCart(${p.id})">
                                    <i class="fas fa-cart-plus"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-success">Últimas Vendas</h6>
                    </div>
                    <div class="card-body">
                        ${vendas.slice(0, 5).map(v => `
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span>Venda #${v.id}</span>
                                <span class="font-weight-bold">R$ ${v.valor.toFixed(2)}</span>
                            </div>
                        `).join('')}
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
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Gerenciar Produtos</h2>
            <button class="btn btn-primary" onclick="abrirModal()">
                <i class="fas fa-plus me-1"></i>Adicionar Produto
            </button>
        </div>
        
        <div class="card shadow">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Preço</th>
                                <th width="200">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${produtos.length === 0 ? `
                                <tr>
                                    <td colspan="4" class="text-center py-4 text-muted">
                                        <i class="fas fa-box-open fa-2x mb-2 d-block"></i>
                                        Nenhum produto cadastrado
                                    </td>
                                </tr>
                            ` : produtos.map(p => `
                                <tr>
                                    <td>${p.id}</td>
                                    <td>${p.nome}</td>
                                    <td>R$ ${p.preco.toFixed(2)}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-warning" onclick="editarProduto('${p.id}')" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-outline-danger" onclick="removerProduto('${p.id}')" title="Excluir">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                            <button class="btn btn-outline-success" onclick="addToCart('${p.id}')" title="Adicionar ao Carrinho">
                                                <i class="fas fa-cart-plus"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function addToCart(id) {
    try {
        showLoading(true);
        const produto = await fetch(`${API_BASE}/produtos/${id}`).then(res => {
            if (!res.ok) throw new Error('Produto não encontrado');
            return res.json();
        });

        await fetch(`${API_BASE}/carrinho`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(produto),
        });

        showToast(`${produto.nome} adicionado ao carrinho!`, 'success');
        updateCartCount();
    } catch (error) {
        console.error("Erro ao adicionar ao carrinho:", error);
        showToast("Erro ao adicionar produto ao carrinho", 'error');
    } finally {
        showLoading(false);
    }
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
    const nome = document.getElementById("produtoNome").value.trim();
    const preco = parseFloat(document.getElementById("produtoPreco").value);

    if (!nome || isNaN(preco) || preco < 0) {
        showToast("Preencha todos os campos corretamente", 'error');
        return;
    }

    try {
        showLoading(true);
        if (id) {
            await fetch(`${API_BASE}/produtos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, nome, preco }),
            });
            showToast("Produto atualizado com sucesso!", 'success');
        } else {
            await fetch(`${API_BASE}/produtos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, preco }),
            });
            showToast("Produto adicionado com sucesso!", 'success');
        }

        produtoModal.hide();
        await renderProdutos();
    } catch (error) {
        console.error("Erro ao salvar produto:", error);
        showToast("Erro ao salvar produto", 'error');
    } finally {
        showLoading(false);
    }
});

async function editarProduto(id) {
    try {
        showLoading(true);
        const produto = await fetch(`${API_BASE}/produtos/${id}`).then(res => {
            if (!res.ok) throw new Error('Produto não encontrado');
            return res.json();
        });

        document.getElementById("produtoId").value = produto.id;
        document.getElementById("produtoNome").value = produto.nome;
        document.getElementById("produtoPreco").value = produto.preco;
        document.querySelector("#produtoModal .modal-title").innerText = "Editar Produto";
        produtoModal.show();
    } catch (error) {
        console.error("Erro ao carregar produto:", error);
        showToast("Erro ao carregar produto", 'error');
    } finally {
        showLoading(false);
    }
}

async function removerProduto(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/produtos/${id}`, { method: "DELETE" });

        if (!response.ok) throw new Error('Erro ao excluir produto');

        showToast("Produto excluído com sucesso!", 'success');
        await renderProdutos();
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        showToast("Erro ao excluir produto", 'error');
    } finally {
        showLoading(false);
    }
}

// =======================
// VENDAS
// =======================
async function renderVendas() {
    const vendas = await getVendas();

    document.getElementById("content").innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Histórico de Vendas</h2>
            <span class="badge bg-primary fs-6">Total: R$ ${vendas.reduce((t, v) => t + v.valor, 0).toFixed(2)}</span>
        </div>
        
        <div class="card shadow">
            <div class="card-body">
                ${vendas.length === 0 ? `
                    <div class="text-center py-5 text-muted">
                        <i class="fas fa-receipt fa-3x mb-3"></i>
                        <p>Nenhuma venda registrada</p>
                    </div>
                ` : `
                    <div class="list-group list-group-flush">
                        ${vendas.map(v => `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-1">Venda #${v.id}</h6>
                                    <small class="text-muted">${new Date().toLocaleDateString()}</small>
                                </div>
                                <span class="badge bg-success rounded-pill fs-6">R$ ${v.valor.toFixed(2)}</span>
                            </div>
                        `).join("")}
                    </div>
                `}
            </div>
        </div>
    `;
}

// =======================
// CARRINHO
// =======================
async function renderCarrinho() {
    const [carrinho, saldo] = await Promise.all([
        getCarrinho(),
        getSaldo()
    ]);

    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    const podeComprar = saldo.saldo >= total;

    document.getElementById("content").innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Seu Carrinho</h2>
            <div>
                <span class="badge bg-primary fs-6">Total: R$ ${total.toFixed(2)}</span>
                <span class="badge bg-${podeComprar ? 'success' : 'danger'} fs-6 ms-2">Saldo: R$ ${saldo.saldo.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="row">
            <div class="col-lg-8">
                <div class="card shadow mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Itens no Carrinho</h5>
                    </div>
                    <div class="card-body">
                        ${carrinho.length === 0 ? `
                            <div class="text-center py-5 text-muted">
                                <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                                <p>Seu carrinho está vazio</p>
                                <button class="btn btn-primary" onclick="navigate('produtos')">
                                    <i class="fas fa-store me-1"></i>Ir para Produtos
                                </button>
                            </div>
                        ` : `
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Preço</th>
                                            <th width="100">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${carrinho.map((item, index) => `
                                            <tr>
                                                <td>${item.nome}</td>
                                                <td>R$ ${item.preco.toFixed(2)}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-danger" onclick="removerDoCarrinho(${index})" title="Remover">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card shadow">
                    <div class="card-header">
                        <h5 class="mb-0">Finalizar Compra</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Adicionar Saldo</label>
                            <div class="input-group">
                                <span class="input-group-text">R$</span>
                                <input type="number" id="saldo-input" class="form-control" placeholder="Valor" min="0" step="0.01">
                                <button class="btn btn-primary" onclick="addBalance()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        ${carrinho.length > 0 ? `
                            <div class="d-grid gap-2">
                                <button class="btn btn-${podeComprar ? 'success' : 'secondary'}" 
                                        ${!podeComprar ? 'disabled' : ''} 
                                        onclick="finalizePurchase()">
                                    <i class="fas fa-credit-card me-1"></i>
                                    ${podeComprar ? 'Finalizar Compra' : 'Saldo Insuficiente'}
                                </button>
                                <button class="btn btn-outline-danger" onclick="limparCarrinho()">
                                    <i class="fas fa-trash me-1"></i>Limpar Carrinho
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function removerDoCarrinho(index) {
    try {
        showLoading(true);
        // Para simular a remoção, vamos limpar e recriar o carrinho sem o item
        const carrinho = await getCarrinho();
        carrinho.splice(index, 1);

        // Limpar carrinho atual
        await fetch(`${API_BASE}/carrinho`, { method: "DELETE" });

        // Adicionar itens restantes
        for (const item of carrinho) {
            await fetch(`${API_BASE}/carrinho`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item),
            });
        }

        showToast("Item removido do carrinho", 'success');
        await renderCarrinho();
    } catch (error) {
        console.error("Erro ao remover item:", error);
        showToast("Erro ao remover item do carrinho", 'error');
    } finally {
        showLoading(false);
    }
}

async function limparCarrinho() {
    if (!confirm("Tem certeza que deseja limpar o carrinho?")) return;

    try {
        showLoading(true);
        await fetch(`${API_BASE}/carrinho`, { method: "DELETE" });
        showToast("Carrinho limpo", 'success');
        await renderCarrinho();
    } catch (error) {
        console.error("Erro ao limpar carrinho:", error);
        showToast("Erro ao limpar carrinho", 'error');
    } finally {
        showLoading(false);
    }
}

async function finalizePurchase() {
    try {
        showLoading(true);
        const carrinho = await getCarrinho();
        const total = carrinho.reduce((acc, item) => acc + item.preco, 0);

        // Simular compra - criar nova venda
        const novaVenda = {
            id: Date.now().toString(),
            valor: total
        };

        await fetch(`${API_BASE}/vendas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaVenda),
        });

        // Limpar carrinho
        await fetch(`${API_BASE}/carrinho`, { method: "DELETE" });

        // Atualizar saldo (subtrair o total)
        const saldoAtual = await getSaldo();
        await fetch(`${API_BASE}/saldo`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ saldo: saldoAtual.saldo - total }),
        });

        showToast("Compra realizada com sucesso!", 'success');
        await renderCarrinho();
        updateCartCount();
    } catch (error) {
        console.error("Erro ao finalizar compra:", error);
        showToast("Erro ao finalizar compra", 'error');
    } finally {
        showLoading(false);
    }
}

async function addBalance() {
    const valorInput = document.getElementById("saldo-input");
    const valor = parseFloat(valorInput.value);

    if (!valor || valor <= 0) {
        showToast("Digite um valor válido", 'error');
        return;
    }

    try {
        showLoading(true);
        const saldoAtual = await getSaldo();
        await fetch(`${API_BASE}/saldo`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ saldo: saldoAtual.saldo + valor })
        });

        showToast(`Saldo de R$ ${valor.toFixed(2)} adicionado com sucesso!`, 'success');
        valorInput.value = '';
        await renderCarrinho();
    } catch (error) {
        console.error("Erro ao adicionar saldo:", error);
        showToast("Erro ao adicionar saldo", 'error');
    } finally {
        showLoading(false);
    }
}

// =======================
// FUNÇÕES AUXILIARES
// =======================
async function getProdutos() {
    return fetch(`${API_BASE}/produtos`).then((res) => res.json());
}

async function getVendas() {
    return fetch(`${API_BASE}/vendas`).then((res) => res.json());
}

async function getCarrinho() {
    return fetch(`${API_BASE}/carrinho`).then((res) => res.json());
}

async function getSaldo() {
    return fetch(`${API_BASE}/saldo`).then((res) => res.json());
}

async function getCartTotal() {
    const carrinho = await getCarrinho();
    return carrinho.reduce((acc, item) => acc + item.preco, 0);
}

async function updateCartCount() {
    const carrinho = await getCarrinho();
    document.getElementById("cart-count").textContent = carrinho.length;
}

function showToast(message, type = 'info') {
    // Criar toast container se não existir
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}-circle me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    // Remover o toast do DOM após ser escondido
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// =======================
// INICIALIZAÇÃO
// =======================
document.addEventListener('DOMContentLoaded', function () {
    navigate("dashboard");

    // Atualizar contador do carrinho periodicamente
    setInterval(updateCartCount, 5000);
});
