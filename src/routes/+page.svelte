<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import PricingForm from '$lib/components/PricingForm.svelte';
</script>

<main class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col gap-10 px-6 py-12">
  <Header
    title="Pricing Strategy Sandbox"
    subtitle="Experiment with pricing tiers, visualize revenue projections, and fine-tune SaaS unit economics."
  />

  <section class="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
    <PricingForm />
    <aside class="card flex flex-col gap-6 p-6">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Insights Preview</h2>
        <p class="mt-1 text-sm text-slate-500">
          KPI dashboards, charts, and sensitivity analysis will render here in the next update.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        {#each ['ARPU', 'LTV', 'CAC Payback', 'ROI'] as label (label)}
          <div
            class="space-y-2 rounded-2xl border border-dashed border-indigo-200/70 p-4 text-center"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</p>
            <p class="text-2xl font-semibold text-slate-300">--</p>
          </div>
        {/each}
      </div>
      <div class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-500">
        <p class="font-medium text-slate-600">What’s next?</p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Animated revenue projection chart</li>
          <li>Tier contribution bar chart</li>
          <li>Interactive KPI cards with live metrics</li>
        </ul>
      </div>
    </aside>
  </section>
</main>
