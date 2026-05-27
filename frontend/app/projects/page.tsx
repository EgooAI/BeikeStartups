'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { Project } from '@/types';
import { 
  RocketOutlined, 
  SearchOutlined, 
  FilterOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const industries = ['全部', 'AIGC', '智能硬件', '校园服务', '教育科技', '文创消费', '低空经济', '机器人', 'SaaS', '企业服务'];
const stages = ['全部阶段', '创意阶段', '种子计划', '原型开发', '产品上线', '营收验证'];
const recruitStatuses = ['全部', '招募中', '暂不招募'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('全部');
  const [stage, setStage] = useState('全部阶段');

  useEffect(() => {
    fetchProjects();
  }, [industry, stage]);

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
        let items = data.items || [];
        if (industry !== '全部') {
          items = items.filter((p: Project) => p.tags?.includes(industry));
        }
        setProjects(items);
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
          <h1 className="text-3xl font-bold text-[#0a2a5c] mb-2">校园创业项目库</h1>
          <p className="text-gray-500">汇聚校内认证创业项目，发现校园创新力量。</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-custom p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索项目名称或描述..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium"
            >
              <SearchOutlined className="mr-2" />搜索
            </button>
          </form>

          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <FilterOutlined className="mr-1" />项目领域
              </label>
              <div className="flex flex-wrap gap-2">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      industry === ind
                        ? 'bg-[#0a2a5c] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">项目阶段</label>
              <div className="flex flex-wrap gap-2">
                {stages.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      stage === s
                        ? 'bg-[#0a2a5c] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group bg-white rounded-xl shadow-custom hover:shadow-custom-lg transition-all overflow-hidden border border-gray-100"
              >
                <div className="h-44 bg-gradient-to-br from-[#0a2a5c]/5 to-[#1a4a8a]/10 flex items-center justify-center relative">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <RocketOutlined className="text-5xl text-[#0a2a5c]/20" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-[#f59e0b] text-white text-xs rounded-full font-medium">
                      种子计划
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#0a2a5c] group-hover:text-[#f59e0b] transition-colors mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags?.split(',').slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <span className="flex items-center">
                      <TeamOutlined className="mr-1" />
                      {project.team?.name || '待定团队'}
                    </span>
                    <span className="flex items-center">
                      <EyeOutlined className="mr-1" />
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
      </div>
    </div>
  );
}