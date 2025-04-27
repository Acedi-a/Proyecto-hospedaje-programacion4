"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { misCalificacionesData as calificaciones } from "../../data/calificaciones"

export const AdminCalificaciones = () => {
  const [listaCalificaciones, setListaCalificaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState("todas")
  const [busqueda, setBusqueda] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [filtroEstrellas, setFiltroEstrellas] = useState("all")

  useEffect(() => {
    setTimeout(() => {
      const calificacionesConDetalles = calificaciones.map((calificacion) => ({
        ...calificacion,
        estado: Math.random() > 0.3 ? "publicada" : "pendiente",
        fechaCreacion: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      }))
      setListaCalificaciones(calificacionesConDetalles)
      setCargando(false)
    }, 1000)
  }, [])

  const getCalificacionesFiltradas = () => {
    let calificacionesFiltradas = [...listaCalificaciones]

    if (filtro !== "todas") {
      calificacionesFiltradas = calificacionesFiltradas.filter((calificacion) => calificacion.estado === filtro)
    }

    if (busqueda) {
      const terminoBusqueda = busqueda.toLowerCase()
      calificacionesFiltradas = calificacionesFiltradas.filter(
        (calificacion) =>
          calificacion.usuario.toLowerCase().includes(terminoBusqueda) ||
          calificacion.comentario.toLowerCase().includes(terminoBusqueda),
      )
    }

    return calificacionesFiltradas
  }

  const cambiarEstadoCalificacion = (id, nuevoEstado) => {
    setListaCalificaciones((prev) =>
      prev.map((calificacion) => (calificacion.id === id ? { ...calificacion, estado: nuevoEstado } : calificacion)),
    )
  }

  const eliminarCalificacion = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta calificación?")) {
      setListaCalificaciones((prev) => prev.filter((calificacion) => calificacion.id !== id))
    }
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }


  const renderEstrellas = (puntuacion) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < puntuacion ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"
            }`}
          />
        ))}
      </div>
    )
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "publicada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Calificaciones</h1>

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label htmlFor="filtro" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por estado
            </label>
            <select
              id="filtro"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
            >
              <option value="todas">Todas las calificaciones</option>
              <option value="pendiente">Pendientes</option>
              <option value="publicada">Publicadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>

          <div>
            <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="busqueda"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por usuario, comentario..."
              className="p-2 border border-gray-300 rounded-md w-full md:w-64"
            />
          </div>
        </div>

        <div className="text-right">
          <span className="block text-sm font-medium text-gray-700 mb-1">Calificación promedio</span>
          <span className="text-2xl font-bold">
            {(listaCalificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / listaCalificaciones.length).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Usuario
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Puntuación
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Comentario
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCalificacionesFiltradas().map((calificacion) => (
                <tr key={calificacion.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{calificacion.usuario}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{calificacion.puntuacion}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${i < calificacion.puntuacion ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">{calificacion.comentario}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFecha(calificacion.fechaCreacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        calificacion.estado === "publicada"
                          ? "bg-green-100 text-green-800"
                          : calificacion.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calificacion.estado.charAt(0).toUpperCase() + calificacion.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {calificacion.estado === "pendiente" && (
                        <>
                          <button
                            onClick={() => cambiarEstadoCalificacion(calificacion.id, "publicada")}
                            className="text-green-600 hover:text-green-900"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => cambiarEstadoCalificacion(calificacion.id, "rechazada")}
                            className="text-red-600 hover:text-red-900"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {calificacion.estado === "rechazada" && (
                        <button
                          onClick={() => cambiarEstadoCalificacion(calificacion.id, "publicada")}
                          className="text-green-600 hover:text-green-900"
                        >
                          Aprobar
                        </button>
                      )}
                      {calificacion.estado === "publicada" && (
                        <button
                          onClick={() => cambiarEstadoCalificacion(calificacion.id, "rechazada")}
                          className="text-red-600 hover:text-red-900"
                        >
                          Ocultar
                        </button>
                      )}
                      <button
                        onClick={() => eliminarCalificacion(calificacion.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {getCalificacionesFiltradas().length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No se encontraron calificaciones con los filtros seleccionados</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Resumen de calificaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Total calificaciones</div>
            <div className="text-2xl font-bold">{listaCalificaciones.length}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600">Pendientes</div>
            <div className="text-2xl font-bold">
              {listaCalificaciones.filter((c) => c.estado === "pendiente").length}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Publicadas</div>
            <div className="text-2xl font-bold">
              {listaCalificaciones.filter((c) => c.estado === "publicada").length}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600">Rechazadas</div>
            <div className="text-2xl font-bold">
              {listaCalificaciones.filter((c) => c.estado === "rechazada").length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

