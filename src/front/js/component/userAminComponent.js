import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { MinimalistDataTable, UserFilter } from "./tableRender";
import { UserAdminPanel } from "../pages/userAdminPanel";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaRegIdCard, FaClipboardList, FaTimes } from 'react-icons/fa';
import MessageModal from "./backendMessage";
import { Modal } from "./modalComponent";

export const UserAdmin = () => {
    const { actions: { getUsersBasic, batchUpdateUsers } } = useContext(Context);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [resultsPerPage, setResultsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState([]);


    const columns = [
        { header: "Nombre", accessor: row => `${row.firstName || 'No disponible'} ${row.firstLastname?.trim() || ''} ${row.secondLastname?.trim() || ''}`.trim() },
        { header: "Usuario", accessor: "username" },
        { header: "Rol", accessor: row => row.role ? row.role.charAt(0).toUpperCase() + row.role.slice(1).toLowerCase() : 'No disponible' },
        { header: "Estado", accessor: row => row.status || 'No disponible' },
        { header: "Nivel", accessor: row => row.classLevels && row.classLevels.length > 0 ? `${row.classLevels[0]?.level || 'No disponible'} ${row.classLevels[0]?.section || ''}`.trim() : 'No disponible' },
    ];

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const data = await getUsersBasic();
                setUsers(data);
                setFilteredUsers(data);
                setTotalItems(data.length);
            } catch (error) {
                console.error("Error al cargar los usuarios:", error);
                setMessage({ type: "error", text: "Error al cargar los usuarios." });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [getUsersBasic]);

    useEffect(() => {
        const filtered = users.filter(user => {
            const fullName = `${user.firstName || ''} ${user.firstLastname || ''} ${user.secondLastname || ''}`.trim().toLowerCase();
            const searchValue = searchTerm.toLowerCase();
            const roleMatch = selectedRole ? user.role === selectedRole : true;
            const levelMatch = selectedLevel ? user.classLevels?.some(level => level.level === parseInt(selectedLevel, 10)) : true;
            const statusMatch = selectedStatus ? user.status === selectedStatus : true;
            return fullName.includes(searchValue) && roleMatch && levelMatch && statusMatch;
        });
        setFilteredUsers(filtered);
        setTotalItems(filtered.length);
        setCurrentPage(1);
    }, [searchTerm, selectedRole, selectedLevel, selectedStatus, users]);

    const handleRowSelection = (selectedIds) => {
        setSelectedUserIds(selectedIds);
    };

    const updateUserStatusInList = (updatedUser) => {
        const userWithUpperCaseStatus = {
            ...updatedUser,
            status: updatedUser.status.toUpperCase()
        };

        setUsers(prevUsers => {
            return prevUsers.map(user => 
                user.id === updatedUser.id ? userWithUpperCaseStatus : user
            );
        });
        setFilteredUsers(prevFilteredUsers => {
            return prevFilteredUsers.map(user => 
                user.id === updatedUser.id ? userWithUpperCaseStatus : user
            );
        });
    };

    const handleBatchUpdate = async (status) => {
        try {
            const result = await batchUpdateUsers(selectedUserIds, status);
            if (result.message) {
                setMessage({ text: result.message, type: 'success' });
    
                // Actualiza solo los usuarios en filteredUsers
                setFilteredUsers(prevFilteredUsers => 
                    prevFilteredUsers.map(user => 
                        selectedUserIds.includes(user.id) ? { ...user, status } : user
                    )
                );

                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        selectedUserIds.includes(user.id) ? { ...user, status } : user
                    )
                );
            } else {
                setMessage({ text: error.message, type: 'error' });
            }
        } catch (error) {
            console.error("Error al realizar el batch update:", error);
            setMessage({ text: error.message, type: 'error' });
        }
    };    

    useEffect(() => {
        if (isModalOpen || isRegisterModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen, isRegisterModalOpen]);

    const handleResultsPerPageChange = (newResultsPerPage) => {
        setResultsPerPage(newResultsPerPage);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > Math.ceil(totalItems / resultsPerPage)) return;
        setCurrentPage(newPage);
    };

    return (
        <div className="w-full flex flex-col">
            {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}
            <UserFilter
                data={users}
                onSearch={setSearchTerm}
                onResultsPerPageChange={setResultsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                resultsPerPage={resultsPerPage}
                setSelectedRole={setSelectedRole}
                setSelectedLevel={setSelectedLevel}
                setSelectedStatus={setSelectedStatus}
                searchTerm={searchTerm}
                selectedRole={selectedRole}
                selectedLevel={selectedLevel}
                selectedStatus={selectedStatus}
            />
            <div className="overflow-x-auto">
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <MinimalistDataTable
                        enableSelection={true}
                        columns={columns}
                        data={filteredUsers.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)}
                        onRowClick={(row) => {
                            setSelectedUserId(row.id);
                            setIsModalOpen(true);
                        }}
                        onSelectionChange={handleRowSelection}
                    />
                )}
            </div>
            {selectedUserIds.length === 0 && (
                <div className="mt-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setIsRegisterModalOpen(true)}
                    >
                        Registrar Usuario
                    </button>
                </div>
            )}
            {selectedUserIds.length > 0 && (
                <div className="mt-4 flex space-x-2">
                    <button
                        className="bg-blue-500 text-white rounded-md shadow-md px-3 py-2"
                        onClick={() => handleBatchUpdate("GRADUATED")}
                    >
                        Egresar usuarios
                    </button>
                    <button
                        className="bg-orange-500 text-white rounded-md shadow-md px-3 py-2"
                        onClick={() => handleBatchUpdate("INACTIVE")}
                    >
                        Inactivar usuarios
                    </button>
                    <button
                        className="bg-green-600 text-white rounded-md shadow-md px-3 py-2"
                        onClick={() => handleBatchUpdate("ACTIVE")}
                    >
                        Activar usuarios
                    </button>
                    <button
                        className="bg-red-500 text-white rounded-md shadow-md px-3 py-2"
                        onClick={() => handleBatchUpdate("DEPRECIATED")}
                    >
                        Eliminar usuarios
                    </button>
                </div>
            )}
            {isModalOpen && (
                <UserDetailsModal 
                    userId={selectedUserId} 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    updateUserStatusInList={updateUserStatusInList}
                />
            )}
            {isRegisterModalOpen && (
                <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)}>
                    <UserAdminPanel onClose={() => setIsRegisterModalOpen(false)} />
                </Modal>
            )}
            <MessageModal message={message} onClose={() => setMessage({ type: "", text: "" })} />
        </div>
    );
};


