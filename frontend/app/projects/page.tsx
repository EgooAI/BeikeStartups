'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { projectApi } from '@/lib/api';
import { Project, ProjectStage } from '@/types';
import {
  RocketOutlined,
  SearchOutlined,
  TeamOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FilterOutlined,
  ClearOutlined,
  FireOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';

const STAGE_OPTIONS: { value: ProjectStage | ''; label: string }[] = [
  { value: '', label: '全部阶段' },
  { value: 'idea', label: '创意阶段' },
  { value: 'seed', label: '种子计划' },
  { value: 'prototype', label: '原型开发' },
  { value: 'launched', label: '产品上线' },
  { value: 'revenue', label: '营收验证' },
];

const STAGE_BADGE_COLORS: Record<ProjectStage, string> = {
  idea: 'bg-purple-500',
  seed: 'bg-blue-500',
  prototype: 'bg-[#050510]',
  launched: 'bg-[#ffb800]',
  revenue: 'bg-green-500',
};

const STAGE_GRADIENTS: Record<ProjectStage, string> = {
  idea: 'from-purple-500 to-purple-600',
  seed: 'from-blue-500 to-blue-600',
  prototype: 'from-primary to-primary-light',
  launched: 'from-amber-500 to-orange-500',
  revenue: 'from-emerald-500 to-teal-500',
};

const STAGE_LABELS: Record<ProjectStage, string> = {
  idea: '创意阶段',
  seed: '种子计划',
  prototype: '原型开发',
  launched: '产品上线',
  revenue: '营收验证',
};

const INDUSTRY_OPTIONS = [
  'AI',
  '教育',
  '消费',
  '硬件',
  '文创',
  '企业服务',
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const PAGE_SIZE = 18;

  useEffect(() => {
    setPage(1);
    setProjects([]);
    fetchProjects(1, true);
  }, [stageFilter, industryFilter, sortOrder]);

  async function fetchProjects(pageNum: number, reset = false) {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await projectApi.list({
        status: 'online',
        is_public: 'true',
        ...(search ? { search } : {}),
        ...(stageFilter ? { stage: stageFilter } : {}),
        ...(industryFilter ? { industry: industryFilter } : {}),
        page: pageNum,
        limit: PAGE_SIZE,
        sort: 'created_at',
        order: sortOrder === 'newest' ? 'desc' : 'asc',
      });
      if (res.data) {
        const data = res.data as { items: Project[]; meta?: { total: number } };
        const items = data.items || [];
        const totalCount = data.meta?.total || 0;
        setTotal(totalCount);
        if (reset) {
          setProjects(items);
        } else {
          setProjects(prev => [...prev, ...items]);
        }
        setPage(pageNum);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setProjects([]);
    fetchProjects(1, true);
  };

  const handleLoadMore = () => {
    fetchProjects(page + 1, false);
  };

  const hasMore = projects.length < total;

  const hasActiveFilters = stageFilter !== '' || industryFilter !== '';

  return (
    <div className="min-h-screen bg-[#050510]">
      {/* ═══════════════════════════════════════════════════════
            Header — 顶部标题区
          ═══════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-[#0a0a1a] via-[#050510] to-[#0a0a1a] border-b border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-dot-matrix opacity-40" />
        <div className="absolute top-0 right-0 w-[22rem] h-[22rem] bg-blue-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[16rem] h-[16rem] bg-amber-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00f0ff]/10 text-[#00f0ff] text-xs font-semibold rounded-full mb-3 tracking-wide">
                <FireOutlined />
                项目库
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                校园创业项目库
              </h1>
              <p className="text-gray-500 text-base sm:text-lg">
                汇聚校内认证创业项目，发现校园创新力量
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white/[0.06] shadow-sm text-white' : 'text-gray-400 hover:text-gray-400'}`}
                  title="网格视图"
                >
                  <AppstoreOutlined />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white/[0.06] shadow-sm text-white' : 'text-gray-400 hover:text-gray-400'}`}
                  title="列表视图"
                >
                  <UnorderedListOutlined />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ═══════════════════════════════════════════════════════
              Filters — 搜索与筛选
            ═══════════════════════════════════════════════════════ */}
        <div className="holo-card p-5 sm:p-6 mb-8">
          {/* 搜索栏 */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索项目名称、描述或标签..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/15 focus:border-[#00f0ff]/30 focus:bg-white/[0.06] transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] rounded-xl hover:bg-primary-light transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
            >
              <SearchOutlined />搜索
            </button>
          </form>

          {/* 阶段筛选 */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FilterOutlined /> 项目阶段
            </p>
            <div className="flex flex-wrap gap-2">
              {STAGE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStageFilter(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${stageFilter === option.value
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] shadow-md shadow-primary/15'
                      : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 领域筛选 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FilterOutlined /> 所属领域
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIndustryFilter('')}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${industryFilter === ''
                    ? 'bg-accent-gradient text-white shadow-md shadow-amber-500/15'
                    : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.05] hover:text-gray-300'
                  }`}
              >
                全部领域
              </button>
              {INDUSTRY_OPTIONS.map(industry => (
                <button
                  key={industry}
                  onClick={() => setIndustryFilter(industryFilter === industry ? '' : industry)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${industryFilter === industry
                      ? 'bg-accent-gradient text-white shadow-md shadow-amber-500/15'
                      : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.05] hover:text-gray-300'
                    }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          {/* 排序 + 清空 */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
            <button
              onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.05] rounded-xl text-sm text-gray-500 transition-colors"
            >
              <SortAscendingOutlined className={sortOrder === 'oldest' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              {sortOrder === 'newest' ? '最新发布' : '最早发布'}
            </button>
            {hasActiveFilters && (
              <button
                onClick={() => { setStageFilter(''); setIndustryFilter(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <ClearOutlined />清空筛选条件
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
              Results — 项目列表
            ═══════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-[3px] border-[#00f0ff]/10 border-t-[#00f0ff] animate-spin" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-[#ffb800]/30 animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
            <p className="text-gray-400 text-sm animate-pulse">正在加载项目...</p>
          </div>
        ) : projects.length > 0 ? (
          <>
            {/* 结果统计 */}
            <div className="flex items-center gap-2 mb-5 text-sm text-gray-400">
              <span className="font-semibold text-white">{total}</span>
              个项目
              {hasActiveFilters && <span>符合筛选条件</span>}
              {projects.length < total && <span>（已加载 {projects.length} 项）</span>}
            </div>

            <div className={`grid gap-5 sm:gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {projects.map((project, index) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={`group bg-white/[0.02] backdrop-blur-sm rounded-2xl shadow-[0_2px_12px_rgba(10,42,92,0.03)] hover:shadow-[0_16px_40px_rgba(10,42,92,0.08)] transition-all duration-500 overflow-hidden border border-white/[0.06] hover:-translate-y-1.5 card-enter ${viewMode === 'list' ? 'flex flex-row' : ''}`}
                >
                  {/* 封面 */}
                  <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0a1a] to-[#101025] ${
                    viewMode === 'grid'
                      ? 'h-48'
                      : 'w-44 sm:w-52 flex-shrink-0'
                  }`}>
                    {project.cover_image ? (
                      <>
                        <img
                          src={project.cover_image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <RocketOutlined className="text-3xl text-white/20 group-hover:text-white/35 transition-colors duration-300" />
                        </div>
                      </div>
                    )}
                    {/* 阶段角标 */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1.5 bg-gradient-to-r ${STAGE_GRADIENTS[project.stage] || 'from-white/[0.06] to-white/[0.08]'} text-white text-xs font-semibold rounded-full shadow-lg`}>
                        {STAGE_LABELS[project.stage] || '未知阶段'}
                      </span>
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className={`${viewMode === 'grid' ? 'p-5 sm:p-6' : 'p-5 flex-1 flex flex-col justify-between'}`}>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-white-light transition-colors duration-300 mb-2 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags?.split(',').slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-white/[0.04] text-gray-500 rounded-lg text-xs font-medium group-hover:bg-white/[0.05] transition-colors duration-300">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-white/[0.05]">
                      <span className="flex items-center gap-1.5">
                        <TeamOutlined />
                        <span className="truncate max-w-[120px]">{project.team?.name || '待定团队'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <EyeOutlined />
                        {project.view_count} 次浏览
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <RocketOutlined className="text-3xl text-[#d9cebb]" />
            </div>
            <p className="text-gray-400 text-lg font-semibold mb-1">
              {hasActiveFilters ? '没有符合条件的项目' : '暂无项目'}
            </p>
            <p className="text-gray-300 text-sm">
              {hasActiveFilters ? '试试调整筛选条件' : '精彩项目即将上线，敬请期待'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => { setStageFilter(''); setIndustryFilter(''); }}
                className="mt-4 inline-flex items-center gap-1.5 text-[#ffb800] text-sm font-medium hover:underline"
              >
                <ClearOutlined /> 清空筛选
              </button>
            )}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/[0.06] text-white font-semibold hover:border-[#00f0ff]/30 hover:bg-white/[0.02] hover:shadow-md transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-[#00f0ff]/30 border-t-[#00f0ff] animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  加载更多项目
                  <span className="text-xs text-gray-400 font-normal">({total - projects.length} 项剩余)</span>
                  <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>
        )}
        {!hasMore && projects.length > 0 && (
          <p className="text-center mt-12 text-sm text-gray-400">已展示全部 {total} 个项目</p>
        )}
      </div>
    </div>
  );
}
