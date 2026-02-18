// Commission calculation service — NZ real estate focused
// All amounts are EXCLUDING GST unless explicitly stated

export const GST_RATE = 0.15;

export interface CommissionTier {
  threshold: number;
  rate: number;
}

export interface CommissionRuleConfig {
  deal_type: 'business_sale' | 'lease' | 'property_sale';
  minimum_commission: number; // excl GST
  tiers: CommissionTier[];
  user_share_percent: number;
  company_share_percent: number;
  on_top_fee_from_gross: boolean;
}

export interface DealInput {
  deal_type: 'business_sale' | 'lease' | 'property_sale';
  sale_price?: number;
  annual_rent_excl_gst?: number;
  probability: number;
  override_type?: 'minimum' | 'percentage' | null;
  override_value?: number;
}

export interface UserSplits {
  business_sale_user_share: number;
  business_sale_company_share: number;
  lease_user_share: number;
  lease_company_share: number;
  property_sale_user_share: number;
  property_sale_company_share: number;
  withholding_rate: number;
}

export const DEFAULT_SPLITS: UserSplits = {
  business_sale_user_share: 0.75,
  business_sale_company_share: 0.25,
  lease_user_share: 0.80,
  lease_company_share: 0.20,
  property_sale_user_share: 0.75,
  property_sale_company_share: 0.25,
  withholding_rate: 0.20,
};

export interface CommissionBreakdown {
  gross_commission_excl_gst: number;
  gst_on_commission: number;
  on_top_fee: number;
  commission_after_fee: number;
  user_share_excl_gst: number;
  company_share_excl_gst: number;
  estimated_tax: number;
  net_to_user_after_tax: number;
}

/** Calculate on-top fee for The Network: MAX(1650, 0.06 * gross) — NO cap */
export function calculateOnTopFee(grossCommissionExclGst: number): number {
  return Math.max(1650, 0.06 * grossCommissionExclGst);
}

/** Calculate tiered commission for business/property sales */
export function calculateTieredCommission(salePrice: number, tiers: CommissionTier[]): number {
  if (!tiers.length) return 0;
  const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);
  let commission = 0;
  let remaining = salePrice;

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    const nextThreshold = i < sorted.length - 1 ? sorted[i + 1].threshold : Infinity;
    const bracket = Math.min(remaining, nextThreshold - tier.threshold);
    if (bracket <= 0) break;
    commission += bracket * tier.rate;
    remaining -= bracket;
  }

  return commission;
}

/** Calculate lease commission: max(minimum, annual_rent / 6) */
export function calculateLeaseCommission(
  annualRentExclGst: number,
  minimumCommission: number
): number {
  const twoMonthsRent = annualRentExclGst / 6;
  return Math.max(twoMonthsRent, minimumCommission);
}

/** Get user/company split percents for a deal type from user splits */
export function getSplitsForType(dealType: string, splits: UserSplits) {
  switch (dealType) {
    case 'lease':
      return { user: splits.lease_user_share, company: splits.lease_company_share };
    case 'property_sale':
      return { user: splits.property_sale_user_share, company: splits.property_sale_company_share };
    default:
      return { user: splits.business_sale_user_share, company: splits.business_sale_company_share };
  }
}

/** Full commission breakdown for a deal */
export function calculateDealCommission(
  deal: DealInput,
  rule: CommissionRuleConfig,
  splits: UserSplits
): CommissionBreakdown {
  let gross = 0;

  if (deal.override_type === 'minimum') {
    gross = deal.override_value ?? rule.minimum_commission;
  } else if (deal.override_type === 'percentage' && deal.override_value) {
    const base = deal.deal_type === 'lease'
      ? (deal.annual_rent_excl_gst ?? 0)
      : (deal.sale_price ?? 0);
    gross = base * deal.override_value;
  } else if (deal.deal_type === 'lease') {
    gross = calculateLeaseCommission(
      deal.annual_rent_excl_gst ?? 0,
      rule.minimum_commission
    );
  } else {
    const tieredAmount = calculateTieredCommission(deal.sale_price ?? 0, rule.tiers);
    gross = Math.max(tieredAmount, rule.minimum_commission);
  }

  const gst = gross * GST_RATE;
  const fee = calculateOnTopFee(gross);
  const afterFee = gross - fee;
  const { user: userPct, company: companyPct } = getSplitsForType(deal.deal_type, splits);
  const userShare = afterFee * userPct;
  const companyShare = afterFee * companyPct;
  const tax = userShare * splits.withholding_rate;
  const net = userShare - tax;

  return {
    gross_commission_excl_gst: Math.round(gross * 100) / 100,
    gst_on_commission: Math.round(gst * 100) / 100,
    on_top_fee: Math.round(fee * 100) / 100,
    commission_after_fee: Math.round(afterFee * 100) / 100,
    user_share_excl_gst: Math.round(userShare * 100) / 100,
    company_share_excl_gst: Math.round(companyShare * 100) / 100,
    estimated_tax: Math.round(tax * 100) / 100,
    net_to_user_after_tax: Math.round(net * 100) / 100,
  };
}

/** Default commission rules */
export const DEFAULT_BUSINESS_SALE_RULE: CommissionRuleConfig = {
  deal_type: 'business_sale',
  minimum_commission: 23500,
  tiers: [
    { threshold: 0, rate: 0.09 },
    { threshold: 1000000, rate: 0.07 },
  ],
  user_share_percent: 0.75,
  company_share_percent: 0.25,
  on_top_fee_from_gross: true,
};

