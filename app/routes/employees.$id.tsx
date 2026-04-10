import { Link, Form, useLoaderData, redirect } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import {
  getInitials,
  DEPT_COLORS,
  AVATAR_COLORS,
  STATUS_COLORS,
} from '../data/employees';
import { getEmployee, deleteEmployee } from '../data/db.server';
import { useI18n } from '../i18n/I18nContext';

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> | undefined }) {
  const name = data
    ? `${data.employee.firstName} ${data.employee.lastName}`
    : 'Employee';
  return [{ title: `${name} | OraHR` }];
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const employee = await getEmployee(context.cloudflare.env.DB, params.id!);
  if (!employee) throw new Response('Not Found', { status: 404 });
  return { employee };
}

export async function action({ params, request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  if (formData.get('intent') === 'delete') {
    await deleteEmployee(context.cloudflare.env.DB, params.id!);
    return redirect('/');
  }
  return null;
}

export default function EmployeeDetail() {
  const { employee: e } = useLoaderData<typeof loader>();
  const { t, formatSalary, locale, isRTL } = useI18n();

  return (
    <div className="p-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <svg
          className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t('backToDashboard')}
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 ${
                AVATAR_COLORS[e.department] ?? 'bg-gray-400'
              }`}
            >
              {getInitials(e.firstName, e.lastName)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {e.firstName} {e.lastName}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{e.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                    DEPT_COLORS[e.department] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {e.department}
                </span>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    STATUS_COLORS[e.status] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {e.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/employees/${e.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('edit')}
            </Link>
            <Form
              method="post"
              onSubmit={(ev) => {
                if (!confirm(t('deleteConfirm'))) {
                  ev.preventDefault();
                }
              }}
            >
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                {t('deleteBtn')}
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('contactInfo')}</h2>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <dt className="text-xs text-gray-500">{t('emailLabel')}</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{e.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <dt className="text-xs text-gray-500">{t('phoneLabel')}</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{e.phone || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <dt className="text-xs text-gray-500">{t('locationLabel')}</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{e.location || '—'}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('employmentDetails')}</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500">{t('departmentLabel')}</dt>
              <dd className="text-sm text-gray-900 mt-0.5">{e.department}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">{t('role')}</dt>
              <dd className="text-sm text-gray-900 mt-0.5">{e.role}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">{t('startDate')}</dt>
              <dd className="text-sm text-gray-900 mt-0.5">
                {new Date(e.startDate).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">{t('annualSalary')}</dt>
              <dd className="text-sm text-gray-900 mt-0.5">{formatSalary(e.salary)}</dd>
            </div>
            {e.manager && (
              <div>
                <dt className="text-xs text-gray-500">{t('managerLabel')}</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{e.manager}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
