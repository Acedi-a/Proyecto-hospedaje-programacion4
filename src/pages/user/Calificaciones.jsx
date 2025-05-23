import { useState, useEffect } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { CardCalificacion } from "../../components/user/CardCalificacion"
import { db } from "../../data/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

export const Calificaciones = () => {
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
        setMisCalificaciones([]);
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

    fetchTodasCalificaciones();

    if (userData?.uid) {
      fetchMisCalificaciones(userData.uid);
    } else {
      setMisCalificaciones([]);
    }


  }, [userData?.uid]); 


  useEffect(() => {
    if (userData?.uid) {
      setActiveTab("mis-calificaciones"); 
    } else {
      setActiveTab("todas-calificaciones"); 
    }
  }, [userData?.uid]);

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