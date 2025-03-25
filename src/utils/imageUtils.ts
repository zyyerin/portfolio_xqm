// 基础URL
export const BASE_URL = 'https://erinzy-1258568418.cos.ap-shanghai.myqcloud.com/portfolio_xqm';

// 项目图片配置
export const PROJECT_CONFIG = {
  COVER_IMAGE: '0.jpg',
  BASE_PATH: 'projects'
} as const;

// 画廊配置
export const GALLERY_CONFIG = {
  initialBatchSize: 12, // 初始加载的图片数量
  batchSize: 12,        // 后续每批加载的图片数量
  maxImages: 100,       // 尝试加载的最大图片数量
  folderPath: 'gallery'
} as const;

// 图片缓存对象，用于存储已检查过的图片信息
const imageCache: Record<string, {
  exists: boolean;
  dimensions?: { width: number; height: number };
  aspectRatio?: number;
}> = {};

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
  loaded?: boolean; // 标记图片是否成功加载
}

/**
 * 生成画廊图片数组
 * @param folderPath 文件夹路径
 * @param startIndex 起始索引
 * @param count 图片数量
 */
export function generateGalleryImages(
  folderPath: string, 
  startIndex: number = 1, 
  count: number = GALLERY_CONFIG.initialBatchSize
): GalleryImage[] {
  return Array.from({ length: count }, (_, index) => {
    const imageIndex = startIndex + index;
    const url = getImageUrl(`${folderPath}/${imageIndex}.jpg`);
    
    // 尝试从缓存获取图片信息
    if (imageCache[url]) {
      return {
        url,
        aspectRatio: imageCache[url].aspectRatio || 4 / 3,
        loaded: imageCache[url].exists
      };
    }
    
    return {
      url,
      aspectRatio: 4 / 3, // 默认宽高比
      loaded: false
    };
  });
}

/**
 * 检测图片是否可以加载并同时获取尺寸
 * @param url 图片URL
 */
export function checkImageWithDimensions(url: string): Promise<{
  exists: boolean;
  dimensions?: { width: number; height: number };
  aspectRatio?: number;
}> {
  // 检查缓存
  if (imageCache[url]) {
    return Promise.resolve(imageCache[url]);
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const dimensions = { 
        width: img.naturalWidth, 
        height: img.naturalHeight 
      };
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const result = { exists: true, dimensions, aspectRatio };
      
      // 存入缓存
      imageCache[url] = result;
      resolve(result);
    };
    
    img.onerror = () => {
      const result = { exists: false };
      
      // 存入缓存
      imageCache[url] = result;
      resolve(result);
    };
    
    img.src = url;
  });
}

/**
 * 批量检测图片并同时获取尺寸
 * @param images 图片数组
 */
export async function processBatchImages(images: GalleryImage[]): Promise<GalleryImage[]> {
  // 使用Promise.all并行处理所有图片
  const results = await Promise.all(
    images.map(async (image) => {
      const { exists, aspectRatio } = await checkImageWithDimensions(image.url);
      return { 
        ...image, 
        loaded: exists,
        aspectRatio: aspectRatio || image.aspectRatio
      };
    })
  );
  
  // 只返回成功加载的图片
  return results.filter(image => image.loaded);
}

// 保留旧的函数以兼容性，但内部使用新的实现
export async function filterValidImages(images: GalleryImage[]): Promise<GalleryImage[]> {
  return processBatchImages(images);
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