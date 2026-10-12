/* =========================================
   1. RECUPERAR OS DADOS SALVOS
========================================= */

// Recupera uma lista salva no localStorage.
function lerLista(chave) {
    try {
        const dados = JSON.parse(
            localStorage.getItem(chave) || "[]"
        );

        return Array.isArray(dados) ? dados : [];

    } catch (erro) {
        console.error("Erro ao ler os dados:", erro);
        return [];
    }
}

// Recupera os produtos do carrinho.
let carrinho = lerLista("carrinhoRaizes");

// Recupera a unidade selecionada.
let unidade = null;

try {
    unidade = JSON.parse(
        localStorage.getItem("unidadeRaizes") || "null"
    );
} catch (erro) {
    console.error("Erro ao recuperar a unidade:", erro);
    unidade = null;
}


/* =========================================
   2. ELEMENTOS DO HTML
========================================= */

const listaRevisao = document.getElementById("lista-revisao");
const mensagemVazia = document.getElementById("mensagem-vazia");

const nomeUnidade = document.getElementById("nome-unidade");
const enderecoUnidade = document.getElementById("endereco-unidade");

const campoUsarPontos = document.getElementById("usar-pontos");
const pontosGanhosElemento = document.getElementById("pontos-ganhos");
const avisoPontos = document.getElementById("aviso-pontos");

const elementoSubtotal = document.getElementById("subtotal");
const elementoFrete = document.getElementById("frete");
const elementoDesconto = document.getElementById("desconto-pontos");
const elementoTotal = document.getElementById("total");

const botaoFinalizar = document.getElementById("finalizar-pedido");
const linkFidelidade = document.getElementById("link-fidelidade");
const mensagemFinal = document.getElementById("mensagem-final");

// Pedidos para retirada na unidade não possuem frete.
const valorFrete = 0;


/* =========================================
   3. FUNÇÕES AUXILIARES
========================================= */

// Formata um valor em reais.
function formatarMoeda(valor) {
    return RaizesUtils.formatarMoeda(valor);
}

// Calcula o subtotal dos produtos.
function calcularSubtotal() {
    return carrinho.reduce(function (soma, item) {

        const precoUnitario = Number(item.precoUnitario) || 0;
        const quantidade = Number(item.quantidade) || 1;

        return soma + precoUnitario * quantidade;

    }, 0);
}


/* =========================================
   4. MOSTRAR A UNIDADE DE RETIRADA
========================================= */

function mostrarUnidade() {

    // Verifica se uma unidade foi selecionada.
    if (!unidade || !unidade.nome || !unidade.endereco) {

        nomeUnidade.textContent = "Unidade não selecionada";

        enderecoUnidade.textContent =
            "Volte ao início para escolher uma unidade.";

        botaoFinalizar.disabled = true;

        return;
    }

    // Mostra os dados da unidade escolhida.
    nomeUnidade.textContent = unidade.nome;
    enderecoUnidade.textContent = unidade.endereco;
}


/* =========================================
   5. MOSTRAR OS ITENS DO PEDIDO
========================================= */

