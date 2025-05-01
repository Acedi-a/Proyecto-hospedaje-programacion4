
import { useState, useEffect } from "react"
import { habitacionesData as habitaciones } from "../../data/habitaciones"
import { serviciosData as servicios } from "../../data/servicios"

export const AdminReportes = () => {
  const [cargando, setCargando] = useState(true)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mes")
  const [datosReservas, setDatosReservas] = useState([])
  const [datosIngresos, setDatosIngresos] = useState([])
  const [datosOcupacion, setDatosOcupacion] = useState([])
  const [datosServicios, setDatosServicios] = useState([])

  useEffect(() => {
    setTimeout(() => {
      generarDatos()
      setCargando(false)
    }, 1000)
  }, [periodoSeleccionado])

  //es que no entenderxd

  const generarDatos = () => {
    const fechaActual = new Date()
    const etiquetas = []
    const datosReservasTemp = []
    const datosIngresosTemp = []
    const datosOcupacionTemp = []

    if (periodoSeleccionado === "semana") {
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(fechaActual)
        fecha.setDate(fechaActual.getDate() - i)
        etiquetas.push(fecha.toLocaleDateString("es-ES", { weekday: "short" }))
        datosReservasTemp.push(Math.floor(Math.random() * 10))
        datosIngresosTemp.push(Math.floor(Math.random() * 1000) + 200)
        datosOcupacionTemp.push(Math.floor(Math.random() * 100))
      }
    } else if (periodoSeleccionado === "mes") {
      for (let i = 0; i < 4; i++) {
        const semana = `Semana ${i + 1}`
        etiquetas.push(semana)
        datosReservasTemp.push(Math.floor(Math.random() * 30) + 5)
        datosIngresosTemp.push(Math.floor(Math.random() * 3000) + 1000)
        datosOcupacionTemp.push(Math.floor(Math.random() * 100))
      }
    } else if (periodoSeleccionado === "año") {
      const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      for (let i = 0; i < 12; i++) {
        etiquetas.push(meses[i])
        datosReservasTemp.push(Math.floor(Math.random() * 100) + 20)
        datosIngresosTemp.push(Math.floor(Math.random() * 10000) + 3000)
        datosOcupacionTemp.push(Math.floor(Math.random() * 100))
      }
    }

    setDatosReservas({
      etiquetas,
      datos: datosReservasTemp,
    })

    setDatosIngresos({
      etiquetas,
      datos: datosIngresosTemp,
    })

    setDatosOcupacion({
      etiquetas,
      datos: datosOcupacionTemp,
    })

    const serviciosMasSolicitados = servicios
      .map((servicio) => ({
        nombre: servicio.nombre,
        solicitudes: Math.floor(Math.random() * 50) + 1,
      }))
      .sort((a, b) => b.solicitudes - a.solicitudes)
      .slice(0, 5)

    setDatosServicios(serviciosMasSolicitados)
  }

  const calcularTotalIngresos = () => {
    return datosIngresos.datos ? datosIngresos.datos.reduce((sum, val) => sum + val, 0) : 0
  }

  const calcularTotalReservas = () => {
    return datosReservas.datos ? datosReservas.datos.reduce((sum, val) => sum + val, 0) : 0
  }

  const calcularOcupacionPromedio = () => {
    return datosOcupacion.datos
      ? (datosOcupacion.datos.reduce((sum, val) => sum + val, 0) / datosOcupacion.datos.length).toFixed(1)
      : 0
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reportes y Estadísticas</h1>

      <div className="mb-6">
        <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-1">
          Periodo
        </label>
        <select
          id="periodo"
          value={periodoSeleccionado}
          onChange={(e) => setPeriodoSeleccionado(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
        >
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
          <option value="año">Último año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Total de Ingresos</h2>
          <div className="text-3xl font-bold text-green-600">{calcularTotalIngresos().toFixed(2)} €</div>
          <div className="text-sm text-gray-500 mt-1">Durante el periodo seleccionado</div>
          <div className="mt-4 h-40 flex items-end space-x-2">
            {datosIngresos.datos &&
              datosIngresos.datos.map((valor, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-green-500 w-full"
                    style={{ height: `${(valor / Math.max(...datosIngresos.datos)) * 100}%` }}
                  ></div>
                  <div className="text-xs mt-1 text-gray-500">{datosIngresos.etiquetas[index]}</div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Reservas</h2>
          <div className="text-3xl font-bold text-blue-600">{calcularTotalReservas()}</div>
          <div className="text-sm text-gray-500 mt-1">Durante el periodo seleccionado</div>
          <div className="mt-4 h-40 flex items-end space-x-2">
            {datosReservas.datos &&
              datosReservas.datos.map((valor, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 w-full"
                    style={{ height: `${(valor / Math.max(...datosReservas.datos)) * 100}%` }}
                  ></div>
                  <div className="text-xs mt-1 text-gray-500">{datosReservas.etiquetas[index]}</div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Tasa de Ocupación</h2>
          <div className="text-3xl font-bold text-purple-600">{calcularOcupacionPromedio()}%</div>
          <div className="text-sm text-gray-500 mt-1">Promedio durante el periodo</div>
          <div className="mt-4 h-40 flex items-end space-x-2">
            {datosOcupacion.datos &&
              datosOcupacion.datos.map((valor, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="bg-purple-500 w-full" style={{ height: `${valor}%` }}></div>
                  <div className="text-xs mt-1 text-gray-500">{datosOcupacion.etiquetas[index]}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Servicios más solicitados</h2>
          <div className="space-y-4">
            {datosServicios.map((servicio, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm">{servicio.nombre}</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${(servicio.solicitudes / datosServicios[0].solicitudes) * 100}%` }}
                  ></div>
                </div>
                <div className="w-10 text-right text-sm ml-2">{servicio.solicitudes}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Habitaciones más reservadas</h2>
          <div className="space-y-4">
            {habitaciones.slice(0, 5).map((habitacion, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm">{habitacion.nombre}</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${Math.floor(Math.random() * 100)}%` }}></div>
                </div>
                <div className="w-10 text-right text-sm ml-2">{Math.floor(Math.random() * 50) + 5}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Resumen financiero</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Concepto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Este periodo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Periodo anterior
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Variación
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ingresos por reservas</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {calcularTotalIngresos().toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(calcularTotalIngresos() * 0.9).toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+10.0%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Ingresos por servicios
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(calcularTotalIngresos() * 0.3).toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(calcularTotalIngresos() * 0.25).toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+20.0%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Gastos operativos</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(calcularTotalIngresos() * 0.4).toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(calcularTotalIngresos() * 0.45).toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">-11.1%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Beneficio neto</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {(calcularTotalIngresos() * 0.6).toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(calcularTotalIngresos() * 0.45).toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">+33.3%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

