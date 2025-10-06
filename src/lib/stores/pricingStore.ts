import { derived, writable } from 'svelte/store';
import {
  applyElasticity,
  calculateARPU,
  calculateCACPaybackPeriod,
  calculateGrossMargin,
  calculateLTV,
  calculateRawLifetimeValue,
  calculateROIMultiple,
  calculateRevenueProjection,
  calculateTierRevenue,
  normalizeTierShares,
} from '$lib/utils/formulas';
import type {
  AdjustedTier,
  ElasticityAdjustment,
  PricingMetrics,
  PricingTier,
  RevenueProjectionPoint,
  TierRevenueDatum,
} from '$lib/utils/formulas';

export type PricingState = {
  tiers: PricingTier[];
  conversionRate: number;
  churnRate: number;
  cac: number;
  userCount: number;
  elasticity: number;
};

export type PricingComputation = {
  normalizedTiers: PricingTier[];
  elasticity: ElasticityAdjustment;
  adjustedTiers: AdjustedTier[];
  metrics: PricingMetrics;
  tierRevenue: TierRevenueDatum[];
  revenueProjection: RevenueProjectionPoint[];
};

const createTierId = (() => {
  let counter = 0;
  return () => {
    counter += 1;
    return `tier-${counter}`;
  };
})();

const normalizeState = (state: PricingState): PricingState => ({
  ...state,
  tiers: normalizeTierShares(state.tiers),
});

const initialState: PricingState = normalizeState({
  tiers: [
    { id: createTierId(), name: 'Starter', price: 29, share: 0.55 },
    { id: createTierId(), name: 'Pro', price: 79, share: 0.3 },
    { id: createTierId(), name: 'Enterprise', price: 199, share: 0.15 },
  ],
  conversionRate: 0.08,
  churnRate: 0.04,
  cac: 320,
  userCount: 2500,
  elasticity: 0,
});

const createPricingStore = () => {
  const { subscribe, set, update } = writable<PricingState>(initialState);

  return {
    subscribe,
    set,
    reset: () => set(initialState),
    setField<K extends keyof PricingState>(key: K, value: PricingState[K]) {
      update((state) => normalizeState({ ...state, [key]: value }));
    },
    updateTier(id: string, changes: Partial<PricingTier>) {
      update((state) => {
        const tiers = state.tiers.map((tier) => (tier.id === id ? { ...tier, ...changes } : tier));
        return normalizeState({ ...state, tiers });
      });
    },
    addTier() {
      update((state) => {
        const nextIndex = state.tiers.length + 1;
        const newTier: PricingTier = {
          id: createTierId(),
          name: `Tier ${nextIndex}`,
          price: 49,
          share: 1 / (state.tiers.length + 1),
        };
        return normalizeState({ ...state, tiers: [...state.tiers, newTier] });
      });
    },
    removeTier(id: string) {
      update((state) => {
        if (state.tiers.length <= 1) return state;
        const tiers = state.tiers.filter((tier) => tier.id !== id);
        return normalizeState({ ...state, tiers });
      });
    },
  };
};

export const pricingStore = createPricingStore();

const safeNumber = (value: number, fallback = 0) =>
  Number.isFinite(value) && !Number.isNaN(value) ? value : fallback;

export const pricingComputed = derived(pricingStore, ($state): PricingComputation => {
  const normalizedTiers = normalizeTierShares($state.tiers);
  const elasticity = applyElasticity(normalizedTiers, $state.conversionRate, $state.elasticity);
  const adjustedTiers = elasticity.adjustedTiers;
  const arpu = calculateARPU(adjustedTiers);
  const rawLtv = calculateRawLifetimeValue(arpu, $state.churnRate);
  const grossMargin = calculateGrossMargin(rawLtv, $state.cac);
  const ltv = calculateLTV(arpu, $state.churnRate, grossMargin);
  const cacPayback = calculateCACPaybackPeriod($state.cac, arpu, grossMargin);
  const roiMultiple = calculateROIMultiple(ltv, $state.cac);

  const metrics: PricingMetrics = {
    arpu: safeNumber(arpu),
    grossMargin: safeNumber(grossMargin),
    ltv: safeNumber(ltv),
    cacPayback: safeNumber(cacPayback),
    roiMultiple: safeNumber(roiMultiple),
  };

  const tierRevenue = calculateTierRevenue(
    adjustedTiers,
    $state.userCount,
    elasticity.adjustedConversionRate,
  );

  const newCustomersPerMonth = $state.userCount * elasticity.adjustedConversionRate;
  const revenueProjection = calculateRevenueProjection({
    months: 12,
    newCustomersPerMonth,
    initialCustomers: newCustomersPerMonth * 2,
    churnRate: $state.churnRate,
    arpu,
  });

  return {
    normalizedTiers,
    elasticity,
    adjustedTiers,
    metrics,
    tierRevenue,
    revenueProjection,
  };
});
