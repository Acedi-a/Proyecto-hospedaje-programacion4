import React from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Download } from 'lucide-react'; 
import { ReservaConfirmacion } from './SeccionReservaConfirmacion';

export const SeccionReservaConfirmacionRecibo = ({ formData, calcularTotal, datauser }) => {

    const generatePdf = async () => {
        const doc = new jsPDF(); 
        const marginX = 15;
        const marginY = 20;
        let currentY = marginY;
        const pageHeight = doc.internal.pageSize.getHeight();
        const usableWidth = doc.internal.pageSize.getWidth() - 2 * marginX;

        const addText = (text, x, y, options = {}) => {
            doc.text(text, x, y, options);
            const fontSize = options.fontSize || doc.getFontSize();
            return y + (fontSize / 2.8); 
        };

        const addLine = (y) => {
            doc.setDrawColor(200, 200, 200); 
            doc.line(marginX, y, doc.internal.pageSize.getWidth() - marginX, y);
            return y + 3; 
        };

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        currentY = addText("Hotel Refugio del valle", marginX, currentY); 
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        currentY = addText("Calle Falsa 123, Tarija, Bolivia", marginX, currentY + 1);
        currentY = addText("Tel: +591 4 6612345", marginX, currentY);
        currentY += 5; 

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        currentY = addText("RECIBO DE RESERVA", marginX, currentY);
        currentY += 2;
        currentY = addLine(currentY);
        currentY += 5;

        // --- 2. Información del Huésped y Reserva ---
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        currentY = addText("Huésped:", marginX, currentY);
        doc.setFont("helvetica", "normal");
        currentY = addText(`Nombre: ${datauser.nombre || ''} ${datauser.apellido || ''}`, marginX + 5, currentY);
        currentY = addText(`Email: ${datauser.email || '-'}`, marginX + 5, currentY);
        currentY = addText(`Teléfono: ${datauser.telefono || '-'}`, marginX + 5, currentY);
        currentY += 5;

        doc.setFont("helvetica", "bold");
        currentY = addText("Detalles de la Reserva:", marginX, currentY);
        doc.setFont("helvetica", "normal");
        const fechaLlegada = formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleDateString("es-ES") : '-';
        const fechaSalida = formData.fechaFin ? new Date(formData.fechaFin).toLocaleDateString("es-ES") : '-';
        currentY = addText(`Habitación: ${formData.habitacion || 'No especificada'}`, marginX + 5, currentY);
        currentY = addText(`Llegada: ${fechaLlegada}`, marginX + 5, currentY);
        currentY = addText(`Salida: ${fechaSalida}`, marginX + 5, currentY);
        currentY = addText(`Huéspedes: ${formData.huespedes || '-'}`, marginX + 5, currentY);
        currentY += 8;

        // --- 3. Detalle de Costos ---
        currentY = addLine(currentY);
        currentY += 3;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        currentY = addText("Concepto", marginX, currentY);
        doc.text("Precio (Bs.)", doc.internal.pageSize.getWidth() - marginX, currentY - (doc.getFontSize() / 2.8), { align: 'right' }); 
        currentY += 2;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");


        // Servicios Adicionales
        if (formData.serviciosAdicionales && formData.serviciosAdicionales.length > 0) {
            currentY += 2; 
            formData.serviciosAdicionales.forEach(servicio => {
                if (currentY > pageHeight - 30) {
                    doc.addPage();
                    currentY = marginY;
                }
                const nombreServicio = `- ${servicio.nombre || 'Servicio Adicional'}`;
                currentY = addText(nombreServicio, marginX, currentY, { maxWidth: usableWidth - 40 }); // MaxWidth para nombres largos
                const precioServicio = (Number(servicio.precio) || 0).toFixed(2);
                doc.text(precioServicio, doc.internal.pageSize.getWidth() - marginX, currentY - (doc.getFontSize() / 2.8), { align: 'right' });
            });
            currentY += 5;
        } else {
            currentY = addText("Costo Total Reserva", marginX, currentY);
            const totalSinServicios = calcularTotal() 
            doc.text(totalSinServicios.toFixed(2), doc.internal.pageSize.getWidth() - marginX, currentY - (doc.getFontSize() / 2.8), { align: 'right' });
            currentY += 5;
        }


        // --- 4. Total ---
        currentY = addLine(currentY);
        currentY += 5;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        currentY = addText("TOTAL PAGADO:", marginX, currentY);
        const total = calcularTotal ? calcularTotal() : 0;
        doc.text(`Bs. ${total.toFixed(2)}`, doc.internal.pageSize.getWidth() - marginX, currentY - (doc.getFontSize() / 2.8), { align: 'right' });
        currentY += 5;

        // --- 5. Código QR ---
        const qrSize = 35; 
        const qrX = doc.internal.pageSize.getWidth() - marginX - qrSize;
        let qrY = currentY + 5;

        if (qrY + qrSize > pageHeight - 20) { 
            doc.addPage();
            currentY = marginY; 
            qrY = marginY; 
        }


        // Contenido del QR: puede ser URL, ID de reserva, etc.
        const qrContent = `Reserva Hotel Paradiso\nHuesped: ${datauser.nombre} ${datauser.apellido}\nHab: ${formData.habitacion}\nLlegada: ${fechaLlegada}`;
        try {
            const qrDataURL = await QRCode.toDataURL(qrContent, { errorCorrectionLevel: 'M' });
            doc.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
        } catch (err) {
            console.error("Error generando QR code:", err);
            doc.setFontSize(8);
            doc.text("Error al generar QR", qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' });
        }

        // --- 6. Pie de página ---
        const footerY = pageHeight - 15; 
        if (qrY + qrSize > footerY - 5 && doc.internal.getNumberOfPages() === 1) {

        }

        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("¡Gracias por tu reserva! Esperamos verte pronto.", marginX + 100, footerY, { align: 'center', maxWidth: usableWidth });
        doc.text("Este es un recibo generado automáticamente.", marginX+100, footerY + 4, { align: 'center', maxWidth: usableWidth });


        // --- 7. Guardar PDF ---
        doc.save(`recibo-reserva-hotel-${datauser.apellido || 'huesped'}-${formData.fechaInicio ? formatDateForInput(formData.fechaInicio) : 'fecha'}.pdf`);
    };

    const formatDateForInput = (date) => {
        if (!date || !(date instanceof Date)) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    // --- Renderizado del Componente ---
    return (
        <div>
            <ReservaConfirmacion
                formData={formData}
                calcularTotal={calcularTotal}
                datauser={datauser}
            />

            <div className="mt-6 px-6 pb-6 text-center">
                <button
                    onClick={generatePdf}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Download size={18} />
                    Descargar Recibo (PDF)
                </button>
            </div>
        </div>
    );
};

export { ReservaConfirmacion };