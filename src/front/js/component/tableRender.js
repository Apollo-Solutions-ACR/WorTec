import React, { useState, useEffect } from 'react';

// Filters

export const BasicFilter = ({
  onSearch,
  onResultsPerPageChange,
  onPageChange,
  totalItems,
  currentPage,
  resultsPerPage
}) => {
  const handleResultsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      onResultsPerPageChange(value);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-gray-100 rounded-md shadow-md overflow-x-auto">
      {/* Dropdown for results per page */}
      <div className="flex items-center space-x-2">
        <label htmlFor="results-per-page" className="text-gray-700">Resultados por página:</label>
        <select
          id="results-per-page"
          value={resultsPerPage}
          onChange={handleResultsPerPageChange}
          className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      {/* Search input */}
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Buscar..."
      />
      
      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md text-white ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          Anterior
        </button>
        <span className="text-gray-700">Página {currentPage} de {Math.ceil(totalItems / resultsPerPage)}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= Math.ceil(totalItems / resultsPerPage)}
          className={`px-4 py-2 rounded-md text-white ${currentPage >= Math.ceil(totalItems / resultsPerPage) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

// User Filter

export const UserFilter = ({
  onSearch,
  onResultsPerPageChange,
  onPageChange,
  totalItems,
  currentPage,
  resultsPerPage,
  data,
  searchTerm,
  setSelectedRole,
  setSelectedLevel,
  setSelectedStatus,
  selectedRole,
  selectedLevel,
  selectedStatus
}) => {
  const roles = Array.from(new Set(data.map((item) => item.role))).filter(Boolean);
  const levels = Array.from(new Set(data.flatMap((item) => 
    item.classLevels ? item.classLevels.map((classLevel) => classLevel.level) : []
  ))).filter(Boolean);
  
  const statuses = Array.from(new Set(data.map((item) => item.status))).filter(Boolean);

  const handleResultsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      onResultsPerPageChange(value);
    }
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    onSearch(newSearchTerm, selectedRole, selectedLevel, selectedStatus);
  };

  const handleFilterChange = () => {
    onSearch(searchTerm, selectedRole, selectedLevel, selectedStatus);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-gray-100 rounded-md shadow-md overflow-x-auto">
      <div className="flex items-center space-x-2">
        <label htmlFor="results-per-page" className="text-gray-700">Resultados por página:</label>
        <select
          id="results-per-page"
          value={resultsPerPage}
          onChange={handleResultsPerPageChange}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      <input
        type="text"
        onChange={handleSearchChange}
        className="w-full sm:w-auto border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Buscar..."
      />

      <div className="flex items-center space-x-2">
        <label htmlFor="filter-role" className="text-gray-700">Rol:</label>
        <select
          id="filter-role"
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            handleFilterChange(); // Refresh results on change
          }}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {roles.map((role, index) => (
            <option key={index} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="filter-level" className="text-gray-700">Nivel:</label>
        <select
          id="filter-level"
          value={selectedLevel}
          onChange={(e) => {
            setSelectedLevel(e.target.value);
            handleFilterChange(); // Refresh results on change
          }}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {levels.map((level, index) => (
            <option key={index} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="filter-status" className="text-gray-700">Estado:</label>
        <select
          id="filter-status"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            handleFilterChange(); // Refresh results on change
          }}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {statuses.map((status, index) => (
            <option key={index} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-2 rounded-md text-white ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          Anterior
        </button>
        <span className="text-gray-700">Página {currentPage} de {Math.ceil(totalItems / resultsPerPage)}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= Math.ceil(totalItems / resultsPerPage)}
          className={`px-2 py-2 rounded-md text-white ${currentPage >= Math.ceil(totalItems / resultsPerPage) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};



// Tables

export const MinimalistDataTable = ({
  columns,
  data,
  renderActions,
  keyExtractor,
  onRowClick,
  enableSelection,
  onSelectionChange,
}) => {
  const hasActions = typeof renderActions === 'function';
  const [selectedIds, setSelectedIds] = useState([]);

  const handleRowSelect = (id) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter(rowId => rowId !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelectedIds);

    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    }
  };

  return (
    <div className="antialiased font-sans bg-gray-100">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow-xl rounded-lg overflow-hidden bg-white">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    {enableSelection && (
                      <th className="px-5 py-3 border-b-2 border-gray-300 bg-blue-700 text-left text-xs lg:text-sm font-semibold font-medium text-white uppercase tracking-wider shadow-lg">
                        <input
                          type="checkbox"
                          onChange={() => {
                          const allSelected = selectedIds.length === data.length;
const newSelectedIds = allSelected
    ? []
    : data.map(row => keyExtractor ? keyExtractor(row) : row.id);
setSelectedIds(newSelectedIds);
if (onSelectionChange) {
    onSelectionChange(newSelectedIds);
}

                          }}
                          checked={selectedIds.length === data.length}
                        />
                      </th>
                    )}
                    {columns.map(({ header }, index) => (
                      <th
                        key={header + index}
                        className="px-5 py-3 border-b-2 border-gray-300 bg-blue-700 text-left text-xs lg:text-sm font-semibold font-medium text-white uppercase tracking-wider shadow-lg"
                      >
                        {header}
                      </th>
                    ))}
                    {hasActions && (
                      <th className="px-5 py-3 border-b-2 border-gray-300 bg-blue-700 text-left text-xs lg:text-sm font-semibold font-medium text-white uppercase tracking-wider shadow-lg">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => {
                    const rowId = keyExtractor ? keyExtractor(row) : (row.id || rowIndex);
                    return (
                      <tr
                        key={rowId}
                        className={`${
                          rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
                        } transition duration-300 ease-in-out transform hover:bg-gray-300 hover:scale-102 shadow-lg hover:shadow-2xl`}
                        onClick={(event) => {
                          if (!event.target.closest('input[type="checkbox"]')) {
                            if (onRowClick) {
                              onRowClick(row);
                            }
                          }
                        }}
                      >
                        {enableSelection && (
                          <td
                            className="px-5 py-5 border-b border-gray-300 text-sm lg:text-base shadow-md cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRowSelect(rowId);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(rowId)}
                              readOnly
                            />
                          </td>
                        )}
                        {columns.map(({ accessor }, colIndex) => (
                          <td
                            key={accessor + colIndex}
                            className="px-5 py-5 border-b border-gray-300 text-sm lg:text-base shadow-md"
                          >
                            {typeof accessor === 'function' ? (
                              accessor(row)
                            ) : (
                              <p className="text-gray-900 font-medium whitespace-no-wrap">
                                {row[accessor] || '-'}
                              </p>
                            )}
                          </td>
                        ))}
                        {hasActions && (
                          <td className="px-5 py-5 border-b border-gray-400 text-sm lg:text-base font-medium shadow-md">
                            {renderActions(row, (event) => event.stopPropagation())}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





export const SimpleTable = ({ columns, data, renderActions }) => {
  return (
    <div className="container w-full mx-auto px-2">
      <div className="p-8 mt-6 lg:mt-0 rounded shadow bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              {columns.map((column, index) => (
                <th key={index} className="py-3 px-4 border-b border-blue-600">
                  {column.header}
                </th>
              ))}
              {/* Agregar una columna de acciones si se proporciona renderActions */}
              {renderActions && <th className="py-3 px-4 border-b border-blue-600">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="py-2 px-4 border-b border-gray-300">
                    {row[column.accessor]}
                  </td>
                ))}
                {/* Renderizar las acciones si se proporciona renderActions */}
                {renderActions && (
                  <td className="py-2 px-4 border-b border-gray-300">
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};







