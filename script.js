// ======================================================
// CONFIGURAÇÕES RÁPIDAS
// ======================================================
// CARDÁPIO — as imagens vêm da pasta "imagens"
// ======================================================
const cardapio = [
  {
    id: 1,
    imagem: "imagens/coca-cola.png",
    selo: "Clássica",
    nome: "Coca-Cola Lata",
    desc: "A clássica, gelada e borbulhante que combina com qualquer roda de conversa.",
    preco: 6,
  },
  {
    id: 2,
    imagem: "imagens/coca-cola-zero.png",
    selo: "Zero açúcar",
    nome: "Coca-Cola Zero Lata",
    desc: "Todo o sabor de sempre, sem açúcar — pra curtir a Feira inteira sem peso na consciência.",
    preco: 6,
  },
  {
    id: 3,
    imagem: "imagens/guarana.png",
    selo: "Favorita",
    nome: "Guaraná Antarctica Lata",
    desc: "O queridinho brasileiro, docinho e cheio de bolhas de alegria.",
    preco: 6,
  },
  {
    id: 4,
    imagem: "imagens/guarana-zero.png",
    selo: "Zero açúcar",
    nome: "Guaraná Antarctica Zero Lata",
    desc: "Aquele guaraná de sempre, só que na versão levinha pro seu dia a dia.",
    preco: 6,
  },
  {
    id: 5,
    imagem: "imagens/agua.png",
    selo: "Hidrata",
    nome: "Água Mineral",
    desc: "Pra hidratar com estilo.",
    preco: 4,
  },
  {
    id: 6,
    imagem: "imagens/suco-uva.png",
    selo: "Refrescante",
    nome: "Suco de Uva Del Valle Lata",
    desc: "Uva roxa bem suculenta numa latinha gelada, direto pra sua mão.",
    preco: 6,
  },
];

// Mensagens fofas/engraçadas sorteadas na hora de retirar
const mensagensRetirada = (nome, senha) => [
  `Ei, ${nome}! 🎉 Sua bebida já tá te esperando na banca, mais gelada que coração de segunda-feira. Chega lá e fala a senha ${senha} pro pessoal!`,
  `${nome}, sua bebida chegou antes de você — que fofoqueira! 😄 Corre até a banca com a senha ${senha} antes que o gelo derreta de tanto tédio.`,
  `Oi, ${nome}! Pedido prontinho e suado de tanto ficar te esperando 🥤💦. Passa na banca e mostra a senha ${senha}, a gente já separou um sorriso junto.`,
  `${nome}, sua bebida tá fazendo hora extra aqui na banca só esperando você. Senha ${senha}, vem buscar com carinho (e sede)! 💛`,
  `Prontooo, ${nome}! 🙌 Bebida geladinha, senha ${senha}. Vem antes que a gente tome no seu lugar (brincadeira... ou não 👀).`,
];

// ======================================================
// ESTADO
// ======================================================
let carrinho = {}; // { id: quantidade }
let pagamentoEscolhido = null; // "dinheiro" | "pix" | "cartao"
let cartaoEscolhido = null; // "credito" | "debito"
let pedidoJaFinalizado = false; // trava o botão depois de gerar a senha

const formatoMoeda = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ======================================================
// TOAST — "item adicionado"
// ======================================================
let toastTimeout = null;

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  toast.textContent = texto;

  toast.classList.remove("mostrando");
  void toast.offsetWidth;
  toast.classList.add("mostrando");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("mostrando");
  }, 1600);
}

