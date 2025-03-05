export interface HairstyleRecommendation {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  suitableFor: string[];
}

export interface FaceShape {
  type: 'oval' | 'round' | 'square' | 'heart' | 'long';
  confidence: number;
}