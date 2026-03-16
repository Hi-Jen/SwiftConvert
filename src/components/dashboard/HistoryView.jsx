import React from 'react';
import { motion } from 'framer-motion';
import { History, Zap, ArrowRight, Clock } from 'lucide-react';

const HistoryView = ({ history }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <History className="w-6 h-6 text-indigo-500" />
          최근 변환 기록
        </h2>
        <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase">
          Total {history.length} Items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 glass-card rounded-[32px]">
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-bold opacity-30">변환 기록이 없습니다.</p>
          </div>
        ) : (
          history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-[24px] bg-white/70 dark:bg-indigo-500/5 backdrop-blur-xl border border-black/5 dark:border-indigo-500/10 group hover:border-indigo-500/30 transition-all cursor-pointer relative shadow-xl shadow-black/5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase">{item.from_format}</span>
                  <ArrowRight className="w-3 h-3 opacity-30" />
                  <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase">{item.to_format}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold truncate pr-4 opacity-80 group-hover:text-indigo-600 transition-colors">
                  {item.file_name}
                </p>
                <button 
                  className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('보안 정책상 원본 파일은 저장되지 않습니다.');
                  }}
                >
                  <Zap className="w-4 h-4 fill-current" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default HistoryView;
