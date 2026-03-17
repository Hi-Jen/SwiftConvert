import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs-dist worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Converts an image file to a specified format in the browser.
 * @param {File} file - The source image file.
 * @param {string} targetFormat - Target format (png, jpeg, webp).
 * @returns {Promise<Blob>} - The converted image blob.
 */
/**
 * Compresses an image file by adjusting its quality.
 * @param {File} file - The source image file.
 * @param {number} quality - Quality value (0.1 to 1.0).
 * @param {string} format - Output format (jpeg, webp).
 * @returns {Promise<{blob: Blob, preview: string}>} - The compressed blob and a preview URL.
 */
export const compressImage = (file, quality, format = 'jpeg') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              blob,
              preview: URL.createObjectURL(blob)
            });
          } else {
            reject(new Error('Compression failed'));
          }
        }, mimeType, quality);
      };
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
};

export const convertImage = (file, targetFormat) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const mimeType = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Conversion failed'));
          }
        }, mimeType, 0.9); // Quality 0.9 for jpeg/webp
      };
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
};

/**
 * Merges multiple images into a single PDF or converts one image to PDF.
 * @param {Array<{file: File, name: string}>} files - Array of file objects.
 * @returns {Promise<Blob>} - The generated PDF blob.
 */
export const imagesToPdf = async (files) => {
  const pdf = new jsPDF();
  
  for (let i = 0; i < files.length; i++) {
    const { file } = files[i];
    const imgData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imgData;
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (img.height * imgWidth) / img.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  }

  return pdf.output('blob');
};

/**
 * Downloads a blob as a file.
 * @param {Blob} blob - The blob to download.
 * @param {string} fileName - The name of the file.
 */
/**
 * Compresses a PDF by rendering its pages to images and re-merging them.
 * @param {File} file 
 * @param {number} quality (0.1 to 1.0)
 * @returns {Promise<Blob>}
 */
export const compressPdf = async (file, quality = 0.5) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const newPdf = new jsPDF();

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 }); // Intermediate scale for quality
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    
    // Compress the page as JPEG
    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    if (i > 1) newPdf.addPage();
    
    const pdfWidth = newPdf.internal.pageSize.getWidth();
    const pdfHeight = newPdf.internal.pageSize.getHeight();
    
    // Fit image to PDF page
    newPdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    
    // Cleanup
    canvas.remove();
  }

  return newPdf.output('blob');
};

/**
 * Adds a text watermark to an image.
 * @param {Blob|File} imageBlob 
 * @param {Object} options { text, fontSize, opacity, position }
 * @returns {Promise<Blob>}
 */
export const addWatermark = async (imageBlob, options = {}) => {
  const { 
    text = 'SwiftConvert', 
    fontSize = 40, 
    opacity = 0.5, 
    position = 'center',
    color = '#ffffff'
  } = options;

  const bitmap = await createImageBitmap(imageBlob);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  
  ctx.drawImage(bitmap, 0, 0);
  
  // Set font
  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  
  const textMetrics = ctx.measureText(text);
  let x, y;

  switch (position) {
    case 'top-left':
      x = 40; y = 40 + fontSize / 2;
      break;
    case 'top-right':
      x = canvas.width - textMetrics.width - 40; y = 40 + fontSize / 2;
      break;
    case 'bottom-left':
      x = 40; y = canvas.height - 40 - fontSize / 2;
      break;
    case 'bottom-right':
      x = canvas.width - textMetrics.width - 40; y = canvas.height - 40 - fontSize / 2;
      break;
    case 'center':
    default:
      x = (canvas.width - textMetrics.width) / 2;
      y = canvas.height / 2;
      break;
  }

  // Draw shadow for visibility on any background
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText(text, x, y);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
};

export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
