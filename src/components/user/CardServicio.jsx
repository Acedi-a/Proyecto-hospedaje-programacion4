import { Link } from "react-router-dom"
import { Plus } from "lucide-react"

export const CardServicio = ({ servicio }) => {
  return (
    <div className="overflow-hidden border rounded-lg shadow-sm">
      <div className="relative h-48 w-full">
        <img src={servicio.imagen || "/placeholder.svg"} alt={servicio.nombre} className="object-cover w-full h-full" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">{servicio.icono}</div>
          <h3 className="font-medium text-lg">{servicio.nombre}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">{servicio.descripcion}</p>
        <p className="font-semibold">${servicio.precio} por persona</p>
      </div>
      <div className="p-4 border-t">
        <Link
          to={`/servicios/solicitar/${servicio.id}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Solicitar
        </Link>
      </div>
    </div>
  )
}
