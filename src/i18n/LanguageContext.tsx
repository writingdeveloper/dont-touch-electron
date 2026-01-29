import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Detect browser/system language
function detectLanguage(): Language {
  const stored = localStorage.getItem('app-language') as Language | null;
  if (stored && translations[stored]) {
    return stored;
  }

  const browserLang = navigator.language.split('-')[0];
  const langMap: Record<string, Language> = {
    en: 'en',
    ko: 'ko',
    ja: 'ja',
    zh: 'zh',
    es: 'es',
    ru: 'ru',
  };

  return langMap[browserLang] || 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
    // Notify main process to update system tray menu
    window.ipcRenderer?.send('set-language', lang);
  };

  useEffect(() => {
    // Apply language to html element for proper font rendering
    document.documentElement.lang = language;
    // Also notify main process on initial load
    window.ipcRenderer?.send('set-language', language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper to get zone translation key
export function getZoneTranslationKey(zone: string): keyof Translations {
  const zoneKeys: Record<string, keyof Translations> = {
    scalp: 'zoneScalp',
    forehead: 'zoneForehead',
    eyebrows: 'zoneEyebrows',
    eyes: 'zoneEyes',
    nose: 'zoneNose',
    cheeks: 'zoneCheeks',
    mouth: 'zoneMouth',
    chin: 'zoneChin',
    ears: 'zoneEars',
    fullFace: 'zoneFullFace',
  };
  return zoneKeys[zone] || 'zoneFullFace';
}
