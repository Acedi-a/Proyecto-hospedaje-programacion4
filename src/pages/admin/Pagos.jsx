'use client'
import { useState, useEffect } from "react"
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../data/firebase'
import { DetallePago } from "./DetallePago"

export const AdminPagos = () => {
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null)

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        const q = query(collection(db, "Pagos"))
        const querySnapshot = await getDocs(q)
        
        const pagosData = []
        querySnapshot.forEach((doc) => {
          const pagoData = doc.data()
          pagosData.push({
            id: doc.id,
            ...pagoData,
            fecha: pagoData.fechaPago?.toDate() || new Date()
          })
        })
        
        setPagos(pagosData)
        setCargando(false)
      } catch (error) {
        console.error("Error cargando pagos:", error)
        setCargando(false)
      }
    }

    cargarPagos()
  }, [])

  const getPagosFiltrados = () => {
    let pagosFiltrados = [...pagos]

    if (filtro !== "todos") {
      pagosFiltrados = pagosFiltrados.filter((pago) => pago.estado === filtro)
    }

    if (busqueda) {
      const terminoBusqueda = busqueda.toLowerCase()
      pagosFiltrados = pagosFiltrados.filter(
        (pago) =>
          pago.resumenReserva?.cliente?.toLowerCase().includes(terminoBusqueda) ||
          pago.resumenReserva?.email?.toLowerCase().includes(terminoBusqueda) ||
          pago.id.toLowerCase().includes(terminoBusqueda)
    )}

    return pagosFiltrados
  }

  const actualizarEstadoPago = async (idPago, nuevoEstado) => {
    try {
      const pagoRef = doc(db, "Pagos", idPago)
      await updateDoc(pagoRef, {
        estado: nuevoEstado
        
      })

      setPagos(pagos.map(pago => 
        pago.id === idPago ? { 
          ...pago, 
          estado: nuevoEstado
         
        } : pago
      ))
    } catch (error) {
      console.error("Error actualizando pago:", error)
    }
  }

  const getColorEstado = (estado) => {
    switch (estado) {
      case "completado":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatFecha = (fecha) => {
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
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
      <h1 className="text-2xl font-bold mb-6">Gestión de Pagos</h1>

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
              <option value="todos">Todos los pagos</option>
              <option value="pendiente">Pendientes</option>
              <option value="completado">Completados</option>
              <option value="cancelado">Cancelados</option>
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
              placeholder="Buscar por cliente, email, ID..."
              className="p-2 border border-gray-300 rounded-md w-full md:w-64"
            />
          </div>
        </div>

        <div className="text-right">
          <span className="block text-sm font-medium text-gray-700 mb-1">Total recaudado</span>
          <span className="text-2xl font-bold">
          {pagos
            .filter((p) => p.estado === "completado")
            .reduce((sum, p) => sum + Number(p.total || 0), 0)
            .toFixed(2)}{" "}
            Bs
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPagosFiltrados().map((pago) => (
                <tr key={pago.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pago.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {pago.resumenReserva?.cliente || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pago.resumenReserva?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pago.resumenReserva?.telefono || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFecha(pago.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {Number(pago.total || 0).toFixed(2)} Bs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pago.metodoPago || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColorEstado(pago.estado)}`}>
                      {pago.estado?.charAt(0).toUpperCase() + pago.estado?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {pago.estado === "pendiente" && (
                        <>
                          <button
                            onClick={() => actualizarEstadoPago(pago.id, "completado")}
                            className="text-green-600 hover:text-green-900"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => actualizarEstadoPago(pago.id, "cancelado")}
                            className="text-red-600 hover:text-red-900"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setPagoSeleccionado(pago.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {getPagosFiltrados().length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No se encontraron pagos con los filtros seleccionados</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Resumen de pagos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Total pagos</div>
            <div className="text-2xl font-bold">{pagos.length}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600">Pendientes</div>
            <div className="text-2xl font-bold">
              {pagos.filter((p) => p.estado === "pendiente").length}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Completados</div>
            <div className="text-2xl font-bold">
              {pagos.filter((p) => p.estado === "completado").length}
            </div>
          </div>
        </div>
      </div>
      {pagoSeleccionado && (
        <DetallePago 
          pagoId={pagoSeleccionado} 
          onClose={() => setPagoSeleccionado(null)} 
        />
      )}
    </div>
  )
}