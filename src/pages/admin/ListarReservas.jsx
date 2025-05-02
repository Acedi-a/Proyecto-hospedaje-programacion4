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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <span className="ml-3 text-sm font-medium text-green-700">Cargando reservas...</span>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <AlertTriangle className="h-6 w-6 text-red-600" />
      <span className="ml-3 text-sm font-medium text-red-600">{error}</span>
    </div>
  );

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente': return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: <Clock className="h-3 w-3 text-yellow-600 mr-1" />
      };
      case 'confirmada': return {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: <Check className="h-3 w-3 text-green-600 mr-1" />
      };
      case 'cancelada': return {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: <X className="h-3 w-3 text-red-600 mr-1" />
      };
      default: return {
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        border: 'border-gray-200',
        icon: <Bookmark className="h-3 w-3 text-gray-600 mr-1" />
      };
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <ToastContainer theme="light" />
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-medium text-green-800 mb-4 md:mb-0">
          Gestión de Reservas
        </h1>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-green-300 text-green-700 text-sm hover:bg-green-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            {mostrarFiltros ? 'Ocultar filtros' : 'Filtros'}
            {mostrarFiltros ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          
          <button 
            onClick={fetchReservas}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-green-300 text-green-700 text-sm hover:bg-green-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>
      
      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="bg-white rounded-md shadow-sm p-4 mb-6 border border-gray-100 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
              <div className="relative">
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                  className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
                <Calendar className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
              <div className="relative">
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                  className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
                <Calendar className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                  placeholder="Cliente, habitación o ID..."
                  className="w-full rounded-md border border-gray-200 pl-8 pr-3 py-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleResetFiltros}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Resetear filtros
            </button>
          </div>
        </div>
      )}
      
      {filteredReservas.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-6 text-center border border-gray-100">
          <Hotel className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-700 mb-1">No hay reservas disponibles</h2>
          <p className="text-sm text-gray-500">
            No se encontraron reservas que coincidan con los filtros aplicados.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              <span className="text-green-700 font-medium">{filteredReservas.length}</span> reservas encontradas
            </p>
            <div className="text-xs text-gray-500">
              {filtros.estado !== 'todos' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 mr-1">
                  Estado: {filtros.estado}
                </span>
              )}
              {(filtros.fechaDesde || filtros.fechaHasta) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 mr-1">
                  Fecha filtrada
                </span>
              )}
              {filtros.busqueda && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                  Búsqueda: {filtros.busqueda}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReservas.map((reserva) => {
              const colorEstado = obtenerColorEstado(reserva.estado);
              
              return (
                <div 
                  key={reserva.id} 
                  className="bg-white rounded-md shadow-sm overflow-hidden border-l-2 hover:shadow transition-shadow"
                  style={{ borderLeftColor: reserva.estado === 'pendiente' ? '#eab308' : 
                                          reserva.estado === 'confirmada' ? '#16a34a' : 
                                          '#ef4444' }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-sm font-medium text-gray-800">
                        #{reserva.id.substring(0, 8)}
                      </h2>
                      <div className={`flex items-center px-2 py-0.5 rounded-md ${colorEstado.bg} ${colorEstado.text} border ${colorEstado.border}`}>
                        {colorEstado.icon}
                        <span className="text-xs">{reserva.estado}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Botones para cambiar estado */}
                      <div className="flex flex-wrap gap-1">
                        {reserva.estado !== 'pendiente' && (
                          <button
                            onClick={() => cambiarEstadoReserva(reserva.id, 'pendiente')}
                            className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs rounded hover:bg-yellow-100 transition-colors"
                          >
                            <Clock className="h-3 w-3" />
                            Pendiente
                          </button>
                        )}
                        {reserva.estado !== 'confirmada' && (
                          <button
                            onClick={() => cambiarEstadoReserva(reserva.id, 'confirmada')}
                            className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs rounded hover:bg-green-100 transition-colors"
                          >
                            <Check className="h-3 w-3" />
                            Confirmar
                          </button>
                        )}
                        {reserva.estado !== 'cancelada' && (
                          <button
                            onClick={() => cambiarEstadoReserva(reserva.id, 'cancelada')}
                            className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 text-red-700 text-xs rounded hover:bg-red-100 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            Cancelar
                          </button>
                        )}
                      </div>
                      
                      {/* Información del cliente */}
                      {reserva.usuario && (
                        <div className="bg-gray-50 rounded p-2 border border-gray-100">
                          <div className="flex items-start">
                            <User className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {reserva.usuario.nombre} {reserva.usuario.apellido}
                              </p>
                              {reserva.usuario.email && (
                                <p className="text-xs text-gray-600">{reserva.usuario.email}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Fechas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-green-600 mr-1.5" />
                          <div>
                            <p className="text-xs text-gray-500">Check-in</p>
                            <p className="text-xs font-medium">{formatFecha(reserva.fechaInicio)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-green-600 mr-1.5" />
                          <div>
                            <p className="text-xs text-gray-500">Check-out</p>
                            <p className="text-xs font-medium">{formatFecha(reserva.fechaFin)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detalles */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-green-600 mr-1.5" />
                          <div>
                            <p className="text-xs text-gray-500">Huéspedes</p>
                            <p className="text-xs font-medium">{reserva.huespedes}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Hotel className="h-4 w-4 text-green-600 mr-1.5" />
                          <div>
                            <p className="text-xs text-gray-500">Habitación</p>
                            <p className="text-xs font-medium">{reserva.nombreHabitacion}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comentarios */}
                      {reserva.comentariosAdicionales && (
                        <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Comentarios:</p>
                          <p className="text-xs">{reserva.comentariosAdicionales}</p>
                        </div>
                      )}
                      
                      {/* Servicios adicionales */}
                      {reserva.servicios && reserva.servicios.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center mb-1">
                            <ShoppingBag className="h-3 w-3 text-green-600 mr-1.5" />
                            <p className="text-xs font-medium text-gray-700">Servicios adicionales:</p>
                          </div>
                          <ul className="space-y-1 pl-5">
                            {reserva.servicios.map((servicio, index) => (
                              <li key={index} className="flex items-center text-xs">
                                <Coffee className="h-3 w-3 text-green-500 mr-1.5" />
                                <span className="flex-1">
                                  {servicio.nombre} 
                                  {servicio.categoria && <span className="text-xs text-gray-500"> ({servicio.categoria})</span>}
                                </span>
                                <span className="font-medium text-green-600">${servicio.precio}</span>
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