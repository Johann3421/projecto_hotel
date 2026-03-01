"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { HousekeepingEvent } from "@/types"

export function useHousekeepingStream() {
  const [events, setEvents] = useState<HousekeepingEvent[]>([])
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(undefined)
  const reconnectDelayRef = useRef(1000)

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource("/api/housekeeping/stream")
    eventSourceRef.current = es

    es.onopen = () => {
      setConnected(true)
      reconnectDelayRef.current = 1000
    }

    es.onmessage = (event) => {
      try {
        const data: HousekeepingEvent = JSON.parse(event.data)
        setEvents((prev) => [data, ...prev].slice(0, 50))
      } catch (e) {
        // ignore
      }
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
      // Exponential backoff
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000)
        connect()
      }, reconnectDelayRef.current)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [connect])

  return { events, connected }
}
