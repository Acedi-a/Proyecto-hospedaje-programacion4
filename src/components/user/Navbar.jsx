
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, User } from "lucide-react"

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const routes = [
    { href: "/", label: "Inicio" },
    { href: "/reservas", label: "Mis Reservas" },
    { href: "/reservas/nueva", label: "Nueva Reserva" },
    { href: "/calificaciones", label: "Calificaciones" },
  ]

  const isActive = (path) => {
    console.log("actual: "+location.pathname)
    console.log(location.pathname + " =? "+ path)
    console.log(location.pathname === path)
    return location.pathname === path
  }

  return (
    <header
      style={{
        borderBottom: '1px solid #ccc',
        backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5), transparent)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)', 
        padding: '1rem',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </button>
            <Link to="/" className="ml-4 md:ml-0 flex items-center">
              <span className="text-xl font-bold">Hospedaje Rural</span>
            </Link>
          </div>

          {isMenuOpen && (
            <div className="absolute top-16 left-0 w-full bg-white border-b shadow-lg md:hidden z-50">
              <nav className="flex flex-col gap-4 p-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    to={route.href}
                    className={`text-lg font-medium transition-colors hover:text-primary px-2 py-1 rounded-md ${
                      isActive(route.href) ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          <nav className="hidden md:flex items-center gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={`text-md font-medium transition-colors hover:text-primary py-2 px-3 rounded-4xl ${
                  isActive(route.href) ? "text-white bg-emerald-600 font-semibold" : " bg-white text-muted-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <button className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
                <User className="h-4 w-4 mr-2" />
                Mi Cuenta
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
