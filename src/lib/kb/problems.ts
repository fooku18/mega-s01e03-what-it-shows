// The problems inside a merged ticket. causes.ts places a report by its tenant. The reports the desk
// read as a one-day move (desk-notes.json) are a problem of their own, but the desk counts them
// where their tenant files them and footnotes them there (readAs in causes.ts). So do we.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day'];

export const PROBLEM_TITLE: Record<Problem, string> = {
  parser: 'Shared parser reads day-first dates month first',
  hint: 'booking-v3 date hint says MM/DD, the form reads DD/MM',
  'one-day': 'Dates land one day off',
};


export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // Reports also counted under another problem's row: how many, and which one.
  alsoIn?: { problem: Problem | 'unplaced'; reports: number };
};

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = causeOf(r, tenantOf(r)) ?? 'unplaced';
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const oneDay = merged.filter((r) => oneDayMove.includes(r.id));
  if (oneDay.length) by.set('one-day', oneDay);
  const filedUnder = (r: Report) => causeOf(r, tenantOf(r)) ?? 'unplaced';
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
        ...(problem === 'one-day' ? { alsoIn: { problem: filedUnder(rs[0]), reports: rs.length } } : {}),
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
