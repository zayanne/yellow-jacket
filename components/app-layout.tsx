"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "./sidebar"
import BottomNav from "./bottom-nav"

interface AppLayoutProps {
  children?: React.ReactNode
  onCreatePost?: () => void
  onOpenProfile?: () => void
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [activeSection, setActiveSection] = useState("home")
  const pathname = usePathname()

  useEffect(() => {
    const preventZoom = (e: WheelEvent | TouchEvent) => {
      if (e instanceof WheelEvent && e.ctrlKey) e.preventDefault()
      if (e instanceof TouchEvent && e.touches.length > 1) e.preventDefault()
    }

    document.addEventListener("wheel", preventZoom, { passive: false })
    document.addEventListener("touchmove", preventZoom, { passive: false })

    return () => {
      document.removeEventListener("wheel", preventZoom)
      document.removeEventListener("touchmove", preventZoom)
    }
  }, [])

  const blip = pathname === "/blip"

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {blip ? (
        // render children full width without extra padding
        <div className="lg:pl-64">
          <main className="min-h-screen lg:pb-0">{children}</main>
        </div>
      ) : (
        <div className="lg:pl-64">
          <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
        </div>
      )}

      {!blip && (
        <BottomNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}
    </div>
  )
}
