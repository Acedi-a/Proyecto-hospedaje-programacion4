

export const AdminConfiguracionGeneral = ({ configuracion, handleChange }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Información del Hospedaje</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombreHospedaje" className="block text-sm font-medium text-gray-700 mb-1">Nombre del hospedaje</label>
                    <input
                        type="text"
                        id="nombreHospedaje"
                        name="nombreHospedaje"
                        value={configuracion.nombreHospedaje}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email de contacto</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={configuracion.email}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={configuracion.telefono}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
                 <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                        type="text"
                        id="direccion"
                        name="direccion"
                        value={configuracion.direccion}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="horarioCheckIn" className="block text-sm font-medium text-gray-700 mb-1">Hora de check-in</label>
                    <input
                        type="time"
                        id="horarioCheckIn"
                        name="horarioCheckIn"
                        value={configuracion.horarioCheckIn}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
                <div>
                    <label htmlFor="horarioCheckOut" className="block text-sm font-medium text-gray-700 mb-1">Hora de check-out</label>
                    <input
                        type="time"
                        id="horarioCheckOut"
                        name="horarioCheckOut"
                        value={configuracion.horarioCheckOut}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="politicaCancelacion" className="block text-sm font-medium text-gray-700 mb-1">Política de cancelación</label>
                <textarea
                    id="politicaCancelacion"
                    name="politicaCancelacion"
                    value={configuracion.politicaCancelacion}
                    onChange={handleChange}
                    rows={3}
                    className="p-2 border border-gray-300 rounded-md w-full"
                />
            </div>

            <div>
                <label htmlFor="politicaMascotas" className="block text-sm font-medium text-gray-700 mb-1">Política de mascotas</label>
                <textarea
                    id="politicaMascotas"
                    name="politicaMascotas"
                    value={configuracion.politicaMascotas}
                    onChange={handleChange}
                    rows={2}
                    className="p-2 border border-gray-300 rounded-md w-full"
                />
            </div>
        </div>
    );
};