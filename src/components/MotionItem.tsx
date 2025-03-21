import React from 'react';
import { motion } from 'framer-motion';

interface MotionItemProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

const MotionItem: React.FC<MotionItemProps> = ({ 
  children,
  delay = 0,
  duration = 0.5
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay,
        duration
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
};

export default MotionItem; 