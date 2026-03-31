import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { api, setToken } from "@/api"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"

const loginImageUrl =
  "https://images.unsplash.com/photo-1724041875334-0a6397111c7e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

interface LoginFormProps extends React.ComponentProps<"div"> {
  mode?: "admin" | "user"
}

export function LoginForm({ className, mode = "user", ...props }: LoginFormProps) {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const { user, loginUser } = useUser()

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard')
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const res = await api.post("/login", { username, password })

      setToken(res.data.token)
      localStorage.setItem("token", res.data.token)

      loginUser({ username: res.data.username, name: res.data.name, role: res.data.role }, res.data.token)

      navigate(res.data.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-white/60 bg-white/90 p-0 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-7">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl font-bold sm:text-2xl">
                  {mode === "admin" ? "Admin login" : "User login"}
                </h1>
                <p className="text-sm text-muted-foreground text-balance">
                  {mode === "admin"
                    ? "Login to manage all MIIMU applications and update project progress."
                    : "Login to manage your application and track project updates."}
                </p>
                {mode === "admin" ? (
                  <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-[11px] text-amber-900 sm:px-4 sm:py-3 sm:text-xs">
                    <p className="font-semibold">Admin Credentials</p>
                    <p>ID: miimu</p>
                    <p>Password: miimumiimu</p>
                  </div>
                ) : null}
              </div>

              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input id="username" name="username" type="text" placeholder="username" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" required />
              </Field>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src={loginImageUrl}
              alt="Solar installation login visual"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = "/login-form.jpg"
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
