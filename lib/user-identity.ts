export interface UserIdentity {
  id: string
  displayName: string
  createdAt: string
}

const USER_IDENTITY_KEY = "microblog_user_identity"

export function generateUserIdentity(): UserIdentity {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substr(2, 9)

  return {
    id: `user_${timestamp}_${randomId}`,
    displayName: "",
    createdAt: new Date().toISOString(),
  }
}

export function getUserIdentity(): UserIdentity {
  if (typeof window === "undefined") {
    return generateUserIdentity()
  }

  try {
    const stored = localStorage.getItem(USER_IDENTITY_KEY)
    if (stored) {
      const identity = JSON.parse(stored) as UserIdentity
      // Validate the stored identity
      if (identity.id && identity.createdAt) {
        return identity
      }
    }
  } catch (error) {
    console.error("Error parsing stored user identity:", error)
  }

  // Generate new identity if none exists or is invalid
  const newIdentity = generateUserIdentity()
  localStorage.setItem(USER_IDENTITY_KEY, JSON.stringify(newIdentity))
  return newIdentity
}

export function updateUserDisplayName(displayName: string): UserIdentity {
  const identity = getUserIdentity()
  const updatedIdentity = { ...identity, displayName: displayName.trim() }
  localStorage.setItem(USER_IDENTITY_KEY, JSON.stringify(updatedIdentity))
  return updatedIdentity
}

export function clearUserIdentity(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_IDENTITY_KEY)
  }
}

// Legacy support for existing user_identifier
export function getUserIdentifier(): string {
  const identity = getUserIdentity()
  return identity.id
}


let anonCounter = 1

export function getEffectiveDisplayName(identity: UserIdentity): string {
  if (identity.displayName && identity.displayName.trim() !== "") {
    return identity.displayName
  }

  // Generate an Anonymous_X label based on a counter
  // (per session, increments each time someone has no name)
  const fallback = `Anonymous_${anonCounter++}`
  return fallback
}