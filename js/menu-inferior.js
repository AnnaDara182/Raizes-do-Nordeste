
/* =========================================
   1. IDENTIFICAR A TELA ATUAL
========================================= */

const paginaAtual = window.location.pathname
    .split("/")
    .pop() || "index.html";


/* =========================================
   2. DEFINIR OS ÍCONES DO MENU
========================================= */

// Ícones SVG para manter o mesmo estilo visual.
const iconesMenu = {
    inicio: `
        <svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 10 9-7 9 7"></path>
            <path d="M5 9v11h14V9"></path>
            <path d="M9 20v-6h6v6"></path>
        </svg>
    `,

    pedidos: `
        <svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 3h10l3 3v15H4V3h3"></path>
            <path d="M8 9h8"></path>
            <path d="M8 13h8"></path>
            <path d="M8 17h5"></path>
        </svg>
    `,

    fidelidade: `
        <svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"></path>
        </svg>
    `,

    perfil: `
        <svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="3.5"></circle>
            <path d="M5 21v-2a7 7 0 0 1 14 0v2"></path>
        </svg>
    `
};


/* =========================================
   3. DEFINIR AS OPÇÕES DO MENU
========================================= */

const opcoesMenu = [
    {
        nome: "Início",
        icone: "inicio",
        destino: "index.html",
        paginas: [
            "index.html",
            "cardapio.html",
            "personalizar.html"
        ]
    },
    {
        nome: "Pedidos",
        icone: "pedidos",
        destino: "acompanhamento.html",
        paginas: [
            "carrinho.html",
            "revisao.html",
            "resultado-pagamento.html",
            "acompanhamento.html"
        ]
    },
    {
        nome: "Fidelidade",
        icone: "fidelidade",
        destino: "fidelidade.html",
        paginas: ["fidelidade.html"]
    },
    {
        nome: "Perfil",
        icone: "perfil",
        destino: "perfil.html",
        paginas: [
            "perfil.html",
            "login.html",
            "cadastro.html"
        ]
    }
];


/* =========================================
   4. CRIAR O MENU
========================================= */

const menu = document.createElement("nav");

menu.className = "menu-inferior";
menu.setAttribute("aria-label", "Menu principal");

const listaMenu = document.createElement("div");
listaMenu.className = "menu-inferior-conteudo";

opcoesMenu.forEach(function (opcao) {

    const link = document.createElement("a");

    link.href = opcao.destino;
    link.className = "item-menu";

    // Cria o espaço do ícone.
    const areaIcone = document.createElement("span");

    areaIcone.className = "icone-menu";
    areaIcone.setAttribute("aria-hidden", "true");
    areaIcone.innerHTML = iconesMenu[opcao.icone];

    // Cria o texto.
    const texto = document.createElement("span");

    texto.className = "texto-menu";
    texto.textContent = opcao.nome;

    link.append(areaIcone, texto);

    // Destaca o item correspondente à página atual.
    if (opcao.paginas.includes(paginaAtual)) {
        link.classList.add("ativo");
        link.setAttribute("aria-current", "page");
    }

    // Verifica se a opção exige login.
    link.addEventListener("click", function (evento) {

        const precisaDeLogin =
            opcao.nome === "Pedidos" ||
            opcao.nome === "Fidelidade" ||
            opcao.nome === "Perfil";

        // O início pode ser acessado sem login.
        if (!precisaDeLogin) {
            return;
        }

        evento.preventDefault();

        // Solicita login quando necessário.
        if (!AuthRaizes.estaLogado()) {
            AuthRaizes.pedirLogin(opcao.destino);
            return;
        }

        // Continua para a página escolhida.
        window.location.href = opcao.destino;
    });

    listaMenu.appendChild(link);
});

menu.appendChild(listaMenu);


/* =========================================
   5. ADICIONAR O MENU À PÁGINA
========================================= */

// Mantém o menu fixo na parte inferior.
document.body.appendChild(menu);
