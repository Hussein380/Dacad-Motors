/**
 * Car Service
 * 
 * Handles all car-related data operations.
 * Currently uses mocked data, structured for easy backend integration.
 * 
 * To connect to real backend:
 * 1. Import apiRequest from apiClient
 * 2. Replace mock data returns with API calls
 * 3. Update response handling as needed
 */

import { mockCars, carCategories, locations, type Car } from '@/data/mockCars';
import { simulateDelay } from './apiClient';

export interface CarFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  transmission?: string;
  fuelType?: string;
  location?: string;
  seats?: number;
  available?: boolean;
  search?: string;
}

export interface CarsResponse {
  cars: Car[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Get all cars with optional filtering
 */
export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
  await simulateDelay();
  
  let filteredCars = [...mockCars];
  
  if (filters) {
    if (filters.category && filters.category !== 'all') {
      filteredCars = filteredCars.filter(car => car.category === filters.category);
    }
    if (filters.priceMin !== undefined) {
      filteredCars = filteredCars.filter(car => car.pricePerDay >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filteredCars = filteredCars.filter(car => car.pricePerDay <= filters.priceMax!);
    }
    if (filters.transmission) {
      filteredCars = filteredCars.filter(car => car.transmission === filters.transmission);
    }
    if (filters.fuelType) {
      filteredCars = filteredCars.filter(car => car.fuelType === filters.fuelType);
    }
    if (filters.location) {
      filteredCars = filteredCars.filter(car => car.location === filters.location);
    }
    if (filters.seats !== undefined) {
      filteredCars = filteredCars.filter(car => car.seats >= filters.seats!);
    }
    if (filters.available !== undefined) {
      filteredCars = filteredCars.filter(car => car.available === filters.available);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCars = filteredCars.filter(car => 
        car.name.toLowerCase().includes(searchLower) ||
        car.brand.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower)
      );
    }
  }
  
  return {
    cars: filteredCars,
    total: filteredCars.length,
    page: 1,
    pageSize: filteredCars.length,
  };
}

/**
 * Get a single car by ID
 */
export async function getCarById(id: string): Promise<Car | null> {
  await simulateDelay();
  return mockCars.find(car => car.id === id) || null;
}

/**
 * Get featured cars (top rated, available)
 */
export async function getFeaturedCars(limit: number = 4): Promise<Car[]> {
  await simulateDelay();
  return mockCars
    .filter(car => car.available && car.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Get available categories
 */
export async function getCategories() {
  await simulateDelay(100);
  return carCategories;
}

/**
 * Get available locations
 */
export async function getLocations() {
  await simulateDelay(100);
  return locations;
}

/**
 * Search cars by query
 */
export async function searchCars(query: string): Promise<Car[]> {
  await simulateDelay();
  const searchLower = query.toLowerCase();
  return mockCars.filter(car => 
    car.name.toLowerCase().includes(searchLower) ||
    car.brand.toLowerCase().includes(searchLower) ||
    car.category.toLowerCase().includes(searchLower)
  );
}
