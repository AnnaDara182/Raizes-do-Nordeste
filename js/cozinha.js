
/* =========================================
   1. CONFIGURAÇÕES
========================================= */

const CHAVE_PEDIDOS = "pedidosRaizes";

let pedidos = [];
let filtroAtual = "todos";
let unidadeAtual = "Unidade 1";


/* =========================================
   2. CARREGAR E SALVAR PEDIDOS
========================================= */

function carregarPedidos() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_PEDIDOS) || "[]"
        );

        pedidos = Array.isArray(dados) ? dados : [];

    } catch (erro) {
        pedidos = [];
        console.error("Erro ao carregar os pedidos:", erro);
    }
}

function salvarPedidos() {
    try {
        localStorage.setItem(
            CHAVE_PEDIDOS,
            JSON.stringify(pedidos)
        );

        return true;

    } catch (erro) {
        alert(
            "Não foi possível salvar a atualização do pedido. " +
            "Verifique o armazenamento do navegador e tente novamente."
        );

        console.error("Erro ao salvar os pedidos:", erro);
        return false;
    }
}


/* =========================================
   3. ELEMENTOS DA PÁGINA
========================================= */

const listaPedidos = document.getElementById("lista-pedidos");
const mensagemVazia = document.getElementById("mensagem-vazia");

const contadorAguardando = document.getElementById("contador-aguardando");
const contadorPreparando = document.getElementById("contador-preparando");
const contadorPronto = document.getElementById("contador-pronto");

const botoesFiltro = document.querySelectorAll(".filtro");
const seletorUnidade = document.getElementById("unidade-cozinha");

function obterUnidadePedido(pedido) {
    const unidade = pedido.unidade;
    const valor = (typeof unidade === "string" || typeof unidade === "number")
        ? unidade
        : (unidade && unidade.nome) || pedido.nomeUnidade || pedido.unidadeSelecionada || pedido.unidadeNome || pedido.filial || pedido.loja || pedido.unidadeId || pedido.idUnidade || "";
    const nome = String(valor).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (nome === "2" || nome.includes("unidade 2") || nome.includes("unidade2") || nome.includes("unidade dois") || nome.includes("praia") || nome.includes("continente")) return "Unidade 2";
    if (nome === "1" || nome.includes("unidade 1") || nome.includes("unidade1") || nome.includes("unidade um") || nome.includes("centro")) return "Unidade 1";
    return "";
}


/* =========================================
   4. FUNÇÕES AUXILIARES
========================================= */

function obterNomeStatus(status) {
    const nomes = {
        aguardando: "Aguardando",
        recebido: "Aguardando",
        preparando: "Em preparo",
        pronto: "Pronto para retirada",
        retirado: "Pedido retirado"
    };

    return nomes[status] || "Status desconhecido";
}


/* =========================================
   5. ATUALIZAR CONTADORES
========================================= */

function atualizarContadores() {
    const pedidosUnidade = pedidos.filter(pedido => obterUnidadePedido(pedido) === unidadeAtual);
    contadorAguardando.textContent = pedidosUnidade.filter(pedido => pedido.status === "aguardando" || pedido.status === "recebido").length;
    contadorPreparando.textContent = pedidosUnidade.filter(pedido => pedido.status === "preparando").length;
    contadorPronto.textContent = pedidosUnidade.filter(pedido => pedido.status === "pronto").length;
}


/* =========================================
   6. CRIAR ITEM DO PEDIDO
========================================= */

