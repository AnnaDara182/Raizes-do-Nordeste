/* =========================================
   FUNCIONALIDADES ADMINISTRATIVAS
   Raízes do Nordeste
   Dados separados por unidade
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
    const dinheiro = valor => (Number(valor) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const ler = (chave, padrao) => {
        try {
            const valor = JSON.parse(localStorage.getItem(chave) || "null");
            return valor == null ? padrao : valor;
        } catch (erro) { return padrao; }
    };
    const salvar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));
    const pedidos = () => { const lista = ler(CHAVE_PEDIDOS, []); return Array.isArray(lista) ? lista : []; };
    const mensagem = (id, texto) => { if (el(id)) el(id).textContent = texto; };
    const totalPedido = pedido => {
        const total = pedido.total ?? pedido.totalPedido ?? pedido.valorTotal ?? pedido.subtotal;
        if (total !== undefined && total !== null) return Number(total) || 0;
        return Array.isArray(pedido.itens) ? pedido.itens.reduce((s, i) => s + (Number(i.preco) || 0) * (Number(i.quantidade) || 1), 0) : 0;
    };

    // Aceita o formato atual (objeto com nome) e versões anteriores.
    function unidadePedido(pedido) {
        const unidade = pedido.unidade;
        const valor = (typeof unidade === "string" || typeof unidade === "number")
            ? unidade
            : unidade?.nome || pedido.nomeUnidade || pedido.unidadeSelecionada || pedido.unidadeNome || pedido.filial || pedido.loja || pedido.unidadeId || pedido.idUnidade || "";
        const nome = String(valor).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (nome === "2" || nome.includes("unidade 2") || nome.includes("unidade2") || nome.includes("unidade dois")) return "Unidade 2";
        if (nome === "1" || nome.includes("unidade 1") || nome.includes("unidade1") || nome.includes("unidade um")) return "Unidade 1";
        // Compatibilidade com os nomes usados no formulário antigo do balcão.
        if (nome.includes("centro")) return "Unidade 1";
        if (nome.includes("praia") || nome.includes("continente")) return "Unidade 2";
        return "";
    }
    const statusNome = status => ({ aguardando: "Aguardando preparação", recebido: "Aguardando preparação", preparando: "Em preparo", pronto: "Pronto para retirada", retirado: "Entregue" }[status] || status || "Aguardando preparação");
    const pedidosDaUnidade = unidade => pedidos().filter(p => unidadePedido(p) === unidade);

    // Os dados de estoque/cardápio/promoções/regras ficam separados por unidade.
    // Valores antigos são preservados e migrados para a Unidade 1 quando necessário.
    function dadosPorUnidade(chaveNova, chaveAntiga, padrao) {
        let dados = ler(chaveNova, null);
        if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
            const antigo = ler(chaveAntiga, null);
            dados = { "Unidade 1": antigo == null ? structuredClone(padrao) : antigo, "Unidade 2": structuredClone(padrao) };
            salvar(chaveNova, dados);
        }
        UNIDADES.forEach(u => { if (dados[u] == null) dados[u] = structuredClone(padrao); });
        return dados;
    }
    function lerDadosUnidade(chaveNova, chaveAntiga, padrao, unidade) {
        const dados = dadosPorUnidade(chaveNova, chaveAntiga, padrao);
        return Array.isArray(padrao) ? (Array.isArray(dados[unidade]) ? dados[unidade] : []) : (dados[unidade] || structuredClone(padrao));
    }
    function salvarDadosUnidade(chaveNova, chaveAntiga, padrao, unidade, valor) {
        const dados = dadosPorUnidade(chaveNova, chaveAntiga, padrao);
        dados[unidade] = valor;
        salvar(chaveNova, dados);
    }
    const PADRAO_ESTOQUE = [
        { nome: "Carne de sol", quantidade: 18 }, { nome: "Moqueca", quantidade: 12 },
        { nome: "Acarajé", quantidade: 20 }, { nome: "Escondidinho", quantidade: 15 }, { nome: "Suco natural", quantidade: 24 }
    ];
    const PADRAO_REGRAS = { pontosPorReal: 1, pontosParaResgate: 100, valorDesconto: 5 };

    function preencherSeletor(select, incluirTodas = false) {
        if (!select) return;
        const valorAtual = select.value;
        select.replaceChildren();
        if (incluirTodas) {
            const opcao = document.createElement("option"); opcao.value = "todas"; opcao.textContent = "Todas as unidades"; select.appendChild(opcao);
        }
        UNIDADES.forEach(unidade => { const opcao = document.createElement("option"); opcao.value = unidade; opcao.textContent = unidade; select.appendChild(opcao); });
        if ([...select.options].some(o => o.value === valorAtual)) select.value = valorAtual;
        else select.value = incluirTodas ? "todas" : UNIDADES[0];
    }

    // =========================================
    // ATENDENTE
    // =========================================
    if (el("tabela-atendente")) {
        const seletor = el("unidade-atendente");
        preencherSeletor(seletor);
        let filtroStatus = "todos";
        function renderAtendente() {
            const corpo = el("tabela-atendente"); corpo.replaceChildren();
            const unidade = seletor?.value || UNIDADES[0];
            const lista = pedidosDaUnidade(unidade).filter(p => {
                const status = p.status || "aguardando";
                return filtroStatus === "todos" || (filtroStatus === "aguardando" ? ["aguardando", "recebido"].includes(status) : status === filtroStatus);
            }).slice().reverse();
            mensagem("vazio-atendente", lista.length ? "" : `Nenhum pedido encontrado para ${unidade} neste status.`);
            lista.forEach(p => {
                const tr = document.createElement("tr");
                ["#" + (p.numero ?? p.id ?? "—"), p.nomeCliente || p.cliente || "Cliente", unidadePedido(p), dinheiro(totalPedido(p)), statusNome(p.status), p.senhaRetirada || p.senha || "—"].forEach(valor => { const td = document.createElement("td"); td.textContent = valor; tr.appendChild(td); });
                const tdAcao = document.createElement("td");
                if (p.status === "pronto") {
                    const botao = document.createElement("button"); botao.type = "button"; botao.className = "mini-botao"; botao.textContent = "Confirmar entrega";
                    botao.addEventListener("click", () => {
                        if (!window.confirm(`Confirma a entrega do pedido #${p.numero ?? p.id}?\nConfira a senha de retirada: ${p.senhaRetirada || p.senha || "—"}`)) return;
                        const listaAtual = pedidos(); const indice = listaAtual.findIndex(item => String(item.numero ?? item.id) === String(p.numero ?? p.id));
                        if (indice < 0 || listaAtual[indice].status !== "pronto") { mensagem("mensagem-atendente", "O pedido não está mais pronto para retirada. Atualize a lista."); renderAtendente(); return; }
                        listaAtual[indice].status = "retirado"; salvar(CHAVE_PEDIDOS, listaAtual); mensagem("mensagem-atendente", `Pedido #${p.numero ?? p.id} marcado como entregue.`); renderAtendente();
                    }); tdAcao.appendChild(botao);
                } else { const span = document.createElement("span"); span.className = "acao-informativa"; span.textContent = p.status === "retirado" ? "Pedido entregue" : statusNome(p.status); tdAcao.appendChild(span); }
                tr.appendChild(tdAcao); corpo.appendChild(tr);
            });
        }
        seletor?.addEventListener("change", renderAtendente);
        document.querySelectorAll(".filtro-atendente").forEach(botao => botao.addEventListener("click", () => {
            filtroStatus = botao.dataset.filtro;
            document.querySelectorAll(".filtro-atendente").forEach(outro => { const ativo = outro === botao; outro.classList.toggle("ativo", ativo); outro.setAttribute("aria-pressed", String(ativo)); });
            renderAtendente();
        }));
        renderAtendente();
        window.addEventListener("storage", e => { if (e.key === CHAVE_PEDIDOS) renderAtendente(); });
    }

    // =========================================
    // GERENTE: estoque, cardápio, promoções, fidelidade e vendas por unidade
    // =========================================
    if (el("form-estoque")) {
        const seletor = el("unidade-gerente"); preencherSeletor(seletor);
        const unidadeAtual = () => seletor?.value || UNIDADES[0];
        const estoque = () => lerDadosUnidade(CHAVE_ESTOQUE, "estoqueRaizes", PADRAO_ESTOQUE, unidadeAtual());
        const cardapio = () => lerDadosUnidade(CHAVE_CARDAPIO, "cardapioGerenciadoRaizes", [], unidadeAtual());
        const promocoes = () => lerDadosUnidade(CHAVE_PROMOCOES, "promocoesRaizes", [], unidadeAtual());
        const regras = () => lerDadosUnidade(CHAVE_REGRAS, "regrasFidelidadeRaizes", PADRAO_REGRAS, unidadeAtual());
        function renderEstoque() {
            const alvo = el("lista-estoque"); alvo.replaceChildren();
            estoque().forEach((item, indice) => {
                const linha = document.createElement("div"); linha.className = "linha-produto"; const texto = document.createElement("span"); texto.textContent = `${item.nome} — ${item.quantidade} unidades`;
                const acoes = document.createElement("span"); acoes.className = "acoes-admin";
                [[-1, "Saída"], [1, "Entrada"]].forEach(([delta, rotulo]) => { const b = document.createElement("button"); b.type = "button"; b.className = "mini-botao"; b.textContent = rotulo; b.addEventListener("click", () => { const lista = estoque(); lista[indice].quantidade = Math.max(0, (Number(lista[indice].quantidade) || 0) + delta); salvarDadosUnidade(CHAVE_ESTOQUE, "estoqueRaizes", PADRAO_ESTOQUE, unidadeAtual(), lista); renderEstoque(); }); acoes.appendChild(b); });
                linha.append(texto, acoes); alvo.appendChild(linha);
            });
        }
        el("form-estoque").addEventListener("submit", e => { e.preventDefault(); const nome = el("produto-estoque").value.trim(); const quantidade = Math.max(0, Number(el("quantidade-estoque").value) || 0); if (!nome) return; const lista = estoque(); const existente = lista.find(i => i.nome.toLowerCase() === nome.toLowerCase()); if (existente) existente.quantidade = quantidade; else lista.push({ nome, quantidade }); salvarDadosUnidade(CHAVE_ESTOQUE, "estoqueRaizes", PADRAO_ESTOQUE, unidadeAtual(), lista); mensagem("mensagem-estoque", `Estoque de ${unidadeAtual()} atualizado.`); el("form-estoque").reset(); renderEstoque(); });
        function renderCardapio() {
            const alvo = el("lista-cardapio"); alvo.replaceChildren();
            cardapio().forEach((produto, indice) => { const linha = document.createElement("div"); linha.className = "linha-produto"; const texto = document.createElement("span"); texto.textContent = `${produto.nome} — ${dinheiro(produto.preco)} — ${produto.ativo === false ? "Indisponível" : "Disponível"}`; const b = document.createElement("button"); b.type = "button"; b.className = "mini-botao"; b.textContent = produto.ativo === false ? "Ativar" : "Retirar do cardápio"; b.addEventListener("click", () => { const lista = cardapio(); lista[indice].ativo = lista[indice].ativo === false; salvarDadosUnidade(CHAVE_CARDAPIO, "cardapioGerenciadoRaizes", [], unidadeAtual(), lista); renderCardapio(); }); linha.append(texto, b); alvo.appendChild(linha); });
        }
        el("form-cardapio").addEventListener("submit", e => { e.preventDefault(); const nome = el("nome-produto").value.trim(); const preco = Number(el("preco-produto").value); if (!nome || preco <= 0) return; const lista = cardapio(); lista.push({ nome, preco, ativo: true }); salvarDadosUnidade(CHAVE_CARDAPIO, "cardapioGerenciadoRaizes", [], unidadeAtual(), lista); el("form-cardapio").reset(); mensagem("mensagem-cardapio", `Produto cadastrado no cardápio de ${unidadeAtual()}.`); renderCardapio(); });
        function renderPromocoes() {
            const alvo = el("lista-promocoes"); alvo.replaceChildren();
            promocoes().forEach((promocao, indice) => { const linha = document.createElement("div"); linha.className = "linha-produto"; const texto = document.createElement("span"); texto.textContent = `${promocao.nome} — ${promocao.desconto}% de desconto — ${promocao.ativa === false ? "Inativa" : "Ativa"}`; const b = document.createElement("button"); b.type = "button"; b.className = "mini-botao"; b.textContent = promocao.ativa === false ? "Ativar" : "Desativar"; b.addEventListener("click", () => { const lista = promocoes(); lista[indice].ativa = lista[indice].ativa === false; salvarDadosUnidade(CHAVE_PROMOCOES, "promocoesRaizes", [], unidadeAtual(), lista); renderPromocoes(); }); linha.append(texto, b); alvo.appendChild(linha); });
        }
        el("form-promocao").addEventListener("submit", e => { e.preventDefault(); const nome = el("nome-promocao").value.trim(); const desconto = Number(el("desconto-promocao").value); if (!nome || desconto < 1 || desconto > 90) return; const lista = promocoes(); lista.push({ nome, desconto, ativa: true }); salvarDadosUnidade(CHAVE_PROMOCOES, "promocoesRaizes", [], unidadeAtual(), lista); el("form-promocao").reset(); mensagem("mensagem-promocao", `Promoção cadastrada para ${unidadeAtual()}.`); renderPromocoes(); });
        function renderRegras() { const r = regras(); el("pontos-real").value = r.pontosPorReal; el("pontos-desconto").value = r.pontosParaResgate; el("valor-desconto").value = r.valorDesconto; }
        el("form-fidelidade").addEventListener("submit", e => { e.preventDefault(); const r = { pontosPorReal: Number(el("pontos-real").value), pontosParaResgate: Number(el("pontos-desconto").value), valorDesconto: Number(el("valor-desconto").value) }; salvarDadosUnidade(CHAVE_REGRAS, "regrasFidelidadeRaizes", PADRAO_REGRAS, unidadeAtual(), r); mensagem("mensagem-fidelidade-admin", `Regras de fidelidade de ${unidadeAtual()} atualizadas.`); });
        function renderVendas() { const lista = pedidosDaUnidade(unidadeAtual()); el("total-pedidos-gerente").textContent = lista.length; el("total-vendas-gerente").textContent = dinheiro(lista.reduce((s, p) => s + totalPedido(p), 0)); }
        function renderTudo() { renderEstoque(); renderCardapio(); renderPromocoes(); renderRegras(); renderVendas(); }
        seletor?.addEventListener("change", renderTudo); renderTudo();
        window.addEventListener("storage", e => { if ([CHAVE_PEDIDOS, CHAVE_ESTOQUE, CHAVE_CARDAPIO, CHAVE_PROMOCOES, CHAVE_REGRAS].includes(e.key)) renderTudo(); });
    }

    // =========================================
    // MATRIZ: visão geral da rede + filtro para consultar uma unidade
    // =========================================
    if (el("tabela-vendas-matriz")) {
        const seletor = el("unidade-matriz"); preencherSeletor(seletor, true);
        function renderMatriz() {
            const todas = pedidos(); const filtro = seletor?.value || "todas";
            const lista = filtro === "todas" ? todas : todas.filter(p => unidadePedido(p) === filtro);
            el("matriz-pedidos").textContent = lista.length;
            el("matriz-vendas").textContent = dinheiro(lista.reduce((s, p) => s + totalPedido(p), 0));
            el("matriz-preparo").textContent = lista.filter(p => p.status === "preparando").length;
            el("matriz-prontos").textContent = lista.filter(p => p.status === "pronto").length;

            const porUnidade = { "Unidade 1": { quantidade: 0, total: 0 }, "Unidade 2": { quantidade: 0, total: 0 } };
            todas.forEach(p => { const u = unidadePedido(p); if (!porUnidade[u]) return; porUnidade[u].quantidade++; porUnidade[u].total += totalPedido(p); });
            const tabela = el("tabela-vendas-matriz"); tabela.replaceChildren();
            Object.entries(porUnidade).filter(([u]) => filtro === "todas" || u === filtro).forEach(([u, d]) => { const tr = document.createElement("tr"); [u, d.quantidade, dinheiro(d.total)].forEach(v => { const td = document.createElement("td"); td.textContent = v; tr.appendChild(td); }); tabela.appendChild(tr); });

            const estoquePorUnidade = dadosPorUnidade(CHAVE_ESTOQUE, "estoqueRaizes", PADRAO_ESTOQUE);
            const areaEstoque = el("estoque-matriz"); areaEstoque.replaceChildren();
            const unidadesEstoque = filtro === "todas" ? UNIDADES : [filtro];
            unidadesEstoque.forEach(u => { const titulo = document.createElement("h3"); titulo.textContent = u; areaEstoque.appendChild(titulo); (estoquePorUnidade[u] || []).forEach(i => { const linha = document.createElement("div"); linha.className = "linha-produto"; linha.textContent = `${i.nome}: ${i.quantidade} unidades`; areaEstoque.appendChild(linha); }); });

            const contagem = {}; lista.forEach(p => (p.itens || []).forEach(i => { const nome = i.nome || "Produto"; contagem[nome] = (contagem[nome] || 0) + (Number(i.quantidade) || 1); }));
            const ranking = Object.entries(contagem).sort((a, b) => b[1] - a[1]); const areaProdutos = el("produtos-matriz"); areaProdutos.replaceChildren();
            if (!ranking.length) areaProdutos.textContent = "Os produtos mais pedidos aparecerão aqui conforme os pedidos forem registrados.";
            else ranking.forEach(([nome, qtd]) => { const linha = document.createElement("div"); linha.className = "linha-produto"; linha.textContent = `${nome}: ${qtd} unidade(s)`; areaProdutos.appendChild(linha); });

            const tabelaOperacoes = el("operacoes-matriz"); tabelaOperacoes.replaceChildren();
            lista.slice().reverse().slice(0, 12).forEach(p => { const tr = document.createElement("tr"); ["#" + (p.numero ?? p.id ?? "—"), unidadePedido(p) || "Unidade não identificada", statusNome(p.status), dinheiro(totalPedido(p))].forEach(v => { const td = document.createElement("td"); td.textContent = v; tr.appendChild(td); }); tabelaOperacoes.appendChild(tr); });
            if (!lista.length) { const tr = document.createElement("tr"); const td = document.createElement("td"); td.colSpan = 4; td.textContent = "Não há operações para esta seleção."; tr.appendChild(td); tabelaOperacoes.appendChild(tr); }

            const promoPorUnidade = dadosPorUnidade(CHAVE_PROMOCOES, "promocoesRaizes", []);
            const regrasPorUnidade = dadosPorUnidade(CHAVE_REGRAS, "regrasFidelidadeRaizes", PADRAO_REGRAS);
            const unidadesResumo = filtro === "todas" ? UNIDADES : [filtro];
            el("quantidade-promocoes-matriz").textContent = unidadesResumo.reduce((s, u) => s + (promoPorUnidade[u] || []).filter(p => p.ativa !== false).length, 0);
            const resumoRegras = unidadesResumo.map(u => { const r = regrasPorUnidade[u] || PADRAO_REGRAS; return `${u}: ${r.pontosPorReal} ponto(s) por R$ 1,00; ${r.pontosParaResgate} pontos = ${dinheiro(r.valorDesconto)}`; });
            el("regra-fidelidade-matriz").textContent = resumoRegras.join(" | ");
        }
        seletor?.addEventListener("change", renderMatriz); renderMatriz();
        window.addEventListener("storage", e => { if ([CHAVE_PEDIDOS, CHAVE_ESTOQUE, CHAVE_CARDAPIO, CHAVE_PROMOCOES, CHAVE_REGRAS].includes(e.key)) renderMatriz(); });
    }
})();
