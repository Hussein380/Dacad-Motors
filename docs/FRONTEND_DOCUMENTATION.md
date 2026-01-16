# DriveEase - Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Data Models](#data-models)
6. [Routing & Navigation](#routing--navigation)
7. [Services & API Layer](#services--api-layer)
8. [Components Documentation](#components-documentation)
9. [Mock Data Structure](#mock-data-structure)
10. [Backend Integration Guide](#backend-integration-guide)

---

## Project Overview

**DriveEase** is a modern car rental web application built with React, TypeScript, and Tailwind CSS. The application provides a complete car rental experience from browsing available vehicles to booking and managing reservations.

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

---

## Features

### 1. **Car Browsing & Search**
- Browse all available cars with pagination
- Advanced filtering by:
  - Category (Economy, Compact, Sedan, SUV, Luxury, Sports)
  - Price range
  - Transmission type (Automatic/Manual)
  - Fuel type (Electric, Hybrid, Petrol, Diesel)
  - Pickup location
  - Availability status
- Search by car name, brand, or model
- Featured cars section on homepage
- Category-based browsing

### 2. **Car Details**
- Detailed car information page
- High-quality images with lazy loading
- Specifications (seats, transmission, fuel type, mileage)
- Features list
- Customer ratings and reviews
- Real-time availability status
- Integrated booking form

### 3. **Booking System**
- Date range selection (pickup & return)
- Location selection (pickup & return can differ)
- Optional extras:
  - GPS Navigation
  - Child Seat
  - Additional Driver
  - Premium Insurance
  - Mobile WiFi Hotspot
- Customer information form
- Real-time price calculation
- Booking confirmation page

### 4. **AI Recommendations**
- Personalized car recommendations
- AI-powered chat assistant (widget)
- Recommendation reasons and tags
- Context-aware suggestions

### 5. **Admin Dashboard**
- View all bookings with status management
- Car fleet management
- Statistics dashboard:
  - Total cars
  - Active bookings
  - Revenue tracking
  - Customer count
- Search functionality
- Booking status management (Pending, Confirmed, Active, Completed, Cancelled)

### 6. **User Experience**
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Loading states and skeletons
- Error handling
- Optimistic UI updates
- Lazy image loading

---

## Architecture

### Application Flow

```
User Journey:
1. Home Page → Browse featured cars, categories, recommendations
2. Cars Listing → Filter/search → View details
3. Car Details → Fill booking form → Confirmation
4. Admin Dashboard → Manage bookings and cars
```

### State Management Strategy

- **Server State**: React Query for API data (cars, bookings, recommendations)
- **Local State**: React useState for UI state (filters, form data)
- **URL State**: React Router search params for shareable filter states
- **Form State**: React Hook Form for complex forms

### Data Flow

```
Components → Services → API Client → Backend (Future)
                ↓
           Mock Data (Current)
```

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ai/             # AI chat widget
│   │   └── AIChatWidget.tsx
│   ├── booking/        # Booking-related components
│   │   └── BookingForm.tsx
│   ├── cars/           # Car listing components
│   │   ├── CarCard.tsx
│   │   └── CarFilters.tsx
│   ├── common/         # Shared layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── LazyImage.tsx
│   │   └── Skeleton.tsx
│   └── ui/             # shadcn-ui base components
│
├── data/               # Mock data and interfaces
│   ├── mockCars.ts
│   ├── mockBookings.ts
│   └── mockRecommendations.ts
│
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/                # Utility functions
│   └── utils.ts
│
├── pages/              # Page components (routes)
│   ├── Home/
│   ├── Cars/
│   │   ├── index.tsx
│   │   └── CarDetails.tsx
│   ├── Booking/
│   │   └── Confirmation.tsx
│   ├── Admin/
│   └── NotFound.tsx
│
├── services/           # API service layer
│   ├── apiClient.ts
│   ├── carService.ts
│   ├── bookingService.ts
│   └── recommendationService.ts
│
├── App.tsx             # Main app component with routing
└── main.tsx            # Application entry point
```

---

## Data Models

### Car Model

```typescript
interface Car {
  id: string;                    // Unique identifier
  name: string;                   // Display name (e.g., "Tesla Model 3")
  brand: string;                  // Manufacturer (e.g., "Tesla")
  model: string;                  // Model name (e.g., "Model 3")
  year: number;                   // Manufacturing year
  category: 'economy' | 'compact' | 'sedan' | 'suv' | 'luxury' | 'sports';
  pricePerDay: number;            // Rental price per day
  currency: string;               // Currency code (e.g., "USD")
  imageUrl: string;              // Primary image URL
  images: string[];               // Additional image URLs
  seats: number;                  // Number of seats
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  features: string[];             // Array of feature names
  rating: number;                 // Average rating (0-5)
  reviewCount: number;           // Number of reviews
  available: boolean;             // Availability status
  location: string;               // Pickup location
  mileage: string;                // Mileage limit (e.g., "Unlimited", "200 miles/day")
  description: string;          // Detailed description
}
```

### Booking Model

```typescript
interface Booking {
  id: string;                     // Booking reference (e.g., "BK001")
  carId: string;                  // Reference to car
  carName: string;                // Car name (denormalized)
  carImage: string;               // Car image (denormalized)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;             // ISO date string
  returnDate: string;             // ISO date string
  pickupLocation: string;
  returnLocation: string;
  totalDays: number;              // Calculated rental days
  pricePerDay: number;            // Price at time of booking
  totalPrice: number;            // Total booking price
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: string;              // ISO timestamp
  extras: string[];               // Array of extra IDs
}
```

### Recommendation Model

```typescript
interface Recommendation {
  id: string;
  carId: string;                  // Reference to recommended car
  reason: string;                 // Why this car is recommended
  score: number;                  // Recommendation score (0-1)
  tags: string[];                // Tags (e.g., ["Electric", "Popular"])
}
```

### Booking Extras Model

```typescript
interface BookingExtra {
  id: string;                     // Unique identifier
  name: string;                   // Display name
  pricePerDay: number;            // Additional cost per day
}
```

---

## Routing & Navigation

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page with hero, featured cars, categories, recommendations |
| `/cars` | `Cars` | Car listing page with filters and search |
| `/cars/:id` | `CarDetails` | Individual car details and booking form |
| `/booking/confirmation` | `BookingConfirmation` | Booking confirmation page |
| `/admin` | `Admin` | Admin dashboard for managing bookings and cars |
| `*` | `NotFound` | 404 error page |

### Navigation Structure

```
Header Navigation:
- Home (/)
- Browse Cars (/cars)
- Admin (/admin) [Future: Protected route]

Footer Links:
- Browse Cars
- Special Offers
- Locations
- FAQ
- Help Center
- Terms of Service
- Privacy Policy
- Contact Us
```

### URL State Management

The application uses URL search parameters for shareable filter states:

- `/cars?category=sedan` - Filter by category
- `/cars?search=tesla` - Search query
- `/cars?category=suv&priceMin=50&priceMax=150` - Multiple filters

---

## Services & API Layer

### Service Architecture

All data operations are abstracted through service layers located in `src/services/`. Currently, these services use mock data but are structured to easily switch to real API calls.

### Car Service (`carService.ts`)

**Functions:**

```typescript
// Get all cars with optional filters
getCars(filters?: CarFilters): Promise<CarsResponse>

// Get single car by ID
getCarById(id: string): Promise<Car | null>

// Get featured cars (top rated, available)
getFeaturedCars(limit?: number): Promise<Car[]>

// Get available categories
getCategories(): Promise<Category[]>

// Get available locations
getLocations(): Promise<string[]>

// Search cars by query
searchCars(query: string): Promise<Car[]>
```

**Filter Interface:**

```typescript
interface CarFilters {
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
```

**Response Interface:**

```typescript
interface CarsResponse {
  cars: Car[];
  total: number;
  page: number;
  pageSize: number;
}
```

### Booking Service (`bookingService.ts`)

**Functions:**

```typescript
// Get all bookings (optionally filtered by status)
getBookings(status?: BookingStatus): Promise<BookingsResponse>

// Get single booking by ID
getBookingById(id: string): Promise<Booking | null>

// Create new booking
createBooking(data: CreateBookingData): Promise<Booking>

// Update booking status
updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null>

// Cancel booking
cancelBooking(id: string): Promise<boolean>

// Get available extras
getBookingExtras(): Promise<BookingExtra[]>

// Calculate booking price
calculateBookingPrice(
  pricePerDay: number,
  days: number,
  extras: BookingExtra[]
): PricingBreakdown
```

**Create Booking Data:**

```typescript
interface CreateBookingData {
  carId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;        // ISO date string
  returnDate: string;        // ISO date string
  pickupLocation: string;
  returnLocation: string;
  extras: string[];          // Array of extra IDs
}
```

**Pricing Breakdown:**

```typescript
interface PricingBreakdown {
  subtotal: number;          // Base price (pricePerDay × days)
  extrasTotal: number;       // Total extras cost
  total: number;             // Final total
}
```

### Recommendation Service (`recommendationService.ts`)

**Functions:**

```typescript
// Get personalized recommendations
getRecommendations(): Promise<(Recommendation & { car: Car })[]>

// Get AI chat response
getAIChatResponse(message: string): Promise<string>

// Get initial AI greeting
getInitialMessage(): AIMessage
```

### API Client (`apiClient.ts`)

The API client provides a centralized way to make HTTP requests. Currently configured for mock data but ready for backend integration.

**Configuration:**

```typescript
const BASE_URL = '/api';  // Update when connecting real backend
```

**API Request Function:**

```typescript
apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>
```

**Response Interface:**

```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}
```

---

## Components Documentation

### Layout Components

#### `Layout.tsx`
Main layout wrapper that includes Header and Footer.

**Props:**
- `showFooter?: boolean` - Toggle footer visibility

#### `Header.tsx`
Application header with navigation and branding.

**Features:**
- Responsive navigation menu
- Mobile hamburger menu
- Active route highlighting
- Sign In / Book Now CTAs

#### `Footer.tsx`
Application footer with links and contact information.

**Sections:**
- Brand information
- Quick links
- Support links
- Contact information
- Social media links

### Car Components

#### `CarCard.tsx`
Card component for displaying car information in listings.

**Props:**
```typescript
interface CarCardProps {
  car: Car;
  index?: number;  // For animation delay
}
```

**Features:**
- Car image with lazy loading
- Availability badge
- Category badge
- Rating display
- Quick specs (seats, transmission, fuel)
- Price display
- Book Now button

#### `CarFilters.tsx`
Advanced filtering component for car listings.

**Props:**
```typescript
interface CarFiltersProps {
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
  totalResults: number;
}
```

**Filter Options:**
- Search bar
- Category buttons
- Price range slider
- Transmission type
- Fuel type
- Pickup location
- Clear filters button

### Booking Components

#### `BookingForm.tsx`
Form component for creating a new booking.

**Props:**
```typescript
interface BookingFormProps {
  car: Car;
}
```

**Form Sections:**
1. **Rental Period**: Pickup and return dates
2. **Pickup & Return**: Location selection
3. **Optional Extras**: Checkboxes with pricing
4. **Customer Information**: Name, email, phone
5. **Price Summary**: Real-time calculation
6. **Submit Button**: Validates and navigates to confirmation

**Validation:**
- Required fields: pickupDate, returnDate, customerName, customerEmail
- Return date must be after pickup date
- Email format validation

**Navigation:**
On successful submission, navigates to `/booking/confirmation` with booking state.

### AI Components

#### `AIChatWidget.tsx`
Floating AI chat assistant widget for helping users find cars.

**Features:**
- Floating button in bottom-right corner
- Expandable chat window
- Message history
- Loading states with animated dots
- Auto-scroll to latest message
- Keyboard support (Enter to send)

**Usage:**
The widget is typically included in the Layout component and appears on all pages.

**State Management:**
- Manages its own message history
- Calls `getAIChatResponse()` from recommendation service
- Handles user input and AI responses

### Common Components

#### `LazyImage.tsx`
Lazy-loading image component with fallback support.

**Props:**
```typescript
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  fallback?: string;
}
```

**Features:**
- Intersection Observer for lazy loading
- Fallback image support
- Responsive image loading

#### `Skeleton.tsx`
Loading skeleton component for better UX during data fetching.

**Variants:**
- `CarCardSkeleton` - For car listing cards
- Generic `Skeleton` - For various loading states

---

## Mock Data Structure

### Car Categories

```typescript
const carCategories = [
  { id: 'economy', name: 'Economy', icon: '💰' },
  { id: 'compact', name: 'Compact', icon: '🚗' },
  { id: 'sedan', name: 'Sedan', icon: '🚙' },
  { id: 'suv', name: 'SUV', icon: '🚐' },
  { id: 'luxury', name: 'Luxury', icon: '✨' },
  { id: 'sports', name: 'Sports', icon: '🏎️' },
];
```

### Locations

```typescript
const locations = [
  'Downtown',
  'Airport',
  'Suburb',
  'Train Station',
  'Hotel District',
];
```

### Booking Extras

```typescript
const bookingExtras = [
  { id: 'gps', name: 'GPS Navigation', pricePerDay: 10 },
  { id: 'child-seat', name: 'Child Seat', pricePerDay: 8 },
  { id: 'additional-driver', name: 'Additional Driver', pricePerDay: 15 },
  { id: 'insurance-premium', name: 'Premium Insurance', pricePerDay: 25 },
  { id: 'wifi', name: 'Mobile WiFi Hotspot', pricePerDay: 12 },
];
```

### Sample Data

The application includes 8 sample cars across different categories:
- Tesla Model 3 (Sedan, Electric)
- BMW X5 (SUV, Hybrid)
- Mercedes-Benz C-Class (Luxury, Petrol)
- Porsche 911 (Sports, Petrol)
- Toyota Camry (Sedan, Hybrid)
- Honda CR-V (SUV, Hybrid)
- Ford Mustang (Sports, Petrol) - Unavailable
- Nissan Leaf (Economy, Electric)

5 sample bookings with various statuses are included for admin dashboard testing.

---

## Backend Integration Guide

### Current State

The frontend is currently using mock data through service layers. All services are structured to easily switch to real API calls.

### Integration Steps

#### 1. Update API Client

**File**: `src/services/apiClient.ts`

```typescript
// Update BASE_URL
const BASE_URL = 'https://api.yourapp.com';  // Your backend URL

// Uncomment and configure the fetch logic
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        // 'Authorization': `Bearer ${getToken()}`,
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
}
```

#### 2. Update Car Service

**File**: `src/services/carService.ts`

Replace mock data calls with API requests:

```typescript
export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const response = await apiRequest<CarsResponse>(
    `/cars?${queryParams.toString()}`
  );
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error || 'Failed to fetch cars');
}
```

#### 3. Update Booking Service

**File**: `src/services/bookingService.ts`

```typescript
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const response = await apiRequest<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error || 'Failed to create booking');
}
```

#### 4. Expected API Endpoints

Based on the service structure, your backend should provide:

**Cars:**
- `GET /api/cars` - Get all cars (with query params for filters)
- `GET /api/cars/:id` - Get single car
- `GET /api/cars/featured?limit=4` - Get featured cars
- `GET /api/categories` - Get car categories
- `GET /api/locations` - Get pickup locations

**Bookings:**
- `GET /api/bookings` - Get all bookings (with optional status filter)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/extras` - Get available extras

