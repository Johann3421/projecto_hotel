"use client"

import dynamic from "next/dynamic"

const AdminSidebar = dynamic(() => import("@/components/admin/AdminSidebar"), {
  ssr: false,
})

export default function AdminSidebarShell() {
  return <AdminSidebar />
}