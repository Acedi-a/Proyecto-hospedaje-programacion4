import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../data/firebase";
import {
  User, Hotel, CalendarDays, MessageSquare, Star,
  Loader2, Inbox, Trash2, Edit, Search, Filter,
  CheckCircle, ArrowUp, ArrowDown, X, Menu, Award
} from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente de Estrella Interactiva
const StarRating = ({ rating, size = 16, interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        return (
          <Star
            key={i}
            className={`${(interactive && hoverRating >= starValue) || (!interactive && starValue <= rating)
                ? "fill-amber-500 text-amber-500"
                : "text-gray-300"
              } ${interactive ? "cursor-pointer transition-all duration-200 hover:scale-110" : ""}`}
            size={size}
            onClick={interactive ? () => onChange(starValue) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(starValue) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        );
      })}
    </div>
  );
};

// Spinner de carga con animación
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-16">
    <div className="relative">
      <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      <div className="absolute inset-0 rounded-full border-t-2 border-indigo-200 animate-pulse"></div>
    </div>
    <p className="mt-4 text-indigo-700 text-lg font-medium">Cargando calificaciones...</p>
  </div>
);

// Estado vacío mejorado
const EmptyState = () => (
  <div className="text-center py-20 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border border-dashed border-slate-300 mt-6 shadow-inner">
    <div className="bg-white p-4 rounded-full inline-flex items-center justify-center mb-6 shadow-md">
      <Inbox className="h-16 w-16 text-indigo-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">No hay calificaciones</h3>
    <p className="text-slate-500 max-w-md mx-auto">
      Aún no se han registrado reseñas en el sistema. Las calificaciones aparecerán aquí cuando los clientes valoren su experiencia.
    </p>
  </div>
);

// Función para generar color basado en puntuación
const getRatingColor = (score) => {
  if (score >= 4.5) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 3.5) return "bg-blue-100 text-blue-800 border-blue-200";
  if (score >= 2.5) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-red-100 text-red-800 border-red-200";
};

