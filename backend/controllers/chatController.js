const Chat = require('../models/Chat');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
    const OpenAI = require('openai');
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

// Emergency keywords detection
const emergencyKeywords = [
    'emergency', 'urgent', 'dying', 'blood', 'bleeding', 'seizure', 'choking',
    'poisoned', 'toxic', 'can\'t breathe', 'unconscious', 'severe pain',
    'hit by car', 'attacked', 'broken bone', 'bloated', 'pale gums',
    'not breathing', 'collapsed', 'vomiting blood', 'can\'t walk'
];

// System prompt for pet care AI
const SYSTEM_PROMPT = `You are Dr. PawCare, an expert AI veterinary assistant specializing in pet health, behavior, and welfare. You provide helpful, accurate, and compassionate advice to pet owners.

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
- Bloated abdomen (especially in dogs)
- Pale or blue gums
- Severe trauma or accidents

RESPONSE FORMAT:
- Start with acknowledgment of concern
- Provide practical advice or information
- Include when to seek professional help
- End with supportive encouragement

If the question is not pet-related, politely redirect to pet care topics.`;

// @desc    Handle AI chat
// @route   POST /api/chat
// @access  Private
const handleChat = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { message, sessionId } = req.body;
        const userId = req.user.id;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Check for emergency keywords
        const isEmergency = emergencyKeywords.some(keyword =>
            message.toLowerCase().includes(keyword)
        );

        if (isEmergency) {
            const emergencyResponse = {
                content: "🚨 This sounds like a potential emergency! Please contact your nearest veterinary clinic or emergency animal hospital immediately. If it's after hours, search for '24-hour emergency vet near me' or call an emergency vet hotline. Your pet's safety is the top priority. Don't wait - seek professional help right away!",
                isEmergency: true
            };

            // Save emergency interaction
            await saveChatMessage(userId, sessionId, message, emergencyResponse.content, true);

            return res.json({
                success: true,
                reply: emergencyResponse.content,
                isEmergency: true,
                sessionId: sessionId || new Date().getTime().toString()
            });
        }

        // For demo purposes, provide a helpful response without OpenAI
        // In production, you would integrate with OpenAI here
        const aiResponse = generateDemoResponse(message);

        // Get or create chat session
        let chat = await Chat.findOne({
            userId,
            sessionId: sessionId || { $exists: false },
            isActive: true
        });

        if (!chat && sessionId) {
            chat = await Chat.findOne({ userId, sessionId });
        }

        if (!chat) {
            chat = new Chat({
                userId,
                sessionId: sessionId || new Date().getTime().toString(),
                messages: []
            });
        }

        // Save messages to chat
        chat.messages.push(
            { role: 'user', content: message, timestamp: new Date() },
            {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
                tokens: 50 // demo value
            }
        );

        // Update metadata
        chat.metadata.totalTokens += 50;
        chat.lastActivity = new Date();

        await chat.save();

        res.json({
            success: true,
            reply: aiResponse,
            sessionId: chat.sessionId,
            tokens: 50
        });

    } catch (error) {
        console.error('Chat error:', error);

        // Provide fallback response
        const fallbackMessage = "I'm sorry, I'm having trouble responding right now. Please try again in a moment or consult your veterinarian for urgent concerns.";

        res.status(500).json({
            success: false,
            message: fallbackMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Demo response generator (replace with OpenAI in production)
const generateDemoResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('dog') || lowerMessage.includes('puppy')) {
        return "I understand you're asking about your dog! Dogs are wonderful companions. For any health concerns, please observe your dog's behavior, appetite, and energy levels. If you notice any changes in eating, drinking, or bathroom habits, it's worth consulting your veterinarian. What specific aspect of your dog's care would you like to discuss?";
    }

    if (lowerMessage.includes('cat') || lowerMessage.includes('kitten')) {
        return "Cats are amazing pets! They're generally good at hiding illness, so it's important to watch for subtle changes in behavior. Regular vet checkups, proper nutrition, and mental stimulation are key to keeping your cat healthy. Is there something specific about your cat's health or behavior you'd like help with?";
    }

    if (lowerMessage.includes('food') || lowerMessage.includes('eating') || lowerMessage.includes('nutrition')) {
        return "Proper nutrition is crucial for pet health! The best diet depends on your pet's age, size, activity level, and any health conditions. Always transition to new foods gradually over 7-10 days to avoid digestive upset. For specific dietary recommendations, consult your veterinarian who knows your pet's individual needs.";
    }

    if (lowerMessage.includes('training') || lowerMessage.includes('behavior')) {
        return "Training and behavior are important for a happy pet-owner relationship! Positive reinforcement works best - reward good behavior with treats, praise, or play. Consistency is key, and all family members should use the same commands. For persistent behavioral issues, consider consulting a professional trainer or animal behaviorist.";
    }

    return "Thank you for your question! As Dr. PawCare, I'm here to help with pet health, nutrition, training, and general care advice. Could you provide more details about your pet and the specific concern you have? This helps me give you the most relevant and helpful guidance. Remember, for any urgent health issues, please contact your veterinarian immediately.";
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId, limit = 50 } = req.query;

        const query = { userId, isActive: true };
        if (sessionId) query.sessionId = sessionId;

        const chats = await Chat.find(query)
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit))
            .select('sessionId messages metadata createdAt updatedAt');

        res.json({
            success: true,
            count: chats.length,
            chats
        });

    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching chat history'
        });
    }
};

// @desc    Get specific chat session
// @route   GET /api/chat/session/:sessionId
// @access  Private
const getChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const chat = await Chat.findOne({ userId, sessionId, isActive: true });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        res.json({
            success: true,
            chat
        });

    } catch (error) {
        console.error('Get chat session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching chat session'
        });
    }
};

// @desc    Clear chat session
// @route   DELETE /api/chat/session/:sessionId
// @access  Private
const clearChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const result = await Chat.findOneAndUpdate(
            { userId, sessionId },
            { isActive: false },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        res.json({
            success: true,
            message: 'Chat session cleared successfully'
        });

    } catch (error) {
        console.error('Clear chat session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error clearing chat session'
        });
    }
};

// @desc    Rate chat response
// @route   POST /api/chat/rate
// @access  Private
const rateChatResponse = async (req, res) => {
    try {
        const { sessionId, rating } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const chat = await Chat.findOne({ userId, sessionId, isActive: true });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        chat.metadata.userSatisfaction = rating;
        await chat.save();

        res.json({
            success: true,
            message: 'Thank you for your feedback!'
        });

    } catch (error) {
        console.error('Rate chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error saving rating'
        });
    }
};

// Helper function to save chat interactions
const saveChatMessage = async (userId, sessionId, userMessage, aiResponse, isEmergency = false) => {
    try {
        let chat = await Chat.findOne({ userId, sessionId, isActive: true });

        if (!chat) {
            chat = new Chat({
                userId,
                sessionId: sessionId || new Date().getTime().toString(),
                messages: []
            });
        }

        chat.messages.push(
            { role: 'user', content: userMessage, timestamp: new Date() },
            {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
                metadata: { isEmergency }
            }
        );

        if (isEmergency) {
            chat.emergencyFlags += 1;
        }

        await chat.save();
        return chat;

    } catch (error) {
        console.error('Save chat message error:', error);
    }
};

module.exports = {
    handleChat,
    getChatHistory,
    getChatSession,
    clearChatSession,
    rateChatResponse
};