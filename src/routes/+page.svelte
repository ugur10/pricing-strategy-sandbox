<script lang="ts">
	import Header from '$lib/components/Header.svelte';

	const skeletonBlocks = Array.from({ length: 3 }, (_, idx) => idx);
	const metricPlaceholders = ['ARPU', 'LTV', 'CAC Payback', 'ROI'];
</script>

<main class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col gap-10 px-6 py-12">
	<Header
		title="Pricing Strategy Sandbox"
		subtitle="Experiment with pricing tiers, visualize revenue projections, and fine-tune SaaS unit economics."
	/>

	<section class="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
		<article class="card relative flex flex-col gap-6 p-6">
			<div>
				<h2 class="text-xl font-semibold text-slate-900">Pricing Inputs</h2>
				<p class="mt-1 text-sm text-slate-500">
					Configure customer segments, acquisition assumptions, and retention data.
				</p>
			</div>
			<div class="grid gap-4">
				{#each skeletonBlocks as block (block)}
					<div class="animate-pulse rounded-xl bg-slate-100 p-4">
						<div class="h-3 w-24 rounded-full bg-slate-200/80"></div>
						<div class="mt-3 h-11 rounded-lg bg-slate-200/60"></div>
					</div>
				{/each}
				<div class="animate-pulse rounded-xl bg-slate-100 p-4">
					<div class="h-3 w-32 rounded-full bg-slate-200/80"></div>
					<div class="mt-3 h-24 rounded-lg bg-slate-200/60"></div>
				</div>
			</div>
			<div class="mt-auto text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
				Inputs coming next
			</div>
		</article>

		<article class="flex flex-col gap-6">
			<div class="card flex-1 p-6">
				<h2 class="text-xl font-semibold text-slate-900">Live Insights</h2>
				<p class="mt-1 text-sm text-slate-500">
					Revenue trajectories, ROI, and LTV analysis will render here once inputs are active.
				</p>
				<div class="mt-8 grid gap-4 sm:grid-cols-2">
					{#each metricPlaceholders as label (label)}
						<div class="space-y-2 rounded-2xl border border-dashed border-indigo-200/70 p-4 text-center">
							<p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</p>
							<p class="text-2xl font-semibold text-slate-300">--</p>
						</div>
					{/each}
				</div>
			</div>

			<div class="card p-6">
				<h3 class="text-lg font-medium text-slate-900">Upcoming visualizations</h3>
				<ul class="mt-4 space-y-3 text-sm text-slate-500">
					<li class="flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-brand"></span>
						Animated revenue projection line chart
					</li>
					<li class="flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-indigo-400"></span>
						Pricing tier comparison bars
					</li>
					<li class="flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-indigo-200"></span>
						Sensitivity sliders with real-time feedback
					</li>
				</ul>
			</div>
		</article>
	</section>
</main>
