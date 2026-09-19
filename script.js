// ======================================================
// CONFIGURAÇÕES RÁPIDAS
// ======================================================

const FIM_DA_FEIRA = new Date("2026-09-20T22:00:00");
const INTERVALO_CARROSSEL = 3000;
const SENHA_ADMIN = "Preve2026";

const CHAVE_PIX = "SUA_CHAVE_PIX_AQUI";
const NOME_RECEBEDOR = "SEU NOME AQUI";
const CIDADE_RECEBEDOR = "SUA CIDADE";

// Cor de fundo pra cada banner (na mesma ordem: banner1, banner2, banner3, banner4).
// O banner1 (Guaraná) já ficou perfeito, então mantive o padrão verde/azul.
// Se a ordem dos seus banners for diferente (ex: se o banner2 não for a Coca),
// é só trocar a posição delas aqui nesse array.
const CORES_FUNDO_BANNERS = [
  // banner1 — Guaraná (verde)
  "radial-gradient(circle at 0% 0%, rgba(19, 219, 69, 0.72) 0%, transparent 55%), radial-gradient(circle at 100% 0%, rgba(32, 206, 40, 0.6) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(60,170,220,0.4) 0%, transparent 58%), radial-gradient(circle at 100% 100%, rgba(31,174,102,0.4) 0%, transparent 58%)",
  // banner2 — Coca-Cola (vermelho)
  "radial-gradient(circle at 0% 0%, rgb(16, 96, 170) 0%, transparent 55%), radial-gradient(circle at 100% 0%, rgba(26, 28, 194, 0.42) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(255,130,100,0.4) 0%, transparent 58%), radial-gradient(circle at 100% 100%, rgba(214,40,40,0.4) 0%, transparent 58%)",
  // banner3 — Suco de uva (roxo)
  "radial-gradient(circle at 0% 0%, rgba(192, 49, 44, 0.67) 0%, transparent 55%), radial-gradient(circle at 100% 0%, rgba(194, 60, 51, 0.4) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(185,100,210,0.4) 0%, transparent 58%), radial-gradient(circle at 100% 100%, rgba(122,45,155,0.38) 0%, transparent 58%)",
  // banner4 — Água (azul)
  "radial-gradient(circle at 0% 0%, rgba(10, 117, 184, 0.64) 0%, transparent 55%), radial-gradient(circle at 100% 0%, rgba(23, 126, 167, 0.42) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(100,195,235,0.4) 0%, transparent 58%), radial-gradient(circle at 100% 100%, rgba(28,135,200,0.38) 0%, transparent 58%)",
];
// ======================================================
// CARDÁPIO — as imagens vêm da pasta "imagens"
// ======================================================
const cardapio = [
  { id: 1, imagem: "imagens/coca-cola.png", selo: "Clássica", nome: "Coca-Cola Lata", desc: "A clássica, gelada e borbulhante que combina com qualquer roda de conversa na feira.", preco: 6 },
  { id: 2, imagem: "imagens/coca-cola-zero.png", selo: "Zero açúcar", nome: "Coca-Cola Zero Lata", desc: "Todo o sabor de sempre, sem açúcar — pra curtir a feira inteira sem peso na consciência.", preco: 6 },
  { id: 3, imagem: "imagens/guarana.png", selo: "Favorita", nome: "Guaraná Antarctica Lata", desc: "O queridinho brasileiro, docinho e cheio de bolhas de alegria.", preco: 6 },
  { id: 4, imagem: "imagens/guarana-zero.png", selo: "Zero açúcar", nome: "Guaraná Antarctica Zero Lata", desc: "Aquele guaraná de sempre, só que na versão levinha pro seu dia de feira.", preco: 6 },
  { id: 5, imagem: "imagens/agua.png", selo: "Hidrata", nome: "Água Mineral", desc: "Pra hidratar com estilo entre uma dança e outra da feira.", preco: 4 },
  { id: 6, imagem: "imagens/suco-uva.png", selo: "Refrescante", nome: "Suco de Uva Del Valle Lata", desc: "Uva roxa bem suculenta numa latinha gelada, direto pra sua mão.", preco: 6 },
];

const mensagensRetirada = () => [
  "Sua bebida já tá te esperando na banca, geladinha e com nome sujo se você demorar! 😄",
  "Pedido certinho! Vai lá buscar antes que a sede vença a preguiça 🥤",
  "Prontinho! Sua bebida tá contando os segundos pra sair do gelo e chegar na sua mão 🧊",
  "Feito! Passa na banca, a gente já deixou sua bebida separadinha com carinho 💛",
  "Boa escolha! Agora é só ir até a banca — a entrega promete ser mais rápida que a fila do banheiro 😂",
  "Pedido recebido! Vai lá buscar sua bebida antes que ela fique com inveja do gelo e comece a esquentar 🥵",
  "Prontinho! Sua bebida já tá na banca fazendo hora extra só esperando por você 💦",
  "Sua bebida geladinha já tá na banca! Ah, e se aparecer alguém de peruca vermelha com um pouco de tinta azul na cara pra te entregar, relaxa — é só a animação da equipe em pessoa 😄",
];

