import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MotionItem from './MotionItem';
import PageLayout from './PageLayout';
import ProjectCard from './ProjectCard';
import { projects, categories } from '../data/projects';

const Projects = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* 过滤器 */}
        <MotionItem>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`
                  px-4 py-2 text-sm tracking-wide transition-all duration-200
                  ${activeFilter === category 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-500 hover:text-black hover:border-b-2 hover:border-gray-300'
                  }
                `}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </MotionItem>

        {/* 项目网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => (
            <MotionItem key={project.id} delay={0.1 + index * 0.05}>
              <ProjectCard 
                project={project}
                onClick={handleProjectClick}
              />
            </MotionItem>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Projects; 