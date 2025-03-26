// Base URL
export const BASE_URL = 'https://erinzy-1258568418.cos.ap-shanghai.myqcloud.com/portfolio_xqm';

// Project image configuration
export const PROJECT_CONFIG = {
  COVER_IMAGE: '0.jpg',
  BASE_PATH: 'projects'
} as const;

// Gallery configuration
export const GALLERY_CONFIG = {
  initialBatchSize: 12, // Initial batch size
  batchSize: 12,        // Subsequent batch size
  maxImages: 100,       // Maximum number of images to try loading
  folderPath: 'gallery'
} as const;

// Image cache object for storing checked image information
const imageCache: Record<string, {
  exists: boolean;
  dimensions?: { width: number; height: number };
  aspectRatio?: number;
}> = {};

/**
 * Get complete image URL
 * @param path Image path, if starts with /, it will be removed
 */
export function getImageUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
}

/**
 * Get project cover image URL
 * @param projectId Project ID or name (folder name)
 */
export function getProjectCoverUrl(projectId: string | number): string {
  return getImageUrl(`${PROJECT_CONFIG.BASE_PATH}/${projectId}/${PROJECT_CONFIG.COVER_IMAGE}`);
}

/**
 * Get project image URL list
 * @param projectId Project ID or name (folder name)
 * @param imageCount Number of images
 */
export function getProjectImageUrls(projectId: string | number, imageCount: number): string[] {
  return Array.from({ length: imageCount }, (_, index) => 
    getImageUrl(`${PROJECT_CONFIG.BASE_PATH}/${projectId}/${index + 1}.jpg`)
  );
}

/**
 * Generate complete project image list (including cover)
 * @param projectId Project ID or name (folder name)
 * @param imageCount Number of images excluding cover
 */
export function getAllProjectImages(projectId: string | number, imageCount: number): string[] {
  return [
    getProjectCoverUrl(projectId),
    ...getProjectImageUrls(projectId, imageCount)
  ];
}

// Image interface definition
export interface GalleryImage {
  url: string;
  aspectRatio?: number;
  loaded?: boolean; // Flag indicating if image loaded successfully
}

/**
 * Generate gallery images array
 * @param folderPath Folder path
 * @param startIndex Start index
 * @param count Number of images
 */
export function generateGalleryImages(
  folderPath: string, 
  startIndex: number = 1, 
  count: number = GALLERY_CONFIG.initialBatchSize
): GalleryImage[] {
  return Array.from({ length: count }, (_, index) => {
    const imageIndex = startIndex + index;
    const url = getImageUrl(`${folderPath}/${imageIndex}.jpg`);
    
    // Try to get image information from cache
    if (imageCache[url]) {
      return {
        url,
        aspectRatio: imageCache[url].aspectRatio || 4 / 3,
        loaded: imageCache[url].exists
      };
    }
    
    return {
      url,
      aspectRatio: 4 / 3, // Default aspect ratio
      loaded: false
    };
  });
}

/**
 * Check if image can be loaded and get dimensions
 * @param url Image URL
 */
export function checkImageWithDimensions(url: string): Promise<{
  exists: boolean;
  dimensions?: { width: number; height: number };
  aspectRatio?: number;
}> {
  // Check cache
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
      
      // Store in cache
      imageCache[url] = result;
      resolve(result);
    };
    
    img.onerror = () => {
      const result = { exists: false };
      
      // Store in cache
      imageCache[url] = result;
      resolve(result);
    };
    
    img.src = url;
  });
}

/**
 * Batch check images and get dimensions
 * @param images Image array
 */
export async function processBatchImages(images: GalleryImage[]): Promise<GalleryImage[]> {
  // Process all images in parallel using Promise.all
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
  
  // Only return successfully loaded images
  return results.filter(image => image.loaded);
}

// Keep old function for compatibility, but use new implementation internally
export async function filterValidImages(images: GalleryImage[]): Promise<GalleryImage[]> {
  return processBatchImages(images);
}

/**
 * Preload single image
 * @param url Image URL
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
 * Batch preload images
 * @param urls Image URL array
 */
export function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(urls.map(url => preloadImage(url)));
} 