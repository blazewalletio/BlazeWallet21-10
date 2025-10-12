'use client';

import { useState, useEffect } from 'react';
import enTranslations from '../locales/en/common.json';
import nlTranslations from '../locales/nl/common.json';
import esTranslations from '../locales/es/common.json';
import deTranslations from '../locales/de/common.json';
import frTranslations from '../locales/fr/common.json';

export type Locale = 'en' | 'nl' | 'es' | 'de' | 'fr';

export const locales: Locale[] = ['en', 'nl', 'es', 'de', 'fr'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  nl: '🇳🇱',
  es: '🇪🇸',
  de: '🇩🇪',
  fr: '🇫🇷',
};

const translations: Record<Locale, any> = {
  en: enTranslations,
  nl: nlTranslations,
  es: esTranslations,
  de: deTranslations,
  fr: frTranslations,
};

let globalLocale: Locale = 'en';
let localeChangeListeners: Array<(locale: Locale) => void> = [];

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app_locale') as Locale;
    if (saved && locales.includes(saved)) {
      return saved;
    }
    // Auto-detect from browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('nl')) return 'nl';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('fr')) return 'fr';
  }
  return 'en';
}

export function setLocale(locale: Locale) {
  globalLocale = locale;
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_locale', locale);
  }
  // Notify all listeners
  localeChangeListeners.forEach(listener => listener(locale));
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());

  useEffect(() => {
    // Initialize
    const currentLocale = getLocale();
    setLocaleState(currentLocale);
    globalLocale = currentLocale;

    // Listen for locale changes
    const listener = (newLocale: Locale) => {
      setLocaleState(newLocale);
    };
    localeChangeListeners.push(listener);

    return () => {
      localeChangeListeners = localeChangeListeners.filter(l => l !== listener);
    };
  }, []);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English
        value = translations.en;
        for (const k of keys) {
          value = value?.[k];
        }
        if (value === undefined) {
          console.warn(`Translation missing: ${key}`);
          return key;
        }
      }
    }

    let result = String(value);

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, val]) => {
        result = result.replace(`{${param}}`, String(val));
      });
    }

    return result;
  };

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return { t, locale, setLocale: changeLocale };
}

