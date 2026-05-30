import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseYoutubeId(url: string): string | null {
  if (!url) return null;
  
  // Direct YouTube video ID (11 chars)
  const idRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (idRegex.test(url)) return url;
  
  // Standard desktop URLs, mobile URLs, embed URLs, and shorts URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
}

export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return '0m';
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
  
  return parts.length > 0 ? parts.join(' ') : '0m';
}
