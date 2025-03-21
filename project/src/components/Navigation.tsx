import React from 'react';

const Navigation = () => {
  const links = ['Gallery', 'Projects', 'About'];
  
  return (
    <nav>
      <ul className="flex gap-8">
        {links.map((link) => (
          <li key={link}>
            <a 
              href={`#${link.toLowerCase()}`}
              className="hover:opacity-70 text-sm tracking-wide"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;