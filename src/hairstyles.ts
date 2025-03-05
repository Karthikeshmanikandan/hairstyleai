import { HairstyleRecommendation } from './types';

export const hairstyles: HairstyleRecommendation[] = [
  {
    id: 1,
    name: "Textured Crop",
    description: "A modern short haircut with textured layers on top, perfect for adding volume and style.",
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=400",
    suitableFor: ["oval", "round", "square"]
  },
  {
    id: 2,
    name: "Long Layered Cut",
    description: "Flowing layers that add movement and frame the face beautifully.",
    imageUrl: "https://images.unsplash.com/photo-1605980776566-0486c3ac7617?auto=format&fit=crop&q=80&w=400",
    suitableFor: ["oval", "heart", "long"]
  },
  {
    id: 3,
    name: "Classic Side Part",
    description: "A timeless style that works well in professional settings.",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400",
    suitableFor: ["square", "oval", "round"]
  }
];