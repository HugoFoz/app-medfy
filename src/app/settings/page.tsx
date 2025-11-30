"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { 
  ArrowLeft, 
  Check, 
  Globe, 
  Sparkles 
} from "lucide-react";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLanguage(selectedLanguage);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-[#0D0D0D]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FFD600] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#0D0D0D]" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6F00] to-[#FFD600] bg-clip-text text-transparent">
                {t('app.name')}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth.back')}
        </button>

        {/* Settings Card */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20">
              <Globe className="w-6 h-6 text-[#FF6F00]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
              <p className="text-white/60 text-sm mt-1">{t('settings.subtitle')}</p>
            </div>
          </div>

          {/* Current Language */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-white/60 mb-2">{t('settings.current')}</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {languages.find(l => l.code === language)?.flag}
              </span>
              <span className="text-lg font-semibold text-white">
                {t(`lang.${language}`)}
              </span>
            </div>
          </div>

          {/* Language Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-white/80 mb-4">{t('settings.select')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`group relative p-4 rounded-xl border transition-all duration-300 ${
                    selectedLanguage === lang.code
                      ? 'bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20 border-[#FF6F00]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium text-white">{lang.name}</span>
                    </div>
                    {selectedLanguage === lang.code && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF6F00] to-[#FFD600] flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#0D0D0D]" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-400">
              💡 {t('settings.description')}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={selectedLanguage === language}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              selectedLanguage === language
                ? 'bg-white/5 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#FF6F00] to-[#FFD600] text-[#0D0D0D] hover:opacity-90'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                {t('settings.saved')}
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                {t('settings.save')}
              </>
            )}
          </button>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-gradient-to-br from-[#FF6F00]/10 to-[#FFD600]/10 border border-[#FF6F00]/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-3">{t('welcome.title')}</h3>
          <p className="text-white/70 mb-4">{t('welcome.subtitle')}</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-white/60">
              <span className="text-[#FF6F00] mt-1">✓</span>
              <span>{t('welcome.instruction-1')}</span>
            </li>
            <li className="flex items-start gap-2 text-white/60">
              <span className="text-[#FF6F00] mt-1">✓</span>
              <span>{t('welcome.instruction-2')}</span>
            </li>
            <li className="flex items-start gap-2 text-white/60">
              <span className="text-[#FF6F00] mt-1">✓</span>
              <span>{t('welcome.instruction-3')}</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
