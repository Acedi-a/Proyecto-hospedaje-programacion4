import { Star } from "lucide-react"

export const CardCalificacion = ({ calificacion, esMia = false }) => {
  // Función para renderizar estrellas
  const renderEstrellas = (puntuacion) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < puntuacion ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{esMia ? calificacion.habitacion : calificacion.usuario}</h3>
          <p className="text-sm text-gray-500">
            {esMia ? `Estancia: ${calificacion.fechaEstancia}` : `Por ${calificacion.usuario}`}
          </p>
        </div>
        {renderEstrellas(calificacion.puntuacion)}
      </div>
      <div className="mt-2">
        <p className="text-sm">{calificacion.comentario}</p>
        <p className="text-xs text-gray-500 mt-2">Publicado el {calificacion.fecha}</p>
      </div>
    </div>
  )
}
