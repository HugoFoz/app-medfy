// API Route para gerar receitas médicas com OpenAI
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { patientInfo, diagnosis, symptoms } = await request.json();

    // Verificar se a API Key está configurada
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY não encontrada nas variáveis de ambiente');
      return NextResponse.json(
        { error: 'API Key da OpenAI não configurada. Verifique o arquivo .env.local' },
        { status: 500 }
      );
    }

    console.log('✅ Gerando receita médica com OpenAI...');

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um médico experiente. Gere receitas médicas completas, seguras e adequadas aos padrões brasileiros. Inclua medicamentos apropriados, dosagens corretas, posologia e orientações ao paciente.'
        },
        {
          role: 'user',
          content: `Gere uma receita médica completa e profissional para:

Informações do paciente: ${patientInfo}
Diagnóstico: ${diagnosis}
Sintomas: ${symptoms}

A receita deve conter:
1. Medicamentos prescritos com nome comercial e genérico
2. Dosagem precisa
3. Posologia (como tomar)
4. Duração do tratamento
5. Orientações gerais ao paciente
6. Observações importantes

Seja preciso e siga as normas da ANVISA e CFM.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log('✅ Receita gerada com sucesso');

    return NextResponse.json({ 
      receita: completion.choices[0].message.content,
      success: true 
    });
  } catch (error: any) {
    console.error('❌ Erro ao gerar receita:', error);
    
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
      { error: error.message || 'Erro ao gerar receita médica. Tente novamente.' },
      { status: 500 }
    );
  }
}
