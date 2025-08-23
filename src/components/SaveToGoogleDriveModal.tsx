import React, { useState } from 'react';
import { SaveOptions } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { 
  X, 
  Save, 
  Folder, 
  Tag, 
  FileText, 
  Image, 
  Settings,
  FolderOpen,
  Plus
} from 'lucide-react';

interface SaveToGoogleDriveModalProps {
  image: string;
  onSave: (options: SaveOptions) => void;
  onClose: () => void;
}

export default function SaveToGoogleDriveModal({ image, onSave, onClose }: SaveToGoogleDriveModalProps) {
  const { state } = useAppContext();
  const [saveOptions, setSaveOptions] = useState<SaveOptions>({
    filename: `generated_${Date.now()}`,
    folder: state.currentProject?.folderPath || '/AI_Generated',
    tags: [],
    description: '',
    format: 'png',
    includeMetadata: true,
    createThumbnail: true,
    addToGallery: true
  });
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const folders = [
    state.currentProject?.folderPath || '/AI_Generated',
    '/Categories/Portrait',
    '/Categories/Product',
    '/Categories/Corporate',
    '/Categories/Creative',
    '/Archive',
    '/Work_In_Progress'
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !saveOptions.tags.includes(tagInput.trim())) {
      setSaveOptions(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSaveOptions(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveOptions.filename.trim()) {
      alert('กรุณาใส่ชื่อไฟล์');
      return;
    }
    onSave(saveOptions);
  };

  const suggestedTags = [
    'AI Generated',
    'Flux',
    state.currentProject?.template || 'Portrait',
    state.currentProject?.category || 'General',
    'High Quality',
    'Professional'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Save className="w-6 h-6 mr-2 text-primary-600" />
              Save to Google Drive
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image Preview */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              {/* Filename */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อไฟล์ *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    value={saveOptions.filename}
                    onChange={(e) => setSaveOptions(prev => ({ ...prev, filename: e.target.value }))}
                    className="flex-1 input-field"
                    placeholder="ชื่อไฟล์"
                  />
                  <select
                    value={saveOptions.format}
                    onChange={(e) => setSaveOptions(prev => ({ ...prev, format: e.target.value as 'png' | 'jpg' | 'webp' }))}
                    className="input-field w-24"
                  >
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
              </div>

              {/* Folder Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  โฟลเดอร์ปลายทาง
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={saveOptions.folder}
                    onChange={(e) => setSaveOptions(prev => ({ ...prev, folder: e.target.value }))}
                    className="flex-1 input-field"
                  >
                    {folders.map(folder => (
                      <option key={folder} value={folder}>{folder}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-secondary p-2"
                    title="สร้างโฟลเดอร์ใหม่"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-3">
              {/* Tag Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="พิมพ์ tag แล้วกด Enter"
                  className="flex-1 input-field"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-primary p-2"
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>

              {/* Current Tags */}
              {saveOptions.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {saveOptions.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Tags */}
              <div>
                <p className="text-xs text-gray-600 mb-2">แนะนำ:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.filter(tag => !saveOptions.tags.includes(tag)).map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSaveOptions(prev => ({ ...prev, tags: [...prev.tags, tag] }))}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย (ไม่บังคับ)
            </label>
            <textarea
              value={saveOptions.description}
              onChange={(e) => setSaveOptions(prev => ({ ...prev, description: e.target.value }))}
              placeholder="อธิบายภาพหรือบันทึกรายละเอียดเพิ่มเติม..."
              rows={3}
              className="input-field"
            />
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
            >
              <Settings className="w-4 h-4 mr-1" />
              ตัวเลือกเพิ่มเติม
              <span className="ml-2">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={saveOptions.includeMetadata}
                      onChange={(e) => setSaveOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">รวม Metadata</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={saveOptions.createThumbnail}
                      onChange={(e) => setSaveOptions(prev => ({ ...prev, createThumbnail: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">สร้าง Thumbnail</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={saveOptions.addToGallery}
                      onChange={(e) => setSaveOptions(prev => ({ ...prev, addToGallery: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">เพิ่มใน Gallery</span>
                  </label>
                </div>

                <div className="text-xs text-gray-600">
                  <p className="mb-1">💡 คำแนะนำ:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Metadata จะรวมข้อมูล prompt และ settings ที่ใช้</li>
                    <li>Thumbnail ช่วยให้เรียกดูได้เร็วขึ้น</li>
                    <li>Gallery จะแสดงรูปในหน้า Project Gallery</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p>จะบันทึกไปยัง: <span className="font-medium">{saveOptions.folder}</span></p>
              <p>รูปแบบไฟล์: <span className="font-medium">{saveOptions.format.toUpperCase()}</span></p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกไป Drive</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}