// Componente de Filtro
const FilterMenu = ({ filters, setFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const handleApply = () => {
    setFilters(tempFilters);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Filter size={16} />
        <span>Filtros</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10 w-72">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-slate-800">Filtrar Reseñas</h4>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Rating Min */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Puntuación mínima</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={tempFilters.minRating}
                  onChange={(e) => setTempFilters({ ...tempFilters, minRating: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm font-medium min-w-[28px] text-center">
                  {tempFilters.minRating}
                </span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ordenar por</label>
              <select
                value={tempFilters.sortBy}
                onChange={(e) => setTempFilters({ ...tempFilters, sortBy: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fecha-desc">Fecha (Más reciente)</option>
                <option value="fecha-asc">Fecha (Más antigua)</option>
                <option value="puntuacion-desc">Puntuación (Mayor)</option>
                <option value="puntuacion-asc">Puntuación (Menor)</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleApply}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminCalificaciones = () => {
  const [reseñas, setReseñas] = useState([]);
  const [filteredReseñas, setFilteredReseñas] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMode, setEditingMode] = useState(false);
  const [editedReview, setEditedReview] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeView, setActiveView] = useState("cards"); // "cards" o "table"
  const [filters, setFilters] = useState({
    minRating: 1,
    sortBy: "fecha-desc"
  });

  const modalRef = useRef(null);

  // Stats derivados
  const avgRating = reseñas.length > 0
    ? (reseñas.reduce((sum, res) => sum + res.puntuacionNum, 0) / reseñas.length).toFixed(1)
    : 0;

  const ratingCounts = reseñas.reduce((counts, res) => {
    counts[Math.floor(res.puntuacionNum)] = (counts[Math.floor(res.puntuacionNum)] || 0) + 1;
    return counts;
  }, {});

  useEffect(() => {
    const fetchReseñas = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "reseñas"));
        const data = querySnapshot.docs.map((doc) => {
          const reviewData = doc.data();
          let fechaFormateada = 'Fecha desconocida';

          // Formateo de fecha
          if (reviewData.fecha?.toDate) {
            try {
              fechaFormateada = format(reviewData.fecha.toDate(), 'PPP', { locale: es });
              // Guardamos también fecha como objeto Date para ordenamiento
              reviewData._fechaObj = reviewData.fecha.toDate();
            } catch (e) {
              fechaFormateada = reviewData.fecha.toDate().toLocaleDateString('es-ES');
              reviewData._fechaObj = reviewData.fecha.toDate();
            }
          } else if (typeof reviewData.fecha === 'string') {
            fechaFormateada = reviewData.fecha;
            // Intentamos convertir a Date si es posible
            try {
              reviewData._fechaObj = new Date(reviewData.fecha);
            } catch (e) {
              reviewData._fechaObj = new Date(); // Fallback
            }
          } else if (reviewData.fecha instanceof Date) {
            fechaFormateada = format(reviewData.fecha, 'PPP', { locale: es });
            reviewData._fechaObj = reviewData.fecha;
          } else {
            // Si no hay fecha, usamos la fecha actual como fallback
            reviewData._fechaObj = new Date();
          }

          return {
            id: doc.id,
            ...reviewData,
            fecha: fechaFormateada,
            puntuacionNum: Number(reviewData.puntuacion) || 0
          };
        });

        setReseñas(data);
        applyFilters(data, filters, searchTerm);
      } catch (error) {
        console.error("Error al obtener las reseñas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReseñas();
  }, []);

  // Filtramos y ordenamos las reseñas
  const applyFilters = (reviews, currentFilters, term) => {
    let filtered = [...reviews];

    // Aplicamos filtro de puntuación mínima
    filtered = filtered.filter(review => review.puntuacionNum >= currentFilters.minRating);

    // Aplicamos filtro de búsqueda
    if (term) {
      const searchLower = term.toLowerCase();
      filtered = filtered.filter(review =>
      (review.cliente?.toLowerCase().includes(searchLower) ||
        review.comentario?.toLowerCase().includes(searchLower) ||
        review.habitacion?.toLowerCase().includes(searchLower))
      );
    }

    // Ordenamos según criterio
    switch (currentFilters.sortBy) {
      case "fecha-desc":
        filtered.sort((a, b) => b._fechaObj - a._fechaObj);
        break;
      case "fecha-asc":
        filtered.sort((a, b) => a._fechaObj - b._fechaObj);
        break;
      case "puntuacion-desc":
        filtered.sort((a, b) => b.puntuacionNum - a.puntuacionNum);
        break;
      case "puntuacion-asc":
        filtered.sort((a, b) => a.puntuacionNum - b.puntuacionNum);
        break;
      default:
        filtered.sort((a, b) => b._fechaObj - a._fechaObj);
    }

    setFilteredReseñas(filtered);
  };

  useEffect(() => {
    applyFilters(reseñas, filters, searchTerm);
  }, [filters, searchTerm, reseñas]);

  // Efecto para cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedReview(null);
        setEditingMode(false);
        setDeleteConfirmation(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Efecto para cerrar modal con click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setSelectedReview(null);
        setEditingMode(false);
        setDeleteConfirmation(null);
      }
    };

    if (selectedReview || deleteConfirmation) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedReview, deleteConfirmation]);

  // Guardar cambios de una reseña
  const handleSaveEdit = async () => {
    try {
      const docRef = doc(db, "reseñas", editedReview.id);
      await updateDoc(docRef, {
        cliente: editedReview.cliente,
        habitacion: editedReview.habitacion,
        puntuacion: editedReview.puntuacionNum,
        comentario: editedReview.comentario,
      });

      // Actualizar estado local
      setReseñas(prevReseñas =>
        prevReseñas.map(res =>
          res.id === editedReview.id ? { ...res, ...editedReview } : res
        )
      );

      setEditingMode(false);
      setSelectedReview({ ...editedReview });

      // Mostrar mensaje de éxito
      setSuccessMessage("¡Reseña actualizada exitosamente!");
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error("Error al actualizar la reseña:", error);
    }
  };

  // Confirmar y eliminar reseña
  const handleConfirmDelete = async () => {
    try {
      const docRef = doc(db, "reseñas", deleteConfirmation.id);
      await deleteDoc(docRef);

      // Actualizar estado local
      setReseñas(prevReseñas => prevReseñas.filter(res => res.id !== deleteConfirmation.id));

      setDeleteConfirmation(null);
      setSelectedReview(null);

      // Mostrar mensaje de éxito
      setSuccessMessage("Reseña eliminada exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error("Error al eliminar la reseña:", error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
          <div className="px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Star className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  Gestión de Calificaciones
                  {reseñas.length > 0 && (
                    <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm py-0.5 px-2 rounded-full">
                      {reseñas.length}
                    </span>
                  )}
                </h2>
                <p className="text-slate-500 text-sm mt-1">Panel de administración de reseñas de clientes</p>
              </div>
            </div>

            {reseñas.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-500 mb-1">Calificación Media</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-indigo-600">{avgRating}</span>
                    <StarRating rating={parseFloat(avgRating)} size={18} />
                  </div>
                </div>

                <div className="hidden xl:block bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-500 mb-1">Distribución</div>
                  <div className="flex items-end h-10 gap-1">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = ratingCounts[rating] || 0;
                      const maxCount = Math.max(...Object.values(ratingCounts), 1);
                      const height = count > 0 ? (count / maxCount) * 100 : 5;

                      return (
                        <div key={rating} className="flex flex-col items-center">
                          <div
                            className={`w-8 ${rating >= 4 ? 'bg-green-400' : rating === 3 ? 'bg-amber-400' : 'bg-red-400'} rounded-sm`}
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs mt-1 font-medium">{rating}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra de herramientas */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por cliente, habitación o comentario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  className={`px-3 py-2 flex items-center gap-1 ${activeView === 'cards' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-600'}`}
                  onClick={() => setActiveView('cards')}
                >
                  <Menu size={16} />
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>
                <button
                  className={`px-3 py-2 flex items-center gap-1 ${activeView === 'table' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-600'}`}
                  onClick={() => setActiveView('table')}
                >
                  <Menu size={16} className="rotate-90" />
                  <span className="hidden sm:inline">Tabla</span>
                </button>
              </div>

              <FilterMenu filters={filters} setFilters={setFilters} />
            </div>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in flex items-center gap-2">
            <CheckCircle size={18} />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Contenido principal */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredReseñas.length === 0 ? (
          searchTerm ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 mt-6">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium mb-1">No se encontraron resultados</p>
              <p className="text-slate-500 text-sm">Prueba con otros términos de búsqueda o filtros</p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReseñas.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300 ease-in-out hover:shadow-md hover:translate-y-[-2px]"
                onClick={() => {
                  setSelectedReview(res);
                  setEditedReview({ ...res });
                }}
              >
                {/* Badge de puntuación */}
                <div className="absolute -top-2 -right-2">
                  <div className={`rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-sm ${getRatingColor(res.puntuacionNum)} border`}>
                    {res.puntuacionNum}
                  </div>
                </div>

                {/* Cabecera */}
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-full">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">
                        {res.cliente || 'Anónimo'}
                      </span>
                    </div>
                    <StarRating rating={res.puntuacionNum} size={14} />
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="p-5 flex-grow space-y-4">
                  {/* Habitación */}
                  <div className="flex items-start text-sm text-slate-600 gap-2">
                    <Hotel className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="overflow-hidden overflow-ellipsis">
                      {res.habitacion || 'No especificada'}
                    </span>
                  </div>

                  {/* Fecha */}
                  <div className="flex items-start text-sm text-slate-500 gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{res.fecha}</span>
                  </div>

                  {/* Comentario Truncado */}
                  <div className="mt-2 pt-3 border-t border-slate-100">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-slate-700">Comentario</p>
                    </div>
                    <p className="text-sm text-slate-600 italic line-clamp-3 leading-relaxed">
                      {res.comentario || 'Sin comentario.'}
                    </p>
                  </div>
                </div>

                {/* Pie de página con Botón */}
                <div className="px-5 py-3 bg-slate-50 rounded-b-xl border-t border-slate-100">
                  <button
                    className="w-full bg-white border border-slate-300 text-slate-700 py-1.5 px-4 rounded-md hover:bg-slate-50 transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 flex items-center justify-center gap-1"
                  >
                    <span>Ver Detalles</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Habitación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Puntuación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Comentario</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredReseñas.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-700">{res.cliente || 'Anónimo'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{res.habitacion || 'No especificada'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{res.fecha}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRatingColor(res.puntuacionNum)}`}>
                            {res.puntuacionNum}
                          </span>
                          <StarRating rating={res.puntuacionNum} size={12} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 line-clamp-1 max-w-xs">
                          {res.comentario || 'Sin comentario'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(res);
                            setEditedReview({ ...res });
                          }}
                          className="text-indigo-600 hover:text-indigo-800 mr-3"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle - Mejorado */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out backdrop-blur-sm animate-fade-in">
          <div
            ref={modalRef}
            className="bg-white p-0 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {editingMode ? (
                  <>
                    <Edit size={18} className="text-indigo-600" />
                    Editar Calificación
                  </>
                ) : (
                  <>
                    <Star size={18} className="text-indigo-600" />
                    Detalle de Calificación
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setEditingMode(false);
                }}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-grow">
              <div className="space-y-4">
                {/* Cliente */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-600">Cliente</label>
                  {editingMode ? (
                    <input
                      type="text"
                      value={editedReview.cliente || ''}
                      onChange={(e) => setEditedReview({ ...editedReview, cliente: e.target.value })}
                      className="w-full border border-slate-300 rounded-md p-2 text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200 text-slate-800 flex items-center gap-2">
                      <User size={16} className="text-slate-500" />
                      <span>{selectedReview.cliente || 'Anónimo'}</span>
                    </div>
                  )}
                </div>

                {/* ID de Usuario */}
                {!editingMode && selectedReview.usuarioID && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-600">ID de Usuario</label>
                    <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200 text-slate-700 text-sm break-all">
                      {selectedReview.usuarioID}
                    </div>
                  </div>
                )}

                {/* Habitación */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-600">Habitación</label>
                  {editingMode ? (
                    <input
                      type="text"
                      value={editedReview.habitacion || ''}
                      onChange={(e) => setEditedReview({ ...editedReview, habitacion: e.target.value })}
                      className="w-full border border-slate-300 rounded-md p-2 text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200 text-slate-800 flex items-center gap-2">
                      <Hotel size={16} className="text-slate-500" />
                      <span>{selectedReview.habitacion || 'No especificada'}</span>
                    </div>
                  )}
                </div>

                {/* Puntuación */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-600">Puntuación</label>
                  {editingMode ? (
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                      <StarRating
                        rating={editedReview.puntuacionNum}
                        size={24}
                        interactive={true}
                        onChange={(rating) => setEditedReview({ ...editedReview, puntuacionNum: rating })}
                      />
                      <span className={`px-2 py-1 rounded-md text-sm font-semibold ${getRatingColor(editedReview.puntuacionNum)}`}>
                        {editedReview.puntuacionNum}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-md p-3 border border-slate-200 flex items-center justify-between">
                      <StarRating rating={selectedReview.puntuacionNum} size={20} />
                      <span className={`px-2 py-1 rounded-md text-sm font-semibold ${getRatingColor(selectedReview.puntuacionNum)}`}>
                        {selectedReview.puntuacionNum}
                      </span>
                    </div>
                  )}
                </div>

                {/* Fecha */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-600">Fecha</label>
                  <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200 text-slate-800 flex items-center gap-2">
                    <CalendarDays size={16} className="text-slate-500" />
                    <span>{selectedReview.fecha}</span>
                  </div>
                </div>

                {/* Comentario */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-600">Comentario</label>
                  {editingMode ? (
                    <textarea
                      value={editedReview.comentario || ''}
                      onChange={(e) => setEditedReview({ ...editedReview, comentario: e.target.value })}
                      rows={4}
                      className="w-full border border-slate-300 rounded-md p-2 text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <div className="bg-slate-50 rounded-md p-3 border border-slate-200 text-slate-800 whitespace-pre-wrap min-h-[80px]">
                      {selectedReview.comentario || 'Sin comentario.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer con Acciones */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
              {editingMode ? (
                <>
                  <button
                    onClick={() => {
                      setEditingMode(false);
                      setEditedReview({ ...selectedReview });
                    }}
                    className="px-4 py-2 text-slate-700 border border-slate-300 bg-white rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Guardar Cambios
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteConfirmation(selectedReview)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar reseña"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => setEditingMode(true)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Editar reseña"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm"
          >
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <Trash2 size={22} />
              <h3 className="text-lg font-bold">Eliminar Reseña</h3>
            </div>

            <p className="text-slate-600 mb-6">
              ¿Estás seguro que deseas eliminar permanentemente la reseña de <span className="font-medium">{deleteConfirmation.cliente || 'Usuario anónimo'}</span>?
            </p>

            <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos globales para animaciones */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        /* Asegura que line-clamp funcione */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};