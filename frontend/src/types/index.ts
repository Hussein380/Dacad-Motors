export interface Car {
    id: string;
    _id?: string; // Support backend _id
    name: string;
    brand: string;
    model: string;
    year: number;
    category: string;
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
    listingType?: 'Rent' | 'Sale' | 'Both';
    salePrice?: number;
    condition?: 'New' | 'Used' | 'Certified Pre-Owned';
    historyUrl?: string;
}

export interface Inquiry {
    id: string;
    carId: string;
    carName: string;
    carPrice?: number;
    customerName: string;
    email: string;
    phone: string;
    message: string;
    type: 'General Inquiry' | 'Test Drive' | 'Purchase Offer' | 'Trade-In';
    status: 'New' | 'Contacted' | 'Scheduled' | 'Sold' | 'Closed';
    createdAt: string;
}

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

export interface Recommendation {
    id: string;
    carId: string;
    reason: string;
    tags: string[];
    score: number;
}

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}
