import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { 
  Plus, 
  FolderOpen, 
  Image, 
  Palette, 
  BarChart3,
  Clock,
  Folder,
  Zap,
  Users,
  Briefcase,
  Sparkles,
  ShoppingBag,
  Smartphone,
  Maximize,
  Video,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  const templates = [
    { 
      id: 'portrait', 
      name: 'Portrait', 
      description: 'ภาพบุคคล หน้าคน', 
      icon: Users,
      color: 'bg-blue-500'
    },
    { 
      id: 'product', 
      name: 'Product', 
      description: 'ภาพสินค้า โฆษณา', 
      icon: ShoppingBag,
      color: 'bg-green-500'
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      description: 'ภาพธุรกิจ องค์กร', 
      icon: Briefcase,
      color: 'bg-purple-500'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      description: 'ภาพศิลปะ สร้างสรรค์', 
      icon: Sparkles,
      color: 'bg-pink-500'
    },
    { 
      id: 'fashion', 
      name: 'Fashion', 
      description: 'แฟชั่น เสื้อผ้า', 
      icon: Users,
      color: 'bg-indigo-500'
    },
    { 
      id: 'electronics', 
      name: 'Electronics', 
      description: 'อิเล็กทรอนิกส์ เทคโนโลยี', 
      icon: Smartphone,
      color: 'bg-cyan-500'
    },
  ];

  const stats = [
    {
      name: 'Total Projects',
      value: state.projects.length,
      icon: Folder,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'รูปที่สร้างแล้ว',
      value: state.generatedImages.length,
      icon: Image,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      name: 'References',
      value: state.references.length,
      icon: FolderOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      name: 'AI Model',
      value: state.settings.defaultModel,
      icon: Zap,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  const recentProjects = state.projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const handleProjectSelect = (project: any) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
    navigate('/generate');
  };

  const handleCreateProject = (template?: string) => {
    navigate('/project/create', { state: { template } });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">ระบบ AI Image Generation with Flux</p>
        </div>
        <button
          onClick={() => handleCreateProject()}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>สร้าง Project ใหม่</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/references')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FolderOpen className="w-8 h-8 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Browse References</p>
                  <p className="text-sm text-gray-600">จัดการรูป Reference</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/generate')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Palette className="w-8 h-8 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">AI Generation</p>
                  <p className="text-sm text-gray-600">สร้างภาพด้วย AI</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/enhance')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Maximize className="w-8 h-8 text-cyan-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Image Enhancement</p>
                  <p className="text-sm text-gray-600">ขยายและปรับปรุงภาพ</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/video')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Video className="w-8 h-8 text-red-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Video Generation</p>
                  <p className="text-sm text-gray-600">สร้างวิดีโอด้วย AI</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/pose')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Activity className="w-8 h-8 text-indigo-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Pose Control</p>
                  <p className="text-sm text-gray-600">ควบคุมท่าทางตัวละคร</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/gallery')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Image className="w-8 h-8 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Gallery</p>
                  <p className="text-sm text-gray-600">ดูผลงานที่สร้างแล้ว</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/statistics')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Statistics</p>
                  <p className="text-sm text-gray-600">สถิติการใช้งาน</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google Colab</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google Drive</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-600">Synced</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-medium text-gray-900">3.2GB / 15GB</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '21%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Templates พร้อมใช้</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => handleCreateProject(template.id)}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className={`p-3 rounded-lg ${template.color} mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{template.name}</h3>
                <p className="text-xs text-gray-600 text-center mt-1">{template.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Projects ล่าสุด</h2>
            <button
              onClick={() => navigate('/gallery')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              ดูทั้งหมด
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {project.template}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(project.updatedAt).toLocaleDateString('th-TH')}
                  </div>
                  <div className="flex items-center">
                    <Image className="w-3 h-3 mr-1" />
                    {project.imageCount} รูป
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}