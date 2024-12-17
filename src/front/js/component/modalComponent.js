import React, { useContext, useState, useEffect } from "react";


export const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto" style={{ zIndex: 1100 }}>
            <div 
                className="bg-white rounded p-4 w-full max-w-3xl overflow-y-auto relative"
                style={{ height: '500px', maxHeight: '90vh' }} // Ajusta la altura aquí
            >
                {/* Botón de cerrar con posición sticky */}
                <button
                    onClick={onClose}
                    className="text-red-500 hover:text-red-600 text-xl font-black rounded-md transition duration-300 transform hover:scale-105" 
                    style={{
                        position: 'sticky',
                        top: 0,
                        right: 0,
                        zIndex: 10,
                        marginLeft: 'auto',
                        display: 'block',
                    }}
                >
                    X
                </button>
                {children}
            </div>
        </div>
    );
};


export const SecondaryModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto" style={{ zIndex: 1100 }}>
            <div 
                className="bg-gray-200 rounded p-4 w-full max-w-md overflow-y-auto relative" // Tamaño más pequeño y fondo gris
                style={{ height: '400px', maxHeight: '80vh' }} // Ajusta la altura aquí
            >
                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    className="text-red-500 hover:text-red-600 text-xl font-black rounded-md transition duration-300 transform hover:scale-105" // Cambié text-gray-500 a text-red-500 y añadí text-xl
                    style={{
                        position: 'sticky',
                        top: 0,
                        right: 0,
                        zIndex: 10,
                        marginLeft: 'auto',
                        display: 'block',
                    }}
                >
                    X
                </button>
                {children}
            </div>
        </div>
    );
};
