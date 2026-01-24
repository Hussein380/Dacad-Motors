/**
 * User Service
 * 
 * Handles user profile and personalization operations.
 */

import { type Car } from '@/types';
import { apiRequest } from './apiClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  favorites: Car[];
  preferredPickupLocations: string[];
  preferredReturnLocations: string[];
  preferredCategorySlugs: string[];
  savedSearches: SavedSearch[];
  createdAt: string;
}

export interface SavedSearch {
  _id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

export interface UpdatePreferencesData {
  preferredPickupLocations?: string[];
  preferredReturnLocations?: string[];
  preferredCategorySlugs?: string[];
}

/**
 * Get current user profile with personalization data
 */
export async function getMyProfile(): Promise<UserProfile | null> {
  const response = await apiRequest<any>('/users/me');
  if (response.success && response.data) {
    return {
      ...response.data,
      id: response.data._id || response.data.id,
    };
  }
  return null;
}

/**
 * Update user preferences
 */
export async function updatePreferences(data: UpdatePreferencesData): Promise<UserProfile | null> {
  const response = await apiRequest<any>('/users/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return {
      ...response.data,
      id: response.data._id || response.data.id,
    };
  }
  return null;
}

/**
 * Add a car to favorites
 */
export async function addFavorite(carId: string): Promise<UserProfile | null> {
  const response = await apiRequest<any>(`/users/me/favorites/${carId}`, {
    method: 'POST',
  });
  if (response.success && response.data) {
    return {
      ...response.data,
      id: response.data._id || response.data.id,
    };
  }
  return null;
}

/**
 * Remove a car from favorites
 */
export async function removeFavorite(carId: string): Promise<UserProfile | null> {
  const response = await apiRequest<any>(`/users/me/favorites/${carId}`, {
    method: 'DELETE',
  });
  if (response.success && response.data) {
    return {
      ...response.data,
      id: response.data._id || response.data.id,
    };
  }
  return null;
}

/**
 * Save a search
 */
export async function saveSearch(name: string, filters: Record<string, any>): Promise<UserProfile | null> {
  const response = await apiRequest<any>('/users/me/saved-searches', {
    method: 'POST',
    body: JSON.stringify({ name, filters }),
  });
  if (response.success && response.data) {
    return {
      ...response.data,
      id: response.data._id || response.data.id,
    };
  }
  return null;
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(searchId: string): Promise<UserProfile | null> {
  const response = await apiRequest<any>(`/users/me/saved-searches/${searchId}`, {
    method: 'DELETE',
  });
  if (response.success && response.data) {
    return {
      ...response.data,
      id: response.data._id || response.data.id,
    };
  }
  return null;
}
