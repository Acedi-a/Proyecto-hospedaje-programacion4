import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../data/firebase'
import { Link } from 'react-router-dom'

export function Habitaciones() {
    const [habitaciones, setHabitaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

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

    // Filtrar habitaciones según el término de búsqueda
    const filteredHabitaciones = habitaciones.filter(habitacion => 
        habitacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        habitacion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        habitacion.servicios.some(servicio => 
            servicio.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    )

    if (error) return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
    )

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Listado de Habitaciones</h1>
                <Link 
                    to="/admin/crear"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                    Crear Nueva Habitación
                </Link>
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar habitaciones..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Listado de habitaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHabitaciones.length > 0 ? (
                    filteredHabitaciones.map(habitacion => (
                        <div key={habitacion.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                            {/* Imagen de la habitación */}
                            <div className="h-48 overflow-hidden">
                                <img 
                                    src={habitacion.imagenUrl} 
                                    alt={habitacion.nombre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible'
                                    }}
                                />
                            </div>
                            
                            {/* Información de la habitación */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-semibold text-gray-800">{habitacion.nombre}</h2>
                                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                        ${habitacion.precio} / noche
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 mb-3 line-clamp-2">{habitacion.descripcion}</p>
                                
                                <div className="flex items-center mb-3">
                                    <span className="text-gray-700 mr-2">
                                        <i className="fas fa-users mr-1"></i> {habitacion.capacidad} personas
                                    </span>
                                    <span className="text-gray-700">
                                        <i className="fas fa-bed mr-1"></i> {habitacion.camas} camas
                                    </span>
                                </div>
                                
                                {/* Servicios */}
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Servicios:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {habitacion.servicios.map((servicio, index) => (
                                            <span 
                                                key={index} 
                                                className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                                            >
                                                {servicio}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Botones de acción */}
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <Link
                                        to={`/admin/editar/${habitacion.id}`}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                    >
                                        Editar
                                    </Link>
                                    <Link
                                        to={`/habitaciones/${habitacion.id}`}
                                        className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                                    >
                                        Ver detalles
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10">
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'No se encontraron habitaciones con ese criterio' : 'No hay habitaciones registradas aún'}
                        </p>
                        {!searchTerm && (
                            <Link 
                                to="/habitaciones/crear"
                                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                                Crear primera habitación
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}