function criarItemPedido(item) {
    const linha = document.createElement("li");
    linha.className = "item-pedido";

    const informacoes = document.createElement("div");
    informacoes.className = "nome-item";

    const nome = document.createElement("p");
    nome.textContent = item.nome || "Produto";

    informacoes.appendChild(nome);

    // Mostra os adicionais escolhidos pelo cliente.
    if (Array.isArray(item.adicionais) && item.adicionais.length > 0) {
        const adicionais = document.createElement("p");
        adicionais.className = "observacao-item";

        adicionais.textContent =
            "Adicionais: " +
            item.adicionais.map(function (adicional) {
                return (
                    (Number(adicional.quantidade) || 1) +
                    "x " +
                    adicional.nome
                );
            }).join(", ");

        informacoes.appendChild(adicionais);
    }

    // Mostra os ingredientes que devem ser retirados.
    if (item.retirar) {
        const retirar = document.createElement("p");
        retirar.className = "observacao-item";
        retirar.textContent = "Retirar: " + item.retirar;

        informacoes.appendChild(retirar);
    }

    const quantidade = document.createElement("span");
    quantidade.className = "quantidade-item";
    quantidade.textContent = "x" + (Number(item.quantidade) || 1);

    linha.append(informacoes, quantidade);

    return linha;
}


/* =========================================
   7. CRIAR CARTÃO DO PEDIDO
========================================= */

function criarCartaoPedido(pedido) {
    const cartao = document.createElement("article");
    cartao.className = "cartao-pedido";

    // Cabeçalho do cartão.
    const cabecalho = document.createElement("div");
    cabecalho.className = "cabecalho-pedido";

    const identificacao = document.createElement("div");

    const rotulo = document.createElement("p");
    rotulo.className = "rotulo-pedido";
    rotulo.textContent = "Número do pedido";

    const numero = document.createElement("h2");
    numero.className = "numero-pedido";
    numero.textContent = "#" + pedido.numero;

    identificacao.append(rotulo, numero);

    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-status " + pedido.status;
    etiqueta.textContent = obterNomeStatus(pedido.status);

    cabecalho.append(identificacao, etiqueta);

    // Unidade do pedido.
    if (obterUnidadePedido(pedido)) {
        const unidade = document.createElement("p");
        unidade.className = "observacao-item";
        unidade.textContent = obterUnidadePedido(pedido);

        cabecalho.appendChild(unidade);
    }

    // Produtos do pedido.
    const tituloItens = document.createElement("h3");
    tituloItens.className = "titulo-itens";
    tituloItens.textContent = "Itens do pedido";

    const listaItens = document.createElement("ul");
    listaItens.className = "lista-itens";

    const itens = Array.isArray(pedido.itens) ? pedido.itens : [];

    itens.forEach(function (item) {
        listaItens.appendChild(criarItemPedido(item));
    });

    // Total.
    const total = document.createElement("p");
    total.className = "observacao-item";

    total.textContent =
        "Total: " +
        RaizesUtils.formatarMoeda(Number(pedido.total) || 0);

    // Área de ações.
    const acoes = document.createElement("div");
    acoes.className = "acoes-pedido";

    const botaoStatus = document.createElement("button");
    botaoStatus.type = "button";
    botaoStatus.className = "botao-status";

    if (pedido.status === "aguardando") {
        botaoStatus.textContent = "Iniciar preparo";

    } else if (pedido.status === "preparando") {
        botaoStatus.textContent = "Marcar como pronto";

    } else {
        botaoStatus.textContent = pedido.status === "retirado" ? "Pedido retirado" : "Pronto para retirada";
        botaoStatus.disabled = true;
    }

    botaoStatus.addEventListener("click", function () {
        avancarStatus(pedido.numero);
    });

    acoes.appendChild(botaoStatus);

    // Permite voltar uma etapa em caso de erro.
    if (
        pedido.status === "preparando" ||
        pedido.status === "pronto"
    ) {
        const botaoVoltar = document.createElement("button");
        botaoVoltar.type = "button";
        botaoVoltar.className = "botao-secundario";
        botaoVoltar.textContent = "Voltar etapa";

        botaoVoltar.addEventListener("click", function () {
            voltarStatus(pedido.numero);
        });

        acoes.appendChild(botaoVoltar);
    }

    cartao.append(
        cabecalho,
        tituloItens,
        listaItens,
        total,
        acoes
    );

    return cartao;
}


