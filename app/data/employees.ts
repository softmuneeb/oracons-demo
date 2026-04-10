export type EmployeeStatus = 'Active' | 'On Leave' | 'Remote' | 'Terminated';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  startDate: string;
  salary: number;
  location: string;
  manager: string;
}

// ---------------------------------------------------------------------------
// UI constants (used on both server and client)
// ---------------------------------------------------------------------------

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Product',
] as const;

export const STATUSES: EmployeeStatus[] = ['Active', 'Remote', 'On Leave', 'Terminated'];

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export const DEPT_COLORS: Record<string, string> = {
  Engineering: 'bg-indigo-100 text-indigo-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Sales: 'bg-orange-100 text-orange-700',
  HR: 'bg-teal-100 text-teal-700',
  Finance: 'bg-emerald-100 text-emerald-700',
  Product: 'bg-purple-100 text-purple-700',
};

export const AVATAR_COLORS: Record<string, string> = {
  Engineering: 'bg-indigo-500',
  Marketing: 'bg-pink-500',
  Sales: 'bg-orange-500',
  HR: 'bg-teal-500',
  Finance: 'bg-emerald-500',
  Product: 'bg-purple-500',
};

export const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Remote: 'bg-blue-100 text-blue-700',
  'On Leave': 'bg-amber-100 text-amber-700',
  Terminated: 'bg-red-100 text-red-700',
};
  {
