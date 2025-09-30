const express = require('express');
const { body, query, validationResult } = require('express-validator');
const {
    handleChat,
    getChatHistory,
    getChatSession,
    clearChatSession,
    rateChatResponse
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Intelligent response generator for fallback
const generateIntelligentResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    // Emergency keywords
    const emergencyWords = ['emergency', 'urgent', 'dying', 'blood', 'bleeding', 'seizure', 'choking', 'poisoned', 'toxic', 'unconscious', 'severe pain', 'hit by car', 'attacked', 'broken bone', 'bloated', 'pale gums', 'not breathing', 'collapsed'];

    if (emergencyWords.some(word => lowerMessage.includes(word))) {
        return "🚨 This sounds like a medical emergency! Please contact your veterinarian immediately or visit the nearest emergency animal hospital. Time is critical in emergency situations. Don't wait - get professional help right now!";
    }

    // Health-related responses
    if (lowerMessage.includes('not eating') || lowerMessage.includes('loss of appetite') || lowerMessage.includes('refusing food')) {
        return "Loss of appetite in pets can be concerning. Common causes include stress, dental issues, illness, or changes in environment. Try offering their favorite treats or warming their food slightly. If they haven't eaten for more than 24 hours (12 hours for puppies/kittens), please consult your veterinarian.";
    }

    if (lowerMessage.includes('vomiting') || lowerMessage.includes('throwing up')) {
        return "Vomiting can be caused by eating too quickly, dietary indiscretion, or underlying health issues. Withhold food for 12-24 hours (but not water), then offer small amounts of bland food. If vomiting continues, contains blood, or your pet seems lethargic, contact your vet immediately.";
    }

    if (lowerMessage.includes('diarrhea') || lowerMessage.includes('loose stool')) {
        return "Diarrhea in pets can result from dietary changes, stress, or infections. Ensure they stay hydrated and consider a bland diet (boiled chicken and rice for dogs). If diarrhea persists beyond 24-48 hours, contains blood, or your pet shows other symptoms, please see your veterinarian.";
    }

    if (lowerMessage.includes('scratching') || lowerMessage.includes('itchy') || lowerMessage.includes('itching')) {
        return "Excessive scratching can indicate allergies, fleas, dry skin, or skin infections. Check for fleas or unusual redness. Regular grooming and flea prevention help. If scratching is persistent or causing wounds, your vet can determine the cause and recommend appropriate treatment.";
    }

    if (lowerMessage.includes('aggressive') || lowerMessage.includes('biting') || lowerMessage.includes('attacking')) {
        return "Aggressive behavior can stem from fear, pain, territorial instincts, or lack of socialization. Never punish aggressive behavior as it may worsen the situation. Consult a professional animal behaviorist or veterinarian to identify triggers and develop a safe training plan.";
    }

    if (lowerMessage.includes('training') || lowerMessage.includes('obedience') || lowerMessage.includes('commands')) {
        return "Positive reinforcement training works best for most pets! Use treats, praise, and consistency. Start with basic commands like 'sit' and 'stay'. Keep training sessions short (5-10 minutes) and practice daily. Patience and consistency are key to success!";
    }

    if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('feeding')) {
        return "A balanced diet is crucial for your pet's health! Choose age-appropriate, high-quality pet food. Avoid human foods that are toxic to pets (chocolate, grapes, onions, etc.). Feed consistent portions at regular times. Consult your vet about the best diet for your pet's specific needs.";
    }

    if (lowerMessage.includes('exercise') || lowerMessage.includes('walk') || lowerMessage.includes('activity')) {
        return "Regular exercise is essential for your pet's physical and mental health! Dogs typically need 30 minutes to 2 hours daily depending on breed and age. Cats benefit from interactive play sessions. Adjust exercise intensity based on your pet's age, health, and energy level.";
    }

    if (lowerMessage.includes('kitten') || lowerMessage.includes('puppy') || lowerMessage.includes('baby')) {
        return "Young pets require special care! They need frequent feeding, socialization, and veterinary check-ups. Ensure they're up-to-date on vaccinations and deworming. Create a safe, warm environment and start gentle training early. Regular vet visits are crucial during their first year.";
    }

    if (lowerMessage.includes('senior') || lowerMessage.includes('old') || lowerMessage.includes('elderly')) {
        return "Senior pets need extra attention and care. They may require more frequent vet check-ups, joint supplements, softer bedding, and adjusted exercise routines. Watch for signs of cognitive decline, arthritis, or other age-related conditions. Many senior pets thrive with proper care and love!";
    }

    // General responses
    const generalResponses = [
        "Thank you for caring about your pet's wellbeing! For specific concerns, I always recommend consulting with your veterinarian who can provide personalized advice based on your pet's unique needs and medical history.",
        "That's a thoughtful question about pet care! Every pet is unique, so what works for one might not work for another. Your veterinarian is the best resource for advice tailored to your specific situation.",
        "I appreciate you reaching out about your pet! While I can offer general guidance, your veterinarian knows your pet's health history and can provide the most accurate advice for your specific situation.",
        "Pet health and behavior can be complex topics. For the most reliable advice, I recommend discussing your concerns with a qualified veterinarian who can examine your pet and consider their individual needs."
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

// Validation rules
const chatValidation = [
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    body('sessionId')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Session ID must be between 1 and 100 characters')
];

const historyValidation = [
    query('sessionId')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Session ID must be between 1 and 100 characters'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

const ratingValidation = [
    body('sessionId')
        .notEmpty()
        .withMessage('Session ID is required'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5')
];

// Demo chat endpoint (no authentication required)
router.post('/demo', chatLimiter, [
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { message } = req.body;

        // Get dynamic response from OpenAI
        let aiResponse;

        try {
            // Check if OpenAI API key is available
            if (process.env.OPENAI_API_KEY) {
                const OpenAI = require('openai');
                const openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY,
                });

                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are Dr. PawCare, an expert AI veterinary assistant specializing in pet health, behavior, and welfare. You provide helpful, accurate, and compassionate advice to pet owners.

GUIDELINES:
- Provide practical, actionable advice for pet owners
- Always recommend consulting a veterinarian for serious health issues
- Keep responses concise (under 200 words) but informative
- Ask clarifying questions when needed (pet type, age, symptoms, duration)
- Cover topics: health symptoms, nutrition, training, behavior, grooming, exercise
- Include safety warnings for potentially dangerous situations
- Be empathetic and supportive to worried pet owners

EMERGENCY INDICATORS - Always recommend immediate vet care for:
- Difficulty breathing, choking, or severe injuries
- Seizures, loss of consciousness, or severe lethargy
- Ingestion of toxic substances
- Severe vomiting/diarrhea with blood
- Signs of severe pain or distress

If the question is not pet-related, politely redirect to pet care topics.`
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.7,
                });

                aiResponse = completion.choices[0].message.content;
            } else {
                // Intelligent fallback responses based on message content
                aiResponse = generateIntelligentResponse(message);
            }
        } catch (openaiError) {
            console.log('OpenAI API error, using fallback response:', openaiError.message);
            // Fallback response if OpenAI fails
            aiResponse = "I understand your concern about your pet. While I'd love to give you specific advice, I recommend consulting with your veterinarian for the best guidance tailored to your pet's needs. They can provide proper diagnosis and treatment recommendations.";
        }

        res.json({
            success: true,
            message: 'Response generated successfully',
            response: aiResponse,
            timestamp: new Date().toISOString(),
            sessionId: `demo-${Date.now()}`,
            powered_by: process.env.OPENAI_API_KEY ? 'OpenAI GPT-3.5' : 'Fallback Responses'
        });

    } catch (error) {
        console.error('Demo chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// All other chat routes require authentication
router.use(protect);

// Chat routes
router.post('/', chatLimiter, chatValidation, handleChat);
router.get('/history', historyValidation, getChatHistory);
router.get('/session/:sessionId', getChatSession);
router.delete('/session/:sessionId', clearChatSession);
router.post('/rate', ratingValidation, rateChatResponse);

module.exports = router;