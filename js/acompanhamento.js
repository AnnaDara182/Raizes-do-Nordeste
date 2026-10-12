
/* =========================================
   1. CONFIGURAÇÕES
========================================= */

const CHAVE_PEDIDO_CONFIRMADO = "pedidoConfirmado";
const CHAVE_PEDIDOS = "pedidosRaizes";
const CHAVE_FEEDBACKS = "feedbacksRaizes";

let pedidoConfirmado = null;
let pedidoAtual = null;


/* =========================================
   2. ELEMENTOS DA PÁGINA
========================================= */

const numeroPedido = document.getElementById("numero-pedido");
const senhaRetirada = document.getElementById("senha-retirada");
const avisoStatus = document.getElementById("aviso-status");
const etiquetaStatus = document.getElementById("etiqueta-status");

const etapaRecebido = document.getElementById("etapa-recebido");
const etapaPreparando = document.getElementById("etapa-preparando");
const etapaPronto = document.getElementById("etapa-pronto");
const etapaRetirado = document.getElementById("etapa-retirado");

const areaFeedback = document.getElementById("area-feedback");
const formFeedback = document.getElementById("form-feedback");
const mensagemFeedback = document.getElementById("mensagem-feedback");
const campoComentario = document.getElementById("comentario-feedback");
const botaoFeedback = formFeedback.querySelector('button[type="submit"]');


/* =========================================
   3. LER O PEDIDO CONFIRMADO
========================================= */

function lerPedidoConfirmado() {
    try {
        return JSON.parse(
            sessionStorage.getItem(CHAVE_PEDIDO_CONFIRMADO) || "null"
        );
    } catch (erro) {
        console.error("Erro ao ler o pedido confirmado:", erro);
        return null;
    }
}


/* =========================================
   4. BUSCAR A VERSÃO ATUAL DO PEDIDO
========================================= */

function encontrarPedidoAtual() {
    if (!pedidoConfirmado || pedidoConfirmado.numero == null) {
        return null;
    }

    try {
        const pedidos = JSON.parse(
            localStorage.getItem(CHAVE_PEDIDOS) || "[]"
        );

        if (!Array.isArray(pedidos)) {
            return pedidoConfirmado;
        }

        const pedidoSalvo = pedidos.find(function (pedido) {
            return String(pedido.numero) === String(pedidoConfirmado.numero);
        });

        // A lista compartilhada é a fonte do status mais recente.
        return pedidoSalvo || pedidoConfirmado;

    } catch (erro) {
        console.error("Erro ao consultar os pedidos:", erro);
        return pedidoConfirmado;
    }
}


/* =========================================
   5. NORMALIZAR STATUS
========================================= */

function normalizarStatus(status) {
    const valor = String(status || "")
        .trim()
        .toLowerCase();

    const equivalencias = {
        recebido: "recebido",
        aguardando: "recebido",
        preparando: "preparando",
        "em preparo": "preparando",
        pronto: "pronto",
        retirado: "retirado"
    };

    return equivalencias[valor] || "desconhecido";
}


/* =========================================
   6. ATUALIZAR A LINHA DO TEMPO
========================================= */

function atualizarStatus(status) {
    const etapas = [
        etapaRecebido,
        etapaPreparando,
        etapaPronto,
        etapaRetirado
    ];

    etapas.forEach(function (etapa) {
        etapa.classList.remove("concluida", "atual");
    });

    etiquetaStatus.className = "etiqueta-status";

    const statusAtual = normalizarStatus(status);

    const indiceStatus = {
        recebido: 0,
        preparando: 1,
        pronto: 2,
        retirado: 3
    };

    const textos = {
        recebido: {
            etiqueta: "Pedido recebido",
            aviso: "Seu pedido foi recebido pela unidade e aguarda preparação."
        },
        preparando: {
            etiqueta: "Em preparação",
            aviso: "A cozinha está preparando seu pedido."
        },
        pronto: {
            etiqueta: "Pronto para retirada",
            aviso: "Seu pedido está pronto! Apresente sua senha à equipe da unidade."
        },
        retirado: {
            etiqueta: "Pedido retirado",
            aviso: "A retirada do seu pedido foi registrada. Obrigado por escolher o Raízes do Nordeste!"
        }
    };

    if (statusAtual === "desconhecido") {
        etiquetaStatus.textContent = "Status indisponível";
        avisoStatus.textContent =
            "Não foi possível identificar o status atual do pedido.";

        atualizarAreaFeedback(false);
        return;
    }

    const indiceAtual = indiceStatus[statusAtual];

    etapas.forEach(function (etapa, indice) {
        if (indice < indiceAtual) {
            etapa.classList.add("concluida");
        } else if (indice === indiceAtual) {
            etapa.classList.add("atual");
        }
    });

    etiquetaStatus.textContent = textos[statusAtual].etiqueta;

    if (statusAtual === "preparando") {
        etiquetaStatus.classList.add("status-preparando");
    } else if (statusAtual === "pronto") {
        etiquetaStatus.classList.add("status-pronto");
    } else if (statusAtual === "retirado") {
        etiquetaStatus.classList.add("status-retirado");
    }

    avisoStatus.textContent = textos[statusAtual].aviso;

    // O feedback só pode ser registrado após a retirada.
    atualizarAreaFeedback(statusAtual === "retirado");
}


