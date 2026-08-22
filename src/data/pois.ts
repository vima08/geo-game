import type { PointOfInterest } from '../types';

export const POIS: PointOfInterest[] = [
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
