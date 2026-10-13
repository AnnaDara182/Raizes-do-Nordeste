/* =========================================
   1. PRODUTOS DO CARDÁPIO
========================================= */

const produtos = [
    {
        id: 1,
        nome: "Carne de sol com baião de dois",
        categoria: "Comida",
        preco: 10.00,
        precoAntigo: 17.00,
        imagem: "imagens/carne-de-sol.jpg"
    },
    {
        id: 2,
        nome: "Acarajé tradicional",
        categoria: "Comida",
        preco: 12.00,
        precoAntigo: null,
        imagem: "imagens/acaraje.jpg"
    },
    {
        id: 3,
        nome: "Escondidinho de carne seca",
        categoria: "Comida",
        preco: 20.00,
        precoAntigo: null,
        imagem: "imagens/escondidinho.jpg"
    },
    {
        id: 4,
        nome: "Moqueca de peixe",
        categoria: "Comida",
        preco: 22.00,
        precoAntigo: null,
        imagem: "imagens/moqueca.jpg"
    },
    {
        id: 5,
        nome: "Suco natural",
        categoria: "Bebidas",
        preco: 8.00,
        precoAntigo: null,
        imagem: "imagens/suco-natural.jpg"
    },
    {
        id: 6,
        nome: "Cartola nordestina",
        categoria: "Sobremesa",
        preco: 12.00,
        precoAntigo: null,
        imagem: "imagens/cartola.webp"
    }
];

/* =========================================
   2. ELEMENTOS DA PÁGINA
========================================= */

let categoriaSelecionada = "Todos";

const listaProdutos = document.getElementById("lista-produtos");
const campoBusca = document.getElementById("buscar-produto");
const mensagemVazia = document.getElementById("mensagem-vazia");

const botoesCategorias = document.querySelectorAll(".filtro");
const contadorCarrinho = document.getElementById("quantidade-carrinho");
const botaoCarrinho = document.getElementById("abrir-carrinho");
const botaoFidelidade = document.getElementById("link-fidelidade");

const nomeUnidade = document.getElementById("nome-unidade");
const enderecoUnidade = document.getElementById("endereco-unidade");

/* =========================================
   3. LER O CARRINHO SALVO
========================================= */

// Recupera os produtos adicionados anteriormente.
// Se os dados estiverem inválidos, retorna uma lista vazia.

function lerCarrinho() {
    try {
        const dados = JSON.parse(
            localStorage.getItem("carrinhoRaizes") || "[]"
        );

        return Array.isArray(dados) ? dados : [];

    } catch (erro) {
        return [];
    }
}

/* =========================================
   4. MOSTRAR A UNIDADE SELECIONADA
========================================= */

// A unidade é escolhida na página inicial.
// Esta função apresenta os dados salvos no cardápio.

function mostrarUnidadeSelecionada() {

    let unidade = null;

    try {
        unidade = JSON.parse(
            localStorage.getItem("unidadeRaizes") || "null"
        );

    } catch (erro) {
        unidade = null;
    }

    // Sem uma unidade válida, o cliente precisa voltar
    // à página inicial para fazer a escolha.

    if (
        !unidade ||
        !unidade.nome ||
        !unidade.endereco
    ) {
        window.location.href = "index.html";
        return;
    }

    nomeUnidade.textContent = unidade.nome;
    enderecoUnidade.textContent = unidade.endereco;
}

/* =========================================
   5. ATUALIZAR O CONTADOR DO CARRINHO
========================================= */

function atualizarContadorCarrinho() {

    const carrinho = lerCarrinho();

    // Soma as quantidades de todos os produtos.
    const quantidadeTotal = carrinho.reduce(
        function (soma, item) {
            return soma + Math.max(
                0,
                Number(item.quantidade) || 0
            );
        },
        0
    );

    if (contadorCarrinho) {
        contadorCarrinho.textContent = quantidadeTotal;
    }
}

/* =========================================
   6. MOSTRAR OS PRODUTOS
========================================= */

