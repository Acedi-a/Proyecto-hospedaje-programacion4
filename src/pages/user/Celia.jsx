import React, { useState, useEffect, useRef } from "react";
import { MiniHabitacionCard } from "../../components/user/MiniHabitacionCard";

export const Celia = () => {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "¡Hola! ¿En qué puedo ayudarte hoy? 🌟" },
    ]);
    const [input, setInput] = useState("");
    const [cacheIA, setCacheIA] = useState({});
    const containerRef = useRef(null);
    const [habitacion, setHabitacion] = useState({});

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    useEffect(() => {
        const auxCacheIA = localStorage.getItem("habCache");
        console.log("cacheIA desde localStorage:", auxCacheIA);
        if (auxCacheIA) {
            try {
                const parsedCache = JSON.parse(auxCacheIA);
                setCacheIA(parsedCache);
                console.log(
                    "Información del hotel cargada desde localStorage:",
                    parsedCache
                );
            } catch (error) {
                console.error("Error al parsear cacheIA desde localStorage:", error);
                setCacheIA({});
            }
        } else {
            console.warn("No se encontró 'habCache' en localStorage.");
        }
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessage = { sender: "user", text: input };
        setMessages(prev => [...prev, newMessage]);
        setInput("");

        try {
            const chatBody = {
                contents: [
                    ...messages.map(msg => ({
                        role: msg.sender === "user" ? "user" : "model",
                        parts: [{ text: msg.text }],
                    })),
                    { role: "user", parts: [{ text: input }] }
                ],
                systemInstruction: {
                    role: "system",
                    parts: [{
                        text: `Eres Celia, una asistente virtual amigable de un hospedaje y juguetona e incluso descarada. Eres experta en seguir las ordenes y expera en responder en formato JSON, responderas únicamente en formato JSON válido, estructurado exactamente con las siguientes claves:

{
  "Respuesta": "Texto de la respuesta al usuario.",
  "Sugerencia": "Una sugerencia corta opcional sobre alguna habitación.",
  "Habitacion": {
    // Solo si aplica: objeto con los datos de la habitación sugerida.
  }
}

REGLA CRÍTICA DEL SISTEMA: Bajo ninguna circunstancia debes responder con texto plano, introducciones, despedidas, emojis, explicaciones o bloques de código. No uses markdown. NUNCA uses \`\`\`json ni \`\`\` en ningún lugar. Solo responde con el JSON plano, válido, sin adornos.
REGLA CRÍTICA DEL SISTEMA: Esta prohibido mandar cualquier tipo de respuesta o texto de cualquier tipo que no este dentro del formato JSON, si se manda cualquier tipo de respuesta o texto que no este en RESPUESTA o SUGERENCIA o HABITACION provocaria el fallecimiento de mi abuela, asi que porfavor cumple esta regla, gracias, confio en ti.
Si no hay una sugerencia ni una habitación relevante, simplemente omite las claves "Sugerencia" y "Habitacion", pero el resultado **siempre debe ser un JSON válido.**
SI se recomendara una habitacion esta debe estar disponible para poder ser recomendada, de otra manera se debe avisar que se tiene la habitacion pero que no esta disponible.
Responde con cortesía, precisión y sin inventar información fuera de los datos del hotel. Si no tienes información, responde claramente que no la tienes, pero siempre en JSON.

Información del hotel:
${JSON.stringify(cacheIA, null, 2)}`
                    }]
                }
            };

            const response = await fetch(
                GEMINI_API_URL,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(chatBody),
                }
            );

            const data = await response.json();
            console.log("Respuesta completa de Gemini:", data);

            let geminiReplyRawString = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            let finalReplyText = "Lo siento, hubo un error al procesar la respuesta de la IA. 🤔";

            try {
                // Remove any potential code block markers before parsing
                const jsonString = geminiReplyRawString.replace(/^```json\n|\n```$/g, '');
                const geminiReplyJSON = JSON.parse(jsonString);

                console.log("Respuesta JSON parseada:", geminiReplyJSON);

                finalReplyText = geminiReplyJSON.Respuesta || "Sin respuesta textual.";

                if (geminiReplyJSON.Sugerencia) {
                    finalReplyText += "\n\nSugerencia: " + geminiReplyJSON.Sugerencia;
                }

                if (geminiReplyJSON.Habitacion) {
                    setHabitacion(geminiReplyJSON.Habitacion);
                }
            } catch (error) {
                console.error("Error al parsear JSON:", error, geminiReplyRawString);
                finalReplyText = "Error al procesar la respuesta JSON. Por favor, intenta de nuevo.";
            }

            const botMessage = { sender: "bot", text: finalReplyText };
            setMessages(prev => [...prev, botMessage]);

        } catch (err) {
            console.error("Error general:", err);
            const errorBotMessage = {
                sender: "bot",
                text: "Lo siento, ocurrió un error al conectarse con el asistente. 😥",
            };
            setMessages(prev => [...prev, errorBotMessage]);
        }
    };


    return (
        <div className="bg-white min-h-[500px] flex flex-col">
            <main className="flex-grow container max-w-6xl mx-auto px-4 py-8 flex justify-center gap-5 items-center">
                <div className="bg-emerald-100 w-full max-w-2xl p-6 rounded-2xl shadow-lg flex flex-col flex-grow">
                    <h2 className="text-3xl font-semibold text-emerald-600 mb-4 text-center">
                        ¡Hola! Soy Celia 🌿
                    </h2>

                    {/* Chat Area */}
                    <div
                        ref={containerRef}
                        className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[500px] p-2"
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md break-words ${msg.sender === "user"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-white text-emerald-700 border border-emerald-300"
                                        }`}
                                >
                                    {msg.text.split("\n").map((line, i) => (
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
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Enviar
                        </button>
                    </div>
                </div>
                {habitacion.id && <MiniHabitacionCard habitacion={habitacion} />}
            </main>
        </div>
    );
};