import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, CheckCircle, AlertCircle, 
  Download, Zap, Loader2, Sun, Moon, FileText, 
  ChevronDown, Search, ShieldCheck, Globe, Files, Menu, Trash2
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import Background from './components/Background';
import NavDropdown from './components/NavDropdown';
import SearchBar from './components/SearchBar';
import AuthModal from './components/AuthModal';
import DashboardLayout from './components/DashboardLayout';
import { convertImage, imagesToPdf, downloadBlob } from './utils/converter';
import confetti from 'canvas-confetti';

/**
 * SwiftConvert: Premium Client-Side File Converter
 * UI Refined based on Industry Standards (FreeConvert Inspiration)
 */
function App() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [theme, setTheme] = useState('light');
  const [mergeToPdf, setMergeToPdf] = useState(false);
  const fileInputRef = useRef(null);

  // Authentication & Navigation State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' });
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const recordHistory = useCallback(async (fileName, fromFormat, toFormat) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('http://localhost:5000/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fileName, fromFormat, toFormat })
      });
    } catch (err) {
      console.error('Failed to record history:', err);
    }
  }, [user]);

  const menuConfig = {
    '전환': [
      { label: '이미지 변환', path: '/convert/image', description: 'PNG, JPG, WebP 등' },
      { label: 'PDF 변환', path: '/convert/pdf', description: '이미지를 PDF로' },
      { label: '문서 변환', path: '/convert/doc', description: '문서 포맷 변경' },
    ],
    '압축/분해': [
      { label: 'PDF 압축', path: '/compress/pdf', description: '용량 줄이기' },
      { label: 'PDF 분할', path: '/split/pdf', description: '페이지 나누기' },
      { label: '이미지 용량 줄이기', path: '/compress/image', description: '품질 최적화' },
    ],
    '도구': [
      { label: '워터마크 추가', path: '/tools/watermark' },
      { label: '페이지 번호 삽입', path: '/tools/page-number' },
    ],
    'API': [],
    '가격': []
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleFiles = useCallback((newFiles) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const processedFiles = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      status: validTypes.includes(file.type) ? 'idle' : 'error',
      progress: 0,
      preview: URL.createObjectURL(file),
      format: 'webp'
    }));
    setFiles(prev => [...prev, ...processedFiles]);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startConversion = async () => {
    setConverting(true);
    const updatedFiles = [...files];

    if (mergeToPdf) {
      const validFiles = updatedFiles.filter(f => f.status !== 'error');
      try {
        const pdfBlob = await imagesToPdf(validFiles);
        downloadBlob(pdfBlob, 'swiftconvert_merged.pdf');
        setFiles(prev => prev.map(f => f.status !== 'error' ? { ...f, status: 'completed', progress: 100 } : f));
        recordHistory('swiftconvert_merged.pdf', 'multiple', 'pdf');
      } catch (err) { console.error(err); }
    } else {
      for (let i = 0; i < updatedFiles.length; i++) {
        const item = updatedFiles[i];
        if (item.status === 'completed' || item.status === 'error') continue;

        try {
          for (let p = 0; p <= 100; p += 20) {
            updatedFiles[i] = { ...updatedFiles[i], progress: p };
            setFiles([...updatedFiles]);
            await new Promise(r => setTimeout(r, 50));
          }

          if (item.format === 'pdf') {
            const pdfBlob = await imagesToPdf([item]);
            updatedFiles[i] = { ...item, status: 'completed', convertedBlob: pdfBlob, convertedName: item.name.split('.')[0] + '.pdf', progress: 100 };
            recordHistory(item.name, item.file.type.split('/')[1], 'pdf');
          } else {
            const convertedBlob = await convertImage(item.file, item.format);
            updatedFiles[i] = { ...item, status: 'completed', convertedBlob, convertedName: item.name.split('.')[0] + '.' + item.format, progress: 100 };
            recordHistory(item.name, item.file.type.split('/')[1], item.format);
          }
          setFiles([...updatedFiles]);
        } catch {
          updatedFiles[i] = { ...item, status: 'error', progress: 0 };
          setFiles([...updatedFiles]);
        }
      }
    }

    setConverting(false);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const downloadAll = () => {
    files.forEach(file => {
      if (file.status === 'completed' && file.convertedBlob) {
        downloadBlob(file.convertedBlob, file.convertedName);
      }
    });
  };

  const totalSize = files.reduce((acc, f) => acc + parseFloat(f.size), 0).toFixed(2);

  const renderMainSection = () => (
    <section className="w-full max-w-4xl relative z-10 text-apple-dark dark:text-white">
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative min-h-[320px] rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 bg-indigo-50/10 dark:bg-indigo-900/5
          ${isDragging ? 'border-indigo-500 scale-[1.02]' : 'border-indigo-200 dark:border-indigo-800'}
          ${files.length > 0 ? 'mb-10' : ''}
        `}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-stretch">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="apple-btn-primary px-8 py-5 rounded-l-2xl flex items-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xl font-bold">파일 선택</span>
            </button>
            <button className="apple-btn-primary px-4 rounded-r-2xl border-l border-white/20 active:scale-95 transition-all shadow-xl">
              <ChevronDown className="w-6 h-6" />
            </button>
            <input 
              type="file" 
              multiple 
              ref={fileInputRef}
              className="hidden" 
              onChange={(e) => handleFiles(Array.from(e.target.files))}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold opacity-30 tracking-tight">최대 파일 크기 50MB (Client-Only). <span className="text-indigo-500 cursor-pointer underline hover:opacity-100 transition-opacity">가입하기</span> 더 많은 것을 위해</p>
            <p className="text-xs mt-1 opacity-20">계속 진행하시면 당사의 이용 약관에 동의하는 것으로 간주됩니다.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
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
                onClick={() => setFiles([])}
                className="flex items-center gap-1.5 text-sm font-bold text-red-500/60 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                전체 삭제
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {files.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-5 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0`}>
                        {item.status === 'error' ? <AlertCircle className="text-red-400 w-6 h-6" /> : <img src={item.preview} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-[10px] opacity-40 font-bold uppercase">{item.size} MB • {item.status}</p>
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
                          onClick={() => {
                            const newFiles = [...files];
                            const idx = newFiles.findIndex(f => f.id === item.id);
                            newFiles[idx].format = fmt;
                            setFiles(newFiles);
                          }}
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

            <div className="glass-card rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-indigo-200/20 dark:border-indigo-500/20 shadow-xl shadow-indigo-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">PDF 내보내기 설정</h3>
                  <p className="text-xs opacity-40">모든 이미지를 하나의 문서로 합칩니다.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto overflow-hidden">
                <label className="relative inline-flex items-center cursor-pointer order-2 md:order-1">
                  <input type="checkbox" checked={mergeToPdf} onChange={(e) => setMergeToPdf(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-xs font-bold opacity-70 whitespace-nowrap">하나의 PDF로 합치기</span>
                </label>
                <div className="flex gap-3 order-1 md:order-2 grow">
                  <button 
                    onClick={startConversion}
                    className="grow py-4 px-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
                    disabled={converting || files.length === 0 || files.every(f => f.status === 'completed')}
                  >
                    {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                    {converting ? '변환 중...' : '변환 시작'}
                  </button>
                  <button 
                    onClick={downloadAll}
                    className={`py-4 px-8 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 ${theme === 'dark' ? 'glass-card' : 'bg-apple-dark text-white'}`}
                    disabled={!files.some(f => f.status === 'completed')}
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-apple-dark bg-gray-50'}`}>
      <Background theme={theme} />
      
      <SearchBar 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        theme={theme} 
      />

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        type={authModal.type}
        theme={theme}
      />

      <nav className="sticky top-0 z-50 glass-nav h-[72px] flex items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight">SwiftConvert</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              {Object.keys(menuConfig).map((menu) => (
                <div 
                  key={menu} 
                  className="relative h-[72px] flex items-center"
                  onMouseEnter={() => menuConfig[menu].length > 0 && setActiveDropdown(menu)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className={`
                    flex items-center gap-1.5 cursor-pointer transition-all font-medium text-sm
                    ${activeDropdown === menu || location.pathname.includes(menu) ? 'text-indigo-600 opacity-100' : 'opacity-70 hover:opacity-100'}
                  `}>
                    {menu}
                    {menuConfig[menu].length > 0 && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === menu ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  
                  {(activeDropdown === menu || location.pathname.includes(menu)) && (
                    <motion.div 
                      layoutId="nav-active"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-t-full"
                    />
                  )}

                  <NavDropdown 
                    isOpen={activeDropdown === menu} 
                    items={menuConfig[menu]} 
                    theme={theme} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block" />
            
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="hidden sm:block text-xs font-bold text-red-500/60 hover:text-red-500 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setAuthModal({ isOpen: true, type: 'login' })}
                  className="hidden sm:block text-sm font-bold opacity-70 hover:opacity-100 transition-opacity px-3"
                >
                  로그인
                </button>
                <button 
                  onClick={() => setAuthModal({ isOpen: true, type: 'signup' })}
                  className="apple-btn-primary px-5 py-2 rounded-lg text-sm font-bold active:scale-95 transition-all"
                >
                  가입하기
                </button>
              </>
            )}
            
            <button className="lg:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={user ? 'dashboard' : 'landing'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="grow flex flex-col"
        >
          {user ? (
            <DashboardLayout 
              theme={theme} 
              user={user} 
              onLogout={handleLogout}
            >
              <div className="flex justify-center">
                {renderMainSection()}
              </div>
            </DashboardLayout>
          ) : (
            <main className="grow flex flex-col items-center pt-16 md:pt-24 px-4 pb-20">
              <header className="text-center max-w-2xl mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
                >
                  파일 변환기
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg md:text-xl font-medium opacity-60 leading-relaxed"
                >
                  온라인에서 파일을 한 형식에서 다른 형식으로 쉽게 변환하세요.
                </motion.p>
              </header>

              {renderMainSection()}

              <section className="w-full max-w-6xl mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 border-t border-gray-100 dark:border-white/5 pt-20">
                <div className="flex flex-col items-center text-center px-4">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 animate-float ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                    <Files className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">모든 파일 변환</h3>
                  <p className="text-sm opacity-50 leading-relaxed font-medium">
                    SwiftConvert는 주요 이미지 포맷과 PDF 변환을 지원합니다. 브라우저 내에서 직접 변환 결과물을 미세 조정할 수 있어 최상의 품질을 보장합니다.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center px-4">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 animate-float ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`} style={{ animationDelay: '0.2s' }}>
                    <Globe className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">어디서나 작동</h3>
                  <p className="text-sm opacity-50 leading-relaxed font-medium">
                    SwiftConvert는 100% 온라인 클라이언트 사이드 변환기입니다. Windows, Mac, Linux를 비롯한 모든 모바일 기기 및 최신 브라우저에서 완벽하게 작동합니다.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center px-4">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 animate-float ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50'}`} style={{ animationDelay: '0.4s' }}>
                    <ShieldCheck className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">개인정보 보호 보장</h3>
                  <p className="text-sm opacity-50 leading-relaxed font-medium">
                    저희는 보안과 데이터 프라이버시를 최우선으로 생각합니다. 모든 파일은 당신의 기기 내에서만 처리되며, 어떤 데이터도 서버에 업로드되지 않아 100% 안전합니다.
                  </p>
                </div>
              </section>
            </main>
          )}
        </motion.div>
      </AnimatePresence>

      <footer className="py-12 border-t border-gray-100 dark:border-white/5 text-center px-4">
        <p className="text-xs font-bold tracking-widest uppercase opacity-20">© 2026 SwiftConvert • Designed with Privacy in Mind</p>
      </footer>
    </div>
  );
}

export default App;
