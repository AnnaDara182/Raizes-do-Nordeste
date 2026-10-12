
/* =========================================
   FUNÇÕES COMPARTILHADAS DO PROJETO
========================================= */

window.RaizesUtils = {

    // Formata valores para o padrão de moeda brasileira.
    formatarMoeda: function (valor) {
        const numero = Number(valor);

        return (Number.isFinite(numero) ? numero : 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    },

    // Cria uma chave de pontos específica para cada cliente.
    obterChavePontos: function () {
        const cliente = window.AuthRaizes.obterCliente();

        // Usa e-mail ou telefone para identificar a conta.
        const identificador = cliente.email || cliente.telefone;

        if (!identificador) {
            return null;
        }

        return "pontosRaizes_" + identificador
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "_");
    },

    // Recupera o saldo de pontos do cliente conectado.
    obterSaldoPontos: function () {
        const chave = this.obterChavePontos();

        if (!chave) {
            return 0;
        }

        const saldo = Number(localStorage.getItem(chave));

        return Number.isFinite(saldo) && saldo > 0 ? saldo : 0;
    },

    // Salva o saldo de pontos do cliente conectado.
    salvarSaldoPontos: function (saldo) {
        const chave = this.obterChavePontos();

        if (!chave) {
            return;
        }

        // O saldo deve ser um número inteiro e nunca negativo.
        const saldoValido = Math.max(
            0,
            Math.floor(Number(saldo) || 0)
        );

        localStorage.setItem(chave, String(saldoValido));
    },

    // Converte o valor efetivamente pago em pontos inteiros.
    calcularPontosGanhos: function (valorPago) {
        return Math.floor(Math.max(0, Number(valorPago) || 0));
    },

    // Calcula quantos pontos podem ser resgatados no pedido.
    calcularResgate: function (saldo, subtotal) {

        // Cada bloco de 100 pontos vale R$ 5,00.
        const blocosPorSaldo = Math.floor(saldo / 100);

        // Não permite desconto maior que o subtotal.
        const blocosPorValor = Math.floor(subtotal / 5);

        // Usa o menor limite entre saldo e valor do pedido.
        const blocosPermitidos = Math.min(
            blocosPorSaldo,
            blocosPorValor
        );

        const pontosUsados = blocosPermitidos * 100;
        const desconto = blocosPermitidos * 5;

        return {
            pontosUsados: pontosUsados,
            desconto: desconto
        };
    }
};
