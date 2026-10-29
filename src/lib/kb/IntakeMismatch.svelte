<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const tagHint = $derived(merged.filter((r) => r.meta.intakeTag === 'hint'));
  const tagHintNotHint = $derived(tagHint.filter((r) => causeOf(r, tenantOf(r)) !== 'hint').length);
  const hint = $derived(merged.filter((r) => causeOf(r, tenantOf(r)) === 'hint'));
  const hintTaggedParser = $derived(hint.filter((r) => r.meta.intakeTag !== 'hint').length);
</script>

<p>
  Intake tagged <strong>{tagHint.length}</strong> reports <code>hint</code>; <strong>{tagHintNotHint}</strong> of them
  are not. Of the <strong>{hint.length}</strong> reports that are <code>hint</code>, intake tagged
  <strong>{hintTaggedParser}</strong> as <code>parser</code>.
</p>
