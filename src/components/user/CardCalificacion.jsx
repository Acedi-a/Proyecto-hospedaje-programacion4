import { Star } from "lucide-react"

export const CardCalificacion = ({ calificacion, esMia }) => {
  const renderEstrellas = (puntuacion) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-5 h-5 ${n <= puntuacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
        />
      ))}
    </div>
  )

  return (
    <div className="rounded-xl shadow-md p-5 border border-gray-200 bg-white transition hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {esMia ? "Tu reseña" : calificacion.cliente || "Cliente"}
          </h3>
          <p className="text-sm text-gray-500">
            {calificacion.fechaComentario?.toDate().toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </p>
        </div>
        {renderEstrellas(calificacion.puntuacion)}
      </div>

      <div className="mt-3 text-gray-700 text-sm">
        <p className="leading-relaxed">{calificacion.comentario}</p>
      </div>
    </div>
  )
}

