import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            const data = await response.json();
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message || data.content || 'Sorry, I could not process your request.',
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, there was an error processing your request.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">

                {/* Chat Window */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="pointer-events-auto bg-[#0E1118]/90 backdrop-blur-xl border border-[#4F6DF5]/30 
                         w-[90vw] md:w-[400px] h-[60vh] md:h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/5 bg-[#4F6DF5]/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#4F6DF5]/20 flex items-center justify-center border border-[#4F6DF5]/30">
                                        <Sparkles className="w-4 h-4 text-[#4F6DF5]" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-semibold text-white">Vertex AI</h3>
                                        <p className="text-[10px] text-[#A6AFBF] font-mono tracking-wider uppercase">Engineering Architect</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-[#A6AFBF]" />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                                        <Bot className="w-12 h-12 text-[#4F6DF5] mb-3 opacity-50" />
                                        <p className="text-sm text-[#A6AFBF]">How can I assist with your engineering project today?</p>
                                    </div>
                                )}

                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center shrink-0 border
                      ${m.role === 'user'
                                                ? 'bg-white/10 border-white/20'
                                                : 'bg-[#4F6DF5]/10 border-[#4F6DF5]/30'
                                            }
                    `}>
                                            {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#4F6DF5]" />}
                                        </div>

                                        <div className={`
                      p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed
                      ${m.role === 'user'
                                                ? 'bg-white/10 text-white rounded-tr-sm'
                                                : 'bg-[#0E1118] border border-white/10 text-[#A6AFBF] rounded-tl-sm shadow-lg'
                                            }
                    `}>
                                            {/* Simple formatting for bullet points if any */}
                                            {m.content.split('\n').map((line: string, i: number) => (
                                                <p key={i} className="mb-1 last:mb-0">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex items-center gap-2 ml-12">
                                        <span className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-white/5 bg-[#0E1118]">
                                <form onSubmit={handleSubmit} className="relative">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask about CFD, FEA, or Prototypes..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-[#A6AFBF]/50 focus:outline-none focus:border-[#4F6DF5]/50 focus:ring-1 focus:ring-[#4F6DF5]/50 transition-all font-sans"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#4F6DF5] rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3D5BE0] transition-colors"
                                    >
                                        <Send className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="pointer-events-auto h-14 w-14 rounded-full bg-[#4F6DF5] flex items-center justify-center shadow-[0_0_30px_rgba(79,109,245,0.4)] border border-white/10 hover:bg-[#3D5BE0] transition-all z-50 group"
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                            >
                                <X className="w-6 h-6 text-white" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, rotate: 90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: -90 }}
                            >
                                <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}
