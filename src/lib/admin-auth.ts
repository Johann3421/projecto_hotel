import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { isStaffRole, type StaffRole } from "@/lib/admin-permissions"

interface AuthorizedSession {
  user: {
    id?: string
    role?: string
    email?: string | null
    name?: string | null
  }
}

export async function requireAdminRoles(allowedRoles: readonly StaffRole[]) {
  const session = await auth()
  const role = (session?.user as AuthorizedSession["user"] | undefined)?.role

  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    }
  }

  if (!isStaffRole(role) || !allowedRoles.includes(role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Sin permisos" }, { status: 403 }),
    }
  }

  return {
    ok: true as const,
    session: session as AuthorizedSession,
  }
}