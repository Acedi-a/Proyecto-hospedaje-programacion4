import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Calendar, Check, X, Clock, Filter, 
  User, Hotel, ShoppingBag, Coffee, RefreshCw,
  ChevronUp, ChevronDown, Search, Bookmark, AlertTriangle
} from 'lucide-react';

const ListarReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: 'todos',
    fechaDesde: '',
    fechaHasta: '',
    busqueda: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    fetchReservas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [reservas, filtros]);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'Reservas'));
      
      const reservasConDatos = await Promise.all(
        querySnapshot.docs.map(async (docReserva) => {
          const reservaData = docReserva.data();
          
          // Obtener datos del usuario
          let usuarioData = {};
          if (reservaData.idusuario) {
            const usuarioRef = doc(db, 'usuarios', reservaData.idusuario);
            const usuarioSnap = await getDoc(usuarioRef);
            if (usuarioSnap.exists()) {
              usuarioData = usuarioSnap.data();
            }
          }
          
          // Obtener nombre de la habitación usando habitacionId
          let nombreHabitacion = 'Habitación no especificada';
          if (reservaData.habitacionId) {
            try {
              const habitacionRef = doc(db, 'Habitaciones', reservaData.habitacionId);
              const habitacionSnap = await getDoc(habitacionRef);
              if (habitacionSnap.exists()) {
                nombreHabitacion = habitacionSnap.data().nombre || `Habitación ${reservaData.habitacionId.substring(0, 5)}`;
              }
            } catch (error) {
              console.error('Error al cargar datos de la habitación:', error);
            }
          }
          
          // Obtener datos de servicios adicionales
          const serviciosCompletos = await Promise.all(
            reservaData.idserviciosadicionales?.map(async (servicio) => {
              const servicioRef = doc(db, 'Servicios', servicio.id);
              const servicioSnap = await getDoc(servicioRef);
              return servicioSnap.exists() ? servicioSnap.data() : null;
            }) || []
          );
          
          return {
            id: docReserva.id,
            ...reservaData,
            usuario: usuarioData,
            nombreHabitacion,
            servicios: serviciosCompletos.filter(s => s !== null)
          };
        })
      );
      
      setReservas(reservasConDatos);
      toast.success("Reservas cargadas correctamente", {
        position: "top-right",
        icon: "🏨"
      });
    } catch (err) {
      console.error("Error fetching reservas: ", err);
      setError("Error al cargar las reservas");
      toast.error("Error al cargar las reservas", {
        position: "top-right",
        icon: "❌"
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...reservas];
    
    // Filtrar por estado
    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(r => r.estado === filtros.estado);
    }
    
    // Filtrar por fecha desde
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(r => {
        const fechaReserva = r.fechaInicio?.toDate?.() || new Date();
        return fechaReserva >= fechaDesde;
      });
    }
    
    // Filtrar por fecha hasta
    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59);
      resultado = resultado.filter(r => {
        const fechaReserva = r.fechaInicio?.toDate?.() || new Date();
        return fechaReserva <= fechaHasta;
      });
    }
    
    // Filtrar por búsqueda (nombre cliente, habitación o id reserva)
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(r => 
        (r.usuario?.nombre?.toLowerCase().includes(busquedaLower)) ||
        (r.usuario?.apellido?.toLowerCase().includes(busquedaLower)) ||
        (r.nombreHabitacion?.toLowerCase().includes(busquedaLower)) ||
        (r.id?.toLowerCase().includes(busquedaLower))
      );
    }
    
    setFilteredReservas(resultado);
  };

  const cambiarEstadoReserva = async (idReserva, nuevoEstado) => {
    try {
      const reservaRef = doc(db, 'Reservas', idReserva);
      await updateDoc(reservaRef, {
        estado: nuevoEstado
      });
      
      // Actualizar el estado local para reflejar el cambio inmediatamente
      setReservas(reservas.map(reserva => 
        reserva.id === idReserva ? { ...reserva, estado: nuevoEstado } : reserva
      ));
      
      const mensajes = {
        'pendiente': "Reserva marcada como pendiente",
        'confirmada': "Reserva confirmada exitosamente",
        'cancelada': "Reserva cancelada correctamente"
      };
      
      const iconos = {
        'pendiente': "⏳",
        'confirmada': "✅",
        'cancelada': "❌"
      };
      
      toast.info(mensajes[nuevoEstado], {
        position: "top-right",
        icon: iconos[nuevoEstado]
      });
    } catch (error) {
      console.error("Error al actualizar el estado de la reserva:", error);
      toast.error("Error al actualizar el estado de la reserva", {
        position: "top-right"
      });
    }
  };

  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Fecha no disponible';
    return format(timestamp.toDate(), "PPPpp", { locale: es });
  };

  const handleResetFiltros = () => {
    setFiltros({
      estado: 'todos',
      fechaDesde: '',
      fechaHasta: '',
      busqueda: ''
    });
    toast.info("Filtros restablecidos", { icon: "🔄" });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      <span className="ml-3 text-lg font-medium text-indigo-700">Cargando reservas...</span>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <AlertTriangle className="h-8 w-8 text-red-600" />
      <span className="ml-3 text-lg font-medium text-red-600">{error}</span>
    </div>
  );

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente': return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: <Clock className="h-4 w-4 text-amber-600 mr-1" />
      };
      case 'confirmada': return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        icon: <Check className="h-4 w-4 text-emerald-600 mr-1" />
      };
      case 'cancelada': return {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        border: 'border-rose-300',
        icon: <X className="h-4 w-4 text-rose-600 mr-1" />
      };
      default: return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: <Bookmark className="h-4 w-4 text-gray-600 mr-1" />
      };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-indigo-50 to-blue-50 min-h-screen">
      <ToastContainer theme="colored" />
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-800 mb-4 md:mb-0">
          Sistema de Gestión de Reservas
        </h1>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:scale-105"
          >
            <Filter className="h-5 w-5" />
            {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
            {mostrarFiltros ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          <button 
            onClick={fetchReservas}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all transform hover:scale-105"
          >
            <RefreshCw className="h-5 w-5" />
            Actualizar
          </button>
        </div>
      </div>
      
      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-indigo-100 transition-all transform animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <div className="relative">
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <div className="relative">
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                  placeholder="Cliente, habitación o ID..."
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetFiltros}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Resetear filtros
            </button>
          </div>
        </div>
      )}
      
      {filteredReservas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-10 text-center">
          <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No hay reservas disponibles</h2>
          <p className="text-gray-500">
            No se encontraron reservas que coincidan con los filtros aplicados.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-700 font-medium">
              <span className="text-indigo-700 font-bold">{filteredReservas.length}</span> reservas encontradas
            </p>
            <div className="text-sm text-gray-500">
              {filtros.estado !== 'todos' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 mr-2">
                  Estado: {filtros.estado}
                </span>
              )}
              {(filtros.fechaDesde || filtros.fechaHasta) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 mr-2">
                  Fecha filtrada
                </span>
              )}
              {filtros.busqueda && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Búsqueda: {filtros.busqueda}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReservas.map((reserva) => {
              const colorEstado = obtenerColorEstado(reserva.estado);
              
              return (
                <div 
                  key={reserva.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ borderTopColor: reserva.estado === 'pendiente' ? '#f59e0b' : 
                                          reserva.estado === 'confirmada' ? '#10b981' : 
                                          '#f43f5e' }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800">
                        Reserva #{reserva.id.substring(0, 8)}
                      </h2>
                      <div className={`flex items-center px-3 py-1 rounded-full ${colorEstado.bg} ${colorEstado.text} border ${colorEstado.border}`}>
                        {colorEstado.icon}
                        <span className="text-sm font-medium">{reserva.estado}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Botones para cambiar estado */}
                      <div className="flex flex-wrap gap-2">
                        {reserva.estado !== 'pendiente' && (
                          <button
                            onClick={() => cambiarEstadoReserva(reserva.id, 'pendiente')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm rounded-full hover:from-amber-500 hover:to-amber-600 transition shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Clock className="h-4 w-4" />
                            Pendiente
                          </button>
                        )}
                        {reserva.estado !== 'confirmada' && (
                          <button
                            onClick={() => cambiarEstadoReserva(reserva.id, 'confirmada')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-sm rounded-full hover:from-emerald-500 hover:to-emerald-600 transition shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Check className="h-4 w-4" />
                            Confirmar
                          </button>
                        )}
                        {reserva.estado !== 'cancelada' && (
                          <button
                            onClick={() => cambiarEstadoReserva(reserva.id, 'cancelada')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm rounded-full hover:from-rose-500 hover:to-rose-600 transition shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <X className="h-4 w-4" />
                            Cancelar
                          </button>
                        )}
                      </div>
                      
                      {/* Información del cliente */}
                      {reserva.usuario && (
                        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                          <div className="flex items-start">
                            <User className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-indigo-900">
                                {reserva.usuario.nombre} {reserva.usuario.apellido}
                              </p>
                              {reserva.usuario.email && (
                                <p className="text-sm text-indigo-700">{reserva.usuario.email}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Fechas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Check-in</p>
                            <p className="text-sm font-medium">{formatFecha(reserva.fechaInicio)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Check-out</p>
                            <p className="text-sm font-medium">{formatFecha(reserva.fechaFin)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detalles */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-cyan-500 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Huéspedes</p>
                            <p className="text-sm font-medium">{reserva.huespedes}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Hotel className="h-5 w-5 text-cyan-500 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Habitación</p>
                            <p className="text-sm font-medium">{reserva.nombreHabitacion}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comentarios */}
                      {reserva.comentariosAdicionales && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Comentarios:</p>
                          <p className="text-sm">{reserva.comentariosAdicionales}</p>
                        </div>
                      )}
                      
                      {/* Servicios adicionales */}
                      {reserva.servicios && reserva.servicios.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center mb-2">
                            <ShoppingBag className="h-5 w-5 text-purple-500 mr-2" />
                            <p className="font-medium text-gray-700">Servicios adicionales:</p>
                          </div>
                          <ul className="space-y-1 pl-7">
                            {reserva.servicios.map((servicio, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <Coffee className="h-4 w-4 text-purple-400 mr-2" />
                                <span className="flex-1">
                                  {servicio.nombre} 
                                  {servicio.categoria && <span className="text-xs text-gray-500"> ({servicio.categoria})</span>}
                                </span>
                                <span className="font-medium text-purple-600">${servicio.precio}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ListarReservas;