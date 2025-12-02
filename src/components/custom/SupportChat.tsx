"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Lock, Trash2 } from "lucide-react";
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
  const [messageCount, setMessageCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verificar status online
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  // Verificar autenticação e carregar histórico
  useEffect(() => {
    if (supabase) {
      checkUser();

      // Listener para mudanças de autenticação
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setCheckingAuth(false);
        if (session?.user) {
          loadChatHistory(session.user.id);
        }
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
      if (user) {
        await loadChatHistory(user.id);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  // Carregar histórico de mensagens do banco
  const loadChatHistory = async (userId: string) => {
    if (!supabase) return;
    
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
        
        setMessages([
          {
            role: "assistant",
            content: "Olá! 👋 Sou o assistente do Medfy. Como posso ajudar?",
          },
          ...loadedMessages
        ]);
        setMessageCount(loadedMessages.length);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Salvar mensagem no banco
  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!supabase || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role,
          content
        });

      if (error) throw error;
      setMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  };

  // Limpar histórico de chat
  const clearChat = async () => {
    if (!user || !supabase) return;

    try {
      // Limpar mensagens locais
      setMessages([
        {
          role: "assistant",
          content: "Olá! 👋 Sou o assistente do Medfy. Como posso ajudar?",
        },
      ]);
      setMessageCount(0);

      // Nota: Não podemos deletar do banco por segurança, mas limpamos localmente
      // O histórico permanece no banco para auditoria
    } catch (error) {
      console.error('Erro ao limpar chat:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !user || !isOnline) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Salvar mensagem do usuário
    await saveMessage("user", input);

    try {
      // Usar a nova função que chama a API Route
      const conversationHistory = messages
        .filter(m => m.role !== "assistant" || m.content !== "Olá! 👋 Sou o assistente do Medfy. Como posso ajudar?")
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await sendChatMessage(input, conversationHistory);

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Salvar resposta do assistente
      await saveMessage("assistant", response);
    } catch (error: any) {
      console.error("Erro:", error);
      const errorMessage = error.message?.includes('API key') 
        ? "Configure sua API Key da OpenAI nas variáveis de ambiente para usar o chat."
        : "Desculpe, ocorreu um erro. Tente novamente.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
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

  // Sugestões rápidas
  const quickSuggestions = [
    "Como gerar um laudo?",
    "Como criar uma receita?",
    "Preciso de ajuda com relatórios",
  ];

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
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
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#FF6F00] to-[#FFD600] rounded-full shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center group"
          aria-label="Abrir chat de suporte"
        >
          <MessageCircle className="w-6 h-6 text-[#0D0D0D]" />
          <span className={`absolute -top-1 -right-1 w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full border-2 border-[#0D0D0D] ${isOnline ? 'animate-pulse' : ''}`}></span>
          {messageCount > 0 && (
            <span className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {messageCount > 99 ? '99+' : messageCount}
            </span>
          )}
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-[#0D0D0D] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF6F00] to-[#FFD600] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#0D0D0D] rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#FF6F00]" />
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full border-2 border-[#0D0D0D] ${isOnline ? 'animate-pulse' : ''}`}></span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0D0D0D]">Assistente Medfy AI</h3>
                <p className="text-xs text-[#0D0D0D]/70 flex items-center gap-1">
                  {isOnline ? '🟢 Online 24/7' : '🔴 Offline'}
                  {messageCount > 0 && ` • ${messageCount} mensagens`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 hover:bg-[#0D0D0D]/10 rounded-lg transition-all"
                aria-label="Limpar chat"
                title="Limpar conversa"
              >
                <Trash2 className="w-4 h-4 text-[#0D0D0D]" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-[#0D0D0D]/10 rounded-lg transition-all"
                aria-label="Fechar chat"
              >
                <X className="w-5 h-5 text-[#0D0D0D]" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0D0D0D]">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-[#FF6F00] animate-spin" />
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-[#FF6F00] to-[#FFD600] text-[#0D0D0D]"
                          : "bg-white/5 text-white border border-white/10"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#FF6F00] animate-spin" />
                      <span className="text-sm text-white/60">Digitando...</span>
                    </div>
                  </div>
                )}

                {/* Sugestões rápidas - mostrar apenas se não houver muitas mensagens */}
                {messages.length <= 2 && !loading && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-white/40 text-center">Sugestões rápidas:</p>
                    {quickSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-[#0D0D0D]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isOnline ? "Digite sua mensagem..." : "Você está offline"}
                disabled={loading || !isOnline}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || !isOnline}
                className="p-2.5 bg-gradient-to-br from-[#FF6F00] to-[#FFD600] rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensagem"
                title={!isOnline ? "Você está offline" : "Enviar (Enter)"}
              >
                <Send className="w-5 h-5 text-[#0D0D0D]" />
              </button>
            </div>
            <p className="text-xs text-white/30 mt-2 text-center">
              Pressione Enter para enviar • Shift+Enter para nova linha
            </p>
          </div>
        </div>
      )}
    </>
  );
}
