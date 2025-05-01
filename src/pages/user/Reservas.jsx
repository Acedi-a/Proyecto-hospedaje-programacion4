import { useState, useEffect } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { CardReserva } from "../../components/user/CardReserva"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db } from "../../data/firebase"
import { toast, ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'

export const Reservas = () => {
  const [activeTab, setActiveTab] = useState("activas")
  const [reservasUser, setReservasUser] = useState([])
  const { userData } = useOutletContext()
  const [loading, setLoading] = useState(true)

  const fetchReservas = async () => {
    if (!userData?.uid) return;

    try {
      setLoading(true)
      const q = query(collection(db, "Reservas"), where("idusuario", "==", userData.uid));
      const snapshot = await getDocs(q);

      const reservas = await Promise.all(snapshot.docs.map(async (reservaDoc) => { // <-- Aquí cambiamos 'doc' a 'reservaDoc'
        const data = reservaDoc.data(); // Usamos reservaDoc
        const reservaId = reservaDoc.id; // Usamos reservaDoc para el ID de la reserva

        // Obtener pago correspondiente a esta reserva
        // Aquí 'doc' dentro de where("idreserva", "==", doc.id) se refería a la variable local del map, ahora 'reservaId'
        const qPago = query(collection(db, "Pagos"), where("idreserva", "==", reservaId)); // Usamos reservaId
        const snapshotPago = await getDocs(qPago);
        const pagoDoc = snapshotPago.docs.length > 0 ? snapshotPago.docs[0] : null;

        // Obtener habitación correspondiente a esta reserva
        let habitacionData = null;
        console.log("Datos habitacion: ", data.habitacionId);
        if (data.habitacionId) {
          console.log("Habitación ID:", data.habitacionId);
          // *** Aquí 'doc' ahora se refiere a la función importada de Firestore, sin conflicto ***
          const habitacionRef = doc(db, "Habitaciones", data.habitacionId);
          const habitacionSnap = await getDoc(habitacionRef);
          if (habitacionSnap.exists()) {
            habitacionData = habitacionSnap.data();
          }
          // ***********************************************************************************
        }

        let montoPago = null;
        if (pagoDoc) {
          const pagoData = pagoDoc.data();
          montoPago = pagoData.total;
        }

        return {
          id: reservaId, // Usamos reservaId
          ...data,
          fechaInicio: data.fechaInicio.toDate().toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          }),
          fechaFin: data.fechaFin.toDate().toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          }),
          monto: montoPago,
          habitacion: habitacionData // Añadimos los datos de la habitación aquí
        };
      }));

      setReservasUser(reservas);
    } catch (error) {
      console.error("Error al obtener reservas, pagos y habitaciones:", error);
      toast.error("Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [userData?.uid]);

  const handleReservaUpdated = () => {
    fetchReservas();
  };

  const reservasActivas = reservasUser.filter((r) => r.estado === "confirmada" || r.estado === "pendiente")
  const reservasHistoricas = reservasUser.filter((r) => r.estado === "completada" || r.estado === "cancelada")

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis Reservas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus reservas actuales e históricas</p>
        </div>
        <Link
          to="/reservas/nueva"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Nueva Reserva
        </Link>
      </div>

      <div className="mb-8">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === "activas"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("activas")}
            >
              Reservas Activas
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === "historicas"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("historicas")}
            >
              Historial de Reservas
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando reservas...</p>
        </div>
      ) : (
        <>
          {activeTab === "activas" && (
            <>
              {reservasActivas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No tienes reservas activas en este momento.</p>
                  <Link
                    to="/reservas/nueva"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    Hacer una Reserva
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reservasActivas.map((reserva) => (
                    <CardReserva
                      key={reserva.id}
                      reserva={reserva}
                      onReservaUpdated={handleReservaUpdated}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "historicas" && (
            <>
              {reservasHistoricas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No tienes reservas históricas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reservasHistoricas.map((reserva) => (
                    <CardReserva
                      key={reserva.id}
                      reserva={reserva}
                      historica={true}
                      onReservaUpdated={handleReservaUpdated}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}