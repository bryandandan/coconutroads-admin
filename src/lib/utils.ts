import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string or null
 * @param options - Intl.DateTimeFormat options (defaults to { year: 'numeric', month: 'short', day: 'numeric' })
 * @returns Formatted date string or '-' if null
 */
export function formatDate(
  dateString: string | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', options)
}

/**
 * Calculate the number of days between two dates
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Number of days between the two dates
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}
