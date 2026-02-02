const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { NAIROBI_LOCATIONS } = require('../config/locations.config');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Get personalized car recommendations
 * - For logged-in users: based on preferences + booking history
 * - For guests: diverse mix across categories
 * 
 * @param {Object} options
 * @param {Object} options.user - User document (optional, for personalization)
 * @param {Number} options.limit - Max recommendations to return (default 4)
 */
exports.getRecommendations = async ({ user = null, limit = 4 } = {}) => {
    if (user) {
        return await getPersonalizedRecommendations(user, limit);
    }
    return await getDiverseRecommendations(limit);
};

/**
 * Get personalized recommendations for logged-in users
 * Scoring: favorites (+5), preferred categories (+3), booked categories (+2), base rating
 */
async function getPersonalizedRecommendations(user, limit) {
    // 1. Get user's booking history to find category patterns
    const userBookings = await Booking.find({ 
        user: user._id, 
        status: { $in: ['completed', 'confirmed', 'active'] }
    }).populate('car', 'category');
    
    const bookedCategories = [...new Set(
        userBookings
            .filter(b => b.car?.category)
            .map(b => b.car.category)
    )];
    
    // 2. Get user's preferred categories and favorites
    const preferredCategories = user.preferredCategorySlugs || [];
    const favoriteIds = user.favorites || [];
    
    // 3. Combine all preferred categories (explicit + from bookings)
    const allPreferredCategories = [...new Set([...preferredCategories, ...bookedCategories])];
    
    // 4. Get available cars
    const availableCars = await Car.find({ available: true }).lean();
    
    // 5. Score each car
    const scoredCars = availableCars.map(car => {
        let score = car.rating || 0; // Base score is the car's rating
        let reason = 'Top rated';
        
        // +5 if car is in user's favorites
        if (favoriteIds.some(fav => fav.toString() === car._id.toString())) {
            score += 5;
            reason = 'From your favorites';
        }
        // +3 if car is in user's explicitly preferred categories
        else if (preferredCategories.includes(car.category)) {
            score += 3;
            reason = 'Matches your preferences';
        }
        // +2 if car is in a category user has booked before
        else if (bookedCategories.includes(car.category)) {
            score += 2;
            reason = 'Based on your bookings';
        }
        
        return { ...car, score, reason };
    });
    
    // 6. Sort by score (desc), then by rating (desc)
    scoredCars.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.rating || 0) - (a.rating || 0);
    });
    
    // 7. Return top recommendations with reason tags
    return scoredCars.slice(0, limit).map(car => ({
        ...car,
        reason: car.reason,
        tags: getRecommendationTags(car, preferredCategories, bookedCategories)
    }));
}

/**
 * Get diverse recommendations for guests (not logged in)
 * Returns one top-rated car from each category for variety
 */
async function getDiverseRecommendations(limit) {
    // 1. Get all distinct categories
    const categories = await Car.distinct('category', { available: true });
    
    // 2. Get top-rated car from each category
    const carPromises = categories.map(category => 
        Car.findOne({ category, available: true })
            .sort('-rating')
            .lean()
    );
    
    const carsFromCategories = await Promise.all(carPromises);
    
    // 3. Filter out nulls and add reason
    let diverseCars = carsFromCategories
        .filter(car => car !== null)
        .map(car => ({
            ...car,
            reason: `Popular in ${car.category.charAt(0).toUpperCase() + car.category.slice(1)}`,
            tags: ['diverse', car.category]
        }));
    
    // 4. Shuffle for variety (so guests don't see same order every time)
    diverseCars = shuffleArray(diverseCars);
    
    // 5. If we need more cars to fill limit, add more top-rated
    if (diverseCars.length < limit) {
        const existingIds = diverseCars.map(c => c._id);
        const additionalCars = await Car.find({ 
            available: true,
            _id: { $nin: existingIds }
        })
            .sort('-rating')
            .limit(limit - diverseCars.length)
            .lean();
        
        diverseCars = [...diverseCars, ...additionalCars.map(car => ({
            ...car,
            reason: 'Highly rated',
            tags: ['top-rated']
        }))];
    }
    
    return diverseCars.slice(0, limit);
}

