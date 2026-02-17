import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { Lang } from '../utils/i18n';

const STORAGE_KEY = '@sr_lang';

function inferLang(): Lang {
  try {
    const code = getLocales()[0]?.languageCode ?? 'en';
    return code.startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(inferLang);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val === 'es' || val === 'en') setLang(val);
    });
  }, []);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === 'en' ? 'es' : 'en';
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
