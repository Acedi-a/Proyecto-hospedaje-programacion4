import { useState, useEffect } from 'react';

export const ServicioFormulario = ({ 
  servicioEditando, 
  setServicioEditando, 
  guardar, 
  cancelar,
  subirImagen,
  eliminarImagen
}) => {
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewURL, setPreviewURL] = useState(servicioEditando.imagenUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagenTemporal, setImagenTemporal] = useState(null);
  const [inputKey, setInputKey] = useState(Date.now()); // Para resetear el input file

  useEffect(() => {
    if (servicioEditando?.imagenUrl) {
      setPreviewURL(servicioEditando.imagenUrl);
    }
  }, [servicioEditando]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validaciones de imagen
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setError('Formato no válido. Sube JPEG, PNG o WebP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe exceder 5MB');
      return;
    }

    setError(null);
    setArchivoImagen(file);
    setImagenTemporal(file);

    // Vista previa
    const reader = new FileReader();
    reader.onloadend = () => setPreviewURL(reader.result);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setServicioEditando(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Mantener la imagen temporal cuando otros campos cambian
    if (imagenTemporal) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewURL(reader.result);
      reader.readAsDataURL(imagenTemporal);
    }
  };

  const handlePrecioChange = (e) => {
    const value = parseFloat(e.target.value);
    setServicioEditando(prev => ({
      ...prev,
      precio: value
    }));

    if (imagenTemporal) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewURL(reader.result);
      reader.readAsDataURL(imagenTemporal);
    }
  };

  const handleRemoveImage = () => {
    setPreviewURL(null);
    setArchivoImagen(null);
    setImagenTemporal(null);
    setInputKey(Date.now()); // Forzar reset del input file
    
    if (servicioEditando.imagenUrl) {
      setServicioEditando(prev => ({
        ...prev,
        imagenUrl: null,
        imagenRuta: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let servicioActualizado = { ...servicioEditando };
      let imagenRutaOriginal = servicioEditando.imagenRuta;

      // Si hay nueva imagen, subirla
      if (archivoImagen) {
        const { ruta, url } = await subirImagen(archivoImagen);
        servicioActualizado.imagenRuta = ruta;
        servicioActualizado.imagenUrl = url;

        // Eliminar imagen anterior si existía
        if (imagenRutaOriginal) {
          await eliminarImagen(imagenRutaOriginal);
        }
      } else if (previewURL === null && servicioEditando.imagenUrl) {
        // Si se eliminó la imagen existente
        await eliminarImagen(servicioEditando.imagenRuta);
        servicioActualizado.imagenRuta = null;
        servicioActualizado.imagenUrl = null;
      }

      // Guardar en Firestore
      await guardar(servicioActualizado);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">
          {servicioEditando.id ? "Editar Servicio" : "Crear Nuevo Servicio"}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={servicioEditando.nombre || ''}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-md w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                name="categoria"
                value={servicioEditando.categoria || 'general'}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-md w-full"
                required
              >
                <option value="general">General</option>
                <option value="bienestar">Bienestar</option>
                <option value="excursiones">Excursiones</option>
                <option value="gastronomia">Gastronomía</option>
                <option value="transporte">Transporte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€) *</label>
              <input
                type="number"
                name="precio"
                value={servicioEditando.precio }
                onChange={handlePrecioChange}
                className="p-2 border border-gray-300 rounded-md w-full"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea
              name="descripcion"
              value={servicioEditando.descripcion || ''}
              onChange={handleInputChange}
              rows={3}
              className="p-2 border border-gray-300 rounded-md w-full h-32"
              required
            />
          </div>

          {/* Campo de imagen */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del servicio
            </label>
            {previewURL && (
              <div className="mb-4 relative">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {servicioEditando.id && !imagenTemporal ? "Imagen actual" : "Vista previa"}:
                </p>
                <img
                  src={previewURL}
                  alt="Vista previa del servicio"
                  className="max-w-full h-auto max-h-60 rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 mt-2 mr-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Quitar imagen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <input
              key={inputKey}
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
              {servicioEditando.id 
                ? "Deja vacío para mantener la imagen actual. Formatos aceptados: JPEG, PNG, WEBP (Máximo 5MB)"
                : "Formatos aceptados: JPEG, PNG, WEBP (Máximo 5MB)"}
            </p>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="estado"
                checked={servicioEditando.estado || false}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={cancelar}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
              ) : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};