// Enhanced AI service for pet-specific advice
export async function getGPTResponse(message, chatHistory = []) {
    // Add pet-specific context to the message
    const petContext = {
        message: message,
        context: "pet_care_advice",
        chatHistory: chatHistory.slice(-10), // Keep last 10 messages for context
        systemPrompt: `You are a helpful pet care expert AI assistant. Provide accurate, concise advice on pet health, behavior, training, nutrition, and general welfare. 
        
        Guidelines:
        - Always recommend consulting a veterinarian for serious health issues
        - Keep responses friendly, informative, and under 200 words
        - Focus on practical, actionable advice
        - Include safety warnings when appropriate
        - Ask clarifying questions when needed (pet type, age, breed, etc.)
        - Cover topics like: health symptoms, nutrition, training, behavior, grooming, exercise
        
        If the question is not pet-related, politely redirect to pet care topics.`
    };

    try {
        const response = await fetch("http://localhost:5001/api/chat/demo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err || "Failed to get pet care advice");
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        // Fallback response for when the backend is not available
        if (error.message.includes('fetch')) {
            throw new Error("Unable to connect to pet care service. Please check your connection and try again.");
        }
        throw error;
    }
}

// Utility function for pet-specific quick responses (can be used for offline mode)
export function getQuickPetAdvice(topic) {
    const quickAdvice = {
        'not_eating': "If your pet isn't eating, try: 1) Check for dental issues, 2) Ensure fresh water, 3) Try different food, 4) Reduce stress, 5) Consult vet if it persists >24 hours.",
        'behavior_change': "Sudden behavior changes can indicate: 1) Health issues, 2) Stress/anxiety, 3) Environmental changes. Monitor closely and consult your vet if concerning symptoms persist.",
        'exercise': "Exercise needs vary by species, breed, and age. Dogs typically need 30min-2hrs daily, cats need interactive play. Always adjust for your pet's specific needs and health status.",
        'healthy_signs': "Signs of a healthy pet: 1) Good appetite, 2) Normal energy levels, 3) Clean eyes/ears, 4) Regular bathroom habits, 5) Social behavior, 6) Healthy coat/skin."
    };

    return quickAdvice[topic] || "Please ask a specific question about your pet's health, behavior, or care for personalized advice.";
}