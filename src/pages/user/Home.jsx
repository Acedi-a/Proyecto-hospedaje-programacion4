import { Link } from "react-router-dom"
import { CalendarDays, Utensils, Star, MessageSquare, MapPin, Clock, Phone, Mail } from "lucide-react"
import { useState, useEffect } from "react"
import { db } from "../../data/firebase";
import { query, collection, onSnapshot } from "firebase/firestore";


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
    avatar: "/api/placeholder/40/40"
  },
  {
    name: "Carlos Rodríguez",
    rating: 4,
    feedback: "El personal fue muy amable y las instalaciones están muy bien mantenidas. Los servicios adicionales valen la pena.",
    avatar: "/api/placeholder/40/40"
  },
  {
    name: "Ana Martínez",
    rating: 5,
    feedback: "El lugar perfecto para desconectar. La tranquilidad del valle y la amabilidad del personal hacen que quieras quedarte para siempre.",
    avatar: "/api/placeholder/40/40"
  }
]

const galeriaImagenes = [
  { src: "/api/placeholder/400/300", alt: "Habitación Premium" },
  { src: "/api/placeholder/400/300", alt: "Vista al Valle" },
  { src: "/api/placeholder/400/300", alt: "Área Común" },
  { src: "/api/placeholder/400/300", alt: "Restaurante" }
]

export const Home = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [informacion, setInformacion] = useState({});

  useEffect(() => {
    const q = query(collection(db, "hospedajes"));
    const sel = onSnapshot(q, (querySnapshot) => {
      let infoFirebase = [];
      querySnapshot.forEach((doc) => {
        //infoFirebase.push({ ...doc.data(), id: doc.id });
        setInformacion({ ...doc.data(), id: doc.id });
      });
      console.log(infoFirebase);
      //setInformacion(infoFirebase);
    });
    return () => sel();
  }, []);

  console.log(informacion);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-screen max-h-[600px] overflow-hidden mb-16">
        <div className="absolute inset-0">
          <img
            src="/foto-hero-home.png"
            alt="Hospedaje Rural"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-start justify-center text-white p-12 container mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-2xl">Tu refugio en el corazón del valle</h1>
          <p className="text-xl mb-8 max-w-xl">
            Experimenta la perfecta combinación entre naturaleza y confort en nuestro exclusivo hospedaje rural
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/reservas/nueva"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              Reservar Ahora
            </Link>
            <Link
              to="/galeria"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-colors"
            >
              Ver Galería
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Bienvenido a Nuestro Refugio</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Situado en el corazón del valle, nuestro hospedaje ofrece una experiencia única donde la
              tranquilidad de la naturaleza se combina con el confort y la atención personalizada.
              Un lugar perfecto para desconectar y crear recuerdos inolvidables.
            </p>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Nuestros Servicios</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicios.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center transform hover:scale-105 transition-transform">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <service.icon className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Preview */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Nuestras Instalaciones</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {galeriaImagenes.map((image, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden h-64 cursor-pointer"
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">{image.alt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Acceso Rápido</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AccesoRapido.map((item, index) => (
              <Link key={index} to={item.to} className="block">
                <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-emerald-600">
                  <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-gray-600 mb-6">{item.description}</p>
                  <button className="mt-auto inline-flex items-center px-4 py-2 border border-emerald-600 text-sm font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 transition-colors">
                    {item.buttonText}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros huéspedes</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonios.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.feedback}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Location Section with Map */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Nuestra Ubicación</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Cómo Encontrarnos</h3>
              <div className="flex items-start mb-4">
                <MapPin className="h-5 w-5 text-emerald-600 mt-1 mr-3" />
                <p className="text-gray-600">{informacion.direccion}</p>
              </div>
              <div className="flex items-start mb-4">
                <Clock className="h-5 w-5 text-emerald-600 mt-1 mr-3" />
                <div>
                  <p className="text-gray-600">Check-in: {informacion.horarioCheckIn} - 20:00</p>
                  <p className="text-gray-600">Check-out: hasta las {informacion.horarioCheckOut}</p>
                </div>
              </div>
              <div className="flex items-start mb-4">
                <Phone className="h-5 w-5 text-emerald-600 mt-1 mr-3" />
                <p className="text-gray-600">{informacion.telefono}</p>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-emerald-600 mt-1 mr-3" />
                <p className="text-gray-600">{informacion.email}</p>
              </div>
            </div>
            <div className="h-96 rounded-lg overflow-hidden shadow-md">
              {/* Placeholder for Google Maps */}
              <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                <img
                  src="/api/placeholder/800/400"
                  alt="Mapa de ubicación"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mb-16">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src="/api/placeholder/1200/400"
              alt="Valle panorámico"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/90 to-emerald-600/80 flex flex-col items-center justify-center text-white text-center p-6">
              <h2 className="text-3xl font-bold mb-4">¿Listo para una experiencia inolvidable?</h2>
              <p className="mb-6 max-w-2xl">
                Reserva ahora y disfruta de la tranquilidad y belleza de nuestro refugio en el valle.
              </p>
              <Link
                to="/reservas/nueva"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-emerald-700 transition-colors"
              >
                Reservar Ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;