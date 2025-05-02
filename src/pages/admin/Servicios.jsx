import { useEffect, useState } from "react"
import { serviciosData } from "../../data/servicios"
import { ServicioFiltroBusqueda } from "../../components/admin/servicios/ServicioFiltroBusqueda"
import { ServicioTabla } from "../../components/admin/servicios/ServicioTabla"
import { ServicioFormulario } from "../../components/admin/servicios/ServicioFormulario"
import { db } from '../../data/firebase'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { supabase } from '../../data/SupabaseClient'

export const AdminServicios = () => {
  const [listaServicios, setListaServicios] = useState([])
  const [filtro, setFiltro] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)
  const [servicioEditando, setServicioEditando] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    const refServicios = collection(db, "Servicios")
    const unsubscribe = onSnapshot(refServicios, (snapshot) => {
      const serviciosFirestore = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setListaServicios(serviciosFirestore)
      setCargando(false)
    })
  
    return () => unsubscribe()
  }, [])
  
  // Función para subir imagen a Supabase
  const subirImagen = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `servicios/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('imagenes')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('imagenes')
      .getPublicUrl(fileName)

    return { ruta: fileName, url: publicUrl }
  }

  // Función para eliminar imagen de Supabase
  const eliminarImagen = async (rutaImagen) => {
    if (!rutaImagen) return
    const { error } = await supabase.storage
      .from('imagenes')
      .remove([rutaImagen])
    if (error) console.error("Error al eliminar imagen:", error)
  }

  const serviciosFiltrados = listaServicios
    .filter((servicio) => {
      if (filtro === "disponibles") return servicio.estado === true
      if (filtro === "no-disponibles") return servicio.estado === false
      return true 
    })
    .filter((servicio) => {
      const termino = busqueda.toLowerCase()
      return (
        servicio.nombre.toLowerCase().includes(termino) ||
        servicio.descripcion.toLowerCase().includes(termino)
      )
    })

  const cambiarDisponibilidad = async (id) => {
    try {
      const ref = doc(db, "Servicios", id)
      const servicio = listaServicios.find((s) => s.id === id)
      await updateDoc(ref, { estado: !servicio.estado })
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error)
    }
  }

  const eliminarServicio = async (id) => {
    if (confirm("¿Deseas eliminar este servicio?")) {
      try {
        
        const servicio = listaServicios.find(s => s.id === id)
        
        if (servicio?.imagenRuta) {
          await eliminarImagen(servicio.imagenRuta)
        }
        
        await deleteDoc(doc(db, "Servicios", id))
      } catch (error) {
        console.error("Error al eliminar el servicio:", error)
      }
    }
  }

  const editarServicio = (servicio) => {
    setServicioEditando(servicio)
    setMostrarFormulario(true)
  }

  const crearNuevoServicio = () => {
    setServicioEditando({
      nombre: "",
      descripcion: "",
      precio: 0,
      categoria: "general",
      estado: true,
      imagenRuta: "",
      imagenUrl: ""
    })
    setMostrarFormulario(true)
  }

  const guardarNuevoServicio = async (servicioConImagen) => {
    try {
      await addDoc(collection(db, "Servicios"), {
        ...servicioConImagen
      })
      cerrarFormulario()
    } catch (error) {
      console.error("Error al crear el servicio:", error)
      throw error
    }
  }

  const guardarServicio = async (servicioConImagen) => {
    try {
      const { id, ...resto } = servicioConImagen
      const ref = doc(db, "Servicios", id)
      await updateDoc(ref, {
        ...resto
      })
      cerrarFormulario()
    } catch (error) {
      console.error("Error al actualizar el servicio:", error)
      throw error
    }
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-opacity-50"></div>
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
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-green-700"
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
        subirImagen={subirImagen}
        eliminarImagen={eliminarImagen}
        />
      )}
    </div>
  )
}