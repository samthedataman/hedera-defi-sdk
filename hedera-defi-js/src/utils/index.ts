/**
 * Utility functions for Hedera DeFi SDK
 */

/**
 * Parse Hedera timestamp (nanoseconds) to Date
 */
export function parseTimestamp(timestamp?: string | number): Date | undefined {
  if (timestamp === undefined || timestamp === null || timestamp === '') {
    return undefined;
  }
  
  try {
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    
    // Check if parsing resulted in NaN
    if (isNaN(timestampNum)) {
      return undefined;
    }
    
    // Convert nanoseconds to milliseconds
    const milliseconds = timestampNum / 1_000_000;
    const date = new Date(milliseconds);
    
    // Check if the resulting date is valid
    if (isNaN(date.getTime())) {
      return undefined;
    }
    
    return date;
  } catch (error) {
    return undefined;
  }
}

/**
 * Format number with commas and decimals
 */
export function formatNumber(
  value: number, 
  decimals: number = 2, 
  currencySymbol: string = ''
): string {
  if (value >= 1_000_000_000) {
    return `${currencySymbol}${(value / 1_000_000_000).toFixed(decimals)}B`;
  } else if (value >= 1_000_000) {
    return `${currencySymbol}${(value / 1_000_000).toFixed(decimals)}M`;
  } else if (value >= 1_000) {
    return `${currencySymbol}${(value / 1_000).toFixed(decimals)}K`;
  } else {
    return `${currencySymbol}${value.toFixed(decimals)}`;
  }
}

/**
 * Convert APR to APY (compounding calculation)
 */
export function calculateApy(apr: number, compoundsPerYear: number = 365): number {
  if (apr < 0 || compoundsPerYear <= 0) {
    return 0;
  }
  
  return ((1 + apr / compoundsPerYear) ** compoundsPerYear - 1) * 100;
}

/**
 * Calculate impermanent loss
 */
export function calculateImpermanentLoss(
  priceRatioChange: number,
  poolType: string = '50/50'
): number {
  if (priceRatioChange <= 0) {
    throw new Error('Price ratio change must be positive');
  }
  
  let il: number;
  
  if (poolType === '50/50') {
    // Standard Uniswap V2 formula
    il = 2 * (priceRatioChange ** 0.5) / (1 + priceRatioChange) - 1;
  } else {
    // Generic formula for other pool types - simplified approximation
    il = Math.abs(1 - priceRatioChange) * 0.5;
  }
  
  return Math.abs(il) * 100;
}

/**
 * Estimate transaction cost in HBAR
 */
export function estimateTransactionCost(
  gasUsed: number,
  gasPriceHbar: number
): number {
  if (gasUsed <= 0 || gasPriceHbar <= 0) {
    return 0;
  }
  return gasUsed * gasPriceHbar;
}

/**
 * Safe division with default value
 */
export function safeDivide(
  numerator: number, 
  denominator: number, 
  defaultValue: number = 0
): number {
  if (denominator === 0) {
    return defaultValue;
  }
  return numerator / denominator;
}

/**
 * Validate Hedera account ID format
 */
export function validateAccountId(accountId: string): boolean {
  const pattern = /^0\.0\.\d+$/;
  return pattern.test(accountId);
}

/**
 * Format tinybars to HBAR string
 */
export function formatHbar(tinybars: number): string {
  const hbar = tinybars / 100_000_000;
  return `${hbar.toFixed(8)} HBAR`;
}

/**
 * Convert HBAR to tinybars
 */
export function hbarToTinybars(hbar: number): number {
  return Math.floor(hbar * 100_000_000);
}

/**
 * Convert tinybars to HBAR
 */
export function tinybarsToHbar(tinybars: number): number {
  return tinybars / 100_000_000;
}

/**
 * Sleep/delay utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      await sleep(delay);
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Parse USD string value (remove $ and commas)
 */
export function parseUsdValue(usdString: string): number {
  if (!usdString || usdString === '0') {
    return 0;
  }
  
  try {
    return parseFloat(usdString.replace(/[$,]/g, ''));
  } catch {
    return 0;
  }
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100;
  }
  
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Check if value is within tolerance
 */
export function isWithinTolerance(
  value: number, 
  target: number, 
  tolerance: number
): boolean {
  return Math.abs(value - target) <= Math.abs(target * tolerance);
}

/**
 * Round to significant digits
 */
export function roundToSignificantDigits(num: number, digits: number): number {
  if (num === 0) {
    return 0;
  }
  
  const multiplier = Math.pow(10, digits - Math.floor(Math.log10(Math.abs(num))) - 1);
  return Math.round(num * multiplier) / multiplier;
}