import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Gallery from './Gallery';
import { generateGalleryImages, preloadImages, GALLERY_CONFIG } from '../utils/imageUtils';

const Home = () => {
  // 使用配置中的图片总数
  const { totalImages, folderPath } = GALLERY_CONFIG;
  
  // 生成图片数组
  const galleryImages = generateGalleryImages(totalImages, folderPath);
  
  // 预加载下一批图片
  useEffect(() => {
    // 预加载下一批图片（如果有的话）
    const paths = Array.from({ length: 3 }, (_, i) => `${folderPath}/${totalImages + i + 1}.jpg`);
    preloadImages(paths).catch(() => {
      // 静默失败 - 这些图片可能不存在
      console.log('Some preview images could not be preloaded');
    });
  }, [totalImages, folderPath]);

  return (
    <div className="px-6 md:px-48 py-12">
      <Gallery images={galleryImages} />
    </div>
  );
};

export default Home; 