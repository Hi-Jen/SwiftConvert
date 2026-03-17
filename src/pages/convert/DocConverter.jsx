import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Loader2, Eye, CheckCircle2, AlertCircle, FileType, FileCode } from 'lucide-react';
import UploadZone from '../../components/shared/UploadZone';
import ActionBtn from '../../components/shared/ActionBtn';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { downloadBlob } from '../../utils/converter';
import confetti from 'canvas-confetti';
import PaywallOverlay from '../../components/shared/PaywallOverlay';

const DocConverter = ({ 
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
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const selectedDoc = files.find(f => 
    f.name.toLowerCase().endsWith('.docx') || f.name.toLowerCase().endsWith('.doc')
  );

  useEffect(() => {
    if (!selectedDoc || !selectedDoc.file.name.endsWith('.docx')) {
      setPreviewHtml('');
      return;
    }

    const generatePreview = async () => {
      setLoadingPreview(true);
      try {
        const arrayBuffer = await selectedDoc.file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setPreviewHtml(result.value);
      } catch (err) {
        console.error('DOCX Preview failed:', err);
        setPreviewHtml('<p class="text-red-500 font-bold">미리보기를 생성할 수 없는 파일 형식입니다.</p>');
      } finally {
        setLoadingPreview(false);
      }
    };

    generatePreview();
  }, [selectedDoc]);

  const handleConvertToPdf = async () => {
    if (!selectedDoc) return;
    
    setProcessing(true);
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const container = document.createElement('div');
      container.innerHTML = previewHtml;
      container.style.width = '550px';
      container.style.padding = '40px';
      container.style.fontSize = '12pt';
      container.style.color = '#000000';
      container.className = 'docx-preview-temp';
      document.body.appendChild(container);

      await doc.html(container, {
        callback: function (doc) {
          const pdfBlob = doc.output('blob');
          downloadBlob(pdfBlob, `${selectedDoc.name.split('.')[0]}.pdf`);
          document.body.removeChild(container);
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          setProcessing(false);
        },
        x: 10,
        y: 10,
        autoPaging: 'text'
      });
    } catch (err) {
      console.error('PDF Conversion failed:', err);
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-12 pb-20 px-4 relative">
      <AnimatePresence>
        {user?.role !== 'PRO' && (
          <PaywallOverlay 
            title="문서 변환은 PRO 전용입니다" 
            description={"Word 파일을 PDF로 정밀 변환하는 기능은 PRO 요금제에서 제공됩니다. 지금 업그레이드하세요." }
          />
        )}
      </AnimatePresence>
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight">문서 변환 및 미리보기</h1>
        <p className="opacity-60 text-sm font-medium">Word(DOCX) 파일을 즉시 미리보고 PDF로 변환하세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 space-y-8">
          <UploadZone 
            onFilesSelected={handleFiles}
            isDragging={isDragging}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            user={user}
            setAuthModal={setAuthModal}
            hasFiles={files.length > 0}
            accept=".docx"
          />

          {selectedDoc && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="glass-card rounded-[32px] p-8 border border-indigo-500/10 min-h-[500px] relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-bold text-sm">문서 미리보기</h3>
                    </div>
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Real-time Preview</span>
                  </div>

                  {loadingPreview ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-30">
                      <Loader2 className="w-10 h-10 animate-spin" />
                      <p className="text-sm font-bold">문서 읽는 중...</p>
                    </div>
                  ) : previewHtml ? (
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert overflow-y-auto max-h-[600px] p-4 rounded-2xl bg-white/50 dark:bg-black/20 custom-scrollbar"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] opacity-20">
                      <FileCode className="w-16 h-16 mb-4" />
                      <p className="text-sm font-bold">미리보기를 지원하지 않는 형식입니다.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-[32px] p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 sticky top-24">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                    <FileType className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-black mb-1">변환 옵션</h2>
                  <p className="text-sm opacity-50 mb-8 font-medium">선택한 문서를 원하는 형식으로 출력합니다.</p>

                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate max-w-[150px]">{selectedDoc.name}</p>
                        <p className="text-[10px] opacity-40 font-black uppercase">{selectedDoc.size} MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                      <span className="text-[10px] font-black opacity-30 uppercase">대상 형식</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white text-[10px] font-black">PDF</span>
                    </div>
                  </div>

                  <ActionBtn 
                    onClick={handleConvertToPdf}
                    variant="primary"
                    className="w-full py-5 shadow-xl shadow-indigo-500/25"
                    disabled={processing || !previewHtml}
                    loading={processing}
                    icon={Download}
                  >
                    PDF로 다운로드
                  </ActionBtn>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocConverter;
