import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to truncate instead of rounding (matches widget behaviour)
function trunc(n: number, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.floor(n * factor) / factor;
}

/**
 * Calculate Gann levels (supports/resistances) + recommendation (buy/sell)
 * matching the StockManiacs widget.
 */
export function calculateGannLevels(price: number, { step = 0.125, levels = 5, decimals = 2 } = {}) {
  if (typeof price !== "number" || !isFinite(price) || price <= 0) {
    throw new Error("price must be a positive number");
  }

  const root = Math.sqrt(price);
  const minusTwo = root - 2;
  const rounded = Math.ceil(minusTwo);

  const x: number[] = [];
  const sqr_x_rounded: number[] = [];
  const diff: number[] = [];

  for (let i = 0; i < 24; i++) {
    const val = rounded + step * (i + 1);
    x.push(val);
    const sq = val * val;
    const sqrTrunc = trunc(sq, decimals);
    sqr_x_rounded.push(sqrTrunc);
    diff.push(trunc(price - sqrTrunc, decimals));
  }

  let minPositiveIndex = -1;
  for (let i = 0; i < diff.length; i++) {
    if (diff[i] < 0) {
      minPositiveIndex = i;
      break;
    }
  }
  if (minPositiveIndex < 1) throw new Error("Unable to locate Gann levels for this price");

  const buyAbove = sqr_x_rounded[minPositiveIndex];
  const sellBelow = sqr_x_rounded[minPositiveIndex - 1];

  const supports: number[] = [];
  const resistances: number[] = [];
  for (let i = 0; i < levels; i++) {
    const sIndex = minPositiveIndex - 2 - i;
    const rIndex = minPositiveIndex + 1 + i;
    supports.push(sqr_x_rounded[sIndex]);
    resistances.push(sqr_x_rounded[rIndex]);
  }

  const buyTargets = resistances.map(r => trunc(r * 0.9995, decimals));
  const sellTargets = supports.map(s => trunc(s * 1.0005, decimals));

  return {
    resistances: resistances.map((value, idx) => ({ order: idx + 1, value })),
    supports: supports.map((value, idx) => ({ order: idx + 1, value })),
    recommendation: {
      buyAbove,
      buyTargets,
      buyStoploss: sellBelow,
      sellBelow,
      sellTargets,
      sellStoploss: buyAbove,
    }
  };
}
