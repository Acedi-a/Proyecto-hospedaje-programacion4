import { Link } from "react-router-dom"
import { CalendarDays, Utensils, Star, MessageSquare } from "lucide-react"

const servicios = [
  {
    icon: CalendarDays,
    title: "Gestión de Reservas",
    description: "Reserva, modifica o cancela tus habitaciones fácilmente desde nuestra plataforma.",
  },
  {
    icon: Utensils,
    title: "Servicios Adicionales",
    description: "Solicita servicios adicionales como desayunos, tours guiados o transporte.",
  },
  {
    icon: MessageSquare,
    title: "Calificaciones",
    description: "Comparte tu experiencia y ayúdanos a mejorar con tus comentarios y sugerencias.",
  }
]

const AccesoRapido = [
  {
    to: "/reservas/nueva",
    title: "Nueva Reserva",
    description: "Reserva una habitación para tu próxima estancia con nosotros.",
    buttonText: "Reservar"
  },
  {
    to: "/reservas",
    title: "Mis Reservas",
    description: "Gestiona tus reservas actuales, modifica detalles o cancela si es necesario.",
    buttonText: "Ver Reservas"
  },
  {
    to: "/login",
    title: "Ver perfil",
    description: "Gestione su perfil y mantenga sus datos actualizados",
    buttonText: "Entrar"
  }
]

const testimonios = [
  {
    name: "María González",
    rating: 5,
    feedback: "Una experiencia maravillosa. Las habitaciones son cómodas y el entorno natural es impresionante. Definitivamente volveré.",
  },
  {
    name: "Carlos Rodríguez",
    rating: 4,
    feedback: "El personal fue muy amable y las instalaciones están muy bien mantenidas. Los servicios adicionales valen la pena.",
  }
]

export const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-[500px] rounded-lg overflow-hidden mb-12">
        <img
          src="https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Hospedaje Rural"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bienvenido a Nuestro Hospedaje Rural</h1>
          <p className="text-xl mb-8 max-w-2xl">
            Disfruta de la tranquilidad y belleza de la naturaleza en nuestras acogedoras habitaciones
          </p>
          <Link
            to="/reservas/nueva"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Reservar Ahora
          </Link>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mb-8">Nuestros Servicios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {servicios.map((service, index) => (
          <div key={index} className="border rounded-lg p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <service.icon className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
            <p className="text-gray-500">{service.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-center mb-8">Acceso Rápido</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {AccesoRapido.map((item, index) => (
          <Link key={index} to={item.to} className="block">
            <div className="border rounded-lg p-6 h-full hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
              <p className="text-gray-500 mb-4">{item.description}</p>
              <button className="mt-auto inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                {item.buttonText}
              </button>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-center mb-8">Lo que dicen nuestros huéspedes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {testimonios.map((testimonial, index) => (
          <div key={index} className="border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-gray-500">{testimonial.rating}.0</span>
            </div>
            <p className="mb-4">{testimonial.feedback}</p>
            <p className="font-semibold">{testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
