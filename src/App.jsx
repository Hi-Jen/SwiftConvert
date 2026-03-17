import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, CheckCircle, AlertCircle, 
  Download, Zap, Loader2, Sun, Moon, FileText, 
  ChevronDown, Search, ShieldCheck, Globe, Files, Menu, Trash2,
  RefreshCw, Minimize, Wrench, Scissors, Hash, FileType, FileCode
} from 'lucide-react';
import { useLocation, Link, Routes, Route } from 'react-router-dom';
import Background from './components/Background';
import NavDropdown from './components/NavDropdown';
import SearchBar from './components/SearchBar';
import AuthModal from './components/AuthModal';
import DashboardLayout from './components/DashboardLayout';

// Page Imports
import Home from './pages/Home';
import ImageConverter from './pages/convert/ImageConverter';
import PdfConverter from './pages/convert/PdfConverter';
import ImageCompressor from './pages/compress/ImageCompressor';
import PdfCompressor from './pages/compress/PdfCompressor';
import PdfSplitter from './pages/split/PdfSplitter';
import Watermarker from './pages/tools/Watermarker';
import PdfPageNumberer from './pages/tools/PdfPageNumberer';
import DocConverter from './pages/convert/DocConverter';
import { imagesToPdf, downloadBlob } from './utils/converter';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';

/**
 * SwiftConvert: Premium Client-Side File Converter
 */
