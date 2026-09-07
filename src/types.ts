export interface LocationReading {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: 'real' | 'simulated';
  timestamp: number;
}

export interface PointOfInterest {
  id: string;
  name: string;
  shortName: string;
  description: string;
  latitude: number;
  longitude: number;
  activationRadiusMeters: number;
  reward: { name: string; symbol: string };
  event: {
    prompt: string;
    choices: string[];
    correctChoice: number;
    success: string;
  };
}

export interface Adventure {
  id: 'bostandyk' | 'golden-square' | 'orsk-old-town';
  center: [number, number];
  defaultZoom: number;
  pois: PointOfInterest[];
}

export interface Progress {
  discoveredIds: string[];
  rewards: string[];
  completedEventIds: string[];
  tutorialSeen: boolean;
}
