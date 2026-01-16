# DriveEase - Backend Implementation Guide (MERN Stack)

## Table of Contents
1. [Overview](#overview)
2. [Project Setup](#project-setup)
3. [Database Schema Design](#database-schema-design)
4. [API Architecture](#api-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Endpoints Implementation](#api-endpoints-implementation)
7. [Business Logic](#business-logic)
8. [Validation & Error Handling](#validation--error-handling)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Step-by-Step Implementation Checklist](#step-by-step-implementation-checklist)

---

## Overview

This guide provides a complete, step-by-step implementation plan for building the DriveEase backend using the MERN stack:
- **M**ongoDB - Database
- **E**xpress.js - Web framework
- **R**eact - Frontend (already built)
- **N**ode.js - Runtime environment

### Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi or express-validator
- **File Upload**: Multer (for car images)
- **Email**: Nodemailer (for booking confirmations)
- **Environment**: dotenv
- **Security**: bcrypt, helmet, cors
- **API Documentation**: Swagger/OpenAPI

---

## Project Setup

### Step 1: Initialize Backend Project

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize npm project
npm init -y

# Install core dependencies
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken joi multer nodemailer

# Install dev dependencies
npm install -D nodemon concurrently eslint prettier jest supertest
```

### Step 2: Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── cloudinary.js         # Image upload (optional)
│   │   └── email.js              # Email configuration
│   │
│   ├── models/
│   │   ├── Car.js
│   │   ├── Booking.js
│   │   ├── User.js
│   │   ├── BookingExtra.js
│   │   ├── Location.js
│   │   └── Review.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── cars.routes.js
│   │   ├── bookings.routes.js
│   │   ├── recommendations.routes.js
│   │   ├── admin.routes.js
│   │   └── index.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── cars.controller.js
│   │   ├── bookings.controller.js
│   │   ├── recommendations.controller.js
│   │   └── admin.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── validation.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── services/
│   │   ├── booking.service.js
│   │   ├── email.service.js
│   │   ├── availability.service.js
│   │   └── pricing.service.js
│   │
│   ├── utils/
│   │   ├── generateBookingId.js
│   │   ├── calculateDays.js
│   │   └── constants.js
│   │
│   ├── validators/
│   │   ├── car.validator.js
│   │   ├── booking.validator.js
│   │   └── auth.validator.js
│   │
│   ├── app.js                  # Express app setup
│   └── server.js               # Server entry point
│
├── uploads/                    # Temporary file storage
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── .env
├── .gitignore
├── package.json
└── README.md
```

### Step 3: Environment Configuration

Create `.env` file:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/driveease
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/driveease

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Email (for booking confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Cloudinary (optional, for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 4: Basic Express Setup

**src/app.js:**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cars', require('./routes/cars.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/recommendations', require('./routes/recommendations.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(require('./middleware/errorHandler.middleware'));

module.exports = app;
```

**src/server.js:**
```javascript
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## Database Schema Design

### Step 5: MongoDB Models

#### Car Model

**src/models/Car.js:**
```javascript
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be valid'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  category: {
    type: String,
    enum: ['economy', 'compact', 'sedan', 'suv', 'luxury', 'sports'],
    required: [true, 'Category is required']
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  images: [{
    type: String
  }],
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [2, 'Car must have at least 2 seats'],
    max: [10, 'Car cannot have more than 10 seats']
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual'],
    required: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    required: true
  },
  features: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  mileage: {
    type: String,
    default: 'Unlimited'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  // Additional fields for availability checking
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
carSchema.index({ category: 1 });
carSchema.index({ available: 1 });
carSchema.index({ location: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ brand: 1, model: 1 });
carSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });

// Virtual for full name
carSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model}`;
});

module.exports = mongoose.model('Car', carSchema);
```

#### Booking Model

**src/models/Booking.js:**
```javascript
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional if guest booking
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true
  },
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required'],
    validate: {
      validator: function(value) {
        return value > this.pickupDate;
      },
      message: 'Return date must be after pickup date'
    }
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required']
  },
  returnLocation: {
    type: String,
    required: [true, 'Return location is required']
  },
  totalDays: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  extras: [{
    extra: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookingExtra'
    },
    pricePerDay: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  extrasTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
    default: null
  },
  notes: {
    type: String,
    maxlength: 500
  },
  cancellationReason: String,
  cancelledAt: Date
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ car: 1, pickupDate: 1, returnDate: 1 });
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total days
bookingSchema.pre('save', function(next) {
  if (this.isModified('pickupDate') || this.isModified('returnDate')) {
    const diffTime = Math.abs(this.returnDate - this.pickupDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
```

#### User Model (for Admin/Authentication)

**src/models/User.js:**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

#### BookingExtra Model

**src/models/BookingExtra.js:**
```javascript
const mongoose = require('mongoose');

const bookingExtraSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Extra name is required'],
    trim: true
  },
  description: String,
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [0, 'Price cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['equipment', 'insurance', 'service'],
    default: 'equipment'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookingExtra', bookingExtraSchema);
```

#### Location Model

**src/models/Location.js:**
```javascript
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: String,
  state: String,
  zipCode: String,
  country: {
    type: String,
    default: 'USA'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  phone: String,
  hours: {
    open: String,
    close: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Location', locationSchema);
```

#### Review Model (Optional - for future)

**src/models/Review.js:**
```javascript
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update car rating when review is created
reviewSchema.post('save', async function() {
  const Car = mongoose.model('Car');
  const car = await Car.findById(this.car);
  if (car) {
    const reviews = await mongoose.model('Review').find({ car: this.car });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    car.rating = Math.round(avgRating * 10) / 10;
    car.reviewCount = reviews.length;
    await car.save();
  }
});

module.exports = mongoose.model('Review', reviewSchema);
```

### Step 6: Database Connection

**src/config/database.js:**
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## API Architecture

### Step 7: Response Format Standardization

**src/utils/response.js:**
```javascript
const sendResponse = (res, statusCode, success, data = null, message = null, error = null) => {
  const response = {
    success,
    ...(data && { data }),
    ...(message && { message }),
    ...(error && { error }),
    timestamp: new Date().toISOString()
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess: (res, data, message = null, statusCode = 200) => {
    return sendResponse(res, statusCode, true, data, message);
  },
  sendError: (res, error, statusCode = 500) => {
    return sendResponse(res, statusCode, false, null, null, error);
  }
};
```

### Step 8: Error Handling Middleware

**src/middleware/errorHandler.middleware.js:**
```javascript
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  sendError(res, error.message || 'Server Error', error.statusCode || 500);
};

module.exports = errorHandler;
```

---

## Authentication & Authorization

### Step 9: Authentication Middleware

**src/middleware/auth.middleware.js:**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Not authorized to access this route', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      
      if (!req.user || !req.user.isActive) {
        return sendError(res, 'User no longer exists or is inactive', 401);
      }

      next();
    } catch (err) {
      return sendError(res, 'Not authorized to access this route', 401);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to perform this action', 403);
    }
    next();
  };
};
```

### Step 10: Auth Controller & Routes

**src/controllers/auth.controller.js:**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'User already exists', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer'
    });

    // Generate token
    const token = generateToken(user._id);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, 'User registered successfully', 201);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is inactive', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, 'Login successful');
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};
```

**src/routes/auth.routes.js:**
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../validators/auth.validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
```

---

## API Endpoints Implementation

### Step 11: Cars API

**src/controllers/cars.controller.js:**
```javascript
const Car = require('../models/Car');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get all cars with filters
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
  try {
    const {
      category,
      priceMin,
      priceMax,
      transmission,
      fuelType,
      location,
      seats,
      available,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (priceMin || priceMax) {
      query.pricePerDay = {};
      if (priceMin) query.pricePerDay.$gte = Number(priceMin);
      if (priceMax) query.pricePerDay.$lte = Number(priceMax);
    }

    if (transmission) {
      query.transmission = transmission;
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    if (location) {
      query.location = location;
    }

    if (seats) {
      query.seats = { $gte: Number(seats) };
    }

    if (available !== undefined) {
      query.available = available === 'true';
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const skip = (page - 1) * limit;
    const cars = await Car.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Car.countDocuments(query);

    sendSuccess(res, {
      cars,
      total,
      page: Number(page),
      pageSize: Number(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return sendError(res, 'Car not found', 404);
    }

    sendSuccess(res, car);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Get featured cars
// @route   GET /api/cars/featured
// @access  Public
exports.getFeaturedCars = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;
    
    const cars = await Car.find({
      available: true,
      rating: { $gte: 4.5 }
    })
      .sort('-rating')
      .limit(limit);

    sendSuccess(res, cars);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Get categories
// @route   GET /api/cars/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 'economy', name: 'Economy', icon: '💰' },
      { id: 'compact', name: 'Compact', icon: '🚗' },
      { id: 'sedan', name: 'Sedan', icon: '🚙' },
      { id: 'suv', name: 'SUV', icon: '🚐' },
      { id: 'luxury', name: 'Luxury', icon: '✨' },
      { id: 'sports', name: 'Sports', icon: '🏎️' }
    ];

    sendSuccess(res, categories);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Create car (Admin only)
// @route   POST /api/cars
// @access  Private/Admin
exports.createCar = async (req, res) => {
  try {
    const car = await Car.create(req.body);
    sendSuccess(res, car, 'Car created successfully', 201);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Update car (Admin only)
// @route   PUT /api/cars/:id
// @access  Private/Admin
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!car) {
      return sendError(res, 'Car not found', 404);
    }

    sendSuccess(res, car, 'Car updated successfully');
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Delete car (Admin only)
// @route   DELETE /api/cars/:id
// @access  Private/Admin
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return sendError(res, 'Car not found', 404);
    }

    await car.remove();
    sendSuccess(res, null, 'Car deleted successfully');
  } catch (error) {
    sendError(res, error.message, 500);
  }
};
```

**src/routes/cars.routes.js:**
```javascript
const express = require('express');
const router = express.Router();
const carsController = require('../controllers/cars.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.get('/', carsController.getCars);
router.get('/featured', carsController.getFeaturedCars);
router.get('/categories', carsController.getCategories);
router.get('/:id', carsController.getCarById);

// Admin routes
router.post('/', protect, restrictTo('admin'), carsController.createCar);
router.put('/:id', protect, restrictTo('admin'), carsController.updateCar);
router.delete('/:id', protect, restrictTo('admin'), carsController.deleteCar);

module.exports = router;
```

---

## Business Logic

### Step 12: Booking Service (Core Business Logic)

**src/services/booking.service.js:**
```javascript
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const BookingExtra = require('../models/BookingExtra');
const { generateBookingId } = require('../utils/generateBookingId');
const { calculateDays } = require('../utils/calculateDays');
const availabilityService = require('./availability.service');
const pricingService = require('./pricing.service');

/**
 * Create a new booking with all validations
 */
exports.createBooking = async (bookingData) => {
  const {
    carId,
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    pickupDate,
    returnDate,
    pickupLocation,
    returnLocation,
    extras = []
  } = bookingData;

  // 1. Validate car exists and is available
  const car = await Car.findById(carId);
  if (!car) {
    throw new Error('Car not found');
  }

  if (!car.available) {
    throw new Error('Car is not available for booking');
  }

  // 2. Check date availability
  const isAvailable = await availabilityService.checkCarAvailability(
    carId,
    new Date(pickupDate),
    new Date(returnDate)
  );

  if (!isAvailable) {
    throw new Error('Car is not available for the selected dates');
  }

  // 3. Calculate total days
  const totalDays = calculateDays(new Date(pickupDate), new Date(returnDate));
  if (totalDays < 1) {
    throw new Error('Return date must be after pickup date');
  }

  // 4. Get and validate extras
  const extraItems = [];
  if (extras.length > 0) {
    for (const extraId of extras) {
      const extra = await BookingExtra.findOne({ id: extraId });
      if (!extra || !extra.available) {
        throw new Error(`Extra ${extraId} is not available`);
      }
      extraItems.push({
        extra: extra._id,
        pricePerDay: extra.pricePerDay,
        quantity: 1
      });
    }
  }

  // 5. Calculate pricing
  const pricing = pricingService.calculateBookingPrice(
    car.pricePerDay,
    totalDays,
    extraItems
  );

  // 6. Create booking
  const booking = await Booking.create({
    bookingId: generateBookingId(),
    car: carId,
    customer: customerId,
    customerName,
    customerEmail,
    customerPhone,
    pickupDate: new Date(pickupDate),
    returnDate: new Date(returnDate),
    pickupLocation,
    returnLocation,
    totalDays,
    pricePerDay: car.pricePerDay,
    extras: extraItems,
    subtotal: pricing.subtotal,
    extrasTotal: pricing.extrasTotal,
    totalPrice: pricing.total,
    status: 'pending'
  });

  // 7. Populate car details for response
  await booking.populate('car', 'name brand model imageUrl');
  await booking.populate('extras.extra', 'name pricePerDay');

  return booking;
};

/**
 * Update booking status
 */
exports.updateBookingStatus = async (bookingId, status, cancellationReason = null) => {
  const booking = await Booking.findOne({ bookingId });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['active', 'cancelled'],
    active: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!validTransitions[booking.status].includes(status)) {
    throw new Error(`Cannot change status from ${booking.status} to ${status}`);
  }

  booking.status = status;
  
  if (status === 'cancelled') {
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = new Date();
  }

  await booking.save();
  return booking;
};
```

**src/services/availability.service.js:**
```javascript
const Booking = require('../models/Booking');

/**
 * Check if car is available for given date range
 */
exports.checkCarAvailability = async (carId, pickupDate, returnDate) => {
  // Find overlapping bookings
  const overlappingBookings = await Booking.find({
    car: carId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      {
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate }
      }
    ]
  });

  return overlappingBookings.length === 0;
};

/**
 * Get available cars for date range
 */
exports.getAvailableCars = async (pickupDate, returnDate, filters = {}) => {
  // Find all cars with bookings in this date range
  const bookedCars = await Booking.find({
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      {
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate }
      }
    ]
  }).distinct('car');

  // Build query excluding booked cars
  const query = {
    _id: { $nin: bookedCars },
    available: true,
    ...filters
  };

  return query;
};
```

**src/services/pricing.service.js:**
```javascript
/**
 * Calculate booking price breakdown
 */
exports.calculateBookingPrice = (pricePerDay, totalDays, extras = []) => {
  const subtotal = pricePerDay * totalDays;
  
  const extrasTotal = extras.reduce((sum, extra) => {
    return sum + (extra.pricePerDay * totalDays * (extra.quantity || 1));
  }, 0);

  const total = subtotal + extrasTotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    extrasTotal: Math.round(extrasTotal * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};
```

**src/utils/generateBookingId.js:**
```javascript
/**
 * Generate unique booking ID
 * Format: BK + 6 random digits
 */
exports.generateBookingId = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BK${random}`;
};
```

**src/utils/calculateDays.js:**
```javascript
/**
 * Calculate number of days between two dates
 */
exports.calculateDays = (startDate, endDate) => {
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
```

### Step 13: Bookings Controller

**src/controllers/bookings.controller.js:**
```javascript
const Booking = require('../models/Booking');
const bookingService = require('../services/booking.service');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking({
      ...req.body,
      customerId: req.user?.id // Optional if logged in
    });

    // Send confirmation email (async)
    // emailService.sendBookingConfirmation(booking).catch(console.error);

    sendSuccess(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    // If not admin, only show user's bookings
    if (req.user.role !== 'admin') {
      query.customer = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('car', 'name brand model imageUrl')
      .populate('extras.extra', 'name pricePerDay')
      .sort('-createdAt');

    sendSuccess(res, {
      bookings,
      total: bookings.length
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id })
      .populate('car')
      .populate('extras.extra');

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.customer?.toString() !== req.user.id) {
      return sendError(res, 'Not authorized', 403);
    }

    sendSuccess(res, booking);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      status,
      cancellationReason
    );

    sendSuccess(res, booking, 'Booking status updated');
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      'cancelled',
      req.body.reason || 'Cancelled by user'
    );

    sendSuccess(res, booking, 'Booking cancelled');
  } catch (error) {
    sendError(res, error.message, 400);
  }
};
```

**src/routes/bookings.routes.js:**
```javascript
const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateCreateBooking } = require('../validators/booking.validator');

