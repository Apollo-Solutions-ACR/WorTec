import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { MinimalistDataTable } from "./tableRender";
import { Modal, SecondaryModal } from "./modalComponent"; 
import { FaTimes } from 'react-icons/fa';


export const SubjectLevelAdmin = () => {
    const { store, actions } = useContext(Context);
    const [subjectsLevels, setSubjectsLevels] = useState([]);
    const [filteredSubjectsLevels, setFilteredSubjectsLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubjectLevel, setSelectedSubjectLevel] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [availableLevels, setAvailableLevels] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });

    const columns = [
        { header: 'Materia', accessor: 'name' },
        { 
            header: 'Nivel', 
            accessor: (row) => {
                const levels = row.levelSubjects?.map(ls => {
                    const level = ls.classLevel.level;
                    const section = ls.classLevel.section ? ls.classLevel.section : '';
                    return section ? `${level}${section}` : `${level}`;
                }) || [];
    
                // Ordenamos los niveles en orden numérico y alfabético
                levels.sort((a, b) => {
                    const levelA = a.replace(/[^\d]/g, '') || '0'; // Extraer el número
                    const sectionA = a.replace(/^\d+/, ''); // Extraer la sección
                    const levelB = b.replace(/[^\d]/g, '') || '0'; // Extraer el número
                    const sectionB = b.replace(/^\d+/, ''); // Extraer la sección
    
                    // Primero, ordena por el nivel (número)
                    if (levelA !== levelB) {
                        return levelA - levelB; // Orden numérico
                    }
    
                    // Si son iguales, ordena por sección (alfabético)
                    return sectionA.localeCompare(sectionB); // Orden alfabético
                });
    
                return levels.length > 0 ? levels.join(', ') : '-';
            }
        }
    ];

    const levelColumns = [
        { 
            header: 'Nivel', 
            accessor: (row) => row.classLevel.level,
            sortType: (a, b) => {
                const levelA = a.classLevel.level;
                const levelB = b.classLevel.level;
                return levelA - levelB; // Ordenar numéricamente
            }
        },
        { 
            header: 'Sección', 
            accessor: (row) => row.classLevel.section || '-', 
            sortType: (a, b) => {
                const sectionA = a.classLevel.section || ''; // Usa '' si no hay sección
                const sectionB = b.classLevel.section || ''; // Usa '' si no hay sección
                return sectionA.localeCompare(sectionB); // Ordenar alfabéticamente
            }
        }
    ];

    const handleAddLevels = (classLevelIds) => {
        const updatedSubjectsLevels = subjectsLevels.map((subject) => {
            if (subject.id === selectedSubjectLevel.id) {
                const existingLevelIds = new Set(
                    (subject.levelSubjects || []).map(ls => ls.classLevel.id)
                );
                const newLevelSubjects = classLevelIds
                    .filter(id => !existingLevelIds.has(id))
                    .map(id => ({
                        classLevel: availableLevels.find(level => level.id === id)
                    }));
                return {
                    ...subject,
                    levelSubjects: [...(subject.levelSubjects || []), ...newLevelSubjects]
                };
            }
            return subject;
        });
    
        setSubjectsLevels(updatedSubjectsLevels);
        setFilteredSubjectsLevels(updatedSubjectsLevels); // Actualiza también el filtro
    };
    
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const data = await actions.getSubjectsWithLevels();
                setSubjectsLevels(data);
                setFilteredSubjectsLevels(data);
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar las materias:", error);
                setLoading(false);
            }
        };

        const fetchAvailableLevels = async () => {
            try {
                const levels = await actions.getClassLevelsByUser();
                setAvailableLevels(levels);
            } catch (error) {
                console.error("Error al cargar los niveles de clase:", error);
            }
        };

        fetchSubjects();
        fetchAvailableLevels();
    }, [actions]);

    const handleDeleteLevel = (level) => {
        console.log("Eliminar nivel:", level);
    };

    return (
        <div className="w-full flex flex-col">
            <div className="overflow-x-auto">
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <MinimalistDataTable
                        columns={columns}
                        data={filteredSubjectsLevels}
                        onRowClick={(row) => {
                            setSelectedSubjectLevel(row);
                            setIsModalOpen(true);
                        }}
                    />
                )}
            </div>
            {isModalOpen && selectedSubjectLevel && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    {message && message.text && (
                        <div className={`fixed bottom-4 right-4 bg-${message.type === "error" ? "red" : "green"}-500 text-white p-4 rounded-md shadow-md`} style={{ zIndex: 1000 }}>
                            {message.text}
                        </div>
                    )}
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">
                            Detalles del Nivel y Asignatura
                        </h2>
                        <p><strong>Nombre:</strong> <p className="bg-green-600 text-white rounded px-3 py-1 inline-block text-base font-medium">{selectedSubjectLevel.name}</p></p>
                        <div className="mt-4">
                            <h3 className="text-lg font-bold mb-2">Niveles Asociados</h3>
                            <MinimalistDataTable
                                columns={levelColumns}
                                data={selectedSubjectLevel.levelSubjects}
                                renderActions={(row) => (
                                    <button 
                                        className="text-red-500" 
                                        onClick={() => handleDeleteLevel(row)}
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            />
                        </div>
                        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4">
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-green-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
                                Agregar Nivel
                            </button>
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="bg-red-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {isAddModalOpen && (
                <AddLevelModal 
                    isOpen={isAddModalOpen}
                    selectedSubjectLevel={selectedSubjectLevel}
                    availableLevels={availableLevels}
                    onAddLevels={handleAddLevels} // Aquí se pasa la función
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setIsModalOpen(false); // Cierra el modal principal también
                    }}
                    setMessage={setMessage}
                />
            )}
        </div>
    );
    
};


