import { Link, Form, useSubmit, useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import {
  DEPARTMENTS,
  getInitials,
  DEPT_COLORS,
  AVATAR_COLORS,
  STATUS_COLORS,
} from '../data/employees';
import { getEmployees, getAllEmployees } from '../data/db.server';
import { useI18n } from '../i18n/I18nContext';

export function meta() {
  return [{ title: 'Dashboard | OraHR' }];
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const dept = url.searchParams.get('dept') ?? '';

  const [filtered, all] = await Promise.all([
    getEmployees(db, { q, dept }),
    getAllEmployees(db),
  ]);

  return {
    employees: filtered,
    stats: {
      total: all.length,
      active: all.filter((e) => e.status === 'Active').length,
      remote: all.filter((e) => e.status === 'Remote').length,
      departments: new Set(all.map((e) => e.department)).size,
    },
    q,
    dept,
  };
}

export default function Home() {
  const { employees, stats, q, dept } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const { t, locale, isRTL } = useI18n();

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('manageTeam')}</p>
        </div>
        <Link
          to="/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addEmployee')}
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{t('totalEmployees')}</span>
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{t('active')}</span>
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{t('remote')}</span>
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.remote}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{t('departments')}</span>
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.departments}</p>
        </div>
      </div>

      {/* Employee table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Search & filter bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <Form className="flex items-center gap-3 flex-1">
            <div className="relative max-w-xs flex-1">
              <svg
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'end-3' : 'start-3'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={t('searchPlaceholder')}
                onChange={(e) => submit(e.currentTarget.form)}
                className={`w-full py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 ${isRTL ? 'pe-9 ps-4' : 'ps-9 pe-4'}`}
              />
            </div>
            <select
              name="dept"
              defaultValue={dept}
              onChange={(e) => submit(e.currentTarget.form)}
              className="px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            >
              <option value="">{t('allDepartments')}</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Form>
          <span className="text-sm text-gray-500 shrink-0">
            {employees.length} {employees.length !== 1 ? t('employees') : t('employee')}
          </span>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('employee')}</th>
              <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('departmentLabel')}</th>
              <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('role')}</th>
              <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('status')}</th>
              <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('startDate')}</th>
              <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        AVATAR_COLORS[e.department] ?? 'bg-gray-400'
                      }`}
                    >
                      <span className="text-white text-xs font-semibold">
                        {getInitials(e.firstName, e.lastName)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {e.firstName} {e.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{e.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                      DEPT_COLORS[e.department] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {e.department}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{e.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[e.status] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(e.startDate).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/employees/${e.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {t('view')}
                    </Link>
                    <Link
                      to={`/employees/${e.id}/edit`}
                      className="text-xs font-medium text-gray-600 hover:text-gray-800"
                    >
                      {t('edit')}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">
                  {t('noEmployees')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
