// pages/admin/Calificaciones.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../data/firebase";
import { FaStar } from "react-icons/fa";

const AdminCalificaciones = () => {
  const [reseñas, setReseñas] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const fetchReseñas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "reseñas"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReseñas(data);
      } catch (error) {
        console.error("Error al obtener las reseñas:", error);
      }
    };

    fetchReseñas();
  }, []);

  const renderStars = (puntuacion) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        color={i < puntuacion ? "#ffc107" : "#e4e5e9"}
        size={16}
      />
    ));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Calificaciones</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="py-2 px-4">Cliente</th>
              <th className="py-2 px-4">Usuario ID</th>
              <th className="py-2 px-4">Comentario</th>
              <th className="py-2 px-4">Habitación</th>
              <th className="py-2 px-4">Puntuación</th>
              <th className="py-2 px-4">Fecha</th>
              <th className="py-2 px-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reseñas.map((res) => (
              <tr key={res.id} className="border-t text-sm">
                <td className="py-2 px-4">{res.cliente}</td>
                <td className="py-2 px-4">{res.usuarioID}</td>
                <td className="py-2 px-4">{res.comentario}</td>
                <td className="py-2 px-4">{res.habitacion}</td>
                <td className="py-2 px-4">{renderStars(Number(res.puntuacion))}</td>
                <td className="py-2 px-4">{res.fecha}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => setSelectedReview(res)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Detalle de Calificación</h3>
            <p><strong>Cliente:</strong> {selectedReview.cliente}</p>
            <p><strong>Usuario ID:</strong> {selectedReview.usuarioID}</p>
            <p><strong>Comentario:</strong> {selectedReview.comentario}</p>
            <p><strong>Habitación:</strong> {selectedReview.habitacion}</p>
            <p><strong>Puntuación:</strong> {renderStars(Number(selectedReview.puntuacion))}</p>
            <p><strong>Fecha:</strong> {selectedReview.fecha}</p>
            <div className="mt-4">
              <button
                onClick={() => setSelectedReview(null)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalificaciones ;
