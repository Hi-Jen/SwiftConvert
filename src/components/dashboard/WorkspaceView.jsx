import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, ShieldCheck, History, Clock, ArrowRight } from 'lucide-react';

const WorkspaceView = ({ history, children }) => {
  return (
    <div className="space-y-8">
      {/* Main Workspace Area */}
      <section className="glass-card rounded-[32px] p-8 min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <h2 className="text-xl font-black">파일 변환</h2>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider">System Active</span>
          </div>
        </div>
        
        {children}
      </section>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 flex items-center gap-4 group hover:border-indigo-500/30 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold opacity-40 capitalize">This Month</p>
            <p className="text-xl font-black">{history.length} 개 변환됨</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 flex items-center gap-4 group hover:border-purple-500/30 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="text-purple-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold opacity-40 capitalize">Security Status</p>
            <p className="text-xl font-black">100% Client-Side</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceView;
