# Guide : Système de génération dynamique de planches

## Vue d'ensemble

Ce système génère les planches photo à la volée depuis les thumbnails des étudiants, au lieu de pré-générer toutes les planches lors de l'import. Cela améliore drastiquement la performance et réduit l'utilisation de S3.

## Avantages

✅ **Performance import** : 10-20x plus rapide (plus de génération de planches)
✅ **Économie S3** : Zéro stockage de previews (génération à la volée, streaming direct)
✅ **Flexibilité** : Modification des templates sans regénérer toutes les planches
✅ **Coût** : Aucun coût S3 pour les previews (seulement thumbnails + backgrounds)
✅ **Sans risque** : Ancien système reste intact (/gallery fonctionne toujours)
✅ **Simple** : Pas de gestion de cache S3, tout est généré à la demande

## Architecture

### Base de données

**Collection `templates`** : Stocke les informations des planches disponibles
- `planche` : Nom de la planche (ex: "bonne-fetes", "multiformat")
- `format` : Format de la planche (ex: "25x19", "10x15")
- `background` : Nom du fichier background
- `backgroundS3Url` : URL CloudFront du background
- `price` : Prix de la planche
- `positions` : Positions pour composer l'image

### Flux de génération

1. **Utilisateur visite la galerie**
   - Charge l'étudiant depuis MongoDB
   - Charge tous les templates disponibles
   - Affiche un `DynamicPhotoCard` par template

2. **DynamicPhotoCard** utilise l'URL de l'API directement
   - `src="/api/generate-planche?studentId=xxx&planche=yyy"`
   - Le navigateur fait la requête pour charger l'image
   - Affiche un loader pendant le chargement

3. **API `/api/generate-planche`**
   - Télécharge la thumbnail et le background depuis S3
   - Utilise Sharp pour composer l'image
   - Ajoute le watermark diagonal
   - **Retourne l'image directement en streaming** (pas de sauvegarde S3)
   - Headers cache : 1h dans le navigateur

4. **Affichage**
   - L'image est affichée dans la galerie
   - Cache navigateur : 1h (durée typique d'une session parent)
   - À la prochaine visite (généralement jamais), régénération

**Pourquoi pas de cache S3 ?**
Les parents se connectent généralement une seule fois pour commander. Stocker les previews sur S3 est un gaspillage d'espace et de coût.

## Installation et Setup

### 1. Migration des templates

```bash
npx tsx scripts/migrate-templates-to-db.ts
```

Ce script :
- Lit `scriptPlanche/templates.json`
- Crée un document MongoDB pour chaque template
- Définit les positions et prix

### 2. Upload des backgrounds

```bash
npx tsx scripts/upload-backgrounds-to-s3.ts
```

Ce script :
- Upload tous les fichiers de `scriptPlanche/backgrounds/` vers S3
- Met à jour les URLs dans MongoDB

### 3. Vérification

```bash
# Lancer le serveur de développement
npm run dev

# Accéder à la galerie avec un studentId
```

## Structure des fichiers

```
flashtoi/
├── lib/
│   ├── db/models/
│   │   └── Template.ts              ✓ Modèle MongoDB
│   ├── actions/
│   │   └── template.ts              ✓ Actions serveur
│   ├── utils/
│   │   └── s3-uploader.ts           ✓ Utilitaire S3
│   └── image/
│       └── planche-generator.ts     ✓ Générateur avec Sharp
├── app/
│   └── api/generate-planche/
│       └── route.ts                 ✓ API de génération
├── components/gallery/
│   └── dynamic-photo-card.tsx       ✓ Carte photo dynamique
├── scripts/
│   ├── migrate-templates-to-db.ts   ✓ Migration templates
│   └── upload-backgrounds-to-s3.ts  ✓ Upload backgrounds
└── types/index.ts                   ✓ Types TypeScript
```

## API Route

### GET `/api/generate-planche`

**Paramètres:**
- `studentId` : ID MongoDB de l'étudiant
- `planche` : Nom de la planche (ex: "bonne-fetes")

**Réponse:**
- **Type** : `image/jpeg` (streaming direct)
- **Corps** : Buffer de l'image générée
- Pas de JSON, l'image est retournée directement

**Headers:**
- `Content-Type: image/jpeg`
- `Cache-Control: public, max-age=3600` (1h)

## Performance

### Génération à la volée (à chaque visite)
- Téléchargement thumbnail : ~50ms
- Téléchargement background : ~50ms (mis en cache par CloudFront)
- Composition Sharp : ~100-200ms
- Streaming : ~10ms
- **Total : ~210-310ms**

### Cache navigateur
- Durée : 1h (`Cache-Control: public, max-age=3600`)
- Pendant la session : chargement instantané depuis le cache navigateur
- Prochaine visite : régénération (acceptable car généralement il n'y a qu'une seule visite)

### Optimisations possibles
- [ ] Cache Redis temporaire (si plusieurs parents consultent en même temps)
- [ ] Pré-génération partielle des templates les plus populaires
- [ ] Compression WebP au lieu de JPEG

## Qualité des images

- **Source** : Thumbnail 300x400px
- **Résultat** : Planche avec watermark
- **Watermark** : Texte diagonal "© PHOTO SCOLAIRE" répété
- **Qualité** : Acceptable pour previews

Pour les commandes payées, le système actuel (`export_hd_photos.py`) utilise toujours les photos HD locales.

## Stockage S3

### Structure

```
s3://bucket/
  assets/
    backgrounds/
      bonne-fetes.jpg           ← Backgrounds des templates
      multiformat.jpg
      marque-page.jpg
      ...
  schools/
    {school}/
      {class}/
        {student_id}/
          thumbnail.jpg          ✓ Thumbnail élève (seule image stockée)
```

**Note** : Les planches ne sont PAS stockées sur S3. Elles sont générées à la volée et retournées en streaming.

## Troubleshooting

### Erreur "Template doesn't have a background uploaded to S3"

**Cause** : Le background n'a pas été uploadé sur S3
**Solution** :
```bash
npx tsx scripts/upload-backgrounds-to-s3.ts
```

### Erreur "Student thumbnail not found"

**Cause** : L'étudiant n'a pas de thumbnail
**Solution** : Ré-importer l'étudiant avec le script Python qui génère les thumbnails

### Image ne se charge pas

**Cause** : Erreur lors de la génération Sharp
**Solution** :
1. Vérifier les logs serveur Next.js
2. Vérifier que Sharp est installé : `npm list sharp`
3. Vérifier les credentials AWS dans `.env`

### Génération très lente

**Cause** : Images trop grandes ou connexion S3 lente
**Solution** :
1. Vérifier la taille des backgrounds
2. Activer CloudFront si pas déjà fait
3. Vérifier la région AWS (doit être proche)

## Implémentation

Le système de génération dynamique est disponible via l'API `/api/generate-planche`.
Il peut être intégré dans n'importe quelle page de galerie selon vos besoins.

## Prochaines améliorations

- [ ] Cache Redis pour éviter les appels S3
- [ ] Génération de planches HD sur demande (commandes)
- [ ] Support des textes personnalisés sur les planches
- [ ] Support des QR codes
- [ ] Optimisation des backgrounds (WebP, compression)
- [ ] Métriques de performance (temps de génération, taux de cache)
