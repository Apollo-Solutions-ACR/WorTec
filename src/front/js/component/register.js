
import React, { useContext, useState } from "react";
import "../../styles/index.css";
import { Link, useNavigate } from 'react-router-dom';
import { Context } from "../store/appContext";
import { CountrySelect } from "./countrySelect"; // Asegúrate de importar el componente

// FormTeacher.js

export const FormTeacher = () => {
  const { actions } = useContext(Context);

  const initialFormData = {
    firstName: "",
    firstLastname: "",
    secondLastname: "",
    email: "",
    address: "",
    principalPhone: "",
    secondPhone: "",
    profilePicture: "",  // Se mantiene como cadena vacía
    country: "",
    dni: "",
    details: "",
    role: "TEACHER"
  };

  const [formData, setFormData] = useState({ ...initialFormData });
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos del formulario antes de enviar:", formData);
  
    // Crear un objeto FormData para manejar datos en formato JSON
    const formDataToSend = { ...formData };
  
    try {
      await actions.addUser(formDataToSend); // Pasa el JSON directamente
  
      setRegistrationSuccess(`Se registró con éxito como ${formData.firstName}`);
      setRegistrationError(null);
      setFormData({ ...initialFormData });
    } catch (error) {
      console.error("Error al agregar al usuario: ", error);
      setRegistrationError("Hubo un error al registrar el usuario.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Crear nuevo profesor</h2>

        {registrationSuccess && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
            <i className="fa-regular fa-circle-check"></i> {registrationSuccess}
          </div>
        )}
        {registrationError && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            <i className="fa-solid fa-triangle-exclamation"></i> {registrationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-5">
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="firstLastname"
                value={formData.firstLastname}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter last name"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="secondLastname"
                value={formData.secondLastname}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter second last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                name="principalPhone"
                value={formData.principalPhone}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter principal phone"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="secondPhone"
                value={formData.secondPhone}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter secondary phone"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <CountrySelect
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your DNI"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div>
              <input
                type="text"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter profile picture URL"  // Placeholder adecuado para una URL
              />
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Additional details"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="terms" className="h-4 w-4 text-blue-600 focus:ring-0 rounded mr-2" required />
            <label htmlFor="terms" className="text-gray-700 text-sm">
              I've read and agree with Terms of Service and our Privacy Policy
            </label>
          </div>

          <div>
            <button type="submit" className="w-full py-3 bg-red-500 text-white font-bold rounded-lg">
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};





// FormStudent.js
export const FormStudent = () => {
  const { store, actions } = useContext(Context);
  const baseUrl = "https://ui-avatars.com/api";
  const size = 200;
  const rounded = true;
  const background = "random";
  const initialFormData = {
    firstName: "",
    lastName: "",
    secondLastName: "",
    email: "",
    address: "",
    principalPhone: "",
    secondaryPhone: "",
    profilePicture: null,
    country: "",
    dni: "",
    details: "",
    img: "",
    username: "",  // Aquí podrías agregar un campo para almacenar el nombre de usuario generado
  };
  const [formData, setFormData] = useState({ ...initialFormData });
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const updatedFormData = { ...formData, [name]: updatedValue };
    setFormData(updatedFormData);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const name = `${formData.firstName} ${formData.lastName} ${formData.secondLastName}`;
      const imgURL = `${baseUrl}/?name=${name}&size=${size}&rounded=${rounded}&background=${background}`;
      const updatedFormData = { ...formData, img: imgURL };
      await actions.addUser(updatedFormData);

      setRegistrationSuccess(`Se registró con éxito como ${formData.firstName}`);
      setRegistrationError(null);
      setFormData({ ...initialFormData });
    } catch (error) {
      console.error("Error al agregar al usuario: ", error);
    }
  };

  const generateUsername = () => {
    // Aquí podrías implementar la lógica para generar el nombre de usuario
    const username = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`;
    setFormData({ ...formData, username });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Crear nuevo estudiante</h2>

        {registrationSuccess && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
            <i className="fa-regular fa-circle-check"></i> {registrationSuccess}
          </div>
        )}
        {registrationError && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            <i className="fa-solid fa-triangle-exclamation"></i> {registrationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-5">
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter last name"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="secondLastName"
                value={formData.secondLastName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter second last name"
                required
              />
            </div>
          </div>

          {/* Nuevo div para el Nombre de usuario y botón Generar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-5">
            <div>
              <label className="block text-gray-700 mb-2">Nombre de usuario:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Nombre de usuario"
                readOnly
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={generateUsername}
                className="w-full py-3 bg-red-400 text-white font-bold rounded-lg"
              >
                Generar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                name="principalPhone"
                value={formData.principalPhone}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter principal phone"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter secondary phone"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select your country</option>
                {/* Aquí podrías agregar las opciones de país */}
              </select>
            </div>
            <div>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your DNI"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter your address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div>
              <input
                type="file"
                name="profilePicture"
                onChange={handleFileChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Additional details"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="terms" className="h-4 w-4 text-blue-600 focus:ring-0 rounded mr-2" required />
            <label htmlFor="terms" className="text-gray-700 text-sm">
              I've read and agree with Terms of Service and our Privacy Policy
            </label>
          </div>
          <div>
            <button type="submit" className="w-full py-3 bg-red-500 text-white font-bold rounded-lg">
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// FormParent.js


export const FormParent = () => {
  const { store, actions } = useContext(Context);
  const baseUrl = "https://ui-avatars.com/api";
  const size = 200;
  const rounded = true;
  const background = "random";
  const initialFormData = {
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    img: "",
  };
  const [formData, setFormData] = useState({ ...initialFormData });
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const updatedFormData = { ...formData, [name]: updatedValue };
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setRegistrationError("Las contraseñas no coinciden");
      return;
    }
    try {
      const name = `${formData.firstName} ${formData.middleName} ${formData.lastName} ${formData.secondLastName}`;
      const imgURL = `${baseUrl}/?name=${name}&size=${size}&rounded=${rounded}&background=${background}`;
      const updatedFormData = { ...formData, img: imgURL };
      await actions.addUser(updatedFormData);

      setRegistrationSuccess(`Se registró con éxito como ${formData.firstName}`);
      setRegistrationError(null);
      setFormData({ ...initialFormData });
    } catch (error) {
      console.error("Error al Agregar al usuario: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Create new account</h2>

        {registrationSuccess && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
            <i className="fa-regular fa-circle-check"></i> {registrationSuccess}
          </div>
        )}
        {registrationError && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            <i className="fa-solid fa-triangle-exclamation"></i> {registrationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="col-span-1">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="col-span-1">
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter first last name"
                required
              />
            </div>
            <div className="col-span-1">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter second last name"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
              value="Jocome75"
              disabled
            />
            <button type="button" className="ml-2 px-4 py-2 bg-yellow-500 text-white rounded">
              Generate
            </button>
          </div>
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
              placeholder="Create a password"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
              placeholder="Confirm password"
              required
            />
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="terms" className="h-4 w-4 text-blue-600 focus:ring-0 rounded mr-2" required />
            <label htmlFor="terms" className="text-gray-700 text-sm">
              I've read and agree with Terms of Service and our Privacy Policy
            </label>
          </div>
          <div>
            <button type="submit" className="w-full py-3 bg-red-500 text-white font-bold rounded-lg">
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
