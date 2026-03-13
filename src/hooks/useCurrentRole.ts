"use client"

import { useEffect, useState } from "react"
import type { StaffRole } from "@/lib/admin-permissions"
import { isStaffRole } from "@/lib/admin-permissions"

interface SessionResponse {
  user?: {
    role?: string | null
  } | null
}

export function useCurrentRole() {
  const [role, setRole] = useState<StaffRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadRole() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        const session = (await response.json().catch(() => null)) as SessionResponse | null
        const nextRole = session?.user?.role

        if (!active) return
        setRole(isStaffRole(nextRole) ? nextRole : null)
      } catch {
        if (!active) return
        setRole(null)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadRole()

    return () => {
      active = false
    }
  }, [])

  return { role, loading }
}