import React, { useContext, useState } from "react";
import "../../styles/index.css";
import logoFox from "../../img/FoxIcon.png";
import { Link, useNavigate } from 'react-router-dom';
import { Context } from "../store/appContext";
import { height } from "@fortawesome/free-solid-svg-icons/fa0";

export const Login = () => {
    const { store, actions } = useContext(Context);
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorLogin, setErrorLogin] = useState(null);
    const navigate = useNavigate();

    const handleEmailOrUsernameChange = (e) => {
        setEmailOrUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Handle Login called");

        const credentials = {
            email_or_username: emailOrUsername, // Clave esperada por el backend
            password: password
        };

        try {
            const response = await actions.loginUser(credentials);

            if (response.success) {
                // Redirige al usuario después de un login exitoso
                navigate('/dashboard');
            } else {
                // Muestra un mensaje de error si el login falla
                setErrorLogin("Inicio de sesión fallido. Verifique sus credenciales.");
            }
        } catch (error) {
            console.log(error);
            setErrorLogin("Ocurrió un error al intentar iniciar sesión.");
        }
    };

    return (
        <section className="flex items-center justify-start">
            <div className="container mx-auto px-4">
                <div className="row">
                    <div className="col-md-4 col-lg-3 col-xl-3 order-2 order-md-1">
                        {/* Contenedor con flex-col para apilar el logo y el título */}
                        <div className="flex flex-col justify-center items-center mb-4">
                            <div className="mb-2">
                                <img
                                    src={logoFox}
                                    alt="Logo"
                                    className="w-full h-auto"
                                    style={{ height: "200px", width: "200px" }}
                                />
                            </div>
                            <div className="relative text-center"> {/* Ajuste el margen para que quede más cerca */}
                                <h1 className="text-6xl text-orange-500 font-extrabold">Academica</h1>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8 col-lg-5 col-xl-6 order-1 order-md-2">
                        <div className="flex justify-center items-center mb-4 flex-col">
                            <form className="ml-4" onSubmit={handleLogin}>
                                <div className="col-md-12">
                                    {errorLogin && (
                                        <div
                                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-2 max-w-full mx-auto"
                                            role="alert"
                                        >
                                            <div className="flex items-center">
                                                <i className="fa-solid fa-triangle-exclamation text-2xl font-bold text-red-600 mr-2"></i>
                                                <div>{errorLogin}</div>
                                                <button
                                                    type="button"
                                                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                                                    onClick={() => setErrorLogin(null)}
                                                >
                                                    <span className="text-red-700">×</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="form-outline mb-4">
                                    <input
                                        type="text"
                                        id="inputEmailLogin"
                                        className="p-3 border border-gray-300 rounded w-full max-w-5xl py-2 px-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                        placeholder="Username or Email"
                                        value={emailOrUsername}
                                        onChange={handleEmailOrUsernameChange}
                                    />
                                </div>
    
                                <div className="form-outline mb-5">
                                    <input
                                        type="password"
                                        id="inputPasswordLogin"
                                        className="p-3 border border-gray-300 rounded w-full max-w-5xl text-black py-2 px-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                        placeholder="Password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                                <div className="text-center">
                                    <button
                                        type="submit"
                                        className="rounded-full mb-2 custom-orange-btn text-white py-2 px-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        Log in
                                    </button>
                                </div>
    
                                <div className="text-center mt-3">
                                    <button
                                        type="button"
                                        className="rounded-full bg-cyan-400 text-white py-2 px-6 hover:bg-cyan-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <Link
                                            to="/forgotpassword"
                                            className="text-white no-underline w-full h-full flex justify-center items-center"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );       
};
