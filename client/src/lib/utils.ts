import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toFixed(num: number, maxDecimals: number) {
  const numStr = num.toString()
  const decimalIndex = numStr.indexOf('.')

  if (decimalIndex === -1) {
    // No decimals, return the number as is
    return numStr
  } else {
    const decimalPlaces = numStr.length - decimalIndex - 1
    if (decimalPlaces > maxDecimals) {
      return num.toFixed(maxDecimals)
    } else {
      return numStr // Return original number as string
    }
  }
}

export function formatCurrency(num: number, currency: string | undefined) {
  try {
    if (currency === 'ETH' || currency === undefined) {
      throw new Error()
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(num)
  } catch {
    // Fallback to ETH
    return `Ξ${toFixed(num, 4)}`
  }
}
