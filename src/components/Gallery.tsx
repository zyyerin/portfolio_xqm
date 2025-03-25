import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LazyImage } from '../utils/useLazyLoad';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GalleryImage, 
  GALLERY_CONFIG, 
  generateGalleryImages, 
  processBatchImages 
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const folderPathRef = useRef(customFolderPath || GALLERY_CONFIG.folderPath);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 处理图片尺寸并添加布局信息
  const processImagesWithLayout = (images: GalleryImage[]): ProcessedGalleryImage[] => {
    if (!images || images.length === 0) return [];

    const sortedImages = [...images].sort((a, b) => {
      const getNumberFromUrl = (url: string) => {
        const match = url.match(/(\d+)\.jpg$/);
        return match ? parseInt(match[1]) : 0;
      };
      return getNumberFromUrl(b.url) - getNumberFromUrl(a.url);
    });

    return sortedImages.map((image, index) => {
      const groupIndex = Math.floor(index / 9);
      const isHorizontal = image.aspectRatio! > 1;
      let colSpan = 1, rowSpan = 1;

      if (image.aspectRatio! > 2.5) {
        colSpan = 3;
      } else if (isHorizontal) {
        const groupStart = groupIndex * 9;
        const groupEnd = Math.min(groupStart + 9, sortedImages.length);
        const horizontalImagesInGroup = sortedImages
          .slice(groupStart, groupEnd)
          .map((img, i) => ({ index: groupStart + i, isHorizontal: img.aspectRatio! > 1 }))
          .filter(img => img.isHorizontal);

        if (horizontalImagesInGroup.length > 0 && horizontalImagesInGroup[0].index === index) {
          colSpan = 2;
        }
      } else if (image.aspectRatio! < 0.5) {
        rowSpan = 3;
      } else if (image.aspectRatio! < 0.7) {
        rowSpan = 2;
      }

      return { ...image, colSpan, rowSpan };
    });
  };

  // 加载初始图片批次
  useEffect(() => {
    const loadInitialBatch = async () => {
      setLoading(true);
      
      // 如果提供了初始图片，直接使用
      if (initialImages && initialImages.length > 0) {
        setProcessedImages(processImagesWithLayout(initialImages));
        setAllImagesLoaded(true);
        setLoading(false);
        return;
      }

      try {
        const folderPath = customFolderPath || GALLERY_CONFIG.folderPath;
        folderPathRef.current = folderPath;
        
        // 生成初始批次图片
        const initialBatch = generateGalleryImages(
          folderPath, 
          1, 
          GALLERY_CONFIG.initialBatchSize
        );
        
        // 过滤和处理图片
        const validImages = await processBatchImages(initialBatch);
        
        if (validImages.length > 0) {
          setProcessedImages(processImagesWithLayout(validImages));
          setCurrentBatch(2); // 设置下一批次索引
          
          // 如果获取的有效图片数量小于请求的数量，表示已经加载完所有图片
          if (validImages.length < GALLERY_CONFIG.initialBatchSize) {
            setAllImagesLoaded(true);
          }
        } else {
          setAllImagesLoaded(true);
        }
      } catch (error) {
        console.error('加载图片失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialBatch();
  }, [initialImages, customFolderPath]);

  // 监听滚动以加载更多图片
  useEffect(() => {
    if (allImagesLoaded || loading || loadingMore || !galleryRef.current) return;

    const handleScroll = () => {
      if (loadingMore || allImagesLoaded) return;

      const galleryBottom = galleryRef.current?.getBoundingClientRect().bottom || 0;
      const windowHeight = window.innerHeight;
      
      // 当滚动到画廊底部附近时加载更多图片
      if (galleryBottom - windowHeight < 500) {
        loadMoreImages();
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, loadingMore, allImagesLoaded, processedImages]);

  // 加载更多图片的函数
  const loadMoreImages = async () => {
    if (loadingMore || allImagesLoaded) return;
    
    setLoadingMore(true);
    
    try {
      // 计算下一批次的起始索引
      const startIndex = (currentBatch - 1) * GALLERY_CONFIG.batchSize + 1;
      
      // 生成下一批次图片
      const nextBatch = generateGalleryImages(
        folderPathRef.current, 
        startIndex, 
        GALLERY_CONFIG.batchSize
      );
      
      // 过滤和处理图片
      const validImages = await processBatchImages(nextBatch);
      
      if (validImages.length > 0) {
        // 将新图片与现有图片合并，并进行布局处理
        setProcessedImages(prevImages => {
          const combinedImages = [...prevImages, ...processImagesWithLayout(validImages)];
          
          // 排序（如果需要）
          return combinedImages.sort((a, b) => {
            const getNumberFromUrl = (url: string) => {
              const match = url.match(/(\d+)\.jpg$/);
              return match ? parseInt(match[1]) : 0;
            };
            return getNumberFromUrl(b.url) - getNumberFromUrl(a.url);
          });
        });
        
        setCurrentBatch(prev => prev + 1);
        
        // 如果获取的有效图片数量小于请求的数量，表示已经加载完所有图片
        if (validImages.length < GALLERY_CONFIG.batchSize) {
          setAllImagesLoaded(true);
        }
      } else {
        setAllImagesLoaded(true);
      }
    } catch (error) {
      console.error('加载更多图片失败:', error);
    } finally {
      setLoadingMore(false);
    }
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
        <div className="animate-pulse">loading...</div>
      </div>
    );
  }

  if (processedImages.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-500">image not found</div>
      </div>
    );
  }

  return (
    <div ref={galleryRef}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-2 sm:-ml-3 md:-ml-4"
        columnClassName="pl-2 sm:pl-3 md:pl-4 bg-clip-padding"
      >
        {processedImages.map((image, index) => (
          <div
            key={image.url}
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
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </Masonry>
      
      {loadingMore && (
        <div className="py-8 flex justify-center">
          <div className="animate-pulse">加载更多图片中...</div>
        </div>
      )}
      
      {allImagesLoaded && processedImages.length > 0 && (
        <div className="py-8 flex justify-center">
          <div className="text-gray-500">已加载全部图片</div>
        </div>
      )}

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
    </div>
  );
};

Gallery.defaultProps = {
  customFolderPath: GALLERY_CONFIG.folderPath
};

export default Gallery;