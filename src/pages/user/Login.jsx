import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider, OAuthProvider } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../data/firebase';
import { FcGoogle } from 'react-icons/fc'; 
import { FaMicrosoft, FaGithub } from 'react-icons/fa'; 
import { User, AlertCircle } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", pass: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const checkUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.rol || 'usuario';
      }
      return 'usuario';
    } catch (error) {
      console.error("Error al obtener rol:", error);
      return 'usuario';
    }
  };

  const handleUserNavigation = async (user) => {
    const rol = await checkUserRole(user.uid);
    if (rol === 'admin') {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.email || !values.pass) {
      setErrorMsg("Por favor complete todos los campos");
      return;
    }
    
    setErrorMsg("");
    setSubmitButtonDisabled(true);
    
    signInWithEmailAndPassword(auth, values.email, values.pass)
      .then(async (res) => {
        setSubmitButtonDisabled(false);
        await handleUserNavigation(res.user);
      })
      .catch((err) => {
        setSubmitButtonDisabled(false);
        setErrorMsg(err.message);
      });
  };

  const handleSocialLogin = (provider) => {
    let authProvider;
    
    switch(provider) {
      case 'Google':
        authProvider = new GoogleAuthProvider();
        break;
      case 'Microsoft':
        authProvider = new OAuthProvider('microsoft.com');
        break;
      case 'GitHub':
        authProvider = new GithubAuthProvider();
        break;
      default:
        return;
    }
    
    setSubmitButtonDisabled(true);
    
    signInWithPopup(auth, authProvider)
      .then(async (result) => {
        setSubmitButtonDisabled(false);
        await handleUserNavigation(result.user);
      })
      .catch((error) => {
        setSubmitButtonDisabled(false);
        setErrorMsg(error.message);
      });
  };

  return (
    <div className="min-h-screen flex items-center relative">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-r from-emerald-800/90 to-transparent">
          <div className="absolute inset-0 -z-10 bg-[url('https://wallpapers.com/images/hd/4k-ultra-hd-landscape-wallpaper-jentu95x4oxz17b7.jpg')] bg-cover bg-center"></div>
        </div>
      </div>
      
      {/* Información del hospedaje - lado izquierdo */}
      <div className="flex-1 z-10 pl-8 md:pl-16 lg:pl-24 pr-4">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Hospedaje Rural</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Disfruta de la tranquilidad y belleza de la naturaleza en nuestras acogedoras habitaciones
          </p>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-emerald-100/20 backdrop-blur-sm flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white">Ambiente natural</span>
            </div>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-emerald-100/20 backdrop-blur-sm flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white">Experiencia única</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenedor del formulario - lado derecho */}
      <div className="w-full md:w-1/2 lg:w-2/5 px-4 py-8 z-10 flex justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido a tu experiencia de hospedaje rural
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            </div>
          )}

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
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="tu@email.com"
                value={values.email}
                onChange={(event) => 
                  setValues((prev) => ({ ...prev, email: event.target.value }))
                }
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
                  className="text-sm text-emerald-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                value={values.pass}
                onChange={(event) => 
                  setValues((prev) => ({ ...prev, pass: event.target.value }))
                }
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full px-4 py-3 font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
                disabled={submitButtonDisabled}
              >
                {submitButtonDisabled ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm font-medium text-gray-500">
              O continúa con
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-50"
              disabled={submitButtonDisabled}
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Google
              </span>
            </button>

            <button
              onClick={() => handleSocialLogin('Microsoft')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-50"
              disabled={submitButtonDisabled}
            >
              <FaMicrosoft className="w-5 h-5 mr-2 text-blue-600" />
               <span className="text-sm font-medium text-gray-700">
                Microsoft
              </span>
            </button>
             
             <button
              onClick={() => handleSocialLogin('GitHub')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-50"
              disabled={submitButtonDisabled}
            >
              <FaGithub className="w-5 h-5 mr-2 text-gray-800" />
               <span className="text-sm font-medium text-gray-700">
                GitHub
              </span>
            </button>
          </div>

          <p className="text-sm text-center text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link className="text-emerald-600 hover:underline" to="/signup">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};