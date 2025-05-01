import { useState } from "react";
import { AdminConfiguracionGeneral } from "../../components/admin/AdminConfiguracionGeneral";
import { AdminConfiguracionReservasPagos } from "../../components/admin/AdminConfiguracionReservasPagos";
import { AdminConfiguracionNotificaciones } from "../../components/admin/AdminConfiguracionNotificaciones";
import { AdminConfiguracionApariencia } from "../../components/admin/AdminConfiguracionApariencia";

export const AdminConfiguracion = () => {
    const [configuracion, setConfiguracion] = useState({
        nombreHospedaje: "Casa Rural El Encanto",
        direccion: "Calle del Pinar, 23, 28730 Buitrago del Lozoya, Madrid",
        telefono: "+34 912 345 678",
        email: "info@casaruralencanto.com",
        horarioCheckIn: "14:00",
        horarioCheckOut: "12:00",
        politicaCancelacion: "Cancelación gratuita hasta 7 días antes de la llegada. Cancelaciones posteriores tendrán un cargo del 50% del total de la reserva.",
        politicaMascotas: "Se permiten mascotas con un suplemento de 15€ por noche.",
        impuestos: 10,
        moneda: "EUR",
        idiomaPrincipal: "es",
        idiomasDisponibles: ["es", "en", "fr"],
        temaColor: "#4f7942",
        logoUrl: "/placeholder.svg?height=100&width=200",
        notificacionesEmail: true,
        notificacionesSMS: false,
        pagoTarjeta: true,
        pagoTransferencia: true,
        pagoPaypal: false,
        reservaAutomatica: true
    });

    const [pestanaActiva, setPestanaActiva] = useState('general');
    const [guardando, setGuardando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');

    // Lógica de manejo de cambios
    const handleChange = (e) => {
        const { name, value, type, checked, options } = e.target;
        if (type === 'select-multiple') {
            const selectedValues = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
            setConfiguracion(prev => ({ ...prev, [name]: selectedValues }));
        } else {
            setConfiguracion(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    // Lógica de envío
    const handleSubmit = (e) => {
        e.preventDefault();
        setGuardando(true);
        console.log('Guardando configuración:', configuracion);
        setTimeout(() => {
            setGuardando(false);
            setMensajeExito('Configuración guardada correctamente');
            setTimeout(() => setMensajeExito(''), 3000);
        }, 1000);
    };

    const availableLanguages = [
        { value: 'es', label: 'Español' },
        { value: 'en', label: 'Inglés' },

    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Configuración del Sistema</h1>

            {mensajeExito && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline">{mensajeExito}</span>
                </div>
            )}

           
                {/* Navegación de Pestañas */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            type="button"
                            onClick={() => setPestanaActiva('general')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${pestanaActiva === 'general' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            General
                        </button>
                        
                    </nav>
                </div>

                {/* Formulario único */}
               
                    {/* Muestra el contenido según la pestaña activa */}
                    {pestanaActiva === 'general' && (
                        <AdminConfiguracionGeneral
                            configuracion={configuracion}
                            handleChange={handleChange}
                        />
                    )}


                    {/* Botón de guardar */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                       
                    </div>
                
           
        </div>
    );
};
