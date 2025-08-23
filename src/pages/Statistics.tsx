import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Image, 
  Zap, 
  Clock,
  Tag,
  Download,
  RefreshCw
} from 'lucide-react';

export default function Statistics() {
  const { state } = useAppContext();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [viewType, setViewType] = useState<'overview' | 'detailed'>('overview');

  // Calculate statistics
  const totalProjects = state.projects.length;
  const totalImages = state.generatedImages.length;
  const totalReferences = state.references.length;
  
  const currentProjectImages = state.currentProject 
    ? state.generatedImages.filter(img => img.projectId === state.currentProject?.id)
    : [];

  // Mock data for charts (replace with real calculations)
  const dailyGenerations = [
    { date: '2024-01-01', count: 5 },
    { date: '2024-01-02', count: 8 },
    { date: '2024-01-03', count: 12 },
    { date: '2024-01-04', count: 6 },
    { date: '2024-01-05', count: 15 },
    { date: '2024-01-06', count: 9 },
    { date: '2024-01-07', count: 11 },
  ];

  const modelUsage = [
    { model: 'Flux AI', count: 45, percentage: 60 },
    { model: 'Stable Diffusion', count: 20, percentage: 27 },
    { model: 'SDXL', count: 10, percentage: 13 },
  ];

  const popularTags = [
    { tag: 'Portrait', count: 28 },
    { tag: 'Professional', count: 22 },
    { tag: 'High Quality', count: 18 },
    { tag: 'Fashion', count: 15 },
    { tag: 'Corporate', count: 12 },
    { tag: 'Creative', count: 8 },
  ];

  const projectStats = state.projects.map(project => ({
    name: project.name,
    imageCount: state.generatedImages.filter(img => img.projectId === project.id).length,
    template: project.template,
    createdAt: project.createdAt
  })).sort((a, b) => b.imageCount - a.imageCount);

  const averageGenerationTime = 2.3; // minutes
  const successRate = 94.2; // percentage
  const storageUsed = 3.2; // GB
  const storageTotal = 15; // GB

  const exportStatistics = () => {
    const stats = {
      overview: {
        totalProjects,
        totalImages,
        totalReferences,
        averageGenerationTime,
        successRate,
        storageUsed,
        storageTotal
      },
      dailyGenerations,
      modelUsage,
      popularTags,
      projectStats,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-image-gen-statistics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600">สถิติและรายงานการใช้งาน</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="input-field w-auto"
          >
            <option value="7d">7 วันล่าสุด</option>
            <option value="30d">30 วันล่าสุด</option>
            <option value="90d">90 วันล่าสุด</option>
            <option value="all">ทั้งหมด</option>
          </select>
          <button onClick={exportStatistics} className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+12%</span>
            <span className="text-gray-600 ml-1">จากเดือนที่แล้ว</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">รูปที่สร้างแล้ว</p>
              <p className="text-3xl font-bold text-gray-900">{totalImages}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Image className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+28%</span>
            <span className="text-gray-600 ml-1">จากเดือนที่แล้ว</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">เวลาเฉลี่ย</p>
              <p className="text-3xl font-bold text-gray-900">{averageGenerationTime}<span className="text-lg text-gray-600">m</span></p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">ต่อการสร้างภาพ 1 รูป</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{successRate}<span className="text-lg text-gray-600">%</span></p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">การสร้างภาพสำเร็จ</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Generation Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">การสร้างภาพรายวัน</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dailyGenerations.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(day.count / Math.max(...dailyGenerations.map(d => d.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{day.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Usage */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">การใช้งาน AI Models</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {modelUsage.map((model, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-primary-600' : 
                    index === 1 ? 'bg-green-600' : 'bg-purple-600'
                  }`}></div>
                  <span className="text-sm text-gray-900">{model.model}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === 0 ? 'bg-primary-600' : 
                        index === 1 ? 'bg-green-600' : 'bg-purple-600'
                      }`}
                      style={{ width: `${model.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {model.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Tags ยอดนิยม</h2>
            <Tag className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {popularTags.map((tag, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {tag.tag}
                </span>
                <span className="text-sm font-medium text-gray-900">{tag.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Usage */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">การใช้พื้นที่</h2>
            <div className="text-sm text-gray-600">
              {storageUsed}GB / {storageTotal}GB
            </div>
          </div>
          <div className="space-y-4">
            <div className="progress-bar h-3">
              <div 
                className="progress-fill"
                style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">AI Models</p>
                <p className="font-medium text-gray-900">8.0 GB</p>
              </div>
              <div>
                <p className="text-gray-600">Generated Images</p>
                <p className="font-medium text-gray-900">1.8 GB</p>
              </div>
              <div>
                <p className="text-gray-600">References</p>
                <p className="font-medium text-gray-900">1.2 GB</p>
              </div>
              <div>
                <p className="text-gray-600">Other Files</p>
                <p className="font-medium text-gray-900">0.2 GB</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                💡 คุณใช้พื้นที่ไปแล้ว {Math.round((storageUsed / storageTotal) * 100)}% 
                เมื่อเต็ม 80% ควรพิจารณาลบไฟล์เก่าหรืออัปเกรด
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Performance */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">ประสิทธิภาพ Projects</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewType('overview')}
              className={`px-3 py-1 text-sm rounded ${
                viewType === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => setViewType('detailed')}
              className={`px-3 py-1 text-sm rounded ${
                viewType === 'detailed' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'
              }`}
            >
              รายละเอียด
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Template</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">รูปที่สร้าง</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">วันที่สร้าง</th>
                {viewType === 'detailed' && (
                  <>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">เฉลี่ย/วัน</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Success Rate</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {projectStats.map((project, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {project.template}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {project.imageCount}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {new Date(project.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  {viewType === 'detailed' && (
                    <>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {((project.imageCount / Math.max(1, Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24)))) || 0).toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-green-600 font-medium">
                          {(90 + Math.random() * 10).toFixed(1)}%
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}