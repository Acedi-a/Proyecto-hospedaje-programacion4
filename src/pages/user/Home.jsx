import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Phone, Mail } from "lucide-react"; // Removed CalendarDays, Utensils, MessageSquare as we'll use images
import { useState, useEffect } from "react";
import { db } from "../../data/firebase";
import { query, collection, onSnapshot, orderBy, limit } from "firebase/firestore";



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


export const Home = () => {

  const [informacion, setInformacion] = useState({});
  const [infoHabitaciones, setInfoHabitaciones] = useState([]);
  const [serviciosList, setServiciosList] = useState([]); 
  const [testimoniosList, setTestimoniosList] = useState([]); 

  const [loadingHospedajes, setLoadingHospedajes] = useState(true);
  const [loadingHabitaciones, setLoadingHabitaciones] = useState(true);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [loadingTestimonios, setLoadingTestimonios] = useState(true);


  useEffect(() => {
    setLoadingHospedajes(true);
    const qInfo = query(collection(db, "hospedajes"));
    const unsubInfo = onSnapshot(qInfo, (querySnapshot) => {
      let infoData = {};
      querySnapshot.forEach((doc) => {
        infoData = { ...doc.data(), id: doc.id };
      });
      setInformacion(infoData);
      setLoadingHospedajes(false);
    }, (error) => {
      console.error("Error fetching general info:", error);
      setLoadingHospedajes(false);
    });


    setLoadingHabitaciones(true);
    const qHabs = query(
      collection(db, "Habitaciones"),
      limit(4)
    );
    const unsubHabs = onSnapshot(qHabs, (querySnapshot) => {
      let habitacionesList = [];
      querySnapshot.forEach((doc) => {
        habitacionesList.push({ ...doc.data(), id: doc.id });
      });
      setInfoHabitaciones(habitacionesList);
      setLoadingHabitaciones(false);
    }, (error) => {
      console.error("Error fetching rooms:", error);
      setLoadingHabitaciones(false);
    });

    // Fetch the last 4 services from 'Servicios'
    setLoadingServicios(true);
    // Assume 'createdAt' timestamp field exists for ordering
    const qServicios = query(
      collection(db, "Servicios"),
      limit(4)
    );
    const unsubServicios = onSnapshot(qServicios, (querySnapshot) => {
      let serviciosData = [];
      querySnapshot.forEach((doc) => {
        serviciosData.push({ ...doc.data(), id: doc.id });
      });
      setServiciosList(serviciosData);
      setLoadingServicios(false);
    }, (error) => {
      console.error("Error fetching services:", error);
      setLoadingServicios(false);
    });


    setLoadingTestimonios(true);
    const qTestimonios = query(
      collection(db, "reseñas"),
      limit(3)
    );
    const unsubTestimonios = onSnapshot(qTestimonios, (querySnapshot) => {
      let testimoniosData = [];
      querySnapshot.forEach((doc) => {
        testimoniosData.push({ ...doc.data(), id: doc.id });
      });
      setTestimoniosList(testimoniosData);
      setLoadingTestimonios(false);
    }, (error) => {
      console.error("Error fetching testimonials:", error);
      setLoadingTestimonios(false);
    });


    return () => {
      unsubInfo();
      unsubHabs();
      unsubServicios();
      unsubTestimonios();
    };
  }, []); 

  const renderStars = (rating) => {
    const numericRating = typeof rating === 'number' ? rating : parseInt(rating, 10);
    const clampedRating = Math.max(0, Math.min(5, numericRating)); // Ensure rating is between 0 and 5

    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < clampedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ));
  };


  console.log("Informacion general:", informacion);
  console.log("Habitaciones:", infoHabitaciones);
  console.log("Servicios:", serviciosList);
  console.log("Testimonios:", testimoniosList);


  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-screen max-h-[600px] overflow-hidden mb-16">
        <div className="absolute inset-0">
          <img
            src="/foto-hero-home.png" // Make sure this path is correct
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

        {/* Services Section (using fetched data) */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Nuestros Servicios Destacados</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          {loadingServicios ? (
            <p className="text-center text-gray-500">Cargando servicios...</p>
          ) : serviciosList.length === 0 ? (
            <p className="text-center text-gray-500">No se encontraron servicios destacados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> 
              {serviciosList.map((service) => ( 
                <div key={service.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center transform hover:scale-105 transition-transform">
                  <div className=" rounded-full h-auto flex items-center justify-center mb-4 overflow-hidden"> 
                    <img
                    src={service.imagenUrl} 
                    alt={service.nombre}
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-service.png" }}
                    />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{service.nombre}</h3> 
                  <p className="text-gray-600">{service.descripcion}</p> 

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Preview (using fetched room data) */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Nuestras Habitaciones Recientes</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          {loadingHabitaciones ? (
            <p className="text-center text-gray-500">Cargando habitaciones...</p>
          ) : infoHabitaciones.length === 0 ? (
            <p className="text-center text-gray-500">No se encontraron habitaciones.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {infoHabitaciones.map((habitacion) => (
                <div
                  key={habitacion.id}
                  className="relative rounded-lg overflow-hidden h-64 cursor-pointer"
                // onClick={() => setActiveImage(index)}
                >
                  <img
                    src={habitacion.imagenUrl}
                    alt={habitacion.nombre}
                    className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-room.png" }}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium text-lg text-center px-2">{habitacion.nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

        {/* Testimonials Section (using fetched data) */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros huéspedes</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          {loadingTestimonios ? (
            <p className="text-center text-gray-500">Cargando testimonios...</p>
          ) : testimoniosList.length === 0 ? (
            <p className="text-center text-gray-500">No se encontraron testimonios.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimoniosList.map((testimonial) => ( 
                <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6"> 
                  <div className="flex items-center mb-4">

                    <div>
                      <p className="font-semibold">{testimonial.cliente}</p> 
                      <div className="flex">
                        {renderStars(testimonial.puntuacion)} 
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.comentario}"</p> 
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Section with Map */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Nuestra Ubicación</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          </div>
          {loadingHospedajes ? (
            <p className="text-center text-gray-500">Cargando información de ubicación...</p>
          ) : (
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
                    <p className="text-gray-600">Check-in: {informacion.horarioCheckIn}</p>
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
                <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                  <img
                    src="/gotel-ubi.png" 
                    alt="Mapa de ubicación"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
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
  );
};

