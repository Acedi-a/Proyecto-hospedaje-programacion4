import { useEffect, useState } from "react";

export const AdminConfiguracionApariencia = ({ configuracion, handleChange, availableLanguages }) => {
    const [modoOscuro, setModoOscuro] = useState(false);

    // Aplicar el color como una variable CSS global
    useEffect(() => {
        document.documentElement.style.setProperty('--color-tema', configuracion.temaColor);
        return () => {
            document.documentElement.style.removeProperty('--color-tema');
        };
    }, [configuracion.temaColor]);

    const toggleModoOscuro = () => {
        setModoOscuro(!modoOscuro);
        document.documentElement.classList.toggle("dark");
    };

    const guardarCambios = () => {
        alert("¡Configuración guardada!");
    };

    const idiomaSeleccionado = availableLanguages.find(lang => lang.value === configuracion.idiomaPrincipal)?.label;

    return (
        <div className="space-y-6 p-4 bg-white dark:bg-gray-900 dark:text-white rounded-lg shadow">
            <h2 className="text-lg font-medium">Configuración de Apariencia</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="temaColor" className="block text-sm font-medium mb-1">Color principal</label>
                    <div className="flex items-center">
                        <input
                            type="color"
                            id="temaColor"
                            name="temaColor"
                            value={configuracion.temaColor}
                            onChange={handleChange}
                            className="h-10 w-10 border-0 p-0"
                        />
                        <span className="ml-2 text-sm">{configuracion.temaColor}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Modo oscuro</label>
                    <button
                        onClick={toggleModoOscuro}
                        className="px-4 py-2 rounded transition"
                        style={{ backgroundColor: "var(--color-tema)", color: "#fff" }}
                    >
                        {modoOscuro ? "Desactivar" : "Activar"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="idiomaPrincipal" className="block text-sm font-medium mb-1">Idioma principal</label>
                    <select
                        id="idiomaPrincipal"
                        name="idiomaPrincipal"
                        value={configuracion.idiomaPrincipal}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:ring-2"
                        style={{ borderColor: "var(--color-tema)", outlineColor: "var(--color-tema)" }}
                    >
                        {availableLanguages.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm">Seleccionado: <strong>{idiomaSeleccionado}</strong></p>
                </div>
                <div>
                    <label htmlFor="idiomasDisponibles" className="block text-sm font-medium mb-1">Idiomas disponibles</label>
                    <select
                        id="idiomasDisponibles"
                        name="idiomasDisponibles"
                        multiple
                        value={configuracion.idiomasDisponibles}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full focus:ring-2"
                        style={{ borderColor: "var(--color-tema)", outlineColor: "var(--color-tema)" }}
                        size={availableLanguages.length > 5 ? 6 : availableLanguages.length}
                    >
                        {availableLanguages.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={guardarCambios}
                className="mt-4 px-6 py-2 rounded text-white transition"
                style={{ backgroundColor: "var(--color-tema)" }}
            >
                Guardar Cambios
            </button>
        </div>
    );
};
