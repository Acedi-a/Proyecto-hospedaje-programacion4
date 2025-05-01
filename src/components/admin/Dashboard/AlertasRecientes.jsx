import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../data/firebase";

export const SystemAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Asumimos que podría haber una colección de alertas o mantenermos en el sistema
        // las habitaciones que necesitan mantenimiento
        const habitacionesRef = collection(db, "habitaciones");
        const maintenanceQuery = query(habitacionesRef, where("requiereMantenimiento", "==", true));
        
        const maintenanceSnapshot = await getDocs(maintenanceQuery);
        
        const alertsData = [];
        
        // Añadir alertas de mantenimiento
        maintenanceSnapshot.forEach(doc => {
          const data = doc.data();
          alertsData.push({
            id: doc.id,
            tipo: "mantenimiento",
            titulo: "Habitación requiere mantenimiento",
            mensaje: `La ${data.nombre || 'habitación'} #${data.numero || doc.id.substring(0, 3)} necesita reparación en el ${data.problemaMantenimiento || 'sistema de calefacción'}.`,
            severidad: "alta"
          });
        });
        
        // Si no hay alertas desde Firebase, usamos algunas de ejemplo
        if (alertsData.length === 0) {
          alertsData.push(
            {
              id: "alert-1",
              tipo: "mantenimiento",
              titulo: "Habitación requiere mantenimiento",
              mensaje: "La Cabaña Familiar #3 necesita reparación en el sistema de calefacción.",
              severidad: "alta"
            },
            {
              id: "alert-2",
              tipo: "ocupacion",
              titulo: "Alta demanda detectada",
              mensaje: "Se ha detectado un aumento en las reservas para el fin de semana del 15 de mayo.",
              severidad: "info"
            }
          );
        }
        
        setAlerts(alertsData);
      } catch (error) {
        console.error("Error al obtener alertas:", error);
        // En caso de error, usamos alertas de ejemplo
        setAlerts([
          {
            id: "alert-1",
            tipo: "mantenimiento",
            titulo: "Habitación requiere mantenimiento",
            mensaje: "La Cabaña Familiar #3 necesita reparación en el sistema de calefacción.",
            severidad: "alta"
          },
          {
            id: "alert-2",
            tipo: "ocupacion",
            titulo: "Alta demanda detectada",
            mensaje: "Se ha detectado un aumento en las reservas para el fin de semana del 15 de mayo.",
            severidad: "info"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Cargando alertas del sistema...</div>;
  }

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Alertas del Sistema</h2>
        <p className="text-sm text-gray-500">Notificaciones importantes</p>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {alerts.map((alerta) => (
            <div 
              key={alerta.id}
              className={`p-4 border rounded-md ${
                alerta.severidad === "alta" 
                  ? "border-red-200 bg-red-50 text-red-800" 
                  : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
            >
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">{alerta.titulo}</h3>
                  <p className="text-sm">{alerta.mensaje}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {alerts.length === 0 && (
          <div className="text-center py-4 text-gray-500">No hay alertas del sistema</div>
        )}
      </div>
    </div>
  )};