**Recommendations:**
- `GET /api/recommendations` - Get personalized recommendations
- `POST /api/ai/chat` - Get AI chat response

#### 5. API Request/Response Formats

**Get Cars Response:**
```json
{
  "cars": [...],
  "total": 50,
  "page": 1,
  "pageSize": 20
}
```

**Create Booking Request:**
```json
{
  "carId": "1",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "pickupDate": "2024-02-01",
  "returnDate": "2024-02-05",
  "pickupLocation": "Downtown",
  "returnLocation": "Downtown",
  "extras": ["gps", "child-seat"]
}
```

**Create Booking Response:**
```json
{
  "id": "BK001",
  "carId": "1",
  "carName": "Tesla Model 3",
  "carImage": "https://...",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "pickupDate": "2024-02-01",
  "returnDate": "2024-02-05",
  "pickupLocation": "Downtown",
  "returnLocation": "Downtown",
  "totalDays": 4,
  "pricePerDay": 89,
  "totalPrice": 356,
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z",
  "extras": ["gps", "child-seat"]
}
```

#### 6. Error Handling

Update services to handle API errors appropriately:

```typescript
export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
  try {
    const response = await apiRequest<CarsResponse>(`/cars?...`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch cars');
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching cars:', error);
    // Return empty result or throw based on your error handling strategy
    return { cars: [], total: 0, page: 1, pageSize: 0 };
  }
}
```

