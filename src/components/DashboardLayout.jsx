import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  History, Zap, 
  Menu, X
} from 'lucide-react';
import Sidebar from './Sidebar';
import HistoryView from './dashboard/HistoryView';
import AccountView from './dashboard/AccountView';
import WorkspaceView from './dashboard/WorkspaceView';

const DashboardLayout = ({ theme, user, onLogout, onUpdateUser, children }) => {
  const [activeTab, setActiveTab] = useState('workspace');
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // URL이 변경될 때(상단 네비게이션바 클릭 등) 작업 공간 탭으로 자동 전환
  useEffect(() => {
    setActiveTab('workspace');
  }, [location.pathname]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/history`, {
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
  }, [activeTab]); // Refetch when switching tabs optionally, or keep it sync

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return <HistoryView history={history} />;
      case 'account':
        return <AccountView user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} />;
      case 'workspace':
      default:
        return (
          <WorkspaceView user={user} history={history}>
            {children}
          </WorkspaceView>
        );
    }
  };

  return (
    <div className="flex grow h-[calc(100vh-72px)] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-24 left-6 z-50 p-3 rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ 
          x: isSidebarOpen ? 0 : -300,
          width: isSidebarOpen ? 288 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full z-40"
      >
        <div className="relative h-full">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }} 
            onLogout={onLogout} 
            theme={theme} 
            user={user}
          />
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-8 -right-4 w-8 h-8 rounded-full bg-white dark:bg-black border border-black/5 dark:border-white/10 flex items-center justify-center shadow-lg lg:hidden"
          >
            <X className="w-4 h-4 opacity-40" />
          </button>
        </div>
      </motion.div>
      
      <main className="grow overflow-y-auto px-6 md:px-12 py-12 custom-scrollbar relative">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={activeTab}
          >
            <h1 className="text-3xl font-black mb-2 tracking-tight">
              {activeTab === 'workspace' && (
                <>안녕하세요, <span className="text-indigo-600">{user?.email?.split('@')[0]}</span>님!</>
              )}
              {activeTab === 'history' && "최근 변환 기록"}
              {activeTab === 'account' && "내 계정 설정"}
            </h1>
            <p className="text-lg opacity-40 font-medium">
              {activeTab === 'workspace' && "오늘도 멋진 작업을 시작해볼까요? 모든 준비가 끝났습니다."}
              {activeTab === 'history' && "지금까지 수행한 파일 변환 작업 내역입니다."}
              {activeTab === 'account' && "회원님의 정보를 최신 상태로 유지하고 계정을 관리하세요."}
            </p>
          </motion.div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardLayout;
