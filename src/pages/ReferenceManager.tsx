import React, { useState, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Reference, ReferenceCategory } from '../types';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Eye, 
  Tag,
  Download,
  Plus,
  X,
  Users,
  Package,
  Mountain,
  User
} from 'lucide-react';

export default function ReferenceManager() {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReferenceCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', name: 'ทั้งหมด', icon: Grid, count: state.references.length },
    { id: 'faces', name: 'หน้าคน', icon: Users, count: state.references.filter(r => r.category === 'faces').length },
    { id: 'products', name: 'สินค้า', icon: Package, count: state.references.filter(r => r.category === 'products').length },
    { id: 'environments', name: 'สภาพแวดล้อม', icon: Mountain, count: state.references.filter(r => r.category === 'environments').length },
    { id: 'poses', name: 'ท่าทาง', icon: User, count: state.references.filter(r => r.category === 'poses').length },
  ] as const;

  const filteredReferences = state.references.filter(ref => {
    const matchesSearch = ref.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || ref.category === selectedCategory;
    const matchesProject = !state.currentProject || ref.projectId === state.currentProject.id;
    
    return matchesSearch && matchesCategory && matchesProject;
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newReference: Reference = {
            id: Date.now().toString() + Math.random(),
            filename: file.name,
            url: e.target?.result as string,
            category: 'faces', // Default category
            tags: [],
            projectId: state.currentProject?.id || 'general',
            uploadedAt: new Date()
          };
          dispatch({ type: 'ADD_REFERENCE', payload: newReference });
        };
        reader.readAsDataURL(file);
      }
    });
    setShowUpload(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const deleteSelected = () => {
    selectedImages.forEach(id => {
      dispatch({ type: 'DELETE_REFERENCE', payload: id });
    });
    setSelectedImages([]);
  };

  const categorizeImage = (id: string, category: ReferenceCategory) => {
    const reference = state.references.find(r => r.id === id);
    if (reference) {
      const updated = { ...reference, category };
      dispatch({ type: 'UPDATE_REFERENCE', payload: updated });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reference Manager</h1>
          <p className="text-gray-600">จัดการรูป Reference สำหรับสร้างภาพ AI</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มรูป</span>
        </button>
      </div>

      {/* Current Project Info */}
      {state.currentProject && (
        <div className="card p-4 bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600">Project ปัจจุบัน</p>
              <p className="font-medium text-primary-900">{state.currentProject.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-600">Template</p>
              <p className="font-medium text-primary-900">{state.currentProject.template}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหารูปหรือ tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-4">
          {selectedImages.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedImages.length} เลือกแล้ว</span>
              <button
                onClick={deleteSelected}
                className="btn-secondary text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-4">หมวดหมู่</h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                      ${isSelected 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hover:bg-gray-50 rounded">
                  Export All
                </button>
                <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hover:bg-gray-50 rounded">
                  Organize by AI
                </button>
                <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hover:bg-gray-50 rounded">
                  Duplicate Detection
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Images Grid/List */}
        <div className="lg:col-span-3">
          {filteredReferences.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีรูป Reference</h3>
              <p className="text-gray-600 mb-4">เริ่มต้นด้วยการอัปโหลดรูป Reference เพื่อใช้ในการสร้างภาพ AI</p>
              <button
                onClick={() => setShowUpload(true)}
                className="btn-primary"
              >
                อัปโหลดรูปแรก
              </button>
            </div>
          ) : (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
                : 'space-y-4'
              }
            `}>
              {filteredReferences.map((reference) => (
                <div
                  key={reference.id}
                  className={`
                    card p-3 cursor-pointer transition-all duration-200
                    ${selectedImages.includes(reference.id) 
                      ? 'ring-2 ring-primary-500 bg-primary-50' 
                      : 'hover:shadow-md'
                    }
                  `}
                  onClick={() => toggleImageSelection(reference.id)}
                >
                  {viewMode === 'grid' ? (
                    <div>
                      <div className="relative mb-3">
                        <img
                          src={reference.url}
                          alt={reference.filename}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                            {reference.category}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm truncate">{reference.filename}</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {reference.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {reference.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{reference.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <img
                        src={reference.url}
                        alt={reference.filename}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{reference.filename}</h4>
                        <p className="text-sm text-gray-600">Category: {reference.category}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {reference.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(reference.uploadedAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">อัปโหลดรูป Reference</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ลากรูปมาวางที่นี่ หรือ คลิกเพื่อเลือก
              </h3>
              <p className="text-gray-600 mb-4">รองรับ JPG, PNG, WebP ขนาดไม่เกิน 10MB</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                เลือกไฟล์
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <p className="mb-2">💡 เคล็ดลับ:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>อัปโหลดรูปหน้าคนที่ชัดเจนสำหรับ Portrait</li>
                <li>รูปสินค้าควรมีพื้นหลังที่สะอาด</li>
                <li>รูปสภาพแวดล้อมควรมีองค์ประกอบที่หลากหลาย</li>
                <li>รูปท่าทางควรแสดงท่าที่ต้องการให้ AI เลียนแบบ</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}