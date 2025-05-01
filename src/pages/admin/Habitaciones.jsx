import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../data/firebase';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Hotel, Search, RefreshCw, ChevronUp, ChevronDown, 
  Users, Calendar, Bed, WifiIcon, Coffee, CheckCircle, 
  XCircle, AlertCircle, Plus, Edit, DollarSign
} from 'lucide-react';

export function Habitaciones() {
    const [habitaciones, setHabitaciones] = useState([]);
    const [filteredHabitaciones, setFilteredHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        estado: 'todos',
        capacidad: '',
        busqueda: '',
        precioMin: '',
        precioMax: ''
    });

    useEffect(() => {
        fetchHabitaciones();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [habitaciones, filtros]);

    const fetchHabitaciones = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'Habitaciones'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const habitacionesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Asegurar que tengamos un estado definido para cada habitación
                estado: doc.data().estado || 'disponible',
                imagenUrl: doc.data().imagenUrl || 
                    `https://uybrvedtaptizpdqbavx.supabase.co/storage/v1/object/public/imagenes/${doc.data().imagenRuta}`
            }));
            
            setHabitaciones(habitacionesData);
            toast.success("Habitaciones cargadas correctamente", {
                position: "top-right",
                icon: "🏨"
            });
        } catch (err) {
            console.error('Error al obtener habitaciones:', err);
            setError('Error al cargar las habitaciones');
            toast.error("Error al cargar las habitaciones", {
                position: "top-right",
                icon: "❌"
            });
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...habitaciones];
        
        // Filtrar por estado
        if (filtros.estado !== 'todos') {
            resultado = resultado.filter(h => h.estado === filtros.estado);
        }
        
        // Filtrar por capacidad
        if (filtros.capacidad) {
            const capacidad = parseInt(filtros.capacidad);
            if (!isNaN(capacidad)) {
                resultado = resultado.filter(h => h.capacidad >= capacidad);
            }
        }
        
        // Filtrar por precio mínimo
        if (filtros.precioMin) {
            const precioMin = parseFloat(filtros.precioMin);
            if (!isNaN(precioMin)) {
                resultado = resultado.filter(h => h.precio >= precioMin);
            }
        }
        
        // Filtrar por precio máximo
        if (filtros.precioMax) {
            const precioMax = parseFloat(filtros.precioMax);
            if (!isNaN(precioMax)) {
                resultado = resultado.filter(h => h.precio <= precioMax);
            }
        }
        
        // Filtrar por búsqueda (nombre, descripción)
        if (filtros.busqueda) {
            const busquedaLower = filtros.busqueda.toLowerCase();
            resultado = resultado.filter(h => 
                (h.nombre?.toLowerCase().includes(busquedaLower)) ||
                (h.descripcion?.toLowerCase().includes(busquedaLower)) ||
                (h.servicios?.some(servicio => servicio.toLowerCase().includes(busquedaLower)))
            );
        }
        
        setFilteredHabitaciones(resultado);
    };

    const handleResetFiltros = () => {
        setFiltros({
            estado: 'todos',
            capacidad: '',
            busqueda: '',
            precioMin: '',
            precioMax: ''
        });
        toast.info("Filtros restablecidos", { icon: "🔄" });
    };

    const getEstadoIcon = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'disponible':
                return <CheckCircle className="h-5 w-5 text-teal-500" />;
            case 'ocupada':
                return <XCircle className="h-5 w-5 text-rose-500" />;
            case 'mantenimiento':
                return <AlertCircle className="h-5 w-5 text-amber-500" />;
            default:
                return <CheckCircle className="h-5 w-5 text-teal-500" />;
        }
    };

    const getEstadoBadge = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'disponible':
                return "bg-teal-100 text-teal-800 border border-teal-200";
            case 'ocupada':
                return "bg-rose-100 text-rose-800 border border-rose-200";
            case 'mantenimiento':
                return "bg-amber-100 text-amber-800 border border-amber-200";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    const getCardStyle = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'disponible':
                return {
                    borderColor: '#0d9488', // teal-600
                    gradientFrom: 'from-teal-50',
                    gradientTo: 'to-cyan-50',
                    shadowColor: 'shadow-teal-100'
                };
            case 'ocupada':
                return {
                    borderColor: '#e11d48', // rose-600
                    gradientFrom: 'from-rose-50',
                    gradientTo: 'to-red-50',
                    shadowColor: 'shadow-rose-100'
                };
            case 'mantenimiento':
                return {
                    borderColor: '#d97706', // amber-600
                    gradientFrom: 'from-amber-50',
                    gradientTo: 'to-yellow-50',
                    shadowColor: 'shadow-amber-100'
                };
            default:
                return {
                    borderColor: '#0d9488', // teal-600
                    gradientFrom: 'from-teal-50',
                    gradientTo: 'to-cyan-50',
                    shadowColor: 'shadow-teal-100'
                };
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
            <span className="ml-3 text-lg font-medium text-cyan-700">Cargando habitaciones...</span>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <span className="ml-3 text-lg font-medium text-red-600">{error}</span>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-cyan-50 to-teal-50 min-h-screen">
            <ToastContainer theme="colored" />
            
            {/* Header con título y botones */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-teal-800 mb-4 md:mb-0">
                    Gestión de Habitaciones
                </h1>
                
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={fetchHabitaciones}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-700 text-white shadow-lg shadow-cyan-200 hover:bg-cyan-800 transition-all transform hover:scale-105"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Actualizar
                    </button>
                    
                    <Link 
                        to="/admin/crear"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-lg shadow-cyan-200 hover:from-teal-700 hover:to-cyan-800 transition-all transform hover:scale-105"
                    >
                        <Plus className="h-5 w-5" />
                        Crear Habitación
                    </Link>
                </div>
            </div>

            {/* Mini navbar para filtrado por estado */}
            <div className="mb-6">
                <div className="flex justify-center overflow-x-auto">
                    <div className="inline-flex bg-white rounded-full shadow-md p-1">
                        <button
                            onClick={() => setFiltros({...filtros, estado: 'todos'})}
                            className={`px-5 py-2 rounded-full transition-all ${
                                filtros.estado === 'todos' 
                                ? 'bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-md' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFiltros({...filtros, estado: 'disponible'})}
                            className={`px-5 py-2 rounded-full flex items-center gap-1 transition-all ${
                                filtros.estado === 'disponible' 
                                ? 'bg-teal-500 text-white shadow-md' 
                                : 'text-teal-600 hover:bg-teal-50'
                            }`}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Disponibles
                        </button>
                        <button
                            onClick={() => setFiltros({...filtros, estado: 'ocupada'})}
                            className={`px-5 py-2 rounded-full flex items-center gap-1 transition-all ${
                                filtros.estado === 'ocupada' 
                                ? 'bg-rose-500 text-white shadow-md' 
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                        >
                            <XCircle className="h-4 w-4" />
                            Ocupadas
                        </button>
                        <button
                            onClick={() => setFiltros({...filtros, estado: 'mantenimiento'})}
                            className={`px-5 py-2 rounded-full flex items-center gap-1 transition-all ${
                                filtros.estado === 'mantenimiento' 
                                ? 'bg-amber-500 text-white shadow-md' 
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                        >
                            <AlertCircle className="h-4 w-4" />
                            Mantenimiento
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Panel de filtros adicionales */}
            <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-cyan-100 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad mínima</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                value={filtros.capacidad}
                                onChange={(e) => setFiltros({...filtros, capacidad: e.target.value})}
                                placeholder="Personas"
                                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                            <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio mínimo</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={filtros.precioMin}
                                onChange={(e) => setFiltros({...filtros, precioMin: e.target.value})}
                                placeholder="Desde $"
                                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio máximo</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={filtros.precioMax}
                                onChange={(e) => setFiltros({...filtros, precioMax: e.target.value})}
                                placeholder="Hasta $"
                                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={filtros.busqueda}
                                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                                placeholder="Nombre, descripción..."
                                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
            
            {/* Indicadores de filtros activos */}
            {(filtros.estado !== 'todos' || filtros.capacidad || filtros.precioMin || filtros.precioMax || filtros.busqueda) && (
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-700 font-medium">
                        <span className="text-cyan-700 font-bold">{filteredHabitaciones.length}</span> habitaciones encontradas
                    </p>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                        {filtros.capacidad && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                                Min. {filtros.capacidad} personas
                            </span>
                        )}
                        {(filtros.precioMin || filtros.precioMax) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                                Precio: {filtros.precioMin ? `$${filtros.precioMin}` : '$0'} 
                                {filtros.precioMax ? ` - $${filtros.precioMax}` : ' +'}
                            </span>
                        )}
                        {filtros.busqueda && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                                Búsqueda: {filtros.busqueda}
                            </span>
                        )}
                    </div>
                </div>
            )}
            
            {/* Listado de habitaciones */}
            {filteredHabitaciones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHabitaciones.map(habitacion => {
                        const cardStyle = getCardStyle(habitacion.estado);
                        return (
                            <div 
                                key={habitacion.id} 
                                className={`bg-gradient-to-br ${cardStyle.gradientFrom} ${cardStyle.gradientTo} rounded-xl ${cardStyle.shadowColor} shadow-lg overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl`}
                                style={{ borderColor: cardStyle.borderColor, borderWidth: '2px' }}
                            >
                                {/* Etiqueta de estado */}
                                <div className="absolute z-10 left-4 top-4">
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full shadow-md ${getEstadoBadge(habitacion.estado)}`}>
                                        {getEstadoIcon(habitacion.estado)}
                                        <span className="text-sm font-medium">{habitacion.estado || 'Disponible'}</span>
                                    </span>
                                </div>
                                
                                {/* Imagen */}
                                <div className="relative h-48 overflow-hidden border-b" style={{ borderColor: cardStyle.borderColor }}>
                                    <div 
                                        className="absolute inset-0 opacity-10" 
                                        style={{ backgroundColor: cardStyle.borderColor }}
                                    ></div>
                                    <img 
                                        src={habitacion.imagenUrl} 
                                        alt={habitacion.nombre}
                                        className="w-full h-full object-cover transition-all duration-500 hover:scale-110 relative z-0"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                                        }}
                                    />
                                </div>
                                
                                {/* Contenido */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h2 className="text-xl font-bold text-gray-800">{habitacion.nombre}</h2>
                                        <span className="flex items-center gap-1 bg-gradient-to-r from-teal-600 to-cyan-700 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                            <DollarSign className="h-4 w-4" />
                                            {habitacion.precio}/noche
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-4">{habitacion.descripcion}</p>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="flex items-center">
                                            <Users className="h-5 w-5 text-cyan-600 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Capacidad</p>
                                                <p className="font-medium">{habitacion.capacidad} personas</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Bed className="h-5 w-5 text-cyan-600 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Camas</p>
                                                <p className="font-medium">{habitacion.camas} camas</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Servicios */}
                                    <div className="mb-4">
                                        <h3 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                            <Coffee className="h-4 w-4 text-teal-600 mr-1" />
                                            Servicios incluidos:
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {habitacion.servicios?.map((servicio, index) => (
                                                <span 
                                                    key={index} 
                                                    className="bg-cyan-50 text-cyan-700 text-xs px-2.5 py-1 rounded-full border border-cyan-100"
                                                >
                                                    {servicio}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Botones de acción */}
                                    <div className="pt-3 border-t border-gray-200 flex justify-end">
                                        <Link
                                            to={`/admin/editar/${habitacion.id}`}
                                            className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-700 text-white text-sm rounded-full hover:from-teal-700 hover:to-cyan-800 transition shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Editar habitación
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-10 text-center">
                    <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                        No hay habitaciones disponibles
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {filtros.estado !== 'todos' || filtros.capacidad || filtros.precioMin || filtros.precioMax || filtros.busqueda ? 
                            'No se encontraron habitaciones que coincidan con los filtros aplicados.' : 
                            'No hay habitaciones registradas aún.'}
                    </p>
                    <div className="flex justify-center gap-4">
                        {filtros.estado !== 'todos' || filtros.capacidad || filtros.precioMin || filtros.precioMax || filtros.busqueda ? (
                            <button
                                onClick={handleResetFiltros}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Resetear filtros
                            </button>
                        ) : (
                            <Link 
                                to="/admin/crear"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-full hover:from-teal-700 hover:to-cyan-800 transition shadow-md"
                            >
                                <Plus className="h-5 w-5" />
                                Crear primera habitación
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}