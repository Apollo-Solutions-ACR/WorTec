import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { SimpleTable, MinimalistDataTable, BasicFilter } from "./tableRender";

export const ClassLevelAdmin = () => {
  const { actions } = useContext(Context);

  const initialFormData = {
    level: "",
    section: "",
    password: ""
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...initialFormData });
  const [deleteFormData, setDeleteFormData] = useState({ password: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [classLevels, setClassLevels] = useState([]);
  const [filteredClassLevels, setFilteredClassLevels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultsPerPage, setResultsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const columns = [
    { header: "Nivel", accessor: "level" },
    { header: "Sección", accessor: "section" },
    { header: "Código", accessor: "code" }
  ];

  useEffect(() => {
    const fetchClassLevels = async () => {
      try {
        const data = await actions.getClassLevelsByUser();
        setClassLevels(data);
        setTotalItems(data.length);
      } catch (error) {
        console.error("Error al cargar los niveles de clase:", error);
      }
    };

    fetchClassLevels();
  }, [actions]);

  useEffect(() => {
    const filtered = classLevels.filter(cl =>
      (cl.level?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cl.section && cl.section.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredClassLevels(filtered);
    setTotalItems(filtered.length);
  }, [searchTerm, classLevels]);

  useEffect(() => {
    // Recalculate the totalItems whenever resultsPerPage or currentPage changes
    setTotalItems(filteredClassLevels.length);
  }, [resultsPerPage, currentPage]);

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

  const paginatedClassLevels = filteredClassLevels.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

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
      const level = parseInt(formData.level, 10);
      if (isNaN(level)) {
        throw new Error("El nivel debe ser un número entero.");
      }
      const section = formData.section.toUpperCase();

      await actions.addClassLevel({ ...formData, level, section });
      setFormData({ ...initialFormData });
      setIsAddModalOpen(false);

      const data = await actions.getClassLevelsByUser();
      setClassLevels(data);
      setMessage({ type: "success", text: "Nivel agregado con éxito." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      console.error("Error al agregar el nivel:", error);
      setMessage({ type: "error", text: error.message.replace(/^\d+:\s*/, '') });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const level = parseInt(formData.level, 10);
      if (isNaN(level)) {
        throw new Error("El nivel debe ser un número entero.");
      }
      const section = formData.section.toUpperCase();

      await actions.updateClassLevel(editingId, { ...formData, level, section });
      setIsModalOpen(false);

      const data = await actions.getClassLevelsByUser();
      setClassLevels(data);
      setMessage({ type: "success", text: "Nivel actualizado con éxito." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      console.error("Error al actualizar el nivel:", error);
      setMessage({ type: "error", text: error.message.replace(/^\d+:\s*/, '') });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleDelete = async () => {
    try {
      const { password } = deleteFormData;
      if (!password) {
        throw new Error("La contraseña es requerida para eliminar el nivel.");
      }

      await actions.deleteClassLevel(editingId, { password });
      setIsDeleteModalOpen(false);

      const data = await actions.getClassLevelsByUser();
      setClassLevels(data);
      setMessage({ type: "success", text: "Nivel eliminado con éxito." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      console.error("Error al eliminar el nivel:", error);
      setMessage({ type: "error", text: error.message.replace(/^\d+:\s*/, '') });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const openEditModal = (classLevel) => {
    setFormData({
      level: classLevel.level,
      section: classLevel.section,
      password: ""
    });
    setEditingId(classLevel.id);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setEditingId(id);
    setIsDeleteModalOpen(true);
  };

  const renderActions = (row) => (
    <div className="flex space-x-2">
      <button onClick={() => openEditModal(row)} className="text-blue-500 hover:text-blue-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 348.882 348.882" fill="currentColor">
          <path
            d="m333.988 11.758-.42-.383A43.363 43.363 0 0 0 304.258 0a43.579 43.579 0 0 0-32.104 14.153L116.803 184.231a14.993 14.993 0 0 0-3.154 5.37l-18.267 54.762c-2.112 6.331-1.052 13.333 2.835 18.729 3.918 5.438 10.23 8.685 16.886 8.685h.001c2.879 0 5.693-.592 8.362-1.76l52.89-23.138a14.985 14.985 0 0 0 5.063-3.626L336.771 73.176c16.166-17.697 14.919-45.247-2.783-61.418zM130.381 234.247l10.719-32.134.904-.99 20.316 18.556-.904.99-31.035 13.578zm184.24-181.304L182.553 197.53l-20.316-18.556L294.305 34.386c2.583-2.828 6.118-4.386 9.954-4.386 3.365 0 6.588 1.252 9.082 3.53l.419.383c5.484 5.009 5.87 13.546.861 19.03z"
            data-original="#000000" />
          <path
            d="M303.85 138.388c-8.284 0-15 6.716-15 15v127.347c0 21.034-17.113 38.147-38.147 38.147H68.904c-21.035 0-38.147-17.113-38.147-38.147V100.413c0-21.034 17.113-38.147 38.147-38.147h131.587c8.284 0 15-6.716 15-15s-6.716-15-15-15H68.904C31.327 32.266.757 62.837.757 100.413v180.321c0 37.576 30.571 68.147 68.147 68.147h181.798c37.576 0 68.147-30.571 68.147-68.147V153.388c.001-8.284-6.715-15-14.999-15z"
            data-original="#000000" />
        </svg>
      </button>
      <button onClick={() => openDeleteModal(row.id)} className="text-red-500 hover:text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z" />
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
      <MinimalistDataTable columns={columns} data={paginatedClassLevels} renderActions={renderActions} />
      {/* Modal components and handlers here */}
      <div className="mt-4 flex justify-center">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Agregar Nivel
        </button>
      </div>
  
      {/* Modal para agregar nivel */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md mx-4 md:w-1/3">
            <h3 className="text-lg font-semibold mb-4">Agregar Nivel</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nivel</label>
                <input
                  type="text"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full"
                  required
                  maxLength={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Sección</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full"
                  maxLength={4}
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
                  className="ml-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  
      {/* Modal para editar nivel */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md mx-4 md:w-1/3">
            <h3 className="text-lg font-semibold mb-4">Editar Nivel</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nivel</label>
                <input
                  type="text"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full"
                  required
                  maxLength={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Sección</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 w-full"
                  maxLength={4}
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
                  className="ml-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  
      {/* Modal para eliminar nivel */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md mx-4 md:w-1/3">
            <h3 className="text-lg font-semibold mb-4">Eliminar Nivel</h3>
            <p className="mb-4">¿Está seguro de que desea eliminar este nivel? Esta acción no se puede deshacer.</p>
            <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  name="password"
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
                  className="ml-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 transform hover:scale-105 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  
      {/* Mensajes de éxito o error */}
      {message.text && (
        <div className={`fixed bottom-4 right-4 bg-${message.type === "error" ? "red" : "green"}-500 text-white p-4 rounded-md shadow-md`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

