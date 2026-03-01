"use client"
import { useState, useCallback } from "react"
import { AvailabilityResult } from "@/types"

export function useAvailability() {
  const [results, setResults] = useState<AvailabilityResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (checkIn: string, checkOut: string, adults: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ checkIn, checkOut, adults: String(adults) })
      const res = await fetch(`/api/availability?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error de búsqueda")
      setResults(data.results)
    } catch (err: any) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, search }
}
