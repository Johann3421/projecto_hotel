import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import AdminSidebar from "@/components/admin/AdminSidebar"

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

  return (
    <div className="flex min-h-screen bg-ivory-50">
      <AdminSidebar />
      <main className="flex-1 ml-20 lg:ml-64 transition-all duration-300">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
