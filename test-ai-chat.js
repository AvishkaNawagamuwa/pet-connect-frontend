// Test the new AI chat system
const testAIChat = async () => {
    const testMessages = [
        "My cat isn't eating well",
        "My dog is vomiting",
        "How do I train my puppy?",
        "My pet has diarrhea",
        "My dog is scratching a lot",
        "What should I feed my senior cat?",
        "My pet is having trouble breathing", // Emergency
        "How much exercise does my dog need?",
        "My kitten won't use the litter box"
    ];

    console.log('🤖 Testing New AI Chat System\n');

    for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        console.log(`\n📝 Test ${i + 1}: "${message}"`);
        console.log('─'.repeat(50));

        try {
            const response = await fetch('http://localhost:5001/api/chat/demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Response:', data.response);
                console.log('🔧 Powered by:', data.powered_by);
            } else {
                console.log('❌ Error:', data.message);
            }
        } catch (error) {
            console.log('❌ Network error:', error.message);
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 AI Chat Test Complete!');
};

testAIChat();