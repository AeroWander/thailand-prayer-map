import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Campus, InstitutionType, Region } from '../types/campus';
import { getProvinceNameTh } from './provinces';
import {
  LANGUAGE_STORAGE_KEY,
  translations,
  type Language,
  type TranslationSchema,
} from './translations';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationSchema;
  formatNumber: (value: number) => string;
  getRegionLabel: (region: Region) => string;
  getInstitutionTypeLabel: (type: InstitutionType) => string;
  getCampusPrimaryName: (campus: Campus) => string;
  getCampusSecondaryName: (campus: Campus) => string;
  getProvinceLabel: (province: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'th';
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  // Default to Thai; only switch to English if the user has explicitly chosen it.
  return stored === 'en' ? 'en' : 'th';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.classList.toggle('lang-th', language === 'th');
    document.title = translations[language].documentTitle;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = translations[language];

    return {
      language,
      setLanguage,
      t,
      formatNumber: (value: number) => value.toLocaleString(language === 'th' ? 'th-TH' : 'en-US'),
      getRegionLabel: (region: Region) => t.regions[region],
      getInstitutionTypeLabel: (type: InstitutionType) => {
        const label = t.types[type as keyof TranslationSchema['types']];
        return label ?? type;
      },
      getCampusPrimaryName: (campus: Campus) =>
        language === 'th' ? campus.nameTh : campus.name,
      getCampusSecondaryName: (campus: Campus) =>
        language === 'th' ? campus.name : campus.nameTh,
      getProvinceLabel: (province: string) =>
        language === 'th' ? getProvinceNameTh(province) : province,
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

