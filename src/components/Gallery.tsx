import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LazyImage } from '../utils/useLazyLoad';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  url: string;
  aspectRatio?: number; // 可选的宽高比属性，如果预先知道的话
}

interface ProcessedGalleryImage extends GalleryImage {
  colSpan: number;
  rowSpan: number;
}

interface GalleryProps {
  images: GalleryImage[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [processedImages, setProcessedImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 灯箱状态
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 预加载图片并计算比例
  useEffect(() => {
    const loadImageDimensions = async () => {
      const processed = await Promise.all(
        images.map(async (image) => {
          if (image.aspectRatio) {
            return image;
          }
          
          try {
            const dimensions = await getImageDimensions(image.url);
            return {
              ...image,
              aspectRatio: dimensions.width / dimensions.height
            };
          } catch (error) {
            console.error('Failed to load image dimensions:', error);
            return {
              ...image,
              aspectRatio: 1
            };
          }
        })
      );
      
      setProcessedImages(processed);
      setLoading(false);
    };
    
    loadImageDimensions();
  }, [images]);

  // 获取图片尺寸
  const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // 根据图片比例计算跨度
  const getImageSpans = (image: GalleryImage, aspectRatio: number): ProcessedGalleryImage => {
    let colSpan = 1;
    let rowSpan = 1;
    
    // 更细致的宽高比分类
    if (aspectRatio > 2.5) {  // 超宽图片
      colSpan = 3;
      rowSpan = 1;
    } else if (aspectRatio > 1.7) {  // 宽图
      colSpan = 2;
      rowSpan = 1;
    } else if (aspectRatio < 0.5) {  // 超高图片
      colSpan = 1;
      rowSpan = 3;
    } else if (aspectRatio < 0.7) {  // 高图
      colSpan = 1;
      rowSpan = 2;
    } else if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {  // 接近正方形
      // 随机决定一些正方形图片占据2x2或2x1，增加视觉多样性
      if (Math.random() > 0.8) {
        colSpan = 2;
        rowSpan = 2;
      } else if (Math.random() > 0.6) {
        colSpan = 2;
        rowSpan = 1;
      }
    }
    
    return {
      ...image,
      aspectRatio,
      colSpan,
      rowSpan
    };
  };

  // 打开灯箱
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  };

  // 关闭灯箱
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto'; // 恢复背景滚动
  };

  // 导航到上一张/下一张图片
  const goToPreviousImage = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    
    // 动画结束后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const goToNextImage = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    
    // 动画结束后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // 处理键盘事件
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;

    switch (e.key) {
      case 'ArrowLeft':
        goToPreviousImage();
        break;
      case 'ArrowRight':
        goToNextImage();
        break;
      case 'Escape':
        closeLightbox();
        break;
      default:
        break;
    }
  }, [lightboxOpen, isAnimating]);

  // 添加/移除键盘事件监听器
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 添加CSS动画样式到头部
  useEffect(() => {
    // 创建style元素
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes fadeIn {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeInImage {
        0% { 
          opacity: 0;
          transform: scale(0.95);
        }
        100% { 
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .lightbox-container {
        animation: fadeIn 0.3s ease-in-out forwards;
      }
      
      .lightbox-image {
        animation: fadeInImage 0.3s ease-in-out;
      }
    `;
    
    // 将style添加到头部
    document.head.appendChild(styleElement);
    
    // 清理函数
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const breakpointColumns = {
    default: 3,
    1024: 2,
    768: 1
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[200px]">
        {Array.from({ length: images.length }).map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-200 h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {processedImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="mb-4"
          >
            <div
              className="relative cursor-pointer overflow-hidden"
              onClick={() => openLightbox(index)}
            >
              <LazyImage
                src={image.url}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-auto transition-transform duration-300 hover:scale-125"
              />
            </div>
          </motion.div>
        ))}
      </Masonry>

      {/* 灯箱组件 */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={closeLightbox}
            >
              <X size={32} />
            </button>
            <button
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
              onClick={goToPreviousImage}
              disabled={isAnimating}
            >
              <ChevronLeft size={48} />
            </button>
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex].url}
              alt={`Lightbox image ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <button
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
              onClick={goToNextImage}
              disabled={isAnimating}
            >
              <ChevronRight size={48} />
            </button>
            <div className="absolute bottom-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// 默认属性
Gallery.defaultProps = {
  images: [
    {
      url: "https://erinzy-1258568418.cos.ap-shanghai.myqcloud.com/portfolio_xqm/test/1.jpg"
    },
    {
      url: "https://erinzy-1258568418.cos.ap-shanghai.myqcloud.com/portfolio_xqm/test/2.jpg"
    },
    {
      url: "https://erinzy-1258568418.cos.ap-shanghai.myqcloud.com/portfolio_xqm/test/3.jpg"
    }
  ]
};

export default Gallery;