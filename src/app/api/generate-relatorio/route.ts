// API Route para gerar relatórios médicos com OpenAI
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { reportType, patientInfo, clinicalData } = await request.json();

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
          content: 'Você é um médico especialista em documentação médica. Gere relatórios médicos completos, detalhados e profissionais seguindo os padrões do CFM e normas brasileiras.'
        },
        {
          role: 'user',
          content: `Gere um relatório médico completo e profissional:

Tipo de relatório: ${reportType}
Informações do paciente: ${patientInfo}
Dados clínicos: ${clinicalData}

O relatório deve conter:
1. Identificação do paciente
2. Histórico clínico relevante
3. Exame físico e achados
4. Evolução do quadro
5. Conduta médica adotada
6. Prognóstico
7. Recomendações e orientações

Use linguagem técnica adequada e seja detalhado nas informações.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    return NextResponse.json({ 
      relatorio: completion.choices[0].message.content,
      success: true 
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório médico. Verifique sua API Key.' },
      { status: 500 }
    );
  }
}
