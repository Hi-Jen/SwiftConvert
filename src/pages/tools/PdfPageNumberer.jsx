import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Download, Loader2, FileText, CheckCircle2, Layout, Clock, Type, AlignCenter } from 'lucide-react';
import UploadZone from '../../components/shared/UploadZone';
import ActionBtn from '../../components/shared/ActionBtn';
import { addPageNumbers, downloadBlob } from '../../utils/converter';
import confetti from 'canvas-confetti';

const PdfPageNumberer = ({ 
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
  handleClearAll
}) => {
  const [processing, setProcessing] = useState(false);
  const [position, setPosition] = useState('bottom-center');
  const [fontSize, setFontSize] = useState(12);

  const selectedPdf = useMemo(() => 
    files.find(f => f.name.toLowerCase().endsWith('.pdf')),
    [files]
  );

  const handleApply = async () => {
    if (!selectedPdf) return;
    
    setProcessing(true);
    try {
      const numberedBlob = await addPageNumbers(selectedPdf.file, { position, fontSize });
      downloadBlob(numberedBlob, `numbered_${selectedPdf.name}`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Page numbering failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const positions = [
    { id: 'top-left', label: '좌측 상단' },
    { id: 'top-center', label: '중앙 상단' },
    { id: 'top-right', label: '우측 상단' },
    { id: 'bottom-left', label: '좌측 하단' },
    { id: 'bottom-center', label: '중앙 하단' },
    { id: 'bottom-right', label: '우측 하단' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto pt-12 pb-20 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight">PDF 페이지 번호 삽입</h1>
        <p className="opacity-60 text-sm font-medium">모든 페이지에 자동으로 페이지 번호를 매겨 문서를 정리하세요.</p>
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
            accept=".pdf"
          />

          {selectedPdf && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-[32px] border border-indigo-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-red-500" />
                </div>
                <div className="grow min-w-0">
                  <h3 className="font-bold text-sm truncate">{selectedPdf.name}</h3>
                  <p className="text-xs opacity-40 font-bold uppercase">{selectedPdf.size} MB • 원본 파일</p>
                </div>
                <button 
                  onClick={() => removeFile(selectedPdf.id)}
                  className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Clock className="w-5 h-5 opacity-20" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-5 sticky top-24">
          <div className="glass-card rounded-[32px] p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
              <Hash className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-black mb-1">번호 설정</h2>
            <p className="text-sm opacity-50 mb-8 font-medium">번호가 표시될 위치와 크기를 선택하세요.</p>

            <div className="space-y-6 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest pl-1">표시 위치</label>
                <div className="grid grid-cols-3 gap-2">
                  {positions.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setPosition(pos.id)}
                      className={`py-3 px-1 rounded-xl text-[10px] font-black transition-all ${
                        position === pos.id 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest">글자 크기 (PX)</label>
                  <span className="text-[10px] font-black text-indigo-600">{fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="8" max="24" step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 accent-indigo-600 bg-black/5 dark:bg-white/5 rounded-full" 
                />
              </div>
            </div>

            <ActionBtn 
              onClick={handleApply}
              variant="primary"
              className="w-full py-5 shadow-xl shadow-indigo-500/25"
              disabled={processing || !selectedPdf}
              loading={processing}
              icon={Hash}
            >
              번호 삽입 및 다운로드
            </ActionBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPageNumberer;
