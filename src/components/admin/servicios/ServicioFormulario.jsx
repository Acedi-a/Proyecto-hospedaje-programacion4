
export const ServicioFormulario = ({ servicioEditando, setServicioEditando, guardar, cancelar }) => {
  const esNuevo = servicioEditando?.id?.startsWith("serv-") && servicioEditando?.nombre === "";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">{esNuevo ? "Crear Nuevo Servicio" : "Editar Servicio"}</h2>
        <form onSubmit={guardar}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={servicioEditando.nombre}
                onChange={(e) => setServicioEditando({ ...servicioEditando, nombre: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={servicioEditando.categoria}
                onChange={(e) => setServicioEditando({ ...servicioEditando, categoria: e.target.value })}
                className="p-2 border border-gray-300 rounded-md w-full"
              >
                <option value="general">General</option>
                <option value="bienestar">Bienestar</option>
                <option value="excursiones">Excursiones</option>
                <option value="gastronomia">Gastronomía</option>
                <option value="transporte">Transporte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={servicioEditando.precio}
                onChange={(e) => setServicioEditando({ ...servicioEditando, precio: parseFloat(e.target.value) })}
                className="p-2 border border-gray-300 rounded-md w-full"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={servicioEditando.descripcion}
              onChange={(e) => setServicioEditando({ ...servicioEditando, descripcion: e.target.value })}
              className="p-2 border border-gray-300 rounded-md w-full h-32"
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={servicioEditando.estado}
                onChange={(e) => setServicioEditando({ ...servicioEditando, estado: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={cancelar} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
