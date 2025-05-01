import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../../data/firebase';
import { FcGoogle } from 'react-icons/fc';
import { FaMicrosoft, FaGithub } from 'react-icons/fa';
import { User, AlertCircle } from 'lucide-react';
import { db } from '../../data/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const Signup = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+591",
    pass: "",
    confirmPass: ""
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { name, lastName, email, pass, confirmPass, phone, countryCode } = values;

    if (!name || !lastName || !email || !phone || !pass || !confirmPass) {
      setErrorMsg("Por favor complete todos los campos");
      return;
    }
    if (pass !== confirmPass) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }
    if (pass.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setErrorMsg("");
    setSubmitButtonDisabled(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "usuarios", uid), {
        nombre: name,
        apellido: lastName,
        telefono: `${countryCode}${phone}`,
        email: email,
        rol: "usuario",
        creadoEn: new Date()
      });

      setSubmitButtonDisabled(false);
      navigate("/login");
    } catch (err) {
      setSubmitButtonDisabled(false);
      setErrorMsg(err.message);
    }
  };

  const handleSocialSignup = (provider) => {
    let authProvider;

    switch (provider) {
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
      .then(() => {
        setSubmitButtonDisabled(false);
        navigate("/");
      })
      .catch((error) => {
        setSubmitButtonDisabled(false);
        setErrorMsg(error.message);
      });
  };

  return (
    <div className="min-h-screen flex items-center relative">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-r from-emerald-800/90 to-transparent">
          <div className="absolute inset-0 -z-10 bg-[url('https://wallpapers.com/images/hd/4k-ultra-hd-landscape-wallpaper-jentu95x4oxz17b7.jpg')] bg-cover bg-center"></div>
        </div>
      </div>

      <div className="flex-1 z-10 pl-8 md:pl-16 lg:pl-24 pr-4">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Únete a Nosotros</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Crea tu cuenta y comienza a disfrutar de nuestros servicios de hospedaje rural
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-emerald-100/20 backdrop-blur-sm flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white">Reservas simplificadas</span>
            </div>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-emerald-100/20 backdrop-blur-sm flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white">Ofertas exclusivas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-2/5 px-4 py-8 z-10 flex justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Crear Cuenta</h1>
            <p className="text-gray-600 mt-2">Completa tus datos para registrarte</p>
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
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={values.lastName}
                onChange={(e) => setValues({ ...values, lastName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <div className="flex space-x-2 mt-1">
                <select
                  value={values.countryCode}
                  onChange={(e) => setValues({ ...values, countryCode: e.target.value })}
                  className="w-1/3 px-2 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="+591">🇧🇴 +591</option>
                  <option value="+54">🇦🇷 +54</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+55">🇧🇷 +55</option>
                  <option value="+598">🇺🇾 +598</option>
                </select>
                <input
                  type="tel"
                  placeholder="Número sin prefijo"
                  className="w-2/3 px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={values.phone}
                  onChange={(e) => setValues({ ...values, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={values.pass}
                onChange={(e) => setValues({ ...values, pass: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={values.confirmPass}
                onChange={(e) => setValues({ ...values, confirmPass: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitButtonDisabled}
              className="w-full px-4 py-3 font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-50"
            >
              {submitButtonDisabled ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm font-medium text-gray-500">O regístrate con</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <button onClick={() => handleSocialSignup('Google')} disabled={submitButtonDisabled} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-50">
              <FcGoogle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>

            <button onClick={() => handleSocialSignup('Microsoft')} disabled={submitButtonDisabled} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-50">
              <FaMicrosoft className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Microsoft</span>
            </button>

            <button onClick={() => handleSocialSignup('GitHub')} disabled={submitButtonDisabled} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-50">
              <FaGithub className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium text-gray-700">GitHub</span>
            </button>
          </div>

          <p className="text-sm text-center text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-emerald-600 hover:underline">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
