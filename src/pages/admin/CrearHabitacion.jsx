import { useState, useEffect } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../data/SupabaseClient'
import { db } from '../../data/firebase'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion } from 'framer-motion'
import { 
  Bed, 
  Wifi, 
  Tv, 
  Wind, 
  Droplet, 
  Coffee, 
  Wine, 
  DollarSign, 
  Users, 
  AlignLeft, 
  Upload, 
  Save, 
  ArrowLeft,
  Loader
} from 'lucide-react'

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
    const [dragActive, setDragActive] = useState(false)

    // Servicios disponibles con iconos
    const serviciosDisponibles = [
        { id: 'wifi', label: 'WiFi', icon: <Wifi size={18} /> },
        { id: 'tv', label: 'TV', icon: <Tv size={18} /> },
        { id: 'aire acondicionado', label: 'Aire acondicionado', icon: <Wind size={18} /> },
        { id: 'jacuzzi', label: 'Jacuzzi', icon: <Droplet size={18} /> },
        { id: 'room service', label: 'Room Service', icon: <Coffee size={18} /> },
        { id: 'minibar', label: 'Minibar', icon: <Wine size={18} /> }
    ]

    // Animación de entrada para elementos del formulario
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: 'spring', stiffness: 100 }
        }
    }

    // Manejadores de cambios
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        processFile(file)
    }

    const processFile = (file) => {
        if (!file) return

        // Validaciones de imagen
        if (!file.type.match(/image\/(jpeg|png|webp)/)) {
            toast.error('Formato no válido. Sube JPEG, PNG o WebP')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe exceder 5MB')
            return
        }

        setError(null)
        setArchivoImagen(file)

        // Vista previa
        const reader = new FileReader()
        reader.onloadend = () => setPreviewURL(reader.result)
        reader.readAsDataURL(file)
        toast.success('Imagen cargada correctamente')
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const toggleServicio = (servicioId) => {
        setFormData(prev => {
            const servicios = prev.servicios.includes(servicioId)
                ? prev.servicios.filter(s => s !== servicioId)
                : [...prev.servicios, servicioId]
            return { ...prev, servicios }
        })
    }

    // Función handleSubmit mejorada
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        let fileName = null

        // Validación básica
        if (!formData.nombre || !formData.precio || !formData.capacidad || !formData.camas || !archivoImagen) {
            toast.error('Todos los campos marcados con * son obligatorios')
            setIsSubmitting(false)
            return
        }

        // Toast de carga
        const loadingToast = toast.loading("Guardando habitación...", {
            position: "top-center"
        })

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

            // Actualizar toast y redireccionar
            toast.update(loadingToast, {
                render: "¡Habitación creada exitosamente!",
                type: "success",
                isLoading: false,
                autoClose: 2000
            })

            // Redireccionar después de mostrar el toast
            setTimeout(() => {
                navigate('/admin/habitaciones', { 
                    state: { success: 'Habitación creada exitosamente!' } 
                })
            }, 2000)

        } catch (error) {
            console.error('Error:', error)
            
            // Limpiar imagen subida si hubo error después de subirla
            if (fileName) {
                await supabase.storage
                    .from('imagenes')
                    .remove([fileName])
                    .catch(console.error)
            }
            
            toast.update(loadingToast, {
                render: formatError(error),
                type: "error",
                isLoading: false,
                autoClose: 4000
            })
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
        <>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            <motion.div 
                className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h1 
                    className="text-2xl font-bold text-gray-800 mb-6 flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Bed className="mr-2" /> Crear Nueva Habitación
                </motion.h1>
                
                {error && (
                    <motion.div 
                        className="mb-4 p-3 bg-red-100 text-red-700 rounded-md"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring' }}
                    >
                        {error}
                    </motion.div>
                )}

                <motion.form 
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Sección de Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <AlignLeft size={16} className="mr-1" /> Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                                required
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <DollarSign size={16} className="mr-1" /> Precio por noche *
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
                                    className="w-full pl-8 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                                    required
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Descripción */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <AlignLeft size={16} className="mr-1" /> Descripción
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                        />
                    </motion.div>

                    {/* Capacidad y Camas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <Users size={16} className="mr-1" /> Capacidad (personas) *
                            </label>
                            <input
                                type="number"
                                name="capacidad"
                                value={formData.capacidad}
                                onChange={handleChange}
                                min="1"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                                required
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <Bed size={16} className="mr-1" /> Número de camas *
                            </label>
                            <input
                                type="number"
                                name="camas"
                                value={formData.camas}
                                onChange={handleChange}
                                min="1"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                                required
                            />
                        </motion.div>
                    </div>

                    {/* Servicios */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Servicios incluidos
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {serviciosDisponibles.map(servicio => (
                                <motion.div 
                                    key={servicio.id} 
                                    className={`flex items-center p-2 border rounded-md cursor-pointer transition-all duration-300 ${
                                        formData.servicios.includes(servicio.id) 
                                            ? 'bg-blue-50 border-blue-300' 
                                            : 'border-gray-200 hover:border-blue-200'
                                    }`}
                                    onClick={() => toggleServicio(servicio.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className={`mr-2 text-${
                                        formData.servicios.includes(servicio.id) 
                                            ? 'blue-500' 
                                            : 'gray-400'
                                    }`}>
                                        {servicio.icon}
                                    </div>
                                    <label className="text-sm text-gray-700 cursor-pointer">
                                        {servicio.label}
                                    </label>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Imagen */}
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <Upload size={16} className="mr-1" /> Imagen de la habitación *
                        </label>
                        
                        <div 
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                                dragActive 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-gray-300 hover:border-blue-300'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <Upload 
                                    size={24} 
                                    className={`${previewURL ? 'text-blue-500' : 'text-gray-400'}`} 
                                />
                                <p className="text-sm text-gray-500">
                                    {previewURL 
                                        ? 'Cambiar imagen' 
                                        : 'Arrastra una imagen o haz clic para seleccionar'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Formatos aceptados: JPEG, PNG, WEBP (Máximo 5MB)
                                </p>
                            </div>
                        </div>

                        {previewURL && (
                            <motion.div 
                                className="mt-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <p className="text-sm font-medium text-gray-700 mb-1">Vista previa:</p>
                                <motion.div 
                                    className="relative rounded-lg overflow-hidden border border-gray-200"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <img
                                        src={previewURL}
                                        alt="Vista previa de la habitación"
                                        className="max-w-full h-auto max-h-60 w-full object-cover"
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Botones */}
                    <motion.div 
                        className="flex justify-end space-x-4 pt-4"
                        variants={itemVariants}
                    >
                        <motion.button
                            type="button"
                            onClick={() => navigate('/admin/habitaciones')}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ArrowLeft size={16} className="mr-1" /> Cancelar
                        </motion.button>
                        <motion.button
                            type="submit"
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader size={16} className="animate-spin mr-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-1" /> Guardar Habitación
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </motion.form>
            </motion.div>
        </>
    )
}