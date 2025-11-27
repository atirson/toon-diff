import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { decode, encode } from '@toon-format/toon'
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}


export const formatToon = (content: string): string => {
  try {
    const data = decode(content);
    return encode(data);
  } catch {
    return content;
  }
}