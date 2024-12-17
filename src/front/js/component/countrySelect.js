
import React from "react";
import "../../styles/index.css";
import { Context } from "../store/appContext";

const countries = [
  "Costa Rica",
  "United States",
  "Mexico",
  "Canada",
  "Argentina",
  "Brazil",
  "Chile",
  "Colombia",
  "Spain",
  "France",
  "Germany",
  // Agrega todos los países que necesites
];

export const CountrySelect = ({ name, value, onChange, required = false }) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-600"
      required={required}
    >
      <option value="">Select your country</option>
      {countries.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
};
