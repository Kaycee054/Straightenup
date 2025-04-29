import React, { useState } from 'react';
import { useLanguageStore } from '../lib/i18n';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
];

export const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <Globe className="h-6 w-6" />
        <span>{languages.find(l => l.code === language)?.name || 'English'}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};