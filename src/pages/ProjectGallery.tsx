import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  Star,
  MoreVertical,
  Share,
  Copy,
  Edit
} from 'lucide-react';

export default function ProjectGallery() {
  const { state } = useAppContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'rating'>('date');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  const currentProjectImages = state.generatedImages.filter(img => 
    !state.currentProject || img.projectId === state.currentProject.id
  );

  const allTags = Array.from(new Set(currentProjectImages.flatMap(img => img.metadata.tags)));

  const filteredImages = currentProjectImages
    .filter(img => {
      const matchesSearch = img.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           img.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           img.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTag = filterTag === 'all' || img.metadata.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'rating':
          return 0; // Placeholder for rating system
        default:
          return 0;
      }
    });

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedImages(filteredImages.map(img => img.id));
  };

  const clearSelection = () => {
    setSelectedImages([]);
  };

  const downloadSelected = () => {
    selectedImages.forEach(id => {
      const image = filteredImages.find(img => img.id === id);
      if (image) {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = image.filename;
        link.click();
      }
    });
  };

  const deleteSelected = () => {
    if (confirm(`คุณต้องการลบรูป ${selectedImages.length} รูปใช่หรือไม่?`)) {
      selectedImages.forEach(id => {
        // dispatch({ type: 'DELETE_GENERATED_IMAGE', payload: id });
      });
      setSelectedImages([]);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Gallery</h1>
          <p className="text-gray-600">
            {state.currentProject ? `${state.currentProject.name} - ${filteredImages.length} รูป` : `${filteredImages.length} รูปทั้งหมด`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedImages.length > 0 && (
            <div className="flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200">
              <span className="text-sm text-primary-700">{selectedImages.length} เลือกแล้ว</span>
              <button
                onClick={downloadSelected}
                className="text-primary-600 hover:text-primary-800 p-1"
                title="ดาวน์โหลด"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={deleteSelected}
                className="text-red-600 hover:text-red-800 p-1"
                title="ลบ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={clearSelection}
                className="text-gray-600 hover:text-gray-800 p-1"
                title="ยกเลิกการเลือก"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาจากชื่อไฟล์, prompt หรือ tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">เรียงตาม:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'rating')}
                className="input-field text-sm w-auto"
              >
                <option value="date">วันที่</option>
                <option value="name">ชื่อ</option>
                <option value="rating">คะแนน</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Tags:</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="input-field text-sm w-auto"
              >
                <option value="all">ทั้งหมด</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

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

        {/* Bulk Actions */}
        {filteredImages.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={selectAll}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                เลือกทั้งหมด ({filteredImages.length})
              </button>
              {selectedImages.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ยกเลิกการเลือก
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              แสดง {filteredImages.length} จาก {currentProjectImages.length} รูป
            </div>
          </div>
        )}
      </div>

      {/* Gallery */}
      {filteredImages.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีรูปในแกลเลอรี</h3>
          <p className="text-gray-600">เริ่มสร้างภาพด้วย AI เพื่อดูผลงานที่นี่</p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
            : 'space-y-4'
          }
        `}>
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`
                card transition-all duration-200 cursor-pointer
                ${selectedImages.includes(image.id) 
                  ? 'ring-2 ring-primary-500 bg-primary-50' 
                  : 'hover:shadow-md'
                }
                ${viewMode === 'grid' ? 'p-3' : 'p-4'}
              `}
              onClick={() => toggleImageSelection(image.id)}
            >
              {viewMode === 'grid' ? (
                <div>
                  <div className="relative mb-3">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full aspect-square object-cover rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImageModal(image.id);
                      }}
                    />
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowImageModal(image.id);
                        }}
                        className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <div className="relative group">
                        <button className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70">
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {selectedImages.includes(image.id) && (
                      <div className="absolute top-2 left-2">
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                      {image.filename}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{image.settings.width}×{image.settings.height}</span>
                      <span>{new Date(image.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    {image.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {image.metadata.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {image.metadata.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{image.metadata.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-20 h-20 object-cover rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImageModal(image.id);
                      }}
                    />
                    {selectedImages.includes(image.id) && (
                      <div className="absolute -top-1 -left-1">
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{image.filename}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{image.prompt}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {image.metadata.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 ml-4">
                        <p>{image.settings.width}×{image.settings.height}</p>
                        <p>{formatFileSize(image.metadata.size)}</p>
                        <p>{new Date(image.createdAt).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(null)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const image = filteredImages.find(img => img.id === showImageModal);
              if (!image) return null;
              
              return (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">{image.filename}</h2>
                    <button
                      onClick={() => setShowImageModal(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full rounded-lg shadow-md"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">รายละเอียด</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                          <p><span className="font-medium">ขนาด:</span> {image.settings.width}×{image.settings.height}</p>
                          <p><span className="font-medium">รูปแบบ:</span> {image.metadata.format.toUpperCase()}</p>
                          <p><span className="font-medium">ขนาดไฟล์:</span> {formatFileSize(image.metadata.size)}</p>
                          <p><span className="font-medium">สร้างเมื่อ:</span> {new Date(image.createdAt).toLocaleString('th-TH')}</p>
                          <p><span className="font-medium">Model:</span> {image.settings.model}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Prompt</h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {image.prompt}
                        </p>
                      </div>
                      
                      {image.negativePrompt && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Negative Prompt</h3>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {image.negativePrompt}
                          </p>
                        </div>
                      )}
                      
                      {image.metadata.tags.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {image.metadata.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 space-y-2">
                        <a
                          href={image.url}
                          download={image.filename}
                          className="w-full btn-primary text-center block"
                        >
                          <Download className="w-4 h-4 mr-2 inline" />
                          ดาวน์โหลด
                        </a>
                        <button className="w-full btn-secondary">
                          <Share className="w-4 h-4 mr-2" />
                          แชร์
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}