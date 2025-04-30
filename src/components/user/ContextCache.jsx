import { habitacionesData } from "../../data/habitaciones";
import { useState, useEffect } from "react";

export const ContextCache = () => {
    const [precioEstadisticas, setPrecioEstadisticas] = useState({});
    const [preciosRangos, setPreciosRangos] = useState({});
    const [capacidadEstadistica, setCapacidadEstadistica] = useState({});
    const [serviciosData, setServiciosData] = useState({
        servicios: {
            basicos: ["wifi", "tv", "baño privado"],
            comunes: ["aire acondicionado", "desayuno", "minibar"],
            premium: ["spa", "jacuzzi", "vista al mar"]
        }
    });
    const fechaActual = { UltimaActualizacion: new Date().toISOString() };

    const getPreciosEstadisticas = () => {
        const precios = habitacionesData.map(habitacion => habitacion.precio);
        const precioMinimo = Math.min(...precios);
        const precioMaximo = Math.max(...precios);
        let precioPromedio = precios.reduce((a, b) => a + b, 0) / precios.length;
        precioPromedio = precioPromedio.toFixed(0);
        const precioPromedioInt = parseInt(precioPromedio);
        setPrecioEstadisticas({
            minimo: precioMinimo,
            maximo: precioMaximo,
            promedio: precioPromedioInt
        });
    };

    const getPreciosRangos = () => {
        if (precioEstadisticas.promedio) { // Asegurarse de que precioEstadisticas ya tiene datos
            const rangoEconomicoMax = precioEstadisticas.promedio - (precioEstadisticas.promedio * 0.3);
            const rangoEconomicoMin = precioEstadisticas.minimo;
            const rangoEstandarMin = rangoEconomicoMax + 1;
            const rangoEstandarMax = precioEstadisticas.promedio + (precioEstadisticas.promedio * 0.3);
            const rangoPremiumMin = rangoEstandarMax + 1;
            const rangoPremiumMax = precioEstadisticas.maximo;

            setPreciosRangos({
                economico: { min: rangoEconomicoMin, max: rangoEconomicoMax },
                estandar: { min: rangoEstandarMin, max: rangoEstandarMax },
                premium: { min: rangoPremiumMin, max: rangoPremiumMax }
            });
        }
    };

    const getCapacidadEstadistica = () => {
        const capacidades = habitacionesData.map(habitacion => habitacion.capacidad);
        const capacidadMinima = Math.min(...capacidades);
        const capacidadMaxima = Math.max(...capacidades);
        setCapacidadEstadistica({ min: capacidadMinima, max: capacidadMaxima });
    };

    useEffect(() => {
        getPreciosEstadisticas();
        getCapacidadEstadistica();
    }, []);

    useEffect(() => {
        if (precioEstadisticas.promedio) {
            getPreciosRangos();
        }
    }, [precioEstadisticas]);

    useEffect(() => {
        const cacheUnificada = {
            precios: precioEstadisticas,
            rango_precios: preciosRangos,
            capacidad: capacidadEstadistica,
            ...serviciosData,
            ...fechaActual
        };

        localStorage.setItem("habitacionesCache", JSON.stringify(habitacionesData));
        console.log("Habitaciones guardadas:", habitacionesData);
        localStorage.setItem("cacheIA", JSON.stringify(cacheUnificada));
        console.log("Cache guardada:", cacheUnificada);
    }, [precioEstadisticas, preciosRangos, capacidadEstadistica, serviciosData, fechaActual]);

    return null; 
};