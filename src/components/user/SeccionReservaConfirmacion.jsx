import { MapPin, Calendar as CalendarIcon, User as UserIcon, CreditCard as CreditCardIcon, CheckCircle } from "lucide-react";
import { data } from "react-router-dom";

export const ReservaConfirmacion = ({ formData, calcularTotal, datauser }) => {
  // Formatear fechas
  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "-";
  };

  console.log("USERDATA?: ", datauser);

  return (
    <div className="border rounded-lg overflow-hidden shadow-md bg-white">
      {/* Encabezado */}
      <div className="bg-emerald-600 p-6 text-white flex items-center gap-3">
        <CheckCircle className="w-8 h-8" />
        <div>
          <h2 className="text-xl font-bold">Tu Reserva está Completa</h2>
          <p className="text-sm opacity-90">Gracias por tu confianza. A continuación el resumen:</p>
        </div>
      </div>

      {/* Contenido del resumen */}
      <div className="p-6 space-y-8">
        {/* Datos Personales */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <UserIcon className="w-5 h-5 mr-2 text-emerald-600" />
            <h3 className="font-semibold">Datos del Huésped</h3>
          </div>
          <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
            <div><span className="text-gray-500">Nombre:</span> {datauser.nombre+" "+datauser.apellido}</div>
            <div><span className="text-gray-500">Email:</span> {datauser.email}</div>
            <div><span className="text-gray-500">Teléfono:</span> {datauser.telefono}</div>
            <div><span className="text-gray-500">Huéspedes:</span> {formData.huespedes}</div>
          </div>
        </div>

        {/* Habitación */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
            <h3 className="font-semibold">Habitación Seleccionada</h3>
          </div>
          <div className="pl-7">
            <p><span className="font-medium">{formData.habitacion}</span></p>
            <p className="text-sm text-gray-500">{formData.descripcion}</p>
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <CalendarIcon className="w-5 h-5 mr-2 text-emerald-600" />
            <h3 className="font-semibold">Fechas de Estadía</h3>
          </div>
          <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
            <div><span className="text-gray-500">Llegada:</span> {formatDate(formData.fechaInicio)}</div>
            <div><span className="text-gray-500">Salida:</span> {formatDate(formData.fechaFin)}</div>
          </div>
        </div>

        {/* Servicios adicionales */}
        {formData.serviciosAdicionales.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <CreditCardIcon className="w-5 h-5 mr-2 text-emerald-600" />
              <h3 className="font-semibold">Servicios Adicionales</h3>
            </div>
            <div className="pl-7 space-y-2 text-sm text-gray-800">
              <ul className="list-disc list-inside">
                {formData.serviciosAdicionales.map((servicio, index) => (
                  <li className="flex gap-2 text-center items-center" key={index}>{servicio.nombre}:<span className="font-semibold text-lg text-emerald-600">{servicio.precio}</span></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t border-gray-200 text-right">
          <h4 className="text-xl font-bold text-emerald-700">Total a pagar: ${calcularTotal()}</h4>
          <p className="text-xs text-gray-500 mt-1">Este monto fue cubierto durante el proceso de pago.</p>
        </div>
      </div>

      {/* Pie de página opcional */}
      <div className="bg-gray-50 px-6 py-4 border-t text-sm text-gray-500">
        Si necesitas modificar algo o tienes dudas, no dudes en contactarnos.
      </div>
    </div>
  );
};