function mostrarItens() {

    // Limpa a lista antes de desenhar os produtos.
    listaRevisao.replaceChildren();

    const estaVazio = carrinho.length === 0;

    // Exibe a mensagem se não houver produtos.
    mensagemVazia.hidden = !estaVazio;

    // Desabilita a finalização se o carrinho estiver vazio.
    if (estaVazio) {
        botaoFinalizar.disabled = true;
        return;
    }

    // Cria um cartão para cada produto.
    carrinho.forEach(function (item) {

        const cartao = document.createElement("article");
        cartao.className = "item-revisao";

        /* Imagem do produto */

        const imagem = document.createElement("img");

        imagem.className = "imagem-revisao";
        imagem.src = item.imagem || "";
        imagem.alt = item.nome || "Produto";
        imagem.loading = "lazy";

        // Trata imagens que não forem encontradas.
        imagem.addEventListener("error", function () {

            imagem.removeAttribute("src");

            imagem.alt =
                "Foto indisponível: " + (item.nome || "produto");

        }, { once: true });


        /* Informações do produto */

        const dados = document.createElement("div");
        dados.className = "dados-revisao";

        const nome = document.createElement("h3");
        nome.className = "nome-revisao";
        nome.textContent = item.nome || "Produto";

        const preco = document.createElement("p");
        preco.className = "preco-revisao";

        preco.textContent =
            "Por unidade: " +
            formatarMoeda(Number(item.precoUnitario) || 0);

        dados.append(nome, preco);


        /* Adicionais e ingredientes retirados */

        const detalhes = [];

        if (
            Array.isArray(item.adicionais) &&
            item.adicionais.length > 0
        ) {

            const nomesAdicionais = item.adicionais.map(
                function (adicional) {

                    return (
                        adicional.quantidade +
                        "x " +
                        adicional.nome
                    );

                }
            );

            detalhes.push(
                "Adicionais: " + nomesAdicionais.join(", ")
            );
        }

        if (item.retirar) {
            detalhes.push("Retirar: " + item.retirar);
        }

        // Exibe os detalhes somente se houver informações.
        if (detalhes.length > 0) {

            const textoDetalhes = document.createElement("p");

            textoDetalhes.className = "detalhes-revisao";
            textoDetalhes.textContent = detalhes.join(" | ");

            dados.appendChild(textoDetalhes);
        }


        /* Quantidade do produto */

        const quantidade = document.createElement("span");

        quantidade.className = "quantidade-revisao";

        quantidade.textContent =
            (Number(item.quantidade) || 1) + " un.";


        // Organiza os elementos do cartão.
        cartao.append(imagem, dados, quantidade);

        listaRevisao.appendChild(cartao);
    });
}


/* =========================================
   6. CALCULAR TOTAL, DESCONTO E PONTOS
========================================= */

function calcularValores() {

    // Soma os preços dos produtos e suas quantidades.
    const subtotal = calcularSubtotal();

    // O frete é zero para retirada na unidade.
    const frete = valorFrete;

    let desconto = 0;
    let pontosUsados = 0;

    // Verifica se o cliente selecionou o uso de pontos.
    if (
        campoUsarPontos.checked &&
        AuthRaizes.estaLogado()
    ) {

        const saldo = RaizesUtils.obterSaldoPontos();

        // Calcula o desconto permitido pelo saldo e pelo subtotal.
        const resgate = RaizesUtils.calcularResgate(
            saldo,
            subtotal
        );

        desconto = resgate.desconto;
        pontosUsados = resgate.pontosUsados;
    }

    // Calcula o total, sem permitir valores negativos.
    const total = Math.max(
        0,
        subtotal + frete - desconto
    );

    // Atualiza os valores exibidos.
    elementoSubtotal.textContent = formatarMoeda(subtotal);
    elementoFrete.textContent = formatarMoeda(frete);
    elementoDesconto.textContent = formatarMoeda(desconto);
    elementoTotal.textContent = formatarMoeda(total);

    // Calcula os pontos que poderão ser ganhos após o pagamento.
    const pontosGanhos = RaizesUtils.calcularPontosGanhos(total);

    pontosGanhosElemento.textContent =
        "Você poderá ganhar " +
        pontosGanhos +
        " pontos se o pagamento for aprovado.";

    /* Atualiza a explicação sobre o uso dos pontos. */

    if (campoUsarPontos.checked) {

        if (!AuthRaizes.estaLogado()) {

            avisoPontos.textContent =
                "Entre na sua conta para consultar e utilizar seus pontos.";

        } else if (pontosUsados > 0) {

            avisoPontos.textContent =
                "Você utilizará " +
                pontosUsados +
                " pontos e terá " +
                formatarMoeda(desconto) +
                " de desconto. O resgate será confirmado após o pagamento aprovado.";

        } else if (RaizesUtils.obterSaldoPontos() < 100) {

            avisoPontos.textContent =
                "Você precisa de pelo menos 100 pontos para resgatar R$ 5,00.";

        } else {

            avisoPontos.textContent =
                "O valor do pedido não permite aplicar o resgate mínimo de 100 pontos.";
        }

    } else {

        avisoPontos.textContent =
            "A cada R$ 1,00 efetivamente pago, você ganha 1 ponto. " +
            "A cada 100 pontos, pode obter R$ 5,00 de desconto.";
    }

    // Retorna os valores para serem utilizados no pagamento.
    return {
        subtotal: subtotal,
        frete: frete,
        desconto: desconto,
        total: total,
        pontosUsados: pontosUsados,
        pontosEstimados: pontosGanhos
    };
}


