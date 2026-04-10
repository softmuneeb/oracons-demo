import { useState, useEffect } from 'react';
import type { Employee } from '../data/employees';
import { getInitials } from '../data/employees';

export interface DeptStat {
  name: string;
  total: number;
  byStatus: Record<string, number>;
}

interface Props {
  departmentStats: DeptStat[];
  employees: Employee[];
}

// ── Colour palettes ──────────────────────────────────────────────────────────

const DEPT: Record<string, { bar: string; bg: string; text: string }> = {
  Engineering: { bar: '#6366f1', bg: '#eef2ff', text: '#3730a3' },
  Marketing:   { bar: '#ec4899', bg: '#fdf2f8', text: '#9d174d' },
  Sales:       { bar: '#f97316', bg: '#fff7ed', text: '#9a3412' },
  HR:          { bar: '#14b8a6', bg: '#f0fdfa', text: '#0f766e' },
  Finance:     { bar: '#10b981', bg: '#ecfdf5', text: '#065f46' },
  Product:     { bar: '#a855f7', bg: '#faf5ff', text: '#6b21a8' },
};

const STATUS: Record<string, { bar: string; bg: string; text: string }> = {
  Active:      { bar: '#22c55e', bg: '#f0fdf4', text: '#15803d' },
  Remote:      { bar: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' },
  'On Leave':  { bar: '#f59e0b', bg: '#fffbeb', text: '#b45309' },
  Terminated:  { bar: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
};

const FALLBACK = { bar: '#94a3b8', bg: '#f8fafc', text: '#475569' };

const BAR_H = 160; // pixel height of the drawing area

// ── Types ────────────────────────────────────────────────────────────────────

type Drill =
  | { level: 0 }
  | { level: 1; dept: string }
  | { level: 2; dept: string; status: string };

// ── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ drill, setDrill }: { drill: Drill; setDrill: (d: Drill) => void }) {
  const dept = drill.level >= 1 ? (drill as { dept: string }).dept : '';
  const status = drill.level === 2 ? (drill as { status: string }).status : '';
  return (
    <nav className="flex items-center gap-1.5 text-xs mb-4">
      <button
        onClick={() => setDrill({ level: 0 })}
        className={`font-semibold transition-colors ${drill.level === 0 ? 'text-gray-900 cursor-default' : 'text-indigo-600 hover:underline'}`}
      >
        All Depts
      </button>
      {drill.level >= 1 && (
        <>
          <span className="text-gray-400">›</span>
          <button
            onClick={() => drill.level > 1 && setDrill({ level: 1, dept })}
            className={`font-semibold transition-colors ${drill.level === 1 ? 'text-gray-900 cursor-default' : 'text-indigo-600 hover:underline'}`}
          >
            {dept}
          </button>
        </>
      )}
      {drill.level === 2 && (
        <>
          <span className="text-gray-400">›</span>
          <span className="font-semibold" style={{ color: (STATUS[status] ?? FALLBACK).text }}>{status}</span>
        </>
      )}
    </nav>
  );
}

// ── Reusable bar chart ────────────────────────────────────────────────────────

interface BarItem { name: string; count: number; color: string; textColor: string }

function BarChart({ bars, hint, onBarClick }: { bars: BarItem[]; hint: string; onBarClick: (name: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const maxVal = Math.max(...bars.map((b) => b.count), 1);

  return (
    <>
      <p className="text-xs text-gray-400 mb-4">{hint}</p>
      <div className="flex items-end gap-2" style={{ height: BAR_H }}>
        {bars.map((bar) => {
          const barPx = Math.max(Math.round((bar.count / maxVal) * BAR_H), 8);
          const isHov = hovered === bar.name;
          return (
            <div
              key={bar.name}
              title={`${bar.name}: ${bar.count}`}
              className="flex-1 flex flex-col items-center justify-end gap-1 cursor-pointer select-none min-w-0"
              style={{ height: '100%' }}
              onClick={() => onBarClick(bar.name)}
              onMouseEnter={() => setHovered(bar.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Count */}
              <span
                className="text-[11px] font-bold tabular-nums leading-none"
                style={{ color: bar.textColor, opacity: isHov ? 1 : 0.8 }}
              >
                {bar.count}
              </span>
              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  height: barPx,
                  backgroundColor: bar.color,
                  borderRadius: '6px 6px 0 0',
                  opacity: hovered !== null && !isHov ? 0.3 : 1,
                  transform: isHov ? 'scaleY(1.06)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                  transition: 'all 0.18s ease',
                  boxShadow: isHov ? `0 -5px 20px ${bar.color}aa` : 'none',
                }}
              />
              {/* Label */}
              <span
                className="text-[10px] leading-tight text-center font-medium w-full truncate mt-0.5"
                style={{ color: isHov ? bar.textColor : '#6b7280' }}
              >
                {bar.name.length > 8 ? bar.name.slice(0, 7) + '…' : bar.name}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
        {bars.map((bar) => (
          <button
            key={bar.name}
            onClick={() => onBarClick(bar.name)}
            className="inline-flex items-center gap-1.5 text-[11px] hover:opacity-70 transition-opacity"
            style={{ color: bar.textColor }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bar.color }} />
            {bar.name} ({bar.count})
          </button>
        ))}
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DrilldownChart({ departmentStats, employees }: Props) {
  const [mounted, setMounted] = useState(false);
  const [drill, setDrill] = useState<Drill>({ level: 0 });

  useEffect(() => setMounted(true), []);

  // SSR skeleton
  if (!mounted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-3 w-56 bg-gray-100 rounded animate-pulse mb-5" />
        <div className="flex items-end gap-2" style={{ height: BAR_H }}>
          {[55, 90, 40, 70, 50, 80].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-100 rounded-t-md animate-pulse" style={{ height: h }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Level 2: employee list ───────────────────────────────────────────────
  if (drill.level === 2) {
    const { dept, status } = drill;
    const sc = STATUS[status] ?? FALLBACK;
    const dc = DEPT[dept] ?? FALLBACK;
    const matches = employees.filter((e) => e.department === dept && e.status === status);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Breadcrumb drill={drill} setDrill={setDrill} />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {dept} · <span style={{ color: sc.text }}>{status}</span>
          </h3>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ backgroundColor: sc.bg, color: sc.text }}
          >
            {matches.length} employee{matches.length !== 1 ? 's' : ''}
          </span>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No employees found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
            {matches.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border"
                style={{ backgroundColor: dc.bg, borderColor: dc.bar + '44' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: dc.bar }}
                >
                  {getInitials(emp.firstName, emp.lastName)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">{emp.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Level 1: status bars for one dept ────────────────────────────────────
  if (drill.level === 1) {
    const { dept } = drill;
    const deptData = departmentStats.find((d) => d.name === dept);
    const dc = DEPT[dept] ?? FALLBACK;
    const bars: BarItem[] = Object.entries(deptData?.byStatus ?? {})
      .filter(([, v]) => v > 0)
      .map(([name, count]) => {
        const sc = STATUS[name] ?? FALLBACK;
        return { name, count, color: sc.bar, textColor: sc.text };
      });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Breadcrumb drill={drill} setDrill={setDrill} />
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900">{dept} — Status Breakdown</h3>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ backgroundColor: dc.bg, color: dc.text }}
          >
            {deptData?.total} total
          </span>
        </div>
        <BarChart
          bars={bars}
          hint="Click a status bar to see individual employees"
          onBarClick={(name) => setDrill({ level: 2, dept, status: name })}
        />
      </div>
    );
  }

  // ── Level 0: all depts ───────────────────────────────────────────────────
  const deptBars: BarItem[] = departmentStats.map((d) => {
    const dc = DEPT[d.name] ?? FALLBACK;
    return { name: d.name, count: d.total, color: dc.bar, textColor: dc.text };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Headcount by Department</h3>
      <BarChart
        bars={deptBars}
        hint="Click any bar to drill into status breakdown"
        onBarClick={(name) => setDrill({ level: 1, dept: name })}
      />
    </div>
  );
}
