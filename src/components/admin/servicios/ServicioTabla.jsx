export const ServicioTabla = ({ servicios = [], editarServicio, eliminarServicio }) => {
  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return 'N/A'; 
    }
    return numericPrice.toLocaleString('es-ES', { style: 'currency', currency: 'BOB' });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="hover:bg-gray-50 transition-colors">
                {/* Servicio - Celda con imagen más grande */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        className="h-full w-full object-cover"
                        src={servicio.imagenUrl || `https://via.placeholder.com/80?text=${servicio.nombre?.charAt(0) || '?'}`}
                        alt={servicio.nombre || 'Servicio sin nombre'}
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/80?text=${servicio.nombre?.charAt(0) || '?'}`;
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center text-base font-medium text-gray-900">
                        {servicio.icono && <span className="mr-2 text-lg">{servicio.icono}</span>}
                        <span>{servicio.nombre || 'Servicio sin nombre'}</span>
                      </div>
                      {servicio.descripcion && (
                        <div className="text-sm text-gray-500 mt-1 max-w-xs line-clamp-2" title={servicio.descripcion}>
                          {servicio.descripcion}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-white-800 text-sm">
                    {servicio.categoria || 'Sin categoría'}
                  </span>
                </td>

                {/* Precio */}
                <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900">
                  {formatPrice(servicio.precio)}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => editarServicio(servicio)}
                      className="px-4 py-2 bg-emerald-50 text-green-600 rounded-md hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      aria-label={`Editar ${servicio.nombre}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarServicio(servicio.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      aria-label={`Eliminar ${servicio.nombre}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {servicios.length === 0 && (
        <div className="text-center py-10 px-6">
          <p className="text-gray-500">No se encontraron servicios.</p>
        </div>
      )}
    </div>
  );
};