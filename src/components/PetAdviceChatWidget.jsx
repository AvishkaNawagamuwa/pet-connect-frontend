import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageCircle, Minimize2 } from 'lucide-react';
import { getGPTResponse } from '../service/AImodel.js';

const PetAdviceChatWidget = ({ isOpen, onToggle }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: 'Hi! I\'m your AI pet care assistant 🐾 How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
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
        setUserInput('');

        try {
            const chatHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const reply = await getGPTResponse(userInput, chatHistory);
            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: "I'm sorry, I'm having trouble right now. Please try again in a moment or consult your veterinarian for urgent concerns.",
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

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="fixed bottom-6 right-6 bg-[#d5a67e] hover:bg-[#c19660] text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 animate-pulse"
                aria-label="Open pet care assistant"
            >
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-[#f5e6d3] rounded-lg shadow-2xl border border-[#d5a67e] flex flex-col z-50 animate-slideInUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#d5a67e] to-[#c19660] text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Bot size={20} className="text-white" />
                    <span className="font-medium">🐾 Pet Care Assistant</span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onToggle}
                        className="hover:bg-[#8b4513] p-1 rounded transition-colors duration-200"
                        aria-label="Minimize chat"
                    >
                        <Minimize2 size={16} />
                    </button>
                    <button
                        onClick={onToggle}
                        className="hover:bg-[#8b4513] p-1 rounded transition-colors duration-200"
                        aria-label="Close chat"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 bg-[#f5e6d3]/50 backdrop-blur-sm">
                {messages.map((message) => (
                    <div key={message.id} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'} animate-fadeIn`}>
                        <div className={`inline-block max-w-xs px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 ${message.role === 'user'
                            ? 'bg-gradient-to-r from-[#8b4513] to-[#7a3e12] text-white rounded-br-none shadow-md'
                            : 'bg-white text-[#4a372f] border border-[#d5a67e] rounded-bl-none shadow-sm'
                            }`}>
                            {message.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-left mb-3 animate-fadeIn">
                        <div className="inline-block bg-white border border-[#d5a67e] px-3 py-2 rounded-lg rounded-bl-none shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-[#d5a67e] rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-[#d5a67e] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-[#d5a67e] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#d5a67e] bg-white rounded-b-lg">
                <div className="flex space-x-2">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about pet care... 🐾"
                        className="flex-1 px-3 py-2 border border-[#d5a67e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19660] focus:border-[#c19660] resize-none text-sm text-[#4a372f] placeholder-[#8b4513]/60 transition-all duration-200"
                        rows={2}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !userInput.trim()}
                        className="bg-gradient-to-r from-[#d5a67e] to-[#c19660] hover:from-[#c19660] hover:to-[#8b4513] disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PetAdviceChatWidget;