import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Star } from "lucide-react"
import { db } from "../../data/firebase"
import { collection, getDocs, query, where, addDoc, Timestamp } from "firebase/firestore"
import Select from "react-select"

export const NuevaCalificacion = () => {
  const navigate = useNavigate()
  const [puntuacion, setPuntuacion] = useState(0)
  const [reserva, setReserva] = useState("")
  const [comentario, setComentario] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reservasUser, setReservasUser] = useState([])

  const { userData } = useOutletContext()

  useEffect(() => {
    const fetchReservas = async () => {
      if (!userData?.uid) return
      console.log("uid en calificacion: ", userData.uid)

      try {
        const q = query(collection(db, "Reservas"), where("idusuario", "==", userData.uid))
        const snapshot = await getDocs(q)

        const reservas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        console.log(reservas)
        setReservasUser(reservas)
      } catch (error) {
        console.error("Error al obtener reservas:", error)
      }
    }

    fetchReservas()
  }, [userData?.uid])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (puntuacion === 0 || !reserva) {
      alert("Por favor, selecciona una reserva y asigna una puntuación")
      return
    }

    setIsSubmitting(true)

    try {
      const reservaSeleccionada = reservasUser.find(r => r.id === reserva)
      console.log("reserva seleccionada: ", reservaSeleccionada)

      await addDoc(collection(db, "reseñas"), {
        cliente: userData.nombre+" "+userData.apellido,
        comentario,
        fechaComentario: Timestamp.now(),
        reservaId: reservaSeleccionada.id,
        puntuacion,
        usuarioId: userData.uid
      })

      alert("Calificación enviada con éxito")
      navigate("/calificaciones")
    } catch (error) {
      console.error("Error al enviar calificación:", error)
      alert("Hubo un error al enviar tu calificación")
    } finally {
      setIsSubmitting(false)
    }
  }

  const estadoColor = {
    completada: "#34d399",
    pendiente: "#facc15",
    cancelada: "#f87171"
  }

  const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()

  const opcionesReserva = reservasUser.map((res) => ({
    value: res.id,
    label: (
      <div className="flex items-center gap-2">
        <span
          className="text-white text-xs font-semibold px-2 py-0.5 rounded"
          style={{ backgroundColor: estadoColor[res.estado.toLowerCase()] || "#a8a29e" }}
        >
          {capitalizar(res.estado)}
        </span>
        <span>
          {res.habitacion} ({res.fechaInicio.toDate().toLocaleDateString()} - {res.fechaFin.toDate().toLocaleDateString()})
        </span>
      </div>
    ),
    estado: res.estado.toLowerCase()
  }))

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#d1fae5" : "white",
      color: "black",
      padding: 10
    })
  }

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
              <label className="block text-sm font-medium mb-2">Selecciona la reserva a calificar</label>
              <Select
                options={opcionesReserva}
                value={opcionesReserva.find((op) => op.value === reserva)}
                onChange={(selected) => setReserva(selected.value)}
                styles={customStyles}
                placeholder="Selecciona una reserva"
                isSearchable={false}
                getOptionLabel={(e) => e.label}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">¿Cómo calificarías tu experiencia?</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    className="p-1 focus:outline-none"
                    onClick={() => setPuntuacion(valor)}
                  >
                    <Star
                      className={`h-8 w-8 ${valor <= puntuacion ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {[
                  "Muy insatisfecho",
                  "Insatisfecho",
                  "Neutral",
                  "Satisfecho",
                  "Muy satisfecho"
                ][puntuacion - 1] || "Selecciona una puntuación"}
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
  )
} 
