// 基础URL
export const BASE_URL = 'https://erinzy-1258568418.cos.ap-shanghai.myqcloud.com/portfolio_xqm';

// 项目图片配置
export const PROJECT_CONFIG = {
  COVER_IMAGE: '0.jpg',
  BASE_PATH: 'projects'
} as const;

// 画廊配置
export const GALLERY_CONFIG = {
  totalImages: 12,
  folderPath: 'gallery'
} as const;

/**
 * 获取完整的图片URL
 * @param path 图片路径，如果以/开头，会自动移除
 */
export function getImageUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
}

/**
 * 获取项目封面图片URL
 * @param projectId 项目ID或名称（文件夹名）
 */
export function getProjectCoverUrl(projectId: string | number): string {
  return getImageUrl(`${PROJECT_CONFIG.BASE_PATH}/${projectId}/${PROJECT_CONFIG.COVER_IMAGE}`);
}

/**
 * 获取项目图片URL列表
 * @param projectId 项目ID或名称（文件夹名）
 * @param imageCount 图片数量
 */
export function getProjectImageUrls(projectId: string | number, imageCount: number): string[] {
  return Array.from({ length: imageCount }, (_, index) => 
    getImageUrl(`${PROJECT_CONFIG.BASE_PATH}/${projectId}/${index + 1}.jpg`)
  );
}

/**
 * 生成完整的项目图片列表（包括封面）
 * @param projectId 项目ID或名称（文件夹名）
 * @param imageCount 除封面外的图片数量
 */
export function getAllProjectImages(projectId: string | number, imageCount: number): string[] {
  return [
    getProjectCoverUrl(projectId),
    ...getProjectImageUrls(projectId, imageCount)
  ];
}

// 图片接口定义
export interface GalleryImage {
  url: string;
  aspectRatio?: number;
}

/**
 * 生成画廊图片数组
 * @param count 图片数量
 * @param folderPath 文件夹路径
 */
export function generateGalleryImages(count: number, folderPath: string): GalleryImage[] {
  return Array.from({ length: count }, (_, index) => ({
    url: getImageUrl(`${folderPath}/${index + 1}.jpg`),
    aspectRatio: 4 / 3 // 默认宽高比
  }));
}

/**
 * 预加载单张图片
 * @param url 图片URL
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 批量预加载图片
 * @param urls 图片URL数组
 */
export function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(urls.map(url => preloadImage(url)));
} 