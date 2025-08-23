"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { getUserIdentity, updateUserDisplayName, type UserIdentity } from "@/lib/user-identity"

interface UserContextType {
  identity: UserIdentity
  updateDisplayName: (name: string) => void
  refreshIdentity: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<UserIdentity>(() => getUserIdentity())

  useEffect(() => {
    // Refresh identity on mount to ensure consistency
    setIdentity(getUserIdentity())
  }, [])

  const handleUpdateDisplayName = (name: string) => {
    const updatedIdentity = updateUserDisplayName(name)
    setIdentity(updatedIdentity)
  }

  const refreshIdentity = () => {
    setIdentity(getUserIdentity())
  }

  return (
    <UserContext.Provider
      value={{
        identity,
        updateDisplayName: handleUpdateDisplayName,
        refreshIdentity,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
