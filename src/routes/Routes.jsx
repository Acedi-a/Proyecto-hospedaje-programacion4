import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { Home } from "../pages/user/Home";
import { Reservas } from "../pages/user/Reservas";
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
import { AdminReportes } from "../pages/admin/Reportes";
import { AdminConfiguracion } from "../pages/admin/Configuracion";
import { AdminLayout } from "../components/admin/Layout";

import { Login } from "../pages/user/Login";
import { Signup } from "../pages/user/Signup";
import { CrearHabitacion } from "../pages/admin/CrearHabitacion";
import { EditarHabitacion } from "../pages/admin/EditarHabitacion";

import { auth } from "../data/firebase";
import { db } from "../data/firebase";
import { doc, getDoc } from "firebase/firestore";	
import { UserProvider } from "../context/UserContext"; // ✅ este es el bueno
import ListarReservas from "../pages/admin/ListarReservas";
import Calificaciones from "../pages/user/Calificaciones";


export const MisRutas = () => {
  {/*
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.uid) {
        setUser(user);
        try {
          const docSnap = await getDoc(doc(db, "usuarios", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              uid: user.uid,
              apellido: data.apellido || "",
              nombre: data.nombre || "",
              email: data.email || "",
              telefono: data.telefono || "",
              creadoEn: data.creadoEn || null,
            });
          }
        } catch (err) {
          console.error("Error al obtener datos del usuario:", err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoadingAuth || !userData) {
    return <div>Cargando datos del usuario...</div>;
  }
  */}

  
  return  (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="reservas" element={<Reservas />} />
            <Route path="reservas/nueva" element={<NuevaReserva />} />
            <Route path="reservas/editar/:id" element={<EditarReserva />} />
            <Route path="calificaciones/nueva" element={<NuevaCalificacion />} />
            <Route path="servicios" element={<Servicios />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="habitaciones" element={<Habitaciones />} />
            <Route path="habitaciones/nueva" element={<AdminNuevaHabitacion />} />
            <Route path="pagos" element={<AdminPagos />} />
            <Route path="servicios" element={<AdminServicios />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="calificaciones" element={<Calificaciones />} />

            <Route path="configuracion" element={<AdminConfiguracion />} />
            <Route path="crear" element={<CrearHabitacion />} />
            <Route path="editar/:id" element={<EditarHabitacion />} />
            <Route path="listar-reservas" element={<ListarReservas />} />

          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};