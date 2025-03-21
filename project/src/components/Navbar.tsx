import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="py-8 px-6 md:px-48 flex justify-between items-center">
      <Link to="/" className="text-xl font-light tracking-wider hover:opacity-70 transition-opacity">
        QIMING XIE
      </Link>
      <nav className="flex gap-8">
        <Link to="/" className="text-sm tracking-wide hover:opacity-70 transition-opacity">
          GALLERY
        </Link>
        <Link to="/projects" className="text-sm tracking-wide hover:opacity-70 transition-opacity">
          PROJECTS
        </Link>
        <Link to="/about" className="text-sm tracking-wide hover:opacity-70 transition-opacity">
          ABOUT
        </Link>
      </nav>
    </header>
  );
};

export default Navbar; 