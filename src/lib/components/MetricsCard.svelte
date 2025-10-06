<script lang="ts">
  import { spring } from 'svelte/motion';

  type Variant = 'currency' | 'percentage' | 'plain' | 'months' | 'multiple';

  type Delta = {
    label: string;
    positive: boolean;
  };

  type MetricsCardProps = {
    label: string;
    value: number;
    variant?: Variant;
    hint?: string;
    delta?: Delta;
  };

  const props: MetricsCardProps = $props();

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  });

  const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  });

  const formatValue = (value: number, variant: Variant) => {
    if (!Number.isFinite(value)) return '∞';
    switch (variant) {
      case 'currency':
        return currencyFormatter.format(value);
      case 'percentage':
        return percentFormatter.format(value);
      case 'months':
        return `${numberFormatter.format(value)} mo`;
      case 'multiple':
        return `${numberFormatter.format(value)}×`;
      default:
        return numberFormatter.format(value);
    }
  };

  const animatedValue = spring(props.value ?? 0, {
    stiffness: 0.14,
    damping: 0.38,
  });

  $effect(() => {
    animatedValue.set(props.value ?? 0);
  });

  const variant = $derived((props.variant ?? 'plain') as Variant);
  const label = $derived(props.label);
  const hint = $derived(props.hint);
  const delta = $derived(props.delta);
  const formattedValue = $derived(formatValue($animatedValue, variant));
</script>

<div class="card relative overflow-hidden p-6">
  <div
    class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-indigo-500 to-indigo-300"
  ></div>
  <div class="relative space-y-4">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        {label}
      </p>
      <p class="mt-3 text-3xl font-semibold text-slate-900">{formattedValue}</p>
    </div>
    {#if hint}
      <p class="text-sm text-slate-500">{hint}</p>
    {/if}
    {#if delta}
      <div
        class={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${delta.positive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
      >
        <span class={`h-2 w-2 rounded-full ${delta.positive ? 'bg-emerald-500' : 'bg-rose-500'}`}
        ></span>
        {delta.label}
      </div>
    {/if}
  </div>
</div>
