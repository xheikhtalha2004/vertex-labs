'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Quick reply suggestions
const QUICK_REPLIES = [
    { label: '🔧 Services Overview', message: 'What services do you offer?' },
    { label: '💰 Pricing & Timeline', message: 'How much does it cost and how long does it take?' },
    { label: '📊 Portfolio Examples', message: 'Can you show me some example projects?' },
    { label: '🚀 Get Started', message: 'How do I get started with a project?' },
];

const AIConsultant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: "👋 Hi! I'm the Vertex Engineering Architect. I can help you understand our CAD, CFD, FEA, and prototyping services. What brings you here today?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const [showHandoff, setShowHandoff] = useState(false);
    const [userInfo, setUserInfo] = useState({ name: '', email: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Detect if user wants to connect via WhatsApp
    useEffect(() => {
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];

        if (lastUserMessage) {
            const content = lastUserMessage.content.toLowerCase();
            const wantsContact =
                content.includes('whatsapp') ||
                content.includes('contact') ||
                content.includes('talk') ||
                content.includes('call') ||
                content.includes('reach out') ||
                content.includes('get in touch');

            if (wantsContact) {
                setShowHandoff(true);
            }
        }
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setShowQuickReplies(false);

        try {
            const { sendChatMessage } = await import('../../lib/chatService');
            const response = await sendChatMessage(textToSend, messages);

            const botMessage: ChatMessage = {
                role: 'assistant',
                content: response
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: error instanceof Error ? error.message : 'Connection error. Please check your API key configuration.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWhatsAppHandoff = () => {
        const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923135229867';
        const userName = userInfo.name || '';
        const userEmail = userInfo.email || '';

        let message = 'Hi! I am interested in your engineering services';

        if (userName && userEmail) {
            message += '.\\n\\nName: ' + userName + '\\nEmail: ' + userEmail;
        } else if (userName) {
            message += '.\\n\\nName: ' + userName;
        } else if (userEmail) {
            message += '.\\n\\nEmail: ' + userEmail;
        }

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMsg}`, '_blank');
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[998] w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#4F6DF5] to-[#7B8FF7] rounded-full flex items-center justify-center shadow-2xl shadow-[#4F6DF5]/50 hover:scale-110 transition-transform duration-300"
                aria-label="Toggle AI Assistant"
            >
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    )}
                </svg>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-0 sm:bottom-24 right-0 sm:right-6 z-[998] w-full sm:w-auto sm:max-w-md h-[100vh] sm:h-[600px] flex flex-col bg-[#0E1118]/95 backdrop-blur-xl overflow-hidden border-0 sm:border border-[#A6AFBF]/20 shadow-2xl sm:rounded-3xl">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-[#4F6DF5] to-[#7B8FF7] flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-bold text-sm sm:text-base">Vertex AI</div>
                                <div className="text-xs text-white/80">Engineering Architect</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923135229867';
                                    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I am interested in your engineering services')}`, '_blank');
                                }}
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                            </button>
                            <button onClick={() => setIsOpen(false)} className="opacity-80 hover:opacity-100 transition-opacity p-2 -m-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        className="flex-1 p-4 space-y-4 bg-[#07080B]/60 overflow-y-auto"
                        onWheel={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-[#4F6DF5] text-white'
                                        : 'bg-[#0E1118] border border-[#A6AFBF]/20 text-gray-200'
                                        }`}
                                >
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#0E1118] border border-[#A6AFBF]/20 text-gray-300 p-3 rounded-2xl">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Replies */}
                        {showQuickReplies && messages.length === 1 && (
                            <div className="flex flex-wrap gap-2">
                                {QUICK_REPLIES.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(reply.message)}
                                        className="px-3 py-2 bg-[#0E1118] border border-[#A6AFBF]/20 rounded-lg text-xs text-gray-300 hover:bg-[#4F6DF5] hover:text-white hover:border-[#4F6DF5] transition-all"
                                    >
                                        {reply.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* WhatsApp Handoff */}
                        {showHandoff && (
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl space-y-3">
                                <div className="flex items-center space-x-2 text-green-400">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    <span className="text-sm font-semibold">Ready to connect on WhatsApp?</span>
                                </div>
                                <p className="text-xs text-gray-400">Chat directly with our team</p>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Your name (optional)"
                                        value={userInfo.name}
                                        onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[#07080B] border border-[#A6AFBF]/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your email (optional)"
                                        value={userInfo.email}
                                        onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[#07080B] border border-[#A6AFBF]/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                    />
                                    <button
                                        onClick={handleWhatsAppHandoff}
                                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        <span>Continue on WhatsApp</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="p-3 sm:p-4 bg-[#07080B]/80 border-t border-[#A6AFBF]/10"
                    >
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about our services..."
                                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-[#0E1118] border border-[#A6AFBF]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#4F6DF5] transition-colors"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#4F6DF5] hover:bg-[#7B8FF7] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center min-w-[44px]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIConsultant;
