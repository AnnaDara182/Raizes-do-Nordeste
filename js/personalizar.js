/* =========================================
   1. CADASTRO DOS PRATOS

   Cada ID deve corresponder ao produto
   cadastrado na página do cardápio.
========================================= */

const pratos = {
    1: {
        nome: "Carne de sol com baião de dois",
        preco: 10.00,
        imagem: "imagens/carne-de-sol.jpg",
        adicionais: [
            { id: "queijo", nome: "Queijo coalho extra", preco: 3.00 },
            { id: "carne", nome: "Carne de sol extra", preco: 6.00 },
            { id: "baiao", nome: "Porção extra de baião", preco: 4.00 }
        ]
    },

    2: {
        nome: "Acarajé tradicional",
        preco: 12.00,
        imagem: "imagens/acaraje.jpg",
        adicionais: [
            { id: "vatapa", nome: "Vatapá extra", preco: 2.00 },
            { id: "camarao", nome: "Camarão extra", preco: 4.00 },
            { id: "salada", nome: "Salada extra", preco: 1.50 }
        ]
    },

    3: {
        nome: "Escondidinho de carne seca",
        preco: 20.00,
        imagem: "imagens/escondidinho.jpg",
        adicionais: [
            { id: "queijo", nome: "Queijo extra", preco: 2.00 },
            { id: "carne", nome: "Carne seca extra", preco: 4.00 },
            { id: "pure", nome: "Porção extra de purê", preco: 3.00 }
        ]
    },

    4: {
        nome: "Moqueca de peixe",
        preco: 22.00,
        imagem: "imagens/moqueca.jpg",
        adicionais: [
            { id: "peixe", nome: "Peixe extra", preco: 6.00 },
            { id: "leite", nome: "Leite de coco extra", preco: 2.00 },
            { id: "arroz", nome: "Porção extra de arroz", preco: 3.00 }
        ]
    },

    5: {
        nome: "Suco natural",
        preco: 8.00,
        imagem: "imagens/suco-natural.jpg",
        adicionais: [
            { id: "gelo", nome: "Gelo extra", preco: 0.00 },
            { id: "polpa", nome: "Polpa extra", preco: 2.00 }
        ]
    },

    6: {
        nome: "Cartola nordestina",
        preco: 12.00,
        imagem: "imagens/cartola.webp",
        adicionais: [
            { id: "queijo", nome: "Queijo extra", preco: 2.00 },
            { id: "banana", nome: "Banana extra", preco: 1.50 },
            { id: "canela", nome: "Canela extra", preco: 0.00 }
        ]
    }
};


/* =========================================
   2. IDENTIFICAR O PRATO ESCOLHIDO
========================================= */

// Lê o ID do prato enviado pela URL.
const parametros = new URLSearchParams(window.location.search);
const idPrato = parametros.get("id");

// Procura o prato correspondente ao ID.
const prato = pratos[idPrato];

// Guarda a quantidade selecionada de cada adicional.
const quantidadesAdicionais = {};


/* =========================================
   3. ELEMENTOS DO HTML
========================================= */

const imagemPrato = document.getElementById("imagem-prato");
const nomePrato = document.getElementById("nome-prato");
const precoPrato = document.getElementById("preco-prato");

const listaAdicionais = document.getElementById("lista-adicionais");
const campoRetirar = document.getElementById("ingredientes-retirar");

const valorBase = document.getElementById("valor-base");
const valorAdicionais = document.getElementById("valor-adicionais");
const valorTotal = document.getElementById("valor-total");

const formulario = document.getElementById("form-personalizacao");
const mensagem = document.getElementById("mensagem");


/* =========================================
   4. VALIDAR E CARREGAR O PRATO
========================================= */

