import React from 'react';
import { motion } from 'framer-motion';
import { 
  History, Settings, Star, 
  LayoutDashboard, User, Shield, 
  ChevronRight, LogOut 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, theme, user }) => {
  const menuItems = [
    { id: 'history', label: '최근 변환 기록', icon: History },
    { id: 'favorites', label: '즐겨찾는 도구', icon: Star },
    { id: 'account', label: '내 계정 설정', icon: User },
    { id: 'security', label: '보안 및 프라이버시', icon: Shield },
  ];

  return (
    <div className={`w-72 h-full flex flex-col border-r ${
      theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white/40 border-black/5'
    } backdrop-blur-xl`}>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-10 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold opacity-40 uppercase tracking-tighter">Premium User</p>
            <p className="font-bold text-sm truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
            </motion.button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 font-bold text-sm hover:bg-red-500/5 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
