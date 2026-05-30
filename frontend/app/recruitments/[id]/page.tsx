// frontend/app/recruitments/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { recruitmentApi } from '@/lib/api';
import { Recruitment, Response } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { message } from 'antd';

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
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      requestAnimationFrame(() => {
        loadRecruitment();
        checkApplication();
      });
    }
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
        const data = res.data as Response[];
        setResponses(data || []);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!recruitment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">招募不存在</p>
      </div>
    );
  }

  const isOwner = recruitment.team?.owner_id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canManage = isOwner || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 mb-4"
          >
            ← 返回列表
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recruitment.title}</h1>
              <p className="text-indigo-600 text-xl font-medium mb-2">{recruitment.position}</p>
              {recruitment.salary && (
                <p className="text-green-600 mb-2">{recruitment.salary}</p>
              )}
              <p className="text-gray-500 text-sm">
                发布于 {formatDate(recruitment.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(recruitment.status)}`}>
              {getStatusText(recruitment.status)}
            </span>
          </div>

          {recruitment.team && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-600">
                <strong>招聘团队：</strong>{recruitment.team.name}
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">职位描述</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{recruitment.description}</p>
            </div>

            {recruitment.requirements && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">任职要求</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{recruitment.requirements}</p>
              </div>
            )}

            {recruitment.deadline && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800">
                  <strong>截止日期：</strong>{formatDate(recruitment.deadline)}
                </p>
              </div>
            )}
          </div>

          {user?.role === 'student' && recruitment.status === 'active' && !hasApplied && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              {showApplyForm ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">申请该职位</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">自我介绍</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={4}
                      placeholder="请介绍一下你自己，包括相关经验、技能等..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleApply}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      提交申请
                    </button>
                    <button
                      onClick={() => setShowApplyForm(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  申请该职位
                </button>
              )}
            </div>
          )}

          {user?.role === 'student' && hasApplied && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className={`p-4 rounded-lg ${myApplicationStatus === 'pending' ? 'bg-yellow-50' :
                myApplicationStatus === 'accepted' ? 'bg-green-50' :
                  myApplicationStatus === 'rejected' ? 'bg-red-50' : 'bg-gray-50'
                }`}>
                <p className={`font-semibold ${myApplicationStatus === 'pending' ? 'text-yellow-800' :
                  myApplicationStatus === 'accepted' ? 'text-green-800' :
                    myApplicationStatus === 'rejected' ? 'text-red-800' : 'text-gray-800'
                  }`}>
                  {myApplicationStatus === 'pending' ? '申请已提交，等待审核' :
                    myApplicationStatus === 'accepted' ? '申请已通过，你已加入该团队！' :
                      myApplicationStatus === 'rejected' ? '申请已被拒绝' : '申请状态未知'}
                </p>
              </div>
            </div>
          )}

          {canManage && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">管理操作</h3>

              {!showResponses ? (
                <div className="flex flex-wrap gap-4">
                  {recruitment.status === 'active' && (
                    <>
                      <button
                        onClick={loadResponses}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        查看申请列表
                      </button>

                      <button
                        onClick={handleSolve}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        标记为已解决
                      </button>

                      <button
                        onClick={handleInvalidate}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        作废招募
                      </button>
                    </>
                  )}

                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      删除招募
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowResponses(false)}
                    className="mb-4 text-indigo-600 hover:text-indigo-700"
                  >
                    ← 返回管理
                  </button>

                  <h4 className="text-md font-semibold text-gray-700 mb-4">申请列表 ({responses.length})</h4>

                  {responses.length > 0 ? (
                    <div className="space-y-4">
                      {responses.map((response) => (
                        <div key={response.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {response.user?.nickname || response.user?.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {response.user?.email}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${response.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              response.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                response.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {response.status === 'pending' ? '待审核' :
                                response.status === 'accepted' ? '已通过' :
                                  response.status === 'rejected' ? '已拒绝' : response.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{response.cover_letter}</p>
                          <div className="flex gap-2">
                            {response.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAcceptResponse(response.id)}
                                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                  通过
                                </button>
                                <button
                                  onClick={() => handleRejectResponse(response.id)}
                                  className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm"
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
                    <p className="text-gray-500 text-center py-8">暂无申请</p>
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