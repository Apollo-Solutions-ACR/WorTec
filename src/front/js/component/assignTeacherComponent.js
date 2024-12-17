import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { MinimalistDataTable, BasicFilter } from "./tableRender";
import { Modal } from "./modalComponent"; 
import { FaBook, FaGraduationCap, FaUserTie, FaCalendarAlt, FaCommentDots } from 'react-icons/fa';


export const AssignTeacherAdmin = () => {
    const { actions } = useContext(Context);
    const [subjectAssignments, setSubjectAssignments] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false); // Modal para asignar profesor
    const [isDeleteAssignationOpen, setIsDeleteAssignationOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Modal para ver detalles
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]); // Estado para almacenar filas seleccionadas
    const [teachers, setTeachers] = useState([]); // Estado para los profesores


    // Estados para el filtro, paginación y resultados por página
    const [searchTerm, setSearchTerm] = useState('');
    const [resultsPerPage, setResultsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [modalTitle, setModalTitle] = useState("");
    const [password, setPassword] = useState("");

    const columns = [
        // { header: 'Id', accessor: (row) => row.subjectAssignment.id },
        { header: 'Materia', accessor: (row) => row.levelSubject.subject.name },
        {
            header: 'Nivel',
            accessor: (row) => {
                const level = row.levelSubject.classLevel.level;
                const section = row.levelSubject.classLevel.section || '';
                return section ? `${level}${section}` : `${level}`;
            }
        },
        {
            header: 'Profesor',
            accessor: (row) => row.teacher ? row.teacher.fullName : 'No asignado',
        }        
    ];

    useEffect(() => {
        const fetchSubjectAssignments = async () => {
            try {
                const data = await actions.getSubjectAssignment();
                
                // Ordenar datos por nivel (número) y sección (letra)
                data.sort((a, b) => {
                    const levelA = a.levelSubject.classLevel.level;
                    const levelB = b.levelSubject.classLevel.level;
                    const sectionA = a.levelSubject.classLevel.section || '';
                    const sectionB = b.levelSubject.classLevel.section || '';
                    
                    // Ordenar primero por número (nivel)
                    if (levelA !== levelB) return levelA - levelB;
                    
                    // Ordenar por letra (sección) si los niveles son iguales
                    return sectionA.localeCompare(sectionB);
                });

                setSubjectAssignments(data);
                setFilteredSubjects(data);  // Inicialmente, mostrar todos los datos
                setTotalItems(data.length);
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar las asignaciones de materias:", error);
                setLoading(false);
            }
        };

        fetchSubjectAssignments();
    }, [actions]);

    // Filtrar asignaturas según el término de búsqueda
    useEffect(() => {
        const filtered = subjectAssignments.filter(sub =>
          sub.levelSubject.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSubjects(filtered);
        setTotalItems(filtered.length);
        setCurrentPage(1);  // Resetear a la primera página tras filtrar
    }, [searchTerm, subjectAssignments]);

    // Obtener la lista paginada para la página actual
    const paginatedSubjects = filteredSubjects.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
    );

    const handleAssignTeacher = () => {
        setModalTitle("Asignar Profesor");
        setIsAssignTeacherModalOpen(true); // Abrir el modal de asignación de profesor
    };

    const handleDeleteAssignation = () => {
        setModalTitle("Borrar Asignación");
        setIsDeleteAssignationOpen(true);
    };

    const handleOpenDetail = (assignment) => {
        setSelectedAssignment(assignment);
        setIsDetailModalOpen(true); // Abrir el modal de detalle
    };

    const handleSelectionChange = (newSelectedRows) => {
        
        setSelectedRows(newSelectedRows); // Actualiza selectedRows con solo los IDs
    };

    const handleConfirmDelete = async () => {
        try {
            // Utiliza `selectedRows` en lugar de `selectedAssignmentIds`
            const assignmentIds = [
                ...(selectedAssignment?.subjectAssignment?.id ? [selectedAssignment.subjectAssignment.id] : []),
                ...(Array.isArray(selectedRows) ? selectedRows : [])
            ].filter((id, index, self) => self.indexOf(id) === index);
    
            if (assignmentIds.length > 0) {
                await actions.bulkUpdateSubjectAssignment(assignmentIds, { teacherId: null, password });
    
                // Actualiza la asignación localmente a `null` tras eliminar el profesor
                assignmentIds.forEach(id => updateAssignmentLocally(id, null));
    
                // Reinicia los valores y cierra los modales
                setPassword("");
                setIsDeleteAssignationOpen(false);
            } else {
                console.error("No hay asignación válida para actualizar");
            }
        } catch (error) {
            console.error("Error al eliminar el profesor:", error);
        }
    };    
    
    // Dentro de AssignTeacherAdmin
    const updateAssignmentLocally = (assignmentId, teacherName) => {
        setSubjectAssignments(prevAssignments =>
            prevAssignments.map(assignment => {
                if (assignment.subjectAssignment.id === assignmentId) {
                    return {
                        ...assignment,
                        teacher: { fullName: teacherName }  // Actualiza el nombre del profesor
                    };
                }
                return assignment;
            })
        );
    };
    
    
    return (
        <div className="w-full flex flex-col p-4">
            <div>
                <div className="mb-4 flex items-center">
                    <BasicFilter
                        onSearch={setSearchTerm}
                        resultsPerPage={resultsPerPage}
                        onResultsPerPageChange={setResultsPerPage}
                        currentPage={currentPage}
                        totalItems={totalItems}
                        onPageChange={setCurrentPage}
                    />
                </div>
                {loading ? (
                    <p className="text-center text-gray-500">Cargando...</p>
                ) : (
                    <>
                        <MinimalistDataTable
                            columns={columns}
                            data={paginatedSubjects}
                            keyExtractor={(row) => row.subjectAssignment.id} // clave única para cada fila
                            onRowClick={(row) => handleOpenDetail(row)}
                            enableSelection={true}
                            onSelectionChange={handleSelectionChange} // Escucha cambios en la selección
                        />

                        {/* Botones de acción */}
                        {selectedRows.length > 0 && (
                            <div className="mt-4 flex justify-center gap-4">
                                <button 
                                    className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    onClick={handleAssignTeacher}
                                >
                                    Asignar profesor
                                </button>
                                <button 
                                    className="bg-red-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    onClick={handleDeleteAssignation}
                                >
                                    Eliminar asignaciones
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal para asignar profesor */}
            {isAssignTeacherModalOpen && (
                <Modal isOpen={isAssignTeacherModalOpen} onClose={() => setIsAssignTeacherModalOpen(false)}>
                    <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>
                    <AssignTeacherToSubject
                        title="Asignar Profesor"
                        onTeacherSelect={setSelectedAssignment}
                        selectedAssignment={selectedAssignment}
                        setIsAssignTeacherOpen={setIsAssignTeacherModalOpen}
                        selectedAssignmentIds={selectedRows} // Prop con IDs seleccionados
                        updateAssignmentLocally={updateAssignmentLocally} // Nueva prop
                    />
                </Modal>
            )}

            {isDeleteAssignationOpen && (
                <Modal isOpen={isDeleteAssignationOpen} onClose={() => setIsDeleteAssignationOpen(false)}>
                    <h2 className="text-xl font-bold mb-4">Confirmar eliminación de asignación</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <button
                        onClick={() => handleConfirmDelete(password)}
                        className="bg-red-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        Confirmar eliminación
                    </button>
                </Modal>
            )}

            {/* Modal para detalles de la asignación */}
            {isDetailModalOpen && selectedAssignment && (
                <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
                    <SubjectAssignDetail 
                        selectedAssignment={selectedAssignment} 
                        onClose={() => setIsDetailModalOpen(false)}
                        updateAssignmentLocally={updateAssignmentLocally}
                    />
                </Modal>
            )}
        </div>
    );
}; 



export const SubjectAssignDetail = ({ selectedAssignment, onClose, onAssignTeacher, onEditAssignment, updateAssignmentLocally, selectedAssignmentIds }) => {
    const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [isDeleteTeacherOpen, setIsDeleteTeacherOpen] = useState(false);
    const { actions } = useContext(Context);
    const [password, setPassword] = useState("");

    if (!selectedAssignment) return null;

    const { levelSubject, subjectAssignment, teacher } = selectedAssignment || {};
    const { classLevel = {}, subject = {} } = levelSubject || {};

    const handleAssignTeacher = () => {
        setModalTitle("Asignar Profesor");
        setIsAssignTeacherOpen(true);
    };

    const handleEditAssignment = () => {
        setModalTitle("Editar Asignación");
        setIsAssignTeacherOpen(true);
    };

    const handleDeleteTeacher = () => {
        setModalTitle("Borrar Profesor Asignado");
        setIsDeleteTeacherOpen(true); // Abre el modal de contraseña
    };

    const handleConfirmDelete = async () => {
        try {
            // Filtra los IDs válidos en caso de que `selectedAssignment` o `selectedAssignmentIds` estén vacíos
            const assignmentIds = [
                ...(selectedAssignment?.subjectAssignment?.id ? [selectedAssignment.subjectAssignment.id] : []),
                ...(Array.isArray(selectedAssignmentIds) ? selectedAssignmentIds : [])
            ].filter((id, index, self) => self.indexOf(id) === index);
    
            if (assignmentIds.length > 0) {
                await actions.bulkUpdateSubjectAssignment(assignmentIds, { teacherId: null, password });
    
                // Actualiza la asignación localmente a `null` tras eliminar el profesor
                assignmentIds.forEach(id => updateAssignmentLocally(id, null));
    
                // Reinicia los valores y cierra los modales
                setPassword("");
                setIsDeleteTeacherOpen(false);
                
            } else {
                console.error("No hay asignación válida para actualizar");
            }
        } catch (error) {
            console.error("Error al eliminar el profesor:", error);
        }
    };
    
    

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg max-w-3xl mx-auto border border-gray-300 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2 border-b pb-4">
                <FaGraduationCap className="text-green-600" /> <span>Detalles de la Asignación</span>
            </h2>

            {/* Información de la materia */}
            <div className="flex items-center space-x-4 border-b pb-4">
                <FaBook className="text-green-600" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Materia:</h3>
                    <p className="bg-green-600 text-white rounded px-3 py-1 inline-block text-base font-medium">
                        {subject.name || "N/A"}
                    </p>
                </div>
            </div>

            {/* Información del nivel */}
            <div className="flex items-center space-x-4 border-b pb-4">
                <FaGraduationCap className="text-green-600" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Nivel:</h3>
                    <p className="bg-green-600 text-white rounded px-3 py-1 inline-block text-base font-medium">
                        {classLevel.level || "N/A"} {classLevel.section || "N/A"}
                    </p>
                </div>
            </div>

            {/* Información del profesor con botones de acción */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 border-b pb-4">
                <div className="flex items-center space-x-4">
                    <FaUserTie className="text-blue-600" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Profesor:</h3>
                        <p className="bg-blue-600 text-white rounded px-3 py-1 inline-block text-base font-medium">
                            {teacher ? teacher.fullName : "No hay profesor asignado"}
                        </p>
                    </div>
                </div>

                {/* Botones de acción junto al profesor */}
                <div className="flex space-x-2 mt-2 lg:mt-0">
                    {teacher ? (
                        <>
                            <button
                                type="button"
                                onClick={handleEditAssignment}
                                className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                Editar Asignación
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteTeacher}
                                className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                Borrar Asignación
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAssignTeacher}
                            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Asignar Profesor
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <FaCommentDots className="text-gray-600" /> <span>Detalles de la Asignación</span>
                </h3>
                <p className="text-gray-600"><strong>Comentario:</strong> {subjectAssignment.comment || "Sin comentario"}</p>
                <div className="flex items-center space-x-2 text-gray-600">
                    <FaCalendarAlt className="text-gray-500" />
                    <p><strong>Fecha de Creación:</strong> {subjectAssignment.createdAt ? new Date(subjectAssignment.createdAt).toLocaleString() : "N/A"}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                    <FaCalendarAlt className="text-gray-500" />
                    <p><strong>Fecha de Actualización:</strong> {subjectAssignment.updatedAt ? new Date(subjectAssignment.updatedAt).toLocaleString() : "N/A"}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                    <FaCalendarAlt className="text-gray-500" />
                    <p><strong>Fecha de Inicio:</strong> {subjectAssignment.startDate ? new Date(subjectAssignment.startDate).toLocaleDateString() : "Sin fecha de inicio"}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                    <FaCalendarAlt className="text-gray-500" />
                    <p><strong>Fecha de Fin:</strong> {subjectAssignment.endDate ? new Date(subjectAssignment.endDate).toLocaleDateString() : "Sin fecha de fin"}</p>
                </div>
            </div>

            {/* Componente AssignTeacherToSubject modal */}
            {isAssignTeacherOpen && (
                <Modal isOpen={isAssignTeacherOpen} onClose={() => setIsAssignTeacherOpen(false)}>
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>
                        <AssignTeacherToSubject
                            title={modalTitle}
                            onTeacherSelect={modalTitle === "Asignar Profesor" ? onAssignTeacher : onEditAssignment}
                            selectedAssignment={selectedAssignment}
                            setIsAssignTeacherOpen={setIsAssignTeacherOpen}
                            updateAssignmentLocally={updateAssignmentLocally}
                        />
                    </div>
                </Modal>
            )}

            {isDeleteTeacherOpen &&(
                <Modal isOpen={isDeleteTeacherOpen} onClose={() => setIsDeleteTeacherOpen(false)}>
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>
                        <p>Ingresa la contraseña para confirmar la eliminación del profesor asignado.</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="border px-3 py-2 rounded-md mt-2"
                        />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setIsDeleteTeacherOpen(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="bg-red-500 text-white px-4 py-2 rounded-md"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Botón para cerrar */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-400 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export const AssignTeacherToSubject = ({title, onTeacherSelect, selectedAssignment, setIsAssignTeacherOpen, selectedAssignmentIds, updateAssignmentLocally}) => {

    const { actions } = useContext(Context);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);

    const columns = [
        // { header: 'ID', accessor: (row) => row.id },
        { header: 'Nombre Completo', accessor: (row) => row.fullName },
        { header: 'Posición', accessor: (row) => row.userPosition || 'No definido' },
        { header: 'Nombre de Usuario', accessor: (row) => row.username }
    ];

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const data = await actions.getTeachersActive();
                setTeachers(data);
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar los profesores:", error);
                setLoading(false);
            }
        };
        fetchTeachers();
        
    }, [actions]);

   
    const handleRowClick = (row) => {
        setSelectedTeacherId(row.id);
        console.log("Profesor seleccionado:", row.id); // Verificar ID seleccionado
        if (onTeacherSelect) {
            onTeacherSelect(row.id);
        }
    };


    const handleAssignTeacherClick = () => {
        if (!selectedTeacherId) {
            alert("Seleccione un profesor antes de continuar.");
            return;
        }
        setIsPasswordModalOpen(true);
    };
    

    const handleConfirmAssignment = async () => {
        if (!selectedTeacherId || !password) return;
    
        try {
            // Filtra los IDs válidos en caso de que `selectedAssignment` o `selectedAssignmentIds` estén vacíos
            const assignmentIds = [
                ...(selectedAssignment?.subjectAssignment?.id ? [selectedAssignment.subjectAssignment.id] : []),
                ...(Array.isArray(selectedAssignmentIds) ? selectedAssignmentIds : [])
            ].filter((id, index, self) => self.indexOf(id) === index);
    
            if (assignmentIds.length > 0) {
                await actions.bulkUpdateSubjectAssignment(assignmentIds, { teacherId: selectedTeacherId, password });
    
                // Busca el profesor seleccionado para actualizar su nombre en el frontend
                const teacher = teachers.find(teacher => teacher.id === selectedTeacherId);
                if (teacher) {
                    assignmentIds.forEach(id => updateAssignmentLocally(id, teacher.fullName));
                } else {
                    console.error("No se encontró el profesor con el ID seleccionado");
                }
    
                // Reinicia los valores y cierra los modales
                setPassword("");
                setIsPasswordModalOpen(false);
                setIsAssignTeacherOpen(false);
            } else {
                console.error("No hay asignación válida para actualizar");
            }
        } catch (error) {
            console.error("Error al asignar el profesor:", error);
        }
    };
    
    const handleRowSelection = (selectedIds) => {
        setSelectedTeacherId(selectedIds[0]); // Solo se permite seleccionar un ID
    };

    return (
        <div className="w-full flex flex-col p-4">
            <div className="overflow-x-auto">
                {loading ? (
                    <p className="text-center text-gray-500">Cargando...</p>
                ) : (
                    <MinimalistDataTable
                        columns={columns}
                        data={teachers}
                        onRowClick={handleRowClick}
                        enableSelection={true}
                        keyExtractor={(row) => row.id} // Asegura que cada fila tenga un ID único
                        onSelectionChange={handleRowSelection} // Enlaza correctamente la selección
                    />

                )}
            </div>

            {/* Botones de acción fijos */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4">
                <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="bg-gray-400 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleAssignTeacherClick}
                    className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {title}
                </button>
            </div>

            {/* Modal de confirmación con contraseña */}
            {isPasswordModalOpen && (
                <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Confirmación Requerida</h2>
                        <p className="text-gray-700 mb-4">Para asignar este profesor, ingrese su contraseña.</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="w-full border rounded px-3 py-2 mb-4"
                        />
                        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4">
                            <button
                                type="button"
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="bg-gray-400 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAssignment}
                                className="bg-green-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};