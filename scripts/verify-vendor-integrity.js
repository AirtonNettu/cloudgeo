/**
 * scripts/verify-vendor-integrity.js
 *
 * Verificação automatizada de integridade criptográfica
 * das dependências frontend locais (vendored) do CloudGeo.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeHash(filePath, algorithm) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash(algorithm).update(fileBuffer).digest('base64');
  return `${algorithm}-${hash}`;
}

function run() {
  console.log('🔒 Verificando integridade das dependências locais em vendor/...\n');

  const manifestPath = path.resolve(__dirname, '../vendor/integrity-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifesto de integridade não encontrado em vendor/integrity-manifest.json');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const files = manifest.files;
  let hasErrors = false;
  let verifiedCount = 0;

  for (const [relativePath, expected] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, '..', relativePath);

    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Arquivo ausente: ${relativePath}`);
      hasErrors = true;
      continue;
    }

    const actualSha384 = computeHash(fullPath, 'sha384');
    const actualSha256 = computeHash(fullPath, 'sha256');

    if (actualSha384 !== expected.sha384) {
      console.error(`❌ Mismatch SHA-384 em ${relativePath}:`);
      console.error(`   Esperado: ${expected.sha384}`);
      console.error(`   Obtido:   ${actualSha384}`);
      hasErrors = true;
    } else if (actualSha256 !== expected.sha256) {
      console.error(`❌ Mismatch SHA-256 em ${relativePath}:`);
      console.error(`   Esperado: ${expected.sha256}`);
      console.error(`   Obtido:   ${actualSha256}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${relativePath} [OK - SHA-384/256 verificado]`);
      verifiedCount++;
    }
  }

  console.log(`\n📊 Total de arquivos verificados: ${verifiedCount}/${Object.keys(files).length}`);

  if (hasErrors) {
    console.error('\n❌ Falha na verificação de integridade! Arquivos adulterados ou corrompidos.');
    process.exit(1);
  } else {
    console.log('🎉 Todas as dependências locais estão 100% autênticas e íntegras!');
  }
}

if (require.main === module) {
  run();
}

module.exports = { computeHash, run };
