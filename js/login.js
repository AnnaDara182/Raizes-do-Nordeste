
// =========================================
// 1. LOCALIZAR OS ELEMENTOS DO HTML
// =========================================

const formulario = document.getElementById("form-login");

const campoIdentificador =
    document.getElementById("identificador");

const campoSenha =
    document.getElementById("senha");

const botaoMostrarSenha =
    document.getElementById("mostrar-senha");

const mensagemLogin =
    document.getElementById("mensagem-login");

const linkRecuperar =
    document.getElementById("link-recuperar");

// Elementos da recuperação de senha.
const areaRecuperarSenha =
    document.getElementById("area-recuperar-senha");

const formularioRecuperacao =
    document.getElementById("form-recuperar-senha");

const identificadorRecuperacao =
    document.getElementById("identificador-recuperacao");

const novaSenhaRecuperacao =
    document.getElementById("nova-senha-recuperacao");

const confirmarSenhaRecuperacao =
    document.getElementById("confirmar-senha-recuperacao");

const botaoCancelarRecuperacao =
    document.getElementById("botao-cancelar-recuperacao");

const mensagemRecuperacao =
    document.getElementById("mensagem-recuperacao");

// =========================================
// 2. VERIFICAR SE JÁ EXISTE UMA SESSÃO
// =========================================

if (AuthRaizes.estaLogado()) {

    // Se o cliente já estiver conectado, continua o fluxo.
    AuthRaizes.continuarDepoisLogin("cardapio.html");
}

// =========================================
// 3. MOSTRAR OU ESCONDER A SENHA DO LOGIN
// =========================================

botaoMostrarSenha.addEventListener("click", function () {

    const senhaEstaEscondida = campoSenha.type === "password";

    if (senhaEstaEscondida) {

        campoSenha.type = "text";
        botaoMostrarSenha.textContent = "Esconder";

        botaoMostrarSenha.setAttribute(
            "aria-label",
            "Esconder senha"
        );

        botaoMostrarSenha.setAttribute("aria-pressed", "true");

    } else {

        campoSenha.type = "password";
        botaoMostrarSenha.textContent = "Mostrar";

        botaoMostrarSenha.setAttribute(
            "aria-label",
            "Mostrar senha"
        );

        botaoMostrarSenha.setAttribute("aria-pressed", "false");
    }
});

// =========================================
// 4. REALIZAR LOGIN DEMONSTRATIVO
// =========================================

formulario.addEventListener("submit", function (evento) {

    // Impede o recarregamento da página.
    evento.preventDefault();

    const identificador = campoIdentificador.value.trim();
    const senha = campoSenha.value;

    mensagemLogin.textContent = "";

    // Confere se os campos foram preenchidos.
    if (identificador === "" || senha.trim() === "") {

        mensagemLogin.textContent =
            "Preencha seu e-mail ou telefone e sua senha.";

        return;
    }

    /*
     * LOGIN DEMONSTRATIVO:
     * O protótipo não consulta um servidor para validar
     * o cadastro e a senha.
     *
     * Qualquer identificador e senha preenchidos permitem
     * simular a entrada. A senha não é armazenada.
     */

    const nomeDemonstrativo = identificador.includes("@")
        ? identificador.split("@")[0]
        : identificador;

    // Guarda somente os dados básicos do cliente.
    AuthRaizes.entrarDemo({
        nome: nomeDemonstrativo,
        email: identificador.includes("@") ? identificador : "",
        telefone: identificador.includes("@") ? "" : identificador
    });

    // Continua para a página que solicitou o login.
    AuthRaizes.continuarDepoisLogin("cardapio.html");
});

// =========================================
// 5. ABRIR A RECUPERAÇÃO DE SENHA
// =========================================

linkRecuperar.addEventListener("click", function (evento) {

    // Impede que o link navegue para outra página.
    evento.preventDefault();

    // Abre ou fecha a área de recuperação.
    const vaiAbrir = areaRecuperarSenha.hidden;

    areaRecuperarSenha.hidden = !vaiAbrir;

    // Atualiza a informação de acessibilidade do link.
    linkRecuperar.setAttribute(
        "aria-expanded",
        String(vaiAbrir)
    );

    // Limpa mensagens anteriores.
    mensagemRecuperacao.textContent = "";

    if (vaiAbrir) {

        // Preenche o campo com o identificador já digitado,
        // se o cliente tiver informado um no formulário de login.
        identificadorRecuperacao.value =
            campoIdentificador.value.trim();

        // Leva o cursor para o primeiro campo necessário.
        identificadorRecuperacao.focus();

    } else {

        // Limpa os dados quando a área for fechada.
        formularioRecuperacao.reset();
    }
});

// =========================================
// 6. CANCELAR A RECUPERAÇÃO DE SENHA
// =========================================

botaoCancelarRecuperacao.addEventListener("click", function () {

    // Fecha a área de recuperação.
    areaRecuperarSenha.hidden = true;

    // Atualiza o estado do link.
    linkRecuperar.setAttribute("aria-expanded", "false");

    // Limpa os campos e as mensagens.
    formularioRecuperacao.reset();
    mensagemRecuperacao.textContent = "";
});

// =========================================
// 7. SIMULAR A RECUPERAÇÃO DE SENHA
// =========================================

formularioRecuperacao.addEventListener("submit", function (evento) {

    // Impede o recarregamento da página.
    evento.preventDefault();

    // Recupera os valores digitados.
    const identificador = identificadorRecuperacao.value.trim();

    const novaSenha = novaSenhaRecuperacao.value;

    const confirmacao = confirmarSenhaRecuperacao.value;

    // Limpa a mensagem anterior.
    mensagemRecuperacao.textContent = "";

    // Confere se o identificador foi preenchido.
    if (identificador === "") {

        mensagemRecuperacao.textContent =
            "Informe seu e-mail ou telefone.";

        identificadorRecuperacao.focus();

        return;
    }

    // Confere o tamanho mínimo da senha.
    if (novaSenha.length < 8) {

        mensagemRecuperacao.textContent =
            "A nova senha precisa ter pelo menos 8 caracteres.";

        novaSenhaRecuperacao.focus();

        return;
    }

    // Confere se as duas senhas são iguais.
    if (novaSenha !== confirmacao) {

        mensagemRecuperacao.textContent =
            "As senhas não coincidem. Confira os campos.";

        confirmarSenhaRecuperacao.focus();

        return;
    }

    /*
     * SIMULAÇÃO DO PROTÓTIPO:
     *
     * Não existe um servidor para localizar a conta
     * e alterar uma senha real.
     *
     * A validação abaixo demonstra o fluxo visual,
     * mas não modifica credenciais nem armazena a senha.
     */

    mensagemRecuperacao.textContent =
        "Validação concluída! Senha trocada com sucesso." +
        " Você pode fazer login com a nova senha.";

    // Limpa os campos após a simulação.
    formularioRecuperacao.reset();
});
