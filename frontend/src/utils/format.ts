export const formatCurrency = (value: number | string): string => {
  const num = Number(value);
  if (isNaN(num)) return "0.00";

  // Case 1: Micro-pennies (e.g. SHIB 0.000045)
  if (num > 0 && num < 1) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    }).format(num);
  }

  // Case 2: Standard (e.g. BTC 98,000.50)
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatCompact = (value: number | string): string => {
  const num = Number(value);
  if (isNaN(num)) return "0";

  // Case 3: Large Volumes (e.g. 1,500,000,000 -> 1.5B)
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1
  }).format(num);
};