// ======================================================
// RENDER — CARDÁPIO (com selinho e seletor de quantidade)
// ======================================================
function renderCardapio() {
  const grade = document.getElementById("grade-cardapio");
  grade.innerHTML = cardapio
    .map(
      (item) => `
    <div class="item-cardapio">
      <div class="item-imagem">
        <span class="item-selo">${item.selo}</span>
        <img src="${item.imagem}" alt="${item.nome}">
      </div>
      <div class="item-corpo">
        <div class="item-nome">${item.nome}</div>
        <div class="item-desc">${item.desc}</div>
        <div class="item-preco">${formatoMoeda(item.preco)}</div>
        <div class="item-acoes">
          <div class="seletor-qtd">
            <button type="button" data-qtd-acao="menos" data-id="${item.id}">−</button>
            <span id="qtd-${item.id}">1</span>
            <button type="button" data-qtd-acao="mais" data-id="${item.id}">+</button>
          </div>
          <button class="btn-adicionar" data-id="${item.id}">Adicionar</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  // seletor de quantidade (1 a 20) antes de adicionar
  grade.querySelectorAll("[data-qtd-acao]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = botao.dataset.id;
      const span = document.getElementById(`qtd-${id}`);
      let valor = Number(span.textContent);
      valor = botao.dataset.qtdAcao === "mais" ? Math.min(20, valor + 1) : Math.max(1, valor - 1);
      span.textContent = valor;
    });
  });

  // botão "Adicionar"
  grade.querySelectorAll(".btn-adicionar").forEach((botao) => {
    let timeoutConfirmado = null;

    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.id);
      const item = cardapio.find((i) => i.id === id);
      const span = document.getElementById(`qtd-${id}`);
      const qtdEscolhida = Number(span.textContent);

      carrinho[id] = (carrinho[id] || 0) + qtdEscolhida;

      mostrarToast(`${qtdEscolhida}× ${item.nome} adicionado ao carrinho!`);

      const textoOriginal = botao.textContent;
      botao.classList.add("confirmado");
      botao.textContent = "✓ Adicionado";
      clearTimeout(timeoutConfirmado);
      timeoutConfirmado = setTimeout(() => {
        botao.classList.remove("confirmado");
        botao.textContent = textoOriginal;
      }, 900);

      span.textContent = 1; // volta o seletor pra 1 depois de adicionar

      atualizarTudo();
    });
  });
}

// ======================================================
// RENDER — CARRINHO
// ======================================================
function itensDoCarrinho() {
  return Object.entries(carrinho)
    .filter(([, qtd]) => qtd > 0)
    .map(([id, qtd]) => ({ ...cardapio.find((i) => i.id === Number(id)), qtd }));
}

function calcularTotal() {
  return itensDoCarrinho().reduce((soma, item) => soma + item.preco * item.qtd, 0);
}

function renderCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  const itens = itensDoCarrinho();

  if (itens.length === 0) {
    lista.innerHTML = `<div class="vazio">Seu carrinho tá mais vazio que feira sem música 🎶<br>Volta no cardápio e escolhe algo gostoso!</div>`;
  } else {
    lista.innerHTML = itens
      .map(
        (item) => `
      <div class="linha-carrinho">
        <div class="imagem-mini">
          <img src="${item.imagem}" alt="${item.nome}">
        </div>
        <div class="linha-info">
          <div class="linha-nome">${item.nome}</div>
          <div class="linha-preco">${formatoMoeda(item.preco)}</div>
        </div>
        <div class="quantidade">
          <button data-id="${item.id}" data-acao="menos">−</button>
          <span>${item.qtd}</span>
          <button data-id="${item.id}" data-acao="mais">+</button>
        </div>
      </div>`
      )
      .join("");

    lista.querySelectorAll("button[data-acao]").forEach((botao) => {
      botao.addEventListener("click", () => {
        const id = Number(botao.dataset.id);
        const delta = botao.dataset.acao === "mais" ? 1 : -1;
        carrinho[id] = Math.max(0, (carrinho[id] || 0) + delta);
        atualizarTudo();
      });
    });
  }

  document.getElementById("total-carrinho").textContent = formatoMoeda(calcularTotal());
}

// ======================================================
// RENDER — RESUMO NA TELA DE FINALIZAR
// ======================================================
function renderResumoFinal() {
  const container = document.getElementById("resumo-final");
  const itens = itensDoCarrinho();

  if (itens.length === 0) {
    container.innerHTML = `<p>Adicione bebidas no cardápio antes de finalizar 🙂</p>`;
    return;
  }

  const linhas = itens
    .map(
      (item) => `
      <div class="linha-resumo">
        <span>${item.qtd}× ${item.nome}</span>
        <span>${formatoMoeda(item.preco * item.qtd)}</span>
      </div>`
    )
    .join("");

  container.innerHTML = `
    ${linhas}
    <div class="linha-resumo total">
      <span>Total</span>
      <span>${formatoMoeda(calcularTotal())}</span>
    </div>`;
}

// ======================================================
// CONTADOR DO BOTÃO CARRINHO
// ======================================================
function atualizarContador() {
  const total = Object.values(carrinho).reduce((a, b) => a + b, 0);
  document.getElementById("contador-carrinho").textContent = total;
}

function atualizarTudo() {
  renderCarrinho();
  renderResumoFinal();
  atualizarContador();
  atualizarBotaoFinalizar();
}

// ======================================================
// ABAS (só Cardápio e Carrinho — Finalizar é acessado pelo botão)
// ======================================================
function mudarAba(nomeAba) {
  document.querySelectorAll(".aba").forEach((btn) => {
    const ativa = btn.dataset.aba === nomeAba;
    btn.classList.toggle("ativa", ativa);
    btn.setAttribute("aria-selected", ativa);
  });
  document.querySelectorAll(".painel").forEach((painel) => {
    painel.classList.toggle("ativo", painel.id === `painel-${nomeAba}`);
  });
}

document.querySelectorAll(".aba").forEach((btn) => {
  btn.addEventListener("click", () => mudarAba(btn.dataset.aba));
});

document.getElementById("botao-carrinho").addEventListener("click", () => mudarAba("carrinho"));

document.getElementById("ir-para-finalizar").addEventListener("click", () => {
  document.querySelectorAll(".aba").forEach((btn) => btn.classList.remove("ativa"));
  document.querySelectorAll(".painel").forEach((painel) => painel.classList.remove("ativo"));
  document.getElementById("painel-finalizar").classList.add("ativo");
});

// ======================================================
// FORMA DE PAGAMENTO (sempre visível na tela de finalizar)
// ======================================================
const campoNome = document.getElementById("campo-nome");
const blocoCartao = document.getElementById("bloco-cartao");

campoNome.addEventListener("input", atualizarBotaoFinalizar);

document.querySelectorAll(".opcao-pagamento[data-pagamento]").forEach((botao) => {
  botao.addEventListener("click", () => {
    pagamentoEscolhido = botao.dataset.pagamento;
    cartaoEscolhido = null;

    document.querySelectorAll(".opcao-pagamento[data-pagamento]").forEach((b) => b.classList.remove("selecionada"));
    botao.classList.add("selecionada");

    document.querySelectorAll(".opcao-pagamento[data-cartao]").forEach((b) => b.classList.remove("selecionada"));
    blocoCartao.classList.toggle("escondido", pagamentoEscolhido !== "cartao");

    atualizarBotaoFinalizar();
  });
});

document.querySelectorAll(".opcao-pagamento[data-cartao]").forEach((botao) => {
  botao.addEventListener("click", () => {
    cartaoEscolhido = botao.dataset.cartao;
    document.querySelectorAll(".opcao-pagamento[data-cartao]").forEach((b) => b.classList.remove("selecionada"));
    botao.classList.add("selecionada");
    atualizarBotaoFinalizar();
  });
});

function limparSelecaoPagamento() {
  pagamentoEscolhido = null;
  cartaoEscolhido = null;
  document.querySelectorAll(".opcao-pagamento[data-pagamento]").forEach((b) => b.classList.remove("selecionada"));
  document.querySelectorAll(".opcao-pagamento[data-cartao]").forEach((b) => b.classList.remove("selecionada"));
  blocoCartao.classList.add("escondido");
}

// ======================================================
// HABILITA/DESABILITA BOTÃO "FINALIZAR PEDIDO"
// ======================================================
function atualizarBotaoFinalizar() {
  const btn = document.getElementById("btn-finalizar");

  if (pedidoJaFinalizado) {
    btn.disabled = true;
    return;
  }

  const temNome = campoNome.value.trim().length > 0;
  const temItens = itensDoCarrinho().length > 0;
  const pagamentoCompleto =
    pagamentoEscolhido === "dinheiro" ||
    pagamentoEscolhido === "pix" ||
    (pagamentoEscolhido === "cartao" && cartaoEscolhido !== null);

  btn.disabled = !(temNome && temItens && pagamentoCompleto);
}

// ======================================================
// FINALIZAR PEDIDO (só gera senha uma vez por pedido)
// ======================================================
document.getElementById("form-pedido").addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (pedidoJaFinalizado) return;

  pedidoJaFinalizado = true;
  atualizarBotaoFinalizar();

  const nome = campoNome.value.trim() || "amigo(a)";
  const senha = String(Math.floor(Math.random() * 900) + 100);

  const mensagens = mensagensRetirada(nome, senha);
  const mensagemEscolhida = mensagens[Math.floor(Math.random() * mensagens.length)];

  document.getElementById("numero-senha").textContent = senha;
  document.getElementById("mensagem-fofa").textContent = mensagemEscolhida;

  document.getElementById("form-pedido").classList.add("escondido");
  document.getElementById("confirmacao").classList.remove("escondido");
});

document.getElementById("novo-pedido").addEventListener("click", () => {
  carrinho = {};
  pedidoJaFinalizado = false;

  campoNome.value = "";
  limparSelecaoPagamento();

  atualizarTudo();

  document.getElementById("form-pedido").classList.remove("escondido");
  document.getElementById("confirmacao").classList.add("escondido");
  mudarAba("cardapio");
});



// ======================================================
// EFEITO DE BALANÇO DOS ÍCONES AO ROLAR A PÁGINA
// ======================================================
let ultimoScrollY = window.scrollY;
let anguloAlvo = 0;
let anguloAtual = 0;

window.addEventListener("scroll", () => {
  const scrollAtual = window.scrollY;
  const delta = scrollAtual - ultimoScrollY;
  ultimoScrollY = scrollAtual;
  anguloAlvo = Math.max(-8, Math.min(8, anguloAlvo + delta * 0.6));
});

function animarIcones() {
  anguloAtual += (anguloAlvo - anguloAtual) * 0.15;
  anguloAlvo *= 0.9;
  document.documentElement.style.setProperty("--inclinacao-scroll", anguloAtual.toFixed(2) + "deg");
  requestAnimationFrame(animarIcones);
}
animarIcones();

// ======================================================
// INÍCIO
// ======================================================
renderCardapio();
atualizarTudo();