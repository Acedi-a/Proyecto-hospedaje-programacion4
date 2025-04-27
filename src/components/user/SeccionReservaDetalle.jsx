

import { Calendar, Coffee, Car, Map, Utensils } from "lucide-react"
import { format } from "date-fns"

const servicios = [
  { id: "serv-001", nombre: "Desayuno Gourmet", descripcion: "Productos locales y caseros", precio: 15, icono: <Coffee className="h-4 w-4" /> },
  { id: "serv-002", nombre: "Transporte al Pueblo", descripcion: "Ida y vuelta", precio: 20, icono: <Car className="h-4 w-4" /> },
  { id: "serv-003", nombre: "Tour Guiado", descripcion: "Lugares emblemáticos", precio: 35, icono: <Map className="h-4 w-4" /> },
  { id: "serv-004", nombre: "Cena Romántica", descripcion: "Con velas y vino", precio: 60, icono: <Utensils className="h-4 w-4" /> },
]

export const ReservaDetalles = ({ formData, onFormChange, onDateChange, onServiceToggle }) => {
  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fechas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de llegada</label>
          <div className="relative">
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio ? format(formData.fechaInicio, "yyyy-MM-dd") : ""}
              onChange={(e) => onDateChange(new Date(e.target.value), "start")}
              className="w-full px-3 py-2 border rounded-md"
              min={format(new Date(), "yyyy-MM-dd")}
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de salida</label>
          <div className="relative">
            <input
              type="date"
              name="fechaFin"
              value={formData.fechaFin ? format(formData.fechaFin, "yyyy-MM-dd") : ""}
              onChange={(e) => onDateChange(new Date(e.target.value), "end")}
              className="w-full px-3 py-2 border rounded-md"
              min={formData.fechaInicio ? format(new Date(formData.fechaInicio.getTime() + 86400000), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Huéspedes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Número de huéspedes</label>
        <select name="huespedes" value={formData.huespedes} onChange={onFormChange} className="w-full px-3 py-2 border rounded-md">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
          ))}
        </select>
      </div>

      {/* Servicios */}
      <div>
        <h3 className="text-lg font-medium">Servicios Adicionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="flex items-start space-x-3 border rounded-md p-3">
              <input
                type="checkbox"
                checked={formData.serviciosAdicionales.includes(servicio.id)}
                onChange={() => onServiceToggle(servicio.id)}
                className="mt-1"
              />
              <div>
                <label className="font-medium flex items-center gap-2">{servicio.nombre} <div className="p-1 bg-emerald-100 rounded-full">{servicio.icono}</div></label>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{servicio.descripcion}</span>
                  <span>${servicio.precio}/persona</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Datos Personales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="text" name="nombre" value={formData.nombre} onChange={onFormChange} placeholder="Nombre completo" className="w-full px-3 py-2 border rounded-md" />
        <input type="email" name="email" value={formData.email} onChange={onFormChange} placeholder="Correo electrónico" className="w-full px-3 py-2 border rounded-md" />
        <input type="tel" name="telefono" value={formData.telefono} onChange={onFormChange} placeholder="Teléfono" className="w-full px-3 py-2 border rounded-md" />
      </div>

      {/* Comentarios */}
      <textarea
        name="comentarios"
        rows="3"
        value={formData.comentarios}
        onChange={onFormChange}
        placeholder="Comentarios o solicitudes especiales"
        className="w-full px-3 py-2 border rounded-md resize-none"
      ></textarea>
    </form>
  )
}
