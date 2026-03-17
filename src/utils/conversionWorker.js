import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

self.onmessage = async (e) => {
  const { id, file, quality, targetFormat, type } = e.data;

  if (type === 'COMPRESS_PDF') {
    try {
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const newPdf = new jsPDF();

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        await page.render({ canvasContext: context, viewport }).promise;
        
        const blob = await canvas.convertToBlob({ 
          type: 'image/jpeg', 
          quality: quality || 0.5 
        });
        
        const imgBuffer = await blob.arrayBuffer();
        
        if (i > 1) newPdf.addPage();
        
        const pdfWidth = newPdf.internal.pageSize.getWidth();
        const pdfHeight = newPdf.internal.pageSize.getHeight();
        
        newPdf.addImage(new Uint8Array(imgBuffer), 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      const outputBlob = newPdf.output('blob');
      self.postMessage({ id, status: 'success', blob: outputBlob });
    } catch (err) {
      self.postMessage({ id, status: 'error', message: err.message });
    }
  } else if (type === 'CONVERT_IMAGE') {
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      
      const mimeType = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;
      const blob = await canvas.convertToBlob({ 
        type: mimeType, 
        quality: 0.9 
      });
      
      self.postMessage({ 
        id, 
        status: 'success', 
        blob,
        fileName: file.name.split('.')[0] + '.' + targetFormat
      });
    } catch (err) {
      self.postMessage({ id, status: 'error', message: err.message });
    }
  }
};
