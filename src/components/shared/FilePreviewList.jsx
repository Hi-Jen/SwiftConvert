import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, X, CheckCircle, Trash2 } from 'lucide-react';

const FilePreviewList = ({ 
  files, 
  theme, 
  removeFile, 
  setFiles, 
  onClearAll 
}) => {
  const totalSize = files.reduce((acc, f) => acc + parseFloat(f.size), 0).toFixed(2);

  const handleFormatChange = (id, format) => {
    const newFiles = [...files];
    const idx = newFiles.findIndex(f => f.id === id);
    if (idx !== -1) {
      newFiles[idx].format = format;
      setFiles(newFiles);
    }
  };

  if (files.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">업로드된 파일 ({files.length})</span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${theme === 'dark' ? 'bg-white/10 text-white/50' : 'bg-black/5 text-black/40'}`}>
            Total: {totalSize} MB
          </span>
        </div>
        <button 
          onClick={onClearAll}
          className="flex items-center gap-1.5 text-sm font-bold text-red-500/60 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          모두 지우기
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar outline-none">
        {files.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-2xl p-5 relative overflow-hidden group border transition-colors ${item.status === 'error' ? 'border-red-500/20 bg-red-500/5' : 'border-transparent'}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0`}>
                  {item.status === 'error' ? (
                    <AlertCircle className="text-red-500 w-6 h-6" />
                  ) : (
                    <img src={item.preview} className="w-full h-full object-cover" alt={item.name} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  {item.status === 'error' ? (
                    <p className="text-[10px] text-red-500 font-bold">{item.errorDetail}</p>
                  ) : (
                    <p className="text-[10px] opacity-40 font-bold uppercase">{item.size} MB • {item.status}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => removeFile(item.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-black/5 dark:bg-white/5">
                {['png', 'jpg', 'webp', 'pdf'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => handleFormatChange(item.id, fmt)}
                    className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-black transition-all ${
                      item.format === fmt 
                        ? theme === 'dark' ? 'bg-white text-black' : 'bg-indigo-600 text-white'
                        : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              {item.status === 'completed' && <CheckCircle className="text-green-500 w-5 h-5" />}
            </div>

            {item.progress > 0 && item.status !== 'completed' && (
              <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300" style={{ width: `${item.progress}%` }} />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FilePreviewList;
