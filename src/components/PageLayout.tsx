import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="px-6 md:px-48 py-12">
      {children}
    </div>
  );
};

export default PageLayout; 