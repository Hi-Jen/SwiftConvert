import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Loader2, Trash2, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import UploadZone from '../../components/shared/UploadZone';
import ActionBtn from '../../components/shared/ActionBtn';
import { imagesToPdf, downloadBlob } from '../../utils/converter';
import confetti from 'canvas-confetti';

const PdfConverter = ({ 
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
  handleClearAll
}) => {
  const [converting, setConverting] = useState(false);
  const [pdfResult, setPdfResult] = useState(null);

  const validFiles = useMemo(() => 
    (files || []).filter(f => f && f.status !== 'error'),
    [files]
  );

  const moveItem = (id, direction) => {
    const currentIndex = files.findIndex(f => f.id === id);
    if (currentIndex === -1) return;
    
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    
    // Swap
    [newFiles[currentIndex], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[currentIndex]];
    setFiles(newFiles);
  };

  const startPdfGeneration = async () => {
    if (validFiles.length === 0) return;
    
    setConverting(true);
    try {
      const blob = await imagesToPdf(validFiles);
      setPdfResult({
        blob,
        url: URL.createObjectURL(blob),
        name: 'swiftconvert_merged.pdf'
      });
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (pdfResult) {
      downloadBlob(pdfResult.blob, pdfResult.name);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-12 pb-20 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight">이미지를 PDF로 변환</h1>
        <p className="opacity-60 text-sm font-medium">여러 장의 이미지를 하나의 PDF로 합치고 원하는 순서대로 배치하세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <UploadZone 
            onFilesSelected={handleFiles}
            isDragging={isDragging}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            user={user}
            setAuthModal={setAuthModal}
            hasFiles={files.length > 0}
          />

          <AnimatePresence>
            {validFiles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 opacity-40" />
                    페이지 구성 및 순서 ({validFiles.length}장)
                  </h3>
                  <button 
                    onClick={handleClearAll}
                    className="text-xs font-bold text-red-500 hover:underline transition-all"
                  >
                    모두 삭제
                  </button>
                </div>
                
                <div className="space-y-3">
                  {validFiles.map((file, index) => (
                    <motion.div 
                      key={file.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-card p-4 rounded-2xl flex items-center gap-4 group border border-transparent hover:border-indigo-500/10 transition-colors"
                    >
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => moveItem(file.id, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-black/5 dark:bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-500 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => moveItem(file.id, 'down')}
                            disabled={index === validFiles.length - 1}
                            className="p-1 rounded bg-black/5 dark:bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-500 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <img src={file.preview} className="w-full h-full object-cover" alt="" />
                        </div>
                      </div>
                      <div className="grow min-w-0">
                        <p className="font-bold text-sm truncate">{file.name}</p>
                        <p className="text-[10px] font-black opacity-30 uppercase">{file.size} MB • {index + 1}페이지</p>
                      </div>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 opacity-60 hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="glass-card rounded-[32px] p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black mb-2 tracking-tight">PDF 합치기 설정</h2>
              <p className="text-sm opacity-50 mb-8 font-medium leading-relaxed">
                나열된 순서대로 페이지가 생성됩니다. 상단 이미지가 첫 번째 페이지가 됩니다.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest">출력 파일명</span>
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">AUTO</span>
                  </div>
                  <input 
                    type="text" 
                    defaultValue="swiftconvert_merged.pdf"
                    className="w-full bg-transparent font-bold text-sm outline-none border-none p-0 focus:ring-0"
                  />
                </div>

                <div className="flex gap-3">
                  <ActionBtn 
                    onClick={startPdfGeneration}
                    variant="primary"
                    className="grow py-5 shadow-xl shadow-indigo-500/20"
                    disabled={converting || validFiles.length === 0}
                    loading={converting}
                    icon={FileText}
                  >
                    PDF 생성하기
                  </ActionBtn>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {pdfResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="glass-card rounded-[32px] p-8 border border-green-500/30 bg-green-500/5 relative overflow-hidden shadow-2xl shadow-green-500/10"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">생성 완료!</h3>
                      <p className="text-xs opacity-60">문서가 준비되었습니다.</p>
                    </div>
                  </div>
                  <ActionBtn 
                    onClick={handleDownload}
                    variant="primary"
                    className="w-full py-4 bg-green-600 hover:bg-green-500 shadow-xl shadow-green-500/20"
                    icon={ArrowRight}
                  >
                    지금 다운로드
                  </ActionBtn>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfConverter;
