import React from 'react';

export const Progress = () => {
  return (
    <div className="dashboard-container bg-orange-500 rounded-lg p-2 text-white shadow-md flex flex-col justify-center items-center">
      <h2 className="text-xl font-bold mb-4">Notificaciones</h2>
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-purple-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex justify-center items-center text-2xl font-bold">60%</div>
      </div>
    </div>
  );
};

