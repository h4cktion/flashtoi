// Formats de photos disponibles
export const PHOTO_FORMATS = [
  "10x15",
  "13x18",
  "18x24",
  "identite",
  "25x19",
  "24x30",
  "mug",
  "coupon",
  "boule-a-neige",
  "gourde",
] as const;
export type PhotoFormat = (typeof PHOTO_FORMATS)[number];

// Noms des planches disponibles
export const PLANCHE_NAMES = [
  "classe",
  "bonne-fetes",
  "multiformat-carre",
  "marque-page",
  "portecles",
  "portrait-bg-white",
  "boule-a-neige",
  "magnets",
  "gourde",
  "Printemps",
  "10x15",
  "18x24-NB",
  "18x24",
  "calendrier",
  "polaroid",
  "multiformat",
  "mug-maman",
  "mug-papa",
  "mug-mamie",
  "mug-papy",
  "mug-parrain",
  "mug-marraine",
  "mug-noel",
  "mug-playa",
  "coupon",
] as const;
export type PlancheName = (typeof PLANCHE_NAMES)[number];
