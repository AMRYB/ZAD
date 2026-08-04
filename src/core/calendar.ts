const DAY = 86_400_000;
export function normalizeDigits(text:string):string {
  return text.replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)-(c>='۰'?0x06f0:0x0660)));
}
export function parseDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('INVALID_DATE');
  const result = Date.parse(`${value}T12:00:00Z`);
  if (!Number.isFinite(result) || new Date(result).toISOString().slice(0, 10) !== value) throw new Error('INVALID_DATE');
  return result;
}
export function addDays(value: string, days: number): string {
  return new Date(parseDate(value) + days * DAY).toISOString().slice(0, 10);
}
export function dayDifference(start: string, end: string): number {
  return Math.round((parseDate(end) - parseDate(start)) / DAY);
}
export function dateInZone(date = new Date(), zone = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  const values = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (name: string) => values.find(x => x.type === name)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function seasonDay(start: string | null, date: string, length: number, adjustment = 0): number | null {
  if (!start) return null;
  const day = dayDifference(start, date) + 1 + adjustment;
  return day >= 1 && day <= length ? day : null;
}
export function assignments(complete: number[], target: number, deadline: string, today: string): {remaining: number; days: number; perDay: number} {
  const done = new Set(complete.filter(p => p >= 1 && p <= target)).size;
  const remaining = Math.max(0, target - done);
  const days = Math.max(1, dayDifference(today, deadline) + 1);
  return { remaining, days, perDay: Math.ceil(remaining / days) };
}
