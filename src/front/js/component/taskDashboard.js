import React from 'react';

export const Task = () => {
  return (
    <div className="dashboard-container bg-orange-500 rounded-lg p-4 text-white shadow-lg">
      {/* Título centrado */}
      <h1 className="text-xl font-bold mb-4 text-center">Tasks</h1>
      
      {/* Lista alineada a la izquierda */}
      <div>
        <ul className="space-y-2 text-left">
          <li>📚 Practice</li>
          <li>📝 Activities</li>
          <li>
            📂 Homework 
            <span className="ml-2 bg-white text-orange-500 px-2 py-1 rounded-full text-sm">3</span>
          </li>
          <li>
            🧪 Test 
            <span className="ml-2 bg-white text-orange-500 px-2 py-1 rounded-full text-sm">1</span>
          </li>
        </ul>
      </div>
    </div>
  );
};


