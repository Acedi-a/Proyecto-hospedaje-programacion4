import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Asegúrate de tener configurado Supabase
import { db } from '../../data/firebase';

export function CrearHabitacion() {
    const navigate = useNavigate();

    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [servicios, setServicios] = useState([]);
    const [servicioInput, setServicioInput] = useState('');
    const [capacidad, setCapacidad] = useState('');
    const [camas, setCamas] = useState('');
    const [archivoImagen, setArchivoImagen] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Servicios disponibles (puedes cargarlos desde otra colección si prefieres)
    const serviciosDisponibles = ['wifi', 'tv', 'aire-acondicionado', 'jacuzzi', 'room-service', 'minibar'];

    const handleFileChange = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            // Validar tipo de imagen
            if (!archivo.type.match(/image\/(jpeg|png|webp)/)) {
                alert('Formato no válido. Sube JPEG, PNG o WebP');
                return;
            }
            
            // Validar tamaño (ej. máximo 2MB)
            if (archivo.size > 2 * 1024 * 1024) {
                alert('La imagen no debe exceder 2MB');
                return;
            }

            setArchivoImagen(archivo);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewURL(reader.result);
            reader.readAsDataURL(archivo);
        }
    };

    const handleServicioChange = (e) => {
        const servicio = e.target.value;
        if (servicio && !servicios.includes(servicio)) {
            setServicios([...servicios, servicio]);
            setServicioInput('');
        }
    };

    const removeServicio = (servicioToRemove) => {
        setServicios(servicios.filter(servicio => servicio !== servicioToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validación básica
        if (!nombre || !precio || !capacidad || !camas || !archivoImagen) {
            alert('Los campos marcados con * son obligatorios');
            setIsSubmitting(false);
            return;
        }

        try {
            // 1. Subir imagen a Supabase
            const extension = archivoImagen.name.split('.').pop();
            const imagenRuta = `habitaciones/${Date.now()}_${Math.random().toString(36).substring(2)}.${extension}`;
            
            const { error: uploadError } = await supabase.storage
                .from('imagenes')
                .upload(imagenRuta, archivoImagen);

            if (uploadError) throw uploadError;

            // 2. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('imagenes')
                .getPublicUrl(imagenRuta);

            // 3. Crear documento en Firestore
            await addDoc(collection(db, 'Habitaciones'), {
                nombre,
                precio: Number(precio),
                descripcion,
                servicios,
                capacidad: Number(capacidad),
                camas: Number(camas),
                imagenRuta,
                imagenUrl: publicUrl,
                createdAt: new Date()
            });

            // Resetear formulario
            setNombre('');
            setPrecio('');
            setDescripcion('');
            setServicios([]);
            setCapacidad('');
            setCamas('');
            setArchivoImagen(null);
            setPreviewURL(null);

            alert('Habitación creada correctamente');
            navigate('/habitaciones');
        } catch (error) {
            console.error('Error al crear habitación:', error);
            alert('Error al crear la habitación: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Crear Nueva Habitación</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Nombre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        required
                    />
                </div>

                {/* Campo Precio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Precio por noche *</label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                        <input
                            type="number"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            min="0"
                            step="0.01"
                            className="block w-full rounded-md border-gray-300 pl-7 p-2 border"
                            required
                        />
                    </div>
                </div>

                {/* Campo Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    />
                </div>

                {/* Campo Servicios */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Servicios</label>
                    <div className="flex mt-1">
                        <select
                            value={servicioInput}
                            onChange={(e) => setServicioInput(e.target.value)}
                            className="rounded-l-md border-gray-300 shadow-sm p-2 border"
                        >
                            <option value="">Seleccionar servicio</option>
                            {serviciosDisponibles.map(servicio => (
                                <option key={servicio} value={servicio}>
                                    {servicio}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => handleServicioChange({ target: { value: servicioInput } })}
                            className="bg-blue-500 text-white px-4 rounded-r-md"
                        >
                            Añadir
                        </button>
                    </div>
                    
                    {/* Servicios seleccionados */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {servicios.map(servicio => (
                            <span key={servicio} className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                                {servicio}
                                <button
                                    type="button"
                                    onClick={() => removeServicio(servicio)}
                                    className="ml-2 text-gray-500 hover:text-red-500"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Campos Capacidad y Camas */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacidad (personas) *</label>
                        <input
                            type="number"
                            value={capacidad}
                            onChange={(e) => setCapacidad(e.target.value)}
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Camas *</label>
                        <input
                            type="number"
                            value={camas}
                            onChange={(e) => setCamas(e.target.value)}
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                        />
                    </div>
                </div>

                {/* Campo Imagen */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Imagen *</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                    />
                </div>

                {/* Vista previa de la imagen */}
                {previewURL && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">Vista previa:</p>
                        <img
                            src={previewURL}
                            alt="Vista previa de la habitación"
                            className="mt-2 rounded-md max-w-xs max-h-40 object-cover"
                        />
                    </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/habitaciones')}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Habitación'}
                    </button>
                </div>
            </form>
        </div>
    );
}