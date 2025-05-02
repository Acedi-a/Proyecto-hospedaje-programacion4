import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../data/firebase";

export const RecentReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reseñasRef = collection(db, "reseñas");
        const querySnapshot = await getDocs(reseñasRef);

        // Filtramos y ordenamos los datos localmente
        const allReviews = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        // Convertimos la fecha de Firebase a un formato legible
        const recentReviews = allReviews
          .sort((a, b) => (a.fecha.seconds > b.fecha.seconds ? -1 : 1)) // Ordena por fecha (descendente)
          .slice(0, 3)
          .map((reseña) => ({
            ...reseña,
            fecha: reseña.fecha ? new Date(reseña.fecha.seconds * 1000).toLocaleDateString() : "Fecha no disponible"
          }));

        setReviews(recentReviews);
      } catch (error) {
        console.error("Error al obtener reseñas:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Cargando reseñas recientes...</div>;
  }

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Reseñas Recientes</h2>
        <p className="text-sm text-gray-500">Últimas calificaciones de los huéspedes</p>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {reviews.map((reseña, index) => (
            <div key={reseña.id || index} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{reseña.cliente}</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < reseña.puntuacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {reseña.habitacion} • {reseña.fecha}
              </div>
              <p className="text-sm">{reseña.comentario}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link to="/admin/calificaciones">
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Ver todas las reseñas
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