router.post('/', validateCreateBooking, bookingsController.createBooking);
router.get('/', protect, bookingsController.getBookings);
router.get('/:id', protect, bookingsController.getBookingById);
router.patch('/:id/status', protect, restrictTo('admin'), bookingsController.updateBookingStatus);
router.delete('/:id', protect, bookingsController.cancelBooking);

module.exports = router;
```

---

## Validation & Error Handling

### Step 14: Validators

**src/validators/booking.validator.js:**
```javascript
const Joi = require('joi');

exports.validateCreateBooking = (req, res, next) => {
  const schema = Joi.object({
    carId: Joi.string().required(),
    customerName: Joi.string().min(2).max(50).required(),
    customerEmail: Joi.string().email().required(),
    customerPhone: Joi.string().required(),
    pickupDate: Joi.date().min('now').required(),
    returnDate: Joi.date().greater(Joi.ref('pickupDate')).required(),
    pickupLocation: Joi.string().required(),
    returnLocation: Joi.string().required(),
    extras: Joi.array().items(Joi.string()).default([])
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};
```

**src/validators/car.validator.js:**
```javascript
const Joi = require('joi');

exports.validateCreateCar = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    brand: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    category: Joi.string().valid('economy', 'compact', 'sedan', 'suv', 'luxury', 'sports').required(),
    pricePerDay: Joi.number().min(0).required(),
    imageUrl: Joi.string().uri().required(),
    seats: Joi.number().integer().min(2).max(10).required(),
    transmission: Joi.string().valid('automatic', 'manual').required(),
    fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid').required(),
    features: Joi.array().items(Joi.string()).default([]),
    location: Joi.string().required(),
    description: Joi.string().max(1000).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};
```

---

## Testing Strategy

### Step 15: Test Setup

**tests/integration/bookings.test.js:**
```javascript
const request = require('supertest');
const app = require('../../src/app');
const Booking = require('../../src/models/Booking');
const Car = require('../../src/models/Car');

describe('Booking API', () => {
  beforeEach(async () => {
    await Booking.deleteMany();
    await Car.deleteMany();
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      // Create test car
      const car = await Car.create({
        name: 'Test Car',
        brand: 'Test',
        model: 'Model',
        year: 2024,
        category: 'sedan',
        pricePerDay: 50,
        imageUrl: 'test.jpg',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        location: 'Downtown',
        description: 'Test car'
      });

      const bookingData = {
        carId: car._id,
        customerName: 'John Doe',
        customerEmail: 'john@test.com',
        customerPhone: '+1234567890',
        pickupDate: new Date(Date.now() + 86400000).toISOString(),
        returnDate: new Date(Date.now() + 172800000).toISOString(),
        pickupLocation: 'Downtown',
        returnLocation: 'Downtown',
        extras: []
      };

      const res = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingId).toBeDefined();
    });
  });
});
```

---

## Deployment

### Step 16: Production Considerations

1. **Environment Variables**: Use proper secret management
2. **Database**: Use MongoDB Atlas for production
3. **Error Logging**: Implement Winston or similar
4. **Rate Limiting**: Add express-rate-limit
5. **API Documentation**: Add Swagger/OpenAPI
6. **Monitoring**: Add health checks and logging
7. **Security**: Enable HTTPS, validate all inputs
8. **Caching**: Consider Redis for frequently accessed data

---

## Step-by-Step Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Project setup and folder structure
- [ ] Database connection
- [ ] Basic Express server
- [ ] Environment configuration
- [ ] Error handling middleware

### Phase 2: Database Models (Week 1-2)
- [ ] Car model
- [ ] Booking model
- [ ] User model
- [ ] BookingExtra model
- [ ] Location model
- [ ] Review model (optional)
- [ ] Database indexes

### Phase 3: Authentication (Week 2)
- [ ] User registration
- [ ] User login
- [ ] JWT token generation
- [ ] Auth middleware
- [ ] Role-based access control

### Phase 4: Cars API (Week 2-3)
- [ ] Get all cars with filters
- [ ] Get single car
- [ ] Get featured cars
- [ ] Get categories
- [ ] Create car (Admin)
- [ ] Update car (Admin)
- [ ] Delete car (Admin)
- [ ] Search functionality

### Phase 5: Bookings API (Week 3-4)
- [ ] Create booking
- [ ] Get all bookings
- [ ] Get single booking
- [ ] Update booking status
- [ ] Cancel booking
- [ ] Availability checking service
- [ ] Pricing calculation service

### Phase 6: Business Logic (Week 4)
- [ ] Date conflict checking
- [ ] Price calculation
- [ ] Booking ID generation
- [ ] Status transition validation
- [ ] Email notifications

### Phase 7: Admin Features (Week 5)
- [ ] Admin dashboard stats
- [ ] Booking management
- [ ] Car management
- [ ] User management (optional)

### Phase 8: Additional Features (Week 5-6)
- [ ] Recommendations API
- [ ] AI Chat integration (optional)
- [ ] Reviews system (optional)
- [ ] File upload for car images

### Phase 9: Testing (Week 6)
- [ ] Unit tests
- [ ] Integration tests
- [ ] API endpoint tests
- [ ] Error handling tests

### Phase 10: Deployment (Week 7)
- [ ] Production environment setup
- [ ] Database migration
- [ ] API documentation
- [ ] Monitoring and logging
- [ ] Security hardening

---

## Next Steps

1. Start with Phase 1 - Set up the basic project structure
2. Implement one feature at a time
3. Test each endpoint as you build it
4. Refer to frontend documentation for exact data formats
5. Keep API responses consistent with frontend expectations

This guide provides a complete roadmap. Follow it step-by-step, and you'll have a fully functional backend that integrates seamlessly with your frontend!
