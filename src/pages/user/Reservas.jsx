"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { CardReserva } from "../../components/user/CardReserva"
import { reservasData } from "../../data/reservas"

export const Reservas = () => {
  const [activeTab, setActiveTab] = useState("activas")

  const reservasActivas = reservasData.filter((r) => r.estado === "confirmada" || r.estado === "pendiente")
  const reservasHistoricas = reservasData.filter((r) => r.estado === "completada" || r.estado === "cancelada")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis Reservas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus reservas actuales e históricas</p>
        </div>
        <Link
          to="/reservas/nueva"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Nueva Reserva
        </Link>
      </div>

      <div className="mb-8">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "activas"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("activas")}
            >
              Reservas Activas
            </button>
            <button
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "historicas"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("historicas")}
            >
              Historial de Reservas
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "activas" && (
        <>
          {reservasActivas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No tienes reservas activas en este momento.</p>
              <Link
                to="/reservas/nueva"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Hacer una Reserva
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reservasActivas.map((reserva) => (
                <CardReserva key={reserva.id} reserva={reserva} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "historicas" && (
        <>
          {reservasHistoricas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tienes reservas históricas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reservasHistoricas.map((reserva) => (
                <CardReserva key={reserva.id} reserva={reserva} historica={true} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

