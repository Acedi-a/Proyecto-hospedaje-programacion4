import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "@/firebase";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const Calificaciones = () => {
  const [resenas, setResenas] = useState([]);
  const [filtroEstrella, setFiltroEstrella] = useState(null);
  const [modalResena, setModalResena] = useState(null);

  // Obtener reseñas desde Firebase
  useEffect(() => {
    const fetchResenas = async () => {
      const q = query(collection(db, "reseñas"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResenas(data);
    };

    fetchResenas();
  }, []);

  // Filtrar por estrella si se seleccionó
  const reseñasFiltradas = filtroEstrella
    ? resenas.filter(r => r.calificacion === filtroEstrella)
    : resenas;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calificaciones</h1>

      {/* Filtro de estrellas */}
      <div className="flex gap-2 mb-4">
        {[5, 4, 3, 2, 1].map(estrella => (
          <Button
            key={estrella}
            variant={filtroEstrella === estrella ? "default" : "outline"}
            onClick={() => setFiltroEstrella(estrella)}
          >
            {estrella} <Star className="ml-1 w-4 h-4 text-yellow-400" />
          </Button>
        ))}
        <Button variant="ghost" onClick={() => setFiltroEstrella(null)}>
          Limpiar filtro
        </Button>
      </div>

      {/* Tabla de reseñas */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Comentario</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reseñasFiltradas.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.usuarioEmail || r.usuarioId}</TableCell>
              <TableCell>{r.calificacion} ⭐</TableCell>
              <TableCell>{r.comentario?.slice(0, 30)}...</TableCell>
              <TableCell>{r.fecha?.seconds ? new Date(r.fecha.seconds * 1000).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{r.estado || "Activo"}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => setModalResena(r)}>Ver detalles</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de detalles */}
      <Dialog open={!!modalResena} onOpenChange={() => setModalResena(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la calificación</DialogTitle>
          </DialogHeader>
          {modalResena && (
            <div className="space-y-2">
              <p><strong>Usuario:</strong> {modalResena.usuarioEmail || modalResena.usuarioId}</p>
              <p><strong>Fecha:</strong> {modalResena.fecha?.seconds ? new Date(modalResena.fecha.seconds * 1000).toLocaleDateString() : "-"}</p>
              <p><strong>Calificación:</strong> {modalResena.calificacion} ⭐</p>
              <p><strong>Comentario:</strong> {modalResena.comentario}</p>
              <p><strong>Estado:</strong> {modalResena.estado || "Activo"}</p>

              {modalResena.historial && modalResena.historial.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-4">Historial de cambios:</h4>
                  <ul className="list-disc ml-5 text-sm">
                    {modalResena.historial.map((h, idx) => (
                      <li key={idx}>
                        {new Date(h.fecha?.seconds * 1000).toLocaleDateString()} - {h.accion} por {h.admin}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calificaciones;
