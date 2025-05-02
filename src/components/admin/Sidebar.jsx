import { Link, useLocation, useNavigate } from "react-router-dom"
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
import { getAuth, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { getFirestore, collection, getDocs } from "firebase/firestore"

export const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = getAuth()
  const db = getFirestore()

  const user = auth.currentUser
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [nombreHospedaje, setNombreHospedaje] = useState("Hospedaje Rural")

  useEffect(() => {
    const fetchHospedaje = async () => {
      try {
        const hospedajesRef = collection(db, "hospedajes")
        const snapshot = await getDocs(hospedajesRef)

        if (!snapshot.empty) {
          const hospedaje = snapshot.docs[0].data()
          setNombreHospedaje(hospedaje.nombreHospedaje || "Hospedaje")
        }
      } catch (error) {
        console.error("Error al obtener el nombre del hospedaje:", error)
      }
    }

    const fetchUsuario = () => {
      if (user) {
        const displayName = user.displayName || "Administrador"
        const nombreCapitalizado = displayName.charAt(0).toUpperCase() + displayName.slice(1)
        setNombre(nombreCapitalizado)
        setCorreo(user.email || "")
      }
    }

    fetchHospedaje()
    fetchUsuario()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const routes = [
    { href: "/admin", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/admin/habitaciones", label: "Habitaciones", icon: <BedDouble className="h-5 w-5" /> },
    { href: "/admin/listar-reservas", label: "Reservas", icon: <Calendar className="h-5 w-5" /> },
    { href: "/admin/pagos", label: "Pagos", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/admin/servicios", label: "Servicios", icon: <Utensils className="h-5 w-5" /> },
    { href: "/admin/calificaciones", label: "Calificaciones", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/admin/reportes", label: "Reportes", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/admin/configuracion", label: "Configuración", icon: <Settings className="h-5 w-5" /> },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="w-64 bg-muted/40 border-r h-screen sticky top-0 overflow-y-auto py-8 px-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="bg-emerald-100 p-2 rounded-md">
          <BedDouble className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-bold text-lg">{nombreHospedaje}</h2>
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
            <p className="text-sm font-medium">{nombre}</p>
            <p className="text-xs text-muted-foreground">{correo}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
