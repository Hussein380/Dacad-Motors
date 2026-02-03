async function verifyAdminUpdate() {
    const BASE_URL = 'http://127.0.0.1:5000/api';
    const loginData = {
        email: 'huznigarane7@gmail.com',
        password: 'hzg@746789'
    };

    console.log('--- Verifying Admin Car Update (Correct Format) ---');

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

        // 2. Find a "safari" car
        const carsRes = await fetch(`${BASE_URL}/cars`);
        const carsResult = await carsRes.json();
        const safariCar = carsResult.data.cars.find(c => c.category === 'safari');

        if (!safariCar) throw new Error('No safari car found.');

        console.log(`Found car: ${safariCar.name} (${safariCar._id})`);

        // 3. Update using FormData (simulate browser behavior)
        console.log('\nTesting Update: Toggling availability and changing seats...');
        const formData = new FormData();
        formData.append('available', (!safariCar.available).toString());
        formData.append('seats', '8');
        formData.append('brand', safariCar.brand);
        formData.append('model', safariCar.model);
        formData.append('year', safariCar.year.toString());
        formData.append('category', safariCar.category);
        formData.append('pricePerDay', safariCar.pricePerDay.toString());
        formData.append('location', safariCar.location);
        formData.append('description', safariCar.description);

        const updateRes = await fetch(`${BASE_URL}/cars/${safariCar._id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const updateResult = await updateRes.json();

        if (updateResult.success) {
            console.log('✅ Update SUCCESSFUL!');
            console.log('New Availability:', updateResult.data.available);
            console.log('New Seats:', updateResult.data.seats);

            if (updateResult.data.available !== safariCar.available && updateResult.data.seats === 8) {
                console.log('✨ Verification PASSED: Backend correctly updated the "safari" car.');
            } else {
                console.log('⚠️ Verification FAILED: Values did not change as expected.');
            }
        } else {
            console.log('❌ Update FAILED:', updateResult.error);
        }

        console.log('\n--- Verification Complete ---');
    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

verifyAdminUpdate();
