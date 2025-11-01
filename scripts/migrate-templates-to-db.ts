/**
 * Script de migration des templates depuis templates.json vers MongoDB
 *
 * Usage: npx tsx scripts/migrate-templates-to-db.ts
 */

// IMPORTANT: Charger dotenv en PREMIER, avant tout import
import { config } from 'dotenv';
config();

import { readFile } from 'fs/promises';
import { join } from 'path';
import { connectDB } from '@/lib/db/mongodb';
import Template from '@/lib/db/models/Template';

interface TemplateJson {
  format: string;
  price: number;
  planche: string;
  rotationWeb?: boolean;
  photos: Array<{
    x: number;
    y: number;
    width: number;
    rotation: number;
    cropTop: number;
    cropBottom: number;
    effect?: string;
  }>;
}

async function migrateTemplates() {
  try {
    console.log('🚀 Démarrage de la migration des templates...\n');

    // Connexion à MongoDB
    await connectDB();
    console.log('✅ Connexion MongoDB établie\n');

    // Lire le fichier templates.json
    const templatesPath = join(process.cwd(), '..', 'scriptPlanche', 'templates.json');
    const templatesData = await readFile(templatesPath, 'utf-8');
    const templates: TemplateJson[] = JSON.parse(templatesData);

    console.log(`📄 ${templates.length} templates trouvés dans templates.json\n`);

    // Nettoyer la collection existante
    const deleteResult = await Template.deleteMany({});
    console.log(`🗑️  ${deleteResult.deletedCount} templates supprimés de la base\n`);

    // Migrer chaque template
    let successCount = 0;
    let order = 0;

    for (const template of templates) {
      try {
        // Déterminer le background (nom du fichier correspond au nom de la planche)
        const background = `${template.planche}.jpg`;

        // Utiliser la première photo comme position de portrait principale
        const firstPhoto = template.photos[0];

        // Convertir les pourcentages en positions absolues (on affinera plus tard)
        // Pour l'instant, on stocke les valeurs brutes
        const positions = {
          portrait: {
            x: firstPhoto.x,
            y: firstPhoto.y,
            width: firstPhoto.width,
            height: Math.floor(firstPhoto.width * 1.33), // Ratio portrait approximatif
          },
        };

        // Créer le template dans MongoDB
        await Template.create({
          planche: template.planche,
          format: template.format,
          background,
          price: template.price,
          order: order++,
          positions,
        });

        successCount++;
        console.log(`✅ Template migré: ${template.planche} (${template.format})`);
      } catch (error) {
        console.error(`❌ Erreur migration ${template.planche}:`, error);
      }
    }

    console.log(`\n✨ Migration terminée!`);
    console.log(`📊 Résultat: ${successCount}/${templates.length} templates migrés avec succès\n`);

    // Afficher les templates dans la base
    const allTemplates = await Template.find({}).sort({ order: 1 });
    console.log('📋 Templates dans la base:');
    allTemplates.forEach((t) => {
      console.log(`   - ${t.planche} (${t.format}) - ${t.price}€ - Background: ${t.background}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateTemplates();
