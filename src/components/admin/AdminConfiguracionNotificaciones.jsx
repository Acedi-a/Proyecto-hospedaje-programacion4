

export const AdminConfiguracionNotificaciones = ({ configuracion, handleChange }) => {

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h2>

            {/* --- Canales de Notificación --- */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Canales de notificación</h3>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="notificacionesEmail"
                            name="notificacionesEmail"
                            checked={configuracion.notificacionesEmail}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notificacionesEmail" className="ml-2 block text-sm text-gray-700">Notificaciones por email</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="notificacionesSMS"
                            name="notificacionesSMS"
                            checked={configuracion.notificacionesSMS}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notificacionesSMS" className="ml-2 block text-sm text-gray-700">Notificaciones por SMS</label>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Eventos para notificar</h3>
                <div className="space-y-2">
                    {/* Nueva Reserva */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="notificarNuevaReserva"
                            checked={true} 
                            readOnly
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notificarNuevaReserva" className="ml-2 block text-sm text-gray-700">Nueva reserva</label>
                    </div>
                    {/* Cancelación */}
                     <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="notificarCancelacion"
                            checked={true} 
                            readOnly
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notificarCancelacion" className="ml-2 block text-sm text-gray-700">Cancelación de reserva</label>
                    </div>
                    {/* Pago Recibido */}
                     <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="notificarPago"
                            checked={true}
                             readOnly
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notificarPago" className="ml-2 block text-sm text-gray-700">Pago recibido</label>
                    </div>
                     {/* Recordatorio Check-in */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="notificarCheckIn"
                            checked={false}
                            readOnly
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notificarCheckIn" className="ml-2 block text-sm text-gray-700">Recordatorio de check-in</label>
                    </div>
                </div>
            </div>
        </div>
    );
};