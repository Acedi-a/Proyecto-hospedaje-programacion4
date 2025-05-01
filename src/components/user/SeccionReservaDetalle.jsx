import { useEffect, useState } from "react";
import { db } from "../../data/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";

export const ReservaDetalles = ({ formData, onFormChange, onDateChange, onServiceToggle }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "Servicios"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const serviciosArray = [];
        snapshot.forEach((doc) => {
          serviciosArray.push({ ...doc.data(), id: doc.id });
        });
        setServicios(serviciosArray);
        console.log(serviciosArray); // Corregido: console.log en lugar de consolelog
        setLoading(false);
      },
      (err) => {
        console.error("Error al cargar servicios:", err);
        setError("No se pudieron cargar los servicios adicionales.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Cargando servicios...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <form className="space-y-6">
      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Servicios Adicionales */}
      <div>
        <h3 className="text-lg font-medium">Servicios Adicionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicios.length > 0 ? (
            servicios
              .filter((s) => s.estado === "activo" || s.estado === true)
              .map((servicio) => (
                <div key={servicio.id} className="flex items-start space-x-3 border rounded-md p-3">
                  <input
                    type="checkbox"
                    checked={formData.serviciosAdicionales.includes(servicio.id)}
                    onChange={() => onServiceToggle(servicio.id)}
                    className="mt-1"
                  />
                  <div>
                    <label className="font-medium">{servicio.nombre}</label>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{servicio.descripcion}</span>
                      <span>${servicio.precio}/persona</span>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p>No hay servicios disponibles.</p>
          )}
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
  );
};