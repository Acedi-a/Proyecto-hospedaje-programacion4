// src/components/Signup.jsx
import { FcGoogle } from 'react-icons/fc';
import { FaMicrosoft, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export const Signup = () => {
  const handleSocialSignup = (provider) => {
    console.log(`Intentando registrarse con ${provider}`);
  };

    const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Intentando registrarse con correo y contraseña');

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-cyan-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Crear Cuenta
        </h1>
        <p className="text-center text-gray-600">
          Únete a nosotros. ¡Es rápido y fácil!
        </p>

        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="space-y-4">
           {/* Campo Nombre (Opcional pero común) */}
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700"
            >
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
              placeholder="Tu Nombre Apellido"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
            />
             {/* Podrías añadir requisitos de contraseña aquí */}
             <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres.</p>
          </div>
          <div>
             <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-200 shadow-md hover:shadow-lg"
            >
              Crear Cuenta
            </button>
          </div>
        </form>

        {/* Separador */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm font-medium text-gray-500">
            O regístrate con
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSocialSignup('Google')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-200"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Google
            </span>
          </button>
          <button
            onClick={() => handleSocialSignup('Microsoft')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-200"
          >
            <FaMicrosoft className="w-5 h-5 mr-2 text-blue-600" />
             <span className="text-sm font-medium text-gray-700">
              Microsoft
            </span>
          </button>
           <button
            onClick={() => handleSocialSignup('GitHub')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-200"
          >
            <FaGithub className="w-5 h-5 mr-2 text-gray-800" />
             <span className="text-sm font-medium text-gray-700">
              GitHub
            </span>
          </button>
        </div>

        <p className="mt-6 text-sm text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link className='text-indigo-600' to="/login">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};