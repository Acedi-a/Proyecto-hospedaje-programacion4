import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../data/firebase'
import { Link } from 'react-router-dom'
import { Search, PlusCircle, Filter, Bed, Users, Wifi, Coffee, 
  ShowerHead, Tv, Edit, Eye, Heart, Star, Loader2, 
  ChevronDown, ArrowUpDown, X } from 'lucide-react'

export function Habitaciones() {
    const [habitaciones, setHabitaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [priceRange, setPriceRange] = useState([0, 5000])
    const [selectedServices, setSelectedServices] = useState([])
    const [capacityFilter, setCapacityFilter] = useState('')
    const [sortBy, setSortBy] = useState('newest')

    // Servicios disponibles para filtrado
    const availableServices = [
        { id: 'wifi', name: 'WiFi', icon: <Wifi size={16} /> },
        { id: 'tv', name: 'TV', icon: <Tv size={16} /> },
        { id: 'baño', name: 'Baño privado', icon: <ShowerHead size={16} /> },
        { id: 'desayuno', name: 'Desayuno', icon: <Coffee size={16} /> }
    ]

    // Obtener las habitaciones al cargar el componente
    useEffect(() => {
        const fetchHabitaciones = async () => {
            try {
                const q = query(collection(db, 'Habitaciones'), orderBy('createdAt', 'desc'))
                const querySnapshot = await getDocs(q)
                
                const habitacionesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Asegurar que la URL de la imagen tenga el formato correcto
                    imagenUrl: doc.data().imagenUrl || `https://uybrvedtaptizpdqbavx.supabase.co/storage/v1/object/public/imagenes/${doc.data().imagenRuta}`
                }))
                
                setHabitaciones(habitacionesData)
                setLoading(false)
            } catch (err) {
                console.error('Error al obtener habitaciones:', err)
                setError('Error al cargar las habitaciones')
                setLoading(false)
            }
        }

        fetchHabitaciones()
    }, [])

    // Filtrar habitaciones según todos los criterios
    const filteredHabitaciones = habitaciones.filter(habitacion => {
        // Filtro por búsqueda de texto
        const matchesSearch = 
            habitacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            habitacion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            habitacion.servicios.some(servicio => 
                servicio.toLowerCase().includes(searchTerm.toLowerCase())
            )
        
        // Filtro por precio
        const matchesPrice = 
            habitacion.precio >= priceRange[0] && 
            habitacion.precio <= priceRange[1]
        
        // Filtro por servicios
        const matchesServices = 
            selectedServices.length === 0 || 
            selectedServices.every(service => 
                habitacion.servicios.some(s => 
                    s.toLowerCase().includes(service.toLowerCase())
                )
            )
        
        // Filtro por capacidad
        const matchesCapacity = 
            capacityFilter === '' || 
            habitacion.capacidad >= parseInt(capacityFilter)
        
        return matchesSearch && matchesPrice && matchesServices && matchesCapacity
    }).sort((a, b) => {
        // Ordenamiento
        switch(sortBy) {
            case 'price-asc':
                return a.precio - b.precio
            case 'price-desc':
                return b.precio - a.precio
            case 'capacity':
                return b.capacidad - a.capacidad
            default: // newest
                return new Date(b.createdAt) - new Date(a.createdAt)
        }
    })

    // Restablecer todos los filtros
    const resetFilters = () => {
        setPriceRange([0, 5000])
        setSelectedServices([])
        setCapacityFilter('')
        setSortBy('newest')
        setSearchTerm('')
    }

    // Toggle de servicio seleccionado
    const toggleService = (serviceName) => {
        if (selectedServices.includes(serviceName)) {
            setSelectedServices(selectedServices.filter(s => s !== serviceName))
        } else {
            setSelectedServices([...selectedServices, serviceName])
        }
    }

    // Manejador para cambio de precio máximo
    const handleMaxPriceChange = (e) => {
        const newMaxPrice = parseInt(e.target.value)
        setPriceRange([priceRange[0], newMaxPrice])
    }

    // Manejador para cambio de precio mínimo
    const handleMinPriceChange = (e) => {
        const newMinPrice = parseInt(e.target.value)
        setPriceRange([newMinPrice, priceRange[1]])
    }

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <span className="ml-2 text-blue-500 font-medium">Cargando habitaciones...</span>
        </div>
    )

    if (error) return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <X className="mr-2" />
            <span>{error}</span>
        </div>
    )

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Cabecera con título y botón de crear */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Nuestras Habitaciones</h1>
                        <p className="text-gray-600 mt-1">Descubre nuestro catálogo de habitaciones de lujo</p>
                    </div>
                    <Link 
                        to="/admin/crear"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center shadow-md"
                    >
                        <PlusCircle size={18} className="mr-2" />
                        Crear Nueva Habitación
                    </Link>
                </div>

                {/* Contenedor principal de filtros y resultados */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Panel de filtros para escritorio */}
                    <div className="hidden lg:block w-64 bg-white p-4 rounded-lg shadow-md h-fit">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <Filter size={18} className="mr-2 text-blue-500" />
                                Filtros
                            </h3>
                            <button 
                                onClick={resetFilters}
                                className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                                <X size={14} className="mr-1" />
                                Limpiar filtros
                            </button>
                        </div>

                        {/* Filtro de precio */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Rango de precio</h4>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">Min: ${priceRange[0]}</span>
                                <span className="text-sm text-gray-500">Max: ${priceRange[1]}</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <input 
                                    type="range"
                                    min="0"
                                    max="5000"
                                    step="100"
                                    value={priceRange[0]}
                                    onChange={handleMinPriceChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="range"
                                    min="0"
                                    max="5000"
                                    step="100"
                                    value={priceRange[1]}
                                    onChange={handleMaxPriceChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Filtro de capacidad */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Capacidad mínima</h4>
                            <select
                                value={capacityFilter}
                                onChange={(e) => setCapacityFilter(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Cualquiera</option>
                                <option value="1">1 persona</option>
                                <option value="2">2 personas</option>
                                <option value="3">3 personas</option>
                                <option value="4">4 personas</option>
                                <option value="5">5+ personas</option>
                            </select>
                        </div>

                        {/* Filtro de servicios */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Servicios</h4>
                            <div className="space-y-2">
                                {availableServices.map(service => (
                                    <div 
                                        key={service.id}
                                        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                            selectedServices.includes(service.name) 
                                            ? 'bg-blue-100 text-blue-700' 
                                            : 'hover:bg-gray-100'
                                        }`}
                                        onClick={() => toggleService(service.name)}
                                    >
                                        <div className="mr-2">{service.icon}</div>
                                        <span>{service.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ordenar por */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Ordenar por</h4>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="newest">Más recientes</option>
                                <option value="price-asc">Precio: menor a mayor</option>
                                <option value="price-desc">Precio: mayor a menor</option>
                                <option value="capacity">Mayor capacidad</option>
                            </select>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1">
                        {/* Barra de búsqueda y botones de filtro móvil */}
                        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Barra de búsqueda */}
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, descripción o servicios..."
                                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                
                                {/* Botón de filtros para móvil */}
                                <button 
                                    className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center transition"
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <Filter size={18} className="mr-2" />
                                    Filtros
                                    <ChevronDown size={18} className={`ml-1 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {/* Selector de ordenamiento para escritorio */}
                                <div className="hidden md:flex items-center">
                                    <div className="mr-2 text-gray-600">
                                        <ArrowUpDown size={16} />
                                    </div>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="newest">Más recientes</option>
                                        <option value="price-asc">Precio: menor a mayor</option>
                                        <option value="price-desc">Precio: mayor a menor</option>
                                        <option value="capacity">Mayor capacidad</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Panel de filtros para móvil (desplegable) */}
                            {isFilterOpen && (
                                <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Filtro de precio */}
                                        <div className="mb-4">
                                            <h4 className="font-medium text-gray-700 mb-2">Rango de precio</h4>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm">${priceRange[0]}</span>
                                                <span className="text-sm">${priceRange[1]}</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <input 
                                                    type="range"
                                                    min="0"
                                                    max="5000"
                                                    step="100"
                                                    value={priceRange[0]}
                                                    onChange={handleMinPriceChange}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <input 
                                                    type="range"
                                                    min="0"
                                                    max="5000"
                                                    step="100"
                                                    value={priceRange[1]}
                                                    onChange={handleMaxPriceChange}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Filtro de capacidad */}
                                        <div className="mb-4">
                                            <h4 className="font-medium text-gray-700 mb-2">Capacidad mínima</h4>
                                            <select
                                                value={capacityFilter}
                                                onChange={(e) => setCapacityFilter(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Cualquiera</option>
                                                <option value="1">1 persona</option>
                                                <option value="2">2 personas</option>
                                                <option value="3">3 personas</option>
                                                <option value="4">4 personas</option>
                                                <option value="5">5+ personas</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Filtro de servicios */}
                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-700 mb-2">Servicios</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {availableServices.map(service => (
                                                <div 
                                                    key={service.id}
                                                    className={`flex items-center px-3 py-2 rounded-full cursor-pointer transition-colors ${
                                                        selectedServices.includes(service.name) 
                                                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                                                    }`}
                                                    onClick={() => toggleService(service.name)}
                                                >
                                                    <div className="mr-2">{service.icon}</div>
                                                    <span className="text-sm">{service.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex justify-between mt-4">
                                        <button 
                                            onClick={resetFilters}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Limpiar filtros
                                        </button>
                                        <button 
                                            onClick={() => setIsFilterOpen(false)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Aplicar filtros
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contador de resultados */}
                        <div className="mb-4 flex justify-between items-center">
                            <p className="text-gray-600">
                                {filteredHabitaciones.length} 
                                {filteredHabitaciones.length === 1 ? ' habitación encontrada' : ' habitaciones encontradas'}
                            </p>
                            {(searchTerm || selectedServices.length > 0 || capacityFilter || priceRange[0] > 0 || priceRange[1] < 5000) && (
                                <button 
                                    onClick={resetFilters}
                                    className="text-sm text-blue-600 hover:underline flex items-center"
                                >
                                    <X size={14} className="mr-1" />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>

                        {/* Listado de habitaciones */}
                        {filteredHabitaciones.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredHabitaciones.map(habitacion => (
                                    <div key={habitacion.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 group">
                                        {/* Imagen de la habitación con overlay */}
                                        <div className="relative h-48 overflow-hidden">
                                            <div className="absolute top-2 right-2 z-10">
                                                <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition">
                                                    <Heart size={18} className="text-gray-500 hover:text-red-500 transition" />
                                                </button>
                                            </div>
                                            <img 
                                                src={habitacion.imagenUrl} 
                                                alt={habitacion.nombre}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible'
                                                }}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20 pointer-events-none"></div>
                                            <div className="absolute bottom-2 left-2 text-white flex items-center">
                                                <div className="flex items-center bg-black/50 p-1 px-2 rounded">
                                                    <Star size={14} className="text-yellow-400 mr-1" fill="#FBBF24" />
                                                    <span className="text-xs font-medium">4.8</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Información de la habitación */}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-xl font-bold text-gray-800">{habitacion.nombre}</h2>
                                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                    ${habitacion.precio}/noche
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{habitacion.descripcion}</p>
                                            
                                            <div className="flex items-center mb-3 space-x-4">
                                                <div className="flex items-center text-gray-700">
                                                    <Users size={16} className="mr-1 text-blue-500" />
                                                    <span className="text-sm">{habitacion.capacidad} personas</span>
                                                </div>
                                                <div className="flex items-center text-gray-700">
                                                    <Bed size={16} className="mr-1 text-blue-500" />
                                                    <span className="text-sm">{habitacion.camas} camas</span>
                                                </div>
                                            </div>
                                            
                                            {/* Servicios */}
                                            <div className="mb-4">
                                                <h3 className="text-xs font-medium text-gray-500 mb-2">Servicios:</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {habitacion.servicios.slice(0, 3).map((servicio, index) => (
                                                        <span 
                                                            key={index} 
                                                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                                                        >
                                                            {servicio}
                                                        </span>
                                                    ))}
                                                    {habitacion.servicios.length > 3 && (
                                                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                                                            +{habitacion.servicios.length - 3} más
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Botones de acción */}
                                            <div className="flex justify-between pt-3 border-t border-gray-200">
                                                <Link
                                                    to={`/admin/editar/${habitacion.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                                                >
                                                    <Edit size={14} className="mr-1" />
                                                    Editar
                                                </Link>
                                                <Link
                                                    to={`/habitaciones/${habitacion.id}`}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center transition"
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    Ver detalles
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md py-10 px-4 text-center">
                                <div className="mb-4 text-gray-400">
                                    <Bed size={48} className="mx-auto" />
                                </div>
                                <p className="text-gray-500 text-lg mb-2">
                                    {searchTerm || selectedServices.length > 0 || capacityFilter || priceRange[0] > 0 || priceRange[1] < 5000 ? 
                                        'No se encontraron habitaciones con esos criterios' : 
                                        'No hay habitaciones registradas aún'}
                                </p>
                                <p className="text-gray-400 mb-6">
                                    {searchTerm || selectedServices.length > 0 || capacityFilter || priceRange[0] > 0 || priceRange[1] < 5000 ? 
                                        'Prueba a ajustar los filtros para ver más resultados' : 
                                        'Crea tu primera habitación para comenzar'}
                                </p>
                                {!searchTerm && selectedServices.length === 0 && !capacityFilter && priceRange[0] === 0 && priceRange[1] === 5000 && (
                                    <Link 
                                        to="/habitaciones/crear"
                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition flex items-center justify-center mx-auto w-auto"
                                    >
                                        <PlusCircle size={18} className="mr-2" />
                                        Crear primera habitación
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}