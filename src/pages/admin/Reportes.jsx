import React, { useEffect, useState } from "react";
import { db } from "../../data/firebase";
import {collection, getDocs, query, where, Timestamp, orderBy } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdminReportes = () => {
  // Estados para datos
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para filtros y cálculos
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("ultimo-mes");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  // Estados para estadísticas
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [cantidadReservas, setCantidadReservas] = useState(0);
  const [tasaOcupacion, setTasaOcupacion] = useState(0);
  const [comparativoMesAnterior, setComparativoMesAnterior] = useState({
    ingresos: 0,
    variacion: 0
  });
  
  // Estados para gráficos
  const [datosPorDia, setDatosPorDia] = useState([]);
  
  // Función para establecer las fechas según el período seleccionado
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
    
    return { inicio, fin };
  };
  
  // Cargar datos al iniciar el componente
  useEffect(() => {
    establecerPeriodo("ultimo-mes");
  }, []);
  
  // Cargar datos cuando cambian las fechas
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarDatos();
    }
  }, [fechaInicio, fechaFin]);
  
  // Función para cargar todos los datos necesarios
  const cargarDatos = async () => {
    setLoading(true);
    
    try {
      // Cargar pagos del período actual
      await cargarPagos();
      
      // Cargar reservas del período
      await cargarReservas();
      
      // Cargar datos comparativos del mes anterior
      await cargarComparativo();
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Ha ocurrido un error al cargar los datos. Por favor intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar pagos
  const cargarPagos = async () => {
    const fechaInicioTS = Timestamp.fromDate(new Date(fechaInicio));
    const fechaFinTS = Timestamp.fromDate(
      new Date(new Date(fechaFin).setHours(23, 59, 59))
    );
    
    const pagosRef = collection(db, "pagos");
    const pagosQuery = query(
      pagosRef,
      where("fecha", ">=", fechaInicioTS),
      where("fecha", "<=", fechaFinTS),
      orderBy("fecha", "desc")
    );
    
    const snapshot = await getDocs(pagosQuery);
    const pagosFiltrados = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    setPagos(pagosFiltrados);
    
    // Calcular ingresos totales
    const total = pagosFiltrados.reduce(
      (acc, curr) => acc + (parseFloat(curr.monto) || 0),
      0
    );
    
    setIngresosTotales(total);
    
    // Generar datos para gráfico por día
    generarDatosPorDia(pagosFiltrados);
  };
  
  // Función para cargar reservas
  const cargarReservas = async () => {
    const fechaInicioTS = Timestamp.fromDate(new Date(fechaInicio));
    const fechaFinTS = Timestamp.fromDate(
      new Date(new Date(fechaFin).setHours(23, 59, 59))
    );
    
    const reservasRef = collection(db, "reservas");
    const reservasQuery = query(
      reservasRef,
      where("fechaCreacion", ">=", fechaInicioTS),
      where("fechaCreacion", "<=", fechaFinTS)
    );
    
    const snapshot = await getDocs(reservasQuery);
    const reservasFiltradas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    setReservas(reservasFiltradas);
    setCantidadReservas(reservasFiltradas.length);
    
    // Calcular tasa de ocupación (asumiendo una capacidad total de 50 habitaciones por día)
    const diasPeriodo = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1;
    const capacidadTotal = diasPeriodo * 50; // 50 habitaciones disponibles por día
    const ocupacionTotal = reservasFiltradas.reduce((total, reserva) => {
      // Asumimos que cada reserva tiene un campo "noches" o calculamos la duración
      const noches = reserva.noches || 1;
      return total + noches;
    }, 0);
    
    const tasaCalculada = (ocupacionTotal / capacidadTotal) * 100;
    setTasaOcupacion(tasaCalculada);
  };
  
  // Función para cargar datos comparativos
  const cargarComparativo = async () => {
    // Calcular el rango de fechas para el período anterior
    const fechaActualInicio = new Date(fechaInicio);
    const fechaActualFin = new Date(fechaFin);
    
    const duracionPeriodo = fechaActualFin - fechaActualInicio;
    const fechaAnteriorFin = new Date(fechaActualInicio);
    fechaAnteriorFin.setDate(fechaAnteriorFin.getDate() - 1);
    
    const fechaAnteriorInicio = new Date(fechaAnteriorFin);
    fechaAnteriorInicio.setTime(fechaAnteriorInicio.getTime() - duracionPeriodo);
    
    // Consultar pagos del período anterior
    const fechaAnteriorInicioTS = Timestamp.fromDate(fechaAnteriorInicio);
    const fechaAnteriorFinTS = Timestamp.fromDate(fechaAnteriorFin);
    
    const pagosRef = collection(db, "pagos");
    const pagosQuery = query(
      pagosRef,
      where("fecha", ">=", fechaAnteriorInicioTS),
      where("fecha", "<=", fechaAnteriorFinTS)
    );
    
    const snapshot = await getDocs(pagosQuery);
    const pagosAnteriores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Calcular ingresos del período anterior
    const ingresosAnteriores = pagosAnteriores.reduce(
      (acc, curr) => acc + (parseFloat(curr.monto) || 0),
      0
    );
    
    // Calcular variación porcentual
    let variacion = 0;
    if (ingresosAnteriores > 0) {
      variacion = ((ingresosTotales - ingresosAnteriores) / ingresosAnteriores) * 100;
    }
    
    setComparativoMesAnterior({
      ingresos: ingresosAnteriores,
      variacion: variacion
    });
  };
  
  // Función para generar datos para el gráfico
  const generarDatosPorDia = (pagosFiltrados) => {
    // Agrupar pagos por día
    const pagosPorFecha = pagosFiltrados.reduce((acc, pago) => {
      if (!pago.fecha) return acc;
      
      const fecha = pago.fecha.toDate().toISOString().split('T')[0];
      if (!acc[fecha]) {
        acc[fecha] = {
          fecha,
          monto: 0,
          cantidad: 0
        };
      }
      
      acc[fecha].monto += parseFloat(pago.monto) || 0;
      acc[fecha].cantidad += 1;
      
      return acc;
    }, {});
    
    // Convertir a array y ordenar por fecha
    const datosGrafico = Object.values(pagosPorFecha).sort((a, b) => 
      new Date(a.fecha) - new Date(b.fecha)
    );
    
    setDatosPorDia(datosGrafico);
  };

  // Función para exportar datos a CSV
  const exportarCSV = () => {
    if (pagos.length === 0) return;
    
    // Crear encabezados del CSV
    const headers = ["ID", "Usuario", "Monto", "Fecha"];
    
    // Crear filas de datos
    const filas = pagos.map(pago => [
      pago.id,
      pago.usuarioID || "N/A",
      pago.monto,
      pago.fecha ? pago.fecha.toDate().toLocaleDateString() : "N/A"
    ]);
    
    // Combinar encabezados y filas
    const contenidoCSV = [
      headers.join(","),
      ...filas.map(fila => fila.join(","))
    ].join("\n");
    
    // Crear blob y descargar
    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_pagos_${fechaInicio}_al_${fechaFin}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Función para manejar cambio de período
  const cambiarPeriodo = (e) => {
    const periodo = e.target.value;
    setPeriodoSeleccionado(periodo);
    establecerPeriodo(periodo);
  };

  // Formatear moneda
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Reportes y Estadísticas</h2>
      
      {/* Selector de período */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
        <select 
          value={periodoSeleccionado}
          onChange={cambiarPeriodo}
          className="w-64 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ultimo-mes">Último mes</option>
          <option value="mes-actual">Mes actual</option>
          <option value="mes-anterior">Mes anterior</option>
          <option value="personalizado">Personalizado</option>
        </select>
        
        {periodoSeleccionado === "personalizado" && (
          <div className="mt-3 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-lg">Cargando datos...</div>
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm mb-1">Total de Ingresos</h3>
              <div className="text-3xl font-bold text-green-600">
                {formatoMoneda(ingresosTotales)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Durante el periodo seleccionado</p>
              
              {comparativoMesAnterior.variacion !== 0 && (
                <div className={`mt-2 text-sm ${comparativoMesAnterior.variacion > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparativoMesAnterior.variacion > 0 ? '↑' : '↓'} {Math.abs(comparativoMesAnterior.variacion).toFixed(1)}% respecto al período anterior
                </div>
              )}
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm mb-1">Reservas</h3>
              <div className="text-3xl font-bold text-blue-600">
                {cantidadReservas}
              </div>
              <p className="text-sm text-gray-500 mt-2">Durante el periodo seleccionado</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
              <h3 className="text-gray-500 text-sm mb-1">Tasa de Ocupación</h3>
              <div className="text-3xl font-bold text-purple-600">
                {tasaOcupacion.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">Promedio durante el periodo</p>
            </div>
          </div>
          
          {/* Resumen financiero */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Resumen financiero</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concepto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Este Periodo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Periodo Anterior
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ingresos por reservas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatoMoneda(ingresosTotales * 0.85)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatoMoneda(comparativoMesAnterior.ingresos * 0.85)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${comparativoMesAnterior.variacion > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {comparativoMesAnterior.variacion > 0 ? '+' : ''}{comparativoMesAnterior.variacion.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ingresos por servicios
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatoMoneda(ingresosTotales * 0.15)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatoMoneda(comparativoMesAnterior.ingresos * 0.15)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${comparativoMesAnterior.variacion > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {comparativoMesAnterior.variacion > 0 ? '+' : ''}{comparativoMesAnterior.variacion.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Gastos operativos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatoMoneda(ingresosTotales * 0.4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatoMoneda(comparativoMesAnterior.ingresos * 0.4)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${comparativoMesAnterior.variacion > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {comparativoMesAnterior.variacion > 0 ? '+' : ''}{comparativoMesAnterior.variacion.toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Beneficio neto
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatoMoneda(ingresosTotales * 0.6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatoMoneda(comparativoMesAnterior.ingresos * 0.6)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${comparativoMesAnterior.variacion > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {comparativoMesAnterior.variacion > 0 ? '+' : ''}{comparativoMesAnterior.variacion.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Gráfico de ingresos */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ingresos por día</h3>
              <button
                onClick={exportarCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Exportar a CSV
              </button>
            </div>
            
            <div className="p-4">
              {datosPorDia.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={datosPorDia}
                      margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fecha" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${formatoMoneda(value)}`, "Monto"]}
                        labelFormatter={(label) => `Fecha: ${new Date(label).toLocaleDateString()}`}
                      />
                      <Legend />
                      <Bar dataKey="monto" name="Ingresos" fill="#4C51BF" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  No hay datos suficientes para mostrar el gráfico
                </div>
              )}
            </div>
          </div>
          
          {/* Tabla de pagos */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Registro de pagos</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.length > 0 ? (
                    pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{pago.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{pago.usuarioID || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatoMoneda(parseFloat(pago.monto))}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {pago.fecha?.toDate().toLocaleDateString()} {pago.fecha?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron pagos para el período seleccionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {pagos.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
                Mostrando {pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};