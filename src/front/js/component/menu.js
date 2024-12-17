import React, { useRef, useEffect, useState, useContext } from 'react';
import { Context } from "../store/appContext";
import { useNavigate } from 'react-router-dom';

import LogoFox from '../../img/FoxIcon.png';
import { BsArrowLeftShort, BsChevronDown, BsArrowUpSquareFill } from 'react-icons/bs';
import { AiFillEnvironment, AiOutlineUser, AiOutlineProject } from 'react-icons/ai';
import { RiDashboardFill, RiLogoutCircleLine } from 'react-icons/ri';
import { FiHome } from 'react-icons/fi';
import { MdPageview, MdSettings } from 'react-icons/md';
import { HiPhotograph, HiOutlineMail } from 'react-icons/hi';
import { GiAchievement } from 'react-icons/gi';

const MenuItemsForDevService = [
  { title: "Dashboard", submenu: false, path: "/dashboard", icon: <FiHome /> },
  { title: "Pages", submenu: false, path: "/pages", icon: <MdPageview /> },
  { title: "Media", submenu: false, spacing: true, path: "/media", icon: <HiPhotograph /> },
  {
    title: "Projects",
    submenu: true,
    icon: <AiOutlineProject />,
    submenuItems: [
      { title: "Submenu 1", path: "/projects/submenu1", icon: <RiDashboardFill /> },
      { title: "Submenu 2", path: "/projects/submenu2", icon: <BsArrowUpSquareFill /> },
      { title: "Submenu 3", path: "/projects/submenu3", icon: <AiFillEnvironment /> },
    ],
  },
  { title: "Analytics", submenu: false, path: "/analytics", icon: <GiAchievement /> },
  { title: "Inbox", submenu: false, path: "/inbox", icon: <HiOutlineMail /> },
  { title: "Profile", submenu: false, spacing: true, path: "/profile", icon: <AiOutlineUser /> },
  { title: "Settings", submenu: false, path: "/settings", icon: <MdSettings /> },
  { title: "Logout", submenu: false, path: "/", icon: <RiLogoutCircleLine /> },
];

const MenuItemsForInstitution = [
  { title: "Dashboard", submenu: false, path: "/dashboard", icon: <FiHome /> },
  { title: "Administración", submenu: false, path: "/academicManagement", icon: <MdPageview /> },
  { title: "Media", submenu: false, spacing: true, path: "/media", icon: <HiPhotograph /> },
  {
    title: "Projects",
    submenu: true,
    icon: <AiOutlineProject />,
    submenuItems: [
      { title: "Submenu 1", path: "/projects/submenu1", icon: <RiDashboardFill /> },
      { title: "Submenu 2", path: "/projects/submenu2", icon: <BsArrowUpSquareFill /> },
      { title: "Submenu 3", path: "/projects/submenu3", icon: <AiFillEnvironment /> },
    ],
  },
  { title: "Analytics", submenu: false, path: "/analytics", icon: <GiAchievement /> },
  { title: "Inbox", submenu: false, path: "/inbox", icon: <HiOutlineMail /> },
  { title: "Profile", submenu: false, spacing: true, path: "/profile", icon: <AiOutlineUser /> },
  { title: "Settings", submenu: false, path: "/settings", icon: <MdSettings /> },
  { title: "Logout", submenu: false, path: "/", icon: <RiLogoutCircleLine /> },
];

const MenuItemsForTeacher = [
  { title: "Dashboard", submenu: false, path: "/dashboard", icon: <FiHome /> },
  { title: "Profile", submenu: false, path: "/profile", icon: <AiOutlineUser /> },
  { title: "Settings", submenu: false, path: "/settings", icon: <MdSettings /> },
  { title: "Logout", submenu: false, path: "/", icon: <RiLogoutCircleLine /> },
];

const MenuItemsForStudent = [
  { title: "Dashboard", submenu: false, path: "/dashboard", icon: <FiHome /> },
  { title: "Profile", submenu: false, path: "/profile", icon: <AiOutlineUser /> },
  { title: "Settings", submenu: false, path: "/settings", icon: <MdSettings /> },
  { title: "Logout", submenu: false, path: "/", icon: <RiLogoutCircleLine /> },
];

