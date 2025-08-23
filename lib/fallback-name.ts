// lib/fallback-name.ts
import { supabase } from "@/lib/supabase/client"

const FALLBACK_KEY = "anon_fallback_name"

function generateRandomName(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `Anonymous_${result}`
}

export async function getOrCreateFallbackName() {
  if (typeof window === "undefined") return "Anonymous"

  const existing = localStorage.getItem(FALLBACK_KEY)
  if (existing && existing.trim() !== "") return existing

  let name = ""
  let isUnique = false

  while (!isUnique) {
    name = generateRandomName(6) // random 6 chars

    const { count, error } = await supabase
      .from("public_chat")
      .select("author_name", { count: "exact", head: true })
      .eq("author_name", name)

    if (error) {
      console.error("Error checking name uniqueness:", error)
      break // fallback: accept generated name anyway
    }

    if ((count ?? 0) === 0) {
      isUnique = true
    }
  }

  localStorage.setItem(FALLBACK_KEY, name)
  return name
}
