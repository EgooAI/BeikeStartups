// frontend/app/recruitments/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { Recruitment, Response } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';
import { ArrowLeftOutlined, TeamOutlined, FileTextOutlined, LoginOutlined } from '@ant-design/icons';

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

export default function RecruitmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [myApplicationStatus, setMyApplicationStatus] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [showResponses, setShowResponses] = useState(false);
  const router = useRouter();
  const recruitmentId = parseInt(id);

  const loadRecruitment = async () => {
    try {
      const response = await recruitmentApi.get(recruitmentId);
      if (response.data) {
        setRecruitment(response.data as Recruitment);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载招募详情失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const res = await recruitmentApi.getMyApplications();
      if (res.data) {
        const data = res.data as Response[];
        const application = data.find((r: Response) => r.recruitment_id === recruitmentId);
        if (application) {
          setHasApplied(true);
          setMyApplicationStatus(application.status);
        }
      }
    } catch (err) {
      console.error('Failed to check application:', err);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    // 所有人可见，登录后检查是否已申请
    requestAnimationFrame(() => {
      loadRecruitment();
      if (user) {
        checkApplication();
      }
    });
  }, [user, authLoading]);

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      message.warning('请填写自我介绍');
      return;
    }

    try {
      await recruitmentApi.apply(recruitmentId, { cover_letter: coverLetter });
      setShowApplyForm(false);
      setCoverLetter('');
      setHasApplied(true);
      setMyApplicationStatus('pending');
      message.success('申请提交成功');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '申请失败';
      message.error(errorMessage);
      const errorMsg = err instanceof Error ? err.message : '申请失败';
      message.error(errorMsg);
    }
  };

  const handleSolve = async () => {
    try {
      await recruitmentApi.solve(recruitmentId);
      loadRecruitment();
      message.success('招募已开启');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      const errorMsg = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
      message.error(errorMsg);
    }
  };

  const handleInvalidate = async () => {
    if (!confirm('确定要作废这个招募吗？')) return;

    try {
      await recruitmentApi.invalidate(recruitmentId);
      loadRecruitment();
      message.success('招募已作废');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '作废失败';
      const errorMsg = err instanceof Error ? err.message : '作废失败';
      message.error(errorMessage);
      message.error(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个招募吗？')) return;

    try {
      await recruitmentApi.delete(recruitmentId);
      router.push('/recruitments');
      message.success('招募已删除');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
    }
  };

  const loadResponses = async () => {
    try {
      const res = await recruitmentApi.getResponses(recruitmentId);
      if (res.data) {
        const items = (res.data as { items?: Response[] }).items || [];
        setResponses(items);
      }
      setShowResponses(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取申请列表失败';
      setError(errorMessage);
    }
  };

  const handleAcceptResponse = async (responseId: number) => {
    if (!confirm('确定要通过该申请吗？通过后该学生将加入您的团队。')) return;

    try {
      await recruitmentApi.acceptResponse(recruitmentId, responseId);
      loadResponses();
      loadRecruitment();
      message.success('申请已通过，该学生已加入您的团队');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      const errorMsg = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
      message.error(errorMsg);
    }
  };

  const handleRejectResponse = async (responseId: number) => {
    if (!confirm('确定要拒绝该申请吗？')) return;

    try {
      await recruitmentApi.rejectResponse(recruitmentId, responseId);
      loadResponses();
      message.success('已拒绝申请');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      const errorMsg = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
      message.error(errorMsg);
    }
  };

  if (authLoading || isLoading) {
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

  if (!recruitment) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="holo-card p-12 text-center">
          <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileTextOutlined className="text-4xl text-white/40" />
          </div>
          <p className="text-gray-500">招募不存在</p>
        </div>
      </div>
    );
  }

  const isOwner = recruitment.team?.owner_id === user?.id;
  const canManage = isOwner;

  return (
    <div className="min-h-screen bg-[#050510] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeftOutlined className="mr-2" />
            返回列表
          </button>
        </div>

        <div className="holo-card p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">{recruitment.title}</h1>
              <p className="text-[#ffb800] text-xl font-bold mb-2">{positionLabel(recruitment.position)}</p>
              {recruitment.salary && (
                <p className="text-[#00ff88] font-medium mb-2">{recruitment.salary}</p>
              )}
              <p className="text-gray-400 text-sm">
                发布于 {formatDate(recruitment.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(recruitment.status)}`}>
              {getStatusText(recruitment.status)}
            </span>
          </div>

          {recruitment.team && (
            <div className="mb-6 pb-6 border-b border-white/[0.06]/60">
              <p className="text-gray-400">
                <strong>招聘团队：</strong>{recruitment.team.name}
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black tracking-tight text-white mb-2">职位描述</h2>
              <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{recruitment.description}</p>
            </div>

            {recruitment.requirements && (
              <div>
                <h2 className="text-lg font-black tracking-tight text-white mb-2">任职要求</h2>
                <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{recruitment.requirements}</p>
              </div>
            )}

            {recruitment.deadline && (
              <div className="bg-accent-light p-4 rounded-xl border border-accent/20">
                <p className="text-[#ffb800]-hover font-medium">
                  <strong>截止日期：</strong>{formatDate(recruitment.deadline)}
                </p>
              </div>
            )}
          </div>

          {user?.role === 'student' && recruitment.status === 'active' && !hasApplied && (
            <div className="mt-8 pt-8 border-t border-white/[0.06]/60">
              {showApplyForm ? (
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white mb-4">申请该职位</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">自我介绍</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff] transition-all resize-none"
                      rows={4}
                      placeholder="请介绍一下你自己，包括相关经验、技能等..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleApply}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium"
                    >
                      提交申请
                    </button>
                    <button
                      onClick={() => setShowApplyForm(false)}
                      className="px-6 py-2.5 border border-white/[0.06] rounded-xl text-gray-400 hover:bg-white/[0.03] hover:-translate-y-0.5 transition-all duration-300 font-medium"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="w-full bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                >
                  申请该职位
                </button>
              )}
            </div>
          )}

          {user?.role === 'student' && hasApplied && (
            <div className="mt-8 pt-8 border-t border-white/[0.06]/60">
              <div className={`p-4 rounded-xl ${
                myApplicationStatus === 'pending' ? 'bg-accent-light border border-accent/20' :
                myApplicationStatus === 'accepted' ? 'bg-[#00ff88]/10 border border-green-200' :
                  myApplicationStatus === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-white/[0.03] border border-white/[0.06]'
              }`}>
                <p className={`font-semibold ${
                  myApplicationStatus === 'pending' ? 'text-[#ffb800]-hover' :
                  myApplicationStatus === 'accepted' ? 'text-green-700' :
                    myApplicationStatus === 'rejected' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {myApplicationStatus === 'pending' ? '申请已提交，等待审核' :
                    myApplicationStatus === 'accepted' ? '申请已通过，你已加入该团队！' :
                      myApplicationStatus === 'rejected' ? '申请已被拒绝' : '申请状态未知'}
                </p>
              </div>
            </div>
          )}

          {/* 未登录提示 — 游客可查看但不能申请 */}
          {!user && recruitment.status === 'active' && (
            <div className="mt-8 pt-8 border-t border-white/[0.06]/60">
              <div className="bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-xl p-5 text-center">
                <p className="text-[#ffb800] text-sm mb-3">
                  登录后即可申请加入该团队，找到适合你的创业机会。
                </p>
                <Link
                  href={`/login?redirect=/recruitments/${recruitmentId}`}
                  className="inline-flex items-center px-5 py-2 bg-[#ffb800]/100 text-white text-sm font-medium rounded-lg hover:bg-[#ffc800] transition-colors"
                >
                  <LoginOutlined className="mr-1.5" />
                  登录后申请
                </Link>
              </div>
            </div>
          )}

          {/* 非学生已登录用户提示 */}
          {user && user.role !== 'student' && !isOwner && recruitment.status === 'active' && (
            <div className="mt-8 pt-8 border-t border-white/[0.06]/60">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-center">
                <p className="text-gray-400 text-sm">
                  仅学生身份可以提交申请。如需申请，请使用学生账号登录。
                </p>
              </div>
            </div>
          )}

          {canManage && (
            <div className="mt-8 pt-8 border-t border-white/[0.06]/60">
              <h3 className="text-lg font-black tracking-tight text-white mb-4">管理操作</h3>

              {!showResponses ? (
                <div className="flex flex-wrap gap-4">
                  {recruitment.status === 'active' && (
                    <>
                      <button
                        onClick={loadResponses}
                        className="px-6 py-2.5 bg-purple-500 text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-purple-600 transition-all duration-300 font-medium"
                      >
                        查看申请列表
                      </button>

                      <button
                        onClick={handleSolve}
                        className="px-6 py-2.5 bg-info text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-medium"
                      >
                        标记为已解决
                      </button>

                      <button
                        onClick={handleInvalidate}
                        className="px-6 py-2.5 bg-white/[0.06] text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-white/[0.08] transition-all duration-300 font-medium"
                      >
                        作废招募
                      </button>
                    </>
                  )}

                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="px-6 py-2.5 bg-red-500 text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-red-600 transition-all duration-300 font-medium"
                    >
                      删除招募
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowResponses(false)}
                    className="mb-4 inline-flex items-center text-white hover:text-white-light transition-colors"
                  >
                    <ArrowLeftOutlined className="mr-2" />
                    返回管理
                  </button>

                  <h4 className="text-md font-black tracking-tight text-gray-300 mb-4">申请列表 ({responses.length})</h4>

                  {responses.length > 0 ? (
                    <div className="space-y-4">
                      {responses.map((response) => (
                        <div key={response.id} className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]/60">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {response.user?.nickname || response.user?.username}
                              </p>
                              <p className="text-sm text-gray-400">
                                {response.user?.email}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              response.status === 'pending' ? 'bg-accent-light text-[#ffb800]-hover' :
                              response.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                response.status === 'rejected' ? 'bg-red-100 text-red-400' : 'bg-white/[0.04] text-gray-500'
                            }`}>
                              {response.status === 'pending' ? '待审核' :
                                response.status === 'accepted' ? '已通过' :
                                  response.status === 'rejected' ? '已拒绝' : response.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{response.cover_letter}</p>
                          <div className="flex gap-2">
                            {response.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAcceptResponse(response.id)}
                                  className="bg-success text-white px-4 py-1.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium"
                                >
                                  通过
                                </button>
                                <button
                                  onClick={() => handleRejectResponse(response.id)}
                                  className="bg-red-500 text-white px-4 py-1.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium"
                                >
                                  拒绝
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <TeamOutlined className="text-2xl text-white/40" />
                      </div>
                      <p className="text-gray-400">暂无申请</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
