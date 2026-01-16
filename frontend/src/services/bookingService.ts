/**
 * Booking Service
 * 
 * Handles all booking-related data operations.
 * Currently uses mocked data, structured for easy backend integration.
 * 
 * To connect to real backend:
 * 1. Import apiRequest from apiClient
 * 2. Replace mock data returns with API calls
 * 3. Update response handling as needed
 */

import { mockBookings, bookingExtras, type Booking } from '@/data/mockBookings';
import { simulateDelay } from './apiClient';

export interface CreateBookingData {
  carId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  extras: string[];
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
}

/**
 * Get all bookings
 */
export async function getBookings(status?: Booking['status']): Promise<BookingsResponse> {
  await simulateDelay();
  
  let bookings = [...mockBookings];
  
  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }
  
  return {
    bookings: bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    total: bookings.length,
  };
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  await simulateDelay();
  return mockBookings.find(b => b.id === id) || null;
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  await simulateDelay(500);
  
  // Calculate days and price (would come from backend in real app)
  const pickup = new Date(data.pickupDate);
  const returnDate = new Date(data.returnDate);
  const totalDays = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
  
  const newBooking: Booking = {
    id: `BK${String(mockBookings.length + 1).padStart(3, '0')}`,
    carId: data.carId,
    carName: 'Car Name', // Would be fetched from car service
    carImage: '',
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    pickupDate: data.pickupDate,
    returnDate: data.returnDate,
    pickupLocation: data.pickupLocation,
    returnLocation: data.returnLocation,
    totalDays,
    pricePerDay: 0, // Would be calculated
    totalPrice: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    extras: data.extras,
  };
  
  // In real app, this would be persisted to backend
  mockBookings.push(newBooking);
  
  return newBooking;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string, 
  status: Booking['status']
): Promise<Booking | null> {
  await simulateDelay();
  
  const booking = mockBookings.find(b => b.id === id);
  if (booking) {
    booking.status = status;
  }
  return booking || null;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<boolean> {
  await simulateDelay();
  
  const booking = mockBookings.find(b => b.id === id);
  if (booking && booking.status !== 'completed') {
    booking.status = 'cancelled';
    return true;
  }
  return false;
}

/**
 * Get available extras
 */
export async function getBookingExtras() {
  await simulateDelay(100);
  return bookingExtras;
}

/**
 * Calculate booking price
 */
export function calculateBookingPrice(
  pricePerDay: number,
  days: number,
  extras: { id: string; pricePerDay: number }[]
): { subtotal: number; extrasTotal: number; total: number } {
  const subtotal = pricePerDay * days;
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.pricePerDay * days, 0);
  return {
    subtotal,
    extrasTotal,
    total: subtotal + extrasTotal,
  };
}
