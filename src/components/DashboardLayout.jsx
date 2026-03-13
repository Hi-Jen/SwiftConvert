import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, History, Zap, 
  FileText, Clock, ArrowRight,
  TrendingUp, ShieldCheck
} from 'lucide-react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ theme, user, onLogout, children }) => {
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:5000/api/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex grow h-[calc(100vh-72px)] overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        theme={theme} 
        user={user}
      />
      
      <main className="grow overflow-y-auto px-8 py-12 custom-scrollbar relative">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-black mb-2 tracking-tight">
              안녕하세요, <span className="text-indigo-600">{user?.email?.split('@')[0]}</span>님!
            </h1>
            <p className="text-lg opacity-40 font-medium">오늘도 멋진 작업을 시작해볼까요? 모든 준비가 끝났습니다.</p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Workspace Area */}
          <div className="xl:col-span-2 space-y-8">
            <section className="glass-card rounded-[32px] p-8 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <h2 className="text-xl font-black">고급 파일 업로드 존</h2>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider">System Active</span>
                </div>
              </div>
              
              {children}
            </section>

            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-40">이번 달 변환량</p>
                  <p className="text-xl font-black">{history.length} 개</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <ShieldCheck className="text-purple-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-40">보안 등급</p>
                  <p className="text-xl font-black">최상급 (Client-Side)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Area: History List */}
          <div className="space-y-6">
            <div className="glass-card rounded-[32px] p-8 h-full bg-indigo-500/5 backdrop-blur-3xl border-indigo-500/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  최근 기록
                </h3>
              </div>
              
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-sm font-bold opacity-30">변환 기록이 없습니다.</p>
                  </div>
                ) : (
                  history.slice(0, 5).map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/10 group hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase">{item.from_format}</span>
                          <ArrowRight className="w-3 h-3 opacity-30" />
                          <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase">{item.to_format}</span>
                        </div>
                      </div>
                      <p className="text-xs font-bold truncate pr-4 opacity-80 group-hover:text-indigo-600 transition-colors">
                        {item.file_name}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>

              {history.length > 5 && (
                <button className="w-full py-4 mt-6 rounded-2xl border border-dashed border-indigo-500/30 text-xs font-black text-indigo-500 hover:bg-indigo-500/5 transition-all">
                  전체 기록 보기
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
