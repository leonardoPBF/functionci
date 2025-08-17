import { useState } from "react";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Datos de login:", formData);
      alert("¡Login exitoso!");

      // Aquí normalmente harías la redirección o actualización del estado global
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>

      <div className="relative w-full max-w-md">
        {/* Contenedor principal */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header con logo y colores USMP */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-12 text-center relative">
            <div className="absolute inset-0 bg-white opacity-5"></div>
            <div className="relative z-10">
              {/* Fallback visual si no carga la imagen */}
              <div className="h-16 w-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg">
                <span className="text-red-600 font-bold text-xl">USMP</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
              <p className="text-red-100">
                Facultad de Ingeniería y Arquitectura
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-red-500 focus:ring-red-200 hover:border-gray-400"
                    }`}
                    placeholder="correo@usmp.pe"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-red-500 focus:ring-red-200 hover:border-gray-400"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Iniciar Sesión
                  </div>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              {/* Enlaces adicionales */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Enlaces útiles:</p>
                <div className="flex justify-center space-x-4 text-xs">
                  <button className="text-red-600 hover:text-red-700 transition-colors">
                    Portal USMP
                  </button>
                  <button className="text-red-600 hover:text-red-700 transition-colors">
                    Soporte
                  </button>
                  <button className="text-red-600 hover:text-red-700 transition-colors">
                    Ayuda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Texto institucional */}
        <div className="text-center mt-6">
          <p className="text-white text-sm opacity-90">
            Universidad San Martín de Porres
          </p>
          <p className="text-red-200 text-xs mt-1">
            Facultad de Ingeniería y Arquitectura
          </p>
        </div>
      </div>
    </div>
  );
}
