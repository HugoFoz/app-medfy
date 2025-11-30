"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'pt-BR' | 'pt-PT' | 'de' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt-BR');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detectar idioma do navegador na primeira carga
  useEffect(() => {
    const savedLanguage = localStorage.getItem('medfy-language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    } else {
      // Detectar idioma do navegador
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) setLanguageState('en');
      else if (browserLang === 'pt-pt') setLanguageState('pt-PT');
      else if (browserLang.startsWith('pt')) setLanguageState('pt-BR');
      else if (browserLang.startsWith('de')) setLanguageState('de');
      else if (browserLang.startsWith('es')) setLanguageState('es');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLanguageState(lang);
      localStorage.setItem('medfy-language', lang);
      setIsTransitioning(false);
    }, 150);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Dicionários de tradução
const translations: Record<Language, Record<string, string>> = {
  'en': {
    // Header
    'app.name': 'Medfy',
    'search.placeholder': 'Search patient, document...',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Reports',
    'nav.prescriptions': 'Prescriptions',
    'nav.medical-reports': 'Medical Reports',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'stats.documents': 'Generated Documents',
    'stats.reports': 'Reports This Month',
    'stats.prescriptions': 'Prescriptions Issued',
    'stats.medical-reports': 'Medical Reports',
    'quick.actions': 'Quick Actions',
    'quick.new-report': 'New Report',
    'quick.new-prescription': 'New Prescription',
    'quick.new-medical-report': 'New Medical Report',
    'quick.with-ai': 'With AI in seconds',
    'recent.activity': 'Recent Activity',
    'recent.view-all': 'View all',
    'recent.no-documents': 'No documents created yet. Use quick actions above!',
    
    // Auth
    'auth.welcome-back': 'Welcome back',
    'auth.create-account': 'Create account',
    'auth.login-subtitle': 'Sign in to access your documents',
    'auth.signup-subtitle': 'Start generating documents with AI',
    'auth.full-name': 'Full Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login-button': 'Sign In',
    'auth.signup-button': 'Create Account',
    'auth.no-account': "Don't have an account? Create account",
    'auth.has-account': 'Already have an account? Sign in',
    'auth.terms': 'By continuing, you agree to our',
    'auth.terms-link': 'Terms of Use and Privacy Policy',
    'auth.back': 'Back',
    'auth.processing': 'Processing...',
    'auth.login-required': 'Sign in to access your documents and create new reports, prescriptions and medical reports',
    'auth.create-or-login': 'Create Account or Sign In',
    
    // Reports
    'reports.title': 'Medical Reports',
    'reports.subtitle': 'Generate complete reports with AI in seconds',
    'reports.new': 'New Report',
    'reports.your-reports': 'Your Reports',
    'reports.xray-chest': 'Chest X-Ray',
    'reports.ultrasound': 'Abdominal Ultrasound',
    'reports.mri': 'MRI',
    'reports.ct': 'CT Scan',
    'reports.echo': 'Echocardiogram',
    'reports.mammography': 'Mammography',
    'reports.fill-quiz': 'Fill the quiz and generate automatically',
    
    // Prescriptions
    'prescriptions.title': 'Medical Prescriptions',
    'prescriptions.subtitle': 'Digital prescriptions with automatic validation',
    'prescriptions.new': 'New Prescription',
    'prescriptions.your-prescriptions': 'Your Prescriptions',
    'prescriptions.simple': 'Simple Prescription',
    'prescriptions.controlled': 'Controlled Prescription',
    'prescriptions.special': 'Special Prescription',
    'prescriptions.antimicrobial': 'Antimicrobial Prescription',
    'prescriptions.according-law': 'According to current legislation',
    
    // Medical Reports
    'medical-reports.title': 'Medical Reports',
    'medical-reports.subtitle': 'Complete and detailed documentation',
    'medical-reports.new': 'New Medical Report',
    'medical-reports.your-reports': 'Your Medical Reports',
    'medical-reports.evolution': 'Clinical Evolution',
    'medical-reports.discharge': 'Hospital Discharge',
    'medical-reports.certificate': 'Medical Certificate',
    'medical-reports.surgical': 'Surgical Report',
    'medical-reports.technical': 'Technical Opinion',
    'medical-reports.summary': 'Hospitalization Summary',
    'medical-reports.intelligent-generation': 'Intelligent generation with AI',
    
    // Forms
    'form.patient-name': 'Patient Name',
    'form.age': 'Age',
    'form.sex': 'Sex',
    'form.male': 'M',
    'form.female': 'F',
    'form.chief-complaint': 'Chief Complaint',
    'form.medical-history': 'Medical History',
    'form.exam': 'Exam Performed',
    'form.observations': 'Additional Observations',
    'form.diagnosis': 'Diagnosis',
    'form.medications': 'Medications',
    'form.dosage': 'Dosage',
    'form.duration': 'Treatment Duration',
    'form.admission-reason': 'Admission Reason',
    'form.clinical-evolution': 'Clinical Evolution',
    'form.procedures': 'Procedures Performed',
    'form.discharge-condition': 'Discharge Condition',
    'form.recommendations': 'Recommendations',
    'form.cancel': 'Cancel',
    'form.generate': 'Generate with AI',
    'form.generating': 'Generating...',
    'form.required': 'Fill all required fields',
    'form.success': 'Generated successfully!',
    'form.error': 'Error generating. Try again.',
    'form.fill-info': 'Fill the information',
    
    // Document View
    'document.patient': 'Patient',
    'document.close': 'Close',
    'document.copy': 'Copy Content',
    'document.copied': 'Content copied to clipboard!',
    
    // Settings
    'settings.title': 'Language Settings',
    'settings.subtitle': 'Choose your preferred language',
    'settings.current': 'Current Language',
    'settings.select': 'Select Language',
    'settings.save': 'Save Changes',
    'settings.saved': 'Language saved successfully!',
    'settings.description': 'The interface will be displayed in the selected language',
    
    // Languages
    'lang.en': 'English',
    'lang.pt-BR': 'Portuguese (Brazil)',
    'lang.pt-PT': 'Portuguese (Portugal)',
    'lang.de': 'German',
    'lang.es': 'Spanish',
    
    // Welcome Messages
    'welcome.title': 'Welcome to Medfy!',
    'welcome.subtitle': 'Your intelligent platform for medical documents',
    'welcome.instruction-1': 'Select your preferred language in settings',
    'welcome.instruction-2': 'Create reports, prescriptions and medical reports with AI',
    'welcome.instruction-3': 'Access your documents anytime, anywhere',
    'welcome.get-started': 'Get Started',
    
    // Time
    'time.min-ago': 'min ago',
    'time.hour-ago': 'hour ago',
    'time.hours-ago': 'hours ago',
    'time.day-ago': 'day ago',
    'time.days-ago': 'days ago',
  },
  
  'pt-BR': {
    // Header
    'app.name': 'Medfy',
    'search.placeholder': 'Buscar paciente, documento...',
    'auth.login': 'Entrar',
    'auth.logout': 'Sair',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Laudos',
    'nav.prescriptions': 'Receitas',
    'nav.medical-reports': 'Relatórios',
    'nav.settings': 'Configurações',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Bem-vindo de volta',
    'stats.documents': 'Documentos Gerados',
    'stats.reports': 'Laudos Este Mês',
    'stats.prescriptions': 'Receitas Emitidas',
    'stats.medical-reports': 'Relatórios',
    'quick.actions': 'Ações Rápidas',
    'quick.new-report': 'Novo Laudo',
    'quick.new-prescription': 'Nova Receita',
    'quick.new-medical-report': 'Novo Relatório',
    'quick.with-ai': 'Com IA em segundos',
    'recent.activity': 'Atividade Recente',
    'recent.view-all': 'Ver todos',
    'recent.no-documents': 'Nenhum documento criado ainda. Use as ações rápidas acima!',
    
    // Auth
    'auth.welcome-back': 'Bem-vindo de volta',
    'auth.create-account': 'Criar conta',
    'auth.login-subtitle': 'Entre para acessar seus documentos',
    'auth.signup-subtitle': 'Comece a gerar documentos com IA',
    'auth.full-name': 'Nome Completo',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.login-button': 'Entrar',
    'auth.signup-button': 'Criar Conta',
    'auth.no-account': 'Não tem conta? Criar conta',
    'auth.has-account': 'Já tem conta? Entrar',
    'auth.terms': 'Ao continuar, você concorda com nossos',
    'auth.terms-link': 'Termos de Uso e Política de Privacidade',
    'auth.back': 'Voltar',
    'auth.processing': 'Processando...',
    'auth.login-required': 'Faça login para acessar seus documentos e criar novos laudos, receitas e relatórios',
    'auth.create-or-login': 'Criar Conta ou Entrar',
    
    // Reports
    'reports.title': 'Laudos Médicos',
    'reports.subtitle': 'Gere laudos completos com IA em segundos',
    'reports.new': 'Novo Laudo',
    'reports.your-reports': 'Seus Laudos',
    'reports.xray-chest': 'Raio-X Tórax',
    'reports.ultrasound': 'Ultrassom Abdominal',
    'reports.mri': 'Ressonância Magnética',
    'reports.ct': 'Tomografia',
    'reports.echo': 'Ecocardiograma',
    'reports.mammography': 'Mamografia',
    'reports.fill-quiz': 'Preencha o quiz e gere automaticamente',
    
    // Prescriptions
    'prescriptions.title': 'Receitas Médicas',
    'prescriptions.subtitle': 'Prescrições digitais com validação automática',
    'prescriptions.new': 'Nova Receita',
    'prescriptions.your-prescriptions': 'Suas Receitas',
    'prescriptions.simple': 'Receita Simples',
    'prescriptions.controlled': 'Receita Controlada',
    'prescriptions.special': 'Receita Especial',
    'prescriptions.antimicrobial': 'Receita Antimicrobiana',
    'prescriptions.according-law': 'Conforme legislação vigente',
    
    // Medical Reports
    'medical-reports.title': 'Relatórios Médicos',
    'medical-reports.subtitle': 'Documentação completa e detalhada',
    'medical-reports.new': 'Novo Relatório',
    'medical-reports.your-reports': 'Seus Relatórios',
    'medical-reports.evolution': 'Evolução Clínica',
    'medical-reports.discharge': 'Alta Hospitalar',
    'medical-reports.certificate': 'Atestado Médico',
    'medical-reports.surgical': 'Relatório Cirúrgico',
    'medical-reports.technical': 'Parecer Técnico',
    'medical-reports.summary': 'Sumário de Internação',
    'medical-reports.intelligent-generation': 'Geração inteligente com IA',
    
    // Forms
    'form.patient-name': 'Nome do Paciente',
    'form.age': 'Idade',
    'form.sex': 'Sexo',
    'form.male': 'M',
    'form.female': 'F',
    'form.chief-complaint': 'Queixa Principal',
    'form.medical-history': 'Histórico Clínico',
    'form.exam': 'Exame Realizado',
    'form.observations': 'Observações Adicionais',
    'form.diagnosis': 'Diagnóstico',
    'form.medications': 'Medicamentos',
    'form.dosage': 'Posologia',
    'form.duration': 'Duração do Tratamento',
    'form.admission-reason': 'Motivo da Internação',
    'form.clinical-evolution': 'Evolução Clínica',
    'form.procedures': 'Procedimentos Realizados',
    'form.discharge-condition': 'Condição na Alta',
    'form.recommendations': 'Recomendações',
    'form.cancel': 'Cancelar',
    'form.generate': 'Gerar com IA',
    'form.generating': 'Gerando...',
    'form.required': 'Preencha todos os campos obrigatórios',
    'form.success': 'Gerado com sucesso!',
    'form.error': 'Erro ao gerar. Tente novamente.',
    'form.fill-info': 'Preencha as informações',
    
    // Document View
    'document.patient': 'Paciente',
    'document.close': 'Fechar',
    'document.copy': 'Copiar Conteúdo',
    'document.copied': 'Conteúdo copiado para a área de transferência!',
    
    // Settings
    'settings.title': 'Configurações de Idioma',
    'settings.subtitle': 'Escolha seu idioma preferido',
    'settings.current': 'Idioma Atual',
    'settings.select': 'Selecionar Idioma',
    'settings.save': 'Salvar Alterações',
    'settings.saved': 'Idioma salvo com sucesso!',
    'settings.description': 'A interface será exibida no idioma selecionado',
    
    // Languages
    'lang.en': 'Inglês',
    'lang.pt-BR': 'Português (Brasil)',
    'lang.pt-PT': 'Português (Portugal)',
    'lang.de': 'Alemão',
    'lang.es': 'Espanhol',
    
    // Welcome Messages
    'welcome.title': 'Bem-vindo ao Medfy!',
    'welcome.subtitle': 'Sua plataforma inteligente para documentos médicos',
    'welcome.instruction-1': 'Selecione seu idioma preferido nas configurações',
    'welcome.instruction-2': 'Crie laudos, receitas e relatórios com IA',
    'welcome.instruction-3': 'Acesse seus documentos a qualquer hora, em qualquer lugar',
    'welcome.get-started': 'Começar',
    
    // Time
    'time.min-ago': 'min atrás',
    'time.hour-ago': 'hora atrás',
    'time.hours-ago': 'horas atrás',
    'time.day-ago': 'dia atrás',
    'time.days-ago': 'dias atrás',
  },
  
  'pt-PT': {
    // Header
    'app.name': 'Medfy',
    'search.placeholder': 'Pesquisar paciente, documento...',
    'auth.login': 'Entrar',
    'auth.logout': 'Sair',
    
    // Navigation
    'nav.dashboard': 'Painel',
    'nav.reports': 'Laudos',
    'nav.prescriptions': 'Receitas',
    'nav.medical-reports': 'Relatórios',
    'nav.settings': 'Definições',
    
    // Dashboard
    'dashboard.title': 'Painel',
    'dashboard.welcome': 'Bem-vindo de volta',
    'stats.documents': 'Documentos Gerados',
    'stats.reports': 'Laudos Este Mês',
    'stats.prescriptions': 'Receitas Emitidas',
    'stats.medical-reports': 'Relatórios',
    'quick.actions': 'Acções Rápidas',
    'quick.new-report': 'Novo Laudo',
    'quick.new-prescription': 'Nova Receita',
    'quick.new-medical-report': 'Novo Relatório',
    'quick.with-ai': 'Com IA em segundos',
    'recent.activity': 'Actividade Recente',
    'recent.view-all': 'Ver todos',
    'recent.no-documents': 'Nenhum documento criado ainda. Use as acções rápidas acima!',
    
    // Auth
    'auth.welcome-back': 'Bem-vindo de volta',
    'auth.create-account': 'Criar conta',
    'auth.login-subtitle': 'Entre para aceder aos seus documentos',
    'auth.signup-subtitle': 'Comece a gerar documentos com IA',
    'auth.full-name': 'Nome Completo',
    'auth.email': 'Email',
    'auth.password': 'Palavra-passe',
    'auth.login-button': 'Entrar',
    'auth.signup-button': 'Criar Conta',
    'auth.no-account': 'Não tem conta? Criar conta',
    'auth.has-account': 'Já tem conta? Entrar',
    'auth.terms': 'Ao continuar, concorda com os nossos',
    'auth.terms-link': 'Termos de Uso e Política de Privacidade',
    'auth.back': 'Voltar',
    'auth.processing': 'A processar...',
    'auth.login-required': 'Faça login para aceder aos seus documentos e criar novos laudos, receitas e relatórios',
    'auth.create-or-login': 'Criar Conta ou Entrar',
    
    // Reports
    'reports.title': 'Laudos Médicos',
    'reports.subtitle': 'Gere laudos completos com IA em segundos',
    'reports.new': 'Novo Laudo',
    'reports.your-reports': 'Os Seus Laudos',
    'reports.xray-chest': 'Raio-X Tórax',
    'reports.ultrasound': 'Ecografia Abdominal',
    'reports.mri': 'Ressonância Magnética',
    'reports.ct': 'Tomografia',
    'reports.echo': 'Ecocardiograma',
    'reports.mammography': 'Mamografia',
    'reports.fill-quiz': 'Preencha o questionário e gere automaticamente',
    
    // Prescriptions
    'prescriptions.title': 'Receitas Médicas',
    'prescriptions.subtitle': 'Prescrições digitais com validação automática',
    'prescriptions.new': 'Nova Receita',
    'prescriptions.your-prescriptions': 'As Suas Receitas',
    'prescriptions.simple': 'Receita Simples',
    'prescriptions.controlled': 'Receita Controlada',
    'prescriptions.special': 'Receita Especial',
    'prescriptions.antimicrobial': 'Receita Antimicrobiana',
    'prescriptions.according-law': 'Conforme legislação vigente',
    
    // Medical Reports
    'medical-reports.title': 'Relatórios Médicos',
    'medical-reports.subtitle': 'Documentação completa e detalhada',
    'medical-reports.new': 'Novo Relatório',
    'medical-reports.your-reports': 'Os Seus Relatórios',
    'medical-reports.evolution': 'Evolução Clínica',
    'medical-reports.discharge': 'Alta Hospitalar',
    'medical-reports.certificate': 'Atestado Médico',
    'medical-reports.surgical': 'Relatório Cirúrgico',
    'medical-reports.technical': 'Parecer Técnico',
    'medical-reports.summary': 'Sumário de Internamento',
    'medical-reports.intelligent-generation': 'Geração inteligente com IA',
    
    // Forms
    'form.patient-name': 'Nome do Paciente',
    'form.age': 'Idade',
    'form.sex': 'Sexo',
    'form.male': 'M',
    'form.female': 'F',
    'form.chief-complaint': 'Queixa Principal',
    'form.medical-history': 'Histórico Clínico',
    'form.exam': 'Exame Realizado',
    'form.observations': 'Observações Adicionais',
    'form.diagnosis': 'Diagnóstico',
    'form.medications': 'Medicamentos',
    'form.dosage': 'Posologia',
    'form.duration': 'Duração do Tratamento',
    'form.admission-reason': 'Motivo do Internamento',
    'form.clinical-evolution': 'Evolução Clínica',
    'form.procedures': 'Procedimentos Realizados',
    'form.discharge-condition': 'Condição na Alta',
    'form.recommendations': 'Recomendações',
    'form.cancel': 'Cancelar',
    'form.generate': 'Gerar com IA',
    'form.generating': 'A gerar...',
    'form.required': 'Preencha todos os campos obrigatórios',
    'form.success': 'Gerado com sucesso!',
    'form.error': 'Erro ao gerar. Tente novamente.',
    'form.fill-info': 'Preencha as informações',
    
    // Document View
    'document.patient': 'Paciente',
    'document.close': 'Fechar',
    'document.copy': 'Copiar Conteúdo',
    'document.copied': 'Conteúdo copiado para a área de transferência!',
    
    // Settings
    'settings.title': 'Definições de Idioma',
    'settings.subtitle': 'Escolha o seu idioma preferido',
    'settings.current': 'Idioma Actual',
    'settings.select': 'Seleccionar Idioma',
    'settings.save': 'Guardar Alterações',
    'settings.saved': 'Idioma guardado com sucesso!',
    'settings.description': 'A interface será exibida no idioma seleccionado',
    
    // Languages
    'lang.en': 'Inglês',
    'lang.pt-BR': 'Português (Brasil)',
    'lang.pt-PT': 'Português (Portugal)',
    'lang.de': 'Alemão',
    'lang.es': 'Espanhol',
    
    // Welcome Messages
    'welcome.title': 'Bem-vindo ao Medfy!',
    'welcome.subtitle': 'A sua plataforma inteligente para documentos médicos',
    'welcome.instruction-1': 'Seleccione o seu idioma preferido nas definições',
    'welcome.instruction-2': 'Crie laudos, receitas e relatórios com IA',
    'welcome.instruction-3': 'Aceda aos seus documentos a qualquer hora, em qualquer lugar',
    'welcome.get-started': 'Começar',
    
    // Time
    'time.min-ago': 'min atrás',
    'time.hour-ago': 'hora atrás',
    'time.hours-ago': 'horas atrás',
    'time.day-ago': 'dia atrás',
    'time.days-ago': 'dias atrás',
  },
  
  'de': {
    // Header
    'app.name': 'Medfy',
    'search.placeholder': 'Patient, Dokument suchen...',
    'auth.login': 'Anmelden',
    'auth.logout': 'Abmelden',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Befunde',
    'nav.prescriptions': 'Rezepte',
    'nav.medical-reports': 'Berichte',
    'nav.settings': 'Einstellungen',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Willkommen zurück',
    'stats.documents': 'Erstellte Dokumente',
    'stats.reports': 'Befunde Diesen Monat',
    'stats.prescriptions': 'Ausgestellte Rezepte',
    'stats.medical-reports': 'Berichte',
    'quick.actions': 'Schnellaktionen',
    'quick.new-report': 'Neuer Befund',
    'quick.new-prescription': 'Neues Rezept',
    'quick.new-medical-report': 'Neuer Bericht',
    'quick.with-ai': 'Mit KI in Sekunden',
    'recent.activity': 'Letzte Aktivität',
    'recent.view-all': 'Alle anzeigen',
    'recent.no-documents': 'Noch keine Dokumente erstellt. Verwenden Sie die Schnellaktionen oben!',
    
    // Auth
    'auth.welcome-back': 'Willkommen zurück',
    'auth.create-account': 'Konto erstellen',
    'auth.login-subtitle': 'Melden Sie sich an, um auf Ihre Dokumente zuzugreifen',
    'auth.signup-subtitle': 'Beginnen Sie mit der Erstellung von Dokumenten mit KI',
    'auth.full-name': 'Vollständiger Name',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.login-button': 'Anmelden',
    'auth.signup-button': 'Konto Erstellen',
    'auth.no-account': 'Kein Konto? Konto erstellen',
    'auth.has-account': 'Bereits ein Konto? Anmelden',
    'auth.terms': 'Durch Fortfahren stimmen Sie unseren',
    'auth.terms-link': 'Nutzungsbedingungen und Datenschutzrichtlinien zu',
    'auth.back': 'Zurück',
    'auth.processing': 'Verarbeitung...',
    'auth.login-required': 'Melden Sie sich an, um auf Ihre Dokumente zuzugreifen und neue Befunde, Rezepte und Berichte zu erstellen',
    'auth.create-or-login': 'Konto Erstellen oder Anmelden',
    
    // Reports
    'reports.title': 'Medizinische Befunde',
    'reports.subtitle': 'Erstellen Sie vollständige Befunde mit KI in Sekunden',
    'reports.new': 'Neuer Befund',
    'reports.your-reports': 'Ihre Befunde',
    'reports.xray-chest': 'Röntgen Thorax',
    'reports.ultrasound': 'Abdomen-Ultraschall',
    'reports.mri': 'MRT',
    'reports.ct': 'CT',
    'reports.echo': 'Echokardiogramm',
    'reports.mammography': 'Mammographie',
    'reports.fill-quiz': 'Füllen Sie das Quiz aus und generieren Sie automatisch',
    
    // Prescriptions
    'prescriptions.title': 'Medizinische Rezepte',
    'prescriptions.subtitle': 'Digitale Rezepte mit automatischer Validierung',
    'prescriptions.new': 'Neues Rezept',
    'prescriptions.your-prescriptions': 'Ihre Rezepte',
    'prescriptions.simple': 'Einfaches Rezept',
    'prescriptions.controlled': 'Kontrolliertes Rezept',
    'prescriptions.special': 'Spezialrezept',
    'prescriptions.antimicrobial': 'Antimikrobielles Rezept',
    'prescriptions.according-law': 'Gemäß geltender Gesetzgebung',
    
    // Medical Reports
    'medical-reports.title': 'Medizinische Berichte',
    'medical-reports.subtitle': 'Vollständige und detaillierte Dokumentation',
    'medical-reports.new': 'Neuer Bericht',
    'medical-reports.your-reports': 'Ihre Berichte',
    'medical-reports.evolution': 'Klinische Entwicklung',
    'medical-reports.discharge': 'Entlassungsbericht',
    'medical-reports.certificate': 'Ärztliches Attest',
    'medical-reports.surgical': 'OP-Bericht',
    'medical-reports.technical': 'Fachgutachten',
    'medical-reports.summary': 'Aufenthaltszusammenfassung',
    'medical-reports.intelligent-generation': 'Intelligente Generierung mit KI',
    
    // Forms
    'form.patient-name': 'Patientenname',
    'form.age': 'Alter',
    'form.sex': 'Geschlecht',
    'form.male': 'M',
    'form.female': 'W',
    'form.chief-complaint': 'Hauptbeschwerde',
    'form.medical-history': 'Krankengeschichte',
    'form.exam': 'Durchgeführte Untersuchung',
    'form.observations': 'Zusätzliche Beobachtungen',
    'form.diagnosis': 'Diagnose',
    'form.medications': 'Medikamente',
    'form.dosage': 'Dosierung',
    'form.duration': 'Behandlungsdauer',
    'form.admission-reason': 'Aufnahmegrund',
    'form.clinical-evolution': 'Klinische Entwicklung',
    'form.procedures': 'Durchgeführte Verfahren',
    'form.discharge-condition': 'Entlassungszustand',
    'form.recommendations': 'Empfehlungen',
    'form.cancel': 'Abbrechen',
    'form.generate': 'Mit KI Generieren',
    'form.generating': 'Generierung...',
    'form.required': 'Füllen Sie alle erforderlichen Felder aus',
    'form.success': 'Erfolgreich generiert!',
    'form.error': 'Fehler beim Generieren. Versuchen Sie es erneut.',
    'form.fill-info': 'Informationen ausfüllen',
    
    // Document View
    'document.patient': 'Patient',
    'document.close': 'Schließen',
    'document.copy': 'Inhalt Kopieren',
    'document.copied': 'Inhalt in Zwischenablage kopiert!',
    
    // Settings
    'settings.title': 'Spracheinstellungen',
    'settings.subtitle': 'Wählen Sie Ihre bevorzugte Sprache',
    'settings.current': 'Aktuelle Sprache',
    'settings.select': 'Sprache Auswählen',
    'settings.save': 'Änderungen Speichern',
    'settings.saved': 'Sprache erfolgreich gespeichert!',
    'settings.description': 'Die Benutzeroberfläche wird in der ausgewählten Sprache angezeigt',
    
    // Languages
    'lang.en': 'Englisch',
    'lang.pt-BR': 'Portugiesisch (Brasilien)',
    'lang.pt-PT': 'Portugiesisch (Portugal)',
    'lang.de': 'Deutsch',
    'lang.es': 'Spanisch',
    
    // Welcome Messages
    'welcome.title': 'Willkommen bei Medfy!',
    'welcome.subtitle': 'Ihre intelligente Plattform für medizinische Dokumente',
    'welcome.instruction-1': 'Wählen Sie Ihre bevorzugte Sprache in den Einstellungen',
    'welcome.instruction-2': 'Erstellen Sie Befunde, Rezepte und Berichte mit KI',
    'welcome.instruction-3': 'Greifen Sie jederzeit und überall auf Ihre Dokumente zu',
    'welcome.get-started': 'Loslegen',
    
    // Time
    'time.min-ago': 'Min. her',
    'time.hour-ago': 'Std. her',
    'time.hours-ago': 'Std. her',
    'time.day-ago': 'Tag her',
    'time.days-ago': 'Tage her',
  },
  
  'es': {
    // Header
    'app.name': 'Medfy',
    'search.placeholder': 'Buscar paciente, documento...',
    'auth.login': 'Iniciar sesión',
    'auth.logout': 'Cerrar sesión',
    
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.reports': 'Informes',
    'nav.prescriptions': 'Recetas',
    'nav.medical-reports': 'Reportes',
    'nav.settings': 'Configuración',
    
    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.welcome': 'Bienvenido de nuevo',
    'stats.documents': 'Documentos Generados',
    'stats.reports': 'Informes Este Mes',
    'stats.prescriptions': 'Recetas Emitidas',
    'stats.medical-reports': 'Reportes',
    'quick.actions': 'Acciones Rápidas',
    'quick.new-report': 'Nuevo Informe',
    'quick.new-prescription': 'Nueva Receta',
    'quick.new-medical-report': 'Nuevo Reporte',
    'quick.with-ai': 'Con IA en segundos',
    'recent.activity': 'Actividad Reciente',
    'recent.view-all': 'Ver todos',
    'recent.no-documents': '¡Aún no se han creado documentos. Use las acciones rápidas arriba!',
    
    // Auth
    'auth.welcome-back': 'Bienvenido de nuevo',
    'auth.create-account': 'Crear cuenta',
    'auth.login-subtitle': 'Inicie sesión para acceder a sus documentos',
    'auth.signup-subtitle': 'Comience a generar documentos con IA',
    'auth.full-name': 'Nombre Completo',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.login-button': 'Iniciar Sesión',
    'auth.signup-button': 'Crear Cuenta',
    'auth.no-account': '¿No tiene cuenta? Crear cuenta',
    'auth.has-account': '¿Ya tiene cuenta? Iniciar sesión',
    'auth.terms': 'Al continuar, acepta nuestros',
    'auth.terms-link': 'Términos de Uso y Política de Privacidad',
    'auth.back': 'Volver',
    'auth.processing': 'Procesando...',
    'auth.login-required': 'Inicie sesión para acceder a sus documentos y crear nuevos informes, recetas y reportes',
    'auth.create-or-login': 'Crear Cuenta o Iniciar Sesión',
    
    // Reports
    'reports.title': 'Informes Médicos',
    'reports.subtitle': 'Genere informes completos con IA en segundos',
    'reports.new': 'Nuevo Informe',
    'reports.your-reports': 'Sus Informes',
    'reports.xray-chest': 'Radiografía de Tórax',
    'reports.ultrasound': 'Ecografía Abdominal',
    'reports.mri': 'Resonancia Magnética',
    'reports.ct': 'Tomografía',
    'reports.echo': 'Ecocardiograma',
    'reports.mammography': 'Mamografía',
    'reports.fill-quiz': 'Complete el cuestionario y genere automáticamente',
    
    // Prescriptions
    'prescriptions.title': 'Recetas Médicas',
    'prescriptions.subtitle': 'Prescripciones digitales con validación automática',
    'prescriptions.new': 'Nueva Receta',
    'prescriptions.your-prescriptions': 'Sus Recetas',
    'prescriptions.simple': 'Receta Simple',
    'prescriptions.controlled': 'Receta Controlada',
    'prescriptions.special': 'Receta Especial',
    'prescriptions.antimicrobial': 'Receta Antimicrobiana',
    'prescriptions.according-law': 'Conforme a la legislación vigente',
    
    // Medical Reports
    'medical-reports.title': 'Reportes Médicos',
    'medical-reports.subtitle': 'Documentación completa y detallada',
    'medical-reports.new': 'Nuevo Reporte',
    'medical-reports.your-reports': 'Sus Reportes',
    'medical-reports.evolution': 'Evolución Clínica',
    'medical-reports.discharge': 'Alta Hospitalaria',
    'medical-reports.certificate': 'Certificado Médico',
    'medical-reports.surgical': 'Reporte Quirúrgico',
    'medical-reports.technical': 'Dictamen Técnico',
    'medical-reports.summary': 'Resumen de Hospitalización',
    'medical-reports.intelligent-generation': 'Generación inteligente con IA',
    
    // Forms
    'form.patient-name': 'Nombre del Paciente',
    'form.age': 'Edad',
    'form.sex': 'Sexo',
    'form.male': 'M',
    'form.female': 'F',
    'form.chief-complaint': 'Queja Principal',
    'form.medical-history': 'Historia Clínica',
    'form.exam': 'Examen Realizado',
    'form.observations': 'Observaciones Adicionales',
    'form.diagnosis': 'Diagnóstico',
    'form.medications': 'Medicamentos',
    'form.dosage': 'Posología',
    'form.duration': 'Duración del Tratamiento',
    'form.admission-reason': 'Motivo de Ingreso',
    'form.clinical-evolution': 'Evolución Clínica',
    'form.procedures': 'Procedimientos Realizados',
    'form.discharge-condition': 'Condición al Alta',
    'form.recommendations': 'Recomendaciones',
    'form.cancel': 'Cancelar',
    'form.generate': 'Generar con IA',
    'form.generating': 'Generando...',
    'form.required': 'Complete todos los campos obligatorios',
    'form.success': '¡Generado con éxito!',
    'form.error': 'Error al generar. Inténtelo de nuevo.',
    'form.fill-info': 'Complete la información',
    
    // Document View
    'document.patient': 'Paciente',
    'document.close': 'Cerrar',
    'document.copy': 'Copiar Contenido',
    'document.copied': '¡Contenido copiado al portapapeles!',
    
    // Settings
    'settings.title': 'Configuración de Idioma',
    'settings.subtitle': 'Elija su idioma preferido',
    'settings.current': 'Idioma Actual',
    'settings.select': 'Seleccionar Idioma',
    'settings.save': 'Guardar Cambios',
    'settings.saved': '¡Idioma guardado con éxito!',
    'settings.description': 'La interfaz se mostrará en el idioma seleccionado',
    
    // Languages
    'lang.en': 'Inglés',
    'lang.pt-BR': 'Portugués (Brasil)',
    'lang.pt-PT': 'Portugués (Portugal)',
    'lang.de': 'Alemán',
    'lang.es': 'Español',
    
    // Welcome Messages
    'welcome.title': '¡Bienvenido a Medfy!',
    'welcome.subtitle': 'Su plataforma inteligente para documentos médicos',
    'welcome.instruction-1': 'Seleccione su idioma preferido en la configuración',
    'welcome.instruction-2': 'Cree informes, recetas y reportes con IA',
    'welcome.instruction-3': 'Acceda a sus documentos en cualquier momento, en cualquier lugar',
    'welcome.get-started': 'Comenzar',
    
    // Time
    'time.min-ago': 'min atrás',
    'time.hour-ago': 'hora atrás',
    'time.hours-ago': 'horas atrás',
    'time.day-ago': 'día atrás',
    'time.days-ago': 'días atrás',
  },
};
