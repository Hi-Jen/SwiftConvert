import React from 'react';
import { motion } from 'framer-motion';

const Background = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-[#F5F5F7]'}`}>
      {/* Dynamic Gradients */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] ${isDark ? 'bg-blue-600/30' : 'bg-blue-400/20'}`}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[120px] ${isDark ? 'bg-purple-600/30' : 'bg-purple-400/20'}`}
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full blur-[100px] ${isDark ? 'bg-pink-600/20' : 'bg-pink-400/10'}`}
      />
      
      {/* Noise Overlay (Subtle Apple effect) */}
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${!isDark ? 'invert' : ''}`} />
    </div>
  );
};

export default Background;
