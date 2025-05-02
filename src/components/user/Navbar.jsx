import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Settings, LogIn, ClipboardPlus } from 'lucide-react';
import { auth, db } from '../../data/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const Navbar = ({ uid }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const routes = [
    { href: '/', label: 'Inicio', requiresAuth: false },
    { href: '/reservas', label: 'Mis Reservas', requiresAuth: true },
    { href: '/reservas/nueva', label: 'Nueva Reserva', requiresAuth: false },
    { href: '/calificaciones', label: 'Calificaciones', requiresAuth: false },
    { href: '/celia', label: 'Celia', requiresAuth: false },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const obtenerNombreUsuario = async () => {
      if (!uid) return;
      try {
        const docRef = doc(db, 'usuarios', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const nombre = data.nombre || 'Usuario';
          const nombreCapitalizado = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
          setNombreUsuario(nombreCapitalizado);
        } else {
          console.warn('No se encontró el usuario en Firestore.');
        }
      } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
      }
    };
  
   

    obtenerNombreUsuario();
  }, [uid]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header
      style={{
        borderBottom: '1px solid #ccc',
        backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5), transparent)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        padding: '1rem',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="ml-4 md:ml-0 flex items-center">
              <img
                src="/logo-hostal2.png"
                alt="Logo"
                className="h-72 w-auto p-1 border-emerald-500 rounded-md"
              />
            </Link>
          </div>

          {isMenuOpen && (
            <div className="absolute top-16 left-0 w-full bg-white border-b shadow-lg md:hidden z-50">
              <nav className="flex flex-col gap-4 p-4">
                {routes.map((route) =>
                  ((route.requiresAuth && uid) || !route.requiresAuth) ? (
                    <Link
                      key={route.href}
                      to={route.href}
                      className={`text-lg font-medium transition-colors hover:text-primary px-2 py-1 rounded-md ${
                        isActive(route.href)
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ) : null
                )}
                {uid ? (
                  <>
                    <Link
                      to="/perfil"
                      className="px-3 py-2 text-base hover:bg-gray-100 rounded-md"
                    >
                      {nombreUsuario || 'Perfil'}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center text-left px-3 py-2 text-base hover:bg-gray-100 rounded-md text-red-500"
                    >
                      <LogOut className="h-5 w-5 mr-2" /> Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      to="/login"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-center transition"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/registro"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-center transition"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}

          <nav className="hidden md:flex items-center gap-6">
            {routes.map((route) =>
              ((route.requiresAuth && uid) || !route.requiresAuth) ? (
                <Link
                  key={route.href}
                  to={route.href}
                  className={`text-md font-medium transition-colors hover:text-primary py-2 px-3 rounded-4xl ${
                    isActive(route.href)
                      ? 'text-white bg-emerald-600 font-semibold'
                      : 'bg-white text-muted-foreground'
                  }`}
                >
                  {route.label}
                </Link>
              ) : null
            )}
          </nav>

          <div className="relative flex items-center gap-2">
            {uid ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                >
                  <User className="h-5 w-5" />
                  <span>{nombreUsuario || 'Cuenta'}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border py-1">
                    <Link
                      to="/perfil"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-2" /> {nombreUsuario || 'Perfil'}
                    </Link>
                    <Link
                      to="/reservas"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <ClipboardPlus className="h-4 w-4 mr-2" /> Mis Reservas
                    </Link>
                    <Link
                      to="/configuracion"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-2" /> Configuración
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg shadow hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
