/**
 * Script de seed pour créer les packs photos
 * Usage: node scripts/seed-packs.js
 *
 * Crée les 5 packs : S, M, L, XL, XXL
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Model
const packSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['S', 'M', 'L', 'XL', 'XXL'],
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  planches: {
    type: [String],
    required: true,
    enum: ['classe', 'planche1', 'planche2', 'planche4', 'mixte', 'rotation'],
  },
  order: {
    type: Number,
    required: true,
    min: 1,
  },
}, { timestamps: true });

const Pack = mongoose.models.Pack || mongoose.model('Pack', packSchema);

async function seedPacks() {
  try {
    console.log('📦 Démarrage du seed des packs...\n');

    // Connexion à MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI non définie dans .env');
    }

    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Nettoyer les packs existants
    const shouldClean = process.argv.includes('--clean');
    if (shouldClean) {
      console.log('🧹 Nettoyage des packs existants...');
      await Pack.deleteMany({});
      console.log('✅ Packs nettoyés\n');
    }

    // Définition des packs
    const packs = [
      {
        name: 'S',
        price: 10,
        planches: ['classe', 'planche1'],
        description: 'Photo de classe + planche 1',
        order: 1,
      },
      {
        name: 'M',
        price: 14,
        planches: ['classe', 'mixte'],
        description: 'Photo de classe + planche mixte',
        order: 2,
      },
      {
        name: 'L',
        price: 16,
        planches: ['classe', 'mixte', 'rotation'],
        description: 'Photo de classe + planche mixte + rotation',
        order: 3,
      },
      {
        name: 'XL',
        price: 21.5,
        planches: ['classe', 'planche1', 'planche2', 'planche4'],
        description: 'Photo de classe + planches 1, 2, 4',
        order: 4,
      },
      {
        name: 'XXL',
        price: 32,
        planches: ['classe', 'planche1', 'planche2', 'planche4', 'mixte', 'rotation'],
        description: 'Toutes les photos + photo de classe',
        order: 5,
      },
    ];

    console.log('📦 Création des packs...');

    for (const packData of packs) {
      // Vérifier si le pack existe déjà
      const existingPack = await Pack.findOne({ name: packData.name });

      if (existingPack) {
        console.log(`⏭️  Pack ${packData.name} existe déjà, ignoré`);
      } else {
        await Pack.create(packData);
        console.log(`✅ Pack ${packData.name} créé : ${packData.description} - ${packData.price}€`);
      }
    }

    // Résumé
    const totalPacks = await Pack.countDocuments();
    console.log('\n🎉 Seed des packs terminé avec succès!');
    console.log(`📊 Total de packs en base : ${totalPacks}\n`);

  } catch (error) {
    console.error('\n❌ Erreur lors du seed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

seedPacks();