/* =========================================
   7. ATUALIZAR O TOTAL AO USAR PONTOS
========================================= */

campoUsarPontos.addEventListener("change", function () {

    // Para usar pontos, o cliente precisa estar conectado.
    if (
        campoUsarPontos.checked &&
        !AuthRaizes.estaLogado()
    ) {

        campoUsarPontos.checked = false;

        avisoPontos.textContent =
            "Entre na sua conta para consultar e utilizar seus pontos.";

        return;
    }

    // Atualiza o desconto, o total e os pontos estimados.
    calcularValores();
});


/* =========================================
   8. CONSULTAR A FIDELIDADE
========================================= */

linkFidelidade.addEventListener("click", function (evento) {

    evento.preventDefault();

    // Se estiver conectado, abre a página de fidelidade.
    if (AuthRaizes.estaLogado()) {

        window.location.href = "fidelidade.html";

    } else {

        // Solicita login antes de abrir a fidelidade.
        AuthRaizes.pedirLogin("fidelidade.html");
    }
});


/* =========================================
   9. CONTINUAR PARA O PAGAMENTO
========================================= */

botaoFinalizar.addEventListener("click", function () {

    mensagemFinal.textContent = "";

    // Não permite finalizar com o carrinho vazio.
    if (carrinho.length === 0) {

        mensagemFinal.textContent =
            "Adicione produtos antes de finalizar o pedido.";

        return;
    }

    // Confirma se uma unidade foi escolhida.
    if (!unidade || !unidade.nome || !unidade.endereco) {

        mensagemFinal.textContent =
            "Escolha uma unidade antes de continuar.";

        return;
    }

    // Calcula novamente os valores antes de prosseguir.
    const valores = calcularValores();

    // Monta o objeto com os dados da revisão.
    const pedidoRevisado = {

        checkoutId: "checkout-" + Date.now(),

        unidade: unidade,

        itens: carrinho,

        subtotal: valores.subtotal,

        frete: valores.frete,

        desconto: valores.desconto,

        total: valores.total,

        pontosUsados: valores.pontosUsados,

        pontosEstimados: valores.pontosEstimados
    };

    try {

        // Salva a revisão para a tela de pagamento.
        sessionStorage.setItem(
            "pedidoEmRevisao",
            JSON.stringify(pedidoRevisado)
        );

        // Remove um resultado anterior de pagamento simulado.
        sessionStorage.removeItem(
            "resultadoPagamentoSimulado"
        );

    } catch (erro) {

        console.error(
            "Não foi possível salvar a revisão do pedido:",
            erro
        );

        mensagemFinal.textContent =
            "Não foi possível preparar o pedido. Tente novamente.";

        return;
    }

    // O cliente precisa estar conectado para continuar.
    if (!AuthRaizes.estaLogado()) {

        AuthRaizes.pedirLogin("pagamento.html");

        return;
    }

    // Encaminha o cliente para a tela de pagamento.
    window.location.href = "pagamento.html";
});


/* =========================================
   10. INICIALIZAÇÃO
========================================= */

// Mostra a unidade selecionada.
mostrarUnidade();

// Mostra os produtos do carrinho.
mostrarItens();

// Calcula os valores iniciais.
calcularValores();

// Garante que o botão respeite as condições iniciais.
if (carrinho.length === 0 || !unidade) {
    botaoFinalizar.disabled = true;
}