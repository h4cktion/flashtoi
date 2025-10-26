/**
 * Script pour créer un administrateur
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts
 *
 * Le script demandera l'email, le nom et le mot de passe
 */

// Charger les variables d'environnement depuis .env.local
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as readline from "readline";
import Admin from "../lib/db/models/Admin";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}
const MONGODB_URI =
  "mongodb://admin:password123@localhost:27017/camuratphoto?authSource=admin";
async function createAdmin() {
  try {
    // Connexion à MongoDB
    const mongoUri = MONGODB_URI;
    // const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error("❌ Erreur: MONGODB_URI n'est pas défini dans .env");
      process.exit(1);
    }

    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connecté à MongoDB\n");

    // Demander les informations
    const email = await question("Email: ");
    const name = await question("Nom: ");
    const password = await question("Mot de passe (min 6 caractères): ");

    // Validation
    if (!email || !email.includes("@")) {
      console.error("❌ Email invalide");
      process.exit(1);
    }

    if (!name || name.length < 2) {
      console.error("❌ Nom trop court");
      process.exit(1);
    }

    if (!password || password.length < 6) {
      console.error("❌ Mot de passe trop court (min 6 caractères)");
      process.exit(1);
    }

    // Vérifier si l'admin existe déjà
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.error(`❌ Un admin avec l'email "${email}" existe déjà`);
      process.exit(1);
    }

    // Hasher le mot de passe
    console.log("\n🔐 Hashage du mot de passe...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin
    console.log("💾 Création de l'admin...");
    const admin = await Admin.create({
      email,
      name,
      password: hashedPassword,
    });

    console.log("\n✅ Admin créé avec succès!");
    console.log("📧 Email:", admin.email);
    console.log("👤 Nom:", admin.name);
    console.log("🆔 ID:", admin._id);
    console.log("\n🔗 Connexion: /backoffice/login");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Exécuter le script
createAdmin();
