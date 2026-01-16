# DriveEase - Car Rental Application

A modern, full-featured car rental web application built with React, TypeScript, and Tailwind CSS.

## Features

- 🚗 Browse and search available cars
- 📅 Book car rentals with date selection
- 🎨 Modern, responsive UI with smooth animations
- 🔍 Advanced filtering and search capabilities
- 📱 Mobile-friendly design
- ⚡ Fast and optimized performance

## Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **shadcn-ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd car-hire
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ai/        # AI chat widget
│   ├── booking/   # Booking-related components
│   ├── cars/      # Car listing and filter components
│   ├── common/    # Common layout components
│   └── ui/        # shadcn-ui components
├── data/          # Mock data
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
├── services/      # API service functions
└── test/          # Test files
```

## Deployment

Build the project for production:

```sh
npm run build
```

The `dist` folder will contain the production-ready files that can be deployed to any static hosting service like:
- Vercel
- Netlify
- AWS S3
- GitHub Pages

## License

This project is private and proprietary.
