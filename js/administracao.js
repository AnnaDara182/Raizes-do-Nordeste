
/* =========================================
   1. CONFIGURAÇÕES E FUNÇÕES AUXILIARES
========================================= */

(function () {
    "use strict";

    const CHAVE_PEDIDOS = "pedidosRaizes";
    const CHAVE_ESTOQUE = "estoqueRaizesPorUnidade";
    const CHAVE_CARDAPIO = "cardapioGerenciadoRaizesPorUnidade";
    const CHAVE_PROMOCOES = "promocoesRaizesPorUnidade";
    const CHAVE_REGRAS = "regrasFidelidadeRaizesPorUnidade";

    const UNIDADES = ["Unidade 1", "Unidade 2"];

    const el = id => document.getElementById(id);

    const dinheiro = valor =>
        (Number(valor) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    const ler = (chave, padrao) => {
        try {
            const valor = JSON.parse(localStorage.getItem(chave) || "null");
            return valor == null ? padrao : valor;
        } catch (erro) {
            return padrao;
        }
    };

    const salvar = (chave, valor) =>
        localStorage.setItem(chave, JSON.stringify(valor));

    const pedidos = () => {
        const lista = ler(CHAVE_PEDIDOS, []);
        return Array.isArray(lista) ? lista : [];
    };

    const mensagem = (id, texto) => {
        if (el(id)) {
            el(id).textContent = texto;
        }
    };

    const totalPedido = pedido => {
        const total =
            pedido.total ??
            pedido.totalPedido ??
            pedido.valorTotal ??
            pedido.subtotal;

        if (total !== undefined && total !== null) {
            return Number(total) || 0;
        }

        return Array.isArray(pedido.itens)
            ? pedido.itens.reduce(
                (soma, item) =>
                    soma +
                    (Number(item.preco) || 0) *
                    (Number(item.quantidade) || 1),
                0
            )
            : 0;
    };

    // Aceita o formato atual e versões anteriores dos pedidos.
    function unidadePedido(pedido) {
        const unidade = pedido.unidade;

        const valor =
            typeof unidade === "string" || typeof unidade === "number"
                ? unidade
                : unidade?.nome ||
                  pedido.nomeUnidade ||
                  pedido.unidadeSelecionada ||
                  pedido.unidadeNome ||
                  pedido.filial ||
                  pedido.loja ||
                  pedido.unidadeId ||
                  pedido.idUnidade ||
                  "";

        const nome = String(valor)
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (
            nome === "2" ||
            nome.includes("unidade 2") ||
            nome.includes("unidade2") ||
            nome.includes("unidade dois")
        ) {
            return "Unidade 2";
        }

        if (
            nome === "1" ||
            nome.includes("unidade 1") ||
            nome.includes("unidade1") ||
            nome.includes("unidade um")
        ) {
            return "Unidade 1";
        }

        // Compatibilidade com os nomes usados no formulário antigo do balcão.
        if (nome.includes("centro")) {
            return "Unidade 1";
        }

        if (nome.includes("praia") || nome.includes("continente")) {
            return "Unidade 2";
        }

        return "";
    }

    const statusNome = status => ({
        aguardando: "Aguardando preparação",
        recebido: "Aguardando preparação",
        preparando: "Em preparo",
        pronto: "Pronto para retirada",
        retirado: "Entregue"
    }[status] || status || "Aguardando preparação");

    const pedidosDaUnidade = unidade =>
        pedidos().filter(pedido => unidadePedido(pedido) === unidade);

    // Os dados ficam separados por unidade.
    // Valores antigos são preservados e migrados para a Unidade 1 quando necessário.
    function dadosPorUnidade(chaveNova, chaveAntiga, padrao) {
        let dados = ler(chaveNova, null);

        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            const antigo = ler(chaveAntiga, null);

            dados = {
                "Unidade 1": antigo == null
                    ? structuredClone(padrao)
                    : antigo,
                "Unidade 2": structuredClone(padrao)
            };

            salvar(chaveNova, dados);
        }

        UNIDADES.forEach(unidade => {
            if (dados[unidade] == null) {
                dados[unidade] = structuredClone(padrao);
            }
        });

        return dados;
    }

    function lerDadosUnidade(
        chaveNova,
        chaveAntiga,
        padrao,
        unidade
    ) {
        const dados = dadosPorUnidade(
            chaveNova,
            chaveAntiga,
            padrao
        );

        return Array.isArray(padrao)
            ? (Array.isArray(dados[unidade]) ? dados[unidade] : [])
            : (dados[unidade] || structuredClone(padrao));
    }

    function salvarDadosUnidade(
        chaveNova,
        chaveAntiga,
        padrao,
        unidade,
        valor
    ) {
        const dados = dadosPorUnidade(
            chaveNova,
            chaveAntiga,
            padrao
        );

        dados[unidade] = valor;
        salvar(chaveNova, dados);
    }

    const PADRAO_ESTOQUE = [
        { nome: "Carne de sol", quantidade: 18 },
        { nome: "Moqueca", quantidade: 12 },
        { nome: "Acarajé", quantidade: 20 },
        { nome: "Escondidinho", quantidade: 15 },
        { nome: "Suco natural", quantidade: 24 }
    ];

    const PADRAO_REGRAS = {
        pontosPorReal: 1,
        pontosParaResgate: 100,
        valorDesconto: 5
    };

    function preencherSeletor(select, incluirTodas = false) {
        if (!select) {
            return;
        }

        const valorAtual = select.value;
        select.replaceChildren();

        if (incluirTodas) {
            const opcao = document.createElement("option");
            opcao.value = "todas";
            opcao.textContent = "Todas as unidades";
            select.appendChild(opcao);
        }

        UNIDADES.forEach(unidade => {
            const opcao = document.createElement("option");
            opcao.value = unidade;
            opcao.textContent = unidade;
            select.appendChild(opcao);
        });

        if ([...select.options].some(opcao => opcao.value === valorAtual)) {
            select.value = valorAtual;
        } else {
            select.value = incluirTodas ? "todas" : UNIDADES[0];
        }
    }


    /* =========================================
       2. ATENDENTE
    ========================================= */

    if (el("tabela-atendente")) {
        const seletor = el("unidade-atendente");

        preencherSeletor(seletor);

        let filtroStatus = "todos";

        function renderAtendente() {
            const corpo = el("tabela-atendente");
            corpo.replaceChildren();

            const unidade = seletor?.value || UNIDADES[0];

            const lista = pedidosDaUnidade(unidade)
                .filter(pedido => {
                    const status = pedido.status || "aguardando";

                    return filtroStatus === "todos" ||
                        (
                            filtroStatus === "aguardando"
                                ? ["aguardando", "recebido"].includes(status)
                                : status === filtroStatus
                        );
                })
                .slice()
                .reverse();

            mensagem(
                "vazio-atendente",
                lista.length
                    ? ""
                    : `Nenhum pedido encontrado para ${unidade} neste status.`
            );

            lista.forEach(pedido => {
                const tr = document.createElement("tr");

                [
                    "#" + (pedido.numero ?? pedido.id ?? "—"),
                    pedido.nomeCliente || pedido.cliente || "Cliente",
                    unidadePedido(pedido),
                    dinheiro(totalPedido(pedido)),
                    statusNome(pedido.status),
                    pedido.senhaRetirada || pedido.senha || "—"
                ].forEach(valor => {
                    const td = document.createElement("td");
                    td.textContent = valor;
                    tr.appendChild(td);
                });

                const tdAcao = document.createElement("td");

                if (pedido.status === "pronto") {
                    const botao = document.createElement("button");

                    botao.type = "button";
                    botao.className = "mini-botao";
                    botao.textContent = "Confirmar entrega";

                    botao.addEventListener("click", () => {
                        const numeroPedido = pedido.numero ?? pedido.id;
                        const senha = pedido.senhaRetirada || pedido.senha || "—";

                        if (!window.confirm(
                            `Confirma a entrega do pedido #${numeroPedido}?\n` +
                            `Confira a senha de retirada: ${senha}`
                        )) {
                            return;
                        }

                        const listaAtual = pedidos();

                        const indice = listaAtual.findIndex(item =>
                            String(item.numero ?? item.id) === String(numeroPedido)
                        );

                        if (
                            indice < 0 ||
                            listaAtual[indice].status !== "pronto"
                        ) {
                            mensagem(
                                "mensagem-atendente",
                                "O pedido não está mais pronto para retirada. Atualize a lista."
                            );

                            renderAtendente();
                            return;
                        }

                        listaAtual[indice].status = "retirado";
                        salvar(CHAVE_PEDIDOS, listaAtual);

                        mensagem(
                            "mensagem-atendente",
                            `Pedido #${numeroPedido} marcado como entregue.`
                        );

                        renderAtendente();
                    });

                    tdAcao.appendChild(botao);
                } else {
                    const span = document.createElement("span");

                    span.className = "acao-informativa";
                    span.textContent = pedido.status === "retirado"
                        ? "Pedido entregue"
                        : statusNome(pedido.status);

                    tdAcao.appendChild(span);
                }

                tr.appendChild(tdAcao);
                corpo.appendChild(tr);
            });
        }

        seletor?.addEventListener("change", renderAtendente);

        document.querySelectorAll(".filtro-atendente").forEach(botao => {
            botao.addEventListener("click", () => {
                filtroStatus = botao.dataset.filtro;

                document.querySelectorAll(".filtro-atendente").forEach(outro => {
                    const ativo = outro === botao;

                    outro.classList.toggle("ativo", ativo);
                    outro.setAttribute("aria-pressed", String(ativo));
                });

                renderAtendente();
            });
        });

        renderAtendente();

        window.addEventListener("storage", evento => {
            if (evento.key === CHAVE_PEDIDOS) {
                renderAtendente();
            }
        });
    }


    /* =========================================
       3. GERENTE
       Estoque, cardápio, promoções, fidelidade e vendas por unidade
    ========================================= */

    if (el("form-estoque")) {
        const seletor = el("unidade-gerente");

        preencherSeletor(seletor);

        const unidadeAtual = () => seletor?.value || UNIDADES[0];

        const estoque = () =>
            lerDadosUnidade(
                CHAVE_ESTOQUE,
                "estoqueRaizes",
                PADRAO_ESTOQUE,
                unidadeAtual()
            );

        const cardapio = () =>
            lerDadosUnidade(
                CHAVE_CARDAPIO,
                "cardapioGerenciadoRaizes",
                [],
                unidadeAtual()
            );

        const promocoes = () =>
            lerDadosUnidade(
                CHAVE_PROMOCOES,
                "promocoesRaizes",
                [],
                unidadeAtual()
            );

        const regras = () =>
            lerDadosUnidade(
                CHAVE_REGRAS,
                "regrasFidelidadeRaizes",
                PADRAO_REGRAS,
                unidadeAtual()
            );


        // Estoque
        function renderEstoque() {
            const alvo = el("lista-estoque");
            alvo.replaceChildren();

            estoque().forEach((item, indice) => {
                const linha = document.createElement("div");
                linha.className = "linha-produto";

                const texto = document.createElement("span");
                texto.textContent =
                    `${item.nome} — ${item.quantidade} unidades`;

                const acoes = document.createElement("span");
                acoes.className = "acoes-admin";

                [[-1, "Saída"], [1, "Entrada"]].forEach(([delta, rotulo]) => {
                    const botao = document.createElement("button");

                    botao.type = "button";
                    botao.className = "mini-botao";
                    botao.textContent = rotulo;

                    botao.addEventListener("click", () => {
                        const lista = estoque();

                        lista[indice].quantidade = Math.max(
                            0,
                            (Number(lista[indice].quantidade) || 0) + delta
                        );

                        salvarDadosUnidade(
                            CHAVE_ESTOQUE,
                            "estoqueRaizes",
                            PADRAO_ESTOQUE,
                            unidadeAtual(),
                            lista
                        );

                        renderEstoque();
                    });

                    acoes.appendChild(botao);
                });

                linha.append(texto, acoes);
                alvo.appendChild(linha);
            });
        }

        el("form-estoque").addEventListener("submit", evento => {
            evento.preventDefault();

            const nome = el("produto-estoque").value.trim();

            const quantidade = Math.max(
                0,
                Number(el("quantidade-estoque").value) || 0
            );

            if (!nome) {
                return;
            }

            const lista = estoque();

            const existente = lista.find(item =>
                item.nome.toLowerCase() === nome.toLowerCase()
            );

            if (existente) {
                existente.quantidade = quantidade;
            } else {
                lista.push({ nome, quantidade });
            }

            salvarDadosUnidade(
                CHAVE_ESTOQUE,
                "estoqueRaizes",
                PADRAO_ESTOQUE,
                unidadeAtual(),
                lista
            );

            mensagem(
                "mensagem-estoque",
                `Estoque de ${unidadeAtual()} atualizado.`
            );

            el("form-estoque").reset();
            renderEstoque();
        });


        // Cardápio
        function renderCardapio() {
            const alvo = el("lista-cardapio");
            alvo.replaceChildren();

            cardapio().forEach((produto, indice) => {
                const linha = document.createElement("div");
                linha.className = "linha-produto";

                const texto = document.createElement("span");
                texto.textContent =
                    `${produto.nome} — ${dinheiro(produto.preco)} — ` +
                    `${produto.ativo === false ? "Indisponível" : "Disponível"}`;

                const botao = document.createElement("button");

                botao.type = "button";
                botao.className = "mini-botao";
                botao.textContent = produto.ativo === false
                    ? "Ativar"
                    : "Retirar do cardápio";

                botao.addEventListener("click", () => {
                    const lista = cardapio();

                    lista[indice].ativo = lista[indice].ativo === false;

                    salvarDadosUnidade(
                        CHAVE_CARDAPIO,
                        "cardapioGerenciadoRaizes",
                        [],
                        unidadeAtual(),
                        lista
                    );

                    renderCardapio();
                });

                linha.append(texto, botao);
                alvo.appendChild(linha);
            });
        }

        el("form-cardapio").addEventListener("submit", evento => {
            evento.preventDefault();

            const nome = el("nome-produto").value.trim();
            const preco = Number(el("preco-produto").value);

            if (!nome || preco <= 0) {
                return;
            }

            const lista = cardapio();

            lista.push({
                nome,
                preco,
                ativo: true
            });

            salvarDadosUnidade(
                CHAVE_CARDAPIO,
                "cardapioGerenciadoRaizes",
                [],
                unidadeAtual(),
                lista
            );

            el("form-cardapio").reset();

            mensagem(
                "mensagem-cardapio",
                `Produto cadastrado no cardápio de ${unidadeAtual()}.`
            );

            renderCardapio();
        });


        // Promoções
        function renderPromocoes() {
            const alvo = el("lista-promocoes");
            alvo.replaceChildren();

            promocoes().forEach((promocao, indice) => {
                const linha = document.createElement("div");
                linha.className = "linha-produto";

                const texto = document.createElement("span");
                texto.textContent =
                    `${promocao.nome} — ${promocao.desconto}% de desconto — ` +
                    `${promocao.ativa === false ? "Inativa" : "Ativa"}`;

                const botao = document.createElement("button");

                botao.type = "button";
                botao.className = "mini-botao";
                botao.textContent = promocao.ativa === false
                    ? "Ativar"
                    : "Desativar";

                botao.addEventListener("click", () => {
                    const lista = promocoes();

                    lista[indice].ativa = lista[indice].ativa === false;

                    salvarDadosUnidade(
                        CHAVE_PROMOCOES,
                        "promocoesRaizes",
                        [],
                        unidadeAtual(),
                        lista
                    );

                    renderPromocoes();
                });

                linha.append(texto, botao);
                alvo.appendChild(linha);
            });
        }

        el("form-promocao").addEventListener("submit", evento => {
            evento.preventDefault();

            const nome = el("nome-promocao").value.trim();
            const desconto = Number(el("desconto-promocao").value);

            if (!nome || desconto < 1 || desconto > 90) {
                return;
            }

            const lista = promocoes();

            lista.push({
                nome,
                desconto,
                ativa: true
            });

            salvarDadosUnidade(
                CHAVE_PROMOCOES,
                "promocoesRaizes",
                [],
                unidadeAtual(),
                lista
            );

            el("form-promocao").reset();

            mensagem(
                "mensagem-promocao",
                `Promoção cadastrada para ${unidadeAtual()}.`
            );

            renderPromocoes();
        });


        // Regras de fidelidade
        function renderRegras() {
            const regra = regras();

            el("pontos-real").value = regra.pontosPorReal;
            el("pontos-desconto").value = regra.pontosParaResgate;
            el("valor-desconto").value = regra.valorDesconto;
        }

        el("form-fidelidade").addEventListener("submit", evento => {
            evento.preventDefault();

            const regra = {
                pontosPorReal: Number(el("pontos-real").value),
                pontosParaResgate: Number(el("pontos-desconto").value),
                valorDesconto: Number(el("valor-desconto").value)
            };

            salvarDadosUnidade(
                CHAVE_REGRAS,
                "regrasFidelidadeRaizes",
                PADRAO_REGRAS,
                unidadeAtual(),
                regra
            );

            mensagem(
                "mensagem-fidelidade-admin",
                `Regras de fidelidade de ${unidadeAtual()} atualizadas.`
            );
        });


        // Resumo de vendas
        function renderVendas() {
            const lista = pedidosDaUnidade(unidadeAtual());

            el("total-pedidos-gerente").textContent = lista.length;

            el("total-vendas-gerente").textContent = dinheiro(
                lista.reduce(
                    (soma, pedido) => soma + totalPedido(pedido),
                    0
                )
            );
        }

        function renderTudo() {
            renderEstoque();
            renderCardapio();
            renderPromocoes();
            renderRegras();
            renderVendas();
        }

        seletor?.addEventListener("change", renderTudo);

        renderTudo();

        window.addEventListener("storage", evento => {
            if ([
                CHAVE_PEDIDOS,
                CHAVE_ESTOQUE,
                CHAVE_CARDAPIO,
                CHAVE_PROMOCOES,
                CHAVE_REGRAS
            ].includes(evento.key)) {
                renderTudo();
            }
        });
    }


    /* =========================================
       4. MATRIZ
       Visão geral da rede e consulta por unidade
    ========================================= */

    if (el("tabela-vendas-matriz")) {
        const seletor = el("unidade-matriz");

        preencherSeletor(seletor, true);

        function renderMatriz() {
            const todas = pedidos();
            const filtro = seletor?.value || "todas";

            const lista = filtro === "todas"
                ? todas
                : todas.filter(pedido => unidadePedido(pedido) === filtro);

            el("matriz-pedidos").textContent = lista.length;

            el("matriz-vendas").textContent = dinheiro(
                lista.reduce(
                    (soma, pedido) => soma + totalPedido(pedido),
                    0
                )
            );

            el("matriz-preparo").textContent =
                lista.filter(pedido => pedido.status === "preparando").length;

            el("matriz-prontos").textContent =
                lista.filter(pedido => pedido.status === "pronto").length;


            // Resumo de pedidos e vendas por unidade.
            const porUnidade = {
                "Unidade 1": { quantidade: 0, total: 0 },
                "Unidade 2": { quantidade: 0, total: 0 }
            };

            todas.forEach(pedido => {
                const unidade = unidadePedido(pedido);

                if (!porUnidade[unidade]) {
                    return;
                }

                porUnidade[unidade].quantidade++;
                porUnidade[unidade].total += totalPedido(pedido);
            });

            const tabela = el("tabela-vendas-matriz");
            tabela.replaceChildren();

            Object.entries(porUnidade)
                .filter(([unidade]) =>
                    filtro === "todas" || unidade === filtro
                )
                .forEach(([unidade, dados]) => {
                    const tr = document.createElement("tr");

                    [
                        unidade,
                        dados.quantidade,
                        dinheiro(dados.total)
                    ].forEach(valor => {
                        const td = document.createElement("td");
                        td.textContent = valor;
                        tr.appendChild(td);
                    });

                    tabela.appendChild(tr);
                });


            // Estoque por unidade.
            const estoquePorUnidade = dadosPorUnidade(
                CHAVE_ESTOQUE,
                "estoqueRaizes",
                PADRAO_ESTOQUE
            );

            const areaEstoque = el("estoque-matriz");
            areaEstoque.replaceChildren();

            const unidadesEstoque = filtro === "todas"
                ? UNIDADES
                : [filtro];

            unidadesEstoque.forEach(unidade => {
                const titulo = document.createElement("h3");
                titulo.textContent = unidade;
                areaEstoque.appendChild(titulo);

                (estoquePorUnidade[unidade] || []).forEach(item => {
                    const linha = document.createElement("div");

                    linha.className = "linha-produto";
                    linha.textContent =
                        `${item.nome}: ${item.quantidade} unidades`;

                    areaEstoque.appendChild(linha);
                });
            });


            // Ranking dos produtos mais pedidos.
            const contagem = {};

            lista.forEach(pedido => {
                (pedido.itens || []).forEach(item => {
                    const nome = item.nome || "Produto";

                    contagem[nome] =
                        (contagem[nome] || 0) +
                        (Number(item.quantidade) || 1);
                });
            });

            const ranking = Object.entries(contagem)
                .sort((a, b) => b[1] - a[1]);

            const areaProdutos = el("produtos-matriz");
            areaProdutos.replaceChildren();

            if (!ranking.length) {
                areaProdutos.textContent =
                    "Os produtos mais pedidos aparecerão aqui conforme os pedidos forem registrados.";
            } else {
                ranking.forEach(([nome, quantidade]) => {
                    const linha = document.createElement("div");

                    linha.className = "linha-produto";
                    linha.textContent = `${nome}: ${quantidade} unidade(s)`;

                    areaProdutos.appendChild(linha);
                });
            }


            // Operações recentes.
            const tabelaOperacoes = el("operacoes-matriz");
            tabelaOperacoes.replaceChildren();

            lista.slice()
                .reverse()
                .slice(0, 12)
                .forEach(pedido => {
                    const tr = document.createElement("tr");

                    [
                        "#" + (pedido.numero ?? pedido.id ?? "—"),
                        unidadePedido(pedido) || "Unidade não identificada",
                        statusNome(pedido.status),
                        dinheiro(totalPedido(pedido))
                    ].forEach(valor => {
                        const td = document.createElement("td");
                        td.textContent = valor;
                        tr.appendChild(td);
                    });

                    tabelaOperacoes.appendChild(tr);
                });

            if (!lista.length) {
                const tr = document.createElement("tr");
                const td = document.createElement("td");

                td.colSpan = 4;
                td.textContent = "Não há operações para esta seleção.";

                tr.appendChild(td);
                tabelaOperacoes.appendChild(tr);
            }


            // Resumo de promoções ativas e regras de fidelidade.
            const promoPorUnidade = dadosPorUnidade(
                CHAVE_PROMOCOES,
                "promocoesRaizes",
                []
            );

            const regrasPorUnidade = dadosPorUnidade(
                CHAVE_REGRAS,
                "regrasFidelidadeRaizes",
                PADRAO_REGRAS
            );

            const unidadesResumo = filtro === "todas"
                ? UNIDADES
                : [filtro];

            el("quantidade-promocoes-matriz").textContent =
                unidadesResumo.reduce(
                    (soma, unidade) =>
                        soma +
                        (promoPorUnidade[unidade] || [])
                            .filter(promocao => promocao.ativa !== false).length,
                    0
                );

            const resumoRegras = unidadesResumo.map(unidade => {
                const regra = regrasPorUnidade[unidade] || PADRAO_REGRAS;

                return (
                    `${unidade}: ${regra.pontosPorReal} ponto(s) por R$ 1,00; ` +
                    `${regra.pontosParaResgate} pontos = ${dinheiro(regra.valorDesconto)}`
                );
            });

            el("regra-fidelidade-matriz").textContent =
                resumoRegras.join(" | ");
        }

        seletor?.addEventListener("change", renderMatriz);

        renderMatriz();

        window.addEventListener("storage", evento => {
            if ([
                CHAVE_PEDIDOS,
                CHAVE_ESTOQUE,
                CHAVE_CARDAPIO,
                CHAVE_PROMOCOES,
                CHAVE_REGRAS
            ].includes(evento.key)) {
                renderMatriz();
            }
        });
    }
})();
