"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { BedDouble, Edit, MoreHorizontal, Plus, Search, Trash2, Users } from "lucide-react"
import { habitacionesData } from "../../data/habitaciones.js"

export const AdminHabitaciones = () => {
  const [filtro, setFiltro] = useState("todas")
  const [busqueda, setBusqueda] = useState("")

  const habitacionesFiltradas = habitacionesData
    .filter((habitacion) => {
      if (filtro === "todas") return true
      return habitacion.estado === filtro
    })
    .filter((habitacion) => {
      if (!busqueda) return true
      return (
        habitacion.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        habitacion.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      )
    })

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "disponible":
        return "bg-green-100 text-green-800"
      case "ocupada":
        return "bg-blue-100 text-blue-800"
      case "mantenimiento":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Habitaciones</h1>
          <p className="text-gray-500">Gestiona las habitaciones del hospedaje</p>
        </div>
        <Link to="/admin/habitaciones/nueva">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Habitación
          </button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar habitación..."
            className="pl-8 pr-4 py-2 border border-gray-300 rounded-md w-full"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                filtro === "todas"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFiltro("todas")}
            >
              Todas
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                filtro === "disponible"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFiltro("disponible")}
            >
              Disponibles
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                filtro === "ocupada"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFiltro("ocupada")}
            >
              Ocupadas
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                filtro === "mantenimiento"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setFiltro("mantenimiento")}
            >
              Mantenimiento
            </button>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitacionesFiltradas.map((habitacion) => (
          <div key={habitacion.id} className="overflow-hidden border rounded-lg shadow-sm">
            <div className="relative h-48 w-full">
              <img
                src={habitacion.imagen || "/placeholder.svg"}
                alt={habitacion.nombre}
                className="object-cover w-full h-full"
              />
              <span
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(habitacion.estado)}`}
              >
                {habitacion.estado.charAt(0).toUpperCase() + habitacion.estado.slice(1)}
              </span>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-lg">{habitacion.nombre}</h3>
                  <p className="text-sm text-gray-500">{habitacion.descripcion}</p>
                </div>
                <div className="relative">
                  <button className="p-2 rounded-md hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Edit className="h-4 w-4 mr-2 inline" />
                      Editar
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <BedDouble className="h-4 w-4 mr-2 inline" />
                      Cambiar Estado
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      <Trash2 className="h-4 w-4 mr-2 inline" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm">{habitacion.capacidad} personas</span>
                </div>
                <div className="font-semibold">${habitacion.precio}/noche</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

