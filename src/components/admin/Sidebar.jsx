  import { Link, useLocation } from "react-router-dom"
  import {
    BarChart3,
    BedDouble,
    Calendar,
    CreditCard,
    Home,
    LogOut,
    MessageSquare,
    Settings,
    Utensils,
    User,
  } from "lucide-react"

  export const Sidebar = () => {
    const location = useLocation()

    const routes = [
      {
        href: "/admin",
        label: "Dashboard",
        icon: <Home className="h-5 w-5" />,
      },
      {
        href: "/admin/habitaciones",
        label: "Habitaciones",
        icon: <BedDouble className="h-5 w-5" />,
      },
      {
        href: "/admin/reservas",
        label: "Reservas",
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        href: "/admin/pagos",
        label: "Pagos",
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        href: "/admin/servicios",
        label: "Servicios",
        icon: <Utensils className="h-5 w-5" />,
      },
      {
        href: "/admin/calificaciones",
        label: "Calificaciones",
        icon: <MessageSquare className="h-5 w-5" />,
      },
      {
        href: "/admin/reportes",
        label: "Reportes",
        icon: <BarChart3 className="h-5 w-5" />,
      },
      {
        href: "/admin/configuracion",
        label: "Configuración",
        icon: <Settings className="h-5 w-5" />,
      },
    ]

    const isActive = (path) => {
      return location.pathname === path
    }

    return (
      <div className="w-64 bg-muted/40 border-r h-screen sticky top-0 overflow-y-auto py-8 px-4">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="bg-emerald-100 p-2 rounded-md">
            <BedDouble className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Hospedaje Rural</h2>
            <p className="text-xs text-muted-foreground">Panel de Administración</p>
          </div>
        </div>

        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(route.href)
                  ? "bg-emerald-100 text-emerald-900 font-medium"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-8 border-t space-y-4 mt-8">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Admin Usuario</p>
              <p className="text-xs text-muted-foreground">admin@hospedaje.com</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Link>
        </div>
      </div>
    )
  }