const MenuItemsForParent = [
  { title: "Dashboard", submenu: false, path: "/dashboard", icon: <FiHome /> },
  { title: "Profile", submenu: false, path: "/profile", icon: <AiOutlineUser /> },
  { title: "Settings", submenu: false, path: "/settings", icon: <MdSettings /> },
  { title: "Logout", submenu: false, path: "/", icon: <RiLogoutCircleLine /> },
];


export const Menu = () => {
  const { store, actions } = useContext(Context); // Acceso a store y acciones
  const { user } = store; // Asumiendo que el usuario está en el contexto
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const navigate = useNavigate(); // Hook para redirección

  const toggleMenu = () => {
    if (open) setSubmenuOpen(null); // Cierra el submenú al retraer el menú
    setOpen(!open);
  };

  // Función para manejar el logout
  const handleLogout = async () => {
    await actions.logout(); // Llama a la acción de logout
    navigate("/"); // Redirige a la página de inicio de sesión
  };

  // Selecciona los items del menú basado en el rol del usuario
  const Menus = (user && user.role) ? (
    user.role === 'dev' || user.role === 'service' ? MenuItemsForDevService :
    user.role === 'institution' || user.role === 'eduadmin' ? MenuItemsForInstitution :
    user.role === 'teacher' ? MenuItemsForTeacher :
    user.role === 'student' ? MenuItemsForStudent :
    user.role === 'parent' ? MenuItemsForParent :
    [] // Valor predeterminado: un arreglo vacío
  ) : []; // Si no hay usuario, devolver un arreglo vacío

  const handleMenuClick = (path) => {
    navigate(path); // Redirige a la ruta especificada
  };

  return (
    <div className="flex fixed" style={{ zIndex: 999 }}>
      <div
        className={`bg-sky-950 h-screen p-5 pt-8 duration-300 relative`}
        style={{ width: open ? "208px" : "72px" }}
      >
        <BsArrowLeftShort
          className={`bg-orange-500 text-dark text-[1.75rem] rounded-full absolute -right-3 top-9 cursor-pointer duration-500 ${!open && "rotate-180"}`}
          onClick={toggleMenu}
        />
        <div className="flex items-center">
          <img
            src={LogoFox}
            alt="Menu Icon"
            className={`bg-black cursor-pointer block float-left mr-2 duration-500 ${open && "rotate-[360deg]"}`} // Rotación solo cuando open es true
            style={{ width: "35px", height: "35px", objectFit: "contain" }} // Mantener el tamaño constante
          />
          <h1
            className={`text-white origin-left font-medium text-2xl duration-300 ${!open && "scale-0"}`}
          >
            Academica
          </h1>
        </div>

        {/* Contenedor de la lista con scroll en hover */}
        <ul className="pt-2 overflow-y-auto max-h-[80vh] hover:overflow-y-scroll scrollbar-hide">
          {Menus.map((menu, index) => (
            <React.Fragment key={index}>
              <li
                className={`text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 hover:bg-gray-700 rounded-md ${menu.spacing ? "mt-9" : "mt-2"}`}
                onClick={() => menu.title === "Logout" ? handleLogout() : menu.submenu ? setSubmenuOpen(submenuOpen === index ? null : index) : handleMenuClick(menu.path)}
              >
                <span className="text-2xl block float-left">
                  {menu.icon} {/* Aquí usamos el icono de cada item */}
                </span>
                <span className={`text-base font-medium flex-1 duration-300 ${!open && "scale-0"}`}>
                  {menu.title}
                </span>
                {menu.submenu && open && (
                  <BsChevronDown
                    className={`ml-auto ${submenuOpen === index ? "rotate-180" : ""} duration-300 ${!open && "scale-0"} transition-transform duration-200`}
                  />
                )}
              </li>
              {menu.submenu && (
                <ul
                  className={`transition-all duration-300 overflow-hidden ${submenuOpen === index && open ? "max-h-40" : "max-h-0"}`}
                >
                  {menu.submenuItems.map((submenuItem, subIndex) => (
                    <li
                      key={subIndex}
                      className={`text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 px-5 hover:bg-gray-600 rounded-md duration-300 ${!open && "scale-0"}`}
                      onClick={() => handleMenuClick(submenuItem.path)} // Redirigir al hacer clic en el submenú
                    >
                      {submenuItem.icon} {/* Aquí usamos el icono de cada submenú */}
                      {submenuItem.title}
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
};


export const VerticalMenu = () => {
  const { store } = useContext(Context);
  const { user } = store; 
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(null);
  const navigate = useNavigate();

  const menuRef = useRef(null); // Ref para el contenedor del menú

  // Cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false); // Cerrar el menú si el clic es fuera
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Menú de acuerdo al rol del usuario
  const Menus = (user && user.role) ? (
    user.role === 'dev' || user.role === 'service' ? MenuItemsForDevService :
    user.role === 'institution' || user.role === 'eduadmin' ? MenuItemsForInstitution :
    user.role === 'teacher' ? MenuItemsForTeacher :
    user.role === 'student' ? MenuItemsForStudent :
    user.role === 'parent' ? MenuItemsForParent :
    [] // Valor predeterminado: un arreglo vacío
  ) : []; 

  const handleMenuClick = (path) => {
    navigate(path); // Redirige a la ruta especificada
  };

  const toggleSubmenu = (index) => {
    setSubmenuOpen(submenuOpen === index ? null : index); // Alterna la apertura del submenú
  };

  return (
    <div 
      className="flex flex-col fixed left-1/2 transform -translate-x-1/2" 
      style={{ width: "208px"  }} 
      ref={menuRef} // Asignamos el ref al contenedor del menú
    >
      <div className={`flex flex-col bg-sky-950 h-full duration-300 transition-all ${open ? 'max-h-screen' : 'max-h-0 overflow-hidden'} md:hidden`} style={{ zIndex: 1001 , width: open ? "208px" : "72px"}}>
        <div className="flex items-center p-4">
          <div className="inline-flex">
            <img
              src={LogoFox}
              alt="Menu Icon"
              className={`bg-black cursor-pointer block float-left mr-2 duration-500 ${open && "rotate-[360deg]"}`} 
              style={{ width: "35px", height: "35px", objectFit: "contain"}} 
            />
          </div>
          <h1 className={`text-white origin-left font-medium text-2xl duration-300 ${!open && "scale-0"}`}>
            Academica
          </h1>
        </div>

        <ul className="pt-2 overflow-y-auto max-h-[80vh] hover:overflow-y-scroll scrollbar-hide">
          {Menus.map((menu, index) => (
            <React.Fragment key={index}>
              <li
                className={`text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 hover:bg-gray-700 rounded-md ${menu.spacing ? "mt-9" : "mt-2"}`}
                onClick={() => menu.submenu ? toggleSubmenu(index) : handleMenuClick(menu.path)}
              >
                <span className={`text-2xl block float-left duration-300 ${!open && "scale-0"}`}>
                  {menu.icon} 
                </span>
                <span className={`text-base font-medium flex-1 duration-300 ${!open && "scale-0"}`}>
                  {menu.title}
                </span>
                {menu.submenu && (
                  <BsChevronDown
                    className={`ml-auto transform ${submenuOpen === index ? "rotate-180" : ""} duration-300`}
                  />
                )}
              </li>
              {menu.submenu && (
                <ul className={`transition-all duration-300 overflow-hidden ${submenuOpen === index ? "max-h-40" : "max-h-0"}`}>
                  {menu.submenuItems.map((submenuItem, subIndex) => (
                    <li
                      key={subIndex}
                      className={`text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 px-5 hover:bg-light-white rounded-md duration-300`}
                      onClick={() => handleMenuClick(submenuItem.path)} 
                    >
                      {submenuItem.icon} 
                      {submenuItem.title}
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>

      <div className={`flex justify-center items-bottom transition-all`}>
        <BsArrowUpSquareFill
          className={`text-orange-500 text-[1.8rem] cursor-pointer duration-300 ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        />
      </div>
    </div>
  );
};
