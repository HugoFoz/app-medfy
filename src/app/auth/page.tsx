"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sparkles, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;

        setSuccess("Link de recuperação enviado para seu email!");
        setTimeout(() => {
          setMode("login");
          setSuccess("");
        }, 3000);
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          alert("Conta criada com sucesso! Verifique seu email para confirmar.");
          router.push("/");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          router.push("/");
        }
      }
    } catch (error: any) {
      // Tratamento de erros mais amigável
      let errorMessage = "Erro ao processar autenticação";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos. Por favor, tente novamente.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login.";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado. Tente fazer login.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Card */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/3de79649-ea78-4f6a-9914-2eb900637a56.png" 
              alt="Medfy Logo" 
              className="h-20 w-auto"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === "login" 
                ? "Bem-vindo de volta" 
                : mode === "signup" 
                ? "Criar conta" 
                : "Recuperar senha"}
            </h2>
            <p className="text-white/60 text-sm">
              {mode === "login"
                ? "Entre para acessar seus documentos"
                : mode === "signup"
                ? "Comece a gerar documentos com IA"
                : "Enviaremos um link para seu email"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                    placeholder="Dr. João Silva"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {mode !== "reset" && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                {mode === "signup" && (
                  <p className="text-xs text-white/40 mt-1">Mínimo de 6 caracteres</p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl py-3 font-semibold text-[#0D0D0D] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {mode === "login" 
                    ? "Entrar" 
                    : mode === "signup" 
                    ? "Criar Conta" 
                    : "Enviar Link"}
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 space-y-3 text-center">
            {mode === "login" && (
              <>
                <button
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccess("");
                  }}
                  className="block w-full text-sm text-white/60 hover:text-[#FF6F00] transition-colors"
                >
                  Não tem conta? Criar conta
                </button>
                <button
                  onClick={() => {
                    setMode("reset");
                    setError("");
                    setSuccess("");
                  }}
                  className="block w-full text-sm text-white/60 hover:text-[#FF6F00] transition-colors"
                >
                  Esqueceu a senha? Recuperar senha
                </button>
              </>
            )}
            
            {mode === "signup" && (
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="text-sm text-white/60 hover:text-[#FF6F00] transition-colors"
              >
                Já tem conta? Entrar
              </button>
            )}

            {mode === "reset" && (
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="text-sm text-white/60 hover:text-[#FF6F00] transition-colors"
              >
                Voltar para login
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-white/40">
          <p>Ao continuar, você concorda com nossos</p>
          <p>Termos de Uso e Política de Privacidade</p>
        </div>
      </div>
    </div>
  );
}
