// 基础URL
export const BASE_URL = 'https://erinzy-1258568418.cos.ap-shanghai.myqcloud.com/portfolio_xqm';

// 项目图片配置
export const PROJECT_CONFIG = {
  COVER_IMAGE: '0.jpg',
  BASE_PATH: 'projects'
} as const;

// 画廊配置
export const GALLERY_CONFIG = {
  maxImages: 100, // 尝试加载的最大图片数量
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
  loaded?: boolean; // 标记图片是否成功加载
}

/**
 * 生成画廊图片数组
 * @param folderPath 文件夹路径
 * @param maxCount 尝试加载的最大图片数量
 */
export function generateGalleryImages(folderPath: string, maxCount: number = GALLERY_CONFIG.maxImages): GalleryImage[] {
  return Array.from({ length: maxCount }, (_, index) => ({
    url: getImageUrl(`${folderPath}/${index + 1}.jpg`),
    aspectRatio: 4 / 3, // 默认宽高比
    loaded: false // 初始状态为未加载
  }));
}

/**
 * 检测图片是否可以加载
 * @param url 图片URL
 */
export function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * 批量检测图片并过滤掉不存在的
 * @param images 图片数组
 */
export async function filterValidImages(images: GalleryImage[]): Promise<GalleryImage[]> {
  const results = await Promise.allSettled(
    images.map(async (image) => {
      const exists = await checkImageExists(image.url);
      return { ...image, loaded: exists };
    })
  );
  
  // 过滤出成功加载的图片
  return results
    .filter((result): result is PromiseFulfilledResult<GalleryImage & {loaded: boolean}> => 
      result.status === 'fulfilled' && result.value.loaded === true
    )
    .map(result => result.value);
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