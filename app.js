/**
 * CloudGeo 2.0 — AWS Global Infrastructure Explorer
 *
 * Aplicação interativa para explorar a infraestrutura global da AWS:
 * Regiões, Local Zones e CloudFront Points of Presence (Edge Locations).
 *
 * Tecnologias: JavaScript (Vanilla ES6+), Leaflet.js, MarkerCluster e OpenStreetMap.
 * Arquitetura: 100% estática, compatível com AWS Amplify Hosting.
 */

// ==================================================
// 1. INICIALIZAÇÃO DO MAPA
// ==================================================

const mapa = L.map("mapa", {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 18,
  worldCopyJump: true
});

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | AWS Infrastructure Data',
    maxZoom: 18
  }
).addTo(mapa);

// Camada de agrupamento de marcadores (MarkerCluster com fallback defensivo)
const grupoMarcadores = typeof L.markerClusterGroup === "function"
  ? L.markerClusterGroup({
      maxClusterRadius: 40,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 11
    }).addTo(mapa)
  : L.layerGroup().addTo(mapa);

// ==================================================
// 2. ELEMENTOS DA INTERFACE
// ==================================================

// Controles de busca e filtro
const busca = document.getElementById("busca");
const continente = document.getElementById("continente");
const contador = document.getElementById("contador");

// Filtros de categoria (camadas independentes)
const filtroRegioes = document.getElementById("filtro-regioes");
const filtroLocalZones = document.getElementById("filtro-localzones");
const filtroCloudfront = document.getElementById("filtro-cloudfront");
const btnResetFiltros = document.getElementById("btn-reset-filtros");

// Badges dos filtros de categoria
const badgeRegioes = document.getElementById("badge-regioes");
const badgeLocalzones = document.getElementById("badge-localzones");
const badgeCloudfront = document.getElementById("badge-cloudfront");

// Indicadores do dashboard
const totalRegioes = document.getElementById("total-regioes");
const totalLocalZones = document.getElementById("total-local-zones");
const totalCloudfront = document.getElementById("total-cloudfront");
const totalContinentes = document.getElementById("total-continentes");
const regioesVisiveis = document.getElementById("regioes-visiveis");

// Painel de informações
const detalhesRegiao = document.getElementById("detalhes-regiao");

// ==================================================
// 3. ESTADO DA APLICAÇÃO
// ==================================================

let catalogoRegioes = [];
let catalogoLocalZones = [];
let catalogoCloudFront = [];
let todosPontos = [];

// ==================================================
// 4. CRIADORES DE ÍCONES CUSTOMIZADOS
// ==================================================

/**
 * Cria um ícone HTML customizado baseado no tipo de infraestrutura AWS.
 *
 * @param {string} tipo - "regiao", "local_zone" ou "cloudfront_pop".
 * @returns {L.DivIcon} Ícone Leaflet estilizado.
 */
function criarIconeInfraestrutura(tipo) {
  let classe = "marker-regiao";
  let simbolo = "☁️";
  let tamanho = 28;

  if (tipo === "local_zone") {
    classe = "marker-localzone";
    simbolo = "⚡";
    tamanho = 26;
  } else if (tipo === "cloudfront_pop") {
    classe = "marker-cloudfront";
    simbolo = "🌐";
    tamanho = 24;
  }

  return L.divIcon({
    className: `custom-marker ${classe}`,
    html: `<span>${simbolo}</span>`,
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho / 2],
    popupAnchor: [0, -tamanho / 2]
  });
}

// ==================================================
// 5. PAINEL DE DETALHES
// ==================================================

/**
 * Exibe as informações detalhadas do ponto de infraestrutura selecionado.
 *
 * @param {Object} ponto - Dados da entidade AWS.
 */
