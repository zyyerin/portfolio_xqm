import { motion } from 'framer-motion';
import { Project } from '../data/projects';
import { LazyImage } from '../utils/useLazyLoad';

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group cursor-pointer overflow-hidden rounded-lg aspect-[2/1]"
      onClick={() => onClick(project.id)}
    >
      <LazyImage
        src={project.imageUrl || ''}
        alt={project.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onLoad={() => {
          // Callback for when image loading completes
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      <div className="absolute inset-0 flex flex-col justify-end p-2 sm:p-3 md:p-4 text-white">
        <h3 className="text-base md:text-xl font-bold mb-0.5 md:mb-1">{project.name}</h3>
        <p className="text-xs md:text-sm opacity-90">{project.category} • {project.year}</p>
      </div>
    </motion.div>
  );
} 