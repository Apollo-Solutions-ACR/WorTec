import React from "react";
import { SubjectCardElement, BookCardElement, NotifiCardElement } from "../component/subjectCardElement";

export const AllSubjectRender = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="text-4xl font-semibold mb-4">Materias</div>
      <div className="text-xl font-medium mb-6">Estas son tus materias:</div>

      {/* Toggle buttons */}
      <div className="flex mt-4 space-x-4">
        <button className="border px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-500 hover:text-white">
          Hex
        </button>
        <button className="border px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-green-500 hover:text-white">
          RGB
        </button>
        <button className="border px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-yellow-500 hover:text-white">
          CMYK
        </button>
        <button className="border px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-purple-500 hover:text-white">
          Less
        </button>
      </div>

      {/* Color Box */}
      <div className="p-6 bg-blue-400 text-white rounded-lg shadow-lg mt-8 transition-all duration-300 ease-in-out hover:bg-blue-500">
        <div className="font-semibold text-4xl mb-4 text-center">Ciencias</div>

        {/* Flex container para renderizar los elementos horizontalmente y que abarquen todo el contenedor */}
        <div className="flex space-x-4">
          <div className="text-sm text-gray-800 bg-white p-4 rounded-lg shadow-md flex-grow">
            <SubjectCardElement />
          </div>
          <div className="text-sm text-gray-800 bg-white p-4 rounded-lg shadow-md flex-grow">
            <BookCardElement />
          </div>
          <div className="text-sm text-gray-800 bg-white p-4 rounded-lg shadow-md flex-grow">
            <NotifiCardElement />
          </div>
        </div>
      </div>
    </div>
  );
};


