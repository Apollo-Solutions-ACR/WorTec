import React, { useState } from "react";
import { ClassLevelAdmin } from '../component/classLevelComponent.js';
import { SubjectAdmin } from "../component/subjectComponent.js";
import { UserAdmin } from "../component/userAminComponent.js";
import { SubjectLevelAdmin } from "../component/subjectLevelComponent.js";
import { AssignTeacherAdmin } from "../component/assignTeacherComponent.js";

export const AcademicManagement = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedSubComponent, setSelectedSubComponent] = useState(null); // Nuevo estado para subcomponentes

  const handleComponentChange = (componentType) => {
    setSelectedComponent(componentType);
    setSelectedSubComponent(null); // Reinicia el subcomponente al cambiar de sección principal
  };

  const handleSubComponentChange = (subComponentType) => {
    setSelectedSubComponent(subComponentType);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-10 xl:p-16 max-w-screen mx-auto flex flex-col items-center">
      <h1 className="text-4xl xl:text-5xl font-semibold text-gray-800 mb-4">Administración Académica</h1>
      <hr className="w-3/4 border-gray-300 mb-8" />
    
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl">
        <button 
          onClick={() => handleComponentChange("classLevel")}
          className={`bg-blue-500 text-white rounded-md shadow-md px-5 py-3 lg:px-5 lg:py-3 xl:px-7 xl:py-3 transition-transform duration-300 hover:scale-105 hover:shadow-lg ${selectedComponent === "classLevel" ? "bg-blue-600 scale-105 shadow-lg shadow-blue-500/50" : "hover:bg-blue-600"}`}
        >
          <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold">Niveles</h2>
        </button>
        <button 
          onClick={() => handleComponentChange("subject")}
          className={`bg-orange-500 text-white rounded-md shadow-md px-5 py-3 lg:px-6 lg:py-3 xl:px-8 xl:py-3 transition-transform duration-300 hover:scale-105 hover:shadow-lg ${selectedComponent === "subject" ? "bg-orange-600 scale-105 shadow-lg shadow-orange-500/50" : "hover:bg-orange-600"}`}
        >
          <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold">Materias</h2>
        </button>
        <button 
          onClick={() => handleComponentChange("classLevelAssign")}
          className={`bg-yellow-500 text-white rounded-md shadow-md px-5 py-3 lg:px-6 lg:py-3 xl:px-8 xl:py-3 transition-transform duration-300 hover:scale-105 hover:shadow-lg ${selectedComponent === "classLevelAssign" ? "bg-yellow-600 scale-105 shadow-lg shadow-yellow-500/50" : "hover:bg-yellow-600"}`}
        >
          <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold">Asignaciones</h2>
        </button>
        <button 
          onClick={() => handleComponentChange("user")}
          className={`bg-green-600 text-white rounded-md shadow-md px-5 py-3 lg:px-6 lg:py-3 xl:px-8 xl:py-3 transition-transform duration-300 hover:scale-105 hover:shadow-lg ${selectedComponent === "user" ? "bg-green-700 scale-105 shadow-lg shadow-green-500/50" : "hover:bg-green-700"}`}
        >
          <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold">Usuarios</h2>
        </button>
      </div>
    
      <div className="w-full max-w-full sm:max-w-6xl mt-8 lg:mt-12 xl:mt-16">
        {selectedComponent === "classLevel" && (
          <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-md">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-semibold mb-4">Administración de Niveles</h2>
            <ClassLevelAdmin />
          </div>
        )}
        {selectedComponent === "subject" && (
          <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-md">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-semibold mb-4">Administración de Materias</h2>
            <SubjectAdmin />
          </div>
        )}
        {selectedComponent === "classLevelAssign" && (
          <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-md">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-semibold mb-4">Asignación de Materias</h2>
            
            {/* Botones para subopciones centrados y más grandes */}
            <div className="flex justify-center space-x-6 mt-6">
              <button 
                onClick={() => handleSubComponentChange("subjectLevel")}
                className="bg-blue-400 text-white rounded-md shadow-md px-6 py-3 lg:px-7 lg:py-3 xl:px-8 xl:py-4 text-lg lg:text-xl xl:text-2xl transition-transform duration-300 hover:scale-105 hover:bg-blue-500"
              >
                Asignación de materias a niveles
              </button>
              <button 
                onClick={() => handleSubComponentChange("teacherAssignment")}
                className="bg-green-400 text-white rounded-md shadow-md px-6 py-3 lg:px-7 lg:py-3 xl:px-8 xl:py-4 text-lg lg:text-xl xl:text-2xl transition-transform duration-300 hover:scale-105 hover:bg-green-500"
              >
                Asignación de profesores a materias
              </button>
            </div>

            {/* Renderizado de subcomponentes */}
            <div className="mt-8">
              {selectedSubComponent === "subjectLevel" && (
                <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-md">
                  <h2 className="text-2xl lg:text-3xl xl:text-3xl font-semibold mb-4">Administración de materias por nivel</h2>
                  <SubjectLevelAdmin />
                </div>
                )}
              {selectedSubComponent === "teacherAssignment" && (
                <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-md">
                  <h2 className="text-2xl lg:text-3xl xl:text-3xl font-semibold mb-4">Administración de materias por nivel</h2>
                  < AssignTeacherAdmin/>
                </div>
              )}
            </div>
          </div>
        )}
        {selectedComponent === "user" && (
          <div className="bg-white p-6 lg:p-8 xl:p-10 rounded-lg shadow-md">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-semibold mb-4">Administración de Usuarios</h2>
            <UserAdmin />
          </div>
        )}
      </div>
    </div>  
  );
};
