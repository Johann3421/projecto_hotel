export const STAFF_ROLES = ["MANAGER", "RECEPTIONIST", "HOUSEKEEPER"] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return STAFF_ROLES.includes((role || "") as StaffRole)
}

export function canManageReservations(role: StaffRole | null | undefined) {
  return role === "MANAGER" || role === "RECEPTIONIST"
}

export function canManageRoomInventory(role: StaffRole | null | undefined) {
  return role === "MANAGER"
}

export function canManageRoomStatus(role: StaffRole | null | undefined) {
  return isStaffRole(role)
}

export function canAccessAdminPath(pathname: string, role: StaffRole | null | undefined) {
  if (!role) return false

  if (pathname.startsWith("/admin/housekeeping")) return true
  if (pathname === "/admin" || pathname.startsWith("/admin/tape-chart")) {
    return canManageReservations(role)
  }
  if (pathname.startsWith("/admin/reservations") || pathname.startsWith("/admin/guests") || pathname.startsWith("/admin/billing")) {
    return canManageReservations(role)
  }
  if (pathname.startsWith("/admin/reports") || pathname.startsWith("/admin/room-types") || pathname.startsWith("/admin/extras") || pathname.startsWith("/admin/pricing")) {
    return role === "MANAGER"
  }
  if (pathname.startsWith("/admin/rooms")) {
    return role === "MANAGER" || role === "RECEPTIONIST"
  }

  return role === "MANAGER"
}