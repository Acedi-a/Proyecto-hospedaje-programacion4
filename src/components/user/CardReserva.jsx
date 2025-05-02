import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Edit, X, Users, Bed, Tag, CheckCircle, DollarSign, Home } from "lucide-react";
import { ModalEditarReserva } from "./ModalEditarReserva";
import { toast } from "react-toastify";

export const CardReserva = ({ reserva, historica = false, onReservaUpdated }) => {
  const [showModal, setShowModal] = useState(false);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "confirmada":
        return "bg-green-500 text-white";
      case "pendiente":
        return "bg-yellow-500 text-white";
      case "completada":
        return "bg-blue-500 text-white";
      case "cancelada":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleUpdateSuccess = () => {
    toast.success("✅ Reserva actualizada con éxito");
    onReservaUpdated?.();
  };

  return (
    <div className="overflow-hidden border border-gray-200 rounded-xl shadow-lg transition-shadow duration-300 bg-white flex flex-col">

      <div className="bg-gray-100 p-4 flex justify-between items-center border-b border-gray-200">
        <h4 className="font-bold text-lg text-gray-800">{reserva.habitacion?.nombre || 'Habitación no disponible'}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(reserva.estado)}`}>
          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="flex flex-col justify-between">
          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-1">Fechas:</p>
            <div className="flex items-center text-lg font-semibold text-blue-600">
              <CalendarDays className="h-6 w-6 mr-2" />
              <span>{reserva.fechaInicio}</span>
              <span className="mx-2">-</span>
              <span>{reserva.fechaFin}</span>
            </div>
          </div>

          <div className="text-sm text-gray-700 space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Reserva ID:</span>
              <span className="font-medium">{reserva.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 inline-flex items-center"><Users className="h-4 w-4 mr-1" /> Huéspedes:</span>
              <span className="font-medium">{reserva.huespedes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 inline-flex items-center"><DollarSign className="h-4 w-4 mr-1" /> Precio Total:</span>
              <span className="font-bold text-gray-800">Bs.{reserva.monto || '--'}</span>
            </div>
          </div>

          {reserva.habitacion?.descripcion && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-1">Descripción:</p>
              <p className="text-sm text-gray-700">{reserva.habitacion.descripcion}</p>
            </div>
          )}
        </div>

        <div>
          {reserva.habitacion?.imagenUrl ? (
            <img
              src={reserva.habitacion.imagenUrl}
              alt={`Imagen de ${reserva.habitacion?.nombre || 'la habitación'}`}
              className="w-full h-40 object-cover rounded-md mb-4 shadow-sm"
            />
          ) : (
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md mb-4 text-gray-500 shadow-sm">
              <Home className="h-10 w-10" />
            </div>
          )}


          {reserva.habitacion && (
            <div className="text-sm text-gray-700 space-y-2 mb-4">
              <p className="text-gray-500 text-sm mb-1">Detalles de la habitación:</p>
              <div className="flex items-center"><Users className="h-4 w-4 mr-2 text-gray-500" /> Capacidad: {reserva.habitacion.capacidad || '--'}</div>
              <div className="flex items-center"><Bed className="h-4 w-4 mr-2 text-gray-500" /> Camas: {reserva.habitacion.camas || '--'}</div>
              <div className="flex items-center"><Tag className="h-4 w-4 mr-2 text-gray-500" /> Precio por noche: Bs.{reserva.habitacion.precio || '--'}</div>
            </div>
          )}


          {reserva.habitacion?.servicios && reserva.habitacion.servicios.length > 0 && (
            <div>
              <p className="text-gray-500 text-sm mb-2">Comodidades:</p>
              <div className="flex flex-wrap gap-2">
                {reserva.habitacion.servicios.map((servicio, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                    {servicio.charAt(0).toUpperCase() + servicio.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>


      <div className="flex flex-col sm:flex-row justify-end p-4 bg-gray-50 border-t border-gray-200 gap-2 rounded-b-xl">
        {historica ? (
          <>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors duration-200"
              type="button"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modificar
            </button>
          </>
        )}
      </div>

      {showModal && (
        <ModalEditarReserva
          reserva={reserva}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  );
};