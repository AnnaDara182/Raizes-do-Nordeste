/* =========================================
   1. VERIFICAR O LOGIN
========================================= */

// A fidelidade é uma área exclusiva do cliente conectado.

if (!AuthRaizes.estaLogado()) {

    // Após o login, o cliente poderá voltar para esta página.
    AuthRaizes.pedirLogin("fidelidade.html");

} else {

    /* =========================================
       2. ELEMENTOS DA PÁGINA
    ========================================= */

    const elementoSaldo = document.getElementById("saldo-pontos");
    const botaoUsarPontos = document.getElementById("botao-usar-pontos");
    const mensagem = document.getElementById("mensagem-fidelidade");

    /* =========================================
       3. MOSTRAR O SALDO DO CLIENTE
    ========================================= */

    function mostrarSaldo() {

        // Recupera o saldo usando a função compartilhada.
        const saldo = Number(RaizesUtils.obterSaldoPontos()) || 0;

        // Exibe o saldo sem alterar as regras de fidelidade.
        if (elementoSaldo) {
            elementoSaldo.textContent = Math.max(0, saldo);
        }
    }

    // Mostra o saldo assim que a página abre.
    mostrarSaldo();

    /* =========================================
       4. EXPLICAR COMO USAR OS PONTOS
    ========================================= */

    if (botaoUsarPontos && mensagem) {

        botaoUsarPontos.addEventListener("click", function () {

            const saldo = Number(RaizesUtils.obterSaldoPontos()) || 0;

            // O protótipo exige pelo menos 100 pontos para resgatar.
            if (saldo < 100) {

                mensagem.textContent =
                    "Você tem " + saldo +
                    " pontos. Acumule pelo menos 100 pontos " +
                    "para obter R$ 5,00 de desconto.";

                return;
            }

            // O botão orienta o cliente sobre a próxima etapa.
            // O desconto é efetivamente aplicado na revisão do pedido.
            mensagem.textContent =
                "Você tem " + saldo +
                " pontos disponíveis! Para utilizá-los, adicione " +
                "produtos ao carrinho e marque a opção " +
                "\"Usar meus pontos\" na revisão do pedido.";
        });
    }

    /* =========================================
       5. ATUALIZAR O SALDO ENTRE ABAS
    ========================================= */

    window.addEventListener("storage", function (evento) {

        // Atualiza o saldo se a chave de pontos desta conta mudar.
        if (
            evento.key === RaizesUtils.obterChavePontos()
        ) {
            mostrarSaldo();
        }
    });
}