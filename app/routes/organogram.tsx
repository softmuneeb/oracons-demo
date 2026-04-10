import { useState, useMemo } from 'react';
import { Link, useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { getAllEmployees } from '../data/db.server';
import { getInitials, DEPT_COLORS, STATUS_COLORS } from '../data/employees';
import type { Employee } from '../data/employees';

export function meta() {
  return [{ title: 'Org Chart | OraHR' }];
}

export async function loader({ context }: LoaderFunctionArgs) {
  const employees = await getAllEmployees(context.cloudflare.env.DB);
  return { employees };
}

// ── Dept accent colours ───────────────────────────────────────────────────────

const DEPT_HEX: Record<string, string> = {
  Engineering: '#6366f1',
  Marketing:   '#ec4899',
  Sales:       '#f97316',
  HR:          '#14b8a6',
  Finance:     '#10b981',
  Product:     '#a855f7',
};

// ── Tree building ─────────────────────────────────────────────────────────────

interface TreeNode {
  employee: Employee;
  children: TreeNode[];
}

function buildTree(employees: Employee[]): TreeNode[] {
  const byName = new Map<string, Employee>();
  employees.forEach((e) => byName.set(`${e.firstName} ${e.lastName}`, e));

  const childrenOf = new Map<string, Employee[]>();
  const hasParent = new Set<string>();

  employees.forEach((e) => {
    if (e.manager) {
      const parent = byName.get(e.manager);
      if (parent && parent.id !== e.id) {
        if (!childrenOf.has(parent.id)) childrenOf.set(parent.id, []);
        childrenOf.get(parent.id)!.push(e);
        hasParent.add(e.id);
      }
    }
  });

  function make(emp: Employee, visited: Set<string>): TreeNode {
    const v2 = new Set(visited);
    v2.add(emp.id);
    return {
      employee: emp,
      children: (childrenOf.get(emp.id) ?? [])
        .filter((c) => !v2.has(c.id))
        .map((c) => make(c, v2)),
    };
  }

  return employees
    .filter((e) => !hasParent.has(e.id))
    .map((r) => make(r, new Set()));
}

function countDescendants(node: TreeNode): number {
  return node.children.reduce((s, c) => s + 1 + countDescendants(c), 0);
}

function getAllIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => [n.employee.id, ...getAllIds(n.children)]);
}

// ── Tile component ────────────────────────────────────────────────────────────

const TILE_W = 176; // px – must match px-3 child padding for connector math

