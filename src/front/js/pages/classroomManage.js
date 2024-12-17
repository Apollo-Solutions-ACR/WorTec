import React, { useRef, useState, useEffect, useContext } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useSprings, animated, useSpring } from '@react-spring/web';
import { Context } from "../store/appContext";
import { FaTimes } from 'react-icons/fa';
import { ClassLevelRequests } from '../component/classroomManageComponent'; 

export const LevelManageClassroom = () => {
  const { actions } = useContext(Context);
  const [classLevels, setClassLevels] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState({ isOpen: false, title: '', content: null });
  const contentRefs = useRef([]);

  useEffect(() => {
    let isMounted = true;

    const fetchClassLevels = async () => {
      setLoading(true);
      try {
        const levels = await actions.getClassLevelsByUser();
        if (isMounted) {
          setClassLevels(levels);
        }
      } catch (error) {
        console.error('Error fetching class levels:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClassLevels();

    return () => {
      isMounted = false;
    };
  }, [actions]);

  const toggleDropdown = (index) => {
    setOpenIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const handleOpenModal = (option, level) => {
    const title = `${option} ${level.level} ${level.section}`;  
    let content = null;

    if (option === "Solicitudes") {
      content = <ClassLevelRequests levelId={level.id} />;
    }

    setModalData({ 
      isOpen: true, 
      title, 
      content 
    });
  };

  const handleCloseModal = () => {
    setModalData({ isOpen: false, title: '', content: null });
  };

  const springs = useSprings(
    classLevels.length,
    classLevels.map((_, index) => {
      const height = openIndex === index ? 276 : 0;
      return {
        height: height,
        opacity: openIndex === index ? 1 : 0,
        config: { duration: 300 },
      };
    })
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando niveles, por favor espera...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 flex flex-col justify-start items-center">
      <div className="bg-white shadow-lg rounded-lg w-full min-h-screen max-w-6xl mx-auto p-6 flex flex-col">
        <h1 className="text-3xl font-extrabold mb-2 border-b-2 pb-2">
          Bienvenido, Jorge
        </h1>
        <p className="text-gray-800 text-lg mb-6">
          Gestiona de manera eficiente los niveles de tu institución. Al seleccionar un nivel, podrás administrar solicitudes, participantes, materias y contenido.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Agrega un grid de 2 columnas */}
          {classLevels.sort((a, b) => {
              if (a.level !== b.level) {
                return a.level - b.level; // Ordenar numéricamente
              }
              return a.section.localeCompare(b.section); // Ordenar alfabéticamente
            }).map((level, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} onClick={() => toggleDropdown(index)} className="relative bg-orange-600 rounded-md p-4 shadow-md cursor-pointer">
                <div  className="flex justify-between items-center text-white font-semibold">
                  <span>Nivel: {level.level} {level.section}</span>
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <animated.div style={{ ...springs[index], overflow: 'hidden', position: 'absolute', width: '100%', zIndex: 10 }}>
                  <div className="bg-gray-100/90 rounded-md shadow-lg p-3 mt-2">
                    <ul className="space-y-3">
                      {['Solicitudes', 'Participantes', 'Materias', 'Desempeño'].map((item, i) => (
                        <li
                          key={i}
                          className="focus:outline-none focus:ring-4 focus:ring-orange-300 transition-transform transform hover:scale-102 shadow-md bg-blue-500/90 p-2 rounded-md cursor-pointer"
                          onClick={() => handleOpenModal(item, level)}
                        >
                          📄 {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </animated.div>
              </div>
            );
          })}
        </div>
      </div>

      {modalData.isOpen && (
        <ModalClassroomManage 
          title={modalData.title} 
          content={modalData.content} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};


export const ModalClassroomManage = ({ title, content, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const springProps = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'scale(0.9)' : 'scale(1)',
    config: { tension: 300, friction: 20 },
    onRest: () => {
      if (isExiting) {
        onClose();
      }
    },
  });

  const handleClose = () => {
    setIsExiting(true);
  };

  return (
    <animated.div style={{ ...springProps }} className="w-full fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50 overflow-y-auto">
      <div className="bg-white w-full max-h-[80vh] mx-4 p-6 rounded-lg shadow-lg relative overflow-y-auto">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={handleClose}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-orange-600 mb-4 border-b-2 border-orange-300 pb-2">
          {title}
        </h2>

        <div className="text-gray-800 mb-6">
          {content ? content : <p>No hay contenido disponible.</p>}
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            className="bg-orange-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-orange-600 transition-colors"
            onClick={handleClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </animated.div>
  );
};
