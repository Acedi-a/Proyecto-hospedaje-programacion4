import { Link } from "react-router-dom"
import { Facebook, Instagram, Twitter } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="bg-background border-t py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Hospedaje Rural</h3>
            <p className="text-muted-foreground">
              Ofrecemos una experiencia única en contacto con la naturaleza y la tranquilidad del campo.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/reservas" className="text-muted-foreground hover:text-foreground transition-colors">
                  Mis Reservas
                </Link>
              </li>
              <li>
                <Link to="/reservas/nueva" className="text-muted-foreground hover:text-foreground transition-colors">
                  Nueva Reserva
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="text-muted-foreground hover:text-foreground transition-colors">
                  Servicios Adicionales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <address className="not-italic text-muted-foreground">
              <p>Camino Rural 123</p>
              <p>Valle Verde, Región</p>
              <p>Teléfono: +123 456 7890</p>
              <p>Email: info@hospedajerural.com</p>
            </address>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Hospedaje Rural. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
