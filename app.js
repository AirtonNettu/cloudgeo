
const mapa = L.map("mapa").setView([15, 0], 2);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }
).addTo(mapa);

const busca = document.getElementById("busca");
const continente = document.getElementById("continente");
const contador = document.getElementById("contador");

const marcadores = L.layerGroup().addTo(mapa);

let regioes = [];

function renderizarRegioes() {
  marcadores.clearLayers();

  const texto = busca.value.toLowerCase().trim();
  const filtro = continente.value;

  const filtradas = regioes.filter(regiao => {
    const correspondeBusca = [
      regiao.nome,
      regiao.codigo,
      regiao.cidade,
      regiao.pais
    ].some(valor => valor.toLowerCase().includes(texto));

    return correspondeBusca &&
      (!filtro || regiao.continente === filtro);
  });

  filtradas.forEach(regiao => {
    const marcador = L.marker([
      regiao.latitude,
      regiao.longitude
    ]);

    const painel = document.createElement("div");
    const titulo = document.createElement("strong");
    const detalhes = document.createElement("p");

    titulo.textContent = regiao.nome;
    detalhes.textContent =
      `${regiao.codigo} | ${regiao.pais}`;

    painel.append(titulo, detalhes);

    marcador.bindPopup(painel);
    marcador.addTo(marcadores);
  });

  contador.textContent =
    `${filtradas.length} regiões encontradas`;

  if (filtradas.length > 0) {
    const limites = L.latLngBounds(
      filtradas.map(r => [r.latitude, r.longitude])
    );

    mapa.fitBounds(limites, {
      padding: [35, 35],
      maxZoom: 5
    });
  }
}

async function inicializar() {
  try {
    const resposta = await fetch("./dados/regioes.json");

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    regioes = await resposta.json();

    const continentes = [
      ...new Set(regioes.map(r => r.continente))
    ].sort();

    continentes.forEach(nome => {
      const opcao = document.createElement("option");
      opcao.value = nome;
      opcao.textContent = nome;
      continente.appendChild(opcao);
    });

    renderizarRegioes();
  } catch (erro) {
    console.error(erro);
    contador.textContent =
      "Não foi possível carregar as regiões.";
  }
}

busca.addEventListener("input", renderizarRegioes);
continente.addEventListener("change", renderizarRegioes);

inicializar();
