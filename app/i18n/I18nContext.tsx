import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, LANGUAGES, CURRENCIES, type Language, type Currency, type T } from './translations';

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  t: (key: keyof T) => string;
  formatSalary: (amount: number) => string;
  isRTL: boolean;
  locale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const storedLang = localStorage.getItem('hr-lang') as Language | null;
    const storedCurrency = localStorage.getItem('hr-currency') as Currency | null;
    if (storedLang && translations[storedLang]) setLangState(storedLang);
    if (storedCurrency && CURRENCIES.find((c) => c.code === storedCurrency))
      setCurrencyState(storedCurrency);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('hr-lang', l);
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('hr-currency', c);
  };

  const locale = LANGUAGES.find((l) => l.code === lang)?.locale ?? 'en-US';

  const t = (key: keyof T): string =>
    translations[lang]?.[key] ?? translations.en[key] ?? key;

  const formatSalary = (amount: number): string => {
    if (!amount) return '—';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  const isRTL = LANGUAGES.find((l) => l.code === lang)?.dir === 'rtl';

  return (
    <I18nContext.Provider
      value={{ lang, setLang, currency, setCurrency, t, formatSalary, isRTL, locale }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
