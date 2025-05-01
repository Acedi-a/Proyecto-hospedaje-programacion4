import { useState } from "react"
import { ReservaHabitacion } from "../../components/user/SeccionReservaHabitacion"
import { ReservaDetalles } from "../../components/user/SeccionReservaDetalle"
import { ReservaConfirmacion } from "../../components/user/SeccionReservaConfirmacion.jsx"

export const NuevaReserva = () => {
  const [step, setStep] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [formData, setFormData] = useState({
    habitacion: "",
    habitacionId: "",
    fechaInicio: null,
    fechaFin: null,
    huespedes: "2",
    nombre: "",
    email: "",
    telefono: "",
    comentarios: "",
    serviciosAdicionales: [],
    precioNoche: 0,
  })

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleDateChange = (date, type) => {
    setFormData({
      ...formData,
      [type === "start" ? "fechaInicio" : "fechaFin"]: date
    })
  }

  const handleServiceToggle = (servicio) => {
    const servicios = [...formData.serviciosAdicionales]
    const idx = servicios.indexOf(servicio)
    idx === -1 ? servicios.push(servicio) : servicios.splice(idx, 1)
    setFormData({ ...formData, serviciosAdicionales: servicios })
  }

  const calcularTotal = () => {
    if (!formData.fechaInicio || !formData.fechaFin || formData.precioNoche <= 0) return 0

    const diffTime = Math.abs(formData.fechaFin - formData.fechaInicio)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const precioHabitacion = formData.precioNoche * diffDays
    const precioServicios = formData.serviciosAdicionales.length * 20 // Precio fijo por servicio adicional
    return precioHabitacion + precioServicios
  }

  const handleRoomSelect = (habitacion) => {
    setSelectedRoom(habitacion.id)

    setFormData({
      ...formData,
      habitacion: habitacion.nombre,
      habitacionId: habitacion.id,
      descripcion: habitacion.descripcion,
      camas: habitacion.camas,
      capacidad: habitacion.capacidad,
      precioNoche: habitacion.precio,
      serviciosDisponibles: habitacion.servicios || [],
      imagenUrl: habitacion.imagenUrl
    })
  }
  console.log(selectedRoom)

  return (
    <div className="container mx-auto px-4 py-8">
      {step === 1 && <ReservaHabitacion selectedRoom={selectedRoom} onSelectRoom={handleRoomSelect} />}
      {step === 2 && (
        <ReservaDetalles
          formData={formData}
          onFormChange={handleFormChange}
          onDateChange={handleDateChange}
          onServiceToggle={handleServiceToggle}
        />
      )}
      {step === 3 && <ReservaConfirmacion formData={formData} calcularTotal={calcularTotal} />}

      <div className="flex justify-between mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Anterior
          </button>
        )}
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            className="px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Siguiente
          </button>
        )}
        {step === 3 && (
          <button
            onClick={() => alert("Reserva Confirmada")}
            className="px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Confirmar Reserva
          </button>
        )}
      </div>
    </div>
  )
}