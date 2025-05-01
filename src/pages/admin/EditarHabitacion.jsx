import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../data/SupabaseClient'
import { db } from '../../data/firebase'

export function EditarHabitacion() {
    const { id } = useParams()
    const navigate = useNavigate()

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        descripcion: '',
        capacidad: '',
        camas: '',
        estado: 'disponible',
        servicios: [],
        imagenRuta: '',
        imagenUrl: ''
    })

    const [archivoImagen, setArchivoImagen] = useState(null)
    const [previewURL, setPreviewURL] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    // Servicios disponibles
    const serviciosDisponibles = ['wifi', 'tv', 'aire acondicionado', 'jacuzzi', 'room service', 'minibar']

    // Cargar datos de la habitación al montar el componente
    useEffect(() => {
        const fetchHabitacion = async () => {
            try {
                const docRef = doc(db, 'Habitaciones', id)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setFormData({
                        nombre: data.nombre,
                        precio: data.precio,
                        descripcion: data.descripcion || '',
                        capacidad: data.capacidad,
                        camas: data.camas,
                        estado: data.estado || 'disponible',
                        servicios: data.servicios || [],
                        imagenRuta: data.imagenRuta,
                        imagenUrl: data.imagenUrl
                    })
                    setPreviewURL(data.imagenUrl)
                } else {
                    throw new Error('Habitación no encontrada')
                }
            } catch (err) {
                console.error('Error al cargar habitación:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchHabitacion()
    }, [id])

    // Manejadores de cambios
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validaciones de imagen
        if (!file.type.match(/image\/(jpeg|png|webp)/)) {
            setError('Formato no válido. Sube JPEG, PNG o WebP')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no debe exceder 5MB')
            return
        }

        setError(null)
        setArchivoImagen(file)

        // Vista previa
        const reader = new FileReader()
        reader.onloadend = () => setPreviewURL(reader.result)
        reader.readAsDataURL(file)
    }

    const toggleServicio = (servicio) => {
        setFormData(prev => {
            const servicios = prev.servicios.includes(servicio)
                ? prev.servicios.filter(s => s !== servicio)
                : [...prev.servicios, servicio]
            return { ...prev, servicios }
        })
    }

    // Función para guardar cambios
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        let fileName = formData.imagenRuta // Mantener la misma imagen por defecto

        try {
            // Validación básica
            if (!formData.nombre || !formData.precio || !formData.capacidad || !formData.camas) {
                throw new Error('Todos los campos marcados con * son obligatorios')
            }

            // Si hay nueva imagen, subirla a Supabase
            if (archivoImagen) {
                // Eliminar imagen anterior si existe
                if (formData.imagenRuta) {
                    await supabase.storage
                        .from('imagenes')
                        .remove([formData.imagenRuta])
                        .catch(console.error)
                }

                // Subir nueva imagen
                const fileExt = archivoImagen.name.split('.').pop()
                fileName = `habitaciones/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
                
                const { error: uploadError } = await supabase.storage
                    .from('imagenes')
                    .upload(fileName, archivoImagen, {
                        cacheControl: '3600',
                        contentType: archivoImagen.type,
                        upsert: false
                    })

                if (uploadError) throw uploadError
            }

            // Obtener URL pública (actualizar si cambió la imagen)
            const imagenUrl = archivoImagen 
                ? supabase.storage.from('imagenes').getPublicUrl(fileName).data.publicUrl
                : formData.imagenUrl

            // Actualizar en Firestore
            await updateDoc(doc(db, 'Habitaciones', id), {
                nombre: formData.nombre,
                precio: Number(formData.precio),
                descripcion: formData.descripcion,
                servicios: formData.servicios,
                capacidad: Number(formData.capacidad),
                camas: Number(formData.camas),
                estado: formData.estado,
                ...(archivoImagen && { 
                    imagenRuta: fileName,
                    imagenUrl: imagenUrl
                }),
                updatedAt: new Date()
            })

            // Éxito - redireccionar
            navigate('/admin/habitaciones', { 
                state: { 
                    success: 'Habitación actualizada exitosamente!',
                    updatedImage: !!archivoImagen
                } 
            })

        } catch (error) {
            console.error('Error:', error)
            setError(formatError(error))
        } finally {
            setIsSubmitting(false)
        }
    }

    // Formateador de errores
    const formatError = (error) => {
        if (error.message.includes('The resource already exists')) {
            return 'El nombre de la imagen ya existe. Intenta con otra imagen.'
        }
        if (error.message.includes('not found')) {
            return 'El bucket de imágenes no existe. Verifica la configuración.'
        }
        if (error.message.includes('Forbidden')) {
            return 'No tienes permisos para realizar esta acción.'
        }
        return error.message || 'Error al procesar la solicitud'
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/admin/habitaciones')}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
                >
                    Volver al listado
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Habitación</h1>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio por noche *
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full pl-8 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                    </label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Capacidad y Camas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacidad (personas) *
                        </label>
                        <input
                            type="number"
                            name="capacidad"
                            value={formData.capacidad}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de camas *
                        </label>
                        <input
                            type="number"
                            name="camas"
                            value={formData.camas}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Estado */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                    </label>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="disponible">Disponible</option>
                        <option value="ocupada">Ocupada</option>
                        <option value="mantenimiento">En mantenimiento</option>
                    </select>
                </div>

                {/* Servicios */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Servicios incluidos
                    </label>
                    <div className="flex flex-wrap gap-4">
                        {serviciosDisponibles.map(servicio => (
                            <div key={servicio} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`servicio-${servicio}`}
                                    checked={formData.servicios.includes(servicio)}
                                    onChange={() => toggleServicio(servicio)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`servicio-${servicio}`} className="ml-2 text-sm text-gray-700">
                                    {servicio}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Imagen */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen de la habitación
                    </label>
                    {previewURL && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Imagen actual:</p>
                            <img
                                src={previewURL}
                                alt="Vista previa de la habitación"
                                className="max-w-full h-auto max-h-60 rounded-lg border border-gray-200"
                            />
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Deja vacío para mantener la imagen actual. Formatos aceptados: JPEG, PNG, WEBP (Máximo 5MB)
                    </p>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/habitaciones')}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </>
                        ) : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    )
}