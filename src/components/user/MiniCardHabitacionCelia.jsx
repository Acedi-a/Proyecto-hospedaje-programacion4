import { BedDouble, Users } from "lucide-react";

export default function MiniHabitacionCard({ habitacion }) {

    const VeririficarEstado = (estado) => {
        if (estado === "disponible") return " bg-emerald-500 hover:bg-emerald-600";
        else return " bg-red-600 cursor-not-allowed opacity-50"
        
    };
    return (
        <div className="w-full max-w-sm rounded-2xl shadow-md border border-gray-200 bg-white">
            <img
                src={habitacion.imagen}
                alt={habitacion.nombre}
                className="w-full h-40 object-cover rounded-t-2xl"
            />
            <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                    {habitacion.nombre}
                </h3>
                <p className="text-sm text-gray-600">{habitacion.descripcion}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <BedDouble size={16} />
                        <span>{habitacion.capacidad} personas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{habitacion.estado === "disponible" ? "Disponible" : "Ocupado"}</span>
                    </div>
                </div>

                <div className="text-emerald-600 font-bold text-lg">
                    ${habitacion.precio}/noche
                </div>

                <div className="flex flex-wrap gap-1">
                    {habitacion.servicios.map((servicio, i) => (
                        <span
                            key={i}
                            className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-0.5 rounded-full"
                        >
                            {servicio}
                        </span>
                    ))}

                </div>

                <button className={`mt-2 w-full text-white py-1.5 px-3 rounded-xl text-sm font-medium transition ${VeririficarEstado(habitacion.estado)}`}>
                    {habitacion.estado === "disponible"? "Reservar" : "Ocupado"}
                </button>
            </div>
        </div>
    );
}
