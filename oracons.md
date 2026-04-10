# OraHR — HR Management Application Plan

## Project Overview

**OraHR** is a full-stack HR management application built on top of the Cloudflare Workers + React Router 7 starter. It allows HR teams to view, search, filter, create, edit, and delete employee records through a clean, modern UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Router 7 (Framework Mode) |
| Runtime | Cloudflare Workers |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Bundler | Vite + @cloudflare/vite-plugin |

---

## Project Structure

```
oracons-demo/
├── app/
│   ├── data/
│   │   └── employees.ts          # In-memory data store + CRUD helpers + constants
│   ├── routes/
│   │   ├── layout.tsx            # Shared sidebar layout
│   │   ├── home.tsx              # Dashboard (stats + employee table)
│   │   ├── employees.new.tsx     # Add employee form
│   │   ├── employees.$id.tsx     # Employee profile / delete
│   │   └── employees.$id.edit.tsx# Edit employee form
│   ├── routes.ts                 # Route configuration
│   ├── root.tsx                  # App root, HTML shell
│   └── app.css                   # Tailwind CSS entry
├── workers/
│   └── app.ts                    # Cloudflare Worker entry
├── oracons.md                    # This plan file
├── package.json
├── react-router.config.ts
├── vite.config.ts
├── wrangler.json
└── tsconfig.cloudflare.json
```

---

## Routes

| Path | File | Description |
|---|---|---|
| `/` | `routes/home.tsx` | Dashboard with stat cards and employee table |
| `/employees/new` | `routes/employees.new.tsx` | Form to create a new employee |
| `/employees/:id` | `routes/employees.$id.tsx` | Employee detail view + delete action |
| `/employees/:id/edit` | `routes/employees.$id.edit.tsx` | Form to edit an existing employee |

All routes are wrapped in a shared `layout.tsx` that renders the sidebar navigation.

---

## Features

### Dashboard (`/`)
- **4 Stat Cards** — Total Employees, Active, Remote, Departments
- **Employee Table** — Columns: Employee (avatar + name + email), Department, Role, Status, Start Date, Actions
- **Live Search** — Filters by name, role, department, or email (via URL query param `q`)
- **Department Filter** — Dropdown to narrow by department (via URL query param `dept`)
- **Result Count** — Shows how many employees match the current filters
- **Quick Links** — View and Edit links per row

### Add Employee (`/employees/new`)
- Two-section form: Personal Information + Employment Details
- Required fields: First Name, Last Name, Email, Department, Role, Start Date
- Optional fields: Phone, Location, Salary, Manager, Status
- Validation error banner for missing required fields
- On success: redirects to the new employee's profile page

### Employee Profile (`/employees/:id`)
- Avatar with department-colored background and initials
- Department badge and status badge
- Contact Information card: Email, Phone, Location
- Employment Details card: Department, Role, Start Date, Salary, Manager
- **Edit** button → navigates to edit form
- **Delete** button → confirmation dialog → deletes and redirects to dashboard

### Edit Employee (`/employees/:id/edit`)
- Same two-section form as Add, pre-filled with current employee data
- On success: redirects back to the employee's profile page

---

## Data Layer (`app/data/employees.ts`)

### Employee Model
```ts
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Remote' | 'Terminated';
  startDate: string;       // YYYY-MM-DD
  salary: number;
  location: string;
  manager: string;
}
```

### CRUD Functions
| Function | Description |
|---|---|
| `getEmployees()` | Returns all employees |
| `getEmployee(id)` | Returns a single employee by ID |
| `createEmployee(data)` | Creates and stores a new employee |
| `updateEmployee(id, data)` | Partially updates an employee |
| `deleteEmployee(id)` | Removes an employee |

### Constants & Helpers
- `DEPARTMENTS` — 6 departments: Engineering, Marketing, Sales, HR, Finance, Product
- `STATUSES` — Active, Remote, On Leave, Terminated
- `DEPT_COLORS` — Tailwind badge color map per department
- `AVATAR_COLORS` — Tailwind avatar background color map per department
- `STATUS_COLORS` — Tailwind badge color map per status
- `getInitials(firstName, lastName)` — Returns two-letter initials

---

## Mock Test Users (15 Employees)

| # | Name | Department | Role | Status |
|---|---|---|---|---|
| 1 | Alice Johnson | Engineering | Senior Software Engineer | Active |
| 2 | Bob Smith | Marketing | Marketing Manager | Active |
| 3 | Carol White | HR | HR Director | Active |
| 4 | David Brown | Sales | Sales Representative | Active |
| 5 | Emma Davis | Engineering | Frontend Developer | Remote |
| 6 | Frank Miller | Finance | Financial Analyst | Active |
| 7 | Grace Wilson | Product | Product Manager | Active |
| 8 | Henry Taylor | Engineering | Backend Developer | Active |
| 9 | Isabella Anderson | Sales | Sales Manager | On Leave |
| 10 | James Thomas | Marketing | Content Writer | Remote |
| 11 | Karen Jackson | Engineering | DevOps Engineer | Active |
| 12 | Liam Harris | Finance | Senior Accountant | Active |
| 13 | Maria Martinez | HR | HR Specialist | Active |
| 14 | Nathan Robinson | Engineering | Junior Developer | Active |
| 15 | Olivia Clark | Sales | Account Executive | Remote |

---

## UI Design

- **Color Scheme** — Indigo primary, gray neutrals, semantic status colors
- **Layout** — Fixed 256px sidebar + fluid scrollable main area
- **Sidebar** — App logo, navigation links (Dashboard, Add Employee), admin footer
- **Cards** — White background, subtle shadow, rounded-xl corners
- **Badges** — Rounded department tags (color per department), pill-shaped status badges
- **Avatars** — Initials-based colored circles, color matches department
- **Typography** — Inter font (Google Fonts), size scale xs–2xl
- **Responsive** — Single-column forms on narrow viewports via CSS grid

---

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
./node_modules/.bin/react-router dev

# Build for production
./node_modules/.bin/vite build

# Deploy to Cloudflare Workers
npx wrangler deploy
```

---

## Future Improvements

- Persist data to Cloudflare KV or D1 database (currently in-memory)
- Authentication & role-based access control
- Pagination for large employee lists
- Employee photo upload
- Leave request management
- Payroll & salary history tracking
- Department management page
- Export to CSV / PDF
