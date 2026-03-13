import { jsPDF } from 'jspdf';

/**
 * Converts an image file to a specified format in the browser.
 * @param {File} file - The source image file.
 * @param {string} targetFormat - Target format (png, jpeg, webp).
 * @returns {Promise<Blob>} - The converted image blob.
 */
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
