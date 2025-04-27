import React from 'react';

export const AdminConfiguracionReservasPagos = ({ configuracion, handleChange }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Configuración de Reservas y Pagos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="impuestos" className="block text-sm font-medium text-gray-700 mb-1">Impuestos (%)</label>
                    <input
                        type="number"
                        id="impuestos"
                        name="impuestos"
                        value={configuracion.impuestos}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
                <div>
                    <label htmlFor="moneda" className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <select
                        id="moneda"
                        name="moneda"
                        value={configuracion.moneda}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dólar estadounidense ($)</option>
                        <option value="GBP">Libra esterlina (£)</option>
                    </select>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Métodos de pago aceptados</h3>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="pagoTarjeta"
                            name="pagoTarjeta"
                            checked={configuracion.pagoTarjeta}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="pagoTarjeta" className="ml-2 block text-sm text-gray-700">Tarjeta de crédito/débito</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="pagoTransferencia"
                            name="pagoTransferencia"
                            checked={configuracion.pagoTransferencia}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="pagoTransferencia" className="ml-2 block text-sm text-gray-700">Transferencia bancaria</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="pagoPaypal"
                            name="pagoPaypal"
                            checked={configuracion.pagoPaypal}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="pagoPaypal" className="ml-2 block text-sm text-gray-700">PayPal</label>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="reservaAutomatica"
                        name="reservaAutomatica"
                        checked={configuracion.reservaAutomatica}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="reservaAutomatica" className="ml-2 block text-sm text-gray-700">Confirmar reservas automáticamente</label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                    Si está activado, las reservas se confirmarán automáticamente. De lo contrario, requerirán confirmación manual.
                </p>
            </div>
        </div>
    );
};