// ======================================================
// ESTADO
// ======================================================
let carrinho = {};
let pagamentoEscolhido = null;
let cartaoEscolhido = null;
let pedidoJaFinalizado = false;
let pedidosFinalizados = [];

const formatoMoeda = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ======================================================
// TOAST
// ======================================================
let toastTimeout = null;

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.classList.remove("mostrando");
  void toast.offsetWidth;
  toast.classList.add("mostrando");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("mostrando"), 1600);
}

// ======================================================
// FUNDO QUE TROCA DE COR (efeito LED, crossfade entre 2 camadas)
// ======================================================
let camadaFundoAtiva = null;
let camadaFundoInativa = null;

function iniciarFundoDinamico() {
  camadaFundoAtiva = document.getElementById("fundo-a");
  camadaFundoInativa = document.getElementById("fundo-b");

  // aplica a primeira cor sem fade, pra já começar certo
  camadaFundoAtiva.style.background = CORES_FUNDO_BANNERS[0];
  camadaFundoAtiva.classList.add("visivel");
}

function mudarCorFundo(indice) {
  if (!camadaFundoAtiva || !camadaFundoInativa) return;
  const gradiente = CORES_FUNDO_BANNERS[indice] || CORES_FUNDO_BANNERS[0];

  camadaFundoInativa.style.background = gradiente;
  camadaFundoInativa.classList.add("visivel");
  camadaFundoAtiva.classList.remove("visivel");

  const temp = camadaFundoAtiva;
  camadaFundoAtiva = camadaFundoInativa;
  camadaFundoInativa = temp;
}

// ======================================================
// CARROSSEL
// ======================================================
function iniciarCarrossel() {
  const imagens = Array.from(document.querySelectorAll(".carrossel-imagem"));
  const containerPontos = document.getElementById("carrossel-pontos");
  if (imagens.length === 0) return;

  let indiceAtual = 0;

  containerPontos.innerHTML = imagens
    .map((_, indice) => `<button class="ponto${indice === 0 ? " ativo" : ""}" data-indice="${indice}" aria-label="Ir para imagem ${indice + 1}"></button>`)
    .join("");

  const pontos = Array.from(containerPontos.querySelectorAll(".ponto"));

  function mostrarImagem(indice) {
    imagens.forEach((img, i) => img.classList.toggle("ativa", i === indice));
    pontos.forEach((ponto, i) => ponto.classList.toggle("ativo", i === indice));
    indiceAtual = indice;
    mudarCorFundo(indice);
  }

  let autoplay = setInterval(avancar, INTERVALO_CARROSSEL);

  function reiniciarAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(avancar, INTERVALO_CARROSSEL);
  }

  function avancar() { mostrarImagem((indiceAtual + 1) % imagens.length); }
  function voltar() { mostrarImagem((indiceAtual - 1 + imagens.length) % imagens.length); }

  pontos.forEach((ponto) => {
    ponto.addEventListener("click", () => {
      mostrarImagem(Number(ponto.dataset.indice));
      reiniciarAutoplay();
    });
  });

  document.getElementById("seta-proxima").addEventListener("click", () => { avancar(); reiniciarAutoplay(); });
  document.getElementById("seta-anterior").addEventListener("click", () => { voltar(); reiniciarAutoplay(); });
}

// ======================================================
// RENDER — CARDÁPIO
// ======================================================
function renderCardapio() {
  const grade = document.getElementById("grade-cardapio");
  grade.innerHTML = cardapio
    .map((item) => `
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
    </div>`)
    .join("");

  grade.querySelectorAll("[data-qtd-acao]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = botao.dataset.id;
      const span = document.getElementById(`qtd-${id}`);
      let valor = Number(span.textContent);
      valor = botao.dataset.qtdAcao === "mais" ? Math.min(20, valor + 1) : Math.max(1, valor - 1);
      span.textContent = valor;
    });
  });

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

      span.textContent = 1;
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
      .map((item) => `
      <div class="linha-carrinho">
        <div class="imagem-mini"><img src="${item.imagem}" alt="${item.nome}"></div>
        <div class="linha-info">
          <div class="linha-nome">${item.nome}</div>
          <div class="linha-preco">${formatoMoeda(item.preco)}</div>
        </div>
        <div class="quantidade">
          <button data-id="${item.id}" data-acao="menos">−</button>
          <span>${item.qtd}</span>
          <button data-id="${item.id}" data-acao="mais">+</button>
        </div>
      </div>`)
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
// RENDER — RESUMO FINALIZAR
// ======================================================
function renderResumoFinal() {
  const container = document.getElementById("resumo-final");
  const itens = itensDoCarrinho();

  if (itens.length === 0) {
    container.innerHTML = `<p>Adicione bebidas no cardápio antes de finalizar 🙂</p>`;
    return;
  }

  const linhas = itens
    .map((item) => `
      <div class="linha-resumo">
        <span>${item.qtd}× ${item.nome}</span>
        <span>${formatoMoeda(item.preco * item.qtd)}</span>
      </div>`)
    .join("");

  container.innerHTML = `${linhas}<div class="linha-resumo total"><span>Total</span><span>${formatoMoeda(calcularTotal())}</span></div>`;
}

