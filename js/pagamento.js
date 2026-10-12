
/* =========================================
   1. LOCALIZAR OS ELEMENTOS DA PÁGINA
========================================= */

// Botão que inicia a simulação.
const botaoContinuar = document.getElementById(
    "continuar-pagamento"
);

// Campo onde o usuário escolhe o resultado.
const campoResultado = document.getElementById(
    "resultado-pagamento"
);

/* =========================================
   2. VERIFICAR O LOGIN
========================================= */

// A etapa de pagamento exige que o cliente esteja conectado.
if (!AuthRaizes.estaLogado()) {
    AuthRaizes.pedirLogin("pagamento.html");

} else if (botaoContinuar && campoResultado) {

    /* =========================================
       3. INICIAR A SIMULAÇÃO
    ========================================= */

    botaoContinuar.addEventListener("click", function () {

        // Evita iniciar a simulação várias vezes.
        botaoContinuar.disabled = true;
        campoResultado.disabled = true;
        botaoContinuar.textContent = "Processando...";

        // Recupera a opção escolhida na tela.
        const resultadoEscolhido = campoResultado.value;

        // Confere se o resultado pertence às opções permitidas.
        const resultadosPermitidos = [
            "aprovado",
            "recusado",
            "indisponivel"
        ];

        if (!resultadosPermitidos.includes(resultadoEscolhido)) {
            alert("Selecione um resultado válido para a simulação.");

            botaoContinuar.disabled = false;
            campoResultado.disabled = false;
            botaoContinuar.textContent = "Simular pagamento";

            return;
        }

        // Guarda o resultado para a próxima página.
        sessionStorage.setItem(
            "resultadoPagamentoSimulado",
            resultadoEscolhido
        );

        // Abre a tela que apresenta o resultado.
        window.location.href = "resultado-pagamento.html";
    });
}
