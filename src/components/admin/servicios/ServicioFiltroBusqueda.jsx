
export const ServicioFiltroBusqueda = ({ filtro, setFiltro, busqueda, setBusqueda }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div>
          <label htmlFor="filtro" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por disponibilidad
          </label>
          <select
            id="filtro"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
          >
            <option value="todos">Todos</option>
            <option value="disponibles">Disponibles</option>
            <option value="no-disponibles">No disponibles</option>
          </select>
        </div>

        <div>
          <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            id="busqueda"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o descripción"
            className="p-2 border border-gray-300 rounded-md w-full md:w-64"
          />
        </div>
      </div>
    </div>
  )
}