export const UserDetailsModal = ({ userId, isOpen, onClose, updateUserStatusInList }) => {
    const { actions } = useContext(Context);
    const [userDetails, setUserDetails] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (isOpen && userId) {
            const fetchUserDetails = async () => {
                try {
                    const data = await actions.getUserDetails(userId);
                    setUserDetails(data);
                } catch (error) {
                    console.error("Error al cargar los detalles del usuario:", error);
                    setMessage({ type: "error", text: "Error al cargar los detalles del usuario." });
                }
            };
            fetchUserDetails();
        }
    }, [isOpen, userId, actions]);

    if (!isOpen || !userId) return null;

    const handleChangeStatus = async (newStatus) => {
        try {
            const updatedUser = await actions.updateSingleUser(userId, { status: newStatus });
            setUserDetails(updatedUser); // Actualiza los detalles del usuario con la nueva información
            updateUserStatusInList(updatedUser); // Actualiza el estado en el componente principal
            console.log(`El estado del usuario se ha actualizado a: ${newStatus}`);
            setMessage({ type: "success", text: `El estado del usuario se ha actualizado a: ${newStatus}` });
        } catch (error) {
            console.error("Error al cambiar el estado del usuario:", error);
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const renderButtons = () => {
        switch (userDetails?.status) {
            case "active":
                return (
                    <>
                        <button
                            onClick={() => handleChangeStatus("graduated")}
                            className="text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-sm mr-2"
                        >
                            Egresar
                        </button>
                        <button
                            onClick={() => handleChangeStatus("inactive")}
                            className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm mr-2"
                        >
                            Inactivar
                        </button>
                        <button
                            onClick={() => handleChangeStatus("depreciated")}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                        >
                            Eliminar
                        </button>
                    </>
                );
            case "inactive":
                return (
                    <>
                        <button
                            onClick={() => handleChangeStatus("active")}
                            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm mr-2"
                        >
                            Activar
                        </button>
                        <button
                            onClick={() => handleChangeStatus("graduated")}
                            className="text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-sm mr-2"
                        >
                            Egresar
                        </button>
                        <button
                            onClick={() => handleChangeStatus("depreciated")}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                        >
                            Eliminar
                        </button>
                    </>
                );
            case "graduated":
                return (
                    <>
                        <button
                            onClick={() => handleChangeStatus("active")}
                            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm mr-2"
                        >
                            Activar
                        </button>
                        <button
                            onClick={() => handleChangeStatus("inactive")}
                            className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
                        >
                            Inactivar
                        </button>
                    </>
                );
            case "depreciated":
                return (
                    <button
                        onClick={() => handleChangeStatus("active")}
                        className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
                    >
                        Activar
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div>
                <h3 className="text-3xl font-bold mb-6 text-center text-blue-700">Detalles del Usuario</h3>
                <div className="flex flex-col gap-6">
                    {userDetails ? (
                        <>
                            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                    <FaUser className="inline-block mr-2" /> Nombre Completo
                                </h4>
                                <p className="text-lg text-gray-700">
                                    {userDetails.firstName} {userDetails.firstLastname} {userDetails.secondLastname}
                                </p>
                                <div className="flex items-center">
                                    <p className="text-lg text-gray-700 mr-4">
                                        <strong>Estado:</strong> {userDetails.status}
                                    </p>
                                    {renderButtons()}
                                </div>
                                <p className="text-lg text-gray-700"><strong>Tipo de usuario:</strong> {userDetails.role}</p>
                            </div>
                                                        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                    <FaEnvelope className="inline-block mr-2" /> Información de Contacto
                                </h4>
                                <p className="text-lg text-gray-700"><strong>Usuario:</strong> {userDetails.username || 'N/A'}</p>
                                <p className="text-lg text-gray-700"><strong>Correo:</strong> {userDetails.email}</p>
                                <p className="text-lg text-gray-700"><strong>Teléfono Principal:</strong> {userDetails.principalPhone}</p>
                                <p className="text-lg text-gray-700"><strong>Teléfono Secundario:</strong> {userDetails.secondPhone || 'N/A'}</p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                    <FaMapMarkerAlt className="inline-block mr-2" /> Dirección
                                </h4>
                                <p className="text-lg text-gray-700">{userDetails.address || 'N/A'}</p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                    <FaRegIdCard className="inline-block mr-2" /> Identificación
                                </h4>
                                <p className="text-lg text-gray-700"><strong>País:</strong> {userDetails.country}</p>
                                <p className="text-lg text-gray-700"><strong>DNI:</strong> {userDetails.dni}</p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                    <FaClipboardList className="inline-block mr-2" /> Niveles
                                </h4>
                                <div>
                                    {userDetails.classLevels && userDetails.classLevels.length > 0 ? (
                                        userDetails.classLevels.map((level, index) => (
                                            <p key={index} className="text-lg text-gray-700">Nivel: {level.level}-{level.section}</p>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">No hay niveles asignados</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                    <FaClipboardList className="inline-block mr-2" /> Detalles Adicionales
                                </h4>
                                <p className="text-lg text-gray-700"><strong>Detalles:</strong> {userDetails.details || 'N/A'}</p>
                                <p className="text-lg text-gray-700"><strong>Fecha de creación:</strong> {userDetails.createdAt || 'N/A'}</p>
                                <p className="text-lg text-gray-700"><strong>Actualizado el:</strong> {userDetails.updatedAt || 'N/A'}</p>
                            </div>

                            {userDetails.profilePicture && (
                                <div className="flex justify-center mt-4">
                                    <img src={userDetails.profilePicture} alt="Perfil" className="w-32 h-32 object-cover rounded-full" />
                                </div>
                            )}

                        </>
                    ) : (
                        <p className="text-center">Cargando detalles del usuario...</p>
                    )}
                    <MessageModal message={message} onClose={() => setMessage({ type: "", text: "" })} />
                </div>
            </div>
        </Modal>
    );
};



