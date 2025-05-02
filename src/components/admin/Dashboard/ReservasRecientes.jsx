import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "../../../data/firebase";

export const RecentReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservasRef = collection(db, "Reservas");
        const q = query(reservasRef, orderBy("fechaInicio", "desc"), limit(4)); // Ordena por fechaInicio descendente
        const querySnapshot = await getDocs(q);

        const reservasData = [];

        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();

          // Obtener los datos de la habitación usando habitacionId
          let habitacionNombre = "Habitación sin especificar";
          if (data.habitacionId) {
            const habitacionDoc = await getDoc(doc(db, "Habitaciones", data.habitacionId));
            if (habitacionDoc.exists()) {
              habitacionNombre = habitacionDoc.data().nombre || habitacionNombre;
            }
          }

          // Obtener el nombre y apellido del usuario usando idusuario
          let clienteNombre = "Cliente sin nombre";
          if (data.idusuario) {
            const usuarioDoc = await getDoc(doc(db, "usuarios", data.idusuario));
            if (usuarioDoc.exists()) {
              const usuarioData = usuarioDoc.data();
              const nombre = usuarioData.nombre || "Nombre no disponible";
              const apellido = usuarioData.apellido || "Apellido no disponible";
              clienteNombre = `${nombre} ${apellido}`.toUpperCase();
            }
          }

          const fechaInicio = data.fechaInicio?.toDate?.();
          const fechaFin = data.fechaFin?.toDate?.();
          const fechasStr =
            fechaInicio && fechaFin
              ? `${fechaInicio.getDate()} ${fechaInicio.toLocaleDateString("es-ES", { month: "short" })} - ${fechaFin.getDate()} ${fechaFin.toLocaleDateString("es-ES", { month: "short" })} ${fechaFin.getFullYear()}`
              : "Fechas no disponibles";

          // Calcular el monto total
          let montoTotal = 0;
          if (data.habitacionId) {
            const habitacionDoc = await getDoc(doc(db, "Habitaciones", data.habitacionId));
            if (habitacionDoc.exists()) {
              const precioHabitacion = habitacionDoc.data().precio || 0;
              const diasEstadia = fechaFin && fechaInicio
                ? Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24))
                : 0;
              montoTotal += precioHabitacion * diasEstadia;
            }
          }

          // Sumar los servicios adicionales
          if (data.idserviciosadicionales && Array.isArray(data.idserviciosadicionales)) {
            montoTotal += data.idserviciosadicionales.reduce((sum, servicio) => sum + (servicio.precio || 0), 0);
          }

          reservasData.push({
            id: docSnapshot.id,
            cliente: clienteNombre,
            habitacion: habitacionNombre,
            fechas: fechasStr,
            estado: data.estado || "pendiente",
            monto: montoTotal > 0 ? `Bs. ${montoTotal}` : "Monto no disponible",
            comentarios: data.comentariosAdicionales || null,
          });
        }

        setReservations(reservasData);
      } catch (error) {
        console.error("Error al obtener reservas:", error);
        alert("Hubo un error al cargar las reservas: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Cargando reservas recientes...</div>;
  }

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Reservas Recientes</h2>
        <p className="text-sm text-gray-500">Últimas reservas realizadas en el sistema</p>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {reservations.length > 0 ? (
            reservations.map((reserva) => (
              <div key={reserva.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{reserva.cliente}</div>
                    <div className="text-sm text-gray-500">
                      {reserva.habitacion} • {reserva.fechas}
                    </div>
                    {reserva.comentarios && (
                      <div className="text-xs text-gray-500 italic">
                        "{reserva.comentarios.length > 50
                          ? reserva.comentarios.substring(0, 50) + "..."
                          : reserva.comentarios}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reserva.estado === "confirmada"
                        ? "bg-green-100 text-green-800"
                        : reserva.estado === "pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                  </span>
                  <div className="font-medium">{reserva.monto}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No hay reservas recientes</div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link to="/admin/listar-reservas">
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Ver todas las reservas
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
