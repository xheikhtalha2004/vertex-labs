'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const QUICK_REPLIES = [
    { label: 'Services Overview', message: 'What services do you offer?' },
    { label: 'Pricing & Timeline', message: 'How much does it cost and how long does it take?' },
    { label: 'Portfolio Examples', message: 'Can you show me some example projects?' },
    { label: 'Get Started', message: 'How do I get started with a project?' },
];

const AIConsultant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: "👋 Hi! I'm the Vertex Engineering Architect. I can help you understand our CAD, CFD, FEA, and prototyping services. What brings you here today?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const [showHandoff, setShowHandoff] = useState(false);
    const [userInfo, setUserInfo] = useState({ name: '', email: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const lastUserMessage = messages.filter((m) => m.role === 'user').slice(-1)[0];
        if (!lastUserMessage) return;

        const content = lastUserMessage.content.toLowerCase();
        const wantsContact =
            content.includes('whatsapp') ||
            content.includes('contact') ||
            content.includes('talk') ||
            content.includes('call') ||
            content.includes('reach out') ||
            content.includes('get in touch');

        if (wantsContact) setShowHandoff(true);
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: textToSend };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setShowQuickReplies(false);

        try {
            const { sendChatMessage } = await import('../../lib/chatService');
            const response = await sendChatMessage(textToSend, messages);
            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: error instanceof Error
                        ? error.message
                        : 'Connection error. Please check your API key configuration.',
                },
            ]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleWhatsAppHandoff = () => {
        const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923135229867';
        const userName = userInfo.name || '';
        const userEmail = userInfo.email || '';

        let message = 'Hi! I am interested in your engineering services';
        if (userName && userEmail) message += `.\n\nName: ${userName}\nEmail: ${userEmail}`;
        else if (userName) message += `.\n\nName: ${userName}`;
        else if (userEmail) message += `.\n\nEmail: ${userEmail}`;

        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[998] w-14 h-14 sm:w-16 sm:h-16 bg-[#4F6DF5] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(79,109,245,0.45)] border border-white/10 hover:scale-105 transition-transform duration-300"
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

            {isOpen && (
                <div className="fixed right-3 left-3 sm:left-auto sm:right-6 top-20 sm:top-24 bottom-20 sm:bottom-24 z-[997] sm:w-[420px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl border border-white/10 bg-[#0D0F15]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl pointer-events-auto">
                    <div className="flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r from-[#9AA8FF] to-[#7B8FF7] text-white">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-white font-bold">V</span>
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">Vertex AI</div>
                                <div className="text-[11px] opacity-90 truncate">Engineering Architect</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923135229867';
                                    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I am interested in your engineering services')}`, '_blank');
                                }}
                                className="px-3 py-1 text-[11px] sm:text-xs rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white transition-colors flex items-center gap-1.5 shadow-[0_6px_16px_rgba(37,211,102,0.35)]"
                                title="Chat on WhatsApp"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                                    <path d="M19.11 17.59c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.22 5.08 4.52.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
                                    <path d="M16.02 3C8.84 3 3 8.84 3 16.02c0 2.3.6 4.55 1.75 6.54L3 29l6.64-1.74c1.93 1.05 4.1 1.6 6.38 1.6 7.18 0 13.02-5.84 13.02-13.02C29.04 8.84 23.2 3 16.02 3zm0 23.47c-2.1 0-4.15-.55-5.95-1.59l-.43-.25-3.94 1.03 1.05-3.84-.28-.44a10.92 10.92 0 0 1-1.68-5.86c0-6.06 4.93-10.99 10.99-10.99 2.93 0 5.68 1.14 7.75 3.22a10.9 10.9 0 0 1 3.23 7.77c0 6.06-4.93 10.95-11.04 10.95z" />
                                </svg>
                                <span>WhatsApp</span>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full hover:bg-white/15 transition-colors"
                                aria-label="Close chat"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div
                        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 overscroll-contain pointer-events-auto"
                        onWheel={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#4F6DF5] text-white'
                                        : 'bg-[#121521] border border-white/10 text-[#D7DBE7]'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#121521] border border-white/10 text-gray-300 px-3 py-2 rounded-2xl">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showQuickReplies && messages.length === 1 && (
                            <div className="grid grid-cols-2 gap-2">
                                {QUICK_REPLIES.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            handleSend(reply.message);
                                            setTimeout(() => inputRef.current?.focus(), 0);
                                        }}
                                        className="px-3 py-2 text-xs rounded-full bg-[#111420] border border-white/10 text-[#C7CBD6] hover:bg-[#4F6DF5] hover:text-white hover:border-[#4F6DF5] transition-all"
                                    >
                                        {reply.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showHandoff && (
                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl space-y-2">
                                <div className="text-xs text-green-300 font-semibold">Connect on WhatsApp</div>
                                <input
                                    type="text"
                                    placeholder="Your name (optional)"
                                    value={userInfo.name}
                                    onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Your email (optional)"
                                    value={userInfo.email}
                                    onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                                <button
                                    onClick={handleWhatsAppHandoff}
                                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                >
                                    Continue on WhatsApp
                                </button>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="px-4 py-3 border-t border-white/10 bg-[#0B0E14] rounded-b-2xl"
                    >
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type message..."
                                className="flex-1 px-3 py-2 text-sm bg-[#111420] border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#4F6DF5]"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 rounded-full bg-[#4F6DF5] hover:bg-[#7B8FF7] disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center"
                                aria-label="Send message"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
