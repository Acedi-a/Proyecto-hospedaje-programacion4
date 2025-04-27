
export const ReservaConfirmacion = ({ formData, calcularTotal }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-emerald-50 p-4 border-b">
        <h3 className="text-lg font-bold">Confirma tu reserva</h3>
        <p className="text-sm text-gray-500">Revisa los detalles antes de enviar</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><h4 className="text-sm text-gray-500">Habitación</h4><p className="font-medium">{formData.habitacion}</p></div>
          <div><h4 className="text-sm text-gray-500">Huéspedes</h4><p className="font-medium">{formData.huespedes}</p></div>
          <div><h4 className="text-sm text-gray-500">Fecha de llegada</h4><p className="font-medium">{formData.fechaInicio?.toLocaleDateString()}</p></div>
          <div><h4 className="text-sm text-gray-500">Fecha de salida</h4><p className="font-medium">{formData.fechaFin?.toLocaleDateString()}</p></div>
        </div>

        <div className="text-right">
          <h4 className="text-xl font-bold">Total: ${calcularTotal()}</h4>
        </div>
      </div>
    </div>
  )
}
