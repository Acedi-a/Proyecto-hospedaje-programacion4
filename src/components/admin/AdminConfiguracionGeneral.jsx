import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../data/firebase';

export const AdminConfiguracionGeneral = () => {
    const [configuracion, setConfiguracion] = useState({
        nombreHospedaje: '',
        email: '',
        telefono: '',
        direccion: '',
        horarioCheckIn: '',
        horarioCheckOut: '',
        politicaCancelacion: '',
        politicaMascotas: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const configDocRef = doc(db, 'hospedajes', 'hospedaje');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const docSnap = await getDoc(configDocRef);
                if (docSnap.exists()) {
                    setConfiguracion(docSnap.data());
                } else {
                    setError('No se encontró el documento de configuración.');
                }
            } catch (err) {
                console.error(err);
                setError('Error al obtener los datos.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfiguracion((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await setDoc(configDocRef, configuracion, { merge: true });
            alert('Configuración guardada exitosamente.');
        } catch (err) {
            console.error(err);
            setError('Error al guardar los datos.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-center mt-4">Cargando datos...</p>;

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Configuración General del Hospedaje</h1>

            {/* Campos de formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre del hospedaje</label>
                    <input
                        type="text"
                        name="nombreHospedaje"
                        value={configuracion.nombreHospedaje}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email de contacto</label>
                    <input
                        type="email"
                        name="email"
                        value={configuracion.email}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={configuracion.telefono}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Dirección</label>
                    <input
                        type="text"
                        name="direccion"
                        value={configuracion.direccion}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Hora de check-in</label>
                    <input
                        type="time"
                        name="horarioCheckIn"
                        value={configuracion.horarioCheckIn}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Hora de check-out</label>
                    <input
                        type="time"
                        name="horarioCheckOut"
                        value={configuracion.horarioCheckOut}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Política de cancelación</label>
                <textarea
                    name="politicaCancelacion"
                    value={configuracion.politicaCancelacion}
                    onChange={handleChange}
                    rows={3}
                    className="p-2 border border-gray-300 rounded-md w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Política de mascotas</label>
                <textarea
                    name="politicaMascotas"
                    value={configuracion.politicaMascotas}
                    onChange={handleChange}
                    rows={2}
                    className="p-2 border border-gray-300 rounded-md w-full"
                />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="text-right">
                <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-2 rounded-md text-white text-sm font-medium ${saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};
