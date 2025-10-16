# 🚀 Quick Start Guide

## Installation rapide (5 minutes)

### 1. Configuration MongoDB

Créez un cluster gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) puis :

```bash
# Copier l'URI de connexion
# Format : mongodb+srv://username:password@cluster.mongodb.net/photo-scolaire
```

### 2. Variables d'environnement

```bash
# Éditer .env.local avec vos valeurs
nano .env.local
```

Minimum requis :
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=run_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
```

### 3. Démarrer le projet

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Données de test

Pour tester l'authentification, insérer ces documents dans MongoDB :

### Collection `schools`

```javascript
{
  name: "École Test",
  email: "test@school.fr",
  loginCode: "TEST2024",
  password: "$2a$10$YourHashedPasswordHere", // voir ci-dessous
  address: "1 rue de Test, 75001 Paris",
  phone: "01 23 45 67 89",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Collection `students`

```javascript
{
  firstName: "Jean",
  lastName: "Dupont",
  qrCode: "QR-JEAN-001",
  loginCode: "DUPONT001",
  password: "$2a$10$YourHashedPasswordHere", // voir ci-dessous
  schoolId: ObjectId("..."), // ID de l'école créée ci-dessus
  classId: "CE2-A",
  photos: [
    {
      s3Key: "test/photo1.jpg",
      cloudFrontUrl: "https://via.placeholder.com/400x600",
      format: "10x15",
      price: 2.5
    },
    {
      s3Key: "test/photo2.jpg",
      cloudFrontUrl: "https://via.placeholder.com/400x600",
      format: "13x18",
      price: 3.5
    }
  ],
  siblings: [],
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Générer les hash de passwords

**Option 1 : Node.js**
```javascript
// test-hash.js
const bcrypt = require('bcryptjs');

async function generateHashes() {
  const schoolPass = await bcrypt.hash('school123', 10);
  const studentPass = await bcrypt.hash('1234', 10);

  console.log('School password hash:', schoolPass);
  console.log('Student password hash:', studentPass);
}

generateHashes();
```

```bash
node test-hash.js
```

**Option 2 : En ligne**
Utilisez [bcrypt-generator.com](https://bcrypt-generator.com/) avec rounds=10

---

## Test des flows d'authentification

### Flow Parents

1. Aller sur `http://localhost:3000`
2. **Option QR Code** :
   - QR Code : `QR-JEAN-001`
   - Password : `1234`
3. **Option Identifiants** :
   - Identifiant : `DUPONT001`
   - Password : `1234`
4. ✅ Redirection vers `/gallery` (404 pour l'instant)

### Flow École

1. Aller sur `http://localhost:3000/school/login`
2. Login :
   - Code d'accès : `TEST2024`
   - Password : `school123`
3. ✅ Redirection vers `/school/dashboard` (404 pour l'instant)

### Test Middleware

- Essayer d'accéder à `/gallery` sans login → ❌ Redirige vers `/login`
- Après login parent, essayer `/school/dashboard` → ❌ Redirige vers `/gallery`
- Après login école, essayer `/gallery` → ❌ Redirige vers `/school/dashboard`

---

## Vérifications rapides

✅ **Checklist avant Phase 2 :**
- [ ] MongoDB connecté (vérifier dans terminal : "✅ MongoDB connected successfully")
- [ ] Au moins 1 école créée dans la DB
- [ ] Au moins 1 élève avec photos créé dans la DB
- [ ] Login parent fonctionne (QR Code ET credentials)
- [ ] Login école fonctionne
- [ ] Middleware redirige correctement
- [ ] Pas d'erreurs dans la console

---

## Commandes utiles

```bash
# Lancer le serveur
npm run dev

# Build production
npm run build

# Vérifier TypeScript
npx tsc --noEmit

# Linting
npm run lint

# Voir les logs MongoDB
# Dans votre code, regarder la console après connexion
```

---

## Structure du projet (Phase 1)

```
photo-scolaire/
├── app/
│   ├── (public)/
│   │   ├── login/              # Login parents
│   │   │   ├── page.tsx        # UI du formulaire
│   │   │   └── actions.ts      # Server Actions auth
│   │   └── school/login/       # Login école
│   │       ├── page.tsx
│   │       └── actions.ts
│   ├── api/auth/[...nextauth]/ # Route NextAuth
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   ├── auth/
│   │   ├── auth.ts             # Export NextAuth
│   │   └── auth-options.ts     # Config NextAuth
│   ├── db/
│   │   ├── mongodb.ts          # Connexion MongoDB
│   │   └── models/
│   │       ├── School.ts       # Model École
│   │       ├── Student.ts      # Model Élève
│   │       └── Order.ts        # Model Commande
│   └── utils/
│       └── index.ts            # Utilitaires
│
├── types/
│   ├── index.ts                # Types globaux
│   └── next-auth.d.ts          # Types NextAuth
│
├── middleware.ts               # Protection routes
├── .env.local                  # Variables d'env
└── README.md                   # Documentation complète
```

---

## Troubleshooting

### Erreur "MONGODB_URI is not defined"
→ Vérifier que `.env.local` existe et contient `MONGODB_URI`

### Erreur de connexion MongoDB
→ Vérifier que l'IP est whitelistée dans MongoDB Atlas (0.0.0.0/0 pour test)

### Login ne fonctionne pas
→ Vérifier que le password hash correspond bien au password en clair

### Middleware ne redirige pas
→ Vérifier que vous êtes bien logout (supprimer cookies si besoin)

### 404 après login
→ **Normal !** Les routes `/gallery` et `/school/dashboard` seront créées en Phase 2

---

## Prochaine étape : Phase 2

Une fois l'authentification testée et fonctionnelle, nous implémenterons :
- 📸 Galerie photos avec Server Components
- 🛒 Système de panier avec Server Actions
- 📦 Création de commandes
- ✅ Page de confirmation

**Estimé** : ~2-3h de développement

---

**Besoin d'aide ?** Consultez `README.md` pour la documentation complète ou `PHASE1_COMPLETE.md` pour les détails de l'implémentation.
