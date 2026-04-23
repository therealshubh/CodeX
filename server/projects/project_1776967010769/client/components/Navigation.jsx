import React from 'react';
import { NavLink } from 'react-router-dom';
function Navigation() {
  return (
    <nav className="bg-blue-500 text-white p-4 flex justify-between">
      <h1 className="text-3xl font-bold">Jawahar Navodaya Vidyalaya</h1>
      <ul className="flex items-center space-x-4">
        <li><NavLink to="/" className="hover:text-gray-200">Home</NavLink></li>
        <li><NavLink to="/about" className="hover:text-gray-200">About</NavLink></li>
        <li><NavLink to="/contact" className="hover:text-gray-200">Contact</NavLink></li>
      </ul>
    </nav>
  );
}
export default Navigation;