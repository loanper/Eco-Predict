import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { postChat } from "../api";

export default function ChatWidget({ formData }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Bonjour ! Je suis votre conseiller rénovation. Je réponds de façon courte et concrète sur votre facture et vos travaux rentables.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sanitizeAssistantText = (text) => {
    if (!text) return "";
    return String(text)
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^\s*\*\s+/gm, "- ")
      .replace(/^\s*#{1,6}\s*/gm, "")
      .replace(/`{1,3}/g, "")
      .trim();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const data = await postChat(formData, text);
      setMessages((m) => [...m, { role: "assistant", text: sanitizeAssistantText(data.response) }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `⚠️ ${err.userMessage || "Erreur de connexion."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 btn-brand rounded-full flex items-center justify-center z-50"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[400px] h-[520px] bg-white/80 rounded-3xl shadow-lift
                       border border-slate-200/60 flex flex-col z-50 overflow-hidden backdrop-blur"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-gradient text-white">
              <div className="flex items-center gap-2">
                <Bot size={18} />
                <span className="font-semibold text-sm">Conseiller EcoPredict</span>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/15 p-1 rounded-xl transition">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-brand-gradient-soft border border-slate-200/60 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} className="text-brand-blue-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-brand-gradient text-white rounded-br-sm shadow-soft"
                        : "bg-white/70 border border-slate-200/60 text-slate-800 rounded-bl-sm shadow-soft"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0 mt-1">
                      <User size={14} className="text-slate-500" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-gradient-soft border border-slate-200/60 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-brand-blue-700" />
                  </div>
                  <div className="bg-white/70 border border-slate-200/60 px-4 py-3 rounded-xl rounded-bl-sm shadow-soft">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200/60 bg-white/60">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Posez votre question..."
                  className="flex-1 control px-3 py-2.5 text-sm"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="px-3 py-2.5 btn-brand disabled:opacity-40 transition"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