function App() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [mergeToPdf, setMergeToPdf] = useState(false);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' });
  const location = useLocation();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const handleUpdateUser = useCallback((updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  }, [user]);

  const handleFiles = useCallback((newFiles) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const processedFiles = newFiles.map(file => {
      const isInvalidType = !validTypes.includes(file.type);
      const isTooLarge = file.size > 50 * 1024 * 1024; // 50MB

      let errorDetail = '';
      if (isInvalidType) errorDetail = '지원하지 않는 파일 형식입니다. (PNG, JPG, WebP 가능)';
      else if (isTooLarge) errorDetail = '파일 크기가 너무 큽니다. (최대 50MB)';

      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
        status: (isInvalidType || isTooLarge) ? 'error' : 'idle',
        errorDetail,
        progress: 0,
        preview: validTypes.includes(file.type) ? URL.createObjectURL(file) : null,
        format: 'webp'
      };
    });
    setFiles(prev => [...prev, ...processedFiles]);
  }, []);

  const handleClearAll = () => {
    setFiles(prev => {
      // Clean up object URLs to prevent memory leaks
      prev.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      return [];
    });
  };

  const recordHistory = useCallback(async (fileName, fromFormat, toFormat) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fileName, fromFormat, toFormat })
      });
      if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to record history:', err);
    }
  }, [user, handleLogout]);

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('./utils/conversionWorker.js', import.meta.url));
    return () => workerRef.current.terminate();
  }, []);

  const startConversion = async () => {
    setConverting(true);
    const updatedFiles = [...files];

    try {
      if (mergeToPdf) {
        const validFiles = updatedFiles.filter(f => f.status !== 'error');
        // PDF conversion still on main thread for now due to jsPDF complexity
        const pdfBlob = await imagesToPdf(validFiles);
        downloadBlob(pdfBlob, 'swiftconvert_merged.pdf');
        setFiles(prev => prev.map(f => f.status !== 'error' ? { ...f, status: 'completed', progress: 100 } : f));
        await recordHistory('swiftconvert_merged.pdf', 'multiple', 'pdf');
      } else {
        for (let i = 0; i < updatedFiles.length; i++) {
          const item = updatedFiles[i];
          if (item.status === 'completed' || item.status === 'error') continue;

          // Realistic progress simulation anchored by worker task
          updatedFiles[i] = { ...updatedFiles[i], progress: 30 };
          setFiles([...updatedFiles]);

          if (item.format === 'pdf') {
            const pdfBlob = await imagesToPdf([item]);
            updatedFiles[i] = { ...item, status: 'completed', convertedBlob: pdfBlob, convertedName: item.name.split('.')[0] + '.pdf', progress: 100 };
            await recordHistory(item.name, item.file.type.split('/')[1], 'pdf');
          } else {
            // Use Web Worker for image conversion
            const result = await new Promise((resolve) => {
              const handleMessage = (e) => {
                if (e.data.id === item.id) {
                  workerRef.current.removeEventListener('message', handleMessage);
                  resolve(e.data);
                }
              };
              workerRef.current.addEventListener('message', handleMessage);
              workerRef.current.postMessage({
                id: item.id,
                file: item.file,
                targetFormat: item.format,
                type: 'CONVERT_IMAGE'
              });
            });

            if (result.status === 'success') {
              updatedFiles[i] = { 
                ...item, 
                status: 'completed', 
                convertedBlob: result.blob, 
                convertedName: result.fileName, 
                progress: 100 
              };
              await recordHistory(item.name, item.file.type.split('/')[1], item.format);
            } else {
              updatedFiles[i] = { ...item, status: 'error', errorDetail: result.message };
            }
          }
          setFiles([...updatedFiles]);
        }
      }
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Conversion failed:', err);
    } finally {
      setConverting(false);
    }
  };

  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.convertedBlob);
    if (completedFiles.length === 0) return;

    if (completedFiles.length === 1) {
      const file = completedFiles[0];
      downloadBlob(file.convertedBlob, file.convertedName);
    } else {
      const zip = new JSZip();
      completedFiles.forEach(file => {
        zip.file(file.convertedName, file.convertedBlob);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, 'swiftconvert_batch.zip');
    }
  };

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

  const menuConfig = [
    {
      category: '변환',
      icon: 'RefreshCw',
      items: [
        { label: '이미지 변환', path: '/convert/image', description: 'PNG, JPG, WebP 등 다양한 포맷 지원' },
        { label: 'PDF 변환', path: '/convert/pdf', description: '여러 이미지를 하나의 PDF로 병합' },
        { label: '문서 변환', path: '/convert/doc', description: '다양한 문서 포맷 상호 변환' },
      ]
    },
    {
      category: '압축 및 분할',
      icon: 'Minimize',
      items: [
        { label: 'PDF 압축', path: '/compress/pdf', description: '문서 품질 유지하며 용량 최소화' },
        { label: 'PDF 분할', path: '/split/pdf', description: '원하는 페이지 단위로 PDF 나누기' },
        { label: '이미지 압축', path: '/compress/image', description: '웹 최적화를 위한 이미지 용량 줄이기' },
      ]
    },
    {
      category: '도구',
      icon: 'Wrench',
      items: [
        { label: '워터마크 추가', path: '/tools/watermark', description: '문서 및 이미지에 저작권 표시' },
        { label: '페이지 번호 삽입', path: '/tools/page-number', description: 'PDF 문서에 일괄 번호 매기기' },
      ]
    },
    { category: 'API', path: '/api', items: [] },
    { category: '가격', path: '/pricing', items: [] }
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync state with URL path for specific tools
  useEffect(() => {
    if (location.pathname === '/convert/pdf') {
      setMergeToPdf(true);
    } else if (location.pathname === '/convert/image') {
      setMergeToPdf(false);
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  };
  const totalSize = files.reduce((acc, f) => acc + parseFloat(f.size), 0).toFixed(2);

  const commonProps = {
    files,
    theme,
    user,
    setAuthModal,
    handleFiles,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    removeFile,
    setFiles,
    handleClearAll,
    startConversion,
    downloadAll,
    converting,
    mergeToPdf,
    setMergeToPdf
  };

  const renderMainContent = () => (
    <Routes>
      <Route path="/" element={<Home theme={theme} renderMainSection={() => <ImageConverter {...commonProps} />} />} />
      <Route path="/convert/image" element={<ImageConverter {...commonProps} />} />
      <Route path="/convert/pdf" element={<PdfConverter {...commonProps} />} />
      <Route path="/convert/doc" element={<DocConverter {...commonProps} />} />
      <Route path="/compress/image" element={<ImageCompressor {...commonProps} />} />
      <Route path="/compress/pdf" element={<PdfCompressor {...commonProps} />} />
      <Route path="/split/pdf" element={<PdfSplitter {...commonProps} />} />
      <Route path="/tools/watermark" element={<Watermarker {...commonProps} />} />
      <Route path="/tools/page-number" element={<PdfPageNumberer {...commonProps} />} />
    </Routes>
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
        setAuthModal={setAuthModal}
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
              {menuConfig.map((menu) => (
                <div 
                  key={menu.category} 
                  className="relative h-[72px] flex items-center"
                  onMouseEnter={() => menu.items.length > 0 && setActiveDropdown(menu.category)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {menu.items.length > 0 ? (
                    <div className={`
                      flex items-center gap-1.5 cursor-pointer transition-all font-medium text-sm
                      ${activeDropdown === menu.category || menu.items.some(item => location.pathname === item.path) ? 'text-indigo-600 opacity-100' : 'opacity-70 hover:opacity-100'}
                    `}>
                      {menu.icon && (() => {
                        const Icon = { RefreshCw, Minimize, Wrench }[menu.icon];
                        return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
                      })()}
                      {menu.category}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === menu.category ? 'rotate-180' : ''}`} />
                    </div>
                  ) : (
                    <Link 
                      to={menu.path}
                      className={`
                        flex items-center gap-1.5 cursor-pointer transition-all font-medium text-sm
                        ${location.pathname === menu.path ? 'text-indigo-600 opacity-100' : 'opacity-70 hover:opacity-100'}
                      `}
                    >
                      {menu.icon && (() => {
                        const Icon = { RefreshCw, Minimize, Wrench }[menu.icon];
                        return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
                      })()}
                      {menu.category}
                    </Link>
                  )}
                  
                  {(activeDropdown === menu.category || 
                    (menu.items.length > 0 && menu.items.some(item => location.pathname === item.path)) || 
                    (menu.items.length === 0 && location.pathname === menu.path)) && (
                    <motion.div 
                      layoutId="nav-active"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-t-full"
                    />
                  )}
 
                  {menu.items.length > 0 && (
                    <NavDropdown 
                      isOpen={activeDropdown === menu.category} 
                      items={menu.items} 
                      theme={theme} 
                    />
                  )}
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
              onUpdateUser={handleUpdateUser}
            >
              <div className="flex justify-center w-full">
                {renderMainContent()}
              </div>
            </DashboardLayout>
          ) : (
            <div className="flex justify-center w-full grow">
              {renderMainContent()}
            </div>
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
