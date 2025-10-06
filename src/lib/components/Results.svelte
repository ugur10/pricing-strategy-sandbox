<script lang="ts">
  import Charts from '$lib/components/Charts.svelte';
  import { fade } from 'svelte/transition';
  import MetricsCard from '$lib/components/MetricsCard.svelte';
  import { pricingComputed, pricingStore } from '$lib/stores/pricingStore';
  import type { TierRevenueDatum } from '$lib/utils/formulas';

  const computed = $derived($pricingComputed);
  const state = $derived($pricingStore);

  const metrics = $derived(computed.metrics);
  const tierRevenue = $derived(computed.tierRevenue);
  const revenueProjection = $derived(computed.revenueProjection);
  const adjustedTiers = $derived(computed.adjustedTiers);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value));

  const formatCurrency = (value: number) =>
    Number.isFinite(value)
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(value)
      : '∞';

  const formatPercent = (value: number) =>
    `${Number.isFinite(value) ? (value * 100).toFixed(1) : '∞'}%`;

  const averageTicket = $derived(
    tierRevenue.reduce((total, tier) => total + tier.revenue, 0) /
      Math.max(
        tierRevenue.reduce((total, tier) => total + tier.customers, 0),
        1,
      ),
  );

  const topTier = $derived(
    tierRevenue.slice().sort((a, b) => b.revenue - a.revenue)[0] as TierRevenueDatum | undefined,
  );
</script>

