import React, { useEffect, useState } from "react";
import { db } from "../../data/firebase";
import { collection, getDocs, query, where, Timestamp, orderBy } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const AdminReportes = () => {
  // Estados para datos
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para filtros
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("ultimo-mes");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  // Estados para resumen
  const [totalPagos, setTotalPagos] = useState(0);
  const [resumenMetodosPago, setResumenMetodosPago] = useState([]);
  
  // Estados para gráficos
  const [datosPorDia, setDatosPorDia] = useState([]);

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Establecer período inicial
  useEffect(() => {
    establecerPeriodo("ultimo-mes");
  }, []);

  // Cargar datos cuando cambian las fechas
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarPagos();
    }
  }, [fechaInicio, fechaFin]);

  // Función para establecer período
  const establecerPeriodo = (periodo) => {
    const hoy = new Date();
    let inicio, fin;
    
    switch(periodo) {
      case "ultimo-mes":
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        fin = new Date(hoy);
        break;
      case "mes-actual":
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fin = new Date(hoy);
        break;
      case "mes-anterior":
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        break;
      default:
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        fin = new Date(hoy);
    }
    
    setFechaInicio(inicio.toISOString().split('T')[0]);
    setFechaFin(fin.toISOString().split('T')[0]);
  };

  // Cargar pagos desde Firestore
  const cargarPagos = async () => {
    setLoading(true);
    
    try {
      const fechaInicioTS = Timestamp.fromDate(new Date(fechaInicio));
      const fechaFinTS = Timestamp.fromDate(new Date(new Date(fechaFin).setHours(23, 59, 59)));
      
      const pagosRef = collection(db, "Pagos");
      const pagosQuery = query(
        pagosRef,
        where("fechaPago", ">=", fechaInicioTS),
        where("fechaPago", "<=", fechaFinTS),
        orderBy("fechaPago", "desc")
      );
      
      const snapshot = await getDocs(pagosQuery);
      const pagosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        total: parseFloat(doc.data().total) || 0
      }));
      
      setPagos(pagosData);
      calcularResumenes(pagosData);
      
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular resúmenes estadísticos
  const calcularResumenes = (pagosData) => {
    // Calcular total general
    const total = pagosData.reduce((sum, pago) => sum + pago.total, 0);
    setTotalPagos(total);
    
    // Calcular por método de pago
    const metodos = pagosData.reduce((acc, pago) => {
      const metodo = pago.metodoPago || 'Desconocido';
      if (!acc[metodo]) {
        acc[metodo] = { metodo, total: 0, cantidad: 0 };
      }
      acc[metodo].total += pago.total;
      acc[metodo].cantidad += 1;
      return acc;
    }, {});
    
    setResumenMetodosPago(Object.values(metodos));
    
    // Calcular por día para gráfico
    const porDia = pagosData.reduce((acc, pago) => {
      if (!pago.fechaPago) return acc;
      
      const fecha = pago.fechaPago.toDate().toISOString().split('T')[0];
      if (!acc[fecha]) {
        acc[fecha] = { fecha, total: 0, cantidad: 0 };
      }
      acc[fecha].total += pago.total;
      acc[fecha].cantidad += 1;
      return acc;
    }, {});
    
    setDatosPorDia(Object.values(porDia).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));
  };

  // Formatear moneda
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'Bs'
    }).format(valor);
  };

  // Manejar cambio de período
  const cambiarPeriodo = (e) => {
    const periodo = e.target.value;
    setPeriodoSeleccionado(periodo);
    establecerPeriodo(periodo);
  };

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Reporte de Pagos</h2>
      
      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            value={periodoSeleccionado}
            onChange={cambiarPeriodo}
            className="w-full md:w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ultimo-mes">Último mes</option>
            <option value="mes-actual">Mes actual</option>
            <option value="mes-anterior">Mes anterior</option>
            <option value="personalizado">Personalizado</option>
          </select>
          
          {periodoSeleccionado === "personalizado" && (
            <>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Resumen estadístico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total de pagos */}
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm mb-1">Total Recaudado</h3>
              <div className="text-3xl font-bold text-blue-600">
                {formatoMoneda(totalPagos)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'} registrados
              </p>
            </div>
            
            {/* Métodos de pago más usados */}
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm mb-1">Método de Pago Principal</h3>
              {resumenMetodosPago.length > 0 ? (
                <>
                  <div className="text-3xl font-bold text-green-600">
                    {resumenMetodosPago[0].metodo}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {resumenMetodosPago[0].cantidad} transacciones ({formatoMoneda(resumenMetodosPago[0].total)})
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No hay datos</p>
              )}
            </div>
            
            {/* Promedio por pago */}
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-purple-500">
              <h3 className="text-gray-500 text-sm mb-1">Promedio por Pago</h3>
              <div className="text-3xl font-bold text-purple-600">
                {pagos.length > 0 ? formatoMoneda(totalPagos / pagos.length) : formatoMoneda(0)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {pagos.length > 0 ? 'Basado en todos los pagos' : 'No hay pagos registrados'}
              </p>
            </div>
          </div>
          
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de pagos por día */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Pagos por Día</h3>
              <div className="h-80">
                {datosPorDia.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fecha" 
                        angle={-45} 
                        textAnchor="end"
                        height={60}
                        tickFormatter={(fecha) => new Date(fecha).toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatoMoneda(value), 'Total']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'})}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#4C51BF" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No hay datos para mostrar
                  </div>
                )}
              </div>
            </div>
            
            {/* Gráfico de métodos de pago */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Distribución por Método de Pago</h3>
              <div className="h-80">
                {resumenMetodosPago.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resumenMetodosPago}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="metodo"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {resumenMetodosPago.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatoMoneda(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No hay datos para mostrar
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabla detallada */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Detalle de Pagos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.length > 0 ? (
                    pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {pago.fechaPago?.toDate().toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {pago.metodoPago || 'Desconocido'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatoMoneda(pago.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron pagos para el período seleccionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};