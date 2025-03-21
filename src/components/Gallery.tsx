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
    
    if (images.length > 0) {
      loadImageDimensions();
    }
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

  // 打开灯箱 - 仅在非移动设备上启用
  const openLightbox = (index: number) => {
    // 如果是移动设备，不打开灯箱
    if (isMobile) return;
    
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

  // 根据屏幕大小调整瀑布流的列数
  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1
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
      {/* 瀑布流画廊 */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-full gap-4"
        columnClassName="flex flex-col gap-4"
      >
        {processedImages.map((image, index) => (
          <div 
            key={index} 
            className={`overflow-hidden cursor-pointer`}
            onClick={() => openLightbox(index)}
          >
            {/* LazyImage组件用于延迟加载 */}
            <LazyImage
              src={image.url}
              alt={`Gallery image ${index}`}
              className="w-full h-auto hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </Masonry>

      {/* 灯箱组件 */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* 灯箱关闭按钮 */}
            <button 
              className="absolute top-4 right-4 text-white p-2 z-10"
              onClick={closeLightbox}
            >
              <X size={24} />
            </button>
            
            {/* 导航按钮 */}
            <button 
              className="absolute left-4 text-white p-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToPreviousImage();
              }}
            >
              <ChevronLeft size={40} />
            </button>
            
            <button 
              className="absolute right-4 text-white p-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
            >
              <ChevronRight size={40} />
            </button>
            
            {/* 灯箱图片 */}
            <div 
              className="relative w-full h-full flex items-center justify-center p-4 md:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={images[currentImageIndex].url} 
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