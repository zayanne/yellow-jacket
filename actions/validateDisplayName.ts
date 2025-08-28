"use server"

import { supabase } from "@/lib/supabase/client"

export async function validateDisplayName(displayName: string, currentUserId: string) {
  const cleanName = displayName.trim()

  // 1. Disallow empty names
  if (!cleanName) {
    return { valid: false, message: "Display name cannot be empty." }
  }


  console.log(cleanName, currentUserId);
  
  // 2. Case-insensitive check if the display name is already taken
  const { data: taken, error } = await supabase
    .from("registered_users")
    .select("user_id")
    .ilike("display_name", cleanName) // ignores case
    .maybeSingle()

  if (error) {
    return { valid: false, message: "Error checking display name." }
  }

  if (taken) {
    if (taken.user_id === currentUserId) {
      return { valid: true, message: "This is already your own reserved name." }
    }
    return { valid: false, message: "This name is already taken." }
  }

  // ✅ All good
  return { valid: true, message: "Name is available." }
}
