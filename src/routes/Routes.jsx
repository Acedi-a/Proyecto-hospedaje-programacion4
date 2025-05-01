import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { Home } from "../pages/user/Home";
import { Reservas } from "../pages/user/Reservas";
import { Calificaciones } from "../pages/user/Calificaciones";
import { Servicios } from "../pages/user/Servicios";
import { NuevaReserva } from "../pages/user/NuevaReserva";
import { UserLayout } from "../components/user/Layout";
import { NuevaCalificacion } from "../pages/user/NuevaCalificacion";
import { EditarReserva } from "../pages/user/EditarReserva";

import { AdminDashboard } from "../pages/admin/Dashboard";
import { Habitaciones } from "../pages/admin/Habitaciones";
import { AdminNuevaHabitacion } from "../pages/admin/NuevaHabitacion";
import { AdminReservas } from "../pages/admin/Reservas";
import { AdminPagos } from "../pages/admin/Pagos";
import { AdminServicios } from "../pages/admin/Servicios";
import { AdminCalificaciones } from "../pages/admin/Calificaciones";
import { AdminReportes } from "../pages/admin/Reportes";
import { AdminConfiguracion } from "../pages/admin/Configuracion";
import { AdminLayout } from "../components/admin/Layout";

import { Login } from "../pages/user/Login";
import { Signup } from "../pages/user/Signup";
import { CrearHabitacion } from "../pages/admin/CrearHabitacion";
import { EditarHabitacion } from "../pages/admin/EditarHabitacion";
import { auth } from "../data/firebase";

export const MisRutas = () => {
  const [uid, setUid] = useState(null); // Inicializa como null
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Estado de carga

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("El ID del usuario es: ", user.uid);
        setUid(user.uid);
      } else {
        console.log("No hay usuario autenticado");
        setUid(null); // Asegúrate de limpiar el UID
      }
      setIsLoadingAuth(false); // La comprobación ha terminado, actualiza el estado de carga
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, []); // Solo se ejecuta una vez

  // Muestra un indicador de carga mientras se verifica la autenticación
  if (isLoadingAuth) {
    // Puedes poner un componente de Spinner o simplemente texto
    return <div>Cargando autenticación...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<UserLayout uid={uid} />}>
          <Route index element={<Home />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="reservas/nueva" element={<NuevaReserva />} />
          <Route path="reservas/editar/:id" element={<EditarReserva />} />
          <Route path="calificaciones" element={<Calificaciones />} />
          <Route path="calificaciones/nueva" element={<NuevaCalificacion />} />
          <Route path="servicios" element={<Servicios />} />
        </Route>

        {/* Rutas de admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> 
          <Route path="habitaciones" element={<Habitaciones />} />
          <Route path="habitaciones/nueva" element={<AdminNuevaHabitacion />} />
          <Route path="reservas" element={<AdminReservas />} />
          <Route path="pagos" element={<AdminPagos />} />
          <Route path="servicios" element={<AdminServicios />} />
          <Route path="calificaciones" element={<AdminCalificaciones />} />
          <Route path="reportes" element={<AdminReportes />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
          <Route path="crear" element={<CrearHabitacion />} />
          <Route path="editar/:id" element={<EditarHabitacion />} />
        </Route>
      </Routes>
    </Router>
  );
};