<section class="flex flex-col gap-10">
  <div class="card glass-card animate-rise space-y-6 p-7">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Live Insights</h2>
        <p class="text-sm text-slate-500">
          Key SaaS unit economics refreshed in real time as inputs shift.
        </p>
      </div>
      <div class="pill-highlight">
        {formatNumber(state.userCount * state.conversionRate)} expected customers
      </div>
    </header>

    <div class="grid-auto-fit grid gap-5" aria-live="polite">
      <div class="animate-fade-in" in:fade={{ duration: 180, delay: 40 }}>
        <MetricsCard
          label="ARPU"
          value={metrics.arpu}
          variant="currency"
          hint="Weighted average monthly revenue per converted user."
        />
      </div>
      <div class="animate-fade-in" in:fade={{ duration: 180, delay: 80 }}>
        <MetricsCard
          label="Lifetime Value"
          value={metrics.ltv}
          variant="currency"
          hint={`Gross margin adjusted retention value at ${(state.churnRate * 100).toFixed(1)}% churn.`}
        />
      </div>
      <div class="animate-fade-in" in:fade={{ duration: 180, delay: 120 }}>
        <MetricsCard
          label="Gross Margin"
          value={metrics.grossMargin}
          variant="percentage"
          hint="Contribution margin after CAC amortization."
        />
      </div>
      <div class="animate-fade-in" in:fade={{ duration: 180, delay: 160 }}>
        <MetricsCard
          label="CAC Payback"
          value={metrics.cacPayback}
          variant="months"
          hint="Months to recover customer acquisition cost."
        />
      </div>
      <div class="animate-fade-in" in:fade={{ duration: 180, delay: 200 }}>
        <MetricsCard
          label="ROI Multiple"
          value={metrics.roiMultiple}
          variant="multiple"
          hint="Lifetime value divided by CAC."
        />
      </div>
      <div class="animate-fade-in" in:fade={{ duration: 180, delay: 240 }}>
        <MetricsCard
          label="Average Ticket"
          value={averageTicket}
          variant="currency"
          hint="Blended revenue per customer across your mix."
        />
      </div>
    </div>
  </div>

  <Charts {revenueProjection} {tierRevenue} />

  <div class="card glass-card animate-rise space-y-6 p-6 text-sm text-slate-600">
    <h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Current levers</h3>
    <p>
      <span class="font-semibold text-slate-900">Conversion rate:</span>
      <span class="ml-1">{(state.conversionRate * 100).toFixed(1)}%</span>
    </p>
    <p>
      <span class="font-semibold text-slate-900">Churn rate:</span>
      <span class="ml-1">{(state.churnRate * 100).toFixed(1)}%</span>
    </p>
    <p>
      <span class="font-semibold text-slate-900">CAC:</span>
      <span class="ml-1">{formatCurrency(state.cac)}</span>
    </p>
    <p>
      <span class="font-semibold text-slate-900">Monthly audience:</span>
      <span class="ml-1">{formatNumber(state.userCount)}</span>
    </p>
  </div>

  <div class="card glass-card animate-rise space-y-4 p-6 text-sm text-slate-600">
    <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
      Elasticity impact
    </h3>
    <p class="flex flex-wrap items-center gap-2 text-slate-600">
      <span>Price adjustment:</span>
      <span class="font-semibold text-slate-900">
        {(computed.elasticity.priceAdjustment * 100 - 100).toFixed(1)}%
      </span>
      <span class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">·</span>
      <span>Conversion lift:</span>
      <span class="font-semibold text-slate-900">
        {(computed.elasticity.conversionMultiplier * 100 - 100).toFixed(1)}%
      </span>
    </p>
    <p class="text-xs text-slate-500">
      Higher elasticity reduces price but boosts conversion. Positive elasticity indicates you
      can raise price with limited drop-off.
    </p>
  </div>

  <div class="card glass-card animate-rise space-y-7 p-7">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">Tier Breakdown</h3>
        <p class="text-sm text-slate-500">
          Compare expected customers, pricing, and revenue contribution per tier.
        </p>
      </div>
      {#if topTier}
        <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          {topTier.name} drives {formatPercent(
            topTier.revenue / tierRevenue.reduce((total, tier) => total + tier.revenue, 0),
          )} of MRR
        </span>
      {/if}
    </header>

    <div class="overflow-hidden rounded-2xl border border-slate-200/80 shadow-inner">
      <table class="min-w-full divide-y divide-slate-200">
        <thead
          class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
        >
          <tr>
            <th scope="col" class="px-4 py-3">Tier</th>
            <th scope="col" class="px-4 py-3">Price</th>
            <th scope="col" class="px-4 py-3">Share</th>
            <th scope="col" class="px-4 py-3">Customers</th>
            <th scope="col" class="px-4 py-3">MRR</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-sm text-slate-600">
          {#each tierRevenue as tier (tier.id)}
            <tr class="transition hover:bg-indigo-50/60">
              <td class="px-4 py-3 font-semibold text-slate-900">{tier.name}</td>
              <td class="px-4 py-3">{formatCurrency(tier.adjustedPrice)}</td>
              <td class="px-4 py-3"
                >{formatPercent(adjustedTiers.find((item) => item.id === tier.id)?.share ?? 0)}</td
              >
              <td class="px-4 py-3">{formatNumber(tier.customers)}</td>
              <td class="px-4 py-3 font-semibold text-slate-900">{formatCurrency(tier.revenue)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="card glass-card animate-rise space-y-3 p-6 text-sm text-slate-600">
    <h4 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Operating notes</h4>
    <ul class="space-y-2 leading-relaxed">
      <li>
        <span class="font-semibold text-slate-900">{formatNumber(state.userCount)}</span>
        prospects with
        <span class="font-semibold text-slate-900">{(state.conversionRate * 100).toFixed(1)}%</span>
        conversion generate
        <span class="font-semibold text-slate-900"
          >{formatNumber(state.userCount * state.conversionRate)}</span
        >
        new customers monthly.
      </li>
      <li>
        CAC of <span class="font-semibold text-slate-900">{formatCurrency(state.cac)}</span>
        yields an ROI multiple of
        <span class="font-semibold text-slate-900">{metrics.roiMultiple.toFixed(2)}×</span>.
      </li>
      <li>
        Average ticket of <span class="font-semibold text-slate-900"
          >{formatCurrency(averageTicket)}</span
        >
        reflects the weighted mix across tiers.
      </li>
    </ul>
  </div>
</section>
