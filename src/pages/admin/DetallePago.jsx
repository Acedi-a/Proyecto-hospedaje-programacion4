'use client'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../data/firebase'

export const DetallePago = ({ pagoId, onClose }) => {
  const [pago, setPago] = useState(null)
  const [reserva, setReserva] = useState(null)
  const [habitacion, setHabitacion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDetalles = async () => {
      try {
        // 1. Cargar datos del pago
        const pagoRef = doc(db, "Pagos", pagoId)
        const pagoSnap = await getDoc(pagoRef)
        
        if (!pagoSnap.exists()) {
          throw new Error("Pago no encontrado")
        }
        
        const pagoData = pagoSnap.data()
        setPago({
          id: pagoSnap.id,
          ...pagoData,
          fecha: pagoData.fechaPago?.toDate() || new Date()
        })

        // 2. Cargar datos de la reserva relacionada
        if (pagoData.idreserva) {
          const reservaRef = doc(db, "Reservas", pagoData.idreserva)
          const reservaSnap = await getDoc(reservaRef)
          
          if (reservaSnap.exists()) {
            const reservaData = reservaSnap.data()
            setReserva({
              id: reservaSnap.id,
              ...reservaData,
              fechaInicio: reservaData.fechaInicio?.toDate(),
              fechaFin: reservaData.fechaFin?.toDate(),
              fechaReserva: reservaData.fechaReserva?.toDate()
            })

            // 3. Cargar datos de la habitación relacionada
            if (reservaData.habitacionId) {
              const habitacionRef = doc(db, "Habitaciones", reservaData.habitacionId)
              const habitacionSnap = await getDoc(habitacionRef)
              
              if (habitacionSnap.exists()) {
                setHabitacion({
                  id: habitacionSnap.id,
                  ...habitacionSnap.data()
                })
              }
            }
          }
        }
      } catch (error) {
        console.error("Error cargando detalles:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarDetalles()
  }, [pagoId])

  const formatFechaCompleta = (fecha) => {
    if (!fecha) return 'N/A'
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (cargando) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!pago) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div 
          className="absolute inset-0 bg-black bg-opacity-30"
          onClick={onClose}
        ></div>
        <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
          <p>No se encontró información para este pago.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fondo semitransparente */}
      
      
      {/* Contenido del modal */}
      <div className="relative bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg mx-4 border border-gray-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        <h3 className="text-xl font-bold mb-4">Detalle Completo del Pago</h3>

        <div className="space-y-6">
          {/* Sección de Información del Pago */}
          <div className="border-b pb-4">
            <h4 className="font-bold text-lg mb-3">Información del Pago</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">ID:</span> {pago.id}</p>
                <p><span className="font-medium">Estado:</span> {pago.estado}</p>
                <p><span className="font-medium">Fecha:</span> {formatFechaCompleta(pago.fecha)}</p>
              </div>
              <div>
                <p><span className="font-medium">Método de pago:</span> {pago.metodoPago || 'N/A'}</p>
                <p><span className="font-medium">Total:</span> {Number(pago.total || 0).toFixed(2)} Bs</p>
                <p><span className="font-medium">ID Reserva:</span> {pago.idreserva || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Sección de Información del Cliente */}
          {pago.resumenReserva && (
            <div className="border-b pb-4">
              <h4 className="font-bold text-lg mb-3">Información del Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Nombre:</span> {pago.resumenReserva.cliente || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {pago.resumenReserva.email || 'N/A'}</p>
                </div>
                <div>
                  <p><span className="font-medium">Teléfono:</span> {pago.resumenReserva.telefono || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Información de la Reserva */}
          {reserva && (
            <div className="border-b pb-4">
              <h4 className="font-bold text-lg mb-3">Detalles de la Reserva</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">ID Reserva:</span> {reserva.id}</p>
                  <p><span className="font-medium">Estado:</span> {reserva.estado}</p>
                  <p><span className="font-medium">Fecha Reserva:</span> {formatFechaCompleta(reserva.fechaReserva)}</p>
                </div>
                <div>
                  
                  <p><span className="font-medium">Huéspedes:</span> {reserva.huespedes}</p>
                </div>
              </div>
              {reserva.comentariosAdicionales && (
                <div className="mt-3">
                  <p><span className="font-medium">Comentarios:</span> {reserva.comentariosAdicionales}</p>
                </div>
              )}
            </div>
          )}

          {/* Sección de Información de la Habitación */}
          {habitacion && (
            <div>
              <h4 className="font-bold text-lg mb-3">Información de la Habitación</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Tipo:</span> {habitacion.nombre || reserva?.habitacion || 'N/A'}</p>
                  <p><span className="font-medium">Camas:</span> {habitacion.camas}</p>
                  <p><span className="font-medium">Capacidad:</span> {habitacion.capacidad}</p>
                </div>
                <div>
                  <p><span className="font-medium">Estado:</span> {habitacion.estado}</p>
                  <p><span className="font-medium">Descripción:</span> {habitacion.descripcion}</p>
                </div>
              </div>
              {habitacion.imagenUrl && (
                <div className="mt-4">
                  <img 
                    src={habitacion.imagenUrl} 
                    alt="Habitación" 
                    className="max-w-full h-auto rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}