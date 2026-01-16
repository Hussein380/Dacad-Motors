/**
 * API Client Configuration
 * 
 * This file contains the API client setup. Currently returns mocked data,
 * but is structured to easily switch to real API calls.
 * 
 * To connect to a real backend:
 * 1. Update BASE_URL to your API endpoint
 * 2. Uncomment the fetch logic in apiRequest
 * 3. Add authentication headers as needed
 */

const BASE_URL = '/api'; // Update this when connecting real backend

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Simulated network delay for realistic UX
const simulateDelay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generic API request function
 * Currently returns mocked data with simulated delay
 * Ready to be replaced with actual fetch calls
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // Simulate network delay for realistic loading states
  await simulateDelay(Math.random() * 500 + 200);
  
  // When connecting to real backend, uncomment below:
  /*
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    return {
      data: null as T,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
  */
  
  // For now, return success response (actual data comes from service layer)
  return {
    data: null as T,
    success: true,
  };
}

export { simulateDelay };
