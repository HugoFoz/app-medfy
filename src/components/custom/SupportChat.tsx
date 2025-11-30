"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sendChatMessage } from "@/lib/openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou o assistente do Medfy. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verificar autenticação
  useEffect(() => {
    if (supabase) {
      checkUser();

      // Listener para mudanças de autenticação
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setCheckingAuth(false);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const checkUser = async () => {
    if (!supabase) {
      setCheckingAuth(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Usar a nova função que chama a API Route
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await sendChatMessage(input, conversationHistory);

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Erro:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message?.includes('API key') 
            ? "Configure sua API Key da OpenAI nas variáveis de ambiente para usar o chat."
            : "Desculpe, ocorreu um erro. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Não mostrar nada enquanto verifica autenticação
  if (checkingAuth) {
    return null;
  }

  // Se não estiver autenticado, mostrar botão bloqueado
  if (!user) {
    return (
      <button
        onClick={() => {}}
        disabled
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white/10 rounded-full shadow-lg flex items-center justify-center cursor-not-allowed opacity-50"
        aria-label="Chat de suporte (requer login)"
        title="Faça login para usar o assistente"
      >
        <Lock className="w-6 h-6 text-white/50" />
      </button>
    );
  }

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#FF6F00] to-[#FFD600] rounded-full shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
          aria-label="Abrir chat de suporte"
        >
          <MessageCircle className="w-6 h-6 text-[#0D0D0D]" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0D0D0D] animate-pulse"></span>
        </button>
      )}

      {/* Janela do Chat - Compacta */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[320px] h-[450px] bg-[#0D0D0D] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF6F00] to-[#FFD600] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-[#0D0D0D] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#FF6F00]" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#0D0D0D]"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0D0D0D]">Suporte Medfy</h3>
                <p className="text-xs text-[#0D0D0D]/70">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[#0D0D0D]/10 rounded-lg transition-all"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5 text-[#0D0D0D]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0D0D0D]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#FF6F00] to-[#FFD600] text-[#0D0D0D]"
                      : "bg-white/5 text-white border border-white/10"
                  }`}
                >
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 text-[#FF6F00] animate-spin" />
                  <span className="text-xs text-white/60">Digitando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-[#0D0D0D]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={loading}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 bg-gradient-to-br from-[#FF6F00] to-[#FFD600] rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensagem"
              >
                <Send className="w-4 h-4 text-[#0D0D0D]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
