<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { Chart as ChartInstance, ChartOptions } from 'chart.js';
  import type { RevenueProjectionPoint, TierRevenueDatum } from '$lib/utils/formulas';

  type ChartsProps = {
    revenueProjection: RevenueProjectionPoint[];
    tierRevenue: TierRevenueDatum[];
  };

  const props: ChartsProps = $props();

  type ChartFactory = typeof import('chart.js/auto').default;

  let ChartCtor: ChartFactory | null = null;
  let lineCanvas: HTMLCanvasElement | null = null;
  let barCanvas: HTMLCanvasElement | null = null;
  let lineChart: ChartInstance | null = null;
  let barChart: ChartInstance | null = null;

  const palette = ['#4C51BF', '#7F9CF5', '#A3BFFA', '#C3DAFE', '#E9D8FD'];

  const buildLineData = (projection: RevenueProjectionPoint[]) => ({
    labels: projection.map((point) => `M${point.month}`),
    datasets: [
      {
        label: 'Monthly Recurring Revenue',
        data: projection.map((point) => Math.round(point.revenue)),
        fill: false,
        borderColor: '#4C51BF',
        backgroundColor: 'rgba(76, 81, 191, 0.15)',
        tension: 0.35,
        borderWidth: 3,
      },
      {
        label: 'Cumulative Revenue',
        data: projection.map((point) => Math.round(point.cumulativeRevenue)),
        borderColor: '#7F9CF5',
        backgroundColor: 'rgba(127, 156, 245, 0.1)',
        borderDash: [6, 6],
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  });

  const buildBarData = (tiers: TierRevenueDatum[]) => ({
    labels: tiers.map((tier) => tier.name),
    datasets: [
      {
        label: 'Monthly Revenue by Tier',
        data: tiers.map((tier) => Math.round(tier.revenue)),
        backgroundColor: tiers.map((_, index) => palette[index % palette.length]),
        borderRadius: 12,
        barPercentage: 0.65,
      },
    ],
  });

  const baseLineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#1e293b',
          boxWidth: 12,
          boxHeight: 12,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5f5',
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#475569',
          font: {
            weight: 500,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.15)',
        },
        ticks: {
          color: '#475569',
          callback: (value: number | string) => `$${value}`,
        },
      },
    },
    animation: {
      duration: 700,
      easing: 'easeOutCubic',
    },
  };

  const baseBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5f5',
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#475569',
          font: {
            weight: 500,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.15)',
        },
        ticks: {
          color: '#475569',
          callback: (value: number | string) => `$${value}`,
        },
      },
    },
    animation: {
      duration: 600,
      easing: 'easeOutCubic',
    },
  };

  const renderCharts = async () => {
    if (!browser || !lineCanvas || !barCanvas) return;
    if (!ChartCtor) {
      const module = await import('chart.js/auto');
      ChartCtor = module.default;
    }

    if (lineChart) lineChart.destroy();
    if (barChart) barChart.destroy();

    lineChart = new ChartCtor(lineCanvas, {
      type: 'line',
      data: buildLineData(props.revenueProjection ?? []),
      options: baseLineOptions,
    });

    barChart = new ChartCtor(barCanvas, {
      type: 'bar',
      data: buildBarData(props.tierRevenue ?? []),
      options: baseBarOptions,
    });
  };

  const refreshCharts = () => {
    if (lineChart) {
      lineChart.data = buildLineData(props.revenueProjection ?? []);
      lineChart.update();
    }
    if (barChart) {
      barChart.data = buildBarData(props.tierRevenue ?? []);
      barChart.update();
    }
  };

  onMount(() => {
    void renderCharts();
    return () => {
      lineChart?.destroy();
      barChart?.destroy();
    };
  });

  $effect(() => {
    props.revenueProjection;
    props.tierRevenue;
    refreshCharts();
  });
</script>

<div class="space-y-8">
  <div class="card glass-card animate-rise flex min-h-[24rem] flex-col overflow-hidden p-8">
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-lg font-semibold text-slate-900">Revenue Over Time</h3>
      <span class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">12 months</span>
    </div>
    <p class="mt-1 text-sm text-slate-500">
      Monthly recurring revenue and cumulative trajectory based on your pricing mix.
    </p>
    <div class="mt-6 flex-1">
      <canvas class="h-[20rem] w-full" bind:this={lineCanvas}></canvas>
    </div>
  </div>
  <div class="card glass-card animate-rise flex min-h-[24rem] flex-col overflow-hidden p-8">
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-lg font-semibold text-slate-900">Tier Contribution</h3>
      <span class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">MRR</span>
    </div>
    <p class="mt-1 text-sm text-slate-500">
      Visualize the monthly revenue generated by each tier after elasticity adjustments.
    </p>
    <div class="mt-6 flex-1">
      <canvas class="h-[20rem] w-full" bind:this={barCanvas}></canvas>
    </div>
  </div>
</div>
