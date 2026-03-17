import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaywallOverlay = ({ title, description }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-[32px]" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 glass-card p-10 rounded-[32px] border border-indigo-500/20 shadow-2xl max-w-sm"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-2xl font-black mb-3">{title || 'PRO 전용 기능'}</h3>
        <p className="text-sm opacity-60 mb-8 font-medium leading-relaxed">
          {description || '이 도구는 월 $2.99의 PRO 요금제 전용입니다. 지금 업그레이드하고 무제한 파일 압축과 대용량 파일 변환 기능을 이용하세요.'}
        </p>
        
        <Link 
          to="/pricing"
          className="w-full apple-btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 group mb-4 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span className="font-black">PRO로 업그레이드</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">
          30-DAY MONEY BACK GUARANTEE
        </p>
      </motion.div>
    </div>
  );
};

export default PaywallOverlay;
