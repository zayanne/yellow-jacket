"use client"

import type React from "react"

import { useState } from "react"
import Sidebar from "./sidebar"
import BottomNav from "./bottom-nav"

interface AppLayoutProps {
  children?: React.ReactNode
  onCreatePost?: () => void
  onOpenProfile?: () => void
}



export default function AppLayout({ children, }: AppLayoutProps) {
  const [activeSection, setActiveSection] = useState("home")


  return (
    <div className="min-h-screen bg-background">
      <Sidebar
      />

      <div className="lg:pl-64">
        <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      </div>

      <BottomNav
        
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  )
}
