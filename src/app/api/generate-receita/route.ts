// API Route para gerar receitas médicas com OpenAI
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { patientInfo, diagnosis, symptoms } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key da OpenAI não configurada' },
        { status: 500 }
      );
    }

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

    return NextResponse.json({ 
      receita: completion.choices[0].message.content,
      success: true 
    });
  } catch (error) {
    console.error('Erro ao gerar receita:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar receita médica. Verifique sua API Key.' },
      { status: 500 }
    );
  }
}
