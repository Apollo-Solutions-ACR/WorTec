import React, { useState } from "react";
import { Navbar } from "../component/navbar.js";
import { FormParent, FormStudent, FormTeacher } from '../component/register.js';

export const UserAdminPanel = () => {
  // Estado para controlar qué formulario se muestra
  const [form, setForm] = useState(null);

  // Función para manejar la selección de formularios
  const handleFormChange = (formType) => {
    setForm(formType);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-4xl font-semibold text-gray-800 mb-4">Registro de usuarios</h1>
      <hr className="w-3/4 border-gray-300 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl"> {/* Ajustado el espacio entre botones */}
        <button 
          onClick={() => handleFormChange("professor")}
          className={`bg-blue-500 text-white rounded-md shadow-md p-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg ${form === "professor" ? "bg-blue-600 scale-105 shadow-lg rotate-1" : "hover:bg-blue-600 hover:rotate-1"}`} // Cambié p-6 a p-4 y redondeé el botón
        >
          <h2 className="text-lg font-semibold">Registrar Profesor</h2> {/* Cambié a text-lg */}
        </button>
        <button 
          onClick={() => handleFormChange("student")}
          className={`bg-red-500 text-white rounded-md shadow-md p-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg ${form === "student" ? "bg-red-600 scale-105 shadow-lg rotate-1" : "hover:bg-red-600 hover:rotate-1"}`} // Cambié p-6 a p-4 y redondeé el botón
        >
          <h2 className="text-lg font-semibold">Registrar Estudiante</h2>
        </button>
        <button 
          onClick={() => handleFormChange("parent")}
          className={`bg-yellow-500 text-white rounded-md shadow-md p-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg ${form === "parent" ? "bg-yellow-600 scale-105 shadow-lg rotate-1" : "hover:bg-yellow-600 hover:rotate-1"}`} // Cambié p-6 a p-4 y redondeé el botón
        >
          <h2 className="text-lg font-semibold">Registrar Padre</h2>
        </button>
        <button 
          onClick={() => handleFormChange("userManagement")}
          className={`bg-green-500 text-white rounded-md shadow-md p-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg ${form === "userManagement" ? "bg-green-600 scale-105 shadow-lg rotate-1" : "hover:bg-green-600 hover:rotate-1"}`} // Cambié p-6 a p-4 y redondeé el botón
        >
          <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
        </button>
      </div>

      {/* Renderiza el formulario según el estado */}
      <div className="w-full max-w-6xl mt-8">
        {form === "professor" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Formulario de Registro de Profesor</h2>
            <FormTeacher />
          </div>
        )}
        {form === "student" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Formulario de Registro de Estudiante</h2>
            <FormStudent />
          </div>
        )}
        {form === "parent" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Formulario de Registro de Padre</h2>
            {/* Aquí va el formulario para registrar padres */}
          </div>
        )}
        {form === "userManagement" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Formulario de Gestión de Usuarios</h2>
            {/* Aquí va el formulario para gestionar usuarios */}
          </div>
        )}
      </div>
    </div>
  );
};
