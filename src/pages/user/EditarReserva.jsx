

import { useState, useEffect } from "react";
import {reservasData } from "../../data/reservas"
import { useParams } from "react-router-dom";

export const EditarReserva = ({ params }) => {
  const { id } = useParams();

  const [reserva, setReserva] = useState({
    id: "",
    habitacion: "",
    fechaInicio: "",
    fechaFin: "",
    huespedes: "",
    comentarios: "",
  });

  useEffect(() => {
    const reservaEncontrada = reservasData.find((r) => r.id === id);
    if (reservaEncontrada) {
      setReserva({
        id: reservaEncontrada.id,
        habitacion: reservaEncontrada.habitacion,
        fechaInicio: reservaEncontrada.fechaInicio,
        fechaFin: reservaEncontrada.fechaFin,
        huespedes: reservaEncontrada.huespedes,
        comentarios: reservaEncontrada.comentarios,
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setReserva({
      ...reserva,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(reserva);
    alert("Reserva actualizada con éxito");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Modificar Reserva</h1>
        <p className="text-muted-foreground mt-1">
          Actualiza los detalles de tu reserva #{reserva.id}
        </p>
      </div>

      <div className="max-w-2xl mx-auto border rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-2">Detalles de la Reserva</h2>
        <p className="text-gray-500 mb-6">
          Modifica las fechas, número de huéspedes o comentarios
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Fecha de llegada</label>
              <input
                type="date"
                name="fechaInicio"
                value={reserva.fechaInicio.split("T")[0]}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Fecha de salida</label>
              <input
                type="date"
                name="fechaFin"
                value={reserva.fechaFin.split("T")[0]}
                onChange={handleChange}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Número de huéspedes</label>
            <select
              name="huespedes"
              value={reserva.huespedes}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1">1 persona</option>
              <option value="2">2 personas</option>
              <option value="3">3 personas</option>
              <option value="4">4 personas</option>
              <option value="5">5 personas</option>
              <option value="6">6 personas</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Comentarios o solicitudes especiales
            </label>
            <textarea
              name="comentarios"
              value={reserva.comentarios}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={4}
              placeholder="Indícanos si tienes alguna solicitud especial para tu estancia"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="border rounded-md px-4 py-2 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-600 text-white rounded-md px-4 py-2 hover:bg-emerald-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
