// API Route para gerar laudos médicos com OpenAI
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { examType, patientInfo, findings } = await request.json();

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
          content: 'Você é um médico especialista em laudos médicos. Gere laudos profissionais, detalhados e tecnicamente precisos seguindo os padrões médicos brasileiros.'
        },
        {
          role: 'user',
          content: `Gere um laudo médico completo e profissional para:

Tipo de exame: ${examType}
Informações do paciente: ${patientInfo}
Achados clínicos: ${findings}

O laudo deve conter:
1. Identificação do exame
2. Técnica utilizada
3. Descrição detalhada dos achados
4. Impressão diagnóstica
5. Conclusão médica

Use terminologia médica adequada e seja preciso nas observações.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return NextResponse.json({ 
      laudo: completion.choices[0].message.content,
      success: true 
    });
  } catch (error) {
    console.error('Erro ao gerar laudo:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar laudo médico. Verifique sua API Key.' },
      { status: 500 }
    );
  }
}
