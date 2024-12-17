import React, { useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext"; // Asegúrate de importar el Context

export const LogoutButton = () => {
  const { actions } = useContext(Context); // Ahora dentro del componente
  const navigate = useNavigate(); // Hook para redirigir

  const handleLogout = async (e) => {
    e.preventDefault(); // Asegúrate de que e está definido
    console.log("Handle logout called");
    await actions.logout(); // Llamada a la acción de logout
    navigate("/login"); // Redirige al usuario a la página de inicio de sesión
  };

  return (
    <div>
      <Link
        to="/"
        className="flex justify-center items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 ease-in-out"
        onClick={handleLogout} // Directamente pasar la función sin envolverla
      >
        Log out
      </Link>
    </div>
  );
};
