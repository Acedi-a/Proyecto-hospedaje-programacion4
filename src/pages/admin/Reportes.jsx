import React, { useEffect, useState, useRef } from "react";
import { db } from "../../data/firebase";
import { collection, getDocs, query, where, Timestamp, orderBy } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Importar librerías para PDF
import html2canvas from 'html2canvas';
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

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Referencia para el contenido del reporte que se va a descargar
  const reportRef = useRef(); // Crear una referencia

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
      // Asegurarse de incluir todo el día de la fecha fin
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
        total: parseFloat(doc.data().total) || 0
      }));

      setPagos(pagosData);
      // Recalcular resúmenes y gráficos después de cargar los pagos
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

    // Convertir el objeto a un array y ordenar por fecha ascendente
    setDatosPorDia(Object.values(porDia).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));
  };


  // Formatear moneda
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'BOB' // O la moneda que uses
    }).format(valor);
  };

  // Manejar cambio de período
  const cambiarPeriodo = (e) => {
    const periodo = e.target.value;
    setPeriodoSeleccionado(periodo);
    // Solo establecer fechas si no es personalizado, si es personalizado los inputs se encargan
    if (periodo !== 'personalizado') {
        establecerPeriodo(periodo);
    }
  };

  // **Función para generar PDF**
  const generatePdf = async () => {
      const input = reportRef.current; // Usar la referencia al contenedor del reporte

      if (!input) {
          console.error("No se encontró el elemento del reporte para generar el PDF.");
          return;
      }

      // Opciones para html2canvas
      const options = {
          scale: 2, // Aumenta la escala para mejor resolución
          useCORS: true, // Habilita CORS si tienes imágenes externas (necesario para gráficos SVG)
          logging: false, // Desactiva los logs de html2canvas
          // Captura el área completa, incluso si hay scroll
          windowWidth: input.scrollWidth,
          windowHeight: input.scrollHeight,
      };

      try {
          const canvas = await html2canvas(input, options);
          const imgData = canvas.toDataURL('image/png');

          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgHeight = canvas.height * pdfWidth / canvas.width; // Calcula la altura de la imagen en el PDF

          let position = 0; // Posición vertical actual en el PDF

          // Añadir la primera página
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);

          // Calcular la altura restante de la imagen
          let heightLeft = imgHeight - pdfHeight;

          // Añadir páginas adicionales si es necesario
          while (heightLeft >= 0) {
              position = heightLeft - imgHeight; // Mueve hacia arriba para la siguiente sección
              pdf.addPage(); // Añade una nueva página
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight); // Añade la imagen
              heightLeft -= pdfHeight; // Reduce la altura restante
          }

          pdf.save('reporte_pagos.pdf'); // Nombre del archivo a descargar

      } catch (err) {
          console.error("Error al generar el PDF:", err);
          alert("Hubo un error al generar el PDF. Por favor, intenta de nuevo.");
      }
  };

  return (
    // Asignar la referencia al div principal y hacerlo relativo para posicionar el botón
    <div className="p-6 bg-gray-50 relative" ref={reportRef}>

        {/* Botón de Descarga de PDF - Posicionado absolutamente en la esquina superior derecha */}
        <div className="absolute top-4 right-4 z-10"> {/* z-10 asegura que esté por encima de otros elementos si se superponen */}
            <button
                onClick={generatePdf}
                // Añadir margen a la derecha si hay otros elementos en la misma línea del título,
                // o simplemente usar la posición absoluta como está.
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                disabled={loading} // Deshabilitar mientras carga datos
            >
                {loading ? 'Cargando...' : 'Descargar PDF'}
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
          {/* Nota: El botón de descarga se movió fuera de este flexbox para posicionarlo absolutamente */}
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

          {/* Gráficos */}
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
                          {/* Mostrar la fecha formateada de manera segura */}
                          {pago.fechaPago?.toDate() ? pago.fechaPago.toDate().toLocaleDateString('es-ES') : 'Fecha no disponible'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {pago.metodoPago || 'Desconocido'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {/* Formatear el total */}
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