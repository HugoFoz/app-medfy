// Funções para gerar documentos médicos usando OpenAI via API Routes

export async function generateLaudo(data: any): Promise<string> {
  try {
    const response = await fetch('/api/generate-laudo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        examType: data.tipo,
        patientInfo: `${data.paciente}, ${data.idade} anos, sexo ${data.sexo}`,
        findings: `
          Queixa principal: ${data.queixaPrincipal}
          Histórico: ${data.historico || 'Não informado'}
          Exame: ${data.exame || 'Não especificado'}
          Observações: ${data.observacoes || 'Nenhuma'}
        `
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar laudo');
    }

    const result = await response.json();
    return result.laudo;
  } catch (error: any) {
    console.error('Erro ao gerar laudo:', error);
    throw new Error(error.message || 'Erro ao gerar laudo médico');
  }
}

export async function generateReceita(data: any): Promise<string> {
  try {
    const response = await fetch('/api/generate-receita', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientInfo: `${data.paciente}, ${data.idade} anos, sexo ${data.sexo}`,
        diagnosis: data.diagnostico,
        symptoms: `
          Medicamentos: ${data.medicamentos}
          Posologia: ${data.posologia || 'Conforme orientação médica'}
          Duração: ${data.duracao || 'Uso contínuo'}
          Observações: ${data.observacoes || 'Nenhuma'}
        `
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar receita');
    }

    const result = await response.json();
    return result.receita;
  } catch (error: any) {
    console.error('Erro ao gerar receita:', error);
    throw new Error(error.message || 'Erro ao gerar receita médica');
  }
}

export async function generateRelatorio(data: any): Promise<string> {
  try {
    const response = await fetch('/api/generate-relatorio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportType: data.tipo,
        patientInfo: `${data.paciente}, ${data.idade} anos, sexo ${data.sexo}`,
        clinicalData: `
          Motivo de internação: ${data.motivoInternacao || 'Não informado'}
          Evolução clínica: ${data.evolucao}
          Procedimentos realizados: ${data.procedimentos}
          Condição de alta: ${data.condicaoAlta || 'Não especificada'}
          Recomendações: ${data.recomendacoes || 'Nenhuma'}
          Observações: ${data.observacoes || 'Nenhuma'}
        `
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar relatório');
    }

    const result = await response.json();
    return result.relatorio;
  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error);
    throw new Error(error.message || 'Erro ao gerar relatório médico');
  }
}

export async function sendChatMessage(message: string, conversationHistory?: any[]): Promise<string> {
  try {
    const response = await fetch('/api/chat-support', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory || []
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao enviar mensagem');
    }

    const result = await response.json();
    return result.response;
  } catch (error: any) {
    console.error('Erro no chat:', error);
    throw new Error(error.message || 'Erro ao processar mensagem');
  }
}