export const AddLevelModal = ({ isOpen, onClose, selectedSubjectLevel, onAddLevels, setMessage}) => {
    const { store, actions } = useContext(Context);
    const [availableLevelsToAdd, setAvailableLevelsToAdd] = useState([]);
    const [levelsToAdd, setLevelsToAdd] = useState([]);
    const [SubjectsLevels, setSubjectsLevels] = useState(null);

    const addLevelColumns = [
        { header: "Nivel", accessor: "level" },
        { header: "Sección", accessor: "section" },
    ];

    const handleAddLevel = async (e) => {
        e.preventDefault();
        try {
            const formData = {
                classLevelIds: levelsToAdd,
                subjectId: selectedSubjectLevel.id,
            };
            console.log("Niveles a agregar:", levelsToAdd);
            const response = await actions.createLevelSubject(formData);
            console.log("Respuesta del servidor:", response);
        
            // Actualiza la lista de niveles en el componente padre
            onAddLevels(levelsToAdd);
        
            // Vuelve a cargar los niveles disponibles
            const data = await actions.getUnrelatedClassLevels(selectedSubjectLevel.id);
            const uniqueData = data.map((item) => ({
                ...item,
                key: item.id // Asegúrate de que 'id' sea único
            }));
            setAvailableLevelsToAdd(uniqueData); // Actualiza la tabla con nuevos niveles
    
            // Cierra el modal después de agregar el nivel
            onClose();
            
        
            // Opcional: establece un mensaje de éxito
            setMessage({ type: "success", text: "Niveles agregados con éxito." });
        } catch (error) {
            console.error("Error al agregar la materia al nivel:", error);
            setMessage({ type: "error", text: error.message || "Error desconocido." });
        }
    };
    

    const handleRowSelection = (selectedIds) => {
        console.log("IDs seleccionados:", selectedIds);
        setLevelsToAdd(selectedIds); // Actualiza los niveles a añadir
    };

    useEffect(() => {
        const fetchClassLevels = async () => {
            try {
                const data = await actions.getUnrelatedClassLevels(selectedSubjectLevel.id);
                const uniqueData = data.map((item) => ({
                    ...item,
                    key: item.id // Asegúrate de que 'id' sea único
                }));
                setAvailableLevelsToAdd(uniqueData);
            } catch (error) {
                console.error("Error al cargar los niveles de clase:", error);
            }
        };
        fetchClassLevels();
    }, [actions, selectedSubjectLevel.id]);

    return (
        <SecondaryModal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Agregar Nuevos Niveles</h2>
                <MinimalistDataTable
                    columns={addLevelColumns}
                    data={availableLevelsToAdd}
                    enableSelection={true}
                    onSelectionChange={handleRowSelection}
                />
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4">
                    <button
                        className="bg-green-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                        onClick={handleAddLevel}>
                        Agregar Niveles
                    </button>
                    <button
                        type="button"
                        onClick={() => onClose(false)}
                        className="bg-red-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </SecondaryModal>
    );
    
};
