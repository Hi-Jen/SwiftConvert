import React from 'react';
import { motion } from 'framer-motion';
import { 
  History, Settings, Star, 
  LayoutDashboard, User, Shield, 
  ChevronRight, LogOut 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, theme, user }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const menuItems = [
    { id: 'workspace', label: '작업 공간', icon: LayoutDashboard },
    { id: 'history', label: '최근 변환 기록', icon: History },
    { id: 'account', label: '내 계정 설정', icon: User },
  ];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <div className={`w-72 h-full flex flex-col border-r ${
      theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white/40 border-black/5'
    } backdrop-blur-xl relative z-40 transition-transform duration-300`}>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-10 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-0.5">Premium User</p>
            <p className="font-bold text-sm truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="space-y-2 relative">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'text-white' 
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-apple-dark dark:text-white/60 hover:text-indigo-600 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'group-hover:text-indigo-600'}`} />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 relative z-10 transition-transform ${activeTab === item.id ? 'rotate-90 opacity-100' : 'group-hover:translate-x-1 opacity-20 group-hover:opacity-100'}`} />
              
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-4">
        {showLogoutConfirm ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3"
          >
            <p className="text-xs font-bold text-red-500 text-center">정말 로그아웃 하시겠습니까?</p>
            <div className="flex gap-2">
              <button 
                onClick={onLogout}
                className="flex-1 py-2 bg-red-500 text-white text-[10px] font-black rounded-lg active:scale-95 transition-all"
              >
                예, 로그아웃
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 bg-black/5 dark:bg-white/5 text-[10px] font-black rounded-lg active:scale-95 transition-all"
              >
                취소
              </button>
            </div>
          </motion.div>
        ) : (
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 font-black text-sm hover:bg-red-500/5 transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
