/**
 * Script d'upload des backgrounds vers S3
 *
 * Usage: npx tsx scripts/upload-backgrounds-to-s3.ts
 */

// IMPORTANT: Charger dotenv en PREMIER, avant tout import
import { config } from 'dotenv';
config();

import { readdir } from 'fs/promises';
import { join } from 'path';
import { S3Uploader } from '@/lib/utils/s3-uploader';
import { connectDB } from '@/lib/db/mongodb';
import Template from '@/lib/db/models/Template';

async function uploadBackgrounds() {
  try {
    console.log('🚀 Démarrage de l\'upload des backgrounds vers S3...\n');

    // Connexion à MongoDB
    await connectDB();
    console.log('✅ Connexion MongoDB établie\n');

    // Initialiser S3 Uploader
    const s3Uploader = new S3Uploader();
    console.log('✅ S3 Uploader initialisé\n');

    // Lire le dossier backgrounds
    const backgroundsDir = join(process.cwd(), '..', 'scriptPlanche', 'backgrounds');
    const files = await readdir(backgroundsDir);

    // Filtrer pour ne garder que les fichiers images
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    console.log(`📁 ${imageFiles.length} fichiers images trouvés dans backgrounds/\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of imageFiles) {
      try {
        const localPath = join(backgroundsDir, file);
        const s3Key = `assets/backgrounds/${file}`;

        console.log(`📤 Upload: ${file}...`);

        // Vérifier si le fichier existe déjà
        const exists = await s3Uploader.fileExists(s3Key);
        if (exists) {
          console.log(`   ⏭️  Déjà sur S3, passage au suivant`);
          const url = s3Uploader.getCloudFrontUrl(s3Key);

          // Mettre à jour l'URL dans les templates correspondants
          const plancheName = file.replace(/\.(jpg|jpeg|png|gif)$/i, '');
          await Template.updateOne(
            { background: file },
            { $set: { backgroundS3Url: url } }
          );

          successCount++;
          continue;
        }

        // Upload vers S3
        const result = await s3Uploader.uploadFile(localPath, s3Key);

        if (result.success) {
          console.log(`   ✅ Uploadé: ${result.url}`);

          // Mettre à jour l'URL dans les templates correspondants
          const plancheName = file.replace(/\.(jpg|jpeg|png|gif)$/i, '');
          await Template.updateOne(
            { background: file },
            { $set: { backgroundS3Url: result.url } }
          );

          successCount++;
        } else {
          console.log(`   ❌ Erreur: ${result.error}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`   ❌ Erreur upload ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`\n✨ Upload terminé!`);
    console.log(`📊 Résultat: ${successCount} succès, ${errorCount} erreurs\n`);

    // Afficher les templates avec leurs URLs S3
    const templates = await Template.find({}).sort({ order: 1 });
    console.log('📋 Templates avec backgrounds S3:');
    templates.forEach((t) => {
      const status = t.backgroundS3Url ? '✅' : '⚠️';
      console.log(`   ${status} ${t.planche}: ${t.backgroundS3Url || 'Pas d\'URL S3'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter l'upload
uploadBackgrounds();
