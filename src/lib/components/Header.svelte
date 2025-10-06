<script lang="ts">
  const { title, subtitle } = $props<{ title: string; subtitle?: string }>();
</script>

<header class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-brand shadow-inner"
      >
        <span class="text-2xl font-bold">PS</span>
      </div>
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {#if subtitle}
          <p class="mt-1 text-sm text-slate-500">{subtitle}</p>
        {/if}
      </div>
    </div>
    <a
      class="btn-primary shadow-card"
      href="https://github.com/ugury/pricing-strategy-sandbox"
      rel="noreferrer"
      target="_blank"
    >
      View Source
    </a>
  </div>
  <div
    class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-indigo-500 p-[1px]"
  >
    <div class="rounded-[calc(theme(borderRadius.3xl)-1px)] bg-white/80 p-6 backdrop-blur">
      <p class="max-w-2xl text-base text-slate-600">
        Model multiple pricing tiers, simulate subscription metrics, and visualize how shifts in
        conversion, churn, and discount sensitivity impact revenue growth over time.
      </p>
    </div>
  </div>
</header>
