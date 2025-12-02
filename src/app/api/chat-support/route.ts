// API Route para chat de suporte com IA
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = await request.json();

    // Verificar se a API Key está configurada
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY não encontrada nas variáveis de ambiente');
      return NextResponse.json(
        { error: 'API Key da OpenAI não configurada. Verifique o arquivo .env.local' },
        { status: 500 }
      );
    }

    console.log('✅ API Key encontrada, iniciando chamada à OpenAI...');

    const openai = new OpenAI({
      apiKey: apiKey,
    });

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

    console.log('✅ Resposta recebida da OpenAI');

    return NextResponse.json({ 
      response: completion.choices[0].message.content,
      success: true 
    });
  } catch (error: any) {
    console.error('❌ Erro no chat de suporte:', error);
    
    // Tratamento específico de erros da OpenAI
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'API Key inválida. Verifique sua chave da OpenAI.' },
        { status: 401 }
      );
    }
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao processar mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
