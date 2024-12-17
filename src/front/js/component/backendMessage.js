// MessageModal.js
import React, { useEffect } from "react";
import { FaTimes } from 'react-icons/fa';

const MessageModal = ({ message, onClose }) => {
    useEffect(() => {
        // Cerrar el modal automáticamente después de 5 segundos
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message.text) return null; // No mostrar el modal si no hay mensaje

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div 
                className={`bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'} border-l-4`}
                style={{ maxWidth: '600px', width: '90%' }} // Aumentar el tamaño máximo para el modal
            >
                <div className="flex justify-between items-center mb-6">
                    <p className={`text-xl font-bold ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                        {message.text}
                    </p>
                    <button
                        className="text-gray-600 hover:text-gray-800 transition duration-200"
                        onClick={onClose}
                    >
                        <FaTimes size={24} />
                    </button>
                </div>
                <div className="bg-gray-100 rounded p-6">
                    <p className={`text-base ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                        {message.type === 'error' ? 'Por favor, verifica los detalles.' : 'Operación exitosa.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MessageModal;
