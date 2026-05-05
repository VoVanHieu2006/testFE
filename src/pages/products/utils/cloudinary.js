// src/utils/cloudinary.js
export const CLOUDINARY_CONFIG = {
  cloudName: 'dhy2xw8xn',
  uploadPreset: 'fluxify',
  uploadUrl: 'https://api.cloudinary.com/v1_1/dhy2xw8xn/image/upload',
};

export const uploadImageToCloudinary = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('resource_type', 'image');

  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    });
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        reject(new Error('Upload failed'));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    
    xhr.open('POST', CLOUDINARY_CONFIG.uploadUrl);
    xhr.send(formData);
  });
};

export const uploadMultipleImages = async (files, onFileProgress) => {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadImageToCloudinary(
      files[i], 
      (percent) => onFileProgress?.(i, percent)
    );
    results.push(url);
  }
  return results;
};