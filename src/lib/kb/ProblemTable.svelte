<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, PROBLEM_TITLE } from '#lib/kb/problems';

  // `issues`: problem → its ticket in `repo`.
  let { ticket, repo, issues = {} }: { ticket: number; repo: string; issues?: Record<string, number> } = $props();

  const all = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const rows = $derived(reports.filter((r) => r.mergedInto === ticket).length);
  const groups = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{all.length}</strong> reports in #{ticket} ({rows} rows in the export, {rows - all.length} of them a
  repeat of the same id) · <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>came in by</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br />{g.problem === 'unplaced' ? '' : PROBLEM_TITLE[g.problem]}</td>
        <td>{g.reports.length}</td>
        <td class="tags">{channels(g.channels)}</td>
        <td>{g.tenants.length}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if issues[g.problem]}
            <a href="https://github.com/{repo}/issues/{issues[g.problem]}">{repo}#{issues[g.problem]}</a>
          {:else}
            none yet
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  {#if g.oneDay}
    <p class="note">
      {g.oneDay} of the <code>{g.problem}</code> reports read as a one-day move, not a flip; filed under
      <code>{g.problem}</code> by tenant.
    </p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
