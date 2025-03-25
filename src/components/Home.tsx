import React from 'react';
import Gallery from './Gallery';
import PageLayout from './PageLayout';
import { GALLERY_CONFIG } from '../utils/imageUtils';

const Home = () => {
  return (
    <PageLayout>
      {/* 
        不需要传入images参数，Gallery组件会自动从GALLERY_CONFIG中获取配置
        并处理图片加载失败的情况
      */}
      <Gallery />
    </PageLayout>
  );
};

export default Home; 