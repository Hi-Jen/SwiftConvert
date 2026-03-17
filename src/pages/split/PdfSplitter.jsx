import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Download, Loader2, FileText, CheckCircle2, AlertCircle, ChevronRight, LayoutGrid, List } from 'lucide-react';
import UploadZone from '../../components/shared/UploadZone';
import ActionBtn from '../../components/shared/ActionBtn';
import { splitPdf, downloadBlob } from '../../utils/converter';
import * as pdfjsLib from 'pdfjs-dist';
import confetti from 'canvas-confetti';

const PdfSplitter = ({ 
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
  const [thumbnails, setThumbnails] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]); // 0-indexed
  const [loadingThumbs, setLoadingThumbs] = useState(false);

  const selectedPdf = useMemo(() => 
    files.find(f => f.name.toLowerCase().endsWith('.pdf')),
    [files]
  );

  useEffect(() => {
    if (!selectedPdf) {
      setThumbnails([]);
      setSelectedPages([]);
      return;
    }

    const generateThumbnails = async () => {
      setLoadingThumbs(true);
      try {
        const arrayBuffer = await selectedPdf.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const thumbs = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          thumbs.push(canvas.toDataURL());
          canvas.remove();
        }
        setThumbnails(thumbs);
      } catch (err) {
        console.error('Thumbnail generation failed:', err);
      } finally {
        setLoadingThumbs(false);
      }
    };

    generateThumbnails();
  }, [selectedPdf]);

  const togglePage = (index) => {
    setSelectedPages(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index].sort((a, b) => a - b)
    );
  };

  const selectAll = () => {
    setSelectedPages(thumbnails.map((_, i) => i));
  };

  const handleSplit = async () => {
    if (!selectedPdf || selectedPages.length === 0) return;
    
    setProcessing(true);
    try {
      const splitBlob = await splitPdf(selectedPdf.file, selectedPages);
      downloadBlob(splitBlob, `split_${selectedPdf.name}`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Split failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-12 pb-20 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight">PDF 페이지 분할</h1>
        <p className="opacity-60 text-sm font-medium">원하는 페이지만 쏙쏙 골라 새로운 PDF로 추출하세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
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
            <div className="glass-card rounded-[32px] p-8 border border-indigo-500/10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-lg mb-1">페이지 선택</h3>
                  <p className="text-xs opacity-40 font-bold">추출할 페이지를 클릭하여 선택하세요.</p>
                </div>
                <button 
                  onClick={selectAll}
                  className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 text-xs font-black hover:bg-indigo-500 hover:text-white transition-all"
                >
                  전체 선택
                </button>
              </div>

              {loadingThumbs ? (
                <div className="py-20 flex flex-col items-center gap-4 opacity-30">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-sm font-bold">PDF 분석 중...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {thumbnails.map((thumb, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4 }}
                      onClick={() => togglePage(i)}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${
                        selectedPages.includes(i) 
                          ? 'border-indigo-600 ring-4 ring-indigo-600/20' 
                          : 'border-transparent bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      <img src={thumb} className="w-full h-full object-cover" alt={`Page ${i + 1}`} />
                      <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${selectedPages.includes(i) ? 'bg-indigo-600/20 opacity-100' : 'opacity-0 hover:opacity-100 bg-black/5'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${selectedPages.includes(i) ? 'bg-indigo-600 text-white' : 'bg-white/90 text-black'}`}>
                          {i + 1}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 sticky top-24">
          <div className="glass-card rounded-[32px] p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
              <Scissors className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-black mb-1">분할 요약</h2>
            <p className="text-sm opacity-50 mb-8 font-medium">선택한 페이지들이 새 문서로 생성됩니다.</p>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="opacity-40 uppercase">원본 파일</span>
                  <span className="truncate max-w-[120px]">{selectedPdf?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="opacity-40 uppercase">선택된 페이지</span>
                  <span className="text-indigo-600 font-black">{selectedPages.length} / {thumbnails.length}</span>
                </div>
              </div>

              {selectedPages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPages.slice(0, 8).map(p => (
                    <span key={p} className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 text-[10px] font-black">
                      P.{p + 1}
                    </span>
                  ))}
                  {selectedPages.length > 8 && <span className="text-[10px] font-black opacity-30">...외 {selectedPages.length - 8}개</span>}
                </div>
              )}
            </div>

            <ActionBtn 
              onClick={handleSplit}
              variant="primary"
              className="w-full py-5 shadow-xl shadow-indigo-500/25"
              disabled={processing || selectedPages.length === 0}
              loading={processing}
              icon={Scissors}
            >
              선택한 페이지 추출하기
            </ActionBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfSplitter;
