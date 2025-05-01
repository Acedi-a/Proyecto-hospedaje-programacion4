import { useState } from "react";
import { ReservaHabitacion } from "../../components/user/SeccionReservaHabitacion";
import { ReservaDetalles } from "../../components/user/SeccionReservaDetalle";
import { ReservaConfirmacion } from "../../components/user/SeccionReservaConfirmacion.jsx";
import { ReservaPago } from "../../components/user/SeccionReservaPago";

import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../data/firebase.jsx";

export const NuevaReserva = () => {
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
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
    imagenUrl: "",
  });

  // Manejo de cambios en inputs
  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Manejo de fechas
  const handleDateChange = (date, type) =>
    setFormData({
      ...formData,
      [type === "start" ? "fechaInicio" : "fechaFin"]: date,
    });

  // Manejo de selección de servicios
  const handleServiceToggle = (updatedServices) => {
    setFormData({
      ...formData,
      serviciosAdicionales: updatedServices,
    });
  };

  // Cálculo del total
  const calcularTotal = () => {
    if (!formData.fechaInicio || !formData.fechaFin || formData.precioNoche <= 0) return 0;

    const diffTime = Math.abs(formData.fechaFin - formData.fechaInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const precioHabitacion = formData.precioNoche * diffDays;
    const precioServicios = formData.serviciosAdicionales.reduce(
      (acc, servicio) => acc + servicio.precio,
      0
    );

    return precioHabitacion + precioServicios;
  };

  // Seleccionar habitación
  const handleRoomSelect = (habitacion) => {
    setSelectedRoom(habitacion.id);

    setFormData({
      ...formData,
      habitacion: habitacion.nombre,
      habitacionId: habitacion.id,
      descripcion: habitacion.descripcion,
      camas: habitacion.camas,
      capacidad: habitacion.capacidad,
      precioNoche: habitacion.precio,
      serviciosDisponibles: habitacion.servicios || [],
      imagenUrl: habitacion.imagenUrl,
    });
  };

  // Validaciones previas al siguiente paso
  const isNextEnabled = () => {
    switch (step) {
      case 1:
        return !!formData.habitacionId;
      case 2:
        return (
          formData.fechaInicio &&
          formData.fechaFin &&
          formData.nombre &&
          formData.email &&
          formData.telefono
        );
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (isNextEnabled()) {
      setStep(step + 1);
    } else {
      alert("Por favor completa los campos requeridos.");
    }
  };

  const finishReservation = () => {
    alert("¡Gracias por tu reserva!");
  };

  const AddDetallesPagoReserva = async () => {
    try {
      const pagoRef = await addDoc(collection(db, "Pagos"), {
        fechaPago: new Date(),
        metodoPago: "Tarjeta de debito", 
        total: calcularTotal(), 
        estado: "pendiente",
        resumenReserva:{
          cliente: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
        }
      })
      const idpago = pagoRef.id;
      console.log("servicios: ",formData.serviciosAdicionales);

      const reservaRef = await addDoc(collection(db, "Reservas"), {
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        huespedes: formData.huespedes,
        fechaReserva: new Date(),
        estado: "pendiente",
        habitacion: formData.habitacionId,
        idserviciosadicionales: formData.serviciosAdicionales,
        idpago: idpago,
        idusuario: "iddelapersona",
        comentariosAdicionales: formData.comentarios,
      })
      const idReserva = reservaRef.id;

      await updateDoc(doc(db,"Pagos",idpago),{
        idreserva: idReserva
      });

      setStep(4);
    }
    catch (error) {
      console.error("Error al agregar detalles de pago:", error);
    }
  }

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
      {step === 3 && <ReservaPago onSuccess={() => AddDetallesPagoReserva()} />}
      {step === 4 && <ReservaConfirmacion formData={formData} calcularTotal={calcularTotal} onFinish={finishReservation} />}

      {/* Botones de navegación */}
      <div className="flex justify-between mt-8">
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Anterior
          </button>
        )}

        {step < 3 && (
          <button
            onClick={goToNextStep}
            disabled={!isNextEnabled()}
            className={`px-4 py-2 rounded transition ${isNextEnabled()
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-emerald-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Siguiente
          </button>
        )}

        {step === 4 && (
          <button
            onClick={finishReservation}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
};