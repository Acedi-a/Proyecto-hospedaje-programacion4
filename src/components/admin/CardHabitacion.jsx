import { MoreHorizontal, Users } from "lucide-react"

export const CardHabitacion = ({ habitacion, onEdit, onDelete, onChangeStatus }) => {
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
    <div className="overflow-hidden border rounded-lg shadow-sm">
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
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => {

                onEdit(habitacion.id)
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
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
  )
}
