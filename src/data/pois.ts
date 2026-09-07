import type { Adventure, PointOfInterest } from '../types';

export const BOSTANDYK_POIS: PointOfInterest[] = [
  {
    id: 'botanical-garden', name: 'Main Botanical Garden — South Entrance', shortName: 'Botanical Garden',
    description: 'At the public entrance, old trees shelter a living page of a forgotten city atlas.',
    latitude: 43.215431, longitude: 76.920564, activationRadiusMeters: 40,
    reward: { name: 'Leaf Sigil', symbol: '❧' },
    event: { prompt: 'The mark is hidden in how trees grow. What do their rings record?', choices: ['Wind direction', 'Passing years', 'Distance to water'], correctChoice: 1, success: 'The Leaf Sigil appears: a memory of every season the city has weathered.' },
  },
  {
    id: 'atakent-pavilion', name: 'Atakent — Main Pavilion', shortName: 'Atakent Pavilion',
    description: 'On the open exhibition grounds, bold geometry holds a precise atlas pattern.',
    latitude: 43.223061, longitude: 76.906389, activationRadiusMeters: 45,
    reward: { name: 'Pattern Sigil', symbol: '▦' },
    event: { prompt: 'Look at the pavilion’s strong geometry. Which pattern can also form a map grid?', choices: ['Crossing lines', 'Spirals'], correctChoice: 0, success: 'The Pattern Sigil aligns. Streets and paths settle into a readable grid.' },
  },
  {
    id: 'dostyk-park', name: 'Dostyk Park', shortName: 'Dostyk Park',
    description: 'A neighborhood green where conversations carry a warm fragment of the route.',
    latitude: 43.225833, longitude: 76.926944, activationRadiusMeters: 45,
    reward: { name: 'Friendship Sigil', symbol: '∞' },
    event: { prompt: 'Dostyk means friendship. What grows richer when it is shared?', choices: ['A journey', 'A locked door'], correctChoice: 0, success: 'The Friendship Sigil glows. Every shared journey adds a path to the atlas.' },
  },
  {
    id: 'satpayev-monument', name: 'Kanysh Satpayev Monument', shortName: 'Satpayev Monument',
    description: 'The geologist watches over an atlas clue written in stone on a public forecourt.',
    latitude: 43.236438, longitude: 76.928495, activationRadiusMeters: 30,
    reward: { name: 'Stone Sigil', symbol: '◆' },
    event: { prompt: 'A geologist reads deep time. Which object tells Earth’s oldest stories?', choices: ['A cloud', 'A streetlight', 'A rock'], correctChoice: 2, success: 'The Stone Sigil wakes. Deep time adds its enduring mark to your atlas.' },
  },
  {
    id: 'independence-monument', name: 'Independence Monument — Republic Square', shortName: 'Independence Monument',
    description: 'Beneath the Golden Warrior, an atlas mark waits in the city’s open civic heart.',
    latitude: 43.238568, longitude: 76.945400, activationRadiusMeters: 40,
    reward: { name: 'Sky Sigil', symbol: '✦' },
    event: { prompt: 'Five routes converge. What turns separate landmarks into a living city?', choices: ['The people between them', 'The tallest building', 'A border on a map'], correctChoice: 0, success: 'The Sky Sigil completes the atlas. Bostandyk’s hidden route is yours to remember.' },
  },
];

export const GOLDEN_SQUARE_POIS: PointOfInterest[] = [
  {
    id: 'gold-lermontov-theatre', name: 'Lermontov National Drama Theatre', shortName: 'Lermontov Theatre',
    description: 'A public theatre forecourt where the old centre keeps a voice made for the stage.',
    latitude: 43.24318, longitude: 76.94408, activationRadiusMeters: 35,
    reward: { name: 'Word Sigil', symbol: '✎' },
    event: { prompt: 'A written line waits for a voice. What brings a play to life?', choices: ['A locked book', 'Actors and audience', 'An empty hall'], correctChoice: 1, success: 'The Word Sigil answers. A city remembers its stories whenever someone speaks them aloud.' },
  },
  {
    id: 'gold-golovizin-house', name: 'Golovizin House — Street Viewpoint', shortName: 'Golovizin House',
    description: 'From the public sidewalk, an Art Nouveau façade preserves the ornament of old Verny.',
    latitude: 43.24452, longitude: 76.94839, activationRadiusMeters: 30,
    reward: { name: 'Ornament Sigil', symbol: '❦' },
    event: { prompt: 'Look only from the sidewalk: which detail gives this historic house its character?', choices: ['Plant-like stucco', 'Glass towers', 'Steel bridges'], correctChoice: 0, success: 'The Ornament Sigil unfolds. Stone leaves carry a century of city memory.' },
  },
  {
    id: 'gold-abay-opera', name: 'Abay Opera and Ballet Theatre — Main Square', shortName: 'Abay Opera House',
    description: 'The grand public square holds an echo of music, movement, and Kazakh ornament.',
    latitude: 43.24889, longitude: 76.94583, activationRadiusMeters: 45,
    reward: { name: 'Stage Sigil', symbol: '♪' },
    event: { prompt: 'Opera joins several arts on one stage. Which pair belongs there together?', choices: ['Voice and orchestra', 'Silence and an empty curtain'], correctChoice: 0, success: 'The Stage Sigil sounds. The square becomes a theatre beneath the open sky.' },
  },
  {
    id: 'gold-nedelka-fountain', name: 'Nedelka Fountain', shortName: 'Nedelka Fountain',
    description: 'Seven figures gather around a beloved public fountain named for the days of the week.',
    latitude: 43.249167, longitude: 76.943889, activationRadiusMeters: 35,
    reward: { name: 'Time Sigil', symbol: '◷' },
    event: { prompt: '“Nedelka” circles through a familiar rhythm. How many days complete its cycle?', choices: ['Five', 'Seven', 'Ten'], correctChoice: 1, success: 'The Time Sigil turns. Ordinary days become the rhythm of a living neighbourhood.' },
  },
  {
    id: 'gold-kunaev-museum', name: 'Kunaev House Museum — Exterior', shortName: 'Kunaev House Museum',
    description: 'At the museum exterior on Tulebayev Street, private objects become shared history.',
    latitude: 43.25272, longitude: 76.94846, activationRadiusMeters: 35,
    reward: { name: 'Memory Sigil', symbol: '▣' },
    event: { prompt: 'A home becomes a museum when its objects begin to tell whose story?', choices: ['Only the building’s', 'A person and their era', 'No one’s'], correctChoice: 1, success: 'The Memory Sigil settles into the atlas. Five voices of the old centre can now be heard together.' },
  },
];

