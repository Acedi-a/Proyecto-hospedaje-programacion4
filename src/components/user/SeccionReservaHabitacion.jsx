import { useEffect, useState } from "react";
import {db} from "../../data/firebase";
import { query, collection, onSnapshot } from "firebase/firestore";


export const ReservaHabitacion = ({ selectedRoom, onSelectRoom }) => {
  const [habitaciones, setHabitaciones] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "Habitaciones"));
    const sel = onSnapshot(q, (querySnapshot) => {
      let habitacionesArray = [];
      querySnapshot.forEach((doc) => {
        habitacionesArray.push({ ...doc.data(), id: doc.id });
      });
      console.log(habitacionesArray);
      setHabitaciones(habitacionesArray);
    });
    return () => sel();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Lo msimo para el admin */}
      {habitaciones.length > 0 ? (
        habitaciones.map((habitacion) => (
          <div
            key={habitacion.nombre}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedRoom === habitacion.nombre ? "ring-2 ring-emerald-600" : ""
              }`}
            onClick={() => onSelectRoom(habitacion)}
          >
            <div className="relative h-48 w-full">
              <img
                src={habitacion.imagenUrl || "/placeholder.svg"}
                alt={habitacion.nombre}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{habitacion.nombre}</h3>
              <p className="text-gray-500 text-sm mb-2">{habitacion.descripcion}</p>

              <div className="text-sm text-gray-500 mb-2">
                Capacidad: {habitacion.capacidad} personas • Camas: {habitacion.camas}
              </div>

              <div className="text-sm text-gray-500 mb-2">
                Servicios: {habitacion.servicios?.join(", ")}
              </div>

              <div className="flex justify-between items-center mt-2">
                <div></div>
                <div className="text-lg font-semibold">Bs. {habitacion.precio}/noche</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No hay habitaciones disponibles</p>
      )}
    </div>
  );
};