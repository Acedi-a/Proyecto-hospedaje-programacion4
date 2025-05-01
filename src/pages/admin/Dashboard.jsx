import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { StatsCards } from "../../components/admin/Dashboard/Stats";
import { RecentReservations } from "../../components/admin/Dashboard/ReservasRecientes";
import { RecentPayments } from "../../components/admin/Dashboard/PagosRecientes";
import { RecentReviews } from "../../components/admin/Dashboard/ResenasRecientes";
import { SystemAlerts } from "../../components/admin/Dashboard/AlertasRecientes";

export const AdminDashboard = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Bienvenido al panel de administración</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Descargar Reporte
          </button>
          <Link to="/admin/habitaciones/nueva">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
              Nueva Habitación
            </button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Reservas Recientes */}
          <RecentReservations />

          {/* Pagos Recientes */}
          <RecentPayments />
        </div>

        <div className="space-y-8">
          {/* Reseñas Recientes */}
          <RecentReviews />

          {/* Alertas del Sistema */}
          <SystemAlerts />
        </div>
      </div>
    </div>
  );
};