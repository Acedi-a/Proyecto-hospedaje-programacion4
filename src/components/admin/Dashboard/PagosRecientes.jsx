import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../../data/firebase";

export const RecentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const pagosRef = collection(db, "Pagos");
        const q = query(pagosRef, orderBy("fechaPago", "desc"), limit(3)); // Ordenar por fecha de pago descendente y limitar a 3
        const querySnapshot = await getDocs(q);

        const pagosData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Formatea la fecha para visualización
          const fechaPago = data.fechaPago?.toDate();
          const fechaStr = fechaPago
            ? `${fechaPago.getDate()} ${fechaPago.toLocaleDateString('es-ES', { month: 'short' })} ${fechaPago.getFullYear()}`
            : "Fecha no disponible";

          pagosData.push({
            id: doc.id,
            cliente: data.resumenReserva?.cliente || "Cliente sin nombre",
            reserva: data.idreserva || "Sin ID de reserva",
            fecha: fechaStr,
            monto: data.total ? `Bs. ${data.total}` : "Bs.0",
            metodo: data.metodoPago || "No especificado"
          });
        });

        setPayments(pagosData);
      } catch (error) {
        console.error("Error al obtener pagos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Cargando pagos recientes...</div>;
  }

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Pagos Recientes</h2>
        <p className="text-sm text-gray-500">Últimos pagos registrados en el sistema</p>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{pago.cliente}</div>
                    <div className="text-sm text-gray-500">
                      {pago.reserva?.substring(0, 8)} • {pago.fecha}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{pago.metodo}</div>
                  <div className="font-medium">{pago.monto}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No hay pagos recientes</div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link to="/admin/pagos">
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Ver todos los pagos
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
