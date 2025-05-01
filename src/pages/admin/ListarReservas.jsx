import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ListarReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'Reservas'));
      
      const reservasConDatos = await Promise.all(
        querySnapshot.docs.map(async (docReserva) => {
          const reservaData = docReserva.data();
          
          // Obtener datos del usuario
          let usuarioData = {};
          if (reservaData.idusuario) {
            const usuarioRef = doc(db, 'usuarios', reservaData.idusuario);
            const usuarioSnap = await getDoc(usuarioRef);
            if (usuarioSnap.exists()) {
              usuarioData = usuarioSnap.data();
            }
          }
          
          // Obtener nombre de la habitación usando habitacionId
          let nombreHabitacion = 'Habitación no especificada';
          if (reservaData.habitacionId) {
            try {
              const habitacionRef = doc(db, 'Habitaciones', reservaData.habitacionId);
              const habitacionSnap = await getDoc(habitacionRef);
              if (habitacionSnap.exists()) {
                nombreHabitacion = habitacionSnap.data().nombre || `Habitación ${reservaData.habitacionId.substring(0, 5)}`;
              }
            } catch (error) {
              console.error('Error al cargar datos de la habitación:', error);
            }
          }
          
          // Obtener datos de servicios adicionales
          const serviciosCompletos = await Promise.all(
            reservaData.idserviciosadicionales?.map(async (servicio) => {
              const servicioRef = doc(db, 'Servicios', servicio.id);
              const servicioSnap = await getDoc(servicioRef);
              return servicioSnap.exists() ? servicioSnap.data() : null;
            }) || []
          );
          
          return {
            id: docReserva.id,
            ...reservaData,
            usuario: usuarioData,
            nombreHabitacion,
            servicios: serviciosCompletos.filter(s => s !== null)
          };
        })
      );
      
      setReservas(reservasConDatos);
    } catch (err) {
      console.error("Error fetching reservas: ", err);
      setError("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoReserva = async (idReserva, nuevoEstado) => {
    try {
      const reservaRef = doc(db, 'Reservas', idReserva);
      await updateDoc(reservaRef, {
        estado: nuevoEstado
      });
      
      // Actualizar el estado local para reflejar el cambio inmediatamente
      setReservas(reservas.map(reserva => 
        reserva.id === idReserva ? { ...reserva, estado: nuevoEstado } : reserva
      ));
      
      console.log(`Estado de reserva ${idReserva} actualizado a ${nuevoEstado}`);
    } catch (error) {
      console.error("Error al actualizar el estado de la reserva:", error);
      alert("Error al actualizar el estado de la reserva");
    }
  };

  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Fecha no disponible';
    return format(timestamp.toDate(), "PPPpp", { locale: es });
  };

  if (loading) return <div className="text-center py-4">Cargando reservas...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (reservas.length === 0) return <div className="text-center py-4">No hay reservas disponibles</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Listado de Reservas</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reservas.map((reserva) => (
          <div key={reserva.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Reserva #{reserva.id.substring(0, 8)}</h2>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium">Estado:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                    reserva.estado === 'confirmada' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reserva.estado}
                  </span>
                </div>
                
                {/* Botones para cambiar estado */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {reserva.estado !== 'pendiente' && (
                    <button
                      onClick={() => cambiarEstadoReserva(reserva.id, 'pendiente')}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition"
                    >
                      Poner Pendiente
                    </button>
                  )}
                  {reserva.estado !== 'confirmada' && (
                    <button
                      onClick={() => cambiarEstadoReserva(reserva.id, 'confirmada')}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                    >
                      Confirmar
                    </button>
                  )}
                  {reserva.estado !== 'cancelada' && (
                    <button
                      onClick={() => cambiarEstadoReserva(reserva.id, 'cancelada')}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
                
                {/* Resto de la información de la reserva */}
                {reserva.usuario && (
                  <div>
                    <p className="font-medium">Cliente:</p>
                    <p>{reserva.usuario.nombre} {reserva.usuario.apellido}</p>
                    {reserva.usuario.email && <p className="text-sm text-gray-600">{reserva.usuario.email}</p>}
                  </div>
                )}
                
                <p><span className="font-medium">Fecha de reserva:</span> {formatFecha(reserva.fechaReserva)}</p>
                <p><span className="font-medium">Check-in:</span> {formatFecha(reserva.fechaInicio)}</p>
                <p><span className="font-medium">Check-out:</span> {formatFecha(reserva.fechaFin)}</p>
                <p><span className="font-medium">Huéspedes:</span> {reserva.huespedes}</p>
                <p><span className="font-medium">Habitación:</span> {reserva.nombreHabitacion}</p>
                
                {reserva.comentariosAdicionales && (
                  <p><span className="font-medium">Comentarios:</span> {reserva.comentariosAdicionales}</p>
                )}
                
                {reserva.servicios && reserva.servicios.length > 0 && (
                  <div>
                    <p className="font-medium">Servicios adicionales:</p>
                    <ul className="list-disc pl-5">
                      {reserva.servicios.map((servicio, index) => (
                        <li key={index}>
                          {servicio.nombre} 
                          {servicio.categoria && <span className="text-sm text-gray-600"> ({servicio.categoria})</span>}
                          - ${servicio.precio}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListarReservas;