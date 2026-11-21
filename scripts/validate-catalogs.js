/**
 * scripts/validate-catalogs.js
 *
 * Validação estrutural, sintática, geográfica e de integridade
 * dos catálogos de infraestrutura AWS do CloudGeo.
 */

const fs = require('fs');
const path = require('path');

const VALID_CONTINENTS = [
  'África',
  'América do Norte',
  'América do Sul',
  'Ásia',
  'Europa',
  'Oceania'
];

const VALID_PARTITIONS = [
  'aws',
  'aws-us-gov',
  'aws-cn',
  'aws-eusc'
];

const VALID_STATUSES = [
  'operacional',
  'anunciado',
  'descontinuado'
];

const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype'];

function validateDataset(filePath, requiredFields, idField = null) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const raw = fs.readFileSync(fullPath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`JSON inválido em ${filePath}: ${err.message}`);
  }

  if (!Array.isArray(data)) {
    throw new Error(`Estrutura raiz deve ser um Array em ${filePath}`);
  }

  if (data.length === 0) {
    throw new Error(`Catálogo vazio em ${filePath}`);
  }

  const seenIds = new Set();
  const errors = [];

  data.forEach((item, index) => {
    // 1. Verificação de chaves proibidas (Prototype Pollution)
    for (const key of Object.keys(item)) {
      if (FORBIDDEN_KEYS.includes(key)) {
        errors.push(`[${filePath} #${index}] Chave proibida detectada: ${key}`);
      }
    }

    // 2. Campos obrigatórios
    for (const field of requiredFields) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        errors.push(`[${filePath} #${index}] Campo obrigatório ausente ou vazio: "${field}"`);
      }
    }

    // 3. Validação geográfica
    if (typeof item.latitude !== 'number' || isNaN(item.latitude)) {
      errors.push(`[${filePath} #${index}] Latitude inválida: ${item.latitude}`);
    } else if (item.latitude < -90 || item.latitude > 90) {
      errors.push(`[${filePath} #${index}] Latitude fora dos limites [-90, 90]: ${item.latitude}`);
    }

    if (typeof item.longitude !== 'number' || isNaN(item.longitude)) {
      errors.push(`[${filePath} #${index}] Longitude inválida: ${item.longitude}`);
    } else if (item.longitude < -180 || item.longitude > 180) {
      errors.push(`[${filePath} #${index}] Longitude fora dos limites [-180, 180]: ${item.longitude}`);
    }

    // 4. Validação de continente
    if (item.continente && !VALID_CONTINENTS.includes(item.continente)) {
      errors.push(`[${filePath} #${index}] Continente inválido: "${item.continente}". Esperado um de: ${VALID_CONTINENTS.join(', ')}`);
    }

    // 5. Validação de partição (se informada)
    if (item.particao && !VALID_PARTITIONS.includes(item.particao)) {
      errors.push(`[${filePath} #${index}] Partição AWS inválida: "${item.particao}". Esperado uma de: ${VALID_PARTITIONS.join(', ')}`);
    }

    // 6. Validação de estado operacional (se informado)
    if (item.estadoOperacional && !VALID_STATUSES.includes(item.estadoOperacional)) {
      errors.push(`[${filePath} #${index}] Estado operacional inválido: "${item.estadoOperacional}". Esperado um de: ${VALID_STATUSES.join(', ')}`);
    }

    // 7. Unicidade de identificador (se aplicável)
    if (idField && item[idField]) {
      const id = String(item[idField]).trim().toLowerCase();
      if (seenIds.has(id)) {
        errors.push(`[${filePath} #${index}] Identificador duplicado no campo "${idField}": "${item[idField]}"`);
      }
      seenIds.add(id);
    }
  });

  return { filePath, count: data.length, errors };
}

function run() {
  console.log('🔍 Executando validação de integridade dos catálogos AWS...\n');

  const validations = [
    {
      file: 'dados/regioes.json',
      required: ['nome', 'codigo', 'cidade', 'pais', 'continente', 'latitude', 'longitude'],
      idField: 'codigo'
    },
    {
      file: 'dados/local_zones.json',
      required: ['nome', 'codigo', 'cidade', 'pais', 'continente', 'latitude', 'longitude', 'regiaoPai'],
      idField: 'codigo'
    },
    {
      file: 'dados/cloudfront_pops.json',
      required: ['nome', 'cidade', 'pais', 'continente', 'latitude', 'longitude'],
      idField: null
    }
  ];

  let totalErrors = 0;
  let totalItems = 0;

  for (const v of validations) {
    try {
      const res = validateDataset(v.file, v.required, v.idField);
      totalItems += res.count;
      if (res.errors.length > 0) {
        console.error(`❌ ${v.file}: ${res.errors.length} erro(s) encontrado(s):`);
        res.errors.forEach(err => console.error(`   - ${err}`));
        totalErrors += res.errors.length;
      } else {
        console.log(`✅ ${v.file}: Válido (${res.count} registros, 0 erros)`);
      }
    } catch (err) {
      console.error(`💥 Falha crítica ao validar ${v.file}: ${err.message}`);
      totalErrors++;
    }
  }

  console.log(`\n📊 Resumo: ${totalItems} registros auditados em 3 catálogos.`);

  if (totalErrors > 0) {
    console.error(`❌ Auditoria falhou com ${totalErrors} erro(s).`);
    process.exit(1);
  } else {
    console.log('🎉 Todos os catálogos estão em conformidade!');
  }
}

if (require.main === module) {
  run();
}

module.exports = { validateDataset, VALID_CONTINENTS, VALID_PARTITIONS };
