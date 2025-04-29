import React, { useState, useEffect, useRef } from "react";

export const Celia = () => {
    const [messages, setMessages] = useState([
        { from: "celia", text: "¡Hola! ¿En qué puedo ayudarte hoy? 🌟" },
    ]);
    const [input, setInput] = useState("");
    const [cacheIA, setCacheIA] = useState({}); // Guardará la info del hotel
    const containerRef = useRef(null);

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    //console.log("API Key:", GEMINI_API_KEY);
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    // Carga la información del hotel desde localStorage al iniciar
    useEffect(() => {
        const auxCacheIA = localStorage.getItem("cacheIA");
        console.log("cacheIA desde localStorage:", auxCacheIA.toString());
        if (auxCacheIA) {
            try {
                setCacheIA(JSON.parse(auxCacheIA));
                console.log("Información del hotel cargada desde localStorage:", JSON.parse(auxCacheIA));
            } catch (error) {
                console.error("Error al parsear cacheIA desde localStorage:", error);
                setCacheIA({}); // Resetea si hay error
            }
        } else {
            console.warn("No se encontró 'cacheIA' en localStorage.");
        }
    }, []);

    // Hace scroll hacia abajo cuando llegan nuevos mensajes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        const trimmedInput = input.trim();
        if (trimmedInput === "") return;

        // Añade el mensaje del usuario al estado inmediatamente
        const userMessage = { from: "user", text: trimmedInput };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput(""); // Limpia el input

        // --- Preparación para la API de Gemini ---

        // 1. Instrucción del Sistema: Define el rol y contexto de Celia
        const systemInstruction = {
            parts: [{
                text: `Eres Celia, una asistente virtual amigable y servicial de un hospedaje.
Tu objetivo es ayudar a los usuarios con sus consultas sobre el hotel.
Utiliza la siguiente información del hotel cuando sea relevante para responder:
${JSON.stringify(cacheIA, null, 2)}

Reglas importantes:
- Sé cordial, profesional y responde de forma concisa.
- Si la consulta lo amerita y tienes la información, sugiere una habitación adecuada.
- No inventes información que no esté proporcionada. Si no sabes algo, indícalo amablemente.
- Mantén un tono positivo 🌟.`
            }]
        };

        // 2. Contenido de la Conversación (Historial)
        // Mapea el estado `messages` al formato requerido por la API (roles 'user' y 'model')
        const formattedContents = updatedMessages.map(msg => ({
            // Asigna el rol correcto ('model' para Celia, 'user' para el usuario)
            role: msg.from === 'celia' ? 'model' : 'user',
            parts: [{ text: msg.text }],
        }));

        // 3. (Opcional) Configuración de Generación
        const generationConfig = {
            temperature: 0.7, // Controla la creatividad (0 = determinista, 1 = más creativo)
            maxOutputTokens: 250, // Límite de tokens en la respuesta
            // Puedes añadir otras configuraciones aquí (topP, topK, etc.)
        };

        // --- Llamada a la API ---
        try {
            console.log("Enviando a Gemini API:", {
                 contents: formattedContents,
                 systemInstruction: systemInstruction,
                 generationConfig: generationConfig
             });

            const response = await fetch(GEMINI_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: formattedContents, // Historial de la conversación
                    systemInstruction: systemInstruction, // Instrucciones para Celia
                    generationConfig: generationConfig, // Configuración de generación
                }),
            });

             console.log("Respuesta cruda de la API:", response);


            if (!response.ok) {
                 const errorBody = await response.text(); // Intenta leer el cuerpo del error
                 console.error("Error en la respuesta de la API:", response.status, response.statusText, errorBody);
                 throw new Error(`Error ${response.status}: ${response.statusText}. ${errorBody}`);
             }


            const data = await response.json();
             console.log("Datos recibidos de Gemini:", data);


            // Extrae la respuesta del modelo (con manejo seguro de errores)
            const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude procesar tu solicitud en este momento. 🤔";

            let finalReply = geminiReply;

            // Lógica para sugerir atención personalizada después de 5 mensajes del usuario
            const userMessagesCount = updatedMessages.filter(m => m.from === "user").length;
            if (userMessagesCount >= 5) {
                finalReply += "\n\nSi necesitas asistencia más detallada o realizar una reserva, te invito a contactar a nuestro equipo de atención personalizada. ¡Estarán felices de ayudarte! 📞";
            }

            // Añade la respuesta de Celia al estado
            setMessages(prev => [...prev, { from: "celia", text: finalReply }]);

        } catch (error) {
            console.error("Error al comunicarse con la API de Gemini:", error);
            setMessages(prev => [...prev, { from: "celia", text: "¡Ups! Ocurrió un error al intentar conectar con mi cerebro digital. Por favor, intenta de nuevo más tarde. ⚙️" }]);
        }
    };

    return (
        // El JSX se mantiene igual que en tu código original
        <div className="bg-white min-h-[500px] flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
                <div className="bg-emerald-100 w-full max-w-2xl p-6 rounded-2xl shadow-lg flex flex-col flex-grow">
                    <h2 className="text-3xl font-semibold text-emerald-600 mb-4 text-center">
                        ¡Hola! Soy Celia 🌿
                    </h2>

                    {/* Chat Area */}
                    <div ref={containerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[500px] p-2">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md break-words ${
                                        msg.from === "user"
                                            ? "bg-emerald-500 text-white"
                                            : "bg-white text-emerald-700 border border-emerald-300"
                                    }`}
                                >
                                    {/* Simple replace para mostrar saltos de línea */}
                                    {msg.text.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex items-center space-x-2 border-t border-emerald-200 pt-4">
                        <input
                            type="text"
                            placeholder="Escribe tu consulta aquí..."
                            className="flex-1 border border-emerald-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) { // Enviar con Enter (no Shift+Enter)
                                    e.preventDefault(); // Prevenir nueva línea en input
                                    handleSend();
                                }
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()} // Deshabilitar si no hay texto
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};