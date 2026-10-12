
// =========================================
// 1. LOCALIZAR OS ELEMENTOS DO HTML
// =========================================

const formulario = document.getElementById("form-cadastro");

const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoTelefone = document.getElementById("telefone");
const campoSenha = document.getElementById("senha");

const campoConfirmarSenha =
    document.getElementById("confirmar-senha");

const campoAceite = document.getElementById("aceitar-politica");

const mensagem = document.getElementById("mensagem-cadastro");
const linkPolitica = document.getElementById("link-politica");

// =========================================
// 2. VALIDAR O TELEFONE
// =========================================

function telefoneValido(telefone) {

    // Remove espaços, parênteses, traços e outros símbolos.
    const numeros = telefone.replace(/\D/g, "");

    // Aceita números com DDD, com ou sem código do país.
    return numeros.length >= 10 && numeros.length <= 13;
}

// =========================================
// 3. VALIDAR O FORMULÁRIO
// =========================================

formulario.addEventListener("submit", function (evento) {

    // Impede o recarregamento da página.
    evento.preventDefault();

    // Limpa mensagens anteriores.
    mensagem.textContent = "";

    // Recupera os valores preenchidos.
    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const telefone = campoTelefone.value.trim();
    const senha = campoSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;

    // -----------------------------------------
    // Validar o nome
    // -----------------------------------------

    if (nome.length < 3) {

        mensagem.textContent =
            "Digite seu nome completo.";

        campoNome.focus();
        return;
    }

    // -----------------------------------------
    // Validar o e-mail
    // -----------------------------------------

    if (email === "") {

        mensagem.textContent =
            "Digite seu e-mail.";

        campoEmail.focus();
        return;
    }

    // -----------------------------------------
    // Validar o telefone
    // -----------------------------------------

    if (!telefoneValido(telefone)) {

        mensagem.textContent =
            "Digite um telefone válido com DDD.";

        campoTelefone.focus();
        return;
    }

    // -----------------------------------------
    // Validar o tamanho da senha
    // -----------------------------------------

    if (senha.length < 8) {

        mensagem.textContent =
            "A senha precisa ter pelo menos 8 caracteres.";

        campoSenha.focus();
        return;
    }

    // -----------------------------------------
    // Confirmar a senha
    // -----------------------------------------

    if (senha !== confirmarSenha) {

        mensagem.textContent =
            "As senhas não coincidem. Confira os campos.";

        campoConfirmarSenha.focus();
        return;
    }

    // -----------------------------------------
    // Verificar o aceite da política
    // -----------------------------------------

    if (!campoAceite.checked) {

        mensagem.textContent =
            "Você precisa concordar com a Política de Privacidade.";

        campoAceite.focus();
        return;
    }

    // =========================================
    // 4. CADASTRO DEMONSTRATIVO
    // =========================================

    /*
     * O projeto ainda não possui um servidor ou banco
     * de dados para cadastrar contas reais.
     *
     * Por isso, criamos apenas uma sessão demonstrativa.
     * A senha nunca é salva no navegador.
     */

    AuthRaizes.entrarDemo({
        nome: nome,
        email: email,
        telefone: telefone
    });

    // Continua o fluxo que solicitou o cadastro.
    // Se não houver destino anterior, abre o cardápio.
    AuthRaizes.continuarDepoisLogin("cardapio.html");
});


// =========================================
// 5. LINK DA POLÍTICA DE PRIVACIDADE
// =========================================

linkPolitica.addEventListener("click", function (evento) {

    // Impede que o link abra um endereço inexistente.
    evento.preventDefault();

    // Exibe um aviso sobre o uso dos dados pessoais.
    alert(
        "PRIVACIDADE DOS SEUS DADOS\n\n" +

        "No cadastro, solicitamos seu nome, e-mail, " +
        "telefone e senha.\n\n" +

        "Esses dados são utilizados para criar sua conta, " +
        "identificar você e facilitar o acompanhamento " +
        "dos seus pedidos.\n\n" +

        "O tratamento dos dados deve respeitar a Lei Geral " +
        "de Proteção de Dados (LGPD), com medidas para " +
        "proteger suas informações e limitar seu uso " +
        "às finalidades informadas."
    );
});

