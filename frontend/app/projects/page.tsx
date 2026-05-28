'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import { 
  RocketOutlined, 
  SearchOutlined, 
  TeamOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await projectApi.list({ 
        status: 'online', 
        is_public: 'true',
        ...(search ? { search } : {}),
      });
      if (res.data) {
        const data = res.data as any;
        setProjects(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">校园创业项目库</h1>
              <p className="text-gray-500">汇聚校内认证创业项目，发现校园创新力量。</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <AppstoreOutlined />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <UnorderedListOutlined />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-custom p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索项目名称、描述或标签..."
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium shadow-sm hover:shadow"
            >
              <SearchOutlined className="mr-2" />搜索
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-primary border-t-transparent" />
          </div>
        ) : projects.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`group bg-white rounded-2xl shadow-custom hover:shadow-custom-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 ${viewMode === 'list' ? 'flex' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`${viewMode === 'grid' ? 'h-48 relative' : 'w-48 flex-shrink-0 relative'} bg-gradient-to-br from-primary/5 to-primary-light/10 flex items-center justify-center overflow-hidden`}>
                  {project.cover_image ? (
                    <img 
                      src={project.cover_image} 
                      alt={project.title} 
                      className={`w-full h-full object-cover ${viewMode === 'grid' ? 'group-hover:scale-105 transition-transform duration-500' : ''}`}
                    />
                  ) : (
                    <RocketOutlined className="text-5xl text-primary/20" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-accent-gradient text-white text-xs rounded-full font-medium shadow-button">
                      种子计划
                    </span>
                  </div>
                </div>
                <div className={`${viewMode === 'grid' ? 'p-6' : 'p-5 flex-1'}`}>
                  <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags?.split(',').slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span className="flex items-center">
                      <TeamOutlined className="mr-1.5" />
                      {project.team?.name || '待定团队'}
                    </span>
                    <span className="flex items-center">
                      <EyeOutlined className="mr-1.5" />
                      {project.view_count} 次浏览
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <RocketOutlined className="text-6xl mb-4 block" />
            <p className="text-lg">暂无项目</p>
            <p className="text-sm mt-2">还没有项目发布，敬请期待</p>
          </div>
        )}
        
        {/* Load More */}
        {projects.length > 0 && (
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-6 py-3 text-primary font-medium hover:text-accent transition-colors group">
              加载更多项目 <ArrowRightOutlined className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
