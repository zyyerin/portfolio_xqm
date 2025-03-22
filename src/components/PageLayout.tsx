import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-48 py-6 sm:py-8 md:py-12">
      {children}
    </div>
  );
};

export default PageLayout; 