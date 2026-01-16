export interface Booking {
  id: string;
  carId: string;
  carName: string;
  carImage: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  extras: string[];
}

export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    carId: '1',
    carName: 'Tesla Model 3',
    carImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    customerPhone: '+1 234 567 8900',
    pickupDate: '2024-01-15',
    returnDate: '2024-01-18',
    pickupLocation: 'Downtown',
    returnLocation: 'Downtown',
    totalDays: 3,
    pricePerDay: 89,
    totalPrice: 267,
    status: 'confirmed',
    createdAt: '2024-01-10T10:30:00Z',
    extras: ['GPS', 'Child Seat'],
  },
  {
    id: 'BK002',
    carId: '2',
    carName: 'BMW X5',
    carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    customerPhone: '+1 234 567 8901',
    pickupDate: '2024-01-20',
    returnDate: '2024-01-25',
    pickupLocation: 'Airport',
    returnLocation: 'Airport',
    totalDays: 5,
    pricePerDay: 129,
    totalPrice: 645,
    status: 'active',
    createdAt: '2024-01-12T14:15:00Z',
    extras: ['Insurance Premium', 'Additional Driver'],
  },
  {
    id: 'BK003',
    carId: '4',
    carName: 'Porsche 911',
    carImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
    customerName: 'Michael Brown',
    customerEmail: 'mbrown@email.com',
    customerPhone: '+1 234 567 8902',
    pickupDate: '2024-01-22',
    returnDate: '2024-01-24',
    pickupLocation: 'Downtown',
    returnLocation: 'Downtown',
    totalDays: 2,
    pricePerDay: 299,
    totalPrice: 598,
    status: 'pending',
    createdAt: '2024-01-14T09:00:00Z',
    extras: [],
  },
  {
    id: 'BK004',
    carId: '5',
    carName: 'Toyota Camry',
    carImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
    customerName: 'Emily Davis',
    customerEmail: 'emily.d@email.com',
    customerPhone: '+1 234 567 8903',
    pickupDate: '2024-01-10',
    returnDate: '2024-01-14',
    pickupLocation: 'Airport',
    returnLocation: 'Airport',
    totalDays: 4,
    pricePerDay: 59,
    totalPrice: 236,
    status: 'completed',
    createdAt: '2024-01-05T16:45:00Z',
    extras: ['GPS'],
  },
  {
    id: 'BK005',
    carId: '3',
    carName: 'Mercedes-Benz C-Class',
    carImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
    customerName: 'David Wilson',
    customerEmail: 'dwilson@email.com',
    customerPhone: '+1 234 567 8904',
    pickupDate: '2024-01-08',
    returnDate: '2024-01-09',
    pickupLocation: 'Downtown',
    returnLocation: 'Airport',
    totalDays: 1,
    pricePerDay: 109,
    totalPrice: 109,
    status: 'cancelled',
    createdAt: '2024-01-03T11:20:00Z',
    extras: [],
  },
];

export const bookingExtras = [
  { id: 'gps', name: 'GPS Navigation', pricePerDay: 10 },
  { id: 'child-seat', name: 'Child Seat', pricePerDay: 8 },
  { id: 'additional-driver', name: 'Additional Driver', pricePerDay: 15 },
  { id: 'insurance-premium', name: 'Premium Insurance', pricePerDay: 25 },
  { id: 'wifi', name: 'Mobile WiFi Hotspot', pricePerDay: 12 },
];
