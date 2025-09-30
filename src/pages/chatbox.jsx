import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Heart, PawPrint } from "lucide-react";
import { getGPTResponse } from "../service/AImodel.js";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function ChatBox() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: 'Hello! I\'m your AI pet care assistant. 🐾 I can help you with questions about pet health, behavior, training, nutrition, and general care. What would you like to know about your furry friend?',
            timestamp: new Date()
        }
    ]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!userInput.trim()) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: userInput,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError("");
        setUserInput("");

        try {
            const reply = await getGPTResponse(userInput);
            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            setError(err.message || "Error getting response");
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickQuestions = [
        "My cat isn't eating, what should I do?",
        "How often should I walk my dog?",
        "What are signs of a healthy pet?",
        "My pet is acting differently, should I be concerned?"
    ];

    const handleQuickQuestion = (question) => {
        setUserInput(question);
    };

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gradient-to-br from-[#f5e6d3] to-[#d5a67e] pt-24 pb-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8 animate-fadeIn">
                        <div className="flex items-center justify-center mb-4">
                            <PawPrint className="text-[#8b4513] mr-3 animate-bounceIn" size={32} />
                            <h1 className="text-4xl font-bold text-[#4a372f] animate-slideInUp">🐾 Pet Care Assistant</h1>
                        </div>
                        <p className="text-[#8b4513] max-w-2xl mx-auto animate-fadeIn">
                            Get instant advice from our AI pet care expert. Ask about health, behavior, training,
                            nutrition, and more. Always consult a veterinarian for serious health concerns.
                        </p>
                    </div>

                    {/* Chat Container */}
                    <div className="bg-[#f5e6d3]/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-[#d5a67e] animate-slideInUp">
                        {/* Messages Area */}
                        <div className="h-96 overflow-y-auto p-6 bg-[#f5e6d3]/50">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                    <div className={`flex items-start max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md hover-lift ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-[#8b4513] to-[#7a3e12] text-white'
                                                : 'bg-gradient-to-r from-[#d5a67e] to-[#c19660] text-white'
                                                }`}>
                                                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                            </div>
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`px-4 py-3 rounded-2xl shadow-sm hover-lift transition-all duration-200 ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-[#8b4513] to-[#7a3e12] text-white'
                                            : 'bg-white text-[#4a372f] border border-[#d5a67e]'
                                            }`}>
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                            <p className={`text-xs mt-1 opacity-70`}>
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start mb-4 animate-fadeIn">
                                    <div className="flex items-start">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d5a67e] to-[#c19660] text-white flex items-center justify-center mr-3 shadow-md">
                                            <Bot size={20} />
                                        </div>
                                        <div className="bg-white border border-[#d5a67e] px-4 py-3 rounded-2xl shadow-sm">
                                            <div className="flex items-center">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-[#d5a67e] rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-[#d5a67e] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-[#d5a67e] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="ml-2 text-sm text-[#8b4513]">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {messages.length === 1 && (
                            <div className="px-6 py-4 bg-[#f5e6d3]/50 border-t border-[#d5a67e] animate-slideInUp">
                                <p className="text-sm font-medium text-[#4a372f] mb-3">🚀 Quick questions to get started:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {quickQuestions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickQuestion(question)}
                                            className="text-left p-3 bg-white border border-[#d5a67e] rounded-lg hover:bg-[#f5e6d3] hover:border-[#c19660] transition-all duration-200 text-sm text-[#4a372f] hover-lift animate-fadeIn"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-[#d5a67e]">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fadeIn">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-end space-x-4">
                                <div className="flex-1">
                                    <textarea
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask about your pet's health, behavior, training, or care... 🐾"
                                        className="w-full px-4 py-3 border border-[#d5a67e] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c19660] focus:border-[#c19660] resize-none text-[#4a372f] form-input"
                                        rows={3}
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !userInput.trim()}
                                    className="bg-gradient-to-r from-[#d5a67e] to-[#c19660] hover:from-[#c19660] hover:to-[#8b4513] disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 disabled:cursor-not-allowed btn-modern shadow-md"
                                >
                                    <Send size={20} />
                                    <span>Send</span>
                                </button>
                            </div>

                            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-[#8b4513]">
                                <Heart size={12} className="text-red-500" />
                                <span>Always consult a veterinarian for serious health concerns</span>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center border border-[#d5a67e] card-modern hover-lift animate-slideInLeft">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#d5a67e] to-[#c19660] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="text-white" size={24} />
                            </div>
                            <h3 className="font-semibold text-[#4a372f] mb-2">Health Advice</h3>
                            <p className="text-[#8b4513] text-sm">Get guidance on symptoms, preventive care, and when to see a vet</p>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center border border-[#d5a67e] card-modern hover-lift animate-slideInUp" style={{ animationDelay: '0.1s' }}>
                            <div className="w-12 h-12 bg-gradient-to-r from-[#8b4513] to-[#7a3e12] rounded-full flex items-center justify-center mx-auto mb-4">
                                <PawPrint className="text-white" size={24} />
                            </div>
                            <h3 className="font-semibold text-[#4a372f] mb-2">Behavior Tips</h3>
                            <p className="text-[#8b4513] text-sm">Understand your pet's behavior and learn training techniques</p>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center border border-[#d5a67e] card-modern hover-lift animate-slideInRight" style={{ animationDelay: '0.2s' }}>
                            <div className="w-12 h-12 bg-gradient-to-r from-[#c19660] to-[#d5a67e] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot className="text-white" size={24} />
                            </div>
                            <h3 className="font-semibold text-[#4a372f] mb-2">24/7 Support</h3>
                            <p className="text-[#8b4513] text-sm">Get instant answers to your pet care questions anytime</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}