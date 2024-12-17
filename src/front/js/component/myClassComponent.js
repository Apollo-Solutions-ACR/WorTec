import React, { useContext, useEffect, useState } from "react";
import { useSpring, animated } from '@react-spring/web';
import { Context } from "../store/appContext";


export const JoinClassModal = ({ isOpen, onClose, onAlert, openRequestStatusModal, onRequestChange }) => {
  const { actions, store } = useContext(Context);
  const { user } = store;
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState(null); // Estado para manejar el relatedClassLevel existente

  const springProps = useSpring({
    transform: isOpen ? 'rotateX(0deg) translateY(0px)' : 'rotateX(90deg) translateY(-100px)',
    opacity: isOpen ? 1 : 0,
    config: { mass: 1, tension: 180, friction: 14 },
  });

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const data = await actions.getRelatedClassLevelsByUser({ userId: user.id });
        if (data.length > 0) {
          setRequestData(data[0]); // Guardar el primer registro encontrado
        }
      } catch (error) {
        console.error('Error al obtener el estado de la solicitud:', error);
        onAlert('Error al obtener el estado de la solicitud.');
      }
    };

    if (isOpen) {
      fetchRequestData();
    }
  }, [isOpen, actions, user.id, onAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) {
      onAlert('El código de clase es obligatorio');
      return;
    }
  
    setLoading(true);
    try {
      const formData = { code: classCode };
      const result = await actions.createRelatedClassLevel(formData);
  
      if (result) {
        onAlert("Solicitud enviada con éxito. Espera la aprobación.");
        onRequestChange(); // Llama a la función para verificar el estado
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      onAlert('Hubo un problema al intentar enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Si NO existe un registro en relatedClassLevel, no permitimos cerrar el modal
    if (!requestData) {
      onAlert("Debes enviar una solicitud antes de cerrar el modal.");
      return;
    }

    // Si existe un registro, cerramos este modal y abrimos el otro
    onClose();
    openRequestStatusModal(); // Abrir el modal de estado de la solicitud
  };

  return (
    <div 
      className={`fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
      onClick={handleClose}
    >
      <animated.div 
        className="bg-gray-900 rounded-3xl p-8 shadow-xl relative max-w-lg w-full" 
        style={springProps} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-white">Solicitud de ingreso al nivel</h2>
        {!requestData && (
          <>
            <p className="text-lg text-gray-300 text-center mb-4">Introduce el código de tu clase para solicitar acceso.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                className="block w-full px-4 py-3 bg-gray-700 text-white border border-gray-500 rounded-2xl text-lg focus:ring-4 focus:ring-blue-600 focus:outline-none focus:border-blue-600 placeholder-gray-400"
                placeholder="Ingresa el código de clase"
                required
                disabled={loading}
             />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 transform-gpu rotate-6 blur-lg opacity-40 pointer-events-none rounded-2xl"></div>
              </div>
              <button 
                type="submit" 
                className={`w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold rounded-full hover:from-orange-600 hover:to-yellow-500 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-transform transform hover:scale-105 shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Solicitar'}
              </button>
            </form>
          </>
        )}
      </animated.div>
    </div>
  );
};




export const RequestStatusModal = ({ isOpen, onClose, onAlert, onRequestChange }) => {
  const { actions, store } = useContext(Context);
  const { user } = store;
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false); // Estado para el modal de confirmación

  const springProps = useSpring({
    transform: isOpen ? 'rotateX(0deg) translateY(0px)' : 'rotateX(90deg) translateY(-100px)',
    opacity: isOpen ? 1 : 0,
    config: { mass: 1, tension: 180, friction: 14 },
  });

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const data = await actions.getRelatedClassLevelsByUser({ userId: user.id });
        console.log("Datos obtenidos:", data);
        if (data.length > 0) {
          setRequestData(data[0]); // Suponiendo que solo necesitas el primer elemento
        }
      } catch (error) {
        console.error('Error al obtener la solicitud:', error);
        onAlert('Error al obtener la solicitud.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchRequestData();
    }
  }, [isOpen, actions, user.id, onAlert]);

  const handleDeleteRequest = async () => {
    if (requestData && requestData.id) {
      setDeleting(true);
      try {
        const result = await actions.deleteRelatedClassLevel({ id: requestData.id });
        console.log("Resultado de la eliminación:", result);
        onAlert("Solicitud cancelada exitosamente.");
        onClose();
        onRequestChange();
      } catch (error) {
        console.error('Error al cancelar la solicitud:', error);
        onAlert('Error al cancelar la solicitud.');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleClose = () => {
    if (requestData && requestData.status === 'PENDING') {
      onAlert("Tu solicitud aún está pendiente. Espera a que sea aceptada para cerrar este modal o si cometiste un error, cancela la solicitud.");
    } else {
      onClose();
    }
  };

  const confirmCancelRequest = () => {
    setShowConfirmation(true); // Mostrar modal de confirmación
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    handleDeleteRequest(); // Ejecutar la eliminación si confirma
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false); // Cerrar el modal de confirmación sin eliminar
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={handleClose}
    >
      <animated.div className="bg-gray-900 rounded-3xl p-8 shadow-xl relative max-w-lg w-full" style={springProps} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-3xl font-bold text-center mb-6 text-white">Tu Solicitud</h2>

        {loading ? (
          <p className="text-lg text-gray-300 text-center mb-4">Cargando...</p>
        ) : requestData ? (
          <div>
            <p className="text-lg text-gray-300 mb-4">
              Nivel de Clase: <span className="font-semibold text-white">{requestData.classLevel?.level} {requestData.classLevel?.section}</span>
            </p>
            <p className="text-lg text-gray-300 mb-4">
              Estado: <span className="font-semibold text-white">
                {requestData.status === 'PENDING' ? 'Pendiente' : requestData.status === 'REJECTED' ? 'Rechazada' : requestData.status}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-lg text-gray-300 text-center mb-4">No tienes solicitudes pendientes.</p>
        )}

        <button
          className="mt-6 w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold rounded-full hover:from-orange-600 hover:to-yellow-500 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-transform transform hover:scale-105 shadow-lg"
          onClick={confirmCancelRequest} // Cambiar a mostrar la confirmación
          disabled={loading || (requestData && !['PENDING', 'REJECTED'].includes(requestData.status))}
        >
          {deleting ? 'Cancelando...' : 'Cancelar solicitud'}
        </button>

        {/* Modal de Confirmación */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full text-center">
              <p className="text-lg mb-4">
                ¿Estás seguro que quieres cancelar tu solicitud? Cancela la solicitud solamente si cometiste un error al ingresar el código de tu nivel o si la solicitud ha sido rechazada. (Las solicitudes rechazadas se cancelan automáticamente luego de 24 horas).
              </p>
              <div className="flex justify-around mt-4">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
                  onClick={handleConfirmCancel}
                >
                  Sí, cancelar
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 focus:outline-none"
                  onClick={handleCancelConfirmation}
                >
                  No, volver
                </button>
              </div>
            </div>
          </div>
        )}
      </animated.div>
    </div>
  );
};
