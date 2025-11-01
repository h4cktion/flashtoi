#!/usr/bin/env node

/**
 * Script pour vérifier que Sharp est correctement installé
 * Particulièrement utile pour diagnostiquer les problèmes sur Vercel
 */

try {
  const sharp = require('sharp');
  console.log('✅ Sharp est correctement installé');
  console.log('   Version:', sharp.versions);
  console.log('   Platform:', process.platform);
  console.log('   Arch:', process.arch);
} catch (error) {
  console.error('❌ Erreur lors du chargement de Sharp:');
  console.error(error.message);
  console.error('\nSolutions:');
  console.error('1. Exécuter: npm install --include=optional sharp');
  console.error('2. Exécuter: npm install --os=linux --cpu=x64 sharp');
  process.exit(1);
}
