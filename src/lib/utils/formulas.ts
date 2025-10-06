import { cubicOut } from 'svelte/easing';

export type PricingTier = {
  id: string;
  name: string;
  price: number;
  share: number;
};

export type AdjustedTier = PricingTier & {
  adjustedPrice: number;
};

export type ElasticityAdjustment = {
  adjustedTiers: AdjustedTier[];
  adjustedConversionRate: number;
  priceAdjustment: number;
  conversionMultiplier: number;
};

export type TierRevenueDatum = {
  id: string;
  name: string;
  customers: number;
  revenue: number;
  adjustedPrice: number;
};

export type RevenueProjectionPoint = {
  month: number;
  customers: number;
  revenue: number;
  cumulativeRevenue: number;
};

export type PricingMetrics = {
  arpu: number;
  grossMargin: number;
  ltv: number;
  cacPayback: number;
  roiMultiple: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Normalizes tier share values so they always add up to 1. */
export const normalizeTierShares = (tiers: PricingTier[]): PricingTier[] => {
  if (tiers.length === 0) return tiers;
  const totalShare = tiers.reduce((total, tier) => total + tier.share, 0);
  if (totalShare <= 0) {
    const evenShare = 1 / tiers.length;
    return tiers.map((tier) => ({ ...tier, share: evenShare }));
  }
  return tiers.map((tier) => ({ ...tier, share: tier.share / totalShare }));
};

/** Applies a price elasticity adjustment to tier pricing and conversion rate. */
export const applyElasticity = (
  tiers: PricingTier[],
  baseConversionRate: number,
  elasticity: number,
): ElasticityAdjustment => {
  const priceAdjustment = clamp(1 - elasticity / 100, 0.3, 1.7);
  const conversionMultiplier = clamp(1 + (elasticity / 100) * 0.6, 0.2, 1.8);
  const adjustedConversionRate = clamp(baseConversionRate * conversionMultiplier, 0, 1);
  const adjustedTiers = tiers.map((tier) => ({
    ...tier,
    adjustedPrice: Math.max(tier.price * priceAdjustment, 0),
  }));

  return {
    adjustedTiers,
    adjustedConversionRate,
    priceAdjustment,
    conversionMultiplier,
  };
};

/** Calculates the weighted ARPU based on tier composition and adjusted pricing. */
export const calculateARPU = (tiers: AdjustedTier[]): number =>
  tiers.reduce((total, tier) => total + tier.adjustedPrice * tier.share, 0);

/** Calculates raw (pre-margin) lifetime value. */
export const calculateRawLifetimeValue = (arpu: number, churnRate: number): number => {
  if (churnRate <= 0) return arpu * 24; // fallback assumption for extremely low churn
  return arpu / churnRate;
};

/** Estimates gross margin by amortizing acquisition costs across LTV. */
export const calculateGrossMargin = (rawLtv: number, cac: number): number => {
  if (!Number.isFinite(rawLtv) || rawLtv <= 0) return 0;
  const margin = 1 - cac / rawLtv;
  return clamp(Number.isFinite(margin) ? margin : 0, 0, 0.95);
};

/** Calculates lifetime value with gross margin applied. */
export const calculateLTV = (arpu: number, churnRate: number, grossMargin: number): number => {
  if (churnRate <= 0) return Infinity;
  return (arpu * grossMargin) / churnRate;
};

/** Calculates the CAC payback period in months. */
export const calculateCACPaybackPeriod = (
  cac: number,
  arpu: number,
  grossMargin: number,
): number => {
  const monthlyGrossProfit = arpu * grossMargin;
  if (monthlyGrossProfit <= 0) return Infinity;
  return cac / monthlyGrossProfit;
};

/** Calculates ROI multiple as LTV divided by CAC. */
export const calculateROIMultiple = (ltv: number, cac: number): number => {
  if (cac <= 0) return Infinity;
  return ltv / cac;
};

/** Builds tier-level revenue data for bar chart visualization. */
export const calculateTierRevenue = (
  tiers: AdjustedTier[],
  totalUsers: number,
  conversionRate: number,
): TierRevenueDatum[] => {
  const convertedUsers = totalUsers * conversionRate;
  return tiers.map((tier) => {
    const customers = convertedUsers * tier.share;
    return {
      id: tier.id,
      name: tier.name,
      customers,
      revenue: customers * tier.adjustedPrice,
      adjustedPrice: tier.adjustedPrice,
    };
  });
};

type ProjectionArgs = {
  months?: number;
  newCustomersPerMonth: number;
  initialCustomers: number;
  churnRate: number;
  arpu: number;
};

/** Generates a monthly recurring revenue projection. */
export const calculateRevenueProjection = ({
  months = 12,
  newCustomersPerMonth,
  initialCustomers,
  churnRate,
  arpu,
}: ProjectionArgs): RevenueProjectionPoint[] => {
  const results: RevenueProjectionPoint[] = [];
  let customers = initialCustomers;
  let cumulativeRevenue = 0;

  for (let month = 1; month <= months; month += 1) {
    customers = customers * (1 - churnRate) + newCustomersPerMonth;
    const revenue = customers * arpu;
    cumulativeRevenue += revenue;
    results.push({
      month,
      customers,
      revenue,
      cumulativeRevenue,
    });
  }

  return results;
};

/** Smoothly interpolates between two numbers for metric animations. */
export const tweenValue = (from: number, to: number, progress: number): number => {
  const eased = cubicOut(clamp(progress, 0, 1));
  return from + (to - from) * eased;
};
