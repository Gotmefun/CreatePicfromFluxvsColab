import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Project, ProjectTemplate } from '../types';
import { 
  ArrowLeft, 
  Upload, 
  Copy, 
  Users,
  ShoppingBag,
  Briefcase,
  Sparkles,
  Smartphone,
  FolderPlus
} from 'lucide-react';

export default function ProjectCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    client: '',
    template: (location.state?.template as ProjectTemplate) || 'portrait'
  });

  const templates = [
    { 
      id: 'portrait', 
      name: 'Portrait', 
      description: 'ภาพบุคคล หน้าคน', 
      icon: Users,
      presets: {
        faces: 10,
        products: 0,
        environments: 5,
        poses: 8
      }
    },
    { 
      id: 'product', 
      name: 'Product', 
      description: 'ภาพสินค้า โฆษณา', 
      icon: ShoppingBag,
      presets: {
        faces: 3,
        products: 15,
        environments: 8,
        poses: 5
      }
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      description: 'ภาพธุรกิจ องค์กร', 
      icon: Briefcase,
      presets: {
        faces: 8,
        products: 5,
        environments: 10,
        poses: 6
      }
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      description: 'ภาพศิลปะ สร้างสรรค์', 
      icon: Sparkles,
      presets: {
        faces: 5,
        products: 3,
        environments: 12,
        poses: 10
      }
    },
    { 
      id: 'fashion', 
      name: 'Fashion', 
      description: 'แฟชั่น เสื้อผ้า', 
      icon: Users,
      presets: {
        faces: 12,
        products: 8,
        environments: 6,
        poses: 15
      }
    },
    { 
      id: 'electronics', 
      name: 'Electronics', 
      description: 'อิเล็กทรอนิกส์ เทคโนโลยี', 
      icon: Smartphone,
      presets: {
        faces: 5,
        products: 20,
        environments: 8,
        poses: 4
      }
    },
  ];

  const selectedTemplate = templates.find(t => t.id === formData.template);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('กรุณาใส่ชื่อ Project');
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      client: formData.client.trim(),
      template: formData.template,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageCount: 0,
      folderPath: `/projects/${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      references: []
    };

    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: newProject });
    
    // Navigate to references to set up the project
    navigate('/references');
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">สร้าง Project ใหม่</h1>
            <p className="text-gray-600">เริ่มต้น Project สำหรับสร้างภาพ AI</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Template Selection */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">เลือก Template</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = formData.template === template.id;
                
                return (
                  <button
                    key={template.id}
                    onClick={() => setFormData({ ...formData, template: template.id as ProjectTemplate })}
                    className={`
                      flex flex-col items-center p-4 border rounded-lg transition-colors
                      ${isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} />
                    <h3 className="font-medium text-gray-900 text-sm">{template.name}</h3>
                    <p className="text-xs text-gray-600 text-center mt-1">{template.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Template: {selectedTemplate.name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{selectedTemplate.presets.faces}</p>
                    <p className="text-gray-600">หน้าคน</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedTemplate.presets.products}</p>
                    <p className="text-gray-600">สินค้า</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedTemplate.presets.environments}</p>
                    <p className="text-gray-600">สภาพแวดล้อม</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedTemplate.presets.poses}</p>
                    <p className="text-gray-600">ท่าทาง</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Details */}
          <form onSubmit={handleSubmit} className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">รายละเอียด Project</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ Project *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="เช่น Fashion Campaign 2024"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                คำอธิบาย
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="อธิบายเป้าหมายและการใช้งานของ Project นี้"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  placeholder="เช่น Marketing, E-commerce"
                />
              </div>

              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                  ลูกค้า/บริษัท
                </label>
                <input
                  type="text"
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="input-field"
                  placeholder="ชื่อลูกค้าหรือบริษัท"
                />
              </div>
            </div>

            {/* Reference Options */}
            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">ตั้งค่า Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-700">อัปโหลดรูปใหม่</span>
                </button>
                
                <button
                  type="button"
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-700">Copy จาก Project เดิม</span>
                </button>
                
                <button
                  type="button"
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FolderPlus className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-700">ใช้ Template</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                สร้าง Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}