import React from "react";
import { BedDouble, Users, Coffee, Thermometer, Droplets, WifiIcon, Star } from "lucide-react";

export const MiniHabitacionCard = ({ habitacion }) => {
    if (!habitacion || !habitacion.id) return null;

    //console.log("MINICARD: ", habitacion);

    const getIconForServicio = (servicio) => {
        switch (servicio.toLowerCase()) {
            case "jacuzzi":
                return <Droplets size={14} className="text-blue-500" />;
            case "aire acondicionado":
                return <Thermometer size={14} className="text-cyan-500" />;
            case "wifi":
                return <WifiIcon size={14} className="text-indigo-500" />;
            case "desayuno":
                return <Coffee size={14} className="text-amber-600" />;
            default:
                return <Star size={14} className="text-yellow-500" />;
        }
    };

    const formatPrice = (price) => {
        return price % 1 === 0 ? price : price.toFixed(1);
    };

    const buttonClasses = habitacion.estado === "disponible"
        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200"
        : "bg-gradient-to-r from-red-500 to-rose-600 opacity-70 cursor-not-allowed text-white";

    return (
        <div className="w-auto rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="relative">
                <img
                    src={habitacion.imagenUrl}
                    alt={habitacion.nombre}
                    className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold 
                    ${habitacion.estado === "disponible"
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"}`}>
                    {habitacion.estado === "disponible" ? "Disponible" : "Ocupado"}
                </span>

                <div className="absolute bottom-3 right-3 bg-white rounded-lg px-3 py-1 shadow-md">
                    <span className="text-emerald-600 font-bold">${formatPrice(habitacion.precio)}</span>
                    <span className="text-gray-500 text-xs">/noche</span>
                </div>
            </div>

            <div className="p-4">
                {/* Room name */}
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {habitacion.nombre}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {habitacion.descripcion}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center text-gray-700">
                        <BedDouble size={16} className="mr-1 text-emerald-600" />
                        <span className="text-sm">{habitacion.camas} camas</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <Users size={16} className="mr-1 text-emerald-600" />
                        <span className="text-sm">{habitacion.capacidad} personas</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                    {habitacion.servicios.map((servicio, i) => (
                        <span key={i} className="flex items-center bg-gray-100 rounded-full px-2 py-1 text-xs">
                            {getIconForServicio(servicio)}
                            <span className="ml-1">{servicio}</span>
                        </span>
                    ))}
                </div>

                <button
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition duration-300 ${buttonClasses}`}
                    disabled={habitacion.estado !== "disponible"}
                >
                    {habitacion.estado === "disponible" ? "Reservar ahora" : "No disponible"}
                </button>
            </div>
        </div>
    );
};