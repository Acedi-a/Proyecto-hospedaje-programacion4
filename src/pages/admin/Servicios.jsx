import { useEffect, useState } from "react"
import { ServicioFiltroBusqueda } from "../../components/admin/Servicios/ServicioFiltroBusqueda"
import { ServicioTabla } from "../../components/admin/Servicios/ServicioTabla"
import { ServicioFormulario } from "../../components/admin/Servicios/ServicioFormulario"
import { serviciosData } from "../../data/servicios"




export const AdminServicios = () => {
  const [listaServicios, setListaServicios] = useState([])
  const [filtro, setFiltro] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)
  const [servicioEditando, setServicioEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    setListaServicios(serviciosData)
    setTimeout(() => setCargando(false), 500)
  }, [serviciosData])

  const serviciosFiltrados = listaServicios
    .filter((servicio) => {
      if (filtro === "disponibles") return servicio.disponible
      if (filtro === "no-disponibles") return !servicio.disponible
      return true
    })
    .filter((servicio) => {
      const termino = busqueda.toLowerCase()
      return (
        servicio.nombre.toLowerCase().includes(termino) ||
        servicio.descripcion.toLowerCase().includes(termino)
      )
    })

  const cambiarDisponibilidad = (id) => {
    setListaServicios((prev) =>
      prev.map((servicio) =>
        servicio.id === id
          ? { ...servicio, disponible: !servicio.disponible }
          : servicio
      )
    )
  }

  const eliminarServicio = (id) => {
    if (confirm("¿Deseas eliminar este servicio?")) {
      setListaServicios((prev) => prev.filter((servicio) => servicio.id !== id))
    }
  }

  const editarServicio = (servicio) => {
    setServicioEditando(servicio)
    setMostrarFormulario(true)
  }

  const crearNuevoServicio = () => {
    setServicioEditando({
      id: "", 
      nombre: "",
      descripcion: "",
      imagen: "/placeholder.svg?height=200&width=300",
      icono: null,
      precio: 0,
      duracion: 0,
      categoria: "general",
      disponible: true,
      solicitudes: 0,
      ultimaActualizacion: new Date(),
    })
    setMostrarFormulario(true)
  }

  const guardarNuevoServicio = (e) => {
    e.preventDefault()
    setListaServicios((prev) => [...prev, servicioEditando])
    cerrarFormulario()
  }

  const guardarServicio = (e) => {
    e.preventDefault()
    setListaServicios((prev) =>
      prev.map((servicio) =>
        servicio.id === servicioEditando.id ? servicioEditando : servicio
      )
    )
    cerrarFormulario()
  }

  const cerrarFormulario = () => {
    setServicioEditando(null)
    setMostrarFormulario(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administrar Servicios</h1>

      {cargando ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <ServicioFiltroBusqueda
              filtro={filtro}
              setFiltro={setFiltro}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
            />
            <div className="text-right">
              <span className="block text-sm font-medium text-gray-700 mb-1">Total</span>
              <span className="text-2xl font-bold">{serviciosFiltrados.length}</span>
            </div>          
          </div>

          <div className="mb-4 text-right">
            <button
              onClick={crearNuevoServicio}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Crear Servicio
            </button>
          </div>

          <ServicioTabla
            servicios={serviciosFiltrados}
            cambiarDisponibilidad={cambiarDisponibilidad}
            editarServicio={editarServicio}
            eliminarServicio={eliminarServicio}
          />
        </>
      )}

      {mostrarFormulario && servicioEditando && (
        <ServicioFormulario
          servicioEditando={servicioEditando}
          setServicioEditando={setServicioEditando}
          guardar={servicioEditando.id ? guardarServicio : guardarNuevoServicio}
          cancelar={cerrarFormulario}
        />
      )}
    </div>
  )
}
