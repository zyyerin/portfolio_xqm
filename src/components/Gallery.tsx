import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LazyImage } from '../utils/useLazyLoad';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GalleryImage, 
  GALLERY_CONFIG, 
  generateGalleryImages, 
  filterValidImages 
} from '../utils/imageUtils';

interface ProcessedGalleryImage extends GalleryImage {
  colSpan: number;
  rowSpan: number;
}

interface GalleryProps {
  images?: GalleryImage[];
  customFolderPath?: string;
}

const Gallery: React.FC<GalleryProps> = ({ images: initialImages, customFolderPath }) => {
  const [processedImages, setProcessedImages] = useState<ProcessedGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      
      // 如果已提供初始图片，使用它们；否则，动态生成图片列表
      let imagesToProcess = initialImages;
      
      if (!imagesToProcess) {
        const folderPath = customFolderPath || GALLERY_CONFIG.folderPath;
        const generatedImages = generateGalleryImages(folderPath);
        // 过滤掉无法加载的图片
        const validImages = await filterValidImages(generatedImages);
        imagesToProcess = validImages;
      }
      
      if (!imagesToProcess || imagesToProcess.length === 0) {
        console.warn('没有找到有效的图片');
        setLoading(false);
        setProcessedImages([]);
        return;
      }

      const loadImageDimensions = async () => {
        const processed = await Promise.all(
          imagesToProcess!.map(async (image) => {
            if (image.aspectRatio) return { ...image, aspectRatio: image.aspectRatio };
            
            try {
              const dimensions = await getImageDimensions(image.url);
              return { ...image, aspectRatio: dimensions.width / dimensions.height };
            } catch (error) {
              console.error('加载图片尺寸失败:', error);
              return { ...image, aspectRatio: 1 };
            }
          })
        );

        const sortedImages = [...processed].sort((a, b) => {
          const getNumberFromUrl = (url: string) => {
            const match = url.match(/(\d+)\.jpg$/);
            return match ? parseInt(match[1]) : 0;
          };
          return getNumberFromUrl(b.url) - getNumberFromUrl(a.url);
        });

        const processedWithSpans = sortedImages.map((image, index) => {
          const groupIndex = Math.floor(index / 9);
          const isHorizontal = image.aspectRatio > 1;
          let colSpan = 1, rowSpan = 1;

          if (image.aspectRatio > 2.5) {
            colSpan = 3;
          } else if (isHorizontal) {
            const groupStart = groupIndex * 9;
            const groupEnd = Math.min(groupStart + 9, sortedImages.length);
            const horizontalImagesInGroup = sortedImages
              .slice(groupStart, groupEnd)
              .map((img, i) => ({ index: groupStart + i, isHorizontal: img.aspectRatio > 1 }))
              .filter(img => img.isHorizontal);

            if (horizontalImagesInGroup.length > 0 && horizontalImagesInGroup[0].index === index) {
              colSpan = 2;
            }
          } else if (image.aspectRatio < 0.5) {
            rowSpan = 3;
          } else if (image.aspectRatio < 0.7) {
            rowSpan = 2;
          }

          return { ...image, colSpan, rowSpan };
        });
        
        setProcessedImages(processedWithSpans);
        setLoading(false);
      };
      
      loadImageDimensions();
    };
    
    loadImages();
  }, [initialImages, customFolderPath]);

  const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = url;
    });
  };

  const openLightbox = (index: number) => {
    if (isMobile) return;
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPreviousImage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? processedImages.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToNextImage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === processedImages.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    switch (e.key) {
      case 'ArrowLeft': goToPreviousImage(); break;
      case 'ArrowRight': goToNextImage(); break;
      case 'Escape': closeLightbox(); break;
    }
  }, [lightboxOpen, isAnimating]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeInImage {
        0% { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      .lightbox-container { animation: fadeIn 0.3s ease-in-out forwards; }
      .lightbox-image { animation: fadeInImage 0.3s ease-in-out; }
    `;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    900: 2,
    580: 2,
    400: 1
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    );
  }

  if (processedImages.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-500">没有找到图片</div>
      </div>
    );
  }

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-2 sm:-ml-3 md:-ml-4"
        columnClassName="pl-2 sm:pl-3 md:pl-4 bg-clip-padding"
      >
        {processedImages.map((image, index) => (
          <div
            key={index}
            className="mb-2 sm:mb-3 md:mb-4 animate-fadeIn"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationDuration: '0.5s'
            }}
            onClick={() => openLightbox(index)}
          >
            <div className={`relative overflow-hidden ${!isMobile && 'cursor-pointer'}`}>
              <LazyImage
                src={image.url}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-auto transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        ))}
      </Masonry>
      <div className="pb-8 mb-4"></div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button className="absolute top-4 right-4 text-white p-2 z-10" onClick={closeLightbox}>
              <X size={24} />
            </button>
            
            <button 
              className="absolute left-4 text-white p-2 z-10"
              onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}
            >
              <ChevronLeft size={40} />
            </button>
            
            <button 
              className="absolute right-4 text-white p-2 z-10"
              onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
            >
              <ChevronRight size={40} />
            </button>
            
            <div 
              className="relative w-full h-full flex items-center justify-center p-4 md:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={processedImages[currentImageIndex].url} 
                alt={`Lightbox image ${currentImageIndex}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

Gallery.defaultProps = {
  customFolderPath: GALLERY_CONFIG.folderPath
};

export default Gallery;