export const DEFAULT_LEASE_RULE: CommissionRuleConfig = {
  deal_type: 'lease',
  minimum_commission: 12500,
  tiers: [],
  user_share_percent: 0.80,
  company_share_percent: 0.20,
  on_top_fee_from_gross: true,
};

export const DEFAULT_PROPERTY_SALE_RULE: CommissionRuleConfig = {
  deal_type: 'property_sale',
  minimum_commission: 23500,
  tiers: [
    { threshold: 0, rate: 0.09 },
    { threshold: 1000000, rate: 0.07 },
  ],
  user_share_percent: 0.75,
  company_share_percent: 0.25,
  on_top_fee_from_gross: true,
};

/** Scenario engine — generate deals needed to hit goal */
export interface ScenarioInput {
  targetNetAmount: number;
  splits: UserSplits;
  probabilityThreshold: number;
  dealTypes: ('business_sale' | 'lease' | 'property_sale')[];
}

export interface ScenarioResult {
  type: 'conservative' | 'realistic' | 'aggressive';
  deals: { deal_type: string; sale_price?: number; annual_rent?: number; count: number }[];
  totalGross: number;
  totalFees: number;
  totalUserShare: number;
  totalTax: number;
  totalNet: number;
  assumptions: string[];
}

export function generateScenarios(input: ScenarioInput): ScenarioResult[] {
  const { targetNetAmount, splits } = input;
  const scenarios: ScenarioResult[] = [];
  const userPct = splits.business_sale_user_share;
  const whr = splits.withholding_rate;
  const whrLabel = `${(whr * 100).toFixed(0)}% withholding`;

  // Conservative: minimum commission deals only
  const minGross = DEFAULT_BUSINESS_SALE_RULE.minimum_commission;
  const minFee = calculateOnTopFee(minGross);
  const minAfterFee = minGross - minFee;
  const minUserShare = minAfterFee * userPct;
  const minNet = minUserShare * (1 - whr);
  const conservativeCount = Math.ceil(targetNetAmount / minNet);

  scenarios.push({
    type: 'conservative',
    deals: [{ deal_type: 'business_sale', sale_price: 250000, count: conservativeCount }],
    totalGross: minGross * conservativeCount,
    totalFees: minFee * conservativeCount,
    totalUserShare: minUserShare * conservativeCount,
    totalTax: minUserShare * whr * conservativeCount,
    totalNet: minNet * conservativeCount,
    assumptions: [
      `${conservativeCount} deals at minimum commission ($${minGross.toLocaleString()})`,
      `${(userPct * 100).toFixed(0)}/${((1 - userPct) * 100).toFixed(0)} split, fee deducted from gross`,
      whrLabel,
    ],
  });

  // Realistic: mix of minimum + mid-size deals
  const midGross = calculateTieredCommission(600000, DEFAULT_BUSINESS_SALE_RULE.tiers);
  const midFee = calculateOnTopFee(midGross);
  const midAfterFee = midGross - midFee;
  const midUserShare = midAfterFee * userPct;
  const midNet = midUserShare * (1 - whr);
  let remaining = targetNetAmount;
  const midCount = Math.floor(targetNetAmount / midNet / 2);
  remaining -= midNet * midCount;
  const extraMinCount = Math.ceil(remaining / minNet);

  scenarios.push({
    type: 'realistic',
    deals: [
      { deal_type: 'business_sale', sale_price: 600000, count: midCount },
      { deal_type: 'business_sale', sale_price: 250000, count: extraMinCount },
    ],
    totalGross: midGross * midCount + minGross * extraMinCount,
    totalFees: midFee * midCount + minFee * extraMinCount,
    totalUserShare: midUserShare * midCount + minUserShare * extraMinCount,
    totalTax: (midUserShare * midCount + minUserShare * extraMinCount) * whr,
    totalNet: midNet * midCount + minNet * extraMinCount,
    assumptions: [
      `${midCount} deals at $600k (commission $${midGross.toLocaleString()})`,
      `${extraMinCount} deals at minimum commission`,
      `${(userPct * 100).toFixed(0)}/${((1 - userPct) * 100).toFixed(0)} split, fee deducted from gross`,
      whrLabel,
    ],
  });

  // Aggressive: larger deals
  const largeGross = calculateTieredCommission(1500000, DEFAULT_BUSINESS_SALE_RULE.tiers);
  const largeFee = calculateOnTopFee(largeGross);
  const largeAfterFee = largeGross - largeFee;
  const largeUserShare = largeAfterFee * userPct;
  const largeNet = largeUserShare * (1 - whr);
  const largeCount = Math.ceil(targetNetAmount / largeNet);

  scenarios.push({
    type: 'aggressive',
    deals: [{ deal_type: 'business_sale', sale_price: 1500000, count: largeCount }],
    totalGross: largeGross * largeCount,
    totalFees: largeFee * largeCount,
    totalUserShare: largeUserShare * largeCount,
    totalTax: largeUserShare * whr * largeCount,
    totalNet: largeNet * largeCount,
    assumptions: [
      `${largeCount} deals at $1.5M (commission $${largeGross.toLocaleString()})`,
      `${(userPct * 100).toFixed(0)}/${((1 - userPct) * 100).toFixed(0)} split, fee deducted from gross`,
      whrLabel,
    ],
  });

  return scenarios;
}

/** Format currency NZD */
export function formatNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNZDPrecise(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
