import React, { useEffect, useState } from "react"; 
import { db } from "../../data/firebase";
import { collection, getDocs, query, where, Timestamp, orderBy } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';

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
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    establecerPeriodo("ultimo-mes");
  }, []);

  // Cargar datos cuando cambian las fechas
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarPagos();
    }
  }, [fechaInicio, fechaFin]);

  const establecerPeriodo = (periodo) => {
    const hoy = new Date();
    let inicio, fin;

    switch (periodo) {
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
      const fechaFinTS = Timestamp.fromDate(new Date(new Date(fechaFin).setHours(23, 59, 59, 999)));

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
        // Asegurarse de que total es un número
        total: parseFloat(doc.data().total) || 0,
        // Convertir la fecha de Timestamp a objeto Date para fácil manejo
        fechaPago: doc.data().fechaPago?.toDate()
      }));

      setPagos(pagosData);
      // Recalcular resúmenes y gráficos después de cargar los pagos
      calcularResumenes(pagosData);

    } catch (error) {
      console.error("Error al cargar pagos:", error);
      alert("Error al cargar los datos de pagos.");
    } finally {
      setLoading(false);
    }
  };

  // Calcular resúmenes estadísticos
  const calcularResumenes = (pagosData) => {
    const total = pagosData.reduce((sum, pago) => sum + pago.total, 0);
    setTotalPagos(total);

    // Calcular por método de pago
    const metodos = pagosData.reduce((acc, pago) => {
      // Asegurarse de que metodoPago exista antes de usarlo
      const metodo = pago.metodoPago || 'Desconocido';
      if (!acc[metodo]) {
        acc[metodo] = { metodo, total: 0, cantidad: 0 };
      }
      acc[metodo].total += pago.total;
      acc[metodo].cantidad += 1;
      return acc;
    }, {});

    // Convertir el objeto a un array y ordenar por total descendente
    setResumenMetodosPago(Object.values(metodos).sort((a, b) => b.total - a.total));

    const porDia = pagosData.reduce((acc, pago) => {
      if (!pago.fechaPago) return acc;

      const fecha = pago.fechaPago.toISOString().split('T')[0];
      if (!acc[fecha]) {
        acc[fecha] = { fecha, total: 0, cantidad: 0 };
      }
      acc[fecha].total += pago.total;
      acc[fecha].cantidad += 1;
      return acc;
    }, {});

    setDatosPorDia(Object.values(porDia).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));
  };

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'BOB' 
    }).format(valor);
  };

  const cambiarPeriodo = (e) => {
    const periodo = e.target.value;
    setPeriodoSeleccionado(periodo);
    if (periodo !== 'personalizado') {
        establecerPeriodo(periodo);
    }
  };

  const generatePdf = () => {
      const pdf = new jsPDF('p', 'mm', 'a4'); 
      let yPos = 15; 
      const margin = 14; 
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const bottomMargin = 15;

      // Título del reporte
      pdf.setFontSize(18);
      pdf.text("Reporte de Pagos", margin, yPos);
      yPos += 10;

      // Rango de fechas del reporte
      pdf.setFontSize(12);
      pdf.text(`Periodo: ${fechaInicio} al ${fechaFin}`, margin, yPos);
      yPos += 15;

      // Resumen estadístico
      pdf.setFontSize(14);
      pdf.text("Resumen:", margin, yPos);
      yPos += 7;

      pdf.setFontSize(12);
      pdf.text(`Total Recaudado: ${formatoMoneda(totalPagos)}`, margin, yPos);
      yPos += 7;

      pdf.text(`Cantidad de Pagos: ${pagos.length}`, margin, yPos);
      yPos += 7;

      if (resumenMetodosPago.length > 0) {
          const metodosSummary = resumenMetodosPago.map(m => `${m.metodo} (${formatoMoneda(m.total)})`).join(', ');
          pdf.text(`Distribución: ${metodosSummary}`, margin, yPos, { maxWidth: pageWidth - 2 * margin }); 
          yPos += 7 * (Math.ceil((`Distribución: ${metodosSummary}`.length / (pageWidth / 3)))); 
      } else {
           yPos += 7; 
      }

       pdf.text(`Promedio por Pago: ${pagos.length > 0 ? formatoMoneda(totalPagos / pagos.length) : formatoMoneda(0)}`, margin, yPos);
       yPos += 15;

       // Detalle de Pagos (Simulación de Tabla Manual)
       pdf.setFontSize(14);
       pdf.text("Detalle de Pagos:", margin, yPos);
       yPos += 10; 

       // Posiciones X para las columnas (ajustar según necesites)
       const colXDate = margin;
       const colXMethod = margin + 40; 
       const colXTotal = pageWidth - margin - 30; 

       pdf.setFontSize(10);
       pdf.text("Fecha", colXDate, yPos);
       pdf.text("Método", colXMethod, yPos);
       pdf.text("Total", colXTotal, yPos, { align: 'right' }); 
       yPos += 5; 

       pdf.line(margin, yPos, pageWidth - margin, yPos);
       yPos += 5; 

       pdf.setFontSize(9);
       const rowHeight = 6; 
       const maxRowY = pageHeight - bottomMargin; 

       pagos.forEach((pago, index) => {
           if (yPos + rowHeight > maxRowY) {
               pdf.addPage(); 
               yPos = margin + 15; 

               pdf.setFontSize(10);
               pdf.text("Fecha", colXDate, yPos);
               pdf.text("Método", colXMethod, yPos);
               pdf.text("Total", colXTotal, yPos, { align: 'right' });
               yPos += 5;
               pdf.line(margin, yPos, pageWidth - margin, yPos);
               yPos += 5;
               pdf.setFontSize(9); 
           }

           // Añadir datos de la fila actual
           const fechaStr = pago.fechaPago ? pago.fechaPago.toLocaleDateString('es-ES') : 'N/A';
           const metodoStr = pago.metodoPago || 'Desconocido';
           const totalStr = formatoMoneda(pago.total);

           pdf.text(fechaStr, colXDate, yPos);
           pdf.text(metodoStr, colXMethod, yPos);
           pdf.text(totalStr, colXTotal, yPos, { align: 'right' });

           yPos += rowHeight; // Mover a la siguiente fila
       });
       
       // Guardar el PDF (esto dispara la descarga)
       pdf.save('reporte_pagos.pdf');
  };


  return (
    // El div principal ya no necesita ref, pero mantener 'relative' podría ser útil para el botón
    <div className="p-6 bg-gray-50 relative">

        {/* Botón de Descarga de PDF - Posicionado absolutamente en la esquina superior derecha */}
        <div className="absolute top-4 right-4 z-10"> {/* z-10 asegura que esté por encima */}
            <button
                onClick={generatePdf} // Llama a la nueva función generatePdf
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                disabled={loading || pagos.length === 0} // Deshabilitar si carga o no hay pagos
            >
                {loading ? 'Cargando...' : (pagos.length > 0 ? 'Descargar PDF' : 'Sin datos para PDF')}
            </button>
        </div>

      {/* Título del Reporte */}
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

      {/* Contenido del reporte (excluyendo el botón de descarga que es absoluto) */}
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
                  {/* Mostrar el método con mayor total */}
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

          {/* Gráficos (Se mantienen en la UI pero no se incluyen en el PDF con este método simple) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de pagos por día */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Pagos por Día</h3>
              {/* Asegúrate de que el contenedor del gráfico tenga una altura definida */}
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
                        tickFormatter={(fecha) => new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [formatoMoneda(value), 'Total']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#4C51BF" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No hay datos para mostrar en el gráfico
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de métodos de pago */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Distribución por Método de Pago</h3>
               {/* Asegúrate de que el contenedor del gráfico tenga una altura definida */}
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
                    No hay datos para mostrar en el gráfico
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla detallada (mostrada en la UI) */}
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
                           {/* Usar el objeto Date que ya convertimos */}
                          {pago.fechaPago ? pago.fechaPago.toLocaleDateString('es-ES') : 'Fecha no disponible'}
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