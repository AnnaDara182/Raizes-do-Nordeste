/* =========================================
   1. RECUPERAR O CARRINHO
========================================= */

let carrinho = [];

try {
    carrinho = JSON.parse(
        localStorage.getItem("carrinhoRaizes") || "[]"
    );

    // Garante que os dados sejam uma lista.
    if (!Array.isArray(carrinho)) {
        carrinho = [];
    }
} catch (erro) {
    console.error("Erro ao recuperar o carrinho:", erro);
    carrinho = [];
}

/* =========================================
   2. ELEMENTOS DO HTML
========================================= */

const listaCarrinho = document.getElementById("lista-carrinho");
const carrinhoVazio = document.getElementById("carrinho-vazio");
const resumoCarrinho = document.getElementById("resumo-carrinho");
const acoesCarrinho = document.getElementById("acoes-carrinho");

const valorSubtotal = document.getElementById("valor-subtotal");
const valorFrete = document.getElementById("valor-frete");
const valorTotal = document.getElementById("valor-total");

const botaoFinalizar = document.getElementById("finalizar-pedido");

/* =========================================
   3. CONFIGURAÇÃO DO FRETE
   Pedidos para retirada não possuem frete.
========================================= */

const valorDoFrete = 0;

/* =========================================
   4. SALVAR O CARRINHO
========================================= */

function salvarCarrinho() {
    try {
        localStorage.setItem(
            "carrinhoRaizes",
            JSON.stringify(carrinho)
        );

        return true;
    } catch (erro) {
        console.error("Erro ao salvar o carrinho:", erro);
        alert("Não foi possível salvar as alterações do carrinho.");
        return false;
    }
}

/* =========================================
   5. EXIBIR OS PRODUTOS
========================================= */

function mostrarCarrinho() {

    // Limpa a lista antes de atualizar a tela.
    listaCarrinho.replaceChildren();

    const estaVazio = carrinho.length === 0;

    // Mostra ou esconde as seções conforme o conteúdo.
    carrinhoVazio.hidden = !estaVazio;
    resumoCarrinho.hidden = estaVazio;
    acoesCarrinho.hidden = estaVazio;

    if (estaVazio) {
        atualizarValores();
        return;
    }

    carrinho.forEach(function (item) {

        const cartao = document.createElement("article");
        cartao.className = "item-carrinho";

        /* Imagem do produto */
        const imagem = document.createElement("img");
        imagem.className = "imagem-carrinho";
        imagem.src = item.imagem || "";
        imagem.alt = item.nome || "Produto";
        imagem.loading = "lazy";

        imagem.addEventListener("error", function () {
            imagem.removeAttribute("src");
            imagem.alt = "Foto indisponível: " + item.nome;
        }, { once: true });

        /* Informações do produto */
        const dados = document.createElement("div");
        dados.className = "dados-carrinho";

        const nome = document.createElement("h2");
        nome.className = "nome-carrinho";
        nome.textContent = item.nome;

        const preco = document.createElement("p");
        preco.className = "preco-unitario";
        preco.textContent =
            "Por unidade: " +
            RaizesUtils.formatarMoeda(Number(item.precoUnitario) || 0);

        dados.append(nome, preco);

        /* Adicionais e ingredientes retirados */
        const detalhes = document.createElement("div");
        detalhes.className = "detalhes-carrinho";

        const textosDetalhes = [];

        if (Array.isArray(item.adicionais) && item.adicionais.length > 0) {

            const nomesAdicionais = item.adicionais.map(
                function (adicional) {
                    return adicional.quantidade + "x " + adicional.nome;
                }
            );

            textosDetalhes.push(
                "Adicionais: " + nomesAdicionais.join(", ")
            );
        }

        if (item.retirar) {
            textosDetalhes.push("Retirar: " + item.retirar);
        }

        detalhes.textContent = textosDetalhes.join(" | ");
        detalhes.hidden = textosDetalhes.length === 0;

        dados.appendChild(detalhes);

        /* Controles de quantidade */
        const acoes = document.createElement("div");
        acoes.className = "acoes-item";

        const controle = document.createElement("div");
        controle.className = "controle-quantidade";

        const botaoMenos = document.createElement("button");
        botaoMenos.type = "button";
        botaoMenos.textContent = "−";
        botaoMenos.setAttribute(
            "aria-label",
            "Diminuir quantidade de " + item.nome
        );

        const quantidade = document.createElement("span");
        quantidade.className = "quantidade-atual";
        quantidade.textContent = item.quantidade;

        const botaoMais = document.createElement("button");
        botaoMais.type = "button";
        botaoMais.textContent = "+";
        botaoMais.setAttribute(
            "aria-label",
            "Aumentar quantidade de " + item.nome
        );

        // Diminui a quantidade sem deixar ficar abaixo de um.
        botaoMenos.addEventListener("click", function () {

            if (item.quantidade > 1) {
                item.quantidade--;

                if (salvarCarrinho()) {
                    mostrarCarrinho();
                }
            }
        });

        // Aumenta a quantidade do item.
        botaoMais.addEventListener("click", function () {

            item.quantidade++;

            if (salvarCarrinho()) {
                mostrarCarrinho();
            }
        });

        controle.append(botaoMenos, quantidade, botaoMais);

        /* Total do item */
        const totalItem = document.createElement("span");
        totalItem.className = "total-item";
        totalItem.textContent = RaizesUtils.formatarMoeda(
            (Number(item.precoUnitario) || 0) *
            (Number(item.quantidade) || 1)
        );

        /* Botão para remover o item */
        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.className = "botao-remover";
        botaoRemover.textContent = "Remover";

        botaoRemover.addEventListener("click", function () {

            const carrinhoAnterior = carrinho;

            carrinho = carrinho.filter(function (outroItem) {
                return outroItem.chave !== item.chave;
            });

            if (salvarCarrinho()) {
                mostrarCarrinho();
            } else {
                carrinho = carrinhoAnterior;
            }
        });

        acoes.append(controle, totalItem, botaoRemover);

        // Monta o cartão e adiciona à lista.
        cartao.append(imagem, dados, acoes);
        listaCarrinho.appendChild(cartao);
    });

    atualizarValores();
}

/* =========================================
   6. CALCULAR OS VALORES
========================================= */

function atualizarValores() {

    const subtotal = carrinho.reduce(
        function (soma, item) {
            const precoUnitario = Number(item.precoUnitario) || 0;
            const quantidade = Number(item.quantidade) || 1;

            return soma + precoUnitario * quantidade;
        },
        0
    );

    const total = subtotal + valorDoFrete;

    valorSubtotal.textContent =
        RaizesUtils.formatarMoeda(subtotal);

    valorFrete.textContent =
        RaizesUtils.formatarMoeda(valorDoFrete);

    valorTotal.textContent =
        RaizesUtils.formatarMoeda(total);
}

/* =========================================
   7. IR PARA A REVISÃO DO PEDIDO
========================================= */

botaoFinalizar.addEventListener("click", function () {

    if (carrinho.length === 0) {
        alert("Adicione pelo menos um produto ao carrinho.");
        return;
    }

    window.location.href = "revisao.html";
});

/* =========================================
   8. INICIALIZAÇÃO
========================================= */

// Exibe os produtos assim que a página é aberta.
mostrarCarrinho();