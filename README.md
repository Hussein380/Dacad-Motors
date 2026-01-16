# DriveEase - Car Rental Application

A full-stack car rental application with React frontend and backend API.

## Project Structure

```
car-hire/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json   # Frontend dependencies
│
├── docs/             # Project documentation
│   ├── README.md                    # Original project README
│   └── FRONTEND_DOCUMENTATION.md    # Complete frontend documentation
│
└── .gitignore        # Git ignore rules
```

## Getting Started

### Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:8080`

For more details, see [docs/FRONTEND_DOCUMENTATION.md](docs/FRONTEND_DOCUMENTATION.md)

## Documentation

All project documentation is located in the `docs/` folder:

- **README.md** - Original project setup and overview
- **FRONTEND_DOCUMENTATION.md** - Complete frontend architecture, components, services, and backend integration guide

## Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **State Management**: React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod

## Development

This project is organized with frontend and backend separation in mind. The frontend is ready for backend integration - see the documentation for API endpoint specifications.
