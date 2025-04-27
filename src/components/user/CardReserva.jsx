import { Link } from "react-router-dom"
import { CalendarDays, Edit, X, Star } from "lucide-react"
import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'

export const CardReserva = ({ reserva, historica = false }) => {
  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    const date = parseISO(fecha);
    return format(date, 'dd MMMM yyyy', { locale: es });
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "confirmada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "completada":
        return "bg-blue-100 text-blue-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="overflow-hidden border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{reserva.habitacion}</h3>
            <p className="text-sm text-gray-500">Reserva #{reserva.id}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reserva.estado)}`}>
            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {formatearFecha(reserva.fechaInicio)} - {formatearFecha(reserva.fechaFin)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Huéspedes</span>
            <span>{reserva.huespedes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Precio Total</span>
            <span className="font-semibold">${reserva.precio.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between p-4 border-t">
        {historica ? (
          <>
            {!reserva.calificada ? (
              <Link
                to={`/calificaciones/nueva/${reserva.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Star className="h-4 w-4 mr-2" />
                Calificar Estancia
              </Link>
            ) : (
              <span className="text-sm text-gray-500">Estancia calificada</span>
            )}
            <Link
              to={`/reservas/detalle/${reserva.id}`}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
              Ver Detalles
            </Link>
          </>
        ) : (
          <>
            <Link
              to={`/reservas/editar/${reserva.id}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modificar
            </Link>
            <Link
              to={`/reservas/cancelar/${reserva.id}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-red-500 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
