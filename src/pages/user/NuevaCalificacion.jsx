import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

export const NuevaCalificacion = () => {
  const navigate = useNavigate();
  const [puntuacion, setPuntuacion] = useState(0);
  const [reserva, setReserva] = useState("");
  const [comentario, setComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reservasCompletadas = [
    {
      id: "res-003",
      habitacion: "Habitación Estándar",
      fechaEstancia: "5 - 10 enero 2025",
    },
    {
      id: "res-004",
      habitacion: "Cabaña Familiar",
      fechaEstancia: "20 - 27 diciembre 2024",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (puntuacion === 0 || !reserva) {
      alert("Por favor, selecciona una reserva y asigna una puntuación");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      alert("Calificación enviada con éxito");
      navigate("/calificaciones");
    }, 1000);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nueva Calificación</h1>
        <p className="text-gray-500 mt-1">Comparte tu experiencia y ayúdanos a mejorar</p>
      </div>

      <div className="max-w-2xl mx-auto border rounded-2xl shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-semibold">Califica tu Estancia</h2>
          <p className="text-gray-500 mt-1">Tu opinión es muy importante para nosotros y para futuros huéspedes</p>
        </div>

        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Selecciona la reserva a calificar
              </label>
              <select
                value={reserva}
                onChange={(e) => setReserva(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">Selecciona una reserva</option>
                {reservasCompletadas.map((reserva) => (
                  <option key={reserva.id} value={reserva.id}>
                    {reserva.habitacion} ({reserva.fechaEstancia})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                ¿Cómo calificarías tu experiencia?
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    className="p-1 focus:outline-none"
                    onClick={() => setPuntuacion(valor)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        valor <= puntuacion
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {puntuacion === 1
                  ? "Muy insatisfecho"
                  : puntuacion === 2
                  ? "Insatisfecho"
                  : puntuacion === 3
                  ? "Neutral"
                  : puntuacion === 4
                  ? "Satisfecho"
                  : puntuacion === 5
                  ? "Muy satisfecho"
                  : "Selecciona una puntuación"}
              </p>
            </div>

            <div>
              <label htmlFor="comentario" className="block text-sm font-medium mb-2">
                Comentarios y sugerencias
              </label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Cuéntanos tu experiencia y cómo podríamos mejorar"
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate("/calificaciones")}
                disabled={isSubmitting}
                className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : "Enviar Calificación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
