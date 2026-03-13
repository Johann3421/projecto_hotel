"use client"

import dynamic from "next/dynamic"

const LoginForm = dynamic(() => import("@/components/auth/LoginForm"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-ivory-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
    </div>
  ),
})

export default function LoginFormShell() {
  return <LoginForm />
}