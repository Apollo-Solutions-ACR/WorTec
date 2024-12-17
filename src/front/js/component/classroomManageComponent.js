import React, { useState, useEffect, useContext } from 'react';
import { MinimalistDataTable } from './tableRender';
import { Context } from "../store/appContext";

export const ClassLevelRequests = ({ levelId }) => {
    const { actions } = useContext(Context);
    const [requestClassLevelData, setRequestClassLevelData] = useState([]);
    const [rejectedClassLevelData, setRejectedClassLevelData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para obtener solicitudes pendientes
    const fetchRequestData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Solicitando datos con levelId: ${levelId}`);
            const data = await actions.getRelatedClassLevelsByUser({ classLevelId: levelId, status: "PENDING" });
            setRequestClassLevelData(data);
            console.log("Datos pendientes recibidos:", data);
        } catch (error) {
            console.error('Error al obtener el estado de la solicitud:', error);
            setError('Error al obtener el estado de la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener solicitudes rechazadas
    const fetchRejectedData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Solicitando datos con levelId: ${levelId} (REJECTED)`);
            const data = await actions.getRelatedClassLevelsByUser({ classLevelId: levelId, status: "REJECTED" });
            setRejectedClassLevelData(data);
            console.log("Datos rechazados recibidos:", data);
        } catch (error) {
            console.error('Error al obtener los datos de solicitudes rechazadas:', error);
            setError('Error al obtener los datos de solicitudes rechazadas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequestData();
        fetchRejectedData();
    }, [levelId]);

    const columns = [
        { 
            header: "Nombre", 
            accessor: row => {
                const { user } = row;
                return user ? `${user.firstName} ${user.firstLastname || ''} ${user.secondLastname || ''}` : 'No disponible';
            } 
        },
        { header: "DNI", accessor: row => row.user ? row.user.dni : 'No disponible' },
        { header: "Correo", accessor: row => row.user ? row.user.email : 'No disponible' },
        { header: "Tipo", accessor: row => row.user ? (row.user.role === 'student' ? 'Estudiante' : row.user.role) : 'No disponible' },
        { header: "Nivel", accessor: row => row.classLevel ? `${row.classLevel.level} ${row.classLevel.section}` : 'No disponible' }
    ];

    const handleAccept = async (row) => {
        try {
            const formDataToSend = { status: "ACCEPTED" };
            await actions.updateRelatedClassLevelStatus(row.id, formDataToSend.status);
            console.log('Solicitud aceptada:', row);
            
            // Actualizar el estado local para reflejar la aceptación
            setRequestClassLevelData(prevData => prevData.filter(item => item.id !== row.id));

            // Eliminar de la lista de rechazados si existe
            setRejectedClassLevelData(prevData => prevData.filter(item => item.id !== row.id));

        } catch (error) {
            console.error('Error al aceptar la solicitud:', error);
        }
    };
    
    const handleReject = async (row) => {
        try {
            const formDataToSend = { status: "REJECTED" };
            await actions.updateRelatedClassLevelStatus(row.id, formDataToSend.status);
            console.log('Solicitud rechazada:', row);
            
            // Actualizar el estado local
            setRequestClassLevelData(prevData => prevData.filter(item => item.id !== row.id));
            setRejectedClassLevelData(prevData => [...prevData, { ...row, status: "REJECTED" }]);
        } catch (error) {
            console.error('Error al rechazar la solicitud:', error);
        }
    };
    
    const handleDelete = async (id) => {
        console.log("Datos a eliminar:", id);
        try {
            await actions.deleteRelatedClassLevel({ id }); // Asegúrate de enviar un objeto
            console.log('Solicitud eliminada:', id);
            
            // Eliminar de la lista de rechazados
            setRejectedClassLevelData(prevData => prevData.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error al eliminar la solicitud:', error);
        }
    };

    const renderRequestActions = (row) => (
        <div className="flex space-x-2">
            <button onClick={() => handleAccept(row)} className="text-blue-500 hover:text-blue-700">
                <span>Aceptar</span>
            </button>
            <button onClick={() => handleReject(row)} className="text-red-500 hover:text-red-700">
                <span>Rechazar</span>
            </button>
        </div>
    );

    const renderRejectedActions = (row) => (
        <div className="flex space-x-2">
            <button onClick={() => handleAccept(row)} className="text-green-500 hover:text-green-700">
                <span>Aceptar</span>
            </button>
            <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700">
                <span>Eliminar</span>
            </button>
        </div>
    );

    if (loading) {
        return <div>Cargando solicitudes...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container mx-auto px-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Solicitudes Pendientes</h2>
            {requestClassLevelData.length > 0 ? (
                <MinimalistDataTable 
                    columns={columns} 
                    data={requestClassLevelData} 
                    renderActions={renderRequestActions} 
                    keyExtractor={(row) => `${row.classLevelId}-${row.id}`} 
                />
            ) : (
                <div className="text-gray-600 text-lg italic">No hay solicitudes pendientes disponibles.</div>
            )}
            
            <hr className="my-6 border-gray-300" />
        
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Solicitudes Rechazadas</h2>
            {rejectedClassLevelData.length > 0 ? (
                <MinimalistDataTable 
                    columns={columns} 
                    data={rejectedClassLevelData} 
                    renderActions={renderRejectedActions} 
                    keyExtractor={(row) => `${row.classLevelId}-${row.id}`} 
                />
            ) : (
                <div className="text-gray-600 text-lg italic">No hay solicitudes rechazadas disponibles.</div>
            )}
        </div>
    
    );    
};
