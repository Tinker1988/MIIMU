import { LoginForm } from "@/components/login-form"

export default function AdminLogin() {
  return (
    <div className="auth-shell flex min-h-svh flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-sm lg:max-w-2xl xl:max-w-4xl">
        <LoginForm mode="admin" />
      </div>
    </div>
  )
}
