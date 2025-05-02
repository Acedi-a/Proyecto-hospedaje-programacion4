import { useState, useEffect } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { CardCalificacion } from "../../components/user/CardCalificacion"
import { db } from "../../data/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

export const Calificaciones = () => {
  // Estado inicial del tab: por defecto "Todas las Opiniones" si no hay usuario, se ajustará en useEffect
  const [activeTab, setActiveTab] = useState("todas-calificaciones");
  const [misCalificaciones, setMisCalificaciones] = useState([]);
  const [todasCalificaciones, setTodasCalificaciones] = useState([]);
  const [loadingMis, setLoadingMis] = useState(false);
  const [loadingTodas, setLoadingTodas] = useState(false);
  const { userData } = useOutletContext();

  // Efecto para cargar las calificaciones
  useEffect(() => {
    const fetchTodasCalificaciones = async () => {
      setLoadingTodas(true);
      try {
        const snapshotTodas = await getDocs(collection(db, "reseñas"));
        const datosTodas = snapshotTodas.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTodasCalificaciones(datosTodas);
      } catch (error) {
        console.error("Error al obtener todas las calificaciones:", error);
      } finally {
        setLoadingTodas(false);
      }
    };

    const fetchMisCalificaciones = async (userId) => {
      if (!userId) {
        setMisCalificaciones([]); // Clear previous user ratings if logged out
        return;
      }

      setLoadingMis(true);
      try {
        const qMis = query(collection(db, "reseñas"), where("usuarioId", "==", userId));
        const snapshotMis = await getDocs(qMis);
        const datosMis = snapshotMis.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMisCalificaciones(datosMis);
      } catch (error) {
        console.error("Error al obtener mis calificaciones:", error);
      } finally {
        setLoadingMis(false);
      }
    };

    // Siempre cargamos todas las calificaciones
    fetchTodasCalificaciones();

    // Si hay un usuario logueado, también cargamos sus calificaciones
    if (userData?.uid) {
      fetchMisCalificaciones(userData.uid);
    } else {
      // Si no hay usuario, aseguramos que 'Mis Calificaciones' esté vacío
      setMisCalificaciones([]);
    }


  }, [userData?.uid]); // Dependencia en userData.uid para recargar si cambia el usuario


  // Efecto para ajustar la pestaña activa inicial o al cambiar el usuario
  useEffect(() => {
    if (userData?.uid) {
      setActiveTab("mis-calificaciones"); // Si hay usuario, por defecto "Mis Calificaciones"
    } else {
      setActiveTab("todas-calificaciones"); // Si no hay usuario, por defecto "Todas las Opiniones"
    }
  }, [userData?.uid]); // Dependencia en userData.uid para ajustar al cambiar el usuario

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calificaciones</h1>
          <p className="text-gray-500 mt-1">Revisa tus calificaciones y las opiniones de otros huéspedes</p>
        </div>
        {userData?.uid && (
          <Link to="/calificaciones/nueva">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
              Nueva Calificación
            </button>
          </Link>
        )}
        
      </div>

      <div className="mb-8">
        <div className="border-b">
          <nav className="flex -mb-px">
            {/* Mostrar "Mis Calificaciones" solo si hay un usuario logueado */}
            {userData?.uid && (
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === "mis-calificaciones"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                onClick={() => setActiveTab("mis-calificaciones")}
              >
                Mis Calificaciones
              </button>
            )}
            {/* Mostrar "Todas las Opiniones" siempre */}
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === "todas-calificaciones"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("todas-calificaciones")}
            >
              Todas las Opiniones
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de las calificaciones */}
      {(activeTab === "mis-calificaciones" && loadingMis) || (activeTab === "todas-calificaciones" && loadingTodas) ? (
        <p className="text-center text-gray-500">Cargando calificaciones...</p>
      ) : activeTab === "mis-calificaciones" ? (
        // Contenido para "Mis Calificaciones"
        misCalificaciones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No has realizado ninguna calificación todavía.</p>
            <Link to="/calificaciones/nueva">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                Calificar una Estancia
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {misCalificaciones.map((calificacion) => (
              <CardCalificacion key={calificacion.id} calificacion={calificacion} esMia={true} />
            ))}
          </div>
        )
      ) : (
        // Contenido para "Todas las Opiniones"
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {todasCalificaciones.map((calificacion) => (
            <CardCalificacion key={calificacion.id} calificacion={calificacion} esMia={false} />
          ))}
        </div>
      )}
    </div>
  );
};