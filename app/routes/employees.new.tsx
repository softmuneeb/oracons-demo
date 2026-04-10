import { Link, Form, redirect, useActionData } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { DEPARTMENTS, STATUSES } from '../data/employees';
import type { EmployeeStatus } from '../data/employees';
import { createEmployee } from '../data/db.server';
import { useI18n } from '../i18n/I18nContext';

export function meta() {
  return [{ title: 'Add Employee | OraHR' }];
}

export async function action({ request, context }: ActionFunctionArgs) {
  const fd = await request.formData();

  const firstName = String(fd.get('firstName') ?? '').trim();
  const lastName = String(fd.get('lastName') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim();
  const phone = String(fd.get('phone') ?? '').trim();
  const location = String(fd.get('location') ?? '').trim();
  const department = String(fd.get('department') ?? '').trim();
  const role = String(fd.get('role') ?? '').trim();
  const status = String(fd.get('status') ?? 'Active').trim() as EmployeeStatus;
  const startDate = String(fd.get('startDate') ?? '').trim();
  const salary = Number(fd.get('salary') ?? 0);
  const manager = String(fd.get('manager') ?? '').trim();

  if (!firstName || !lastName || !email || !department || !role || !startDate) {
    return { error: 'Please fill in all required fields.' };
  }

  const employee = await createEmployee(context.cloudflare.env.DB, {
    firstName, lastName, email, phone, location,
    department, role, status, startDate, salary, manager,
  });

  return redirect(`/employees/${employee.id}`);
}

const INPUT_CLS =
  'w-full px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400';

export default function NewEmployee() {
  const actionData = useActionData<typeof action>();
  const { t, currency, isRTL } = useI18n();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToDashboard')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('addNewEmployee')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('fillDetails')}</p>
      </div>

      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Personal Information */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('personalInfo')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('firstNameLabel')} <span className="text-red-500">*</span>
              </label>
              <input type="text" name="firstName" required className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('lastNameLabel')} <span className="text-red-500">*</span>
              </label>
              <input type="text" name="lastName" required className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('emailLabel')} <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" required className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('phoneLabel')}</label>
              <input type="tel" name="phone" placeholder="+1 (555) 000-0000" className={INPUT_CLS} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('locationLabel')}</label>
              <input type="text" name="location" placeholder={t('locationPlaceholder')} className={INPUT_CLS} />
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Employment Details */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('employmentDetails')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('departmentLabel')} <span className="text-red-500">*</span>
              </label>
              <select name="department" required className={INPUT_CLS}>
                <option value="">{t('selectDept')}</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('role')} <span className="text-red-500">*</span>
              </label>
              <input type="text" name="role" required placeholder={t('rolePlaceholder')} className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('status')}</label>
              <select name="status" className={INPUT_CLS}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('startDate')} <span className="text-red-500">*</span>
              </label>
              <input type="date" name="startDate" required className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('annualSalary')} ({currency})
              </label>
              <input
                type="number"
                name="salary"
                min="0"
                step="1000"
                placeholder="0"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('managerLabel')}</label>
              <input
                type="text"
                name="manager"
                placeholder={t('managerPlaceholder')}
                className={INPUT_CLS}
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t('createEmployee')}
          </button>
          <Link
            to="/"
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t('cancel')}
          </Link>
        </div>
      </Form>
    </div>
  );
}
