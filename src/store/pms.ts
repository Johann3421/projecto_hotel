"use client"
import { create } from "zustand"

interface PMSState {
  sidebarOpen: boolean
  selectedDate: string
  tapeChartDays: number
  refreshKey: number
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSelectedDate: (date: string) => void
  setTapeChartDays: (days: number) => void
  triggerRefresh: () => void
}

export const usePMSStore = create<PMSState>()((set) => ({
  sidebarOpen: true,
  selectedDate: new Date().toISOString().split("T")[0],
  tapeChartDays: 30,
  refreshKey: 0,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setTapeChartDays: (days) => set({ tapeChartDays: days }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
