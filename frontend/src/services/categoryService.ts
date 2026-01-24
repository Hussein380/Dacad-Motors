/**
 * Category Service (Admin)
 * 
 * Handles category management operations for admins.
 */

import { apiRequest } from './apiClient';

export interface Category {
  _id?: string;
  slug: string;
  name: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Get all categories (admin view, includes inactive)
 */
export async function getAllCategories(): Promise<Category[]> {
  const response = await apiRequest<Category[]>('/admin/categories');
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

/**
 * Create a new category
 */
export async function createCategory(data: Omit<Category, '_id'>): Promise<Category | null> {
  const response = await apiRequest<Category>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

/**
 * Update a category
 */
export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  const response = await apiRequest<Category>(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

/**
 * Delete/deactivate a category
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const response = await apiRequest<any>(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
  return response.success;
}
