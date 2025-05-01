import { Wrench, Briefcase, Settings } from "lucide-react";
export const ServicioTabla = ({ servicios = [], editarServicio, eliminarServicio }) => {
  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return 'N/A'; 
    }
    return numericPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
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
              <tr key={servicio.id}>
                {/* Servicio */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={servicio.imagen || `https://via.placeholder.com/40?text=${servicio.nombre?.charAt(0) || '?'}`}
                        alt={servicio.nombre || 'Servicio sin nombre'}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        {servicio.icono && <span className="mr-2">{servicio.icono}</span>}
                        {servicio.nombre || 'Servicio sin nombre'}
                      </div>
                      {servicio.descripcion && (
                        <div className="text-sm text-gray-500 max-w-xs truncate" title={servicio.descripcion}>
                          {servicio.descripcion}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                  {servicio.categoria || 'Sin categoría'}
                </td>

                {/* Precio */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(servicio.precio)}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => editarServicio(servicio)}
                      className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      aria-label={`Editar ${servicio.nombre}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarServicio(servicio.id)}
                      className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
