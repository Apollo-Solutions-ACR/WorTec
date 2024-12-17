import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { LogoutButton } from "../component/utilityButtons";
import { VerticalMenu } from "./menu";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const { user } = store;
  const location = useLocation();
  const navigate = useNavigate();
  const defaultUserImg = "https://images.squarespace-cdn.com/content/v1/5e6cfa89c315535aba12ee9d/1620070500897-0BUOX95Q8M9ZB3WQQPPR/Logo+-+Einstein+%282%29.png";
  const [userImg, setUserImg] = useState(user ? user.img : defaultUserImg);
  const [navActive, setNavActive] = useState(null);

  useEffect(() => {
    setNavActive(location.pathname);
    setUserImg(user ? user.img || defaultUserImg : defaultUserImg);
  }, [location.pathname, user, store.user]);

  // State para el ancho de la ventana
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Manejar el redimensionamiento de la ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const provisionalNavbarDev = (
    <nav className="bg-sky-950 p-2 sm:p-4 fixed w-full top-0" style={{ zIndex: 1000 }}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white font-bold text-lg">Navbar Provisional Dev</h1>
        <LogoutButton onClick={() => console.log('Logout button clicked')} />
      </div>
      {windowWidth <= 690 && <VerticalMenu />} {/* Renderiza VerticalMenu solo en pantallas medianas o más pequeñas */}
    </nav>
  );

  const provisionalNavbarInstitution = (
    <nav className="bg-sky-950 p-2 sm:p-4 fixed w-full top-0" style={{ zIndex: 1000 }}>
      <div className="">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white font-bold text-lg">Navbar Provisional Institución</h1>
          <LogoutButton onClick={() => console.log('Logout button clicked')} />
        </div>
      </div>
      {windowWidth <= 690 && (
      <div className="relative"> {/* Contenedor con posición relativa */}
        <VerticalMenu /> {/* Renderiza VerticalMenu solo en pantallas medianas o más pequeñas */}
      </div>
    )}
    </nav>
  );

  const renderNavbarBasedOnRole = () => {
    if (['/registro', '/','/landing', '/login', '/forwotpassword', '/sendpassword', '/changepassword'].includes(navActive)) {
      return null;
    } else if (user && (user.role === 'dev' || user.role === 'service')) {
      return provisionalNavbarDev;
    } else if (user && (user.role === 'institution' || user.role === 'eduadmin' || user.role === 'teacher' || user.role === 'student')) {
      return provisionalNavbarInstitution;
    }
  };

  return (
    <>
      {renderNavbarBasedOnRole()}
    </>
  );
};
