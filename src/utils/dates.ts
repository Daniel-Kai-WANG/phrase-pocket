import { LEARNING_TIME_ZONE, WEEKLY_THEMES } from "../constants/learning.js";

export function learningDay(value: Date | string = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LEARNING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addDays(value: string, days: number): string {
  return new Date(new Date(value).getTime() + days * 86_400_000).toISOString();
}

export function daysBetween(first: string, last: string): number {
  return (Date.parse(last) - Date.parse(first)) / 86_400_000;
}

export function themeForDay(day: string) {
  return WEEKLY_THEMES[new Date(`${day}T12:00:00+10:00`).getUTCDay()];
}

export function formatLessonDate(day: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: LEARNING_TIME_ZONE,
  }).format(new Date(`${day}T12:00:00+10:00`));
}
