// src/components/ImageUploadPreview.jsx
import { useState } from 'react';
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary, CLOUDINARY_CONFIG } from '../utils/cloudinary';

export function ImageUploadPreview({ 
  value = '', 
  onChange, 
  multiple = false, 
  maxFiles = 1,
  label = 'Upload Image',
  placeholder = 'https://...',
  className = ''
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');

  const currentUrls = multiple 
    ? (value ? value.split('\n').map(u => u.trim()).filter(Boolean) : [])
    : [value].filter(Boolean);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate file count
    const totalAfterUpload = multiple ? currentUrls.length + files.length : files.length;
    if (totalAfterUpload > maxFiles) {
      setError(`Maximum ${maxFiles} image${maxFiles > 1 ? 's' : ''} allowed`);
      return;
    }

    setUploading(true);
    setError('');

    // Create local previews immediately
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      progress: 0
    }));
    setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews);

    try {
      // Upload each file
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadImageToCloudinary(file, (percent) => {
          setProgress(prev => ({ ...prev, [file.name]: percent }));
          setPreviews(prev => prev.map(p => 
            p.file === file ? { ...p, progress: percent } : p
          ));
        });
        uploadedUrls.push(url);
        
        // Update preview state
        setPreviews(prev => prev.map(p => 
          p.file === file ? { ...p, uploading: false, url, progress: 100 } : p
        ));
      }

      // Update parent state with Cloudinary URLs
      if (multiple) {
        const allUrls = [...currentUrls, ...uploadedUrls].slice(0, maxFiles);
        onChange(allUrls.join('\n'));
      } else {
        onChange(uploadedUrls[0]);
      }

    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Cloudinary upload error:', err);
    } finally {
      setUploading(false);
      // Clean up object URLs
      newPreviews.forEach(p => URL.revokeObjectURL(p.preview));
      e.target.value = ''; // Reset input
    }
  };

  const removeImage = (index) => {
    if (multiple) {
      const urls = currentUrls.filter((_, i) => i !== index);
      onChange(urls.join('\n'));
    } else {
      onChange('');
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Preview Grid */}
      {(currentUrls.length > 0 || previews.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {[...previews.filter(p => !p.url), ...currentUrls.map((url, i) => ({ url, index: i, isUploaded: true }))].map((item, idx) => (
            <div key={item.isUploaded ? `uploaded-${item.index}` : `preview-${idx}`} 
                 className="relative w-16 h-16 rounded-lg border border-[#e3e3e3] overflow-hidden group bg-slate-50">
              <img 
                src={item.preview || item.url} 
                alt="preview" 
                className="w-full h-full object-cover"
              />
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => item.isUploaded ? removeImage(item.index) : null}
                disabled={item.isUploaded ? false : true}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
              >
                <X className="w-3 h-3" />
              </button>
              
              {/* Progress overlay */}
              {item.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-4 h-4 animate-spin text-white mx-auto mb-1" />
                    <span className="text-[10px] text-white">{item.progress || 0}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Input */}
      <div className="flex items-center gap-2">
        <label className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors
          ${uploading ? 'border-slate-300 bg-slate-50 cursor-not-allowed' : 'border-[#e3e3e3] hover:border-black hover:bg-slate-50'}`}>
          <Upload className={`w-4 h-4 ${uploading ? 'text-slate-400' : 'text-slate-500'}`} />
          <span className="text-sm text-slate-600">
            {uploading ? 'Uploading...' : label}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={uploading || (multiple && currentUrls.length >= maxFiles)}
            className="hidden"
          />
        </label>
        
        {/* Fallback URL input (optional - keep for manual paste) */}
        {!multiple && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black font-mono transition-colors min-w-0"
          />
        )}
      </div>
      
      {multiple && (
        <p className="text-xs text-slate-400">
          {currentUrls.length}/{maxFiles} images uploaded · Click to remove
        </p>
      )}
      
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}