// ======================================================
// CONTADOR + BARRA FLUTUANTE
// ======================================================
function atualizarContador() {
  const total = Object.values(carrinho).reduce((a, b) => a + b, 0);
  document.getElementById("contador-carrinho").textContent = total;
}

function atualizarBarraFlutuante() {
  const barra = document.getElementById("barra-flutuante");
  const painelCardapioAtivo = document.getElementById("painel-cardapio").classList.contains("ativo");
  const itens = itensDoCarrinho();
  const totalItens = itens.reduce((a, i) => a + i.qtd, 0);

  if (itens.length > 0 && painelCardapioAtivo) {
    barra.classList.remove("escondido");
    document.getElementById("barra-flutuante-info").textContent =
      `${totalItens} ${totalItens === 1 ? "item" : "itens"} • ${formatoMoeda(calcularTotal())}`;
  } else {
    barra.classList.add("escondido");
  }
}

function atualizarTudo() {
  renderCarrinho();
  renderResumoFinal();
  atualizarContador();
  atualizarBotaoFinalizar();
  atualizarBarraFlutuante();
}

// ======================================================
// ABAS
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
  atualizarBarraFlutuante();
}

document.querySelectorAll(".aba").forEach((btn) => btn.addEventListener("click", () => mudarAba(btn.dataset.aba)));
document.getElementById("botao-carrinho").addEventListener("click", () => mudarAba("carrinho"));
document.getElementById("botao-ver-carrinho").addEventListener("click", () => mudarAba("carrinho"));

document.getElementById("ir-para-finalizar").addEventListener("click", () => {
  document.querySelectorAll(".aba").forEach((btn) => btn.classList.remove("ativa"));
  document.querySelectorAll(".painel").forEach((painel) => painel.classList.remove("ativo"));
  document.getElementById("painel-finalizar").classList.add("ativo");
  atualizarBarraFlutuante();
});

// ======================================================
// FORMA DE PAGAMENTO
// ======================================================
const blocoCartao = document.getElementById("bloco-cartao");

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
// BOTÃO FINALIZAR
// ======================================================
function atualizarBotaoFinalizar() {
  const btn = document.getElementById("btn-finalizar");
  if (pedidoJaFinalizado) { btn.disabled = true; return; }

  const temItens = itensDoCarrinho().length > 0;
  const pagamentoCompleto =
    pagamentoEscolhido === "dinheiro" ||
    pagamentoEscolhido === "pix" ||
    (pagamentoEscolhido === "cartao" && cartaoEscolhido !== null);

  btn.disabled = !(temItens && pagamentoCompleto);
}

// ======================================================
// QR CODE PIX
// ======================================================
function calcularCRC16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function campoPix(id, valor) {
  const tamanho = String(valor.length).padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

function gerarPayloadPix(valor) {
  const valorFormatado = valor.toFixed(2);
  const nome = NOME_RECEBEDOR.substring(0, 25);
  const cidade = CIDADE_RECEBEDOR.substring(0, 15);

  const gui = campoPix("00", "br.gov.bcb.pix");
  const chave = campoPix("01", CHAVE_PIX);
  const contaMerchant = campoPix("26", gui + chave);

  const payloadSemCrc =
    campoPix("00", "01") +
    contaMerchant +
    campoPix("52", "0000") +
    campoPix("53", "986") +
    campoPix("54", valorFormatado) +
    campoPix("58", "BR") +
    campoPix("59", nome) +
    campoPix("60", cidade) +
    campoPix("62", campoPix("05", "***")) +
    "6304";

  return payloadSemCrc + calcularCRC16(payloadSemCrc);
}

// ======================================================
// FINALIZAR PEDIDO
// ======================================================
document.getElementById("form-pedido").addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (pedidoJaFinalizado) return;

  const itens = itensDoCarrinho();
  const total = calcularTotal();

  pedidoJaFinalizado = true;
  atualizarBotaoFinalizar();

  pedidosFinalizados.push({
    itens: itens.map((i) => ({ nome: i.nome, qtd: i.qtd, preco: i.preco })),
    total,
    pagamento: pagamentoEscolhido,
    cartao: cartaoEscolhido,
    dataHora: new Date(),
  });

  const mensagens = mensagensRetirada();
  document.getElementById("mensagem-fofa").textContent = mensagens[Math.floor(Math.random() * mensagens.length)];

  const blocoPix = document.getElementById("bloco-pix");
  if (pagamentoEscolhido === "pix") {
    const payload = gerarPayloadPix(total);
    document.getElementById("qr-pix").src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
    document.getElementById("valor-pix-texto").textContent = formatoMoeda(total);
    blocoPix.classList.remove("escondido");
  } else {
    blocoPix.classList.add("escondido");
  }

  document.getElementById("form-pedido").classList.add("escondido");
  document.getElementById("confirmacao").classList.remove("escondido");
});

