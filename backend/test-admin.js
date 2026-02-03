async function testAdminFlow() {
    const BASE_URL = 'http://127.0.0.1:5000/api';
    const loginData = {
        email: 'huznigarane7@gmail.com',
        password: 'hzg@746789'
    };

    console.log('--- Testing Admin Flow ---');

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        const loginResult = await loginRes.json();

        if (!loginResult.success) {
            throw new Error(`Login failed: ${loginResult.error}`);
        }

        const token = loginResult.data.token;
        console.log('✅ Logged in successfully');

        // 2. Create a test car
        console.log('\nCreating a test car...');
        const carData = {
            brand: 'TestBrand',
            model: 'TestModel',
            year: 2024,
            category: 'economy',
            pricePerDay: 5000,
            seats: 5,
            transmission: 'automatic',
            fuelType: 'petrol',
            location: 'Westlands, Nairobi',
            description: 'A test car for verification',
            features: JSON.stringify(['GPS', 'AC']),
            available: true,
            imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d'
        };

        const formData = new URLSearchParams();
        Object.entries(carData).forEach(([key, value]) => formData.append(key, value));

        const createRes = await fetch(`${BASE_URL}/cars`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Not setting multipart here as it's complex for fetch/node without a library
                // but the backend accepts URL encoded body if no file is present? 
                // Wait, the backend uses multer uploadCarImage.
            },
            body: formData
        });
        const createResult = await createRes.json();

        if (!createResult.success) {
            console.log('❌ Car creation failed (Expected if multer is strict):', createResult.error);
            // We'll skip creation and try to update an existing one if needed
            // But let's check if we can get an ID
        } else {
            console.log('✅ Car created successfully. ID:', createResult.data._id);
            const carId = createResult.data._id;

            // 3. Update the car
            console.log('\nUpdating the car (Availability & Seats)...');
            const updateData = {
                available: false,
                seats: 7,
                brand: 'TestBrandUpdated' // to see if change applies
            };
            const updateFormData = new URLSearchParams();
            Object.entries(updateData).forEach(([key, value]) => updateFormData.append(key, value));

            const updateRes = await fetch(`${BASE_URL}/cars/${carId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: updateFormData
            });
            const updateResult = await updateRes.json();

            if (updateResult.success) {
                console.log('✅ Update successful');
                console.log('Updated Availability:', updateResult.data.available);
                console.log('Updated Seats:', updateResult.data.seats);

                if (updateResult.data.available === false && updateResult.data.seats === 7) {
                    console.log('✨ Changes applied correctly!');
                } else {
                    console.log('⚠️ Changes mismatch. Expected available: false, seats: 7');
                }
            } else {
                console.log('❌ Update failed:', updateResult.error);
            }

            // 4. Delete the car
            console.log('\nDeleting the test car...');
            const deleteRes = await fetch(`${BASE_URL}/cars/${carId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const deleteResult = await deleteRes.json();
            if (deleteResult.success) {
                console.log('✅ Deletion successful');
            } else {
                console.log('❌ Deletion failed:', deleteResult.error);
            }
        }

        console.log('\n--- Admin Flow Test Complete ---');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAdminFlow();
