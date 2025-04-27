
import { useState } from "react"
import { Link } from "react-router-dom"
import { CardServicio } from "../../components/user/CardServicio"
import { serviciosData, misPedidosData } from "../../data/servicios"

export const Servicios = () => {
  const [activeTab, setActiveTab] = useState("disponibles")

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "confirmado":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "completado":
        return "bg-blue-100 text-blue-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Servicios Adicionales</h1>
        <p className="text-gray-500 mt-1">Mejora tu estancia con nuestros servicios adicionales</p>
      </div>

      <div className="mb-8">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "disponibles"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("disponibles")}
            >
              Servicios Disponibles
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "mis-pedidos"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("mis-pedidos")}
            >
              Mis Pedidos
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "disponibles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviciosData.map((servicio) => (
            <CardServicio key={servicio.id} servicio={servicio} />
          ))}
        </div>
      )}

      {activeTab === "mis-pedidos" && (
        <>
          {misPedidosData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No has solicitado ningún servicio adicional.</p>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setActiveTab("disponibles")}
              >
                Ver Servicios Disponibles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {misPedidosData.map((pedido) => (
                <div key={pedido.id} className="border rounded-lg shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{pedido.servicio}</h3>
                        <p className="text-sm text-gray-500">Reserva: {pedido.habitacion}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha</span>
                        <span>{pedido.fecha}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Precio</span>
                        <span className="font-semibold">${pedido.precio.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between p-4 border-t">
                    {pedido.estado === "pendiente" && (
                      <Link to={`/servicios/cancelar/${pedido.id}`}>
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-500 bg-white hover:bg-gray-50">
                          Cancelar
                        </button>
                      </Link>
                    )}
                    <Link to={`/servicios/detalle/${pedido.id}`}>
                      <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                        Ver Detalles
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

