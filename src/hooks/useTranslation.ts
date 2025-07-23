"use client";

import { useState, useEffect, useCallback } from 'react';

interface TranslationData {
  [key: string]: string | TranslationData;
}

export const useTranslation = (namespace: string = 'common') => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState<TranslationData>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslations = useCallback(async (locale: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/locales/${locale}/${namespace}.json`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      } else {
        console.warn(`Failed to load translations for ${locale}/${namespace}`);
        // Fallback to English if the current locale fails
        if (locale !== 'en') {
          const fallbackResponse = await fetch(`/locales/en/${namespace}.json`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [namespace]);

  useEffect(() => {
    // Get saved language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
    loadTranslations(savedLanguage);

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      const newLocale = event.detail.locale;
      setCurrentLanguage(newLocale);
      loadTranslations(newLocale);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [loadTranslations]);

  const t = useCallback((key: string, params?: { [key: string]: string | number }) => {
    const keys = key.split('.');
    let value: string | TranslationData = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return the key if translation is not found
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match;
      });
    }

    return value;
  }, [translations]);

  return {
    t,
    currentLanguage,
    isLoading,
    changeLanguage: (locale: string) => {
      localStorage.setItem('language', locale);
      setCurrentLanguage(locale);
      loadTranslations(locale);
    }
  };
}; 