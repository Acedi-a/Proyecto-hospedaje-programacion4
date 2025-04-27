

import { useState, useEffect } from "react"
import { reservasData as reservas } from "../../data/reservas"
import { habitacionesData as habitaciones } from "../../data/habitaciones"

export const AdminReservas = () => {
  const [reservasList, setReservasList] = useState([])
  const [filtro, setFiltro] = useState("todas")
  const [busqueda, setBusqueda] = useState("")
  const [ordenarPor, setOrdenarPor] = useState("fecha_reciente")
  const [modalVisible, setModalVisible] = useState(false)
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null)

  useEffect(() => {
    // Cargar reservas y aplicar filtros iniciales
    const reservasFiltradas = [...reservas]

    // Aplicar filtros y ordenamiento
    aplicarFiltrosYOrden(reservasFiltradas)
  }, [])

  const aplicarFiltrosYOrden = (lista) => {
    // Filtrar por estado
    let resultado = [...lista]

    if (filtro !== "todas") {
      resultado = resultado.filter((reserva) => reserva.estado === filtro)
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const terminoBusqueda = busqueda.toLowerCase()
      resultado = resultado.filter(
        (reserva) =>
          reserva.cliente.nombre.toLowerCase().includes(terminoBusqueda) ||
          reserva.cliente.email.toLowerCase().includes(terminoBusqueda) ||
          reserva.id.toString().includes(terminoBusqueda),
      )
    }

    // Ordenar resultados
    switch (ordenarPor) {
      case "fecha_reciente":
        resultado.sort((a, b) => new Date(b.fecha_entrada) - new Date(a.fecha_entrada))
        break
      case "fecha_antigua":
        resultado.sort((a, b) => new Date(a.fecha_entrada) - new Date(b.fecha_entrada))
        break
      case "precio_alto":
        resultado.sort((a, b) => b.total - a.total)
        break
      case "precio_bajo":
        resultado.sort((a, b) => a.total - b.total)
        break
      default:
        break
    }

    setReservasList(resultado)
  }

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value)
    aplicarFiltrosYOrden([...reservas])
  }

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value)
    aplicarFiltrosYOrden([...reservas])
  }

  const handleOrdenarChange = (e) => {
    setOrdenarPor(e.target.value)
    aplicarFiltrosYOrden([...reservas])
  }

  const verDetalles = (reserva) => {
    setReservaSeleccionada(reserva)
    setModalVisible(true)
  }

  const cambiarEstadoReserva = (id, nuevoEstado) => {
    const nuevasReservas = reservasList.map((reserva) => {
      if (reserva.id === id) {
        return { ...reserva, estado: nuevoEstado }
      }
      return reserva
    })

    setReservasList(nuevasReservas)

    if (reservaSeleccionada && reservaSeleccionada.id === id) {
      setReservaSeleccionada({ ...reservaSeleccionada, estado: nuevoEstado })
    }

    // Aquí iría la lógica para actualizar en la base de datos
    console.log(`Reserva ${id} cambió a estado: ${nuevoEstado}`)
  }

  const getHabitacionNombre = (id) => {
    const habitacion = habitaciones.find((h) => h.id === id)
    return habitacion ? habitacion.nombre : "Desconocida"
  }

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getEstadoClase = (estado) => {
    switch (estado) {
      case "confirmada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      case "completada":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Reservas</h1>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por cliente, email o ID..."
            className="w-full p-2 border rounded"
            value={busqueda}
            onChange={handleBusquedaChange}
          />
        </div>

        <div className="flex gap-2">
          <select className="p-2 border rounded" value={filtro} onChange={handleFiltroChange}>
            <option value="todas">Todas las reservas</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <select className="p-2 border rounded" value={ordenarPor} onChange={handleOrdenarChange}>
            <option value="fecha_reciente">Fecha más reciente</option>
            <option value="fecha_antigua">Fecha más antigua</option>
            <option value="precio_alto">Mayor precio</option>
            <option value="precio_bajo">Menor precio</option>
          </select>
        </div>
      </div>

      {/* Tabla de reservas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Cliente</th>
              <th className="py-2 px-4 border">Habitación</th>
              <th className="py-2 px-4 border">Entrada</th>
              <th className="py-2 px-4 border">Salida</th>
              <th className="py-2 px-4 border">Total</th>
              <th className="py-2 px-4 border">Estado</th>
              <th className="py-2 px-4 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservasList.map((reserva) => (
              <tr key={reserva.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border text-center">{reserva.id}</td>
                <td className="py-2 px-4 border">
                  <div>
                    <p className="font-medium">{reserva.cliente.nombre}</p>
                    <p className="text-sm text-gray-600">{reserva.cliente.email}</p>
                  </div>
                </td>
                <td className="py-2 px-4 border">{getHabitacionNombre(reserva.habitacion_id)}</td>
                <td className="py-2 px-4 border">{formatFecha(reserva.fecha_entrada)}</td>
                <td className="py-2 px-4 border">{formatFecha(reserva.fecha_salida)}</td>
                <td className="py-2 px-4 border font-medium">${reserva.total.toFixed(2)}</td>
                <td className="py-2 px-4 border">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoClase(reserva.estado)}`}>
                    {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => verDetalles(reserva)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Ver
                    </button>

                    {reserva.estado === "pendiente" && (
                      <button
                        onClick={() => cambiarEstadoReserva(reserva.id, "confirmada")}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Confirmar
                      </button>
                    )}

                    {(reserva.estado === "pendiente" || reserva.estado === "confirmada") && (
                      <button
                        onClick={() => cambiarEstadoReserva(reserva.id, "cancelada")}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {reservasList.length === 0 && (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">
                  No se encontraron reservas con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {modalVisible && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles de la Reserva #{reservaSeleccionada.id}</h2>
              <button onClick={() => setModalVisible(false)} className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium text-gray-700">Información del Cliente</h3>
                <p>
                  <span className="font-medium">Nombre:</span> {reservaSeleccionada.cliente.nombre}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {reservaSeleccionada.cliente.email}
                </p>
                <p>
                  <span className="font-medium">Teléfono:</span> {reservaSeleccionada.cliente.telefono}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Información de la Reserva</h3>
                <p>
                  <span className="font-medium">Estado:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getEstadoClase(reservaSeleccionada.estado)}`}
                  >
                    {reservaSeleccionada.estado.charAt(0).toUpperCase() + reservaSeleccionada.estado.slice(1)}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Habitación:</span>{" "}
                  {getHabitacionNombre(reservaSeleccionada.habitacion_id)}
                </p>
                <p>
                  <span className="font-medium">Fecha de entrada:</span>{" "}
                  {formatFecha(reservaSeleccionada.fecha_entrada)}
                </p>
                <p>
                  <span className="font-medium">Fecha de salida:</span> {formatFecha(reservaSeleccionada.fecha_salida)}
                </p>
                <p>
                  <span className="font-medium">Noches:</span> {reservaSeleccionada.noches}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-700">Detalles de Pago</h3>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between">
                  <span>Precio por noche:</span>
                  <span>${reservaSeleccionada.precio_noche.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Noches:</span>
                  <span>{reservaSeleccionada.noches}</span>
                </div>
                {reservaSeleccionada.descuento > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>-${reservaSeleccionada.descuento.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>${reservaSeleccionada.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {reservaSeleccionada.comentarios && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700">Comentarios</h3>
                <p className="bg-gray-50 p-3 rounded">{reservaSeleccionada.comentarios}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              {reservaSeleccionada.estado === "pendiente" && (
                <button
                  onClick={() => {
                    cambiarEstadoReserva(reservaSeleccionada.id, "confirmada")
                    setModalVisible(false)
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Confirmar Reserva
                </button>
              )}

              {(reservaSeleccionada.estado === "pendiente" || reservaSeleccionada.estado === "confirmada") && (
                <button
                  onClick={() => {
                    cambiarEstadoReserva(reservaSeleccionada.id, "cancelada")
                    setModalVisible(false)
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancelar Reserva
                </button>
              )}

              {reservaSeleccionada.estado === "confirmada" && (
                <button
                  onClick={() => {
                    cambiarEstadoReserva(reservaSeleccionada.id, "completada")
                    setModalVisible(false)
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Marcar como Completada
                </button>
              )}

              <button
                onClick={() => setModalVisible(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