if (!prato) {

    // Exibe uma mensagem se o ID não existir.
    nomePrato.textContent = "Prato não encontrado";

    // Esconde o formulário para evitar uma personalização inválida.
    formulario.hidden = true;

    // Informa que é necessário voltar ao cardápio.
    mensagem.textContent = "Volte ao cardápio e escolha um prato.";

} else {

    // Preenche as informações do prato escolhido.
    nomePrato.textContent = prato.nome;
    imagemPrato.src = prato.imagem;
    imagemPrato.alt = prato.nome;

    // Trata a ausência da imagem sem interromper a página.
    imagemPrato.addEventListener("error", function () {
        imagemPrato.removeAttribute("src");
        imagemPrato.alt = "Foto indisponível: " + prato.nome;
    }, { once: true });

    // Exibe o preço inicial do prato.
    precoPrato.textContent = RaizesUtils.formatarMoeda(prato.preco);
    valorBase.textContent = RaizesUtils.formatarMoeda(prato.preco);

    // Cria os adicionais disponíveis para esse prato.
    mostrarAdicionais();

    // Calcula os valores iniciais.
    atualizarPrecos();
}


/* =========================================
   5. MOSTRAR OS ADICIONAIS
========================================= */

function mostrarAdicionais() {

    // Limpa a lista antes de criar os cartões.
    listaAdicionais.replaceChildren();

    prato.adicionais.forEach(function (adicional) {

        // Todos os adicionais começam com quantidade zero.
        quantidadesAdicionais[adicional.id] = 0;

        // Cria o cartão do adicional.
        const item = document.createElement("div");
        item.className = "item-adicional";

        // Caixa de seleção do adicional.
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "adicional-" + adicional.id;

        checkbox.setAttribute(
            "aria-label",
            "Adicionar " + adicional.nome
        );

        // Área com o nome e o preço.
        const dados = document.createElement("div");
        dados.className = "dados-adicional";

        const nome = document.createElement("label");
        nome.className = "nome-adicional";
        nome.htmlFor = checkbox.id;
        nome.textContent = adicional.nome;

        const preco = document.createElement("span");
        preco.className = "preco-adicional";
        preco.textContent =
            "+" + RaizesUtils.formatarMoeda(adicional.preco);

        dados.append(nome, preco);

        // Área dos botões de quantidade.
        const controles = document.createElement("div");
        controles.className = "controle-quantidade";

        // Botão para diminuir.
        const botaoMenos = document.createElement("button");
        botaoMenos.type = "button";
        botaoMenos.textContent = "−";

        botaoMenos.setAttribute(
            "aria-label",
            "Diminuir " + adicional.nome
        );

        // Número que mostra a quantidade selecionada.
        const quantidade = document.createElement("span");
        quantidade.className = "quantidade";
        quantidade.textContent = "0";

        // Botão para aumentar.
        const botaoMais = document.createElement("button");
        botaoMais.type = "button";
        botaoMais.textContent = "+";

        botaoMais.setAttribute(
            "aria-label",
            "Aumentar " + adicional.nome
        );

        // Atualiza a quantidade quando a caixa é marcada.
        checkbox.addEventListener("change", function () {

            if (checkbox.checked) {

                // Se ainda não houver unidades, seleciona uma.
                if (quantidadesAdicionais[adicional.id] === 0) {
                    quantidadesAdicionais[adicional.id] = 1;
                }

            } else {

                // Desmarcar o adicional zera a quantidade.
                quantidadesAdicionais[adicional.id] = 0;
            }

            atualizarQuantidade();
        });

        // Adiciona uma unidade do adicional.
        botaoMais.addEventListener("click", function () {

            quantidadesAdicionais[adicional.id]++;

            // Marca automaticamente a caixa de seleção.
            checkbox.checked = true;

            atualizarQuantidade();
        });

        // Remove uma unidade sem permitir valores negativos.
        botaoMenos.addEventListener("click", function () {

            if (quantidadesAdicionais[adicional.id] > 0) {
                quantidadesAdicionais[adicional.id]--;
            }

            // Desmarca a caixa quando a quantidade chegar a zero.
            checkbox.checked =
                quantidadesAdicionais[adicional.id] > 0;

            atualizarQuantidade();
        });

        // Atualiza o número exibido e recalcula os preços.
        function atualizarQuantidade() {

            quantidade.textContent =
                quantidadesAdicionais[adicional.id];

            atualizarPrecos();
        }

        // Organiza os elementos dentro do cartão.
        controles.append(botaoMenos, quantidade, botaoMais);
        item.append(checkbox, dados, controles);

        // Adiciona o cartão à lista da página.
        listaAdicionais.appendChild(item);
    });
}