// Outdoor points, checked against municipal/museum sources and OSM on 2026-09-07.
// Coordinate provenance and pedestrian access notes are in README.md.
export const ORSK_OLD_TOWN_POIS: PointOfInterest[] = [
  {
    id: 'orsk-shevchenko-garden', name: 'Shevchenko Garden', shortName: 'Shevchenko Garden',
    description: 'Pause on a garden path: rustling leaves hide the first page of the Old Orsk atlas. Stay on open paths.',
    latitude: 51.207074, longitude: 58.555753, activationRadiusMeters: 45,
    reward: { name: 'Garden Sigil', symbol: '❧' },
    event: { prompt: 'A garden has its own quiet clock. What changes with the seasons?', choices: ['The street’s name', 'The leaves on the trees', 'The compass points'], correctChoice: 1, success: 'The Garden Sigil unfolds. Your atlas remembers the shade where city walks begin.' },
  },
  {
    id: 'orsk-pushkin-monument', name: 'Pushkin Monument — Public Square', shortName: 'Pushkin Monument',
    description: 'In the little public square beside Sovetskaya Street, a poet guards a page made of words.',
    latitude: 51.207582, longitude: 58.558352, activationRadiusMeters: 35,
    reward: { name: 'Verse Sigil', symbol: '✎' },
    event: { prompt: 'The bust remembers Alexander Pushkin. Which page belongs in a poet’s notebook?', choices: ['A timetable', 'A shopping receipt', 'A verse'], correctChoice: 2, success: 'The Verse Sigil appears. A few words can preserve a whole walk together.' },
  },
  {
    id: 'orsk-khmelnitsky-square', name: 'Bohdan Khmelnitsky Square — Monument', shortName: 'Khmelnitsky Square',
    description: 'At the monument in the public square, another atlas page waits. Use the marked crossings between squares.',
    latitude: 51.206732, longitude: 58.558242, activationRadiusMeters: 35,
    reward: { name: 'Meeting Sigil', symbol: '∞' },
    event: { prompt: 'A square is more than an empty space on a map. What makes it a meeting place?', choices: ['People spending time together', 'A closed gate', 'An empty car park'], correctChoice: 0, success: 'The Meeting Sigil joins two lines. A familiar square becomes part of your shared story.' },
  },
  {
    id: 'orsk-old-town-museum', name: 'Old Town Museum and Cultural Centre — Exterior', shortName: 'Old Town Museum',
    description: 'At 33 Shevchenko Street, an old merchant house keeps the city’s stories. Play from the public sidewalk; no ticket or entry needed.',
    latitude: 51.209838, longitude: 58.563796, activationRadiusMeters: 45,
    reward: { name: 'Chronicle Sigil', symbol: '▤' },
    event: { prompt: 'This historic house is now a museum. What helps an ordinary object tell a city’s story?', choices: ['Its price alone', 'The memories of people who used it', 'A locked cupboard'], correctChoice: 1, success: 'The Chronicle Sigil opens. Everyday lives fill the atlas with stories that a street plan cannot show.' },
  },
  {
    id: 'orsk-kirilov-monument', name: 'Ivan Kirilov Monument — Kirilov Square', shortName: 'Kirilov Monument',
    description: 'On Kirilov Square, the city’s founder holds a telescope and a document. Find your clue from the public paved area.',
    latitude: 51.209089, longitude: 58.565533, activationRadiusMeters: 35,
    reward: { name: 'Horizon Sigil', symbol: '⌖' },
    event: { prompt: 'Look at the telescope in the figure’s hand. What does this instrument help someone do?', choices: ['See distant details', 'Measure the time', 'Listen to the wind'], correctChoice: 0, success: 'The Horizon Sigil comes into focus. Old Orsk is no longer just a place on a map: it is a walk you can remember.' },
  },
];

export const ADVENTURES: Adventure[] = [
  { id: 'bostandyk', center: [43.224, 76.924], defaultZoom: 13, pois: BOSTANDYK_POIS },
  { id: 'golden-square', center: [43.2495, 76.946], defaultZoom: 14, pois: GOLDEN_SQUARE_POIS },
  // Offset the overview slightly east so the last pin clears mobile zoom controls.
  { id: 'orsk-old-town', center: [51.2082, 58.5615], defaultZoom: 15, pois: ORSK_OLD_TOWN_POIS },
];

// Resolve saved selections from the registry; old/unknown values keep the original route.
export function getAdventure(id: string | null): Adventure {
  return ADVENTURES.find(adventure => adventure.id === id) ?? ADVENTURES[0];
}

// Kept for compatibility with the original tests and data consumers.
export const POIS = BOSTANDYK_POIS;
