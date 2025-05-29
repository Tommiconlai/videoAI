import { useState, useRef } from 'react';
import ParameterForm from './ParameterForm';

function ImageUpload({ onGenerate, isLoading, videos }) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    const newImages = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      preview: URL.createObjectURL(file),
      params: {
        prompt: '',
        negativePrompt: '',
        duration: 5,
        seed: Math.floor(Math.random() * 1000),
        steps: 20
      }
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
  };

  const removeImage = (id) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Cleanup object URL
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const updateImageParams = (id, params) => {
    setUploadedImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, params } : img
      )
    );
  };

  const getVideoForImage = (imageName) => {
    return videos.find(video => video.filename === imageName);
  };

  return (
    <div className="xl:col-span-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="fas fa-upload mr-2 text-blue-600"></i>
            Upload Images
          </h2>
          <p className="text-sm text-gray-600 mt-1">Upload PNG or JPG images to generate video clips</p>
        </div>
        
        <div className="p-6">
          {/* Upload Zone */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-cloud-upload-alt text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your images here</h3>
            <p className="text-gray-500 mb-4">or click to browse from your computer</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <i className="fas fa-plus mr-2"></i>
              Choose Files
            </button>
            <p className="text-xs text-gray-400 mt-3">Supports PNG, JPG up to 10MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Uploaded Images List */}
          {uploadedImages.length > 0 && (
            <div className="mt-6 space-y-4">
              {uploadedImages.map(image => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={image.preview} 
                      alt="Uploaded image preview" 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200" 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{image.name}</h4>
                        <span className="text-xs text-gray-500">{image.size}</span>
                      </div>
                      
                      <ParameterForm
                        params={image.params}
                        onChange={(params) => updateImageParams(image.id, params)}
                        onGenerate={() => onGenerate(image.file, image.params)}
                        isLoading={isLoading}
                        video={getVideoForImage(image.name)}
                        onRemove={() => removeImage(image.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageUpload;
