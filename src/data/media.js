// Vidéo d'accueil, avant/après, carte des réalisations, projets Sadaqa Jariya.
// Contenu éditable depuis /admin → src/content/media.json
import { media, withIds } from './content';

export const heroVideo = media.heroVideo || { src: '', youtubeId: '', poster: '' };
export const beforeAfterProjects = withIds(media.beforeAfter, 'ba');
export const achievementPlaces = withIds(media.achievementPlaces, 'place', (p) => p.name?.fr || p.name?.ar)
    .map((p) => ({ ...p, actions: p.actions || [] }));
export const sadaqaProjects = withIds(media.sadaqaProjects, 'sadaqa', (p) => p.icon);
export const heroImage = media.heroImage || '/images/gallery/team/benevoles-en-route.webp';

// Diaporama de l'accueil : heroImage en premier, puis media.heroImages (éditable), sinon photos existantes de la galerie.
const defaultSlides = [
    '/images/gallery/water/eau-jaillit.webp',
    '/images/gallery/caravans/kafila-sahara-rencontre.webp',
    '/images/gallery/ramadan/distribution-paniers.webp',
];
export const heroSlides = [...new Set([heroImage, ...((media.heroImages && media.heroImages.length ? media.heroImages : defaultSlides))])].filter(Boolean);
