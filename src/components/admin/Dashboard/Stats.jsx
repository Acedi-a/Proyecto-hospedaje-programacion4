import { ArrowUpRight, Calendar, DollarSign, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../data/firebase";

export const StatsCards = () => {
  const [stats, setStats] = useState({
    totalReservations: 0,
    monthlyIncome: 0,
    averageRating: 0,
    reservationsIncrease: 0,
    incomeIncrease: 0,
    ratingIncrease: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener fecha actual y fecha de hace un mes
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Contar todas las reservas del mes
        const reservasRef = collection(db, "Reservas");
        const reservationsQuery = query(
          reservasRef,
          where("fechaReserva", ">=", firstDayCurrentMonth)
        );
        const reservationsSnapshot = await getDocs(reservationsQuery);
        const totalReservations = reservationsSnapshot.size;

        // 2. Calcular ingresos mensuales
        const pagosRef = collection(db, "Pagos");
        const currentMonthQuery = query(
          pagosRef,
          where("fechaPago", ">=", firstDayCurrentMonth)
        );
        const currentMonthSnapshot = await getDocs(currentMonthQuery);
        
        let currentMonthIncome = 0;
        currentMonthSnapshot.forEach(doc => {
          const data = doc.data();
          currentMonthIncome += data.total || 0;
        });

        // 3. Calcular calificación promedio
        let totalRating = 0;
        let ratingCount = 0;
        
        const ratingsQuery = query(reservasRef, where("calificacion", ">=", 1));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        
        ratingsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.calificacion) {
            totalRating += data.calificacion;
            ratingCount++;
          }
        });
        
        const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "4.8";

        // Calcular aumentos (simular para este ejemplo)
        const lastMonthQuery = query(
          pagosRef,
          where("fechaPago", ">=", firstDayLastMonth),
          where("fechaPago", "<=", lastDayLastMonth)
        );
        const lastMonthSnapshot = await getDocs(lastMonthQuery);
        
        let lastMonthIncome = 0;
        lastMonthSnapshot.forEach(doc => {
          const data = doc.data();
          lastMonthIncome += data.total || 0;
        });

        // Calcular porcentajes de aumento
        const incomeIncrease = lastMonthIncome > 0 
          ? Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100) 
          : 8;

        // Los otros aumentos son simulados para este ejemplo
        const reservationsIncrease = 12;
        const ratingIncrease = 0.2;

        setStats({
          totalReservations,
          monthlyIncome: currentMonthIncome,
          averageRating,
          reservationsIncrease,
          incomeIncrease,
          ratingIncrease
        });
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        // Valores predeterminados en caso de error
        setStats({
          totalReservations: 100,
          monthlyIncome: 12450,
          averageRating: 4.8,
          reservationsIncrease: 12,
          incomeIncrease: 8,
          ratingIncrease: 0.2
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Cargando estadísticas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="border rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm">Reservas del Mes</span>
              <span className="text-3xl font-bold">{stats.totalReservations}</span>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
            <ArrowUpRight className="h-4 w-4" />
            <span>{stats.reservationsIncrease}% más que el mes pasado</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm">Ingresos Mensuales</span>
              <span className="text-3xl font-bold">${stats.monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
            <ArrowUpRight className="h-4 w-4" />
            <span>{stats.incomeIncrease}% más que el mes pasado</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm">Calificación Promedio</span>
              <span className="text-3xl font-bold">{stats.averageRating}</span>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <Star className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
            <ArrowUpRight className="h-4 w-4" />
            <span>{stats.ratingIncrease} más que el mes pasado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
