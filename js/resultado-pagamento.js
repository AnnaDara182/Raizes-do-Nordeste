/* =========================================
   1. VERIFICAR O LOGIN
========================================= */

// Somente clientes conectados podem acessar o resultado.
if (!AuthRaizes.estaLogado()) {

    AuthRaizes.pedirLogin("resultado-pagamento.html");

} else {

    /* =========================================
       2. RECUPERAR O RESULTADO DO PAGAMENTO
    ========================================= */

    const resultadoSalvo = sessionStorage.getItem(
        "resultadoPagamentoSimulado"
    );

    let pedidoRevisado = null;

    try {

        pedidoRevisado = JSON.parse(
            sessionStorage.getItem("pedidoEmRevisao") || "null"
        );

    } catch (erro) {

        console.error("Erro ao recuperar a revisão:", erro);
        pedidoRevisado = null;
    }

    // Identifica o resultado informado pela tela de pagamento.
    let statusPagamento = resultadoSalvo || "indisponivel";

    // Só aceita os resultados previstos no protótipo.
    const resultadosPermitidos = [
        "aprovado",
        "recusado",
        "indisponivel"
    ];

    if (!resultadosPermitidos.includes(statusPagamento)) {
        statusPagamento = "indisponivel";
    }

    // Sem um checkout válido, não podemos confirmar o pedido.
    if (
        !pedidoRevisado ||
        !pedidoRevisado.checkoutId ||
        !Array.isArray(pedidoRevisado.itens) ||
        pedidoRevisado.itens.length === 0
    ) {
        statusPagamento = "indisponivel";
    }


    /* =========================================
       3. ELEMENTOS DO HTML
    ========================================= */

    const icone = document.getElementById("icone-resultado");
    const titulo = document.getElementById("titulo-resultado");
    const subtitulo = document.getElementById("subtitulo-resultado");

    const dadosPedido = document.getElementById("dados-pedido");
    const numeroPedido = document.getElementById("numero-pedido");
    const senhaRetirada = document.getElementById("senha-retirada");

    const detalhe = document.getElementById("detalhe-resultado");
    const botaoResultado = document.getElementById("botao-resultado");


    /* =========================================
       4. LER OS PEDIDOS SALVOS
    ========================================= */

    function lerPedidos() {

        try {

            const pedidos = JSON.parse(
                localStorage.getItem("pedidosRaizes") || "[]"
            );

            return Array.isArray(pedidos) ? pedidos : [];

        } catch (erro) {

            console.error("Erro ao recuperar os pedidos:", erro);
            return [];
        }
    }


    /* =========================================
       5. SALVAR OS PEDIDOS
    ========================================= */

    function salvarPedidos(pedidos) {

        try {

            localStorage.setItem(
                "pedidosRaizes",
                JSON.stringify(pedidos)
            );

            return true;

        } catch (erro) {

            console.error("Erro ao salvar os pedidos:", erro);
            return false;
        }
    }


    /* =========================================
       6. CRIAR O PEDIDO APROVADO
    ========================================= */

    function confirmarPedido() {

        const pedidos = lerPedidos();

        // Evita criar um segundo pedido para o mesmo checkout.
        const pedidoExistente = pedidos.find(function (pedido) {

            return pedido.checkoutId === pedidoRevisado.checkoutId;

        });

        if (pedidoExistente) {

            // Reutiliza o pedido já criado.
            sessionStorage.setItem(
                "pedidoConfirmado",
                JSON.stringify(pedidoExistente)
            );

            return pedidoExistente;
        }


        /* -----------------------------------------
           6.1. GERAR NÚMERO E SENHA
        ----------------------------------------- */

        let proximoNumero = 2156;

        try {

            const numeroSalvo = Number(
                localStorage.getItem("proximoNumeroPedidoRaizes")
            );

            if (Number.isFinite(numeroSalvo) && numeroSalvo >= 1) {
                proximoNumero = Math.floor(numeroSalvo);
            }

        } catch (erro) {

            console.error("Erro ao ler o número do pedido:", erro);
        }


        /* -----------------------------------------
           6.2. MONTAR O PEDIDO
        ----------------------------------------- */

        const novoPedido = {

            checkoutId: pedidoRevisado.checkoutId,

            numero: String(proximoNumero),

            senha: String(
                Math.floor(100 + Math.random() * 900)
            ),

            status: "aguardando",

            unidade: pedidoRevisado.unidade,

            itens: pedidoRevisado.itens,

            subtotal: Number(pedidoRevisado.subtotal) || 0,

            frete: Number(pedidoRevisado.frete) || 0,

            desconto: Number(pedidoRevisado.desconto) || 0,

            total: Number(pedidoRevisado.total) || 0,

            pontosUsados: Number(pedidoRevisado.pontosUsados) || 0,

            pontosGanhos: Number(pedidoRevisado.pontosEstimados) || 0,

            criadoEm: new Date().toISOString()
        };


        /* -----------------------------------------
           6.3. SALVAR O PEDIDO
        ----------------------------------------- */

        pedidos.push(novoPedido);

        // Não continua se não conseguir salvar o pedido.
        if (!salvarPedidos(pedidos)) {

            throw new Error(
                "Não foi possível salvar o pedido."
            );
        }


        /* -----------------------------------------
           6.4. ATUALIZAR O PRÓXIMO NÚMERO
        ----------------------------------------- */

        try {

            localStorage.setItem(
                "proximoNumeroPedidoRaizes",
                String(proximoNumero + 1)
            );

        } catch (erro) {

            console.error(
                "Não foi possível atualizar a numeração:",
                erro
            );
        }


        /* -----------------------------------------
           6.5. ATUALIZAR A FIDELIDADE
        ----------------------------------------- */

        // Os pontos só são atualizados após a aprovação.
        const saldoAtual = RaizesUtils.obterSaldoPontos();

        // Subtrai os pontos utilizados e acrescenta os ganhos.
        const novoSaldo = Math.max(
            0,
            saldoAtual -
            novoPedido.pontosUsados +
            novoPedido.pontosGanhos
        );

        RaizesUtils.salvarSaldoPontos(novoSaldo);


        /* -----------------------------------------
           6.6. GUARDAR O PEDIDO CONFIRMADO
        ----------------------------------------- */

        sessionStorage.setItem(
            "pedidoConfirmado",
            JSON.stringify(novoPedido)
        );


        /* -----------------------------------------
           6.7. ESVAZIAR O CARRINHO
        ----------------------------------------- */

        // O carrinho só é esvaziado após a aprovação.
        localStorage.setItem("carrinhoRaizes", "[]");

        return novoPedido;
    }


    /* =========================================
       7. MOSTRAR O RESULTADO
    ========================================= */

    function mostrarResultado() {

        // Esconde os dados do pedido por padrão.
        dadosPedido.hidden = true;

        if (statusPagamento === "aprovado") {

            let pedido;

            try {

                pedido = confirmarPedido();

            } catch (erro) {

                console.error(
                    "Não foi possível confirmar o pedido:",
                    erro
                );

                // Não apresenta uma confirmação falsa.
                icone.textContent = "!";
                icone.className =
                    "icone-resultado indisponivel";

                titulo.textContent =
                    "Não foi possível confirmar o pedido";

                subtitulo.textContent =
                    "Ocorreu um problema ao salvar os dados.";

                detalhe.textContent =
                    "Verifique seus pedidos antes de tentar novamente. " +
                    "Evite realizar outra tentativa de pagamento sem conferir o resultado.";

                botaoResultado.textContent =
                    "Verificar pedido";

                return;
            }

            // Resultado aprovado.
            icone.textContent = "✓";
            icone.className = "icone-resultado";

            titulo.textContent = "Pagamento aprovado!";

            subtitulo.textContent =
                "Seu pedido foi confirmado com sucesso.";

            numeroPedido.textContent = "#" + pedido.numero;

            senhaRetirada.textContent = "#" + pedido.senha;

            dadosPedido.hidden = false;

            detalhe.textContent =
                "Guarde o número do pedido e a senha para acompanhar " +
                "o preparo e retirar seu pedido na unidade selecionada.";

            botaoResultado.textContent =
                "Acompanhar pedido";


        } else if (statusPagamento === "recusado") {

            // Resultado recusado.
            icone.textContent = "×";
            icone.className =
                "icone-resultado recusado";

            titulo.textContent = "Pagamento recusado";

            subtitulo.textContent =
                "O pagamento não foi aprovado.";

            detalhe.textContent =
                "Seu carrinho foi mantido. Você pode voltar à revisão " +
                "e tentar novamente.";

            botaoResultado.textContent =
                "Voltar à revisão";


        } else {

            // Resultado indisponível ou checkout inválido.
            icone.textContent = "!";
            icone.className =
                "icone-resultado indisponivel";

            titulo.textContent =
                "Pagamento indisponível";

            subtitulo.textContent =
                "Não foi possível confirmar o resultado do pagamento.";

            detalhe.textContent =
                "Confira os dados do pedido antes de iniciar outra tentativa.";

            botaoResultado.textContent =
                "Voltar à revisão";
        }
    }


    /* =========================================
       8. AÇÃO DO BOTÃO PRINCIPAL
    ========================================= */

    botaoResultado.addEventListener("click", function () {

        if (statusPagamento === "aprovado") {

            // Abre o acompanhamento do pedido.
            window.location.href = "acompanhamento.html";

        } else {

            // Permite revisar o pedido novamente.
            window.location.href = "revisao.html";
        }
    });


    /* =========================================
       9. INICIALIZAÇÃO
    ========================================= */

    mostrarResultado();

}