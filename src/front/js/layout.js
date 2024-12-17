import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import { Context } from "./store/appContext";
import { Index } from "./pages/index";
import { Modulos } from "./pages/modulos";
import { CreateExcercise } from "./pages/createexcercise";
import { Profile } from "./pages/profile";
import { ChangePassword } from "./pages/changePassword";
import { ForwotPassword } from "./pages/forwotpassword";
import { SendPassword } from "./pages/sendpassword";
import { Usuarios } from "./pages/usuarios";
import { AboutUs } from "./pages/aboutUs";
import { RoadMap } from "./pages/roadMap";
import { Demo } from "./pages/demo";
import { PreguntaCompletar } from "./pages/ejerciciosPorModulo";
import { Ejercicios } from "./pages/ejercicios";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";
// Se necesitan de aqui para abajo
import { Navbar } from "./component/navbar";
import { Menu } from "./component/menu";
import { Footer } from "./component/footer";
import { Login } from "./component/login";
import { Dashboard } from "./pages/dashboard";
import { DragAndDropList } from "./pages/dragAndDropList";
import { Landing } from "./pages/landing";
import { UserAdminPanel } from "./pages/userAdminPanel";
import { AcademicManagement } from "./pages/academicManagement";
import { MyClass } from "./pages/myClass";
import { LevelManageClassroom } from "./pages/classroomManage";
import { AllSubjectRender } from "./pages/allSubjectRender";
import { Progress } from "./pages/progress";
import { NotFound } from "./pages/NotFound";
// Provisional
import { LogoutButton } from "./component/utilityButtons";

//create your first component
const Layout = () => {
  const { store, actions } = useContext(Context);
  const basename = process.env.BASENAME || "";
  const [token, setToken] = useState();
  const [user, setUser] = useState(null);

  if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") 
    return <BackendURL />;
 
  useEffect(() => {
    if (!store.token) {
      setToken(store.token);
      
    }
    if (store.token) {
      // const verifyToken = async () => {
      //   const result = await actions.verifyToken(); // Llamada a la acción desde Flux
        
      //   if (!result.success) {
      //     console.error("Token inválido o expirado. Deslogueando...");
      //   }
      // };
  
      // verifyToken();
    }
  }, [store.token]);

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

  return (
    <div className={`relative bg-gray-100 min-h-screen flex flex-col ${store.token ? "pt-24 md:pt-12" : ""}`}>
      <BrowserRouter basename={basename}>
        <ScrollToTop>    
        {store.token && windowWidth > 690 && <Menu />}
        {store.token && <Navbar />}
          {/* Contenedor para las rutas con padding-left cuando hay un token */}
          <div className={`${store.token && windowWidth > 690 ? "flex-grow pl-16 pt-12 sm:pt-12" : ""} bg-gray-100`}>
            <Routes>
              <Route element={<Landing />} path="/" />
              <Route element={<Index />} path="/Index" />
              <Route element={<Login />} path="/login" />
              <Route element={<ChangePassword />} path="/changepassword" />
              <Route element={<ForwotPassword />} path="/forwotpassword" />
              <Route element={<SendPassword />} path="/sendpassword" />
              <Route element={<AboutUs />} path="/about" />
              <Route element={<RoadMap />} path="/roadmap" />
              {store.token ? (
                <>
                  <Route element={<Dashboard />} path="/dashboard" />
                  <Route element={<UserAdminPanel />} path="/userAdminPanel" />
                  <Route element={<AcademicManagement />} path="/academicManagement" />
                  <Route element={<LevelManageClassroom />} path="/classroomManage" />
                  <Route element={<MyClass />} path="/MyClass" />
                  <Route element={<Profile />} path="/profile" />
                  <Route element={<AllSubjectRender />} path="/subjects" />
                  <Route element={<Modulos />} path="/modules" />
                  <Route element={<CreateExcercise />} path="/createexcercise" />
                  <Route element={<DragAndDropList />} path="/dragAndDropList" />
                  <Route element={<Usuarios />} path="/usuarios" />
                  <Route element={<PreguntaCompletar />} path="/preguntas/:modulo/:theid" />
                  <Route element={<Ejercicios />} path="/preguntas/:modulo" />
                  <Route element={<Demo />} path="/demo" />
                  <Route element={<Single />} path="/single/:theid" />
                  <Route element={<Progress />} path="/progress" />
                  
                </>
              ) : null}
  
              <Route element={<NotFound />} path="*" />
            </Routes>
          </div>
          {store.token && <Footer />}
        </ScrollToTop>
      </BrowserRouter>
      
    </div>
  );  
};

export default injectContext(Layout);