function mostrarDetalhes(ponto) {
  detalhesRegiao.replaceChildren();

  // Atualiza classe de destaque da borda
  detalhesRegiao.className = "detalhes";
  if (ponto.tipo === "local_zone") {
    detalhesRegiao.classList.add("tipo-localzone");
  } else if (ponto.tipo === "cloudfront_pop") {
    detalhesRegiao.classList.add("tipo-cloudfront");
  }

  // Cabeçalho dos detalhes
  const cabecalho = document.createElement("div");
  cabecalho.className = "detalhes-header";

  const titulo = document.createElement("h2");
  const icone = ponto.tipo === "regiao" ? "☁️" : ponto.tipo === "local_zone" ? "⚡" : "🌐";
  titulo.textContent = `${icone} ${ponto.nome}`;

  const tagCategoria = document.createElement("span");
  tagCategoria.className = "popup-tag";

  if (ponto.tipo === "regiao") {
    tagCategoria.classList.add("tag-regiao");
    tagCategoria.textContent = ponto.tipoRegiao === "AWS GovCloud"
      ? "AWS GovCloud"
      : ponto.tipoRegiao === "AWS China"
      ? "AWS China"
      : ponto.tipoRegiao === "AWS European Sovereign Cloud"
      ? "European Sovereign Cloud"
      : "Região AWS";
  } else if (ponto.tipo === "local_zone") {
    tagCategoria.classList.add("tag-localzone");
    tagCategoria.textContent = "AWS Local Zone";
  } else {
    tagCategoria.classList.add("tag-cloudfront");
    tagCategoria.textContent = "CloudFront PoP";
  }

  cabecalho.append(titulo, tagCategoria);
  detalhesRegiao.appendChild(cabecalho);

  // Metadados em grid semântico
  const grid = document.createElement("div");
  grid.className = "detalhes-grid";

  const informacoes = [];

  if (ponto.tipo === "regiao") {
    informacoes.push(["Código da Região", ponto.codigo]);
    informacoes.push(["Tipo de Região", ponto.tipoRegiao || "Comercial Padrão"]);
    informacoes.push(["Partição AWS", ponto.particao || "aws"]);
    informacoes.push(["Cidade Principal", ponto.cidade]);
    informacoes.push(["País", ponto.pais]);
    informacoes.push(["Continente", ponto.continente]);
    if (ponto.operador && ponto.operador !== "Amazon Web Services (AWS)") {
      informacoes.push(["Operador Autorizado", ponto.operador]);
    }
    if (ponto.zonasDisponibilidade) {
      informacoes.push(["Zonas de Disponibilidade", `${ponto.zonasDisponibilidade} AZs`]);
    }
    if (ponto.anoLancamento) {
      informacoes.push(["Ano de Lançamento", `${ponto.anoLancamento}`]);
    }
  } else if (ponto.tipo === "local_zone") {
    informacoes.push(["Código da Zona", ponto.codigo]);
    informacoes.push(["Cidade", ponto.cidade]);
    informacoes.push(["País", ponto.pais]);
    informacoes.push(["Continente", ponto.continente]);
    informacoes.push(["Região Pai (Parent)", `${ponto.regiaoPaiNome || ponto.regiaoPai} (${ponto.regiaoPai})`]);
  } else {
    informacoes.push(["Tipo de Infraestrutura", "Point of Presence (Cidade com PoP)"]);
    informacoes.push(["Cidade Sede Catalogada", ponto.cidade]);
    informacoes.push(["País", ponto.pais]);
    informacoes.push(["Continente", ponto.continente]);
    informacoes.push(["Serviços Principais", "Amazon CloudFront & Route 53"]);
  }

  informacoes.push([
    "Coordenadas Metropolitanas",
    `${ponto.latitude.toFixed(4)}, ${ponto.longitude.toFixed(4)}`
  ]);

  if (ponto.estadoOperacional) {
    informacoes.push(["Estado Operacional", ponto.estadoOperacional === "operacional" ? "Operacional (GA)" : ponto.estadoOperacional]);
  }
  if (ponto.dataUltimaVerificacao) {
    informacoes.push(["Última Verificação", ponto.dataUltimaVerificacao]);
  }

  informacoes.forEach(([rotulo, valor]) => {
    const item = document.createElement("div");
    item.className = "detalhes-item";

    const labelStrong = document.createElement("strong");
    labelStrong.textContent = rotulo;

    const spanValor = document.createElement("span");
    spanValor.textContent = valor;

    item.append(labelStrong, spanValor);
    grid.appendChild(item);
  });

  detalhesRegiao.appendChild(grid);

  // Descrição conceitual educativa
  const descricao = document.createElement("div");
  descricao.className = "detalhes-descricao";

  if (ponto.tipo === "regiao") {
    if (ponto.descricaoEscopo) {
      descricao.textContent = ponto.descricaoEscopo;
    } else {
      descricao.textContent =
        "Uma Região AWS Comercial Padrão é uma área geográfica isolada composta por múltiplos data centers redundantes agrupados em Zonas de Disponibilidade (AZs). Projetada para fornecer alta disponibilidade, tolerância a falhas e residência de dados completa.";
    }
  } else if (ponto.tipo === "local_zone") {
    descricao.textContent =
      `Uma AWS Local Zone é uma extensão que aproxima serviços de computação e armazenamento de centros metropolitanos sem Região AWS dedicada. Seu plano de controle está ancorado na região ${ponto.regiaoPai}, fornecendo latência de um dígito em milissegundos (< 10 ms).`;
  } else {
    descricao.textContent =
      "Esta entrada cataloga a cidade sede oficial de Points of Presence (PoPs) do Amazon CloudFront. Metrópoles de alta demanda física abrigam múltiplos PoPs e Regional Edge Caches simultâneos, reduzindo latência para usuários finais via CDN e DNS Route 53 com mitigação DDoS integrada.";
  }

  detalhesRegiao.appendChild(descricao);

  if (ponto.fonteOficial) {
    const linkDiv = document.createElement("div");
    linkDiv.className = "detalhes-fonte";
    const linkA = document.createElement("a");
    linkA.href = ponto.fonteOficial;
    linkA.target = "_blank";
    linkA.rel = "noopener noreferrer";
    linkA.textContent = "↗ Consultar Documentação Oficial AWS";
    linkDiv.appendChild(linkA);
    detalhesRegiao.appendChild(linkDiv);
  }

  // Em telas móveis, rola suavemente para o painel se estiver abaixo do viewport
  if (window.innerWidth <= 768) {
    detalhesRegiao.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// ==================================================
// 6. RENDERIZAÇÃO E FILTROS DINÂMICOS
// ==================================================

/**
 * Cria o elemento DOM para o popup do Leaflet.
 *
 * @param {Object} ponto - Dados da entidade AWS.
 * @returns {HTMLElement} Elemento DOM seguro para o popup.
 */
function criarPainelPopup(ponto) {
  const painel = document.createElement("div");
  painel.className = "popup-conteudo";

  const tag = document.createElement("span");
  tag.className = "popup-tag";

  if (ponto.tipo === "regiao") {
    tag.classList.add("tag-regiao");
    tag.textContent = ponto.tipoRegiao === "AWS GovCloud"
      ? "AWS GovCloud"
      : ponto.tipoRegiao === "AWS China"
      ? "AWS China"
      : ponto.tipoRegiao === "AWS European Sovereign Cloud"
      ? "European Sovereign Cloud"
      : "Região AWS";
  } else if (ponto.tipo === "local_zone") {
    tag.classList.add("tag-localzone");
    tag.textContent = "Local Zone";
  } else {
    tag.classList.add("tag-cloudfront");
    tag.textContent = "CloudFront (Cidade)";
  }

  const titulo = document.createElement("div");
  titulo.className = "popup-titulo";
  titulo.textContent = ponto.nome;

  const detalhes = document.createElement("p");
  detalhes.className = "popup-detalhe";

  if (ponto.tipo === "regiao") {
    detalhes.textContent = `${ponto.codigo} · ${ponto.cidade}, ${ponto.pais} (${ponto.tipoRegiao || "Comercial"})`;
  } else if (ponto.tipo === "local_zone") {
    detalhes.textContent = `${ponto.codigo} · Região Pai: ${ponto.regiaoPai}`;
  } else {
    detalhes.textContent = `${ponto.cidade}, ${ponto.pais} · Rede de Borda`;
  }

  painel.append(tag, titulo, detalhes);
  return painel;
}

/**
 * Filtra todos os pontos de acordo com os filtros de texto, continente e categorias ativas.
 */
function renderizarPontos() {
  grupoMarcadores.clearLayers();

  const texto = busca.value.toLowerCase().trim();
  const filtroContinente = continente.value;

  const exibirRegioes = filtroRegioes.checked;
  const exibirLocalZones = filtroLocalZones.checked;
  const exibirCloudfront = filtroCloudfront.checked;

  let contRegioesVisiveis = 0;
  let contLocalZonesVisiveis = 0;
  let contCloudfrontVisiveis = 0;

  // Filtra os pontos do catálogo unificado
  const filtrados = todosPontos.filter(ponto => {
    // 1. Checagem de categoria ativada
    if (ponto.tipo === "regiao" && !exibirRegioes) return false;
    if (ponto.tipo === "local_zone" && !exibirLocalZones) return false;
    if (ponto.tipo === "cloudfront_pop" && !exibirCloudfront) return false;

    // 2. Checagem de continente
    if (filtroContinente && ponto.continente !== filtroContinente) {
      return false;
    }

    // 3. Checagem de texto na busca
    if (texto) {
      const camposBusca = [
        ponto.nome || "",
        ponto.codigo || "",
        ponto.cidade || "",
        ponto.pais || "",
        ponto.continente || "",
        ponto.regiaoPai || "",
        ponto.regiaoPaiNome || "",
        ponto.tipoRegiao || "",
        ponto.particao || "",
        ponto.operador || ""
      ];

      const combinaBusca = camposBusca.some(campo =>
        campo.toLowerCase().includes(texto)
      );

      if (!combinaBusca) return false;
    }

    // Contabiliza por categoria visível
    if (ponto.tipo === "regiao") contRegioesVisiveis++;
    else if (ponto.tipo === "local_zone") contLocalZonesVisiveis++;
    else if (ponto.tipo === "cloudfront_pop") contCloudfrontVisiveis++;

    return true;
  });

  // Cria marcadores no mapa
  filtrados.forEach(ponto => {
    const icone = criarIconeInfraestrutura(ponto.tipo);

    const marcador = L.marker([ponto.latitude, ponto.longitude], {
      icon: icone,
      title: `${ponto.nome} (${ponto.cidade}, ${ponto.pais})`
    });

    marcador.bindPopup(() => criarPainelPopup(ponto));

    marcador.on("click", () => {
      mostrarDetalhes(ponto);
    });

    grupoMarcadores.addLayer(marcador);
  });

  // Atualiza indicadores e badges
  badgeRegioes.textContent = contRegioesVisiveis;
  badgeLocalzones.textContent = contLocalZonesVisiveis;
  badgeCloudfront.textContent = contCloudfrontVisiveis;
  regioesVisiveis.textContent = filtrados.length;

  // Atualiza mensagem de status acessível
  if (filtrados.length === 0) {
    contador.textContent = "Nenhum ponto de infraestrutura encontrado para os filtros atuais.";
  } else {
    contador.textContent =
      `Exibindo ${filtrados.length} pontos no mapa: ${contRegioesVisiveis} Regiões AWS, ${contLocalZonesVisiveis} Local Zones e ${contCloudfrontVisiveis} cidades com CloudFront PoPs.`;
  }

  // Ajusta limites do mapa se houver busca específica ou filtro ativo
  if (filtrados.length > 0 && (texto || filtroContinente)) {
    const limites = L.latLngBounds(
      filtrados.map(p => [p.latitude, p.longitude])
    );
    mapa.fitBounds(limites, {
      padding: [40, 40],
      maxZoom: 6
    });
  }
}

/**
 * Restaura todos os filtros para o estado padrão de visualização global.
 */
function resetarFiltros() {
  busca.value = "";
  continente.value = "";
  filtroRegioes.checked = true;
  filtroLocalZones.checked = true;
  filtroCloudfront.checked = true;

  renderizarPontos();
  mapa.setView([20, 0], 2);
}

// ==================================================
// 7. CARREGAMENTO DOS DADOS (PROMISE.ALL)
// ==================================================

/**
 * Carrega todos os datasets em JSON e inicializa a aplicação.
 */
async function inicializar() {
  try {
    contador.textContent = "Carregando catálogo oficial da AWS...";

    // Carrega os 3 datasets em paralelo
    const [resRegioes, resLocalZones, resCloudFront] = await Promise.all([
      fetch("./dados/regioes.json"),
      fetch("./dados/local_zones.json"),
      fetch("./dados/cloudfront_pops.json")
    ]);

    if (!resRegioes.ok || !resLocalZones.ok || !resCloudFront.ok) {
      throw new Error("Falha na resposta HTTP de um dos arquivos de dados.");
    }

    catalogoRegioes = await resRegioes.json();
    catalogoLocalZones = await resLocalZones.json();
    catalogoCloudFront = await resCloudFront.json();

    // Garante tipos identificados
    catalogoRegioes.forEach(r => { r.tipo = "regiao"; });
    catalogoLocalZones.forEach(lz => { lz.tipo = "local_zone"; });
    catalogoCloudFront.forEach(cf => { cf.tipo = "cloudfront_pop"; });

    // Unifica catálogo para buscas universais
    todosPontos = [
      ...catalogoRegioes,
      ...catalogoLocalZones,
      ...catalogoCloudFront
    ];

    // Atualiza contadores totais do catálogo no dashboard
    totalRegioes.textContent = catalogoRegioes.length;
    totalLocalZones.textContent = catalogoLocalZones.length;
    totalCloudfront.textContent = catalogoCloudFront.length;

    // Calcula total de continentes únicos
    const continentesUnicos = [
      ...new Set(todosPontos.map(p => p.continente).filter(Boolean))
    ].sort();

    totalContinentes.textContent = continentesUnicos.length;

    // Popula select de continentes
    continente.replaceChildren();

    const opcaoPadrao = document.createElement("option");
    opcaoPadrao.value = "";
    opcaoPadrao.textContent = "Todos os continentes";
    continente.appendChild(opcaoPadrao);

    continentesUnicos.forEach(nome => {
      const opcao = document.createElement("option");
      opcao.value = nome;
      opcao.textContent = nome;
      continente.appendChild(opcao);
    });

    // Renderiza pontos no mapa com os filtros padrão
    renderizarPontos();

  } catch (erro) {
    console.error("Erro ao carregar catálogo da infraestrutura AWS:", erro);

    contador.textContent = "Não foi possível carregar os dados da infraestrutura AWS.";
    totalRegioes.textContent = "—";
    totalLocalZones.textContent = "—";
    totalCloudfront.textContent = "—";
    totalContinentes.textContent = "—";
    regioesVisiveis.textContent = "—";
  }
}

// ==================================================
// 8. EVENTOS DA INTERFACE
// ==================================================

// Busca com digitação (debounce leve com renderização instantânea)
busca.addEventListener("input", renderizarPontos);

// Filtro de continente
continente.addEventListener("change", renderizarPontos);

// Filtros de camadas independentes
filtroRegioes.addEventListener("change", renderizarPontos);
filtroLocalZones.addEventListener("change", renderizarPontos);
filtroCloudfront.addEventListener("change", renderizarPontos);

// Botão de restaurar
btnResetFiltros.addEventListener("click", resetarFiltros);

// ==================================================
// 9. INICIALIZAÇÃO DA APLICAÇÃO
// ==================================================

inicializar();

window.addEventListener("load", () => {
  setTimeout(() => {
    mapa.invalidateSize();
  }, 300);
});
