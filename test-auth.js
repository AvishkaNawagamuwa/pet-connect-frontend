// Simple authentication test
const testAuth = async () => {
    try {
        // Test registration
        console.log('Testing registration...');
        const registerResponse = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const registerData = await registerResponse.json();
        console.log('Register response:', registerData);

        if (registerResponse.ok) {
            console.log('✅ Registration successful!');
            console.log('Token:', registerData.token);
        } else {
            console.log('❌ Registration failed:', registerData.message);
        }

        // Test login
        console.log('\nTesting login...');
        const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);

        if (loginResponse.ok) {
            console.log('✅ Login successful!');
            console.log('User ID:', loginData.user.id);
            console.log('User Name:', loginData.user.name);
            console.log('Token:', loginData.token);

            // Test protected route
            console.log('\nTesting protected route /api/auth/me...');
            const meResponse = await fetch('http://localhost:5001/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const meData = await meResponse.json();
            console.log('Me response:', meData);

            if (meResponse.ok) {
                console.log('✅ Protected route works!');
            } else {
                console.log('❌ Protected route failed:', meData.message);
            }
        } else {
            console.log('❌ Login failed:', loginData.message);
        }

    } catch (error) {
        console.error('Test error:', error.message);
    }
};

testAuth();