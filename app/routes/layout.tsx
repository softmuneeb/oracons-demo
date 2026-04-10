import { NavLink, Outlet } from 'react-router';
import { I18nProvider, useI18n } from '../i18n/I18nContext';
import { LANGUAGES, CURRENCIES, type Language, type Currency } from '../i18n/translations';

const SELECT_CLS =
  'w-full px-2.5 py-1.5 text-xs text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300';

function AppLayout() {
  const { t, lang, setLang, currency, setCurrency, isRTL } = useI18n();

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className="flex h-screen bg-gray-50"
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white border-e border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">OraHR</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-0.5">
          <p className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t('main')}
          </p>

          <NavLink
            to="/"
            end
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {t('dashboard')}
          </NavLink>

          <NavLink
            to="/employees/new"
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {t('addEmployee')}
          </NavLink>
        </nav>

        {/* Language & Currency */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t('settings')}
          </p>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('languageLabel')}</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className={SELECT_CLS}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('currencyLabel')}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className={SELECT_CLS}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Admin footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-semibold">AD</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{t('adminUser')}</p>
              <p className="text-xs text-gray-500 truncate">admin@oracons.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function Layout() {
  return (
    <I18nProvider>
      <AppLayout />
    </I18nProvider>
  );
}
