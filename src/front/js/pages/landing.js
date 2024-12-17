import React, { useContext, useState, useEffect } from "react";
import "../../styles/index.css";
import { Login } from '../component/login';
import { useNavigate } from 'react-router-dom';
import { Context } from "../store/appContext";
import LoginImg from "../../img/Login-example.jpg";

export const Landing = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);

    const [landingRender, setLandingRender] = useState(null);

    useEffect(() => {
        if (store.token) {
            navigate('/dashboard');
        }
        setLandingRender(landing);
    }, [navigate, actions, store.token]);

    const landing = (
        <div className="relative min-h-screen flex md:flex-row">
            {/* Imagen de fondo y contenido */}
            <div className="w-full flex items-center justify-center relative p-8">
                {/* Imagen como fondo */}
                <img 
                    src={LoginImg} 
                    alt="Background" 
                    className="absolute top-0 left-0 w-full h-full object-cover" 
                />
                {/* Overlay y contenido */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center p-8 bg-opacity-50 bg-gray-900">
                <div className="p-8 max-w-md">
                    <Login />
                </div>

                    <div className="mx-5 mb-4 text-center text-white">
                        <h4>
                            <a href="#" className="typewrite" data-period="2000" data-type='[ "Learn the art of coding", "Enjoy the journey of learning", "Write code and discover", "Practice to master coding" ]'>
                                <span className="wrap"></span>
                            </a>
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>{landingRender}</>
    );
};
