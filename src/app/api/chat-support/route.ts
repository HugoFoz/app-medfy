// API Route para chat de suporte com IA
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key da OpenAI não configurada' },
        { status: 500 }
      );
    }

    const messages = [
      {
        role: 'system' as const,
        content: `Você é um assistente virtual especializado da Medfy, uma plataforma médica profissional. 

Suas responsabilidades:
- Auxiliar médicos com dúvidas sobre o uso da plataforma
- Fornecer informações sobre funcionalidades (laudos, receitas, relatórios)
- Orientar sobre melhores práticas médicas e documentação
- Responder questões técnicas sobre a plataforma
- Ser sempre profissional, preciso e prestativo

Mantenha um tom profissional mas acessível. Seja claro e objetivo nas respostas.`
      },
      ...(conversationHistory || []),
      {
        role: 'user' as const,
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.8,
      max_tokens: 1500,
    });

    return NextResponse.json({ 
      response: completion.choices[0].message.content,
      success: true 
    });
  } catch (error) {
    console.error('Erro no chat de suporte:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem. Verifique sua API Key.' },
      { status: 500 }
    );
  }
}
