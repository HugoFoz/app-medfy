// API Route para gerar relatórios médicos com OpenAI
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { reportType, patientInfo, clinicalData } = await request.json();

    // Verificar se a API Key está configurada
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY não encontrada nas variáveis de ambiente');
      return NextResponse.json(
        { error: 'API Key da OpenAI não configurada. Verifique o arquivo .env.local' },
        { status: 500 }
      );
    }

    console.log('✅ Gerando relatório médico com OpenAI...');

    const openai = new OpenAI({
      apiKey: apiKey,
    });

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

    console.log('✅ Relatório gerado com sucesso');

    return NextResponse.json({ 
      relatorio: completion.choices[0].message.content,
      success: true 
    });
  } catch (error: any) {
    console.error('❌ Erro ao gerar relatório:', error);
    
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
      { error: error.message || 'Erro ao gerar relatório médico. Tente novamente.' },
      { status: 500 }
    );
  }
}
