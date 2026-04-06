import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ClipboardCheck, BarChart3, Lightbulb, User, LogOut,
  MessageCircle, X, Send, Bot, HelpCircle, Wallet, TrendingDown, ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postChat } from '@/lib/api';
import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/logement', label: 'Diagnostic', icon: ClipboardCheck },
  { path: '/prediction', label: 'Résultats', icon: BarChart3 },
  { path: '/conseils', label: 'Conseils', icon: Lightbulb },
  { path: '/analyses', label: 'Analyses', icon: TrendingDown },
  { path: '/compare', label: 'Comparateur', icon: ArrowRightLeft },
  { path: '/profile', label: 'Mon profil', icon: User },
];

const CHAT_SUGGESTIONS = [
  { icon: HelpCircle, text: "Quelles aides pour mes travaux ?" },
  { icon: TrendingDown, text: "Quel est le travail le plus rentable ?" },
  { icon: Wallet, text: "Comment reduire ma facture ?" },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // ── Chat State ──
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: "Bonjour ! Je suis votre conseiller rénovation. Posez-moi vos questions sur les travaux, les aides et la rentabilité." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sanitize = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\s*\*\s+/gm, '- ').replace(/^\s*#{1,6}\s*/gm, '').replace(/`{1,3}/g, '').trim();

  const sendChatMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatLoading) return;
    setChatInput('');
    setChatMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setChatLoading(true);
    try {
      // Use empty home data for general questions
      const data = await postChat({
        surface_habitable_logement: 80,
        annee_construction_dpe: 2000,
      }, trimmed);
      setChatMessages((m) => [...m, { role: 'assistant', text: sanitize(data.response) }]);
    } catch (err: any) {
      setChatMessages((m) => [...m, { role: 'assistant', text: `Erreur : ${err.userMessage || 'Connexion impossible.'}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const showSuggestions = chatMessages.length <= 1 && !chatLoading;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 shrink-0">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-md">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">Dashboard</div>
              <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                {currentUser ? currentUser.nom : 'Non connecté'}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="sidebar-indicator" className="w-1 h-5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          {currentUser ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => { logout(); navigate('/'); }}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/login')}
            >
              <User className="h-4 w-4" />
              Se connecter
            </Button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>

        {/* ── Chat Bubble & Panel ── */}
        <AnimatePresence>
          {!chatOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-emerald-500 text-white rounded-full flex items-center justify-center z-50 shadow-lg hover:scale-105 transition-transform"
            >
              <MessageCircle size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-[400px] h-[70vh] sm:h-[520px] bg-card rounded-2xl border border-border shadow-2xl flex flex-col z-50 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
                <div className="flex items-center gap-2">
                  <Bot size={18} />
                  <span className="font-semibold text-sm">Conseiller EcoPredict</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="hover:bg-white/15 p-1 rounded-lg transition">
                  <X size={18} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-border flex items-center justify-center shrink-0 mt-1">
                        <Bot size={14} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-br-sm shadow-sm'
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
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 pt-1">
                    {CHAT_SUGGESTIONS.map((s) => (
                      <button
                        key={s.text}
                        onClick={() => sendChatMessage(s.text)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      >
                        <s.icon size={13} />
                        {s.text}
                      </button>
                    ))}
                  </motion.div>
                )}

                {chatLoading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-border flex items-center justify-center shrink-0">
                      <Bot size={14} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="bg-muted border border-border px-4 py-3 rounded-xl rounded-bl-sm">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(chatInput)}
                    placeholder="Posez votre question..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendChatMessage(chatInput)}
                    disabled={chatLoading || !chatInput.trim()}
                    size="icon"
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:opacity-90"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
