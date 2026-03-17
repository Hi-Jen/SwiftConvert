import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const NavDropdown = ({ isOpen, items, theme }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute top-full left-0 mt-2 w-64 rounded-2xl overflow-hidden shadow-2xl border ${
            theme === 'dark' 
              ? 'bg-black/80 border-white/10 backdrop-blur-xl' 
              : 'bg-white/80 border-black/5 backdrop-blur-xl'
          }`}
        >
          <div className="py-2">
            {items.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors group ${
                  theme === 'dark' 
                    ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                    : 'hover:bg-black/5 text-black/70 hover:text-black'
                }`}
              >
                <div className="flex flex-col grow min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.label}</span>
                    {item.isPro && (
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-tighter shrink-0">
                        PRO
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <span className="text-[10px] opacity-40 font-normal truncate">{item.description}</span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavDropdown;
