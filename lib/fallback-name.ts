// lib/fallback-name.ts
const FALLBACK_KEY = "anon_fallback_name";
const COUNTER_KEY = "anon_counter";

export function getOrCreateFallbackName() {
  if (typeof window === "undefined") return "Anonymous";
  const existing = localStorage.getItem(FALLBACK_KEY);
  if (existing && existing.trim() !== "") return existing;

  const count = Number(localStorage.getItem(COUNTER_KEY) || "1");
  const name = `Anonymous_${count}`;
  localStorage.setItem(FALLBACK_KEY, name);
  localStorage.setItem(COUNTER_KEY, String(count + 1));
  return name;
}
