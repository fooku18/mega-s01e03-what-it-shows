<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';

  // The reports with these ids, as they came in.
  let { ids }: { ids: readonly string[] } = $props();

  const picked = $derived(uniqueById(reports as Report[]).filter((r) => ids.includes(r.id)));
</script>

<ul>
  {#each picked as r (r.id)}
    <li><code>{r.id}</code> · {r.receivedAt.slice(0, 10)} · {r.tenant} · {r.channel}: “{r.body}”</li>
  {/each}
</ul>

<style>
  li { margin: 0.35rem 0; }
</style>