function OrgTile({
  node,
  search,
  openSet,
  onToggle,
}: {
  node: TreeNode;
  search: string;
  openSet: Set<string>;
  onToggle: (id: string) => void;
}) {
  const e = node.employee;
  const fullName = `${e.firstName} ${e.lastName}`;
  const lq = search.toLowerCase();
  const isMatch =
    lq.length > 0 &&
    (fullName.toLowerCase().includes(lq) ||
      e.role.toLowerCase().includes(lq) ||
      e.department.toLowerCase().includes(lq));

  const hasKids = node.children.length > 0;
  const isOpen = openSet.has(e.id);
  const deptHex = DEPT_HEX[e.department] ?? '#94a3b8';
  const n = node.children.length;

  return (
    <div className="flex flex-col items-center">
      {/* ── TILE ── */}
      <div
        className={`relative bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-150 group
          ${isMatch
            ? 'ring-2 ring-amber-400 border-amber-300'
            : 'border-gray-200 hover:shadow-lg hover:border-indigo-200'
          }`}
        style={{ width: TILE_W }}
      >
        {/* Dept colour accent bar */}
        <div style={{ height: 4, backgroundColor: deptHex }} />

        <div className="p-3">
          {/* Avatar + name / role */}
          <div className="flex items-start gap-2 mb-2.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0"
              style={{ backgroundColor: deptHex }}
            >
              {getInitials(e.firstName, e.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 leading-snug truncate">{fullName}</p>
              <p className="text-[10px] text-gray-500 leading-snug truncate mt-0.5">{e.role}</p>
            </div>
          </div>

          {/* Dept + Status badges */}
          <div className="flex flex-wrap gap-1 mb-1">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none
                ${DEPT_COLORS[e.department] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {e.department}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none
                ${STATUS_COLORS[e.status] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {e.status}
            </span>
          </div>

          {/* Expand / collapse toggle */}
          {hasKids && (
            <button
              onClick={() => onToggle(e.id)}
              className="mt-2 w-full flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              {n} report{n !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/employees/${e.id}`}
            onClick={(ev) => ev.stopPropagation()}
            className="w-5 h-5 flex items-center justify-center rounded bg-white shadow-sm border border-gray-100 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            title="View profile"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
          <Link
            to={`/employees/${e.id}/edit`}
            onClick={(ev) => ev.stopPropagation()}
            className="w-5 h-5 flex items-center justify-center rounded bg-white shadow-sm border border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Edit employee"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── CHILDREN with connector lines ── */}
      {isOpen && hasKids && (
        <div className="flex flex-col items-center">
          {/* Vertical stem from tile down to horizontal bar */}
          <div className="w-px bg-gray-200" style={{ height: 24 }} />

          {/* Row of children */}
          <div className="flex items-start">
            {node.children.map((child, i) => {
              const isFirst = i === 0;
              const isLast = i === n - 1;
              const isSingle = n === 1;
              return (
                <div key={child.employee.id} className="flex flex-col items-center px-3">
                  {/* Connector stub: horizontal bar segment + vertical stem */}
                  <div className="relative w-full" style={{ height: 24 }}>
                    {/* Horizontal segment – spans from parent center to this child center */}
                    {!isSingle && (
                      <div
                        className="absolute bg-gray-200"
                        style={{
                          top: 0,
                          left: isFirst ? '50%' : 0,
                          right: isLast ? '50%' : 0,
                          height: 1,
                        }}
                      />
                    )}
                    {/* Vertical stem down to tile */}
                    <div
                      className="absolute bg-gray-200"
                      style={{ left: 'calc(50% - 0.5px)', top: 0, width: 1, height: 24 }}
                    />
                  </div>
                  <OrgTile
                    node={child}
                    search={search}
                    openSet={openSet}
                    onToggle={onToggle}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat card helper ──────────────────────────────────────────────────────────

function StatCard({
  value, label, bg, iconColor, path,
}: {
  value: number; label: string; bg: string; iconColor: string; path: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrgChartPage() {
  const { employees } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState('');

  const tree = useMemo(() => buildTree(employees), [employees]);

  // Open-set: all nodes start expanded
  const [openSet, setOpenSet] = useState<Set<string>>(
    () => new Set(employees.map((e) => e.id))
  );

  function toggle(id: string) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const rootCount = tree.length;
  const maxDepth = useMemo(() => {
    function depth(n: TreeNode): number {
      return n.children.length ? 1 + Math.max(...n.children.map(depth)) : 0;
    }
    return tree.length ? Math.max(...tree.map(depth)) : 0;
  }, [tree]);

  // Search: keep only subtrees that contain a match
  const visibleTree = useMemo(() => {
    if (!search) return tree;
    const lq = search.toLowerCase();
    function matches(n: TreeNode) {
      const e = n.employee;
      return (
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(lq) ||
        e.role.toLowerCase().includes(lq) ||
        e.department.toLowerCase().includes(lq)
      );
    }
    function filter(n: TreeNode): TreeNode | null {
      const kids = n.children.map(filter).filter(Boolean) as TreeNode[];
      return matches(n) || kids.length ? { ...n, children: kids } : null;
    }
    return tree.map(filter).filter(Boolean) as TreeNode[];
  }, [tree, search]);

  const totalVisible = useMemo(
    () => visibleTree.reduce((s, n) => s + 1 + countDescendants(n), 0),
    [visibleTree]
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Org Chart</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reporting hierarchy across your organisation
          </p>
        </div>
        <Link
          to="/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          value={employees.length} label="Total Employees"
          bg="bg-indigo-100" iconColor="text-indigo-600"
          path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <StatCard
          value={rootCount} label="Top-level Leaders"
          bg="bg-purple-100" iconColor="text-purple-600"
          path="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
        />
        <StatCard
          value={maxDepth} label="Hierarchy Levels"
          bg="bg-green-100" iconColor="text-green-600"
          path="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </div>

      {/* Chart panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, department…"
              className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          {search && (
            <span className="text-xs text-gray-500 shrink-0">{totalVisible} result(s)</span>
          )}
          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={() => setOpenSet(new Set(getAllIds(tree)))}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              Expand all
            </button>
            <button
              onClick={() => setOpenSet(new Set())}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              Collapse all
            </button>
          </div>
        </div>

        {/* Chart canvas — scrollable both axes */}
        <div className="overflow-auto p-8 bg-gray-50/30">
          {visibleTree.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              {search ? 'No employees match your search.' : 'No employees found.'}
            </div>
          ) : (
            <div className="inline-flex items-start gap-8 pb-2">
              {visibleTree.map((root) => (
                <OrgTile
                  key={root.employee.id}
                  node={root}
                  search={search}
                  openSet={openSet}
                  onToggle={toggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Click the ▶ on a tile to expand or collapse its reports. Hover a tile to view or edit. 
        Set the <strong>Manager</strong> field in the edit form to build the hierarchy.
      </p>
    </div>
  );
}

