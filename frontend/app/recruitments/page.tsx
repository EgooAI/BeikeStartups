'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { Recruitment } from '@/types';
import {
  TeamOutlined,
  PlusCircleOutlined,
  LoginOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';

export default function RecruitmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  async function fetchRecruitments() {
    try {
      const isOwner = user?.role === 'team_owner';
      const res = await recruitmentApi.list(undefined, isOwner);
      if (res.data) {
        const data = res.data as { items?: Recruitment[] };
        setRecruitments(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch recruitments:', err);
    } finally {
      setLoading(false);
    }
  }

  const positionOrder = ['frontend', 'backend', 'pm', 'campus_ops', 'other'];

  useEffect(() => {
    if (!authLoading) { requestAnimationFrame(() => fetchRecruitments()); }
  }, [authLoading, user]);

  // 客户端筛选 + 排序
  const filtered = useMemo(() => {
    let list = [...recruitments];

    // 搜索
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter(r =>
        r.title?.toLowerCase().includes(kw) ||
        r.description?.toLowerCase().includes(kw) ||
        r.position?.toLowerCase().includes(kw) ||
        r.requirements?.toLowerCase().includes(kw)
      );
    }

    // 状态筛选
    if (statusFilter) {
      list = list.filter(r => r.status === statusFilter);
    }

    // 岗位筛选
    if (positionFilter) {
      list = list.filter(r => r.position === positionFilter);
    }

    // 排序
    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });

    return list;
  }, [recruitments, search, statusFilter, positionFilter, sortOrder]);

  const hasFilters = search || statusFilter || positionFilter;

  // 岗位中文映射
  const positionLabel = (p: string) => {
    const map: Record<string, string> = {
      'frontend': '前端开发', 'backend': '后端开发', 'fullstack': '全栈开发',
      'mobile': '移动端开发', 'designer': 'UI/UX 设计', 'pm': '产品经理',
      'marketing': '市场营销', 'operation': '运营管理', 'data': '数据分析',
      'ai': 'AI/算法', 'devops': '运维开发', 'qa': '测试工程师',
      'campus_ops': '校园运营', 'other': '其他',
    };
    return map[p] || p;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050510]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-[3px] border-[#00f0ff]/10 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-[#ffb800]/30 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="relative bg-gradient-to-br from-[#0a0a1a] via-[#050510] to-[#0a0a1a] border-b border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-dot-matrix opacity-40" />
        <div className="absolute top-0 right-0 w-[22rem] h-[22rem] bg-blue-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[16rem] h-[16rem] bg-amber-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00f0ff]/10 text-[#00f0ff] text-xs font-semibold rounded-full mb-3 tracking-wide">
                <TeamOutlined />
                招募广场
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">创业团队招募广场</h1>
              <p className="text-gray-500 text-base sm:text-lg">汇聚正在招募成员的校内创业团队，找到适合你的创业机会。</p>
            </div>
            {user?.role === 'team_owner' && (
              <Link href="/recruitments/create" className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-medium rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <PlusCircleOutlined className="mr-2" />发布招募
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && (
          <div className="bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-[#ffb800] text-sm">您当前为游客身份，可以浏览所有招募信息。登录后即可提交申请，加入心仪的创业团队。</p>
            <Link href="/login" className="inline-flex items-center px-4 py-2 bg-[#ffb800]/100 text-white text-sm font-medium rounded-lg hover:bg-[#ffc800] transition-colors flex-shrink-0 ml-4"><LoginOutlined className="mr-1.5" />立即登录</Link>
          </div>
        )}

        {/* ═══ 搜索 + 筛选 ═══ */}
        <div className="holo-card p-5 sm:p-6 mb-8">
          {/* 搜索栏 */}
          <form onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="搜索职位、团队名称或描述..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/15 focus:border-[#00f0ff]/30 focus:bg-white/[0.06] transition-all text-sm"
              />
            </div>
            <button type="submit" className="px-6 py-3.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] rounded-xl hover:bg-primary-light transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2">
              <SearchOutlined />搜索
            </button>
          </form>

          {/* 状态筛选 */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FilterOutlined /> 招募状态
            </p>
            <div className="flex flex-wrap gap-2">
              {[{ v: '', l: '全部状态' }, { v: 'active', l: '招募中' }, { v: 'solved', l: '已解决' }].map(o => (
                <button
                  key={o.v}
                  onClick={() => setStatusFilter(statusFilter === o.v ? '' : o.v)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${statusFilter === o.v
                      ? o.v === '' ? 'bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] shadow-md shadow-primary/15' : 'bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] shadow-md shadow-primary/15'
                      : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.05] hover:text-gray-300'
                    }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* 岗位筛选 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FilterOutlined /> 招募岗位
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPositionFilter('')}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${positionFilter === '' ? 'bg-accent-gradient text-black shadow-md shadow-amber-500/15' : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.05] hover:text-gray-300'
                  }`}
              >
                全部岗位
              </button>
              {positionOrder.map(p => (
                <button
                  key={p}
                  onClick={() => setPositionFilter(positionFilter === p ? '' : p)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${positionFilter === p ? 'bg-accent-gradient text-black shadow-md shadow-amber-500/15' : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.05] hover:text-gray-300'
                    }`}
                >
                  {positionLabel(p)}
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
            {hasFilters && (
              <button onClick={() => { setSearch(''); setStatusFilter(''); setPositionFilter(''); }} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
                <ClearOutlined />清空筛选条件
              </button>
            )}
          </div>
        </div>

        {/* ═══ 结果 ═══ */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-[3px] border-[#00f0ff]/10 border-t-[#00f0ff] animate-spin" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-[#ffb800]/30 animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-5 text-sm text-gray-400">
              <span className="font-semibold text-white">{filtered.length}</span>个招募
              {hasFilters && <span>符合条件</span>}
              {(hasFilters || recruitments.length !== filtered.length) && <span>（共 {recruitments.length} 个）</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map(rec => (
                <Link key={rec.id} href={`/recruitments/${rec.id}`} className="holo-card p-6 hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-white group-hover:text-[#ffb800] transition-colors">{rec.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{rec.team?.name || '创业团队'}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${rec.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#00f0ff]/10 text-[#00f0ff]'}`}>
                      {rec.status === 'active' ? '招募中' : '已解决'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{rec.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-accent-light text-[#ffb800] rounded-lg text-xs font-medium">{positionLabel(rec.position)}</span>
                    {rec.salary && <span className="px-3 py-1 bg-white/[0.04] text-gray-500 rounded-lg text-xs">{rec.salary}</span>}
                    {rec.deadline && <span className="px-3 py-1 bg-white/[0.04] text-gray-500 rounded-lg text-xs">截止: {new Date(rec.deadline).toLocaleDateString('zh-CN')}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><ClockCircleOutlined />{new Date(rec.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                  {rec.requirements && <p className="text-xs text-gray-400 border-t border-white/[0.06]/60 pt-3 mt-3">要求: {rec.requirements}</p>}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TeamOutlined className="text-4xl text-white/40" />
            </div>
            <p className="text-gray-400 text-lg">{hasFilters ? '没有符合条件的招募' : '暂无招募信息'}</p>
            <p className="text-gray-400 text-sm mt-2">{hasFilters ? '试试调整筛选条件' : '还没有团队发布招募，敬请期待'}</p>
            {hasFilters && (
              <button onClick={() => { setSearch(''); setStatusFilter(''); setPositionFilter(''); }} className="mt-4 text-[#ffb800] text-sm hover:underline">清空所有筛选</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
