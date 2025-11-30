import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API Key da OpenAI não configurada" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é o assistente de suporte oficial do Medfy, uma plataforma premium de geração inteligente de documentos médicos com IA.

**Sobre o Medfy:**
- Plataforma para médicos gerarem laudos, receitas e relatórios médicos com IA
- Usa inteligência artificial (OpenAI GPT-4) para criar documentos profissionais
- Integrado com Supabase para armazenamento seguro
- Disponível 24/7 para auxiliar profissionais de saúde

**Funcionalidades principais:**
1. **Laudos Médicos**: Raio-X, Ultrassom, Ressonância, Tomografia, Ecocardiograma, Mamografia
2. **Receitas**: Simples, Controlada, Especial, Antimicrobiana
3. **Relatórios**: Evolução, Alta, Atestado, Cirúrgico, Parecer Técnico, Sumário

**Como ajudar os usuários:**
- Explique como usar cada funcionalidade
- Oriente sobre preenchimento de formulários
- Ajude com dúvidas sobre documentos médicos
- Explique sobre autenticação e segurança
- Auxilie com problemas técnicos
- Seja profissional, claro e empático
- Use linguagem médica quando apropriado

**Diretrizes:**
- Sempre mantenha tom profissional e respeitoso
- Seja conciso mas completo nas respostas
- Ofereça exemplos práticos quando relevante
- Se não souber algo específico, seja honesto
- Priorize a segurança e privacidade dos dados médicos
- Incentive boas práticas médicas

Você está aqui para tornar a experiência no Medfy excepcional!`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}
