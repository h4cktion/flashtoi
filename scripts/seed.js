/**
 * Script de seed pour créer des données de test
 * Usage: node scripts/seed.js
 *
 * Crée :
 * - 1 école de test
 * - 3 élèves avec photos
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env" });

// Models
const schoolSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    loginCode: { type: String, unique: true },
    password: String,
    address: String,
    phone: String,
  },
  { timestamps: true }
);

const studentSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    qrCode: { type: String, unique: true },
    loginCode: { type: String, unique: true },
    password: String,
    clearPassword: String,
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    classId: String,
    photos: [
      {
        s3Key: String,
        cloudFrontUrl: String,
        format: String,
        price: Number,
      },
    ],
    siblings: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        firstName: String,
      },
    ],
  },
  { timestamps: true }
);

const School = mongoose.models.School || mongoose.model("School", schoolSchema);
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

async function seed() {
  try {
    console.log("🌱 Démarrage du seed...\n");

    // Connexion à MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI non définie dans .env.local");
    }

    console.log("📡 Connexion à MongoDB...", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connecté à MongoDB\n");

    // Nettoyer les collections existantes (optionnel)
    const shouldClean = process.argv.includes("--clean");
    if (shouldClean) {
      console.log("🧹 Nettoyage des collections...");
      await School.deleteMany({});
      await Student.deleteMany({});
      console.log("✅ Collections nettoyées\n");
    }

    // 1. Créer une école
    console.log("🏫 Création de l'école...");
    const schoolPassword = await bcrypt.hash("school123", 10);

    const school = await School.create({
      name: "École Primaire Victor Hugo",
      email: "admin@ecolevh.fr",
      loginCode: "VH2024",
      password: schoolPassword,
      address: "15 rue de la République, 75001 Paris",
      phone: "01 23 45 67 89",
    });

    console.log("✅ École créée:");
    console.log(`   - ID: ${school._id}`);
    console.log(`   - Login: VH2024`);
    console.log(`   - Password: school123\n`);

    // 2. Créer des élèves
    console.log("👨‍🎓 Création des élèves...");

    const students = [
      {
        firstName: "Sophie",
        lastName: "Martin",
        qrCode: "QR-SOPHIE-001",
        loginCode: "MARTIN001",
        classId: "CE2-A",
      },
      {
        firstName: "Lucas",
        lastName: "Dubois",
        qrCode: "QR-LUCAS-002",
        loginCode: "DUBOIS002",
        classId: "CE2-A",
      },
      {
        firstName: "Emma",
        lastName: "Bernard",
        qrCode: "QR-EMMA-003",
        loginCode: "BERNARD003",
        classId: "CE2-B",
      },
    ];

    const studentPassword = await bcrypt.hash("1234", 10);
    const createdStudents = [];

    for (const studentData of students) {
      const student = await Student.create({
        ...studentData,
        password: studentPassword,
        clearPassword: "1234",
        schoolId: school._id,
        photos: [
          {
            s3Key: `photos/2024/${studentData.firstName.toLowerCase()}-portrait.jpg`,
            cloudFrontUrl: "https://via.placeholder.com/300x400",
            format: "10x15",
            price: 2.5,
          },
          {
            s3Key: `photos/2024/${studentData.firstName.toLowerCase()}-groupe.jpg`,
            cloudFrontUrl: "https://via.placeholder.com/400x300",
            format: "13x18",
            price: 3.5,
          },
          {
            s3Key: `photos/2024/${studentData.firstName.toLowerCase()}-identite.jpg`,
            cloudFrontUrl: "https://via.placeholder.com/200x250",
            format: "identite",
            price: 5.0,
          },
        ],
        siblings: [],
      });

      createdStudents.push(student);

      console.log(`✅ ${student.firstName} ${student.lastName} créé(e):`);
      console.log(`   - QR Code: ${student.qrCode}`);
      console.log(`   - Login: ${student.loginCode}`);
      console.log(`   - Password: 1234`);
      console.log(`   - Photos: ${student.photos.length}`);
    }

    // 3. Ajouter des fratries (Sophie et Lucas sont frère/soeur)
    console.log("\n👨‍👩‍👧‍👦 Ajout des fratries...");

    const sophie = createdStudents[0];
    const lucas = createdStudents[1];

    await Student.findByIdAndUpdate(sophie._id, {
      siblings: [{ studentId: lucas._id, firstName: lucas.firstName }],
    });

    await Student.findByIdAndUpdate(lucas._id, {
      siblings: [{ studentId: sophie._id, firstName: sophie.firstName }],
    });

    console.log("✅ Sophie et Lucas sont maintenant frère/soeur\n");

    // Résumé
    console.log("🎉 Seed terminé avec succès!\n");
    console.log("📊 Résumé:");
    console.log(`   - 1 école créée`);
    console.log(`   - ${createdStudents.length} élèves créés`);
    console.log(
      `   - ${createdStudents.reduce(
        (acc, s) => acc + s.photos.length,
        0
      )} photos créées\n`
    );

    console.log("🔐 Identifiants de test:");
    console.log("   École:");
    console.log("     Login: VH2024");
    console.log("     Password: school123");
    console.log("   Parents:");
    console.log("     QR/Login: QR-SOPHIE-001 ou MARTIN001");
    console.log("     Password: 1234\n");

    console.log(
      '🚀 Vous pouvez maintenant lancer "npm run dev" et tester l\'authentification!'
    );
  } catch (error) {
    console.error("\n❌ Erreur lors du seed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Déconnecté de MongoDB");
  }
}

seed();
