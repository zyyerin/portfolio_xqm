import { getProjectCoverUrl, getAllProjectImages } from '../utils/imageUtils';

export interface ProjectImage {
  src: string;
  span?: 'none' | 'two' | 'full';
}

export interface Project {
  id: string;  // 使用字符串ID，对应文件夹名
  name: string;
  category: string;
  year: string;
  imageCount: number;  // 除封面外的图片数量
  imageUrl?: string;   // 可选，会自动从id生成
  images?: ProjectImage[];   // 可选，会自动从id和imageCount生成
  layout?: {
    [key: number]: 'none' | 'two' | 'full';
  };
}

// 项目基础数据
const projectsData: Omit<Project, 'imageUrl' | 'images'>[] = [
  {
    id: 'tgr-china-2024',
    name: "TGR China",
    category: "Motorsport",
    year: "2024",
    imageCount: 30,
    layout: {
      0: 'full',  // 第一张图片全宽
      5: 'two',   // 第6张图片跨两列
      10: 'full'  // 第11张图片全宽
    }
  },
  {
    id: '24-macau-gt',
    name: "Macau GT",
    category: "Motorsport",
    year: "2024",
    imageCount: 23,
    layout: {
      0: 'full',
      3: 'two'
    }
  },
  {
    id: '23-national',
    name: "GT",
    category: "Motorsport",
    year: "2023",
    imageCount: 61,
    layout: {
      0: 'full',
      5: 'two',
      10: 'full'
    }
  },
  {
    id: 'mercedes-amg-gt',
    name: "Mercedes AMG GT",
    category: "Motorsport",
    year: "2024",
    imageCount: 1,
    layout: {
      0: 'full'
    }
  }
];

// 生成完整的项目数据，包括图片URL
export const projects: Project[] = projectsData.map(project => {
  const imageUrls = getAllProjectImages(project.id, project.imageCount);
  const images = imageUrls.map((src, index) => ({
    src,
    span: project.layout?.[index] || 'none'
  }));

  return {
    ...project,
    imageUrl: getProjectCoverUrl(project.id),
    images
  };
});

// 项目分类
export const categories = ['all', 'Motorsport', 'Automotive Commercial', 'Other'] as const;

// 导出类型
export type Category = typeof categories[number]; 