/* =========================================
   7. LER E SALVAR FEEDBACKS
========================================= */

function lerFeedbacks() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_FEEDBACKS) || "[]"
        );

        return Array.isArray(dados) ? dados : [];

    } catch (erro) {
        console.error("Erro ao ler os feedbacks:", erro);
        return [];
    }
}

function salvarFeedback(feedback) {
    try {
        const feedbacks = lerFeedbacks();

        // Impede mais de uma avaliação para o mesmo pedido.
        const jaExiste = feedbacks.some(function (item) {
            return String(item.numeroPedido) === String(feedback.numeroPedido);
        });

        if (jaExiste) {
            return {
                sucesso: false,
                motivo: "duplicado"
            };
        }

        feedbacks.push(feedback);

        localStorage.setItem(
            CHAVE_FEEDBACKS,
            JSON.stringify(feedbacks)
        );

        return { sucesso: true };

    } catch (erro) {
        console.error("Erro ao salvar o feedback:", erro);

        return {
            sucesso: false,
            motivo: "armazenamento"
        };
    }
}


/* =========================================
   8. CONTROLAR A ÁREA DE FEEDBACK
========================================= */

function atualizarAreaFeedback(pedidoRetirado) {
    if (!pedidoAtual) {
        areaFeedback.hidden = true;
        return;
    }

    const feedbacks = lerFeedbacks();

    const feedbackExistente = feedbacks.find(function (feedback) {
        return String(feedback.numeroPedido) === String(pedidoAtual.numero);
    });

    areaFeedback.hidden = !pedidoRetirado;

    if (!pedidoRetirado) {
        return;
    }

    if (feedbackExistente) {
        formFeedback.hidden = true;
        mensagemFeedback.textContent =
            "Obrigado! Sua avaliação deste pedido já foi registrada.";
    } else {
        formFeedback.hidden = false;
        mensagemFeedback.textContent = "";
    }
}


/* =========================================
   9. ENVIAR FEEDBACK
========================================= */

formFeedback.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!pedidoAtual) {
        mensagemFeedback.textContent =
            "Não foi possível identificar o pedido.";
        return;
    }

    // Confere novamente o status antes de salvar.
    const pedidoMaisRecente = encontrarPedidoAtual();

    if (
        !pedidoMaisRecente ||
        normalizarStatus(pedidoMaisRecente.status) !== "retirado"
    ) {
        mensagemFeedback.textContent =
            "A avaliação estará disponível depois que a retirada for registrada.";
        return;
    }

    const notaSelecionada = formFeedback.querySelector(
        'input[name="nota"]:checked'
    );

    if (!notaSelecionada) {
        mensagemFeedback.textContent =
            "Selecione uma nota antes de enviar.";
        return;
    }

    const feedback = {
        numeroPedido: pedidoAtual.numero,
        nota: Number(notaSelecionada.value),
        comentario: campoComentario.value.trim(),
        data: new Date().toISOString()
    };

    const resultado = salvarFeedback(feedback);

    if (resultado.sucesso) {
        formFeedback.hidden = true;
        mensagemFeedback.textContent =
            "Obrigado pela avaliação! Seu feedback foi registrado neste navegador.";
        return;
    }

    if (resultado.motivo === "duplicado") {
        formFeedback.hidden = true;
        mensagemFeedback.textContent =
            "Este pedido já possui uma avaliação registrada.";
        return;
    }

    mensagemFeedback.textContent =
        "Não foi possível salvar a avaliação. Tente novamente.";
});


/* =========================================
   10. ATUALIZAR OS DADOS DA TELA
========================================= */

function atualizarTela() {
    pedidoConfirmado = lerPedidoConfirmado();
    pedidoAtual = encontrarPedidoAtual();

    if (!pedidoAtual) {
        numeroPedido.textContent = "Não encontrado";
        senhaRetirada.textContent = "—";
        etiquetaStatus.textContent = "Sem pedido";
        etiquetaStatus.className = "etiqueta-status";

        avisoStatus.textContent =
            "Nenhum pedido confirmado foi encontrado. Faça um pedido para acompanhar seu status.";

        [
            etapaRecebido,
            etapaPreparando,
            etapaPronto,
            etapaRetirado
        ].forEach(function (etapa) {
            etapa.classList.remove("concluida", "atual");
        });

        areaFeedback.hidden = true;
        return;
    }

    numeroPedido.textContent = "#" + pedidoAtual.numero;

    senhaRetirada.textContent = pedidoAtual.senha
        ? "#" + String(pedidoAtual.senha).replace(/^#/, "")
        : "—";

    atualizarStatus(pedidoAtual.status);
}


/* =========================================
   11. ATUALIZAÇÃO ENTRE ABAS
========================================= */

window.addEventListener("storage", function (evento) {
    if (
        evento.key === CHAVE_PEDIDOS ||
        evento.key === CHAVE_FEEDBACKS
    ) {
        atualizarTela();
    }
});


/* =========================================
   12. INICIALIZAÇÃO
========================================= */

atualizarTela();

// Mantém a tela atualizada quando o status muda
// no painel da cozinha em outra aba do mesmo navegador.
setInterval(atualizarTela, 2000);
