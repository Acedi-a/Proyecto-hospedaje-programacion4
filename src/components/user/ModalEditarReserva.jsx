import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../data/firebase"
import { toast } from "react-toastify"

export const ModalEditarReserva = ({ reserva, onClose, onUpdate }) => {
    const [form, setForm] = useState({
        huespedes: reserva.huespedes?.toString() || "1",
        comentariosAdicionales: reserva.comentariosAdicionales || "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const reservaRef = doc(db, "Reservas", reserva.id)
            await updateDoc(reservaRef, {
                huespedes: parseInt(form.huespedes),
                comentariosAdicionales: form.comentariosAdicionales,
            })

            //toast.success("✅ Reserva actualizada correctamente")
            onUpdate?.() // Notificar al componente padre para actualizar la lista
            onClose() // Cerrar el modal
        } catch (err) {
            console.error("Error al actualizar reserva:", err)
            toast.error("❌ No se pudo actualizar la reserva")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 overflow-auto max-h-[90vh]">
                <h2 className="text-2xl font-semibold mb-4">Modificar Reserva</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Habitación</label>
                        <p className="mt-1">{reserva.habitacion.nombre}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de entrada</label>
                        <p className="mt-1">
                            {reserva.fechaInicio?.toDate
                                ? reserva.fechaInicio.toDate().toLocaleDateString("es-BO")
                                : reserva.fechaInicio}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de salida</label>
                        <p className="mt-1">
                            {reserva.fechaFin?.toDate
                                ? reserva.fechaFin.toDate().toLocaleDateString("es-BO")
                                : reserva.fechaFin}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <p className="mt-1 capitalize">{reserva.estado.toLowerCase()}</p>
                    </div>

                    {reserva.monto && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Monto pagado</label>
                            <p className="mt-1">Bs. {reserva.monto}</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de huéspedes
                        </label>
                        <select
                            name="huespedes"
                            value={form.huespedes}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            disabled={isSubmitting}
                        >
                            <option value="1">1 persona</option>
                            <option value="2">2 personas</option>
                            <option value="3">3 personas</option>
                            <option value="4">4 personas</option>
                            <option value="5">5 personas</option>
                            <option value="6">6 personas</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comentarios o solicitudes especiales
                        </label>
                        <textarea
                            name="comentariosAdicionales"
                            value={form.comentariosAdicionales}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Indícanos si tienes alguna solicitud especial para tu estancia"
                            className="w-full border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}