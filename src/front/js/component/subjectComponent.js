import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { MinimalistDataTable, BasicFilter } from "./tableRender";

export const SubjectAdmin = () => {
    const { actions } = useContext(Context);
  
    const initialFormData = {
      name: "",
      password: ""
    };
  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ ...initialFormData });
    const [deleteFormData, setDeleteFormData] = useState({ password: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [resultsPerPage, setResultsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
  
    const columns = [
      { header: "Materia", accessor: "name" },
      { header: "Fecha de creación", accessor: "createdAt" },
      { header: "Fecha de actualización", accessor: "updatedAt" }
    ];
  
    useEffect(() => {
      const fetchSubjects = async () => {
        try {
          const data = await actions.getSubjectsByUser();
          setSubjects(data);
          setTotalItems(data.length);
        } catch (error) {
          console.error("Error al cargar las materias:", error);
        }
      };
  
      fetchSubjects();
    }, [actions]);
  
    useEffect(() => {
      const filtered = subjects.filter(sub =>
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubjects(filtered);
      setTotalItems(filtered.length);
    }, [searchTerm, subjects]);
  
    const handleSearch = (term) => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset page number on search
    };
  
    const handleResultsPerPageChange = (value) => {
      setResultsPerPage(value);
      setCurrentPage(1); // Reset page number on results per page change
    };
  
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };
  
    const paginatedSubjects = filteredSubjects.slice(
      (currentPage - 1) * resultsPerPage,
      currentPage * resultsPerPage
    );

    const openDetailModal = (subject) => {
        setSelectedSubject(subject);
        setIsDetailModalOpen(true);
    };
      
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    const handleDeleteChange = (e) => {
      const { name, value } = e.target;
      setDeleteFormData({ ...deleteFormData, [name]: value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await actions.addSubject(formData); 
        setFormData({ ...initialFormData });
        setIsAddModalOpen(false);
  
        const data = await actions.getSubjectsByUser();
        setSubjects(data);
        setMessage({ type: "success", text: "Materia agregada con éxito." });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      } catch (error) {
        console.error("Error al agregar la materia:", error);
        setMessage({ type: "error", text: error.message });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    };
  
    const handleEditSubmit = async (e) => {
      e.preventDefault();
      try {
        await actions.updateSubject(editingId, formData);
        setIsModalOpen(false);
  
        const data = await actions.getSubjectsByUser();
        setSubjects(data);
        setMessage({ type: "success", text: "Materia actualizada con éxito." });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      } catch (error) {
        console.error("Error al actualizar la materia:", error);
        setMessage({ type: "error", text: error.message });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    };
  
    const handleDelete = async () => {
      try {
        const { password } = deleteFormData;
        if (!password) {
          throw new Error("La contraseña es requerida para eliminar la materia.");
        }
  
        await actions.deleteSubject(editingId, { password });
        setIsDeleteModalOpen(false);
  
        const data = await actions.getSubjectsByUser();
        setSubjects(data);
        setMessage({ type: "success", text: "Materia eliminada con éxito." });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      } catch (error) {
        console.error("Error al eliminar la materia:", error);
        setMessage({ type: "error", text: error.message });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    };
  
    const openEditModal = (subject) => {
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description,
        password: ""
      });
      setEditingId(subject.id);
      setIsModalOpen(true);
    };
  
    const openDeleteModal = (id) => {
      setEditingId(id);
      setIsDeleteModalOpen(true);
    };
  
    const renderActions = (row) => (
        <div className="flex space-x-2">
          <button
            onClick={(event) => {
              event.stopPropagation(); // Detiene la propagación del evento al hacer clic en el botón
              openEditModal(row);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L8.414 8.757l-.707 2.828 2.828-.707 6.172-6.172a2 2 0 000-2.828z" />
              <path d="M6.342 16.08a3.5 3.5 0 01-3.236-4.733l1.45-5.8 6.004 1.502-1.5 6-5.737 2.066a3.5 3.5 0 01-1.981-.035z" />
            </svg>
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation(); // Detiene la propagación del evento al hacer clic en el botón
              openDeleteModal(row.id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 2a1 1 0 00-1 1v1H2a1 1 0 00-1 1v1a1 1 0 001 1h1v11a1 1 0 001 1h12a1 1 0 001-1V6h1a1 1 0 001-1V4a1 1 0 00-1-1h-3V3a1 1 0 00-1-1H6zm1 2h6v1H7V4zM4 6h12v11H4V6z" />
            </svg>
          </button>
        </div>
    );
  
    return (
      <div className="p-4">
        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
            {message.text}
          </div>
        )}
          <div className="mb-4 flex items-center">
          <BasicFilter
            onSearch={handleSearch}
            resultsPerPage={resultsPerPage}
            onResultsPerPageChange={handleResultsPerPageChange}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </div>
        <MinimalistDataTable 
          columns={columns} 
          data={paginatedSubjects.map(subject => ({
            ...subject,
            onClick: () => openDetailModal(subject)  // Se abre modal de detalles
          }))} 
          renderActions={renderActions} 
        />
    
        <div className="mt-4 flex justify-center">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Agregar Materia
          </button>
        </div>
    
        {/* Modal para agregar materia */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Agregar Materia</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Materia:</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={formData.name}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4 flex justify-between">
                  <button 
                    type="submit"
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Guardar
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    
        {/* Modal para detalles */}
        {isDetailModalOpen && selectedSubject && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center">
            <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-4xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-blue-700">Detalles de la Materia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-lg"><strong>Nombre:</strong> <span className="text-gray-800">{selectedSubject.name}</span></p>
                </div>
                <div>
                  <p className="text-lg"><strong>Fecha de creación:</strong> <span className="text-gray-800">{selectedSubject.createdAt}</span></p>
                  <p className="text-lg"><strong>Fecha de actualización:</strong> <span className="text-gray-800">{selectedSubject.updatedAt}</span></p>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <button 
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
    
        {/* Modal para editar */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Editar Materia</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Materia</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={formData.name}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4 flex justify-between">
                  <button 
                    type="submit"
                    className="bg-lime-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    Guardar
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    
        {/* Modal para eliminar */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Eliminar Materia</h3>
              <p className="mb-4">¿Está seguro de que desea eliminar esta materia? Esta acción no se puede deshacer.</p>
              <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={deleteFormData.password}
                    onChange={handleDeleteChange}
                    className="border rounded-md px-3 py-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4 flex justify-between">
                  <button 
                    type="submit"
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Eliminar
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );    
  };
  