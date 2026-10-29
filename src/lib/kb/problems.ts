// The problems inside a merged ticket, one ticket each. causes.ts places a report by its tenant.
// The reports the desk read as a one-day move (desk-notes.json) stay where their tenant files them
// and are footnoted there, as the desk counts them (readAs in causes.ts).
import { causeOf, readAs, uniqueById, type Cause, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export const PROBLEM_TITLE: Record<Cause, string> = {
  parser: 'Shared parser reads day-first dates month first',
  hint: 'booking-v3 form hints MM/DD/YYYY but reads the date day first',
};

export type ProblemGroup = {
  problem: CauseGroup['cause'];
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // Of these, how many the desk read as a one-day move.
  oneDay: number;
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
        oneDay: readAs({ reports: rs } as CauseGroup, oneDayMove),
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
