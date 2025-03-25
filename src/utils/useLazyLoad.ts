import React, { useEffect, useState, useRef, ImgHTMLAttributes } from 'react';

interface UseLazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: options.root,
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.1,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options.root, options.rootMargin, options.threshold]);

  return { elementRef, isVisible };
}

export interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  (props, ref) => {
    const { 
      src, 
      alt, 
      placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 
      className = '', 
      onLoad, 
      onError,
      fallbackSrc,
      ...rest 
    } = props;
    
    const { elementRef, isVisible } = useLazyLoad();
    const [imgSrc, setImgSrc] = useState<string>(isVisible ? src : placeholder);
    const [hasError, setHasError] = useState<boolean>(false);
    
    useEffect(() => {
      if (isVisible) {
        setImgSrc(src);
      }
    }, [isVisible, src]);
    
    const handleError = () => {
      setHasError(true);
      if (fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
      if (onError) {
        onError();
      }
    };
    
    const handleLoad = () => {
      if (onLoad) {
        onLoad();
      }
    };
    
    const combinedRef = (node: HTMLImageElement | null) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      elementRef.current = node;
    };

    if (hasError && !fallbackSrc) {
      return null;
    }

    return React.createElement('img', {
      ref: combinedRef,
      src: imgSrc,
      alt,
      className: `transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`,
      onLoad: handleLoad,
      onError: handleError,
      ...rest
    });
  }
); 