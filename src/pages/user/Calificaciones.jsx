"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { CardCalificacion } from "../../components/user/CardCalificacion"
import { misCalificacionesData, calificacionesHospedajeData } from "../../data/calificaciones"

export const Calificaciones = () => {
  const [activeTab, setActiveTab] = useState("mis-calificaciones")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calificaciones</h1>
          <p className="text-gray-500 mt-1">Revisa tus calificaciones y las opiniones de otros huéspedes</p>
        </div>
        <Link to="/calificaciones/nueva">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
            Nueva Calificación
          </button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "mis-calificaciones"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("mis-calificaciones")}
            >
              Mis Calificaciones
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "todas-calificaciones"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("todas-calificaciones")}
            >
              Todas las Opiniones
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "mis-calificaciones" && (
        <>
          {misCalificacionesData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No has realizado ninguna calificación todavía.</p>
              <Link to="/calificaciones/nueva">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                  Calificar una Estancia
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {misCalificacionesData.map((calificacion) => (
                <CardCalificacion key={calificacion.id} calificacion={calificacion} esMia={true} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "todas-calificaciones" && (
        <div className="grid grid-cols-1 gap-6">
          {calificacionesHospedajeData.map((calificacion) => (
            <CardCalificacion key={calificacion.id} calificacion={calificacion} esMia={false} />
          ))}
        </div>
      )}
    </div>
  )
}