function mostrarProdutos(lista) {

    // Confere se os elementos necessários existem.
    if (!listaProdutos || !mensagemVazia) {
        return;
    }

    // Remove os cartões anteriores.
    listaProdutos.replaceChildren();

    // Exibe uma mensagem quando não há resultados.
    mensagemVazia.hidden = lista.length > 0;

    lista.forEach(function (produto) {

        // Cartão do produto.
        const cartao = document.createElement("article");
        cartao.className = "cartao-produto";

        // Imagem do prato.
        const imagem = document.createElement("img");

        imagem.className = "imagem-produto";
        imagem.src = produto.imagem;
        imagem.alt = produto.nome;
        imagem.loading = "lazy";

        // Se a imagem não existir, mantém o espaço reservado
        // e informa que a fotografia está indisponível.
        imagem.addEventListener("error", function () {

            imagem.removeAttribute("src");
            imagem.alt = "Foto indisponível: " + produto.nome;

        }, { once: true });

        // Área de informações.
        const dados = document.createElement("div");
        dados.className = "dados-produto";

        // Nome do produto.
        const nome = document.createElement("h2");
        nome.className = "nome-produto";
        nome.textContent = produto.nome;

        // Preço do produto.
        const preco = document.createElement("p");
        preco.className = "preco-produto";

        if (produto.precoAntigo !== null) {

            // Preço anterior riscado.
            const precoAntigo = document.createElement("span");
            precoAntigo.className = "preco-antigo";
            precoAntigo.textContent =
                RaizesUtils.formatarMoeda(produto.precoAntigo);

            // Preço atual em destaque.
            const precoAtual = document.createElement("span");
            precoAtual.className = "preco-promocional";
            precoAtual.textContent =
                "Por: " + RaizesUtils.formatarMoeda(produto.preco);

            preco.append(
                precoAntigo,
                document.createElement("br"),
                precoAtual
            );

        } else {

            // Produtos sem promoção mostram apenas o preço atual.
            preco.textContent =
                RaizesUtils.formatarMoeda(produto.preco);
        }

        dados.append(nome, preco);

        // Botão que abre a personalização do produto.
        const botaoAdicionar = document.createElement("button");

        botaoAdicionar.className = "botao-adicionar";
        botaoAdicionar.type = "button";
        botaoAdicionar.textContent = "+";

        botaoAdicionar.setAttribute(
            "aria-label",
            "Personalizar " + produto.nome
        );

        botaoAdicionar.addEventListener("click", function () {

            // Envia o ID para personalizar.html.
            window.location.href =
                "personalizar.html?id=" + encodeURIComponent(produto.id);
        });

        // Monta e adiciona o cartão à página.
        cartao.append(imagem, dados, botaoAdicionar);
        listaProdutos.appendChild(cartao);
    });
}

/* =========================================
   7. PESQUISAR E FILTRAR PRODUTOS
========================================= */

function filtrarProdutos() {

    if (!campoBusca) {
        return;
    }

    // Converte a busca para minúsculas e remove espaços extras.
    const termo = campoBusca.value
        .trim()
        .toLocaleLowerCase("pt-BR");

    // Aplica simultaneamente o filtro de categoria e a busca.
    const resultado = produtos.filter(function (produto) {

        const categoriaCorreta =
            categoriaSelecionada === "Todos" ||
            produto.categoria === categoriaSelecionada;

        const nomeCorreto = produto.nome
            .toLocaleLowerCase("pt-BR")
            .includes(termo);

        return categoriaCorreta && nomeCorreto;
    });

    mostrarProdutos(resultado);
}

// Atualiza os resultados enquanto o cliente digita.
if (campoBusca) {
    campoBusca.addEventListener("input", filtrarProdutos);
}

/* =========================================
   8. SELEÇÃO DAS CATEGORIAS
========================================= */

botoesCategorias.forEach(function (botao) {

    botao.addEventListener("click", function () {

        // Atualiza a categoria escolhida.
        categoriaSelecionada = botao.dataset.categoria;

        // Atualiza a aparência e o estado acessível dos botões.
        botoesCategorias.forEach(function (outroBotao) {

            const estaAtivo = outroBotao === botao;

            outroBotao.classList.toggle("ativo", estaAtivo);

            outroBotao.setAttribute(
                "aria-pressed",
                String(estaAtivo)
            );
        });

        // Mostra os produtos correspondentes.
        filtrarProdutos();
    });
});

/* =========================================
   9. NAVEGAÇÃO PARA O CARRINHO
========================================= */

if (botaoCarrinho) {

    botaoCarrinho.addEventListener("click", function () {
        window.location.href = "carrinho.html";
    });
}

/* =========================================
   10. ACESSO À FIDELIDADE
========================================= */

if (botaoFidelidade) {

    botaoFidelidade.addEventListener("click", function (evento) {

        evento.preventDefault();

        // Clientes autenticados podem consultar seus pontos.
        if (AuthRaizes.estaLogado()) {

            window.location.href = "fidelidade.html";

        } else {

            // Visitantes precisam entrar antes de consultar
            // informações pessoais de fidelidade.
            AuthRaizes.pedirLogin("fidelidade.html");
        }
    });
}

/* =========================================
   11. INICIALIZAÇÃO DA PÁGINA
========================================= */

// Mostra a unidade, atualiza o carrinho e apresenta
// os produtos assim que o JavaScript é executado.

mostrarUnidadeSelecionada();
atualizarContadorCarrinho();
filtrarProdutos();