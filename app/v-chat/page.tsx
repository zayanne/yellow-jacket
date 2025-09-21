"use client"
import React, { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

export default function VChatPage() {
  const { identity } = useUser()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [message, setMessage] = useState("Searching for partner...")

  // Setup peer connection + realtime listener
  useEffect(() => {
    if (!identity?.id) return

    // Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
    pcRef.current = pc

    // Local stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))
    })

    // Remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    // ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && partnerId) {
        await supabase.from("signals").insert({
          from_id: identity.id,
          to_id: partnerId,
          type: "candidate",
          data: event.candidate.toJSON(),
        })
      }
    }

    // Subscribe to signals for me
    const channel = supabase
      .channel("signals")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals", filter: `to_id=eq.${identity.id}` },
        async (payload) => {
          const { type, data, from_id } = payload.new
          const pc = pcRef.current
          if (!pc) return

          if (type === "offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(data))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            await supabase.from("signals").insert({
              from_id: identity.id,
              to_id: from_id,
              type: "answer",
              data: answer,
            })
            setPartnerId(from_id)
            setMessage("Connected with partner")
          }

          if (type === "answer") {
            await pc.setRemoteDescription(new RTCSessionDescription(data))
            setMessage("Connected with partner")
          }

          if (type === "candidate") {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data))
            } catch (e) {
              console.error("ICE error", e)
            }
          }
        }
      )
      .subscribe()

    // Register myself as active
    supabase.from("video_sessions").upsert({
      user_id: identity.id,
      display_name: identity.displayName || "Anonymous",
      is_active: true,
    })

    // Try to find a partner
    findPartner()

    return () => {
      channel.unsubscribe()
      pc.close()
      supabase.from("video_sessions").update({ is_active: false }).eq("user_id", identity.id)
    }
  }, [identity?.id])

  // Find a random partner
  const findPartner = async () => {
    if (!identity?.id) return

    const { data } = await supabase
      .from("video_sessions")
      .select("*")
      .neq("user_id", identity.id)
      .eq("is_active", true)

    if (!data || data.length === 0) {
      setMessage("No users online, please wait...")
      return
    }

    const randomPartner = data[Math.floor(Math.random() * data.length)]
    setPartnerId(randomPartner.user_id)

    // Send WebRTC offer
    if (pcRef.current) {
      const pc = pcRef.current
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await supabase.from("signals").insert({
        from_id: identity.id,
        to_id: randomPartner.user_id,
        type: "offer",
        data: offer,
      })
      setMessage("Calling partner...")
    }
  }

  // Skip current partner
  const skipPartner = async () => {
    if (pcRef.current) {
      pcRef.current.close()
    }
    setPartnerId(null)
    setMessage("Searching for new partner...")

    // Reset peer connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
    pcRef.current = pc

    // Re-attach local stream
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    if (localVideoRef.current) localVideoRef.current.srcObject = stream
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    // Handle remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    // ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && partnerId) {
        await supabase.from("signals").insert({
          from_id: identity.id,
          to_id: partnerId,
          type: "candidate",
          data: event.candidate.toJSON(),
        })
      }
    }

    // Find a new partner
    findPartner()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">🎥 Random Video Chat</h1>

      <div className="flex space-x-4 mb-6">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-64 h-48 bg-black rounded-lg" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 bg-black rounded-lg" />
      </div>

      <p className="mb-4">{message}</p>

      <div className="flex space-x-4">
        <button
          onClick={findPartner}
          className="px-4 py-2 bg-green-600 rounded-lg shadow hover:bg-green-700"
        >
          Find Partner
        </button>
        <button
          onClick={skipPartner}
          className="px-4 py-2 bg-red-600 rounded-lg shadow hover:bg-red-700"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
