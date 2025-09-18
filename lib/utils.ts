import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateGannLevels(price: number, { step = 0.125, levels = 5, decimals = 2 } = {}) {
  if (typeof price !== "number" || !isFinite(price) || price <= 0) {
    throw new Error("price must be a positive number");
  }

  const sqrt = Math.sqrt(price);
  // Snap down to nearest grid multiple
  const baseIndex = Math.floor(sqrt / step);
  const baseSqrt = baseIndex * step;

  const supports = [];
  for (let i = 1; i <= levels; i++) {
    const sSqrt = baseSqrt - i * step;
    const sPrice = Number((sSqrt * sSqrt).toFixed(decimals));
    supports.push({ order: i, value: sPrice });
  }

  const resistances = [];
  // First resistance starts at baseSqrt + 2*step (to match widget output)
  for (let i = 2; i <= levels + 1; i++) {
    const rSqrt = baseSqrt + i * step;
    const rPrice = Number((rSqrt * rSqrt).toFixed(decimals));
    resistances.push({ order: i - 1, value: rPrice });
  }

  return { resistances, supports };
}
