
export const AdminConfiguracionApariencia = ({ configuracion, handleChange, availableLanguages }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Configuración de Apariencia</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="temaColor" className="block text-sm font-medium text-gray-700 mb-1">Color principal</label>
                    <div className="flex items-center">
                        <input
                            type="color"
                            id="temaColor"
                            name="temaColor"
                            value={configuracion.temaColor}
                            onChange={handleChange}
                            className="h-10 w-10 border-0 p-0" 
                        />
                        <span className="ml-2 text-sm text-gray-500">{configuracion.temaColor}</span>
                    </div>
                </div>
                <div>
                    <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">URL del logo</label>
                    <input
                        type="text"
                        id="logoUrl"
                        name="logoUrl"
                        value={configuracion.logoUrl}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="idiomaPrincipal" className="block text-sm font-medium text-gray-700 mb-1">Idioma principal</label>
                    <select
                        id="idiomaPrincipal"
                        name="idiomaPrincipal"
                        value={configuracion.idiomaPrincipal}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
                    >
                        {availableLanguages.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="idiomasDisponibles" className="block text-sm font-medium text-gray-700 mb-1">Idiomas disponibles (Selecciona varios con Ctrl/Cmd + clic)</label>
                    <select
                        id="idiomasDisponibles"
                        name="idiomasDisponibles"
                        multiple // Habilita selección múltiple
                        value={configuracion.idiomasDisponibles} // El valor es el array de seleccionados
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                        size={availableLanguages.length > 5 ? 6 : availableLanguages.length} // Ajusta el tamaño visible
                    >
                        {availableLanguages.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};