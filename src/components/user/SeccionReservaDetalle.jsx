import { useEffect, useState } from "react";
import { db } from "../../data/firebase"; // Asegúrate que la ruta sea correcta
import { collection, query, where, onSnapshot } from "firebase/firestore"; // Añadido 'where' por si acaso
import { Calendar, Check, Users, CalendarDays, Loader2, Info } from "lucide-react"; // Añadido Info icon

export const ReservaDetalles = ({ formData, onFormChange, onDateChange, onServiceToggle, imagenFondo }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- useEffect para cargar servicios (SIN CATEGORÍAS) ---
  useEffect(() => {
    const q = query(
      collection(db, "Servicios"),
      where("estado", "in", [true, "activo"]) // Asegura filtrar en la consulta
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const serviciosArray = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          precio: Number(doc.data().precio) || 0 // Asegurar que precio sea número
        }));

        // Quizás ordenar servicios alfabéticamente o por precio
        serviciosArray.sort((a, b) => a.nombre.localeCompare(b.nombre));

        setServicios(serviciosArray);
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

  // --- Función para seleccionar/deseleccionar servicios (sin cambios) ---
  const handleServiceToggle = (servicio) => {
    const { id, nombre, precio } = servicio;
    const isSelected = formData.serviciosAdicionales?.some((s) => s.id === id); // Usar optional chaining
    let updatedServices;

    if (isSelected) {
      updatedServices = formData.serviciosAdicionales.filter((s) => s.id !== id);
    } else {
      // Asegurar que formData.serviciosAdicionales sea un array antes de hacer spread
      const currentServices = Array.isArray(formData.serviciosAdicionales) ? formData.serviciosAdicionales : [];
      updatedServices = [...currentServices, { id, nombre, precio }];
    }
    onServiceToggle(updatedServices); // Llama a la función del padre
  };


  // --- Estados de Carga y Error (sin cambios) ---
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[300px]">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <span className="ml-2 text-emerald-600 font-medium">Cargando detalles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded text-red-800 m-4">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  // --- Funciones de Fecha (sin cambios) ---
  const formatFecha = (date) => {
    if (!date || !(date instanceof Date)) return "";
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateForInput = (date) => {
    if (!date || !(date instanceof Date)) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentDateFormatted = () => {
    const today = new Date();
    // Evitar seleccionar días pasados
    today.setHours(0, 0, 0, 0);
    return formatDateForInput(today);
  };

  const getMinEndDate = () => {
    if (!formData.fechaInicio || !(formData.fechaInicio instanceof Date)) return getCurrentDateFormatted();
    const nextDay = new Date(formData.fechaInicio);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0); 
    return formatDateForInput(nextDay);
  };

  // --- Componente JSX (SIN TABS de categorías) ---
  return (
    <div className="relative pb-10">
      {/* 1. Capa de Fondo (Imagen + Degradado) - Sin cambios */}
      {imagenFondo && (
        <div className="absolute inset-x-0 top-0 h-64 overflow-hidden -z-10">
          <img
            src={imagenFondo}
            alt="Fondo de reserva"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-white"
            aria-hidden="true"
          />
        </div>
      )}

      {/* 2. Capa de Contenido (Formulario) - Con padding superior */}
      <div className="relative pt-48">
        <div className="bg-white rounded-xl shadow-lg p-6 mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6">Detalles de la Reserva</h2>

          <div className="space-y-6 mb-8"> 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar size={18} className="mr-2 text-emerald-600" />
                  Fecha de llegada *
                </label>
                <input
                  id="fechaInicio"
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio ? formatDateForInput(formData.fechaInicio) : ""}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    const dateObj = dateValue ? new Date(dateValue + 'T00:00:00') : null;
                    onDateChange(dateObj, "start");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min={getCurrentDateFormatted()}
                  required 
                />
                {formData.fechaInicio && (
                  <p className="mt-1 text-xs text-emerald-700">{formatFecha(formData.fechaInicio)}</p>
                )}
              </div>
              <div>
                <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CalendarDays size={18} className="mr-2 text-emerald-600" />
                  Fecha de salida *
                </label>
                <input
                  id="fechaFin"
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin ? formatDateForInput(formData.fechaFin) : ""}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    const dateObj = dateValue ? new Date(dateValue + 'T00:00:00') : null;
                    onDateChange(dateObj, "end");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  min={getMinEndDate()}
                  required 
                  disabled={!formData.fechaInicio}
                />
                {formData.fechaFin && (
                  <p className="mt-1 text-xs text-emerald-700">{formatFecha(formData.fechaFin)}</p>
                )}
              </div>
            </div>
            {formData.fechaInicio && formData.fechaFin && formData.fechaFin <= formData.fechaInicio && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                <p className="text-red-700 font-medium text-center text-sm">
                  La fecha de salida debe ser posterior a la fecha de llegada.
                </p>
              </div>
            )}
            {formData.fechaInicio && formData.fechaFin && formData.fechaFin > formData.fechaInicio && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-2">
                <p className="text-emerald-700 font-medium text-center text-sm">
                  Estancia de {Math.max(0, Math.ceil((formData.fechaFin.getTime() - formData.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)))} noches
                </p>
              </div>
            )}

            {/* Huéspedes */}
            <div className="relative"> 
              <label htmlFor="huespedes" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users size={18} className="mr-2 text-emerald-600" />
                Número de huéspedes *
              </label>
              <select
                id="huespedes"
                name="huespedes"
                value={formData.huespedes || ""}
                onChange={onFormChange} 
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                required 
              >
                <option value="" disabled>Selecciona...</option>
                {[1, 2, 3, 4, 5, 6].map((n) =>
                  <option key={n} value={n}>
                    {n} {n === 1 ? "huésped" : "huéspedes"}
                  </option>
                )}
              </select>
              {/* Icono flecha para select */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 top-9"> {/* Ajustado top */}
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>

          {/* --- Sección de Opcionales --- */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Servicios Adicionales <span className="text-sm font-normal text-gray-500">(Opcional)</span>
              </h3>

              {servicios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      onClick={() => handleServiceToggle(servicio)}
                      onKeyPress={(e) => e.key === 'Enter' && handleServiceToggle(servicio)}
                      role="checkbox"
                      aria-checked={formData.serviciosAdicionales?.some((s) => s.id === servicio.id)} 
                      tabIndex={0}
                      className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out group ${formData.serviciosAdicionales?.some((s) => s.id === servicio.id) // Optional chaining
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                        }`}
                    >
                      <div className="mr-3 mt-1 flex-shrink-0">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ease-in-out transform group-hover:scale-105 ${formData.serviciosAdicionales?.some((s) => s.id === servicio.id) // Optional chaining
                          ? "bg-emerald-500 border border-emerald-600"
                          : "border-2 border-gray-300 group-hover:border-emerald-400"
                          }`}>
                          {formData.serviciosAdicionales?.some((s) => s.id === servicio.id) && ( 
                            <Check size={14} className="text-white stroke-[3]" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex items-start">
                        {servicio.imagenUrl && (
                          <div className="mr-3 flex-shrink-0">
                            <img src={servicio.imagenUrl} alt="" className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-semibold text-gray-800 leading-tight">{servicio.nombre}</h4>
                            <span className="text-emerald-600 font-bold ml-2 whitespace-nowrap">
                              Bs. {servicio.precio.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          {servicio.descripcion && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{servicio.descripcion}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">No hay servicios adicionales disponibles en este momento.</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-2">
                Solicitudes especiales <span className="text-sm font-normal text-gray-500">(Opcional)</span>
              </label>
              <textarea
                id="comentarios"
                name="comentarios"
                rows="3"
                value={formData.comentarios || ""}
                onChange={onFormChange} 
                placeholder="Ej: Preferencia de piso alto, llegada tarde, alergias..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          {/* --- AVISO IMPORTANTE --- */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            <div className="flex items-start">
              <Info size={18} className="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-semibold">Nota sobre la validación:</p>
                <p>Asegúrate de haber seleccionado fechas válidas (llegada antes que salida) y el número de huéspedes.</p>
                <p className="mt-1">Si aún no puedes continuar, el problema podría estar en la lógica de validación del botón "Siguiente" en el componente padre, no en este formulario.</p>
              </div>
            </div>
          </div>

        </div> 
      </div> 
    </div> 
  );
};