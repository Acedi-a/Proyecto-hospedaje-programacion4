import { Link } from "react-router-dom";
import { CalendarDays, Edit, X, Star } from "lucide-react";
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const CardReserva = ({ reserva, historica = false }) => {
  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    const date = parseISO(fecha);
    return format(date, 'dd MMMM yyyy', { locale: es });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "confirmada":
        return "bg-green-50 text-green-700 border-green-200";
      case "pendiente":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "completada":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelada":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="overflow-hidden border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{reserva.habitacion}</h3>
            <p className="text-xs text-gray-400">Reserva #{reserva.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(reserva.estado)} border`}>
            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <CalendarDays className="h-5 w-5 mr-2 text-gray-400" />
            <span className="text-sm">
              {formatearFecha(reserva.fechaInicio)} - {formatearFecha(reserva.fechaFin)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Huéspedes</span>
            <span className="font-medium text-gray-700">{reserva.huespedes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Precio Total</span>
            <span className="font-bold text-gray-800">${reserva.precio.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between p-4 border-t border-gray-100 gap-2">
        {historica ? (
          <>
            {!reserva.calificada ? (
              <Link
                to={`/calificaciones/nueva/${reserva.id}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <Star className="h-4 w-4 mr-2" />
                Calificar Estancia
              </Link>
            ) : (
              <span className="text-sm text-gray-400 self-center">✅ Estancia calificada</span>
            )}
            <Link
              to={`/reservas/detalle/${reserva.id}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Ver Detalles
            </Link>
          </>
        ) : (
          <>
            <Link
              to={`/reservas/editar/${reserva.id}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modificar
            </Link>
            <Link
              to={`/reservas/cancelar/${reserva.id}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Link>
          </>
        )}
      </div>
    </div>
  );
};