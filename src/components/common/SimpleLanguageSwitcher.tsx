"use client";

import { useState, useEffect } from 'react';

const SimpleLanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  useEffect(() => {
    setIsClient(true);
    const savedLanguage = localStorage.getItem('language') || 'en';
    console.log('Loading saved language:', savedLanguage);
    setCurrentLanguage(savedLanguage);
    applyLanguageSettings(savedLanguage);
  }, []);

  const applyLanguageSettings = (locale: string) => {
    console.log('Applying language settings for:', locale);
    // Set the language but don't change the layout direction globally
    document.documentElement.lang = locale;
    
    if (locale === 'ar') {
      // Add Arabic class for selective styling
      document.documentElement.classList.add('arabic-lang');
      document.documentElement.classList.remove('ltr-lang');
    } else {
      // Add LTR class and remove Arabic class
      document.documentElement.classList.add('ltr-lang');
      document.documentElement.classList.remove('arabic-lang');
      document.documentElement.dir = 'ltr';
    }
  };

  const changeLanguage = (locale: string) => {
    console.log('Changing language to:', locale);
    setCurrentLanguage(locale);
    localStorage.setItem('language', locale);
    applyLanguageSettings(locale);
    setIsOpen(false);
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { locale } }));
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  if (!isClient) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <span>{currentLang.flag}</span>
        <span className="text-xs">{currentLang.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentLanguage === language.code 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{language.flag}</span>
                  <span className="text-xs">{language.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleLanguageSwitcher; 