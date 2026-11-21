/**
 * tests/unit/data-filters.test.js
 *
 * Testes unitários para as regras de manipulação, filtragem,
 * agrupamento e cálculo de métricas do CloudGeo.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

// Funções puras reproduzindo e testando a lógica central de filtragem do CloudGeo
function filtrarPontos(pontos, { texto = '', continenteFiltro = '', exibirRegioes = true, exibirLocalZones = true, exibirCloudfront = true }) {
  const buscaTermo = texto.toLowerCase().trim();

  return pontos.filter(ponto => {
    // 1. Checagem de categoria
    if (ponto.tipo === 'regiao' && !exibirRegioes) return false;
    if (ponto.tipo === 'local_zone' && !exibirLocalZones) return false;
    if (ponto.tipo === 'cloudfront_pop' && !exibirCloudfront) return false;

    // 2. Checagem de continente
    if (continenteFiltro && ponto.continente !== continenteFiltro) return false;

    // 3. Checagem de texto
    if (buscaTermo) {
      const campos = [
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

      const match = campos.some(c => c.toLowerCase().includes(buscaTermo));
      if (!match) return false;
    }

    return true;
  });
}

function extrairContinentesUnicos(pontos) {
  return [...new Set(pontos.map(p => p.continente).filter(Boolean))].sort();
}

function calcularMetricas(filtrados) {
  let regioes = 0;
  let localzones = 0;
  let cloudfront = 0;

  filtrados.forEach(p => {
    if (p.tipo === 'regiao') regioes++;
    else if (p.tipo === 'local_zone') localzones++;
    else if (p.tipo === 'cloudfront_pop') cloudfront++;
  });

  return {
    total: filtrados.length,
    regioes,
    localzones,
    cloudfront
  };
}

describe('CloudGeo Data Filters & Processing Unit Tests', () => {
  const mockPontos = [
    { tipo: 'regiao', codigo: 'sa-east-1', nome: 'South America (São Paulo)', cidade: 'São Paulo', pais: 'Brasil', continente: 'América do Sul', particao: 'aws' },
    { tipo: 'regiao', codigo: 'us-east-1', nome: 'US East (N. Virginia)', cidade: 'N. Virginia', pais: 'Estados Unidos', continente: 'América do Norte', particao: 'aws' },
    { tipo: 'regiao', codigo: 'eu-central-1', nome: 'Europe (Frankfurt)', cidade: 'Frankfurt', pais: 'Alemanha', continente: 'Europa', particao: 'aws' },
    { tipo: 'local_zone', codigo: 'us-east-1-rio-1', nome: 'AWS Local Zone (Rio de Janeiro)', cidade: 'Rio de Janeiro', pais: 'Brasil', continente: 'América do Sul', regiaoPai: 'us-east-1' },
    { tipo: 'local_zone', codigo: 'eu-central-1-ham-1', nome: 'AWS Local Zone (Hamburg)', cidade: 'Hamburgo', pais: 'Alemanha', continente: 'Europa', regiaoPai: 'eu-central-1' },
    { tipo: 'cloudfront_pop', nome: 'CloudFront Edge - São Paulo', cidade: 'São Paulo', pais: 'Brasil', continente: 'América do Sul' },
    { tipo: 'cloudfront_pop', nome: 'CloudFront Edge - Frankfurt', cidade: 'Frankfurt', pais: 'Alemanha', continente: 'Europa' }
  ];

  it('deve retornar todos os pontos quando não há filtros aplicados', () => {
    const res = filtrarPontos(mockPontos, {});
    assert.strictEqual(res.length, 7);
  });

  it('deve filtrar corretamente por texto na busca (cidade)', () => {
    const res = filtrarPontos(mockPontos, { texto: 'São Paulo' });
    assert.strictEqual(res.length, 2); // 1 regiao + 1 cloudfront
    assert.ok(res.some(p => p.tipo === 'regiao' && p.codigo === 'sa-east-1'));
    assert.ok(res.some(p => p.tipo === 'cloudfront_pop' && p.cidade === 'São Paulo'));
  });

  it('deve filtrar corretamente por código de região', () => {
    const res = filtrarPontos(mockPontos, { texto: 'sa-east-1' });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].codigo, 'sa-east-1');
  });

  it('deve filtrar corretamente por continente', () => {
    const res = filtrarPontos(mockPontos, { continenteFiltro: 'América do Sul' });
    assert.strictEqual(res.length, 3); // 1 regiao + 1 local zone + 1 cloudfront
  });

  it('deve filtrar por camada desativada (apenas regioes ativas)', () => {
    const res = filtrarPontos(mockPontos, {
      exibirRegioes: true,
      exibirLocalZones: false,
      exibirCloudfront: false
    });
    assert.strictEqual(res.length, 3);
    assert.ok(res.every(p => p.tipo === 'regiao'));
  });

  it('deve combinar busca por texto e filtro de continente', () => {
    const res = filtrarPontos(mockPontos, {
      texto: 'Alemanha',
      continenteFiltro: 'Europa'
    });
    assert.strictEqual(res.length, 3); // 1 regiao (Frankfurt) + 1 local zone (Hamburgo) + 1 cloudfront (Frankfurt)
  });

  it('deve extrair continentes únicos ordenados alfabeticamente', () => {
    const continentes = extrairContinentesUnicos(mockPontos);
    assert.deepStrictEqual(continentes, ['América do Norte', 'América do Sul', 'Europa']);
  });

  it('deve calcular métricas consolidadas com precisão', () => {
    const metricas = calcularMetricas(mockPontos);
    assert.strictEqual(metricas.total, 7);
    assert.strictEqual(metricas.regioes, 3);
    assert.strictEqual(metricas.localzones, 2);
    assert.strictEqual(metricas.cloudfront, 2);
  });

  it('deve lidar com lista vazia sem lançar exceções', () => {
    const res = filtrarPontos([], { texto: 'teste' });
    assert.deepStrictEqual(res, []);
    const metricas = calcularMetricas([]);
    assert.strictEqual(metricas.total, 0);
  });
});
