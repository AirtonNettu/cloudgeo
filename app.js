
/**
 * CloudGeo — AWS Regions Explorer
 *
 * Aplicação interativa para explorar regiões AWS
 * em um mapa geográfico.
 *
 * Tecnologias: JavaScript, Leaflet e OpenStreetMap.
 */

// ==================================================
// 1. INICIALIZAÇÃO DO MAPA
// ==================================================

const mapa = L.map("mapa").setView([15, 0], 2);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18
  }
).addTo(mapa);

// ==================================================
// 2. ELEMENTOS DA INTERFACE
// ==================================================

const busca = document.getElementById("busca");
const continente = document.getElementById("continente");
const contador = document.getElementById("contador");

// Indicadores do dashboard
const totalRegioes = document.getElementById("total-regioes");
const totalContinentes = document.getElementById("total-continentes");
const regioesVisiveis = document.getElementById("regioes-visiveis");

// Painel de informações
const detalhesRegiao = document.getElementById("detalhes-regiao");

// Camada responsável pelos marcadores
const marcadores = L.layerGroup().addTo(mapa);

// Dados carregados do JSON
let regioes = [];

// ==================================================
// 3. PAINEL DE DETALHES
// ==================================================

/**
 * Exibe informações da região selecionada.
 *
 * @param {Object} regiao - Dados da região AWS.
 */
function mostrarDetalhes(regiao) {
  detalhesRegiao.replaceChildren();

  const titulo = document.createElement("h2");
  titulo.textContent = `☁️ ${regiao.nome}`;

  const informacoes = [
    ["Código AWS", regiao.codigo],
    ["Cidade", regiao.cidade],
    ["País", regiao.pais],
    ["Continente", regiao.continente]
  ];

  detalhesRegiao.appendChild(titulo);

  informacoes.forEach(([rotulo, valor]) => {
    const paragrafo = document.createElement("p");
    const destaque = document.createElement("strong");

    destaque.textContent = `${rotulo}: `;

    paragrafo.append(
      destaque,
      document.createTextNode(valor)
    );

    detalhesRegiao.appendChild(paragrafo);
  });
}

// ==================================================
// 4. RENDERIZAÇÃO E FILTROS
// ==================================================

/**
 * Filtra as regiões e atualiza os marcadores.
 */
function renderizarRegioes() {
  // Remove os marcadores anteriores
  marcadores.clearLayers();

  const texto = busca.value.toLowerCase().trim();
  const filtro = continente.value;

  // Filtra regiões por texto e continente
  const filtradas = regioes.filter(regiao => {
    const correspondeBusca = [
      regiao.nome,
      regiao.codigo,
      regiao.cidade,
      regiao.pais
    ].some(valor =>
      valor.toLowerCase().includes(texto)
    );

    return correspondeBusca &&
      (!filtro || regiao.continente === filtro);
  });

  // Cria um marcador para cada região
  filtradas.forEach(regiao => {
    const marcador = L.marker([
      regiao.latitude,
      regiao.longitude
    ]);

    // Informações exibidas no pop-up do mapa
    const painel = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = regiao.nome;

    const detalhes = document.createElement("p");
    detalhes.textContent =
      `${regiao.codigo} | ${regiao.pais}`;

    painel.append(titulo, detalhes);

    marcador.bindPopup(painel);

    // Atualiza o painel ao clicar no marcador
    marcador.on("click", () => {
      mostrarDetalhes(regiao);
    });

    marcador.addTo(marcadores);
  });

  // Atualiza a quantidade de regiões encontradas
  contador.textContent =
    `${filtradas.length} regiões encontradas`;

  // Atualiza o dashboard
  regioesVisiveis.textContent = filtradas.length;

  // Ajusta o mapa às regiões filtradas
  if (filtradas.length > 0) {
    const limites = L.latLngBounds(
      filtradas.map(regiao => [
        regiao.latitude,
        regiao.longitude
      ])
    );

    mapa.fitBounds(limites, {
      padding: [35, 35],
      maxZoom: 5
    });
  }
}

// ==================================================
// 5. CARREGAMENTO DOS DADOS
// ==================================================

/**
 * Busca o arquivo JSON e inicializa a aplicação.
 */
async function inicializar() {
  try {
    const resposta = await fetch("./dados/regioes.json");

    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP: ${resposta.status}`
      );
    }

    regioes = await resposta.json();

    // Total de regiões disponíveis
    totalRegioes.textContent = regioes.length;

    // Total de continentes diferentes
    totalContinentes.textContent = new Set(
      regioes.map(regiao => regiao.continente)
    ).size;

    // Identifica os continentes disponíveis
    const continentes = [
      ...new Set(
        regioes.map(regiao => regiao.continente)
      )
    ].sort();

    // Cria as opções do filtro
    continentes.forEach(nome => {
      const opcao = document.createElement("option");

      opcao.value = nome;
      opcao.textContent = nome;

      continente.appendChild(opcao);
    });

    // Desenha as regiões no mapa
    renderizarRegioes();

  } catch (erro) {
    console.error(
      "Erro ao carregar regiões AWS:",
      erro
    );

    contador.textContent =
      "Não foi possível carregar as regiões.";

    totalRegioes.textContent = "—";
    totalContinentes.textContent = "—";
    regioesVisiveis.textContent = "—";
  }
}

// ==================================================
// 6. EVENTOS DA INTERFACE
// ==================================================

// Atualiza o mapa enquanto o usuário digita
busca.addEventListener(
  "input",
  renderizarRegioes
);

// Atualiza o mapa quando o continente muda
continente.addEventListener(
  "change",
  renderizarRegioes
);

// ==================================================
// 7. INICIALIZAÇÃO DA APLICAÇÃO
// ==================================================

inicializar();