document.getElementById("novo-pedido").addEventListener("click", () => {
  carrinho = {};
  pedidoJaFinalizado = false;

  limparSelecaoPagamento();

  document.querySelectorAll('[id^="qtd-"]').forEach((span) => {
    span.textContent = "1";
  });

  atualizarTudo();

  document.getElementById("form-pedido").classList.remove("escondido");
  document.getElementById("confirmacao").classList.add("escondido");
  mudarAba("cardapio");
});

// ======================================================
// ÁREA RESTRITA
// ======================================================
const modalSenha = document.getElementById("modal-senha");
const painelAdmin = document.getElementById("painel-admin");
const campoSenhaAdmin = document.getElementById("campo-senha-admin");
const modalErro = document.getElementById("modal-erro");

document.getElementById("botao-admin").addEventListener("click", () => {
  campoSenhaAdmin.value = "";
  modalErro.classList.add("escondido");
  modalSenha.classList.remove("escondido");
  campoSenhaAdmin.focus();
});

document.getElementById("cancelar-admin").addEventListener("click", () => {
  modalSenha.classList.add("escondido");
});

function tentarEntrarAdmin() {
  if (campoSenhaAdmin.value === SENHA_ADMIN) {
    modalSenha.classList.add("escondido");
    renderPedidosAdmin();
    painelAdmin.classList.remove("escondido");
  } else {
    modalErro.classList.remove("escondido");
  }
}

document.getElementById("confirmar-admin").addEventListener("click", tentarEntrarAdmin);
campoSenhaAdmin.addEventListener("keydown", (evento) => { if (evento.key === "Enter") tentarEntrarAdmin(); });

function rotuloPagamentoPedido(pedido) {
  if (pedido.pagamento === "dinheiro") return "💵 Dinheiro";
  if (pedido.pagamento === "pix") return "📱 Pix";
  if (pedido.pagamento === "cartao") return `💳 Cartão (${pedido.cartao === "credito" ? "Crédito" : "Débito"})`;
  return pedido.pagamento;
}

function renderPedidosAdmin() {
  const container = document.getElementById("lista-pedidos-admin");

  if (pedidosFinalizados.length === 0) {
    container.innerHTML = `<div class="pedido-admin-vazio">Nenhum pedido finalizado ainda.</div>`;
    return;
  }

  container.innerHTML = pedidosFinalizados
    .map((pedido, indice) => {
      const hora = pedido.dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const itensTexto = pedido.itens.map((i) => `${i.qtd}× ${i.nome}`).join(", ");
      return `
      <div class="pedido-admin-item">
        <div class="pedido-admin-topo">
          <span>Pedido #${indice + 1} — ${hora}</span>
          <span>${formatoMoeda(pedido.total)}</span>
        </div>
        <div class="pedido-admin-itens">${itensTexto}</div>
        <div class="pedido-admin-itens">${rotuloPagamentoPedido(pedido)}</div>
      </div>`;
    })
    .reverse()
    .join("");
}

document.getElementById("fechar-admin").addEventListener("click", () => {
  painelAdmin.classList.add("escondido");
  mudarAba("cardapio");
});

// ======================================================
// CONTAGEM REGRESSIVA
// ======================================================
function atualizarContagem() {
  const elemento = document.getElementById("contagem-numeros");
  const agora = new Date();
  const diferenca = FIM_DA_FEIRA - agora;

  if (diferenca <= 0) { elemento.textContent = "Encerrado"; return; }

  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
  const segundos = Math.floor((diferenca / 1000) % 60);
  const dois = (n) => String(n).padStart(2, "0");

  elemento.textContent = dias > 0 ? `${dias}d ${dois(horas)}h ${dois(minutos)}m` : `${dois(horas)}:${dois(minutos)}:${dois(segundos)}`;
}

setInterval(atualizarContagem, 1000);
atualizarContagem();

// ======================================================
// EFEITO DE BALANÇO AO ROLAR
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
iniciarFundoDinamico();
iniciarCarrossel();