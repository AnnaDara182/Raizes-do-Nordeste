
// =========================================
// 1. VERIFICAR SE O CLIENTE ESTÁ LOGADO
// =========================================

// O perfil só pode ser acessado com uma sessão ativa.
if (!AuthRaizes.estaLogado()) {

    // Depois do login, o cliente será direcionado ao perfil.
    AuthRaizes.pedirLogin("perfil.html");

} else {

    // =========================================
    // 2. MOSTRAR OS DADOS DO CLIENTE
    // =========================================

    const cliente = AuthRaizes.obterCliente();

    const nomeCliente = document.getElementById("nome-cliente");
    const emailCliente = document.getElementById("email-cliente");

    // Preenche os dados disponíveis na sessão.
    nomeCliente.textContent = cliente.nome || "Cliente";

    emailCliente.textContent =
        cliente.email || cliente.telefone || "Contato não informado";

    // =========================================
    // 3. LOCALIZAR OS ELEMENTOS DA PÁGINA
    // =========================================

    const botaoSair = document.getElementById("botao-sair");
    const botaoExcluir = document.getElementById("botao-excluir-conta");

    const botaoAlterarSenha =
        document.getElementById("botao-alterar-senha");

    const areaAlterarSenha =
        document.getElementById("area-alterar-senha");

    const formularioSenha =
        document.getElementById("form-alterar-senha");

    const novaSenha = document.getElementById("nova-senha");

    const confirmarNovaSenha =
        document.getElementById("confirmar-nova-senha");

    const botaoCancelarSenha =
        document.getElementById("botao-cancelar-senha");

    const mensagemSenha = document.getElementById("mensagem-senha");

    // =========================================
    // 4. ABRIR E FECHAR A ÁREA DE SENHA
    // =========================================

    botaoAlterarSenha.addEventListener("click", function () {

        // Inverte o estado atual da área.
        const vaiAbrir = areaAlterarSenha.hidden;

        areaAlterarSenha.hidden = !vaiAbrir;

        // Atualiza o estado do botão para acessibilidade.
        botaoAlterarSenha.setAttribute(
            "aria-expanded",
            String(vaiAbrir)
        );

        // Limpa a mensagem anterior.
        mensagemSenha.textContent = "";

        if (vaiAbrir) {
            novaSenha.focus();
        } else {
            formularioSenha.reset();
        }
    });

    // =========================================
    // 5. CANCELAR A ALTERAÇÃO DE SENHA
    // =========================================

    botaoCancelarSenha.addEventListener("click", function () {

        // Fecha a área e limpa os campos.
        areaAlterarSenha.hidden = true;
        formularioSenha.reset();

        // Atualiza o estado do botão.
        botaoAlterarSenha.setAttribute("aria-expanded", "false");

        // Limpa mensagens antigas.
        mensagemSenha.textContent = "";
    });

    // =========================================
    // 6.  ALTERAÇÃO DE SENHA
    // =========================================

    formularioSenha.addEventListener("submit", function (evento) {

        // Impede o recarregamento da página.
        evento.preventDefault();

        const senha = novaSenha.value;
        const confirmacao = confirmarNovaSenha.value;

        // Confere se a senha tem pelo menos 8 caracteres.
        if (senha.length < 8) {
            mensagemSenha.textContent =
                "A senha precisa ter pelo menos 8 caracteres.";
            return;
        }

        // Confere se os campos são iguais.
        if (senha !== confirmacao) {
            mensagemSenha.textContent =
                "As senhas não coincidem. Confira os campos.";
            return;
        }

        mensagemSenha.textContent =
            "Validação concluída! Sua senha foi alterada com sucesso.";

        // Limpa os campos após a validação.
        formularioSenha.reset();
    });

    // =========================================
    // 7. SAIR DA CONTA
    // =========================================

    botaoSair.addEventListener("click", function () {

        const confirmou = confirm(
            "Deseja realmente sair da sua conta?"
        );

        if (!confirmou) {
            return;
        }

        // Encerra a sessão usando a função compartilhada.
        AuthRaizes.sair();

        alert("Você saiu da sua conta com sucesso!");

        // Volta para a página inicial.
        window.location.href = "index.html";
    });

    // =========================================
    // 8. SIMULAR A EXCLUSÃO DA CONTA
    // =========================================

    botaoExcluir.addEventListener("click", function () {

        const confirmou = confirm(
            "Tem certeza de que deseja excluir sua conta? " +
            "Esta ação encerrará sua sessão."
        );

        if (!confirmou) {
            return;
        }

        AuthRaizes.sair();

        alert(
            "A sessão foi encerrada. " +
            "A exclusão da conta foi realizada com sucesso."
        );

        window.location.href = "index.html";
    });

}
