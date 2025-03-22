import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import MotionItem from './MotionItem';
import PageLayout from './PageLayout';
import { projects } from '../data/projects';
import { LazyImage } from '../utils/useLazyLoad';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 检测设备是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 小于768px视为移动设备
    };
    
    // 初始检查
    checkMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">项目未找到</h1>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            返回项目列表
          </button>
        </div>
      </div>
    );
  }

  const breakpointColumns = {
    default: 3,
    1024: 2,
    768: 1
  };

  const handleImageClick = (src: string, index: number) => {
    // 如果是移动设备，不打开灯箱
    if (isMobile) return;
    
    setSelectedImage(src);
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : (project.images?.length || 0) - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < (project.images?.length || 0) - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <PageLayout>
      {/* Hero Section */}
      <MotionItem>
        <div className="mb-12">
          <h1 className="text-3xl font-light mb-4">{project.name}</h1>
          <div className="flex gap-4 text-gray-600">
            <span>{project.category}</span>
            <span>•</span>
            <span>{project.year}</span>
          </div>
        </div>
      </MotionItem>

      {/* Images Grid */}
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {project.images?.map((image, index) => (
          <motion.div
            key={image.src}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`mb-4 ${
              project.layout?.[index] === 'full' 
                ? 'col-span-full' 
                : project.layout?.[index] === 'two' 
                  ? 'md:col-span-2' 
                  : ''
            }`}
          >
            <div
              className={`relative ${!isMobile ? 'cursor-pointer' : ''}`}
              onClick={() => handleImageClick(image.src, index)}
            >
              <LazyImage
                src={image.src}
                alt={`${project.name} - Image ${index + 1}`}
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        ))}
      </Masonry>

      {/* Lightbox - 仅在非移动设备上显示 */}
      <AnimatePresence>
        {selectedImage && !isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={handleClose}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={handleClose}
            >
              <X size={32} />
            </button>
            <button
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
              onClick={handlePrevious}
            >
              <ChevronLeft size={48} />
            </button>
            <motion.img
              key={selectedImage}
              src={selectedImage}
              alt="Selected"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <button
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
              onClick={handleNext}
            >
              <ChevronRight size={48} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <MotionItem delay={0.3}>
        <div className="flex justify-between items-center border-t border-gray-200 pt-8">
          <button
            onClick={() => navigate(`/projects/${projects[currentIndex === 0 ? projects.length - 1 : currentIndex - 1].id}`)}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 text-sm tracking-wide ${
              currentIndex === 0 ? 'text-gray-400' : 'text-black hover:opacity-70'
            }`}
          >
            <ChevronLeft size={16} />
            Previous Project
          </button>
          <button
            onClick={() => navigate(`/projects/${projects[currentIndex === projects.length - 1 ? 0 : currentIndex + 1].id}`)}
            disabled={currentIndex === projects.length - 1}
            className={`flex items-center gap-2 text-sm tracking-wide ${
              currentIndex === projects.length - 1 ? 'text-gray-400' : 'text-black hover:opacity-70'
            }`}
          >
            Next Project
            <ChevronRight size={16} />
          </button>
        </div>
      </MotionItem>
    </PageLayout>
  );
};

export default ProjectDetail; 