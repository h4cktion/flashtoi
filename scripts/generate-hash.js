/**
 * Script pour générer des hash de passwords bcrypt
 * Usage: node scripts/generate-hash.js [password]
 */

const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const rounds = 10;
  const hash = await bcrypt.hash(password, rounds);
  return hash;
}

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.log('❌ Usage: node scripts/generate-hash.js [password]\n');
    console.log('Exemples:');
    console.log('  node scripts/generate-hash.js "school123"');
    console.log('  node scripts/generate-hash.js "1234"\n');
    process.exit(1);
  }

  console.log('🔐 Génération du hash bcrypt...\n');
  console.log(`Password: "${password}"`);

  const hash = await generateHash(password);

  console.log(`Hash:     ${hash}\n`);
  console.log('✅ Copiez ce hash dans MongoDB pour le champ "password"');
}

main().catch(console.error);
