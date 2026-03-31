import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { useUser } from '@/context/UserContext'

export function Navbar() {
  const { user, logoutUser } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logoutUser()
    navigate('/', { replace: true })
  }

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/50 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to={user ? dashboardPath : '/'} className="flex items-center gap-3 text-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#f97316)] text-sm font-black text-white shadow-lg shadow-amber-500/30">
            SD
          </div>
          <div>
            <span className="block text-lg font-semibold tracking-tight">MIIMU</span>
            <span className="block text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Make In India Mahila Udyog
            </span>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
          {user ? (
            <>
              {user.role !== 'admin' ? (
                <>
                </>
              ) : null}

              <Button variant="outline" className="text-sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-sm">
                <Link to="/user-login">User Login</Link>
              </Button>

              <Button asChild variant="outline" className="text-sm">
                <Link to="/admin-login">Admin Login</Link>
              </Button>

              <Button asChild className="text-sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
