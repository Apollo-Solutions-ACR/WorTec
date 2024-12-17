import React from 'react';
import { Task } from '../component/taskDashboard';
import { Progress } from '../component/progressDashboard';
import { Event } from '../component/eventDashboard';
import { Messages } from '../component/messageDashboard';

export const Dashboard = () => {
  return (
    <div className="mt-8 md:mt-0 bg-gray-100 grid grid-cols-2 md:grid-cols-2 grid-rows-2 gap-3">
      {/* Primer componente: derecha y hacia abajo */}
      <div className="ml-2 flex items-end justify-end">
        <Task />
      </div>
      {/* Segundo componente: izquierda y hacia abajo */}
      <div className="mr-2 flex items-end justify-start">
        <Progress />
      </div>
      {/* Tercer componente: derecha y hacia arriba */}
      <div className="ml-2 flex items-start justify-end">
        <Event />
      </div>
      {/* Cuarto componente: izquierda y hacia arriba */}
      <div className="mr-2 flex items-start justify-start">
        <Messages />
      </div>
    </div>
  );
};
