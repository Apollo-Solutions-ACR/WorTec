import React, { useContext, useEffect, useState } from "react";
import { JoinClassModal, RequestStatusModal } from '../component/myClassComponent';
import { Context } from "../store/appContext";

// Componente de alerta personalizada
const CustomAlert = ({ message, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-300 p-8 w-96 transform transition-transform hover:scale-105 duration-300 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-white to-white rounded-3xl opacity-30 pointer-events-none"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Atención</h2>
        <p className="text-gray-700 text-lg text-center mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-transform transform hover:scale-105"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );  

export const MyClass = () => {
    const { store, actions } = useContext(Context);
    const { user } = store;
    const [isJoinModalOpen, setJoinModalOpen] = useState(false);
    const [isRequestStatusModalOpen, setRequestStatusModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // Función centralizada para mostrar la alerta
    const showAlert = (message) => {
        setAlertMessage(message);
    };

    // Función para comprobar el estado de los niveles de clase
    const checkClassLevelStatus = async () => {
        try {
            const data = await actions.getRelatedClassLevelsByUser({ userId: user.id });
            
            // Comprobar si hay una solicitud PENDING o REJECTED
            const hasPendingRequest = data.some(classLevel => classLevel.status === 'PENDING');
            const hasRejectedRequest = data.some(classLevel => classLevel.status === 'REJECTED');
            const hasAcceptedRequest = data.some(classLevel => classLevel.status === 'ACCEPTED');

            if (hasPendingRequest || hasRejectedRequest) {
                setRequestStatusModalOpen(true);
            } else if (!hasAcceptedRequest) {
                setJoinModalOpen(true);
            }

        } catch (error) {
            console.error('Error al comprobar los niveles de clase:', error);
            showAlert('Error al comprobar los niveles de clase.');
        }
    };

    const handleRequestChange = async () => {
        setJoinModalOpen(false);
        setRequestStatusModalOpen(false); // Cerrar el modal
        await checkClassLevelStatus(); // Verificar el estado de class levels nuevamente
    };

    useEffect(() => {
        if (user && user.role === 'student') {
            checkClassLevelStatus();
        }
    }, [user]);

    const MyClassStudent = (
        <div className="relative p-8">
            <h1 className="text-3xl font-bold mb-4">Jorge, bienvenido a tu clase</h1>
            <p className="text-sm text-gray-700">
                Aquí encontrarás todas las materias del <span className="font-semibold">Nivel de Clase</span>.
            </p>

            {isJoinModalOpen && (
                <JoinClassModal 
                isOpen={isJoinModalOpen} 
                onClose={() => setJoinModalOpen(false)} 
                onAlert={showAlert} 
                onRequestChange={handleRequestChange} 
              />
            )}
            
            {isRequestStatusModalOpen && (
                <RequestStatusModal 
                    isOpen={isRequestStatusModalOpen} 
                    onClose={() => setRequestStatusModalOpen(false)} 
                    onAlert={showAlert}
                    onRequestChange={handleRequestChange}
                />
            )}
        </div>
    );

    return (
        <>
            {MyClassStudent}
            {alertMessage && (
                <CustomAlert
                    message={alertMessage}
                    onClose={() => setAlertMessage("")}
                />
            )}
        </>
    );
};


