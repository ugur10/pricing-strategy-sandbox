<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import PricingForm from '$lib/components/PricingForm.svelte';
  import Results from '$lib/components/Results.svelte';
</script>

<main class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col gap-10 px-6 py-12">
  <Header
    title="Pricing Strategy Sandbox"
    subtitle="Experiment with pricing tiers, visualize revenue projections, and fine-tune SaaS unit economics."
  />

  <section class="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
    <PricingForm />
    <Results />
  </section>
</main>
