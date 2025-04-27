import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Home } from "../pages/user/Home"
import { Reservas } from "../pages/user/Reservas"
import { Calificaciones } from "../pages/user/Calificaciones"
import { Servicios } from "../pages/user/Servicios"
import { NuevaReserva } from "../pages/user/NuevaReserva"
import { UserLayout } from "../components/user/Layout"
import { NuevaCalificacion } from "../pages/user/NuevaCalificacion"
import { EditarReserva } from "../pages/user/EditarReserva"

import { AdminDashboard } from "../pages/admin/Dashboard"
import { AdminHabitaciones } from "../pages/admin/Habitaciones"
import { AdminNuevaHabitacion } from "../pages/admin/NuevaHabitacion"
import { AdminReservas } from "../pages/admin/Reservas"
import { AdminPagos } from "../pages/admin/Pagos"
import { AdminServicios } from "../pages/admin/Servicios"
import { AdminCalificaciones } from "../pages/admin/Calificaciones"
import { AdminReportes } from "../pages/admin/Reportes"
import { AdminConfiguracion } from "../pages/admin/Configuracion"
import { AdminLayout } from "../components/admin/Layout"


import { Login } from "../pages/user/Login"
import { Signup } from "../pages/user/Signup"




export const MisRutas = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas de usuario */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<UserLayout />}>

          <Route path="/" element={<Home />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/reservas/nueva" element={<NuevaReserva />} />
          <Route path="/reservas/editar/:id" element={<EditarReserva />} />
           {/*
          <Route path="/reservas/cancelar/:id" element={<CancelarReserva />} />
          */}
          
          <Route path="/calificaciones" element={<Calificaciones />} />
          <Route path="/calificaciones/nueva" element={<NuevaCalificacion />} />
          {/*
          <Route path="/calificaciones/nueva/:id" element={<NuevaCalificacion />} />
          */}
          <Route path="/servicios" element={<Servicios />} />
          {/*
          <Route path="/servicios/solicitar/:id" element={<SolicitarServicio />} />
          */}
        </Route>
        {/* Rutas de admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="/admin" element={< AdminDashboard/>} />
          <Route path="/admin/habitaciones" element={<AdminHabitaciones />} />
          <Route path="/admin/habitaciones/nueva" element={<AdminNuevaHabitacion />} />
          <Route path="/admin/reservas" element={<AdminReservas />} />
          <Route path="/admin/pagos" element={<AdminPagos />} />
          <Route path="/admin/servicios" element={<AdminServicios />} />
          <Route path="/admin/calificaciones" element={<AdminCalificaciones />} />
          <Route path="/admin/reportes" element={<AdminReportes />} />
          <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
        </Route>  
      </Routes>
    </Router>
  )
}

