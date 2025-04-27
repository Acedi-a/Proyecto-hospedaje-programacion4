import { Link } from "react-router-dom"
import { ArrowUpRight, BedDouble, Calendar, CreditCard, DollarSign, Star, Users, AlertCircle } from "lucide-react"

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
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
            Nueva Habitación
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-sm">Reservas Activas</span>
                <span className="text-3xl font-bold">24</span>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>12% más que el mes pasado</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-sm">Ingresos Mensuales</span>
                <span className="text-3xl font-bold">$12,450</span>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>8% más que el mes pasado</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-sm">Ocupación</span>
                <span className="text-3xl font-bold">78%</span>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <BedDouble className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>5% más que el mes pasado</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-sm">Calificación Promedio</span>
                <span className="text-3xl font-bold">4.8</span>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Star className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>0.2 más que el mes pasado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Reservas Recientes</h2>
              <p className="text-sm text-gray-500">Últimas reservas realizadas en el sistema</p>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  {
                    id: "RES-2345",
                    cliente: "María González",
                    habitacion: "Cabaña Familiar",
                    fechas: "15 May - 20 May 2025",
                    estado: "confirmada",
                    monto: "$450",
                  },
                  {
                    id: "RES-2344",
                    cliente: "Carlos Rodríguez",
                    habitacion: "Suite Deluxe",
                    fechas: "10 Jun - 15 Jun 2025",
                    estado: "pendiente",
                    monto: "$350",
                  },
                  {
                    id: "RES-2343",
                    cliente: "Ana Martínez",
                    habitacion: "Habitación Estándar",
                    fechas: "5 May - 8 May 2025",
                    estado: "confirmada",
                    monto: "$180",
                  },
                  {
                    id: "RES-2342",
                    cliente: "Juan Pérez",
                    habitacion: "Suite Deluxe",
                    fechas: "1 May - 3 May 2025",
                    estado: "completada",
                    monto: "$240",
                  },
                ].map((reserva) => (
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
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link to="/admin/reservas">
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Ver todas las reservas
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Pagos Recientes</h2>
              <p className="text-sm text-gray-500">Últimos pagos registrados en el sistema</p>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  {
                    id: "PAG-1234",
                    cliente: "María González",
                    reserva: "RES-2345",
                    fecha: "10 Abr 2025",
                    monto: "$450",
                    metodo: "Tarjeta de Crédito",
                  },
                  {
                    id: "PAG-1233",
                    cliente: "Juan Pérez",
                    reserva: "RES-2342",
                    fecha: "1 Abr 2025",
                    monto: "$240",
                    metodo: "Transferencia",
                  },
                  {
                    id: "PAG-1232",
                    cliente: "Laura Sánchez",
                    reserva: "RES-2340",
                    fecha: "28 Mar 2025",
                    monto: "$320",
                    metodo: "PayPal",
                  },
                ].map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{pago.cliente}</div>
                        <div className="text-sm text-gray-500">
                          {pago.reserva} • {pago.fecha}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">{pago.metodo}</div>
                      <div className="font-medium">{pago.monto}</div>
                    </div>
                  </div>
                ))}
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
        </div>

        <div className="space-y-8">
          <div className="border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Reseñas Recientes</h2>
              <p className="text-sm text-gray-500">Últimas calificaciones de los huéspedes</p>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  {
                    cliente: "Carlos Rodríguez",
                    habitacion: "Suite Deluxe",
                    fecha: "2 Abr 2025",
                    puntuacion: 5,
                    comentario: "Excelente servicio y atención. Las instalaciones son impecables.",
                  },
                  {
                    cliente: "Ana Martínez",
                    habitacion: "Habitación Estándar",
                    fecha: "28 Mar 2025",
                    puntuacion: 4,
                    comentario: "Muy buena experiencia. El desayuno podría mejorar.",
                  },
                  {
                    cliente: "Juan Pérez",
                    habitacion: "Cabaña Familiar",
                    fecha: "25 Mar 2025",
                    puntuacion: 5,
                    comentario: "Increíble lugar para descansar en familia. Volveremos pronto.",
                  },
                ].map((reseña, index) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{reseña.cliente}</div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < reseña.puntuacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {reseña.habitacion} • {reseña.fecha}
                    </div>
                    <p className="text-sm">{reseña.comentario}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link to="/admin/calificaciones">
                  <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Ver todas las reseñas
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Alertas del Sistema</h2>
              <p className="text-sm text-gray-500">Notificaciones importantes</p>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Habitación requiere mantenimiento</h3>
                      <p className="text-sm">La Cabaña Familiar #3 necesita reparación en el sistema de calefacción.</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-blue-200 rounded-md bg-blue-50 text-blue-800">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Alta demanda detectada</h3>
                      <p className="text-sm">
                        Se ha detectado un aumento en las reservas para el fin de semana del 15 de mayo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

