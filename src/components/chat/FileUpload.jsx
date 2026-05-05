'use client';

import { useState, useRef } from 'react';
import { Paperclip, X, Upload, File, Image, FileText } from 'lucide-react';

const FileUpload = ({ onFileUpload, maxSize = 10 * 1024 * 1024 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      
      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv',
        'application/zip', 'application/x-rar-compressed'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
        alert(`File type ${file.type} is not supported`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = validFiles.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      
      setUploadedFiles(prev => [...prev, ...results]);
      onFileUpload(results);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    return {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: result.url,
      uploadedAt: new Date()
    };
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.zip,.rar"
        />
        
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Maximum file size: {maxSize / 1024 / 1024}MB
        </p>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-white rounded">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Types Info */}
      <div className="text-xs text-gray-500">
        <p>Supported formats:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="bg-gray-100 px-2 py-1 rounded">Images (JPG, PNG, GIF)</span>
          <span className="bg-gray-100 px-2 py-1 rounded">Documents (PDF, DOC, TXT)</span>
          <span className="bg-gray-100 px-2 py-1 rounded">Archives (ZIP, RAR)</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
