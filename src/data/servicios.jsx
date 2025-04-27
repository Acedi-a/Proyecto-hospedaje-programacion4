import { Coffee, Car, Map, Utensils } from "lucide-react"

export const serviciosData = [
  {
    id: "serv-001",
    nombre: "Desayuno Gourmet",
    descripcion: "Disfruta de un delicioso desayuno con productos locales y caseros.",
    precio: 15,
    icono: <Coffee className="h-6 w-6" />,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "serv-002",
    nombre: "Transporte al Pueblo",
    descripcion: "Servicio de transporte desde el hospedaje hasta el pueblo cercano.",
    precio: 20,
    icono: <Car className="h-6 w-6" />,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "serv-003",
    nombre: "Tour Guiado",
    descripcion: "Recorrido guiado por los lugares más emblemáticos de la zona.",
    precio: 35,
    icono: <Map className="h-6 w-6" />,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "serv-004",
    nombre: "Cena Romántica",
    descripcion: "Cena especial para dos personas con velas y vino incluido.",
    precio: 60,
    icono: <Utensils className="h-6 w-6" />,
    imagen: "/placeholder.svg?height=200&width=300",
  },
]

export const misPedidosData = [
  {
    id: "ped-001",
    servicio: "Desayuno Gourmet",
    reservaId: "res-001",
    habitacion: "Cabaña Familiar",
    fecha: "17 de mayo de 2025",
    precio: 15,
    estado: "confirmado",
  },
  {
    id: "ped-002",
    servicio: "Tour Guiado",
    reservaId: "res-001",
    habitacion: "Cabaña Familiar",
    fecha: "18 de mayo de 2025",
    precio: 35,
    estado: "pendiente",
  },
]