/**
 * Generate tags for a recommendation
 */
function getRecommendationTags(car, preferredCategories, bookedCategories) {
    const tags = [];
    if (car.rating >= 4.5) tags.push('top-rated');
    if (preferredCategories.includes(car.category)) tags.push('preferred');
    if (bookedCategories.includes(car.category)) tags.push('booked-before');
    if (car.isFeatured) tags.push('featured');
    tags.push(car.category);
    return tags;
}

/**
 * Fisher-Yates shuffle for array randomization
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Internal helper to fetch current fleet context for the AI
 */
const getFleetContext = async () => {
    try {
        const [categories, priceStats, sampleCars] = await Promise.all([
            Car.distinct('category'),
            Car.aggregate([
                { $match: { available: true } },
                { $group: { _id: null, minPrice: { $min: '$pricePerDay' }, maxPrice: { $max: '$pricePerDay' } } }
            ]),
            Car.find({ available: true }).select('name brand model category pricePerDay year').limit(10)
        ]);

        const locationNames = NAIROBI_LOCATIONS.join(', ');
        const minPrice = priceStats[0] ? priceStats[0].minPrice : 45;

        const carSummary = sampleCars.map(c => `${c.brand} ${c.model} (${c.category}, $${c.pricePerDay}/day)`).join(', ');

        return {
            categories: categories.join(', '),
            locations: locationNames,
            priceRange: `$${minPrice} - $${priceStats[0]?.maxPrice || 'any'}`,
            availableCars: carSummary
        };
    } catch (error) {
        console.error('Error fetching fleet context:', error);
        return null;
    }
};

/**
 * Get AI Chat response using Gemini with hierarchical fallback and DYNAMIC context
 */
exports.getAIChatResponse = async (userMessage) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    // 1. Fetch Real Data from DB to inform the AI
    const context = await getFleetContext();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const models = ['models/gemini-2.0-flash', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemma-3-1b-it'];

    const systemInstruction = `
    You are the DriveEase AI Assistant, a helpful car rental expert. 
    IMPORTANT: You must only provide information that is ACCURATE based on our current database.
    
    Current Real-Time Fleet Data:
    - Available Categories: ${context?.categories || 'Sedan, SUV, Luxury'}
    - Available Locations: ${context?.locations || 'Downtown, Airport'}
    - Price Range: Starting from ${context?.priceRange || '$45/day'}
    - Some specific cars we currently have: ${context?.availableCars || 'Reliable local fleet'}
    
    Guidelines:
    - If a user asks for a car type or specific model we DON'T have in the list above, politely inform them we don't have it currently but suggest the closest alternative from our "Available Categories".
    - Be professional, friendly, and helpful.
    - Always encourage them to use our "Fleet" search for the most up-to-date availability.
    - If you are unsure about a specific detail not in the context, guide the user to contact support or check the booking form.
  `;

    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 Attempting DYNAMIC AI response with ${modelName}...`);

            const isGemma = modelName.includes('gemma');
            const modelOptions = { model: modelName };

            // Gemma doesn't support systemInstruction in the current SDK/API version
            // So we prepend it to the message for Gemma, and use the feature for Gemini
            if (!isGemma) {
                modelOptions.systemInstruction = systemInstruction;
            }

            const model = genAI.getGenerativeModel(modelOptions);

            const prompt = isGemma
                ? `Instructions: ${systemInstruction}\n\nUser Question: ${userMessage}`
                : userMessage;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ Success with ${modelName}`);
                return text;
            }
        } catch (error) {
            console.warn(`⚠️ ${modelName} failed or unavailable: ${error.message}`);
            lastError = error;
        }
    }

    console.error('❌ All Gemini models failed.');
    throw new Error(`The AI assistant is temporarily unavailable: ${lastError ? lastError.message : 'Unknown error'}`);
};
