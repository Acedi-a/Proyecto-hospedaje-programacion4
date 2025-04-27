// src/components/Login.jsx
import React from 'react';
import { FcGoogle } from 'react-icons/fc'; 
import { FaMicrosoft, FaGithub } from 'react-icons/fa'; 
import { Link } from 'react-router-dom'

export const Login = () => {
  const handleSocialLogin = (provider) => {
    console.log(`Intentando iniciar sesión con ${provider}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Intentando iniciar sesión con correo y contraseña');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Iniciar Sesión
        </h1>
        <p className="text-center text-gray-600">
          Bienvenido de nuevo. ¡Te hemos echado de menos!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <a
                href="#" 
                className="text-sm text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-md hover:shadow-lg"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm font-medium text-gray-500">
            O continúa con
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('Google')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Google
            </span>
          </button>

          <button
            onClick={() => handleSocialLogin('Microsoft')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <FaMicrosoft className="w-5 h-5 mr-2 text-blue-600" />
             <span className="text-sm font-medium text-gray-700">
              Microsoft
            </span>
          </button>
           
           <button
            onClick={() => handleSocialLogin('GitHub')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <FaGithub className="w-5 h-5 mr-2 text-gray-800" />
             <span className="text-sm font-medium text-gray-700">
              GitHub
            </span>
          </button>
        </div>

        <p className="mt-6 text-sm text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link className='text-indigo-600' to="/signup">
            Registrate aqui
          </Link>
        </p>
      </div>
    </div>
  );
};