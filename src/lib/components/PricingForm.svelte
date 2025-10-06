<script lang="ts">
  import { pricingStore } from '$lib/stores/pricingStore';
  import type { PricingTier } from '$lib/utils/formulas';

  const state = $derived($pricingStore);
  const tiers = $derived(state.tiers);
  const conversionPercent = $derived((state.conversionRate ?? 0) * 100);
  const churnPercent = $derived((state.churnRate ?? 0) * 100);
  const elasticity = $derived(state.elasticity ?? 0);

  const handleTierChange = (tier: PricingTier, field: keyof PricingTier, value: string) => {
    if (field === 'price' || field === 'share') {
      const parsed = Number.parseFloat(value);
      const safe = Number.isFinite(parsed) ? parsed : 0;
      pricingStore.updateTier(tier.id, {
        [field]: field === 'share' ? Math.max(safe / 100, 0) : safe,
      });
      return;
    }

    pricingStore.updateTier(tier.id, {
      [field]: value,
    });
  };

  const handleConversionChange = (value: string) => {
    const parsed = Number.parseFloat(value);
    const next = Number.isFinite(parsed) ? parsed / 100 : 0;
    pricingStore.setField('conversionRate', Math.min(Math.max(next, 0), 1));
  };

  const handleChurnChange = (value: string) => {
    const parsed = Number.parseFloat(value);
    const next = Number.isFinite(parsed) ? parsed / 100 : 0;
    pricingStore.setField('churnRate', Math.min(Math.max(next, 0), 1));
  };

  const handleCACChange = (value: string) => {
    pricingStore.setField('cac', Number.parseFloat(value) || 0);
  };

  const handleUsersChange = (value: string) => {
    pricingStore.setField('userCount', Math.max(Number.parseInt(value, 10) || 0, 0));
  };

  const handleElasticityChange = (value: string) => {
    const parsed = Number.parseFloat(value);
    const safe = Number.isFinite(parsed) ? parsed : 0;
    pricingStore.setField('elasticity', Math.min(Math.max(safe, -50), 50));
  };
</script>

<form class="card flex flex-col gap-8 p-6" aria-labelledby="pricing-inputs-heading">
  <header class="space-y-2">
    <h2 id="pricing-inputs-heading" class="text-xl font-semibold text-slate-900">Pricing Inputs</h2>
    <p class="text-sm text-slate-500">
      Update tier pricing, acquisition assumptions, and retention drivers to see instant impact.
    </p>
  </header>

  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Tiers</h3>
      <button
        type="button"
        class="btn-primary"
        onclick={() => pricingStore.addTier()}
        aria-label="Add pricing tier"
      >
        + Add tier
      </button>
    </div>

    <div class="space-y-4">
      {#each tiers as tier (tier.id)}
        <div
          class="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-lg"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Tier name
              <input
                class="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base font-semibold text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={tier.name}
                oninput={(event) =>
                  handleTierChange(tier, 'name', (event.target as HTMLInputElement).value)}
              />
            </label>

            <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Monthly price (USD)
              <input
                class="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                type="number"
                min="0"
                step="1"
                value={tier.price}
                oninput={(event) =>
                  handleTierChange(tier, 'price', (event.target as HTMLInputElement).value)}
              />
            </label>
          </div>

          <div class="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
            <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Share of conversions
              <div class="flex items-center gap-2">
                <input
                  class="h-11 w-24 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(tier.share * 100)}
                  oninput={(event) =>
                    handleTierChange(tier, 'share', (event.target as HTMLInputElement).value)}
                />
                <span class="text-sm text-slate-500">% of converted users</span>
              </div>
            </label>

            <div class="flex justify-end gap-3">
              <div
                class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-indigo-600"
              >
                {(tier.share * 100).toFixed(1)}%
              </div>
              {#if tiers.length > 1}
                <button
                  type="button"
                  class="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                  onclick={() => pricingStore.removeTier(tier.id)}
                >
                  Remove
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <p class="text-xs text-slate-400">
      Tier shares are normalized automatically to always sum to 100%.
    </p>
  </section>

  <section class="grid gap-6 md:grid-cols-2">
    <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
      Conversion rate (%)
      <input
        class="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={conversionPercent.toFixed(1)}
        oninput={(event) => handleConversionChange((event.target as HTMLInputElement).value)}
      />
    </label>

    <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
      Churn rate (% monthly)
      <input
        class="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={churnPercent.toFixed(1)}
        oninput={(event) => handleChurnChange((event.target as HTMLInputElement).value)}
      />
    </label>

    <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
      CAC (USD)
      <input
        class="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        type="number"
        min="0"
        step="1"
        value={state.cac}
        oninput={(event) => handleCACChange((event.target as HTMLInputElement).value)}
      />
    </label>

    <label class="flex flex-col gap-2 text-sm font-medium text-slate-600">
      Monthly audience (users)
      <input
        class="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        type="number"
        min="0"
        step="1"
        value={state.userCount}
        oninput={(event) => handleUsersChange((event.target as HTMLInputElement).value)}
      />
    </label>
  </section>

  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Elasticity</h3>
      <span class="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
        {elasticity.toFixed(1)} sensitivity
      </span>
    </div>

    <div class="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
      <label class="flex flex-col gap-3 text-sm text-slate-600">
        Demand sensitivity (−50 to +50)
        <input
          class="accent-brand"
          type="range"
          min="-50"
          max="50"
          step="1"
          value={elasticity}
          oninput={(event) => handleElasticityChange((event.target as HTMLInputElement).value)}
        />
        <div
          class="flex justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-400"
        >
          <span>Discount driven</span>
          <span>Price inelastic</span>
        </div>
      </label>
      <p class="mt-3 text-xs text-slate-500">
        Negative values simulate discount-driven buyers, while positive values model resilience to
        price changes.
      </p>
    </div>
  </section>
</form>
