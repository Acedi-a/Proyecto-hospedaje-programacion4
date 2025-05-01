import { useState } from "react";
import { CreditCard, Lock, Calendar, User, CheckCircle } from "lucide-react";

export const ReservaPago = ({ onSuccess }) => {
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Formatear número de tarjeta mientras se escribe
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(" ") : value;
    };

    // Formatear fecha de expiración
    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (v.length >= 3) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return value;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulación de procesamiento de pago
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            // Llamamos a onSuccess después de mostrar éxito
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess(); // Pasamos al siguiente paso
                }, 1500);
            }
        }, 1500);
    };

    // Efecto visual para el tipo de tarjeta
    const getCardType = () => {
        const visaPattern = /^4/;
        const mastercardPattern = /^5[1-5]/;
        const amexPattern = /^3[47]/;
        if (visaPattern.test(cardNumber.replace(/\s/g, ""))) {
            return "bg-blue-500";
        } else if (mastercardPattern.test(cardNumber.replace(/\s/g, ""))) {
            return "bg-red-500";
        } else if (amexPattern.test(cardNumber.replace(/\s/g, ""))) {
            return "bg-green-500";
        }
        return "bg-gray-300";
    };

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-100 flex flex-col items-center justify-center h-96">
                <div className="text-emerald-500 mb-4 animate-bounce">
                    <CheckCircle className="w-16 h-16" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Exitoso!</h2>
                <p className="text-gray-600 text-center">Tu pago ha sido procesado correctamente.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl">
            {/* Tarjeta visual */}
            <div className={`relative h-48 w-full mb-8 rounded-xl ${getCardType()} bg-gradient-to-br from-gray-900 to-gray-700 p-6 shadow-md transform transition-all duration-300 hover:scale-105`}>
                <div className="absolute top-4 right-4 h-8 w-12 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-200 opacity-70"></div>
                <div className="flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold tracking-wider">TARJETA VIRTUAL</div>
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <div className="my-6">
                        <div className="font-mono text-xl tracking-widest h-6">{cardNumber || "•••• •••• •••• ••••"}</div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-xs opacity-80">TITULAR</div>
                            <div className="font-semibold tracking-wide uppercase truncate max-w-xs">
                                {cardHolder || "TU NOMBRE"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs opacity-80">EXPIRA</div>
                            <div className="font-mono">{expiry || "MM/AA"}</div>
                        </div>
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-emerald-600" />
                Detalles de Pago
            </h1>

            <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Número de Tarjeta */}
                <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        />
                        <CreditCard className="absolute right-3 top-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" />
                    </div>
                </div>

                {/* Nombre del Titular */}
                <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Titular</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                        />
                        <User className="absolute right-3 top-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" />
                    </div>
                </div>

                {/* Fecha de Vencimiento y CVC */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="MM/AA"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                                maxLength={5}
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            />
                            <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="123"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                                maxLength={3}
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                            />
                            <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" />
                        </div>
                    </div>
                </div>

                {/* Botón de Pagar */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${isSubmitting ? "opacity-80" : ""}`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center">
                            <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                            Procesando...
                        </div>
                    ) : (
                        <>
                            <Lock className="w-5 h-5" />
                            Realizar Pago Seguro
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};