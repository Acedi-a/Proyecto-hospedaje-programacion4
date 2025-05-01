import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../data/SupabaseClient'
import { db } from '../../data/firebase'

export function CrearHabitacion() {
    const navigate = useNavigate()

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        descripcion: '',
        capacidad: '',
        camas: '',
        estado: 'disponible',
        servicios: []
    })

    const [archivoImagen, setArchivoImagen] = useState(null)
    const [previewURL, setPreviewURL] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // Servicios disponibles
    const serviciosDisponibles = ['wifi', 'tv', 'aire acondicionado', 'jacuzzi', 'room service', 'minibar']

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

    // Función handleSubmit actualizada
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        let fileName = null

        // Validación básica
        if (!formData.nombre || !formData.precio || !formData.capacidad || !formData.camas || !archivoImagen) {
            setError('Todos los campos marcados con * son obligatorios')
            setIsSubmitting(false)
            return
        }

        try {
            // 1. Generar nombre único para el archivo
            const fileExt = archivoImagen.name.split('.').pop()
            fileName = `habitaciones/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
            
            // 2. Subir imagen a Supabase
            const { error: uploadError } = await supabase.storage
                .from('imagenes')
                .upload(fileName, archivoImagen, {
                    cacheControl: '3600',
                    contentType: archivoImagen.type,
                    upsert: false
                })

            if (uploadError) throw uploadError

            // 3. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('imagenes')
                .getPublicUrl(fileName)

            // 4. Guardar en Firestore
            await addDoc(collection(db, 'Habitaciones'), {
                nombre: formData.nombre,
                precio: Number(formData.precio),
                descripcion: formData.descripcion,
                servicios: formData.servicios,
                capacidad: Number(formData.capacidad),
                camas: Number(formData.camas),
                imagenRuta: fileName,
                imagenUrl: publicUrl,
                estado: formData.estado,
                createdAt: new Date()
            })

            // Éxito - redireccionar
            navigate('/admin', { state: { success: 'Habitación creada exitosamente!' } })

        } catch (error) {
            console.error('Error:', error)
            
            // Limpiar imagen subida si hubo error después de subirla
            if (fileName) {
                await supabase.storage
                    .from('imagenes')
                    .remove([fileName])
                    .catch(console.error)
            }
            
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

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear Nueva Habitación</h1>
            
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
                        Imagen de la habitación *
                    </label>
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
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Formatos aceptados: JPEG, PNG, WEBP (Máximo 5MB)
                    </p>

                    {previewURL && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Vista previa:</p>
                            <img
                                src={previewURL}
                                alt="Vista previa de la habitación"
                                className="max-w-full h-auto max-h-60 rounded-lg border border-gray-200"
                            />
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/habitaciones')}
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
                        ) : 'Guardar Habitación'}
                    </button>
                </div>
            </form>
        </div>
    )
}