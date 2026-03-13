import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import AdminSidebarShell from "@/components/admin/AdminSidebarShell"

const ADMIN_ROLES = new Set(["MANAGER", "RECEPTIONIST", "HOUSEKEEPER"])

export const metadata = {
  title: "Admin PMS | Alturas Grand Hotel",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  if (!ADMIN_ROLES.has((session.user as { role?: string }).role || "")) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-ivory-50">
      <AdminSidebarShell />
      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
