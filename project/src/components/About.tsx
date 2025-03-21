import React from 'react';
import MotionItem from './MotionItem';
import PageLayout from './PageLayout';

const About = () => {
  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
        <MotionItem>
          <div className="w-60 h-60 overflow-hidden rounded-full shrink-0">
            <img 
              src="/profile.jpg" 
              alt="谢启明 Dylan Xie" 
              className="w-full h-full object-cover"
            />
          </div>
        </MotionItem>
        
        <div className="space-y-6">
          <MotionItem delay={0.1}>
            <div className="space-y-2">
              <h2 className="text-2xl font-light tracking-wider">谢启明 ｜ Dylan Xie</h2>
              <br />
              <p className="text-gray-600">商业、赛车摄影师，色彩管理技术顾问</p>
              <p className="text-gray-600">Commercial/Motorsport Photographer, Color Management Consultant</p>
              <br />
            </div>
          </MotionItem>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <MotionItem delay={0.2}>
                <p className="text-gray-700 leading-relaxed">
                  谢启明，纽约视觉艺术学院(SVA)摄影系硕士，拍摄汽车已有七年。他充满激情地用镜头捕捉各种车辆，从量产车到赛车均有涉猎。汽车摄影领域外，他的作品范围还涵盖人物肖像和自然风光。凭借对光线和事物形态的深刻理解，他致力于创作将机械之美与环境融合的图像。
                </p>
              </MotionItem>
              
              <MotionItem delay={0.3}>
                <p className="text-gray-700 leading-relaxed">
                  他曾在石溪大学作为助教，协助Isak Berbic 教授黑白胶片摄影课程。在协助教学的过程中，他对人造光源与自然光影的理解得到了显著提升。就读于SVA期间，他在Tom Ashe 和 Greg Gorman 的指导下精进了色彩管理和喷墨打印技术。摄影之余，他为哈内姆勒、徕卡画廊等机构提供数码时代的色彩管理技术支持。
                </p>
              </MotionItem>
              
              <MotionItem delay={0.4}>
                <p className="text-gray-700 leading-relaxed">
                  自2023赛季起，谢启明与TOYOTA GAZOO Racing China 建立了深度合作，为车队提供专业影像服务至今。
                </p>
              </MotionItem>
            </div>
            
            <div className="space-y-4">
              <MotionItem delay={0.2}>
                <p className="text-gray-700 leading-relaxed">
                  Dylan Xie, who graduated from the School of Visual Arts, has spent 7 years capturing the essence of automobiles, from production vehicles to racing cars. Beyond the realm of wheels, his portfolio includes portraits and landscapes. With a profound understanding of light and form, Xie crafts images that fuse mechanical beauty within various environments.
                </p>
              </MotionItem>
              
              <MotionItem delay={0.3}>
                <p className="text-gray-700 leading-relaxed">
                  He has served as a TA at Stony Brook University, assisting Isak Berbic in teaching analog photography. During this period, his understanding of artificial lighting and natural light was enhanced. He developed his skills in color management and inkjet printing under the guidance of Tom Ashe and Greg Gorman. Apart from photography, he provides technical support for contemporary color management for Hahnemühle, Leica Gallery, etc.
                </p>
              </MotionItem>
              
              <MotionItem delay={0.4}>
                <p className="text-gray-700 leading-relaxed">
                  Since season 2023, Xie has been collaborating with TOYOTA GAZOO Racing China, providing professional photo and video services for the team.
                </p>
              </MotionItem>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default About; 