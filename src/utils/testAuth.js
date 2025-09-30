// Test authentication endpoints
import authService from '../services/authService.js';

// Test data
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpass123',
    role: 'owner'
};

const testLogin = {
    email: 'test@example.com',
    password: 'testpass123'
};

// Test functions
const testAuth = async () => {
    console.log('🧪 Testing Authentication Logic...\n');

    try {
        // Test 1: Register
        console.log('1️⃣ Testing Registration...');
        const registerResult = await authService.register(testUser);
        console.log('Register Result:', registerResult);

        if (registerResult.success) {
            console.log('✅ Registration successful');

            // Test 2: Get Profile
            console.log('\n2️⃣ Testing Get Profile...');
            const profileResult = await authService.getProfile();
            console.log('Profile Result:', profileResult);

            // Test 3: Logout
            console.log('\n3️⃣ Testing Logout...');
            await authService.logout();
            console.log('✅ Logout successful');

            // Test 4: Login
            console.log('\n4️⃣ Testing Login...');
            const loginResult = await authService.login(testLogin);
            console.log('Login Result:', loginResult);

            if (loginResult.success) {
                console.log('✅ Login successful');

                // Test 5: Authentication Status
                console.log('\n5️⃣ Testing Authentication Status...');
                console.log('Is Authenticated:', authService.isAuthenticated());
                console.log('Current User:', authService.getCurrentUser());

                // Test 6: Forgot Password
                console.log('\n6️⃣ Testing Forgot Password...');
                const forgotResult = await authService.forgotPassword(testLogin.email);
                console.log('Forgot Password Result:', forgotResult);
            }
        }

    } catch (error) {
        console.error('❌ Test Error:', error);
    }

    console.log('\n🏁 Authentication tests completed!');
};

// Export for use in browser console or components
window.testAuth = testAuth;
window.authService = authService;

export { testAuth };