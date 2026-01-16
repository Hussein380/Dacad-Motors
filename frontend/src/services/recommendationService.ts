/**
 * Recommendation Service
 * 
 * Handles AI-powered recommendations and chat functionality.
 * Currently uses mocked data, structured for easy AI backend integration.
 */

import { mockRecommendations, mockAIResponses, type Recommendation, type AIMessage } from '@/data/mockRecommendations';
import { mockCars, type Car } from '@/data/mockCars';
import { simulateDelay } from './apiClient';

/**
 * Get personalized car recommendations
 */
export async function getRecommendations(): Promise<(Recommendation & { car: Car })[]> {
  await simulateDelay();
  
  return mockRecommendations.map(rec => ({
    ...rec,
    car: mockCars.find(c => c.id === rec.carId)!,
  })).filter(rec => rec.car);
}

/**
 * Get AI chat response (mocked)
 */
export async function getAIChatResponse(message: string): Promise<string> {
  await simulateDelay(800);
  
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('hello') || messageLower.includes('hi')) {
    return mockAIResponses.greeting;
  }
  if (messageLower.includes('electric') || messageLower.includes('tesla')) {
    return mockAIResponses.electric;
  }
  if (messageLower.includes('family') || messageLower.includes('space') || messageLower.includes('suv')) {
    return mockAIResponses.family;
  }
  if (messageLower.includes('budget') || messageLower.includes('cheap') || messageLower.includes('affordable')) {
    return mockAIResponses.budget;
  }
  if (messageLower.includes('luxury') || messageLower.includes('premium') || messageLower.includes('mercedes') || messageLower.includes('porsche')) {
    return mockAIResponses.luxury;
  }
  
  return mockAIResponses.default;
}

/**
 * Generate initial AI greeting
 */
export function getInitialMessage(): AIMessage {
  return {
    id: '1',
    role: 'assistant',
    content: mockAIResponses.default,
    timestamp: new Date().toISOString(),
  };
}
