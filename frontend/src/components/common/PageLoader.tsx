import React from 'react';
import { motion } from 'framer-motion';

const PageLoader: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-container-lowest">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <motion.div
            className="absolute h-full w-full rounded-full border-4 border-primary/20"
          />
          <motion.div
            className="absolute h-full w-full rounded-full border-4 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="material-symbols-outlined text-[24px] text-primary absolute">eco</span>
        </div>
        <p className="text-label-md text-on-surface-variant animate-pulse">
          Đang tải trang...
        </p>
      </motion.div>
    </div>
  );
};

export default PageLoader;
