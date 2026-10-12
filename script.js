/* =========================================
   1. DADOS DAS UNIDADES
========================================= */

// Unidades disponíveis no protótipo.
// No futuro, esses dados poderiam vir de um banco de dados.

const unidades = [
    {
        id: 1,
        nome: "Unidade 1",
        endereco: "Rua um, 120 - Centro"
    },
    {
        id: 2,
        nome: "Unidade 2",
        endereco: "Rua dois, 10 - Centro"
    }
];

/* =========================================
   2. RECUPERAR A UNIDADE SALVA
========================================= */

// Guarda o identificador da unidade selecionada.
// O valor inicial null significa que nenhuma unidade
// está selecionada.

let unidadeSelecionada = null;

try {
    const unidadeSalva = JSON.parse(
        localStorage.getItem("unidadeRaizes") || "null"
    );

    // Confere se a unidade salva ainda existe na lista.
    if (
        unidadeSalva &&
        unidades.some(function (unidade) {
            return unidade.id === unidadeSalva.id;
        })
    ) {
        unidadeSelecionada = unidadeSalva.id;
    }
} catch (erro) {
    // Se os dados estiverem inválidos, inicia sem seleção.
    unidadeSelecionada = null;
}

/* =========================================
   3. ELEMENTOS DA PÁGINA
========================================= */

// Recupera os elementos do index.html.

const listaUnidades = document.getElementById("lista-unidades");
const campoBusca = document.getElementById("buscar-unidade");
const botaoConfirmar = document.getElementById("confirmar-unidade");
const mensagemVazia = document.getElementById("mensagem-vazia");

/* =========================================
   4. VERIFICAR OS ELEMENTOS NECESSÁRIOS
========================================= */

// Interrompe a execução se algum elemento essencial
// não existir na página.

if (
    listaUnidades &&
    campoBusca &&
    botaoConfirmar &&
    mensagemVazia
) {

    /* =========================================
       5. MOSTRAR AS UNIDADES
    ========================================= */

    function mostrarUnidades(unidadesParaMostrar) {

        // Limpa a lista antes de criar os cartões novamente.
        listaUnidades.replaceChildren();

        // Mostra uma mensagem quando não há resultados.
        mensagemVazia.hidden = unidadesParaMostrar.length > 0;

        // Cria um cartão para cada unidade encontrada.
        unidadesParaMostrar.forEach(function (unidade) {

            const cartao = document.createElement("article");
            cartao.className = "cartao-unidade";

            // Verifica se esta unidade está selecionada.
            const estaSelecionada =
                unidade.id === unidadeSelecionada;

            // Aplica o destaque visual à unidade selecionada.
            if (estaSelecionada) {
                cartao.classList.add("selecionada");
            }

            // Permite navegar até o cartão pelo teclado.
            cartao.tabIndex = 0;

            // Informa às tecnologias assistivas que o cartão
            // funciona como uma opção de seleção.
            cartao.setAttribute("role", "radio");
            cartao.setAttribute(
                "aria-checked",
                String(estaSelecionada)
            );
            cartao.setAttribute(
                "aria-label",
                unidade.nome + ", " + unidade.endereco
            );

            // Ícone decorativo da unidade.
            const icone = document.createElement("div");
            icone.className = "icone-unidade";
            icone.textContent = "⌖";
            icone.setAttribute("aria-hidden", "true");

            // Área que apresenta as informações da unidade.
            const informacoes = document.createElement("div");
            informacoes.className = "informacoes-unidade";

            const nome = document.createElement("h2");
            nome.textContent = unidade.nome;

            const endereco = document.createElement("p");
            endereco.textContent = unidade.endereco;

            // Insere nome e endereço na área de informações.
            informacoes.append(nome, endereco);

            // Cria o botão de seleção nativo.
            const selecao = document.createElement("input");
            selecao.type = "radio";
            selecao.name = "unidade";
            selecao.className = "selecao-unidade";
            selecao.checked = estaSelecionada;
            selecao.setAttribute(
                "aria-label",
                "Selecionar " + unidade.nome
            );

            // Ao clicar no botão de seleção, atualiza a unidade.
            selecao.addEventListener("change", function () {
                if (selecao.checked) {
                    selecionarUnidade(unidade.id);
                }
            });

            // Clicar no cartão também seleciona a unidade.
            cartao.addEventListener("click", function (evento) {

                // Evita processar novamente o clique no rádio.
                if (evento.target === selecao) {
                    return;
                }

                selecionarUnidade(unidade.id);
            });

            // Permite selecionar o cartão com Enter ou Espaço.
            cartao.addEventListener("keydown", function (evento) {

                // Só executa quando o próprio cartão está em foco.
                if (evento.target !== cartao) {
                    return;
                }

                if (
                    evento.key === "Enter" ||
                    evento.key === " "
                ) {
                    evento.preventDefault();
                    selecionarUnidade(unidade.id);
                }
            });

            // Monta o cartão com todos os seus elementos.
            cartao.append(icone, informacoes, selecao);

            // Adiciona o cartão à lista da página.
            listaUnidades.appendChild(cartao);
        });

        // Só habilita a confirmação quando a seleção é válida.
        botaoConfirmar.disabled = !unidades.some(function (unidade) {
            return unidade.id === unidadeSelecionada;
        });
    }

    /* =========================================
       6. SELECIONAR UMA UNIDADE
    ========================================= */

    function selecionarUnidade(id) {

        // Confere se o identificador pertence a uma unidade válida.
        const unidadeExiste = unidades.some(function (unidade) {
            return unidade.id === id;
        });

        if (!unidadeExiste) {
            return;
        }

        // Atualiza a unidade selecionada.
        unidadeSelecionada = id;

        // Redesenha a lista mantendo a busca atual.
        filtrarUnidades();
    }

    /* =========================================
       7. PESQUISAR UNIDADES
    ========================================= */

    function filtrarUnidades() {

        // Obtém o texto digitado, removendo espaços extras.
        const termo = campoBusca.value
            .trim()
            .toLocaleLowerCase("pt-BR");

        // Mantém apenas as unidades que correspondem à busca.
        const resultado = unidades.filter(function (unidade) {

            const textoUnidade = (
                unidade.nome + " " + unidade.endereco
            ).toLocaleLowerCase("pt-BR");

            return textoUnidade.includes(termo);
        });

        // Atualiza os cartões exibidos.
        mostrarUnidades(resultado);
    }

    // Filtra automaticamente enquanto o usuário digita.
    campoBusca.addEventListener("input", filtrarUnidades);

    /* =========================================
       8. CONFIRMAR A UNIDADE
    ========================================= */

    botaoConfirmar.addEventListener("click", function () {

        // Localiza a unidade selecionada na lista original.
        const unidade = unidades.find(function (item) {
            return item.id === unidadeSelecionada;
        });

        // Não continua se nenhuma unidade válida estiver selecionada.
        if (!unidade) {
            return;
        }

        try {

            // Salva a unidade para que outras páginas do protótipo
            // possam recuperar sua identificação e seu endereço.
            localStorage.setItem(
                "unidadeRaizes",
                JSON.stringify(unidade)
            );

            // Direciona o usuário para o cardápio.
            window.location.href = "cardapio.html";

        } catch (erro) {

            // Informa se o navegador não permitir salvar os dados.
            alert(
                "Não foi possível salvar a unidade selecionada. " +
                "Verifique as configurações do navegador e tente novamente."
            );
        }
    });

    /* =========================================
       9. INICIALIZAÇÃO
    ========================================= */

    // Exibe as unidades assim que a página é carregada.
    mostrarUnidades(unidades);

}