import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Anonymize IP for privacy compliance
function anonymizeIp(ip: string | null) {
  if (!ip) return null;

  // Handle localhost for local development
  if (ip === "::1" || ip === "127.0.0.1") return "localhost";

  // IPv4 anonymization: truncate last octet
  if (ip.includes(".")) {
    return ip.split(".").slice(0, 3).join(".") + ".0";
  }

  // IPv6 anonymization: keep first 4 hextets
  if (ip.includes(":")) {
    const parts = ip.split(":");
    const anon = parts.slice(0, 4).join(":");
    return anon + "::";
  }

  return ip;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Capture server-side IP (x-forwarded-for if behind proxy)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] :  null;
    const anonIp = anonymizeIp(ip);

    // Skip logging for localhost during dev
    if (anonIp === "localhost") {
      console.log(`Local dev session for user ${user_id}, skipping IP log.`);
      return NextResponse.json({ success: true });
    }

    // Insert anonymized IP + user ID + timestamp into Supabase
    const { data, error } = await supabase.from("user_logs").insert([
      {
        user_id,
        ip: anonIp,
        timestamp: new Date(),
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Insert success:", data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error in logUser API:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
