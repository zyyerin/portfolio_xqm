/**
 * 获取应用的基础路径
 */
export const getBasePath = (): string => {
  return import.meta.env.VITE_BASE_URL || '/portfolio_xqm/';
};

/**
 * 生成带有基础路径的资源URL
 * @param path 资源相对路径
 * @returns 完整的资源URL
 */
export const getAssetPath = (path: string): string => {
  // 如果路径已经是绝对URL或者已经包含基础路径,直接返回
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith(getBasePath())) {
    return path;
  }

  // 确保path不以'/'开头
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  // 确保基础路径以'/'结尾
  const base = getBasePath();
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  
  return `${normalizedBase}${normalizedPath}`;
}; 