/* =========================================
   8. MOSTRAR OS PEDIDOS
========================================= */

function mostrarPedidos() {
    if (!listaPedidos || !mensagemVazia) {
        return;
    }

    listaPedidos.replaceChildren();

    // Os contadores não dependem do filtro selecionado.
    atualizarContadores();

    const pedidosFiltrados = pedidos.filter(function (pedido) {
        const mesmaUnidade = obterUnidadePedido(pedido) === unidadeAtual;
        const mesmoStatus = filtroAtual === "todos" ||
            (filtroAtual === "aguardando" ? (pedido.status === "aguardando" || pedido.status === "recebido") : pedido.status === filtroAtual);
        return mesmaUnidade && mesmoStatus;
    });

    mensagemVazia.hidden = pedidosFiltrados.length > 0;

    pedidosFiltrados.forEach(function (pedido) {
        listaPedidos.appendChild(criarCartaoPedido(pedido));
    });
}


/* =========================================
   9. ALTERAR STATUS DO PEDIDO
========================================= */

function atualizarStatusPedido(numeroPedido, novoStatus) {
    const indice = pedidos.findIndex(function (pedido) {
        return String(pedido.numero) === String(numeroPedido);
    });

    if (indice === -1) {
        return;
    }

    const statusAnterior = pedidos[indice].status;

    pedidos[indice].status = novoStatus;

    // Se não conseguir salvar, restaura o estado anterior.
    if (!salvarPedidos()) {
        pedidos[indice].status = statusAnterior;
        mostrarPedidos();
        return;
    }

    mostrarPedidos();
}


/* =========================================
   10. AVANÇAR STATUS
========================================= */

function avancarStatus(numeroPedido) {
    const pedido = pedidos.find(function (item) {
        return String(item.numero) === String(numeroPedido);
    });

    if (!pedido) {
        return;
    }

    if (pedido.status === "aguardando" || pedido.status === "recebido") {
        atualizarStatusPedido(numeroPedido, "preparando");

    } else if (pedido.status === "preparando") {
        atualizarStatusPedido(numeroPedido, "pronto");

    }
}


/* =========================================
   11. VOLTAR ETAPA
========================================= */

function voltarStatus(numeroPedido) {
    const pedido = pedidos.find(function (item) {
        return String(item.numero) === String(numeroPedido);
    });

    if (!pedido) {
        return;
    }

    if (pedido.status === "pronto") {
        atualizarStatusPedido(numeroPedido, "preparando");

    } else if (pedido.status === "preparando") {
        atualizarStatusPedido(numeroPedido, "aguardando");
    } else if (pedido.status === "recebido") {
        atualizarStatusPedido(numeroPedido, "aguardando");
    }
}


/* =========================================
   12. FILTROS
========================================= */

botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
        filtroAtual = botao.dataset.filtro;

        botoesFiltro.forEach(function (outroBotao) {
            const selecionado = outroBotao === botao;

            outroBotao.classList.toggle("ativo", selecionado);

            outroBotao.setAttribute(
                "aria-pressed",
                String(selecionado)
            );
        });

        mostrarPedidos();
    });
});


/* =========================================
   13. FILTRO POR UNIDADE
========================================= */

if (seletorUnidade) {
    seletorUnidade.value = unidadeAtual;
    seletorUnidade.addEventListener("change", function () {
        unidadeAtual = seletorUnidade.value;
        mostrarPedidos();
    });
}

/* =========================================
   14. ATUALIZAÇÃO ENTRE ABAS
========================================= */

window.addEventListener("storage", function (evento) {
    if (evento.key === CHAVE_PEDIDOS) {
        carregarPedidos();
        mostrarPedidos();
    }
});


/* =========================================
   15. INICIALIZAÇÃO
========================================= */

carregarPedidos();
mostrarPedidos();
