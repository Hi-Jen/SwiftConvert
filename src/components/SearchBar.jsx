import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

const SearchBar = ({ isOpen, onClose, theme }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          
          {/* Search Panel */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 left-0 right-0 z-[70] h-20 flex items-center justify-center border-b ${
              theme === 'dark' 
                ? 'bg-black/80 border-white/10 text-white' 
                : 'bg-white/80 border-black/5 text-black'
            } backdrop-blur-2xl`}
          >
            <div className="w-full max-w-4xl px-4 flex items-center gap-4">
              <Search className="w-6 h-6 opacity-40" />
              <input
                autoFocus
                placeholder="어떤 도구를 찾으시나요? (예: PDF to JPG, 압축...)"
                className="grow bg-transparent border-none outline-none text-xl font-medium placeholder:opacity-30"
              />
              <button 
                onClick={onClose}
                className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