/* =========================================
   6. CALCULAR OS PREÇOS
========================================= */

function atualizarPrecos() {

    let totalAdicionais = 0;

    // Soma o preço de cada adicional multiplicado
    // pela quantidade selecionada.
    prato.adicionais.forEach(function (adicional) {

        const quantidade =
            quantidadesAdicionais[adicional.id] || 0;

        totalAdicionais += adicional.preco * quantidade;
    });

    // Soma o preço do prato com o valor dos adicionais.
    const total = prato.preco + totalAdicionais;

    // Atualiza os valores exibidos na página.
    valorAdicionais.textContent =
        RaizesUtils.formatarMoeda(totalAdicionais);

    valorTotal.textContent =
        RaizesUtils.formatarMoeda(total);
}


/* =========================================
   7. ADICIONAR AO CARRINHO

   Os dados ficam salvos no localStorage
   para serem utilizados nas outras páginas.
========================================= */

formulario.addEventListener("submit", function (evento) {

    // Impede o envio tradicional do formulário.
    evento.preventDefault();

    // Interrompe a operação se o prato não for válido.
    if (!prato) {
        return;
    }

    // Limpa mensagens anteriores.
    mensagem.textContent = "";

    // Seleciona somente os adicionais com quantidade maior que zero.
    const adicionaisEscolhidos = prato.adicionais
        .filter(function (adicional) {
            return quantidadesAdicionais[adicional.id] > 0;
        })
        .map(function (adicional) {
            return {
                id: adicional.id,
                nome: adicional.nome,
                quantidade: quantidadesAdicionais[adicional.id],
                preco: adicional.preco
            };
        });

    // Calcula o preço de todos os adicionais escolhidos.
    const somaAdicionais = adicionaisEscolhidos.reduce(
        function (total, adicional) {
            return total + adicional.preco * adicional.quantidade;
        },
        0
    );

    // Recupera o carrinho que já existe no navegador.
    let carrinhoSalvo = [];

    try {

        const dadosSalvos = localStorage.getItem("carrinhoRaizes");

        carrinhoSalvo = JSON.parse(dadosSalvos || "[]");

        // Garante que o conteúdo salvo seja uma lista.
        if (!Array.isArray(carrinhoSalvo)) {
            carrinhoSalvo = [];
        }

    } catch (erro) {

        // Informa o erro no console para facilitar a identificação.
        console.error("Não foi possível ler o carrinho:", erro);

        mensagem.textContent =
            "Não foi possível carregar o carrinho. Tente novamente.";

        return;
    }

    // Cria o item com os dados da personalização.
    const itemCarrinho = {
        chave: Date.now() + "-" + Math.random().toString(16).slice(2),
        id: Number(idPrato),
        nome: prato.nome,
        imagem: prato.imagem,
        precoBase: prato.preco,
        adicionais: adicionaisEscolhidos,
        retirar: campoRetirar.value.trim(),
        precoUnitario: prato.preco + somaAdicionais,
        quantidade: 1
    };

    // Cada personalização é adicionada como um item separado.
    carrinhoSalvo.push(itemCarrinho);

    try {

        // Salva o carrinho atualizado no navegador.
        localStorage.setItem(
            "carrinhoRaizes",
            JSON.stringify(carrinhoSalvo)
        );

    } catch (erro) {

        // Evita redirecionar se não for possível salvar o pedido.
        console.error("Não foi possível salvar o carrinho:", erro);

        mensagem.textContent =
            "Não foi possível salvar o pedido. Verifique o armazenamento do navegador.";

        return;
    }

    // Redireciona para a página do carrinho após salvar.
    window.location.href = "carrinho.html";
});