"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { 
  FileText, 
  Pill, 
  FileBarChart, 
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Bell,
  User,
  ChevronRight,
  LogOut,
  X,
  Loader2,
  Eye,
  Settings
} from "lucide-react";
import { supabase, type Document } from "@/lib/supabase";
import { generateLaudo, generateReceita, generateRelatorio } from "@/lib/openai";
import SupportChat from "@/components/custom/SupportChat";

type TabType = "dashboard" | "laudos" | "receitas" | "relatorios";
type ModalType = "laudo" | "receita" | "relatorio" | null;

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [modalSubtype, setModalSubtype] = useState("");
  const [generating, setGenerating] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  // Estados dos formulários
  const [laudoForm, setLaudoForm] = useState({
    paciente: "",
    idade: "",
    sexo: "M",
    queixaPrincipal: "",
    historico: "",
    exame: "",
    observacoes: ""
  });

  const [receitaForm, setReceitaForm] = useState({
    paciente: "",
    idade: "",
    sexo: "M",
    diagnostico: "",
    medicamentos: "",
    posologia: "",
    duracao: "",
    observacoes: ""
  });

  const [relatorioForm, setRelatorioForm] = useState({
    paciente: "",
    idade: "",
    sexo: "M",
    motivoInternacao: "",
    evolucao: "",
    procedimentos: "",
    condicaoAlta: "",
    recomendacoes: "",
    observacoes: ""
  });

  // Carregar usuário e documentos
  useEffect(() => {
    if (supabase) {
      checkUser();
      loadDocuments();

      // Listener para mudanças de autenticação
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadDocuments();
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const checkUser = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadDocuments = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDocuments([]);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar documentos:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao carregar documentos';
      console.error('Detalhes do erro:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setDocuments([]);
  };

  const handleAuthClick = () => {
    router.push('/auth');
  };

  const openModal = (type: ModalType, subtype: string) => {
    if (!user) {
      alert(t('form.required'));
      return;
    }
    setModalOpen(type);
    setModalSubtype(subtype);
    // Resetar formulários
    setLaudoForm({
      paciente: "",
      idade: "",
      sexo: "M",
      queixaPrincipal: "",
      historico: "",
      exame: "",
      observacoes: ""
    });
    setReceitaForm({
      paciente: "",
      idade: "",
      sexo: "M",
      diagnostico: "",
      medicamentos: "",
      posologia: "",
      duracao: "",
      observacoes: ""
    });
    setRelatorioForm({
      paciente: "",
      idade: "",
      sexo: "M",
      motivoInternacao: "",
      evolucao: "",
      procedimentos: "",
      condicaoAlta: "",
      recomendacoes: "",
      observacoes: ""
    });
  };

  const closeModal = () => {
    setModalOpen(null);
    setModalSubtype("");
    setGenerating(false);
  };

  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc);
  };

  const closeViewModal = () => {
    setViewingDocument(null);
  };

  const handleGenerateLaudo = async () => {
    if (!user || !laudoForm.paciente || !laudoForm.idade || !laudoForm.queixaPrincipal) {
      alert(t('form.required'));
      return;
    }

    if (!supabase) {
      alert('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

    try {
      setGenerating(true);
      
      // Gerar conteúdo com IA
      const content = await generateLaudo({
        tipo: modalSubtype,
        ...laudoForm
      });

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: 'laudo',
          subtype: modalSubtype,
          patient_name: laudoForm.paciente,
          patient_age: parseInt(laudoForm.idade),
          patient_sex: laudoForm.sexo,
          content,
          metadata: {
            queixaPrincipal: laudoForm.queixaPrincipal,
            historico: laudoForm.historico,
            exame: laudoForm.exame,
            observacoes: laudoForm.observacoes
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Recarregar documentos
      await loadDocuments();
      closeModal();
      alert(t('form.success'));
    } catch (error: any) {
      console.error('Erro ao gerar laudo:', error);
      if (error.message?.includes('API key')) {
        alert('Configure sua API Key da OpenAI nas variáveis de ambiente (OPENAI_API_KEY)');
      } else {
        alert(t('form.error'));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateReceita = async () => {
    if (!user || !receitaForm.paciente || !receitaForm.idade || !receitaForm.diagnostico || !receitaForm.medicamentos) {
      alert(t('form.required'));
      return;
    }

    if (!supabase) {
      alert('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

    try {
      setGenerating(true);
      
      // Gerar conteúdo com IA
      const content = await generateReceita({
        tipo: modalSubtype,
        ...receitaForm
      });

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: 'receita',
          subtype: modalSubtype,
          patient_name: receitaForm.paciente,
          patient_age: parseInt(receitaForm.idade),
          patient_sex: receitaForm.sexo,
          content,
          metadata: {
            diagnostico: receitaForm.diagnostico,
            medicamentos: receitaForm.medicamentos,
            posologia: receitaForm.posologia,
            duracao: receitaForm.duracao,
            observacoes: receitaForm.observacoes
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Recarregar documentos
      await loadDocuments();
      closeModal();
      alert(t('form.success'));
    } catch (error: any) {
      console.error('Erro ao gerar receita:', error);
      if (error.message?.includes('API key')) {
        alert('Configure sua API Key da OpenAI nas variáveis de ambiente (OPENAI_API_KEY)');
      } else {
        alert(t('form.error'));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateRelatorio = async () => {
    if (!user || !relatorioForm.paciente || !relatorioForm.idade || !relatorioForm.evolucao || !relatorioForm.procedimentos) {
      alert(t('form.required'));
      return;
    }

    if (!supabase) {
      alert('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

    try {
      setGenerating(true);
      
      // Gerar conteúdo com IA
      const content = await generateRelatorio({
        tipo: modalSubtype,
        ...relatorioForm
      });

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: 'relatorio',
          subtype: modalSubtype,
          patient_name: relatorioForm.paciente,
          patient_age: parseInt(relatorioForm.idade),
          patient_sex: relatorioForm.sexo,
          content,
          metadata: {
            motivoInternacao: relatorioForm.motivoInternacao,
            evolucao: relatorioForm.evolucao,
            procedimentos: relatorioForm.procedimentos,
            condicaoAlta: relatorioForm.condicaoAlta,
            recomendacoes: relatorioForm.recomendacoes,
            observacoes: relatorioForm.observacoes
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Recarregar documentos
      await loadDocuments();
      closeModal();
      alert(t('form.success'));
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      if (error.message?.includes('API key')) {
        alert('Configure sua API Key da OpenAI nas variáveis de ambiente (OPENAI_API_KEY)');
      } else {
        alert(t('form.error'));
      }
    } finally {
      setGenerating(false);
    }
  };

  // Calcular estatísticas baseadas nos documentos reais
  const stats: StatCard[] = [
    {
      title: t('stats.documents'),
      value: documents.length.toString(),
      change: "+12.5%",
      icon: <FileText className="w-5 h-5" />,
      trend: "up"
    },
    {
      title: t('stats.reports'),
      value: documents.filter(d => d.type === 'laudo').length.toString(),
      change: "+8.2%",
      icon: <FileBarChart className="w-5 h-5" />,
      trend: "up"
    },
    {
      title: t('stats.prescriptions'),
      value: documents.filter(d => d.type === 'receita').length.toString(),
      change: "+15.3%",
      icon: <Pill className="w-5 h-5" />,
      trend: "up"
    },
    {
      title: t('stats.medical-reports'),
      value: documents.filter(d => d.type === 'relatorio').length.toString(),
      change: "-18.4%",
      icon: <Clock className="w-5 h-5" />,
      trend: "down"
    }
  ];

  // Documentos recentes (últimos 4)
  const recentItems = documents.slice(0, 4).map(doc => ({
    id: doc.id,
    type: doc.type === 'laudo' ? t('nav.reports') : doc.type === 'receita' ? t('nav.prescriptions') : t('nav.medical-reports'),
    patient: doc.patient_name,
    date: formatDate(doc.created_at),
    status: "completed" as "completed" | "pending",
    document: doc
  }));

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${t('time.min-ago')}`;
    if (diffHours === 1) return `1 ${t('time.hour-ago')}`;
    if (diffHours < 24) return `${diffHours} ${t('time.hours-ago')}`;
    if (diffDays === 1) return `1 ${t('time.day-ago')}`;
    if (diffDays < 7) return `${diffDays} ${t('time.days-ago')}`;
    return date.toLocaleDateString('pt-BR');
  }

  const quickActions = [
    { 
      icon: <FileText className="w-6 h-6" />, 
      label: t('quick.new-report'), 
      color: "from-[#FF6F00] to-[#FFD600]",
      onClick: () => openModal('laudo', t('reports.xray-chest'))
    },
    { 
      icon: <Pill className="w-6 h-6" />, 
      label: t('quick.new-prescription'), 
      color: "from-[#FFD600] to-[#FF6F00]",
      onClick: () => openModal('receita', t('prescriptions.simple'))
    },
    { 
      icon: <FileBarChart className="w-6 h-6" />, 
      label: t('quick.new-medical-report'), 
      color: "from-[#FF6F00] to-[#FFD600]",
      onClick: () => openModal('relatorio', t('medical-reports.evolution'))
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-[#0D0D0D]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FFD600] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#0D0D0D]" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6F00] to-[#FFD600] bg-clip-text text-transparent">
                {t('app.name')}
              </h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                title={t('nav.settings')}
              >
                <Settings className="w-5 h-5 text-white/70" />
              </button>
              <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <Bell className="w-5 h-5 text-white/70" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6F00] rounded-full"></span>
              </button>
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                    <User className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    title={t('auth.logout')}
                  >
                    <LogOut className="w-5 h-5 text-white/70" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleAuthClick}
                  className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FFD600] hover:opacity-90 transition-all text-sm font-semibold text-[#0D0D0D]"
                >
                  {t('auth.login')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-white/5 bg-[#0D0D0D]/50 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: "dashboard", label: t('nav.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: "laudos", label: t('nav.reports'), icon: <FileText className="w-4 h-4" /> },
              { id: "receitas", label: t('nav.prescriptions'), icon: <Pill className="w-4 h-4" /> },
              { id: "relatorios", label: t('nav.medical-reports'), icon: <FileBarChart className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#FF6F00] border-b-2 border-[#FF6F00]"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!supabase && (
          <div className="mb-8 bg-gradient-to-r from-[#FF6F00]/10 to-[#FFD600]/10 border border-[#FF6F00]/20 rounded-2xl p-6 text-center">
            <p className="text-white/80 mb-4">
              Configure as variáveis de ambiente do Supabase para usar todas as funcionalidades.
            </p>
            <p className="text-white/60 text-sm">
              Clique no banner laranja acima para configurar.
            </p>
          </div>
        )}

        {!user && supabase && (
          <div className="mb-8 bg-gradient-to-r from-[#FF6F00]/10 to-[#FFD600]/10 border border-[#FF6F00]/20 rounded-2xl p-6 text-center">
            <p className="text-white/80 mb-4">
              {t('auth.login-required')}
            </p>
            <button 
              onClick={handleAuthClick}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6F00] to-[#FFD600] font-semibold text-[#0D0D0D] hover:opacity-90 transition-all"
            >
              {t('auth.create-or-login')}
            </button>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-[#FF6F00]/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20 text-[#FF6F00]">
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === "up" ? "text-green-400" : "text-[#FFD600]"
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-white/60 text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6F00]" />
                {t('quick.actions')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={!user || !supabase}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6F00]/50 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] text-left overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-[#0D0D0D]`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{action.label}</p>
                        <p className="text-xs text-white/50 mt-1">{t('quick.with-ai')}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#FF6F00] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#FF6F00]" />
                  {t('recent.activity')}
                </h2>
                <button className="text-sm text-[#FF6F00] hover:text-[#FFD600] transition-colors">
                  {t('recent.view-all')}
                </button>
              </div>
              {loading ? (
                <div className="text-center py-8 text-white/50">{t('form.generating')}...</div>
              ) : recentItems.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  {t('recent.no-documents')}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleViewDocument(item.document)}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          item.status === "completed" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-[#FFD600]/20 text-[#FFD600]"
                        }`}>
                          {item.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.type}</p>
                          <p className="text-sm text-white/50">{item.patient}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/40">{item.date}</span>
                        <Eye className="w-4 h-4 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "laudos" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{t('reports.title')}</h2>
                <p className="text-white/60">{t('reports.subtitle')}</p>
              </div>
              <button 
                onClick={() => openModal('laudo', t('reports.xray-chest'))}
                disabled={!user || !supabase}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {t('reports.new')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'reports.xray-chest', value: t('reports.xray-chest') },
                { key: 'reports.ultrasound', value: t('reports.ultrasound') },
                { key: 'reports.mri', value: t('reports.mri') },
                { key: 'reports.ct', value: t('reports.ct') },
                { key: 'reports.echo', value: t('reports.echo') },
                { key: 'reports.mammography', value: t('reports.mammography') }
              ].map((type, index) => (
                <button
                  key={index}
                  onClick={() => openModal('laudo', type.value)}
                  disabled={!user || !supabase}
                  className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#FF6F00]/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20">
                      <FileText className="w-6 h-6 text-[#FF6F00]" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{type.value}</h3>
                  <p className="text-sm text-white/50">{t('reports.fill-quiz')}</p>
                </button>
              ))}
            </div>

            {/* Lista de laudos existentes */}
            {documents.filter(d => d.type === 'laudo').length > 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-white mb-4">{t('reports.your-reports')}</h3>
                <div className="space-y-3">
                  {documents.filter(d => d.type === 'laudo').map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleViewDocument(doc)}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{doc.subtype}</p>
                          <p className="text-sm text-white/50">{doc.patient_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{formatDate(doc.created_at)}</span>
                          <Eye className="w-4 h-4 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "receitas" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{t('prescriptions.title')}</h2>
                <p className="text-white/60">{t('prescriptions.subtitle')}</p>
              </div>
              <button 
                onClick={() => openModal('receita', t('prescriptions.simple'))}
                disabled={!user || !supabase}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {t('prescriptions.new')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'prescriptions.simple', value: t('prescriptions.simple') },
                { key: 'prescriptions.controlled', value: t('prescriptions.controlled') },
                { key: 'prescriptions.special', value: t('prescriptions.special') },
                { key: 'prescriptions.antimicrobial', value: t('prescriptions.antimicrobial') }
              ].map((type, index) => (
                <button
                  key={index}
                  onClick={() => openModal('receita', type.value)}
                  disabled={!user || !supabase}
                  className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#FF6F00]/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#FFD600]/20 to-[#FF6F00]/20">
                      <Pill className="w-6 h-6 text-[#FFD600]" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{type.value}</h3>
                  <p className="text-sm text-white/50">{t('prescriptions.according-law')}</p>
                </button>
              ))}
            </div>

            {/* Lista de receitas existentes */}
            {documents.filter(d => d.type === 'receita').length > 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-white mb-4">{t('prescriptions.your-prescriptions')}</h3>
                <div className="space-y-3">
                  {documents.filter(d => d.type === 'receita').map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleViewDocument(doc)}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{doc.subtype}</p>
                          <p className="text-sm text-white/50">{doc.patient_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{formatDate(doc.created_at)}</span>
                          <Eye className="w-4 h-4 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "relatorios" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{t('medical-reports.title')}</h2>
                <p className="text-white/60">{t('medical-reports.subtitle')}</p>
              </div>
              <button 
                onClick={() => openModal('relatorio', t('medical-reports.evolution'))}
                disabled={!user || !supabase}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {t('medical-reports.new')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'medical-reports.evolution', value: t('medical-reports.evolution') },
                { key: 'medical-reports.discharge', value: t('medical-reports.discharge') },
                { key: 'medical-reports.certificate', value: t('medical-reports.certificate') },
                { key: 'medical-reports.surgical', value: t('medical-reports.surgical') },
                { key: 'medical-reports.technical', value: t('medical-reports.technical') },
                { key: 'medical-reports.summary', value: t('medical-reports.summary') }
              ].map((type, index) => (
                <button
                  key={index}
                  onClick={() => openModal('relatorio', type.value)}
                  disabled={!user || !supabase}
                  className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#FF6F00]/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20">
                      <FileBarChart className="w-6 h-6 text-[#FF6F00]" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{type.value}</h3>
                  <p className="text-sm text-white/50">{t('medical-reports.intelligent-generation')}</p>
                </button>
              ))}
            </div>

            {/* Lista de relatórios existentes */}
            {documents.filter(d => d.type === 'relatorio').length > 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-white mb-4">{t('medical-reports.your-reports')}</h3>
                <div className="space-y-3">
                  {documents.filter(d => d.type === 'relatorio').map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleViewDocument(doc)}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{doc.subtype}</p>
                          <p className="text-sm text-white/50">{doc.patient_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{formatDate(doc.created_at)}</span>
                          <Eye className="w-4 h-4 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Visualização de Documento */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{viewingDocument.subtype}</h3>
                <p className="text-white/60 text-sm mt-1">{t('document.patient')}: {viewingDocument.patient_name}</p>
              </div>
              <button onClick={closeViewModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
                    {viewingDocument.content}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0D0D0D] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={closeViewModal}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all"
              >
                {t('document.close')}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingDocument.content);
                  alert(t('document.copied'));
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all"
              >
                {t('document.copy')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Laudo */}
      {modalOpen === 'laudo' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{modalSubtype}</h3>
                <p className="text-white/60 text-sm mt-1">{t('form.fill-info')}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">{t('form.patient-name')} *</label>
                  <input
                    type="text"
                    value={laudoForm.paciente}
                    onChange={(e) => setLaudoForm({...laudoForm, paciente: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">{t('form.age')} *</label>
                    <input
                      type="number"
                      value={laudoForm.idade}
                      onChange={(e) => setLaudoForm({...laudoForm, idade: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">{t('form.sex')} *</label>
                    <select
                      value={laudoForm.sexo}
                      onChange={(e) => setLaudoForm({...laudoForm, sexo: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                    >
                      <option value="M">{t('form.male')}</option>
                      <option value="F">{t('form.female')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.chief-complaint')} *</label>
                <input
                  type="text"
                  value={laudoForm.queixaPrincipal}
                  onChange={(e) => setLaudoForm({...laudoForm, queixaPrincipal: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                  placeholder="Ex: Dor torácica há 3 dias"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.medical-history')}</label>
                <textarea
                  value={laudoForm.historico}
                  onChange={(e) => setLaudoForm({...laudoForm, historico: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[80px]"
                  placeholder="Histórico médico relevante..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.exam')}</label>
                <input
                  type="text"
                  value={laudoForm.exame}
                  onChange={(e) => setLaudoForm({...laudoForm, exame: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                  placeholder="Ex: Raio-X de tórax em PA e perfil"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.observations')}</label>
                <textarea
                  value={laudoForm.observacoes}
                  onChange={(e) => setLaudoForm({...laudoForm, observacoes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[60px]"
                  placeholder="Informações complementares..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0D0D0D] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all"
              >
                {t('form.cancel')}
              </button>
              <button
                onClick={handleGenerateLaudo}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('form.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('form.generate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Receita */}
      {modalOpen === 'receita' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{modalSubtype}</h3>
                <p className="text-white/60 text-sm mt-1">{t('form.fill-info')}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">{t('form.patient-name')} *</label>
                  <input
                    type="text"
                    value={receitaForm.paciente}
                    onChange={(e) => setReceitaForm({...receitaForm, paciente: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">{t('form.age')} *</label>
                    <input
                      type="number"
                      value={receitaForm.idade}
                      onChange={(e) => setReceitaForm({...receitaForm, idade: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">{t('form.sex')} *</label>
                    <select
                      value={receitaForm.sexo}
                      onChange={(e) => setReceitaForm({...receitaForm, sexo: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                    >
                      <option value="M">{t('form.male')}</option>
                      <option value="F">{t('form.female')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.diagnosis')} *</label>
                <input
                  type="text"
                  value={receitaForm.diagnostico}
                  onChange={(e) => setReceitaForm({...receitaForm, diagnostico: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                  placeholder="Ex: Hipertensão arterial sistêmica"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.medications')} *</label>
                <textarea
                  value={receitaForm.medicamentos}
                  onChange={(e) => setReceitaForm({...receitaForm, medicamentos: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[80px]"
                  placeholder="Ex: Losartana 50mg, Hidroclorotiazida 25mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.dosage')}</label>
                <textarea
                  value={receitaForm.posologia}
                  onChange={(e) => setReceitaForm({...receitaForm, posologia: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[60px]"
                  placeholder="Ex: 1 comprimido pela manhã"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.duration')}</label>
                <input
                  type="text"
                  value={receitaForm.duracao}
                  onChange={(e) => setReceitaForm({...receitaForm, duracao: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                  placeholder="Ex: 30 dias"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.observations')}</label>
                <textarea
                  value={receitaForm.observacoes}
                  onChange={(e) => setReceitaForm({...receitaForm, observacoes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[60px]"
                  placeholder="Orientações complementares..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0D0D0D] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all"
              >
                {t('form.cancel')}
              </button>
              <button
                onClick={handleGenerateReceita}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('form.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('form.generate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Relatório */}
      {modalOpen === 'relatorio' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{modalSubtype}</h3>
                <p className="text-white/60 text-sm mt-1">{t('form.fill-info')}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">{t('form.patient-name')} *</label>
                  <input
                    type="text"
                    value={relatorioForm.paciente}
                    onChange={(e) => setRelatorioForm({...relatorioForm, paciente: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">{t('form.age')} *</label>
                    <input
                      type="number"
                      value={relatorioForm.idade}
                      onChange={(e) => setRelatorioForm({...relatorioForm, idade: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">{t('form.sex')} *</label>
                    <select
                      value={relatorioForm.sexo}
                      onChange={(e) => setRelatorioForm({...relatorioForm, sexo: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                    >
                      <option value="M">{t('form.male')}</option>
                      <option value="F">{t('form.female')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.admission-reason')}</label>
                <input
                  type="text"
                  value={relatorioForm.motivoInternacao}
                  onChange={(e) => setRelatorioForm({...relatorioForm, motivoInternacao: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                  placeholder="Ex: Pneumonia bacteriana"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.clinical-evolution')} *</label>
                <textarea
                  value={relatorioForm.evolucao}
                  onChange={(e) => setRelatorioForm({...relatorioForm, evolucao: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[80px]"
                  placeholder="Descreva a evolução do quadro clínico..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.procedures')} *</label>
                <textarea
                  value={relatorioForm.procedimentos}
                  onChange={(e) => setRelatorioForm({...relatorioForm, procedimentos: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[80px]"
                  placeholder="Liste os procedimentos e tratamentos realizados..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.discharge-condition')}</label>
                <input
                  type="text"
                  value={relatorioForm.condicaoAlta}
                  onChange={(e) => setRelatorioForm({...relatorioForm, condicaoAlta: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                  placeholder="Ex: Estável, assintomático"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.recommendations')}</label>
                <textarea
                  value={relatorioForm.recomendacoes}
                  onChange={(e) => setRelatorioForm({...relatorioForm, recomendacoes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[60px]"
                  placeholder="Orientações e recomendações pós-alta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t('form.observations')}</label>
                <textarea
                  value={relatorioForm.observacoes}
                  onChange={(e) => setRelatorioForm({...relatorioForm, observacoes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] min-h-[60px]"
                  placeholder="Informações complementares..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0D0D0D] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all"
              >
                {t('form.cancel')}
              </button>
              <button
                onClick={handleGenerateRelatorio}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('form.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('form.generate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assistente de Suporte AI */}
      <SupportChat />
    </div>
  );
}
