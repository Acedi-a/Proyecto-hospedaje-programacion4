import { useState, useEffect } from "react";
import { db } from "../../data/firebase";
import { collection, getDocs } from "firebase/firestore";

export const ContextCache = () => {
    const [habitacionesData, setHabitacionesData] = useState([]);
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const habitacionesCollection = collection(db, "Habitaciones");
                const querySnapshot = await getDocs(habitacionesCollection);
                const habitaciones = [];

                querySnapshot.forEach((doc) => {
                    habitaciones.push({ id: doc.id, ...doc.data() });
                });

                setHabitacionesData(habitaciones);
                console.log("Habitaciones obtenidas:", habitaciones);
            } catch (error) {
                console.error("Error al obtener las habitaciones:", error);
            }
        };

        fetchData();
    }, []);

    // Calculate statistics once we have habitacionesData
    useEffect(() => {
        if (habitacionesData.length > 0) {
            getPreciosEstadisticas();
            getCapacidadEstadistica();
        }
    }, [habitacionesData]);

    // Calculate price ranges once we have price statistics
    useEffect(() => {
        if (precioEstadisticas.promedio) {
            getPreciosRangos();
        }
    }, [precioEstadisticas]);

    // Save all data to localStorage once we have everything
    useEffect(() => {
        if (preciosRangos.economico && habitacionesData.length > 0) {
            const fechaActual = { UltimaActualizacion: new Date().toISOString() };

            const cacheUnificada = {
                habitaciones: habitacionesData,
                precios: precioEstadisticas,
                rango_precios: preciosRangos,
                capacidad: capacidadEstadistica,
                ...serviciosData,
                ...fechaActual
            };

            localStorage.setItem("habCache", JSON.stringify(cacheUnificada));
            console.log("Cache guardada en localStorage:", cacheUnificada);
        }
    }, [habitacionesData, precioEstadisticas, preciosRangos, capacidadEstadistica, serviciosData]);

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
        if (precioEstadisticas.promedio) {
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

        setCapacidadEstadistica({
            min: capacidadMinima,
            max: capacidadMaxima
        });
    };

    return null;
};