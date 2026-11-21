/**
 * data-filters.js
 *
 * Módulo puro e isomórfico para filtragem, categorização e cálculo de métricas
 * da infraestrutura global AWS no CloudGeo.
 *
 * Compatível tanto com o navegador (Vanilla JS via window.CloudGeoFilters)
 * quanto com ambientes Node.js (via module.exports para testes unitários).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CloudGeoFilters = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Extrai e sanitiza os campos textuais pesquisáveis de um ponto.
   *
   * @param {Object} ponto - Registro de infraestrutura AWS.
   * @returns {string[]} Lista de strings pesquisáveis em minúsculas.
   */
  function extrairCamposBusca(ponto) {
    if (!ponto) return [];
    return [
      ponto.nome || '',
      ponto.codigo || '',
      ponto.cidade || '',
      ponto.pais || '',
      ponto.continente || '',
      ponto.regiaoPai || '',
      ponto.regiaoPaiNome || '',
      ponto.tipoRegiao || '',
      ponto.particao || '',
      ponto.operador || ''
    ];
  }

  /**
   * Filtra uma lista de pontos de infraestrutura com base nos critérios selecionados.
   *
   * @param {Array<Object>} pontos - Lista completa de pontos.
   * @param {Object} opcoes - Critérios de filtragem.
   * @param {string} [opcoes.texto=''] - Termo de busca livre.
   * @param {string} [opcoes.continente=''] - Filtro continental.
   * @param {Object} [opcoes.categorias] - Estado ativo das camadas.
   * @param {boolean} [opcoes.categorias.regiao=true]
   * @param {boolean} [opcoes.categorias.local_zone=true]
   * @param {boolean} [opcoes.categorias.cloudfront_pop=true]
   * @returns {Array<Object>} Lista filtrada de pontos.
   */
  function filtrarPontos(pontos, opcoes = {}) {
    if (!Array.isArray(pontos)) return [];

    const termo = (opcoes.texto || '').toLowerCase().trim();
    const filtroContinente = (opcoes.continente || '').trim();

    const categorias = Object.assign(
      { regiao: true, local_zone: true, cloudfront_pop: true },
      opcoes.categorias || {}
    );

    return pontos.filter(ponto => {
      if (!ponto) return false;

      // 1. Checagem de categoria ativada
      if (ponto.tipo === 'regiao' && !categorias.regiao) return false;
      if (ponto.tipo === 'local_zone' && !categorias.local_zone) return false;
      if (ponto.tipo === 'cloudfront_pop' && !categorias.cloudfront_pop) return false;

      // 2. Checagem de continente
      if (filtroContinente && ponto.continente !== filtroContinente) {
        return false;
      }

      // 3. Checagem de texto na busca
      if (termo) {
        const campos = extrairCamposBusca(ponto);
        const combina = campos.some(campo =>
          campo.toLowerCase().includes(termo)
        );
        if (!combina) return false;
      }

      return true;
    });
  }

  /**
   * Extrai a lista ordenada de continentes únicos de um conjunto de pontos.
   *
   * @param {Array<Object>} pontos - Lista de pontos.
   * @returns {string[]} Lista ordenada alfabeticamente de continentes.
   */
  function extrairContinentes(pontos) {
    if (!Array.isArray(pontos)) return [];
    const unicos = new Set();
    pontos.forEach(p => {
      if (p && p.continente && typeof p.continente === 'string') {
        const c = p.continente.trim();
        if (c) unicos.add(c);
      }
    });
    return Array.from(unicos).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  /**
   * Calcula as métricas consolidadas dos catálogos e da visualização ativa.
   *
   * @param {Array<Object>} todosPontos - Catálogo completo unificado.
   * @param {Array<Object>} pontosFiltrados - Subconjunto atualmente visível.
   * @returns {Object} Indicadores consolidados.
   */
  function calcularMetricas(todosPontos = [], pontosFiltrados = []) {
    const totalLista = Array.isArray(todosPontos) ? todosPontos : [];
    const filtradosLista = Array.isArray(pontosFiltrados) ? pontosFiltrados : [];

    let totalRegioes = 0;
    let totalLocalZones = 0;
    let totalCloudfront = 0;

    totalLista.forEach(p => {
      if (!p) return;
      if (p.tipo === 'regiao') totalRegioes++;
      else if (p.tipo === 'local_zone') totalLocalZones++;
      else if (p.tipo === 'cloudfront_pop') totalCloudfront++;
    });

    let regioesVisiveis = 0;
    let localZonesVisiveis = 0;
    let cloudfrontVisiveis = 0;

    filtradosLista.forEach(p => {
      if (!p) return;
      if (p.tipo === 'regiao') regioesVisiveis++;
      else if (p.tipo === 'local_zone') localZonesVisiveis++;
      else if (p.tipo === 'cloudfront_pop') cloudfrontVisiveis++;
    });

    const continentesUnicos = extrairContinentes(totalLista);

    return {
      totalPontos: totalLista.length,
      totalRegioes,
      totalLocalZones,
      totalCloudfront,
      totalContinentes: continentesUnicos.length,
      pontosVisiveis: filtradosLista.length,
      regioesVisiveis,
      localZonesVisiveis,
      cloudfrontVisiveis
    };
  }

  return {
    extrairCamposBusca,
    filtrarPontos,
    extrairContinentes,
    calcularMetricas
  };
}));
