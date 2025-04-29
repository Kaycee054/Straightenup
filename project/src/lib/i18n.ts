import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: navigator.language.startsWith('ru') ? 'ru' : 'en',
      setLanguage: (lang: string) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        about: 'About',
        store: 'Store',
        forum: 'Forum',
        contact: 'Contact',
        signIn: 'Sign In',
        adminPanel: 'Admin Panel',
        signOut: 'Sign Out',
      },
      auth: {
        title: 'Sign In',
        email: 'Email',
        password: 'Password',
        submit: 'Sign In',
        invalidCredentials: 'Invalid credentials',
      },
      home: {
        hero: {
          title: 'Transform Your Posture, Transform Your Life',
          subtitle: 'Experience the future of posture correction with our innovative wearable technology',
          shopNow: 'Shop Now',
          learnMore: 'Learn More',
        },
      },
    },
  },
  ru: {
    translation: {
      nav: {
        home: 'Главная',
        about: 'О нас',
        store: 'Магазин',
        forum: 'Форум',
        contact: 'Контакты',
        signIn: 'Войти',
        adminPanel: 'Панель администратора',
        signOut: 'Выйти',
      },
      auth: {
        title: 'Вход',
        email: 'Электронная почта',
        password: 'Пароль',
        submit: 'Войти',
        invalidCredentials: 'Неверные учетные данные',
      },
      home: {
        hero: {
          title: 'Улучшите осанку, измените жизнь',
          subtitle: 'Испытайте будущее коррекции осанки с нашей инновационной носимой технологией',
          shopNow: 'Купить сейчас',
          learnMore: 'Узнать больше',
        },
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;