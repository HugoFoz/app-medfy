// API Route para gerar laudos médicos com OpenAI
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { examType, patientInfo, findings } = await request.json();

    // Verificar se a API Key está configurada
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY não encontrada nas variáveis de ambiente');
      return NextResponse.json(
        { error: 'API Key da OpenAI não configurada. Verifique o arquivo .env.local' },
        { status: 500 }
      );
    }

    console.log('✅ Gerando laudo médico com OpenAI...');

    const openai = new OpenAI({
      apiKey: apiKey,
    });

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

    console.log('✅ Laudo gerado com sucesso');

    return NextResponse.json({ 
      laudo: completion.choices[0].message.content,
      success: true 
    });
  } catch (error: any) {
    console.error('❌ Erro ao gerar laudo:', error);
    
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
      { error: error.message || 'Erro ao gerar laudo médico. Tente novamente.' },
      { status: 500 }
    );
  }
}
