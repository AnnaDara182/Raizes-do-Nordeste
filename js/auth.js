
/* =========================================
   AUTENTICAÇÃO DEMONSTRATIVA DO PROJETO

   Este arquivo simula o login no navegador.
   Não verifica senhas reais e não substitui um backend.

   Importante:
   - Nunca armazenamos senhas.
   - Os dados ficam somente no navegador.
   - Esta autenticação serve apenas para o protótipo.
========================================= */

(function () {

    /* =========================================
       1. CONFIGURAÇÕES
    ========================================= */

    // Chave que identifica o cliente conectado.
    const CHAVE_CLIENTE = "clienteLogadoRaizes";

    // Chave que guarda o destino após o login.
    const CHAVE_DESTINO = "destinoAposLoginRaizes";

    // Páginas internas para as quais podemos redirecionar.
    const destinosPermitidos = [
        "index.html",
        "cardapio.html",
        "personalizar.html",
        "carrinho.html",
        "revisao.html",
        "pagamento.html",
        "resultado-pagamento.html",
        "acompanhamento.html",
        "fidelidade.html",
        "perfil.html",
        "cadastro.html"
    ];


    /* =========================================
       2. LER OS DADOS DO CLIENTE
    ========================================= */

    function lerCliente() {
        try {
            const dados = localStorage.getItem(CHAVE_CLIENTE);

            if (!dados) {
                return null;
            }

            const cliente = JSON.parse(dados);

            // Garante que os dados sejam um objeto válido.
            if (
                !cliente ||
                typeof cliente !== "object" ||
                Array.isArray(cliente)
            ) {
                return null;
            }

            return cliente;

        } catch (erro) {
            console.error(
                "Não foi possível recuperar os dados do cliente.",
                erro
            );

            return null;
        }
    }


    /* =========================================
       3. VALIDAR DESTINOS
    ========================================= */

    function destinoValido(destino, destinoPadrao) {

        // Só aceitamos nomes de páginas previamente autorizados.
        if (
            typeof destino === "string" &&
            destinosPermitidos.includes(destino)
        ) {
            return destino;
        }

        // Também validamos o destino padrão recebido.
        if (
            typeof destinoPadrao === "string" &&
            destinosPermitidos.includes(destinoPadrao)
        ) {
            return destinoPadrao;
        }

        // Última alternativa segura.
        return "cardapio.html";
    }


    /* =========================================
       4. DISPONIBILIZAR AS FUNÇÕES DE AUTENTICAÇÃO
    ========================================= */

    window.AuthRaizes = {

        // Verifica se existe um cliente salvo no navegador.
        estaLogado: function () {
            return Boolean(lerCliente());
        },


        // Retorna os dados básicos do cliente, sem senha.
        obterCliente: function () {
            return lerCliente();
        },


        // Salva os dados básicos para simular o login.
        entrarDemo: function (dadosCliente) {

            // Evita erros se a função receber dados inválidos.
            if (
                !dadosCliente ||
                typeof dadosCliente !== "object"
            ) {
                return false;
            }

            const cliente = {
                nome: dadosCliente.nome || "Cliente",
                email: dadosCliente.email || "",
                telefone: dadosCliente.telefone || ""
            };

            try {
                localStorage.setItem(
                    CHAVE_CLIENTE,
                    JSON.stringify(cliente)
                );

                return true;

            } catch (erro) {
                console.error(
                    "Não foi possível salvar os dados do cliente.",
                    erro
                );

                return false;
            }
        },


        // Guarda o destino desejado e abre a tela de login.
        pedirLogin: function (destino) {

            const destinoEscolhido = destinoValido(
                destino,
                "cardapio.html"
            );

            try {
                sessionStorage.setItem(
                    CHAVE_DESTINO,
                    destinoEscolhido
                );
            } catch (erro) {
                console.error(
                    "Não foi possível guardar o destino.",
                    erro
                );
            }

            window.location.href = "login.html";
        },


        // Continua para a página desejada após login ou cadastro.
        continuarDepoisLogin: function (destinoPadrao) {

            let destinoSalvo = null;

            try {
                destinoSalvo = sessionStorage.getItem(CHAVE_DESTINO);
            } catch (erro) {
                console.error(
                    "Não foi possível recuperar o destino.",
                    erro
                );
            }

            const destinoFinal = destinoValido(
                destinoSalvo,
                destinoPadrao || "cardapio.html"
            );

            // Remove o destino temporário para não reutilizá-lo.
            try {
                sessionStorage.removeItem(CHAVE_DESTINO);
            } catch (erro) {
                console.error(
                    "Não foi possível limpar o destino temporário.",
                    erro
                );
            }

            window.location.href = destinoFinal;
        },


        // Encerra a sessão demonstrativa.
        sair: function () {

            try {
                localStorage.removeItem(CHAVE_CLIENTE);
                sessionStorage.removeItem(CHAVE_DESTINO);

            } catch (erro) {
                console.error(
                    "Não foi possível limpar os dados da sessão.",
                    erro
                );
            }
        }

    };

})();
