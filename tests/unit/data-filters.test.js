/**
 * tests/unit/data-filters.test.js
 *
 * Testes unitários exercitando o código real de produção compartilhado (data-filters.js)
 * para as regras de manipulação, filtragem, agrupamento e cálculo de métricas do CloudGeo.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

// Importa a implementação REAL de produção compartilhada
const {
  filtrarPontos,
  extrairContinentes,
  calcularMetricas,
  extrairCamposBusca
} = require(path.resolve(__dirname, '../../data-filters.js'));

describe('CloudGeo Production Data Engine & Filters (data-filters.js)', () => {
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
    const res = filtrarPontos(mockPontos, { continente: 'América do Sul' });
    assert.strictEqual(res.length, 3); // 1 regiao + 1 local zone + 1 cloudfront
  });

  it('deve filtrar por camada desativada (apenas regioes ativas)', () => {
    const res = filtrarPontos(mockPontos, {
      categorias: {
        regiao: true,
        local_zone: false,
        cloudfront_pop: false
      }
    });
    assert.strictEqual(res.length, 3);
    assert.ok(res.every(p => p.tipo === 'regiao'));
  });

  it('deve combinar busca por texto e filtro de continente', () => {
    const res = filtrarPontos(mockPontos, {
      texto: 'Alemanha',
      continente: 'Europa'
    });
    assert.strictEqual(res.length, 3); // 1 regiao (Frankfurt) + 1 local zone (Hamburgo) + 1 cloudfront (Frankfurt)
  });

  it('deve extrair continentes únicos ordenados alfabeticamente', () => {
    const continentes = extrairContinentes(mockPontos);
    assert.deepStrictEqual(continentes, ['América do Norte', 'América do Sul', 'Europa']);
  });

  it('deve extrair campos pesquisáveis de um ponto', () => {
    const ponto = mockPontos[0];
    const campos = extrairCamposBusca(ponto);
    assert.ok(campos.includes('sa-east-1'));
    assert.ok(campos.includes('São Paulo'));
    assert.ok(campos.includes('Brasil'));
  });

  it('deve calcular métricas consolidadas com precisão', () => {
    const filtrados = filtrarPontos(mockPontos, { continente: 'América do Sul' });
    const metricas = calcularMetricas(mockPontos, filtrados);
    assert.strictEqual(metricas.totalPontos, 7);
    assert.strictEqual(metricas.totalRegioes, 3);
    assert.strictEqual(metricas.totalLocalZones, 2);
    assert.strictEqual(metricas.totalCloudfront, 2);
    assert.strictEqual(metricas.totalContinentes, 3);
    assert.strictEqual(metricas.pontosVisiveis, 3);
    assert.strictEqual(metricas.regioesVisiveis, 1);
    assert.strictEqual(metricas.localZonesVisiveis, 1);
    assert.strictEqual(metricas.cloudfrontVisiveis, 1);
  });

  it('deve lidar com lista vazia sem lançar exceções', () => {
    const res = filtrarPontos([], { texto: 'teste' });
    assert.deepStrictEqual(res, []);
    const metricas = calcularMetricas([], []);
    assert.strictEqual(metricas.totalPontos, 0);
    assert.strictEqual(metricas.pontosVisiveis, 0);
    const continentes = extrairContinentes([]);
    assert.deepStrictEqual(continentes, []);
  });
});
