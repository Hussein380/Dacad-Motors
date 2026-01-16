export interface Recommendation {
  id: string;
  carId: string;
  reason: string;
  score: number;
  tags: string[];
}

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec1',
    carId: '1',
    reason: 'Based on your interest in eco-friendly vehicles',
    score: 0.95,
    tags: ['Electric', 'Popular', 'Great Value'],
  },
  {
    id: 'rec2',
    carId: '4',
    reason: 'Perfect for your weekend getaway',
    score: 0.88,
    tags: ['Sports', 'Premium', 'Top Rated'],
  },
  {
    id: 'rec3',
    carId: '2',
    reason: 'Ideal for family trips with extra space',
    score: 0.85,
    tags: ['Family', 'Spacious', 'Comfortable'],
  },
];

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const mockAIResponses: Record<string, string> = {
  default: "Hello! I'm your AI car rental assistant. How can I help you find the perfect car today?",
  greeting: "Hi there! Looking for a car? I can help you find the best option based on your needs. What type of trip are you planning?",
  electric: "Great choice! Our Tesla Model 3 is our most popular electric vehicle. It offers unlimited mileage and supercharger access. Would you like me to check availability?",
  family: "For family trips, I'd recommend our BMW X5 or Honda CR-V. Both offer plenty of space and comfort features. How many passengers will you have?",
  budget: "I understand budget is important! Our Nissan Leaf starts at just $45/day and offers unlimited mileage. Would you like to see our economy options?",
  luxury: "For a premium experience, our Mercedes-Benz C-Class or Porsche 911 are excellent choices. What dates are you considering?",
};