#### 7. Authentication (If Needed)

If your backend requires authentication:

1. Create an auth service to manage tokens
2. Add token to API client headers
3. Implement token refresh logic
4. Add protected routes (e.g., Admin dashboard)

**Example Auth Service:**
```typescript
// src/services/authService.ts
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}
```

**Update API Client:**
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
  ...options?.headers,
}
```

### Testing Backend Integration

1. **Start with one service**: Begin by integrating the car service
2. **Test endpoints**: Use tools like Postman to verify API responses
3. **Update gradually**: Replace mock data service by service
4. **Handle loading states**: Ensure loading skeletons work correctly
5. **Test error cases**: Verify error handling for failed requests

### Environment Variables

Create a `.env` file for configuration:

```env
VITE_API_BASE_URL=https://api.yourapp.com
VITE_API_TIMEOUT=10000
```

Update `apiClient.ts`:
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

---

## Additional Notes

### Performance Optimizations

- **Lazy Loading**: Images use lazy loading for better performance
- **Code Splitting**: Routes are code-split automatically by Vite
- **React Query**: Caching and background refetching for API data
- **Memoization**: Components use React.memo where appropriate

### Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

---

## Next Steps for Backend Development

When building the backend, consider:

1. **Database Schema**: Design tables based on the data models above
2. **API Endpoints**: Implement all endpoints listed in the integration guide
3. **Authentication**: Add user authentication if needed
4. **Validation**: Validate all input data on the backend
5. **Error Handling**: Return consistent error responses
6. **Pagination**: Implement pagination for car listings
7. **Search**: Implement full-text search for car search
8. **Booking Logic**: Handle date conflicts, availability checks
9. **Email Notifications**: Send confirmation emails
10. **Payment Integration**: Add payment processing (if needed)

---

**Documentation Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team
