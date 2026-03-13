"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { canAccessAdminPath } from "@/lib/admin-permissions"
import { useCurrentRole } from "@/hooks/useCurrentRole"
import { usePMSStore } from "@/store/pms"
import {
  LayoutDashboard,
  CalendarRange,
  BedDouble,
  ClipboardList,
  Sparkles,
  Users,
  Receipt,
  BarChart3,
  Tags,
  Gift,
  CalendarClock,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tape-chart", label: "Tape Chart", icon: CalendarRange },
  { href: "/admin/rooms", label: "Habitaciones", icon: BedDouble },
  { href: "/admin/room-types", label: "Tipos", icon: Tags },
  { href: "/admin/extras", label: "Extras", icon: Gift },
  { href: "/admin/pricing", label: "Tarifas", icon: CalendarClock },
  { href: "/admin/reservations", label: "Reservas", icon: ClipboardList },
  { href: "/admin/housekeeping", label: "Housekeeping", icon: Sparkles },
  { href: "/admin/guests", label: "Huéspedes", icon: Users },
  { href: "/admin/billing", label: "Facturación", icon: Receipt },
  { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { role } = useCurrentRole()
  const sidebarOpen = usePMSStore((state) => state.sidebarOpen)
  const toggleSidebar = usePMSStore((state) => state.toggleSidebar)
  const visibleItems = NAV_ITEMS.filter((item) => canAccessAdminPath(item.href, role))

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-navy-900 text-white transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy-700">
          {sidebarOpen && (
            <Link href="/" className="font-serif text-lg font-bold">
              Alturas<span className="text-gold-400">PMS</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-navy-800 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {visibleItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors ${
                      isActive
                        ? "bg-gold-500/20 text-gold-400 font-medium"
                        : "text-slate-400 hover:text-white hover:bg-navy-800"
                    }`}
                    title={!sidebarOpen ? label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span>{label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-navy-700 p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-sans text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
