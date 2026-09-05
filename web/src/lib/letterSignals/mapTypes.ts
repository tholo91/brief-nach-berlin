export interface LetterMapPoint {
  x: number;
  y: number;
  count: number;
}

export interface LetterMapData {
  points: LetterMapPoint[];
  totalContributions: number;
  postcodeAreas: number;
}
