
import { habitacionesData } from "../../data/habitaciones"

export const ReservaHabitacion = ({ selectedRoom, onSelectRoom }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habitacionesData.map((habitacion) => (
        <div
          key={habitacion.id}
          className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedRoom === habitacion.id ? "ring-2 ring-emerald-600" : ""}`}
          onClick={() => onSelectRoom(habitacion)}
        >
          <div className="relative h-48 w-full">
            <img src={habitacion.imagen || "/placeholder.svg"} alt={habitacion.nombre} className="object-cover w-full h-full" />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg">{habitacion.nombre}</h3>
            <p className="text-gray-500 text-sm mb-2">{habitacion.descripcion}</p>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Capacidad: {habitacion.capacidad} personas</div>
              <div className="text-lg font-semibold">${habitacion.precio}/noche</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
