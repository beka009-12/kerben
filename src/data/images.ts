export const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const kg = (name: string) => `/images/kg/${name}.jpg`;

export const pagePhoto = (name: string) => `/images/pages/${name}.webp`;

export const photos = {
  bali: unsplash("photo-1537996194471-e657df975ab4"),
  baliTemple: unsplash("photo-1518548419970-58e3b4079ab2"),
  tropicalResort: unsplash("photo-1520250497591-112f2f40a3f4"),
  beach: unsplash("photo-1507525428034-b723cf961d3e"),
  santorini: unsplash("photo-1570077188670-e3a8d69ac5ff"),
  greekCoast: unsplash("photo-1533105079780-92b9be482077"),
  deckPool: unsplash("photo-1582719508461-905c673771fd"),
  tokyo: unsplash("photo-1540959733332-eab4deabeeaf"),
  oldStreet: unsplash("photo-1527631746610-bca00a040d60"),
  swissAlps: unsplash("photo-1530122037265-a5f1f91d3b99"),
  clouds: unsplash("photo-1506905925346-21bda4d32df4"),
  hikers: unsplash("photo-1551632811-561732d1e306"),
  reflection: unsplash("photo-1464278533981-50106e6176b1"),
  dubai: unsplash("photo-1512453979798-5ea266f8880c"),
  resortNight: unsplash("photo-1542314831-068cd1dbfeeb"),
  lodgePool: unsplash("photo-1566073771259-6a8506099945"),
  halong: unsplash("photo-1528127269322-539801943592"),
} as const;

/** Одна нейтральная картинка — только если backend не прислал ни одного фото */
export const NO_PHOTO = kg("song-kul-yurts");
