"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export const AdminNuevaHabitacion = () => {
  const navigate = useNavigate()
  const [habitacion, setHabitacion] = useState({
    nombre: "",
    descripcion: "",
    capacidad: 2,
    camas: 1,
    banos: 1,
    precio: 0,
    servicios: {
      wifi: false,
      tv: false,
      aire: false,
      desayuno: false,
      limpieza: false,
      estacionamiento: false,
    },
    imagenes: [],
  })

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith("servicio-")) {
      const servicio = name.replace("servicio-", "")
      setHabitacion((prev) => ({
        ...prev,
        servicios: {
          ...prev.servicios,
          [servicio]: checked,
        },
      }))
    } else {
      setHabitacion((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }))
    }
  }

  const handleImageUpload = (e) => {
    // En una implementación real, aquí se subirían las imágenes a un servidor
    // Para este ejemplo, simplemente simularemos que se han subido
    const files = Array.from(e.target.files)
    const fileNames = files.map((file) => file.name)

    setHabitacion((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, ...fileNames],
    }))
  }

  const removeImage = (index) => {
    setHabitacion((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setGuardando(true)
    setError("")

    // Validaciones básicas
    if (!habitacion.nombre || !habitacion.descripcion || habitacion.precio <= 0) {
      setError("Por favor complete todos los campos obligatorios")
      setGuardando(false)
      return
    }

    // Simulación de guardado
    setTimeout(() => {
      setGuardando(false)
      // Redirigir a la lista de habitaciones
      navigate("/admin/habitaciones")
    }, 1500)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nueva Habitación</h1>
        <button
          onClick={() => navigate("/admin/habitaciones")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>

      {error && <div className="p-4 mb-6 bg-red-100 text-red-800 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Habitación *</label>
              <input
                type="text"
                name="nombre"
                value={habitacion.nombre}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Noche (€) *</label>
              <input
                type="number"
                name="precio"
                value={habitacion.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                name="descripcion"
                value={habitacion.descripcion}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Características</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (personas)</label>
              <input
                type="number"
                name="capacidad"
                value={habitacion.capacidad}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Camas</label>
              <input
                type="number"
                name="camas"
                value={habitacion.camas}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Baños</label>
              <input
                type="number"
                name="banos"
                value={habitacion.banos}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Servicios Incluidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wifi"
                  name="servicio-wifi"
                  checked={habitacion.servicios.wifi}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="wifi" className="ml-2 text-sm text-gray-700">
                  WiFi Gratuito
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tv"
                  name="servicio-tv"
                  checked={habitacion.servicios.tv}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="tv" className="ml-2 text-sm text-gray-700">
                  Televisión
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aire"
                  name="servicio-aire"
                  checked={habitacion.servicios.aire}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="aire" className="ml-2 text-sm text-gray-700">
                  Aire Acondicionado
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="desayuno"
                  name="servicio-desayuno"
                  checked={habitacion.servicios.desayuno}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="desayuno" className="ml-2 text-sm text-gray-700">
                  Desayuno Incluido
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="limpieza"
                  name="servicio-limpieza"
                  checked={habitacion.servicios.limpieza}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="limpieza" className="ml-2 text-sm text-gray-700">
                  Servicio de Limpieza
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="estacionamiento"
                  name="servicio-estacionamiento"
                  checked={habitacion.servicios.estacionamiento}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="estacionamiento" className="ml-2 text-sm text-gray-700">
                  Estacionamiento
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Imágenes</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subir Imágenes</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
            />
          </div>

          {habitacion.imagenes.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Imágenes Seleccionadas:</h3>
              <ul className="space-y-2">
                {habitacion.imagenes.map((img, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-600">{img}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
          >
            {guardando ? "Guardando..." : "Crear Habitación"}
          </button>
        </div>
      </form>
    </div>
  )
}

