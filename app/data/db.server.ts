/**
 * D1 CRUD helpers — server-only (never imported by client components).
 * Every function receives the D1Database binding from the Cloudflare Worker context.
 */
import type { Employee, EmployeeStatus } from './employees';

// Raw row type returned by D1 (all values are strings / numbers / null)
type Row = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: string;
  startDate: string;
  salary: number;
  location: string;
  manager: string;
};

function rowToEmployee(row: Row): Employee {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? '',
    department: row.department,
    role: row.role,
    status: row.status as EmployeeStatus,
    startDate: row.startDate,
    salary: Number(row.salary ?? 0),
    location: row.location ?? '',
    manager: row.manager ?? '',
  };
}

export async function getEmployees(
  db: D1Database,
  opts: { q?: string; dept?: string } = {}
): Promise<Employee[]> {
  let query = 'SELECT * FROM employees';
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (opts.q) {
    conditions.push(
      "(firstName || ' ' || lastName LIKE ? OR role LIKE ? OR department LIKE ? OR email LIKE ?)"
    );
    const lq = `%${opts.q}%`;
    params.push(lq, lq, lq, lq);
  }
  if (opts.dept) {
    conditions.push('department = ?');
    params.push(opts.dept);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY firstName, lastName';

  const { results } = await db.prepare(query).bind(...params).all<Row>();
  return results.map(rowToEmployee);
}

export async function getAllEmployees(db: D1Database): Promise<Employee[]> {
  const { results } = await db
    .prepare('SELECT * FROM employees ORDER BY firstName, lastName')
    .all<Row>();
  return results.map(rowToEmployee);
}

export async function getEmployee(
  db: D1Database,
  id: string
): Promise<Employee | null> {
  const row = await db
    .prepare('SELECT * FROM employees WHERE id = ?')
    .bind(id)
    .first<Row>();
  return row ? rowToEmployee(row) : null;
}

export async function createEmployee(
  db: D1Database,
  data: Omit<Employee, 'id'>
): Promise<Employee> {
  const id = String(Date.now());
  await db
    .prepare(
      `INSERT INTO employees
        (id, firstName, lastName, email, phone, department, role, status, startDate, salary, location, manager)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.department,
      data.role,
      data.status,
      data.startDate,
      data.salary,
      data.location,
      data.manager
    )
    .run();
  return { ...data, id };
}

export async function updateEmployee(
  db: D1Database,
  id: string,
  data: Partial<Omit<Employee, 'id'>>
): Promise<Employee | null> {
  const existing = await getEmployee(db, id);
  if (!existing) return null;

  const merged: Employee = { ...existing, ...data };
  await db
    .prepare(
      `UPDATE employees SET
        firstName = ?, lastName = ?, email = ?, phone = ?,
        department = ?, role = ?, status = ?, startDate = ?,
        salary = ?, location = ?, manager = ?
       WHERE id = ?`
    )
    .bind(
      merged.firstName,
      merged.lastName,
      merged.email,
      merged.phone,
      merged.department,
      merged.role,
      merged.status,
      merged.startDate,
      merged.salary,
      merged.location,
      merged.manager,
      id
    )
    .run();
  return merged;
}

export async function deleteEmployee(
  db: D1Database,
  id: string
): Promise<boolean> {
  const { meta } = await db
    .prepare('DELETE FROM employees WHERE id = ?')
    .bind(id)
    .run();
  return meta.changes > 0;
}
