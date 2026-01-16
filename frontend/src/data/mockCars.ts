export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: 'economy' | 'compact' | 'sedan' | 'suv' | 'luxury' | 'sports';
  pricePerDay: number;
  currency: string;
  imageUrl: string;
  images: string[];
  seats: number;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  features: string[];
  rating: number;
  reviewCount: number;
  available: boolean;
  location: string;
  mileage: string;
  description: string;
}

export const mockCars: Car[] = [
  {
    id: '1',
    name: 'Tesla Model 3',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2024,
    category: 'sedan',
    pricePerDay: 89,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&auto=format&fit=crop',
    ],
    seats: 5,
    transmission: 'automatic',
    fuelType: 'electric',
    features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Supercharger Access', 'Mobile App Control'],
    rating: 4.9,
    reviewCount: 234,
    available: true,
    location: 'Downtown',
    mileage: 'Unlimited',
    description: 'Experience the future of driving with the Tesla Model 3. Zero emissions, incredible performance, and cutting-edge technology.',
  },
  {
    id: '2',
    name: 'BMW X5',
    brand: 'BMW',
    model: 'X5',
    year: 2024,
    category: 'suv',
    pricePerDay: 129,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
    ],
    seats: 7,
    transmission: 'automatic',
    fuelType: 'hybrid',
    features: ['Panoramic Roof', 'Heated Seats', 'Navigation', 'Apple CarPlay', 'Parking Assist'],
    rating: 4.8,
    reviewCount: 189,
    available: true,
    location: 'Airport',
    mileage: '250 miles/day',
    description: 'Luxury meets versatility. The BMW X5 offers premium comfort for the whole family with powerful performance.',
  },
  {
    id: '3',
    name: 'Mercedes-Benz C-Class',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    category: 'luxury',
    pricePerDay: 109,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
    ],
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    features: ['Leather Interior', 'Burmester Sound', 'Ambient Lighting', 'MBUX System', 'Driver Assistance'],
    rating: 4.7,
    reviewCount: 156,
    available: true,
    location: 'Downtown',
    mileage: '200 miles/day',
    description: 'Elegant sophistication in every detail. The C-Class delivers a refined driving experience like no other.',
  },
  {
    id: '4',
    name: 'Porsche 911',
    brand: 'Porsche',
    model: '911 Carrera',
    year: 2024,
    category: 'sports',
    pricePerDay: 299,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
    ],
    seats: 2,
    transmission: 'automatic',
    fuelType: 'petrol',
    features: ['Sport Chrono', 'PASM', 'Bose Audio', 'Sport Exhaust', 'Launch Control'],
    rating: 5.0,
    reviewCount: 89,
    available: true,
    location: 'Downtown',
    mileage: '150 miles/day',
    description: 'The iconic sports car. Experience legendary Porsche performance and timeless design.',
  },
  {
    id: '5',
    name: 'Toyota Camry',
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    category: 'sedan',
    pricePerDay: 59,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
    ],
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    features: ['Apple CarPlay', 'Android Auto', 'Safety Sense', 'Wireless Charging', 'Adaptive Cruise'],
    rating: 4.6,
    reviewCount: 312,
    available: true,
    location: 'Airport',
    mileage: 'Unlimited',
    description: 'Reliable, efficient, and comfortable. The perfect choice for everyday driving.',
  },
  {
    id: '6',
    name: 'Honda CR-V',
    brand: 'Honda',
    model: 'CR-V',
    year: 2024,
    category: 'suv',
    pricePerDay: 69,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop',
    ],
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    features: ['Honda Sensing', 'Wireless CarPlay', 'Panoramic Roof', 'Power Liftgate', 'Heated Seats'],
    rating: 4.5,
    reviewCount: 278,
    available: true,
    location: 'Suburb',
    mileage: 'Unlimited',
    description: 'Spacious, practical, and fuel-efficient. Ideal for family adventures.',
  },
  {
    id: '7',
    name: 'Ford Mustang',
    brand: 'Ford',
    model: 'Mustang GT',
    year: 2024,
    category: 'sports',
    pricePerDay: 149,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d718c?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584345604476-8ec5f82d718c?w=800&auto=format&fit=crop',
    ],
    seats: 4,
    transmission: 'manual',
    fuelType: 'petrol',
    features: ['V8 Engine', 'Track Apps', 'B&O Audio', 'Performance Pack', 'Line Lock'],
    rating: 4.8,
    reviewCount: 167,
    available: false,
    location: 'Downtown',
    mileage: '150 miles/day',
    description: 'American muscle at its finest. Feel the raw power of the legendary Mustang.',
  },
  {
    id: '8',
    name: 'Nissan Leaf',
    brand: 'Nissan',
    model: 'Leaf',
    year: 2024,
    category: 'economy',
    pricePerDay: 45,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop',
    ],
    seats: 5,
    transmission: 'automatic',
    fuelType: 'electric',
    features: ['ProPILOT', 'e-Pedal', 'Fast Charging', 'NissanConnect', 'Zero Emissions'],
    rating: 4.4,
    reviewCount: 198,
    available: true,
    location: 'Airport',
    mileage: 'Unlimited',
    description: 'Eco-friendly and affordable. The smart choice for sustainable city driving.',
  },
];

export const carCategories = [
  { id: 'economy', name: 'Economy', icon: '💰' },
  { id: 'compact', name: 'Compact', icon: '🚗' },
  { id: 'sedan', name: 'Sedan', icon: '🚙' },
  { id: 'suv', name: 'SUV', icon: '🚐' },
  { id: 'luxury', name: 'Luxury', icon: '✨' },
  { id: 'sports', name: 'Sports', icon: '🏎️' },
];

export const locations = [
  'Downtown',
  'Airport',
  'Suburb',
  'Train Station',
  'Hotel District',
];
