import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, HelpCircle, Wallet, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postChat } from '@/lib/api';

const SUGGESTIONS = [
    { icon: HelpCircle, text: "Quelles aides pour mes travaux ?" },
    { icon: TrendingDown, text: "Quel est le travail le plus rentable ?" },
    { icon: Wallet, text: "Comment reduire ma facture ?" },
];

interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
}

interface Props {
    formData: Record<string, unknown>;
    prefillMessage: string | null;
    onPrefillConsumed: () => void;
}

export default function ChatWidget({ formData, prefillMessage, onPrefillConsumed }: Props) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', text: "Bonjour ! Je suis votre conseiller renovation. Posez-moi vos questions sur les travaux, les aides et la rentabilite." },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (prefillMessage) {
            setOpen(true);
            const timer = setTimeout(() => {
                sendMessage(prefillMessage);
                onPrefillConsumed();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [prefillMessage]);

    const sanitize = (text: string) =>
        text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\s*\*\s+/gm, '- ').replace(/^\s*#{1,6}\s*/gm, '').replace(/`{1,3}/g, '').trim();

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        setInput('');
        setMessages((m) => [...m, { role: 'user', text: trimmed }]);
        setLoading(true);
        try {
            const data = await postChat(formData, trimmed);
            setMessages((m) => [...m, { role: 'assistant', text: sanitize(data.response) }]);
        } catch (err: any) {
            setMessages((m) => [...m, { role: 'assistant', text: `Erreur : ${err.userMessage || 'Connexion impossible.'}` }]);
        } finally {
            setLoading(false);
        }
    };

    const showSuggestions = messages.length <= 1 && !loading;

    return (
        <>
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 gradient-hero text-white rounded-full flex items-center justify-center z-50 shadow-lg"
                    >
                        <MessageCircle size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-[400px] h-[70vh] sm:h-[520px] bg-card rounded-xl border border-border shadow-xl flex flex-col z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 gradient-hero text-white">
                            <div className="flex items-center gap-2">
                                <Bot size={18} />
                                <span className="font-semibold text-sm">Conseiller EcoPredict</span>
                            </div>
                            <button onClick={() => setOpen(false)} className="hover:bg-white/15 p-1 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-full bg-eco-blue-light border border-border flex items-center justify-center shrink-0 mt-1">
                                            <Bot size={14} className="text-primary" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'gradient-hero text-white rounded-br-sm shadow-soft'
                                            : 'bg-muted border border-border text-foreground rounded-bl-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-1">
                                            <User size={14} className="text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {showSuggestions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-wrap gap-2 pt-1"
                                >
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s.text}
                                            onClick={() => sendMessage(s.text)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                        >
                                            <s.icon size={13} />
                                            {s.text}
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            {loading && (
                                <div className="flex gap-2">
                                    <div className="w-7 h-7 rounded-full bg-eco-blue-light border border-border flex items-center justify-center shrink-0">
                                        <Bot size={14} className="text-primary" />
                                    </div>
                                    <div className="bg-muted border border-border px-4 py-3 rounded-xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="p-3 border-t border-border bg-card">
                            <div className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                                    placeholder="Posez votre question..."
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() => sendMessage(input)}
                                    disabled={loading || !input.trim()}
                                    size="icon"
                                    className="gradient-hero text-white"
                                >
                                    <Send size={16} />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
