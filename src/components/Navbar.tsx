'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 监听滚动事件，添加背景色渐变效果
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 打开菜单时禁止背景滚动
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // 点击外部区域关闭菜单
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(target) && 
        !buttonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* 固定高度占位符，防止内容被导航栏遮挡 */}
      <div className="h-[74px] w-full"></div>
      
      {/* 导航栏主体 */}
      <header 
        className={`fixed top-0 left-0 right-0 h-[74px] z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-sm' : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="h-full flex justify-between items-center px-3 sm:px-4 md:px-6 lg:px-48">
          {/* Logo */}
          <Link to="/" className="text-xl font-light tracking-wider hover:opacity-70 transition-opacity">
            QIMING XIE
          </Link>
          
          {/* 桌面导航 */}
          <nav className="hidden md:flex gap-8">
            <Link to="/" className="text-sm tracking-wide hover:opacity-70 transition-opacity py-2">
              GALLERY
            </Link>
            {/* <Link to="/projects" className="text-sm tracking-wide hover:opacity-70 transition-opacity py-2">
              PROJECTS
            </Link> */}
            <Link to="/about" className="text-sm tracking-wide hover:opacity-70 transition-opacity py-2">
              ABOUT
            </Link>
          </nav>
          
          {/* 移动端汉堡菜单按钮 */}
          <button 
            ref={buttonRef}
            className="md:hidden flex items-center justify-center p-2 z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      
      {/* 移动端菜单 */}
      <div 
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div 
          ref={menuRef}
          className="flex flex-col gap-8 items-center justify-center h-full text-xl"
        >
          <Link 
            to="/" 
            className="text-lg text-gray-900 tracking-wide hover:opacity-70 transition-opacity px-4 py-2 inline-block"
            onClick={() => setIsMenuOpen(false)}
          >
            GALLERY
          </Link>
          
          <Link 
            to="/projects" 
            className="text-lg text-gray-900 tracking-wide hover:opacity-70 transition-opacity px-4 py-2 inline-block"
            onClick={() => setIsMenuOpen(false)}
          >
            PROJECTS
          </Link>
          
          <Link 
            to="/about" 
            className="text-lg text-gray-900 tracking-wide hover:opacity-70 transition-opacity px-4 py-2 inline-block"
            onClick={() => setIsMenuOpen(false)}
          >
            ABOUT
          </Link>
          
          <div className="absolute bottom-12 text-sm text-gray-700 opacity-70">
            © {new Date().getFullYear()} Qiming Xie
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar; 