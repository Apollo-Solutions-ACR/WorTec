import React from "react";
// import { FaUser } from "react-icons/fa"; // Icono de usuario

export const SubjectCardElement = () => {
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-400 to-blue-600 text-white p-8 rounded-xl shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl">
        {/* Título */}
        <h2 className="text-center text-3xl font-extrabold mb-6 tracking-wide">
        Mi Clase
        </h2>

        {/* Rectángulo con información del profesor y nivel */}
        <div className="bg-white text-gray-800 p-6 rounded-lg shadow-inner mb-6 hover:bg-gray-100 transition duration-300">
        <p className="text-xl font-bold">
            Profesor: <span className="text-gray-600">Juan Carlos Vega</span>
        </p>
        <p className="mt-2 text-lg font-medium">
            Nivel: <span className="text-gray-500">7A</span>
        </p>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-4">
        <button className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-green-600 transform hover:scale-110 transition duration-300 ease-in-out">
            Participantes
        </button>
        <button className="bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-yellow-600 transform hover:scale-110 transition duration-300 ease-in-out">
            Ingresar
        </button>
        </div>
  </div>
  );
};

export const BookCardElement = () => {
  return (
    <div className="max-w-sm bg-blue-200 text-gray-900 p-6 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        {/* Título */}
        <h2 className="text-center text-3xl font-bold mb-4 animate-pulse">Mi libro</h2>

        {/* Rectángulo con información del profesor y nivel */}
        <div className="bg-white p-5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 mb-4">
        <p className="text-xl font-semibold">Profesor: Juan Carlos Vega</p>
        <p className="mt-2 text-gray-800">Nivel: 7A</p>
        </div>

        {/* Botones */}
        <div className="flex justify-between space-x-4">
        <button className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md transform transition-transform duration-300 hover:bg-green-600 hover:scale-105">
            Participantes
        </button>
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md transform transition-transform duration-300 hover:bg-blue-600 hover:scale-105">
            Ingresar
        </button>
        </div>
  </div>
  );
};


export const NotifiCardElement = () => {
    return (
        <div className="max-w-sm bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white p-6 rounded-xl shadow-lg transform transition-transform duration-500 hover:scale-105 hover:shadow-xl">
            {/* Título */}
            <h2 className="text-center text-3xl font-extrabold mb-6 animate-bounce">Recordatorios</h2>
        
            {/* Rectángulo con información del profesor y nivel */}
            <div className="bg-white text-gray-800 p-5 rounded-lg shadow-lg transform transition-transform duration-300 hover:translate-y-[-5px]">
            <p className="text-xl font-semibold">Profesor: Juan Carlos Vega</p>
            <p className="mt-2 text-gray-700">Nivel: 7A</p>
            </div>
        
            {/* Botones */}
            <div className="flex justify-between mt-6 space-x-4">
            <button className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md transform transition-transform duration-300 hover:bg-green-700 hover:scale-105">
                Participantes
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md transform transition-transform duration-300 hover:bg-blue-700 hover:scale-105">
                Ingresar
            </button>
            </div>
        </div>
    );
  };
  